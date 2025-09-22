'use client'

import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, OrbitControls, Sphere, Ring, Html } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

// Animated starfield component
function AnimatedStars() {
  const starsRef = useRef<THREE.Points>(null)
  
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.0001
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.0002
    }
  })

  return (
    <Stars
      ref={starsRef}
      radius={300}
      depth={60}
      count={8000}
      factor={7}
      saturation={0.8}
      fade={true}
    />
  )
}

// Milky Way Galaxy Background
function MilkyWayGalaxy() {
  const galaxyRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.z = clock.getElapsedTime() * 0.0001
    }
  })

  const galaxyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const context = canvas.getContext('2d')!
    
    // Create galaxy spiral pattern
    const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.2, 'rgba(150, 100, 255, 0.6)')
    gradient.addColorStop(0.4, 'rgba(100, 150, 255, 0.4)')
    gradient.addColorStop(0.6, 'rgba(50, 50, 200, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 1024, 1024)
    
    // Add spiral arms
    context.save()
    context.translate(512, 512)
    for (let i = 0; i < 6; i++) {
      context.rotate(Math.PI / 3)
      context.beginPath()
      context.strokeStyle = `rgba(255, 255, 255, ${0.3 - i * 0.05})`
      context.lineWidth = 20 - i * 2
      context.arc(0, 0, 200 + i * 50, 0, Math.PI, false)
      context.stroke()
    }
    context.restore()
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh ref={galaxyRef} position={[0, 0, -200]} scale={[8, 8, 1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial 
        map={galaxyTexture} 
        transparent={true} 
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Solar System Component
function SolarSystem() {
  const systemRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (systemRef.current) {
      systemRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  // Planet data
  const planets = [
    { name: 'Mercury', size: 0.3, distance: 3, speed: 0.02, color: '#8C7853' },
    { name: 'Venus', size: 0.5, distance: 4.5, speed: 0.015, color: '#FFC649' },
    { name: 'Earth', size: 0.6, distance: 6, speed: 0.01, color: '#6B93D6' },
    { name: 'Mars', size: 0.4, distance: 8, speed: 0.008, color: '#CD5C5C' },
    { name: 'Jupiter', size: 1.2, distance: 12, speed: 0.005, color: '#D8CA9D' },
    { name: 'Saturn', size: 1, distance: 16, speed: 0.003, color: '#FAD5A5' },
    { name: 'Uranus', size: 0.8, distance: 20, speed: 0.002, color: '#4FD0E7' },
    { name: 'Neptune', size: 0.8, distance: 24, speed: 0.001, color: '#4B70DD' },
  ]

  return (
    <group ref={systemRef} position={[20, 5, 0]}>
      {/* Sun */}
      <Sun />
      
      {/* Planets */}
      {planets.map((planet, index) => (
        <Planet key={planet.name} {...planet} />
      ))}
    </group>
  )
}

// Sun Component
function Sun() {
  const sunRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      (sunRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  })

  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#FDB813"
        emissive="#FDB813"
        emissiveIntensity={0.5}
      />
      {/* Sun's glow effect */}
      <mesh scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial 
          color="#FDB813"
          transparent={true}
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </mesh>
  )
}

// Planet Component
interface PlanetProps {
  name: string
  size: number
  distance: number
  speed: number
  color: string
}

function Planet({ name, size, distance, speed, color }: PlanetProps) {
  const planetRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = clock.getElapsedTime() * speed
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={planetRef}>
      <mesh ref={meshRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Orbit ring */}
      <Ring args={[distance - 0.05, distance + 0.05, 64]} rotation-x={-Math.PI / 2}>
        <meshBasicMaterial color="white" transparent opacity={0.1} />
      </Ring>
      {/* Saturn's rings */}
      {name === 'Saturn' && (
        <Ring 
          args={[size * 1.5, size * 2.5, 32]} 
          position={[distance, 0, 0]}
          rotation-x={-Math.PI / 2}
        >
          <meshBasicMaterial color="#FAD5A5" transparent opacity={0.6} />
        </Ring>
      )}
    </group>
  )
}

// Black Hole Component
function BlackHole() {
  const blackHoleRef = useRef<THREE.Group>(null)
  const accretionDiskRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (blackHoleRef.current) {
      blackHoleRef.current.rotation.z = clock.getElapsedTime() * 0.02
    }
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.z = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={blackHoleRef} position={[-30, -10, -20]}>
      {/* Event Horizon */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Accretion Disk */}
      <mesh ref={accretionDiskRef}>
        <ringGeometry args={[1.5, 8, 64]} />
        <meshBasicMaterial 
          color="#FF6B35"
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Photon Sphere */}
      <mesh>
        <ringGeometry args={[2.8, 3.2, 64]} />
        <meshBasicMaterial 
          color="#FFFF00"
          transparent={true}
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Gravitational Lensing Effect */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} scale={[1 + i * 0.5, 1 + i * 0.5, 1]}>
          <ringGeometry args={[4 + i * 2, 4.5 + i * 2, 32]} />
          <meshBasicMaterial 
            color="#4169E1"
            transparent={true}
            opacity={0.1 - i * 0.015}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

// Nebula Component
function Nebula() {
  const nebulaRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = clock.getElapsedTime() * 0.001
      nebulaRef.current.rotation.z = clock.getElapsedTime() * 0.0005
    }
  })

  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')!
    
    // Create nebula gradient
    const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, 'rgba(255, 0, 128, 0.8)')
    gradient.addColorStop(0.3, 'rgba(128, 0, 255, 0.6)')
    gradient.addColorStop(0.6, 'rgba(0, 128, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 512)
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh ref={nebulaRef} position={[40, 15, -30]} scale={[10, 10, 10]}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial 
        map={nebulaTexture} 
        transparent={true} 
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Asteroid Belt
function AsteroidBelt() {
  const asteroids = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => {
      const angle = (i / 200) * Math.PI * 2
      const radius = 10 + Math.random() * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * 1
      const scale = 0.05 + Math.random() * 0.1
      
      return { position: [x, y, z] as [number, number, number], scale, angle }
    })
  }, [])

  const groupRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.005
    }
  })

  return (
    <group ref={groupRef}>
      {asteroids.map((asteroid, i) => (
        <mesh key={i} position={asteroid.position} scale={[asteroid.scale, asteroid.scale, asteroid.scale]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8C7853" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Main Space Environment Component
export default function SpaceEnvironment() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)' }}
      >
        <Suspense fallback={<Html center>Loading Space...</Html>}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 5, 0]} intensity={2} color="#FDB813" />
          <pointLight position={[-30, -10, -20]} intensity={0.5} color="#4169E1" />
          
          {/* Space Environment Components */}
          <AnimatedStars />
          <MilkyWayGalaxy />
          <SolarSystem />
          <BlackHole />
          <Nebula />
          <AsteroidBelt />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
          
          {/* Post Processing Effects */}
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.4} />
            <ChromaticAberration offset={[0.001, 0.001]} />
            <Noise opacity={0.02} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}