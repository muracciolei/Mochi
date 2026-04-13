/**
 * 🍡 Mochi — AI Virtual Pet + Lightweight Assistant
 * Main application entry point — wires all modules together
 */

import './ui/styles.css';
import { StateManager } from './state/StateManager.js';
import { EmotionalSystem } from './state/EmotionalSystem.js';
import { DailyRoutineSystem } from './state/DailyRoutineSystem.js';
import { AlarmSystem } from './state/AlarmSystem.js';
import { ReminderSystem } from './state/ReminderSystem.js';
import { AnimationEngine } from './animations/AnimationEngine.js';
import { VoiceSystem } from './voice/VoiceSystem.js';
import { ToolSystem } from './apis/ToolSystem.js';
import { I18nModule } from './i18n/I18nModule.js';
import { WebLLMModule } from './llm/WebLLMModule.js';
import { MiniGame } from './games/MiniGame.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { ActionHandler } from './ui/ActionHandler.js';
import { ColorSystem } from './ui/ColorSystem.js';

class MochiApp {
  constructor() {
    /** @type {StateManager} */
    this.state = null;
    /** @type {I18nModule} */
    this.i18n = null;
    /** @type {EmotionalSystem} */
    this.emotional = null;
    /** @type {DailyRoutineSystem} */
    this.dailyRoutine = null;
    /** @type {AlarmSystem} */
    this.alarm = null;
    /** @type {ReminderSystem} */
    this.reminder = null;
    /** @type {AnimationEngine} */
    this.animation = null;
    /** @type {VoiceSystem} */
    this.voice = null;
    /** @type {ToolSystem} */
    this.tools = null;
    /** @type {WebLLMModule} */
    this.webLLM = null;
    /** @type {MiniGame} */
    this.miniGame = null;
    /** @type {AudioSystem} */
    this.audio = null;
    /** @type {ActionHandler} */
    this.actions = null;
    /** @type {ColorSystem} */
    this.colors = null;

    this.updateTimer = null;
    this.routineTimer = null;
    this.isGameActive = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('🍡 Mochi initializing...');

    // 1. Core state & i18n
    this.state = new StateManager();
    this.state.loadState();

    this.i18n = new I18nModule();
    // Sync language from state
    const savedLang = this.state.getState('language');
    if (savedLang) this.i18n.setLanguage(savedLang);
    else this.state.updateState('language', this.i18n.getCurrentLanguage());

    // 2. Color system
    this.colors = new ColorSystem(this.state);
    this.colors.applyColorToDOM();

    // 3. Emotional system
    this.emotional = new EmotionalSystem(this.state, this.i18n);
    this.emotional.applyPassiveDecay();

    // 4. Audio
    this.audio = new AudioSystem();

    // 5. Voice
    this.voice = new VoiceSystem(this.i18n);

    // 6. Daily routine
    this.dailyRoutine = new DailyRoutineSystem(this.state, this.emotional);

    // 7. Alarm & Reminder
    this.alarm = new AlarmSystem(this.state, this.voice, this.audio, this.i18n);
    this.reminder = new ReminderSystem(this.state, this.voice, this.audio);

    // 8. Tools
    this.tools = new ToolSystem(this.i18n);

    // 9. WebLLM (lazy loaded)
    this.webLLM = await WebLLMModule.load();

    // 10. Mini Game
    this.miniGame = new MiniGame(this.emotional);

    // 11. Animation Engine
    const container = document.getElementById('mochi-container');
    this.animation = new AnimationEngine(container, this.colors);
    this.animation.init();

    // 12. Action Handler
    this.actions = new ActionHandler(
      this.emotional,
      this.animation,
      this.voice,
      this.tools,
      this.webLLM,
      this.miniGame,
      this.audio
    );

    // Wire up event listeners
    this.bindEvents();

    // Wire emotional change listener
    this.emotional.addListener((event) => this.onEmotionalChange(event));

    // Initial render
    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();
    this.updateUI();

    // Start periodic systems
    this.alarm.start();
    this.reminder.start();
    this.startPeriodicUpdate();

    // Init audio on first interaction
    this.initAudioOnInteraction();

    // Check support notification
    this.checkSupportNotification();

    // Register service worker
    this.registerServiceWorker();

    // Build settings UI
    this.buildColorSelector();
    this.buildRemindersList();
    this.updateAlarmStatus();

    // Show greeting
    this.showGreeting();

    console.log('🍡 Mochi ready!');
  }

  // ─── Event Binding ───

  bindEvents() {
    // Action buttons
    document.getElementById('feed-btn').addEventListener('click', () => this.onFeed());
    document.getElementById('play-btn').addEventListener('click', () => this.onPlay());
    document.getElementById('talk-btn').addEventListener('click', () => this.onTalk());
    document.getElementById('sleep-btn').addEventListener('click', () => this.onSleep());

    // Mochi touch
    document.getElementById('mochi-touch-zone').addEventListener('click', () => this.onMochiTap());

    // Settings
    document.getElementById('settings-toggle').addEventListener('click', () => this.openSettings());
    document.getElementById('settings-close').addEventListener('click', () => this.closeSettings());

    // Language
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
    });

    // Alarm
    document.getElementById('alarm-set-btn').addEventListener('click', () => this.setAlarm());
    document.getElementById('alarm-cancel-btn').addEventListener('click', () => this.cancelAlarm());

    // Reminder
    document.getElementById('reminder-add-btn').addEventListener('click', () => this.addReminder());

    // Support toast dismiss
    document.getElementById('support-toast-close').addEventListener('click', () => {
      document.getElementById('support-toast').classList.add('hidden');
    });

    // Keyboard support for Mochi touch
    document.getElementById('mochi-touch-zone').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.onMochiTap();
      }
    });
  }

  // ─── Actions ───

  async onFeed() {
    this.disableButtons();
    // Use language-specific responses via i18n
    const feedR = this.i18n.getDialogue('feed');
    this.showSpeechBubble(feedR);
    this.spawnParticles('food');

    try {
      // Record daily interaction
      const hour = new Date().getHours();
      if (hour >= 6 && hour <= 9) this.dailyRoutine.recordInteraction('breakfast');
      else if (hour >= 11 && hour <= 14) this.dailyRoutine.recordInteraction('lunch');
      else if (hour >= 18 && hour <= 21) this.dailyRoutine.recordInteraction('dinner');

      await this.actions.handleFeed();
    } catch (e) {
      console.error('Feed error:', e);
    }

    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();
    this.enableButtons();
  }

  async onPlay() {
    this.isGameActive = true;
    this.disableButtons();
    this.hideSpeechBubble();

    try {
      // Wrap mini game to restore UI when done
      const origEnd = this.miniGame.end.bind(this.miniGame);
      this.miniGame.end = () => {
        origEnd();
        setTimeout(() => {
          this.isGameActive = false;
          this.animation.init();
          this.renderMochi();
          this.updateStatusBars();
          this.updateEmotionIndicator();
          this.enableButtons();
        }, 3200);
      };

      await this.actions.handlePlay();
    } catch (e) {
      console.error('Play error:', e);
      this.isGameActive = false;
      this.enableButtons();
    }
  }

  async onTalk() {
    this.disableButtons();
    const indicator = document.getElementById('listening-indicator');
    indicator.classList.remove('hidden');

    try {
      await this.actions.handleTalk();
    } catch (e) {
      console.error('Talk error:', e);
      this.showSpeechBubble(this.i18n.t('dialogue.happy'));
    }

    indicator.classList.add('hidden');
    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();
    this.enableButtons();
  }

  async onSleep() {
    this.disableButtons();
    const sleepR = this.i18n.getDialogue('sleep');
    this.showSpeechBubble(sleepR);
    this.spawnParticles('zzz');

    try {
      await this.actions.handleSleep();
    } catch (e) {
      console.error('Sleep error:', e);
    }

    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();

    // Keep buttons disabled briefly for sleep effect
    setTimeout(() => this.enableButtons(), 2000);
  }

  onMochiTap() {
    if (this.isGameActive) return;

    this.emotional.adjustMood(3);
    this.state.updateState('lastInteraction', Date.now());

    // Tap sound
    if (this.audio && this.audio.isAvailable()) {
      this.audio.play('tap');
    }

    // Bounce animation
    const svg = document.getElementById('mochi-svg');
    if (svg) {
      svg.classList.remove('mochi-bounce');
      void svg.offsetWidth; // trigger reflow
      svg.classList.add('mochi-bounce');
      setTimeout(() => svg.classList.remove('mochi-bounce'), 500);
    }

    this.spawnParticles('heart');
    this.updateStatusBars();

    // Tap responses - use friendly/celebration from i18n
    const tapR = this.i18n.t('dialogue.happy');
    this.showSpeechBubble(tapR);
  }

  // ─── Rendering ───

  renderMochi() {
    if (this.isGameActive) return;
    const emotion = this.state.getState('emotion');
    const colorPreset = this.state.getState('colorPreset');
    this.animation.updateExpression(emotion);
    this.animation.render({ emotion }, colorPreset);

    // Apply idle animation
    const svg = document.getElementById('mochi-svg');
    if (svg) {
      svg.classList.remove('mochi-idle', 'mochi-sleeping');
      if (emotion === 'sleepy') svg.classList.add('mochi-sleeping');
      else svg.classList.add('mochi-idle');
    }
  }

  updateStatusBars() {
    const mood = this.state.getState('mood');
    const hunger = this.state.getState('hunger');
    const energy = this.state.getState('energy');

    // Mood: range is -100 to 100, normalize to 0-100
    const moodPercent = Math.round(((mood + 100) / 200) * 100);
    document.getElementById('mood-bar').style.width = `${moodPercent}%`;
    document.getElementById('mood-label').textContent = Math.round(mood);

    // Food: 100 = full, 0 = empty (invert hunger)
    const foodPercent = Math.max(0, 100 - Math.round(hunger));
    document.getElementById('hunger-bar').style.width = `${foodPercent}%`;
    document.getElementById('hunger-label').textContent = foodPercent;

    // Energy: 0-100
    document.getElementById('energy-bar').style.width = `${Math.round(energy)}%`;
    document.getElementById('energy-label').textContent = Math.round(energy);
  }

  updateEmotionIndicator() {
    const emotion = this.state.getState('emotion');
    const emojiMap = {
      happy: '😊',
      hungry: '🥺',
      sleepy: '😴',
      angry: '😤',
      playing: '🤩'
    };
    const nameMap = {
      happy: 'Happy',
      hungry: 'Hungry',
      sleepy: 'Sleepy',
      angry: 'Angry',
      playing: 'Playing'
    };
    document.getElementById('emotion-emoji').textContent = emojiMap[emotion] || '😊';
    document.getElementById('emotion-text').textContent = nameMap[emotion] || 'Happy';
  }

  // ─── Speech Bubble ───

  showSpeechBubble(text) {
    const bubble = document.getElementById('speech-bubble');
    const textEl = document.getElementById('speech-text');
    textEl.textContent = text;
    bubble.classList.remove('hidden');
    clearTimeout(this._bubbleTimer);
    this._bubbleTimer = setTimeout(() => this.hideSpeechBubble(), 4000);
  }

  hideSpeechBubble() {
    document.getElementById('speech-bubble').classList.add('hidden');
  }

  // ─── Particles ───

  spawnParticles(type) {
    const container = document.getElementById('mochi-container');
    const symbols = {
      heart: ['❤️', '💕', '💖', '✨'],
      food: ['🍡', '🍙', '🍰', '🍩'],
      zzz: ['💤', 'z', 'Z']
    };
    const items = symbols[type] || symbols.heart;

    for (let i = 0; i < 4; i++) {
      const el = document.createElement('span');
      el.className = type === 'zzz' ? 'zzz-particle' : type === 'food' ? 'food-particle' : 'heart-particle';
      el.textContent = items[Math.floor(Math.random() * items.length)];
      el.style.left = `${30 + Math.random() * 40}%`;
      el.style.top = `${20 + Math.random() * 30}%`;
      el.style.animationDelay = `${i * 0.2}s`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }

  // ─── Emotional Change Handler ───

  onEmotionalChange(event) {
    if (event.type === 'emotion_change') {
      this.renderMochi();
      this.updateEmotionIndicator();
      const dialogue = this.i18n.t(`dialogue.${event.emotion}`);
      this.showSpeechBubble(dialogue);
    }
  }

  // ─── Periodic Updates ───

  startPeriodicUpdate() {
    // Update every 5 minutes
    this.updateTimer = setInterval(() => {
      if (!this.isGameActive) {
        this.emotional.applyPassiveDecay();
        this.state.updateState('lastInteraction', this.state.getState('lastInteraction')); // keep stamp
        this.renderMochi();
        this.updateStatusBars();
        this.updateEmotionIndicator();
      }
    }, 5 * 60 * 1000);

    // Check daily routine every 30 mins
    this.routineTimer = setInterval(() => {
      this.dailyRoutine.evaluateMissedInteractions();
    }, 30 * 60 * 1000);
  }

  // ─── UI Helpers ───

  disableButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
    });
  }

  enableButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }

  updateUI() {
    // Set active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.i18n.getCurrentLanguage());
    });

    // Localize button labels
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.i18n.t(key);
    });
  }

  // ─── Settings ───

  openSettings() {
    document.getElementById('settings-panel').classList.remove('hidden');
    this.buildRemindersList();
    this.updateAlarmStatus();
  }

  closeSettings() {
    document.getElementById('settings-panel').classList.add('hidden');
  }

  buildColorSelector() {
    const grid = document.getElementById('color-selector');
    grid.innerHTML = '';
    const currentColor = this.colors.getCurrentColor();

    this.colors.getAvailableColors().forEach(color => {
      const swatch = document.createElement('button');
      swatch.className = `color-swatch ${color === currentColor ? 'active' : ''}`;
      swatch.style.background = this.colors.getPalette(color).primary;
      swatch.setAttribute('aria-label', color);
      swatch.title = color.charAt(0).toUpperCase() + color.slice(1);
      swatch.addEventListener('click', () => {
        this.colors.setColor(color);
        this.renderMochi();
        // Update active state
        grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
      grid.appendChild(swatch);
    });
  }

  setLanguage(lang) {
    this.i18n.setLanguage(lang);
    this.state.updateState('language', lang);
    this.voice.updateLanguage();
    this.updateUI();
  }

  setAlarm() {
    const timeInput = document.getElementById('alarm-time-input');
    if (timeInput.value) {
      this.alarm.setAlarm(timeInput.value);
      this.updateAlarmStatus();
    }
  }

  cancelAlarm() {
    this.alarm.cancelAlarm();
    this.updateAlarmStatus();
  }

  updateAlarmStatus() {
    const alarm = this.state.getState('alarm');
    const statusEl = document.getElementById('alarm-status');
    if (alarm && alarm.enabled) {
      statusEl.textContent = `⏰ ${alarm.time}`;
    } else {
      statusEl.textContent = '';
    }
  }

  addReminder() {
    const textInput = document.getElementById('reminder-text-input');
    const timeInput = document.getElementById('reminder-time-input');

    if (textInput.value && timeInput.value) {
      this.reminder.createReminder(textInput.value, new Date(timeInput.value));
      textInput.value = '';
      timeInput.value = '';
      this.buildRemindersList();
    }
  }

  buildRemindersList() {
    const list = document.getElementById('reminders-list');
    list.innerHTML = '';

    const reminders = this.reminder.getReminders();
    reminders.forEach(r => {
      const li = document.createElement('li');
      li.className = 'reminder-item';

      const text = document.createElement('span');
      text.className = 'reminder-text';
      text.textContent = r.text;

      const time = document.createElement('span');
      time.className = 'reminder-time';
      time.textContent = new Date(r.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      const del = document.createElement('button');
      del.className = 'reminder-delete';
      del.textContent = '✕';
      del.setAttribute('aria-label', `Delete reminder: ${r.text}`);
      del.addEventListener('click', () => {
        this.reminder.deleteReminder(r.id);
        this.buildRemindersList();
      });

      li.appendChild(text);
      li.appendChild(time);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  // ─── Audio Init ───

  initAudioOnInteraction() {
    const initAudio = async () => {
      try {
        await this.audio.init();
      } catch (e) {
        console.warn('Audio init failed:', e);
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
  }

  // ─── Support Notification (3rd Day) ───

  checkSupportNotification() {
    const shown = this.state.getState('supportNotificationShown');
    if (shown) return;

    const firstInstall = this.state.getState('firstInstall');
    const daysSinceInstall = (Date.now() - firstInstall) / (1000 * 60 * 60 * 24);

    if (daysSinceInstall >= 3) {
      // Show toast
      const toast = document.getElementById('support-toast');
      const toastText = document.getElementById('support-toast-text');
      toastText.textContent = this.i18n.t('notification.support');
      toast.classList.remove('hidden');

      // Mark as shown
      this.state.updateState('supportNotificationShown', true);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 10000);
    }
  }

  // ─── Greeting ───

  showGreeting() {
    const hour = new Date().getHours();
    let greetingKey;
    if (hour < 12) greetingKey = 'alarm.greeting.morning';
    else if (hour < 18) greetingKey = 'alarm.greeting.afternoon';
    else greetingKey = 'alarm.greeting.evening';

    const greeting = this.i18n.t(greetingKey);
    this.showSpeechBubble(greeting);
  }

  // ─── Service Worker ───

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('SW registered:', registration.scope);
      } catch (error) {
        console.warn('SW registration failed:', error);
      }
    }
  }
}

// ─── Bootstrap ───
const app = new MochiApp();
app.init().catch(err => console.error('Mochi init failed:', err));
