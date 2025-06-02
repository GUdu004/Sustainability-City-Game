// Terrain generator for Sustainable City Game
// Creates low-poly terrain with hills, rivers, and natural features

import * as THREE from 'three';

export class TerrainGenerator {
  
  static createLowPolyTerrain(size: number = 200, segments: number = 32): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Get position attribute to modify vertices
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    // Create height variations for low-poly terrain
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Create rolling hills using noise-like function
      let height = 0;
      
      // Base terrain height
      height += Math.sin(x * 0.01) * 2;
      height += Math.cos(z * 0.01) * 1.5;
      
      // Add some random variation
      height += (Math.random() - 0.5) * 0.5;
      
      // Create a river valley in the center
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      if (distanceFromCenter < 30) {
        height -= 2;
      }
      
      positions[i + 1] = height; // Y coordinate
    }
    
    // Update the geometry
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create material with vertex colors based on height
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x4a5d23, // Dark green
      vertexColors: false,
      wireframe: false
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    
    return terrain;
  }
  
  static createRiver(length: number = 100, width: number = 4): THREE.Group {
    const group = new THREE.Group();
    
    // Create river segments
    const segments = 20;
    const segmentLength = length / segments;
    
    for (let i = 0; i < segments; i++) {
      const riverGeometry = new THREE.PlaneGeometry(segmentLength, width + Math.sin(i * 0.5) * 2);
      const riverMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4169E1, // Royal blue
        transparent: true,
        opacity: 0.8
      });
      
      const riverSegment = new THREE.Mesh(riverGeometry, riverMaterial);
      riverSegment.position.set(
        -length/2 + i * segmentLength,
        -1.5, // Below terrain level
        Math.sin(i * 0.3) * 10 // Meandering effect
      );
      riverSegment.rotation.x = -Math.PI / 2;
      riverSegment.receiveShadow = true;
      
      group.add(riverSegment);
    }
    
    return group;
  }
  
  static createMountains(count: number = 3, maxRadius: number = 80): THREE.Group {
    const group = new THREE.Group();
    
    for (let i = 0; i < count; i++) {
      const mountainGeometry = new THREE.ConeGeometry(
        15 + Math.random() * 10, // Base radius
        20 + Math.random() * 15, // Height
        6 + Math.floor(Math.random() * 3) // Radial segments (low-poly)
      );
      
      const mountainMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.15, 0.3, 0.4 + Math.random() * 0.2) // Brown variations
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      // Position mountains around the edges
      const angle = (i / count) * Math.PI * 2;
      const radius = maxRadius + Math.random() * 20;
      mountain.position.set(
        Math.cos(angle) * radius,
        10 + Math.random() * 5,
        Math.sin(angle) * radius
      );
      
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      
      group.add(mountain);
      
      // Add snow cap for taller mountains
      if (mountain.position.y > 12) {
        const snowCapGeometry = new THREE.ConeGeometry(
          mountainGeometry.parameters.radiusTop * 0.6,
          mountainGeometry.parameters.height * 0.3,
          6
        );
        const snowCapMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const snowCap = new THREE.Mesh(snowCapGeometry, snowCapMaterial);
        snowCap.position.copy(mountain.position);
        snowCap.position.y += mountainGeometry.parameters.height * 0.6;
        group.add(snowCap);
      }
    }
    
    return group;
  }
  
  static createForest(treeCount: number = 50, area: number = 150): THREE.Group {
    const group = new THREE.Group();
    
    for (let i = 0; i < treeCount; i++) {
      // Create low-poly tree
      const treeGroup = new THREE.Group();
      
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(
        0.3 + Math.random() * 0.2,
        0.5 + Math.random() * 0.3,
        4 + Math.random() * 2,
        6
      );
      const trunkMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.8, 0.2 + Math.random() * 0.1)
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = trunkGeometry.parameters.height / 2;
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      // Foliage
      const foliageGeometry = new THREE.ConeGeometry(
        2 + Math.random() * 1.5,
        3 + Math.random() * 2,
        6 + Math.floor(Math.random() * 2)
      );
      const foliageMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.3, 0.7, 0.3 + Math.random() * 0.2)
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = trunkGeometry.parameters.height + foliageGeometry.parameters.height / 2;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
      
      // Random position in forest area
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * area;
      treeGroup.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
      
      // Random scale and rotation
      const scale = 0.7 + Math.random() * 0.6;
      treeGroup.scale.set(scale, scale, scale);
      treeGroup.rotation.y = Math.random() * Math.PI * 2;
      
      group.add(treeGroup);
    }
    
    return group;
  }
  
  static createRocks(rockCount: number = 20, area: number = 120): THREE.Group {
    const group = new THREE.Group();
    
    for (let i = 0; i < rockCount; i++) {
      // Create irregular rock shapes
      const rockGeometry = new THREE.DodecahedronGeometry(
        0.5 + Math.random() * 1.5,
        0 // Low detail for low-poly look
      );
      
      const rockMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.1, 0.1, 0.4 + Math.random() * 0.2)
      });
      
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      
      // Random position
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * area;
      rock.position.set(
        Math.cos(angle) * radius,
        rockGeometry.parameters.radius / 2,
        Math.sin(angle) * radius
      );
      
      // Random rotation and scale
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      const scale = 0.5 + Math.random() * 1.5;
      rock.scale.set(scale, scale * (0.5 + Math.random() * 0.5), scale);
      
      rock.castShadow = true;
      rock.receiveShadow = true;
      
      group.add(rock);
    }
    
    return group;
  }
  
  static createBirds(birdCount: number = 8): THREE.Group {
    const group = new THREE.Group();
    
    for (let i = 0; i < birdCount; i++) {
      const birdGroup = new THREE.Group();
      
      // Simple bird body
      const bodyGeometry = new THREE.SphereGeometry(0.3, 6, 4);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      birdGroup.add(body);
        // Wings
      const wingGeometry = new THREE.BoxGeometry(1, 0.1, 0.3);
      const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      
      const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
      leftWing.position.set(-0.5, 0, 0);
      leftWing.rotation.z = Math.PI / 6;
      leftWing.userData.isWing = true; // Mark for animation
      birdGroup.add(leftWing);
      
      const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
      rightWing.position.set(0.5, 0, 0);
      rightWing.rotation.z = -Math.PI / 6;
      rightWing.userData.isWing = true; // Mark for animation
      birdGroup.add(rightWing);
      
      // Position in flight path
      const angle = (i / birdCount) * Math.PI * 2;
      const radius = 60 + Math.random() * 20;
      birdGroup.position.set(
        Math.cos(angle) * radius,
        15 + Math.random() * 10,
        Math.sin(angle) * radius
      );
      
      birdGroup.rotation.y = angle + Math.PI / 2;
      
      group.add(birdGroup);
    }
    
    return group;
  }
  
  static createClouds(cloudCount: number = 6): THREE.Group {
    const group = new THREE.Group();
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudGroup = new THREE.Group();
      
      // Multiple spheres to form cloud
      const cloudPartCount = 4 + Math.floor(Math.random() * 3);
      for (let j = 0; j < cloudPartCount; j++) {
        const cloudGeometry = new THREE.SphereGeometry(
          2 + Math.random() * 2,
          6, 4 // Low-poly spheres
        );
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.8
        });
        
        const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloudPart.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 8
        );
        
        cloudGroup.add(cloudPart);
      }
      
      // Position clouds in sky
      const angle = (i / cloudCount) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      cloudGroup.position.set(
        Math.cos(angle) * radius,
        40 + Math.random() * 20,
        Math.sin(angle) * radius
      );
      
      group.add(cloudGroup);
    }
    
    return group;
  }
}
