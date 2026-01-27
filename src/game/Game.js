/**
 * Pracuj Quest - Main Game Engine
 * 2D Platformer w stylu Prince of Persia (1989)
 */

import { Player } from './Player.js';
import { LevelManager } from './LevelManager.js';
import { UI } from './UI.js';
import { SoundManager } from './SoundManager.js';

// Pracuj.pl Color Palette
export const COLORS = {
  GREEN: '#00A656',
  GREEN_DARK: '#008544',
  GREEN_LIGHT: '#00C969',
  WHITE: '#FFFFFF',
  DARK: '#1A1A2E',
  GOLD: '#FFD700',
  DANGER: '#FF4757',
  GRAY: '#2D2D44',
  BG: '#0F0F23'
};

// Game Configuration
export const CONFIG = {
  TILE_SIZE: 32,
  GRAVITY: 0.6,
  MAX_FALL_SPEED: 12,
  GAME_WIDTH: 800,
  GAME_HEIGHT: 480,
  SCALE: 1
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.gameOver = false;
    this.victory = false;

    // Timing
    this.lastTime = 0;
    this.deltaTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / 60; // 60 FPS physics

    // Game stats
    this.stats = {
      health: 100,
      maxHealth: 100,
      skills: 0,
      coffees: 0,
      cvParts: 0,
      time: 300, // 5 minutes in seconds
      currentLevel: 1
    };

    // Initialize systems
    this.setupCanvas();
    this.player = new Player(this);
    this.levelManager = new LevelManager(this);
    this.ui = new UI(this);
    this.soundManager = new SoundManager();

    // Input state
    this.keys = {};
    this.initInput();

    // Camera
    this.camera = {
      x: 0,
      y: 0
    };
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = CONFIG.GAME_WIDTH;
    this.canvas.height = CONFIG.GAME_HEIGHT;

    // Scale canvas to fit window while maintaining aspect ratio
    this.handleResize();

    // Disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;
  }

  initInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.gameOver = false;
    this.victory = false;
    this.lastTime = performance.now();

    // Load first level
    this.levelManager.loadLevel(1);

    // Start game loop
    this.gameLoop();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  restart() {
    // Reset stats
    this.stats = {
      health: 100,
      maxHealth: 100,
      skills: 0,
      coffees: 0,
      cvParts: 0,
      time: 300,
      currentLevel: 1
    };

    // Reset player
    this.player.reset();

    // Reload level
    this.levelManager.loadLevel(1);

    // Update UI
    this.ui.update();

    // Start
    this.gameOver = false;
    this.victory = false;
    this.isPaused = false;
    this.isRunning = true;
    this.lastTime = performance.now();

    document.getElementById('ui-overlay').classList.add('active');
  }

  nextLevel() {
    this.stats.currentLevel++;

    if (this.stats.currentLevel > this.levelManager.totalLevels) {
      // Game completed!
      this.showFinalVictory();
      return;
    }

    // Load next level
    this.levelManager.loadLevel(this.stats.currentLevel);
    this.player.reset();
    this.victory = false;
    this.isPaused = false;

    document.getElementById('ui-overlay').classList.add('active');
  }

  gameLoop(currentTime = performance.now()) {
    if (!this.isRunning) return;

    requestAnimationFrame((time) => this.gameLoop(time));

    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap delta time
    if (this.deltaTime > 100) this.deltaTime = 100;

    if (!this.isPaused && !this.gameOver && !this.victory) {
      // Fixed timestep for physics
      this.accumulator += this.deltaTime;

      while (this.accumulator >= this.fixedTimeStep) {
        this.update(this.fixedTimeStep / 1000);
        this.accumulator -= this.fixedTimeStep;
      }

      // Update timer
      this.stats.time -= this.deltaTime / 1000;
      if (this.stats.time <= 0) {
        this.stats.time = 0;
        this.onGameOver('Czas na rozmowę minął!');
      }
    }

    // Always render
    this.render();
  }

  update(dt) {
    // Get input
    const input = {
      left: this.keys['ArrowLeft'] || this.keys['KeyA'],
      right: this.keys['ArrowRight'] || this.keys['KeyD'],
      up: this.keys['ArrowUp'] || this.keys['KeyW'],
      down: this.keys['ArrowDown'] || this.keys['KeyS'],
      jump: this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'],
      attack: this.keys['Space'] || this.keys['KeyX'],
      crouch: this.keys['ArrowDown'] || this.keys['KeyS']
    };

    // Update player
    this.player.update(dt, input);

    // Update level (enemies, traps, collectibles)
    this.levelManager.update(dt);

    // Update camera
    this.updateCamera();

    // Update UI
    this.ui.update();

    // Check level completion
    if (this.levelManager.checkGoal(this.player)) {
      this.onLevelComplete();
    }
  }

  updateCamera() {
    const level = this.levelManager.currentLevel;
    if (!level) return;

    // Smooth camera follow
    const targetX = this.player.x - CONFIG.GAME_WIDTH / 2 + this.player.width / 2;
    const targetY = this.player.y - CONFIG.GAME_HEIGHT / 2 + this.player.height / 2;

    // Clamp camera to level bounds
    const maxX = level.width * CONFIG.TILE_SIZE - CONFIG.GAME_WIDTH;
    const maxY = level.height * CONFIG.TILE_SIZE - CONFIG.GAME_HEIGHT;

    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);

    // Save context for camera transformation
    this.ctx.save();
    this.ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // Render level
    this.levelManager.render(this.ctx);

    // Render player
    this.player.render(this.ctx);

    // Restore context
    this.ctx.restore();

    // Render UI elements (on top, not affected by camera)
    this.renderOverlayEffects();
  }

  renderOverlayEffects() {
    // Damage flash
    if (this.player.damageFlash > 0) {
      this.ctx.fillStyle = `rgba(255, 71, 87, ${this.player.damageFlash * 0.3})`;
      this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    }

    // Low health warning
    if (this.stats.health <= 25) {
      const pulse = Math.sin(performance.now() / 200) * 0.1 + 0.1;
      this.ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
      this.ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
    }
  }

  takeDamage(amount, reason = '') {
    if (this.player.invulnerable) return;

    this.stats.health -= amount;
    this.player.damageFlash = 1;
    this.player.invulnerable = true;
    this.player.invulnerableTimer = 60; // 1 second at 60fps

    this.soundManager.play('hurt');

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.onGameOver(reason || 'Twoje CV straciło całą energię!');
    }

    this.ui.update();
  }

  heal(amount) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    this.soundManager.play('heal');
    this.ui.update();
  }

  collectItem(type) {
    switch (type) {
      case 'skill':
        this.stats.skills++;
        this.soundManager.play('collect');
        break;
      case 'coffee':
        this.stats.coffees++;
        this.heal(20);
        break;
      case 'cv':
        this.stats.cvParts++;
        this.stats.skills += 5;
        this.soundManager.play('powerup');
        break;
    }
    this.ui.update();
  }

  onLevelComplete() {
    this.victory = true;
    this.soundManager.play('victory');

    // Show victory screen
    const victoryScreen = document.getElementById('victory-screen');
    document.getElementById('victory-skills').textContent = this.stats.skills;
    document.getElementById('victory-time').textContent = this.formatTime(this.stats.time);
    document.getElementById('victory-level').textContent = this.stats.currentLevel;

    // Update button text based on level
    const nextBtn = document.getElementById('next-level-button');
    if (this.stats.currentLevel >= this.levelManager.totalLevels) {
      nextBtn.textContent = 'UKOŃCZONO GRĘ!';
      nextBtn.disabled = true;
    } else {
      nextBtn.textContent = 'NASTĘPNY POZIOM';
      nextBtn.disabled = false;
    }

    victoryScreen.classList.remove('hidden');
    document.getElementById('ui-overlay').classList.remove('active');
  }

  onGameOver(reason) {
    this.gameOver = true;
    this.soundManager.play('gameover');

    // Show game over screen
    const gameoverScreen = document.getElementById('gameover-screen');
    document.getElementById('gameover-reason').textContent = reason;
    document.getElementById('final-skills').textContent = this.stats.skills;
    document.getElementById('final-coffees').textContent = this.stats.coffees;

    gameoverScreen.classList.remove('hidden');
    document.getElementById('ui-overlay').classList.remove('active');
  }

  showFinalVictory() {
    this.victory = true;

    const victoryScreen = document.getElementById('victory-screen');
    document.querySelector('.victory-message').textContent = 'Ukończyłeś wszystkie poziomy!';
    document.getElementById('next-level-button').style.display = 'none';

    victoryScreen.classList.remove('hidden');
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  handleResize() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / CONFIG.GAME_WIDTH;
    const scaleY = containerHeight / CONFIG.GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.95;

    this.canvas.style.width = `${CONFIG.GAME_WIDTH * scale}px`;
    this.canvas.style.height = `${CONFIG.GAME_HEIGHT * scale}px`;

    CONFIG.SCALE = scale;
  }
}
