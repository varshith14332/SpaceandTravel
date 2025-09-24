import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface OxygenManagementGameProps {
  module: TrainingModule;
  session: TrainingSession;
  onComplete: (score: number) => void;
}

interface SystemStatus {
  pressure: number;
  leakRate: number;
  repairProgress: number;
  isRepairing: boolean;
  position: { x: number; y: number };
}

const OxygenManagementGame: React.FC<OxygenManagementGameProps> = ({ module, session, onComplete }) => {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'completed' | 'failed'>('instructions');
  const [oxygenPressure, setOxygenPressure] = useState(21); // Normal atmospheric pressure (psi)
  const [score, setScore] = useState(100);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [currentLeak, setCurrentLeak] = useState<SystemStatus | null>(null);
  const [leaksFixed, setLeaksFixed] = useState(0);
  const [totalLeaks, setTotalLeaks] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const gameLoopRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Game constants
  const MIN_SAFE_PRESSURE = 16;
  const MAX_SAFE_PRESSURE = 23;
  const CRITICAL_PRESSURE = 14;
  const LEAK_SPAWN_INTERVAL = 15; // seconds
  const REPAIR_TIME = 3; // seconds to fix a leak

  const addAlert = useCallback((message: string) => {
    setAlerts(prev => [...prev.slice(-2), message]);
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => {
      setAlerts(prev => prev.slice(1));
    }, 3000);
  }, []);

  const spawnLeak = useCallback(() => {
    if (currentLeak) return; // Only one leak at a time for intermediate level

    const leakSeverity = Math.random();
    const leak: SystemStatus = {
      pressure: oxygenPressure,
      leakRate: 0.8 + leakSeverity * 1.5, // 0.8 to 2.3 psi per second
      repairProgress: 0,
      isRepairing: false,
      position: {
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 300
      }
    };

    setCurrentLeak(leak);
    setTotalLeaks(prev => prev + 1);
    addAlert(`🚨 OXYGEN LEAK DETECTED - ${leak.leakRate > 1.8 ? 'SEVERE' : leak.leakRate > 1.3 ? 'MODERATE' : 'MINOR'}`);
  }, [currentLeak, oxygenPressure, addAlert]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    setTimeLeft(prev => {
      const newTime = prev - 1/60;
      
      // Spawn leaks periodically
      if (Math.floor(newTime) % LEAK_SPAWN_INTERVAL === 0 && Math.floor(newTime) !== Math.floor(prev)) {
        spawnLeak();
      }
      
      if (newTime <= 0) {
        setGameState('failed');
        return 0;
      }
      return newTime;
    });

    // Update oxygen pressure
    setOxygenPressure(prev => {
      let newPressure = prev;
      
      // Apply leak effects
      if (currentLeak) {
        newPressure -= currentLeak.leakRate / 60; // Convert to per-frame rate
      }
      
      // Natural pressure regulation (slow)
      const targetPressure = 21;
      const regulationRate = 0.5 / 60; // Very slow automatic regulation
      if (Math.abs(newPressure - targetPressure) > 0.1) {
        if (newPressure < targetPressure) {
          newPressure += regulationRate;
        } else {
          newPressure -= regulationRate;
        }
      }
      
      // Clamp pressure
      newPressure = Math.max(0, Math.min(30, newPressure));
      
      // Check for critical conditions
      if (newPressure <= CRITICAL_PRESSURE) {
        setGameState('failed');
      } else if (newPressure <= MIN_SAFE_PRESSURE) {
        addAlert('⚠️ OXYGEN PRESSURE CRITICALLY LOW');
        setScore(prev => Math.max(0, prev - 2));
      } else if (newPressure >= MAX_SAFE_PRESSURE) {
        addAlert('⚠️ OXYGEN PRESSURE TOO HIGH');
        setScore(prev => Math.max(0, prev - 1));
      }
      
      return newPressure;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, currentLeak, spawnLeak, addAlert]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Repair leak function
  const startRepair = () => {
    if (!currentLeak || currentLeak.isRepairing) return;
    
    setCurrentLeak(prev => prev ? { ...prev, isRepairing: true } : null);
    
    const repairInterval = setInterval(() => {
      setCurrentLeak(prev => {
        if (!prev) {
          clearInterval(repairInterval);
          return null;
        }
        
        const newProgress = prev.repairProgress + (100 / (REPAIR_TIME * 60)); // 60 FPS
        
        if (newProgress >= 100) {
          clearInterval(repairInterval);
          setLeaksFixed(prevFixed => prevFixed + 1);
          setScore(prevScore => Math.min(100, prevScore + 15)); // Bonus for fixing leak
          addAlert('✅ LEAK REPAIRED SUCCESSFULLY');
          return null;
        }
        
        return { ...prev, repairProgress: newProgress };
      });
    }, 16); // ~60 FPS
  };

  // Emergency pressure adjustment
  const adjustPressure = (change: number) => {
    setOxygenPressure(prev => {
      const newPressure = Math.max(0, Math.min(30, prev + change));
      setScore(prevScore => Math.max(0, prevScore - 2)); // Small penalty for manual intervention
      return newPressure;
    });
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 400);

    // Draw background grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 800; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 400);
      ctx.stroke();
    }
    for (let i = 0; i <= 400; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }

    // Draw oxygen pipes
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(750, 200);
    ctx.moveTo(400, 50);
    ctx.lineTo(400, 350);
    ctx.stroke();

    // Draw pressure nodes
    const nodes = [
      { x: 150, y: 200 },
      { x: 400, y: 120 },
      { x: 650, y: 200 },
      { x: 400, y: 280 }
    ];

    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = oxygenPressure > MIN_SAFE_PRESSURE ? '#00ff00' : '#ff4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw current leak
    if (currentLeak) {
      ctx.save();
      ctx.translate(currentLeak.position.x, currentLeak.position.y);
      
      // Leak effect
      ctx.fillStyle = currentLeak.isRepairing ? '#ffaa00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(0, 0, 15 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Repair progress
      if (currentLeak.isRepairing) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 25, -Math.PI/2, -Math.PI/2 + (currentLeak.repairProgress / 100) * Math.PI * 2);
        ctx.stroke();
      }
      
      // Leak particles
      if (!currentLeak.isRepairing) {
        for (let i = 0; i < 10; i++) {
          const angle = (Date.now() / 100 + i * 36) % 360 * Math.PI / 180;
          const distance = 20 + (Date.now() / 50 + i * 10) % 30;
          ctx.fillStyle = `rgba(255, 255, 255, ${1 - distance / 50})`;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    }

    // Draw pressure gauge
    const gaugeX = 700;
    const gaugeY = 80;
    const gaugeRadius = 50;
    
    // Gauge background
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#2a2a3e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Pressure zones
    ctx.lineWidth = 8;
    // Critical zone (red)
    ctx.strokeStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius - 10, Math.PI, Math.PI + (CRITICAL_PRESSURE / 30) * Math.PI);
    ctx.stroke();
    // Warning zone (yellow)
    ctx.strokeStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius - 10, Math.PI + (CRITICAL_PRESSURE / 30) * Math.PI, Math.PI + (MIN_SAFE_PRESSURE / 30) * Math.PI);
    ctx.stroke();
    // Safe zone (green)
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius - 10, Math.PI + (MIN_SAFE_PRESSURE / 30) * Math.PI, Math.PI + (MAX_SAFE_PRESSURE / 30) * Math.PI);
    ctx.stroke();
    // Over pressure zone (red)
    ctx.strokeStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius - 10, Math.PI + (MAX_SAFE_PRESSURE / 30) * Math.PI, 2 * Math.PI);
    ctx.stroke();

    // Needle
    const needleAngle = Math.PI + (oxygenPressure / 30) * Math.PI;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
      gaugeX + Math.cos(needleAngle) * (gaugeRadius - 20),
      gaugeY + Math.sin(needleAngle) * (gaugeRadius - 20)
    );
    ctx.stroke();

    // Gauge text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${oxygenPressure.toFixed(1)} PSI`, gaugeX, gaugeY + 70);
  }, [oxygenPressure, currentLeak]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(180);
    setScore(100);
    setOxygenPressure(21);
    setCurrentLeak(null);
    setLeaksFixed(0);
    setTotalLeaks(0);
    setAlerts([]);
  };

  const completeTraining = () => {
    let finalScore = score;
    
    // Time bonus
    if (timeLeft > 60) finalScore += 20;
    else if (timeLeft > 30) finalScore += 10;
    
    // Efficiency bonus
    const efficiency = totalLeaks > 0 ? (leaksFixed / totalLeaks) * 100 : 100;
    finalScore += Math.floor(efficiency * 0.2);
    
    // Pressure stability bonus
    if (oxygenPressure >= MIN_SAFE_PRESSURE && oxygenPressure <= MAX_SAFE_PRESSURE) {
      finalScore += 15;
    }
    
    onComplete(Math.max(0, Math.min(100, finalScore)));
  };

  if (gameState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🫁 Oxygen Management System</h1>
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
              <h3 className="font-bold mb-3 text-blue-400">🔧 System Controls</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-bold">Repair Button:</span> Fix detected leaks</div>
                <div><span className="font-bold">Pressure Controls:</span> Emergency adjustments</div>
                <div><span className="font-bold">Safe Range:</span> 16-23 PSI</div>
                <div><span className="font-bold">Critical:</span> Below 14 PSI</div>
              </div>
            </div>
          </div>

          <div className="bg-red-900 border border-red-600 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2 text-red-400">🚨 Emergency Protocols</h3>
            <ul className="text-sm space-y-1">
              <li>• Monitor oxygen pressure gauge continuously</li>
              <li>• Repair leaks immediately when detected</li>
              <li>• Maintain pressure between 16-23 PSI</li>
              <li>• Use emergency controls only when necessary</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-bold rounded-lg"
            >
              🚀 Begin Life Support Training
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* HUD */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-6">
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">MISSION SCORE</div>
              <div className="text-lg font-bold text-green-400">{Math.round(score)}</div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">OXYGEN PRESSURE</div>
              <div className={`text-lg font-bold ${
                oxygenPressure <= CRITICAL_PRESSURE ? 'text-red-400' :
                oxygenPressure <= MIN_SAFE_PRESSURE || oxygenPressure >= MAX_SAFE_PRESSURE ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {oxygenPressure.toFixed(1)} PSI
              </div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">TIME REMAINING</div>
              <div className="text-lg font-bold text-orange-400">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toFixed(0).padStart(2, '0')}
              </div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">LEAKS FIXED</div>
              <div className="text-lg font-bold text-blue-400">{leaksFixed}/{totalLeaks}</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-red-600 text-white px-4 py-2 rounded-lg mb-2 animate-pulse">
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* Game Canvas */}
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="border-2 border-purple-500 rounded-lg"
          />
        </div>

        {/* Control Panel */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={startRepair}
            disabled={!currentLeak || currentLeak.isRepairing}
            className={`px-6 py-3 rounded-lg font-bold ${
              currentLeak && !currentLeak.isRepairing
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-gray-600 text-gray-400'
            }`}
          >
            {currentLeak && currentLeak.isRepairing 
              ? `🔧 Repairing... ${Math.round(currentLeak.repairProgress)}%`
              : currentLeak 
              ? '🚨 REPAIR LEAK' 
              : '🔧 No Leaks Detected'
            }
          </Button>
          
          <Button
            onClick={() => adjustPressure(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold"
          >
            ↓ Decrease Pressure
          </Button>
          
          <Button
            onClick={() => adjustPressure(1)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold"
          >
            ↑ Increase Pressure
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          Keep oxygen pressure between 16-23 PSI • Repair leaks quickly • Monitor system status
        </div>
      </div>

      {/* Completion Modal */}
      {gameState === 'completed' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">Life Support Mastered!</h2>
              <div className="space-y-2 mb-6">
                <div className="text-lg">Final Score: <span className="font-bold text-green-400">{Math.round(score)}/100</span></div>
                <div className="text-sm text-gray-300">Leaks Repaired: {leaksFixed}/{totalLeaks}</div>
                <div className="text-sm text-gray-300">Final Pressure: {oxygenPressure.toFixed(1)} PSI</div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Try Again
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
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">💀</div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">Life Support Failure</h2>
              <p className="text-gray-300 mb-6">
                {oxygenPressure <= CRITICAL_PRESSURE 
                  ? "Oxygen levels dropped to critical levels. Crew safety compromised!"
                  : "Mission time expired. Quick response is crucial for crew survival!"
                }
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Retry Training
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

export default OxygenManagementGame;