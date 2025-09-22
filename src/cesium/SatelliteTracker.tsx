'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// TLE (Two-Line Element) data structure
interface TLEData {
  name: string
  line1: string
  line2: string
  noradId: string
}

// Satellite position interface
interface SatellitePosition {
  latitude: number
  longitude: number
  altitude: number
  azimuth: number
  elevation: number
  range: number
  velocity: number
  timestamp: Date
}

// Enhanced satellite interface
interface Satellite {
  id: string
  name: string
  noradId: string
  type: 'ISS' | 'GPS' | 'STARLINK' | 'WEATHER' | 'MILITARY' | 'DEBRIS' | 'SCIENTIFIC'
  position: SatellitePosition
  tle?: TLEData
  isVisible: boolean
  nextPass?: {
    aos: Date
    los: Date
    maxElevation: number
  }
}

// Mock TLE data (in production, fetch from Celestrak or similar)
const mockTLEData: Record<string, TLEData> = {
  'ISS': {
    name: 'ISS (ZARYA)',
    line1: '1 25544U 98067A   21001.00000000  .00001000  00000-0  23027-4 0  9990',
    line2: '2 25544  51.6461 339.2971 0002259  83.2943 276.8892 15.48919893260624',
    noradId: '25544'
  },
  'GPS-1': {
    name: 'GPS BIIR-2  (PRN 13)',
    line1: '1 24876U 97035A   21001.00000000 -.00000020  00000-0  00000+0 0  9991',
    line2: '2 24876  55.0445 123.4561 0045392 312.4421  47.2344  2.00565315170624',
    noradId: '24876'
  },
  'STARLINK-1': {
    name: 'STARLINK-1007',
    line1: '1 44713U 19074A   21001.00000000  .00002182  00000-0  15749-3 0  9991',
    line2: '2 44713  53.0530 339.3681 0001413  94.6298 265.5084 15.06416058 67890',
    noradId: '44713'
  }
}

// Generate realistic satellite positions (simplified orbital mechanics)
function generateSatellitePosition(noradId: string, timestamp: Date): SatellitePosition {
  const baseTime = timestamp.getTime() / 1000
  
  // Different orbital parameters for different satellite types
  const orbitalData: Record<string, { altitude: number; period: number; inclination: number }> = {
    'ISS': { altitude: 408, period: 5580, inclination: 51.6 },
    'GPS-1': { altitude: 20200, period: 43200, inclination: 55.0 },
    'STARLINK-1': { altitude: 550, period: 5760, inclination: 53.0 }
  }
  
  const sat = orbitalData[noradId] || orbitalData['ISS']
  const meanMotion = 2 * Math.PI / sat.period
  const meanAnomaly = (baseTime * meanMotion) % (2 * Math.PI)
  
  // Simple circular orbit calculation
  const latitude = sat.inclination * Math.sin(meanAnomaly * 2.3) * Math.cos(baseTime * 0.001)
  const longitude = ((meanAnomaly * 180 / Math.PI * 4) % 360) - 180
  
  return {
    latitude: Math.max(-90, Math.min(90, latitude)),
    longitude: Math.max(-180, Math.min(180, longitude)),
    altitude: sat.altitude + Math.sin(meanAnomaly * 3) * 20,
    azimuth: (meanAnomaly * 180 / Math.PI) % 360,
    elevation: Math.max(0, Math.sin(meanAnomaly) * 90),
    range: sat.altitude / Math.cos((latitude * Math.PI) / 180),
    velocity: Math.sqrt(398600.4418 / sat.altitude),
    timestamp
  }
}

// Real-time satellite tracker component
export default function SatelliteTracker() {
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null)
  const [updateInterval, setUpdateInterval] = useState(1000) // ms
  const [showOrbits, setShowOrbits] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize satellites
  useEffect(() => {
    const initialSatellites: Satellite[] = [
      {
        id: 'ISS',
        name: 'International Space Station',
        noradId: '25544',
        type: 'ISS',
        position: generateSatellitePosition('ISS', new Date()),
        tle: mockTLEData['ISS'],
        isVisible: true
      },
      {
        id: 'GPS-1',
        name: 'GPS Block IIR-2',
        noradId: '24876',
        type: 'GPS',
        position: generateSatellitePosition('GPS-1', new Date()),
        tle: mockTLEData['GPS-1'],
        isVisible: true
      },
      {
        id: 'STARLINK-1',
        name: 'Starlink-1007',
        noradId: '44713',
        type: 'STARLINK',
        position: generateSatellitePosition('STARLINK-1', new Date()),
        tle: mockTLEData['STARLINK-1'],
        isVisible: true
      },
      // Add more mock satellites
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `SAT-${i + 4}`,
        name: `Satellite ${i + 4}`,
        noradId: `${40000 + i}`,
        type: ['GPS', 'STARLINK', 'WEATHER', 'SCIENTIFIC'][i % 4] as Satellite['type'],
        position: generateSatellitePosition('GPS-1', new Date()),
        isVisible: Math.random() > 0.3
      }))
    ]
    
    setSatellites(initialSatellites)
  }, [])

  // Update satellite positions
  useEffect(() => {
    const updatePositions = () => {
      setSatellites(prev => prev.map(sat => ({
        ...sat,
        position: generateSatellitePosition(sat.id, new Date())
      })))
    }

    intervalRef.current = setInterval(updatePositions, updateInterval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [updateInterval])

  // Filter satellites
  const filteredSatellites = satellites.filter(sat => {
    if (filterType === 'ALL') return true
    if (filterType === 'VISIBLE') return sat.isVisible
    return sat.type === filterType
  })

  // Get satellite icon and color
  const getSatelliteStyle = (type: Satellite['type']) => {
    const styles = {
      ISS: { color: '#FF6B35', icon: '🛰️', size: 'large' },
      GPS: { color: '#4ECDC4', icon: '📡', size: 'medium' },
      STARLINK: { color: '#45B7D1', icon: '🌐', size: 'small' },
      WEATHER: { color: '#96CEB4', icon: '🌤️', size: 'medium' },
      MILITARY: { color: '#FECA57', icon: '🎯', size: 'medium' },
      DEBRIS: { color: '#FF6B6B', icon: '💥', size: 'small' },
      SCIENTIFIC: { color: '#A8E6CF', icon: '🔬', size: 'medium' }
    }
    return styles[type] || styles.ISS
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🛰️ Real-Time Satellite Tracker</h2>
        <div className="text-sm space-y-1">
          <div>Tracking: {filteredSatellites.length} satellites</div>
          <div>Visible from your location: {filteredSatellites.filter(s => s.isVisible).length}</div>
          <div>Last update: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur p-4 rounded-lg space-y-3">
        <div>
          <label className="block text-sm mb-1">Filter Type</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
          >
            <option value="ALL">All Satellites</option>
            <option value="VISIBLE">Visible Only</option>
            <option value="ISS">ISS</option>
            <option value="GPS">GPS</option>
            <option value="STARLINK">Starlink</option>
            <option value="WEATHER">Weather</option>
            <option value="SCIENTIFIC">Scientific</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Update Rate</label>
          <select 
            value={updateInterval}
            onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
            className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
          >
            <option value="500">Real-time (0.5s)</option>
            <option value="1000">Fast (1s)</option>
            <option value="5000">Normal (5s)</option>
            <option value="10000">Slow (10s)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showOrbits"
            checked={showOrbits}
            onChange={(e) => setShowOrbits(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="showOrbits" className="text-sm">Show Orbit Paths</label>
        </div>
      </div>

      {/* World Map with Satellites */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl max-h-96 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg overflow-hidden">
          {/* World Map Background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20px 30px, #00ff88, transparent),
                radial-gradient(2px 2px at 40px 70px, #00ff88, transparent),
                radial-gradient(1px 1px at 90px 40px, #00ff88, transparent),
                radial-gradient(1px 1px at 130px 80px, #00ff88, transparent),
                radial-gradient(2px 2px at 160px 30px, #00ff88, transparent)
              `,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 100px'
            }}
          />

          {/* Satellites */}
          <AnimatePresence>
            {filteredSatellites.map((satellite) => {
              const style = getSatelliteStyle(satellite.type)
              const x = ((satellite.position.longitude + 180) / 360) * 100
              const y = ((90 - satellite.position.latitude) / 180) * 100
              
              return (
                <motion.div
                  key={satellite.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                    selectedSatellite?.id === satellite.id ? 'z-30' : 'z-10'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: satellite.isVisible ? 1 : 0.5, 
                    opacity: satellite.isVisible ? 1 : 0.6 
                  }}
                  whileHover={{ scale: 1.5 }}
                  onClick={() => setSelectedSatellite(satellite)}
                >
                  {/* Satellite Icon */}
                  <div
                    className={`
                      ${style.size === 'large' ? 'w-6 h-6 text-2xl' : 
                        style.size === 'medium' ? 'w-4 h-4 text-xl' : 'w-3 h-3 text-lg'}
                      rounded-full flex items-center justify-center animate-pulse shadow-lg
                    `}
                    style={{ backgroundColor: style.color }}
                  >
                    <span className="text-xs">{style.icon}</span>
                  </div>
                  
                  {/* Orbit Trail */}
                  {showOrbits && (
                    <div
                      className="absolute border border-opacity-30 rounded-full pointer-events-none animate-spin"
                      style={{
                        width: `${satellite.position.altitude / 20}px`,
                        height: `${satellite.position.altitude / 40}px`,
                        borderColor: style.color,
                        left: `calc(-${satellite.position.altitude / 40}px + 12px)`,
                        top: `calc(-${satellite.position.altitude / 80}px + 12px)`,
                        animationDuration: `${satellite.position.altitude / 100}s`
                      }}
                    />
                  )}
                  
                  {/* Name Label */}
                  {(selectedSatellite?.id === satellite.id || satellite.type === 'ISS') && (
                    <div className="absolute left-6 top-0 text-xs bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                      {satellite.name}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Satellite Details Panel */}
      <AnimatePresence>
        {selectedSatellite && (
          <motion.div
            className="absolute bottom-4 left-4 bg-black/90 backdrop-blur text-white p-6 rounded-lg max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl">{selectedSatellite.name}</h3>
                <p className="text-sm text-gray-300">NORAD ID: {selectedSatellite.noradId}</p>
              </div>
              <button
                onClick={() => setSelectedSatellite(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-300">Type</div>
                <div style={{ color: getSatelliteStyle(selectedSatellite.type).color }}>
                  {selectedSatellite.type}
                </div>
              </div>
              
              <div>
                <div className="text-gray-300">Altitude</div>
                <div>{selectedSatellite.position.altitude.toFixed(1)} km</div>
              </div>
              
              <div>
                <div className="text-gray-300">Latitude</div>
                <div>{selectedSatellite.position.latitude.toFixed(4)}°</div>
              </div>
              
              <div>
                <div className="text-gray-300">Longitude</div>
                <div>{selectedSatellite.position.longitude.toFixed(4)}°</div>
              </div>
              
              <div>
                <div className="text-gray-300">Velocity</div>
                <div>{selectedSatellite.position.velocity.toFixed(2)} km/s</div>
              </div>
              
              <div>
                <div className="text-gray-300">Range</div>
                <div>{selectedSatellite.position.range.toFixed(0)} km</div>
              </div>
            </div>
            
            {selectedSatellite.type === 'ISS' && (
              <div className="mt-4 p-3 bg-orange-900/30 rounded">
                <div className="text-orange-200 text-sm">
                  🧑‍🚀 The ISS is currently traveling at 17,500 mph and completes an orbit every 93 minutes!
                </div>
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm transition-colors">
                Predict Pass
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur p-4 rounded-lg">
        <h4 className="font-bold mb-2">Legend</h4>
        <div className="space-y-1 text-sm">
          {Object.entries(getSatelliteStyle('ISS')).map(([type, _]) => {
            const style = getSatelliteStyle(type as Satellite['type'])
            return (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: style.color }}
                />
                <span>{style.icon} {type}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}