/**
 * ReminderSystem - Manages user reminders
 */

export class ReminderSystem {
  constructor(stateManager, voiceSystem, audioSystem) {
    this.stateManager = stateManager;
    this.voiceSystem = voiceSystem;
    this.audioSystem = audioSystem;
    this.checkInterval = null;
  }

  /**
   * Start checking for reminders
   */
  start() {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000);
    
    // Check immediately
    this.checkReminders();
  }

  /**
   * Stop checking for reminders
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Create reminder
   * @param {string} text - Reminder text
   * @param {Date} time - Reminder time
   * @returns {string} Reminder ID
   */
  createReminder(text, time) {
    if (!text || text.trim().length === 0) {
      console.error('Reminder text cannot be empty');
      return null;
    }
    
    const id = this.generateId();
    const reminder = {
      id,
      text: text.trim(),
      time: time.getTime(),
      created: Date.now()
    };
    
    const reminders = this.stateManager.getState('reminders') || [];
    reminders.push(reminder);
    this.stateManager.updateState('reminders', reminders);
    
    return id;
  }

  /**
   * Delete reminder
   * @param {string} id - Reminder ID
   */
  deleteReminder(id) {
    const reminders = this.stateManager.getState('reminders') || [];
    const filtered = reminders.filter(r => r.id !== id);
    this.stateManager.updateState('reminders', filtered);
  }

  /**
   * Get all active reminders
   * @returns {Array} Array of reminders
   */
  getReminders() {
    return this.stateManager.getState('reminders') || [];
  }

  /**
   * Check if any reminders should trigger
   */
  checkReminders() {
    const reminders = this.getReminders();
    const now = Date.now();
    
    reminders.forEach(reminder => {
      // Check if reminder time has passed (within 1 minute window)
      if (reminder.time <= now && reminder.time > (now - 60000)) {
        this.triggerReminder(reminder);
      }
    });
  }

  /**
   * Trigger reminder
   * @param {Object} reminder - Reminder object
   */
  async triggerReminder(reminder) {
    // Play notification sound
    if (this.audioSystem.isAvailable()) {
      this.audioSystem.play('notification');
    }
    
    // Speak reminder text
    await this.voiceSystem.speakWithFallback(reminder.text, 'happy');
    
    // Remove reminder after triggering
    this.deleteReminder(reminder.id);
  }

  /**
   * Generate unique ID
   * @returns {string} UUID
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
