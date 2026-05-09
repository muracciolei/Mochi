/**
 * AnimationEngine - Renders Mochi's visual appearance using SVG.
 * Supports DNA-driven variations (eye shape, blush size, antenna, body
 * proportions), evolution stage scaling, and rainbow easter-egg mode.
 */

const FACIAL_EXPRESSIONS = {
  happy:   { eyeShape: 'happy',   mouthCurve: 0.8,  blushOpacity: 0.6 },
  hungry:  { eyeShape: 'normal',  mouthCurve: -0.3, blushOpacity: 0.2 },
  sleepy:  { eyeShape: 'sleepy',  mouthCurve: 0.1,  blushOpacity: 0.3 },
  angry:   { eyeShape: 'angry',   mouthCurve: -0.8, blushOpacity: 0.1 },
  playing: { eyeShape: 'happy',   mouthCurve: 1.0,  blushOpacity: 0.8 }
};

export class AnimationEngine {
  constructor(container, colorSystem) {
    this.container = container;
    this.colorSystem = colorSystem;
    this.currentExpression = FACIAL_EXPRESSIONS.happy;
    this.svg = null;
    this.dna = null;          // { eyeStyle, blushSize, bodyShape, mouthQuirk, antenna, sparkle, hueShift }
    this.stageId = 'adult';
    this.stageScale = 1.0;
    this.rainbowMode = false;
    this._rainbowFrame = null;
  }

  setDNA(dna) {
    this.dna = dna || null;
  }

  setStage(stageId, scale) {
    this.stageId = stageId || 'adult';
    this.stageScale = typeof scale === 'number' ? scale : 1.0;
  }

  setRainbowMode(active) {
    this.rainbowMode = !!active;
  }

  init() {
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

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

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

  render(emotionalState, colorPreset) {
    if (!this.svg) return;

    let palette = this.colorSystem.getPalette(colorPreset);
    if (this.rainbowMode) {
      palette = { ...palette, primary: this._rainbowColor(), secondary: palette.secondary };
    }

    // Apply DNA hue shift if any
    if (this.dna && this.dna.hueShift) {
      palette = { ...palette, primary: this._shiftHue(palette.primary, this.dna.hueShift) };
    }

    const stop1 = this.svg.querySelector('#grad-stop1');
    const stop2 = this.svg.querySelector('#grad-stop2');
    if (stop1 && stop2) {
      stop1.setAttribute('stop-color', this.lightenColor(palette.primary, 30));
      stop2.setAttribute('stop-color', palette.primary);
    }

    const shapes = this.svg.querySelectorAll('.mochi-shape');
    shapes.forEach(s => s.remove());

    const dna = this.dna || { eyeStyle: 0.4, blushSize: 0.5, bodyShape: 0.5, mouthQuirk: 0.5, antenna: 0, sparkle: 0, hueShift: 0 };

    // Egg stage: just the egg shell
    if (this.stageId === 'egg') {
      this._renderEgg(palette);
      return;
    }

    const sx = this.stageScale;
    const bodyR = 60 * sx;
    const cx = 100, cy = 100;

    // Shadow (smaller for smaller stages)
    const shadow = this.createEllipse(cx, 170, 50 * sx, 10 * sx, 'rgba(0,0,0,0.15)', 'mochi-shape');
    this.svg.appendChild(shadow);

    // Body (DNA bodyShape: 0=round, 1=tall-egg)
    const bodyW = bodyR * (1 + (dna.bodyShape - 0.5) * 0.15);
    const bodyH = bodyR * (1 - (dna.bodyShape - 0.5) * 0.1);
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    body.setAttribute('cx', cx);
    body.setAttribute('cy', cy);
    body.setAttribute('rx', bodyW);
    body.setAttribute('ry', bodyH);
    body.setAttribute('fill', 'url(#mochi-body-grad)');
    body.setAttribute('stroke', this.darkenColor(palette.primary, 20));
    body.setAttribute('stroke-width', 2.5);
    body.classList.add('mochi-shape');
    this.svg.appendChild(body);

    // Highlight (shine)
    const highlight = this.createEllipse(cx - 18, cy - 22, 18, 12, 'rgba(255,255,255,0.25)', 'mochi-shape');
    this.svg.appendChild(highlight);

    // Antenna
    this._renderAntenna(dna.antenna, cx, cy - bodyH, palette);

    // Eyes / Mouth / Blush — use emotion override on eyes
    this._renderEyes(emotionalState.emotion, dna, cx, cy, bodyW, bodyH);
    this._renderMouth(this.currentExpression.mouthCurve, dna, cx, cy, bodyW, bodyH);
    this._renderBlush(this.currentExpression.blushOpacity, dna, palette.secondary, cx, cy, bodyW, bodyH);

    // Sparkle aura
    if (dna.sparkle > 0) this._renderSparkle(dna.sparkle, cx, cy, bodyW);
  }

  _renderEgg(palette) {
    const cx = 100, cy = 100;
    const eggW = 50, eggH = 60;
    const shadow = this.createEllipse(cx, cy + eggH + 8, 35, 7, 'rgba(0,0,0,0.18)', 'mochi-shape');
    this.svg.appendChild(shadow);

    const egg = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    egg.setAttribute('cx', cx);
    egg.setAttribute('cy', cy);
    egg.setAttribute('rx', eggW);
    egg.setAttribute('ry', eggH);
    egg.setAttribute('fill', 'url(#mochi-body-grad)');
    egg.setAttribute('stroke', this.darkenColor(palette.primary, 25));
    egg.setAttribute('stroke-width', 2.5);
    egg.classList.add('mochi-shape');
    this.svg.appendChild(egg);

    // Zigzag pattern hint
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${cx - 25} ${cy + 5} L ${cx - 12} ${cy - 5} L ${cx} ${cy + 5} L ${cx + 12} ${cy - 5} L ${cx + 25} ${cy + 5}`);
    path.setAttribute('stroke', 'rgba(255,255,255,0.35)');
    path.setAttribute('stroke-width', 2);
    path.setAttribute('fill', 'none');
    path.classList.add('mochi-shape');
    this.svg.appendChild(path);
  }

  _renderAntenna(type, cx, cyTop, palette) {
    if (type === 1) {
      const tuft = this.createEllipse(cx, cyTop - 8, 4, 8, this.darkenColor(palette.primary, 30), 'mochi-shape');
      this.svg.appendChild(tuft);
    } else if (type === 2) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${cx} ${cyTop} Q ${cx + 8} ${cyTop - 14} ${cx} ${cyTop - 22}`);
      path.setAttribute('stroke', this.darkenColor(palette.primary, 30));
      path.setAttribute('stroke-width', 2.5);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.classList.add('mochi-shape');
      this.svg.appendChild(path);
    } else if (type === 3) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      star.setAttribute('x', cx);
      star.setAttribute('y', cyTop - 4);
      star.setAttribute('text-anchor', 'middle');
      star.setAttribute('font-size', '12');
      star.classList.add('mochi-shape');
      star.textContent = '✨';
      this.svg.appendChild(star);
    }
  }

  _renderEyes(emotion, dna, cx, cy, bodyW, bodyH) {
    const expression = FACIAL_EXPRESSIONS[emotion] || FACIAL_EXPRESSIONS.happy;
    const gap = bodyW * 0.32;
    const eyeY = cy - bodyH * 0.18;

    if (expression.eyeShape === 'sleepy') {
      this._line(cx - gap - 6, eyeY, cx - gap + 6, eyeY);
      this._line(cx + gap - 6, eyeY, cx + gap + 6, eyeY);
      return;
    }
    if (expression.eyeShape === 'angry') {
      this._line(cx - gap - 6, eyeY - 8, cx - gap + 6, eyeY - 2);
      this._line(cx + gap + 6, eyeY - 8, cx + gap - 6, eyeY - 2);
      this.svg.appendChild(this.createCircle(cx - gap, eyeY + 3, 3, '#333', 'mochi-shape'));
      this.svg.appendChild(this.createCircle(cx + gap, eyeY + 3, 3, '#333', 'mochi-shape'));
      return;
    }

    // For happy/normal eyes, vary by DNA eyeStyle
    if (expression.eyeShape === 'happy' || dna.eyeStyle > 0.66) {
      // Curved happy ∪
      this._arc(cx - gap, eyeY, 7, true);
      this._arc(cx + gap, eyeY, 7, true);
    } else if (dna.eyeStyle > 0.33) {
      // Star eyes
      this.svg.appendChild(this.createCircle(cx - gap, eyeY, 5, '#333', 'mochi-shape'));
      this.svg.appendChild(this.createCircle(cx + gap, eyeY, 5, '#333', 'mochi-shape'));
      this._sparkleStar(cx - gap + 1.5, eyeY - 1.5);
      this._sparkleStar(cx + gap + 1.5, eyeY - 1.5);
    } else {
      // Plain dot eyes with shine
      this.svg.appendChild(this.createCircle(cx - gap, eyeY, 5, '#333', 'mochi-shape'));
      this.svg.appendChild(this.createCircle(cx + gap, eyeY, 5, '#333', 'mochi-shape'));
      this.svg.appendChild(this.createCircle(cx - gap + 2, eyeY - 2, 1.5, '#fff', 'mochi-shape'));
      this.svg.appendChild(this.createCircle(cx + gap + 2, eyeY - 2, 1.5, '#fff', 'mochi-shape'));
    }
  }

  _arc(cx, cy, r, isHappy) {
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

  _line(x1, y1, x2, y2) {
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

  _sparkleStar(cx, cy) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    star.setAttribute('x', cx);
    star.setAttribute('y', cy + 1.5);
    star.setAttribute('text-anchor', 'middle');
    star.setAttribute('font-size', '4');
    star.setAttribute('fill', '#fff');
    star.classList.add('mochi-shape');
    star.textContent = '✦';
    this.svg.appendChild(star);
  }

  _renderMouth(curve, dna, cx, cy, bodyW, bodyH) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const w = 12 + Math.abs(curve) * 6;
    const offsetY = cy + bodyH * 0.2;
    const controlY = offsetY + (curve * 12) + (dna.mouthQuirk - 0.5) * 4;
    const d = `M ${cx - w} ${offsetY} Q ${cx} ${controlY} ${cx + w} ${offsetY}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#333');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.classList.add('mochi-shape');
    this.svg.appendChild(path);
  }

  _renderBlush(opacity, dna, color, cx, cy, bodyW, bodyH) {
    if (opacity <= 0) return;
    const blushR = 7 + dna.blushSize * 6;
    const x = bodyW * 0.55;
    const y = cy + bodyH * 0.05;

    const left = this.createEllipse(cx - x, y, blushR, blushR * 0.55, color, 'mochi-shape');
    left.setAttribute('opacity', opacity);
    this.svg.appendChild(left);

    const right = this.createEllipse(cx + x, y, blushR, blushR * 0.55, color, 'mochi-shape');
    right.setAttribute('opacity', opacity);
    this.svg.appendChild(right);
  }

  _renderSparkle(level, cx, cy, bodyW) {
    const positions = [
      [cx - bodyW - 5, cy - 30],
      [cx + bodyW + 5, cy - 10],
      [cx - bodyW + 10, cy + bodyW]
    ];
    for (let i = 0; i < Math.min(level, positions.length); i++) {
      const [x, y] = positions[i];
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      star.setAttribute('x', x);
      star.setAttribute('y', y);
      star.setAttribute('text-anchor', 'middle');
      star.setAttribute('font-size', 8);
      star.setAttribute('fill', '#fff');
      star.setAttribute('opacity', 0.8);
      star.classList.add('mochi-shape');
      star.textContent = '✨';
      this.svg.appendChild(star);
    }
  }

  // Backwards-compat helpers (used elsewhere by tests / older code)
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

  updateExpression(emotion) {
    this.currentExpression = FACIAL_EXPRESSIONS[emotion] || FACIAL_EXPRESSIONS.happy;
  }

  async playAnimation() {
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

  stop() {
    if (this._rainbowFrame) {
      cancelAnimationFrame(this._rainbowFrame);
      this._rainbowFrame = null;
    }
  }

  _rainbowColor() {
    const hue = (Date.now() / 30) % 360;
    return this._hslToHex(hue, 70, 65);
  }

  _hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    const r = f(0), g = f(8), b = f(4);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  _shiftHue(hex, deg) {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) / 255, g = ((num >> 8) & 0xFF) / 255, b = (num & 0xFF) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h *= 60;
    }
    h = (h + deg + 360) % 360;
    return this._hslToHex(h, s * 100, l * 100);
  }

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
