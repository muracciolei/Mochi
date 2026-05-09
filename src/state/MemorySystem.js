/**
 * MemorySystem - Auto-captures milestone "memories" (first meal, evolution,
 * weekly anniversary, high score). Each memory is a {id, key, ts, params}
 * entry persisted in state.memories (capped to 50 newest).
 */

export class MemorySystem {
  constructor(state) {
    this.state = state;
  }

  list() {
    return this.state.getState('memories') || [];
  }

  has(key) {
    return this.list().some(m => m.key === key);
  }

  /**
   * Push a memory if not already recorded for this key (within scope).
   * scope='unique' → only once ever
   * scope='daily'  → once per calendar day
   */
  capture(key, params = {}, scope = 'unique') {
    const list = this.list();
    if (scope === 'unique' && list.some(m => m.key === key)) return false;

    if (scope === 'daily') {
      const today = new Date();
      const sameDay = list.find(m => {
        if (m.key !== key) return false;
        const d = new Date(m.ts);
        return d.getFullYear() === today.getFullYear() &&
               d.getMonth() === today.getMonth() &&
               d.getDate() === today.getDate();
      });
      if (sameDay) return false;
    }

    list.push({ id: Date.now() + '-' + Math.random().toString(16).slice(2, 6), key, ts: Date.now(), params });
    while (list.length > 50) list.shift();
    this.state.updateState('memories', list);
    return true;
  }

  /**
   * Check anniversary milestones (1 week, 1 month).
   */
  checkAnniversary(ageDays) {
    if (ageDays === 7) this.capture('memory.firstWeek');
    if (ageDays === 30) this.capture('memory.firstMonth');
  }
}
