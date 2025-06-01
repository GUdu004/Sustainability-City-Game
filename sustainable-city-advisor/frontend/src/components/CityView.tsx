import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Water } from 'three/examples/jsm/objects/Water';

interface SceneElement {
  id: string;
  type: 'building' | 'vegetation' | 'infrastructure' | 'effect';
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
}

export default function CityView({ 
  environmentScore = 60, 
  economyScore = 55, 
  happinessScore = 65, 
  sceneElements = [] 
}: CityViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const loadedModelsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const groundRef = useRef<THREE.Mesh>();
  const skyRef = useRef<Sky>();
  const waterRef = useRef<Water>();
  const cloudsRef = useRef<THREE.Group>(new THREE.Group());
  const particleSystemsRef = useRef<THREE.Group[]>([]);
  const directionalLightRef = useRef<THREE.DirectionalLight>();
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Create particle system for effects like smoke and pollution
  const createParticleSystem = (type: string, position: { x: number; y: number; z: number }) => {
    const particleGroup = new THREE.Group();
    
    if (type === 'smoke') {
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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current?.appendChild(renderer.domElement);
    
    // Store refs
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    
    // Setup camera position
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;
    
    // Add ground
    const groundSize = 1000;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    
    // Use environment score to determine ground color
    const groundColor = new THREE.Color().setHSL(
      0.3, // Base green hue
      environmentScore / 100, // Saturation based on environment score
      0.4 // Lightness
    );
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: groundColor,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;
    
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
    
    // Add simple water
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
        distortionScale: 3.7,
        fog: false
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5; // Below ground level
    scene.add(water);
    waterRef.current = water;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    controlsRef.current = controls;
    
    // Load scene elements from props
    const loadModels = async () => {
      const loader = new GLTFLoader();
      
      // Process each scene element
      for (const element of sceneElements) {
        try {
          // Check if we've already loaded this model
          if (!loadedModelsRef.current.has(element.modelPath)) {
            const gltf = await new Promise<THREE.Group>((resolve, reject) => {
              loader.load(
                element.modelPath,
                (gltf) => resolve(gltf.scene),
                undefined,
                (error) => reject(error)
              );
            });
            
            // Configure the model
            gltf.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            // Store the loaded model
            loadedModelsRef.current.set(element.modelPath, gltf.clone());
          }
          
          // Clone the loaded model for this instance
          const model = loadedModelsRef.current.get(element.modelPath)!.clone();
          
          // Set position
          model.position.set(
            element.position.x,
            element.position.y,
            element.position.z
          );
          
          // Set scale if provided
          if (element.scale) {
            model.scale.set(
              element.scale.x,
              element.scale.y,
              element.scale.z
            );
          }
          
          // Set rotation if provided
          if (element.rotation) {
            model.rotation.set(
              element.rotation.x,
              element.rotation.y,
              element.rotation.z
            );
          }
          
          // Add the model to the scene
          scene.add(model);
          
          // Add special effects based on element type
          if (element.type === 'industrial' && environmentScore < 50) {
            const smoke = createParticleSystem('smoke', {
              x: element.position.x,
              y: element.position.y + 5,
              z: element.position.z
            });
            scene.add(smoke);
            particleSystemsRef.current.push(smoke);
          }
        } catch (error) {
          console.error(`Error loading model ${element.modelPath}:`, error);
        }
      }
    };
    
    loadModels();
    
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
  }, [environmentScore, economyScore, happinessScore, sceneElements]);
  
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};