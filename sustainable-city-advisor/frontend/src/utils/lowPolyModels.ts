// Low-poly 3D model generator for Sustainable City Game
// Creates detailed procedural geometry for various city elements

import * as THREE from 'three';

export class LowPolyModelGenerator {
  
  // Building models
  static createCityHall(): THREE.Group {
    const group = new THREE.Group();
    
    // Main building body (classical style)
    const mainGeometry = new THREE.BoxGeometry(12, 16, 10);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 }); // Sandstone color
    const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
    mainBuilding.position.y = 8;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);
    
    // Classical columns (front)
    for (let i = 0; i < 6; i++) {
      const columnGeometry = new THREE.CylinderGeometry(0.4, 0.4, 14);
      const columnMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC }); // Beige
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(-5 + i * 2, 7, 5.2);
      column.castShadow = true;
      group.add(column);
    }
    
    // Dome on top
    const domeGeometry = new THREE.SphereGeometry(3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Green dome
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 19;
    dome.castShadow = true;
    group.add(dome);
    
    // Steps at the base
    const stepsGeometry = new THREE.BoxGeometry(14, 1, 3);
    const stepsMaterial = new THREE.MeshLambertMaterial({ color: 0xD3D3D3 }); // Light gray
    const steps = new THREE.Mesh(stepsGeometry, stepsMaterial);
    steps.position.set(0, 0.5, 4);
    steps.receiveShadow = true;
    group.add(steps);
    
    return group;
  }
  
  static createHospital(): THREE.Group {
    const group = new THREE.Group();
    
    // Main building
    const mainGeometry = new THREE.BoxGeometry(14, 12, 8);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // White
    const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
    mainBuilding.position.y = 6;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);
    
    // Red cross on front
    const crossVertical = new THREE.BoxGeometry(1, 6, 0.2);
    const crossHorizontal = new THREE.BoxGeometry(4, 1, 0.2);
    const crossMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Red
    
    const crossV = new THREE.Mesh(crossVertical, crossMaterial);
    crossV.position.set(0, 8, 4.2);
    group.add(crossV);
    
    const crossH = new THREE.Mesh(crossHorizontal, crossMaterial);
    crossH.position.set(0, 8, 4.2);
    group.add(crossH);
    
    // Wings (L-shaped building)
    const wingGeometry = new THREE.BoxGeometry(6, 8, 6);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 }); // Off-white
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-10, 4, 0);
    leftWing.castShadow = true;
    leftWing.receiveShadow = true;
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(10, 4, 0);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    group.add(rightWing);
    
    return group;
  }
  
  static createSchool(): THREE.Group {
    const group = new THREE.Group();
    
    // Main building (modern style)
    const mainGeometry = new THREE.BoxGeometry(16, 8, 10);
    const mainMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 }); // Burlywood
    const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
    mainBuilding.position.y = 4;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    group.add(mainBuilding);
    
    // Windows (blue tinted)
    for (let x = -6; x <= 6; x += 3) {
      for (let y = 2; y <= 6; y += 2) {
        const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB }); // Sky blue
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x, y, 5.2);
        group.add(window);
      }
    }
    
    // Playground equipment
    const swingGeometry = new THREE.BoxGeometry(4, 3, 1);
    const swingMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 }); // Tomato
    const swing = new THREE.Mesh(swingGeometry, swingMaterial);
    swing.position.set(-12, 1.5, 0);
    swing.castShadow = true;
    group.add(swing);
    
    return group;
  }
  
  static createHighRise(): THREE.Group {
    const group = new THREE.Group();
    
    // Main tower
    const towerGeometry = new THREE.BoxGeometry(8, 32, 8);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 16;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);
    
    // Windows pattern
    for (let floor = 0; floor < 16; floor++) {
      for (let side = 0; side < 4; side++) {
        const windowGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.2);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
          color: Math.random() > 0.3 ? 0xFFFF00 : 0x000080 // Random lit/unlit windows
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        
        // Position windows on each side
        const angle = (side * Math.PI) / 2;
        const radius = 4.2;
        window.position.set(
          Math.sin(angle) * radius,
          2 + floor * 2,
          Math.cos(angle) * radius
        );
        window.rotation.y = angle;
        group.add(window);
      }
    }
    
    // Antenna on top
    const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6);
    const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 35;
    group.add(antenna);
    
    return group;
  }
  
  static createManufacturingPlant(): THREE.Group {
    const group = new THREE.Group();
    
    // Main factory building
    const factoryGeometry = new THREE.BoxGeometry(20, 10, 12);
    const factoryMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dim gray
    const factory = new THREE.Mesh(factoryGeometry, factoryMaterial);
    factory.position.y = 5;
    factory.castShadow = true;
    factory.receiveShadow = true;
    group.add(factory);
    
    // Smokestacks
    for (let i = 0; i < 3; i++) {
      const stackGeometry = new THREE.CylinderGeometry(1, 1.2, 15);
      const stackMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
      const stack = new THREE.Mesh(stackGeometry, stackMaterial);
      stack.position.set(-8 + i * 8, 17.5, 0);
      stack.castShadow = true;
      group.add(stack);
      
      // Smoke cap
      const capGeometry = new THREE.CylinderGeometry(1.5, 1, 1);
      const capMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(-8 + i * 8, 25.5, 0);
      group.add(cap);
    }
    
    // Loading dock
    const dockGeometry = new THREE.BoxGeometry(6, 4, 3);
    const dockMaterial = new THREE.MeshLambertMaterial({ color: 0xA0A0A0 });
    const dock = new THREE.Mesh(dockGeometry, dockMaterial);
    dock.position.set(13, 2, 0);
    dock.castShadow = true;
    group.add(dock);
    
    return group;
  }
  
  // Infrastructure models
  static createSolarPanels(): THREE.Group {
    const group = new THREE.Group();
    
    // Support structure
    const supportGeometry = new THREE.BoxGeometry(0.5, 3, 0.5);
    const supportMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 }); // Silver
    
    for (let i = 0; i < 4; i++) {
      const support = new THREE.Mesh(supportGeometry, supportMaterial);
      support.position.set((i % 2) * 8 - 4, 1.5, Math.floor(i / 2) * 6 - 3);
      support.castShadow = true;
      group.add(support);
    }
    
    // Solar panels
    for (let x = 0; x < 2; x++) {
      for (let z = 0; z < 2; z++) {
        const panelGeometry = new THREE.BoxGeometry(8, 0.3, 6);
        const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e }); // Dark blue
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(x * 8 - 4, 3, z * 6 - 3);
        panel.rotation.x = -Math.PI / 6; // Tilted for sun
        panel.castShadow = true;
        group.add(panel);
        
        // Panel grid lines
        const gridMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        for (let gx = 0; gx < 3; gx++) {
          const gridLine = new THREE.BoxGeometry(0.1, 0.1, 6);
          const grid = new THREE.Mesh(gridLine, gridMaterial);
          grid.position.set(x * 8 - 6 + gx * 2, 3.2, z * 6 - 3);
          grid.rotation.x = -Math.PI / 6;
          group.add(grid);
        }
      }
    }
    
    return group;
  }
  
  static createWindTurbine(): THREE.Group {
    const group = new THREE.Group();
    
    // Tower
    const towerGeometry = new THREE.CylinderGeometry(0.8, 1.2, 24);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5F5 }); // White smoke
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 12;
    tower.castShadow = true;
    group.add(tower);
    
    // Nacelle (housing)
    const nacelleGeometry = new THREE.BoxGeometry(4, 2, 2);
    const nacelleMaterial = new THREE.MeshLambertMaterial({ color: 0xDCDCDC }); // Gainsboro
    const nacelle = new THREE.Mesh(nacelleGeometry, nacelleMaterial);
    nacelle.position.y = 24;
    nacelle.castShadow = true;
    group.add(nacelle);
    
    // Hub
    const hubGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
    const hubMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.set(2, 24, 0);
    hub.rotation.z = Math.PI / 2;
    group.add(hub);
      // Blades
    const bladesGroup = new THREE.Group();
    bladesGroup.userData.isBlades = true; // Mark for animation
    bladesGroup.name = 'blades';
    
    for (let i = 0; i < 3; i++) {
      const bladeGeometry = new THREE.BoxGeometry(0.2, 12, 1);
      const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xF8F8FF }); // Ghost white
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      blade.position.set(0, 6, 0); // Relative to hub
      blade.rotation.z = (i * Math.PI * 2) / 3;
      blade.castShadow = true;
      bladesGroup.add(blade);
    }
    
    bladesGroup.position.set(2.5, 24, 0);
    group.add(bladesGroup);
    
    return group;
  }
  
  // Vegetation models
  static createTree(): THREE.Group {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 3;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Foliage layers (low-poly style)
    const foliagePositions = [
      { y: 7, radius: 3 },
      { y: 9, radius: 2.5 },
      { y: 11, radius: 2 }
    ];
    
    foliagePositions.forEach(pos => {
      const foliageGeometry = new THREE.ConeGeometry(pos.radius, 3, 6);
      const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = pos.y;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      group.add(foliage);
    });
    
    return group;
  }
  
  static createCommunityPark(): THREE.Group {
    const group = new THREE.Group();
    
    // Park base
    const baseGeometry = new THREE.CylinderGeometry(15, 15, 0.2);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 }); // Light green
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.1;
    base.receiveShadow = true;
    group.add(base);
    
    // Trees around the park
    const treePositions = [
      { x: -8, z: -8 }, { x: 8, z: -8 }, { x: -8, z: 8 }, { x: 8, z: 8 },
      { x: 0, z: -10 }, { x: -10, z: 0 }, { x: 10, z: 0 }, { x: 0, z: 10 }
    ];
    
    treePositions.forEach(pos => {
      const tree = this.createTree();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.set(0.7, 0.7, 0.7);
      group.add(tree);
    });
    
    // Playground equipment
    const equipmentGeometry = new THREE.BoxGeometry(2, 2, 2);
    const equipmentMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6347 }); // Tomato
    const equipment = new THREE.Mesh(equipmentGeometry, equipmentMaterial);
    equipment.position.set(0, 1, 0);
    equipment.castShadow = true;
    group.add(equipment);
    
    // Benches
    const benchPositions = [{ x: -5, z: 0 }, { x: 5, z: 0 }, { x: 0, z: -5 }, { x: 0, z: 5 }];
    benchPositions.forEach(pos => {
      const benchGeometry = new THREE.BoxGeometry(3, 0.5, 1);
      const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
      const bench = new THREE.Mesh(benchGeometry, benchMaterial);
      bench.position.set(pos.x, 0.5, pos.z);
      bench.castShadow = true;
      group.add(bench);
    });
    
    return group;
  }
  
  // Effect models
  static createCleanAir(): THREE.Group {
    const group = new THREE.Group();
    
    // Transparent sphere with glow effect
    const sphereGeometry = new THREE.SphereGeometry(2, 12, 8);
    const sphereMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.3
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 3;
    group.add(sphere);
    
    // Floating particles
    for (let i = 0; i < 12; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMaterial = new THREE.MeshLambertMaterial({ color: 0x00FFFF }); // Cyan
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      const angle = (i / 12) * Math.PI * 2;
      const radius = 3 + Math.sin(i) * 0.5;
      particle.position.set(
        Math.cos(angle) * radius,
        3 + Math.sin(i * 0.5) * 2,
        Math.sin(angle) * radius
      );
      group.add(particle);
    }
    
    return group;
  }
  
  static createEnergyGlow(): THREE.Group {
    const group = new THREE.Group();
    
    // Central energy core
    const coreGeometry = new THREE.SphereGeometry(1, 8, 6);
    const coreMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFFD700,
      emissive: 0x443300
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 2;
    group.add(core);
    
    // Energy rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2 + i, 0.2, 4, 8);
      const ringMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x00FF00,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 2;
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = (i * Math.PI) / 3;
      group.add(ring);
    }
    
    return group;
  }
  
  static createSmokeEffect(): THREE.Group {
    const group = new THREE.Group();
    
    // Smoke clouds at different heights
    for (let i = 0; i < 5; i++) {
      const cloudGeometry = new THREE.SphereGeometry(1 + i * 0.3, 6, 4);
      const cloudMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x696969,
        transparent: true,
        opacity: 0.7 - i * 0.1
      });
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 4,
        2 + i * 2,
        (Math.random() - 0.5) * 4
      );
      group.add(cloud);
    }
    
    return group;
  }
  
  static createSparkle(): THREE.Group {
    const group = new THREE.Group();
    
    // Sparkle particles
    for (let i = 0; i < 20; i++) {
      const sparkleGeometry = new THREE.SphereGeometry(0.1, 4, 3);
      const sparkleMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFFFF,
        emissive: 0x444444
      });
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      
      const angle = (i / 20) * Math.PI * 2;
      const radius = 1 + Math.random() * 2;
      sparkle.position.set(
        Math.cos(angle) * radius,
        Math.random() * 4 + 1,
        Math.sin(angle) * radius
      );
      group.add(sparkle);
    }
    
    return group;
  }
  
  static createKnowledge(): THREE.Group {
    const group = new THREE.Group();
    
    // Book stack
    for (let i = 0; i < 5; i++) {
      const bookGeometry = new THREE.BoxGeometry(2, 0.3, 1.5);
      const bookMaterial = new THREE.MeshLambertMaterial({ 
        color: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF][i]
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.position.y = 0.15 + i * 0.3;
      book.rotation.y = (Math.random() - 0.5) * 0.3;
      book.castShadow = true;
      group.add(book);
    }
    
    // Floating symbols
    const symbols = ['?', '!', '★'];
    for (let i = 0; i < 6; i++) {
      const symbolGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
      const symbolMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
      const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
      
      const angle = (i / 6) * Math.PI * 2;
      symbol.position.set(
        Math.cos(angle) * 3,
        2 + Math.sin(i) * 1,
        Math.sin(angle) * 3
      );
      group.add(symbol);
    }
    
    return group;
  }
  
  // Factory method to create models based on filename
  static createModel(modelPath: string, elementType: string, elementId: string): THREE.Group {
    // Extract model name from path
    const modelName = modelPath.split('/').pop()?.replace('.glb', '') || '';
    
    switch (modelName) {
      // Buildings
      case 'city-hall':
        return this.createCityHall();
      case 'hospital':
        return this.createHospital();
      case 'high_rise':
        return this.createHighRise();
      case 'manufacturing_plant':
        return this.createManufacturingPlant();
      
      // Infrastructure
      case 'solar_panels':
        return this.createSolarPanels();
      case 'wind_turbine':
        return this.createWindTurbine();
      
      // Vegetation
      case 'tree':
        return this.createTree();
      case 'community_park':
        return this.createCommunityPark();
      
      // Effects
      case 'clean_air':
        return this.createCleanAir();
      case 'energy_glow':
        return this.createEnergyGlow();
      case 'smoke_effect':
        return this.createSmokeEffect();
      case 'sparkle':
        return this.createSparkle();
      case 'knowledge':
        return this.createKnowledge();
      
      default:
        // Fallback to simple geometry based on element type
        return this.createGenericModel(elementType, elementId);
    }
  }
  
  static createGenericModel(elementType: string, elementId: string): THREE.Group {
    const group = new THREE.Group();
    
    switch (elementType) {
      case 'building':
        const buildingGeometry = new THREE.BoxGeometry(4, 8, 4);
        const buildingMaterial = new THREE.MeshLambertMaterial({ 
          color: elementId.includes('school') ? 0x4ECDC4 : 0x808080
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 4;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);
        break;
        
      case 'infrastructure':
        const infraGeometry = new THREE.BoxGeometry(3, 2, 3);
        const infraMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const infra = new THREE.Mesh(infraGeometry, infraMaterial);
        infra.position.y = 1;
        infra.castShadow = true;
        group.add(infra);
        break;
        
      case 'vegetation':
        return this.createTree();
        
      case 'effect':
        const effectGeometry = new THREE.SphereGeometry(1);
        const effectMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x00ff00,
          transparent: true,
          opacity: 0.7
        });
        const effect = new THREE.Mesh(effectGeometry, effectMaterial);
        effect.position.y = 2;
        group.add(effect);
        break;
        
      default:
        const defaultGeometry = new THREE.BoxGeometry(3, 3, 3);
        const defaultMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const defaultMesh = new THREE.Mesh(defaultGeometry, defaultMaterial);
        defaultMesh.position.y = 1.5;
        defaultMesh.castShadow = true;
        defaultMesh.receiveShadow = true;
        group.add(defaultMesh);
    }
    
    return group;
  }
}
