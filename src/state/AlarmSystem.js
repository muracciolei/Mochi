/**
 * AlarmSystem - Manages daily alarms
 */

export class AlarmSystem {
  constructor(stateManager, voiceSystem, audioSystem, i18nModule) {
    this.stateManager = stateManager;
    this.voiceSystem = voiceSystem;
    this.audioSystem = audioSystem;
    this.i18n = i18nModule;
    this.checkInterval = null;
  }

  /**
   * Start checking for alarms
   */
  start() {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkAlarm();
    }, 60000);
    
    // Check immediately
    this.checkAlarm();
  }

  /**
   * Stop checking for alarms
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Set daily alarm
   * @param {string} time - Time in HH:MM format
   */
  setAlarm(time) {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      console.error('Invalid alarm time format');
      return;
    }
    
    this.stateManager.updateState('alarm', {
      enabled: true,
      time
    });
  }

  /**
   * Cancel alarm
   */
  cancelAlarm() {
    this.stateManager.updateState('alarm', null);
  }

  /**
   * Check if alarm should trigger
   */
  checkAlarm() {
    const alarm = this.stateManager.getState('alarm');
    
    if (!alarm || !alarm.enabled) {
      return;
    }
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (currentTime === alarm.time) {
      this.triggerAlarm();
    }
  }

  /**
   * Trigger alarm
   */
  async triggerAlarm() {
    const now = new Date();
    const dayName = this.i18n.getDayName(now);
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const greeting = this.getGreeting(now.getHours());
    
    const message = `${dayName}, ${time}, ${greeting}`;
    
    // Play alarm sound
    if (this.audioSystem.isAvailable()) {
      this.audioSystem.play('alarm');
    }
    
    // Speak alarm message
    await this.voiceSystem.speakWithFallback(message, 'happy');
  }

  /**
   * Get greeting based on time of day
   * @param {number} hour - Hour of day (0-23)
   * @returns {string} Greeting message
   */
  getGreeting(hour) {
    if (hour < 12) {
      return this.i18n.t('alarm.greeting.morning');
    } else if (hour < 18) {
      return this.i18n.t('alarm.greeting.afternoon');
    } else {
      return this.i18n.t('alarm.greeting.evening');
    }
  }
}
