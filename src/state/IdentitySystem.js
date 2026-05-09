/**
 * IdentitySystem - Name, birthday, and deterministic DNA seed.
 *
 * The DNA seed is a short hash derived from name + birthday and drives
 * deterministic visual variations (eye style, blush size, body proportions,
 * mouth quirk). Every Mochi feels unique while still fitting the art style.
 */

const ADJECTIVES = ['Soft', 'Pixel', 'Bubu', 'Mochi', 'Pip', 'Dot', 'Coco', 'Lulu', 'Kiki', 'Tato'];

export class IdentitySystem {
  constructor(state) {
    this.state = state;
  }

  /**
   * Compute a 32-bit FNV-1a-ish hash from a string. Deterministic, no deps.
   */
  static hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Decode a DNA hex string into deterministic trait values [0..1].
   */
  static decode(seed) {
    if (!seed) seed = '00000000';
    const n = parseInt(seed, 16) || 0;
    return {
      eyeStyle: ((n >> 0) & 0xF) / 15,        // 0..1
      blushSize: ((n >> 4) & 0xF) / 15,       // 0..1
      bodyShape: ((n >> 8) & 0xF) / 15,       // 0..1 (round → tall)
      mouthQuirk: ((n >> 12) & 0xF) / 15,     // 0..1
      antenna: ((n >> 16) & 0x3),             // 0..3 (none/tuft/swirl/star)
      sparkle: ((n >> 18) & 0x3),             // 0..3 (sparkle density)
      hueShift: (((n >> 20) & 0xF) - 7) * 4   // -28..28 deg
    };
  }

  /**
   * Generate a "good enough" auto-name from the seed if user skipped.
   */
  static autoName(seed) {
    const n = parseInt((seed || '00000000').slice(0, 4), 16);
    return ADJECTIVES[n % ADJECTIVES.length];
  }

  /**
   * Initialize identity for first-time users (or if missing on legacy state).
   */
  ensure(name) {
    let n = name || this.state.getState('name');
    let birthday = this.state.getState('birthday');
    let seed = this.state.getState('dnaSeed');

    if (!birthday) birthday = Date.now();
    if (!n) {
      // Use a temporary seed to autoname
      const tempSeed = IdentitySystem.hash(String(birthday));
      n = IdentitySystem.autoName(tempSeed);
    }
    if (!seed) {
      seed = IdentitySystem.hash(`${n}|${birthday}`);
    }

    this.state.updateState('name', n);
    this.state.updateState('birthday', birthday);
    this.state.updateState('dnaSeed', seed);

    return { name: n, birthday, seed, dna: IdentitySystem.decode(seed) };
  }

  /**
   * Adopt an existing pet from a share-link DNA. Used when ?adopt=<seed> is in URL.
   */
  adoptFrom(seed, name) {
    const cleanSeed = String(seed || '').replace(/[^a-f0-9]/gi, '').slice(0, 8).toLowerCase();
    if (cleanSeed.length !== 8) return null;
    const n = name || IdentitySystem.autoName(cleanSeed);
    this.state.updateState('name', n);
    this.state.updateState('dnaSeed', cleanSeed);
    this.state.updateState('birthday', Date.now());
    return { name: n, seed: cleanSeed, dna: IdentitySystem.decode(cleanSeed) };
  }

  getDNA() {
    const seed = this.state.getState('dnaSeed') || '00000000';
    return IdentitySystem.decode(seed);
  }

  /**
   * Days since adoption.
   */
  getAgeDays() {
    const bday = this.state.getState('birthday');
    if (!bday) return 0;
    return Math.floor((Date.now() - bday) / (1000 * 60 * 60 * 24));
  }

  /**
   * True if today is the pet's birthday (anniversary of adoption).
   */
  isBirthdayToday() {
    const bday = this.state.getState('birthday');
    if (!bday) return false;
    const a = new Date(bday);
    const b = new Date();
    return a.getMonth() === b.getMonth() && a.getDate() === b.getDate() && a.getFullYear() !== b.getFullYear();
  }
}
