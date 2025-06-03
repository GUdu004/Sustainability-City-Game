// A utility to create flat, non-reflective terrain
// This implementation completely bypasses Three.js lighting and material systems
// to ensure absolutely no reflections or lighting effects

import * as THREE from 'three';

export class FlatTerrainProvider {
  static createFlatTerrain(size: number = 400): THREE.Mesh {
    // Use a simple plane with minimum segments
    const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    
    // Create a custom shader material that ignores lighting completely
    // This is a raw shader that will render the same color regardless of lighting conditions
    const flatShader = {
      uniforms: {
        color: { value: new THREE.Color(0x4a5d23) }  // Dark green base color
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          // Create a subtle canvas-like texture effect for a matte appearance
          float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 finalColor = color * (0.98 + noise * 0.04); // Very subtle variation (2%)
          
          // Output color with full opacity, completely ignoring all lighting
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    };    // Create a shader material with specific settings to ensure no reflections
    const material = new THREE.ShaderMaterial({
      uniforms: flatShader.uniforms,
      vertexShader: flatShader.vertexShader,
      fragmentShader: flatShader.fragmentShader,
      depthWrite: true,
      lights: false,
      transparent: false,
      side: THREE.FrontSide // Only render the front side to avoid any potential reflection issues
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    
    // Disable all shadow and light interactions
    terrain.receiveShadow = false;
    terrain.castShadow = false;
    terrain.frustumCulled = false; // Ensure it's always rendered
    
    // Set render order to ensure it renders before other objects
    terrain.renderOrder = -1;
    
    return terrain;
  }

  // Method to update the terrain color based on environment score
  static updateTerrainColor(terrain: THREE.Mesh, environmentScore: number): void {
    if (terrain && terrain.material && terrain.material instanceof THREE.ShaderMaterial) {
      // Calculate color based on environment score
      const hue = 0.25; // Green hue
      const saturation = 0.5 + (environmentScore / 400); // Slightly adjust saturation based on score
      const lightness = 0.3 + (environmentScore / 200); // Lightness based on environment score
      
      // Create a color object
      const color = new THREE.Color();
      color.setHSL(hue, saturation, lightness);
      
      // Update the shader uniform
      terrain.material.uniforms.color.value = color;
      terrain.material.needsUpdate = true; // Ensure material updates
    }
  }
  
  // Additional utility method to create a completely flat ground plane
  static createGroundPlane(size: number = 400): THREE.Mesh {
    // Create a canvas texture for the ground
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill with base color
      context.fillStyle = '#4a5d23';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle noise for a matte texture
      context.globalAlpha = 0.05;
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5;
        
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = Math.random() > 0.5 ? '#3a4d13' : '#5a6d33';
        context.fill();
      }
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    // Create a flat plane with the texture
    const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      fog: false,
      depthWrite: true,
      side: THREE.FrontSide
    });
    
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = false;
    plane.castShadow = false;
    
    return plane;
  }
}
