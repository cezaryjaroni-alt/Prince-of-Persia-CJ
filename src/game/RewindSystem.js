/**
 * Resume Rewind System
 * Records gameplay state and allows time reversal
 * Inspired by Prince of Persia's Sands of Time mechanic
 */

import * as THREE from 'three';

export class RewindSystem {
  constructor(character) {
    this.character = character;

    // Rewind properties
    this.maxCharges = 3;
    this.charges = this.maxCharges;
    this.rewindDuration = 5; // seconds to rewind
    this.recordInterval = 1 / 30; // Record at 30fps

    // State recording
    this.stateBuffer = [];
    this.maxBufferSize = this.rewindDuration / this.recordInterval;
    this.lastRecordTime = 0;

    // Rewind state
    this.isRewinding = false;
    this.rewindProgress = 0;
    this.rewindStartIndex = 0;
  }

  recordState() {
    const now = performance.now() / 1000;

    // Only record at specified interval
    if (now - this.lastRecordTime < this.recordInterval) {
      return;
    }

    this.lastRecordTime = now;

    // Create state snapshot
    const state = {
      position: this.character.getPosition().clone(),
      velocity: this.character.getVelocity().clone(),
      rotation: this.character.mesh.rotation.clone(),
      characterState: this.character.getState(),
      timestamp: now
    };

    // Add to buffer
    this.stateBuffer.push(state);

    // Remove old states beyond buffer limit
    while (this.stateBuffer.length > this.maxBufferSize) {
      this.stateBuffer.shift();
    }
  }

  canRewind() {
    return this.charges > 0 && this.stateBuffer.length > 10 && !this.isRewinding;
  }

  startRewind() {
    if (!this.canRewind()) return false;

    this.isRewinding = true;
    this.charges--;
    this.rewindProgress = 0;
    this.rewindStartIndex = this.stateBuffer.length - 1;

    console.log('⏪ Resume Rewind activated! Charges remaining:', this.charges);

    return true;
  }

  update(dt) {
    if (!this.isRewinding) return;

    // Progress through the rewind
    this.rewindProgress += dt / this.rewindDuration;

    if (this.rewindProgress >= 1) {
      this.finishRewind();
      return;
    }

    // Calculate which state to restore
    const targetIndex = Math.floor(
      this.rewindStartIndex * (1 - this.rewindProgress)
    );

    if (targetIndex >= 0 && targetIndex < this.stateBuffer.length) {
      const state = this.stateBuffer[targetIndex];
      this.restoreState(state);
    }
  }

  restoreState(state) {
    // Apply state to character
    this.character.setState(state.position, state.velocity);
    this.character.mesh.rotation.copy(state.rotation);
  }

  finishRewind() {
    this.isRewinding = false;

    // Clear buffer up to rewind point to prevent immediate re-recording
    const keepIndex = Math.floor(this.rewindStartIndex * (1 - this.rewindProgress));
    this.stateBuffer = this.stateBuffer.slice(0, Math.max(keepIndex, 0));

    console.log('✓ Resume Rewind complete');
  }

  getCharges() {
    return this.charges;
  }

  addCharge() {
    if (this.charges < this.maxCharges) {
      this.charges++;
      return true;
    }
    return false;
  }

  reset() {
    this.charges = this.maxCharges;
    this.stateBuffer = [];
    this.isRewinding = false;
    this.rewindProgress = 0;
  }

  getRewindProgress() {
    return this.isRewinding ? this.rewindProgress : 0;
  }

  getBufferFill() {
    return this.stateBuffer.length / this.maxBufferSize;
  }
}
