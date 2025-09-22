'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme, getThemeClasses } from '@/contexts/ThemeContext';
import MobileCard from '@/components/MobileCard';
import TouchButton from '@/components/TouchButton';

interface MissionDetails {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: string;
  objectives: string[];
  requirements: string[];
  rewards: {
    xp: number;
    badges: string[];
  };
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export default function MissionDetailsPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [mission, setMission] = useState<MissionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading mission data
    const loadMission = async () => {
      setIsLoading(true);
      try {
        // Mock mission data - in real app this would come from API
        const mockMission: MissionDetails = {
          id: id as string,
          title: `Mission ${id}`,
          description: `This is a detailed description of mission ${id}. Complete various orbital maneuvers and achieve mission objectives.`,
          difficulty: 'medium',
          duration: '45 minutes',
          objectives: [
            'Launch rocket successfully',
            'Achieve stable orbit',
            'Complete payload deployment',
            'Return to Earth safely'
          ],
          requirements: [
            'Complete basic training modules',
            'Have sufficient fuel reserves',
            'Pass pre-flight checks'
          ],
          rewards: {
            xp: 500,
            badges: ['Orbital Pioneer', 'Mission Commander']
          },
          status: 'available'
        };
        
        setMission(mockMission);
      } catch (error) {
        console.error('Error loading mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadMission();
    }
  }, [id]);

  const handleStartMission = () => {
    // Navigate to mission simulator
    window.location.href = '/missions';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 ${themeClasses.background} ${themeClasses.text}`}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className={`min-h-screen p-4 ${themeClasses.background} ${themeClasses.text}`}>
        <div className="max-w-4xl mx-auto">
          <MobileCard className="p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Mission Not Found</h1>
            <p className="text-gray-400 mb-4">The requested mission could not be found.</p>
            <TouchButton 
              onClick={() => window.location.href = '/missions'}
              variant="primary"
            >
              Back to Missions
            </TouchButton>
          </MobileCard>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`min-h-screen p-4 ${themeClasses.background} ${themeClasses.text}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <TouchButton 
            onClick={() => window.location.href = '/missions'}
            variant="secondary"
            className="mb-4"
          >
            ← Back to Missions
          </TouchButton>
          
          <h1 className="text-3xl font-bold mb-2">{mission.title}</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
            </span>
            <span className="text-gray-400">⏱️ {mission.duration}</span>
            <span className="text-gray-400">🏆 {mission.rewards.xp} XP</span>
          </div>
        </motion.div>

        {/* Mission Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <MobileCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Mission Overview</h2>
              <p className="text-gray-300 leading-relaxed">{mission.description}</p>
            </MobileCard>

            {/* Objectives */}
            <MobileCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Mission Objectives</h2>
              <ul className="space-y-2">
                {mission.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <span className="text-blue-400">✓</span>
                    <span className="text-gray-300">{objective}</span>
                  </li>
                ))}
              </ul>
            </MobileCard>

            {/* Requirements */}
            <MobileCard className="p-6">
              <h2 className="text-xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {mission.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-gray-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            </MobileCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mission Status */}
            <MobileCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Mission Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-medium">
                    {mission.status.replace('_', ' ').charAt(0).toUpperCase() + mission.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Difficulty:</span>
                  <span className={getDifficultyColor(mission.difficulty)}>
                    {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration:</span>
                  <span>{mission.duration}</span>
                </div>
              </div>
            </MobileCard>

            {/* Rewards */}
            <MobileCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Mission Rewards</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Experience:</span>
                  <span className="text-blue-400 font-medium">{mission.rewards.xp} XP</span>
                </div>
                <div className="space-y-2">
                  <span className="text-gray-400">Badges:</span>
                  {mission.rewards.badges.map((badge, index) => (
                    <div key={index} className="bg-gray-700 rounded px-3 py-1 text-sm">
                      🏅 {badge}
                    </div>
                  ))}
                </div>
              </div>
            </MobileCard>

            {/* Action Button */}
            <TouchButton
              onClick={handleStartMission}
              variant="primary"
              className="w-full"
              disabled={mission.status === 'locked'}
            >
              {mission.status === 'locked' ? '🔒 Locked' : 
               mission.status === 'completed' ? '✓ Completed' :
               mission.status === 'in_progress' ? 'Continue Mission' :
               '🚀 Start Mission'}
            </TouchButton>
          </div>
        </div>
      </div>
    </div>
  );
}
