/**
 * DailyRoutineSystem - Tracks expected daily interactions and adjusts mood
 */

const EXPECTED_INTERACTIONS = {
  breakfast: { start: 6, end: 9, name: 'breakfast' },
  lunch: { start: 11, end: 14, name: 'lunch' },
  returnHome: { start: 16, end: 18, name: 'returnHome' },
  dinner: { start: 18, end: 21, name: 'dinner' }
};

export class DailyRoutineSystem {
  constructor(stateManager, emotionalSystem) {
    this.stateManager = stateManager;
    this.emotionalSystem = emotionalSystem;
  }

  /**
   * Evaluate missed interactions
   */
  evaluateMissedInteractions() {
    const now = new Date();
    const currentHour = now.getHours();
    const dailyInteractions = this.stateManager.getState('dailyInteractions');
    
    Object.keys(EXPECTED_INTERACTIONS).forEach(key => {
      const interaction = EXPECTED_INTERACTIONS[key];
      const lastCompleted = dailyInteractions[key];
      
      // Check if we're past the time window
      if (currentHour > interaction.end) {
        // Check if interaction was completed today
        if (!lastCompleted || !this.isToday(lastCompleted)) {
          // Missed interaction - decrease mood
          this.emotionalSystem.adjustMood(-10);
          console.log(`Missed interaction: ${key}`);
        }
      }
    });
    
    // Reset daily interactions if it's a new day
    if (dailyInteractions.breakfast && !this.isToday(dailyInteractions.breakfast)) {
      this.resetDailyInteractions();
    }
  }

  /**
   * Record interaction completion
   * @param {string} interactionType - Type of interaction
   */
  recordInteraction(interactionType) {
    if (!EXPECTED_INTERACTIONS[interactionType]) {
      console.warn(`Unknown interaction type: ${interactionType}`);
      return;
    }
    
    const now = Date.now();
    const dailyInteractions = this.stateManager.getState('dailyInteractions');
    
    // Check if already completed today
    if (dailyInteractions[interactionType] && this.isToday(dailyInteractions[interactionType])) {
      console.log(`Interaction ${interactionType} already completed today`);
      return;
    }
    
    // Record completion
    dailyInteractions[interactionType] = now;
    this.stateManager.updateState('dailyInteractions', dailyInteractions);
    
    // Increase mood
    this.emotionalSystem.adjustMood(15);
    console.log(`Completed interaction: ${interactionType}`);
  }

  /**
   * Get next expected interaction
   * @returns {Object|null} Next expected interaction or null
   */
  getNextExpectedInteraction() {
    const now = new Date();
    const currentHour = now.getHours();
    const dailyInteractions = this.stateManager.getState('dailyInteractions');
    
    // Find next interaction in time order
    const interactions = Object.keys(EXPECTED_INTERACTIONS).map(key => ({
      key,
      ...EXPECTED_INTERACTIONS[key],
      completed: dailyInteractions[key] && this.isToday(dailyInteractions[key])
    }));
    
    // Sort by start time
    interactions.sort((a, b) => a.start - b.start);
    
    // Find first incomplete interaction that hasn't passed
    for (const interaction of interactions) {
      if (!interaction.completed && currentHour < interaction.end) {
        return {
          type: interaction.key,
          name: interaction.name,
          startHour: interaction.start,
          endHour: interaction.end,
          isActive: currentHour >= interaction.start
        };
      }
    }
    
    return null;
  }

  /**
   * Check if timestamp is today
   * @param {number} timestamp - Unix timestamp
   * @returns {boolean} True if today
   */
  isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Reset daily interactions for new day
   */
  resetDailyInteractions() {
    this.stateManager.updateState('dailyInteractions', {
      breakfast: null,
      lunch: null,
      returnHome: null,
      dinner: null
    });
  }

  /**
   * Check if in interaction time window
   * @param {string} interactionType - Type of interaction
   * @returns {boolean} True if in time window
   */
  isInTimeWindow(interactionType) {
    const interaction = EXPECTED_INTERACTIONS[interactionType];
    if (!interaction) return false;
    
    const currentHour = new Date().getHours();
    return currentHour >= interaction.start && currentHour <= interaction.end;
  }
}
