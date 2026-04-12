/**
 * AnimationEngine - Renders Mochi's visual appearance using SVG
 * Premium, cute, Game Boy-inspired aesthetic with smooth animations
 */

const FACIAL_EXPRESSIONS = {
  happy: {
    eyeShape: 'happy',
    mouthCurve: 0.8,
    blushOpacity: 0.6
  },
  hungry: {
    eyeShape: 'normal',
    mouthCurve: -0.3,
    blushOpacity: 0.2
  },
  sleepy: {
    eyeShape: 'sleepy',
    mouthCurve: 0.1,
    blushOpacity: 0.3
  },
  angry: {
    eyeShape: 'angry',
    mouthCurve: -0.8,
    blushOpacity: 0.1
  },
  playing: {
    eyeShape: 'happy',
    mouthCurve: 1.0,
    blushOpacity: 0.8
  }
};

export class AnimationEngine {
  constructor(container, colorSystem) {
    this.container = container;
    this.colorSystem = colorSystem;
    this.currentExpression = FACIAL_EXPRESSIONS.happy;
    this.svg = null;
  }

  /**
   * Initialize SVG rendering
   */
  init() {
    // Remove any existing SVG
    const existing = this.container.querySelector('#mochi-svg');
    if (existing) existing.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.id = 'mochi-svg';
    svg.style.width = '65%';
    svg.style.height = 'auto';
    svg.style.maxWidth = '220px';
    svg.style.overflow = 'visible';

    // Add defs for gradients and filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // Body gradient
    const bodyGrad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    bodyGrad.id = 'mochi-body-grad';
    bodyGrad.setAttribute('cx', '40%');
    bodyGrad.setAttribute('cy', '35%');
    bodyGrad.setAttribute('r', '60%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.id = 'grad-stop1';
    stop1.setAttribute('offset', '0%');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.id = 'grad-stop2';
    stop2.setAttribute('offset', '100%');

    bodyGrad.appendChild(stop1);
    bodyGrad.appendChild(stop2);
    defs.appendChild(bodyGrad);

    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.id = 'mochi-glow';
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '160%');

    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '3');
    filter.appendChild(blur);
    defs.appendChild(filter);

    svg.appendChild(defs);
    this.container.appendChild(svg);
    this.svg = svg;
  }

  /**
   * Render Mochi with current emotional state
   * @param {Object} emotionalState - Current emotional state
   * @param {string} colorPreset - Color preset name
   */
  render(emotionalState, colorPreset) {
    if (!this.svg) return;
    const palette = this.colorSystem.getPalette(colorPreset);

    // Update gradient colors
    const stop1 = this.svg.querySelector('#grad-stop1');
    const stop2 = this.svg.querySelector('#grad-stop2');
    if (stop1 && stop2) {
      stop1.setAttribute('stop-color', this.lightenColor(palette.primary, 30));
      stop2.setAttribute('stop-color', palette.primary);
    }

    // Remove old shapes (keep defs)
    const shapes = this.svg.querySelectorAll('.mochi-shape');
    shapes.forEach(s => s.remove());

    // Shadow
    const shadow = this.createEllipse(100, 170, 50, 10, 'rgba(0,0,0,0.15)', 'mochi-shape');
    this.svg.appendChild(shadow);

    // Body
    const body = this.createCircle(100, 100, 60, 'url(#mochi-body-grad)', 'mochi-shape');
    body.setAttribute('stroke', this.darkenColor(palette.primary, 20));
    body.setAttribute('stroke-width', '2.5');
    this.svg.appendChild(body);

    // Highlight (shine)
    const highlight = this.createEllipse(82, 78, 18, 12, 'rgba(255,255,255,0.25)', 'mochi-shape');
    this.svg.appendChild(highlight);

    // Eyes
    this.renderEyes(emotionalState.emotion);

    // Mouth
    this.renderMouth(this.currentExpression.mouthCurve);

    // Blush
    this.renderBlush(this.currentExpression.blushOpacity, palette.secondary);
  }

  /**
   * Render eyes based on emotion
   */
  renderEyes(emotion) {
    const expression = FACIAL_EXPRESSIONS[emotion] || FACIAL_EXPRESSIONS.happy;

    if (expression.eyeShape === 'happy') {
      // Happy eyes (upward arcs ∪)
      this.createArc(80, 90, 7, true);
      this.createArc(120, 90, 7, true);
    } else if (expression.eyeShape === 'sleepy') {
      // Sleepy eyes (horizontal lines ─)
      this.createLine(74, 90, 86, 90);
      this.createLine(114, 90, 126, 90);
    } else if (expression.eyeShape === 'angry') {
      // Angry eyes (angled brows + dots)
      this.createLine(74, 82, 86, 88);
      this.createLine(126, 82, 114, 88);
      const eyeL = this.createCircle(80, 93, 3, '#333', 'mochi-shape');
      this.svg.appendChild(eyeL);
      const eyeR = this.createCircle(120, 93, 3, '#333', 'mochi-shape');
      this.svg.appendChild(eyeR);
    } else {
      // Normal eyes (dots with shine)
      const eyeL = this.createCircle(80, 90, 5, '#333', 'mochi-shape');
      this.svg.appendChild(eyeL);
      const eyeR = this.createCircle(120, 90, 5, '#333', 'mochi-shape');
      this.svg.appendChild(eyeR);
      // Shine dots
      const shineL = this.createCircle(82, 88, 1.5, '#fff', 'mochi-shape');
      this.svg.appendChild(shineL);
      const shineR = this.createCircle(122, 88, 1.5, '#fff', 'mochi-shape');
      this.svg.appendChild(shineR);
    }
  }

  /**
   * Create arc (for happy eyes)
   */
  createArc(cx, cy, r, isHappy) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = isHappy
      ? `M ${cx - r} ${cy} Q ${cx} ${cy - r * 1.5} ${cx + r} ${cy}`
      : `M ${cx - r} ${cy} Q ${cx} ${cy + r} ${cx + r} ${cy}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#333');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.classList.add('mochi-shape');
    this.svg.appendChild(path);
  }

  /**
   * Create line (for sleepy/angry eyes)
   */
  createLine(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#333');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    line.classList.add('mochi-shape');
    this.svg.appendChild(line);
  }

  /**
   * Render mouth
   */
  renderMouth(curve) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const w = 12 + Math.abs(curve) * 6;
    const controlY = 112 + (curve * 12);
    const d = `M ${100 - w} 112 Q 100 ${controlY} ${100 + w} 112`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#333');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.classList.add('mochi-shape');
    this.svg.appendChild(path);
  }

  /**
   * Render blush marks
   */
  renderBlush(opacity, color) {
    if (opacity <= 0) return;

    const leftBlush = this.createEllipse(68, 105, 9, 5, color, 'mochi-shape');
    leftBlush.setAttribute('opacity', opacity);
    this.svg.appendChild(leftBlush);

    const rightBlush = this.createEllipse(132, 105, 9, 5, color, 'mochi-shape');
    rightBlush.setAttribute('opacity', opacity);
    this.svg.appendChild(rightBlush);
  }

  // ─── SVG Helper Methods ───

  createCircle(cx, cy, r, fill, className) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fill);
    if (className) circle.classList.add(className);
    return circle;
  }

  createEllipse(cx, cy, rx, ry, fill, className) {
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', cx);
    ellipse.setAttribute('cy', cy);
    ellipse.setAttribute('rx', rx);
    ellipse.setAttribute('ry', ry);
    ellipse.setAttribute('fill', fill);
    if (className) ellipse.classList.add(className);
    return ellipse;
  }

  /**
   * Update facial expression
   * @param {string} emotion - Emotion name
   */
  updateExpression(emotion) {
    this.currentExpression = FACIAL_EXPRESSIONS[emotion] || FACIAL_EXPRESSIONS.happy;
  }

  /**
   * Play animation sequence
   * @param {string} animationType - Animation type
   * @returns {Promise} Resolves when animation completes
   */
  async playAnimation(animationType) {
    const svg = this.svg;
    if (!svg) return;

    return new Promise(resolve => {
      svg.classList.remove('mochi-idle', 'mochi-sleeping', 'mochi-bounce');
      void svg.offsetWidth;
      svg.classList.add('mochi-bounce');

      setTimeout(() => {
        svg.classList.remove('mochi-bounce');
        resolve();
      }, 500);
    });
  }

  /**
   * Stop / cleanup
   */
  stop() {
    // Cleanup if needed
  }

  // ─── Color utility ───

  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }
}
