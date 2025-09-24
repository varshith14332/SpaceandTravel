'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Footer from '@/components/Footer';
import ZeroGravityGame from './components/ZeroGravityGame';
import OxygenManagementGame from './components/OxygenManagementGame';
import EmergencyResponseGame from './components/EmergencyResponseGame';
import ProgressTracker from './components/ProgressTracker';
import LeaderboardPanel from './components/LeaderboardPanel';
import LearningStats from './components/LearningStats';

interface TrainingModule {
  key: string;
  title: string;
  description: string;
  category: 'navigation' | 'life-support' | 'emergency' | 'general';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  objectives: string[];
  status: 'active' | 'retired';
  _id: string;
}

interface TrainingSession {
  _id: string;
  userId: string;
  moduleKey: string;
  startedAt: string;
  completedAt?: string;
  score?: number;
  progress?: number;
  events: Array<{ t: string; type: string; payload?: any }>;
}

const TrainingPage = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [userProgress, setUserProgress] = useState({
    completedModules: 0,
    totalXP: 0,
    badges: [] as string[],
    accuracy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
    fetchUserProgress();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/training/modules');
      const data = await response.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    // TODO: Fetch user progress from API
    setUserProgress({
      completedModules: 1,
      totalXP: 250,
      badges: ['Zero-G Navigator'],
      accuracy: 85
    });
  };

  const startTraining = async (moduleKey: string) => {
    console.log('Starting training for module:', moduleKey);
    
    try {
      const response = await fetch('/api/training/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleKey })
      });
      
      console.log('Start training response status:', response.status);
      const data = await response.json();
      console.log('Start training response data:', data);
      
      if (data.success) {
        setCurrentSession(data.data);
        setCurrentModule(moduleKey);
        console.log('Training started successfully, session:', data.data);
      } else {
        console.error('Failed to start training:', data.message);
        alert(`Failed to start training: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to start training:', error);
      alert(`Error starting training: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const completeTraining = async (score: number) => {
    if (!currentSession) {
      console.error('No current session found');
      alert('Error: No active training session found');
      return;
    }
    
    console.log('Completing training with score:', score, 'Session ID:', currentSession._id);
    
    try {
      const response = await fetch(`/api/training/sessions/${currentSession._id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        alert(`Training completed successfully! Score: ${score}`);
        
        // Update user progress
        setUserProgress(prev => ({
          ...prev,
          completedModules: prev.completedModules + 1,
          totalXP: prev.totalXP + score,
          accuracy: Math.round((prev.accuracy * prev.completedModules + score) / (prev.completedModules + 1))
        }));
        
        setCurrentModule(null);
        setCurrentSession(null);
        fetchModules(); // Refresh to show updated status
      } else {
        console.error('Training completion failed:', data.message);
        alert(`Failed to complete training: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to complete training:', error);
      alert(`Error completing training: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '🌱';
      case 'Intermediate': return '🚀';
      case 'Advanced': return '💫';
      default: return '📖';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return '🧭';
      case 'life-support': return '🫁';
      case 'emergency': return '🚨';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Training Modules...</div>
      </div>
    );
  }

  // Render current training game
  if (currentModule && currentSession) {
    const module = modules.find(m => m.key === currentModule);
    if (!module) return null;

    switch (currentModule) {
      case 'zero-gravity':
        return <ZeroGravityGame module={module} session={currentSession} onComplete={completeTraining} />;
      case 'oxygen-management':
        return <OxygenManagementGame module={module} session={currentSession} onComplete={completeTraining} />;
      case 'emergency-response':
        return <EmergencyResponseGame module={module} session={currentSession} onComplete={completeTraining} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎮 Astronaut Training Academy
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Master essential space skills through immersive simulations
          </p>
          
          {/* Progress Tracker */}
          <ProgressTracker progress={userProgress} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Training Modules */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold mb-6 text-center">Training Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {modules.map((module) => (
                <Card
                  key={module._id}
                  className="group hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 hover:border-purple-500"
                  onClick={() => startTraining(module.key)}
                >
                  <div className="p-6">
                    {/* Module Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(module.category)}</span>
                        <span className="text-2xl">{getDifficultyIcon(module.difficulty)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </div>
                    </div>

                    {/* Module Content */}
                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                      {module.description}
                    </p>

                    {/* Objectives */}
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 text-sm text-gray-400">Mission Objectives:</h4>
                      <ul className="space-y-1">
                        {module.objectives.map((objective, index) => (
                          <li key={index} className="text-xs text-gray-300 flex items-center">
                            <span className="text-green-400 mr-2">✓</span>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="mr-2">⏱️</span>
                        {module.estimatedMinutes} min
                      </div>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          startTraining(module.key);
                        }}
                      >
                        Launch 🚀
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Learning Stats */}
            <LearningStats stats={userProgress} />
            
            {/* Leaderboard */}
            <LeaderboardPanel />
          </div>
        </div>

        {/* NASA Protocol Badge */}
        <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold">NASA Protocols Followed</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-sm text-blue-100">
            All training modules follow authentic NASA procedures and safety protocols
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrainingPage;