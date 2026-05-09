/**
 * PersonalitySystem - Derives 1-3 personality traits from accumulated stats.
 *
 * Traits emerge from the user's behaviour with the pet over time. They're
 * recomputed lazily; nothing is persisted (the source-of-truth is `stats`).
 */

const TRAITS = [
  // id            min-condition (returns 0..1 score from stats)
  { id: 'gourmand',     score: s => norm(s.feedCount, 80) - 0.4 * norm(s.playCount, 60) },
  { id: 'energetic',    score: s => norm(s.playCount, 60) },
  { id: 'philosopher',  score: s => norm(s.talkCount, 50) },
  { id: 'melancholic',  score: s => 1 - norm(s.tapCount + s.talkCount, 100) },
  { id: 'athlete',      score: s => norm(s.gamesPlayed, 30) },
  { id: 'dreamer',      score: s => norm(s.sleepCount, 25) },
  { id: 'cuddly',       score: s => norm(s.tapCount, 100) }
];

function norm(value, target) {
  if (!value || value <= 0) return 0;
  return Math.min(1, value / target);
}

export class PersonalitySystem {
  constructor(state) {
    this.state = state;
  }

  /**
   * Returns top-N (default 2) trait ids based on current stats.
   * If the pet is too young / no data, returns ['balanced'].
   */
  getTraits(top = 2) {
    const stats = this.state.getState('stats') || {};
    const total = (stats.feedCount || 0) + (stats.playCount || 0) +
                  (stats.talkCount || 0) + (stats.sleepCount || 0) +
                  (stats.tapCount || 0);

    if (total < 5) return ['balanced'];

    const scored = TRAITS
      .map(t => ({ id: t.id, score: t.score(stats) }))
      .filter(t => t.score > 0.3)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return ['balanced'];
    return scored.slice(0, top).map(t => t.id);
  }

  /**
   * Render a localized list "Trait1 · Trait2".
   */
  formatTraits(i18n, separator = ' · ') {
    return this.getTraits().map(id => i18n.t(`trait.${id}`)).join(separator);
  }
}
