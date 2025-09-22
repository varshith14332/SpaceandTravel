import mongoose, { Document, Model } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'iss_pass' | 'mission_update' | 'training_reminder' | 'achievement' | 'space_weather' | 'community';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    source?: string;
    scheduledFor?: Date;
    sentAt?: Date;
    expiresAt?: Date;
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
export declare const Notification: INotificationModel;
//# sourceMappingURL=Notification.d.ts.map