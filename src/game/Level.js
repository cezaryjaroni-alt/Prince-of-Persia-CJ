/**
 * Level System
 * Creates the Corporate Office Dungeon environment
 */

import * as THREE from 'three';
import { COLORS } from './Game.js';

export class Level {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.hazards = [];
    this.animatedObjects = [];
    this.goalPosition = null;

    this.createEnvironment();
  }

  createEnvironment() {
    // Create the corporate office dungeon
    this.createFloor();
    this.createWalls();
    this.createPlatforms();
    this.createHazards();
    this.createDecorations();
    this.createGoal();
  }

  createFloor() {
    // Main floor
    const floorGeometry = new THREE.BoxGeometry(60, 1, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.5, -20);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Physics for floor
    this.physics.createGround(
      { x: 60, y: 1, z: 100 },
      { x: 0, y: -0.5, z: -20 }
    );

    // Floor grid pattern
    const gridHelper = new THREE.GridHelper(60, 30, COLORS.PRIMARY_BLUE, 0x1a1a2a);
    gridHelper.position.y = 0.01;
    gridHelper.position.z = -20;
    this.scene.add(gridHelper);
  }

  createWalls() {
    // Wall material with Pracuj branding
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.PRIMARY_BLUE,
      roughness: 0.4,
      metalness: 0.3,
      emissive: COLORS.PRIMARY_BLUE,
      emissiveIntensity: 0.1
    });

    // Glass material for office windows
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.3
    });

    // Left wall run section
    this.createWallRunSection({
      position: { x: -10, y: 5, z: -10 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { x: 0.5, y: 10, z: 20 }
    }, wallMaterial);

    // Right wall run section
    this.createWallRunSection({
      position: { x: 10, y: 5, z: -25 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { x: 0.5, y: 10, z: 20 }
    }, wallMaterial);

    // Back wall with Pracuj logo area
    const backWallGeometry = new THREE.BoxGeometry(30, 15, 0.5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial.clone());
    backWall.position.set(0, 7.5, -50);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    this.scene.add(backWall);

    this.physics.createWall(
      { x: 30, y: 15, z: 0.5 },
      { x: 0, y: 7.5, z: -50 }
    );

    // "PRACUJ" text on back wall (simplified as glowing boxes)
    this.createBrandingText();

    // Side boundary walls (glass)
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 20, 100);

    const leftBoundary = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftBoundary.position.set(-30, 10, -20);
    this.scene.add(leftBoundary);

    const rightBoundary = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightBoundary.position.set(30, 10, -20);
    this.scene.add(rightBoundary);

    // Angled wall for advanced wall run
    this.createWallRunSection({
      position: { x: -5, y: 5, z: -35 },
      rotation: { x: 0, y: Math.PI / 6, z: 0 },
      size: { x: 0.5, y: 10, z: 15 }
    }, wallMaterial);
  }

  createWallRunSection(config, material) {
    const { position, rotation, size } = config;

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, material.clone());

    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    // Add glowing edge strips
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GOLD,
      emissive: COLORS.GOLD,
      emissiveIntensity: 0.5
    });

    // Top edge
    const topEdgeGeometry = new THREE.BoxGeometry(size.x + 0.1, 0.1, size.z + 0.1);
    const topEdge = new THREE.Mesh(topEdgeGeometry, edgeMaterial);
    topEdge.position.y = size.y / 2;
    mesh.add(topEdge);

    // Bottom edge
    const bottomEdge = new THREE.Mesh(topEdgeGeometry, edgeMaterial);
    bottomEdge.position.y = -size.y / 2;
    mesh.add(bottomEdge);

    this.scene.add(mesh);

    // Physics
    this.physics.createWall(size, position, rotation);

    return mesh;
  }

  createBrandingText() {
    // Create "PRACUJ" letters as emissive boxes
    const letterMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WHITE,
      emissive: COLORS.WHITE,
      emissiveIntensity: 0.8
    });

    const letters = ['P', 'R', 'A', 'C', 'U', 'J'];
    const letterWidth = 2;
    const startX = -((letters.length - 1) * letterWidth) / 2;

    letters.forEach((letter, index) => {
      const group = this.createLetter(letter, letterMaterial);
      group.position.set(startX + index * letterWidth * 1.5, 10, -49.5);
      group.scale.set(0.8, 0.8, 0.8);
      this.scene.add(group);
    });
  }

  createLetter(letter, material) {
    const group = new THREE.Group();
    const boxSize = 0.3;

    // Simple pixel-art style letters
    const patterns = {
      'P': [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
      ],
      'R': [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
        [1, 1, 0],
        [1, 0, 1]
      ],
      'A': [
        [0, 1, 0],
        [1, 0, 1],
        [1, 1, 1],
        [1, 0, 1],
        [1, 0, 1]
      ],
      'C': [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
      ],
      'U': [
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1]
      ],
      'J': [
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [1, 0, 1],
        [1, 1, 1]
      ]
    };

    const pattern = patterns[letter] || patterns['P'];

    pattern.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(boxSize, boxSize, boxSize),
            material
          );
          box.position.set(
            (x - 1) * boxSize * 1.2,
            (2 - y) * boxSize * 1.2,
            0
          );
          group.add(box);
        }
      });
    });

    return group;
  }

  createPlatforms() {
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      roughness: 0.6,
      metalness: 0.3
    });

    const platformConfigs = [
      // Starting platforms
      { pos: { x: 0, y: 0.25, z: 5 }, size: { x: 6, y: 0.5, z: 6 } },

      // Jumping platforms leading to wall run
      { pos: { x: -5, y: 1, z: -5 }, size: { x: 3, y: 0.5, z: 3 } },
      { pos: { x: -8, y: 2, z: -10 }, size: { x: 2, y: 0.5, z: 4 } },

      // Elevated platforms after wall run
      { pos: { x: 0, y: 3, z: -20 }, size: { x: 4, y: 0.5, z: 4 } },
      { pos: { x: 5, y: 4, z: -25 }, size: { x: 3, y: 0.5, z: 3 } },

      // Path to goal
      { pos: { x: 8, y: 5, z: -30 }, size: { x: 2, y: 0.5, z: 6 } },
      { pos: { x: 3, y: 6, z: -35 }, size: { x: 4, y: 0.5, z: 4 } },
      { pos: { x: -3, y: 7, z: -40 }, size: { x: 3, y: 0.5, z: 3 } },

      // Final platform before goal
      { pos: { x: 0, y: 8, z: -45 }, size: { x: 5, y: 0.5, z: 5 } }
    ];

    platformConfigs.forEach(config => {
      const geometry = new THREE.BoxGeometry(config.size.x, config.size.y, config.size.z);
      const mesh = new THREE.Mesh(geometry, platformMaterial.clone());

      mesh.position.set(config.pos.x, config.pos.y, config.pos.z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;

      // Add edge lighting
      const edgeGeometry = new THREE.BoxGeometry(
        config.size.x + 0.1,
        0.05,
        config.size.z + 0.1
      );
      const edgeMaterial = new THREE.MeshStandardMaterial({
        color: COLORS.PRIMARY_BLUE,
        emissive: COLORS.PRIMARY_BLUE,
        emissiveIntensity: 0.3
      });
      const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edge.position.y = config.size.y / 2;
      mesh.add(edge);

      this.scene.add(mesh);

      // Physics
      this.physics.createPlatform(config.size, config.pos);
    });
  }

  createHazards() {
    // Burnout Spikes
    this.createBurnoutSpikes({ x: -2, y: 0.5, z: -15 });
    this.createBurnoutSpikes({ x: 2, y: 0.5, z: -15 });

    // Meeting Trap (spinning obstacle)
    this.createMeetingTrap({ x: 0, y: 4, z: -22 });

    // Unpaid Internship Pitfall (marked area)
    this.createPitfall({ x: 6, y: 0, z: -28 });
  }

  createBurnoutSpikes(position) {
    const group = new THREE.Group();

    const spikeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.3
    });

    // Create spike cluster
    for (let i = 0; i < 5; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.15, 1, 4);
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      spike.position.set(
        (Math.random() - 0.5) * 1.5,
        0.5,
        (Math.random() - 0.5) * 1.5
      );
      spike.castShadow = true;
      group.add(spike);
    }

    // Warning sign
    const signGeometry = new THREE.BoxGeometry(1, 0.5, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.2
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 1.5, 0);
    group.add(sign);

    // "BURNOUT" text placeholder (just a dark strip)
    const textGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.05);
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, 1.5, 0.08);
    group.add(text);

    group.position.set(position.x, position.y, position.z);
    this.scene.add(group);

    this.hazards.push({
      type: 'spikes',
      position: new THREE.Vector3(position.x, position.y, position.z),
      radius: 1.5,
      damage: 20
    });
  }

  createMeetingTrap(position) {
    const group = new THREE.Group();

    // Spinning "meeting table"
    const tableGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 8);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3020,
      roughness: 0.7
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    group.add(table);

    // "Chairs" as obstacles
    const chairMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8
    });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const chairGroup = new THREE.Group();

      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.5),
        chairMaterial
      );
      seat.position.y = 0.5;

      chairGroup.add(seat);
      chairGroup.position.set(
        Math.cos(angle) * 1.5,
        0.1,
        Math.sin(angle) * 1.5
      );
      group.add(chairGroup);
    }

    // Warning ring
    const ringGeometry = new THREE.RingGeometry(2.3, 2.5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.GOLD,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.09;
    group.add(ring);

    group.position.set(position.x, position.y, position.z);
    this.scene.add(group);

    // Animate the meeting trap
    this.animatedObjects.push({
      object: group,
      type: 'spin',
      speed: 1
    });

    this.hazards.push({
      type: 'meeting',
      position: new THREE.Vector3(position.x, position.y, position.z),
      radius: 2,
      damage: 15,
      object: group
    });
  }

  createPitfall(position) {
    // Visual warning area
    const warningGeometry = new THREE.PlaneGeometry(4, 4);
    const warningMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const warning = new THREE.Mesh(warningGeometry, warningMaterial);
    warning.rotation.x = -Math.PI / 2;
    warning.position.set(position.x, position.y + 0.02, position.z);
    this.scene.add(warning);

    // Hazard stripes
    const stripeGeometry = new THREE.PlaneGeometry(4.2, 0.3);
    const stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.rotation.z = Math.PI / 4;
      stripe.position.set(
        position.x,
        position.y + 0.03,
        position.z + (i - 2) * 0.8
      );
      this.scene.add(stripe);
    }

    // "UNPAID INTERNSHIP" sign
    const signGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: 0x111111
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(position.x, position.y + 1, position.z - 2.5);
    sign.rotation.x = -0.2;
    this.scene.add(sign);

    this.hazards.push({
      type: 'pitfall',
      position: new THREE.Vector3(position.x, position.y - 5, position.z),
      radius: 2,
      damage: 50
    });
  }

  createDecorations() {
    // Floating cubicles
    this.createFloatingCubicle({ x: -15, y: 8, z: -15 });
    this.createFloatingCubicle({ x: 15, y: 12, z: -30 });
    this.createFloatingCubicle({ x: -12, y: 15, z: -40 });

    // Office plants (for atmosphere)
    this.createOfficePlant({ x: -8, y: 0, z: 3 });
    this.createOfficePlant({ x: 8, y: 0, z: 3 });

    // Ceiling lights
    for (let z = 0; z > -50; z -= 10) {
      this.createCeilingLight({ x: 0, y: 15, z: z });
    }
  }

  createFloatingCubicle(position) {
    const group = new THREE.Group();

    // Cubicle walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x808090,
      roughness: 0.9
    });

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2, 0.1),
      wallMaterial
    );
    backWall.position.z = -1;
    group.add(backWall);

    // Side walls
    const sideWall1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2, 2),
      wallMaterial
    );
    sideWall1.position.x = -1.5;
    group.add(sideWall1);

    const sideWall2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2, 2),
      wallMaterial
    );
    sideWall2.position.x = 1.5;
    group.add(sideWall2);

    // Desk
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.7
    });
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 1),
      deskMaterial
    );
    desk.position.set(0, -0.5, -0.3);
    group.add(desk);

    // Monitor
    const monitorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: COLORS.PRIMARY_BLUE,
      emissiveIntensity: 0.2
    });
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.05),
      monitorMaterial
    );
    monitor.position.set(0, -0.1, -0.7);
    group.add(monitor);

    // Chair
    const chair = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.6, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2a })
    );
    chair.position.set(0, -0.5, 0.5);
    group.add(chair);

    group.position.set(position.x, position.y, position.z);

    // Slight rotation for visual interest
    group.rotation.y = Math.random() * 0.5 - 0.25;

    this.scene.add(group);

    // Floating animation
    this.animatedObjects.push({
      object: group,
      type: 'float',
      baseY: position.y,
      speed: 0.5 + Math.random() * 0.3,
      amplitude: 0.3
    });
  }

  createOfficePlant(position) {
    const group = new THREE.Group();

    // Pot
    const potGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8);
    const potMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9
    });
    const pot = new THREE.Mesh(potGeometry, potMaterial);
    group.add(pot);

    // Plant (simple cone)
    const plantGeometry = new THREE.ConeGeometry(0.4, 0.8, 6);
    const plantMaterial = new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.8
    });
    const plant = new THREE.Mesh(plantGeometry, plantMaterial);
    plant.position.y = 0.6;
    group.add(plant);

    group.position.set(position.x, position.y + 0.2, position.z);
    this.scene.add(group);
  }

  createCeilingLight(position) {
    const group = new THREE.Group();

    // Light fixture
    const fixtureGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    group.add(fixture);

    // Actual light
    const light = new THREE.PointLight(0xffffff, 0.5, 15);
    light.position.y = -0.2;
    group.add(light);

    group.position.set(position.x, position.y, position.z);
    this.scene.add(group);
  }

  createGoal() {
    const group = new THREE.Group();

    // Golden briefcase
    const briefcaseGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.3);
    const briefcaseMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GOLD,
      roughness: 0.2,
      metalness: 0.9,
      emissive: COLORS.GOLD,
      emissiveIntensity: 0.3
    });
    const briefcase = new THREE.Mesh(briefcaseGeometry, briefcaseMaterial);
    briefcase.position.y = 0.4;
    briefcase.castShadow = true;
    group.add(briefcase);

    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GOLD_DARK,
      roughness: 0.3,
      metalness: 0.8
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0.9, 0);
    group.add(handle);

    // Glow effect (ring on floor)
    const glowGeometry = new THREE.RingGeometry(1, 1.5, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.GOLD,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.01;
    group.add(glow);

    // Particle effect (simple rotating cubes)
    for (let i = 0; i < 8; i++) {
      const particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.GOLD,
        transparent: true,
        opacity: 0.7
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.y = 1 + Math.random() * 2;
      particle.userData.angle = (i / 8) * Math.PI * 2;
      particle.userData.radius = 0.8 + Math.random() * 0.4;
      particle.userData.speed = 1 + Math.random() * 0.5;
      group.add(particle);
    }

    // Position
    this.goalPosition = new THREE.Vector3(0, 8.5, -45);
    group.position.copy(this.goalPosition);

    this.scene.add(group);

    // Animation
    this.animatedObjects.push({
      object: group,
      type: 'goal',
      baseY: this.goalPosition.y
    });

    this.goalGroup = group;
  }

  update(dt) {
    const time = performance.now() * 0.001;

    // Update animated objects
    this.animatedObjects.forEach(item => {
      switch (item.type) {
        case 'spin':
          item.object.rotation.y += item.speed * dt;
          break;

        case 'float':
          item.object.position.y = item.baseY +
            Math.sin(time * item.speed) * item.amplitude;
          break;

        case 'goal':
          // Rotate briefcase
          item.object.children[0].rotation.y += dt * 0.5;

          // Animate particles
          item.object.children.forEach((child, index) => {
            if (index > 2) { // Skip briefcase, handle, and glow
              child.userData.angle += dt * child.userData.speed;
              child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
              child.position.z = Math.sin(child.userData.angle) * child.userData.radius;
              child.position.y = 1 + Math.sin(time * 2 + index) * 0.5;
            }
          });

          // Pulse glow
          const glow = item.object.children[2];
          glow.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
          break;
      }
    });

    // Update hazard animations (meeting trap collision box)
    this.hazards.forEach(hazard => {
      if (hazard.object) {
        hazard.position.copy(hazard.object.position);
      }
    });
  }

  getGoalPosition() {
    return this.goalPosition;
  }

  getHazards() {
    return this.hazards;
  }

  checkHazardCollision(position, radius = 0.5) {
    for (const hazard of this.hazards) {
      const distance = position.distanceTo(hazard.position);
      if (distance < hazard.radius + radius) {
        return hazard;
      }
    }
    return null;
  }
}
