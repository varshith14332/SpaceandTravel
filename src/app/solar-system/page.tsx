"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: number;
  info: string;
  moons: number;
  textureColors: {
    base: number;
    secondary?: number;
    atmosphere?: number;
  };
}

// Scaling constants
const PLANET_SCALE = 2.2; // increased for bigger planets
const SUN_RADIUS = 45; // much bigger sun
const ORBIT_SPEED_SCALE = 1.4; // reduced further for slower revolution

const SolarSystemSimulation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const planetsRef = useRef<any[]>([]);
  const texturesRef = useRef<Record<string, THREE.Texture>>({});
  const initializedRef = useRef(false); // guard against React StrictMode double effect
  const [textureDebug, setTextureDebug] = useState<Record<string,string>>({});
  
  const isAnimatingRef = useRef(true);
  const animationSpeedRef = useRef(1);
  const lastFrameTimeRef = useRef<number>(0);
  const restartNeededRef = useRef(false);
  // keep state for UI only
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  const planetData: PlanetData[] = [
  // Adjusted speeds: still progressively slower outward, but inner planets reduced to avoid extreme fast orbit
  { name: 'Mercury', radius: 3.5 * PLANET_SCALE, distance: 35, speed: 1.8, color: 0x8c7853, info: "Closest planet to the Sun. Surface temperatures range from -290°F to 800°F.", moons: 0, textureColors: { base: 0x8c7853, secondary: 0x5d4e37 }},
  { name: 'Venus', radius: 4.8 * PLANET_SCALE, distance: 50, speed: 1.15, color: 0xffc649, info: "Hottest planet in our solar system. Thick atmosphere of carbon dioxide.", moons: 0, textureColors: { base: 0xffc649, atmosphere: 0xffaa33 }},
  { name: 'Earth', radius: 5.0 * PLANET_SCALE, distance: 70, speed: 0.85, color: 0x228b22, info: "Our home planet. Only known planet with life. 71% water coverage.", moons: 1, textureColors: { base: 0x228b22, secondary: 0x4169e1, atmosphere: 0x87ceeb }},
  { name: 'Mars', radius: 4.2 * PLANET_SCALE, distance: 95, speed: 0.42, color: 0xcd5c5c, info: "The Red Planet. Has the largest volcano in the solar system.", moons: 2, textureColors: { base: 0xcd5c5c, secondary: 0x8b4513 }},
    { name: 'Jupiter', radius: 15 * PLANET_SCALE, distance: 150, speed: 0.084, color: 0xd2b48c, info: "Largest planet. Great Red Spot is a giant storm larger than Earth.", moons: 79, textureColors: { base: 0xd2b48c, secondary: 0xdaa520 }},
    { name: 'Saturn', radius: 13 * PLANET_SCALE, distance: 190, speed: 0.034, color: 0xfad5a5, info: "Famous for its beautiful ring system. Less dense than water.", moons: 82, textureColors: { base: 0xfad5a5, secondary: 0xf4a460 }},
    { name: 'Uranus', radius: 8 * PLANET_SCALE, distance: 230, speed: 0.012, color: 0x4fd0e3, info: "Ice giant tilted on its side. Rotates almost perpendicular to its orbit.", moons: 27, textureColors: { base: 0x4fd0e3, atmosphere: 0x40e0d0 }},
    { name: 'Neptune', radius: 7.5 * PLANET_SCALE, distance: 270, speed: 0.006, color: 0x4b70dd, info: "Windiest planet with speeds up to 1,200 mph. Deep blue color from methane.", moons: 14, textureColors: { base: 0x4b70dd, atmosphere: 0x1e90ff }}
  ];

  // Mapping of planet names to texture asset paths (place your images in public/solar-textures)
  const textureBaseNames: Record<string, string> = {
    Mercury: 'mercury', Venus: 'venus', Earth: 'earth', Mars: 'mars', Jupiter: 'jupiter', Saturn: 'saturn', Uranus: 'uranus', Neptune: 'neptune', Sun: 'sun'
  };
  const candidateExts = ['.jpg', '.jpeg', '.png', '.webp', '.JPG'];
  const candidateFolders = ['/solartextures/', '/']; // actual folder present (no dash)

  // Create realistic planet material (prefers loaded texture, falls back to procedural canvas)
  const createPlanetMaterial = (planetData: PlanetData) => {
    const loadedTexture = texturesRef.current[planetData.name];
    if (loadedTexture) {
      return new THREE.MeshLambertMaterial({
        map: loadedTexture,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
        side: THREE.FrontSide,
      });
    }

    // -------- Fallback procedural generation (kept for robustness) --------
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    if (planetData.name === 'Earth') {
      const oceanGradient = ctx.createRadialGradient(256, 128, 50, 256, 128, 256);
      oceanGradient.addColorStop(0, '#4169e1');
      oceanGradient.addColorStop(0.7, '#1e90ff');
      oceanGradient.addColorStop(1, '#000080');
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#228b22';
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 40 + 20,
          Math.random() * 20 + 10,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 15 + 5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `#${planetData.textureColors.base.toString(16).padStart(6, '0')}`);
      if (planetData.textureColors.secondary) {
        gradient.addColorStop(0.5, `#${planetData.textureColors.secondary.toString(16).padStart(6, '0')}`);
      }
      gradient.addColorStop(1, `#${planetData.textureColors.base.toString(16).padStart(6, '0')}`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = i % 2 ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 8 + 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return new THREE.MeshLambertMaterial({
      map: texture,
      transparent: false,
      opacity: 1.0,
      depthWrite: true,
      depthTest: true,
    });
  };

  // Create sun material with glow effect
  const createSunMaterial = () => {
    const sunTex = texturesRef.current['Sun'];
    if (sunTex) {
      return new THREE.MeshStandardMaterial({
        map: sunTex,
        emissive: 0xffaa00,
        emissiveIntensity: 1.2,
        roughness: 1,
        metalness: 0
      });
    }
    // Fallback procedural texture if sun image missing
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffff88');
    gradient.addColorStop(0.55, '#ffaa00');
    gradient.addColorStop(0.75, '#ff6600');
    gradient.addColorStop(1, '#ff3300');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 200; i++) {
      const hue = 30 + Math.random() * 40;
      const brightness = 55 + Math.random() * 40;
      ctx.fillStyle = `hsl(${hue}, 100%, ${brightness}%)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 10 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0xffaa00,
      emissiveIntensity: 1.0
    });
  };

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);
  useEffect(() => {
    animationSpeedRef.current = animationSpeed;
  }, [animationSpeed]);

  useEffect(() => {
    if (!mountRef.current) return;
    let mounted = true;
    const clock = new THREE.Clock();
    const initScene = async () => {
      try {
        if (initializedRef.current) {
          console.warn('Solar system already initialized - skipping duplicate init');
          return;
        }
        initializedRef.current = true;
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);
        sceneRef.current = scene;

        // Camera setup
        const aspect = mountRef.current!.clientWidth / mountRef.current!.clientHeight;
        const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 5000);
        camera.position.set(0, 150, 400);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
        });
        renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.NoToneMapping; // no tone mapping for natural colors
        renderer.toneMappingExposure = 1.0;
        // Ensure correct output color space (sRGB) + legacy outputEncoding fallback
        // @ts-ignore
        if ((renderer as any).outputColorSpace !== undefined) {
          // @ts-ignore
          renderer.outputColorSpace = THREE.SRGBColorSpace || (THREE as any).LinearSRGBColorSpace;
        }
        if ((renderer as any).outputEncoding !== undefined) {
          (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
        }
        rendererRef.current = renderer;
        
        mountRef.current!.appendChild(renderer.domElement);

        // Create enhanced starfield background
        const createStarField = () => {
          const starsGeometry = new THREE.BufferGeometry();
          const starPositions = new Float32Array(15000 * 3);
          const starSizes = new Float32Array(15000);
          
          for (let i = 0; i < 15000; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 6000;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 6000;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 6000;
            starSizes[i] = Math.random() * 3 + 1;
          }
          
          starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
          starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
          
          const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
          });
          const stars = new THREE.Points(starsGeometry, starMaterial);
          scene.add(stars);

          // Add nebula-like background
          const nebulaGeometry = new THREE.SphereGeometry(3000, 32, 32);
          const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x220033,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
          });
          const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
          scene.add(nebula);
        };

        createStarField();

        // Preload planet textures before creating meshes
        const loader = new THREE.TextureLoader();
        const loadTexture = (planetName: string) => {
          return new Promise<void>((resolve) => {
            const base = textureBaseNames[planetName];
            if (!base) return resolve();
            let loaded = false;
            const attempts: string[] = [];
            candidateFolders.forEach(f => candidateExts.forEach(ext => attempts.push(`${f}${base}${ext}`)));
            const tryIndex = (i: number) => {
              if (i >= attempts.length) {
                if (!loaded) {
                  console.warn(`[Textures] MISS ${planetName} (tried: ${attempts.join(', ')})`);
                  setTextureDebug(prev => ({...prev, [planetName]: 'fallback'}));
                }
                return resolve();
              }
              const path = attempts[i];
              loader.load(path, (tex) => {
                if (loaded) return; // already fulfilled
                loaded = true;
                // Color space compatibility
                // @ts-ignore
                if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace || (THREE as any).SRGBColorSpace;
                else if ((tex as any).encoding !== undefined) (tex as any).encoding = (THREE as any).sRGBEncoding;
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                texturesRef.current[planetName] = tex;
                console.info(`[Textures] HIT  ${planetName} -> ${path}`);
                setTextureDebug(prev => ({...prev, [planetName]: path}));
                // Hot swap if planet already exists with fallback material
                const planetObj = planetsRef.current.find((p: any) => p.data?.name === planetName);
                if (planetObj && planetObj.mesh && planetObj.mesh.material) {
                  const oldMat = planetObj.mesh.material as THREE.Material;
                  const newMat = createPlanetMaterial(planetObj.data);
                  planetObj.mesh.material = newMat;
                  oldMat.dispose();
                }
                resolve();
              }, undefined, () => {
                tryIndex(i + 1);
              });
            };
            tryIndex(0);
          });
        };
        await Promise.all(Object.keys(textureBaseNames).map(loadTexture));

        // Create the Sun with enhanced visuals - MUCH LARGER (sun texture optional if provided)
  const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 64, 64);
  const sunMaterial = createSunMaterial();
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.name = 'sun';
  sun.castShadow = false;
  scene.add(sun);
  // Add additive glow sprite
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256; glowCanvas.height = 256;
  const gctx = glowCanvas.getContext('2d')!;
  const ggrad = gctx.createRadialGradient(128,128,10,128,128,128);
  ggrad.addColorStop(0,'rgba(255,255,200,1)');
  ggrad.addColorStop(0.4,'rgba(255,170,0,0.9)');
  ggrad.addColorStop(0.7,'rgba(255,100,0,0.4)');
  ggrad.addColorStop(1,'rgba(255,50,0,0)');
  gctx.fillStyle = ggrad;
  gctx.fillRect(0,0,256,256);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const glowSprite = new THREE.Sprite(glowMat);
  glowSprite.scale.set(SUN_RADIUS*4, SUN_RADIUS*4, 1);
  glowSprite.name = 'sun-glow';
  scene.add(glowSprite);

        // Enhanced multi-layer corona/glow effect
        const coronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.3, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
          color: 0xffcc00,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        });
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        corona.name = 'corona';
        scene.add(corona);

        // Mid corona
        const midCoronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.6, 32, 32);
        const midCoronaMaterial = new THREE.MeshBasicMaterial({
          color: 0xff8800,
          transparent: true,
          opacity: 0.2,
          side: THREE.BackSide
        });
        const midCorona = new THREE.Mesh(midCoronaGeometry, midCoronaMaterial);
        midCorona.name = 'midCorona';
        scene.add(midCorona);

        // Outer corona
        const outerCoronaGeometry = new THREE.SphereGeometry(SUN_RADIUS * 1.9, 32, 32);
        const outerCoronaMaterial = new THREE.MeshBasicMaterial({
          color: 0xff4400,
          transparent: true,
          opacity: 0.1,
          side: THREE.BackSide
        });
        const outerCorona = new THREE.Mesh(outerCoronaGeometry, outerCoronaMaterial);
        outerCorona.name = 'outerCorona';
        scene.add(outerCorona);

        // Simple, effective lighting for natural planet appearance
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // increased for softer shadows
        scene.add(ambientLight);

        // Main sun light - positioned at sun center for proper shadow direction
        const sunLight = new THREE.PointLight(0xffffff, 3, 3000); // slightly reduced to avoid harsh contrast
        sunLight.position.set(0, 0, 0); // at sun center
        sunLight.castShadow = false; // disable shadows to avoid issues
        scene.add(sunLight);

        // Additional fill lights to soften the day/night transition
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight1.position.set(0, 50, 0); // from above
        scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight2.position.set(0, -50, 0); // from below
        scene.add(fillLight2);        // Create planets with realistic materials
        const planets: any[] = [];
        
        planetData.forEach((data, index) => {
          // Enhanced planet geometry and materials
          const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
          const material = createPlanetMaterial(data);

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.name = data.name;
          
          // Set initial position
          const startAngle = (index / planetData.length) * Math.PI * 2;
          const x = Math.cos(startAngle) * data.distance;
          const z = Math.sin(startAngle) * data.distance;
          mesh.position.set(x, 0, z);
          
          scene.add(mesh);

          // Create orbit paths with enhanced visibility and glow
          const orbitGeometry = new THREE.BufferGeometry();
          const orbitPoints = [];
          const numPoints = 256;
          
          for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            orbitPoints.push(
              Math.cos(angle) * data.distance,
              0,
              Math.sin(angle) * data.distance
            );
          }
          
          orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
          
          // Create glowing orbital lines with planet-specific colors
          const getOrbitColor = (planetName: string) => {
            switch (planetName) {
              case 'Mercury': return 0xaaaaaa;
              case 'Venus': return 0xffcc44;
              case 'Earth': return 0x4488ff;
              case 'Mars': return 0xff6644;
              case 'Jupiter': return 0xffaa44;
              case 'Saturn': return 0xffffaa;
              case 'Uranus': return 0x44aaff;
              case 'Neptune': return 0x4466ff;
              default: return 0x888888;
            }
          };
          
          const orbitMaterial = new THREE.LineBasicMaterial({
            color: getOrbitColor(data.name),
            transparent: true,
            opacity: showOrbits ? 0.4 : 0
          });
          const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
          orbitLine.name = `${data.name}-orbit`;
          scene.add(orbitLine);

          let planetObj: any = {
            mesh,
            orbitLine,
            data,
            angle: startAngle,
            initialAngle: startAngle,
            orbitRadius: data.distance,
            orbitSpeed: data.speed
          };

          // Special handling for Saturn's rings - more realistic
          if (data.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.0, 64);
            const ringMaterial = new THREE.MeshPhongMaterial({
              color: 0xcccccc,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.7,
              shininess: 100
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2 + 0.1;
            rings.position.copy(mesh.position);
            rings.name = 'saturn-rings';
            rings.castShadow = true;
            rings.receiveShadow = true;
            rings.material.transparent = true;
            rings.material.opacity = 0.7;
            scene.add(rings);
            
            planetObj.rings = rings;
          }

          // Add atmosphere for Earth and Venus with enhanced realism
          if (data.name === 'Earth' || data.name === 'Venus') {
            const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.02, 32, 32);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
              color: data.textureColors.atmosphere || 0x87ceeb,
              transparent: true,
              opacity: 0.15,
              side: THREE.BackSide
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            atmosphere.position.copy(mesh.position);
            atmosphere.name = `${data.name}-atmosphere`;
            scene.add(atmosphere);
            
            planetObj.atmosphere = atmosphere;
            
            // Add cloud layer specifically for Earth
            if (data.name === 'Earth') {
              const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.005, 64, 64);
              
              // Create procedural cloud texture
              const cloudCanvas = document.createElement('canvas');
              cloudCanvas.width = 512;
              cloudCanvas.height = 256;
              const cloudCtx = cloudCanvas.getContext('2d')!;
              
              // Create cloud pattern
              cloudCtx.fillStyle = '#000000';
              cloudCtx.fillRect(0, 0, 512, 256);
              
              // Add cloud formations
              cloudCtx.globalCompositeOperation = 'screen';
              for (let i = 0; i < 200; i++) {
                const size = Math.random() * 40 + 10;
                const opacity = Math.random() * 0.8 + 0.2;
                cloudCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                cloudCtx.beginPath();
                cloudCtx.arc(
                  Math.random() * 512,
                  Math.random() * 256,
                  size,
                  0,
                  Math.PI * 2
                );
                cloudCtx.fill();
              }
              
              const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
              const cloudMaterial = new THREE.MeshStandardMaterial({
                map: cloudTexture,
                transparent: true,
                opacity: 0.4,
                roughness: 1,
                metalness: 0
              });
              
              const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
              clouds.position.copy(mesh.position);
              clouds.name = 'earth-clouds';
              scene.add(clouds);
              
              planetObj.clouds = clouds;
            }
          }

          planets.push(planetObj);
        });

  planetsRef.current = planets;
        console.log("Created planets:", planets.length, "planets");
        console.log("Planets stored in ref:", planetsRef.current.length);
        
        // Enhanced mouse controls
        let mouseX = 0;
        let mouseY = 0;
        let isMouseDown = false;
        let cameraDistance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

        const handleMouseMove = (event: MouseEvent) => {
          if (!isMouseDown) return;
          
          const deltaX = event.clientX - mouseX;
          const deltaY = event.clientY - mouseY;
          
          const spherical = new THREE.Spherical();
          spherical.setFromVector3(camera.position);
          
          spherical.theta -= deltaX * 0.005;
          spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * 0.005));
          
          camera.position.setFromSpherical(spherical);
          camera.lookAt(0, 0, 0);
          
          mouseX = event.clientX;
          mouseY = event.clientY;
        };

        const handleMouseDown = (event: MouseEvent) => {
          isMouseDown = true;
          mouseX = event.clientX;
          mouseY = event.clientY;
        };

        const handleMouseUp = () => {
          isMouseDown = false;
        };

        const handleWheel = (event: WheelEvent) => {
          event.preventDefault();
          const factor = event.deltaY > 0 ? 1.1 : 0.9;
          cameraDistance *= factor;
          cameraDistance = Math.max(80, Math.min(1200, cameraDistance));
          
          const direction = camera.position.clone().normalize();
          camera.position.copy(direction.multiplyScalar(cameraDistance));
          camera.lookAt(0, 0, 0);
        };

        // Add keyboard controls
        const handleKeyPress = (event: KeyboardEvent) => {
          if (event.code === 'Space') {
            event.preventDefault();
            setIsAnimating(prev => !prev);
          }
        };

        // Add event listeners
        const canvas = renderer.domElement;
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('keydown', handleKeyPress);

        // Handle window resize
        const handleResize = () => {
          if (!mountRef.current || !mounted) return;
          
          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop (robust)
        const runAnimation = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, clock: THREE.Clock) => {
          const tick = () => {
            const now = performance.now();
            const delta = clock.getDelta();
            lastFrameTimeRef.current = now;

            if (scene) {
              const sunMesh = scene.getObjectByName('sun');
              const coronaMesh = scene.getObjectByName('corona');
              const midCoronaMesh = scene.getObjectByName('midCorona');
              const outerCoronaMesh = scene.getObjectByName('outerCorona');
              if (sunMesh) sunMesh.rotation.y += 0.4 * delta;
              if (coronaMesh) coronaMesh.rotation.y -= 0.25 * delta;
              if (midCoronaMesh) midCoronaMesh.rotation.y += 0.18 * delta;
              if (outerCoronaMesh) outerCoronaMesh.rotation.y += 0.1 * delta;
              if (planetsRef.current.length) {
                const speedScale = ORBIT_SPEED_SCALE;
                const sunPos = new THREE.Vector3(0,0,0);
                planetsRef.current.forEach(p => {
                  if (isAnimatingRef.current) p.angle += p.orbitSpeed * speedScale * delta * (animationSpeedRef.current || 1);
                  const x = Math.cos(p.angle) * p.orbitRadius;
                  const z = Math.sin(p.angle) * p.orbitRadius;
                  p.mesh.position.set(x,0,z);
                  if (isAnimatingRef.current) p.mesh.rotation.y += 0.3 * delta;
                  
                  // Update positions of atmosphere and special effects
                  if (p.atmosphere) {
                    p.atmosphere.position.set(x, 0, z);
                  }
                  if (p.rings) {
                    p.rings.position.set(x, 0, z);
                  }
                  if (p.clouds) {
                    p.clouds.position.set(x, 0, z);
                    // Slower cloud rotation for realistic effect
                    if (isAnimatingRef.current) p.clouds.rotation.y += 0.1 * delta;
                  }
                  // No shadow effects - keep planets always visible and bright
                  // Planets stay at full visibility with natural texture colors
                });
              }
            }

            renderer.render(scene, camera);

            animationIdRef.current = requestAnimationFrame(tick);
          };

          tick();
        };

        // Start the animation
  runAnimation(scene, camera, renderer, clock);
  if (mounted) setIsLoading(false);

        // Cleanup on unmount
        return () => {
          mounted = false;
          cancelAnimationFrame(animationIdRef.current!);
          initializedRef.current = false; // allow re-init if component truly remounts (e.g., HMR)
          window.removeEventListener('resize', handleResize);
          document.removeEventListener('keydown', handleKeyPress);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('wheel', handleWheel);
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
          scene.clear();
          renderer.dispose();
          planets.forEach(p => {
            if (p.mesh) p.mesh.geometry.dispose();
            if (p.orbitLine) p.orbitLine.geometry.dispose();
            if (p.atmosphere) p.atmosphere.geometry.dispose();
            if (p.rings) p.rings.geometry.dispose();
          });
        };
      } catch (error) {
        console.error("Error initializing scene:", error);
      }
    };

    initScene();
  }, []);

  // UI controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlanet(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleOrbits = () => {
    setShowOrbits(prev => !prev);
    if (planetsRef.current.length) {
      planetsRef.current.forEach(p => {
        const orbitLine = p.orbitLine;
        if (orbitLine) {
          orbitLine.material.opacity = showOrbits ? 0 : 0.4;
          orbitLine.visible = showOrbits;
        }
      });
    }
  };

  const handlePlanetClick = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    
    // Center and focus on the selected planet
    if (sceneRef.current) {
      const planetObj = planetsRef.current.find(p => p.data.name === planet.name);
      if (planetObj) {
        const { mesh } = planetObj;
        const targetPosition = mesh.position.clone().normalize().multiplyScalar(300);
        
        // Smooth transition to the new position
        new THREE.Vector3().lerpVectors(cameraRef.current!.position, targetPosition, 0.1);
        
        cameraRef.current!.position.copy(targetPosition);
        cameraRef.current!.lookAt(mesh.position);
      }
    }
  };

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh', position: 'relative' }} />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fontSize: '24px',
          zIndex: 10
        }}>
          Loading Solar System...
        </div>
      )}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 100
      }}>
        <div>
          <strong>Controls:</strong>
        </div>
        <div>
          <kbd style={{ padding: '5px', margin: '2px', background: '#222', color: '#fff' }}>Space</kbd> - Toggle Animation
        </div>
        <div>
          <kbd style={{ padding: '5px', margin: '2px', background: '#222', color: '#fff' }}>Esc</kbd> - Deselect Planet
        </div>
        <div>
          <kbd style={{ padding: '5px', margin: '2px', background: '#222', color: '#fff' }}>O</kbd> - Toggle Orbits
        </div>
      </div>
      {selectedPlanet && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: '#fff',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px',
          borderRadius: '8px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          zIndex: 100
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
            {selectedPlanet.name}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Info:</strong> {selectedPlanet.info}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Moons:</strong> {selectedPlanet.moons}
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Distance from Sun:</strong> {selectedPlanet.distance} million km
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Orbital Speed:</strong> {selectedPlanet.speed} km/s
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Atmosphere:</strong> {selectedPlanet.textureColors.atmosphere ? 'Yes' : 'No'}
          </div>
          <div style={{ marginTop: '10px', textAlign: 'right' }}>
            <button onClick={() => setSelectedPlanet(null)} style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '5px',
              borderRadius: '4px',
              transition: 'background 0.3s'
            }}>
              &#10005; Close
            </button>
          </div>
        </div>
      )}
      {/* Texture debug overlay (temporary; remove when satisfied) */}
      {process.env.NODE_ENV !== 'production' && !!Object.keys(textureDebug).length && (
        <div style={{position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.55)', padding:'8px', fontSize:'11px', color:'#fff', maxWidth:'220px', lineHeight:1.3, fontFamily:'monospace', zIndex:200}}>
          <div style={{fontWeight:'bold', marginBottom:4}}>Texture Status</div>
          {Object.entries(textureDebug).map(([k,v]) => (
            <div key={k} style={{color: v==='fallback'? '#ff6666':'#66ff99'}}>{k}: {v==='fallback'? 'fallback' : v.replace('/solar-textures/','')}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolarSystemSimulation;