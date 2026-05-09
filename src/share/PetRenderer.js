/**
 * PetRenderer - Pure canvas drawing of a Mochi pet, reused by both the
 * shareable trading card and the AR camera overlay.
 *
 * No DOM dependencies — receives a CanvasRenderingContext2D and draws.
 */

export class PetRenderer {
  /**
   * Draw Mochi at (cx, cy) using a body radius scaled by `radius`.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} opts
   *   @param {Object} opts.palette       { primary, secondary, ... }
   *   @param {Object} opts.dna           { eyeStyle, blushSize, bodyShape, mouthQuirk, antenna, sparkle, hueShift }
   *   @param {string} opts.stageId       'egg'|'baby'|'child'|'teen'|'adult'
   *   @param {number} opts.cx            Center X
   *   @param {number} opts.cy            Center Y
   *   @param {number} opts.radius        Body radius (in canvas px) — pre-scaled by stage already
   *   @param {string} [opts.emotion]     'happy'|'hungry'|'sleepy'|'angry'|'playing' (defaults to happy)
   *   @param {number} [opts.bobOffset]   Optional Y offset for idle bobbing
   */
  static drawPet(ctx, opts) {
    const {
      palette, dna, stageId, cx, cy, radius,
      emotion = 'happy', bobOffset = 0
    } = opts;

    const yc = cy + bobOffset;

    if (stageId === 'egg') {
      PetRenderer._drawEgg(ctx, palette, cx, yc, radius);
      return;
    }

    // Apply hue shift to palette
    const adjusted = dna.hueShift
      ? { ...palette, primary: PetRenderer._shiftHue(palette.primary, dna.hueShift) }
      : palette;

    const bodyW = radius * (1 + (dna.bodyShape - 0.5) * 0.15);
    const bodyH = radius * (1 - (dna.bodyShape - 0.5) * 0.1);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, yc + bodyH + radius * 0.18, bodyW * 0.7, radius * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const grad = ctx.createRadialGradient(cx - bodyW * 0.3, yc - bodyH * 0.4, bodyW * 0.2, cx, yc, bodyW);
    grad.addColorStop(0, PetRenderer._lighten(adjusted.primary, 30));
    grad.addColorStop(1, adjusted.primary);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, yc, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PetRenderer._darken(adjusted.primary, 22);
    ctx.lineWidth = Math.max(2, radius * 0.03);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - bodyW * 0.3, yc - bodyH * 0.4, bodyW * 0.18, bodyH * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antenna
    PetRenderer._drawAntenna(ctx, dna.antenna, cx, yc - bodyH, adjusted, radius);

    // Eyes
    PetRenderer._drawEyes(ctx, emotion, dna, cx, yc, bodyW, bodyH, radius);

    // Mouth
    PetRenderer._drawMouth(ctx, emotion, dna, cx, yc, bodyW, bodyH, radius);

    // Blush
    PetRenderer._drawBlush(ctx, emotion, dna, adjusted, cx, yc, bodyW, bodyH, radius);

    // Sparkle
    if (dna.sparkle > 0) {
      PetRenderer._drawSparkle(ctx, dna.sparkle, cx, yc, bodyW, bodyH);
    }
  }

  static _drawEgg(ctx, palette, cx, cy, radius) {
    const eggW = radius * 0.85;
    const eggH = radius * 1.05;

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + eggH + 8, eggW * 0.6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(cx - eggW * 0.3, cy - eggH * 0.4, eggW * 0.2, cx, cy, eggW);
    grad.addColorStop(0, PetRenderer._lighten(palette.primary, 35));
    grad.addColorStop(1, palette.primary);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, eggW, eggH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PetRenderer._darken(palette.primary, 25);
    ctx.lineWidth = Math.max(2, radius * 0.04);
    ctx.stroke();

    // Zigzag
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = Math.max(1, radius * 0.015);
    ctx.beginPath();
    ctx.moveTo(cx - eggW * 0.5, cy + 5);
    ctx.lineTo(cx - eggW * 0.25, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx + eggW * 0.25, cy - 5);
    ctx.lineTo(cx + eggW * 0.5, cy + 5);
    ctx.stroke();
  }

  static _drawAntenna(ctx, type, cx, cyTop, palette, radius) {
    const dark = PetRenderer._darken(palette.primary, 30);
    if (type === 1) {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(cx, cyTop - radius * 0.15, radius * 0.06, radius * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 2) {
      ctx.strokeStyle = dark;
      ctx.lineWidth = Math.max(2, radius * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cyTop);
      ctx.quadraticCurveTo(cx + radius * 0.13, cyTop - radius * 0.22, cx, cyTop - radius * 0.36);
      ctx.stroke();
    } else if (type === 3) {
      ctx.fillStyle = '#ffd700';
      ctx.font = `${radius * 0.3}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨', cx, cyTop - 2);
    }
  }

  static _drawEyes(ctx, emotion, dna, cx, cy, bodyW, bodyH, radius) {
    const gap = bodyW * 0.32;
    const eyeY = cy - bodyH * 0.18;
    const eyeR = Math.max(3, radius * 0.08);

    if (emotion === 'sleepy') {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, radius * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - gap - eyeR, eyeY);
      ctx.lineTo(cx - gap + eyeR, eyeY);
      ctx.moveTo(cx + gap - eyeR, eyeY);
      ctx.lineTo(cx + gap + eyeR, eyeY);
      ctx.stroke();
      return;
    }
    if (emotion === 'angry') {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, radius * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - gap - eyeR, eyeY - eyeR);
      ctx.lineTo(cx - gap + eyeR, eyeY - eyeR * 0.3);
      ctx.moveTo(cx + gap + eyeR, eyeY - eyeR);
      ctx.lineTo(cx + gap - eyeR, eyeY - eyeR * 0.3);
      ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(cx - gap, eyeY + 3, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + gap, eyeY + 3, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
      return;
    }

    // happy/normal vary by DNA eyeStyle
    if (emotion === 'happy' || emotion === 'playing' || dna.eyeStyle > 0.66) {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(2, radius * 0.04);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - gap - eyeR * 1.2, eyeY);
      ctx.quadraticCurveTo(cx - gap, eyeY - eyeR * 1.5, cx - gap + eyeR * 1.2, eyeY);
      ctx.moveTo(cx + gap - eyeR * 1.2, eyeY);
      ctx.quadraticCurveTo(cx + gap, eyeY - eyeR * 1.5, cx + gap + eyeR * 1.2, eyeY);
      ctx.stroke();
    } else if (dna.eyeStyle > 0.33) {
      // Star eyes
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(cx - gap, eyeY, eyeR * 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + gap, eyeY, eyeR * 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      PetRenderer._drawStar(ctx, cx - gap + eyeR * 0.2, eyeY - eyeR * 0.2, eyeR * 0.55, 5);
      PetRenderer._drawStar(ctx, cx + gap + eyeR * 0.2, eyeY - eyeR * 0.2, eyeR * 0.55, 5);
    } else {
      // Plain dot eyes
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(cx - gap, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + gap, eyeY, eyeR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx - gap + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + gap + eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  static _drawMouth(ctx, emotion, dna, cx, cy, bodyW, bodyH, radius) {
    const FACIAL_EXPR = {
      happy:   { mouthCurve: 0.8 },
      hungry:  { mouthCurve: -0.3 },
      sleepy:  { mouthCurve: 0.1 },
      angry:   { mouthCurve: -0.8 },
      playing: { mouthCurve: 1.0 }
    };
    const curve = (FACIAL_EXPR[emotion] || FACIAL_EXPR.happy).mouthCurve;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = Math.max(1.5, radius * 0.035);
    ctx.lineCap = 'round';
    ctx.beginPath();
    const w = (12 + Math.abs(curve) * 6) * (radius / 60);
    const my = cy + bodyH * 0.2;
    const ctrlY = my + curve * 12 * (radius / 60) + (dna.mouthQuirk - 0.5) * 4;
    ctx.moveTo(cx - w, my);
    ctx.quadraticCurveTo(cx, ctrlY, cx + w, my);
    ctx.stroke();
  }

  static _drawBlush(ctx, emotion, dna, palette, cx, cy, bodyW, bodyH, radius) {
    const FACIAL_EXPR = {
      happy:   0.6, hungry:  0.2, sleepy:  0.3, angry:   0.1, playing: 0.8
    };
    const opacity = FACIAL_EXPR[emotion] || 0.6;
    if (opacity <= 0) return;

    const blushR = (7 + dna.blushSize * 6) * (radius / 60);
    const x = bodyW * 0.55;
    const y = cy + bodyH * 0.05;

    ctx.fillStyle = palette.secondary || '#ffb6c1';
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.ellipse(cx - x, y, blushR, blushR * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + x, y, blushR, blushR * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  static _drawSparkle(ctx, level, cx, cy, bodyW, bodyH) {
    const positions = [
      [cx - bodyW - 5, cy - bodyH * 0.5],
      [cx + bodyW + 5, cy - bodyH * 0.2],
      [cx - bodyW + 10, cy + bodyH]
    ];
    ctx.font = `${bodyW * 0.13}px sans-serif`;
    ctx.textAlign = 'center';
    for (let i = 0; i < Math.min(level, positions.length); i++) {
      const [x, y] = positions[i];
      ctx.globalAlpha = 0.85;
      ctx.fillText('✨', x, y);
    }
    ctx.globalAlpha = 1;
  }

  static _drawStar(ctx, cx, cy, r, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 === 0 ? r : r / 2;
      const a = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  static _lighten(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  static _darken(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  static _shiftHue(hex, deg) {
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
    s *= 100; l *= 100;
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l / 100 - c / 2;
    let rr, gg, bb;
    if (h < 60) [rr, gg, bb] = [c, x, 0];
    else if (h < 120) [rr, gg, bb] = [x, c, 0];
    else if (h < 180) [rr, gg, bb] = [0, c, x];
    else if (h < 240) [rr, gg, bb] = [0, x, c];
    else if (h < 300) [rr, gg, bb] = [x, 0, c];
    else [rr, gg, bb] = [c, 0, x];
    const ri = Math.round((rr + m) * 255);
    const gi = Math.round((gg + m) * 255);
    const bi = Math.round((bb + m) * 255);
    return `#${(ri << 16 | gi << 8 | bi).toString(16).padStart(6, '0')}`;
  }
}
