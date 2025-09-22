'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Emergency scenario interfaces
interface EmergencyScenario {
  id: string
  type: 'fire' | 'depressurization' | 'toxic_leak' | 'equipment_failure' | 'medical'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timeLimit: number // seconds
  correctActions: string[]
  availableActions: string[]
}

interface PlayerAction {
  id: string
  action: string
  timestamp: number
  correct: boolean
}

interface EmergencyResponseProps {
  onComplete: (score: number) => void
}

export default function EmergencyResponse({ onComplete }: EmergencyResponseProps) {
  const [gameState, setGameState] = useState<'tutorial' | 'playing' | 'completed'>('tutorial')
  const [currentScenario, setCurrentScenario] = useState<EmergencyScenario | null>(null)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([])
  const [score, setScore] = useState(0)
  const [totalScenarios, setTotalScenarios] = useState(0)
  const [alertMessage, setAlertMessage] = useState('')
  const [showHint, setShowHint] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const emergencyScenarios: EmergencyScenario[] = [
    {
      id: 'fire_lab',
      type: 'fire',
      title: 'Laboratory Fire',
      description: 'Electrical fire detected in the microgravity laboratory. Smoke is spreading rapidly through the ventilation system.',
      severity: 'high',
      timeLimit: 120,
      correctActions: ['isolate_power', 'activate_suppressant', 'seal_compartment', 'evacuate_area'],
      availableActions: ['isolate_power', 'use_water', 'activate_suppressant', 'open_vents', 'seal_compartment', 'evacuate_area', 'ignore_alarm']
    },
    {
      id: 'depress_hull',
      type: 'depressurization',
      title: 'Hull Breach',
      description: 'Micrometeorite impact has caused a small hull breach in Segment 2. Cabin pressure is dropping.',
      severity: 'critical',
      timeLimit: 90,
      correctActions: ['emergency_patch', 'isolate_segment', 'pressure_suits', 'backup_oxygen'],
      availableActions: ['emergency_patch', 'large_patch', 'isolate_segment', 'open_all_hatches', 'pressure_suits', 'backup_oxygen', 'wait_and_see']
    },
    {
      id: 'toxic_coolant',
      type: 'toxic_leak',
      title: 'Coolant Leak',
      description: 'Ammonia coolant leak detected in the thermal control system. Toxic vapors pose immediate health risk.',
      severity: 'high',
      timeLimit: 60,
      correctActions: ['don_masks', 'isolate_loop', 'activate_scrubbers', 'emergency_ventilation'],
      availableActions: ['don_masks', 'ignore_leak', 'isolate_loop', 'increase_circulation', 'activate_scrubbers', 'emergency_ventilation', 'open_windows']
    },
    {
      id: 'life_support_failure',
      type: 'equipment_failure',
      title: 'Life Support System Failure',
      description: 'Primary life support system has failed. Backup systems are not responding. CO2 levels rising.',
      severity: 'critical',
      timeLimit: 180,
      correctActions: ['manual_backup', 'co2_scrubbers', 'emergency_oxygen', 'isolate_crew'],
      availableActions: ['restart_primary', 'manual_backup', 'co2_scrubbers', 'emergency_oxygen', 'isolate_crew', 'abandon_station', 'call_ground']
    },
    {
      id: 'medical_emergency',
      type: 'medical',
      title: 'Medical Emergency',
      description: 'Crew member is experiencing severe allergic reaction. Airways constricting, blood pressure dropping.',
      severity: 'critical',
      timeLimit: 45,
      correctActions: ['epinephrine', 'oxygen_mask', 'position_patient', 'ground_contact'],
      availableActions: ['epinephrine', 'antihistamine', 'oxygen_mask', 'position_patient', 'cpr', 'ground_contact', 'wait_observe']
    }
  ]

  useEffect(() => {
    if (gameState === 'playing' && currentScenario && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleScenarioTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [gameState, currentScenario, timeRemaining])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setScenarioIndex(0)
    setTotalScenarios(emergencyScenarios.length)
    startNextScenario()
  }

  const startNextScenario = () => {
    if (scenarioIndex < emergencyScenarios.length) {
      const scenario = emergencyScenarios[scenarioIndex]
      setCurrentScenario(scenario)
      setTimeRemaining(scenario.timeLimit)
      setPlayerActions([])
      setAlertMessage('')
      setShowHint(false)
    } else {
      setGameState('completed')
    }
  }

  const handleAction = (action: string) => {
    if (!currentScenario) return
    
    const isCorrect = currentScenario.correctActions.includes(action)
    const newAction: PlayerAction = {
      id: `${Date.now()}_${action}`,
      action,
      timestamp: currentScenario.timeLimit - timeRemaining,
      correct: isCorrect
    }
    
    setPlayerActions(prev => [...prev, newAction])
    
    if (isCorrect) {
      setScore(prev => prev + 20)
      setAlertMessage('✓ Correct action!')
    } else {
      setScore(prev => prev - 10)
      setAlertMessage('✗ Incorrect action - reconsider!')
    }
    
    setTimeout(() => setAlertMessage(''), 2000)
    
    // Check if all correct actions completed
    const allCorrectActions = [...playerActions.filter(a => a.correct).map(a => a.action), action].filter((a, i, arr) => arr.indexOf(a) === i)
    if (currentScenario.correctActions.every(ca => allCorrectActions.includes(ca))) {
      handleScenarioComplete()
    }
  }

  const handleScenarioComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    // Bonus points for time remaining
    const timeBonus = Math.floor(timeRemaining / 2)
    setScore(prev => prev + timeBonus)
    
    setTimeout(() => {
      setScenarioIndex(prev => prev + 1)
      startNextScenario()
    }, 2000)
  }

  const handleScenarioTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setAlertMessage('⚠️ Time expired! Moving to next scenario...')
    
    setTimeout(() => {
      setScenarioIndex(prev => prev + 1)
      startNextScenario()
    }, 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-500 bg-red-900/30'
      case 'high': return 'text-orange-400 border-orange-500 bg-orange-900/30'
      case 'medium': return 'text-yellow-400 border-yellow-500 bg-yellow-900/30'
      default: return 'text-blue-400 border-blue-500 bg-blue-900/30'
    }
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'fire': return '🔥'
      case 'depressurization': return '💨'
      case 'toxic_leak': return '☣️'
      case 'equipment_failure': return '⚙️'
      case 'medical': return '🏥'
      default: return '⚠️'
    }
  }

  const renderTutorial = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        className="max-w-4xl bg-black/80 backdrop-blur rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-4xl font-bold mb-4">Emergency Response Training</h2>
          <p className="text-xl text-gray-300">
            Learn to handle critical situations aboard the International Space Station
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-red-400">Emergency Types</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔥</span>
                <span>Fire & Electrical Hazards</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💨</span>
                <span>Depressurization Events</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">☣️</span>
                <span>Toxic Material Leaks</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚙️</span>
                <span>Equipment Failures</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏥</span>
                <span>Medical Emergencies</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Response Priorities</h3>
            <div className="space-y-2 text-gray-300">
              <div>1. <span className="font-bold text-red-400">Life Safety</span> - Protect crew</div>
              <div>2. <span className="font-bold text-orange-400">Damage Control</span> - Contain incident</div>
              <div>3. <span className="font-bold text-yellow-400">System Recovery</span> - Restore operations</div>
              <div>4. <span className="font-bold text-green-400">Communication</span> - Contact ground</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-red-400 mb-2">🚨 Critical Success Factors</h4>
          <ul className="text-sm space-y-1 text-red-200">
            <li>• <span className="font-bold">Speed</span> - Time is critical in emergencies</li>
            <li>• <span className="font-bold">Accuracy</span> - Wrong actions can worsen situations</li>
            <li>• <span className="font-bold">Sequence</span> - Some actions must be performed in order</li>
            <li>• <span className="font-bold">Completeness</span> - Missing steps can be fatal</li>
          </ul>
        </div>
        
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xl transition-colors"
          >
            Begin Emergency Training
          </button>
        </div>
      </motion.div>
    </div>
  )

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black text-white relative">
      {/* Scenario Header */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-black/80 backdrop-blur rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getTypeEmoji(currentScenario?.type || '')}</div>
              <div>
                <h2 className="text-2xl font-bold">{currentScenario?.title}</h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(currentScenario?.severity || 'low')}`}>
                  {currentScenario?.severity.toUpperCase()} PRIORITY
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-400">Scenario</div>
              <div className="text-2xl font-bold">{scenarioIndex + 1}/{totalScenarios}</div>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4">{currentScenario?.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Time Remaining</div>
                <div className={`text-2xl font-bold ${timeRemaining < 30 ? 'text-red-400' : timeRemaining < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400">Score</div>
                <div className="text-2xl font-bold text-blue-400">{score}</div>
              </div>
            </div>
            
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              💡 {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>
        </div>
      </div>

      {/* Actions Panel */}
      <div className="absolute top-1/2 left-4 right-4 transform -translate-y-1/2 z-20">
        <div className="bg-black/80 backdrop-blur rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Emergency Response Actions</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {currentScenario?.availableActions.map(action => {
              const alreadyTaken = playerActions.some(pa => pa.action === action)
              return (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  disabled={alreadyTaken}
                  className={`px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
                    alreadyTaken 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {action.replace(/_/g, ' ').toUpperCase()}
                </button>
              )
            })}
          </div>
          
          {/* Hint */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-purple-400 font-bold mb-2">💡 Emergency Protocol Hint</div>
                <div className="text-sm text-purple-200">
                  For {currentScenario?.type} emergencies, prioritize: {currentScenario?.correctActions.slice(0, 2).join(', ')}...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Alert Message */}
          <AnimatePresence>
            {alertMessage && (
              <motion.div
                className={`text-center p-3 rounded-lg font-bold ${
                  alertMessage.includes('✓') ? 'bg-green-900/30 border border-green-500 text-green-400' :
                  alertMessage.includes('✗') ? 'bg-red-900/30 border border-red-500 text-red-400' :
                  'bg-yellow-900/30 border border-yellow-500 text-yellow-400'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {alertMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions Taken */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4 max-w-sm max-h-48 overflow-y-auto">
        <h3 className="font-bold mb-2 text-green-400">Actions Taken</h3>
        <div className="space-y-2">
          {playerActions.map(action => (
            <div
              key={action.id}
              className={`p-2 rounded text-sm ${
                action.correct ? 'bg-green-900/30 border border-green-500 text-green-400' :
                'bg-red-900/30 border border-red-500 text-red-400'
              }`}
            >
              <div className="font-bold">{action.correct ? '✓' : '✗'} {action.action.replace(/_/g, ' ')}</div>
              <div className="text-xs opacity-60">T+{action.timestamp}s</div>
            </div>
          ))}
          {playerActions.length === 0 && (
            <div className="text-gray-400 text-sm">No actions taken yet</div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/80 backdrop-blur rounded-xl p-4">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Progress</div>
          <div className="w-32 bg-gray-700 rounded-full h-3">
            <div 
              className="h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${((scenarioIndex) / totalScenarios) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">{scenarioIndex}/{totalScenarios}</div>
        </div>
      </div>

      {/* Main Visual */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <motion.div
            className="w-96 h-96 bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-full border-4 border-red-500/30 flex items-center justify-center"
            animate={{
              scale: timeRemaining < 30 ? [1, 1.1, 1] : [1, 1.02, 1],
              borderColor: timeRemaining < 30 ? ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.3)'] : 'rgba(239, 68, 68, 0.3)'
            }}
            transition={{
              duration: timeRemaining < 30 ? 1 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-8xl">{getTypeEmoji(currentScenario?.type || '')}</div>
          </motion.div>
          
          {/* Warning pulses */}
          {timeRemaining < 60 && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </div>
      </div>
    </div>
  )

  const renderCompleted = () => (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        className="max-w-2xl bg-black/80 backdrop-blur rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-bold mb-4">Emergency Response Training Complete!</h2>
        <p className="text-xl text-gray-300 mb-8">
          You have completed critical emergency response training
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-400">{score}</div>
            <div className="text-gray-300">Final Score</div>
          </div>
          
          <div className="bg-orange-900/30 rounded-xl p-4">
            <div className="text-3xl font-bold text-orange-400">{totalScenarios}</div>
            <div className="text-gray-300">Scenarios Completed</div>
          </div>
        </div>
        
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8">
          <h4 className="font-bold text-red-400 mb-2">🚨 Badge Earned: Emergency Response Specialist</h4>
          <p className="text-sm text-red-200">
            You have demonstrated competency in handling critical emergency situations aboard space stations.
          </p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-3 mb-8">
          {emergencyScenarios.map((scenario, index) => (
            <div key={scenario.id} className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{getTypeEmoji(scenario.type)}</div>
              <div className="text-xs text-gray-400">{scenario.type.replace('_', ' ')}</div>
              <div className={`text-xs font-bold ${index < scenarioIndex ? 'text-green-400' : 'text-gray-500'}`}>
                {index < scenarioIndex ? 'COMPLETED' : 'PENDING'}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => onComplete(score)}
          className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
        >
          Complete Training Module
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
