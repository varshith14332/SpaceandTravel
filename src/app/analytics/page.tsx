'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';
import MobileCard from '@/components/MobileCard';
import TouchButton from '@/components/TouchButton';
import { analytics, LiveMetrics } from '@/lib/analytics';

interface AnalyticsData {
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionTime: number; // minutes
    bounceRate: number; // percentage
  };
  learningProgress: {
    totalCourses: number;
    completedCourses: number;
    averageCompletionRate: number; // percentage
    totalQuizzesTaken: number;
    averageQuizScore: number; // percentage
    mostPopularCourses: string[];
    learningTimeToday: number; // minutes
  };
  missionSuccess: {
    totalMissions: number;
    successfulMissions: number;
    averageSuccessRate: number; // percentage
    totalFuelConsumed: number; // kg
    averageMissionDuration: number; // minutes
    popularMissionTypes: Array<{ type: string; count: number }>;
    difficultyDistribution: Array<{ difficulty: string; count: number }>;
  };
  communityStats: {
    totalPosts: number;
    totalReplies: number;
    totalSharedMissions: number;
    averageLikesPerPost: number;
    mostActiveUsers: string[];
    communityGrowthRate: number; // percentage
    engagementRate: number; // percentage
  };
  platformUsage: {
    totalPageViews: number;
    averagePageLoadTime: number; // milliseconds
    mostVisitedPages: Array<{ page: string; views: number }>;
    deviceBreakdown: Array<{ device: string; percentage: number }>;
    browserBreakdown: Array<{ browser: string; percentage: number }>;
  };
}

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [issPosition, setISSPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeCategory, setActiveCategory] = useState<'overview' | 'users' | 'learning' | 'missions' | 'community' | 'live'>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const liveUpdateInterval = useRef<NodeJS.Timeout | null>(null);

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
        
        // Start live updates for the live tab
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

  // Start/stop live updates based on active category
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
    }, 30000); // Update every 30 seconds
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

  const StatCard = ({ title, value, change, icon, isLive = false }: {
    title: string;
    value: string | number;
    change?: { value: number; isPositive: boolean };
    icon: string;
    isLive?: boolean;
  }) => (
    <MobileCard className="p-4 sm:p-6 relative">
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center space-x-1 text-sm mt-2 ${change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{getChangeIcon(change.isPositive)}</span>
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        <div className={`text-3xl opacity-60`}>
          {icon}
        </div>
      </div>
    </MobileCard>
  );

  const LiveActivityFeed = () => (
    <MobileCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <span>Live Activity Feed</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </h3>
        <div className="text-sm text-gray-400">
          Last updated: {formatTime(lastUpdate)}
        </div>
      </div>
      
      {liveMetrics?.recentActivities && liveMetrics.recentActivities.length > 0 ? (
        <div className="space-y-3">
          {liveMetrics.recentActivities.slice(0, 8).map((activity, index) => (
            <motion.div
              key={`${activity.timestamp}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.action.replace(/_/g, ' ').toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {activity.resource} • User: {activity.user.substring(0, 8)}...
                </p>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No recent activity data available</p>
        </div>
      )}
    </MobileCard>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
          <p className="text-xl">Loading live analytics data...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to real-time feeds...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData && !liveMetrics) {
    return (
      <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-xl text-red-400">Failed to load analytics data</p>
          <TouchButton 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </TouchButton>
        </div>
      </div>
    );
  }

  const ProgressBar = ({ label, value, total, color = 'blue' }: {
    label: string;
    value: number;
    total: number;
    color?: string;
  }) => {
    const percentage = (value / total) * 100;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{label}</span>
          <span>{formatNumber(value)} / {formatNumber(total)}</span>
        </div>
        <div className={`w-full bg-gray-700 rounded-full h-2`}>
          <div
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {percentage.toFixed(1)}%
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Live Analytics Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time insights into platform performance and user engagement
          </p>
          {liveMetrics && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Data Connected</span>
              <span className="text-sm text-gray-400">• Last update: {formatTime(lastUpdate)}</span>
            </div>
          )}
        </motion.div>

        {/* Time Period & Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: '1y', label: '1 Year' }
            ].map(period => (
              <TouchButton
                key={period.key}
                onClick={() => setActiveTimeframe(period.key as '7d' | '30d' | '90d' | '1y')}
                variant={activeTimeframe === period.key ? 'primary' : 'secondary'}
                size="sm"
              >
                {period.label}
              </TouchButton>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'live', label: 'Live', icon: '🔴' },
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'users', label: 'Users', icon: '👥' },
              { key: 'learning', label: 'Learning', icon: '📚' },
              { key: 'missions', label: 'Missions', icon: '🚀' },
              { key: 'community', label: 'Community', icon: '💬' }
            ].map(category => (
              <TouchButton
                key={category.key}
                onClick={() => setActiveCategory(category.key as 'overview' | 'users' | 'learning' | 'missions' | 'community' | 'live')}
                variant={activeCategory === category.key ? 'primary' : 'secondary'}
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </TouchButton>
            ))}
          </div>
        </motion.div>

        {/* Analytics Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeCategory === 'live' && (
              <div className="space-y-8">
                {/* Real-time Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Online Users"
                    value={liveMetrics?.currentActiveUsers || 0}
                    icon="🟢"
                    isLive={true}
                  />
                  <StatCard
                    title="Today's Page Views"
                    value={formatNumber(liveMetrics?.todayStats.pageViews || 0)}
                    icon="👁️"
                    isLive={true}
                  />
                  <StatCard
                    title="Active Missions"
                    value={liveMetrics?.todayStats.missions || 0}
                    icon="🚀"
                    isLive={true}
                  />
                  <StatCard
                    title="Learning Sessions"
                    value={liveMetrics?.todayStats.learningActivities || 0}
                    icon="📚"
                    isLive={true}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <LiveActivityFeed />
                  
                  <MobileCard className="p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                      <span>ISS Position</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </h3>
                    {issPosition ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400">
                              {issPosition.lat.toFixed(2)}°
                            </div>
                            <div className="text-sm text-gray-400">Latitude</div>
                          </div>
                          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400">
                              {issPosition.lon.toFixed(2)}°
                            </div>
                            <div className="text-sm text-gray-400">Longitude</div>
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-400">
                          Updated: {formatTime(lastUpdate)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🛰️</div>
                        <p>Loading ISS position...</p>
                      </div>
                    )}
                  </MobileCard>
                </div>
              </div>
            )}

            {activeCategory === 'overview' && analyticsData && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value={formatNumber(analyticsData.userEngagement.totalUsers)}
                    change={{ value: 12.5, isPositive: true }}
                    icon="👥"
                  />
                  <StatCard
                    title="Active Users"
                    value={formatNumber(analyticsData.userEngagement.activeUsers)}
                    change={{ value: 8.3, isPositive: true }}
                    icon="🟢"
                  />
                  <StatCard
                    title="Mission Success Rate"
                    value={`${analyticsData.missionSuccess.averageSuccessRate}%`}
                    change={{ value: 3.2, isPositive: true }}
                    icon="🎯"
                  />
                  <StatCard
                    title="Learning Completion"
                    value={`${analyticsData.learningProgress.averageCompletionRate}%`}
                    change={{ value: 5.7, isPositive: true }}
                    icon="📈"
                  />
                </div>

                {/* Platform Usage Overview */}
                <MobileCard className="p-6">
                  <h3 className="text-xl font-bold mb-6">Platform Usage Overview</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Most Visited Pages</h4>
                      {analyticsData.platformUsage.mostVisitedPages.map((page, index) => (
                        <ProgressBar
                          key={page.page}
                          label={page.page}
                          value={page.views}
                          total={analyticsData.platformUsage.mostVisitedPages[0].views}
                          color={index === 0 ? 'blue' : index === 1 ? 'purple' : 'green'}
                        />
                      ))}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Device Breakdown</h4>
                      {analyticsData.platformUsage.deviceBreakdown.map((device, index) => (
                        <div key={device.device} className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>{device.device}</span>
                            <span>{device.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-yellow-500'} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </MobileCard>
              </div>
            )}

            {/* Additional categories would go here... */}
          </motion.div>
        </AnimatePresence>

        {/* Export/Download Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-12 space-x-4"
        >
          <TouchButton 
            variant="primary" 
            onClick={exportReport}
            className="flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export Analytics Report</span>
          </TouchButton>
          
          <TouchButton 
            variant="secondary" 
            onClick={() => {
              analytics.track('manual_refresh', '/analytics');
              window.location.reload();
            }}
            className="flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh Data</span>
          </TouchButton>
        </motion.div>
      </div>
    </div>
  );
}