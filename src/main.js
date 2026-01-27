/**
 * Pracuj: Corporate Escape
 * A Prince of Persia-inspired parkour platformer
 * Themed around Pracuj.pl - Poland's leading job portal
 */

import { Game } from './game/Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const uiOverlay = document.getElementById('ui-overlay');

  // Initialize the game
  const game = new Game(canvas);

  // Start button handler
  startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    uiOverlay.classList.add('active');
    game.start();

    // Lock pointer for FPS-style controls
    canvas.requestPointerLock();
  });

  // Handle pointer lock changes
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      game.setControlsEnabled(true);
    } else {
      game.setControlsEnabled(false);
    }
  });

  // Click to re-lock pointer during gameplay
  canvas.addEventListener('click', () => {
    if (startScreen.classList.contains('hidden')) {
      canvas.requestPointerLock();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    game.handleResize();
  });

  // Prevent context menu on right-click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  console.log('%c🎮 Pracuj: Corporate Escape', 'color: #0046AB; font-size: 20px; font-weight: bold;');
  console.log('%cNavigate the Corporate Office Dungeon and find the Grand Offer!', 'color: #FFD700;');
});
