/**
 * Collectible - Przedmioty do zbierania
 * Umiejętności, kawa i fragmenty CV
 */

import { CONFIG, COLORS } from './Game.js';

const COLLECTIBLE_TYPES = {
  skill: {
    name: 'Umiejętność',
    points: 1,
    color: COLORS.GOLD
  },
  coffee: {
    name: 'Kawa',
    points: 0,
    heal: 20,
    color: '#8B4513'
  },
  cv: {
    name: 'Fragment CV',
    points: 5,
    color: COLORS.GREEN
  }
};

export class Collectible {
  constructor(game, type, x, y) {
    this.game = game;
    this.type = type;
    this.config = COLLECTIBLE_TYPES[type] || COLLECTIBLE_TYPES.skill;

    // Position
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;

    // State
    this.collected = false;
    this.collectTimer = 0;

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.floatOffset = Math.random() * Math.PI * 2; // Random phase
    this.sparkles = [];

    // Generate sparkles
    this.generateSparkles();
  }

  generateSparkles() {
    for (let i = 0; i < 5; i++) {
      this.sparkles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2,
        speed: 0.5 + Math.random() * 1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt) {
    if (this.collected) {
      this.collectTimer++;
      return;
    }

    // Update animation
    this.animTimer++;
    if (this.animTimer >= 8) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Update sparkles
    this.sparkles.forEach(s => {
      s.y -= s.speed;
      if (s.y < -5) {
        s.y = this.height + 5;
        s.x = Math.random() * this.width;
      }
    });
  }

  collect() {
    if (this.collected) return;

    this.collected = true;
    this.collectTimer = 0;
  }

  getBounds() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4
    };
  }

  render(ctx) {
    if (this.collected && this.collectTimer > 20) return;

    ctx.save();

    // Collect animation
    if (this.collected) {
      ctx.globalAlpha = 1 - (this.collectTimer / 20);
      ctx.translate(0, -this.collectTimer * 2);
    }

    // Float animation
    const floatY = Math.sin(performance.now() / 400 + this.floatOffset) * 3;
    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y + floatY);

    // Glow effect
    const pulse = Math.sin(performance.now() / 300) * 0.3 + 0.7;
    ctx.shadowColor = this.config.color;
    ctx.shadowBlur = 10 * pulse;

    switch (this.type) {
      case 'skill':
        this.drawSkill(ctx, drawX, drawY);
        break;
      case 'coffee':
        this.drawCoffee(ctx, drawX, drawY);
        break;
      case 'cv':
        this.drawCV(ctx, drawX, drawY);
        break;
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw sparkles
    if (!this.collected) {
      this.drawSparkles(ctx, drawX, drawY);
    }

    ctx.restore();
  }

  drawSkill(ctx, x, y) {
    // Star shape (skill badge)
    ctx.fillStyle = COLORS.GOLD;

    // Main star body
    ctx.beginPath();
    const cx = x + 10;
    const cy = y + 10;
    const outerRadius = 8;
    const innerRadius = 4;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI / spikes) - Math.PI / 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Inner detail
    ctx.fillStyle = '#FFE55C';
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius * 0.5 : innerRadius * 0.5;
      const angle = (i * Math.PI / spikes) - Math.PI / 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Center circle
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCoffee(ctx, x, y) {
    // Coffee cup
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 4, y + 4, 12, 14);

    // Cup detail
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(x + 4, y + 4, 12, 2);

    // Coffee liquid
    ctx.fillStyle = '#4A2C2A';
    ctx.fillRect(x + 5, y + 7, 10, 10);

    // Steam
    const steamFrame = this.animFrame;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    // Steam wisps
    for (let i = 0; i < 3; i++) {
      const steamX = x + 6 + i * 4;
      const steamY = y + 2 - (steamFrame + i) % 4;
      const wobble = Math.sin(performance.now() / 200 + i) * 2;

      ctx.beginPath();
      ctx.arc(steamX + wobble, steamY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Handle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 15, y + 7, 3, 2);
    ctx.fillRect(x + 17, y + 7, 2, 6);
    ctx.fillRect(x + 15, y + 11, 3, 2);

    // Heart on cup (Pracuj logo hint)
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillRect(x + 8, y + 10, 2, 2);
    ctx.fillRect(x + 10, y + 10, 2, 2);
    ctx.fillRect(x + 9, y + 12, 2, 2);
  }

  drawCV(ctx, x, y) {
    // Document shape
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 2, y + 2, 16, 18);

    // Folded corner
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 2);
    ctx.lineTo(x + 18, y + 6);
    ctx.lineTo(x + 14, y + 6);
    ctx.closePath();
    ctx.fill();

    // Photo placeholder
    ctx.fillStyle = '#D0D0D0';
    ctx.fillRect(x + 4, y + 4, 5, 6);

    // Text lines
    ctx.fillStyle = '#666';
    ctx.fillRect(x + 10, y + 5, 6, 1);
    ctx.fillRect(x + 10, y + 7, 5, 1);
    ctx.fillRect(x + 10, y + 9, 4, 1);

    // More text lines
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 4, y + 12, 12, 1);
    ctx.fillRect(x + 4, y + 14, 10, 1);
    ctx.fillRect(x + 4, y + 16, 8, 1);

    // Pracuj green accent
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillRect(x + 2, y + 2, 2, 18);

    // Checkmark (approved CV!)
    ctx.fillStyle = COLORS.GREEN;
    ctx.fillRect(x + 13, y + 13, 2, 4);
    ctx.fillRect(x + 11, y + 15, 2, 2);
  }

  drawSparkles(ctx, x, y) {
    this.sparkles.forEach((s, i) => {
      const sparkleX = x + s.x;
      const sparkleY = y + s.y;
      const alpha = Math.sin(performance.now() / 200 + s.phase) * 0.5 + 0.5;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(sparkleX - s.size / 2, sparkleY - s.size / 2, s.size, s.size);
    });
  }
}
