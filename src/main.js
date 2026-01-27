/**
 * Pracuj Quest - Kariera Czeka!
 * Gra platformowa 2D inspirowana Prince of Persia (1989)
 * Tematyka: Pracuj.pl - polski portal pracy
 */

import { Game } from './game/Game.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const startScreen = document.getElementById('start-screen');
  const startButton = document.getElementById('start-button');
  const pauseScreen = document.getElementById('pause-screen');
  const resumeButton = document.getElementById('resume-button');
  const restartButton = document.getElementById('restart-button');
  const gameoverScreen = document.getElementById('gameover-screen');
  const retryButton = document.getElementById('retry-button');
  const victoryScreen = document.getElementById('victory-screen');
  const nextLevelButton = document.getElementById('next-level-button');
  const playAgainButton = document.getElementById('play-again-button');
  const uiOverlay = document.getElementById('ui-overlay');

  // Initialize the game
  const game = new Game(canvas);

  // Start button handler
  startButton.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    uiOverlay.classList.add('active');
    game.start();
  });

  // Pause handlers
  resumeButton.addEventListener('click', () => {
    pauseScreen.classList.add('hidden');
    game.resume();
  });

  restartButton.addEventListener('click', () => {
    pauseScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    game.restart();
  });

  // Game over handler
  retryButton.addEventListener('click', () => {
    gameoverScreen.classList.add('hidden');
    game.restart();
  });

  // Victory handlers
  nextLevelButton.addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    game.nextLevel();
  });

  playAgainButton.addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    game.restart();
  });

  // ESC key for pause
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!startScreen.classList.contains('hidden')) return;
      if (!gameoverScreen.classList.contains('hidden')) return;
      if (!victoryScreen.classList.contains('hidden')) return;

      if (pauseScreen.classList.contains('hidden')) {
        pauseScreen.classList.remove('hidden');
        game.pause();
      } else {
        pauseScreen.classList.add('hidden');
        game.resume();
      }
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    game.handleResize();
  });

  // Prevent context menu on right-click
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  console.log('%c PRACUJ QUEST ', 'background: #00A656; color: white; font-size: 20px; font-weight: bold; padding: 10px;');
  console.log('%cKariera Czeka! Gra platformowa 2D', 'color: #ffd700; font-size: 14px;');
});
