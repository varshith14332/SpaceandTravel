'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { motion } from 'framer-motion';

interface TrajectoryPoint {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  time: number;
}

interface MissionVisualizationProps {
  targetAltitude: number; // km
  inclination: number; // degrees
  eccentricity: number;
  launchSite: { latitude: number; longitude: number };
  isLaunching: boolean;
  currentTime: number; // seconds since launch
  onMissionEvent?: (event: string) => void;
}

// Earth component with realistic textures
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    // Create earth texture (in production, load actual Earth texture)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Create gradient for Earth-like appearance
    const gradient = context.createLinearGradient(0, 0, 1024, 512);
    gradient.addColorStop(0, '#1e40af'); // Ocean blue
    gradient.addColorStop(0.3, '#065f46'); // Land green
    gradient.addColorStop(0.7, '#92400e'); // Desert brown
    gradient.addColorStop(1, '#f3f4f6'); // Ice white
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);
    
    // Add some continent-like shapes
    context.fillStyle = '#065f46';
    context.fillRect(100, 150, 200, 100);
    context.fillRect(400, 200, 300, 150);
    context.fillRect(750, 100, 150, 200);
    
    const texture = new THREE.CanvasTexture(canvas);
    setEarthTexture(texture);
  }, []);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001; // Slow rotation
    }
  });
  
  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6.371, 64, 32]} />
      <meshPhongMaterial 
        map={earthTexture} 
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
}

// Atmosphere component
function Atmosphere() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[6.5, 32, 16]} />
      <meshPhongMaterial 
        color="#87CEEB"
        transparent={true}
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Launch site marker
function LaunchSite({ latitude, longitude }: { latitude: number; longitude: number }) {
  const position = new THREE.Vector3();
  
  // Convert lat/lon to 3D position on Earth surface
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  
  position.x = 6.371 * Math.sin(phi) * Math.cos(theta);
  position.y = 6.371 * Math.cos(phi);
  position.z = 6.371 * Math.sin(phi) * Math.sin(theta);
  
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshPhongMaterial color="#ff4444" />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Launch Site
      </Text>
    </group>
  );
}

// Orbital trajectory visualization
function OrbitTrajectory({ 
  altitude, 
  inclination, 
  eccentricity 
}: { 
  altitude: number; 
  inclination: number; 
  eccentricity: number; 
}) {
  const orbitRef = useRef<THREE.Line>(null);
  
  useEffect(() => {
    if (!orbitRef.current) return;
    
    const points = [];
    const earthRadius = 6.371;
    const orbitRadius = earthRadius + altitude / 1000;
    
    // Generate orbit points
    for (let i = 0; i <= 360; i += 2) {
      const angle = (i * Math.PI) / 180;
      
      // Basic elliptical orbit calculation
      const r = orbitRadius * (1 - eccentricity * eccentricity) / 
                (1 + eccentricity * Math.cos(angle));
      
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * Math.cos(inclination * Math.PI / 180);
      const z = r * Math.sin(angle) * Math.sin(inclination * Math.PI / 180);
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    if (orbitRef.current) {
      orbitRef.current.geometry = geometry;
    }
  }, [altitude, inclination, eccentricity]);
  
  return (
    <primitive ref={orbitRef} object={new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: "#00ff00", linewidth: 2 })
    )} />
  );
}

// Spacecraft component
function Spacecraft({ 
  position, 
  isLaunching 
}: { 
  position: THREE.Vector3; 
  isLaunching: boolean; 
}) {
  const spacecraftRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (spacecraftRef.current && isLaunching) {
      // Add some vibration during launch
      spacecraftRef.current.rotation.x += (Math.random() - 0.5) * 0.02;
      spacecraftRef.current.rotation.z += (Math.random() - 0.5) * 0.02;
    }
  });
  
  return (
    <group ref={spacecraftRef} position={position}>
      {/* Spacecraft body */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshPhongMaterial color="#cccccc" />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[-0.15, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.1]} />
        <meshPhongMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.15, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.1]} />
        <meshPhongMaterial color="#1a1a2e" />
      </mesh>
      
      {/* Engine trail during launch */}
      {isLaunching && (
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.02, 0.2, 8]} />
          <meshPhongMaterial 
            color="#ff6600" 
            transparent={true} 
            opacity={0.8}
            emissive="#ff3300"
          />
        </mesh>
      )}
      
      {/* Label */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Spacecraft
      </Text>
    </group>
  );
}

// Mission timeline component
function MissionTimeline({ 
  currentTime, 
  events 
}: { 
  currentTime: number; 
  events: Array<{ time: number; event: string; description: string }>; 
}) {
  const completedEvents = events.filter(e => e.time <= currentTime);
  const nextEvent = events.find(e => e.time > currentTime);
  
  return (
    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded-lg p-4 text-white max-w-sm">
      <h3 className="text-lg font-bold mb-3">Mission Timeline</h3>
      <div className="text-sm text-gray-300 mb-3">
        T+ {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {completedEvents.slice(-3).map((event, index) => (
          <div key={index} className="text-green-400 text-sm">
            <div className="font-semibold">✓ {event.event}</div>
            <div className="text-xs text-gray-400">{event.description}</div>
          </div>
        ))}
        
        {nextEvent && (
          <div className="text-yellow-400 text-sm border-t border-gray-600 pt-2">
            <div className="font-semibold">⏱ Next: {nextEvent.event}</div>
            <div className="text-xs text-gray-400">
              T+ {Math.floor(nextEvent.time / 60)}:{(nextEvent.time % 60).toFixed(0).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400">{nextEvent.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main visualization component
export default function Mission3DVisualization({
  targetAltitude,
  inclination,
  eccentricity,
  launchSite,
  isLaunching,
  currentTime,
  onMissionEvent
}: MissionVisualizationProps) {
  const [spacecraftPosition, setSpacecraftPosition] = useState(new THREE.Vector3());
  const [missionEvents] = useState([
    { time: 0, event: 'Launch', description: 'Rocket engines ignition and liftoff' },
    { time: 120, event: 'Max Q', description: 'Maximum dynamic pressure' },
    { time: 150, event: 'Booster Separation', description: 'First stage separation' },
    { time: 180, event: 'Second Stage Ignition', description: 'Upper stage engine start' },
    { time: 480, event: 'SECO', description: 'Second stage engine cutoff' },
    { time: 600, event: 'Payload Deployment', description: 'Spacecraft separation' }
  ]);
  
  // Update spacecraft position based on mission timeline
  useEffect(() => {
    const earthRadius = 6.371;
    
    if (currentTime < 600) {
      // During launch phase
      const progress = currentTime / 600;
      const altitude = progress * (targetAltitude / 1000);
      const height = earthRadius + altitude;
      
      // Convert launch site position to 3D
      const phi = (90 - launchSite.latitude) * (Math.PI / 180);
      const theta = (launchSite.longitude + 180) * (Math.PI / 180);
      
      setSpacecraftPosition(new THREE.Vector3(
        height * Math.sin(phi) * Math.cos(theta),
        height * Math.cos(phi),
        height * Math.sin(phi) * Math.sin(theta)
      ));
    } else {
      // In orbit
      const orbitTime = currentTime - 600;
      const orbitalPeriod = 2 * Math.PI * Math.sqrt(
        Math.pow((earthRadius + targetAltitude / 1000), 3) / 398600.4418
      );
      const angle = (orbitTime / orbitalPeriod) * 2 * Math.PI;
      
      const orbitRadius = earthRadius + targetAltitude / 1000;
      const r = orbitRadius * (1 - eccentricity * eccentricity) / 
                (1 + eccentricity * Math.cos(angle));
      
      setSpacecraftPosition(new THREE.Vector3(
        r * Math.cos(angle),
        r * Math.sin(angle) * Math.cos(inclination * Math.PI / 180),
        r * Math.sin(angle) * Math.sin(inclination * Math.PI / 180)
      ));
    }
  }, [currentTime, targetAltitude, inclination, eccentricity, launchSite]);
  
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [20, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[100, 100, 100]} intensity={1} />
        <pointLight position={[-100, -100, -100]} intensity={0.5} />
        
        <Stars radius={1000} depth={50} count={5000} factor={4} saturation={0} fade />
        
        <Earth />
        <Atmosphere />
        <LaunchSite latitude={launchSite.latitude} longitude={launchSite.longitude} />
        <OrbitTrajectory 
          altitude={targetAltitude} 
          inclination={inclination} 
          eccentricity={eccentricity} 
        />
        <Spacecraft position={spacecraftPosition} isLaunching={isLaunching} />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
        />
      </Canvas>
      
      <MissionTimeline currentTime={currentTime} events={missionEvents} />
      
      {/* Mission parameters display */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur rounded-lg p-4 text-white">
        <h3 className="text-lg font-bold mb-3">Mission Parameters</h3>
        <div className="space-y-1 text-sm">
          <div>Altitude: {targetAltitude.toLocaleString()} km</div>
          <div>Inclination: {inclination.toFixed(1)}°</div>
          <div>Eccentricity: {eccentricity.toFixed(3)}</div>
          <div>Status: {isLaunching ? 'Launching' : 'In Orbit'}</div>
        </div>
      </div>
    </div>
  );
}