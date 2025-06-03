import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';
import { LowPolyModelGenerator } from '../utils/lowPolyModels';
import { TerrainGenerator } from '../utils/terrainGenerator';
import { FlatTerrainProvider } from '../utils/flatTerrainProvider';
import { Achievement } from '../types';

interface SceneElement {
  id: string;
  type: 'building' | 'vegetation' | 'infrastructure' | 'industrial' | 'residential' | 'commercial' | 'civic' | 'effect';
  modelPath: string;
  position: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

interface CityViewProps {
  environmentScore: number;
  economyScore: number;
  happinessScore: number;
  sceneElements: SceneElement[];
  recentAchievements?: Achievement[];
}

export default function CityView({ 
  environmentScore = 60, 
  economyScore = 55, 
  happinessScore = 65, 
  sceneElements = [],
  recentAchievements = []
}: CityViewProps) {
  console.log('=== CITYVIEW COMPONENT RENDER ===');
  console.log('Props received:');
  console.log('- environmentScore:', environmentScore);
  console.log('- economyScore:', economyScore);
  console.log('- happinessScore:', happinessScore);
  console.log('- sceneElements:', sceneElements);
  console.log('- sceneElements length:', sceneElements.length);
  console.log('CityView component received sceneElements:', sceneElements);
  console.log('Environment score:', environmentScore, 'Economy score:', economyScore, 'Happiness score:', happinessScore);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const loadedModelsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const windTurbinesRef = useRef<THREE.Group[]>([]);
  const birdsRef = useRef<THREE.Group[]>([]);
  const groundRef = useRef<THREE.Mesh>();
  const skyRef = useRef<Sky>();
  const waterRef = useRef<Water>();
  const cloudsRef = useRef<THREE.Group>(new THREE.Group());
  const particleSystemsRef = useRef<THREE.Group[]>([]);
  const directionalLightRef = useRef<THREE.DirectionalLight>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Achievement-based visual effects handler
  const addAchievementVisualEffects = (unlockedAchievements: Achievement[]) => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    
    unlockedAchievements.forEach(achievement => {
      if (achievement.reward?.visualEffect) {
        switch (achievement.reward.visualEffect) {
          case 'fireworks':
            // Add celebratory fireworks
            const fireworks = createParticleSystem('celebration', { x: 0, y: 20, z: 0 });
            scene.add(fireworks);
            setTimeout(() => scene.remove(fireworks), 5000);
            break;
            
          case 'golden_glow':
            // Add golden glow to the entire city
            if (directionalLightRef.current) {
              const originalColor = directionalLightRef.current.color.clone();
              directionalLightRef.current.color.setHex(0xffcc00);
              setTimeout(() => {
                if (directionalLightRef.current) {
                  directionalLightRef.current.color.copy(originalColor);
                }
              }, 3000);
            }
            break;
            
          case 'rainbow_particles':
            // Add rainbow particle effects
            const rainbow = createParticleSystem('rainbow', { x: 0, y: 15, z: 0 });
            scene.add(rainbow);
            setTimeout(() => scene.remove(rainbow), 4000);
            break;
            
          case 'nature_burst':
            // Add instant trees around the city
            const natureBurst = TerrainGenerator.createForest(10, 80);
            scene.add(natureBurst);
            break;
            
          case 'economic_sparkles':
            // Add golden sparkles around buildings
            sceneElements.filter(el => el.type === 'commercial' || el.type === 'industrial')
              .forEach(building => {
                const sparkles = createParticleSystem('sparkles', building.position);
                scene.add(sparkles);
                setTimeout(() => scene.remove(sparkles), 3000);
              });
            break;
        }
      }
    });
  };

  // Enhanced particle system with more effect types
  const createParticleSystem = (type: string, position: { x: number; y: number; z: number }) => {
    const particleGroup = new THREE.Group();
    
    if (type === 'celebration') {
      // Fireworks effect
      const particleCount = 500;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Random spherical distribution
        const radius = 2 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        velocities[i * 3] = (Math.random() - 0.5) * 2;
        velocities[i * 3 + 1] = Math.random() * 2;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
        
        // Bright celebratory colors
        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particles.userData.velocities = velocities;
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      particleSystem.position.set(position.x, position.y, position.z);
      particleGroup.add(particleSystem);
      
    } else if (type === 'rainbow') {
      // Rainbow arc effect
      const particleCount = 300;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI;
        const radius = 30;
        const height = Math.sin(angle) * 15;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle * 0.5) * 5;
        
        // Rainbow colors
        const hue = (i / particleCount) * 360;
        const color = new THREE.Color().setHSL(hue / 360, 1, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      particleSystem.position.set(position.x, position.y, position.z);
      particleGroup.add(particleSystem);
      
    } else if (type === 'sparkles') {
      // Golden sparkles
      const particleCount = 100;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = Math.random() * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xffd700,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      particleSystem.position.set(position.x, position.y + 5, position.z);
      particleGroup.add(particleSystem);
      
    } else if (type === 'smoke') {
      // Enhanced smoke particles for pollution
      const particleCount = 200;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Position within a column above the smokestack
        const x = (Math.random() - 0.5) * 2;
        const y = Math.random() * 10;
        const z = (Math.random() - 0.5) * 2;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Grey color with some variation
        const shade = 0.3 + Math.random() * 0.2;
        colors[i * 3] = shade;
        colors[i * 3 + 1] = shade;
        colors[i * 3 + 2] = shade;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      particleSystem.position.set(position.x, position.y + 5, position.z);
      particleGroup.add(particleSystem);
    }
    
    return particleGroup;
  };
  
  useEffect(() => {
    // Create scene
    const scene = new THREE.Scene();
    scene.fog = null; // Disable fog to prevent reflective effects
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false; // Disable shadow mapping to prevent reflective effects
    renderer.outputEncoding = THREE.LinearEncoding; // Use linear encoding for more consistent, less reflective materials
    renderer.physicallyCorrectLights = false; // Disable physically correct lighting which can cause reflections
    renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping which can affect material appearance
    mountRef.current?.appendChild(renderer.domElement);
    
    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Setup camera position for better overview
    camera.position.set(40, 30, 40);
    camera.lookAt(0, 0, 0);
    
    // Add lighting with better quality - reduced lighting intensity to minimize reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Reduced ambient light
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Reduced directional light intensity
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = false; // Disable shadows entirely
    directionalLightRef.current = directionalLight;
    scene.add(directionalLight);
    
    // Use the new flat terrain provider that has no reflections
    // Create a hybrid approach with two ground planes for better visual quality
    // First add the shader-based completely non-reflective ground
    const terrain = FlatTerrainProvider.createFlatTerrain(400);
    
    // Add a canvas-based textured ground on top for better visual appearance
    // This adds a subtle texture while maintaining the complete non-reflective nature
    const groundPlane = FlatTerrainProvider.createGroundPlane(400);
    groundPlane.position.y = 0.01; // Position slightly above the base terrain to avoid z-fighting
    
    // Update the terrain color based on environment score
    FlatTerrainProvider.updateTerrainColor(terrain, environmentScore);
    
    scene.add(terrain);
    scene.add(groundPlane);
    groundRef.current = terrain;
    
    // Add natural environment elements
    const mountains = TerrainGenerator.createMountains(4, 150);
    scene.add(mountains);
    
    const forest = TerrainGenerator.createForest(30, 120);
    scene.add(forest);
    
    const rocks = TerrainGenerator.createRocks(15, 100);
    scene.add(rocks);
    
    const clouds = TerrainGenerator.createClouds(5);
    scene.add(clouds);
    
    // Add river if environment score is high
    if (environmentScore > 60) {
      const river = TerrainGenerator.createRiver(80, 6);
      scene.add(river);
    }
    
    // Add birds if happiness score is high
    if (happinessScore > 70) {
      const birds = TerrainGenerator.createBirds(6);
      scene.add(birds);
      // Track individual birds for animation
      birds.children.forEach(bird => {
        if (bird instanceof THREE.Group) {
          birdsRef.current.push(bird);
        }
      });
    }
    
    // Add a test cube to verify Three.js is working
    const testGeometry = new THREE.BoxGeometry(5, 5, 5);
    const testMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(10, 2.5, 10);
    testCube.castShadow = true;
    scene.add(testCube);
    console.log('Added test cube to scene at position (10, 2.5, 10)');
    
    // Add sky
    const sky = new Sky();
    sky.scale.setScalar(1000);
    scene.add(sky);
    skyRef.current = sky;
    
    // Configure sky
    const sun = new THREE.Vector3();
    const effectController = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      elevation: 45,
      azimuth: 180
    };
    
    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
    
    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(sun);
    
    // Add simple water positioned well below terrain to avoid reflections
    const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
    const water = new Water(
      waterGeometry,
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
          '/models/effects/waternormals.jpg', 
          function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(0, 1, 0),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 1.0, // Reduced distortion to minimize reflective appearance
        fog: false,
        alpha: 0.9 // Make water more opaque to hide reflections
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -50; // Positioned extremely low to completely avoid any reflections on ground
    scene.add(water);
    waterRef.current = water;
    
    // Add orbit controls with improved settings
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 15;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;
    
    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update water if present
      if (waterRef.current) {
        waterRef.current.material.uniforms['time'].value += delta;
      }
      
      // Update particle systems
      particleSystemsRef.current.forEach(particles => {
        particles.children.forEach(child => {
          if (child instanceof THREE.Points) {
            // Make particles rise
            child.position.y += delta * 0.5;
            
            // Reset particles that go too high
            if (child.position.y > 15) {
              child.position.y = 5;
            }
          }
        });
      });
      
      // Animate wind turbines
      windTurbinesRef.current.forEach(turbine => {
        turbine.children.forEach(child => {
          if (child.userData.isBlades) {
            child.rotation.x += delta * 2; // Rotate blades
          }
        });
      });
      
      // Animate birds in circular flight
      birdsRef.current.forEach((bird, index) => {
        const time = clock.getElapsedTime();
        const radius = 60 + Math.sin(time * 0.1 + index) * 10;
        const angle = time * 0.1 + index * (Math.PI * 2 / birdsRef.current.length);
        
        bird.position.set(
          Math.cos(angle) * radius,
          15 + Math.sin(time * 0.2 + index) * 5,
          Math.sin(angle) * radius
        );
        bird.rotation.y = angle + Math.PI / 2;
        
        // Wing flapping animation
        bird.children.forEach(wing => {
          if (wing.userData.isWing) {
            wing.rotation.z = Math.sin(time * 5) * 0.3;
          }
        });
      });
      
      // Animate clouds slowly drifting
      cloudsRef.current.children.forEach((cloud, index) => {
        if (cloud instanceof THREE.Group) {
          cloud.position.x += delta * 0.5;
          cloud.position.z += delta * 0.2;
          
          // Reset position if too far
          if (cloud.position.x > 200) {
            cloud.position.x = -200;
          }
        }
      });
      
      // Render scene
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [environmentScore, economyScore, happinessScore]); // Remove sceneElements from dependencies

  // Separate useEffect for loading models when sceneElements change
  useEffect(() => {
    const loadModels = async () => {
      console.log('=== STARTING MODEL LOADING ===');
      console.log('Scene elements received:', sceneElements);
      console.log('Scene elements count:', sceneElements.length);
      
      if (!sceneRef.current) {
        console.log('⚠️ Scene not ready yet, skipping model loading');
        return;
      }
      
      if (sceneElements.length === 0) {
        console.log('⚠️ No scene elements to load');
        return;
      }
      
      const scene = sceneRef.current;
      const loader = new GLTFLoader();
      
      // Process each scene element
      for (const element of sceneElements) {
        let model: THREE.Group;
        
        try {
          console.log(`=== Loading GLTF model: ${element.modelPath} for element: ${element.id} ===`);
          
          // Check if we've already loaded this model
          if (!loadedModelsRef.current.has(element.modelPath)) {
            console.log(`Model not in cache, loading from: ${element.modelPath}`);
            const gltf = await new Promise<THREE.Group>((resolve, reject) => {
              loader.load(
                element.modelPath,
                (gltf) => {
                  console.log(`✅ Successfully loaded GLTF model: ${element.modelPath}`);
                  console.log('GLTF scene children count:', gltf.scene.children.length);
                  console.log('GLTF scene bounds:', new THREE.Box3().setFromObject(gltf.scene));
                  resolve(gltf.scene);
                },
                (progress) => {
                  console.log(`📦 Loading progress for ${element.modelPath}:`, progress);
                },
                (error) => {
                  console.info(`⚠️ GLTF model not available: ${element.modelPath}`);
                  reject(error);
                }
              );
            });
            
            // Configure the model
            gltf.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                console.log(`Configuring mesh: ${child.name || 'unnamed'}`);
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            // Store the loaded model
            loadedModelsRef.current.set(element.modelPath, gltf.clone());
            console.log(`📱 Cached GLTF model: ${element.modelPath}`);
          } else {
            console.log(`♻️ Using cached GLTF model: ${element.modelPath}`);
          }
          
          // Clone the loaded model for this instance
          model = loadedModelsRef.current.get(element.modelPath)!.clone() as THREE.Group;
          console.log('📋 Using GLTF model for instance');
          
        } catch (error) {
          console.info(`🎯 Using procedural model for ${element.id} (no GLTF file available)`);
          // Create detailed low-poly model when GLTF loading fails
          model = LowPolyModelGenerator.createModel(element.modelPath, element.type, element.id);
          console.log(`✅ Created procedural model for ${element.id} of type ${element.type}`);
        }
        
        // Set position
        model.position.set(
          element.position.x,
          element.position.y,
          element.position.z
        );
        console.log(`📍 Set position to: (${element.position.x}, ${element.position.y}, ${element.position.z})`);
        
        // Set scale if provided, otherwise use a default scale
        if (element.scale) {
          model.scale.set(
            element.scale.x,
            element.scale.y,
            element.scale.z
          );
          console.log(`📏 Applied custom scale: (${element.scale.x}, ${element.scale.y}, ${element.scale.z})`);
        } else {
          // Default scale for fallback geometry (reasonable size)
          model.scale.set(1, 1, 1);
          console.log(`📏 Applied default scale (1,1,1) to ${element.id}`);
        }
        
        // Set rotation if provided
        if (element.rotation) {
          model.rotation.set(
            element.rotation.x,
            element.rotation.y,
            element.rotation.z
          );
          console.log(`🔄 Applied rotation: (${element.rotation.x}, ${element.rotation.y}, ${element.rotation.z})`);
        }
        
        // Check the model bounds after scaling
        const boundingBox = new THREE.Box3().setFromObject(model);
        console.log(`📦 Model bounding box:`, boundingBox);
        console.log(`📦 Model size:`, boundingBox.getSize(new THREE.Vector3()));
        
        // Add the model to the scene
        scene.add(model);
        console.log(`✅ Successfully added model to scene: ${element.id}`);
        console.log(`📊 Current scene children count:`, scene.children.length);
        
        // Track special models for animation
        if (element.modelPath.includes('wind_turbine')) {
          // Mark blade groups for animation
          model.traverse((child) => {
            if (child.name === 'blades' || child.userData.isBlades) {
              child.userData.isBlades = true;
            }
          });
          windTurbinesRef.current.push(model);
          console.log(`🌪️ Added wind turbine to animation list: ${element.id}`);
        }
        
        // Add special effects based on element type
        if (element.type === 'industrial' && environmentScore < 50) {
          const smoke = createParticleSystem('smoke', {
            x: element.position.x,
            y: element.position.y + 5,
            z: element.position.z
          });
          scene.add(smoke);
          particleSystemsRef.current.push(smoke);
          console.log(`💨 Added smoke effect for industrial building: ${element.id}`);
        }
      }
      
      console.log('=== MODEL LOADING COMPLETE ===');
      console.log(`📊 Total scene children after loading: ${scene.children.length}`);
      console.log(`📱 Models cached: ${loadedModelsRef.current.size}`);
      console.log('Scene children types:', scene.children.map(child => child.type || child.constructor.name));
      
      // Force a render update
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        console.log('🎨 Forced initial render');
      }
    };
    
    loadModels();
  }, [sceneElements, environmentScore]); // Only run when sceneElements change
  
  // Handle achievement visual effects
  useEffect(() => {
    if (recentAchievements.length > 0) {
      console.log('🎉 Triggering achievement visual effects:', recentAchievements);
      addAchievementVisualEffects(recentAchievements);
    }
  }, [recentAchievements]);
  
  // Update terrain color when environment score changes
  useEffect(() => {
    if (groundRef.current && groundRef.current.material) {
      console.log('Updating terrain color based on environment score:', environmentScore);
      FlatTerrainProvider.updateTerrainColor(groundRef.current, environmentScore);
    }
  }, [environmentScore]);
  
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};