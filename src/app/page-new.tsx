'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useTheme, themeStyles } from '@/contexts/ThemeContext'

// Dynamically import heavy 3D components to avoid SSR issues
const SpaceEnvironment = dynamic(() => import('../three/SpaceEnvironment'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading Space Environment...</div>
})

const RocketScene = dynamic(() => import('../three/RocketScene'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading Rocket Simulator...</div>
})

const OrbitSimulation = dynamic(() => import('../three/OrbitSimulation'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading Orbital Mechanics...</div>
})

const Globe = dynamic(() => import('../cesium/Globe'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading Earth Globe...</div>
})

const SatelliteTracker = dynamic(() => import('../cesium/SatelliteTracker'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center bg-black text-white">Loading Satellite Tracker...</div>
})

// Navigation interface
type SceneType = 'home' | 'space' | 'rocket' | 'missions' | 'orbit' | 'earth' | 'satellites'

interface NavItem {
  id: SceneType
  name: string
  icon: string
  description: string
}

const navItems: NavItem[] = [
  {
    id: 'home',
    name: 'Home',
    icon: '🏠',
    description: 'Welcome to the Space Mission Platform'
  },
  {
    id: 'space',
    name: 'Space Environment',
    icon: '🌌',
    description: '3D space exploration with stars and nebulae'
  },
  {
    id: 'rocket',
    name: 'Rocket Simulator',
    icon: '🚀',
    description: 'Interactive rocket physics simulation'
  },
  {
    id: 'missions',
    name: 'Mission Control',
    icon: '🎮',
    description: 'Space mission planning and execution'
  },
  {
    id: 'orbit',
    name: 'Orbital Mechanics',
    icon: '🌍',
    description: 'Learn orbital physics and satellite trajectories'
  },
  {
    id: 'earth',
    name: 'Earth Globe',
    icon: '🌍',
    description: '3D Earth with live space data'
  },
  {
    id: 'satellites',
    name: 'Satellite Tracker',
    icon: '📡',
    description: 'Real-time satellite tracking & prediction'
  }
]

// Hero section component
function HeroSection() {
  const { theme, isDark } = useTheme()
  
  // Generate deterministic star positions to avoid hydration issues
  const starPositions = Array.from({ length: 100 }, (_, i) => {
    // Use index-based seeded values instead of Math.random()
    const seed = i * 2654435761; // Large prime for distribution
    const x = (seed % 10000) / 100; // 0-100
    const y = ((seed * 997) % 10000) / 100; // 0-100
    const duration = 2 + ((seed * 1009) % 3000) / 1000; // 2-5 seconds
    const delay = ((seed * 1013) % 2000) / 1000; // 0-2 seconds
    
    return { x, y, duration, delay };
  });

  return (
    <div className={`${themeStyles.pageBackground(theme)} relative overflow-hidden`}>
      {/* Animated background stars/particles */}
      <div className="absolute inset-0">
        {starPositions.map((star, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              isDark ? 'bg-white' : 'bg-yellow-400'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className={`text-6xl md:text-8xl font-bold mb-6 ${
            isDark 
              ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
          }`}>
            SPACE MISSION
          </h1>
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 ${
            isDark ? 'text-cyan-300' : 'text-indigo-600'
          }`}>
            PLATFORM
          </h2>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 ${
            isDark ? 'text-gray-300' : 'text-slate-700'
          }`}>
            Explore the cosmos with cutting-edge simulations, real-time satellite tracking, 
            and interactive space missions. Built with Three.js, CesiumJS, and advanced physics engines.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <motion.button
              className={themeStyles.primaryButton(theme)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Mission 🚀
            </motion.button>
            <motion.button
              className={themeStyles.secondaryButton(theme)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Tutorials 📚
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className={`${themeStyles.card(theme)} p-4`}>
            <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-indigo-600'}`}>5000+</div>
            <div className={themeStyles.bodyText(theme)}>Active Satellites</div>
          </div>
          <div className={`${themeStyles.card(theme)} p-4`}>
            <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>34K+</div>
            <div className={themeStyles.bodyText(theme)}>Space Objects</div>
          </div>
          <div className={`${themeStyles.card(theme)} p-4`}>
            <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>408km</div>
            <div className={themeStyles.bodyText(theme)}>ISS Altitude</div>
          </div>
          <div className={`${themeStyles.card(theme)} p-4`}>
            <div className={`text-3xl font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>17.5K</div>
            <div className={themeStyles.bodyText(theme)}>mph ISS Speed</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Scene navigation component
function SceneNavigation({ currentScene, onSceneChange }: {
  currentScene: SceneType
  onSceneChange: (scene: SceneType) => void
}) {
  const { theme, isDark } = useTheme()
  
  return (
    <div className={`fixed top-4 left-4 z-50 ${themeStyles.card(theme)} p-4`}>
      <div className="grid grid-cols-2 gap-2 max-w-xs">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onSceneChange(item.id)}
            className={`
              p-3 rounded-xl text-center transition-all duration-300
              ${currentScene === item.id 
                ? isDark 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-indigo-600 text-white'
                : isDark
                  ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={item.description}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs">{item.name}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Scene info component
function SceneInfo({ scene }: { scene: NavItem }) {
  const { theme } = useTheme()
  
  return (
    <motion.div
      className={`fixed bottom-4 left-4 z-50 ${themeStyles.card(theme)} p-4 max-w-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-3xl">{scene.icon}</span>
        <h3 className={`text-xl font-bold ${themeStyles.heading(theme)}`}>{scene.name}</h3>
      </div>
      <p className={`text-sm ${themeStyles.bodyText(theme)}`}>{scene.description}</p>
    </motion.div>
  )
}

// Main app component
export default function SpaceMissionPlatform() {
  const [currentScene, setCurrentScene] = useState<SceneType>('home')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { theme, isDark } = useTheme()

  const handleSceneChange = (newScene: SceneType) => {
    if (newScene === currentScene) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScene(newScene)
      setIsTransitioning(false)
    }, 300)
  }

  const renderScene = () => {
    if (isTransitioning) {
      return (
        <div className={`w-full h-screen flex items-center justify-center ${themeStyles.pageBackground(theme)}`}>
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${
              isDark ? 'border-blue-500' : 'border-indigo-500'
            }`}></div>
            <p className={themeStyles.bodyText(theme)}>Loading Scene...</p>
          </motion.div>
        </div>
      )
    }

    switch (currentScene) {
      case 'home':
        return <HeroSection />
      case 'space':
        return <SpaceEnvironment />
      case 'rocket':
        return <RocketScene />
      case 'missions':
        return <div className={`w-full h-screen flex items-center justify-center ${themeStyles.pageBackground(theme)}`}>
          <p className={themeStyles.bodyText(theme)}>Mission Simulator Coming Soon</p>
        </div>
      case 'orbit':
        return <OrbitSimulation />
      case 'earth':
        return <Globe />
      case 'satellites':
        return <SatelliteTracker />
      default:
        return <HeroSection />
    }
  }

  const currentNavItem = navItems.find(item => item.id === currentScene) || navItems[0]

  return (
    <div className={`relative w-full h-screen overflow-hidden ${themeStyles.pageBackground(theme)}`}>
      {/* Scene Navigation */}
      <SceneNavigation 
        currentScene={currentScene} 
        onSceneChange={handleSceneChange} 
      />

      {/* Scene Info */}
      <AnimatePresence mode="wait">
        {currentScene !== 'home' && (
          <SceneInfo key={currentScene} scene={currentNavItem} />
        )}
      </AnimatePresence>

      {/* Scene Renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>

      {/* Loading overlay */}
      {isTransitioning && (
        <motion.div
          className={`fixed inset-0 z-40 flex items-center justify-center ${
            isDark ? 'bg-black/50' : 'bg-white/50'
          } backdrop-blur`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <motion.div
              className={`w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4 ${
                isDark 
                  ? 'border-blue-500' 
                  : 'border-indigo-500'
              }`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className={themeStyles.bodyText(theme)}>Transitioning to {currentNavItem.name}...</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}