'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Game state interfaces
interface Position {
  x: number
  y: number
  z: number
}

interface Velocity {
  x: number
  y: number
  z: number
}

interface Astronaut {
  position: Position
  velocity: Velocity
  rotation: number
  fuel: number
  health: number
}

interface Obstacle {
  id: string
  position: Position
  size: number
  type: 'wall' | 'equipment' | 'debris'
}

interface Target {
  id: string
  position: Position
  collected: boolean
  type: 'oxygen' | 'tool' | 'sample' | 'docking'
}

interface ZeroGravityTrainingProps {
  onComplete: (score: number) => void
}

export default function ZeroGravityTraining({ onComplete }: ZeroGravityTrainingProps) {
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial')
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [astronaut, setAstronaut] = useState<Astronaut>({
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    rotation: 0,
    fuel: 100,
    health: 100
  })
  
  const [obstacles] = useState<Obstacle[]>([
    { id: 'wall1', position: { x: -50, y: 0, z: 0 }, size: 5, type: 'wall' },
    { id: 'wall2', position: { x: 50, y: 0, z: 0 }, size: 5, type: 'wall' },
    { id: 'equipment1', position: { x: 20, y: 20, z: 10 }, size: 3, type: 'equipment' },
    { id: 'debris1', position: { x: -15, y: -25, z: -5 }, size: 2, type: 'debris' },
  ])
  
  const [targets, setTargets] = useState<Target[]>([
    { id: 'oxygen1', position: { x: 30, y: 15, z: 5 }, collected: false, type: 'oxygen' },
    { id: 'tool1', position: { x: -20, y: 25, z: -8 }, collected: false, type: 'tool' },
    { id: 'sample1', position: { x: 10, y: -30, z: 12 }, collected: false, type: 'sample' },
    { id: 'docking1', position: { x: 0, y: 40, z: 0 }, collected: false, type: 'docking' },
  ])

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const keysPressed = useRef<Set<string>>(new Set())

  // Physics simulation
  const updatePhysics = useCallback(() => {
    setAstronaut(prev => {
      const newVel = { ...prev.velocity }
      const newPos = { ...prev.position }
      let newFuel = prev.fuel
      
      // Handle input forces
      const thrusterForce = 0.5
      if (keysPressed.current.has('ArrowUp') && newFuel > 0) {
        newVel.y += thrusterForce * Math.cos(prev.rotation)
        newVel.x += thrusterForce * Math.sin(prev.rotation)
        newFuel -= 0.5
      }
      if (keysPressed.current.has('ArrowDown') && newFuel > 0) {
        newVel.y -= thrusterForce * Math.cos(prev.rotation)
        newVel.x -= thrusterForce * Math.sin(prev.rotation)
        newFuel -= 0.5
      }
      if (keysPressed.current.has('ArrowLeft') && newFuel > 0) {
        newVel.x -= thrusterForce
        newFuel -= 0.3
      }
      if (keysPressed.current.has('ArrowRight') && newFuel > 0) {
        newVel.x += thrusterForce
        newFuel -= 0.3
      }
      
      // Apply drag (very minimal in space)
      const dragFactor = 0.995
      newVel.x *= dragFactor
      newVel.y *= dragFactor
      newVel.z *= dragFactor
      
      // Update position
      newPos.x += newVel.x
      newPos.y += newVel.y
      newPos.z += newVel.z
      
      // Boundary collision
      const boundary = 45
      if (Math.abs(newPos.x) > boundary) {
        newPos.x = Math.sign(newPos.x) * boundary
        newVel.x *= -0.3 // Bounce with energy loss
      }
      if (Math.abs(newPos.y) > boundary) {
        newPos.y = Math.sign(newPos.y) * boundary
        newVel.y *= -0.3
      }
      if (Math.abs(newPos.z) > boundary) {
        newPos.z = Math.sign(newPos.z) * boundary
        newVel.z *= -0.3
      }
      
      return {
        ...prev,
        position: newPos,
        velocity: newVel,
        fuel: Math.max(0, newFuel)
      }
    })
  }, [])

  // Check target collection
  const checkTargetCollection = useCallback(() => {
    setTargets(prev => prev.map(target => {
      if (target.collected) return target
      
      const distance = Math.sqrt(
        Math.pow(target.position.x - astronaut.position.x, 2) +
        Math.pow(target.position.y - astronaut.position.y, 2) +
        Math.pow(target.position.z - astronaut.position.z, 2)
      )
      
      if (distance < 5) {
        setScore(s => s + getTargetPoints(target.type))
        return { ...target, collected: true }
      }
      
      return target
    }))
  }, [astronaut.position])

  const getTargetPoints = (type: Target['type']) => {
    switch (type) {
      case 'oxygen': return 10
      case 'tool': return 15
      case 'sample': return 20
      case 'docking': return 50
      default: return 5
    }
  }

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        updatePhysics()
        checkTargetCollection()
        setTimeRemaining(prev => {
          if (prev <= 0) {
            setGameState('completed')
            return 0
          }
          return prev - 1
        })
      }, 50) // 20 FPS
      
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState, updatePhysics, checkTargetCollection])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code)
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Check completion
  useEffect(() => {
    const allTargetsCollected = targets.every(t => t.collected)
    if (allTargetsCollected && gameState === 'playing') {
      setGameState('completed')
      onComplete(score + Math.floor(timeRemaining / 10)) // Bonus for time remaining
    }
  }, [targets, gameState, score, timeRemaining, onComplete])

  const startGame = () => {
    setGameState('playing')
    setTimeRemaining(300)
    setScore(0)
    setAstronaut({
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      rotation: 0,
      fuel: 100,
      health: 100
    })
    setTargets(prev => prev.map(t => ({ ...t, collected: false })))
  }

  const renderTutorial = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        className="max-w-4xl bg-black/80 backdrop-blur rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧑‍🚀</div>
          <h2 className="text-4xl font-bold mb-4">Zero-Gravity Navigation Training</h2>
          <p className="text-xl text-gray-300">
            Master movement in microgravity environments like the International Space Station
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Mission Objectives</h3>
            <ul className="space-y-2 text-gray-300">
              <li>🎯 Collect all oxygen tanks, tools, and samples</li>
              <li>🚀 Navigate to the docking port</li>
              <li>⚡ Conserve thruster fuel</li>
              <li>⏱️ Complete within the time limit</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 text-green-400">Controls</h3>
            <div className="space-y-2 text-gray-300">
              <div>↑ Forward thrusters</div>
              <div>↓ Reverse thrusters</div>
              <div>← → Lateral movement</div>
              <div>Space Emergency brake</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-yellow-400 mb-2">⚠️ Safety Reminders</h4>
          <ul className="text-sm space-y-1 text-yellow-200">
            <li>• Objects in motion stay in motion - plan your movements carefully</li>
            <li>• Thruster fuel is limited - use minimal corrections</li>
            <li>• Avoid collisions with walls and equipment</li>
            <li>• Practice 3D thinking - you can move in all directions</li>
          </ul>
        </div>
        
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xl transition-colors"
          >
            Begin Training Mission
          </button>
        </div>
      </motion.div>
    </div>
  )

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Game HUD */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Score</div>
            <div className="text-2xl font-bold text-green-400">{score}</div>
          </div>
          <div>
            <div className="text-gray-400">Time</div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div>
            <div className="text-gray-400 text-xs">Fuel</div>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${astronaut.fuel}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-gray-400 text-xs">Health</div>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${astronaut.health}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Targets Status */}
      <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4">
        <h3 className="font-bold mb-2">Objectives</h3>
        <div className="space-y-1 text-sm">
          {targets.map(target => (
            <div key={target.id} className={`flex items-center space-x-2 ${target.collected ? 'text-green-400' : 'text-gray-300'}`}>
              <span>{target.collected ? '✅' : '⭕'}</span>
              <span>
                {target.type === 'oxygen' && '🧪 Oxygen Tank'}
                {target.type === 'tool' && '🔧 Repair Tool'}
                {target.type === 'sample' && '🔬 Sample'}
                {target.type === 'docking' && '🎯 Docking Port'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Game Space */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-96 h-96 border-2 border-blue-500/30 rounded-lg overflow-hidden"
          style={{ 
            background: 'radial-gradient(circle, rgba(0,50,100,0.3) 0%, rgba(0,0,0,0.8) 100%)',
            perspective: '800px'
          }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`h${i}`} className="absolute w-full h-px bg-blue-500" style={{ top: `${i * 10}%` }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`v${i}`} className="absolute h-full w-px bg-blue-500" style={{ left: `${i * 10}%` }} />
            ))}
          </div>
          
          {/* Astronaut */}
          <motion.div
            className="absolute w-6 h-6 bg-orange-500 rounded-full shadow-lg z-10 flex items-center justify-center text-xs"
            style={{
              left: `${50 + (astronaut.position.x / 50) * 40}%`,
              top: `${50 - (astronaut.position.y / 50) * 40}%`,
              transform: `translateZ(${astronaut.position.z}px) rotate(${astronaut.rotation}deg)`
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            🧑‍🚀
          </motion.div>
          
          {/* Obstacles */}
          {obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className={`absolute rounded ${
                obstacle.type === 'wall' ? 'bg-gray-600' :
                obstacle.type === 'equipment' ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{
                left: `${50 + (obstacle.position.x / 50) * 40}%`,
                top: `${50 - (obstacle.position.y / 50) * 40}%`,
                width: `${obstacle.size}px`,
                height: `${obstacle.size}px`,
                transform: `translateZ(${obstacle.position.z}px) translate(-50%, -50%)`
              }}
            />
          ))}
          
          {/* Targets */}
          {targets.map(target => !target.collected && (
            <motion.div
              key={target.id}
              className="absolute w-4 h-4 rounded-full z-5 flex items-center justify-center"
              style={{
                left: `${50 + (target.position.x / 50) * 40}%`,
                top: `${50 - (target.position.y / 50) * 40}%`,
                transform: `translateZ(${target.position.z}px) translate(-50%, -50%)`,
                backgroundColor: target.type === 'oxygen' ? '#10B981' :
                                 target.type === 'tool' ? '#F59E0B' :
                                 target.type === 'sample' ? '#8B5CF6' : '#EF4444'
              }}
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xs">
                {target.type === 'oxygen' && '🧪'}
                {target.type === 'tool' && '🔧'}
                {target.type === 'sample' && '🔬'}
                {target.type === 'docking' && '🎯'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur rounded-xl p-4 max-w-md">
        <div className="text-sm text-gray-300">
          <div className="font-bold mb-2">Current Objective:</div>
          <div>
            {targets.filter(t => !t.collected).length > 0 
              ? `Collect ${targets.filter(t => !t.collected).length} remaining items`
              : 'All items collected! Return to docking port'
            }
          </div>
          <div className="mt-2 text-xs text-yellow-400">
            Use arrow keys to navigate. Watch your fuel level!
          </div>
        </div>
      </div>
    </div>
  )

  const renderCompleted = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl bg-black/80 backdrop-blur rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold mb-4">Training Complete!</h2>
        <p className="text-xl text-gray-300 mb-8">
          You successfully completed the Zero-Gravity Navigation training
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{score}</div>
            <div className="text-gray-300">Final Score</div>
          </div>
          
          <div className="bg-blue-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-400">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
            <div className="text-gray-300">Time Remaining</div>
          </div>
          
          <div className="bg-purple-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">{Math.round(astronaut.fuel)}</div>
            <div className="text-gray-300">Fuel Remaining</div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-blue-400 mb-2">🎖️ Training Badge Earned</h4>
          <p className="text-sm text-blue-200">
            Zero-Gravity Navigation Specialist - You have demonstrated proficiency in microgravity movement and spatial orientation.
          </p>
        </div>
        
        <button
          onClick={() => onComplete(score + Math.floor(timeRemaining / 10))}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
        >
          Continue to Next Training
        </button>
      </motion.div>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      {gameState === 'tutorial' && renderTutorial()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'completed' && renderCompleted()}
    </AnimatePresence>
  )
} 
