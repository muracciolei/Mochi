/**
 * StreakSystem - Daily-visit streak tracker.
 *
 * Call recordVisit() once on app start. The streak increments if the user
 * visited yesterday, stays the same if today is already counted, and resets
 * to 1 if the gap is >= 2 days.
 */

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function daysBetween(aKey, bKey) {
  if (!aKey || !bKey) return Infinity;
  const [ay, am, ad] = aKey.split('-').map(Number);
  const [by, bm, bd] = bKey.split('-').map(Number);
  const a = new Date(ay, am - 1, ad);
  const b = new Date(by, bm - 1, bd);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export class StreakSystem {
  constructor(state) {
    this.state = state;
  }

  /**
   * Returns { current, longest, isNewDay }.
   */
  recordVisit() {
    const streak = this.state.getState('streak') || { current: 0, longest: 0, lastVisitDay: null };
    const today = dayKey();
    const last = streak.lastVisitDay;

    if (last === today) {
      return { ...streak, isNewDay: false };
    }

    const gap = daysBetween(last, today);
    let current;
    if (gap === 1) current = (streak.current || 0) + 1;
    else if (gap === Infinity) current = 1;
    else current = 1;

    const longest = Math.max(streak.longest || 0, current);
    const next = { current, longest, lastVisitDay: today };
    this.state.updateState('streak', next);
    return { ...next, isNewDay: true };
  }

  getStreak() {
    return this.state.getState('streak') || { current: 0, longest: 0, lastVisitDay: null };
  }
}
