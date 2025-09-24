'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock theme context for demonstration
const getThemeClasses = () => ({
  background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  text: 'text-white'
});

// Mock analytics functions
const analytics = {
  trackPageView: (path: string) => console.log('Tracking page view:', path),
  getAnalytics: async (timeframe: string) => ({
    userEngagement: {
      totalUsers: 15847,
      activeUsers: 8924,
      dailyActiveUsers: 3241,
      weeklyActiveUsers: 6789,
      monthlyActiveUsers: 12456,
      averageSessionTime: 23.5,
      bounceRate: 32.1
    },
    learningProgress: {
      totalCourses: 156,
      completedCourses: 89,
      averageCompletionRate: 76.3,
      totalQuizzesTaken: 4521,
      averageQuizScore: 84.7,
      mostPopularCourses: ['Orbital Mechanics', 'Space History', 'Rocket Science'],
      learningTimeToday: 342
    },
    missionSuccess: {
      totalMissions: 2341,
      successfulMissions: 2087,
      averageSuccessRate: 89.2,
      totalFuelConsumed: 156789,
      averageMissionDuration: 45.3,
      popularMissionTypes: [
        { type: 'ISS Docking', count: 456 },
        { type: 'Satellite Deploy', count: 389 },
        { type: 'Moon Landing', count: 234 }
      ],
      difficultyDistribution: [
        { difficulty: 'Easy', count: 1200 },
        { difficulty: 'Medium', count: 800 },
        { difficulty: 'Hard', count: 341 }
      ]
    },
    communityStats: {
      totalPosts: 12456,
      totalReplies: 34789,
      totalSharedMissions: 5678,
      averageLikesPerPost: 12.4,
      mostActiveUsers: ['SpaceExplorer42', 'RocketScientist', 'AstronautDreamer'],
      communityGrowthRate: 18.7,
      engagementRate: 67.3
    },
    platformUsage: {
      totalPageViews: 567890,
      averagePageLoadTime: 1234,
      mostVisitedPages: [
        { page: 'Mission Control', views: 45678 },
        { page: 'Learning Hub', views: 34567 },
        { page: 'Community', views: 23456 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', percentage: 45 },
        { device: 'Mobile', percentage: 35 },
        { device: 'Tablet', percentage: 20 }
      ],
      browserBreakdown: [
        { browser: 'Chrome', percentage: 65 },
        { browser: 'Firefox', percentage: 20 },
        { browser: 'Safari', percentage: 15 }
      ]
    }
  }),
  getLiveMetrics: async () => ({
    currentActiveUsers: 1247,
    todayStats: {
      pageViews: 12456,
      missions: 89,
      learningActivities: 234
    },
    recentActivities: [
      { timestamp: Date.now() - 30000, action: 'mission_completed', resource: 'ISS Docking', user: 'user123456' },
      { timestamp: Date.now() - 60000, action: 'course_started', resource: 'Orbital Mechanics', user: 'user789012' },
      { timestamp: Date.now() - 90000, action: 'post_created', resource: 'Mission Discussion', user: 'user345678' },
      { timestamp: Date.now() - 120000, action: 'quiz_completed', resource: 'Space History Quiz', user: 'user901234' },
      { timestamp: Date.now() - 150000, action: 'mission_started', resource: 'Moon Landing', user: 'user567890' }
    ]
  }),
  getISSPosition: async () => ({ latitude: 25.7617, longitude: -80.1918 }),
  track: (event: string, path: string, data?: Record<string, unknown>) => console.log('Tracking:', event, path, data),
  trackError: (error: Error, context: string) => console.error('Error tracked:', error, context),
  generateReport: async (options: Record<string, unknown>) => ({ data: 'mock report data' })
};

interface AnalyticsData {
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

interface LiveMetrics {
  currentActiveUsers: number;
  todayStats: {
    pageViews: number;
    missions: number;
    learningActivities: number;
  };
  recentActivities: Array<{
    timestamp: number;
    action: string;
    resource: string;
    user: string;
  }>;
}

// Enhanced Mobile Card Component with glassmorphism
const MobileCard = ({ children, className = "", hover = true }: { 
  children: React.ReactNode; 
  className?: string; 
  hover?: boolean;
}) => (
  <motion.div
    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-3xl' : ''} transition-all duration-300 ${className}`}
    whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {children}
  </motion.div>
);

// Enhanced Touch Button with better animations
const TouchButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}) => {
  const baseClasses = "font-semibold rounded-xl transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40",
    secondary: "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white",
    accent: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export default function AnalyticsPage() {
  const themeClasses = getThemeClasses();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [issPosition, setISSPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeCategory, setActiveCategory] = useState<'overview' | 'users' | 'learning' | 'missions' | 'community' | 'live'>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const liveUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Floating particles background animation
  const FloatingParticles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );

  // Initialize analytics tracking
  useEffect(() => {
    analytics.trackPageView('/analytics');
    return () => {
      if (liveUpdateInterval.current) {
        clearInterval(liveUpdateInterval.current);
      }
    };
  }, []);

  // Load initial analytics data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [analyticsResult, liveResult] = await Promise.all([
          analytics.getAnalytics(activeTimeframe),
          analytics.getLiveMetrics()
        ]);
        
        setAnalyticsData(analyticsResult);
        setLiveMetrics(liveResult);
        
        if (activeCategory === 'live') {
          startLiveUpdates();
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
        analytics.trackError(error as Error, 'analytics_data_load');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeTimeframe, activeCategory]);

  useEffect(() => {
    if (activeCategory === 'live') {
      startLiveUpdates();
    } else {
      stopLiveUpdates();
    }

    return () => stopLiveUpdates();
  }, [activeCategory]);

  const startLiveUpdates = () => {
    if (liveUpdateInterval.current) return;

    liveUpdateInterval.current = setInterval(async () => {
      try {
        const [liveResult, issPos] = await Promise.all([
          analytics.getLiveMetrics(),
          analytics.getISSPosition()
        ]);
        
        setLiveMetrics(liveResult);
        if (issPos) {
          setISSPosition({ lat: issPos.latitude, lon: issPos.longitude });
        }
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error updating live metrics:', error);
      }
    }, 3000); // Faster updates for demo
  };

  const stopLiveUpdates = () => {
    if (liveUpdateInterval.current) {
      clearInterval(liveUpdateInterval.current);
      liveUpdateInterval.current = null;
    }
  };

  const exportReport = async () => {
    try {
      analytics.track('export_report', '/analytics', { format: 'json', timeframe: activeTimeframe });
      const report = await analytics.generateReport({
        format: 'json',
        timeframe: activeTimeframe
      });
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${activeTimeframe}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      analytics.trackError(error as Error, 'export_report');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getChangeIcon = (isPositive: boolean): string => {
    return isPositive ? '📈' : '📉';
  };

  // Enhanced Stat Card with better animations and design
  const StatCard = ({ title, value, change, icon, isLive = false, gradient = "from-blue-500/20 to-purple-500/20" }: {
    title: string;
    value: string | number;
    change?: { value: number; isPositive: boolean };
    icon: string;
    isLive?: boolean;
    gradient?: string;
  }) => (
    <MobileCard className="p-6 relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <motion.div 
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-2 font-medium tracking-wide uppercase">
              {title}
            </p>
            <motion.p 
              className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {value}
            </motion.p>
            {change && (
              <motion.div 
                className={`flex items-center space-x-2 text-sm mt-3 px-3 py-1 rounded-full backdrop-blur-sm ${
                  change.isPositive 
                    ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30' 
                    : 'text-red-300 bg-red-500/20 border border-red-500/30'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-base">{getChangeIcon(change.isPositive)}</span>
                <span className="font-semibold">{Math.abs(change.value)}%</span>
                <span className="text-xs opacity-80">vs last period</span>
              </motion.div>
            )}
          </div>
          <motion.div 
            className="text-4xl sm:text-5xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            {icon}
          </motion.div>
        </div>
      </div>
    </MobileCard>
  );

  // Enhanced Live Activity Feed with better styling
  const LiveActivityFeed = () => (
    <MobileCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-3">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Live Activity Feed
          </span>
          <motion.div 
            className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </h3>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
          <span className="text-emerald-400">●</span> {formatTime(lastUpdate)}
        </div>
      </div>
      
      {liveMetrics?.recentActivities && liveMetrics.recentActivities.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {liveMetrics.recentActivities.slice(0, 8).map((activity, index) => (
            <motion.div
              key={`${activity.timestamp}-${index}`}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="group p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm border border-gray-600/30 rounded-xl hover:border-blue-500/50 hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex-shrink-0 shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                    {activity.action.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-1">
                    <span className="text-blue-300">{activity.resource}</span> • 
                    <span className="ml-1">User: {activity.user.substring(0, 8)}...</span>
                  </p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 bg-gray-800/60 px-2 py-1 rounded-lg">
                  {new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            📊
          </motion.div>
          <p className="text-lg">No recent activity data available</p>
        </div>
      )}
    </MobileCard>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center relative overflow-hidden`}>
        <FloatingParticles />
        <div className="text-center z-10">
          <motion.div
            className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-8 mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Loading Live Analytics
            </h2>
            <p className="text-gray-400">Connecting to real-time data streams...</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
              <motion.div className="w-2 h-2 bg-purple-400 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="w-2 h-2 bg-emerald-400 rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!analyticsData && !liveMetrics) {
    return (
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-400 mb-4">Failed to load analytics data</p>
          <TouchButton 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            🔄 Retry Connection
          </TouchButton>
        </div>
      </div>
    );
  }

  const ProgressBar = ({ label, value, total, color = 'blue', showPercentage = true }: {
    label: string;
    value: number;
    total: number;
    color?: string;
    showPercentage?: boolean;
  }) => {
    const percentage = (value / total) * 100;
    
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-emerald-500 to-emerald-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600'
    };
    
    return (
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex justify-between text-sm mb-3">
          <span className="font-medium text-gray-200">{label}</span>
          <span className="text-gray-400">
            {formatNumber(value)} / {formatNumber(total)}
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-3 shadow-inner">
            <motion.div
              className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} h-3 rounded-full shadow-lg relative overflow-hidden`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
        {showPercentage && (
          <div className="text-xs text-gray-400 mt-2 flex items-center justify-between">
            <span>{percentage.toFixed(1)}% completed</span>
            <span className={`px-2 py-1 rounded-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} text-white text-xs font-semibold`}>
              {percentage > 75 ? '🔥' : percentage > 50 ? '⚡' : '📈'}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} relative overflow-hidden`}>
      <FloatingParticles />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Analytics
            </span>
            <br />
            <span className="text-white/80 text-3xl sm:text-4xl">Dashboard</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Real-time insights into platform performance, user engagement, and mission success rates
          </motion.p>
          
          {liveMetrics && (
            <motion.div 
              className="flex items-center justify-center space-x-4 mt-6 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-full px-6 py-3 inline-flex"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div 
                className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-emerald-300 font-semibold">Live Data Connected</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated {formatTime(lastUpdate)}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Time Period & Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0 mb-12"
        >
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-semibold text-gray-300 flex items-center mr-2">
              📅 Time Period:
            </span>
            {[
              { key: '7d', label: '7 Days', icon: '📊' },
              { key: '30d', label: '30 Days', icon: '📈' },
              { key: '90d', label: '90 Days', icon: '📉' },
              { key: '1y', label: '1 Year', icon: '📋' }
            ].map((period, index) => (
              <motion.div
                key={period.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <TouchButton
                  onClick={() => setActiveTimeframe(period.key as '7d' | '30d' | '90d' | '1y')}
                  variant={activeTimeframe === period.key ? 'primary' : 'secondary'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <span>{period.icon}</span>
                  <span>{period.label}</span>
                </TouchButton>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-semibold text-gray-300 flex items-center mr-2">
              🎯 Category:
            </span>
            {[
              { key: 'live', label: 'Live', icon: '🔴', gradient: 'from-red-500 to-pink-500' },
              { key: 'overview', label: 'Overview', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
              { key: 'users', label: 'Users', icon: '👥', gradient: 'from-green-500 to-emerald-500' },
              { key: 'learning', label: 'Learning', icon: '📚', gradient: 'from-purple-500 to-violet-500' },
              { key: 'missions', label: 'Missions', icon: '🚀', gradient: 'from-orange-500 to-red-500' },
              { key: 'community', label: 'Community', icon: '💬', gradient: 'from-pink-500 to-rose-500' }
            ].map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <TouchButton
                  onClick={() => setActiveCategory(category.key as 'overview' | 'users' | 'learning' | 'missions' | 'community' | 'live')}
                  variant={activeCategory === category.key ? 'primary' : 'secondary'}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    activeCategory === category.key 
                      ? `bg-gradient-to-r ${category.gradient} shadow-lg` 
                      : 'hover:bg-white/15'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </TouchButton>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analytics Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 80 }}
          >
            {activeCategory === 'live' && (
              <div className="space-y-8">
                {/* Enhanced Real-time Metrics */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <StatCard
                    title="Online Users"
                    value={formatNumber(liveMetrics?.currentActiveUsers || 0)}
                    icon="🟢"
                    isLive={true}
                    gradient="from-emerald-500/20 to-green-500/20"
                  />
                  <StatCard
                    title="Today's Views"
                    value={formatNumber(liveMetrics?.todayStats.pageViews || 0)}
                    change={{ value: 15.7, isPositive: true }}
                    icon="👁️"
                    isLive={true}
                    gradient="from-blue-500/20 to-cyan-500/20"
                  />
                  <StatCard
                    title="Active Missions"
                    value={liveMetrics?.todayStats.missions || 0}
                    change={{ value: 8.3, isPositive: true }}
                    icon="🚀"
                    isLive={true}
                    gradient="from-orange-500/20 to-red-500/20"
                  />
                  <StatCard
                    title="Learning Sessions"
                    value={liveMetrics?.todayStats.learningActivities || 0}
                    change={{ value: 12.1, isPositive: true }}
                    icon="📚"
                    isLive={true}
                    gradient="from-purple-500/20 to-violet-500/20"
                  />
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2">
                    <LiveActivityFeed />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <MobileCard className="p-6 h-full">
                      <h3 className="text-xl font-bold mb-6 flex items-center space-x-3">
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          ISS Position
                        </span>
                        <motion.div 
                          className="w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </h3>
                      {issPosition ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                              className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div 
                                className="text-3xl font-bold text-blue-300 mb-2"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {issPosition.lat.toFixed(2)}°
                              </motion.div>
                              <div className="text-sm text-gray-400 font-semibold">Latitude</div>
                            </motion.div>
                            <motion.div 
                              className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-xl"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div 
                                className="text-3xl font-bold text-purple-300 mb-2"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                              >
                                {issPosition.lon.toFixed(2)}°
                              </motion.div>
                              <div className="text-sm text-gray-400 font-semibold">Longitude</div>
                            </motion.div>
                          </div>
                          
                          <motion.div 
                            className="text-center p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="text-4xl mb-2">🛰️</div>
                            <div className="text-sm text-emerald-300 font-semibold mb-1">
                              Orbital Velocity: ~27,600 km/h
                            </div>
                            <div className="text-xs text-gray-400">
                              Updated: {formatTime(lastUpdate)}
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4"
                            whileHover={{ borderColor: '#3b82f6' }}
                          >
                            <div className="text-xs text-gray-400 mb-2">Next visible pass over your location:</div>
                            <div className="text-sm text-blue-300 font-semibold">Tonight at 21:47 UTC</div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <motion.div 
                            className="text-6xl mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          >
                            🛰️
                          </motion.div>
                          <p className="text-lg">Loading ISS position...</p>
                        </div>
                      )}
                    </MobileCard>
                  </motion.div>
                </div>
              </div>
            )}

            {activeCategory === 'overview' && analyticsData && (
              <div className="space-y-8">
                {/* Enhanced Key Metrics */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <StatCard
                    title="Total Users"
                    value={formatNumber(analyticsData.userEngagement.totalUsers)}
                    change={{ value: 12.5, isPositive: true }}
                    icon="👥"
                    gradient="from-blue-500/20 to-cyan-500/20"
                  />
                  <StatCard
                    title="Active Users"
                    value={formatNumber(analyticsData.userEngagement.activeUsers)}
                    change={{ value: 8.3, isPositive: true }}
                    icon="🟢"
                    gradient="from-emerald-500/20 to-green-500/20"
                  />
                  <StatCard
                    title="Mission Success"
                    value={`${analyticsData.missionSuccess.averageSuccessRate}%`}
                    change={{ value: 3.2, isPositive: true }}
                    icon="🎯"
                    gradient="from-orange-500/20 to-red-500/20"
                  />
                  <StatCard
                    title="Course Completion"
                    value={`${analyticsData.learningProgress.averageCompletionRate}%`}
                    change={{ value: 5.7, isPositive: true }}
                    icon="📈"
                    gradient="from-purple-500/20 to-violet-500/20"
                  />
                </motion.div>

                {/* Enhanced Platform Usage Overview */}
                <MobileCard className="p-8">
                  <motion.h3 
                    className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Platform Usage Overview
                  </motion.h3>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                        <span>🔥</span>
                        <span>Most Visited Pages</span>
                      </h4>
                      {analyticsData.platformUsage.mostVisitedPages.map((page, index) => (
                        <ProgressBar
                          key={page.page}
                          label={page.page}
                          value={page.views}
                          total={analyticsData.platformUsage.mostVisitedPages[0].views}
                          color={['blue', 'purple', 'green', 'orange', 'pink'][index % 5]}
                        />
                      ))}
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                        <span>📱</span>
                        <span>Device Breakdown</span>
                      </h4>
                      {analyticsData.platformUsage.deviceBreakdown.map((device, index) => {
                        const colors = ['blue', 'green', 'orange'];
                        return (
                          <motion.div 
                            key={device.device} 
                            className="mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <div className="flex justify-between text-sm mb-3">
                              <span className="font-medium text-gray-200 flex items-center space-x-2">
                                <span>{device.device === 'Desktop' ? '💻' : device.device === 'Mobile' ? '📱' : '📟'}</span>
                                <span>{device.device}</span>
                              </span>
                              <span className="text-gray-400 font-semibold">{device.percentage}%</span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-full h-3 shadow-inner">
                                <motion.div
                                  className={`bg-gradient-to-r ${
                                    colors[index] === 'blue' ? 'from-blue-500 to-blue-600' :
                                    colors[index] === 'green' ? 'from-emerald-500 to-emerald-600' :
                                    'from-orange-500 to-orange-600'
                                  } h-3 rounded-full shadow-lg relative overflow-hidden`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${device.percentage}%` }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 + index * 0.2 }}
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  />
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      <motion.div 
                        className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300 mb-1">
                            {formatNumber(analyticsData.platformUsage.totalPageViews)}
                          </div>
                          <div className="text-sm text-gray-400">Total Page Views This Period</div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </MobileCard>

                {/* Additional Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <MobileCard className="p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <span>⚡</span>
                      <span>Performance Metrics</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Avg. Load Time</span>
                        <span className="font-bold text-emerald-400">
                          {(analyticsData.platformUsage.averagePageLoadTime / 1000).toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Bounce Rate</span>
                        <span className="font-bold text-blue-400">
                          {analyticsData.userEngagement.bounceRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Session Duration</span>
                        <span className="font-bold text-purple-400">
                          {analyticsData.userEngagement.averageSessionTime}min
                        </span>
                      </div>
                    </div>
                  </MobileCard>

                  <MobileCard className="p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Mission Highlights</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="text-center p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-300">
                          {formatNumber(analyticsData.missionSuccess.totalMissions)}
                        </div>
                        <div className="text-sm text-gray-400">Total Missions</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-300">
                          {formatNumber(analyticsData.missionSuccess.totalFuelConsumed)} kg
                        </div>
                        <div className="text-sm text-gray-400">Fuel Consumed</div>
                      </div>
                    </div>
                  </MobileCard>

                  <MobileCard className="p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <span>💬</span>
                      <span>Community Activity</span>
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Posts</span>
                        <span className="font-bold text-pink-400">
                          {formatNumber(analyticsData.communityStats.totalPosts)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Engagement Rate</span>
                        <span className="font-bold text-blue-400">
                          {analyticsData.communityStats.engagementRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Growth Rate</span>
                        <span className="font-bold text-emerald-400">
                          +{analyticsData.communityStats.communityGrowthRate}%
                        </span>
                      </div>
                    </div>
                  </MobileCard>
                </div>
              </div>
            )}

            {/* Learning Progress Category */}
            {activeCategory === 'learning' && analyticsData && (
              <div className="space-y-8">
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <StatCard
                    title="Total Courses"
                    value={analyticsData.learningProgress.totalCourses}
                    change={{ value: 8.2, isPositive: true }}
                    icon="📚"
                    gradient="from-purple-500/20 to-violet-500/20"
                  />
                  <StatCard
                    title="Completed"
                    value={analyticsData.learningProgress.completedCourses}
                    change={{ value: 15.3, isPositive: true }}
                    icon="✅"
                    gradient="from-emerald-500/20 to-green-500/20"
                  />
                  <StatCard
                    title="Quiz Average"
                    value={`${analyticsData.learningProgress.averageQuizScore}%`}
                    change={{ value: 4.1, isPositive: true }}
                    icon="🎯"
                    gradient="from-blue-500/20 to-cyan-500/20"
                  />
                  <StatCard
                    title="Learning Time Today"
                    value={`${analyticsData.learningProgress.learningTimeToday}min`}
                    change={{ value: 12.7, isPositive: true }}
                    icon="⏱️"
                    gradient="from-orange-500/20 to-red-500/20"
                  />
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <MobileCard className="p-8">
                    <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      📈 Course Completion Progress
                    </h3>
                    <ProgressBar
                      label="Overall Completion Rate"
                      value={analyticsData.learningProgress.completedCourses}
                      total={analyticsData.learningProgress.totalCourses}
                      color="purple"
                    />
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-300 mb-2">
                          {formatNumber(analyticsData.learningProgress.totalQuizzesTaken)}
                        </div>
                        <div className="text-sm text-gray-400">Total Quizzes Completed</div>
                      </div>
                    </div>
                  </MobileCard>

                  <MobileCard className="p-8">
                    <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      🏆 Most Popular Courses
                    </h3>
                    <div className="space-y-4">
                      {analyticsData.learningProgress.mostPopularCourses.map((course, index) => (
                        <motion.div
                          key={course}
                          className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-xl border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' : 
                            index === 1 ? 'bg-gray-400 text-black' : 
                            'bg-orange-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{course}</div>
                            <div className="text-xs text-gray-400">
                              {index === 0 ? '🔥 Most Popular' : index === 1 ? '⭐ Rising Star' : '📈 Trending'}
                            </div>
                          </div>
                          <div className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </MobileCard>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Export/Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-16 p-8 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm border border-gray-600/30 rounded-2xl"
        >
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-white mb-2">
              📊 Export Analytics Data
            </h3>
            <p className="text-gray-400 text-sm">
              Download comprehensive reports and refresh live data
            </p>
          </div>
          
          <div className="flex space-x-4">
            <TouchButton 
              variant="primary" 
              onClick={exportReport}
              className="flex items-center space-x-3 shadow-xl"
            >
              <span className="text-xl">📊</span>
              <span>Export Report</span>
            </TouchButton>
            
            <TouchButton 
              variant="accent" 
              onClick={() => {
                analytics.track('manual_refresh', '/analytics');
                window.location.reload();
              }}
              className="flex items-center space-x-3 shadow-xl"
            >
              <motion.span 
                className="text-xl inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🔄
              </motion.span>
              <span>Refresh Data</span>
            </TouchButton>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}