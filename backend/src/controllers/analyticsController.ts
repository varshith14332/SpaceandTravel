import { Request, Response } from 'express';
import { Analytics, UserActivity, IAnalytics } from '../models/Analytics';
import { User } from '../models/User';
import { ForumPost } from '../models/Community';

// Types for request interfaces
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
  };
  sessionID?: string;
}

// Analytics Controller Class
export class AnalyticsController {
  // Get analytics dashboard data
  static async getAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query;

      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Try to get aggregated analytics from database
      let analyticsData = await (Analytics as any).getAggregatedAnalytics(startDate, endDate);

      // If no data exists, generate mock data for demonstration
      if (!analyticsData) {
        analyticsData = await AnalyticsController.generateMockAnalytics(startDate, endDate);
      }

      res.json({
        success: true,
        data: analyticsData,
        timeframe,
        period: {
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate real-time analytics
  static async getRealTimeAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get today's activities
      const todayActivities = await UserActivity.find({
        timestamp: { $gte: today }
      } as any);

      // Get yesterday's activities for comparison
      const yesterdayActivities = await UserActivity.find({
        timestamp: { $gte: yesterday, $lt: today }
      } as any);

      // Calculate real-time metrics
      const realTimeData = {
        currentActiveUsers: await AnalyticsController.getCurrentActiveUsers(),
        todayStats: {
          pageViews: todayActivities.filter(a => a.action === 'page_view').length,
          missions: todayActivities.filter(a => a.action.startsWith('mission_')).length,
          learningActivities: todayActivities.filter(a => a.action.startsWith('course_') || a.action.startsWith('quiz_')).length,
          communityActivities: todayActivities.filter(a => a.action.startsWith('forum_') || a.action === 'like_post').length
        },
        yesterdayStats: {
          pageViews: yesterdayActivities.filter(a => a.action === 'page_view').length,
          missions: yesterdayActivities.filter(a => a.action.startsWith('mission_')).length,
          learningActivities: yesterdayActivities.filter(a => a.action.startsWith('course_') || a.action.startsWith('quiz_')).length,
          communityActivities: yesterdayActivities.filter(a => a.action.startsWith('forum_') || a.action === 'like_post').length
        },
        liveMetrics: {
          timestamp: new Date(),
          onlineUsers: await AnalyticsController.getCurrentActiveUsers(),
          recentActivities: todayActivities.slice(-10).map(activity => ({
            action: activity.action,
            resource: activity.resource,
            timestamp: activity.timestamp,
            user: activity.userId
          }))
        }
      };

      res.json({
        success: true,
        data: realTimeData
      });
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch real-time analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Track user activity
  static async trackActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Handle both single event and events array formats
      let eventsToProcess: Array<{action: string; resource: string; metadata?: Record<string, unknown>}> = [];
      
      if (req.body.events && Array.isArray(req.body.events)) {
        // Frontend sends events array
        eventsToProcess = req.body.events;
      } else if (req.body.action && req.body.resource) {
        // Direct API call with single event
        eventsToProcess = [req.body];
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid request format. Expected events array or action/resource fields',
          error: 'Missing required data'
        });
        return;
      }

      const userId = req.user?._id || 'anonymous';
      const sessionId = req.sessionID || 'no-session';
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const activities: Array<InstanceType<typeof UserActivity>> = [];

      // Allowed actions list sourced from model; keep in sync if updated
      const allowedActions = new Set([
        'login','logout','page_view','page_focus','page_blur','page_time','page_unload',
        'feature_click','user_active','performance_metrics',
        'mission_start','mission_complete','mission_fail','mission_view','mission_list','view_list',
        'course_start','course_complete','quiz_attempt','quiz_complete',
        'forum_post','forum_reply','mission_share','user_follow','like_post','download_report'
      ]);

      // Simple normalization / mapping for legacy or UI-specific labels
      const normalizeAction = (raw: string): string => {
        const map: Record<string,string> = {
          'mission_list_open': 'mission_list',
          'missions_list': 'mission_list',
          'list_view': 'view_list',
          'perf_metrics': 'performance_metrics'
        };
        return map[raw] || raw;
      };

      for (const eventData of eventsToProcess) {
        let { action, resource, metadata = {} } = eventData;
        action = normalizeAction(action);

        // Validate required fields for each event
        if (!action || !resource) {
          console.warn(`Skipping invalid event - action: ${action}, resource: ${resource}`);
          continue;
        }

        if (!allowedActions.has(action)) {
          // Downgrade unknown actions to a generic feature_click with context
            console.warn(`Unknown activity action '${action}' received. Storing as feature_click.`);
            metadata = { ...metadata, originalAction: action };
            action = 'feature_click';
        }

        const activity = new UserActivity({
          userId,
          sessionId,
          action,
          resource,
          metadata,
          userAgent,
          ipAddress,
          timestamp: new Date()
        });

        activities.push(activity);
      }

      if (activities.length > 0) {
        await UserActivity.insertMany(activities);
      }

      res.json({
        success: true,
        message: `Successfully tracked ${activities.length} activities`
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate analytics report
  static async generateReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { format = 'json', timeframe = '30d', categories } = req.body;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get comprehensive analytics data
      const analyticsData = await (Analytics as any).getAggregatedAnalytics(startDate, endDate) ||
        await AnalyticsController.generateMockAnalytics(startDate, endDate);

      // Get detailed breakdowns
      const detailedReport = {
        ...analyticsData,
        generatedAt: new Date(),
        format,
        requestedBy: req.user?.email || 'anonymous',
        detailedBreakdowns: {
          dailyTrends: await AnalyticsController.getDailyTrends(startDate, endDate),
          topPerformers: await AnalyticsController.getTopPerformers(),
          contentPopularity: await AnalyticsController.getContentPopularity(),
          userBehaviorPatterns: await AnalyticsController.getUserBehaviorPatterns(startDate, endDate)
        }
      };

      // Track report generation
      await new UserActivity({
        userId: req.user?._id || 'anonymous',
        sessionId: req.sessionID || 'no-session',
        action: 'download_report',
        resource: '/analytics/report',
        metadata: { format, timeframe, categories },
        timestamp: new Date()
      }).save();

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-report-${timeframe}.csv"`);
        res.send(AnalyticsController.convertToCSV(detailedReport));
      } else {
        res.json({
          success: true,
          data: detailedReport
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method to get current active users
  private static async getCurrentActiveUsers(): Promise<number> {
    try {
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

      const activeUsers = await UserActivity.distinct('userId', {
        timestamp: { $gte: fifteenMinutesAgo }
      });

      return activeUsers.length;
    } catch (error) {
      console.error('Error getting current active users:', error);
      return 0;
    }
  }

  // Helper method to generate mock analytics data
  private static async generateMockAnalytics(startDate: Date, endDate: Date) {
    return {
      userEngagement: {
        totalUsers: 12847,
        activeUsers: 3421,
        dailyActiveUsers: 1205,
        weeklyActiveUsers: 2894,
        monthlyActiveUsers: 8634,
        averageSessionTime: 28.5,
        bounceRate: 24.3
      },
      learningProgress: {
        totalCourses: 45,
        completedCourses: 1847,
        averageCompletionRate: 78.6,
        totalQuizzesTaken: 5643,
        averageQuizScore: 82.4,
        learningTimeToday: 341,
        mostPopularCourses: [
          'Orbital Mechanics Fundamentals',
          'Mission Planning & Design',
          'Spacecraft Systems',
          'Space Weather & Environment',
          'Rocket Propulsion Basics'
        ]
      },
      missionSuccess: {
        totalMissions: 23456,
        successfulMissions: 18234,
        averageSuccessRate: 77.8,
        totalFuelConsumed: 2847500,
        averageMissionDuration: 12.8,
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
        totalPosts: 4567,
        totalReplies: 12893,
        totalSharedMissions: 892,
        averageLikesPerPost: 5.8,
        mostActiveUsers: [
          'AstronautAlex',
          'OrbitMaster',
          'SpaceExplorer42',
          'MissionCommander',
          'RocketScientist'
        ],
        communityGrowthRate: 15.3,
        engagementRate: 68.9
      },
      platformUsage: {
        totalPageViews: 156789,
        averagePageLoadTime: 1240,
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
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    };
  }

  // Helper methods for detailed analytics
  private static async getDailyTrends(startDate: Date, endDate: Date) {
    // Mock daily trends data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 500) + 800,
        missions: Math.floor(Math.random() * 100) + 50,
        learningTime: Math.floor(Math.random() * 300) + 200
      });
    }
    
    return trends;
  }

  private static async getTopPerformers() {
    return {
      topMissions: [
        { name: 'ISS Rendezvous', completions: 1234, successRate: 89.2 },
        { name: 'Mars Transfer', completions: 987, successRate: 76.5 },
        { name: 'Lunar Landing', completions: 756, successRate: 82.1 }
      ],
      topCourses: [
        { name: 'Orbital Mechanics', completions: 2345, rating: 4.8 },
        { name: 'Mission Planning', completions: 1987, rating: 4.6 },
        { name: 'Spacecraft Systems', completions: 1654, rating: 4.7 }
      ],
      topUsers: [
        { name: 'AstronautAlex', score: 15420, missionsCompleted: 89 },
        { name: 'OrbitMaster', score: 14285, missionsCompleted: 76 },
        { name: 'SpaceExplorer42', score: 13967, missionsCompleted: 82 }
      ]
    };
  }

  private static async getContentPopularity() {
    return {
      missions: [
        { name: 'ISS Operations', views: 5432, likes: 234 },
        { name: 'Mars Exploration', views: 4321, likes: 189 },
        { name: 'Moon Base Construction', views: 3456, likes: 156 }
      ],
      courses: [
        { name: 'Introduction to Spaceflight', views: 7654, completions: 432 },
        { name: 'Advanced Propulsion', views: 6543, completions: 321 },
        { name: 'Life Support Systems', views: 5432, completions: 287 }
      ]
    };
  }

  private static async getUserBehaviorPatterns(startDate: Date, endDate: Date) {
    return {
      peakHours: [
        { hour: 14, activity: 245 },
        { hour: 15, activity: 289 },
        { hour: 16, activity: 234 },
        { hour: 20, activity: 178 },
        { hour: 21, activity: 156 }
      ],
      sessionDuration: {
        average: 28.5,
        distribution: {
          '0-5min': 15.2,
          '5-15min': 28.7,
          '15-30min': 31.4,
          '30-60min': 18.3,
          '60min+': 6.4
        }
      },
      userJourney: [
        { step: 'Landing Page', users: 1000, dropOff: 12.5 },
        { step: 'Registration', users: 875, dropOff: 8.7 },
        { step: 'First Mission', users: 799, dropOff: 15.3 },
        { step: 'Course Completion', users: 677, dropOff: 22.1 },
        { step: 'Community Engagement', users: 527, dropOff: 0 }
      ]
    };
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion for key metrics
    let csv = 'Metric,Value\n';
    
    csv += `Total Users,${data.userEngagement?.totalUsers || 0}\n`;
    csv += `Active Users,${data.userEngagement?.activeUsers || 0}\n`;
    csv += `Mission Success Rate,${data.missionSuccess?.averageSuccessRate || 0}%\n`;
    csv += `Learning Completion Rate,${data.learningProgress?.averageCompletionRate || 0}%\n`;
    csv += `Community Posts,${data.communityStats?.totalPosts || 0}\n`;
    csv += `Page Views,${data.platformUsage?.totalPageViews || 0}\n`;
    
    return csv;
  }
}