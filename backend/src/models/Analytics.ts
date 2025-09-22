import mongoose, { Document, Schema } from 'mongoose';

// Interface for Analytics Data
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

// Analytics Schema
const analyticsSchema = new Schema<IAnalytics>(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ createdAt: -1 });

// Virtual for aggregated success rates
analyticsSchema.virtual('overallSuccessRate').get(function(this: IAnalytics) {
  const missionRate = this.missionSuccess.averageSuccessRate || 0;
  const learningRate = this.learningProgress.averageCompletionRate || 0;
  const engagementRate = this.communityStats.engagementRate || 0;
  
  return ((missionRate + learningRate + engagementRate) / 3).toFixed(2);
});

// Static method to get analytics for date range
analyticsSchema.statics.getAnalyticsForPeriod = async function(
  startDate: Date, 
  endDate: Date
): Promise<IAnalytics[]> {
  return await this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Static method to get aggregated analytics
analyticsSchema.statics.getAggregatedAnalytics = async function(
  startDate: Date,
  endDate: Date
) {
  const analytics = await this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });

  if (analytics.length === 0) {
    return null;
  }

  // Calculate averages and totals
  const aggregated = {
    userEngagement: {
      totalUsers: analytics[0]?.userEngagement.totalUsers || 0,
      activeUsers: Math.round(
        analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.activeUsers || 0), 0) / analytics.length
      ),
      dailyActiveUsers: Math.round(
        analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.dailyActiveUsers || 0), 0) / analytics.length
      ),
      weeklyActiveUsers: Math.round(
        analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.weeklyActiveUsers || 0), 0) / analytics.length
      ),
      monthlyActiveUsers: Math.round(
        analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.monthlyActiveUsers || 0), 0) / analytics.length
      ),
      averageSessionTime: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.averageSessionTime || 0), 0) / analytics.length).toFixed(1)
      ),
      bounceRate: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.userEngagement.bounceRate || 0), 0) / analytics.length).toFixed(1)
      ),
    },
    learningProgress: {
      totalCourses: analytics[0]?.learningProgress.totalCourses || 0,
      completedCourses: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.learningProgress.completedCourses || 0), 0),
      averageCompletionRate: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.learningProgress.averageCompletionRate || 0), 0) / analytics.length).toFixed(1)
      ),
      totalQuizzesTaken: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.learningProgress.totalQuizzesTaken || 0), 0),
      averageQuizScore: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.learningProgress.averageQuizScore || 0), 0) / analytics.length).toFixed(1)
      ),
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
      totalMissions: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.missionSuccess.totalMissions || 0), 0),
      successfulMissions: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.missionSuccess.successfulMissions || 0), 0),
      averageSuccessRate: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.missionSuccess.averageSuccessRate || 0), 0) / analytics.length).toFixed(1)
      ),
      totalFuelConsumed: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.missionSuccess.totalFuelConsumed || 0), 0),
      averageMissionDuration: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.missionSuccess.averageMissionDuration || 0), 0) / analytics.length).toFixed(1)
      ),
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
      totalPosts: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.totalPosts || 0), 0),
      totalReplies: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.totalReplies || 0), 0),
      totalSharedMissions: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.totalSharedMissions || 0), 0),
      averageLikesPerPost: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.averageLikesPerPost || 0), 0) / analytics.length).toFixed(1)
      ),
      mostActiveUsers: [
        'AstronautAlex',
        'OrbitMaster',
        'SpaceExplorer42',
        'MissionCommander',
        'RocketScientist'
      ],
      communityGrowthRate: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.communityGrowthRate || 0), 0) / analytics.length).toFixed(1)
      ),
      engagementRate: Number(
        (analytics.reduce((sum: number, a: IAnalytics) => sum + (a.communityStats.engagementRate || 0), 0) / analytics.length).toFixed(1)
      )
    },
    platformUsage: {
      totalPageViews: analytics.reduce((sum: number, a: IAnalytics) => sum + (a.platformUsage.totalPageViews || 0), 0),
      averagePageLoadTime: Math.round(
        analytics.reduce((sum: number, a: IAnalytics) => sum + (a.platformUsage.averagePageLoadTime || 0), 0) / analytics.length
      ),
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

// Pre-save middleware to calculate rates
analyticsSchema.pre<IAnalytics>('save', function(next) {
  // Calculate success rate
  if (this.missionSuccess.totalMissions > 0) {
    this.missionSuccess.averageSuccessRate = Number(
      ((this.missionSuccess.successfulMissions / this.missionSuccess.totalMissions) * 100).toFixed(2)
    );
  }

  // Calculate completion rate
  if (this.learningProgress.totalCourses > 0) {
    this.learningProgress.averageCompletionRate = Number(
      ((this.learningProgress.completedCourses / this.learningProgress.totalCourses) * 100).toFixed(2)
    );
  }

  // Calculate engagement rate
  if (this.communityStats.totalPosts > 0) {
    this.communityStats.engagementRate = Number(
      (((this.communityStats.totalReplies + (this.communityStats.averageLikesPerPost * this.communityStats.totalPosts)) / this.communityStats.totalPosts) * 10).toFixed(1)
    );
  }

  next();
});

// Interface for User Activity Log
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

// User Activity Schema for detailed tracking
const userActivitySchema = new Schema<IUserActivity>(
  {
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
        'page_focus',
        'page_blur',
        'page_time',
        'feature_click',
        'user_active',
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
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    userAgent: String,
    ipAddress: String,
    duration: Number, // in milliseconds
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ resource: 1, timestamp: -1 });

export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', analyticsSchema);
export const UserActivity = mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', userActivitySchema);