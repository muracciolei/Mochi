/**
 * StateManager - Manages application state and LocalStorage persistence
 * Implements debounced save strategy and state validation
 */

const DEFAULT_STATE = {
  emotion: 'happy',
  mood: 50,
  hunger: 30,
  energy: 80,
  lastInteraction: Date.now(),
  dailyInteractions: {
    breakfast: null,
    lunch: null,
    returnHome: null,
    dinner: null
  },
  // null → detect from navigator.language on first run
  language: null,
  colorPreset: 'pink',
  alarm: null,
  reminders: [],
  firstInstall: Date.now(),
  supportNotificationShown: false,
  webLLMEnabled: false,
  webLLMLoaded: false,
  // ─── Identity ───
  name: null,
  birthday: null,
  dnaSeed: null,
  onboarded: false,
  // ─── Stats / Counters (drive personality) ───
  stats: {
    feedCount: 0,
    playCount: 0,
    talkCount: 0,
    sleepCount: 0,
    tapCount: 0,
    gamesPlayed: 0,
    highScore: 0
  },
  // ─── Streak ───
  streak: {
    current: 0,
    longest: 0,
    lastVisitDay: null
  },
  // ─── Mood history (last 30 days, 1 sample/day) ───
  moodHistory: [],
  // ─── Memories (auto-captured highlights) ───
  memories: [],
  // ─── Easter egg flags ───
  easterEggs: {
    konami: false,
    fullMoon: false,
    birthdayParty: false
  },
  // ─── Eggs (egg hatching system) ───
  eggs: []
};

export class StateManager {
  constructor() {
    this.state = null;
    this.saveTimeout = null;
    this.SAVE_DEBOUNCE_MS = 500;
    this.STORAGE_KEY = 'mochi_state';
  }

  /**
   * Load state from LocalStorage
   * @returns {Object} Application state
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        return this.state;
      }

      const parsed = JSON.parse(stored);
      this.state = this.validateState(parsed);
      return this.state;
    } catch (error) {
      console.error('Failed to load state:', error);
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      return this.state;
    }
  }

  /**
   * Save state to LocalStorage (debounced)
   */
  saveState() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      try {
        const serialized = JSON.stringify(this.state);
        localStorage.setItem(this.STORAGE_KEY, serialized);
      } catch (error) {
        console.error('Failed to save state:', error);
        if (error.name === 'QuotaExceededError') {
          this.clearOldData();
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
          } catch (retryError) {
            console.error('Failed to save after clearing:', retryError);
          }
        }
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  /**
   * Update specific state property
   */
  updateState(key, value) {
    if (this.state === null) {
      this.loadState();
    }
    this.state[key] = value;
    this.saveState();
  }

  /**
   * Get specific state property
   */
  getState(key) {
    if (this.state === null) {
      this.loadState();
    }
    return this.state[key];
  }

  /**
   * Increment a numeric counter inside state.stats
   */
  incrementStat(key, by = 1) {
    if (this.state === null) this.loadState();
    if (!this.state.stats) this.state.stats = { ...DEFAULT_STATE.stats };
    this.state.stats[key] = (this.state.stats[key] || 0) + by;
    this.saveState();
    return this.state.stats[key];
  }

  /**
   * Clear all state (reset app)
   */
  clearState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Validate loaded state against schema (additive: missing keys filled from defaults)
   */
  validateState(state) {
    const validated = JSON.parse(JSON.stringify(DEFAULT_STATE));

    if (typeof state.emotion === 'string') validated.emotion = state.emotion;
    if (typeof state.mood === 'number') validated.mood = state.mood;
    if (typeof state.hunger === 'number') validated.hunger = state.hunger;
    if (typeof state.energy === 'number') validated.energy = state.energy;
    if (typeof state.lastInteraction === 'number') validated.lastInteraction = state.lastInteraction;
    if (typeof state.dailyInteractions === 'object' && state.dailyInteractions) validated.dailyInteractions = state.dailyInteractions;
    if (typeof state.language === 'string' && state.language) validated.language = state.language;
    if (typeof state.colorPreset === 'string') validated.colorPreset = state.colorPreset;
    if (state.alarm !== undefined) validated.alarm = state.alarm;
    if (Array.isArray(state.reminders)) validated.reminders = state.reminders;
    if (typeof state.firstInstall === 'number') validated.firstInstall = state.firstInstall;
    if (typeof state.supportNotificationShown === 'boolean') validated.supportNotificationShown = state.supportNotificationShown;
    if (typeof state.webLLMEnabled === 'boolean') validated.webLLMEnabled = state.webLLMEnabled;
    if (typeof state.webLLMLoaded === 'boolean') validated.webLLMLoaded = state.webLLMLoaded;

    // ─── New fields (with defaults) ───
    if (typeof state.name === 'string') validated.name = state.name;
    if (typeof state.birthday === 'number') validated.birthday = state.birthday;
    if (typeof state.dnaSeed === 'string') validated.dnaSeed = state.dnaSeed;
    if (typeof state.onboarded === 'boolean') validated.onboarded = state.onboarded;
    if (typeof state.stats === 'object' && state.stats) {
      validated.stats = { ...validated.stats, ...state.stats };
    }
    if (typeof state.streak === 'object' && state.streak) {
      validated.streak = { ...validated.streak, ...state.streak };
    }
    if (Array.isArray(state.moodHistory)) validated.moodHistory = state.moodHistory.slice(-30);
    if (Array.isArray(state.memories)) validated.memories = state.memories.slice(-50);
    if (typeof state.easterEggs === 'object' && state.easterEggs) {
      validated.easterEggs = { ...validated.easterEggs, ...state.easterEggs };
    }
    if (Array.isArray(state.eggs)) validated.eggs = state.eggs;

    return validated;
  }

  /**
   * Clear old data to free up storage space
   */
  clearOldData() {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (this.state && Array.isArray(this.state.reminders)) {
      this.state.reminders = this.state.reminders.filter(r => r.time > sevenDaysAgo);
    }
    if (this.state && Array.isArray(this.state.memories)) {
      this.state.memories = this.state.memories.slice(-20);
    }
    if (this.state && Array.isArray(this.state.moodHistory)) {
      this.state.moodHistory = this.state.moodHistory.slice(-14);
    }
  }

  /**
   * Parse configuration from JSON
   */
  parseConfiguration(json) {
    try {
      const config = JSON.parse(json);
      const errors = [];

      const validLangs = ['en', 'es', 'it', 'pt', 'fr', 'de'];
      if (config.language && !validLangs.includes(config.language)) {
        errors.push('Invalid language');
      }

      const validColors = ['white', 'black', 'pink', 'blue', 'green', 'yellow',
                          'purple', 'orange', 'cyan', 'peach', 'lime', 'lavender'];
      if (config.colorPreset && !validColors.includes(config.colorPreset)) {
        errors.push('Invalid colorPreset');
      }

      if (config.alarm && config.alarm.time && !/^\d{2}:\d{2}$/.test(config.alarm.time)) {
        errors.push('Invalid alarm time format: must be HH:MM');
      }

      if (config.reminders && !Array.isArray(config.reminders)) {
        errors.push('Invalid reminders: must be an array');
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join(', '),
          config: this.getDefaultConfiguration()
        };
      }

      return {
        success: true,
        config: {
          language: config.language || 'en',
          colorPreset: config.colorPreset || 'pink',
          alarm: config.alarm || null,
          reminders: config.reminders || [],
          webLLMEnabled: config.webLLMEnabled || false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `JSON parse error: ${error.message}`,
        config: this.getDefaultConfiguration()
      };
    }
  }

  formatConfiguration(config) {
    const formatted = {
      language: config.language || 'en',
      colorPreset: config.colorPreset || 'pink',
      alarm: config.alarm || null,
      reminders: config.reminders || [],
      webLLMEnabled: config.webLLMEnabled || false
    };
    return JSON.stringify(formatted, null, 2);
  }

  getDefaultConfiguration() {
    return {
      language: 'en',
      colorPreset: 'pink',
      alarm: null,
      reminders: [],
      webLLMEnabled: false
    };
  }
}
