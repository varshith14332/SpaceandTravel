'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('../../cesium/Globe'), { ssr: false })

// Interfaces for space data
interface ISSData {
  latitude: number
  longitude: number
  altitude: number
  velocity: number
  timestamp: string
}

interface SatelliteData {
  id: string
  name: string
  latitude: number
  longitude: number
  altitude: number
  type: 'GPS' | 'Communication' | 'Weather' | 'Military' | 'Scientific'
  status: 'active' | 'inactive' | 'maintenance'
}

interface SpaceDebrisData {
  id: string
  latitude: number
  longitude: number
  altitude: number
  size: 'small' | 'medium' | 'large'
  risk: 'low' | 'medium' | 'high'
  velocity: number
}

interface AstronautData {
  name: string
  mission: string
  launchDate: string
  nationality: string
  avatar: string
}

// Custom hook for particle background
const useParticleBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
        ctx.fill()

        // Connect nearby particles
        particles.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
}

export default function SpaceDashboard() {
  const [issData, setISSData] = useState<ISSData | null>(null)
  const [satellites, setSatellites] = useState<SatelliteData[]>([])
  const [spaceDebris, setSpaceDebris] = useState<SpaceDebrisData[]>([])
  const [astronauts, setAstronauts] = useState<AstronautData[]>([])
  const [activeView, setActiveView] = useState<'overview' | 'iss' | 'satellites' | 'debris'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showGlobe, setShowGlobe] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  // Remove global currentTime re-render pressure. We'll display a live clock via a lightweight component.

  useParticleBackground()
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ---- Performance Notes ----
  // 1. Frequent (1s) clock updates were causing re-renders of entire dashboard -> flicker of framer-motion animations.
  // 2. We'll extract the clock into a self-updating component so the parent tree stays stable.

  const MissionClock: React.FC = () => {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000)
      return () => clearInterval(id)
    }, [])
    return (
      <div className="text-right">
        <div className="text-xl font-mono text-blue-400">{now.toLocaleTimeString()}</div>
        <div className="text-sm text-gray-400">Mission Time</div>
      </div>
    )
  }
  
  // Simulate real-time data updates
  useEffect(() => {
    // Mock ISS data
    const updateISSData = () => {
      const now = new Date()
      const timeOffset = now.getTime() / 100000
      setISSData({
        latitude: Math.sin(timeOffset * 0.1) * 51.6,
        longitude: (timeOffset * 0.25) % 360 - 180,
        altitude: 408 + Math.sin(timeOffset * 0.05) * 10,
        velocity: 27600,
        timestamp: now.toISOString()
      })
    }

    // Mock satellite data with status
    const generateSatellites = () => {
      const satelliteTypes: SatelliteData['type'][] = ['GPS', 'Communication', 'Weather', 'Military', 'Scientific']
      const statuses: SatelliteData['status'][] = ['active', 'active', 'active', 'inactive', 'maintenance']
      const mockSats: SatelliteData[] = Array.from({ length: 15 }, (_, i) => ({
        id: `SAT-${String(i + 1).padStart(3, '0')}`,
        name: `${satelliteTypes[i % satelliteTypes.length]} Satellite ${i + 1}`,
        latitude: (Math.sin(i * 0.7) * 80),
        longitude: ((i * 24) % 360) - 180,
        altitude: 400 + (i % 5) * 400,
        type: satelliteTypes[i % satelliteTypes.length],
        status: statuses[i % statuses.length]
      }))
      setSatellites(mockSats)
    }

    // Mock space debris data with velocity
    const generateDebris = () => {
      const debrisData: SpaceDebrisData[] = Array.from({ length: 12 }, (_, i) => ({
        id: `DEBRIS-${String(i + 1).padStart(3, '0')}`,
        latitude: (Math.random() - 0.5) * 120,
        longitude: Math.random() * 360 - 180,
        altitude: 300 + Math.random() * 1200,
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
        risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        velocity: 15000 + Math.random() * 10000
      }))
      setSpaceDebris(debrisData)
    }

    // Mock astronaut data with avatars
    const generateAstronauts = () => {
      setAstronauts([
        { name: 'Frank Rubio', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'USA', avatar: '🇺🇸' },
        { name: 'Dmitri Petelin', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'Russia', avatar: '🇷🇺' },
        { name: 'Sergey Prokopyev', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'Russia', avatar: '🇷🇺' },
        { name: 'Josh Cassada', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'USA', avatar: '🇺🇸' },
        { name: 'Nicole Mann', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'USA', avatar: '🇺🇸' },
        { name: 'Koichi Wakata', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'Japan', avatar: '🇯🇵' },
        { name: 'Anna Kikina', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'Russia', avatar: '🇷🇺' }
      ])
    }

    // Initialize data
    updateISSData()
    generateSatellites()
    generateDebris()
    generateAstronauts()
    
    setTimeout(() => setIsLoading(false), 2000) // Longer loading for better UX

    // Update ISS position every 3 seconds
    const interval = setInterval(updateISSData, 3000)
    return () => clearInterval(interval)
  }, [])

  const StatCard = React.memo(({ title, value, unit, icon, color, trend, trendValue }: {
    title: string
    value: string | number
    unit?: string
    icon: string
    color: string
    trend?: 'up' | 'down' | 'stable'
    trendValue?: string
  }) => (
    <motion.div
      className={`relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/50 group hover:border-blue-500/50 transition-all duration-300`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Glowing border effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${color.replace('border-', 'from-').replace('-500', '-500/20')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.span 
            className="text-3xl filter drop-shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
          {trend && (
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-green-500/20 text-green-400' :
              trend === 'down' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <motion.div 
            className="text-3xl font-bold text-white mb-1 font-mono"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
          </motion.div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">{title}</div>
        </div>
      </div>
    </motion.div>
  ))

  const NavigationButton = React.memo(({ view, active, onClick, icon, label }: {
    view: string
    active: boolean
    onClick: () => void
    icon: string
    label: string
  }) => (
    <motion.button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500/50'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      
      {active && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  ))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-black flex items-center justify-center relative overflow-hidden">
        {/* Particle background */}
        <canvas id="particle-canvas" className="absolute inset-0" />
        
        <div className="relative z-10 text-center">
          <motion.div
            className="w-24 h-24 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8 p-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
              <div className="text-3xl">🛰️</div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Space Mission Control
          </motion.h1>
          
          <motion.h2 
            className="text-xl font-semibold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Initializing orbital tracking systems...
          </motion.h2>
          <motion.div 
            className="flex space-x-2 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-black text-white relative overflow-hidden">
      {/* Particle background */}
      <canvas id="particle-canvas" className="absolute inset-0 opacity-30" />
      
      {/* Header */}
      <div className="relative z-10 bg-black/30 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Logo and Title */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg" >
                🛰️
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Space Mission Control</h1>
                <p className="text-gray-400 mt-1">Real-time orbital tracking & monitoring</p>
              </div>
            </motion.div>

            {/* Live Status and Time */}
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <MissionClock />
              
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">SYSTEMS ONLINE</span>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <motion.div 
            className="flex flex-wrap gap-3 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <NavigationButton
              view="overview"
              active={activeView === 'overview'}
              onClick={() => setActiveView('overview')}
              icon="🌍"
              label="Mission Overview"
            />
            <NavigationButton
              view="iss"
              active={activeView === 'iss'}
              onClick={() => setActiveView('iss')}
              icon="🛰️"
              label="ISS Tracking"
            />
            <NavigationButton
              view="satellites"
              active={activeView === 'satellites'}
              onClick={() => setActiveView('satellites')}
              icon="📡"
              label="Satellites"
            />
            <NavigationButton
              view="debris"
              active={activeView === 'debris'}
              onClick={() => setActiveView('debris')}
              icon="🛑"
              label="Space Debris"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="grid xl:grid-cols-4 gap-6">
          {/* Left Sidebar - ISS Status and Quick Stats */}
          <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
            {/* ISS Live Status */}
            <motion.div
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ISS Live Status
                  </h2>
                  <motion.div
                    className="flex items-center space-x-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                    <span className="text-green-400 text-sm font-medium">LIVE</span>
                  </motion.div>
                </div>
                
                {issData && (
                  <div className="space-y-4">
                    {[
                      { label: 'Latitude', value: `${issData.latitude.toFixed(4)}°`, icon: '🌐' },
                      { label: 'Longitude', value: `${issData.longitude.toFixed(4)}°`, icon: '🌍' },
                      { label: 'Altitude', value: `${issData.altitude.toFixed(1)} km`, icon: '📏' },
                      { label: 'Velocity', value: `${issData.velocity.toLocaleString()} km/h`, icon: '⚡' }
                    ].map((item, index) => (
                      <motion.div 
                        key={item.label}
                        className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-gray-400">{item.label}</span>
                        </div>
                        <span className="font-mono text-white font-medium">{item.value}</span>
                      </motion.div>
                    ))}
                    
                    <div className="mt-4 text-center">
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(issData.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Active Satellites"
                value={satellites.filter(s => s.status === 'active').length}
                icon="📡"
                color="border-green-500"
                trend="up"
                trendValue="12%"
              />
              <StatCard
                title="Space Debris"
                value={spaceDebris.length}
                icon="🛑"
                color="border-red-500"
                trend="stable"
                trendValue="0%"
              />
              <StatCard
                title="Crew in Space"
                value={astronauts.length}
                icon="👨‍🚀"
                color="border-blue-500"
                trend="up"
                trendValue="2"
              />
              <StatCard
                title="Orbit Velocity"
                value="7.66"
                unit="km/s"
                icon="⚡"
                color="border-purple-500"
                trend="stable"
              />
            </div>

            {/* Astronauts Panel */}
            <motion.div
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30 relative overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Current Crew
              </h2>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {astronauts.map((astronaut, index) => (
                  <motion.div 
                    key={astronaut.name}
                    className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-4 hover:from-gray-600/50 hover:to-gray-500/50 transition-all duration-300 border border-gray-600/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{astronaut.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{astronaut.name}</div>
                        <div className="text-sm text-gray-400 truncate">{astronaut.nationality}</div>
                        <div className="text-xs text-gray-500 truncate">{astronaut.mission}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6 order-1 xl:order-2">
            {/* 3D Globe Section */}
            <motion.div
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-600/30 overflow-hidden shadow-2xl relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ height: isMobile ? '500px' : '600px' }}
            >
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Live Earth Visualization
                  </h2>
                  <p className="text-gray-400 mt-1">Real-time orbital tracking display</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                    showGlobe ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${showGlobe ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className="text-sm font-medium">
                      {showGlobe ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={() => setShowGlobe(!showGlobe)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      showGlobe 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showGlobe ? 'Disable Globe' : 'Enable Globe'}
                  </motion.button>
                </div>
              </div>
              
              <div className="relative h-full">
                {showGlobe ? (
                  <div className="w-full h-full">
                    <Globe />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800/50 to-gray-700/50">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-50">🌍</div>
                      <div className="text-xl text-gray-400 mb-2">Globe Visualization Disabled</div>
                      <div className="text-sm text-gray-500">Click "Enable Globe" to view 3D tracking</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Dynamic Content Based on Active View */}
            <AnimatePresence mode="wait">
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {/* Mission Statistics */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30">
                    <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Mission Statistics
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                        <span className="text-gray-400">Total Objects Tracked</span>
                        <span className="text-2xl font-bold text-white">{satellites.length + spaceDebris.length + 1}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                        <span className="text-gray-400">Active Satellites</span>
                        <span className="text-2xl font-bold text-green-400">{satellites.filter(s => s.status === 'active').length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                        <span className="text-gray-400">High Risk Debris</span>
                        <span className="text-2xl font-bold text-red-400">{spaceDebris.filter(d => d.risk === 'high').length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-400">Mission Duration</span>
                        <span className="text-2xl font-bold text-blue-400">24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30">
                    <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      System Health
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { system: 'Tracking Radar', status: 'Operational', health: 98 },
                        { system: 'Communication Array', status: 'Operational', health: 95 },
                        { system: 'Data Processing', status: 'Operational', health: 99 },
                        { system: 'Backup Systems', status: 'Standby', health: 87 }
                      ].map((item, index) => (
                        <motion.div
                          key={item.system}
                          className="bg-gray-700/30 rounded-lg p-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">{item.system}</span>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              item.status === 'Operational' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-600/50 rounded-full h-2">
                              <motion.div
                                className={`h-full rounded-full ${
                                  item.health >= 95 ? 'bg-green-500' :
                                  item.health >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.health}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                              />
                            </div>
                            <span className="text-sm font-mono text-gray-300">{item.health}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'iss' && (
                <motion.div
                  key="iss"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
                >
                  <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    International Space Station Details
                  </h3>
                  
                  {issData && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard
                        title="Current Altitude"
                        value={issData.altitude.toFixed(1)}
                        unit="km"
                        icon="📏"
                        color="border-blue-500"
                        trend="stable"
                        trendValue="±2km"
                      />
                      <StatCard
                        title="Orbital Velocity"
                        value={(issData.velocity / 1000).toFixed(2)}
                        unit="km/s"
                        icon="⚡"
                        color="border-purple-500"
                        trend="stable"
                      />
                      <StatCard
                        title="Orbital Period"
                        value="92.7"
                        unit="min"
                        icon="🔄"
                        color="border-green-500"
                        trend="stable"
                      />
                      <StatCard
                        title="Daily Orbits"
                        value="15.5"
                        unit="orbits"
                        icon="🌍"
                        color="border-yellow-500"
                        trend="stable"
                      />
                    </div>
                  )}
                  
                  <div className="mt-8 bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold mb-4 text-white">Mission Information</h4>
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="text-gray-400 mb-2">Launch Date</div>
                        <div className="text-white font-medium">November 20, 1998</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-2">Mass</div>
                        <div className="text-white font-medium">~420,000 kg</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-2">Dimensions</div>
                        <div className="text-white font-medium">109m × 73m × 20m</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-2">Solar Array Area</div>
                        <div className="text-white font-medium">2,500 m²</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'satellites' && (
                <motion.div
                  key="satellites"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Satellite Network Status
                    </h3>
                    
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">{satellites.filter(s => s.status === 'active').length} Active</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-400 text-sm">{satellites.filter(s => s.status === 'inactive').length} Inactive</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {satellites.map((satellite, index) => (
                      <motion.div
                        key={satellite.id}
                        className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-4 hover:from-gray-600/50 hover:to-gray-500/50 transition-all duration-300 border border-gray-600/30"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                            <div className="text-2xl">📡</div>
                            <div>
                              <div className="font-bold text-white">{satellite.name}</div>
                              <div className="text-sm text-gray-400">{satellite.id} • {satellite.type}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-sm font-mono text-gray-300">
                                {satellite.latitude.toFixed(2)}°, {satellite.longitude.toFixed(2)}°
                              </div>
                              <div className="text-xs text-gray-500">
                                Alt: {satellite.altitude.toFixed(0)} km
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              satellite.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              satellite.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {satellite.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'debris' && (
                <motion.div
                  key="debris"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                      Space Debris Monitoring
                    </h3>
                    
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      {['high', 'medium', 'low'].map((risk) => (
                        <div key={risk} className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                          risk === 'high' ? 'bg-red-500/20' :
                          risk === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            risk === 'high' ? 'bg-red-500' :
                            risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className={`text-sm ${
                            risk === 'high' ? 'text-red-400' :
                            risk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {spaceDebris.filter(d => d.risk === risk).length} {risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {spaceDebris
                      .sort((a, b) => {
                        const riskOrder = { high: 3, medium: 2, low: 1 }
                        return riskOrder[b.risk] - riskOrder[a.risk]
                      })
                      .map((debris, index) => (
                        <motion.div
                          key={debris.id}
                          className={`bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-4 hover:from-gray-600/50 hover:to-gray-500/50 transition-all duration-300 border ${
                            debris.risk === 'high' ? 'border-red-500/50' :
                            debris.risk === 'medium' ? 'border-yellow-500/50' : 'border-green-500/50'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                              <div className="text-2xl">🛑</div>
                              <div>
                                <div className="font-bold text-white">{debris.id}</div>
                                <div className="text-sm text-gray-400">Size: {debris.size} • Velocity: {debris.velocity.toLocaleString()} km/h</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="text-sm font-mono text-gray-300">
                                  {debris.latitude.toFixed(2)}°, {debris.longitude.toFixed(2)}°
                                </div>
                                <div className="text-xs text-gray-500">
                                  Alt: {debris.altitude.toFixed(0)} km
                                </div>
                              </div>
                              
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                debris.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                                debris.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {debris.risk.toUpperCase()} RISK
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  )
}