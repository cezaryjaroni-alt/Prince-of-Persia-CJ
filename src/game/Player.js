/**
 * Player Character - Poszukiwacz Pracy
 * Prince of Persia style movement and animations
 */

import { CONFIG, COLORS } from './Game.js';

// Player States
const STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  JUMPING: 'jumping',
  FALLING: 'falling',
  CLIMBING: 'climbing',
  HANGING: 'hanging',
  CROUCHING: 'crouching',
  ATTACKING: 'attacking',
  HURT: 'hurt',
  DYING: 'dying'
};

export class Player {
  constructor(game) {
    this.game = game;

    // Position and dimensions
    this.x = 100;
    this.y = 300;
    this.width = 24;
    this.height = 48;

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.speed = 3;
    this.jumpForce = -10;
    this.climbSpeed = 2;

    // State
    this.state = STATE.IDLE;
    this.facing = 1; // 1 = right, -1 = left
    this.onGround = false;
    this.canJump = true;
    this.isClimbing = false;
    this.nearLedge = false;
    this.nearLadder = false;

    // Combat
    this.attacking = false;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.attackBox = { x: 0, y: 0, width: 30, height: 40 };

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 8; // frames per animation frame

    // Damage
    this.damageFlash = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;

    // Sprite colors (pixel art style)
    this.colors = {
      skin: '#FFD4A3',
      hair: '#4A3728',
      shirt: '#FFFFFF',
      tie: COLORS.GREEN,
      pants: '#2D2D44',
      shoes: '#1A1A2E',
      briefcase: '#8B4513'
    };
  }

  reset() {
    const spawn = this.game.levelManager.getSpawnPoint();
    this.x = spawn.x;
    this.y = spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.state = STATE.IDLE;
    this.facing = 1;
    this.onGround = false;
    this.isClimbing = false;
    this.damageFlash = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.attacking = false;
  }

  update(dt, input) {
    // Update timers
    if (this.damageFlash > 0) this.damageFlash -= 0.05;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }
    if (this.attackCooldown > 0) this.attackCooldown--;

    // Handle state-specific updates
    switch (this.state) {
      case STATE.CLIMBING:
        this.updateClimbing(input);
        break;
      case STATE.HANGING:
        this.updateHanging(input);
        break;
      case STATE.ATTACKING:
        this.updateAttacking();
        break;
      default:
        this.updateNormal(input);
    }

    // Update animation
    this.updateAnimation();
  }

  updateNormal(input) {
    // Horizontal movement
    if (input.left) {
      this.vx = -this.speed;
      this.facing = -1;
    } else if (input.right) {
      this.vx = this.speed;
      this.facing = 1;
    } else {
      this.vx *= 0.8; // Friction
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Crouching
    if (input.crouch && this.onGround && !input.left && !input.right) {
      this.state = STATE.CROUCHING;
      this.vx = 0;
    } else if (this.state === STATE.CROUCHING && !input.crouch) {
      this.state = STATE.IDLE;
    }

    // Jumping
    if (input.jump && this.onGround && this.canJump) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.canJump = false;
      this.state = STATE.JUMPING;
      this.game.soundManager.play('jump');
    }

    if (!input.jump) {
      this.canJump = true;
    }

    // Check for climbing
    if (input.up && this.nearLadder) {
      this.state = STATE.CLIMBING;
      this.isClimbing = true;
      this.vx = 0;
      this.vy = 0;
      return;
    }

    // Check for ledge grab
    if (!this.onGround && this.nearLedge && this.vy > 0) {
      this.state = STATE.HANGING;
      this.vy = 0;
      return;
    }

    // Attack
    if (input.attack && this.attackCooldown <= 0 && this.onGround) {
      this.startAttack();
    }

    // Apply gravity
    if (!this.onGround) {
      this.vy += CONFIG.GRAVITY;
      if (this.vy > CONFIG.MAX_FALL_SPEED) {
        this.vy = CONFIG.MAX_FALL_SPEED;
      }
    }

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;

    // Collision detection
    this.handleCollisions();

    // Update state
    this.updateState();
  }

  updateClimbing(input) {
    if (input.up) {
      this.vy = -this.climbSpeed;
    } else if (input.down) {
      this.vy = this.climbSpeed;
    } else {
      this.vy = 0;
    }

    // Jump off ladder
    if (input.jump) {
      this.isClimbing = false;
      this.state = STATE.JUMPING;
      this.vy = this.jumpForce * 0.7;
      return;
    }

    this.y += this.vy;

    // Check if still on ladder
    if (!this.checkLadder()) {
      this.isClimbing = false;
      this.state = STATE.FALLING;
    }
  }

  updateHanging(input) {
    if (input.up) {
      // Climb up
      this.y -= this.height;
      this.state = STATE.IDLE;
      this.onGround = true;
    } else if (input.down || input.jump) {
      // Drop down
      this.state = STATE.FALLING;
      this.vy = 2;
    }
  }

  updateAttacking() {
    this.attackTimer--;
    if (this.attackTimer <= 0) {
      this.attacking = false;
      this.state = STATE.IDLE;
    }
  }

  startAttack() {
    this.state = STATE.ATTACKING;
    this.attacking = true;
    this.attackTimer = 20;
    this.attackCooldown = 30;
    this.vx = 0;

    // Set attack hitbox
    this.attackBox.x = this.facing === 1 ? this.x + this.width : this.x - this.attackBox.width;
    this.attackBox.y = this.y + 10;

    this.game.soundManager.play('attack');
  }

  handleCollisions() {
    const level = this.game.levelManager.currentLevel;
    if (!level) return;

    this.onGround = false;
    this.nearLadder = false;
    this.nearLedge = false;

    // Get tiles around player
    const tileX = Math.floor(this.x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(this.y / CONFIG.TILE_SIZE);

    // Check surrounding tiles
    for (let dy = -1; dy <= 2; dy++) {
      for (let dx = -1; dx <= 2; dx++) {
        const tx = tileX + dx;
        const ty = tileY + dy;

        if (tx < 0 || ty < 0 || tx >= level.width || ty >= level.height) continue;

        const tile = level.getTile(tx, ty);
        if (!tile) continue;

        const tileRect = {
          x: tx * CONFIG.TILE_SIZE,
          y: ty * CONFIG.TILE_SIZE,
          width: CONFIG.TILE_SIZE,
          height: CONFIG.TILE_SIZE
        };

        // Check for ladder
        if (tile.type === 'ladder') {
          if (this.intersects(this.getBounds(), tileRect)) {
            this.nearLadder = true;
          }
        }

        // Check for ledge
        if (tile.type === 'ledge') {
          if (this.checkLedgeGrab(tileRect)) {
            this.nearLedge = true;
          }
        }

        // Check for solid collision
        if (tile.solid) {
          this.resolveTileCollision(tileRect);
        }
      }
    }

    // Keep player in bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > level.width * CONFIG.TILE_SIZE) {
      this.x = level.width * CONFIG.TILE_SIZE - this.width;
    }

    // Fall death
    if (this.y > level.height * CONFIG.TILE_SIZE + 100) {
      this.game.takeDamage(100, 'Spadłeś w przepaść biurokracji!');
    }
  }

  resolveTileCollision(tileRect) {
    const bounds = this.getBounds();

    // Calculate overlap
    const overlapX = Math.min(bounds.x + bounds.width, tileRect.x + tileRect.width) -
                     Math.max(bounds.x, tileRect.x);
    const overlapY = Math.min(bounds.y + bounds.height, tileRect.y + tileRect.height) -
                     Math.max(bounds.y, tileRect.y);

    if (overlapX <= 0 || overlapY <= 0) return;

    // Resolve collision on smallest axis
    if (overlapX < overlapY) {
      // Horizontal collision
      if (this.vx > 0) {
        this.x = tileRect.x - this.width;
      } else if (this.vx < 0) {
        this.x = tileRect.x + tileRect.width;
      }
      this.vx = 0;
    } else {
      // Vertical collision
      if (this.vy > 0) {
        this.y = tileRect.y - this.height;
        this.onGround = true;
        this.vy = 0;
      } else if (this.vy < 0) {
        this.y = tileRect.y + tileRect.height;
        this.vy = 0;
      }
    }
  }

  checkLedgeGrab(tileRect) {
    // Check if player's hands are at ledge height
    const handY = this.y;
    const ledgeTop = tileRect.y;

    return Math.abs(handY - ledgeTop) < 10 &&
           this.x + this.width > tileRect.x &&
           this.x < tileRect.x + tileRect.width;
  }

  checkLadder() {
    const level = this.game.levelManager.currentLevel;
    if (!level) return false;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const tileX = Math.floor(centerX / CONFIG.TILE_SIZE);
    const tileY = Math.floor(centerY / CONFIG.TILE_SIZE);

    const tile = level.getTile(tileX, tileY);
    return tile && tile.type === 'ladder';
  }

  updateState() {
    if (this.state === STATE.ATTACKING) return;
    if (this.state === STATE.CLIMBING) return;
    if (this.state === STATE.HANGING) return;
    if (this.state === STATE.CROUCHING) return;

    if (!this.onGround) {
      this.state = this.vy < 0 ? STATE.JUMPING : STATE.FALLING;
    } else if (Math.abs(this.vx) > 0.5) {
      this.state = STATE.RUNNING;
    } else {
      this.state = STATE.IDLE;
    }
  }

  updateAnimation() {
    this.animTimer++;

    let animSpeedMod = this.animSpeed;
    if (this.state === STATE.RUNNING) animSpeedMod = 6;
    if (this.state === STATE.ATTACKING) animSpeedMod = 4;

    if (this.animTimer >= animSpeedMod) {
      this.animTimer = 0;
      this.animFrame++;

      // Animation frame counts
      const frameCounts = {
        [STATE.IDLE]: 2,
        [STATE.RUNNING]: 6,
        [STATE.JUMPING]: 2,
        [STATE.FALLING]: 2,
        [STATE.CLIMBING]: 4,
        [STATE.HANGING]: 2,
        [STATE.CROUCHING]: 1,
        [STATE.ATTACKING]: 3
      };

      const maxFrames = frameCounts[this.state] || 1;
      if (this.animFrame >= maxFrames) {
        this.animFrame = 0;
      }
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

  getAttackBounds() {
    if (!this.attacking) return null;
    return this.attackBox;
  }

  intersects(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  render(ctx) {
    ctx.save();

    // Flicker when invulnerable
    if (this.invulnerable && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Translate to player position
    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y);

    // Flip if facing left
    if (this.facing === -1) {
      ctx.translate(drawX + this.width, drawY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(drawX, drawY);
    }

    // Draw character based on state
    this.drawCharacter(ctx);

    ctx.restore();
  }

  drawCharacter(ctx) {
    const w = this.width;
    const h = this.height;

    switch (this.state) {
      case STATE.RUNNING:
        this.drawRunning(ctx, w, h);
        break;
      case STATE.JUMPING:
      case STATE.FALLING:
        this.drawJumping(ctx, w, h);
        break;
      case STATE.CLIMBING:
        this.drawClimbing(ctx, w, h);
        break;
      case STATE.HANGING:
        this.drawHanging(ctx, w, h);
        break;
      case STATE.CROUCHING:
        this.drawCrouching(ctx, w, h);
        break;
      case STATE.ATTACKING:
        this.drawAttacking(ctx, w, h);
        break;
      default:
        this.drawIdle(ctx, w, h);
    }
  }

  drawIdle(ctx, w, h) {
    const breathe = Math.sin(this.animFrame * Math.PI) * 1;

    // Legs
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(4, 30, 6, 18);
    ctx.fillRect(14, 30, 6, 18);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(3, 44, 8, 4);
    ctx.fillRect(13, 44, 8, 4);

    // Body/Shirt
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 14 - breathe, 16, 18);

    // Tie
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(11, 16 - breathe, 3, 14);

    // Arms
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(0, 16 - breathe, 5, 12);
    ctx.fillRect(19, 16 - breathe, 5, 12);

    // Hands
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(0, 26 - breathe, 5, 4);
    ctx.fillRect(19, 26 - breathe, 5, 4);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 2, 12, 12);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 0, 12, 4);
    ctx.fillRect(4, 2, 3, 3);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillRect(14, 6, 2, 2);

    // Briefcase (in hand)
    ctx.fillStyle = this.colors.briefcase;
    ctx.fillRect(19, 28 - breathe, 6, 8);
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(21, 30 - breathe, 2, 2);
  }

  drawRunning(ctx, w, h) {
    const frame = this.animFrame;
    const legOffset = [0, 4, 8, 4, 0, -4][frame] || 0;

    // Legs (animated)
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(4, 30 + legOffset, 6, 16 - legOffset);
    ctx.fillRect(14, 30 - legOffset, 6, 16 + legOffset);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(3, 44, 8, 4);
    ctx.fillRect(13, 44, 8, 4);

    // Body leaning forward
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(6, 14, 14, 18);

    // Tie (flying back)
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(10, 16, 3, 10);
    ctx.fillRect(7, 22, 3, 6);

    // Arms (pumping)
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(1, 14 + legOffset, 5, 10);
    ctx.fillRect(18, 14 - legOffset, 5, 10);

    // Hands
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(1, 22 + legOffset, 5, 4);
    ctx.fillRect(18, 22 - legOffset, 5, 4);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(7, 2, 12, 12);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(7, 0, 12, 4);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(11, 6, 2, 2);
    ctx.fillRect(16, 6, 2, 2);
  }

  drawJumping(ctx, w, h) {
    // Legs tucked
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(4, 32, 8, 10);
    ctx.fillRect(12, 32, 8, 10);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(4, 40, 8, 4);
    ctx.fillRect(12, 40, 8, 4);

    // Body
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 14, 16, 18);

    // Tie
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(11, 18, 3, 8);

    // Arms up
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(0, 8, 5, 12);
    ctx.fillRect(19, 8, 5, 12);

    // Hands
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(0, 4, 5, 5);
    ctx.fillRect(19, 4, 5, 5);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 2, 12, 12);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 0, 12, 4);

    // Eyes (looking up)
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 5, 2, 2);
    ctx.fillRect(14, 5, 2, 2);
  }

  drawClimbing(ctx, w, h) {
    const frame = this.animFrame;
    const offset = frame % 2 === 0 ? 2 : -2;

    // Legs
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(4, 30 + offset, 6, 16);
    ctx.fillRect(14, 30 - offset, 6, 16);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(4, 44 + offset, 6, 4);
    ctx.fillRect(14, 44 - offset, 6, 4);

    // Body
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 14, 16, 18);

    // Arms reaching up
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(0, 4 - offset, 5, 14);
    ctx.fillRect(19, 4 + offset, 5, 14);

    // Hands gripping
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(0, 0 - offset, 6, 5);
    ctx.fillRect(18, 0 + offset, 6, 5);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 4, 12, 10);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 2, 12, 4);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 7, 2, 2);
    ctx.fillRect(14, 7, 2, 2);
  }

  drawHanging(ctx, w, h) {
    // Arms stretched up
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(2, 0, 6, 16);
    ctx.fillRect(16, 0, 6, 16);

    // Hands
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(2, -4, 6, 5);
    ctx.fillRect(16, -4, 6, 5);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 6, 12, 10);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 4, 12, 4);

    // Body
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 16, 16, 16);

    // Tie
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(11, 18, 3, 12);

    // Legs dangling
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(6, 32, 6, 14);
    ctx.fillRect(12, 32, 6, 14);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(5, 44, 7, 4);
    ctx.fillRect(12, 44, 7, 4);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 10, 2, 2);
    ctx.fillRect(14, 10, 2, 2);
  }

  drawCrouching(ctx, w, h) {
    // Crouched legs
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(2, 36, 10, 8);
    ctx.fillRect(12, 36, 10, 8);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(0, 42, 10, 6);
    ctx.fillRect(14, 42, 10, 6);

    // Body hunched
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 24, 16, 14);

    // Tie
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(11, 26, 3, 10);

    // Arms
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(0, 26, 5, 8);
    ctx.fillRect(19, 26, 5, 8);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 14, 12, 10);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 12, 12, 4);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(9, 18, 2, 2);
    ctx.fillRect(14, 18, 2, 2);
  }

  drawAttacking(ctx, w, h) {
    const frame = this.animFrame;

    // Legs in stance
    ctx.fillStyle = this.colors.pants;
    ctx.fillRect(2, 30, 8, 18);
    ctx.fillRect(14, 32, 8, 16);

    // Shoes
    ctx.fillStyle = this.colors.shoes;
    ctx.fillRect(0, 46, 10, 4);
    ctx.fillRect(14, 46, 10, 4);

    // Body
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(4, 14, 16, 18);

    // Tie
    ctx.fillStyle = this.colors.tie;
    ctx.fillRect(11, 16, 3, 14);

    // Back arm
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(0, 16, 5, 12);

    // Attack arm with briefcase
    const armAngle = [0, -8, -4][frame] || 0;
    ctx.fillStyle = this.colors.shirt;
    ctx.fillRect(18, 12 + armAngle, 8, 8);

    // Briefcase swinging
    ctx.fillStyle = this.colors.briefcase;
    ctx.fillRect(24, 8 + armAngle, 10, 12);
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(27, 12 + armAngle, 4, 3);

    // Head
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(6, 2, 12, 12);

    // Hair
    ctx.fillStyle = this.colors.hair;
    ctx.fillRect(6, 0, 12, 4);

    // Determined eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(10, 6, 3, 2);
    ctx.fillRect(15, 6, 3, 2);

    // Hands
    ctx.fillStyle = this.colors.skin;
    ctx.fillRect(0, 26, 5, 4);
  }
}
