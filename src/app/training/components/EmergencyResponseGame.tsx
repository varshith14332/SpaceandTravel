import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/Button';

interface TrainingModule {
  key: string;
  title: string;
  description: string;
  objectives: string[];
  difficulty: string;
  estimatedMinutes: number;
}

interface TrainingSession {
  _id: string;
  userId: string;
  moduleKey: string;
  startedAt: string;
  progress?: number;
}

interface EmergencyResponseGameProps {
  module: TrainingModule;
  session: TrainingSession;
  onComplete: (score: number) => void;
}

interface EmergencyStep {
  id: string;
  title: string;
  description: string;
  correctSequence: number;
  completed: boolean;
  timeLimit: number;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
}

const EmergencyResponseGame: React.FC<EmergencyResponseGameProps> = ({ module, session, onComplete }) => {
  const [gameState, setGameState] = useState<'instructions' | 'emergency' | 'completed' | 'failed'>('instructions');
  const [currentEmergency, setCurrentEmergency] = useState<'fire' | 'decompression' | 'power-failure'>('fire');
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds per emergency
  const [score, setScore] = useState(100);
  const [emergencySteps, setEmergencySteps] = useState<EmergencyStep[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [emergenciesCompleted, setEmergenciesCompleted] = useState(0);
  const [systemStatus, setSystemStatus] = useState({
    fire: false,
    power: true,
    pressure: 100,
    crew: 'stable'
  });

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Emergency scenarios
  const emergencyScenarios = {
    fire: {
      title: 'System Fire in Oxygen Generator',
      description: 'Electrical fire detected in life support oxygen generation system',
      steps: [
        {
          id: 'isolate-fire',
          title: 'Isolate Fire Source',
          description: 'Cut power to affected oxygen generator module',
          correctSequence: 1,
          completed: false,
          timeLimit: 10,
          criticalityLevel: 'critical' as const
        },
        {
          id: 'close-hatch',
          title: 'Close Compartment Hatch',
          description: 'Seal the compartment to prevent fire spread',
          correctSequence: 2,
          completed: false,
          timeLimit: 8,
          criticalityLevel: 'high' as const
        },
        {
          id: 'reroute-power',
          title: 'Reroute Power Systems',
          description: 'Switch to backup oxygen generation system',
          correctSequence: 3,
          completed: false,
          timeLimit: 12,
          criticalityLevel: 'high' as const
        },
        {
          id: 'stabilize-crew',
          title: 'Stabilize Crew',
          description: 'Check crew vital signs and provide medical support',
          correctSequence: 4,
          completed: false,
          timeLimit: 15,
          criticalityLevel: 'medium' as const
        }
      ]
    },
    decompression: {
      title: 'Rapid Decompression Event',
      description: 'Hull breach detected - pressure dropping rapidly',
      steps: [
        {
          id: 'emergency-oxygen',
          title: 'Emergency Oxygen Masks',
          description: 'Deploy and secure crew oxygen supply immediately',
          correctSequence: 1,
          completed: false,
          timeLimit: 5,
          criticalityLevel: 'critical' as const
        },
        {
          id: 'close-hatch',
          title: 'Emergency Hatch Seal',
          description: 'Close all hatches to isolate breached compartment',
          correctSequence: 2,
          completed: false,
          timeLimit: 8,
          criticalityLevel: 'critical' as const
        },
        {
          id: 'stabilize-pressure',
          title: 'Stabilize Pressure',
          description: 'Activate emergency pressure restoration system',
          correctSequence: 3,
          completed: false,
          timeLimit: 10,
          criticalityLevel: 'high' as const
        },
        {
          id: 'crew-medical',
          title: 'Crew Medical Assessment',
          description: 'Check crew for decompression injuries',
          correctSequence: 4,
          completed: false,
          timeLimit: 12,
          criticalityLevel: 'medium' as const
        }
      ]
    },
    'power-failure': {
      title: 'Critical Power System Failure',
      description: 'Primary power systems offline - life support compromised',
      steps: [
        {
          id: 'backup-power',
          title: 'Activate Backup Power',
          description: 'Switch to emergency battery systems immediately',
          correctSequence: 1,
          completed: false,
          timeLimit: 8,
          criticalityLevel: 'critical' as const
        },
        {
          id: 'priority-systems',
          title: 'Prioritize Critical Systems',
          description: 'Allocate power to life support and navigation only',
          correctSequence: 2,
          completed: false,
          timeLimit: 10,
          criticalityLevel: 'high' as const
        },
        {
          id: 'diagnose-failure',
          title: 'Diagnose Power Failure',
          description: 'Identify and assess primary power system damage',
          correctSequence: 3,
          completed: false,
          timeLimit: 15,
          criticalityLevel: 'medium' as const
        },
        {
          id: 'restore-systems',
          title: 'Restore Non-Critical Systems',
          description: 'Gradually bring secondary systems back online',
          correctSequence: 4,
          completed: false,
          timeLimit: 20,
          criticalityLevel: 'low' as const
        }
      ]
    }
  };

  useEffect(() => {
    if (gameState === 'emergency') {
      const scenario = emergencyScenarios[currentEmergency];
      setEmergencySteps(scenario.steps.map(step => ({ ...step, completed: false })));
      setCurrentStepIndex(0);
      setPlayerSequence([]);
      
      // Set system status based on emergency type
      if (currentEmergency === 'fire') {
        setSystemStatus({ fire: true, power: true, pressure: 100, crew: 'at risk' });
      } else if (currentEmergency === 'decompression') {
        setSystemStatus({ fire: false, power: true, pressure: 30, crew: 'critical' });
      } else {
        setSystemStatus({ fire: false, power: false, pressure: 100, crew: 'at risk' });
      }

      // Start countdown timer
      setTimeLeft(45);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, currentEmergency]);

  const executeStep = (stepId: string) => {
    const step = emergencySteps.find(s => s.id === stepId);
    if (!step) return;

    const newPlayerSequence = [...playerSequence, stepId];
    setPlayerSequence(newPlayerSequence);

    const expectedStep = emergencySteps[currentStepIndex];
    
    if (step.id === expectedStep.id) {
      // Correct step
      setEmergencySteps(prev => 
        prev.map(s => s.id === stepId ? { ...s, completed: true } : s)
      );
      
      // Time bonus for quick action
      const timeBonus = Math.max(0, step.timeLimit - (45 - timeLeft));
      if (timeBonus > 0) {
        setScore(prev => Math.min(100, prev + timeBonus));
      }
      
      // Update system status based on completed step
      updateSystemStatus(stepId);
      
      const nextIndex = currentStepIndex + 1;
      if (nextIndex >= emergencySteps.length) {
        // All steps completed successfully
        const completionBonus = 20;
        setScore(prev => Math.min(100, prev + completionBonus));
        
        if (emergenciesCompleted < 2) {
          // Move to next emergency
          setEmergenciesCompleted(prev => prev + 1);
          const nextEmergency = emergenciesCompleted === 0 ? 'decompression' : 'power-failure';
          setCurrentEmergency(nextEmergency);
          // Reset for next emergency (gameState change will trigger useEffect)
        } else {
          // All emergencies completed
          setGameState('completed');
        }
      } else {
        setCurrentStepIndex(nextIndex);
      }
    } else {
      // Wrong step - penalty
      setScore(prev => Math.max(0, prev - 15));
      
      // Show warning about incorrect sequence
      setTimeout(() => {
        // Allow player to continue but with reduced score
      }, 1000);
    }
  };

  const updateSystemStatus = (stepId: string) => {
    switch (stepId) {
      case 'isolate-fire':
        setSystemStatus(prev => ({ ...prev, fire: false }));
        break;
      case 'backup-power':
        setSystemStatus(prev => ({ ...prev, power: true }));
        break;
      case 'emergency-oxygen':
      case 'stabilize-pressure':
        setSystemStatus(prev => ({ ...prev, pressure: 100 }));
        break;
      case 'stabilize-crew':
      case 'crew-medical':
        setSystemStatus(prev => ({ ...prev, crew: 'stable' }));
        break;
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-900';
      case 'high': return 'border-orange-500 bg-orange-900';
      case 'medium': return 'border-yellow-500 bg-yellow-900';
      case 'low': return 'border-blue-500 bg-blue-900';
      default: return 'border-gray-500 bg-gray-900';
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400 animate-pulse';
      case 'at risk': return 'text-orange-400';
      case 'stable': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const startTraining = () => {
    setGameState('emergency');
    setScore(100);
    setEmergenciesCompleted(0);
    setCurrentEmergency('fire');
  };

  const completeTraining = () => {
    let finalScore = score;
    
    // Efficiency bonus based on emergencies completed
    const efficiencyBonus = (emergenciesCompleted + 1) * 10;
    finalScore += efficiencyBonus;
    
    // Time bonus if completed quickly
    if (timeLeft > 15) finalScore += 15;
    else if (timeLeft > 5) finalScore += 10;
    
    onComplete(Math.max(0, Math.min(100, finalScore)));
  };

  if (gameState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🚨 Emergency Response Protocol</h1>
            <p className="text-gray-300">{module.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-purple-400">🎯 Mission Objectives</h3>
              <ul className="space-y-2">
                {module.objectives.map((obj, index) => (
                  <li key={index} className="text-sm flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-red-400">🚨 Emergency Scenarios</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-bold text-red-400">Fire:</span> System fire response</div>
                <div><span className="font-bold text-orange-400">Decompression:</span> Hull breach protocol</div>
                <div><span className="font-bold text-yellow-400">Power Failure:</span> Critical systems recovery</div>
              </div>
            </div>
          </div>

          <div className="bg-red-900 border border-red-600 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2 text-red-400">⚠️ Critical Response Protocols</h3>
            <ul className="text-sm space-y-1">
              <li>• Follow NASA emergency procedures exactly</li>
              <li>• Execute steps in correct sequence - lives depend on it</li>
              <li>• Time is critical - every second counts</li>
              <li>• Stay calm under pressure - crew safety is priority</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={startTraining}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-bold rounded-lg animate-pulse"
            >
              🚨 ACTIVATE EMERGENCY TRAINING
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const scenario = emergencyScenarios[currentEmergency];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-black text-white">
      {/* Emergency Header */}
      <div className="bg-red-600 p-4 border-b-4 border-red-400 animate-pulse">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">🚨 EMERGENCY PROTOCOL ACTIVE 🚨</h1>
          <h2 className="text-lg">{scenario.title}</h2>
          <p className="text-sm text-red-200">{scenario.description}</p>
        </div>
      </div>

      {/* HUD */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-red-500">
              <div className="text-xs text-gray-400">MISSION SCORE</div>
              <div className="text-lg font-bold text-green-400">{Math.round(score)}</div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-orange-500 animate-pulse">
              <div className="text-xs text-gray-400">EMERGENCY TIME</div>
              <div className="text-lg font-bold text-red-400">
                {timeLeft}s
              </div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">SCENARIO</div>
              <div className="text-sm font-bold text-purple-400">
                {emergenciesCompleted + 1}/3
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">FIRE STATUS</div>
            <div className={`font-bold ${systemStatus.fire ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
              {systemStatus.fire ? '🔥 ACTIVE' : '✅ CLEAR'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">POWER</div>
            <div className={`font-bold ${systemStatus.power ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
              {systemStatus.power ? '⚡ ONLINE' : '❌ OFFLINE'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">PRESSURE</div>
            <div className={`font-bold ${systemStatus.pressure < 50 ? 'text-red-400 animate-pulse' : systemStatus.pressure < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
              {systemStatus.pressure}%
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">CREW STATUS</div>
            <div className={`font-bold ${getSystemStatusColor(systemStatus.crew)}`}>
              {systemStatus.crew.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Emergency Steps */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center">
            Emergency Response Sequence
          </h3>
          
          {/* Current step highlight */}
          {currentStepIndex < emergencySteps.length && (
            <div className="bg-red-800 border-2 border-red-400 p-4 rounded-lg mb-4 animate-pulse">
              <h4 className="font-bold text-lg mb-2">
                🎯 IMMEDIATE ACTION REQUIRED:
              </h4>
              <p className="text-red-200">
                {emergencySteps[currentStepIndex].description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencySteps.map((step, index) => (
              <Button
                key={step.id}
                onClick={() => executeStep(step.id)}
                disabled={step.completed}
                className={`p-4 rounded-lg border-2 transition-all ${
                  step.completed 
                    ? 'bg-green-800 border-green-500 text-green-200' 
                    : index === currentStepIndex
                    ? `${getCriticalityColor(step.criticalityLevel)} animate-pulse hover:scale-105`
                    : index < currentStepIndex
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gray-800 border-gray-600 hover:border-purple-400'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">
                      STEP {step.correctSequence}
                    </span>
                    <div className="flex items-center gap-2">
                      {step.completed && <span className="text-green-400">✅</span>}
                      {index === currentStepIndex && <span className="text-red-400">🚨</span>}
                      <span className={`text-xs px-2 py-1 rounded ${
                        step.criticalityLevel === 'critical' ? 'bg-red-600' :
                        step.criticalityLevel === 'high' ? 'bg-orange-600' :
                        step.criticalityLevel === 'medium' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}>
                        {step.criticalityLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold mb-2">{step.title}</h4>
                  <p className="text-sm opacity-90">{step.description}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    Time Limit: {step.timeLimit}s
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="mt-6 text-center">
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-green-400 rounded-full transition-all"
                style={{ width: `${(currentStepIndex / emergencySteps.length) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-400">
              Emergency Response Progress: {currentStepIndex}/{emergencySteps.length} Steps Completed
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {gameState === 'completed' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4 border-2 border-green-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">All Emergencies Resolved!</h2>
              <div className="space-y-2 mb-6">
                <div className="text-lg">Final Score: <span className="font-bold text-green-400">{Math.round(score)}/100</span></div>
                <div className="text-sm text-gray-300">Scenarios Completed: {emergenciesCompleted + 1}/3</div>
                <div className="text-sm text-gray-300">Response Time: {45 - timeLeft}s remaining</div>
              </div>
              <div className="bg-green-900 p-3 rounded-lg mb-4">
                <div className="text-green-400 font-bold">✅ NASA PROTOCOLS FOLLOWED</div>
                <div className="text-xs text-green-200">Emergency response training completed successfully</div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startTraining}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Retry Training
                </Button>
                <Button
                  onClick={completeTraining}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Complete Training
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {gameState === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4 border-2 border-red-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💀</div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">Emergency Protocol Failed</h2>
              <p className="text-gray-300 mb-6">
                Time ran out during emergency response. In space, every second counts for crew survival!
              </p>
              <div className="bg-red-900 p-3 rounded-lg mb-4">
                <div className="text-red-400 font-bold">⚠️ MISSION CRITICAL FAILURE</div>
                <div className="text-xs text-red-200">Emergency response training must be repeated</div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startTraining}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Retry Emergency Training
                </Button>
                <Button
                  onClick={() => onComplete(0)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Exit Training
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResponseGame;