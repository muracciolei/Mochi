/**
 * 🍡 Mochi — AI Virtual Pet + Lightweight Assistant
 * Main application entry point — wires all modules together
 */

import { StateManager } from './state/StateManager.js';
import { EmotionalSystem } from './state/EmotionalSystem.js';
import { DailyRoutineSystem } from './state/DailyRoutineSystem.js';
import { AlarmSystem } from './state/AlarmSystem.js';
import { ReminderSystem } from './state/ReminderSystem.js';
import { IdentitySystem } from './state/IdentitySystem.js';
import { EvolutionSystem } from './state/EvolutionSystem.js';
import { PersonalitySystem } from './state/PersonalitySystem.js';
import { StreakSystem } from './state/StreakSystem.js';
import { MemorySystem } from './state/MemorySystem.js';
import { EasterEggSystem } from './state/EasterEggSystem.js';
import { AnimationEngine } from './animations/AnimationEngine.js';
import { VoiceSystem } from './voice/VoiceSystem.js';
import { ToolSystem } from './apis/ToolSystem.js';
import { I18nModule } from './i18n/I18nModule.js';
import { WebLLMModule } from './llm/WebLLMModule.js';
import { MiniGame } from './games/MiniGame.js';
import { AudioSystem } from './audio/AudioSystem.js';
import { ActionHandler } from './ui/ActionHandler.js';
import { ColorSystem } from './ui/ColorSystem.js';
import { ShareCardSystem } from './share/ShareCardSystem.js';
import { ARSystem } from './ar/ARSystem.js';

class MochiApp {
  constructor() {
    this.state = null;
    this.i18n = null;
    this.emotional = null;
    this.dailyRoutine = null;
    this.alarm = null;
    this.reminder = null;
    this.animation = null;
    this.voice = null;
    this.tools = null;
    this.webLLM = null;
    this.miniGame = null;
    this.audio = null;
    this.actions = null;
    this.colors = null;

    this.identity = null;
    this.evolution = null;
    this.personality = null;
    this.streak = null;
    this.memory = null;
    this.shareCard = null;
    this.easterEggs = null;
    this.ar = null;

    this.updateTimer = null;
    this.routineTimer = null;
    this.rainbowTimer = null;
    this.isGameActive = false;
  }

  async init() {
    console.log('🍡 Mochi initializing...');

    // 1. Core state & i18n
    this.state = new StateManager();
    this.state.loadState();

    this.i18n = new I18nModule();
    const savedLang = this.state.getState('language');
    if (savedLang) this.i18n.setLanguage(savedLang);
    else this.state.updateState('language', this.i18n.getCurrentLanguage());

    // 2. Color system
    this.colors = new ColorSystem(this.state);
    this.colors.applyColorToDOM();

    // 3. Identity / Evolution / Personality / Streak / Memory
    this.identity = new IdentitySystem(this.state);
    this.evolution = new EvolutionSystem(this.state, this.identity);
    this.personality = new PersonalitySystem(this.state);
    this.streak = new StreakSystem(this.state);
    this.memory = new MemorySystem(this.state);

    // 4. Easter eggs
    this.easterEggs = new EasterEggSystem(this.state, this.i18n, (eggId) => this.onEasterEgg(eggId));
    this.easterEggs.bind();

    // 5. Emotional / Audio / Voice
    this.emotional = new EmotionalSystem(this.state, this.i18n);
    this.emotional.applyPassiveDecay();
    this.audio = new AudioSystem();
    this.voice = new VoiceSystem(this.i18n);

    // 6. Daily routine / Alarm / Reminder
    this.dailyRoutine = new DailyRoutineSystem(this.state, this.emotional);
    this.alarm = new AlarmSystem(this.state, this.voice, this.audio, this.i18n);
    this.reminder = new ReminderSystem(this.state, this.voice, this.audio);

    // 7. Tools / WebLLM / MiniGame
    this.tools = new ToolSystem(this.i18n);
    this.webLLM = await WebLLMModule.load();
    this.miniGame = new MiniGame(this.emotional);

    // 8. Animation Engine
    const container = document.getElementById('mochi-container');
    this.animation = new AnimationEngine(container, this.colors);
    this.animation.init();

    // 9. Action Handler
    this.actions = new ActionHandler(
      this.emotional,
      this.animation,
      this.voice,
      this.tools,
      this.webLLM,
      this.miniGame,
      this.audio
    );

    // 10. Share Card
    this.shareCard = new ShareCardSystem(this.state, this.i18n, this.colors, this.evolution, this.personality);

    // 11. AR (camera)
    this.ar = new ARSystem({
      state: this.state,
      i18n: this.i18n,
      colorSystem: this.colors,
      evolution: this.evolution
    });

    // ─── Adopted-from-link check (?adopt=<seed>) ───
    this.handleAdoptionLink();

    // ─── Onboarding logic ───
    const isOnboarded = this.state.getState('onboarded');
    const firstInstall = this.state.getState('firstInstall');
    const isLegacyUser = !isOnboarded &&
                        firstInstall &&
                        (Date.now() - firstInstall) > 5 * 60 * 1000;

    if (isLegacyUser) {
      // Legacy user — silently auto-onboard with a generated name so we don't
      // disrupt their existing pet.
      this.identity.ensure();
      this.state.updateState('onboarded', true);
    } else if (!isOnboarded) {
      // True first-run — show onboarding flow
      this.showOnboarding();
      return;
    }

    this.startApp();
  }

  /**
   * Run after onboarding is complete (or on subsequent loads).
   */
  startApp() {
    // Make sure identity exists (for legacy users who pre-date this update)
    this.identity.ensure();

    // Apply DNA + stage to animation engine
    this.animation.setDNA(this.identity.getDNA());
    const stage = this.evolution.getStage();
    this.animation.setStage(stage.id, this.evolution.getScaleFor(stage.id));

    // Daily streak record
    const streakState = this.streak.recordVisit();
    if (streakState.isNewDay && streakState.current >= 3) {
      this.showGenericToast(this.i18n.t('notification.streak', { n: streakState.current }));
    }

    // Wire events
    this.bindEvents();

    // Wire emotional listener
    this.emotional.addListener((event) => this.onEmotionalChange(event));

    // Initial render
    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();
    this.updateUI();
    this.updateHeader();
    this.updateMetaRow();

    // Start periodic systems
    this.alarm.start();
    this.reminder.start();
    this.startPeriodicUpdate();

    // Audio init on first interaction
    this.initAudioOnInteraction();

    // Check support notification
    this.checkSupportNotification();

    // Register service worker
    this.registerServiceWorker();

    // Build settings UI
    this.buildColorSelector();
    this.buildRemindersList();
    this.buildMemoriesList();
    this.updateAlarmStatus();
    this.updateIdentityPanel();

    // Detect stage transition (capture memory if changed since last visit)
    const transition = this.evolution.detectTransition();
    if (transition) {
      const stageName = this.i18n.t(`stage.${transition}`);
      const name = this.state.getState('name') || 'Mochi';
      this.showGenericToast(this.i18n.t('notification.evolution', { name, stage: stageName }));
      this.memory.capture('memory.evolved', { stage: stageName });
    }

    // Anniversary memories
    this.memory.checkAnniversary(this.identity.getAgeDays());

    // Easter egg passive checks (full moon / birthday)
    this.easterEggs.checkPassive(this.identity);

    // Show greeting (or adoption message)
    this.showGreeting();

    console.log('🍡 Mochi ready!');
  }

  // ─── Onboarding ───

  showOnboarding() {
    const overlay = document.getElementById('onboarding');
    overlay.classList.remove('hidden');

    // Initialize language buttons inside onboarding
    overlay.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.i18n.getCurrentLanguage());
      btn.addEventListener('click', () => {
        this.i18n.setLanguage(btn.dataset.lang);
        this.state.updateState('language', btn.dataset.lang);
        overlay.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.translateAllI18n();
      });
    });

    // Localize text
    this.translateAllI18n();

    const input = document.getElementById('onb-name-input');
    input.placeholder = this.i18n.t('onb.placeholder');
    input.focus();

    document.getElementById('onb-start-btn').addEventListener('click', () => {
      const name = input.value.trim().slice(0, 20) ||
                   IdentitySystem.autoName(IdentitySystem.hash(String(Date.now())));
      this.identity.ensure(name);
      this.state.updateState('onboarded', true);
      overlay.classList.add('hidden');
      this.startApp();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('onb-start-btn').click();
      }
    });
  }

  /**
   * If URL has ?adopt=<seed>, adopt that pet (only if not already onboarded).
   */
  handleAdoptionLink() {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('adopt');
    if (!seed) return;

    if (this.state.getState('onboarded')) return; // user already has a pet

    const adopted = this.identity.adoptFrom(seed);
    if (adopted) {
      this.state.updateState('onboarded', true);
      // Show a toast on next render
      this._pendingAdoptionToast = this.i18n.t('share.adopted', { name: adopted.name });
    }

    // Clean URL so it doesn't re-trigger
    window.history.replaceState({}, '', window.location.pathname);
  }

  // ─── Event Binding ───

  bindEvents() {
    document.getElementById('feed-btn').addEventListener('click', () => this.onFeed());
    document.getElementById('play-btn').addEventListener('click', () => this.onPlay());
    document.getElementById('talk-btn').addEventListener('click', () => this.onTalk());
    document.getElementById('sleep-btn').addEventListener('click', () => this.onSleep());
    document.getElementById('mochi-touch-zone').addEventListener('click', () => this.onMochiTap());

    document.getElementById('settings-toggle').addEventListener('click', () => this.openSettings());
    document.getElementById('settings-close').addEventListener('click', () => this.closeSettings());

    // Language buttons in settings
    document.querySelectorAll('#language-selector .lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
    });

    document.getElementById('alarm-set-btn').addEventListener('click', () => this.setAlarm());
    document.getElementById('alarm-cancel-btn').addEventListener('click', () => this.cancelAlarm());

    document.getElementById('reminder-add-btn').addEventListener('click', () => this.addReminder());

    document.getElementById('support-toast-close').addEventListener('click', () => {
      document.getElementById('support-toast').classList.add('hidden');
    });

    // Share button (header + bottom)
    document.getElementById('share-button').addEventListener('click', () => this.onShare());
    document.getElementById('share-icon').addEventListener('click', () => this.onShare());

    // AR
    document.getElementById('ar-icon').addEventListener('click', () => this.onOpenAR());
    document.getElementById('ar-close').addEventListener('click', () => this.onCloseAR());
    document.getElementById('ar-flip').addEventListener('click', () => this.ar.flipCamera());
    document.getElementById('ar-capture').addEventListener('click', () => this.onARCapture());

    // Rename
    document.getElementById('rename-btn').addEventListener('click', () => this.onRename());

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
    const feedR = this.i18n.getDialogue('feed');
    this.showSpeechBubble(feedR);
    this.spawnParticles('food');
    this.state.incrementStat('feedCount');
    if (this.state.getState('stats').feedCount === 1) {
      this.memory.capture('memory.firstMeal');
    }

    try {
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
    this.updateMetaRow();
    this.enableButtons();
  }

  async onPlay() {
    this.isGameActive = true;
    this.disableButtons();
    this.hideSpeechBubble();
    this.state.incrementStat('playCount');
    this.state.incrementStat('gamesPlayed');
    if (this.state.getState('stats').gamesPlayed === 1) {
      this.memory.capture('memory.firstGame');
    }

    try {
      const origEnd = this.miniGame.end.bind(this.miniGame);
      this.miniGame.end = () => {
        const score = this.miniGame.score || 0;
        const stats = this.state.getState('stats') || {};
        if (score > (stats.highScore || 0)) {
          this.state.incrementStat('highScore', score - (stats.highScore || 0));
          this.memory.capture(`memory.highScore.${score}`, { score }, 'unique');
        }
        origEnd();
        setTimeout(() => {
          this.isGameActive = false;
          this.animation.init();
          this.animation.setDNA(this.identity.getDNA());
          const stage = this.evolution.getStage();
          this.animation.setStage(stage.id, this.evolution.getScaleFor(stage.id));
          this.renderMochi();
          this.updateStatusBars();
          this.updateEmotionIndicator();
          this.updateMetaRow();
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
    this.state.incrementStat('talkCount');
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
    this.updateMetaRow();
    this.enableButtons();
  }

  async onSleep() {
    this.disableButtons();
    const sleepR = this.i18n.getDialogue('sleep');
    this.showSpeechBubble(sleepR);
    this.spawnParticles('zzz');
    this.state.incrementStat('sleepCount');

    try {
      await this.actions.handleSleep();
    } catch (e) {
      console.error('Sleep error:', e);
    }

    this.renderMochi();
    this.updateStatusBars();
    this.updateEmotionIndicator();
    this.updateMetaRow();

    setTimeout(() => this.enableButtons(), 2000);
  }

  onMochiTap() {
    if (this.isGameActive) return;
    this.emotional.adjustMood(3);
    this.state.incrementStat('tapCount');
    this.state.updateState('lastInteraction', Date.now());

    if (this.audio && this.audio.isAvailable()) this.audio.play('tap');

    const svg = document.getElementById('mochi-svg');
    if (svg) {
      svg.classList.remove('mochi-bounce');
      void svg.offsetWidth;
      svg.classList.add('mochi-bounce');
      setTimeout(() => svg.classList.remove('mochi-bounce'), 500);
    }

    this.spawnParticles('heart');
    this.updateStatusBars();
    this.showSpeechBubble(this.i18n.t('dialogue.happy'));
  }

  // ─── Share ───

  async onShare() {
    const btn = document.getElementById('share-button');
    if (btn) btn.disabled = true;
    try {
      const result = await this.shareCard.share();
      if (result.method === 'download') {
        this.showGenericToast(this.i18n.t('share.fallback'));
      }
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ─── AR ───

  async onOpenAR() {
    // Localize hint before showing
    const hintEl = document.getElementById('ar-hint');
    if (hintEl) {
      hintEl.textContent = this.i18n.t('ar.hint');
      hintEl.style.animation = 'none';
      void hintEl.offsetWidth;
      hintEl.style.animation = '';
    }

    const result = await this.ar.start();
    if (!result.ok) {
      let msgKey = 'ar.failed';
      if (result.error === 'denied') msgKey = 'ar.denied';
      else if (result.error === 'unsupported') msgKey = 'ar.unsupported';
      this.showGenericToast(this.i18n.t(msgKey), 5000);
    }
  }

  onCloseAR() {
    this.ar.stop();
  }

  async onARCapture() {
    // Visual flash
    const flash = document.getElementById('ar-flash');
    if (flash) {
      flash.classList.remove('hidden');
      void flash.offsetWidth;
      flash.style.animation = 'none';
      void flash.offsetWidth;
      flash.style.animation = '';
      setTimeout(() => flash.classList.add('hidden'), 400);
    }

    if (this.audio && this.audio.isAvailable()) {
      try { this.audio.play('tap'); } catch {}
    }

    const result = await this.ar.captureAndShare();
    if (result && result.ok) {
      const key = result.method === 'share' ? 'ar.shared' : 'ar.saved';
      this.showGenericToast(this.i18n.t(key), 3000);
    }
  }

  onRename() {
    const current = this.state.getState('name') || 'Mochi';
    const next = prompt(this.i18n.t('ui.name'), current);
    if (next && next.trim()) {
      const trimmed = next.trim().slice(0, 20);
      this.state.updateState('name', trimmed);
      // Rebuild DNA so visual changes match new name
      const seed = IdentitySystem.hash(`${trimmed}|${this.state.getState('birthday')}`);
      this.state.updateState('dnaSeed', seed);
      this.animation.setDNA(IdentitySystem.decode(seed));
      this.renderMochi();
      this.updateHeader();
      this.updateIdentityPanel();
    }
  }

  // ─── Easter Egg Handler ───

  onEasterEgg(eggId) {
    if (eggId === 'konami') {
      this.animation.setRainbowMode(true);
      clearTimeout(this.rainbowTimer);
      this.rainbowTimer = setTimeout(() => {
        this.animation.setRainbowMode(false);
        this.renderMochi();
      }, 30000);
      this.showGenericToast(this.i18n.t('easter.konami'));
      // Animate frames during rainbow
      const start = Date.now();
      const tick = () => {
        if (Date.now() - start > 30000) return;
        this.renderMochi();
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else if (eggId === 'fullMoon') {
      this.showGenericToast(this.i18n.t('easter.fullMoon'));
    } else if (eggId === 'birthdayParty') {
      this.spawnConfetti();
      const name = this.state.getState('name') || 'Mochi';
      this.showGenericToast(this.i18n.t('easter.birthday', { name }));
    }
  }

  spawnConfetti() {
    const symbols = ['🎉', '🎊', '✨', '🎂', '🥳', '💖'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      c.style.left = `${Math.random() * 100}vw`;
      c.style.animationDelay = `${Math.random() * 1.5}s`;
      c.style.animationDuration = `${3 + Math.random() * 2}s`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 6000);
    }
  }

  // ─── Rendering ───

  renderMochi() {
    if (this.isGameActive) return;
    const emotion = this.state.getState('emotion');
    const colorPreset = this.state.getState('colorPreset');
    this.animation.updateExpression(emotion);
    this.animation.render({ emotion }, colorPreset);

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

    const moodPercent = Math.round(((mood + 100) / 200) * 100);
    document.getElementById('mood-bar').style.width = `${moodPercent}%`;
    document.getElementById('mood-label').textContent = Math.round(mood);

    const foodPercent = Math.max(0, 100 - Math.round(hunger));
    document.getElementById('hunger-bar').style.width = `${foodPercent}%`;
    document.getElementById('hunger-label').textContent = foodPercent;

    document.getElementById('energy-bar').style.width = `${Math.round(energy)}%`;
    document.getElementById('energy-label').textContent = Math.round(energy);
  }

  updateEmotionIndicator() {
    const emotion = this.state.getState('emotion');
    const emojiMap = { happy: '😊', hungry: '🥺', sleepy: '😴', angry: '😤', playing: '🤩' };
    document.getElementById('emotion-emoji').textContent = emojiMap[emotion] || '😊';
    document.getElementById('emotion-text').textContent = this.i18n.t(`dialogue.${emotion}`).split('!')[0].split('...')[0].slice(0, 16);
  }

  updateHeader() {
    const name = this.state.getState('name') || 'Mochi';
    const nameEl = document.getElementById('pet-name-header');
    if (nameEl) nameEl.textContent = name;

    // Update streak badge
    const streak = this.state.getState('streak') || { current: 0 };
    const badge = document.getElementById('streak-badge');
    const count = document.getElementById('streak-count');
    if (streak.current >= 2) {
      badge.classList.remove('hidden');
      count.textContent = streak.current;
    } else {
      badge.classList.add('hidden');
    }
  }

  updateMetaRow() {
    // Stage pill
    const stage = this.evolution.getStage();
    const stageEl = document.getElementById('stage-text');
    if (stageEl) stageEl.textContent = this.i18n.t(`stage.${stage.id}`);

    // Traits pill
    const traits = this.personality.getTraits();
    const traitsPill = document.getElementById('traits-pill');
    const traitsText = document.getElementById('traits-text');
    if (traits.length > 0 && traits[0] !== 'balanced') {
      traitsPill.classList.remove('hidden');
      traitsText.textContent = traits.map(id => this.i18n.t(`trait.${id}`)).join(' · ');
    } else {
      traitsPill.classList.add('hidden');
    }
  }

  updateIdentityPanel() {
    const name = this.state.getState('name') || '—';
    const bday = this.state.getState('birthday');
    const stage = this.evolution.getStage();
    const traits = this.personality.formatTraits(this.i18n) || '—';
    const streak = this.state.getState('streak') || { current: 0, longest: 0 };

    document.getElementById('info-name').textContent = name;
    document.getElementById('info-birthday').textContent = bday
      ? new Date(bday).toLocaleDateString()
      : '—';
    document.getElementById('info-stage').textContent = this.i18n.t(`stage.${stage.id}`);
    document.getElementById('info-traits').textContent = traits;
    document.getElementById('info-streak').textContent =
      `🔥 ${streak.current} · ⭐ ${streak.longest}`;
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

  // ─── Generic Toast ───

  showGenericToast(text, durationMs = 4000) {
    const toast = document.getElementById('generic-toast');
    const textEl = document.getElementById('generic-toast-text');
    if (!toast || !textEl) return;
    textEl.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.add('hidden'), durationMs);
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
    this.updateTimer = setInterval(() => {
      if (!this.isGameActive) {
        this.emotional.applyPassiveDecay();
        this.state.updateState('lastInteraction', this.state.getState('lastInteraction'));
        this.renderMochi();
        this.updateStatusBars();
        this.updateEmotionIndicator();
        this.updateMetaRow();
      }
    }, 5 * 60 * 1000);

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

  /** Translate every element with data-i18n */
  translateAllI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const txt = this.i18n.t(key);
      if (typeof txt === 'string') el.textContent = txt;
    });
  }

  updateUI() {
    document.querySelectorAll('#language-selector .lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.i18n.getCurrentLanguage());
    });
    this.translateAllI18n();
  }

  // ─── Settings ───

  openSettings() {
    document.getElementById('settings-panel').classList.remove('hidden');
    this.buildRemindersList();
    this.buildMemoriesList();
    this.updateAlarmStatus();
    this.updateIdentityPanel();
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
        grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
      grid.appendChild(swatch);
    });
  }

  buildMemoriesList() {
    const list = document.getElementById('memories-list');
    if (!list) return;
    list.innerHTML = '';
    const memories = this.memory.list().slice().reverse();

    if (memories.length === 0) {
      const li = document.createElement('li');
      li.className = 'memory-empty';
      li.textContent = '🍡';
      list.appendChild(li);
      return;
    }

    const emojiFor = (key) => {
      if (key.startsWith('memory.firstMeal')) return '🍡';
      if (key.startsWith('memory.firstGame')) return '🎮';
      if (key.startsWith('memory.firstWeek')) return '📅';
      if (key.startsWith('memory.firstMonth')) return '🎉';
      if (key.startsWith('memory.evolved')) return '✨';
      if (key.startsWith('memory.highScore')) return '🏆';
      return '💫';
    };

    memories.forEach(m => {
      const li = document.createElement('li');
      li.className = 'memory-item';
      const emoji = document.createElement('span');
      emoji.className = 'memory-emoji';
      emoji.textContent = emojiFor(m.key);
      const text = document.createElement('span');
      text.className = 'memory-text';
      // Look up base key (strip suffix like .42)
      const baseKey = m.key.replace(/\.\d+$/, '');
      text.textContent = this.i18n.t(baseKey, m.params || {});
      const date = document.createElement('span');
      date.className = 'memory-date';
      date.textContent = new Date(m.ts).toLocaleDateString();
      li.appendChild(emoji);
      li.appendChild(text);
      li.appendChild(date);
      list.appendChild(li);
    });
  }

  setLanguage(lang) {
    this.i18n.setLanguage(lang);
    this.state.updateState('language', lang);
    this.voice.updateLanguage();
    this.updateUI();
    this.updateMetaRow();
    this.updateIdentityPanel();
    this.buildMemoriesList();
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
      const toast = document.getElementById('support-toast');
      const toastText = document.getElementById('support-toast-text');
      toastText.textContent = this.i18n.t('notification.support');
      toast.classList.remove('hidden');
      this.state.updateState('supportNotificationShown', true);
      setTimeout(() => toast.classList.add('hidden'), 10000);
    }
  }

  // ─── Greeting ───

  showGreeting() {
    if (this._pendingAdoptionToast) {
      this.showGenericToast(this._pendingAdoptionToast, 6000);
      this._pendingAdoptionToast = null;
      return;
    }

    const hour = new Date().getHours();
    let greetingKey;
    if (hour < 12) greetingKey = 'alarm.greeting.morning';
    else if (hour < 18) greetingKey = 'alarm.greeting.afternoon';
    else greetingKey = 'alarm.greeting.evening';

    const greeting = this.i18n.t(greetingKey);
    this.showSpeechBubble(greeting);
  }

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

const app = new MochiApp();
app.init().catch(err => console.error('Mochi init failed:', err));
