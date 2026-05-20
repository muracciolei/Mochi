/**
 * EggSystem - Manage egg collection, hatching, and stats
 * Eggs have a 15-second timer before they hatch.
 * Users can name eggs to create new Mochi variants.
 */

export class EggSystem {
  constructor(state, i18n) {
    this.state = state;
    this.i18n = i18n;
    this.hatchTimers = new Map(); // id → timeoutId
  }

  /**
   * Create a new egg with a random DNA seed.
   * Automatically starts the 15-second hatch timer.
   */
  createEgg(name = null) {
    const eggs = this.state.getState('eggs') || [];
    const id = `egg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const egg = {
      id,
      name: name || null,
      dnaHash: this._randomHash(),
      createdAt: Date.now(),
      hatchTime: Date.now() + 15000, // 15 seconds from now
      hatched: false,
      hatchedAt: null
    };

    eggs.push(egg);
    this.state.updateState('eggs', eggs);

    // Start hatch timer
    this._startHatchTimer(egg);

    return egg;
  }

  /**
   * Get all eggs, sorted by creation date (newest first).
   */
  getEggs() {
    const eggs = this.state.getState('eggs') || [];
    return eggs.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get a specific egg by ID.
   */
  getEgg(id) {
    const eggs = this.state.getState('eggs') || [];
    return eggs.find(e => e.id === id);
  }

  /**
   * Get remaining time until hatch (in milliseconds).
   * Returns 0 if already hatched.
   */
  getTimeRemaining(eggId) {
    const egg = this.getEgg(eggId);
    if (!egg) return 0;
    if (egg.hatched) return 0;
    const remaining = egg.hatchTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Get remaining time as a formatted string (e.g., "12.5s").
   */
  getTimeRemainingFormatted(eggId) {
    const ms = this.getTimeRemaining(eggId);
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }

  /**
   * Hatch an egg, marking it as hatched.
   */
  hatchEgg(eggId) {
    const eggs = this.state.getState('eggs') || [];
    const egg = eggs.find(e => e.id === eggId);

    if (!egg) return false;
    if (egg.hatched) return false;

    egg.hatched = true;
    egg.hatchedAt = Date.now();

    this.state.updateState('eggs', eggs);

    // Clear any pending timer
    if (this.hatchTimers.has(eggId)) {
      clearTimeout(this.hatchTimers.get(eggId));
      this.hatchTimers.delete(eggId);
    }

    return true;
  }

  /**
   * Name an egg (and trigger hatch if time is up).
   */
  nameEgg(eggId, newName) {
    const eggs = this.state.getState('eggs') || [];
    const egg = eggs.find(e => e.id === eggId);

    if (!egg) return false;

    egg.name = newName.slice(0, 20);

    // If time is up, auto-hatch
    if (this.getTimeRemaining(eggId) <= 0 && !egg.hatched) {
      this.hatchEgg(eggId);
    }

    this.state.updateState('eggs', eggs);
    return true;
  }

  /**
   * Delete an egg.
   */
  deleteEgg(eggId) {
    if (this.hatchTimers.has(eggId)) {
      clearTimeout(this.hatchTimers.get(eggId));
      this.hatchTimers.delete(eggId);
    }

    const eggs = this.state.getState('eggs') || [];
    const filtered = eggs.filter(e => e.id !== eggId);
    this.state.updateState('eggs', filtered);
    return true;
  }

  /**
   * Get egg stats for display.
   */
  getEggStats(eggId) {
    const egg = this.getEgg(eggId);
    if (!egg) return null;

    const ageMs = Date.now() - egg.createdAt;
    const ageSecs = Math.round(ageMs / 1000);
    const timeRemainingSecs = Math.ceil(this.getTimeRemaining(eggId) / 1000);

    return {
      id: eggId,
      name: egg.name || 'Unnamed Egg',
      age: `${ageSecs}s`,
      timeRemaining: `${timeRemainingSecs}s`,
      hatched: egg.hatched,
      dnaHash: egg.dnaHash
    };
  }

  /**
   * Start or restore hatch timers for all eggs (called on app init).
   */
  restoreHatchTimers() {
    const eggs = this.state.getState('eggs') || [];
    eggs.forEach(egg => {
      if (!egg.hatched && egg.hatchTime > Date.now()) {
        this._startHatchTimer(egg);
      }
    });
  }

  /**
   * Internal: Start the 15-second hatch timer for an egg.
   */
  _startHatchTimer(egg) {
    if (egg.hatched) return;

    const delay = Math.max(0, egg.hatchTime - Date.now());
    const timeoutId = setTimeout(() => {
      this.hatchEgg(egg.id);
    }, delay);

    this.hatchTimers.set(egg.id, timeoutId);
  }

  /**
   * Generate a random DNA hash (deterministic, 8 hex chars).
   */
  _randomHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 8; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
  }
}
