/**
 * Physics System using Cannon.js
 * Handles collision detection and physics simulation
 */

import * as CANNON from 'cannon-es';

export class Physics {
  constructor() {
    // Create physics world
    this.world = new CANNON.World();
    this.world.gravity.set(0, -20, 0); // Slightly stronger gravity for snappier feel
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.solver.iterations = 10;

    // Contact material for wall running
    this.defaultMaterial = new CANNON.Material('default');
    this.wallMaterial = new CANNON.Material('wall');
    this.playerMaterial = new CANNON.Material('player');

    // Player-wall contact (for wall running)
    const playerWallContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.wallMaterial,
      {
        friction: 0.8,
        restitution: 0.0
      }
    );
    this.world.addContactMaterial(playerWallContact);

    // Default contact
    const defaultContact = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.4,
        restitution: 0.1
      }
    );
    this.world.addContactMaterial(defaultContact);

    // Player-default contact
    const playerDefaultContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.defaultMaterial,
      {
        friction: 0.4,
        restitution: 0.0
      }
    );
    this.world.addContactMaterial(playerDefaultContact);

    // Body tracking
    this.bodies = [];
    this.wallBodies = [];
  }

  update(dt) {
    this.world.step(1 / 60, dt, 3);
  }

  createPlayerBody(position) {
    // Capsule-like shape for player (cylinder + spheres)
    const radius = 0.4;
    const height = 1.6;

    const playerBody = new CANNON.Body({
      mass: 70,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: this.playerMaterial,
      fixedRotation: true, // Prevent tumbling
      linearDamping: 0.1,
      angularDamping: 1.0
    });

    // Main cylinder
    const cylinderShape = new CANNON.Cylinder(radius, radius, height - radius * 2, 8);
    playerBody.addShape(cylinderShape);

    // Bottom sphere
    const bottomSphere = new CANNON.Sphere(radius);
    playerBody.addShape(bottomSphere, new CANNON.Vec3(0, -(height / 2 - radius), 0));

    // Top sphere
    const topSphere = new CANNON.Sphere(radius);
    playerBody.addShape(topSphere, new CANNON.Vec3(0, height / 2 - radius, 0));

    this.world.addBody(playerBody);
    this.bodies.push(playerBody);

    return playerBody;
  }

  createGround(size, position) {
    const groundShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const groundBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: this.defaultMaterial
    });
    groundBody.addShape(groundShape);
    this.world.addBody(groundBody);
    this.bodies.push(groundBody);
    return groundBody;
  }

  createWall(size, position, rotation = { x: 0, y: 0, z: 0 }) {
    const wallShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const wallBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: this.wallMaterial
    });

    // Apply rotation
    const euler = new CANNON.Vec3(rotation.x, rotation.y, rotation.z);
    wallBody.quaternion.setFromEuler(euler.x, euler.y, euler.z);

    wallBody.addShape(wallShape);

    // Store wall normal for wall running detection
    wallBody.wallNormal = this.calculateWallNormal(rotation);
    wallBody.isWall = true;

    this.world.addBody(wallBody);
    this.wallBodies.push(wallBody);
    this.bodies.push(wallBody);

    return wallBody;
  }

  calculateWallNormal(rotation) {
    // Calculate the normal vector based on wall rotation
    const normal = new CANNON.Vec3(0, 0, 1);
    const quat = new CANNON.Quaternion();
    quat.setFromEuler(rotation.x, rotation.y, rotation.z);
    quat.vmult(normal, normal);
    return normal;
  }

  createPlatform(size, position) {
    const platformShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const platformBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      material: this.defaultMaterial
    });
    platformBody.addShape(platformShape);
    this.world.addBody(platformBody);
    this.bodies.push(platformBody);
    return platformBody;
  }

  raycast(from, to) {
    const result = new CANNON.RaycastResult();
    const ray = new CANNON.Ray(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(to.x, to.y, to.z)
    );

    ray.intersectWorld(this.world, {
      mode: CANNON.Ray.CLOSEST,
      result: result,
      skipBackfaces: true
    });

    return result;
  }

  checkWallContact(playerBody) {
    // Check for nearby walls for wall running
    const playerPos = playerBody.position;
    const checkDistance = 1.0;

    const directions = [
      new CANNON.Vec3(1, 0, 0),   // Right
      new CANNON.Vec3(-1, 0, 0),  // Left
      new CANNON.Vec3(0, 0, 1),   // Forward
      new CANNON.Vec3(0, 0, -1)   // Back
    ];

    for (const dir of directions) {
      const from = new CANNON.Vec3(playerPos.x, playerPos.y, playerPos.z);
      const to = new CANNON.Vec3(
        playerPos.x + dir.x * checkDistance,
        playerPos.y + dir.y * checkDistance,
        playerPos.z + dir.z * checkDistance
      );

      const result = this.raycast(from, to);

      if (result.hasHit && result.body && result.body.isWall) {
        return {
          wall: result.body,
          normal: result.hitNormalWorld,
          distance: result.distance,
          point: result.hitPointWorld
        };
      }
    }

    return null;
  }

  isGrounded(playerBody) {
    const playerPos = playerBody.position;
    const from = { x: playerPos.x, y: playerPos.y, z: playerPos.z };
    const to = { x: playerPos.x, y: playerPos.y - 1.1, z: playerPos.z };

    const result = this.raycast(from, to);
    return result.hasHit && result.distance < 1.1;
  }
}
