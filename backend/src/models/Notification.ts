import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'iss_pass' | 'mission_update' | 'training_reminder' | 'achievement' | 'space_weather' | 'community';
  title: string;
  message: string;
  data?: any; // Additional notification data
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  source?: string; // Source of the notification (API, system, user, etc.)
  scheduledFor?: Date; // For scheduled notifications
  sentAt?: Date; // When the notification was actually sent
  expiresAt?: Date; // When the notification expires
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
  metadata?: {
    issPassTime?: Date;
    missionId?: string;
    achievementId?: string;
    weatherAlert?: {
      severity: string;
      region: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationModel extends Model<INotification> {
  createISSPassNotification(userId: string, passTime: Date, duration: number, maxElevation: number): Promise<INotification>;
  createMissionUpdateNotification(userId: string, missionId: string, title: string, message: string): Promise<INotification>;
  createAchievementNotification(userId: string, achievementId: string, achievementName: string): Promise<INotification>;
  createTrainingReminderNotification(userId: string, trainingName: string): Promise<INotification>;
  createSpaceWeatherNotification(userId: string, severity: string, region: string, details: string): Promise<INotification>;
}

const notificationSchema = new Schema<INotification>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['iss_pass', 'mission_update', 'training_reminder', 'achievement', 'space_weather', 'community'],
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 100 
  },
  message: { 
    type: String, 
    required: true, 
    maxlength: 500 
  },
  data: { 
    type: Schema.Types.Mixed 
  },
  read: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium',
    index: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    default: 'system' 
  },
  scheduledFor: { 
    type: Date,
    index: true 
  },
  sentAt: { 
    type: Date 
  },
  expiresAt: { 
    type: Date,
    index: true 
  },
  actions: [{
    label: { type: String, required: true },
    action: { type: String, required: true },
    url: { type: String }
  }],
  metadata: {
    issPassTime: { type: Date },
    missionId: { type: String },
    achievementId: { type: String },
    weatherAlert: {
      severity: { type: String },
      region: { type: String }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, sentAt: 1 });
notificationSchema.index({ expiresAt: 1 });

// TTL index to automatically remove expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods for creating specific notification types
notificationSchema.statics.createISSPassNotification = function(userId: string, passTime: Date, duration: number, maxElevation: number) {
  return this.create({
    userId,
    type: 'iss_pass',
    title: 'ISS Pass Alert',
    message: `The International Space Station will be visible in ${Math.round((passTime.getTime() - Date.now()) / 60000)} minutes!`,
    priority: 'high',
    category: 'space_tracking',
    scheduledFor: new Date(passTime.getTime() - 10 * 60 * 1000), // 10 minutes before
    expiresAt: new Date(passTime.getTime() + duration * 60 * 1000), // After pass ends
    metadata: {
      issPassTime: passTime
    },
    actions: [
      {
        label: 'View Tracking',
        action: 'navigate',
        url: '/dashboard'
      }
    ]
  });
};

notificationSchema.statics.createMissionUpdateNotification = function(userId: string, missionId: string, title: string, message: string) {
  return this.create({
    userId,
    type: 'mission_update',
    title,
    message,
    priority: 'medium',
    category: 'missions',
    metadata: {
      missionId
    },
    actions: [
      {
        label: 'View Mission',
        action: 'navigate',
        url: `/missions/${missionId}`
      }
    ]
  });
};

notificationSchema.statics.createAchievementNotification = function(userId: string, achievementId: string, achievementName: string) {
  return this.create({
    userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: `Congratulations! You've earned the "${achievementName}" achievement.`,
    priority: 'high',
    category: 'achievements',
    metadata: {
      achievementId
    },
    actions: [
      {
        label: 'View Profile',
        action: 'navigate',
        url: '/profile'
      }
    ]
  });
};

notificationSchema.statics.createTrainingReminderNotification = function(userId: string, trainingName: string) {
  return this.create({
    userId,
    type: 'training_reminder',
    title: 'Training Reminder',
    message: `Don't forget to continue your "${trainingName}" training session.`,
    priority: 'low',
    category: 'learning',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    actions: [
      {
        label: 'Continue Training',
        action: 'navigate',
        url: '/training'
      }
    ]
  });
};

notificationSchema.statics.createSpaceWeatherNotification = function(userId: string, severity: string, region: string, details: string) {
  return this.create({
    userId,
    type: 'space_weather',
    title: 'Space Weather Alert',
    message: details,
    priority: severity === 'extreme' ? 'urgent' : severity === 'severe' ? 'high' : 'medium',
    category: 'space_weather',
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // Expires in 72 hours
    metadata: {
      weatherAlert: {
        severity,
        region
      }
    },
    actions: [
      {
        label: 'View Details',
        action: 'navigate',
        url: '/dashboard?tab=space-weather'
      }
    ]
  });
};

export const Notification = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);