/**
 * UI System - Interfejs użytkownika
 * Zarządza wszystkimi elementami UI po polsku
 */

export class UI {
  constructor(game) {
    this.game = game;

    // Get UI elements (with null safety)
    this.healthFill = document.getElementById('health-fill');
    this.timerValue = document.getElementById('timer-value');
    this.timerContainer = document.getElementById('timer-container');
    this.cvCount = document.getElementById('cv-count');
    this.coffeeCount = document.getElementById('coffee-count');
    this.skillCount = document.getElementById('skill-count');
    this.levelName = document.getElementById('level-name');
  }

  update() {
    if (!this.game || !this.game.stats) return;

    const stats = this.game.stats;

    // Update health bar
    if (this.healthFill) {
      const healthPercent = (stats.health / stats.maxHealth) * 100;
      this.healthFill.style.width = `${healthPercent}%`;

      // Health color change
      if (healthPercent < 30) {
        this.healthFill.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #ee5a5a 50%, #c92a2a 100%)';
      } else if (healthPercent < 60) {
        this.healthFill.style.background = 'linear-gradient(180deg, #ffd43b 0%, #fab005 50%, #f59f00 100%)';
      } else {
        this.healthFill.style.background = 'linear-gradient(180deg, #00C969 0%, #00A656 50%, #008544 100%)';
      }
    }

    // Update timer
    if (this.timerValue) {
      const mins = Math.floor(stats.time / 60);
      const secs = Math.floor(stats.time % 60);
      this.timerValue.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Timer warning when low
    if (this.timerContainer) {
      if (stats.time <= 60) {
        this.timerContainer.classList.add('warning');
      } else {
        this.timerContainer.classList.remove('warning');
      }
    }

    // Update collectibles
    if (this.cvCount) this.cvCount.textContent = stats.cvParts;
    if (this.coffeeCount) this.coffeeCount.textContent = stats.coffees;
    if (this.skillCount) this.skillCount.textContent = stats.skills;
  }

  showMessage(text, duration = 2000) {
    // Remove existing message
    const existing = document.querySelector('.game-message');
    if (existing) existing.remove();

    // Create message element
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(message);

      setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
      }, duration);
    }
  }

  showFloatingText(x, y, text, color = '#FFD700') {
    // This would show floating text at world position
    // For now, we'll use the message system
    this.showMessage(text, 1000);
  }
}
