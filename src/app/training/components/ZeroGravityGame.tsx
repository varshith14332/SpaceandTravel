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

interface ZeroGravityGameProps {
  module: TrainingModule;
  session: TrainingSession;
  onComplete: (score: number) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

const ZeroGravityGame: React.FC<ZeroGravityGameProps> = ({ module, session, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'paused' | 'completed' | 'failed'>('instructions');
  const [astronautPos, setAstronautPos] = useState<Position>({ x: 50, y: 250 });
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [targetPos] = useState<Position>({ x: 750, y: 250 });
  const [score, setScore] = useState(100);
  const [fuel, setFuel] = useState(100);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Game constants
  const THRUST_POWER = 0.3;
  const FRICTION = 0.98;
  const MAX_VELOCITY = 8;
  const TARGET_RADIUS = 40;
  const ASTRONAUT_SIZE = 20;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;
    setKeysPressed(prev => new Set(prev).add(e.key.toLowerCase()));
  }, [gameState]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeysPressed(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(e.key.toLowerCase());
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== 'playing') return;

    const deltaTime = (currentTime - lastTimeRef.current) / 16.67; // Normalize to 60fps
    lastTimeRef.current = currentTime;

    setAstronautPos(prevPos => {
      setVelocity(prevVel => {
        let newVelX = prevVel.x;
        let newVelY = prevVel.y;

        // Apply thrust based on keys pressed
        let thrustUsed = false;
        if (keysPressed.has('w') || keysPressed.has('arrowup')) {
          newVelY -= THRUST_POWER * deltaTime;
          thrustUsed = true;
        }
        if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
          newVelY += THRUST_POWER * deltaTime;
          thrustUsed = true;
        }
        if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
          newVelX -= THRUST_POWER * deltaTime;
          thrustUsed = true;
        }
        if (keysPressed.has('d') || keysPressed.has('arrowright')) {
          newVelX += THRUST_POWER * deltaTime;
          thrustUsed = true;
        }

        // Use fuel when thrusting
        if (thrustUsed && fuel > 0) {
          setFuel(prev => Math.max(0, prev - 0.8 * deltaTime));
        }

        // Apply friction
        newVelX *= Math.pow(FRICTION, deltaTime);
        newVelY *= Math.pow(FRICTION, deltaTime);

        // Limit max velocity
        const speed = Math.sqrt(newVelX * newVelX + newVelY * newVelY);
        if (speed > MAX_VELOCITY) {
          newVelX = (newVelX / speed) * MAX_VELOCITY;
          newVelY = (newVelY / speed) * MAX_VELOCITY;
        }

        return { x: newVelX, y: newVelY };
      });

      // Update position based on velocity
      let newX = prevPos.x + velocity.x * deltaTime;
      let newY = prevPos.y + velocity.y * deltaTime;

      // Bounce off walls
      if (newX < ASTRONAUT_SIZE || newX > CANVAS_WIDTH - ASTRONAUT_SIZE) {
        setVelocity(prev => ({ ...prev, x: -prev.x * 0.7 }));
        newX = Math.max(ASTRONAUT_SIZE, Math.min(CANVAS_WIDTH - ASTRONAUT_SIZE, newX));
        setScore(prev => Math.max(0, prev - 5)); // Penalty for hitting walls
      }
      if (newY < ASTRONAUT_SIZE || newY > CANVAS_HEIGHT - ASTRONAUT_SIZE) {
        setVelocity(prev => ({ ...prev, y: -prev.y * 0.7 }));
        newY = Math.max(ASTRONAUT_SIZE, Math.min(CANVAS_HEIGHT - ASTRONAUT_SIZE, newY));
        setScore(prev => Math.max(0, prev - 5)); // Penalty for hitting walls
      }

      const newPos = { x: newX, y: newY };

      // Check if reached target
      const distanceToTarget = Math.sqrt(
        Math.pow(newX - targetPos.x, 2) + Math.pow(newY - targetPos.y, 2)
      );

      if (distanceToTarget < TARGET_RADIUS) {
        const finalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        let finalScore = score;
        
        // Bonus for gentle docking
        if (finalSpeed < 2) finalScore += 20;
        else if (finalSpeed < 4) finalScore += 10;
        else finalScore -= 10; // Penalty for hard docking

        // Time bonus
        const timeBonus = Math.floor((timeLeft / 120) * 20);
        finalScore += timeBonus;

        // Fuel efficiency bonus
        const fuelBonus = Math.floor((fuel / 100) * 15);
        finalScore += fuelBonus;

        setScore(finalScore);
        setGameState('completed');
        return newPos;
      }

      return newPos;
    });

    // Decrease time
    setTimeLeft(prev => {
      const newTime = prev - deltaTime / 60;
      if (newTime <= 0) {
        setGameState('failed');
        return 0;
      }
      return newTime;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, velocity, keysPressed, fuel, score, timeLeft, targetPos]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
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

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 137) % CANVAS_WIDTH;
      const y = (i * 211) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw target (space station)
    ctx.save();
    ctx.translate(targetPos.x, targetPos.y);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, TARGET_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    
    // Docking port
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();

    // Draw astronaut
    ctx.save();
    ctx.translate(astronautPos.x, astronautPos.y);
    
    // Astronaut body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, ASTRONAUT_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet reflection
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(-5, -5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Thrust effects
    if (fuel > 0) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      if (keysPressed.has('w') || keysPressed.has('arrowup')) {
        ctx.beginPath();
        ctx.moveTo(0, ASTRONAUT_SIZE);
        ctx.lineTo(-5, ASTRONAUT_SIZE + 15);
        ctx.lineTo(5, ASTRONAUT_SIZE + 15);
        ctx.closePath();
        ctx.stroke();
      }
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) {
        ctx.beginPath();
        ctx.moveTo(0, -ASTRONAUT_SIZE);
        ctx.lineTo(-5, -ASTRONAUT_SIZE - 15);
        ctx.lineTo(5, -ASTRONAUT_SIZE - 15);
        ctx.closePath();
        ctx.stroke();
      }
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) {
        ctx.beginPath();
        ctx.moveTo(ASTRONAUT_SIZE, 0);
        ctx.lineTo(ASTRONAUT_SIZE + 15, -5);
        ctx.lineTo(ASTRONAUT_SIZE + 15, 5);
        ctx.closePath();
        ctx.stroke();
      }
      if (keysPressed.has('d') || keysPressed.has('arrowright')) {
        ctx.beginPath();
        ctx.moveTo(-ASTRONAUT_SIZE, 0);
        ctx.lineTo(-ASTRONAUT_SIZE - 15, -5);
        ctx.lineTo(-ASTRONAUT_SIZE - 15, 5);
        ctx.closePath();
        ctx.stroke();
      }
    }
    
    ctx.restore();

    // Velocity indicator
    if (gameState === 'playing') {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(astronautPos.x, astronautPos.y);
      ctx.lineTo(
        astronautPos.x + velocity.x * 10,
        astronautPos.y + velocity.y * 10
      );
      ctx.stroke();
    }
  }, [astronautPos, targetPos, velocity, keysPressed, fuel, gameState]);

  const startGame = () => {
    setGameState('playing');
    setGameStartTime(Date.now());
    setAttempts(prev => prev + 1);
  };

  const restartGame = () => {
    setAstronautPos({ x: 50, y: 250 });
    setVelocity({ x: 0, y: 0 });
    setScore(100);
    setFuel(100);
    setTimeLeft(120);
    setGameState('instructions');
    setKeysPressed(new Set());
  };

  const completeTraining = () => {
    const finalScore = Math.max(0, Math.min(100, score));
    onComplete(finalScore);
  };

  if (gameState === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🚀 Zero Gravity Navigation</h1>
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
              <h3 className="font-bold mb-3 text-blue-400">🎮 Controls</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-bold">WASD</span> or <span className="font-bold">Arrow Keys</span> - Thruster Control</div>
                <div><span className="font-bold">Goal:</span> Dock with the green space station</div>
                <div><span className="font-bold">Warning:</span> Control your momentum!</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900 border border-yellow-600 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2 text-yellow-400">⚠️ NASA Protocol Reminder</h3>
            <ul className="text-sm space-y-1">
              <li>• Approach target slowly to avoid collision damage</li>
              <li>• Conserve fuel - efficiency is critical in space</li>
              <li>• Use minimal thrust for course corrections</li>
              <li>• Gentle contact speed (&lt;2 m/s) for successful docking</li>
            </ul>
          </div>

          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-bold rounded-lg"
            >
              🚀 Launch Mission {attempts > 0 ? `(Attempt ${attempts + 1})` : ''}
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
              <div className="text-xs text-gray-400">FUEL</div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-600 rounded">
                  <div 
                    className={`h-full rounded transition-all ${fuel > 30 ? 'bg-blue-400' : 'bg-red-400'}`}
                    style={{ width: `${fuel}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{Math.round(fuel)}%</span>
              </div>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <div className="text-xs text-gray-400">TIME</div>
              <div className="text-lg font-bold text-orange-400">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toFixed(0).padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setGameState('paused')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              ⏸️ Pause
            </Button>
            <Button
              onClick={restartGame}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              🔄 Restart
            </Button>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-purple-500 rounded-lg bg-black"
          />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Use WASD or Arrow Keys to control thrusters • Dock gently with the green station • Watch your fuel!
        </div>
      </div>

      {/* Completion/Failure Modals */}
      {gameState === 'completed' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">Mission Accomplished!</h2>
              <div className="space-y-2 mb-6">
                <div className="text-lg">Final Score: <span className="font-bold text-green-400">{Math.round(score)}/100</span></div>
                <div className="text-sm text-gray-300">Fuel Remaining: {Math.round(fuel)}%</div>
                <div className="text-sm text-gray-300">Time: {Math.floor((120 - timeLeft) / 60)}:{((120 - timeLeft) % 60).toFixed(0).padStart(2, '0')}</div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={restartGame}
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

      {gameState === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">Mission Failed</h2>
              <p className="text-gray-300 mb-6">Time ran out! In space, timing is everything.</p>
              <div className="flex gap-4">
                <Button
                  onClick={restartGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Retry Mission
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

      {gameState === 'paused' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Mission Paused</h2>
              <div className="flex gap-4">
                <Button
                  onClick={() => setGameState('playing')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  ▶️ Resume
                </Button>
                <Button
                  onClick={restartGame}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  🔄 Restart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZeroGravityGame;