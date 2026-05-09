/**
 * EvolutionSystem - Maps age-in-days to a life stage.
 *
 *   day 0      → egg
 *   day 1-2    → baby
 *   day 3-7    → child
 *   day 8-21   → teen
 *   day 22+    → adult
 */

const STAGES = [
  { id: 'egg',   minDay: 0,  maxDay: 0  },
  { id: 'baby',  minDay: 1,  maxDay: 2  },
  { id: 'child', minDay: 3,  maxDay: 7  },
  { id: 'teen',  minDay: 8,  maxDay: 21 },
  { id: 'adult', minDay: 22, maxDay: Infinity }
];

export class EvolutionSystem {
  constructor(state, identity) {
    this.state = state;
    this.identity = identity;
  }

  /**
   * Resolve current stage from age.
   */
  getStage() {
    const age = this.identity.getAgeDays();
    return STAGES.find(s => age >= s.minDay && age <= s.maxDay) || STAGES[STAGES.length - 1];
  }

  /**
   * Stage scale factor for the body (egg=1.0, baby=0.65, child=0.85, teen=0.95, adult=1.0)
   * — used by AnimationEngine to draw smaller babies.
   */
  getScaleFor(stageId) {
    return ({ egg: 0.95, baby: 0.7, child: 0.85, teen: 0.95, adult: 1.0 })[stageId] || 1.0;
  }

  /**
   * Was a stage transition just crossed since the last invocation?
   * Returns the new stage id if changed, null otherwise.
   */
  detectTransition() {
    const last = this.state.getState('lastStage');
    const current = this.getStage().id;
    if (last !== current) {
      this.state.updateState('lastStage', current);
      if (last) return current;
    }
    return null;
  }

  static get STAGES() { return STAGES; }
}
