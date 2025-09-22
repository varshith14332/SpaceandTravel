'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ZeroGravityTraining from './zero-gravity'
import OxygenManagement from './oxygen-management'
import EmergencyResponse from './emergency-response'

type TrainingModule = 'overview' | 'zero-gravity' | 'oxygen' | 'emergency'

interface ModuleInfo {
  id: TrainingModule
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  icon: string
  color: string
  objectives: string[]
}

const trainingModules: ModuleInfo[] = [
  {
    id: 'zero-gravity',
    title: 'Zero-Gravity Navigation',
    description: 'Master movement and orientation in microgravity environments. Learn to navigate the ISS and dock spacecraft.',
    difficulty: 'Beginner',
    duration: '15-20 min',
    icon: '🧑‍🚀',
    color: 'from-blue-500 to-cyan-500',
    objectives: [
      'Understand 3D movement in zero gravity',
      'Practice spacecraft docking maneuvers', 
      'Master attitude control systems',
      'Complete ISS navigation challenges'
    ]
  },
  {
    id: 'oxygen',
    title: 'Oxygen Management',
    description: 'Critical life support simulation. Monitor oxygen levels, detect leaks, and manage emergency situations.',
    difficulty: 'Intermediate',
    duration: '20-25 min',
    icon: '💨',
    color: 'from-green-500 to-emerald-500',
    objectives: [
      'Monitor life support systems',
      'Detect and repair oxygen leaks',
      'Manage CO2 scrubber systems',
      'Handle emergency protocols'
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency Response',
    description: 'High-pressure crisis management. Fire suppression, medical emergencies, and system failures in space.',
    difficulty: 'Advanced',
    duration: '25-30 min',
    icon: '🚨',
    color: 'from-red-500 to-orange-500',
    objectives: [
      'Respond to fire emergencies',
      'Handle medical emergencies',
      'Manage system failures',
      'Coordinate evacuation procedures'
    ]
  }
]

export default function TrainingPage() {
  const [currentModule, setCurrentModule] = useState<TrainingModule>('overview')
  const [completedModules, setCompletedModules] = useState<Set<TrainingModule>>(new Set())
  const [userProgress, setUserProgress] = useState({
    totalScore: 0,
    completedTraining: 0,
    badges: [] as string[]
  })

  const handleModuleComplete = (module: TrainingModule, score: number) => {
    setCompletedModules(prev => new Set([...prev, module]))
    setUserProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + score,
      completedTraining: prev.completedTraining + 1,
      badges: [...prev.badges, `${module}_complete`]
    }))
  }

  const renderOverview = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Astronaut Training
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto px-4">
            Prepare for space missions with realistic simulations and interactive challenges
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="bg-black/40 backdrop-blur rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Training Progress</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-blue-900/30 rounded-xl">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400">{userProgress.completedTraining}</div>
              <div className="text-gray-300 text-sm sm:text-base">Modules Completed</div>
            </div>
            
            <div className="text-center p-4 bg-green-900/30 rounded-xl">
              <div className="text-3xl sm:text-4xl font-bold text-green-400">{userProgress.totalScore}</div>
              <div className="text-gray-300 text-sm sm:text-base">Total Score</div>
            </div>
            
            <div className="text-center p-4 bg-purple-900/30 rounded-xl">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400">{userProgress.badges.length}</div>
              <div className="text-gray-300 text-sm sm:text-base">Badges Earned</div>
            </div>
          </div>
        </motion.div>

        {/* Training Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {trainingModules.map((module, index) => (
            <motion.div
              key={module.id}
              className={`
                bg-gradient-to-br ${module.color} p-1 rounded-2xl cursor-pointer
                transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                touch-manipulation
                ${completedModules.has(module.id) ? 'ring-4 ring-green-400' : ''}
              `}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => setCurrentModule(module.id)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="bg-black/80 backdrop-blur rounded-2xl p-4 sm:p-6 h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{module.icon}</div>
                  <div className="text-right">
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-bold
                      ${module.difficulty === 'Beginner' ? 'bg-green-600' :
                        module.difficulty === 'Intermediate' ? 'bg-yellow-600' : 'bg-red-600'}
                    `}>
                      {module.difficulty}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{module.duration}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{module.title}</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{module.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Learning Objectives:</h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {module.objectives.map((objective, i) => (
                      <li key={i}>• {objective}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Start Training
                  </button>
                  
                  {completedModules.has(module.id) && (
                    <div className="flex items-center text-green-400 text-sm">
                      <span className="mr-1">✅</span>
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          className="mt-12 bg-black/40 backdrop-blur rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4 text-center">Training Statistics</h3>
          
          <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <div className="font-bold text-blue-400">Real Physics</div>
              <div className="text-gray-400">Accurate microgravity simulation</div>
            </div>
            
            <div className="p-3 bg-green-900/20 rounded-lg">
              <div className="font-bold text-green-400">ISS Systems</div>
              <div className="text-gray-400">Authentic space station data</div>
            </div>
            
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <div className="font-bold text-purple-400">NASA Protocols</div>
              <div className="text-gray-400">Official emergency procedures</div>
            </div>
            
            <div className="p-3 bg-orange-900/20 rounded-lg">
              <div className="font-bold text-orange-400">VR Ready</div>
              <div className="text-gray-400">Compatible with VR headsets</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderTrainingModule = () => {
    switch (currentModule) {
      case 'zero-gravity':
        return <ZeroGravityTraining onComplete={(score) => handleModuleComplete('zero-gravity', score)} />
      case 'oxygen':
        return <OxygenManagement onComplete={(score) => handleModuleComplete('oxygen', score)} />
      case 'emergency':
        return <EmergencyResponse onComplete={(score) => handleModuleComplete('emergency', score)} />
      default:
        return renderOverview()
    }
  }

  return (
    <div className="relative">
      {/* Navigation */}
      {currentModule !== 'overview' && (
        <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur rounded-xl p-4">
          <button
            onClick={() => setCurrentModule('overview')}
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
          >
            <span>←</span>
            <span>Back to Training Hub</span>
          </button>
        </div>
      )}
      
      {/* Module Badge */}
      {currentModule !== 'overview' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur rounded-xl p-4">
          {(() => {
            const trainingModule = trainingModules.find(m => m.id === currentModule)
            return trainingModule ? (
              <div className="flex items-center space-x-3 text-white">
                <span className="text-2xl">{trainingModule.icon}</span>
                <div>
                  <div className="font-bold">{trainingModule.title}</div>
                  <div className="text-sm text-gray-400">{trainingModule.difficulty} • {trainingModule.duration}</div>
                </div>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentModule}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTrainingModule()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 
