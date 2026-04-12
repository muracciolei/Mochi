/**
 * AudioSystem - Synthesizes and plays sound effects using Web Audio API
 * No external files needed — all sounds are generated programmatically
 */

export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.volume = 0.4;
    this.initialized = false;
  }

  /**
   * Detect Web Audio API support
   * @returns {boolean} True if supported
   */
  detectWebAudio() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  /**
   * Initialize audio system (must be called after user gesture)
   */
  async init() {
    if (this.initialized) return;

    if (!this.detectWebAudio()) {
      console.warn('Web Audio API not supported');
      return;
    }

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Resume if suspended (mobile browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      this.initialized = true;
    } catch (error) {
      console.warn('AudioSystem init failed:', error);
    }
  }

  /**
   * Play a synthesized sound effect
   * @param {string} soundType - Type of sound to play
   */
  play(soundType) {
    if (!this.initialized || !this.audioContext) return;

    // Resume context if needed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    try {
      switch (soundType) {
        case 'happy':
          this._playHappy();
          break;
        case 'hungry':
          this._playHungry();
          break;
        case 'sleep':
          this._playSleep();
          break;
        case 'alarm':
          this._playAlarm();
          break;
        case 'notification':
          this._playNotification();
          break;
        case 'tap':
          this._playTap();
          break;
        case 'eat':
          this._playEat();
          break;
        default:
          this._playTap();
      }
    } catch (error) {
      console.warn('Audio play error:', error);
    }
  }

  /**
   * Happy chirp — ascending two-note chime
   */
  _playHappy() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, now);        // C5
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, now + 0.12); // E5

    gain.gain.setValueAtTime(this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.4);
  }

  /**
   * Hungry rumble — low wobbling tone
   */
  _playHungry() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);
    osc.frequency.linearRampToValueAtTime(110, now + 0.5);

    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Sleep chime — soft descending tone
   */
  _playSleep() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.8);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  /**
   * Alarm — repeating beep pattern
   */
  _playAlarm() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now + i * 0.3);

      gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.15);
    }
  }

  /**
   * Notification — single bell tone
   */
  _playNotification() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now); // G5

    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Tap — quick blip
   */
  _playTap() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Eat — bubbly chomp sound
   */
  _playEat() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 300 + i * 80;
      osc.frequency.setValueAtTime(baseFreq, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + i * 0.1 + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    }
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Set volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Check if audio is available
   * @returns {boolean} True if available
   */
  isAvailable() {
    return this.initialized && !!this.audioContext;
  }
}
