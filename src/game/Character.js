/**
 * Character Controller
 * Handles player movement, wall-running, and ledge-grabbing
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { COLORS } from './Game.js';

// Character states
const STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  JUMPING: 'jumping',
  FALLING: 'falling',
  WALL_RUNNING: 'wall_running',
  LEDGE_GRAB: 'ledge_grab'
};

export class Character {
  constructor(scene, physics, camera) {
    this.scene = scene;
    this.physics = physics;
    this.camera = camera;

    // Character properties
    this.speed = 8;
    this.sprintMultiplier = 1.6;
    this.jumpForce = 12;
    this.wallRunSpeed = 10;
    this.wallRunGravity = 5;
    this.wallJumpForce = { up: 10, away: 8 };

    // State
    this.state = STATE.IDLE;
    this.isGrounded = false;
    this.canJump = true;
    this.wallRunTime = 0;
    this.maxWallRunTime = 1.5;
    this.wallRunCooldown = 0;
    this.currentWall = null;

    // Camera control
    this.yaw = 0;
    this.pitch = 0;
    this.cameraDistance = 5;
    this.cameraHeight = 2;
    this.mouseSensitivity = 0.002;

    // Create visual mesh and physics body
    this.createMesh();
    this.createPhysicsBody();

    // Animation state
    this.animationTime = 0;
  }

  createMesh() {
    // Create a low-poly "Corporate Hero" character
    const group = new THREE.Group();

    // Body (suit jacket)
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    group.add(body);

    // Tie (Pracuj blue!)
    const tieGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.05);
    const tieMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.PRIMARY_BLUE,
      roughness: 0.5,
      metalness: 0.3,
      emissive: COLORS.PRIMARY_BLUE,
      emissiveIntensity: 0.2
    });
    const tie = new THREE.Mesh(tieGeometry, tieMaterial);
    tie.position.set(0, 0.4, 0.23);
    group.add(tie);

    // Head
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5d0c5,
      roughness: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.1;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeometry = new THREE.BoxGeometry(0.42, 0.15, 0.42);
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1a0a,
      roughness: 1
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.35;
    group.add(hair);

    // Legs (suit pants)
    const legGeometry = new THREE.BoxGeometry(0.2, 0.7, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9
    });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    this.leftLeg = leftLeg;

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    this.rightLeg = rightLeg;

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial.clone());
    leftArm.position.set(-0.4, 0.3, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    this.leftArm = leftArm;

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial.clone());
    rightArm.position.set(0.4, 0.3, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    this.rightArm = rightArm;

    // Briefcase (in right hand)
    const briefcaseGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.08);
    const briefcaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.6,
      metalness: 0.2
    });
    const briefcase = new THREE.Mesh(briefcaseGeometry, briefcaseMaterial);
    briefcase.position.set(0.45, -0.05, 0);
    group.add(briefcase);

    // Briefcase handle
    const handleGeometry = new THREE.BoxGeometry(0.15, 0.04, 0.02);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GOLD_DARK,
      roughness: 0.3,
      metalness: 0.8
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.45, 0.1, 0);
    group.add(handle);

    // Position group
    group.position.y = 0.7;

    this.mesh = group;
    this.scene.add(this.mesh);
  }

  createPhysicsBody() {
    this.body = this.physics.createPlayerBody({ x: 0, y: 3, z: 0 });
  }

  update(dt, input) {
    this.animationTime += dt;

    // Update grounded state
    this.isGrounded = this.physics.isGrounded(this.body);

    // Handle camera rotation
    this.updateCamera(input, dt);

    // Check wall contact for wall running
    const wallContact = this.physics.checkWallContact(this.body);

    // Update cooldowns
    if (this.wallRunCooldown > 0) {
      this.wallRunCooldown -= dt;
    }

    // State machine
    switch (this.state) {
      case STATE.IDLE:
      case STATE.RUNNING:
        this.handleGroundMovement(dt, input, wallContact);
        break;
      case STATE.JUMPING:
      case STATE.FALLING:
        this.handleAirMovement(dt, input, wallContact);
        break;
      case STATE.WALL_RUNNING:
        this.handleWallRunning(dt, input);
        break;
    }

    // Sync mesh with physics body
    this.syncMeshWithPhysics();

    // Update animations
    this.updateAnimations(dt, input);
  }

  updateCamera(input, dt) {
    // Update yaw and pitch from mouse input
    this.yaw -= input.mouseX * this.mouseSensitivity;
    this.pitch -= input.mouseY * this.mouseSensitivity;

    // Clamp pitch to prevent camera flipping
    this.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.pitch));

    // Calculate camera position (third-person)
    const targetPosition = new THREE.Vector3(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );

    const cameraOffset = new THREE.Vector3(
      Math.sin(this.yaw) * this.cameraDistance,
      this.cameraHeight + Math.sin(this.pitch) * this.cameraDistance * 0.5,
      Math.cos(this.yaw) * this.cameraDistance
    );

    this.camera.position.copy(targetPosition).add(cameraOffset);
    this.camera.lookAt(targetPosition.x, targetPosition.y + 1, targetPosition.z);
  }

  handleGroundMovement(dt, input, wallContact) {
    const velocity = this.body.velocity;
    const speed = input.sprint ? this.speed * this.sprintMultiplier : this.speed;

    // Calculate movement direction based on camera yaw
    const moveDirection = new THREE.Vector3();

    if (input.forward) moveDirection.z -= 1;
    if (input.backward) moveDirection.z += 1;
    if (input.left) moveDirection.x -= 1;
    if (input.right) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();

      // Rotate movement direction by camera yaw
      const rotatedDirection = new THREE.Vector3(
        moveDirection.x * Math.cos(this.yaw) + moveDirection.z * Math.sin(this.yaw),
        0,
        moveDirection.z * Math.cos(this.yaw) - moveDirection.x * Math.sin(this.yaw)
      );

      velocity.x = rotatedDirection.x * speed;
      velocity.z = rotatedDirection.z * speed;

      // Rotate character mesh to face movement direction
      const angle = Math.atan2(rotatedDirection.x, rotatedDirection.z);
      this.mesh.rotation.y = angle;

      this.state = STATE.RUNNING;
    } else {
      // Decelerate when no input
      velocity.x *= 0.9;
      velocity.z *= 0.9;
      this.state = STATE.IDLE;
    }

    // Jump
    if (input.jump && this.isGrounded && this.canJump) {
      velocity.y = this.jumpForce;
      this.state = STATE.JUMPING;
      this.canJump = false;
    }

    // Reset jump ability when grounded and not pressing jump
    if (this.isGrounded && !input.jump) {
      this.canJump = true;
    }

    // Check for falling
    if (!this.isGrounded && velocity.y < -1) {
      this.state = STATE.FALLING;
    }
  }

  handleAirMovement(dt, input, wallContact) {
    const velocity = this.body.velocity;

    // Air control (reduced)
    const airControl = 0.3;
    const moveDirection = new THREE.Vector3();

    if (input.forward) moveDirection.z -= 1;
    if (input.backward) moveDirection.z += 1;
    if (input.left) moveDirection.x -= 1;
    if (input.right) moveDirection.x += 1;

    if (moveDirection.length() > 0) {
      moveDirection.normalize();

      const rotatedDirection = new THREE.Vector3(
        moveDirection.x * Math.cos(this.yaw) + moveDirection.z * Math.sin(this.yaw),
        0,
        moveDirection.z * Math.cos(this.yaw) - moveDirection.x * Math.sin(this.yaw)
      );

      velocity.x += rotatedDirection.x * airControl;
      velocity.z += rotatedDirection.z * airControl;

      // Clamp air speed
      const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
      if (horizontalSpeed > this.speed) {
        velocity.x = (velocity.x / horizontalSpeed) * this.speed;
        velocity.z = (velocity.z / horizontalSpeed) * this.speed;
      }
    }

    // Check for wall run initiation
    if (wallContact && this.wallRunCooldown <= 0 && !this.isGrounded) {
      const horizontalVelocity = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
      if (horizontalVelocity > 4) { // Need momentum to wall run
        this.startWallRun(wallContact);
      }
    }

    // Land detection
    if (this.isGrounded) {
      this.state = velocity.x !== 0 || velocity.z !== 0 ? STATE.RUNNING : STATE.IDLE;
    }
  }

  startWallRun(wallContact) {
    this.state = STATE.WALL_RUNNING;
    this.currentWall = wallContact;
    this.wallRunTime = 0;

    // Reset vertical velocity for smooth wall run start
    this.body.velocity.y = 2;

    console.log('🏃 Wall Running!');
  }

  handleWallRunning(dt, input) {
    this.wallRunTime += dt;

    const velocity = this.body.velocity;
    const wallNormal = this.currentWall.normal;

    // Calculate wall run direction (perpendicular to wall normal)
    const wallRight = new CANNON.Vec3();
    const up = new CANNON.Vec3(0, 1, 0);
    wallNormal.cross(up, wallRight);
    wallRight.normalize();

    // Determine direction based on approach angle
    const approachDot = velocity.x * wallRight.x + velocity.z * wallRight.z;
    const runDirection = approachDot > 0 ? 1 : -1;

    // Apply wall run movement
    velocity.x = wallRight.x * this.wallRunSpeed * runDirection;
    velocity.z = wallRight.z * this.wallRunSpeed * runDirection;

    // Reduced gravity while wall running
    velocity.y -= this.wallRunGravity * dt;

    // Push player slightly towards wall
    velocity.x -= wallNormal.x * 2;
    velocity.z -= wallNormal.z * 2;

    // Rotate character to face wall run direction
    const angle = Math.atan2(wallRight.x * runDirection, wallRight.z * runDirection);
    this.mesh.rotation.y = angle;

    // Tilt character towards wall
    this.mesh.rotation.z = -runDirection * 0.3;

    // Wall jump
    if (input.jump) {
      velocity.x = wallNormal.x * this.wallJumpForce.away;
      velocity.z = wallNormal.z * this.wallJumpForce.away;
      velocity.y = this.wallJumpForce.up;

      this.endWallRun();
      this.state = STATE.JUMPING;
      return;
    }

    // End wall run conditions
    if (this.wallRunTime > this.maxWallRunTime || this.isGrounded) {
      this.endWallRun();
    }

    // Check if still near wall
    const stillOnWall = this.physics.checkWallContact(this.body);
    if (!stillOnWall) {
      this.endWallRun();
    }
  }

  endWallRun() {
    this.state = STATE.FALLING;
    this.currentWall = null;
    this.wallRunCooldown = 0.5; // Cooldown before next wall run
    this.mesh.rotation.z = 0; // Reset tilt
  }

  syncMeshWithPhysics() {
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
  }

  updateAnimations(dt, input) {
    // Simple procedural animation
    const isMoving = input.forward || input.backward || input.left || input.right;
    const animSpeed = input.sprint ? 15 : 10;

    if (this.state === STATE.RUNNING && isMoving) {
      // Leg swing
      const legSwing = Math.sin(this.animationTime * animSpeed) * 0.5;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Arm swing (opposite to legs)
      this.leftArm.rotation.x = -legSwing * 0.8;
      this.rightArm.rotation.x = legSwing * 0.8;
    } else if (this.state === STATE.WALL_RUNNING) {
      // Wall run animation
      const legSwing = Math.sin(this.animationTime * 12) * 0.6;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.leftArm.rotation.x = -legSwing;
      this.rightArm.rotation.x = legSwing;
    } else if (this.state === STATE.JUMPING || this.state === STATE.FALLING) {
      // Tucked position in air
      this.leftLeg.rotation.x = 0.3;
      this.rightLeg.rotation.x = 0.3;
      this.leftArm.rotation.x = -0.5;
      this.rightArm.rotation.x = -0.5;
    } else {
      // Idle - subtle breathing
      const breathe = Math.sin(this.animationTime * 2) * 0.02;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = breathe;
      this.rightArm.rotation.x = breathe;
    }
  }

  getPosition() {
    return new THREE.Vector3(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
  }

  getVelocity() {
    return new THREE.Vector3(
      this.body.velocity.x,
      this.body.velocity.y,
      this.body.velocity.z
    );
  }

  setState(position, velocity) {
    this.body.position.set(position.x, position.y, position.z);
    this.body.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  getState() {
    return this.state;
  }

  takeDamage(amount) {
    // Health is managed by UI through CV completion percentage
    return amount;
  }
}
