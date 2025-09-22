'use client'

import React, { useEffect, useRef, useState } from 'react'

// Mock Cesium interface for development (replace with actual Cesium when available)
interface CesiumGlobeComponentProps {
  showSatellites: boolean
  showISS: boolean
  showDebris: boolean
  showWeather: boolean
}

// Satellite data interface
interface SatelliteData {
  id: string
  name: string
  position: { longitude: number; latitude: number; altitude: number }
  velocity: { x: number; y: number; z: number }
  type: 'ISS' | 'GPS' | 'Communication' | 'Weather' | 'Military' | 'Debris'
}

// Mock satellite data (replace with real TLE data)
const mockSatelliteData: SatelliteData[] = [
  {
    id: 'ISS',
    name: 'International Space Station',
    position: { longitude: 45.0, latitude: -15.0, altitude: 408 },
    velocity: { x: 7.66, y: 0, z: 0 },
    type: 'ISS'
  },
  {
    id: 'GPS-1',
    name: 'GPS Block IIR-5',
    position: { longitude: 120.0, latitude: 55.0, altitude: 20200 },
    velocity: { x: 3.87, y: 0, z: 0 },
    type: 'GPS'
  },
  {
    id: 'STARLINK-1',
    name: 'Starlink-30',
    position: { longitude: -80.0, latitude: 25.0, altitude: 550 },
    velocity: { x: 7.56, y: 0, z: 0 },
    type: 'Communication'
  },
  {
    id: 'NOAA-19',
    name: 'NOAA-19 Weather Satellite',
    position: { longitude: -120.0, latitude: -45.0, altitude: 870 },
    velocity: { x: 7.35, y: 0, z: 0 },
    type: 'Weather'
  }
]

// CSS-based 3D Earth component (temporary replacement for Cesium)
function CSS3DEarth() {
  const earthRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (earthRef.current) {
      let rotation = 0
      const animate = () => {
        rotation += 0.1
        if (earthRef.current) {
          earthRef.current.style.transform = `rotateY(${rotation}deg)`
        }
        requestAnimationFrame(animate)
      }
      animate()
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-900 to-black">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          />
        ))}
      </div>
      
      {/* Earth */}
      <div 
        ref={earthRef}
        className="relative w-96 h-96 rounded-full overflow-hidden shadow-2xl"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, #4A90E2 0%, #2E5BDA  30%, #1E3A8A  60%, #0F172A  100%),
            conic-gradient(from 45deg, #10B981, #3B82F6, #8B5CF6, #EF4444, #F59E0B, #10B981)
          `,
          backgroundBlendMode: 'multiply',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Continents overlay */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(ellipse 60px 40px at 25% 40%, #10B981 0%, transparent 50%),
              radial-gradient(ellipse 80px 60px at 70% 30%, #10B981 0%, transparent 50%),
              radial-gradient(ellipse 50px 80px at 60% 70%, #10B981 0%, transparent 50%),
              radial-gradient(ellipse 40px 30px at 20% 80%, #10B981 0%, transparent 50%)
            `
          }}
        />
        
        {/* Cloud layer */}
        <div 
          className="absolute inset-0 rounded-full opacity-40 animate-pulse"
          style={{
            background: `
              radial-gradient(ellipse 100px 50px at 40% 20%, rgba(255,255,255,0.6) 0%, transparent 60%),
              radial-gradient(ellipse 80px 40px at 80% 60%, rgba(255,255,255,0.4) 0%, transparent 60%),
              radial-gradient(ellipse 60px 80px at 30% 80%, rgba(255,255,255,0.5) 0%, transparent 60%)
            `
          }}
        />
        
        {/* Atmosphere glow */}
        <div 
          className="absolute -inset-4 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(135, 206, 235, 0.4) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </div>
  )
}

// Satellite tracking component
function SatelliteTracker({ satellites, showTypes }: { 
  satellites: SatelliteData[]
  showTypes: string[]
}) {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null)

  const getSatelliteColor = (type: string) => {
    switch (type) {
      case 'ISS': return '#FF6B35'
      case 'GPS': return '#4ECDC4'
      case 'Communication': return '#45B7D1'
      case 'Weather': return '#96CEB4'
      case 'Military': return '#FECA57'
      case 'Debris': return '#FF6B6B'
      default: return '#FFFFFF'
    }
  }

  const getOrbitRadius = (altitude: number) => {
    // Scale altitude for display (200px = Earth radius)
    return 200 + (altitude / 50)
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {satellites
        .filter(sat => showTypes.includes(sat.type))
        .map((satellite) => {
          const orbitRadius = getOrbitRadius(satellite.position.altitude)
          const angle = (satellite.position.longitude * Math.PI) / 180
          const x = Math.cos(angle) * orbitRadius
          const y = Math.sin(angle) * orbitRadius * Math.sin((satellite.position.latitude * Math.PI) / 180)
          
          return (
            <div
              key={satellite.id}
              className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              onClick={() => setSelectedSatellite(satellite)}
            >
              {/* Satellite dot */}
              <div
                className="w-3 h-3 rounded-full animate-pulse shadow-lg"
                style={{ backgroundColor: getSatelliteColor(satellite.type) }}
              />
              
              {/* Orbit trail */}
              <div
                className="absolute border border-opacity-20 rounded-full pointer-events-none"
                style={{
                  width: `${orbitRadius * 2}px`,
                  height: `${orbitRadius * 2}px`,
                  borderColor: getSatelliteColor(satellite.type),
                  left: `calc(-${orbitRadius}px + 6px)`,
                  top: `calc(-${orbitRadius}px + 6px)`,
                }}
              />
              
              {/* Satellite label */}
              <div className="absolute left-4 top-0 text-xs text-white bg-black/70 px-2 py-1 rounded whitespace-nowrap">
                {satellite.name}
              </div>
            </div>
          )
        })}
      
      {/* Satellite info panel */}
      {selectedSatellite && (
        <div className="absolute top-4 right-4 bg-black/90 text-white p-4 rounded-lg pointer-events-auto max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{selectedSatellite.name}</h3>
            <button
              onClick={() => setSelectedSatellite(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Type:</span>
              <span style={{ color: getSatelliteColor(selectedSatellite.type) }}>
                {selectedSatellite.type}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Altitude:</span>
              <span>{selectedSatellite.position.altitude.toLocaleString()} km</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Latitude:</span>
              <span>{selectedSatellite.position.latitude.toFixed(2)}°</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Longitude:</span>
              <span>{selectedSatellite.position.longitude.toFixed(2)}°</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">Velocity:</span>
              <span>{selectedSatellite.velocity.x.toFixed(2)} km/s</span>
            </div>
          </div>
          
          {selectedSatellite.type === 'ISS' && (
            <div className="mt-3 p-2 bg-orange-900/50 rounded">
              <p className="text-xs text-orange-200">
                🧑‍🚀 The ISS orbits Earth every 93 minutes at 17,500 mph, 
                hosting international crews conducting scientific research!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CesiumGlobeComponent({
  showSatellites,
  showISS,
  showDebris,
  showWeather
}: CesiumGlobeComponentProps) {
  const [activeTypes, setActiveTypes] = useState<string[]>([])
  
  useEffect(() => {
    const types: string[] = []
    if (showISS) types.push('ISS')
    if (showSatellites) types.push('GPS', 'Communication')
    if (showWeather) types.push('Weather')
    if (showDebris) types.push('Debris')
    setActiveTypes(types)
  }, [showSatellites, showISS, showDebris, showWeather])

  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20 text-white">
        <h2 className="text-2xl font-bold mb-2">🌍 Earth & Satellite Tracker</h2>
        <div className="text-sm opacity-80">
          <div>Tracking {mockSatelliteData.filter(s => activeTypes.includes(s.type)).length} objects</div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/80 text-white p-3 rounded-lg">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>ISS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-teal-400"></div>
            <span>GPS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Communication</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Weather</span>
          </div>
        </div>
      </div>
      
      {/* 3D Earth */}
      <CSS3DEarth />
      
      {/* Satellite Overlay */}
      <SatelliteTracker satellites={mockSatelliteData} showTypes={activeTypes} />
      
      {/* Status Panel */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-md">
        <h3 className="font-bold mb-2">🛰️ Live Space Data</h3>
        <div className="space-y-1 text-sm">
          <div>• ISS Current Location: Above {mockSatelliteData[0].position.latitude > 0 ? 'North' : 'South'} Atlantic</div>
          <div>• Active GPS Satellites: 31</div>
          <div>• Starlink Constellation: 5,000+ operational</div>
          <div>• Space Debris Objects: 34,000+ tracked</div>
        </div>
        
        <div className="mt-3 p-2 bg-blue-900/50 rounded">
          <p className="text-xs text-blue-200">
            💡 Click on any satellite to view detailed information and tracking data!
          </p>
        </div>
      </div>
      
      {/* Future Cesium Integration Notice */}
      <div className="absolute bottom-4 right-4 bg-yellow-900/80 text-yellow-100 p-3 rounded-lg text-xs max-w-sm">
        <div className="font-bold mb-1">🚧 Development Note</div>
        <div>This is a CSS-based preview. The production version will use CesiumJS for real 3D globe rendering with authentic satellite tracking via TLE data from NORAD.</div>
      </div>
    </div>
  )
}