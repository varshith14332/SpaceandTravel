'use client'

import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Loader from '@/components/Loader'

const AiChatbot = dynamic(() => import('@/components/AiChatbot'), {
  ssr: false,
  loading: () => <Loader />
})

interface ChatSettings {
  isMinimized: boolean
  theme: 'dark' | 'light'
}

export default function ChatPage() {
  const [settings, setSettings] = useState<ChatSettings>({
    isMinimized: false,
    theme: 'dark'
  })
  const [isApiRunning, setIsApiRunning] = useState<boolean | null>(null)

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/health')
      setIsApiRunning(response.ok)
    } catch (error) {
      setIsApiRunning(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-4">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🤖 AI Space Assistant
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ask me anything about space exploration, astronaut life, spacecraft technology, or the mysteries of the universe!
          </p>
        </motion.div>

        {/* API Status Check */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isApiRunning === null ? 'bg-yellow-500 animate-pulse' :
                  isApiRunning ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-white">
                  Flask API Status: {
                    isApiRunning === null ? 'Checking...' :
                    isApiRunning ? 'Connected' : 'Disconnected'
                  }
                </span>
              </div>
              <button
                onClick={checkApiStatus}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Check Status
              </button>
            </div>
            {isApiRunning === false && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
              >
                <h4 className="text-red-300 font-semibold mb-2">API Server Not Running</h4>
                <p className="text-red-200 text-sm mb-3">
                  To use the AI chatbot, you need to start the Flask API server:
                </p>
                <div className="bg-black/50 rounded p-3 font-mono text-sm text-gray-300">
                  <p>cd flask-api</p>
                  <p>pip install -r requirements.txt</p>
                  <p>python app.py</p>
                </div>
                <p className="text-red-200 text-sm mt-2">
                  The server should start on http://localhost:5000
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Features Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">🚀 Chat Features</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Space knowledge base with 6 topic areas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Confidence scoring for responses</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Source attribution and references</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Smart follow-up suggestions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Real-time conversation history</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">📚 Knowledge Areas</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-purple-600/20 rounded p-2">
                    <span className="text-purple-300 font-semibold">Space Basics</span>
                    <p className="text-gray-400 text-xs mt-1">Gravity, orbits, vacuum of space</p>
                  </div>
                  <div className="bg-blue-600/20 rounded p-2">
                    <span className="text-blue-300 font-semibold">Astronaut Life</span>
                    <p className="text-gray-400 text-xs mt-1">Training, daily life, spacewalks</p>
                  </div>
                  <div className="bg-green-600/20 rounded p-2">
                    <span className="text-green-300 font-semibold">Spacecraft</span>
                    <p className="text-gray-400 text-xs mt-1">Rockets, ISS, propulsion</p>
                  </div>
                  <div className="bg-yellow-600/20 rounded p-2">
                    <span className="text-yellow-300 font-semibold">Space Missions</span>
                    <p className="text-gray-400 text-xs mt-1">Apollo, Mars, exploration</p>
                  </div>
                  <div className="bg-red-600/20 rounded p-2">
                    <span className="text-red-300 font-semibold">Planetary Science</span>
                    <p className="text-gray-400 text-xs mt-1">Planets, moons, celestial bodies</p>
                  </div>
                  <div className="bg-indigo-600/20 rounded p-2">
                    <span className="text-indigo-300 font-semibold">Space History</span>
                    <p className="text-gray-400 text-xs mt-1">Milestones, space race, pioneers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Suspense fallback={<Loader />}>
                <AiChatbot />
              </Suspense>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            This AI chatbot uses a custom knowledge base to answer space-related questions.
            It&apos;s powered by pattern matching and confidence scoring algorithms.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}