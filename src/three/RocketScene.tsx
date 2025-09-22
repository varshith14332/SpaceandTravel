'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Trail, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Rocket Model Component
function RocketModel({ position, rotation, scale = 1, firing = false }: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  firing?: boolean
}) {
  const rocketRef = useRef<THREE.Group>(null)
  const exhaustRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (firing && exhaustRef.current) {
      exhaustRef.current.scale.setScalar(0.8 + Math.sin(clock.getElapsedTime() * 10) * 0.2)
    }
  })

  return (
    <group ref={rocketRef} position={position} rotation={rotation} scale={scale}>
      {/* Rocket Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4, 16]} />
        <meshStandardMaterial color="#E8E8E8" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Rocket Nose Cone */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.3, 1, 16]} />
        <meshStandardMaterial color="#FF4444" />
      </mesh>
      
      {/* Rocket Fins */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[0, -1.5, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[0.1, 1, 0.6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
      
      {/* Engine Nozzle */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.4, 0.3, 0.5, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Exhaust Flame */}
      {firing && (
        <mesh ref={exhaustRef} position={[0, -3.2, 0]}>
          <coneGeometry args={[0.4, 2, 8]} />
          <meshBasicMaterial 
            color="#FF6600" 
            transparent={true} 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Exhaust Particles */}
      {firing && (
        <mesh position={[0, -4, 0]}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshBasicMaterial 
            color="#FFAA00" 
            transparent={true} 
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}

// Animated Rocket Launch Component
function AnimatedRocket() {
  const [phase, setPhase] = useState<'countdown' | 'launch' | 'orbit' | 'landed'>('countdown')
  const [countdown, setCountdown] = useState(10)
  const [rocketPosition, setRocketPosition] = useState<[number, number, number]>([0, -5, 0])
  const [rocketRotation, setRocketRotation] = useState<[number, number, number]>([0, 0, 0])
  const [velocity, setVelocity] = useState(0)

  // Launch sequence
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (phase === 'countdown' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (phase === 'countdown' && countdown === 0) {
      setPhase('launch')
    }

    return () => clearInterval(interval)
  }, [phase, countdown])

  // Animation loop
  useFrame(({ clock }) => {
    if (phase === 'launch') {
      const elapsed = clock.getElapsedTime()
      const newVelocity = Math.min(elapsed * 0.5, 3)
      setVelocity(newVelocity)
      
      setRocketPosition(prev => [
        prev[0] + Math.sin(elapsed * 0.1) * 0.1, // Slight wobble
        prev[1] + newVelocity * 0.1,
        prev[2]
      ])
      
      // Tilt rocket slightly during ascent
      setRocketRotation([0, 0, Math.sin(elapsed * 0.2) * 0.1])
      
      // Transition to orbit after reaching certain height
      if (rocketPosition[1] > 20) {
        setPhase('orbit')
      }
    } else if (phase === 'orbit') {
      const elapsed = clock.getElapsedTime()
      const orbitRadius = 25
      
      setRocketPosition([
        Math.cos(elapsed * 0.2) * orbitRadius,
        20 + Math.sin(elapsed * 0.1) * 2,
        Math.sin(elapsed * 0.2) * orbitRadius
      ])
      
      // Point rocket tangent to orbit
      setRocketRotation([
        0, 
        Math.atan2(Math.sin(elapsed * 0.2), Math.cos(elapsed * 0.2)) + Math.PI/2,
        Math.PI/2
      ])
    }
  })

  const resetLaunch = () => {
    setPhase('countdown')
    setCountdown(10)
    setRocketPosition([0, -5, 0])
    setRocketRotation([0, 0, 0])
    setVelocity(0)
  }

  return (
    <>
      {/* Launch Pad */}
      <mesh position={[0, -6, 0]}>
        <cylinderGeometry args={[3, 3, 0.5, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Launch Tower */}
      <mesh position={[2, -3, 0]}>
        <boxGeometry args={[0.2, 6, 0.2]} />
        <meshStandardMaterial color="#999999" />
      </mesh>
      
      {/* Rocket with Trail */}
      <Trail
        width={1}
        length={20}
        color={phase === 'launch' ? '#FF6600' : '#FFFFFF'}
        attenuation={(width) => width}
      >
        <RocketModel
          position={rocketPosition}
          rotation={rocketRotation}
          scale={1}
          firing={phase === 'launch'}
        />
      </Trail>
      
      {/* UI Elements */}
      <Html position={[-10, 8, 0]}>
        <div className="bg-black/70 text-white p-4 rounded-lg backdrop-blur">
          <div className="text-xl font-bold mb-2">Mission Control</div>
          <div className="text-lg mb-2">
            Phase: <span className="text-blue-400">{phase.toUpperCase()}</span>
          </div>
          {phase === 'countdown' && (
            <div className="text-3xl font-bold text-red-400">
              T-{countdown}
            </div>
          )}
          {phase === 'launch' && (
            <div className="text-green-400">
              Velocity: {velocity.toFixed(1)} km/s
            </div>
          )}
          {phase === 'orbit' && (
            <div className="text-blue-400">
              Orbital Altitude: 400 km
            </div>
          )}
          <button 
            onClick={resetLaunch}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reset Launch
          </button>
        </div>
      </Html>
      
      {/* Launch Effects */}
      {phase === 'launch' && (
        <>
          {/* Smoke Clouds */}
          <mesh position={[0, -6, 0]}>
            <sphereGeometry args={[4, 16, 16]} />
            <meshBasicMaterial 
              color="#CCCCCC" 
              transparent={true} 
              opacity={0.3}
            />
          </mesh>
          
          {/* Ground Shake Effect */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                (Math.random() - 0.5) * 20, 
                -6.5, 
                (Math.random() - 0.5) * 20
              ]}
            >
              <boxGeometry args={[0.5, 0.1, 0.5]} />
              <meshBasicMaterial color="#8B4513" />
            </mesh>
          ))}
        </>
      )}
    </>
  )
}

// Earth Component for Orbit Reference
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })

  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[15, 32, 32]} />
      <meshStandardMaterial 
        color="#6B93D6" 
        roughness={0.7}
      />
      {/* Atmosphere */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          transparent={true} 
          opacity={0.2}
        />
      </mesh>
    </mesh>
  )
}

// Main Rocket Scene Component
interface RocketSceneProps {
  autoLaunch?: boolean
  showControls?: boolean
}

export default function RocketScene({ autoLaunch: _autoLaunch = false, showControls = true }: RocketSceneProps) {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{ position: [20, 10, 20], fov: 60 }}
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(to bottom, #000428 0%, #004e92 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, -5, 0]} intensity={0.5} color="#FF6600" />
        
        {/* Scene Components */}
        <Earth />
        <AnimatedRocket />
        
        {/* Grid Helper */}
        <gridHelper args={[100, 100]} position={[0, -10, 0]} />
        
        {/* Controls */}
        {showControls && (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={150}
          />
        )}
        
        {/* Post Processing */}
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.9} />
        </EffectComposer>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-2xl font-bold mb-2">🚀 Rocket Launch Simulator</h2>
        <p className="text-sm opacity-80">Use mouse to orbit • Scroll to zoom</p>
      </div>
    </div>
  )
}
