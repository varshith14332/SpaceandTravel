import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Interfaces for different progress tracking aspects
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'mission' | 'learning' | 'community' | 'achievement';
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface MissionProgress {
  missionId: string;
  missionName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  attempts: number;
  bestScore?: number;
  timeSpent: number; // in minutes
}

export interface LearningProgress {
  topicId: string;
  topicName: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
  completed: boolean;
  score?: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  quizResults: Array<{
    quizId: string;
    score: number;
    completedAt: Date;
    timeSpent: number;
  }>;
}

export interface UserStats {
  totalMissionsCompleted: number;
  totalLearningHoursSpent: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  joinedAt: Date;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notifications: {
    missionUpdates: boolean;
    learningReminders: boolean;
    achievementAlerts: boolean;
    communityActivity: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareProgress: boolean;
    allowFriendRequests: boolean;
  };
  language: string;
  timezone: string;
}

export interface IUser extends Document {
  // Basic user information
  username: string;
  email: string;
  password?: string; // Make password optional for responses
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  
  // Account status
  isActive: boolean;
  isVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Progress tracking
  badges: Badge[];
  missionsProgress: MissionProgress[];
  learningProgress: LearningProgress[];
  stats: UserStats;
  preferences: UserPreferences;
  
  // Social features
  friends: mongoose.Types.ObjectId[];
  friendRequests: {
    sent: mongoose.Types.ObjectId[];
    received: mongoose.Types.ObjectId[];
  };
  
  // Timestamps
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  calculateLevel(): number;
  addExperience(points: number): void;
  earnBadge(badge: Omit<Badge, 'earnedAt'>): void;
  updateMissionProgress(missionId: string, progress: Partial<MissionProgress>): void;
  updateLearningProgress(topicId: string, progress: Partial<LearningProgress>): void;
}

const badgeSchema = new Schema<Badge>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['mission', 'learning', 'community', 'achievement'], 
    required: true 
  },
  earnedAt: { type: Date, default: Date.now },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  }
});

const missionProgressSchema = new Schema<MissionProgress>({
  missionId: { type: String, required: true },
  missionName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'failed'], 
    default: 'not_started' 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  score: { type: Number },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number },
  timeSpent: { type: Number, default: 0 }
});

const learningProgressSchema = new Schema<LearningProgress>({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
  score: { type: Number },
  timeSpent: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  quizResults: [{
    quizId: { type: String, required: true },
    score: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, required: true }
  }]
});

const userStatsSchema = new Schema<UserStats>({
  totalMissionsCompleted: { type: Number, default: 0 },
  totalLearningHoursSpent: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  joinedAt: { type: Date, default: Date.now },
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  nextLevelXP: { type: Number, default: 100 }
});

const userPreferencesSchema = new Schema<UserPreferences>({
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  notifications: {
    missionUpdates: { type: Boolean, default: true },
    learningReminders: { type: Boolean, default: true },
    achievementAlerts: { type: Boolean, default: true },
    communityActivity: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true }
  },
  privacy: {
    profileVisible: { type: Boolean, default: true },
    shareProgress: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true }
  },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'UTC' }
});

const userSchema = new Schema<IUser>({
  // Basic information
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    minlength: 3, 
    maxlength: 30 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  firstName: { type: String, trim: true, maxlength: 50 },
  lastName: { type: String, trim: true, maxlength: 50 },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  location: { type: String, maxlength: 100 },
  
  // Account status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  
  // Progress tracking
  badges: [badgeSchema],
  missionsProgress: [missionProgressSchema],
  learningProgress: [learningProgressSchema],
  stats: { type: userStatsSchema, default: () => ({}) },
  preferences: { type: userPreferencesSchema, default: () => ({}) },
  
  // Social features
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: {
    sent: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    received: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Timestamps
  lastLoginAt: { type: Date },
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.level': 1 });
userSchema.index({ 'stats.totalPoints': -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate user level based on experience points
userSchema.methods.calculateLevel = function(): number {
  const xp = this.stats.experiencePoints;
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Method to add experience points and update level
userSchema.methods.addExperience = function(points: number): void {
  this.stats.experiencePoints += points;
  this.stats.totalPoints += points;
  
  const newLevel = this.calculateLevel();
  const leveledUp = newLevel > this.stats.level;
  
  this.stats.level = newLevel;
  this.stats.nextLevelXP = Math.pow(newLevel, 2) * 100;
  
  if (leveledUp) {
    // Award level-up badge
    this.earnBadge({
      id: `level_${newLevel}`,
      name: `Level ${newLevel}`,
      description: `Reached level ${newLevel}`,
      icon: 'star',
      category: 'achievement',
      rarity: newLevel >= 10 ? 'epic' : newLevel >= 5 ? 'rare' : 'common'
    });
  }
};

// Method to earn a badge
userSchema.methods.earnBadge = function(badge: Omit<Badge, 'earnedAt'>): void {
  const existingBadge = this.badges.find((b: Badge) => b.id === badge.id);
  if (!existingBadge) {
    this.badges.push({
      ...badge,
      earnedAt: new Date()
    } as Badge);
  }
};

// Method to update mission progress
userSchema.methods.updateMissionProgress = function(missionId: string, progress: Partial<MissionProgress>): void {
  const existingProgress = this.missionsProgress.find((m: MissionProgress) => m.missionId === missionId);
  
  if (existingProgress) {
    Object.assign(existingProgress, progress);
  } else {
    this.missionsProgress.push({
      missionId,
      missionName: progress.missionName || 'Unknown Mission',
      status: 'not_started',
      progress: 0,
      attempts: 0,
      timeSpent: 0,
      ...progress
    } as MissionProgress);
  }
  
  // Update completion stats
  if (progress.status === 'completed') {
    this.stats.totalMissionsCompleted += 1;
    this.addExperience(50); // Award XP for mission completion
  }
};

// Method to update learning progress
userSchema.methods.updateLearningProgress = function(topicId: string, progress: Partial<LearningProgress>): void {
  const existingProgress = this.learningProgress.find((l: LearningProgress) => l.topicId === topicId);
  
  if (existingProgress) {
    Object.assign(existingProgress, progress);
    existingProgress.lastAccessed = new Date();
  } else {
    this.learningProgress.push({
      topicId,
      topicName: progress.topicName || 'Unknown Topic',
      category: progress.category || 'general',
      difficulty: progress.difficulty || 'beginner',
      progress: 0,
      completed: false,
      timeSpent: 0,
      lastAccessed: new Date(),
      quizResults: [],
      ...progress
    } as LearningProgress);
  }
  
  // Update learning stats
  if (progress.completed && !existingProgress?.completed) {
    this.addExperience(25); // Award XP for topic completion
  }
  
  if (progress.timeSpent) {
    this.stats.totalLearningHoursSpent += progress.timeSpent / 60; // Convert minutes to hours
  }
};

export const User = mongoose.model<IUser>('User', userSchema);
