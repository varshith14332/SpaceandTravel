import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

// Planet data with realistic properties
const planetData = [
  {
    name: 'Mercury',
    size: 0.38,
    distance: 4,
    color: '#8C7853',
    speed: 0.04,
    tilt: 0.034,
    description: 'Closest to the Sun',
    texture: 'mercury'
  },
  {
    name: 'Venus',
    size: 0.95,
    distance: 5.5,
    color: '#FFC649',
    speed: 0.03,
    tilt: 177.4,
    description: 'Hottest planet',
    texture: 'venus'
  },
  {
    name: 'Earth',
    size: 1,
    distance: 7,
    color: '#4A90E2',
    speed: 0.02,
    tilt: 23.4,
    description: 'Our home planet',
    hasRings: false,
    texture: 'earth',
    moons: [{ size: 0.27, distance: 2, color: '#C0C0C0', speed: 0.08 }]
  },
  {
    name: 'Mars',
    size: 0.53,
    distance: 9,
    color: '#CD5C5C',
    speed: 0.015,
    tilt: 25.2,
    description: 'The Red Planet',
    texture: 'mars'
  },
  {
    name: 'Jupiter',
    size: 2.5,
    distance: 14,
    color: '#D8CA9D',
    speed: 0.008,
    tilt: 3.1,
    description: 'Gas Giant',
    hasRings: true,
    texture: 'jupiter',
    moons: [
      { size: 0.25, distance: 3.5, color: '#FFFF99', speed: 0.05 },
      { size: 0.22, distance: 4, color: '#87CEEB', speed: 0.04 },
      { size: 0.3, distance: 4.5, color: '#DEB887', speed: 0.035 },
      { size: 0.28, distance: 5, color: '#F5DEB3', speed: 0.03 }
    ]
  },
  {
    name: 'Saturn',
    size: 2.2,
    distance: 18,
    color: '#FAD5A5',
    speed: 0.005,
    tilt: 26.7,
    description: 'Ringed Planet',
    hasRings: true,
    prominentRings: true,
    texture: 'saturn',
    moons: [
      { size: 0.4, distance: 5, color: '#F4E4BC', speed: 0.03 },
      { size: 0.15, distance: 6, color: '#E6E6FA', speed: 0.025 }
    ]
  },
  {
    name: 'Uranus',
    size: 1.8,
    distance: 22,
    color: '#4FD0E7',
    speed: 0.003,
    tilt: 97.8,
    description: 'Ice Giant',
    hasRings: true,
    texture: 'uranus'
  },
  {
    name: 'Neptune',
    size: 1.7,
    distance: 26,
    color: '#4B70DD',
    speed: 0.002,
    tilt: 28.3,
    description: 'Windiest Planet',
    hasRings: true,
    texture: 'neptune'
  }
];

// Enhanced texture creation function
const createPlanetTexture = (planet: any) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return new THREE.CanvasTexture(canvas);
  
  // Base color
  ctx.fillStyle = planet.color;
  ctx.fillRect(0, 0, 1024, 512);
  
  // Planet-specific textures
  switch (planet.texture) {
    case 'mercury':
      // Cratered surface
      ctx.fillStyle = '#7A6B47';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const radius = Math.random() * 15 + 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'venus':
      // Thick atmosphere swirls
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = '#FFB347';
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * 512;
        ctx.fillRect(0, y, 1024, 25);
      }
      ctx.globalCompositeOperation = 'source-over';
      break;
      
    case 'earth':
      // Continents
      ctx.fillStyle = '#2E7D32';
      const continents = [
        { x: 100, y: 200, w: 200, h: 100 }, // North America
        { x: 300, y: 250, w: 150, h: 80 },  // South America
        { x: 500, y: 180, w: 180, h: 120 }, // Europe/Africa
        { x: 700, y: 220, w: 120, h: 90 },  // Asia
        { x: 850, y: 350, w: 100, h: 60 }   // Australia
      ];
      
      continents.forEach(cont => {
        ctx.fillRect(cont.x, cont.y, cont.w, cont.h);
        // Add some detail
        ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 5; i++) {
          const detailX = cont.x + Math.random() * cont.w;
          const detailY = cont.y + Math.random() * cont.h;
          const detailSize = Math.random() * 20 + 5;
          ctx.fillRect(detailX, detailY, detailSize, detailSize);
        }
        ctx.fillStyle = '#2E7D32';
      });
      
      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const radius = Math.random() * 25 + 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'mars':
      // Polar ice caps
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1024, 50);
      ctx.fillRect(0, 462, 1024, 50);
      
      // Surface features
      ctx.fillStyle = '#8B4513';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1024;
        const y = 50 + Math.random() * 412;
        const radius = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Dust storms
      ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const width = Math.random() * 200 + 50;
        const height = Math.random() * 50 + 20;
        ctx.fillRect(x, y, width, height);
      }
      break;
      
    case 'jupiter':
      // Atmospheric bands
      const bandColors = ['#D2B48C', '#CD853F', '#A0522D', '#8B4513'];
      for (let i = 0; i < 12; i++) {
        const y = (i / 12) * 512;
        const color = bandColors[i % bandColors.length];
        ctx.fillStyle = color;
        ctx.fillRect(0, y, 1024, 42);
      }
      
      // Great Red Spot
      ctx.fillStyle = '#DC143C';
      ctx.beginPath();
      ctx.ellipse(400, 300, 80, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'saturn':
      // Atmospheric bands (more subtle than Jupiter)
      const saturnBands = ['#FAD5A5', '#DEB887', '#D2B48C', '#BC9A6A'];
      for (let i = 0; i < 10; i++) {
        const y = (i / 10) * 512;
        const color = saturnBands[i % saturnBands.length];
        ctx.fillStyle = color;
        ctx.fillRect(0, y, 1024, 51);
      }
      break;
      
    case 'uranus':
      // Methane haze bands
      ctx.fillStyle = '#40E0D0';
      for (let i = 0; i < 8; i++) {
        const y = (i / 8) * 512;
        ctx.fillRect(0, y, 1024, 32);
      }
      break;
      
    case 'neptune':
      // Dynamic atmospheric features
      ctx.fillStyle = '#000080';
      for (let i = 0; i < 6; i++) {
        const y = (i / 6) * 512;
        ctx.fillRect(0, y, 1024, 42);
      }
      
      // Great Dark Spot
      ctx.fillStyle = '#191970';
      ctx.beginPath();
      ctx.ellipse(600, 250, 60, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  return new THREE.CanvasTexture(canvas);
};

// Sun component
const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.005;
    }
  });

  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create sun surface texture
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.3, '#FFA500');
      gradient.addColorStop(0.6, '#FF6B00');
      gradient.addColorStop(1, '#FF4500');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      
      // Add some surface details
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 20 + 5;
        
        const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        spotGradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        spotGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = spotGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
      </mesh>
      
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      
      {/* Sun corona */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial 
          color="#FFA500" 
          transparent 
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Planet component
const Planet = ({ planet, index }: { planet: any; index: number }) => {
  const planetRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += planet.speed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = THREE.MathUtils.degToRad(planet.tilt);
    }
  });

  const planetTexture = useMemo(() => {
    return createPlanetTexture(planet);
  }, [planet]);

  return (
    <group ref={planetRef}>
      <mesh position={[planet.distance, 0, 0]}>
        {/* Orbit line */}
        <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 64]} />
        <meshBasicMaterial color="rgba(255, 255, 255, 0.1)" transparent side={THREE.DoubleSide} />
      </mesh>
      
      <group position={[planet.distance, 0, 0]}>
        {/* Planet */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshLambertMaterial map={planetTexture} />
        </mesh>
        
        {/* Rings for gas giants */}
        {planet.hasRings && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry 
              args={[
                planet.size * 1.5, 
                planet.size * (planet.prominentRings ? 2.5 : 2), 
                64
              ]} 
            />
            <meshBasicMaterial 
              color={planet.prominentRings ? "#D2B48C" : "rgba(255, 255, 255, 0.3)"} 
              transparent 
              opacity={planet.prominentRings ? 0.8 : 0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Moons */}
        {planet.moons?.map((moon: any, moonIndex: number) => (
          <Moon key={moonIndex} moon={moon} planetSize={planet.size} />
        ))}
      </group>
    </group>
  );
};

// Moon component
const Moon = ({ moon, planetSize }: { moon: any; planetSize: number }) => {
  const moonRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.rotation.y += moon.speed;
    }
  });
  
  return (
    <group ref={moonRef}>
      <mesh position={[planetSize + moon.distance, 0, 0]}>
        <sphereGeometry args={[moon.size, 16, 16]} />
        <meshLambertMaterial color={moon.color} />
      </mesh>
    </group>
  );
};

// Asteroid Belt component
const AsteroidBelt = () => {
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 300; i++) {
      const angle = (i / 300) * Math.PI * 2;
      const distance = 10.5 + Math.random() * 2; // Between Mars and Jupiter
      const size = Math.random() * 0.08 + 0.02;
      temp.push({
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 0.8,
          Math.sin(angle) * distance
        ],
        size
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {asteroids.map((asteroid, index) => (
        <mesh key={index} position={asteroid.position as [number, number, number]}>
          <sphereGeometry args={[asteroid.size, 8, 8]} />
          <meshLambertMaterial color="#8C7853" />
        </mesh>
      ))}
    </group>
  );
};

// Nebula background component
const NebulaBackground = () => {
  const nebulaRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z += 0.0002;
      nebulaRef.current.rotation.y += 0.0001;
    }
  });

  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create nebula gradient
      const gradient = ctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
      gradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
      gradient.addColorStop(0.3, 'rgba(75, 0, 130, 0.08)');
      gradient.addColorStop(0.6, 'rgba(25, 25, 112, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2048, 2048);
      
      // Add some nebula wisps
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 2048;
        const radius = Math.random() * 200 + 100;
        
        const wispGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        wispGradient.addColorStop(0, 'rgba(255, 20, 147, 0.03)');
        wispGradient.addColorStop(0.5, 'rgba(64, 224, 208, 0.02)');
        wispGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = wispGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh ref={nebulaRef} position={[0, 0, -200]}>
      <sphereGeometry args={[300, 32, 32]} />
      <meshBasicMaterial 
        map={nebulaTexture} 
        transparent 
        opacity={0.6}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Main Solar System component
export const SolarSystem = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 20, 35], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#FFD700" decay={1} />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFA500" decay={2} />
        
        {/* Background elements */}
        <NebulaBackground />
        <Stars radius={400} depth={80} count={3000} factor={8} saturation={0} fade />
        
        {/* Solar system */}
        <group>
          <Sun />
          {planetData.map((planet, index) => (
            <Planet key={planet.name} planet={planet} index={index} />
          ))}
          <AsteroidBelt />
        </group>
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={150}
          autoRotate={true}
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};