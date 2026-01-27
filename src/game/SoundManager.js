/**
 * Sound Manager - Zarządzanie dźwiękiem
 * Generuje dźwięki proceduralne za pomocą Web Audio API
 */

export class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    this.audioContext = null;

    // Initialize on first user interaction
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  play(soundName) {
    if (!this.enabled) return;

    // Initialize on first play (requires user interaction)
    if (!this.initialized) {
      this.init();
    }

    if (!this.audioContext) return;

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (soundName) {
      case 'jump':
        this.playJump();
        break;
      case 'attack':
        this.playAttack();
        break;
      case 'hurt':
        this.playHurt();
        break;
      case 'collect':
        this.playCollect();
        break;
      case 'powerup':
        this.playPowerup();
        break;
      case 'heal':
        this.playHeal();
        break;
      case 'trap':
        this.playTrap();
        break;
      case 'enemyHurt':
        this.playEnemyHurt();
        break;
      case 'enemyDeath':
        this.playEnemyDeath();
        break;
      case 'enemyAttack':
        this.playEnemyAttack();
        break;
      case 'victory':
        this.playVictory();
        break;
      case 'gameover':
        this.playGameOver();
        break;
    }
  }

  // Procedural sound generation
  playJump() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playAttack() {
    // Whoosh sound
    const noise = this.createNoise(0.1);
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.1);
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
  }

  playHurt() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playCollect() {
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc1.frequency.setValueAtTime(1100, this.audioContext.currentTime + 0.05);

    osc2.frequency.setValueAtTime(1320, this.audioContext.currentTime + 0.05);
    osc2.frequency.setValueAtTime(1760, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start();
    osc2.start(this.audioContext.currentTime + 0.05);
    osc1.stop(this.audioContext.currentTime + 0.1);
    osc2.stop(this.audioContext.currentTime + 0.2);
  }

  playPowerup() {
    // Ascending arpeggio
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  playHeal() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playTrap() {
    // Alarm-like sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';

    // Alternating frequencies
    for (let i = 0; i < 4; i++) {
      const time = this.audioContext.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(i % 2 === 0 ? 600 : 400, time);
    }

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.4);
  }

  playEnemyHurt() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playEnemyDeath() {
    // Descending pitch
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  playEnemyAttack() {
    const noise = this.createNoise(0.15);
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
  }

  playVictory() {
    // Triumphant fanfare
    const melody = [
      { freq: 523, time: 0, duration: 0.15 },
      { freq: 659, time: 0.15, duration: 0.15 },
      { freq: 784, time: 0.3, duration: 0.15 },
      { freq: 1047, time: 0.45, duration: 0.4 }
    ];

    melody.forEach(note => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.value = note.freq;

      const startTime = this.audioContext.currentTime + note.time;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
  }

  playGameOver() {
    // Sad descending tones
    const melody = [
      { freq: 392, time: 0, duration: 0.3 },
      { freq: 349, time: 0.3, duration: 0.3 },
      { freq: 311, time: 0.6, duration: 0.3 },
      { freq: 261, time: 0.9, duration: 0.6 }
    ];

    melody.forEach(note => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      const startTime = this.audioContext.currentTime + note.time;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.duration);
    });
  }

  createNoise(duration) {
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.start();

    return noise;
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
