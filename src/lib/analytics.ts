'use client';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type MetadataValue = string | number | boolean | Date | null | undefined | Record<string, unknown>;

export interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  learningProgress: {
    totalCourses: number;
    completedCourses: number;
    averageCompletionRate: number;
    totalQuizzesTaken: number;
    averageQuizScore: number;
    mostPopularCourses: string[];
    learningTimeToday: number;
  };
  missionSuccess: {
    totalMissions: number;
    successfulMissions: number;
    averageSuccessRate: number;
    totalFuelConsumed: number;
    averageMissionDuration: number;
    popularMissionTypes: Array<{ type: string; count: number }>;
    difficultyDistribution: Array<{ difficulty: string; count: number }>;
  };
  communityStats: {
    totalPosts: number;
    totalReplies: number;
    totalSharedMissions: number;
    averageLikesPerPost: number;
    mostActiveUsers: string[];
    communityGrowthRate: number;
    engagementRate: number;
  };
  platformUsage: {
    totalPageViews: number;
    averagePageLoadTime: number;
    mostVisitedPages: Array<{ page: string; views: number }>;
    deviceBreakdown: Array<{ device: string; percentage: number }>;
    browserBreakdown: Array<{ browser: string; percentage: number }>;
  };
}

export interface AnalyticsEvent {
  action: string;
  resource: string;
  metadata?: Record<string, MetadataValue>;
  timestamp?: Date;
}

export interface LiveMetrics {
  currentActiveUsers: number;
  todayStats: {
    pageViews: number;
    missions: number;
    learningActivities: number;
    communityActivities: number;
  };
  recentActivities: Array<{
    action: string;
    resource: string;
    timestamp: Date;
    user: string;
  }>;
}

class AnalyticsService {
  private baseUrl: string;
  private userId: string | null = null;
  private sessionId: string;
  private isEnabled: boolean = true;
  private eventQueue: AnalyticsEvent[] = [];
  private batchInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/analytics`;
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    
    // Only initialize browser-dependent features in the browser
    if (typeof window !== 'undefined') {
      // Start batch processing
      this.startBatchProcessing();
      
      // Start heartbeat for active user tracking
      this.startHeartbeat();
      
      // Track page visibility changes
      this.setupVisibilityTracking();
      
      // Track initial page load
      this.trackPageView();
    }
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private getUserId(): string | null {
    try {
      // Only access localStorage in browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user)._id : null;
    } catch {
      return null;
    }
  }

  private startBatchProcessing(): void {
    this.batchInterval = setInterval(() => {
      this.flushEvents();
    }, 5000); // Flush every 5 seconds
  }

  private startHeartbeat(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Send heartbeat every 30 seconds to track active users
    this.heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        this.track('user_active', window.location.pathname, {
          timestamp: new Date(),
          sessionDuration: this.getSessionDuration()
        });
      }
    }, 30000);
  }

  private setupVisibilityTracking(): void {
    // Only setup visibility tracking in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_blur', window.location.pathname);
      } else {
        this.track('page_focus', window.location.pathname);
      }
    });

    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', window.location.pathname, {
        sessionDuration: this.getSessionDuration()
      });
      this.flushEvents(); // Immediate flush on page unload
    });
  }

  private getSessionDuration(): number {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 0;
    }
    const sessionStart = localStorage.getItem('sessionStart');
    if (sessionStart) {
      return Date.now() - parseInt(sessionStart);
    }
    return 0;
  }

  // Public API methods
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public track(action: string, resource: string, metadata: Record<string, MetadataValue> = {}): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      action,
      resource,
      metadata: {
        ...metadata,
        userId: this.userId,
        sessionId: this.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date(),
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        referrer: typeof document !== 'undefined' ? document.referrer : 'Unknown'
      }
    };

    this.eventQueue.push(event);

    // For critical events, flush immediately
    if (this.isCriticalEvent(action)) {
      this.flushEvents();
    }
  }

  public trackPageView(path?: string): void {
    // Only track page views in browser environment
    if (typeof window === 'undefined') return;
    
    const currentPath = path || window.location.pathname;
    this.track('page_view', currentPath, {
      title: typeof document !== 'undefined' ? document.title : 'Unknown',
      loadTime: typeof performance !== 'undefined' ? performance.now() : 0
    });
  }

  public trackMissionStart(missionId: string, missionType: string): void {
    this.track('mission_start', `/missions/${missionId}`, {
      missionId,
      missionType,
      startTime: new Date()
    });
  }

  public trackMissionComplete(missionId: string, success: boolean, metrics: { score?: number; duration?: number; fuel?: number }): void {
    this.track('mission_complete', `/missions/${missionId}`, {
      missionId,
      success,
      metrics,
      completionTime: new Date()
    });
  }

  public trackLearningActivity(activityType: string, resourceId: string, progress?: number): void {
    this.track('learning_activity', `/learning/${resourceId}`, {
      activityType,
      resourceId,
      progress,
      timestamp: new Date()
    });
  }

  public trackCommunityAction(action: string, resourceId: string, metadata: Record<string, MetadataValue> = {}): void {
    this.track('community_action', `/community/${resourceId}`, {
      communityAction: action,
      resourceId,
      ...metadata
    });
  }

  public trackError(error: Error, context: string): void {
    this.track('error', context, {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      timestamp: new Date()
    });
  }

  private isCriticalEvent(action: string): boolean {
    return ['error', 'mission_complete', 'user_signup', 'payment_complete'].includes(action);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      // Silently handle analytics errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics service unavailable (development mode)');
      } else {
        console.error('Failed to send analytics events:', error);
      }
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  // Live data fetching methods
  public async getLiveMetrics(): Promise<LiveMetrics | null> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime`);
      if (!response.ok) throw new Error('Failed to fetch live metrics');
      const data = await response.json();
      return data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics service unavailable (development mode)');
      } else {
        console.error('Error fetching live metrics:', error);
      }
      return null;
    }
  }

  public async getAnalytics(timeframe: string = '30d'): Promise<AnalyticsData | null> {
    try {
      const response = await fetch(`${this.baseUrl}?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics service unavailable (development mode)');
      } else {
        console.error('Error fetching analytics:', error);
      }
      return null;
    }
  }

  public async generateReport(options: {
    format?: string;
    timeframe?: string;
    categories?: string[];
  } = {}): Promise<string | { reportUrl: string; reportId: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      if (options.format === 'csv') {
        return await response.text();
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics service unavailable (development mode)');
      } else {
        console.error('Error generating report:', error);
      }
      throw error;
    }
  }

  // Real-time ISS position integration
  public async getISSPosition(): Promise<{ latitude: number; longitude: number; timestamp: number } | null> {
    try {
      const response = await fetch('http://api.open-notify.org/iss-now.json');
      if (!response.ok) throw new Error('Failed to fetch ISS position');
      const data = await response.json();
      
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Error fetching ISS position:', error);
      return null;
    }
  }

  // Real-time space weather data
  public async getSpaceWeather(): Promise<Array<{ eventTime: string; classType: string; beginTime?: string; peakTime?: string; endTime?: string }> | null> {
    try {
      // Using NASA's DONKI API for space weather
      const response = await fetch('https://api.nasa.gov/DONKI/FLR?startDate=2024-01-01&api_key=DEMO_KEY');
      if (!response.ok) throw new Error('Failed to fetch space weather');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching space weather:', error);
      return null;
    }
  }

  // Performance tracking
  public trackPerformance(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.track('performance_metrics', window.location.pathname, {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      timeToInteractive: this.getTimeToInteractive()
    });
  }

  private getFirstPaint(): number | null {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return null;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  private getFirstContentfulPaint(): number | null {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return null;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : null;
  }

  private getTimeToInteractive(): number | null {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return null;
    
    // Simplified TTI calculation
    return performance.now();
  }

  // Cleanup
  public destroy(): void {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.flushEvents();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Auto-track performance metrics after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      analytics.trackPerformance();
    }, 1000);
  });

  // Set session start time
  if (!localStorage.getItem('sessionStart')) {
    localStorage.setItem('sessionStart', Date.now().toString());
  }
}