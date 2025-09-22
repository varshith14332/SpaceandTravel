'use client'

import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Text, Html, Ring } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Orbital mechanics calculations
const calculateOrbitalPosition = (
  semiMajorAxis: number,
  eccentricity: number,
  inclination: number,
  argumentOfPeriapsis: number,
  longitudeOfAscendingNode: number,
  trueAnomaly: number
): [number, number, number] => {
  // Convert to radians
  const incRad = (inclination * Math.PI) / 180
  const argPeriRad = (argumentOfPeriapsis * Math.PI) / 180
  const lonAscRad = (longitudeOfAscendingNode * Math.PI) / 180
  
  // Calculate distance from focus
  const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
           (1 + eccentricity * Math.cos(trueAnomaly))
  
  // Position in orbital plane
  const x_orbital = r * Math.cos(trueAnomaly)
  const y_orbital = r * Math.sin(trueAnomaly)
  
  // Rotate to 3D space
  const cos_lon = Math.cos(lonAscRad)
  const sin_lon = Math.sin(lonAscRad)
  const cos_arg = Math.cos(argPeriRad)
  const sin_arg = Math.sin(argPeriRad)
  const cos_inc = Math.cos(incRad)
  const sin_inc = Math.sin(incRad)
  
  const x = (cos_lon * cos_arg - sin_lon * sin_arg * cos_inc) * x_orbital +
           (-cos_lon * sin_arg - sin_lon * cos_arg * cos_inc) * y_orbital
  const y = (sin_lon * cos_arg + cos_lon * sin_arg * cos_inc) * x_orbital +
           (-sin_lon * sin_arg + cos_lon * cos_arg * cos_inc) * y_orbital
  const z = (sin_inc * sin_arg) * x_orbital + (sin_inc * cos_arg) * y_orbital
  
  return [x, y, z]
}

// Spacecraft Component
interface SpacecraftProps {
  position: [number, number, number]
  velocity: [number, number, number]
  scale?: number
}

function Spacecraft({ position, velocity, scale = 1 }: SpacecraftProps) {
  const spacecraftRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (spacecraftRef.current && velocity) {
      // Orient spacecraft based on velocity direction
      const velocityVector = new THREE.Vector3(...velocity).normalize()
      const up = new THREE.Vector3(0, 1, 0)
      const right = new THREE.Vector3().crossVectors(up, velocityVector).normalize()
      const newUp = new THREE.Vector3().crossVectors(velocityVector, right).normalize()
      
      const matrix = new THREE.Matrix4()
      matrix.makeBasis(right, newUp, velocityVector)
      spacecraftRef.current.rotation.setFromRotationMatrix(matrix)
    }
  })

  return (
    <group ref={spacecraftRef} position={position} scale={scale}>
      {/* Main Body */}
      <mesh>
        <boxGeometry args={[0.8, 0.3, 0.3]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Solar Panels */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.05, 0.8]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[1.6, 0.05, 0.8]} />
        <meshStandardMaterial color="#1E3A8A" />
      </mesh>
      
      {/* Thrusters */}
      <mesh position={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>
      
      {/* Communication Dish */}
      <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}

// Orbital Path Component
interface OrbitPathProps {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  argumentOfPeriapsis: number
  longitudeOfAscendingNode: number
  color?: string
}

function OrbitPath({ 
  semiMajorAxis, 
  eccentricity, 
  inclination, 
  argumentOfPeriapsis, 
  longitudeOfAscendingNode,
  color = '#00FF88'
}: OrbitPathProps) {
  const orbitPoints = useMemo(() => {
    const points: THREE.Vector3[] = []
    const numPoints = 200
    
    for (let i = 0; i <= numPoints; i++) {
      const trueAnomaly = (i / numPoints) * 2 * Math.PI
      const position = calculateOrbitalPosition(
        semiMajorAxis,
        eccentricity,
        inclination,
        argumentOfPeriapsis,
        longitudeOfAscendingNode,
        trueAnomaly
      )
      points.push(new THREE.Vector3(...position))
    }
    
    return points
  }, [semiMajorAxis, eccentricity, inclination, argumentOfPeriapsis, longitudeOfAscendingNode])

  return <Line points={orbitPoints} color={color} lineWidth={2} />
}

// Planet Component
function Planet({ 
  name, 
  radius, 
  color, 
  position 
}: { 
  name: string
  radius: number
  color: string
  position: [number, number, number]
}) {
  const planetRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = clock.getElapsedTime() * 0.01
    }
  })

  return (
    <group position={position}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {name === 'Earth' && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial 
            color="#87CEEB" 
            transparent={true} 
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  )
}

// Orbital Controls UI Component
interface OrbitalControlsProps {
  orbitalElements: OrbitalElements
  setOrbitalElements: React.Dispatch<React.SetStateAction<OrbitalElements>>
}

interface OrbitalElements {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  argumentOfPeriapsis: number
  longitudeOfAscendingNode: number
}

function OrbitalControlsUI({ orbitalElements, setOrbitalElements }: OrbitalControlsProps) {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div className={`absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-20 hover:opacity-100'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Orbital Parameters</h3>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="text-blue-400 hover:text-blue-300"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-3 min-w-64">
          <div>
            <label className="block text-sm mb-1">Semi-Major Axis (km)</label>
            <input
              type="range"
              min="6000"
              max="50000"
              value={orbitalElements.semiMajorAxis}
              onChange={(e) => setOrbitalElements(prev => ({
                ...prev,
                semiMajorAxis: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-xs text-gray-300">{orbitalElements.semiMajorAxis.toLocaleString()} km</span>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Eccentricity</label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.01"
              value={orbitalElements.eccentricity}
              onChange={(e) => setOrbitalElements(prev => ({
                ...prev,
                eccentricity: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-xs text-gray-300">{orbitalElements.eccentricity.toFixed(3)}</span>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Inclination (degrees)</label>
            <input
              type="range"
              min="0"
              max="180"
              value={orbitalElements.inclination}
              onChange={(e) => setOrbitalElements(prev => ({
                ...prev,
                inclination: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-xs text-gray-300">{orbitalElements.inclination}°</span>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Argument of Periapsis (degrees)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={orbitalElements.argumentOfPeriapsis}
              onChange={(e) => setOrbitalElements(prev => ({
                ...prev,
                argumentOfPeriapsis: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-xs text-gray-300">{orbitalElements.argumentOfPeriapsis}°</span>
          </div>
          
          <div>
            <label className="block text-sm mb-1">Longitude of Ascending Node (degrees)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={orbitalElements.longitudeOfAscendingNode}
              onChange={(e) => setOrbitalElements(prev => ({
                ...prev,
                longitudeOfAscendingNode: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-xs text-gray-300">{orbitalElements.longitudeOfAscendingNode}°</span>
          </div>
          
          {/* Preset Orbits */}
          <div className="pt-3 border-t border-gray-600">
            <label className="block text-sm mb-2">Preset Orbits</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrbitalElements({
                  semiMajorAxis: 6780,
                  eccentricity: 0.01,
                  inclination: 0,
                  argumentOfPeriapsis: 0,
                  longitudeOfAscendingNode: 0
                })}
                className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
              >
                LEO Circular
              </button>
              <button
                onClick={() => setOrbitalElements({
                  semiMajorAxis: 42164,
                  eccentricity: 0.01,
                  inclination: 0,
                  argumentOfPeriapsis: 0,
                  longitudeOfAscendingNode: 0
                })}
                className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
              >
                GEO
              </button>
              <button
                onClick={() => setOrbitalElements({
                  semiMajorAxis: 8000,
                  eccentricity: 0.7,
                  inclination: 90,
                  argumentOfPeriapsis: 90,
                  longitudeOfAscendingNode: 0
                })}
                className="px-2 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700"
              >
                Polar Elliptical
              </button>
              <button
                onClick={() => setOrbitalElements({
                  semiMajorAxis: 26560,
                  eccentricity: 0.01,
                  inclination: 55,
                  argumentOfPeriapsis: 0,
                  longitudeOfAscendingNode: 0
                })}
                className="px-2 py-1 bg-orange-600 rounded text-xs hover:bg-orange-700"
              >
                GPS Orbit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Orbit Simulation Component
interface OrbitSimulationProps {
  showControls?: boolean
}

export default function OrbitSimulation({ showControls = true }: OrbitSimulationProps) {
  const [orbitalElements, setOrbitalElements] = useState<OrbitalElements>({
    semiMajorAxis: 8000,
    eccentricity: 0.2,
    inclination: 28,
    argumentOfPeriapsis: 45,
    longitudeOfAscendingNode: 0
  })
  
  const [currentTrueAnomaly, setCurrentTrueAnomaly] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [timeSpeed, setTimeSpeed] = useState(1)

  // Animation
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentTrueAnomaly(prev => (prev + 0.01 * timeSpeed) % (2 * Math.PI))
      }, 16) // ~60fps
      
      return () => clearInterval(interval)
    }
  }, [isPaused, timeSpeed])

  // Calculate current spacecraft position
  const spacecraftPosition = useMemo(() => {
    return calculateOrbitalPosition(
      orbitalElements.semiMajorAxis / 100, // Scale down for display
      orbitalElements.eccentricity,
      orbitalElements.inclination,
      orbitalElements.argumentOfPeriapsis,
      orbitalElements.longitudeOfAscendingNode,
      currentTrueAnomaly
    )
  }, [orbitalElements, currentTrueAnomaly])

  // Calculate velocity vector (simplified)
  const spacecraftVelocity = useMemo((): [number, number, number] => {
    const deltaAnomaly = 0.1
    const futurePosition = calculateOrbitalPosition(
      orbitalElements.semiMajorAxis / 100,
      orbitalElements.eccentricity,
      orbitalElements.inclination,
      orbitalElements.argumentOfPeriapsis,
      orbitalElements.longitudeOfAscendingNode,
      currentTrueAnomaly + deltaAnomaly
    )
    
    return [
      futurePosition[0] - spacecraftPosition[0],
      futurePosition[1] - spacecraftPosition[1],
      futurePosition[2] - spacecraftPosition[2]
    ]
  }, [spacecraftPosition, orbitalElements, currentTrueAnomaly])

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{ position: [50, 30, 50], fov: 60 }}
        gl={{ antialias: true }}
        style={{ background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f172a 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1.5}
          castShadow
        />
        
        {/* Earth */}
        <Planet 
          name="Earth"
          radius={6.371}
          color="#4F94CD"
          position={[0, 0, 0]}
        />
        
        {/* Orbital Path */}
        <OrbitPath 
          semiMajorAxis={orbitalElements.semiMajorAxis / 100}
          eccentricity={orbitalElements.eccentricity}
          inclination={orbitalElements.inclination}
          argumentOfPeriapsis={orbitalElements.argumentOfPeriapsis}
          longitudeOfAscendingNode={orbitalElements.longitudeOfAscendingNode}
          color="#00FF88"
        />
        
        {/* Spacecraft */}
        <Spacecraft 
          position={spacecraftPosition}
          velocity={spacecraftVelocity}
          scale={2}
        />
        
        {/* Reference Grids */}
        <gridHelper args={[200, 50]} position={[0, 0, 0]} />
        
        {/* Coordinate System */}
        <axesHelper args={[20]} />
        
        {/* Controls */}
        {showControls && (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={200}
          />
        )}
        
        {/* Post Processing */}
        <EffectComposer>
          <Bloom intensity={0.2} luminanceThreshold={0.9} />
        </EffectComposer>
      </Canvas>
      
      {/* UI Overlays */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-2xl font-bold mb-2">🛰️ Orbital Mechanics Simulator</h2>
        <div className="space-y-1 text-sm">
          <div>Altitude: {((spacecraftPosition[0]**2 + spacecraftPosition[1]**2 + spacecraftPosition[2]**2)**0.5 * 100 - 637.1).toFixed(1)} km</div>
          <div>Period: {(2 * Math.PI * Math.sqrt((orbitalElements.semiMajorAxis**3) / 398600.4418) / 60).toFixed(1)} minutes</div>
        </div>
      </div>
      
      {/* Animation Controls */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            {isPaused ? '▶️ Play' : '⏸️ Pause'}
          </button>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm">Speed:</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm">{timeSpeed}x</span>
          </div>
        </div>
      </div>
      
      {/* Orbital Parameters UI */}
      <OrbitalControlsUI 
        orbitalElements={orbitalElements}
        setOrbitalElements={setOrbitalElements}
      />
    </div>
  )
}
