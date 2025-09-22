import mongoose, { Document } from 'mongoose';
export interface IAnalytics extends Document {
    date: Date;
    userEngagement: {
        totalUsers: number;
        activeUsers: number;
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        averageSessionTime: number;
        bounceRate: number;
        newUserRegistrations: number;
    };
    learningProgress: {
        totalCourses: number;
        completedCourses: number;
        averageCompletionRate: number;
        totalQuizzesTaken: number;
        averageQuizScore: number;
        learningTimeMinutes: number;
        coursesCreated: number;
    };
    missionSuccess: {
        totalMissions: number;
        successfulMissions: number;
        averageSuccessRate: number;
        totalFuelConsumed: number;
        averageMissionDuration: number;
        missionsCreated: number;
    };
    communityStats: {
        totalPosts: number;
        totalReplies: number;
        totalSharedMissions: number;
        averageLikesPerPost: number;
        communityGrowthRate: number;
        engagementRate: number;
        newCommunityMembers: number;
    };
    platformUsage: {
        totalPageViews: number;
        uniquePageViews: number;
        averagePageLoadTime: number;
        totalErrors: number;
        mobileVisitors: number;
        desktopVisitors: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserActivity extends Document {
    userId: string;
    sessionId: string;
    action: string;
    resource: string;
    metadata: Record<string, any>;
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
}
export declare const Analytics: mongoose.Model<any, {}, {}, {}, any, any>;
export declare const UserActivity: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=Analytics.d.ts.map