/**
 * Trap - Pułapki korporacyjne
 * Różne typy przeszkód tematycznych
 */

import { CONFIG, COLORS } from './Game.js';

const TRAP_TYPES = {
  meeting: {
    name: 'Niekończące się Spotkanie',
    damage: 15,
    cooldown: 120,
    deathMessage: 'Utknąłeś w niekończącym się spotkaniu!'
  },
  bureaucracy: {
    name: 'Bariera Biurokracji',
    damage: 20,
    cooldown: 90,
    deathMessage: 'Biurokracja Cię przytłoczyła!'
  },
  distraction: {
    name: 'Rozpraszacz',
    damage: 10,
    cooldown: 60,
    deathMessage: 'Rozproszenie zniszczyło Twoją produktywność!'
  },
  elevator: {
    name: 'Zepsuty Winda',
    damage: 25,
    cooldown: 150,
    deathMessage: 'Winda się zepsuła!'
  },
  doubt: {
    name: 'Chmura Zwątpienia',
    damage: 15,
    cooldown: 100,
    deathMessage: 'Zwątpienie Cię sparaliżowało!'
  },
  imposter: {
    name: 'Syndrom Oszusta',
    damage: 30,
    cooldown: 120,
    deathMessage: 'Syndrom oszusta Cię pochłonął!'
  }
};

export class Trap {
  constructor(game, type, x, y) {
    this.game = game;
    this.type = type;
    this.config = TRAP_TYPES[type] || TRAP_TYPES.meeting;

    // Position
    this.x = x;
    this.y = y;
    this.width = CONFIG.TILE_SIZE;
    this.height = CONFIG.TILE_SIZE;

    // State
    this.damage = this.config.damage;
    this.deathMessage = this.config.deathMessage;
    this.active = true;
    this.cooldown = 0;
    this.cooldownMax = this.config.cooldown;

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.triggered = false;
    this.triggerTimer = 0;
  }

  update(dt) {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
      if (this.cooldown <= 0) {
        this.active = true;
        this.triggered = false;
      }
    }

    // Update trigger animation
    if (this.triggered) {
      this.triggerTimer++;
      if (this.triggerTimer > 30) {
        this.triggerTimer = 0;
      }
    }

    // Update animation
    this.animTimer++;
    if (this.animTimer >= 10) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  trigger() {
    if (!this.active) return;

    this.active = false;
    this.triggered = true;
    this.cooldown = this.cooldownMax;
    this.triggerTimer = 0;

    this.game.soundManager.play('trap');
  }

  getBounds() {
    // Slightly smaller hitbox for fairness
    return {
      x: this.x + 4,
      y: this.y + 4,
      width: this.width - 8,
      height: this.height - 8
    };
  }

  render(ctx) {
    ctx.save();

    // Inactive traps are semi-transparent
    if (!this.active) {
      ctx.globalAlpha = 0.4;
    }

    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y);

    switch (this.type) {
      case 'meeting':
        this.drawMeeting(ctx, drawX, drawY);
        break;
      case 'bureaucracy':
        this.drawBureaucracy(ctx, drawX, drawY);
        break;
      case 'distraction':
        this.drawDistraction(ctx, drawX, drawY);
        break;
      case 'elevator':
        this.drawElevator(ctx, drawX, drawY);
        break;
      case 'doubt':
        this.drawDoubt(ctx, drawX, drawY);
        break;
      case 'imposter':
        this.drawImposter(ctx, drawX, drawY);
        break;
    }

    ctx.restore();
  }

  drawMeeting(ctx, x, y) {
    // Conference table
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 4, y + 12, 24, 12);

    // Table legs
    ctx.fillRect(x + 6, y + 24, 4, 8);
    ctx.fillRect(x + 22, y + 24, 4, 8);

    // Chairs (spinning)
    const spin = this.animFrame * 2;
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x + 2 + spin, y + 8, 6, 6);
    ctx.fillRect(x + 24 - spin, y + 8, 6, 6);

    // Clock (spinning fast - never ends!)
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 16, y + 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Clock hands
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const angle = (performance.now() / 100) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + 16 + Math.cos(angle) * 3, y + 4 + Math.sin(angle) * 3);
    ctx.stroke();

    // Warning indicator when active
    if (this.active) {
      const pulse = Math.sin(performance.now() / 200) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse * 0.3})`;
      ctx.fillRect(x, y, this.width, this.height);
    }
  }

  drawBureaucracy(ctx, x, y) {
    // Stack of papers
    for (let i = 0; i < 4; i++) {
      const offset = i * 4;
      const wobble = Math.sin(this.animFrame * Math.PI / 2 + i) * 2;

      ctx.fillStyle = i % 2 === 0 ? '#F5F5F5' : '#DCDCDC';
      ctx.fillRect(x + 6 + wobble, y + 20 - offset, 20, 8);

      // Lines on paper
      ctx.fillStyle = '#666';
      ctx.fillRect(x + 8 + wobble, y + 22 - offset, 16, 1);
      ctx.fillRect(x + 8 + wobble, y + 25 - offset, 12, 1);
    }

    // Stamp
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x + 10, y + 2, 12, 8);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 12, y + 4, 8, 4);

    // "REJECTED" stamp effect when triggered
    if (this.triggered && this.triggerTimer < 20) {
      ctx.fillStyle = '#FF0000';
      ctx.font = '6px monospace';
      ctx.fillText('ODRZUCONE', x + 2, y + 18);
    }

    // Warning
    if (this.active) {
      const pulse = Math.sin(performance.now() / 200) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(139, 0, 0, ${pulse * 0.3})`;
      ctx.fillRect(x, y, this.width, this.height);
    }
  }

  drawDistraction(ctx, x, y) {
    // Phone
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 10, y + 8, 12, 20);

    // Screen with notification
    const blink = this.animFrame % 2 === 0;
    ctx.fillStyle = blink ? '#00FF00' : '#0066FF';
    ctx.fillRect(x + 11, y + 9, 10, 16);

    // Notification bubbles
    if (this.active) {
      for (let i = 0; i < 3; i++) {
        const bubbleY = y + 4 - i * 6 - (this.animFrame * 2);
        if (bubbleY > y - 10) {
          ctx.fillStyle = '#FF4757';
          ctx.beginPath();
          ctx.arc(x + 20 + i * 3, bubbleY, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFF';
          ctx.fillText('!', x + 19 + i * 3, bubbleY + 2);
        }
      }
    }

    // Social media icons floating
    const icons = ['♥', '👍', '📱'];
    icons.forEach((icon, i) => {
      const floatY = y + Math.sin(performance.now() / 300 + i * 2) * 5;
      ctx.font = '8px sans-serif';
      ctx.fillText(icon, x + 4 + i * 10, floatY + 6);
    });
  }

  drawElevator(ctx, x, y) {
    // Elevator doors
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 2, y, 28, 32);

    // Door gap (opening/closing)
    const gap = this.active ? 0 : 6 + Math.sin(this.animFrame * Math.PI / 2) * 6;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x + 14 - gap, y + 2, gap * 2, 28);

    // Door frames
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(x + 2, y, 2, 32);
    ctx.fillRect(x + 28, y, 2, 32);
    ctx.fillRect(x + 2, y, 28, 2);

    // Floor indicator
    ctx.fillStyle = '#FF0000';
    const floor = Math.floor(performance.now() / 500) % 10;
    ctx.font = '8px monospace';
    ctx.fillText(floor.toString(), x + 13, y + 10);

    // "OUT OF ORDER" sign when triggered
    if (this.triggered) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 4, y + 12, 24, 10);
      ctx.fillStyle = '#000';
      ctx.font = '4px monospace';
      ctx.fillText('AWARIA', x + 6, y + 19);
    }

    // Warning
    if (this.active) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
      ctx.fillRect(x, y, this.width, this.height);
    }
  }

  drawDoubt(ctx, x, y) {
    // Dark cloud
    const pulse = Math.sin(performance.now() / 300) * 0.2 + 0.8;

    ctx.globalAlpha *= pulse;

    // Cloud shape
    const gradient = ctx.createRadialGradient(x + 16, y + 16, 0, x + 16, y + 16, 16);
    gradient.addColorStop(0, 'rgba(75, 0, 130, 0.8)');
    gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.4)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + 16, y + 16, 14, 0, Math.PI * 2);
    ctx.fill();

    // Question marks floating
    ctx.fillStyle = '#DDA0DD';
    ctx.font = '10px serif';
    const qOffset = Math.sin(performance.now() / 400) * 4;
    ctx.fillText('?', x + 12, y + 14 + qOffset);
    ctx.fillText('?', x + 18, y + 20 - qOffset);

    // Swirling particles
    for (let i = 0; i < 4; i++) {
      const angle = (performance.now() / 400 + i * 90) * Math.PI / 180;
      const dist = 10 + Math.sin(performance.now() / 200 + i) * 3;
      const px = x + 16 + Math.cos(angle) * dist;
      const py = y + 16 + Math.sin(angle) * dist;

      ctx.fillStyle = 'rgba(138, 43, 226, 0.6)';
      ctx.fillRect(px - 1, py - 1, 2, 2);
    }
  }

  drawImposter(ctx, x, y) {
    // Mirror frame
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 2, y + 2, 28, 28);

    // Mirror surface
    ctx.fillStyle = '#ADD8E6';
    ctx.fillRect(x + 4, y + 4, 24, 24);

    // Distorted reflection
    const wobble = Math.sin(performance.now() / 200) * 2;

    // Face in mirror (distorted)
    ctx.fillStyle = '#FFD4A3';
    ctx.fillRect(x + 10 + wobble, y + 8, 12, 12);

    // Eyes (shifty)
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 12 + wobble, y + 12, 3, 3);
    ctx.fillRect(x + 18 + wobble, y + 12, 3, 3);

    // Frown
    ctx.fillRect(x + 13 + wobble, y + 17, 6, 1);

    // "FRAUD" text appearing
    if (this.active && this.animFrame % 4 < 2) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.font = '6px monospace';
      ctx.fillText('OSZUST', x + 6, y + 30);
    }

    // Cracks in mirror
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 4);
    ctx.lineTo(x + 20, y + 16);
    ctx.lineTo(x + 28, y + 28);
    ctx.stroke();

    // Warning glow
    if (this.active) {
      const pulse = Math.sin(performance.now() / 200) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(138, 43, 226, ${pulse * 0.3})`;
      ctx.fillRect(x, y, this.width, this.height);
    }
  }
}
