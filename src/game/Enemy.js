/**
 * Enemy - Wrogowie w świecie korporacji
 * Różne typy przeciwników tematycznych
 */

import { CONFIG, COLORS } from './Game.js';

// Enemy types configuration
const ENEMY_TYPES = {
  recruiter: {
    name: 'Rekruter',
    health: 50,
    damage: 15,
    speed: 1.5,
    color: '#4169E1',
    deathMessage: 'Rekruter odrzucił Twoje CV!'
  },
  manager: {
    name: 'Toksyczny Manager',
    health: 75,
    damage: 20,
    speed: 1.2,
    color: '#8B0000',
    deathMessage: 'Manager zaaplikował micromanagement!'
  },
  burnout: {
    name: 'Wypalenie Zawodowe',
    health: 40,
    damage: 25,
    speed: 0.8,
    color: '#FF4500',
    deathMessage: 'Wypalenie zawodowe Cię pochłonęło!'
  },
  boss: {
    name: 'Zwątpienie w Karierę',
    health: 200,
    damage: 30,
    speed: 1.0,
    color: '#4B0082',
    deathMessage: 'Zwątpienie w karierę Cię pokonało!'
  }
};

export class Enemy {
  constructor(game, type, x, y) {
    this.game = game;
    this.type = type;
    this.config = ENEMY_TYPES[type] || ENEMY_TYPES.recruiter;

    // Position
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 44;

    // State
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.damage = this.config.damage;
    this.speed = this.config.speed;
    this.deathMessage = this.config.deathMessage;

    // Movement
    this.vx = 0;
    this.vy = 0;
    this.direction = 1;
    this.patrolRange = 100;
    this.startX = x;

    // AI State
    this.state = 'patrol';
    this.targetPlayer = false;
    this.detectionRange = 150;
    this.attackRange = 40;
    this.attackCooldown = 0;

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.alive = true;
    this.deathTimer = 0;

    // Boss specific
    if (type === 'boss') {
      this.width = 48;
      this.height = 64;
      this.detectionRange = 300;
      this.attackRange = 60;
      this.phase = 1;
    }
  }

  update(dt, player) {
    if (!this.alive) {
      this.deathTimer++;
      return;
    }

    // Update cooldowns
    if (this.attackCooldown > 0) this.attackCooldown--;

    // AI behavior
    const distToPlayer = this.getDistanceToPlayer(player);

    if (distToPlayer < this.detectionRange) {
      this.state = 'chase';
      this.targetPlayer = true;
    } else {
      this.state = 'patrol';
      this.targetPlayer = false;
    }

    switch (this.state) {
      case 'patrol':
        this.patrol();
        break;
      case 'chase':
        this.chase(player);
        break;
    }

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;

    // Basic collision with ground
    this.handleCollisions();

    // Update animation
    this.updateAnimation();

    // Boss phase changes
    if (this.type === 'boss') {
      this.updateBoss();
    }
  }

  getDistanceToPlayer(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  patrol() {
    this.vx = this.speed * this.direction;

    // Change direction at patrol bounds
    if (this.x > this.startX + this.patrolRange) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolRange) {
      this.direction = 1;
    }
  }

  chase(player) {
    const dx = player.x - this.x;

    // Move towards player
    if (Math.abs(dx) > this.attackRange) {
      this.vx = Math.sign(dx) * this.speed * 1.5;
      this.direction = Math.sign(dx);
    } else {
      this.vx = 0;
      // Attack!
      if (this.attackCooldown <= 0) {
        this.attack();
      }
    }
  }

  attack() {
    this.attackCooldown = 60; // 1 second cooldown
    this.game.soundManager.play('enemyAttack');
  }

  updateBoss() {
    // Boss phase changes based on health
    const healthPercent = this.health / this.maxHealth;

    if (healthPercent < 0.3 && this.phase < 3) {
      this.phase = 3;
      this.speed = 2.0;
      this.damage = 40;
    } else if (healthPercent < 0.6 && this.phase < 2) {
      this.phase = 2;
      this.speed = 1.5;
      this.damage = 35;
    }
  }

  handleCollisions() {
    const level = this.game.levelManager.currentLevel;
    if (!level) return;

    // Simple ground check
    const tileY = Math.floor((this.y + this.height) / CONFIG.TILE_SIZE);
    const tileX = Math.floor((this.x + this.width / 2) / CONFIG.TILE_SIZE);

    const tile = this.game.levelManager.getTile(tileX, tileY);
    if (!tile || !tile.solid) {
      this.vy += CONFIG.GRAVITY * 0.5;
      if (this.vy > CONFIG.MAX_FALL_SPEED) this.vy = CONFIG.MAX_FALL_SPEED;
    } else {
      this.y = tileY * CONFIG.TILE_SIZE - this.height;
      this.vy = 0;
    }

    // Wall collision
    const wallTileLeft = this.game.levelManager.getTile(Math.floor(this.x / CONFIG.TILE_SIZE), Math.floor((this.y + this.height / 2) / CONFIG.TILE_SIZE));
    const wallTileRight = this.game.levelManager.getTile(Math.floor((this.x + this.width) / CONFIG.TILE_SIZE), Math.floor((this.y + this.height / 2) / CONFIG.TILE_SIZE));

    if (wallTileLeft && wallTileLeft.solid) {
      this.direction = 1;
      this.x = Math.floor(this.x / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE;
    }
    if (wallTileRight && wallTileRight.solid) {
      this.direction = -1;
      this.x = Math.floor((this.x + this.width) / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE - this.width;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.game.soundManager.play('enemyHurt');

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.alive = false;
    this.game.soundManager.play('enemyDeath');

    // Drop skill on death
    if (Math.random() < 0.5) {
      this.game.collectItem('skill');
    }
  }

  updateAnimation() {
    this.animTimer++;
    if (this.animTimer >= 8) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  render(ctx) {
    if (!this.alive && this.deathTimer > 30) return;

    ctx.save();

    // Death fade
    if (!this.alive) {
      ctx.globalAlpha = 1 - (this.deathTimer / 30);
    }

    // Damage flash
    const isHurt = this.health < this.maxHealth && this.animFrame % 2 === 0;

    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y);

    // Flip based on direction
    if (this.direction === -1) {
      ctx.translate(drawX + this.width, drawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(drawX, drawY);
    }

    // Draw based on type
    switch (this.type) {
      case 'recruiter':
        this.drawRecruiter(ctx, isHurt);
        break;
      case 'manager':
        this.drawManager(ctx, isHurt);
        break;
      case 'burnout':
        this.drawBurnout(ctx, isHurt);
        break;
      case 'boss':
        this.drawBoss(ctx, isHurt);
        break;
    }

    ctx.restore();

    // Health bar for boss
    if (this.type === 'boss' && this.alive) {
      this.renderBossHealthBar(ctx);
    }
  }

  drawRecruiter(ctx, isHurt) {
    const color = isHurt ? '#FFF' : this.config.color;

    // Body (suit)
    ctx.fillStyle = color;
    ctx.fillRect(4, 14, 20, 20);

    // Head
    ctx.fillStyle = '#FFD4A3';
    ctx.fillRect(8, 2, 12, 12);

    // Hair (slicked back)
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(8, 0, 12, 4);

    // Glasses
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 6, 4, 3);
    ctx.fillRect(15, 6, 4, 3);
    ctx.fillRect(13, 7, 2, 1);

    // Tie
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(12, 14, 4, 12);

    // Legs
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(6, 34, 6, 10);
    ctx.fillRect(16, 34, 6, 10);

    // Clipboard
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(22, 20, 6, 10);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(23, 21, 4, 8);
  }

  drawManager(ctx, isHurt) {
    const color = isHurt ? '#FFF' : this.config.color;

    // Body (power suit)
    ctx.fillStyle = color;
    ctx.fillRect(2, 14, 24, 22);

    // Shoulder pads
    ctx.fillRect(0, 14, 4, 8);
    ctx.fillRect(24, 14, 4, 8);

    // Head
    ctx.fillStyle = '#FFD4A3';
    ctx.fillRect(7, 2, 14, 12);

    // Angry eyebrows
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 4, 4, 2);
    ctx.fillRect(15, 4, 4, 2);

    // Angry eyes
    ctx.fillRect(10, 7, 3, 3);
    ctx.fillRect(16, 7, 3, 3);

    // Frown
    ctx.fillRect(11, 11, 6, 1);

    // Pointing finger
    ctx.fillStyle = '#FFD4A3';
    ctx.fillRect(24, 22, 8, 4);

    // Legs
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(6, 36, 7, 8);
    ctx.fillRect(15, 36, 7, 8);
  }

  drawBurnout(ctx, isHurt) {
    // Smoky, ghost-like appearance
    const pulse = Math.sin(this.animFrame * Math.PI / 2) * 0.2 + 0.8;

    ctx.globalAlpha *= pulse;

    // Body (amorphous)
    const gradient = ctx.createRadialGradient(14, 24, 0, 14, 24, 20);
    gradient.addColorStop(0, isHurt ? '#FFF' : '#FF6B35');
    gradient.addColorStop(0.5, isHurt ? '#FFF' : '#FF4500');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(14, 24, 18, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#000';
    // Tired eyes
    ctx.fillRect(8, 18, 4, 2);
    ctx.fillRect(16, 18, 4, 2);

    // Open mouth (yawning/exhausted)
    ctx.beginPath();
    ctx.arc(14, 28, 4, 0, Math.PI);
    ctx.fill();

    // Flames
    for (let i = 0; i < 3; i++) {
      const flameX = 6 + i * 8;
      const flameHeight = 8 + Math.sin(this.animFrame * Math.PI / 2 + i) * 4;
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(flameX, 4 - flameHeight, 4, flameHeight);
    }
  }

  drawBoss(ctx, isHurt) {
    const color = isHurt ? '#FFF' : this.config.color;
    const w = this.width;
    const h = this.height;

    // Dark shadow base
    ctx.fillStyle = color;
    ctx.fillRect(4, 20, w - 8, h - 20);

    // Cloak/robe
    ctx.fillStyle = '#2F0047';
    ctx.fillRect(0, 24, w, h - 24);

    // Glowing eyes
    const eyePulse = Math.sin(performance.now() / 200) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 0, 0, ${eyePulse})`;
    ctx.fillRect(14, 30, 6, 4);
    ctx.fillRect(28, 30, 6, 4);

    // Crown of doubt
    ctx.fillStyle = '#4B0082';
    for (let i = 0; i < 5; i++) {
      const spikeHeight = 10 + Math.sin(this.animFrame * Math.PI / 2 + i) * 3;
      ctx.fillRect(8 + i * 8, 10 - spikeHeight, 4, spikeHeight);
    }

    // Swirling darkness particles
    for (let i = 0; i < 8; i++) {
      const angle = (performance.now() / 500 + i * 45) * Math.PI / 180;
      const dist = 30 + Math.sin(performance.now() / 300 + i) * 10;
      const px = w / 2 + Math.cos(angle) * dist;
      const py = h / 2 + Math.sin(angle) * dist;

      ctx.fillStyle = `rgba(75, 0, 130, ${0.5 + Math.sin(performance.now() / 200 + i) * 0.3})`;
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }

    // Phase indicator
    if (this.phase >= 2) {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(w / 2 - 3, h - 10, 6, 6);
    }
    if (this.phase >= 3) {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(w / 2 - 12, h - 10, 6, 6);
      ctx.fillRect(w / 2 + 6, h - 10, 6, 6);
    }
  }

  renderBossHealthBar(ctx) {
    const barWidth = 200;
    const barHeight = 16;
    const x = this.game.camera.x + CONFIG.GAME_WIDTH / 2 - barWidth / 2;
    const y = this.game.camera.y + CONFIG.GAME_HEIGHT - 40;

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    // Border
    ctx.strokeStyle = '#4B0082';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

    // Health
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    const gradient = ctx.createLinearGradient(x, y, x + healthWidth, y);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(1, '#FF0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, healthWidth, barHeight);

    // Name
    ctx.fillStyle = '#FFF';
    ctx.font = '8px monospace';
    ctx.fillText(this.config.name.toUpperCase(), x, y - 6);
  }
}
