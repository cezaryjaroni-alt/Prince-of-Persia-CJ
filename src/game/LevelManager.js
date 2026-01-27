/**
 * Level Manager - Zarządzanie poziomami
 * Zawiera definicje wszystkich poziomów i logikę renderowania
 */

import { CONFIG, COLORS } from './Game.js';
import { Enemy } from './Enemy.js';
import { Trap } from './Trap.js';
import { Collectible } from './Collectible.js';

// Tile types
const TILES = {
  EMPTY: 0,
  FLOOR: 1,
  WALL: 2,
  PLATFORM: 3,
  LADDER: 4,
  LEDGE: 5,
  SPIKE: 6,
  DOOR: 7,
  GOAL: 8,
  DESK: 9,
  PLANT: 10,
  COMPUTER: 11,
  COFFEE_MACHINE: 12
};

// Level definitions (Polish themed around job search)
const LEVELS = [
  // Level 1: Aplikacja (Tutorial)
  {
    name: 'APLIKACJA',
    hint: 'Zbierz umiejętności i dotrzyj do drzwi rekrutacji!',
    width: 40,
    height: 15,
    spawnX: 2,
    spawnY: 12,
    goalX: 37,
    goalY: 12,
    timeLimit: 180,
    map: [
      '########################################',
      '#......................................#',
      '#......................................#',
      '#....P.......................P........#',
      '#...###...........###.........###.....#',
      '#..........P........................G.#',
      '#.........###.........P........###.##.#',
      '#....................###..............#',
      '#....###.....P.......................##',
      '#..........###...........###.........##',
      '#.....C..........###..........P......##',
      '#...###.......................###....##',
      '#S..........................C........D#',
      '###############.###.##################',
      '########################################'
    ],
    enemies: [
      { type: 'recruiter', x: 15, y: 12 },
      { type: 'recruiter', x: 28, y: 6 }
    ],
    traps: [
      { type: 'meeting', x: 20, y: 13 }
    ],
    collectibles: [
      { type: 'skill', x: 6, y: 3 },
      { type: 'skill', x: 18, y: 5 },
      { type: 'skill', x: 12, y: 8 },
      { type: 'skill', x: 30, y: 5 },
      { type: 'coffee', x: 8, y: 10 },
      { type: 'coffee', x: 32, y: 12 }
    ]
  },

  // Level 2: Labirynt HR
  {
    name: 'LABIRYNT HR',
    hint: 'Unikaj niekończących się spotkań!',
    width: 50,
    height: 18,
    spawnX: 2,
    spawnY: 15,
    goalX: 47,
    goalY: 3,
    timeLimit: 240,
    map: [
      '##################################################',
      '#................................................#',
      '#..P.........................................P..D#',
      '#.###.......###.......###.......###.......###.###',
      '#.....................P.........................#',
      '#.......###.......###.......###.......###.......#',
      '#....P.....................................P....#',
      '###.###.......###.......###.......###.......###.#',
      '#................................................#',
      '#.......###.......###.......###.......###.......#',
      '#...P.........P.........P.........P.........P...#',
      '###.......###.......###.......###.......###.###.#',
      '#.....C.....................................C...#',
      '#.......###.......###.......###.......###.......#',
      '#................................................#',
      '#S.............................................###',
      '######################.#########################',
      '##################################################'
    ],
    enemies: [
      { type: 'manager', x: 12, y: 15 },
      { type: 'recruiter', x: 25, y: 9 },
      { type: 'manager', x: 38, y: 5 },
      { type: 'recruiter', x: 44, y: 11 }
    ],
    traps: [
      { type: 'meeting', x: 10, y: 16 },
      { type: 'meeting', x: 22, y: 16 },
      { type: 'bureaucracy', x: 30, y: 10 },
      { type: 'meeting', x: 40, y: 16 }
    ],
    collectibles: [
      { type: 'skill', x: 4, y: 2 },
      { type: 'skill', x: 20, y: 4 },
      { type: 'skill', x: 35, y: 6 },
      { type: 'skill', x: 8, y: 10 },
      { type: 'skill', x: 28, y: 10 },
      { type: 'skill', x: 42, y: 10 },
      { type: 'coffee', x: 8, y: 12 },
      { type: 'coffee', x: 42, y: 12 },
      { type: 'cv', x: 25, y: 5 }
    ]
  },

  // Level 3: Open Space
  {
    name: 'OPEN SPACE',
    hint: 'Skup się i nie daj się rozproszeniom!',
    width: 60,
    height: 20,
    spawnX: 2,
    spawnY: 17,
    goalX: 57,
    goalY: 2,
    timeLimit: 300,
    map: [
      '############################################################',
      '#..........................................................#',
      '#..P.....................................................D.#',
      '#.###...............###...............###...............###',
      '#..........................................................#',
      '#......###...............###...............###..............#',
      '#...P..............P..............P..............P.........#',
      '###.......###...............###...............###...........#',
      '#..........................................................#',
      '#.........###...............###...............###...........#',
      '#....P..............P..............P..............P........#',
      '#.......###...............###...............###.............#',
      '#..........................................................#',
      '#..C......###...............###...............###......C....#',
      '#..........................................................#',
      '#......###...............###...............###...............#',
      '#..........................................................#',
      '#S.........................................................#',
      '##########.##########.##########.##########.################',
      '############################################################'
    ],
    enemies: [
      { type: 'manager', x: 15, y: 17 },
      { type: 'burnout', x: 25, y: 10 },
      { type: 'recruiter', x: 35, y: 6 },
      { type: 'manager', x: 45, y: 14 },
      { type: 'burnout', x: 50, y: 8 }
    ],
    traps: [
      { type: 'distraction', x: 10, y: 18 },
      { type: 'distraction', x: 20, y: 18 },
      { type: 'distraction', x: 30, y: 18 },
      { type: 'meeting', x: 40, y: 18 },
      { type: 'bureaucracy', x: 50, y: 12 }
    ],
    collectibles: [
      { type: 'skill', x: 4, y: 2 },
      { type: 'skill', x: 6, y: 6 },
      { type: 'skill', x: 20, y: 6 },
      { type: 'skill', x: 35, y: 6 },
      { type: 'skill', x: 50, y: 6 },
      { type: 'skill', x: 8, y: 10 },
      { type: 'skill', x: 25, y: 10 },
      { type: 'skill', x: 42, y: 10 },
      { type: 'coffee', x: 5, y: 13 },
      { type: 'coffee', x: 55, y: 13 },
      { type: 'cv', x: 30, y: 3 }
    ]
  },

  // Level 4: Korporacyjna Wieża
  {
    name: 'KORPORACYJNA WIEŻA',
    hint: 'Wspinaj się na szczyt kariery!',
    width: 30,
    height: 30,
    spawnX: 2,
    spawnY: 27,
    goalX: 27,
    goalY: 2,
    timeLimit: 360,
    map: [
      '##############################',
      '#............................#',
      '#..P......................D..#',
      '#.###....................###.#',
      '#............................#',
      '#........###....###..........#',
      '#...P....................P...#',
      '#.###....................###.#',
      '#............................#',
      '#........###....###..........#',
      '#............................#',
      '#.###....L..........L....###.#',
      '#........L..........L........#',
      '#...P....L....##....L....P...#',
      '#.###....L..........L....###.#',
      '#........L..........L........#',
      '#........###....###..........#',
      '#............................#',
      '#.###....................###.#',
      '#............................#',
      '#..C.....###....###.....C....#',
      '#............................#',
      '#.###....................###.#',
      '#............................#',
      '#........###....###..........#',
      '#............................#',
      '#.###....................###.#',
      '#S...........................#',
      '##############################',
      '##############################'
    ],
    enemies: [
      { type: 'manager', x: 14, y: 27 },
      { type: 'burnout', x: 10, y: 20 },
      { type: 'recruiter', x: 20, y: 14 },
      { type: 'manager', x: 8, y: 8 },
      { type: 'burnout', x: 22, y: 6 }
    ],
    traps: [
      { type: 'elevator', x: 14, y: 28 },
      { type: 'bureaucracy', x: 5, y: 22 },
      { type: 'meeting', x: 20, y: 16 },
      { type: 'bureaucracy', x: 10, y: 10 }
    ],
    collectibles: [
      { type: 'skill', x: 4, y: 2 },
      { type: 'skill', x: 6, y: 6 },
      { type: 'skill', x: 24, y: 6 },
      { type: 'skill', x: 6, y: 13 },
      { type: 'skill', x: 24, y: 13 },
      { type: 'coffee', x: 5, y: 20 },
      { type: 'coffee', x: 25, y: 20 },
      { type: 'cv', x: 14, y: 8 }
    ]
  },

  // Level 5: Ostatnia Runda (Final Boss)
  {
    name: 'OSTATNIA RUNDA',
    hint: 'Pokonaj Zwątpienie i zdobądź Wymarzoną Pracę!',
    width: 35,
    height: 15,
    spawnX: 2,
    spawnY: 12,
    goalX: 32,
    goalY: 2,
    timeLimit: 300,
    map: [
      '###################################',
      '#.................................#',
      '#............................P..D.#',
      '#.............................###.#',
      '#.................................#',
      '#.###.........................###.#',
      '#.................................#',
      '#.....###.................###.....#',
      '#.................................#',
      '#.........###.........###.........#',
      '#.................................#',
      '#..C..........#####..........C....#',
      '#S................................#',
      '###.###########################.###',
      '###################################'
    ],
    enemies: [
      { type: 'boss', x: 17, y: 10 }
    ],
    traps: [
      { type: 'doubt', x: 8, y: 13 },
      { type: 'doubt', x: 26, y: 13 },
      { type: 'imposter', x: 17, y: 7 }
    ],
    collectibles: [
      { type: 'coffee', x: 5, y: 11 },
      { type: 'coffee', x: 29, y: 11 },
      { type: 'skill', x: 31, y: 2 }
    ]
  }
];

export class LevelManager {
  constructor(game) {
    this.game = game;
    this.currentLevel = null;
    this.currentLevelIndex = 0;
    this.totalLevels = LEVELS.length;

    this.enemies = [];
    this.traps = [];
    this.collectibles = [];
    this.tiles = [];
  }

  loadLevel(levelNumber) {
    this.currentLevelIndex = levelNumber - 1;
    const levelData = LEVELS[this.currentLevelIndex];

    if (!levelData) {
      console.error('Level not found:', levelNumber);
      return;
    }

    // Parse level
    this.currentLevel = {
      ...levelData,
      tiles: this.parseMap(levelData.map)
    };

    // Set time limit
    this.game.stats.time = levelData.timeLimit;

    // Update UI level name
    const levelNameEl = document.getElementById('level-name');
    if (levelNameEl) {
      levelNameEl.textContent = `POZIOM ${levelNumber}: ${levelData.name}`;
    }

    // Clear and create entities
    this.enemies = [];
    this.traps = [];
    this.collectibles = [];

    // Create enemies
    levelData.enemies.forEach(e => {
      this.enemies.push(new Enemy(this.game, e.type, e.x * CONFIG.TILE_SIZE, e.y * CONFIG.TILE_SIZE));
    });

    // Create traps
    levelData.traps.forEach(t => {
      this.traps.push(new Trap(this.game, t.type, t.x * CONFIG.TILE_SIZE, t.y * CONFIG.TILE_SIZE));
    });

    // Create collectibles
    levelData.collectibles.forEach(c => {
      this.collectibles.push(new Collectible(this.game, c.type, c.x * CONFIG.TILE_SIZE, c.y * CONFIG.TILE_SIZE));
    });

    // Show level transition
    this.showLevelTransition(levelNumber, levelData.name, levelData.hint);
  }

  parseMap(mapStrings) {
    const tiles = [];

    for (let y = 0; y < mapStrings.length; y++) {
      tiles[y] = [];
      for (let x = 0; x < mapStrings[y].length; x++) {
        const char = mapStrings[y][x];
        tiles[y][x] = this.charToTile(char);
      }
    }

    return tiles;
  }

  charToTile(char) {
    switch (char) {
      case '#': return { type: 'wall', solid: true };
      case '.': return { type: 'empty', solid: false };
      case 'P': return { type: 'platform', solid: true };
      case 'L': return { type: 'ladder', solid: false };
      case 'S': return { type: 'spawn', solid: false };
      case 'D': return { type: 'door', solid: false };
      case 'G': return { type: 'goal', solid: false };
      case 'C': return { type: 'checkpoint', solid: false };
      default: return { type: 'empty', solid: false };
    }
  }

  getTile(x, y) {
    if (!this.currentLevel || !this.currentLevel.tiles) return null;
    if (y < 0 || y >= this.currentLevel.tiles.length) return null;
    if (x < 0 || x >= this.currentLevel.tiles[y].length) return null;
    return this.currentLevel.tiles[y][x];
  }

  getSpawnPoint() {
    if (!this.currentLevel) return { x: 100, y: 300 };
    return {
      x: this.currentLevel.spawnX * CONFIG.TILE_SIZE,
      y: this.currentLevel.spawnY * CONFIG.TILE_SIZE
    };
  }

  checkGoal(player) {
    if (!this.currentLevel) return false;

    const goalX = this.currentLevel.goalX * CONFIG.TILE_SIZE;
    const goalY = this.currentLevel.goalY * CONFIG.TILE_SIZE;

    const playerBounds = player.getBounds();
    const goalBounds = {
      x: goalX,
      y: goalY,
      width: CONFIG.TILE_SIZE,
      height: CONFIG.TILE_SIZE
    };

    return this.intersects(playerBounds, goalBounds);
  }

  intersects(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  showLevelTransition(levelNumber, name, hint) {
    const transition = document.getElementById('level-transition');
    document.getElementById('transition-level').textContent = `POZIOM ${levelNumber}`;
    document.getElementById('transition-name').textContent = name;
    document.getElementById('transition-hint').textContent = `Wskazówka: ${hint}`;

    transition.classList.remove('hidden');

    setTimeout(() => {
      transition.classList.add('hidden');
    }, 2500);
  }

  update(dt) {
    const player = this.game.player;

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(dt, player);

      // Check collision with player
      if (enemy.alive && this.intersects(player.getBounds(), enemy.getBounds())) {
        if (player.attacking && player.getAttackBounds()) {
          enemy.takeDamage(25);
        } else if (!player.invulnerable) {
          this.game.takeDamage(enemy.damage, enemy.deathMessage);
        }
      }

      // Check if player attack hits enemy
      if (player.attacking) {
        const attackBounds = player.getAttackBounds();
        if (attackBounds && this.intersects(attackBounds, enemy.getBounds())) {
          enemy.takeDamage(25);
        }
      }
    });

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Update traps
    this.traps.forEach(trap => {
      trap.update(dt);

      if (trap.active && this.intersects(player.getBounds(), trap.getBounds())) {
        this.game.takeDamage(trap.damage, trap.deathMessage);
        trap.trigger();
      }
    });

    // Update collectibles
    this.collectibles.forEach(collectible => {
      collectible.update(dt);

      if (!collectible.collected && this.intersects(player.getBounds(), collectible.getBounds())) {
        collectible.collect();
        this.game.collectItem(collectible.type);
      }
    });

    // Remove collected items
    this.collectibles = this.collectibles.filter(c => !c.collected);
  }

  render(ctx) {
    if (!this.currentLevel) return;

    const tiles = this.currentLevel.tiles;
    const tileSize = CONFIG.TILE_SIZE;

    // Calculate visible area
    const startX = Math.floor(this.game.camera.x / tileSize);
    const startY = Math.floor(this.game.camera.y / tileSize);
    const endX = Math.ceil((this.game.camera.x + CONFIG.GAME_WIDTH) / tileSize) + 1;
    const endY = Math.ceil((this.game.camera.y + CONFIG.GAME_HEIGHT) / tileSize) + 1;

    // Render background
    this.renderBackground(ctx);

    // Render tiles
    for (let y = Math.max(0, startY); y < Math.min(tiles.length, endY); y++) {
      for (let x = Math.max(0, startX); x < Math.min(tiles[y].length, endX); x++) {
        const tile = tiles[y][x];
        this.renderTile(ctx, tile, x * tileSize, y * tileSize);
      }
    }

    // Render collectibles
    this.collectibles.forEach(c => c.render(ctx));

    // Render traps
    this.traps.forEach(t => t.render(ctx));

    // Render enemies
    this.enemies.forEach(e => e.render(ctx));

    // Render goal
    this.renderGoal(ctx);
  }

  renderBackground(ctx) {
    // Office background pattern
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(
      this.game.camera.x,
      this.game.camera.y,
      CONFIG.GAME_WIDTH,
      CONFIG.GAME_HEIGHT
    );

    // Grid pattern for office floor feel
    ctx.strokeStyle = 'rgba(0, 166, 86, 0.05)';
    ctx.lineWidth = 1;

    const gridSize = 64;
    const offsetX = this.game.camera.x % gridSize;
    const offsetY = this.game.camera.y % gridSize;

    for (let x = -offsetX; x < CONFIG.GAME_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(this.game.camera.x + x, this.game.camera.y);
      ctx.lineTo(this.game.camera.x + x, this.game.camera.y + CONFIG.GAME_HEIGHT);
      ctx.stroke();
    }

    for (let y = -offsetY; y < CONFIG.GAME_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(this.game.camera.x, this.game.camera.y + y);
      ctx.lineTo(this.game.camera.x + CONFIG.GAME_WIDTH, this.game.camera.y + y);
      ctx.stroke();
    }
  }

  renderTile(ctx, tile, x, y) {
    const size = CONFIG.TILE_SIZE;

    switch (tile.type) {
      case 'wall':
        // Wall tile with pixel art style
        ctx.fillStyle = '#2d2d44';
        ctx.fillRect(x, y, size, size);

        // Wall detail
        ctx.fillStyle = '#3d3d54';
        ctx.fillRect(x + 2, y + 2, size - 4, 4);
        ctx.fillRect(x + 2, y + size - 6, size - 4, 4);

        // Border
        ctx.strokeStyle = '#1a1a2e';
        ctx.strokeRect(x, y, size, size);
        break;

      case 'platform':
        // Floating platform (desk-like)
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x, y, size, 8);

        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(x, y + 8, size, 4);

        // Platform supports
        ctx.fillStyle = '#2a2a4a';
        ctx.fillRect(x + 4, y + 12, 4, size - 12);
        ctx.fillRect(x + size - 8, y + 12, 4, size - 12);
        break;

      case 'ladder':
        // Office ladder/stairs
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 4, y, 4, size);
        ctx.fillRect(x + size - 8, y, 4, size);

        // Rungs
        ctx.fillStyle = '#A0522D';
        for (let i = 4; i < size; i += 8) {
          ctx.fillRect(x + 4, y + i, size - 8, 3);
        }
        break;

      case 'door':
        // Goal door (golden)
        ctx.fillStyle = COLORS.GOLD;
        ctx.fillRect(x + 4, y, size - 8, size);

        ctx.fillStyle = '#B8860B';
        ctx.fillRect(x + 6, y + 2, size - 12, size - 4);

        // Door handle
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillRect(x + size - 12, y + size / 2 - 2, 4, 4);

        // "PRACA" text hint
        ctx.fillStyle = '#8B6914';
        ctx.font = '6px monospace';
        ctx.fillText('PRACA', x + 8, y + size / 2);
        break;

      case 'checkpoint':
        // Coffee machine checkpoint
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 8, y + 8, size - 16, size - 8);

        ctx.fillStyle = COLORS.GREEN;
        ctx.fillRect(x + 10, y + 12, size - 20, 8);

        // Cup
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 12, y + size - 12, 8, 8);
        break;

      case 'spawn':
        // Spawn point (subtle indicator)
        ctx.fillStyle = 'rgba(0, 166, 86, 0.2)';
        ctx.fillRect(x, y, size, size);
        break;
    }
  }

  renderGoal(ctx) {
    const goalX = this.currentLevel.goalX * CONFIG.TILE_SIZE;
    const goalY = this.currentLevel.goalY * CONFIG.TILE_SIZE;

    // Glowing effect
    const pulse = Math.sin(performance.now() / 300) * 0.3 + 0.7;

    ctx.save();
    ctx.shadowColor = COLORS.GOLD;
    ctx.shadowBlur = 20 * pulse;

    // Golden briefcase (the dream job!)
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(goalX + 4, goalY + 8, 24, 16);

    ctx.fillStyle = '#B8860B';
    ctx.fillRect(goalX + 6, goalY + 10, 20, 12);

    // Handle
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(goalX + 12, goalY + 4, 8, 6);

    // Lock
    ctx.fillStyle = '#FFF';
    ctx.fillRect(goalX + 14, goalY + 14, 4, 4);

    ctx.restore();

    // Sparkles
    this.renderSparkles(ctx, goalX + 16, goalY + 16);
  }

  renderSparkles(ctx, x, y) {
    const time = performance.now() / 100;

    for (let i = 0; i < 5; i++) {
      const angle = (time + i * 72) * Math.PI / 180;
      const distance = 15 + Math.sin(time * 0.1 + i) * 5;
      const sparkleX = x + Math.cos(angle * 5) * distance;
      const sparkleY = y + Math.sin(angle * 5) * distance;
      const size = 2 + Math.sin(time * 0.2 + i) * 1;

      ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 0.3 + i) * 0.3})`;
      ctx.fillRect(sparkleX - size / 2, sparkleY - size / 2, size, size);
    }
  }
}
