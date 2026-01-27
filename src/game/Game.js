/**
 * Main Game Class
 * Orchestrates all game systems
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { Physics } from './Physics.js';
import { Character } from './Character.js';
import { Level } from './Level.js';
import { RewindSystem } from './RewindSystem.js';
import { UI } from './UI.js';
import { PS2Shader } from '../shaders/PS2Shader.js';

// Pracuj.pl Color Palette
export const COLORS = {
  PRIMARY_BLUE: 0x0046AB,
  BLUE_DARK: 0x003380,
  BLUE_LIGHT: 0x1a5cbb,
  GOLD: 0xFFD700,
  GOLD_DARK: 0xB8860B,
  WHITE: 0xFFFFFF,
  GRAY: 0xF5F5F5,
  TEXT: 0x333333
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.isRunning = false;
    this.controlsEnabled = false;
    this.clock = new THREE.Clock();
    this.deltaTime = 0;

    // Initialize Three.js
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initPostProcessing();

    // Initialize game systems
    this.physics = new Physics();
    this.level = new Level(this.scene, this.physics);
    this.character = new Character(this.scene, this.physics, this.camera);
    this.rewindSystem = new RewindSystem(this.character);
    this.ui = new UI();

    // Input handling
    this.keys = {};
    this.mouseMovement = { x: 0, y: 0 };
    this.initInput();

    // Initial render
    this.render();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  initScene() {
    this.scene = new THREE.Scene();

    // Corporate office atmosphere - dark with blue tint
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
  }

  initLights() {
    // Ambient light - blue tinted for corporate atmosphere
    const ambient = new THREE.AmbientLight(0x1a1a3a, 0.4);
    this.scene.add(ambient);

    // Main directional light - simulates office lighting
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    this.scene.add(mainLight);

    // Blue accent lights - Pracuj branding
    const blueLight1 = new THREE.PointLight(COLORS.PRIMARY_BLUE, 2, 30);
    blueLight1.position.set(-10, 10, -10);
    this.scene.add(blueLight1);

    const blueLight2 = new THREE.PointLight(COLORS.BLUE_LIGHT, 1.5, 25);
    blueLight2.position.set(15, 8, 5);
    this.scene.add(blueLight2);

    // Gold accent light for the goal
    const goldLight = new THREE.PointLight(COLORS.GOLD, 2, 20);
    goldLight.position.set(0, 10, -40);
    this.scene.add(goldLight);
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    // Render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // PS2-era bloom effect
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    this.composer.addPass(bloomPass);

    // Custom PS2 shader for retro look
    const ps2Pass = new ShaderPass(PS2Shader);
    ps2Pass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    this.composer.addPass(ps2Pass);
    this.ps2Pass = ps2Pass;
  }

  initInput() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Rewind mechanic
      if (e.code === 'KeyR' && this.isRunning) {
        this.triggerRewind();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse input for camera control
    document.addEventListener('mousemove', (e) => {
      if (this.controlsEnabled) {
        this.mouseMovement.x = e.movementX || 0;
        this.mouseMovement.y = e.movementY || 0;
      }
    });
  }

  triggerRewind() {
    if (this.rewindSystem.canRewind()) {
      this.rewindSystem.startRewind();
      this.ui.useRewindCharge();

      // Activate glitch effect
      const glitchOverlay = document.getElementById('glitch-overlay');
      glitchOverlay.classList.add('active');

      setTimeout(() => {
        glitchOverlay.classList.remove('active');
      }, this.rewindSystem.rewindDuration * 1000);
    }
  }

  start() {
    this.isRunning = true;
    this.clock.start();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  setControlsEnabled(enabled) {
    this.controlsEnabled = enabled;
  }

  gameLoop() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.gameLoop());

    this.deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap delta time

    // Update systems
    this.update(this.deltaTime);
    this.render();
  }

  update(dt) {
    // Update physics
    this.physics.update(dt);

    // Update character
    const input = {
      forward: this.keys['KeyW'] || false,
      backward: this.keys['KeyS'] || false,
      left: this.keys['KeyA'] || false,
      right: this.keys['KeyD'] || false,
      jump: this.keys['Space'] || false,
      sprint: this.keys['ShiftLeft'] || this.keys['ShiftRight'] || false,
      mouseX: this.mouseMovement.x,
      mouseY: this.mouseMovement.y
    };

    // Reset mouse movement after reading
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;

    // Check if rewinding
    if (this.rewindSystem.isRewinding) {
      this.rewindSystem.update(dt);
    } else {
      this.character.update(dt, input);
      this.rewindSystem.recordState();
    }

    // Update level (animated elements, hazards)
    this.level.update(dt);

    // Update UI
    this.ui.update(this.character);

    // Update shader time
    if (this.ps2Pass) {
      this.ps2Pass.uniforms.time.value = this.clock.elapsedTime;
    }

    // Check for goal
    this.checkGoal();
  }

  checkGoal() {
    const goalPos = this.level.getGoalPosition();
    const playerPos = this.character.getPosition();

    if (goalPos && playerPos.distanceTo(goalPos) < 2) {
      this.onGoalReached();
    }
  }

  onGoalReached() {
    console.log('🎉 Congratulations! You found the Grand Offer!');
    // Could trigger victory screen here
  }

  render() {
    this.composer.render();
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    if (this.ps2Pass) {
      this.ps2Pass.uniforms.resolution.value.set(width, height);
    }
  }
}
