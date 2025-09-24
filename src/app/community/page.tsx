'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';
import MobileCard from '@/components/MobileCard';
import TouchButton from '@/components/TouchButton';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
    reputation: number;
  };
  category: 'general' | 'missions' | 'technical' | 'achievements' | 'help';
  tags: string[];
  likes: number;
  views: number;
  replies: number;
  createdAt: string;
  isPinned?: boolean;
  isHot?: boolean;
  hasMedia?: boolean;
}

interface MissionShare {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  likes: number;
  downloads: number;
  rating: number;
  missionData: {
    missionType: string;
    targetOrbit: {
      altitude: number;
      inclination: number;
      eccentricity: number;
    };
    estimatedDuration: string;
    successRate: number;
  };
  createdAt: string;
  isFeatured?: boolean;
  previewImage?: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  stats: {
    reputation: number;
    postsCount: number;
    likesReceived: number;
    missionsShared: number;
    followersCount: number;
    totalPlayTime: string;
    successfulMissions: number;
  };
  achievements: Array<{
    name: string;
    icon: string;
    rarity: string;
    description: string;
  }>;
  isOnline?: boolean;
  lastActive?: string;
}

export default function CommunityPage() {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState<'forum' | 'missions' | 'leaderboard'>('forum');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [missionShares, setMissionShares] = useState<MissionShare[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [forumCategory, setForumCategory] = useState('all');
  const [missionDifficulty, setMissionDifficulty] = useState('all');
  const [leaderboardType, setLeaderboardType] = useState('reputation');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, -50]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);

  // Enhanced mock data
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      // Enhanced forum posts with more details
      setForumPosts([
        {
          id: '1',
          title: 'Successfully completed Mars mission simulation with 98.5% accuracy! 🎯',
          content: 'Just finished my most challenging Mars mission yet! The key was optimizing the fuel consumption during the trans-Mars injection burn and using gravity assists effectively. Here\'s what I learned...',
          author: { 
            id: 'user1', 
            username: 'AstronautAlex', 
            avatar: '🚀', 
            level: 47,
            reputation: 2450 
          },
          category: 'achievements',
          tags: ['mars', 'mission', 'success', 'tutorial'],
          likes: 124,
          views: 1256,
          replies: 28,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isPinned: true,
          isHot: true,
          hasMedia: true
        },
        {
          id: '2',
          title: 'Advanced orbital mechanics: Hohmann vs Bi-elliptic transfers',
          content: 'After extensive testing in various scenarios, I\'ve compiled a comprehensive guide on when to use each transfer type for maximum efficiency...',
          author: { 
            id: 'user2', 
            username: 'OrbitMaster', 
            avatar: '🛰️', 
            level: 52,
            reputation: 3180 
          },
          category: 'technical',
          tags: ['orbital-mechanics', 'efficiency', 'advanced', 'guide'],
          likes: 89,
          views: 567,
          replies: 34,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isHot: true
        },
        {
          id: '3',
          title: 'New pilot seeking mentorship and mission recommendations',
          content: 'Greetings, space community! Just got my pilot certification and looking for experienced commanders to show me the ropes. What missions should I tackle first?',
          author: { 
            id: 'user3', 
            username: 'SpaceNewbie', 
            avatar: '👨‍🚀', 
            level: 3,
            reputation: 45 
          },
          category: 'help',
          tags: ['beginner', 'mentorship', 'recommendations'],
          likes: 67,
          views: 234,
          replies: 42,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Community Challenge: Design the perfect lunar base layout',
          content: 'Let\'s collaborate on designing an efficient and sustainable lunar base! Share your ideas, blueprints, and resource management strategies...',
          author: { 
            id: 'user4', 
            username: 'LunarArchitect', 
            avatar: '🌙', 
            level: 38,
            reputation: 1890 
          },
          category: 'general',
          tags: ['challenge', 'lunar', 'collaboration', 'design'],
          likes: 156,
          views: 892,
          replies: 73,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          isPinned: true
        }
      ]);

      // Enhanced mission shares
      setMissionShares([
        {
          id: 'm1',
          title: 'Perfect ISS Rendezvous Challenge: Master Class Edition',
          description: 'An expertly crafted mission requiring precise timing, fuel management, and spatial awareness. Features multiple difficulty modifiers and comprehensive scoring system.',
          author: { 
            id: 'user1', 
            username: 'AstronautAlex', 
            avatar: '🚀', 
            level: 47 
          },
          difficulty: 'hard',
          tags: ['iss', 'rendezvous', 'challenge', 'precision'],
          likes: 142,
          downloads: 1027,
          rating: 4.8,
          missionData: {
            missionType: 'LEO Rendezvous',
            targetOrbit: {
              altitude: 408,
              inclination: 51.6,
              eccentricity: 0.001
            },
            estimatedDuration: '45-60 minutes',
            successRate: 73
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isFeatured: true,
          previewImage: 'iss-preview'
        },
        {
          id: 'm2',
          title: 'Mars Transfer Window Optimizer: Realistic Physics',
          description: 'Experience authentic Mars mission planning with real orbital mechanics, atmospheric entry challenges, and landing site selection.',
          author: { 
            id: 'user5', 
            username: 'MarsExplorer', 
            avatar: '🔴', 
            level: 61 
          },
          difficulty: 'expert',
          tags: ['mars', 'transfer', 'realistic', 'physics'],
          likes: 203,
          downloads: 456,
          rating: 4.9,
          missionData: {
            missionType: 'Interplanetary',
            targetOrbit: {
              altitude: 500,
              inclination: 0,
              eccentricity: 0.1
            },
            estimatedDuration: '2-3 hours',
            successRate: 34
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isFeatured: true
        },
        {
          id: 'm3',
          title: 'Asteroid Mining Operation: Resource Management',
          description: 'Lead a complex asteroid mining mission with resource extraction, processing, and transport challenges.',
          author: { 
            id: 'user6', 
            username: 'MiningMagnate', 
            avatar: '⛏️', 
            level: 34 
          },
          difficulty: 'medium',
          tags: ['asteroid', 'mining', 'resources', 'strategy'],
          likes: 78,
          downloads: 234,
          rating: 4.3,
          missionData: {
            missionType: 'Deep Space',
            targetOrbit: {
              altitude: 0,
              inclination: 15.2,
              eccentricity: 0.8
            },
            estimatedDuration: '90-120 minutes',
            successRate: 67
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      // Enhanced leaderboard with more stats
      setLeaderboard([
        {
          id: 'user1',
          username: 'AstronautAlex',
          avatar: '🚀',
          level: 47,
          stats: {
            reputation: 2450,
            postsCount: 34,
            likesReceived: 856,
            missionsShared: 12,
            followersCount: 189,
            totalPlayTime: '234h 56m',
            successfulMissions: 127
          },
          achievements: [
            { name: 'Mars Pioneer', icon: '🔴', rarity: 'legendary', description: 'First successful Mars landing' },
            { name: 'Community Leader', icon: '👨‍💼', rarity: 'epic', description: 'Helped 100+ new pilots' },
            { name: 'Mission Master', icon: '🎯', rarity: 'epic', description: 'Created 10+ popular missions' }
          ],
          isOnline: true
        },
        {
          id: 'user2',
          username: 'OrbitMaster',
          avatar: '🛰️',
          level: 52,
          stats: {
            reputation: 3180,
            postsCount: 67,
            likesReceived: 1234,
            missionsShared: 8,
            followersCount: 267,
            totalPlayTime: '312h 23m',
            successfulMissions: 189
          },
          achievements: [
            { name: 'Technical Expert', icon: '⚙️', rarity: 'epic', description: 'Master of orbital mechanics' },
            { name: 'Perfectionist', icon: '💎', rarity: 'rare', description: '99%+ mission success rate' }
          ],
          isOnline: true
        },
        {
          id: 'user5',
          username: 'MarsExplorer',
          avatar: '🔴',
          level: 61,
          stats: {
            reputation: 4890,
            postsCount: 89,
            likesReceived: 2134,
            missionsShared: 23,
            followersCount: 445,
            totalPlayTime: '567h 12m',
            successfulMissions: 234
          },
          achievements: [
            { name: 'Red Planet Conqueror', icon: '👑', rarity: 'legendary', description: 'Completed all Mars missions' },
            { name: 'Mission Creator', icon: '🎯', rarity: 'rare', description: 'Created 20+ missions' }
          ],
          isOnline: false,
          lastActive: '2h ago'
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [activeTab, forumCategory, missionDifficulty, leaderboardType]);

  // Enhanced filtering and sorting
  const filteredContent = useMemo(() => {
    let filtered: any[] = [];
    
    if (activeTab === 'forum') {
      filtered = forumPosts.filter(post => {
        const matchesCategory = forumCategory === 'all' || post.category === forumCategory;
        const matchesSearch = searchQuery === '' || 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      });
    } else if (activeTab === 'missions') {
      filtered = missionShares.filter(mission => {
        const matchesDifficulty = missionDifficulty === 'all' || mission.difficulty === missionDifficulty;
        const matchesSearch = searchQuery === '' ||
          mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mission.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesDifficulty && matchesSearch;
      });
    } else {
      filtered = leaderboard;
    }

    // Sort logic
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likes || b.stats?.reputation || 0) - (a.likes || a.stats?.reputation || 0));
    } else if (sortBy === 'trending') {
      filtered.sort((a, b) => ((b.views || 0) / Math.max(1, (Date.now() - new Date(b.createdAt || 0).getTime()) / (1000 * 60 * 60))) - 
                             ((a.views || 0) / Math.max(1, (Date.now() - new Date(a.createdAt || 0).getTime()) / (1000 * 60 * 60))));
    }

    return filtered;
  }, [activeTab, forumPosts, missionShares, leaderboard, forumCategory, missionDifficulty, searchQuery, sortBy]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getDifficultyConfig = (difficulty: string) => {
    const configs = {
      easy: { 
        color: 'bg-green-500/20 text-green-400 border-green-500/30', 
        gradient: 'from-green-500 to-emerald-600',
        icon: '🟢'
      },
      medium: { 
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        gradient: 'from-yellow-500 to-orange-500',
        icon: '🟡'
      },
      hard: { 
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        gradient: 'from-orange-500 to-red-500',
        icon: '🟠'
      },
      expert: { 
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        gradient: 'from-red-500 to-purple-600',
        icon: '🔴'
      },
    };
    return configs[difficulty as keyof typeof configs] || configs.easy;
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      general: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '💬' },
      missions: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🚀' },
      technical: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: '⚙️' },
      achievements: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🏆' },
      help: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '❓' },
    };
    return configs[category as keyof typeof configs] || configs.general;
  };

  const getRarityConfig = (rarity: string) => {
    const configs = {
      legendary: { color: 'text-yellow-400', glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' },
      epic: { color: 'text-purple-400', glow: 'drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]' },
      rare: { color: 'text-blue-400', glow: 'drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]' },
      common: { color: 'text-gray-400', glow: '' }
    };
    return configs[rarity as keyof typeof configs] || configs.common;
  };

  const getUserLevelColor = (level: number) => {
    if (level >= 50) return 'from-yellow-400 to-orange-500';
    if (level >= 30) return 'from-purple-400 to-pink-500';
    if (level >= 15) return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} ${themeClasses.text} relative overflow-hidden`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-20"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-20"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-25"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Enhanced Header with Parallax */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ y: headerY, opacity: headerOpacity }}
          className="text-center mb-12 relative"
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              SPACE COMMUNITY
            </h1>
          </motion.div>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Connect • Share • Explore • <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">Discover Together</span>
          </p>

          {/* Community Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8"
          >
            {[
              { label: 'Active Pilots', value: '2.4K', icon: '👨‍🚀' },
              { label: 'Missions Shared', value: '567', icon: '🚀' },
              { label: 'Forum Posts', value: '1.2K', icon: '💬' },
              { label: 'Online Now', value: '134', icon: '🟢' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-6 py-4 pl-12 rounded-2xl border ${themeClasses.input} bg-black/30 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ❌
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
            {[
              { key: 'forum', label: 'Forum', icon: '💬', count: forumPosts.length },
              { key: 'missions', label: 'Missions', icon: '🚀', count: missionShares.length },
              { key: 'leaderboard', label: 'Rankings', icon: '🏆', count: leaderboard.length }
            ].map(tab => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'forum' | 'missions' | 'leaderboard')}
                className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-black/30 backdrop-blur-sm text-gray-400 hover:text-white hover:bg-black/50 border border-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Filters and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center items-center mb-8"
        >
          {/* Category/Difficulty Filter */}
          <select
            value={activeTab === 'forum' ? forumCategory : missionDifficulty}
            onChange={(e) => activeTab === 'forum' ? setForumCategory(e.target.value) : setMissionDifficulty(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-black/30 backdrop-blur-sm text-white border-white/20 focus:ring-2 focus:ring-blue-500"
          >
            {activeTab === 'forum' ? (
              <>
                <option value="all">All Categories</option>
                <option value="general">💬 General</option>
                <option value="missions">🚀 Missions</option>
                <option value="technical">⚙️ Technical</option>
                <option value="achievements">🏆 Achievements</option>
                <option value="help">❓ Help</option>
              </>
            ) : activeTab === 'missions' ? (
              <>
                <option value="all">All Difficulties</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🟠 Hard</option>
                <option value="expert">🔴 Expert</option>
              </>
            ) : (
              <>
                <option value="reputation">🏆 Reputation</option>
                <option value="posts">📝 Posts</option>
                <option value="likes">❤️ Likes</option>
                <option value="missions">🚀 Missions</option>
                <option value="followers">👥 Followers</option>
              </>
            )}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-black/30 backdrop-blur-sm text-white border-white/20 focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">🕐 Newest</option>
            <option value="popular">🔥 Popular</option>
            <option value="trending">📈 Trending</option>
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-400 bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm">
            {filteredContent.length} results
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-16"
            >
              <div className="text-center space-y-6">
                <motion.div
                  className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div>
                  <p className="text-white font-semibold text-xl mb-2">Loading Community Data...</p>
                  <p className="text-gray-400">Connecting to space network</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'forum' && (
                <div className="space-y-8">
                  {/* Pinned Posts Section */}
                  {filteredContent.filter((post: ForumPost) => post.isPinned).length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                        📌 Pinned Posts
                      </h2>
                      <div className="grid gap-6">
                        {filteredContent.filter((post: ForumPost) => post.isPinned).map((post: ForumPost) => (
                          <motion.div key={post.id} layout>
                            <MobileCard hover className="p-6 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                              <ForumPostCard post={post} />
                            </MobileCard>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Posts */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      💬 Latest Discussions
                    </h2>
                    <div className="grid gap-6">
                      {filteredContent.filter((post: ForumPost) => !post.isPinned).map((post: ForumPost, index) => (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <MobileCard hover className="p-6 group">
                            <ForumPostCard post={post} />
                          </MobileCard>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'missions' && (
                <div className="space-y-8">
                  {/* Featured Missions */}
                  {filteredContent.filter((mission: MissionShare) => mission.isFeatured).length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                        ⭐ Featured Missions
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredContent.filter((mission: MissionShare) => mission.isFeatured).map((mission: MissionShare) => (
                          <motion.div key={mission.id} layout>
                            <MobileCard hover className="p-6 border border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                              <MissionCard mission={mission} />
                            </MobileCard>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Missions */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      🚀 Community Missions
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredContent.filter((mission: MissionShare) => !mission.isFeatured).map((mission: MissionShare, index) => (
                        <motion.div
                          key={mission.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <MobileCard hover className="p-6 group">
                            <MissionCard mission={mission} />
                          </MobileCard>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">🏆 Top Space Pilots</h2>
                    <p className="text-gray-400">Ranked by community contributions and achievements</p>
                  </div>

                  <div className="space-y-4">
                    {filteredContent.map((user: LeaderboardUser, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <MobileCard hover className="p-6 group">
                          <LeaderboardCard user={user} rank={index + 1} />
                        </MobileCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Floating Action Buttons */}
        <motion.div
          className="fixed bottom-6 right-6 flex flex-col space-y-3"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Main Create Button */}
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              boxShadow: ['0 10px 30px rgba(59, 130, 246, 0.3)', '0 20px 50px rgba(59, 130, 246, 0.5)', '0 10px 30px rgba(59, 130, 246, 0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ➕
          </motion.button>

          {/* Quick Actions */}
          <div className="flex flex-col space-y-2">
            {activeTab === 'forum' && (
              <motion.button
                className="w-12 h-12 bg-green-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                title="Create Post"
              >
                ✍️
              </motion.button>
            )}
            {activeTab === 'missions' && (
              <motion.button
                className="w-12 h-12 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                title="Upload Mission"
              >
                🚀
              </motion.button>
            )}
            <motion.button
              className="w-12 h-12 bg-orange-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-orange-700 transition-colors"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              title="Join Discord"
            >
              💬
            </motion.button>
          </div>
        </motion.div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Create Content</h3>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl text-left hover:bg-blue-600/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">✍️</span>
                      <div>
                        <div className="font-semibold text-blue-400">Create Forum Post</div>
                        <div className="text-sm text-gray-400">Share your thoughts and experiences</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl text-left hover:bg-purple-600/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🚀</span>
                      <div>
                        <div className="font-semibold text-purple-400">Upload Mission</div>
                        <div className="text-sm text-gray-400">Share your custom mission with the community</div>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-green-600/20 border border-green-500/30 rounded-xl text-left hover:bg-green-600/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <div className="font-semibold text-green-400">Create Tutorial</div>
                        <div className="text-sm text-gray-400">Help others learn with a guide</div>
                      </div>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Component for Forum Post Card
  function ForumPostCard({ post }: { post: ForumPost }) {
    const categoryConfig = getCategoryConfig(post.category);
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
            <div className="relative">
              <div className="text-3xl">{post.author.avatar}</div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getUserLevelColor(post.author.level)} rounded-full flex items-center justify-center text-xs font-bold text-black`}>
                {post.author.level}
              </div>
            </div>
            <div className="sm:min-w-0">
              <p className="font-bold text-sm truncate text-white">{post.author.username}</p>
              <p className="text-xs text-blue-400">{post.author.reputation.toLocaleString()} rep</p>
              <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs border font-semibold ${categoryConfig.color} flex items-center gap-1`}>
                {categoryConfig.icon} {post.category.toUpperCase()}
              </span>
              
              {post.isPinned && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold">
                  📌 PINNED
                </span>
              )}
              
              {post.isHot && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold animate-pulse">
                  🔥 HOT
                </span>
              )}
              
              {post.hasMedia && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs">
                  📷 MEDIA
                </span>
              )}
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold mb-3 line-clamp-2 text-white group-hover:text-blue-300 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">{post.content}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded-lg text-xs hover:bg-gray-600/40 transition-colors cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <motion.button
                  className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </motion.button>
                <span className="flex items-center space-x-2">
                  <span>👁️</span>
                  <span>{post.views.toLocaleString()}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>{post.replies}</span>
                </span>
              </div>
              
              <TouchButton size="sm" variant="secondary">
                Reply
              </TouchButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Component for Mission Card
  function MissionCard({ mission }: { mission: MissionShare }) {
    const difficultyConfig = getDifficultyConfig(mission.difficulty);
    
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="text-2xl">{mission.author.avatar}</div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r ${getUserLevelColor(mission.author.level)} rounded-full flex items-center justify-center text-xs font-bold text-black`}>
                {mission.author.level}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm text-white">{mission.author.username}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(mission.createdAt)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border font-bold ${difficultyConfig.color} flex items-center gap-1`}>
            {difficultyConfig.icon} {mission.difficulty.toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
            {mission.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{mission.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {mission.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded-lg text-xs">
                #{tag}
              </span>
            ))}
            {mission.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-lg text-xs">
                +{mission.tags.length - 3} more
              </span>
            )}
          </div>
          
          <div className="bg-black/30 rounded-xl p-3 mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-gray-400">
                <span className="text-blue-400 font-semibold">{mission.missionData.missionType}</span>
              </div>
              <div className="text-gray-400">
                Duration: <span className="text-green-400">{mission.missionData.estimatedDuration}</span>
              </div>
              <div className="text-gray-400">
                Altitude: <span className="text-purple-400">{mission.missionData.targetOrbit.altitude}km</span>
              </div>
              <div className="text-gray-400">
                Success: <span className="text-yellow-400">{mission.missionData.successRate}%</span>
              </div>
            </div>
            
            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(mission.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                  ⭐
                </span>
              ))}
              <span className="text-sm text-gray-400 ml-2">{mission.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <motion.button
              className="flex items-center space-x-1 hover:text-red-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>❤️</span>
              <span>{mission.likes}</span>
            </motion.button>
            <span className="flex items-center space-x-1">
              <span>📥</span>
              <span>{mission.downloads.toLocaleString()}</span>
            </span>
          </div>
          
          <TouchButton size="sm" variant="primary" className="bg-gradient-to-r from-blue-600 to-purple-600">
            Download
          </TouchButton>
        </div>
      </div>
    );
  }

  // Component for Leaderboard Card  
  function LeaderboardCard({ user, rank }: { user: LeaderboardUser; rank: number }) {
    const getRankColor = (rank: number) => {
      if (rank === 1) return 'from-yellow-400 to-yellow-600';
      if (rank === 2) return 'from-gray-300 to-gray-500';
      if (rank === 3) return 'from-orange-400 to-orange-600';
      return 'from-blue-500 to-purple-600';
    };
    
    const getRankIcon = (rank: number) => {
      if (rank === 1) return '👑';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '🏆';
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 relative">
            <div className={`w-16 h-16 bg-gradient-to-br ${getRankColor(rank)} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
              #{rank}
            </div>
            <div className="absolute -top-1 -right-1 text-2xl">
              {getRankIcon(rank)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="text-4xl">{user.avatar}</div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getUserLevelColor(user.level)} rounded-full flex items-center justify-center text-xs font-bold text-black`}>
                {user.level}
              </div>
              {user.isOnline && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl truncate text-white flex items-center gap-2">
                {user.username}
                {user.isOnline ? (
                  <span className="text-green-400 text-sm">🟢 Online</span>
                ) : (
                  <span className="text-gray-400 text-sm">🔘 {user.lastActive}</span>
                )}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mt-2">
                <div>
                  <span className="text-purple-400 font-bold">{user.stats.reputation.toLocaleString()}</span>
                  <div className="text-xs">Reputation</div>
                </div>
                <div>
                  <span className="text-blue-400 font-bold">{user.stats.successfulMissions}</span>
                  <div className="text-xs">Missions</div>
                </div>
                <div>
                  <span className="text-green-400 font-bold">{user.stats.likesReceived.toLocaleString()}</span>
                  <div className="text-xs">Likes</div>
                </div>
                <div>
                  <span className="text-orange-400 font-bold">{user.stats.totalPlayTime}</span>
                  <div className="text-xs">Play Time</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-1">
              {user.achievements.slice(0, 3).map((achievement, i) => {
                const rarityConfig = getRarityConfig(achievement.rarity);
                return (
                  <motion.div 
                    key={i}
                    className={`text-xl ${rarityConfig.color} ${rarityConfig.glow} cursor-pointer`}
                    title={`${achievement.name}: ${achievement.description}`}
                    whileHover={{ scale: 1.2 }}
                  >
                    {achievement.icon}
                  </motion.div>
                );
              })}
            </div>
            {user.achievements.length > 3 && (
              <span className="text-xs text-gray-400">+{user.achievements.length - 3} more</span>
            )}
            
            <TouchButton size="sm" variant="secondary">
              View Profile
            </TouchButton>
          </div>
        </div>
      </div>
    );
  }
}