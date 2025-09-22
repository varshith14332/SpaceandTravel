'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const SolarSystem = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationIdRef = useRef<number | null>(null);

  // Scaling constants
  const PLANET_SCALE = 2.2; // increased for bigger planets
  const SUN_RADIUS = 45; // much bigger sun
  const ORBIT_SPEED_SCALE = 1.4; // reduced further for slower revolution

  // Planet data
  const planetData = [
    { name: 'Mercury', radius: 0.383, distance: 80, speed: 4.74, color: '#8C7853' },
    { name: 'Venus', radius: 0.949, distance: 110, speed: 3.50, color: '#FFC649' },
    { name: 'Earth', radius: 1.0, distance: 140, speed: 2.98, color: '#6B93D6' },
    { name: 'Mars', radius: 0.532, distance: 180, speed: 2.41, color: '#C1440E' },
    { name: 'Jupiter', radius: 11.21, distance: 250, speed: 1.31, color: '#D8CA9D' },
    { name: 'Saturn', radius: 9.45, distance: 320, speed: 0.97, color: '#FAD5A5' },
    { name: 'Uranus', radius: 4.01, distance: 390, speed: 0.68, color: '#4FD0E3' },
    { name: 'Neptune', radius: 3.88, distance: 460, speed: 0.54, color: '#4B70DD' }
  ];

  // Texture mapping
  const textureBaseNames: { [key: string]: string } = {
    'Sun': 'sun',
    'Mercury': 'mercury',
    'Venus': 'venus',
    'Earth': 'earth',
    'Mars': 'mars',
    'Jupiter': 'jupiter',
    'Saturn': 'saturn',
    'Uranus': 'uranus',
    'Neptune': 'neptune'
  };

  const loadTexture = (baseName: string): Promise<THREE.Texture | null> => {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      const candidateFolders = ['/solartextures/', '/'];
      const candidateExts = ['.jpg', '.jpeg', '.png', '.webp', '.JPG'];

      let attempts = 0;
      const totalAttempts = candidateFolders.length * candidateExts.length;

      const tryLoad = () => {
        if (attempts >= totalAttempts) {
          resolve(null);
          return;
        }

        const folderIndex = Math.floor(attempts / candidateExts.length);
        const extIndex = attempts % candidateExts.length;
        const folder = candidateFolders[folderIndex];
        const ext = candidateExts[extIndex];
        const url = `${folder}${baseName}${ext}`;

        attempts++;

        loader.load(
          url,
          (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            resolve(texture);
          },
          undefined,
          () => tryLoad()
        );
      };

      tryLoad();
    });
  };

  const createPlanetMaterial = async (planetName: string, fallbackColor: string) => {
    const baseName = textureBaseNames[planetName];
    if (baseName) {
      const texture = await loadTexture(baseName);
      if (texture) {
        return new THREE.MeshLambertMaterial({
          map: texture,
          transparent: false,
          opacity: 1.0,
          depthWrite: true,
          depthTest: true
        });
      }
    }

    return new THREE.MeshLambertMaterial({
      color: fallbackColor,
      transparent: false,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true
    });
  };

  const createSunMaterial = async () => {
    const texture = await loadTexture('sun');
    if (texture) {
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: false
      });
    }

    return new THREE.MeshBasicMaterial({
      color: '#FDB813',
      transparent: false
    });
  };

  const initScene = async () => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Camera positioning
    camera.position.set(0, 200, 600);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2, 2000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Create sun
    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 64, 32);
    const sunMaterial = await createSunMaterial();
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { name: 'Sun' };
    scene.add(sun);

    // Create planets
    const planets: THREE.Mesh[] = [];
    for (let i = 0; i < planetData.length; i++) {
      const planet = planetData[i];
      const geometry = new THREE.SphereGeometry(planet.radius * PLANET_SCALE, 32, 16);
      const material = await createPlanetMaterial(planet.name, planet.color);
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.x = planet.distance;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { 
        name: planet.name, 
        distance: planet.distance, 
        speed: planet.speed,
        angle: Math.random() * Math.PI * 2
      };
      
      scene.add(mesh);
      planets.push(mesh);

      // Create orbit line
      const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.5, planet.distance + 0.5, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: planet.color,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = -Math.PI / 2;
      scene.add(orbitLine);
    }

    // Animation
    let lastTime = 0;
    const runAnimation = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      planets.forEach((planet) => {
        const userData = planet.userData;
        userData.angle += (userData.speed * ORBIT_SPEED_SCALE) * deltaTime * 0.01;
        
        planet.position.x = Math.cos(userData.angle) * userData.distance;
        planet.position.z = Math.sin(userData.angle) * userData.distance;
        
        planet.rotation.y += deltaTime * 0.5;
      });

      renderer.render(scene, camera);
      animationIdRef.current = requestAnimationFrame(runAnimation);
    };

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    
    runAnimation(0);
    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  };

  useEffect(() => {
    initScene();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #000011, #000033, #000000)' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-xl">Loading Solar System...</div>
        </div>
      )}
    </div>
  );
};