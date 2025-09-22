import mongoose, { Document } from 'mongoose';
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
    progress: number;
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
    attempts: number;
    bestScore?: number;
    timeSpent: number;
}
export interface LearningProgress {
    topicId: string;
    topicName: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    progress: number;
    completed: boolean;
    score?: number;
    timeSpent: number;
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
    username: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    isActive: boolean;
    isVerified: boolean;
    verificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    badges: Badge[];
    missionsProgress: MissionProgress[];
    learningProgress: LearningProgress[];
    stats: UserStats;
    preferences: UserPreferences;
    friends: mongoose.Types.ObjectId[];
    friendRequests: {
        sent: mongoose.Types.ObjectId[];
        received: mongoose.Types.ObjectId[];
    };
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    calculateLevel(): number;
    addExperience(points: number): void;
    earnBadge(badge: Omit<Badge, 'earnedAt'>): void;
    updateMissionProgress(missionId: string, progress: Partial<MissionProgress>): void;
    updateLearningProgress(topicId: string, progress: Partial<LearningProgress>): void;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map