import React from 'react';

interface ProgressTrackerProps {
  progress: {
    completedModules: number;
    totalXP: number;
    badges: string[];
    accuracy: number;
  };
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress }) => {
  const totalModules = 3; // Zero Gravity, Oxygen Management, Emergency Response
  const progressPercentage = (progress.completedModules / totalModules) * 100;
  
  const getXPLevel = (xp: number) => {
    if (xp < 100) return { level: 1, name: 'Cadet' };
    if (xp < 300) return { level: 2, name: 'Trainee' };
    if (xp < 600) return { level: 3, name: 'Pilot' };
    if (xp < 1000) return { level: 4, name: 'Commander' };
    return { level: 5, name: 'Mission Specialist' };
  };

  const currentLevel = getXPLevel(progress.totalXP);

  return (
    <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-xl p-6 mb-8">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold mb-2">Mission Progress</h3>
        <div className="flex items-center justify-center gap-4 text-lg">
          <span className="bg-purple-600 px-3 py-1 rounded-full">
            Level {currentLevel.level} - {currentLevel.name}
          </span>
          <span className="text-yellow-400 font-bold">
            {progress.totalXP} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Modules Completed</span>
          <span>{progress.completedModules}/{totalModules}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-black bg-opacity-30 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{progress.accuracy}%</div>
          <div className="text-xs text-gray-300">Mission Accuracy</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{progress.badges.length}</div>
          <div className="text-xs text-gray-300">Badges Earned</div>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-400">{Math.round((progress.completedModules / totalModules) * 100)}%</div>
          <div className="text-xs text-gray-300">Training Complete</div>
        </div>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-600">
          <h4 className="text-sm font-semibold mb-2 text-center">Recent Achievements</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {progress.badges.map((badge, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold"
              >
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;