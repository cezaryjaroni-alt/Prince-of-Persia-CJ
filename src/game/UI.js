/**
 * UI System
 * Manages all user interface elements
 */

export class UI {
  constructor() {
    // Get UI elements
    this.cvProgressFill = document.getElementById('cv-progress-fill');
    this.cvPercentage = document.getElementById('cv-percentage');
    this.rewindCharges = document.querySelectorAll('.rewind-charge');
    this.glitchOverlay = document.getElementById('glitch-overlay');

    // Game state
    this.health = 100;
    this.maxHealth = 100;

    // Create wall run indicator
    this.createWallRunIndicator();
  }

  createWallRunIndicator() {
    this.wallRunIndicator = document.createElement('div');
    this.wallRunIndicator.className = 'wall-run-indicator';
    this.wallRunIndicator.textContent = 'WALL RUNNING';
    document.getElementById('ui-overlay').appendChild(this.wallRunIndicator);
  }

  update(character) {
    // Update wall run indicator
    if (character.getState() === 'wall_running') {
      this.wallRunIndicator.classList.add('visible');
    } else {
      this.wallRunIndicator.classList.remove('visible');
    }
  }

  setHealth(value) {
    this.health = Math.max(0, Math.min(this.maxHealth, value));
    const percentage = (this.health / this.maxHealth) * 100;

    this.cvProgressFill.style.width = `${percentage}%`;
    this.cvPercentage.textContent = `${Math.round(percentage)}%`;

    // Color change based on health
    if (percentage < 30) {
      this.cvProgressFill.style.background =
        'linear-gradient(90deg, #ff4444 0%, #ff6666 100%)';
    } else if (percentage < 60) {
      this.cvProgressFill.style.background =
        'linear-gradient(90deg, #ffaa00 0%, #ffcc00 100%)';
    } else {
      this.cvProgressFill.style.background =
        'linear-gradient(90deg, #0046AB 0%, #1a5cbb 50%, #FFD700 100%)';
    }
  }

  takeDamage(amount) {
    this.setHealth(this.health - amount);

    // Flash effect
    this.cvProgressFill.style.transition = 'none';
    this.cvProgressFill.style.filter = 'brightness(2)';

    setTimeout(() => {
      this.cvProgressFill.style.transition = 'all 0.3s ease';
      this.cvProgressFill.style.filter = 'none';
    }, 100);

    return this.health;
  }

  heal(amount) {
    this.setHealth(this.health + amount);
  }

  useRewindCharge() {
    // Find last active charge and deactivate it
    for (let i = this.rewindCharges.length - 1; i >= 0; i--) {
      if (this.rewindCharges[i].classList.contains('active')) {
        this.rewindCharges[i].classList.remove('active');

        // Add visual feedback
        this.rewindCharges[i].style.transform = 'scale(1.3)';
        setTimeout(() => {
          this.rewindCharges[i].style.transform = 'scale(1)';
        }, 200);

        break;
      }
    }
  }

  addRewindCharge() {
    // Find first inactive charge and activate it
    for (let i = 0; i < this.rewindCharges.length; i++) {
      if (!this.rewindCharges[i].classList.contains('active')) {
        this.rewindCharges[i].classList.add('active');

        // Add visual feedback
        this.rewindCharges[i].style.transform = 'scale(1.3)';
        setTimeout(() => {
          this.rewindCharges[i].style.transform = 'scale(1)';
        }, 200);

        break;
      }
    }
  }

  setRewindCharges(count) {
    this.rewindCharges.forEach((charge, index) => {
      if (index < count) {
        charge.classList.add('active');
      } else {
        charge.classList.remove('active');
      }
    });
  }

  showMessage(text, duration = 3000) {
    // Create temporary message element
    const message = document.createElement('div');
    message.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 70, 171, 0.9);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      border: 2px solid #FFD700;
      animation: fadeIn 0.3s ease;
      z-index: 300;
    `;
    message.textContent = text;

    document.getElementById('ui-overlay').appendChild(message);

    setTimeout(() => {
      message.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => message.remove(), 300);
    }, duration);
  }

  showVictory() {
    const victoryScreen = document.createElement('div');
    victoryScreen.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 70, 171, 0.95) 0%, rgba(0, 51, 128, 0.95) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 400;
      animation: fadeIn 0.5s ease;
    `;

    victoryScreen.innerHTML = `
      <h1 style="
        color: #FFD700;
        font-size: 64px;
        font-weight: 900;
        letter-spacing: 10px;
        margin-bottom: 20px;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
      ">CONGRATULATIONS!</h1>
      <h2 style="
        color: white;
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 40px;
      ">You Found the Grand Offer! 💼</h2>
      <p style="
        color: rgba(255, 255, 255, 0.8);
        font-size: 18px;
        margin-bottom: 30px;
      ">Your corporate journey is complete.</p>
      <button onclick="location.reload()" style="
        background: #FFD700;
        color: #003380;
        border: none;
        padding: 15px 50px;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 3px;
        cursor: pointer;
        border-radius: 8px;
        text-transform: uppercase;
      ">PLAY AGAIN</button>
    `;

    document.getElementById('game-container').appendChild(victoryScreen);
  }

  showGameOver() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(50, 20, 20, 0.95) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 400;
      animation: fadeIn 0.5s ease;
    `;

    gameOverScreen.innerHTML = `
      <h1 style="
        color: #ff4444;
        font-size: 64px;
        font-weight: 900;
        letter-spacing: 10px;
        margin-bottom: 20px;
      ">BURNOUT</h1>
      <h2 style="
        color: white;
        font-size: 24px;
        font-weight: 400;
        margin-bottom: 40px;
      ">Your CV has been rejected.</h2>
      <button onclick="location.reload()" style="
        background: #0046AB;
        color: white;
        border: none;
        padding: 15px 50px;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 3px;
        cursor: pointer;
        border-radius: 8px;
        text-transform: uppercase;
      ">TRY AGAIN</button>
    `;

    document.getElementById('game-container').appendChild(gameOverScreen);
  }
}
