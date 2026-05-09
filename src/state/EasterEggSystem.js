/**
 * EasterEggSystem
 *   - Konami code → toggles a rainbow body cycle for 30 seconds
 *   - Full moon  → at moonrise on a real full moon, eyes glow
 *   - Pet birthday → confetti + special speech bubble
 */

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export class EasterEggSystem {
  constructor(state, i18n, onTrigger) {
    this.state = state;
    this.i18n = i18n;
    this.onTrigger = onTrigger; // callback(eggId, payload)
    this._konamiBuffer = [];
    this.rainbowUntil = 0;
  }

  bind() {
    window.addEventListener('keydown', (e) => this._handleKey(e));
  }

  _handleKey(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    this._konamiBuffer.push(key);
    if (this._konamiBuffer.length > KONAMI.length) this._konamiBuffer.shift();
    if (this._konamiBuffer.length === KONAMI.length &&
        this._konamiBuffer.every((k, i) => k === KONAMI[i])) {
      this._konamiBuffer = [];
      this._triggerKonami();
    }
  }

  _triggerKonami() {
    const flags = this.state.getState('easterEggs') || {};
    flags.konami = true;
    this.state.updateState('easterEggs', flags);
    this.rainbowUntil = Date.now() + 30000;
    if (this.onTrigger) this.onTrigger('konami', { duration: 30000 });
  }

  isRainbowActive() {
    return Date.now() < this.rainbowUntil;
  }

  /**
   * Approximate full-moon detection: phase ≈ ((today - reference) / 29.5306) mod 1.
   * 0 = new moon, 0.5 = full moon. Allow ±0.04 window.
   * Reference: known full moon on 2000-01-06 18:14 UTC.
   */
  isFullMoonToday() {
    const refMs = Date.UTC(2000, 0, 6, 18, 14, 0);
    const cycle = 29.530588853 * 86400000;
    const phase = (((Date.now() - refMs) % cycle) + cycle) % cycle / cycle;
    return Math.abs(phase - 0.5) < 0.04;
  }

  /**
   * Run all "passive" checks (full-moon, pet-birthday). Should be called once
   * after init. Returns array of egg ids that fired.
   */
  checkPassive(identity) {
    const fired = [];
    const flags = this.state.getState('easterEggs') || {};

    if (this.isFullMoonToday() && !flags.fullMoon) {
      flags.fullMoon = true;
      fired.push('fullMoon');
    } else if (!this.isFullMoonToday()) {
      flags.fullMoon = false;
    }

    if (identity.isBirthdayToday() && !flags.birthdayParty) {
      flags.birthdayParty = true;
      fired.push('birthdayParty');
    } else if (!identity.isBirthdayToday()) {
      flags.birthdayParty = false;
    }

    this.state.updateState('easterEggs', flags);
    fired.forEach(id => this.onTrigger && this.onTrigger(id));
    return fired;
  }
}
