'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Oxygen system interfaces
interface OxygenSystem {
  o2Level: number // percentage
  co2Level: number // ppm
  pressure: number // kPa
  temperature: number // Celsius
  flowRate: number // L/min
}

interface SystemAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: number
}

interface OxygenManagementProps {
  onComplete: (score: number) => void
}

export default function OxygenManagement({ onComplete }: OxygenManagementProps) {
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial')
  const [score, setScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [oxygenSystem, setOxygenSystem] = useState<OxygenSystem>({
    o2Level: 21,
    co2Level: 400,
    pressure: 101.3,
    temperature: 22,
    flowRate: 2.5
  })
  
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [actionsPerformed, setActionsPerformed] = useState(0)
  const [emergencyActive, setEmergencyActive] = useState(false)
  const [scrubberEfficiency, setScrubberEfficiency] = useState(100)
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // System simulation
  const updateOxygenSystem = () => {
    setOxygenSystem(prev => {
      const newSystem = { ...prev }
      
      // Simulate O2 consumption and CO2 production
      newSystem.o2Level -= 0.01 + Math.random() * 0.01
      newSystem.co2Level += 5 + Math.random() * 5
      
      // CO2 scrubber effectiveness
      newSystem.co2Level -= (scrubberEfficiency / 100) * 20
      
      // Emergency scenarios
      if (emergencyActive) {
        newSystem.o2Level -= 0.05 // Leak
        newSystem.pressure -= 0.1
      }
      
      // Temperature fluctuation
      newSystem.temperature += (Math.random() - 0.5) * 0.1
      
      // Bounds checking
      newSystem.o2Level = Math.max(0, Math.min(21, newSystem.o2Level))
      newSystem.co2Level = Math.max(0, Math.min(5000, newSystem.co2Level))
      newSystem.pressure = Math.max(0, Math.min(110, newSystem.pressure))
      newSystem.temperature = Math.max(-10, Math.min(40, newSystem.temperature))
      
      return newSystem
    })
  }

  // Check for alerts
  const checkAlerts = () => {
    const newAlerts: SystemAlert[] = []
    
    if (oxygenSystem.o2Level < 16) {
      newAlerts.push({
        id: `o2_critical_${Date.now()}`,
        type: 'critical',
        message: 'CRITICAL: Oxygen level below safe threshold',
        timestamp: Date.now()
      })
    } else if (oxygenSystem.o2Level < 19) {
      newAlerts.push({
        id: `o2_warning_${Date.now()}`,
        type: 'warning',
        message: 'WARNING: Low oxygen levels detected',
        timestamp: Date.now()
      })
    }
    
    if (oxygenSystem.co2Level > 1000) {
      newAlerts.push({
        id: `co2_warning_${Date.now()}`,
        type: 'warning',
        message: 'WARNING: CO2 levels elevated',
        timestamp: Date.now()
      })
    }
    
    if (oxygenSystem.pressure < 95) {
      newAlerts.push({
        id: `pressure_warning_${Date.now()}`,
        type: 'warning',
        message: 'WARNING: Cabin pressure decreasing',
        timestamp: Date.now()
      })
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev.slice(-5), ...newAlerts]) // Keep only last 6 alerts
    }
  }

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        updateOxygenSystem()
        checkAlerts()
        setTimeRemaining(prev => {
          if (prev <= 0) {
            setGameState('completed')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState, oxygenSystem, scrubberEfficiency, emergencyActive])

  // Random emergency events
  useEffect(() => {
    if (gameState === 'playing') {
      const emergencyTimer = setTimeout(() => {
        if (Math.random() < 0.3) { // 30% chance
          setEmergencyActive(true)
          setAlerts(prev => [...prev, {
            id: `emergency_${Date.now()}`,
            type: 'critical',
            message: 'EMERGENCY: Oxygen leak detected!',
            timestamp: Date.now()
          }])
        }
      }, 60000 + Math.random() * 120000) // Random between 1-3 minutes
      
      return () => clearTimeout(emergencyTimer)
    }
  }, [gameState])

  const handleAction = (action: string) => {
    setActionsPerformed(prev => prev + 1)
    
    switch (action) {
      case 'increase_o2':
        setOxygenSystem(prev => ({ ...prev, o2Level: Math.min(21, prev.o2Level + 1) }))
        setScore(prev => prev + 5)
        break
      case 'activate_scrubber':
        setScrubberEfficiency(100)
        setScore(prev => prev + 10)
        break
      case 'emergency_oxygen':
        setOxygenSystem(prev => ({ ...prev, o2Level: Math.min(21, prev.o2Level + 3) }))
        setScore(prev => prev + 15)
        break
      case 'repair_leak':
        setEmergencyActive(false)
        setScore(prev => prev + 25)
        break
      case 'adjust_flow':
        setOxygenSystem(prev => ({ ...prev, flowRate: 3.0 }))
        setScore(prev => prev + 5)
        break
    }
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeRemaining(600)
    setActionsPerformed(0)
    setAlerts([])
    setEmergencyActive(false)
    setScrubberEfficiency(100)
  }

  const renderTutorial = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        className="max-w-4xl bg-black/80 backdrop-blur rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💨</div>
          <h2 className="text-4xl font-bold mb-4">Oxygen Management Training</h2>
          <p className="text-xl text-gray-300">
            Monitor and maintain life support systems aboard the International Space Station
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-green-400">Critical Parameters</h3>
            <ul className="space-y-2 text-gray-300">
              <li>🫁 Oxygen Level: Keep above 16%</li>
              <li>🌬️ CO2 Level: Keep below 1000 ppm</li>
              <li>📊 Cabin Pressure: Maintain ~101 kPa</li>
              <li>🌡️ Temperature: Keep comfortable range</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 text-red-400">Emergency Procedures</h3>
            <div className="space-y-2 text-gray-300">
              <div>🚨 Oxygen leak detection</div>
              <div>⚕️ Emergency oxygen activation</div>
              <div>🔧 System repair protocols</div>
              <div>💨 CO2 scrubber management</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-yellow-400 mb-2">⚠️ Life Support Protocols</h4>
          <ul className="text-sm space-y-1 text-yellow-200">
            <li>• Monitor oxygen levels continuously - crew safety is paramount</li>
            <li>• React quickly to system alerts and alarms</li>
            <li>• Manage CO2 scrubbers to prevent toxic buildup</li>
            <li>• Handle emergency scenarios with proper procedures</li>
          </ul>
        </div>
        
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xl transition-colors"
          >
            Begin Life Support Training
          </button>
        </div>
      </motion.div>
    </div>
  )

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      {/* System Status Display */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur rounded-xl p-6 max-w-md">
        <h3 className="text-xl font-bold mb-4 text-green-400">Life Support Systems</h3>
        
        <div className="space-y-4">
          {/* Oxygen Level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Oxygen Level</span>
              <span className={oxygenSystem.o2Level < 16 ? 'text-red-400' : oxygenSystem.o2Level < 19 ? 'text-yellow-400' : 'text-green-400'}>
                {oxygenSystem.o2Level.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  oxygenSystem.o2Level < 16 ? 'bg-red-500' : 
                  oxygenSystem.o2Level < 19 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(oxygenSystem.o2Level / 21) * 100}%` }}
              />
            </div>
          </div>
          
          {/* CO2 Level */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CO2 Level</span>
              <span className={oxygenSystem.co2Level > 1000 ? 'text-red-400' : 'text-green-400'}>
                {Math.round(oxygenSystem.co2Level)} ppm
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${oxygenSystem.co2Level > 1000 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (oxygenSystem.co2Level / 2000) * 100)}%` }}
              />
            </div>
          </div>
          
          {/* Pressure */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Cabin Pressure</span>
              <span className={oxygenSystem.pressure < 95 ? 'text-yellow-400' : 'text-green-400'}>
                {oxygenSystem.pressure.toFixed(1)} kPa
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${oxygenSystem.pressure < 95 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                style={{ width: `${(oxygenSystem.pressure / 110) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Temperature */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Temperature</span>
              <span className="text-cyan-400">{oxygenSystem.temperature.toFixed(1)}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur rounded-xl p-6 max-w-sm">
        <h3 className="text-xl font-bold mb-4 text-blue-400">Control Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('increase_o2')}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            🫁 Add O2
          </button>
          
          <button
            onClick={() => handleAction('activate_scrubber')}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            💨 CO2 Scrub
          </button>
          
          <button
            onClick={() => handleAction('emergency_oxygen')}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
            disabled={!emergencyActive}
          >
            🚨 Emergency O2
          </button>
          
          <button
            onClick={() => handleAction('repair_leak')}
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors"
            disabled={!emergencyActive}
          >
            🔧 Seal Leak
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-400">Scrubber Efficiency</div>
          <div className="text-2xl font-bold text-purple-400">{scrubberEfficiency}%</div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4 max-w-md max-h-48 overflow-y-auto">
        <h3 className="font-bold mb-2 text-red-400">System Alerts</h3>
        <div className="space-y-2">
          {alerts.slice(-3).map(alert => (
            <motion.div
              key={alert.id}
              className={`p-2 rounded text-sm ${
                alert.type === 'critical' ? 'bg-red-900/50 border border-red-500' :
                alert.type === 'warning' ? 'bg-yellow-900/50 border border-yellow-500' :
                'bg-blue-900/50 border border-blue-500'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="font-bold">{alert.type.toUpperCase()}</div>
              <div>{alert.message}</div>
              <div className="text-xs opacity-60">{new Date(alert.timestamp).toLocaleTimeString()}</div>
            </motion.div>
          ))}
          {alerts.length === 0 && (
            <div className="text-green-400 text-sm">All systems nominal</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
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
          <div>
            <div className="text-gray-400">Actions</div>
            <div className="text-2xl font-bold text-purple-400">{actionsPerformed}</div>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-96 h-96 bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
          {/* ISS Representation */}
          <motion.div
            className="text-8xl"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🛰️
          </motion.div>
          
          {/* Oxygen particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: `${50 + 30 * Math.cos((i * Math.PI * 2) / 8)}%`,
                top: `${50 + 30 * Math.sin((i * Math.PI * 2) / 8)}%`,
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25
              }}
            />
          ))}
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
        <div className="text-6xl mb-4">🎖️</div>
        <h2 className="text-4xl font-bold mb-4">Life Support Training Complete!</h2>
        <p className="text-xl text-gray-300 mb-8">
          You successfully managed oxygen systems under pressure
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400">{score}</div>
            <div className="text-gray-300">Final Score</div>
          </div>
          
          <div className="bg-blue-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-400">{actionsPerformed}</div>
            <div className="text-gray-300">Actions Taken</div>
          </div>
          
          <div className="bg-purple-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-400">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
            <div className="text-gray-300">Time Remaining</div>
          </div>
        </div>
        
        <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-green-400 mb-2">🫁 Badge Earned: Oxygen Management Expert</h4>
          <p className="text-sm text-green-200">
            You have demonstrated expertise in life support systems management and emergency response protocols.
          </p>
        </div>
        
        <button
          onClick={() => onComplete(score)}
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
