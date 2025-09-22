'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  };
  category: 'general' | 'missions' | 'technical' | 'achievements' | 'help';
  tags: string[];
  likes: number;
  views: number;
  replies: number;
  createdAt: string;
}

interface MissionShare {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  likes: number;
  downloads: number;
  missionData: {
    missionType: string;
    targetOrbit: {
      altitude: number;
      inclination: number;
      eccentricity: number;
    };
  };
  createdAt: string;
}

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  stats: {
    reputation: number;
    postsCount: number;
    likesReceived: number;
    missionsShared: number;
    followersCount: number;
  };
  achievements: Array<{
    name: string;
    icon: string;
    rarity: string;
  }>;
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

  // Mock data for demo
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock forum posts
      setForumPosts([
        {
          id: '1',
          title: 'Successfully completed Mars mission simulation!',
          content: 'Just finished my first Mars mission with a 95% success rate. The key was optimizing the fuel consumption during the trans-Mars injection burn...',
          author: { id: 'user1', username: 'AstronautAlex', avatar: '🚀' },
          category: 'achievements',
          tags: ['mars', 'mission', 'success'],
          likes: 24,
          views: 156,
          replies: 8,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Tips for optimizing orbital insertion burns',
          content: 'After many simulations, I\'ve found some techniques that consistently improve orbital accuracy...',
          author: { id: 'user2', username: 'OrbitMaster', avatar: '🛰️' },
          category: 'technical',
          tags: ['orbital-mechanics', 'tips', 'efficiency'],
          likes: 31,
          views: 203,
          replies: 12,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'New to the platform - seeking guidance',
          content: 'Hi everyone! Just joined and wondering what are the best missions to start with?',
          author: { id: 'user3', username: 'SpaceNewbie', avatar: '👨‍🚀' },
          category: 'help',
          tags: ['beginner', 'help'],
          likes: 18,
          views: 89,
          replies: 15,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]);

      // Mock mission shares
      setMissionShares([
        {
          id: 'm1',
          title: 'Perfect ISS Rendezvous Challenge',
          description: 'A precisely crafted mission that requires perfect timing and fuel management to rendezvous with the ISS.',
          author: { id: 'user1', username: 'AstronautAlex', avatar: '🚀' },
          difficulty: 'hard',
          tags: ['iss', 'rendezvous', 'challenge'],
          likes: 42,
          downloads: 127,
          missionData: {
            missionType: 'LEO',
            targetOrbit: {
              altitude: 408,
              inclination: 51.6,
              eccentricity: 0.001
            }
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'm2',
          title: 'Mars Transfer Window Optimizer',
          description: 'Demonstrates the optimal launch window and trajectory for Mars missions using realistic delta-V calculations.',
          author: { id: 'user4', username: 'MarsExplorer', avatar: '🔴' },
          difficulty: 'expert',
          tags: ['mars', 'transfer', 'optimization'],
          likes: 67,
          downloads: 89,
          missionData: {
            missionType: 'MARS',
            targetOrbit: {
              altitude: 500,
              inclination: 0,
              eccentricity: 0.1
            }
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      // Mock leaderboard
      setLeaderboard([
        {
          id: 'user1',
          username: 'AstronautAlex',
          avatar: '🚀',
          stats: {
            reputation: 2450,
            postsCount: 34,
            likesReceived: 156,
            missionsShared: 12,
            followersCount: 89
          },
          achievements: [
            { name: 'Mars Pioneer', icon: '🔴', rarity: 'legendary' },
            { name: 'Community Leader', icon: '👨‍💼', rarity: 'epic' }
          ]
        },
        {
          id: 'user2',
          username: 'OrbitMaster',
          avatar: '🛰️',
          stats: {
            reputation: 2180,
            postsCount: 28,
            likesReceived: 134,
            missionsShared: 8,
            followersCount: 67
          },
          achievements: [
            { name: 'Technical Expert', icon: '⚙️', rarity: 'epic' }
          ]
        },
        {
          id: 'user4',
          username: 'MarsExplorer',
          avatar: '🔴',
          stats: {
            reputation: 1890,
            postsCount: 22,
            likesReceived: 98,
            missionsShared: 15,
            followersCount: 45
          },
          achievements: [
            { name: 'Mission Creator', icon: '🎯', rarity: 'rare' }
          ]
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, [activeTab, forumCategory, missionDifficulty, leaderboardType]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'missions': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'technical': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'achievements': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'help': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
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
            Space Community
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            Connect with fellow space enthusiasts, share missions, and learn together
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8"
        >
          {[
            { key: 'forum', label: 'Forum', icon: '💬' },
            { key: 'missions', label: 'Shared Missions', icon: '🚀' },
            { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
          ].map(tab => (
            <TouchButton
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'forum' | 'missions' | 'leaderboard')}
              variant={activeTab === tab.key ? 'primary' : 'secondary'}
              className="flex items-center space-x-2"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </TouchButton>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400">Loading community content...</p>
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
                <div className="space-y-6">
                  {/* Forum Filters */}
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <select
                      value={forumCategory}
                      onChange={(e) => setForumCategory(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${themeClasses.input} touch-manipulation`}
                    >
                      <option value="all">All Categories</option>
                      <option value="general">General</option>
                      <option value="missions">Missions</option>
                      <option value="technical">Technical</option>
                      <option value="achievements">Achievements</option>
                      <option value="help">Help</option>
                    </select>
                  </div>

                  {/* Forum Posts */}
                  <div className="grid gap-6">
                    {forumPosts.map(post => (
                      <MobileCard key={post.id} hover className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 sm:text-center">
                            <div className="text-2xl">{post.author.avatar}</div>
                            <div className="sm:min-w-0">
                              <p className="font-semibold text-sm truncate">{post.author.username}</p>
                              <p className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(post.category)}`}>
                                {post.category}
                              </span>
                              {post.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            
                            <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-gray-400 mb-4 line-clamp-3">{post.content}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <span>👍</span>
                                <span>{post.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>👁️</span>
                                <span>{post.views}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>💬</span>
                                <span>{post.replies}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </MobileCard>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'missions' && (
                <div className="space-y-6">
                  {/* Mission Filters */}
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <select
                      value={missionDifficulty}
                      onChange={(e) => setMissionDifficulty(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${themeClasses.input} touch-manipulation`}
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  {/* Mission Shares */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {missionShares.map(mission => (
                      <MobileCard key={mission.id} hover className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{mission.author.avatar}</div>
                              <div>
                                <p className="font-semibold text-sm">{mission.author.username}</p>
                                <p className="text-xs text-gray-400">{formatTimeAgo(mission.createdAt)}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(mission.difficulty)}`}>
                              {mission.difficulty.toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-bold mb-2">{mission.title}</h3>
                            <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {mission.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                              <div>Mission: {mission.missionData.missionType}</div>
                              <div>Altitude: {mission.missionData.targetOrbit.altitude}km</div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <span>❤️</span>
                                  <span>{mission.likes}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <span>📥</span>
                                  <span>{mission.downloads}</span>
                                </span>
                              </div>
                              
                              <TouchButton size="sm" variant="primary">
                                Download
                              </TouchButton>
                            </div>
                          </div>
                        </div>
                      </MobileCard>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <div className="space-y-6">
                  {/* Leaderboard Filters */}
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    <select
                      value={leaderboardType}
                      onChange={(e) => setLeaderboardType(e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${themeClasses.input} touch-manipulation`}
                    >
                      <option value="reputation">Reputation</option>
                      <option value="posts">Posts</option>
                      <option value="likes">Likes Received</option>
                      <option value="missions">Missions Shared</option>
                      <option value="followers">Followers</option>
                    </select>
                  </div>

                  {/* Leaderboard */}
                  <div className="space-y-4">
                    {leaderboard.map((user, index) => (
                      <MobileCard key={user.id} hover className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              #{index + 1}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="text-2xl">{user.avatar}</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate">{user.username}</h3>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                                <span>Rep: {user.stats.reputation}</span>
                                <span>Posts: {user.stats.postsCount}</span>
                                <span>Likes: {user.stats.likesReceived}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            {user.achievements.slice(0, 3).map((achievement, i) => (
                              <div 
                                key={i}
                                className={`text-lg ${getRarityColor(achievement.rarity)}`}
                                title={achievement.name}
                              >
                                {achievement.icon}
                              </div>
                            ))}
                          </div>
                        </div>
                      </MobileCard>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Content Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          {activeTab === 'forum' && (
            <TouchButton
              variant="primary"
              className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            >
              ✍️
            </TouchButton>
          )}
          {activeTab === 'missions' && (
            <TouchButton
              variant="primary"  
              className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
            >
              🚀
            </TouchButton>
          )}
        </div>
      </div>
    </div>
  );
}