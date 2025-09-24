import React from 'react';

interface LearningStatsProps {
  stats: {
    completedModules: number;
    totalXP: number;
    badges: string[];
    accuracy: number;
  };
}

const LearningStats: React.FC<LearningStatsProps> = ({ stats }) => {
  const mockStats = {
    trainingTime: 120, // minutes
    completionRate: Math.round((stats.completedModules / 3) * 100),
    nasaProtocolsFollowed: stats.accuracy > 80,
    avgSessionTime: 25, // minutes
    streakDays: 3,
    totalSessions: 5
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-center text-purple-400">
        📊 Learning Analytics
      </h3>
      
      <div className="space-y-4">
        {/* Training Time */}
        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">⏱️</span>
            <span className="text-sm">Training Time</span>
          </div>
          <span className="font-bold text-blue-300">
            {Math.floor(mockStats.trainingTime / 60)}h {mockStats.trainingTime % 60}m
          </span>
        </div>

        {/* Completion Rate */}
        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-400">📈</span>
            <span className="text-sm">Completion %</span>
          </div>
          <span className="font-bold text-green-300">
            {mockStats.completionRate}%
          </span>
        </div>

        {/* Mission Accuracy */}
        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🎯</span>
            <span className="text-sm">Accuracy</span>
          </div>
          <span className="font-bold text-yellow-300">
            {stats.accuracy}%
          </span>
        </div>

        {/* Session Streak */}
        <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🔥</span>
            <span className="text-sm">Daily Streak</span>
          </div>
          <span className="font-bold text-orange-300">
            {mockStats.streakDays} days
          </span>
        </div>

        {/* NASA Protocol Compliance */}
        <div className="p-3 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg border border-blue-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-sm">NASA Protocols</span>
          </div>
          <div className="text-center">
            {mockStats.nasaProtocolsFollowed ? (
              <div className="text-green-400 font-bold">
                ✅ FOLLOWED
              </div>
            ) : (
              <div className="text-red-400 font-bold">
                ⚠️ REVIEW NEEDED
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="font-bold text-purple-300">{mockStats.totalSessions}</div>
              <div className="text-gray-400">Sessions</div>
            </div>
            <div className="bg-gray-900 p-2 rounded text-center">
              <div className="font-bold text-blue-300">{mockStats.avgSessionTime}m</div>
              <div className="text-gray-400">Avg Time</div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold mb-3 text-gray-300">Mission Insights</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-400">•</span>
              <span className="text-gray-300">Strong zero-gravity navigation skills</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              <span className="text-gray-300">Emergency response could improve</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">•</span>
              <span className="text-gray-300">Ready for advanced modules</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningStats;