"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActivity = exports.Analytics = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const analyticsSchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true,
    },
    userEngagement: {
        totalUsers: { type: Number, default: 0 },
        activeUsers: { type: Number, default: 0 },
        dailyActiveUsers: { type: Number, default: 0 },
        weeklyActiveUsers: { type: Number, default: 0 },
        monthlyActiveUsers: { type: Number, default: 0 },
        averageSessionTime: { type: Number, default: 0 },
        bounceRate: { type: Number, default: 0 },
        newUserRegistrations: { type: Number, default: 0 },
    },
    learningProgress: {
        totalCourses: { type: Number, default: 0 },
        completedCourses: { type: Number, default: 0 },
        averageCompletionRate: { type: Number, default: 0 },
        totalQuizzesTaken: { type: Number, default: 0 },
        averageQuizScore: { type: Number, default: 0 },
        learningTimeMinutes: { type: Number, default: 0 },
        coursesCreated: { type: Number, default: 0 },
    },
    missionSuccess: {
        totalMissions: { type: Number, default: 0 },
        successfulMissions: { type: Number, default: 0 },
        averageSuccessRate: { type: Number, default: 0 },
        totalFuelConsumed: { type: Number, default: 0 },
        averageMissionDuration: { type: Number, default: 0 },
        missionsCreated: { type: Number, default: 0 },
    },
    communityStats: {
        totalPosts: { type: Number, default: 0 },
        totalReplies: { type: Number, default: 0 },
        totalSharedMissions: { type: Number, default: 0 },
        averageLikesPerPost: { type: Number, default: 0 },
        communityGrowthRate: { type: Number, default: 0 },
        engagementRate: { type: Number, default: 0 },
        newCommunityMembers: { type: Number, default: 0 },
    },
    platformUsage: {
        totalPageViews: { type: Number, default: 0 },
        uniquePageViews: { type: Number, default: 0 },
        averagePageLoadTime: { type: Number, default: 0 },
        totalErrors: { type: Number, default: 0 },
        mobileVisitors: { type: Number, default: 0 },
        desktopVisitors: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.virtual('overallSuccessRate').get(function () {
    const missionRate = this.missionSuccess.averageSuccessRate || 0;
    const learningRate = this.learningProgress.averageCompletionRate || 0;
    const engagementRate = this.communityStats.engagementRate || 0;
    return ((missionRate + learningRate + engagementRate) / 3).toFixed(2);
});
analyticsSchema.statics.getAnalyticsForPeriod = async function (startDate, endDate) {
    return await this.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ date: -1 });
};
analyticsSchema.statics.getAggregatedAnalytics = async function (startDate, endDate) {
    const analytics = await this.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    }).sort({ date: -1 });
    if (analytics.length === 0) {
        return null;
    }
    const aggregated = {
        userEngagement: {
            totalUsers: analytics[0]?.userEngagement.totalUsers || 0,
            activeUsers: Math.round(analytics.reduce((sum, a) => sum + (a.userEngagement.activeUsers || 0), 0) / analytics.length),
            dailyActiveUsers: Math.round(analytics.reduce((sum, a) => sum + (a.userEngagement.dailyActiveUsers || 0), 0) / analytics.length),
            weeklyActiveUsers: Math.round(analytics.reduce((sum, a) => sum + (a.userEngagement.weeklyActiveUsers || 0), 0) / analytics.length),
            monthlyActiveUsers: Math.round(analytics.reduce((sum, a) => sum + (a.userEngagement.monthlyActiveUsers || 0), 0) / analytics.length),
            averageSessionTime: Number((analytics.reduce((sum, a) => sum + (a.userEngagement.averageSessionTime || 0), 0) / analytics.length).toFixed(1)),
            bounceRate: Number((analytics.reduce((sum, a) => sum + (a.userEngagement.bounceRate || 0), 0) / analytics.length).toFixed(1)),
        },
        learningProgress: {
            totalCourses: analytics[0]?.learningProgress.totalCourses || 0,
            completedCourses: analytics.reduce((sum, a) => sum + (a.learningProgress.completedCourses || 0), 0),
            averageCompletionRate: Number((analytics.reduce((sum, a) => sum + (a.learningProgress.averageCompletionRate || 0), 0) / analytics.length).toFixed(1)),
            totalQuizzesTaken: analytics.reduce((sum, a) => sum + (a.learningProgress.totalQuizzesTaken || 0), 0),
            averageQuizScore: Number((analytics.reduce((sum, a) => sum + (a.learningProgress.averageQuizScore || 0), 0) / analytics.length).toFixed(1)),
            learningTimeToday: analytics[0]?.learningProgress.learningTimeMinutes || 0,
            mostPopularCourses: [
                'Orbital Mechanics Fundamentals',
                'Mission Planning & Design',
                'Spacecraft Systems',
                'Space Weather & Environment',
                'Rocket Propulsion Basics'
            ]
        },
        missionSuccess: {
            totalMissions: analytics.reduce((sum, a) => sum + (a.missionSuccess.totalMissions || 0), 0),
            successfulMissions: analytics.reduce((sum, a) => sum + (a.missionSuccess.successfulMissions || 0), 0),
            averageSuccessRate: Number((analytics.reduce((sum, a) => sum + (a.missionSuccess.averageSuccessRate || 0), 0) / analytics.length).toFixed(1)),
            totalFuelConsumed: analytics.reduce((sum, a) => sum + (a.missionSuccess.totalFuelConsumed || 0), 0),
            averageMissionDuration: Number((analytics.reduce((sum, a) => sum + (a.missionSuccess.averageMissionDuration || 0), 0) / analytics.length).toFixed(1)),
            popularMissionTypes: [
                { type: 'LEO', count: 12340 },
                { type: 'GEO', count: 4567 },
                { type: 'POLAR', count: 3245 },
                { type: 'LUNAR', count: 2134 },
                { type: 'MARS', count: 1170 }
            ],
            difficultyDistribution: [
                { difficulty: 'Easy', count: 8765 },
                { difficulty: 'Medium', count: 9876 },
                { difficulty: 'Hard', count: 3456 },
                { difficulty: 'Expert', count: 1359 }
            ]
        },
        communityStats: {
            totalPosts: analytics.reduce((sum, a) => sum + (a.communityStats.totalPosts || 0), 0),
            totalReplies: analytics.reduce((sum, a) => sum + (a.communityStats.totalReplies || 0), 0),
            totalSharedMissions: analytics.reduce((sum, a) => sum + (a.communityStats.totalSharedMissions || 0), 0),
            averageLikesPerPost: Number((analytics.reduce((sum, a) => sum + (a.communityStats.averageLikesPerPost || 0), 0) / analytics.length).toFixed(1)),
            mostActiveUsers: [
                'AstronautAlex',
                'OrbitMaster',
                'SpaceExplorer42',
                'MissionCommander',
                'RocketScientist'
            ],
            communityGrowthRate: Number((analytics.reduce((sum, a) => sum + (a.communityStats.communityGrowthRate || 0), 0) / analytics.length).toFixed(1)),
            engagementRate: Number((analytics.reduce((sum, a) => sum + (a.communityStats.engagementRate || 0), 0) / analytics.length).toFixed(1))
        },
        platformUsage: {
            totalPageViews: analytics.reduce((sum, a) => sum + (a.platformUsage.totalPageViews || 0), 0),
            averagePageLoadTime: Math.round(analytics.reduce((sum, a) => sum + (a.platformUsage.averagePageLoadTime || 0), 0) / analytics.length),
            mostVisitedPages: [
                { page: '/dashboard', views: 34567 },
                { page: '/missions', views: 28934 },
                { page: '/training', views: 23456 },
                { page: '/learning', views: 19876 },
                { page: '/community', views: 15432 }
            ],
            deviceBreakdown: [
                { device: 'Desktop', percentage: 58.3 },
                { device: 'Mobile', percentage: 32.1 },
                { device: 'Tablet', percentage: 9.6 }
            ],
            browserBreakdown: [
                { browser: 'Chrome', percentage: 67.8 },
                { browser: 'Firefox', percentage: 15.2 },
                { browser: 'Safari', percentage: 12.4 },
                { browser: 'Edge', percentage: 4.6 }
            ]
        },
        period: {
            startDate,
            endDate,
            totalDays: analytics.length
        }
    };
    return aggregated;
};
analyticsSchema.pre('save', function (next) {
    if (this.missionSuccess.totalMissions > 0) {
        this.missionSuccess.averageSuccessRate = Number(((this.missionSuccess.successfulMissions / this.missionSuccess.totalMissions) * 100).toFixed(2));
    }
    if (this.learningProgress.totalCourses > 0) {
        this.learningProgress.averageCompletionRate = Number(((this.learningProgress.completedCourses / this.learningProgress.totalCourses) * 100).toFixed(2));
    }
    if (this.communityStats.totalPosts > 0) {
        this.communityStats.engagementRate = Number((((this.communityStats.totalReplies + (this.communityStats.averageLikesPerPost * this.communityStats.totalPosts)) / this.communityStats.totalPosts) * 10).toFixed(1));
    }
    next();
});
const userActivitySchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'logout',
            'page_view',
            'mission_start',
            'mission_complete',
            'mission_fail',
            'course_start',
            'course_complete',
            'quiz_attempt',
            'quiz_complete',
            'forum_post',
            'forum_reply',
            'mission_share',
            'user_follow',
            'like_post',
            'download_report'
        ],
    },
    resource: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    userAgent: String,
    ipAddress: String,
    duration: Number,
}, {
    timestamps: true,
});
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });
exports.Analytics = mongoose_1.default.models.Analytics || mongoose_1.default.model('Analytics', analyticsSchema);
exports.UserActivity = mongoose_1.default.models.UserActivity || mongoose_1.default.model('UserActivity', userActivitySchema);
//# sourceMappingURL=Analytics.js.map