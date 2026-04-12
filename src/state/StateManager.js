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
  language: 'en',
  colorPreset: 'pink',
  alarm: null,
  reminders: [],
  firstInstall: Date.now(),
  supportNotificationShown: false,
  webLLMEnabled: false,
  webLLMLoaded: false
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
        this.state = { ...DEFAULT_STATE };
        return this.state;
      }

      const parsed = JSON.parse(stored);
      this.state = this.validateState(parsed);
      return this.state;
    } catch (error) {
      console.error('Failed to load state:', error);
      this.state = { ...DEFAULT_STATE };
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
        // Handle quota exceeded
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
   * @param {string} key - State property key
   * @param {*} value - New value
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
   * @param {string} key - State property key
   * @returns {*} State value
   */
  getState(key) {
    if (this.state === null) {
      this.loadState();
    }
    return this.state[key];
  }

  /**
   * Clear all state (reset app)
   */
  clearState() {
    this.state = { ...DEFAULT_STATE };
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Validate loaded state against schema
   * @param {Object} state - State to validate
   * @returns {Object} Validated state with defaults for missing properties
   */
  validateState(state) {
    const validated = { ...DEFAULT_STATE };
    
    // Validate and copy each property
    if (typeof state.emotion === 'string') validated.emotion = state.emotion;
    if (typeof state.mood === 'number') validated.mood = state.mood;
    if (typeof state.hunger === 'number') validated.hunger = state.hunger;
    if (typeof state.energy === 'number') validated.energy = state.energy;
    if (typeof state.lastInteraction === 'number') validated.lastInteraction = state.lastInteraction;
    if (typeof state.dailyInteractions === 'object') validated.dailyInteractions = state.dailyInteractions;
    if (typeof state.language === 'string') validated.language = state.language;
    if (typeof state.colorPreset === 'string') validated.colorPreset = state.colorPreset;
    if (state.alarm !== undefined) validated.alarm = state.alarm;
    if (Array.isArray(state.reminders)) validated.reminders = state.reminders;
    if (typeof state.firstInstall === 'number') validated.firstInstall = state.firstInstall;
    if (typeof state.supportNotificationShown === 'boolean') validated.supportNotificationShown = state.supportNotificationShown;
    if (typeof state.webLLMEnabled === 'boolean') validated.webLLMEnabled = state.webLLMEnabled;
    if (typeof state.webLLMLoaded === 'boolean') validated.webLLMLoaded = state.webLLMLoaded;

    return validated;
  }

  /**
   * Clear old data to free up storage space
   */
  clearOldData() {
    // Clear old reminders (older than 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (this.state && Array.isArray(this.state.reminders)) {
      this.state.reminders = this.state.reminders.filter(r => r.time > sevenDaysAgo);
    }
  }

  /**
   * Parse configuration from JSON
   * @param {string} json - JSON string to parse
   * @returns {Object} Result object with success/error
   */
  parseConfiguration(json) {
    try {
      const config = JSON.parse(json);
      
      // Validate configuration structure
      const errors = [];
      
      if (config.language && !['en', 'es', 'it'].includes(config.language)) {
        errors.push('Invalid language: must be en, es, or it');
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

  /**
   * Format configuration to JSON
   * @param {Object} config - Configuration object
   * @returns {string} JSON string
   */
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

  /**
   * Get default configuration
   * @returns {Object} Default configuration
   */
  getDefaultConfiguration() {
    return {
      language: 'en',
colorPreset: 'black',
      alarm: null,
      reminders: [],
      webLLMEnabled: false
    };
  }
}
