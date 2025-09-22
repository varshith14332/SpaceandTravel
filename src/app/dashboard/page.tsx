'use client'

import React, { useState, useEffect } from 'react'
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
}

interface SpaceDebrisData {
  id: string
  latitude: number
  longitude: number
  altitude: number
  size: 'small' | 'medium' | 'large'
  risk: 'low' | 'medium' | 'high'
}

interface AstronautData {
  name: string
  mission: string
  launchDate: string
  nationality: string
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
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Simulate real-time data updates
  useEffect(() => {
    // Mock ISS data (in real implementation, this would come from ISS API)
    const updateISSData = () => {
      const now = new Date()
      // Simulate ISS orbital movement
      const timeOffset = now.getTime() / 100000
      setISSData({
        latitude: Math.sin(timeOffset * 0.1) * 51.6, // ISS orbital inclination ~51.6°
        longitude: (timeOffset * 0.25) % 360 - 180,
        altitude: 408 + Math.sin(timeOffset * 0.05) * 10, // ~408km with variation
        velocity: 27600, // ~27,600 km/h
        timestamp: now.toISOString()
      })
    }

    // Mock satellite data
    const generateSatellites = () => {
      const satelliteTypes: SatelliteData['type'][] = ['GPS', 'Communication', 'Weather', 'Military', 'Scientific']
      const mockSats: SatelliteData[] = Array.from({ length: 12 }, (_, i) => ({
        id: `SAT-${String(i + 1).padStart(3, '0')}`,
        name: `${satelliteTypes[i % satelliteTypes.length]} Satellite ${i + 1}`,
        latitude: (Math.sin(i * 0.7) * 80), // Distribute across latitudes
        longitude: ((i * 30) % 360) - 180,
        altitude: 400 + (i % 4) * 500, // Various orbital altitudes
        type: satelliteTypes[i % satelliteTypes.length]
      }))
      setSatellites(mockSats)
    }

    // Mock space debris data
    const generateDebris = () => {
      const debrisData: SpaceDebrisData[] = Array.from({ length: 8 }, (_, i) => ({
        id: `DEBRIS-${String(i + 1).padStart(3, '0')}`,
        latitude: (Math.random() - 0.5) * 120, // Random distribution
        longitude: Math.random() * 360 - 180,
        altitude: 300 + Math.random() * 1200, // LEO debris
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
        risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
      }))
      setSpaceDebris(debrisData)
    }

    // Mock astronaut data
    const generateAstronauts = () => {
      setAstronauts([
        { name: 'Frank Rubio', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'USA' },
        { name: 'Dmitri Petelin', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'Russia' },
        { name: 'Sergey Prokopyev', mission: 'ISS Expedition 68-69', launchDate: '2022-09-21', nationality: 'Russia' },
        { name: 'Josh Cassada', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'USA' },
        { name: 'Nicole Mann', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'USA' },
        { name: 'Koichi Wakata', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'Japan' },
        { name: 'Anna Kikina', mission: 'ISS Expedition 68', launchDate: '2022-10-05', nationality: 'Russia' }
      ])
    }

    // Initialize data
    updateISSData()
    generateSatellites()
    generateDebris()
    generateAstronauts()
    setIsLoading(false)

    // Update ISS position every 5 seconds
    const interval = setInterval(updateISSData, 5000)
    return () => clearInterval(interval)
  }, [])

  const StatCard = ({ title, value, unit, icon, color }: {
    title: string
    value: string | number
    unit?: string
    icon: string
    color: string
  }) => (
    <motion.div
      className={`bg-gray-800/80 backdrop-blur rounded-xl p-6 border ${color}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {value} {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
          <div className="text-sm text-gray-400">{title}</div>
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white text-xl">Loading Space Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-gray-700 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">🛰️ Space Mission Dashboard</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Real-time space tracking and monitoring</p>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:space-x-4">
              {['overview', 'iss', 'satellites', 'debris'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as 'overview' | 'iss' | 'satellites' | 'debris')}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors touch-manipulation ${
                    activeView === view 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Panel - Stats and Controls */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* ISS Status */}
            <motion.div
              className="bg-gray-800/80 backdrop-blur rounded-xl p-4 sm:p-6 border border-blue-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                🛰️ ISS Live Status
                <motion.div
                  className="w-3 h-3 bg-green-500 rounded-full ml-2"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </h2>
              
              {issData && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latitude:</span>
                    <span className="font-mono">{issData.latitude.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Longitude:</span>
                    <span className="font-mono">{issData.longitude.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Altitude:</span>
                    <span className="font-mono">{issData.altitude.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Velocity:</span>
                    <span className="font-mono">{issData.velocity.toLocaleString()} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Updated:</span>
                    <span className="text-xs font-mono">{new Date(issData.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Active Satellites"
                value={satellites.length}
                icon="📡"
                color="border-green-500"
              />
              <StatCard
                title="Space Debris"
                value={spaceDebris.length}
                icon="🛑"
                color="border-red-500"
              />
              <StatCard
                title="Astronauts in Space"
                value={astronauts.length}
                icon="👨‍🚀"
                color="border-blue-500"
              />
              <StatCard
                title="Orbital Velocity"
                value="7.66"
                unit="km/s"
                icon="⚡"
                color="border-purple-500"
              />
            </div>

            {/* Current Astronauts */}
            <motion.div
              className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4">👨‍🚀 Current Astronauts</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {astronauts.map((astronaut, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                    <div className="font-bold">{astronaut.name}</div>
                    <div className="text-sm text-gray-400">{astronaut.nationality}</div>
                    <div className="text-xs text-gray-500">{astronaut.mission}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - 3D Globe and Data */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Globe Container */}
            <motion.div
              className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-600 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ height: isMobile ? '400px' : '500px' }}
            >
              <div className="p-3 sm:p-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-bold">🌍 Live Earth View</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowGlobe(!showGlobe)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors touch-manipulation text-sm"
                  >
                    {showGlobe ? 'Hide' : 'Show'} Globe
                  </button>
                </div>
              </div>
              
              <div className="relative h-full">
                {showGlobe && (
                  <Globe
                    showSatellites={activeView === 'overview' || activeView === 'satellites'}
                    showISS={activeView === 'overview' || activeView === 'iss'}
                    showDebris={activeView === 'overview' || activeView === 'debris'}
                    showWeather={true}
                  />
                )}
                
                {!showGlobe && (
                  <div className="flex items-center justify-center h-full bg-gray-900">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🌍</div>
                      <p className="text-gray-400">3D Globe view disabled</p>
                      <button
                        onClick={() => setShowGlobe(true)}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Enable Globe View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Data Tables */}
            <AnimatePresence mode="wait">
              {activeView === 'satellites' && (
                <motion.div
                  className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-4">📡 Active Satellites</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Altitude</th>
                          <th className="text-left p-2">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {satellites.map((sat) => (
                          <tr key={sat.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                            <td className="p-2 font-mono">{sat.id}</td>
                            <td className="p-2">{sat.name}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                sat.type === 'GPS' ? 'bg-green-900 text-green-300' :
                                sat.type === 'Communication' ? 'bg-blue-900 text-blue-300' :
                                sat.type === 'Weather' ? 'bg-yellow-900 text-yellow-300' :
                                sat.type === 'Military' ? 'bg-red-900 text-red-300' :
                                'bg-purple-900 text-purple-300'
                              }`}>
                                {sat.type}
                              </span>
                            </td>
                            <td className="p-2 font-mono">{sat.altitude.toFixed(0)} km</td>
                            <td className="p-2 font-mono">
                              {sat.latitude.toFixed(2)}°, {sat.longitude.toFixed(2)}°
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeView === 'debris' && (
                <motion.div
                  className="bg-gray-800/80 backdrop-blur rounded-xl p-6 border border-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold mb-4">🛑 Space Debris Tracking</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Risk Level</th>
                          <th className="text-left p-2">Altitude</th>
                          <th className="text-left p-2">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spaceDebris.map((debris) => (
                          <tr key={debris.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                            <td className="p-2 font-mono">{debris.id}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                debris.size === 'small' ? 'bg-gray-700 text-gray-300' :
                                debris.size === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-orange-900 text-orange-300'
                              }`}>
                                {debris.size}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                debris.risk === 'low' ? 'bg-green-900 text-green-300' :
                                debris.risk === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-red-900 text-red-300'
                              }`}>
                                {debris.risk}
                              </span>
                            </td>
                            <td className="p-2 font-mono">{debris.altitude.toFixed(0)} km</td>
                            <td className="p-2 font-mono">
                              {debris.latitude.toFixed(2)}°, {debris.longitude.toFixed(2)}°
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
} 
