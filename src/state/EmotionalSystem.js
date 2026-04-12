/**
 * EmotionalSystem - Manages Mochi's emotional states and mood levels
 */

export class EmotionalSystem {
  constructor(stateManager, i18nModule) {
    this.stateManager = stateManager;
    this.i18n = i18nModule;
    this.listeners = [];
  }

  /**
   * Get current emotional state
   * @returns {Object} Current emotional state
   */
  getCurrentState() {
    return {
      emotion: this.stateManager.getState('emotion'),
      mood: this.stateManager.getState('mood'),
      hunger: this.stateManager.getState('hunger'),
      energy: this.stateManager.getState('energy')
    };
  }

  /**
   * Transition to new emotional state
   * @param {string} emotion - New emotion
   * @param {string} reason - Reason for transition
   */
  transitionTo(emotion, reason = '') {
    const validEmotions = ['happy', 'hungry', 'sleepy', 'angry', 'playing'];
    if (!validEmotions.includes(emotion)) {
      console.warn(`Invalid emotion: ${emotion}`);
      return;
    }

    this.stateManager.updateState('emotion', emotion);
    
    // Notify listeners (for animation and dialogue updates)
    this.notifyListeners({
      type: 'emotion_change',
      emotion,
      reason
    });
  }

  /**
   * Adjust mood level
   * @param {number} delta - Change in mood (-100 to 100)
   */
  adjustMood(delta) {
    const currentMood = this.stateManager.getState('mood');
    const newMood = Math.max(-100, Math.min(100, currentMood + delta));
    this.stateManager.updateState('mood', newMood);
    
    // Check for automatic emotion transitions
    this.evaluateEmotionalState();
  }

  /**
   * Adjust hunger level
   * @param {number} delta - Change in hunger (0 to 100)
   */
  adjustHunger(delta) {
    const currentHunger = this.stateManager.getState('hunger');
    const newHunger = Math.max(0, Math.min(100, currentHunger + delta));
    this.stateManager.updateState('hunger', newHunger);
    
    // Check for automatic emotion transitions
    this.evaluateEmotionalState();
  }

  /**
   * Adjust energy level
   * @param {number} delta - Change in energy (0 to 100)
   */
  adjustEnergy(delta) {
    const currentEnergy = this.stateManager.getState('energy');
    const newEnergy = Math.max(0, Math.min(100, currentEnergy + delta));
    this.stateManager.updateState('energy', newEnergy);
    
    // Check for automatic emotion transitions
    this.evaluateEmotionalState();
  }

  /**
   * Evaluate emotional state based on levels
   */
  evaluateEmotionalState() {
    const state = this.getCurrentState();
    
    // Priority order: Hungry > Sleepy > Angry > Happy
    if (state.hunger > 70) {
      if (state.emotion !== 'hungry' && state.emotion !== 'playing') {
        this.transitionTo('hungry', 'hunger level high');
      }
    } else if (state.energy < 20) {
      if (state.emotion !== 'sleepy' && state.emotion !== 'playing') {
        this.transitionTo('sleepy', 'energy level low');
      }
    } else if (state.mood < -30) {
      if (state.emotion !== 'angry' && state.emotion !== 'playing') {
        this.transitionTo('angry', 'mood level low');
      }
    } else if (state.mood > 50 && state.hunger < 50 && state.energy > 30) {
      if (state.emotion !== 'happy' && state.emotion !== 'playing') {
        this.transitionTo('happy', 'all levels good');
      }
    }
  }

  /**
   * Get dialogue response for current emotion
   * @param {string} context - Context for dialogue
   * @returns {string} Dialogue text
   */
  getDialogue(context = 'default') {
    const emotion = this.stateManager.getState('emotion');
    return this.i18n.t(`dialogue.${emotion}`);
  }

  /**
   * Add listener for emotional state changes
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners
   * @param {Object} event - Event object
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Passive decay over time (hunger increases, energy decreases)
   */
  applyPassiveDecay() {
    const lastInteraction = this.stateManager.getState('lastInteraction');
    const now = Date.now();
    const hoursSinceLastInteraction = (now - lastInteraction) / (1000 * 60 * 60);
    
    // Hunger increases by 5 per hour
    this.adjustHunger(hoursSinceLastInteraction * 5);
    
    // Energy decreases by 3 per hour
    this.adjustEnergy(-hoursSinceLastInteraction * 3);
    
    // Mood decreases slightly by 2 per hour
    this.adjustMood(-hoursSinceLastInteraction * 2);
  }
}
