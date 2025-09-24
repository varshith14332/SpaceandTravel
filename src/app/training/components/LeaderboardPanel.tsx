import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  completionTime: number; // in seconds
  module: string;
  avatar: string;
}

const LeaderboardPanel: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    // Mock leaderboard data - in real app, fetch from API
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'Commander Sarah',
        score: 95,
        completionTime: 720, // 12 minutes
        module: 'zero-gravity',
        avatar: '👩‍🚀'
      },
      {
        id: '2', 
        name: 'Pilot Marcus',
        score: 88,
        completionTime: 840, // 14 minutes
        module: 'oxygen-management',
        avatar: '👨‍🚀'
      },
      {
        id: '3',
        name: 'Specialist Anna',
        score: 92,
        completionTime: 900, // 15 minutes
        module: 'emergency-response',
        avatar: '👩‍🚀'
      },
      {
        id: '4',
        name: 'Captain Chen',
        score: 85,
        completionTime: 960, // 16 minutes
        module: 'zero-gravity',
        avatar: '👨‍🚀'
      },
      {
        id: '5',
        name: 'You',
        score: 78,
        completionTime: 1080, // 18 minutes
        module: 'zero-gravity',
        avatar: '🧑‍🚀'
      }
    ];
    
    setLeaderboard(mockData);
  }, []);

  const filteredLeaderboard = selectedModule === 'all' 
    ? leaderboard.sort((a, b) => b.score - a.score)
    : leaderboard
        .filter(entry => entry.module === selectedModule)
        .sort((a, b) => b.score - a.score);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModuleDisplayName = (key: string) => {
    switch (key) {
      case 'zero-gravity': return 'Zero-G Nav';
      case 'oxygen-management': return 'O2 Management';
      case 'emergency-response': return 'Emergency';
      default: return key;
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-center text-yellow-400">
        🏆 Mission Leaderboard
      </h3>

      {/* Filter Buttons */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setSelectedModule('all')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedModule === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Modules
          </button>
          <button
            onClick={() => setSelectedModule('zero-gravity')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedModule === 'zero-gravity'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Zero-G
          </button>
          <button
            onClick={() => setSelectedModule('oxygen-management')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedModule === 'oxygen-management'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            O2 Mgmt
          </button>
          <button
            onClick={() => setSelectedModule('emergency-response')}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              selectedModule === 'emergency-response'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Emergency
          </button>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredLeaderboard.slice(0, 10).map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              entry.name === 'You'
                ? 'bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500'
                : 'bg-gray-900 hover:bg-gray-750'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getRankEmoji(index + 1)}</span>
                <span className="text-xs text-gray-400 min-w-[20px]">
                  #{index + 1}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg">{entry.avatar}</span>
                <div>
                  <div className={`font-semibold text-sm ${
                    entry.name === 'You' ? 'text-purple-300' : 'text-white'
                  }`}>
                    {entry.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getModuleDisplayName(entry.module)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-sm text-green-400">
                {entry.score}%
              </div>
              <div className="text-xs text-gray-400">
                {formatTime(entry.completionTime)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <div className="font-bold text-purple-300">
              {filteredLeaderboard.findIndex(e => e.name === 'You') + 1 || 'N/A'}
            </div>
            <div className="text-gray-400">Your Rank</div>
          </div>
          <div>
            <div className="font-bold text-blue-300">
              {filteredLeaderboard.length > 0 ? Math.max(...filteredLeaderboard.map(e => e.score)) : 0}%
            </div>
            <div className="text-gray-400">Top Score</div>
          </div>
          <div>
            <div className="font-bold text-green-300">
              {filteredLeaderboard.length}
            </div>
            <div className="text-gray-400">Competitors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;