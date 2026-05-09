/**
 * ShareCardSystem - Generate a beautiful PNG "trading card" of the user's
 * Mochi and share it via the Web Share API (with clipboard / download
 * fallbacks). Pure canvas, no backend.
 *
 * Card layout (1080x1920, IG-story friendly):
 *
 *   ┌──────────────────────────┐
 *   │  Background gradient     │
 *   │  Sparkles                │
 *   │       🍡 PET SVG         │
 *   │       Name + Day         │
 *   │       Stage              │
 *   │  Mood ████████░          │
 *   │  Streak 🔥 7             │
 *   │  Traits · Traits         │
 *   │  muracciolei.github.io/  │
 *   │  Mochi/?adopt=<seed>     │
 *   └──────────────────────────┘
 */

import { IdentitySystem } from '../state/IdentitySystem.js';

const W = 1080;
const H = 1920;
const PAGE_URL = 'https://muracciolei.github.io/Mochi/';

export class ShareCardSystem {
  constructor(state, i18n, colorSystem, evolution, personality) {
    this.state = state;
    this.i18n = i18n;
    this.colorSystem = colorSystem;
    this.evolution = evolution;
    this.personality = personality;
  }

  /**
   * Generate a Blob (PNG) of the card.
   */
  async generateBlob() {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const palette = this.colorSystem.getPalette(this.state.getState('colorPreset'));
    const name = this.state.getState('name') || 'Mochi';
    const seed = this.state.getState('dnaSeed') || '00000000';
    const dna = IdentitySystem.decode(seed);
    const ageDays = Math.max(0, Math.floor((Date.now() - (this.state.getState('birthday') || Date.now())) / 86400000));
    const stage = this.evolution.getStage();
    const stageScale = this.evolution.getScaleFor(stage.id);
    const mood = this.state.getState('mood') || 0;
    const moodPct = Math.round(((mood + 100) / 200) * 100);
    const streak = this.state.getState('streak') || { current: 0 };
    const traits = this.personality.formatTraits(this.i18n);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, this.lighten(palette.primary, 25));
    bg.addColorStop(0.55, '#1a1a2e');
    bg.addColorStop(1, '#0a0a14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Sparkles
    this.drawSparkles(ctx, seed);

    // Title bar (Mochi brand)
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍡  Mochi', W / 2, 130);

    // Pet portrait (centered, large)
    this.drawPet(ctx, palette, dna, stage.id, stageScale, W / 2, 660);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 130px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, W / 2, 1180);

    // Subtitle: Day X · Stage
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '52px system-ui, -apple-system, sans-serif';
    const stageName = this.i18n.t(`stage.${stage.id}`);
    const dayLabel = this.i18n.t(ageDays === 1 ? 'ui.day' : 'ui.days');
    ctx.fillText(`${dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)} ${ageDays} · ${stageName}`, W / 2, 1260);

    // Stats card
    this.drawStatsBlock(ctx, {
      moodPct,
      streak: streak.current || 0,
      traits,
      palette
    });

    // URL footer
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${PAGE_URL}?adopt=${seed}`, W / 2, 1850);

    return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }

  drawPet(ctx, palette, dna, stageId, scale, cx, cy) {
    const radius = 280 * scale;

    // Egg stage: just an egg shape with sparkles, no face yet
    if (stageId === 'egg') {
      ctx.save();
      ctx.translate(cx, cy);
      const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.4, radius * 0.2, 0, 0, radius);
      grad.addColorStop(0, this.lighten(palette.primary, 35));
      grad.addColorStop(1, palette.primary);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.85, radius * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.darken(palette.primary, 25);
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Body
    ctx.save();
    ctx.translate(cx, cy);
    const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.4, radius * 0.2, 0, 0, radius);
    grad.addColorStop(0, this.lighten(palette.primary, 30));
    grad.addColorStop(1, palette.primary);
    ctx.fillStyle = grad;
    const bodyW = radius * (0.95 + dna.bodyShape * 0.15);
    const bodyH = radius * (1.0 - dna.bodyShape * 0.1);
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.darken(palette.primary, 25);
    ctx.lineWidth = 8;
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(-bodyW * 0.3, -bodyH * 0.4, bodyW * 0.18, bodyH * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antenna based on DNA
    if (dna.antenna === 1) {
      ctx.fillStyle = this.darken(palette.primary, 30);
      ctx.beginPath();
      ctx.ellipse(0, -bodyH - 15, 12, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (dna.antenna === 2) {
      ctx.strokeStyle = this.darken(palette.primary, 30);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, -bodyH);
      ctx.quadraticCurveTo(20, -bodyH - 30, 0, -bodyH - 50);
      ctx.stroke();
    } else if (dna.antenna === 3) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', 0, -bodyH - 10);
    }

    // Eyes (vary by DNA eyeStyle)
    const eyeGap = bodyW * 0.32;
    const eyeY = -bodyH * 0.15;
    if (dna.eyeStyle < 0.33) {
      // Round dot eyes
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-eyeGap, eyeY, 18, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeGap, eyeY, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-eyeGap + 6, eyeY - 6, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeGap + 6, eyeY - 6, 5, 0, Math.PI * 2); ctx.fill();
    } else if (dna.eyeStyle < 0.66) {
      // Curved happy eyes ∪
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-eyeGap - 22, eyeY);
      ctx.quadraticCurveTo(-eyeGap, eyeY - 30, -eyeGap + 22, eyeY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(eyeGap - 22, eyeY);
      ctx.quadraticCurveTo(eyeGap, eyeY - 30, eyeGap + 22, eyeY);
      ctx.stroke();
    } else {
      // Sparkly star eyes
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(-eyeGap, eyeY, 22, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeGap, eyeY, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      this.drawStar(ctx, -eyeGap + 4, eyeY - 4, 9, 5);
      this.drawStar(ctx, eyeGap + 4, eyeY - 4, 9, 5);
    }

    // Mouth (varies by mouthQuirk)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const mw = bodyW * 0.18;
    const my = bodyH * 0.2;
    const curveY = my + 30 + dna.mouthQuirk * 20;
    ctx.moveTo(-mw, my);
    ctx.quadraticCurveTo(0, curveY, mw, my);
    ctx.stroke();

    // Blush
    if (dna.blushSize > 0.2) {
      ctx.fillStyle = palette.secondary || '#ffb6c1';
      ctx.globalAlpha = 0.55;
      const blushR = 22 + dna.blushSize * 22;
      ctx.beginPath(); ctx.ellipse(-bodyW * 0.55, my - 20, blushR, blushR * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bodyW * 0.55, my - 20, blushR, blushR * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius / 2;
      const a = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawSparkles(ctx, seed) {
    // Deterministic sparkle pattern from seed
    const n = parseInt(seed, 16) || 0;
    let s = n;
    function rand() {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    }
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 1 + rand() * 3;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawStatsBlock(ctx, { moodPct, streak, traits, palette }) {
    const x = 100;
    const y = 1380;
    const w = W - 200;
    const h = 380;

    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    this.roundRect(ctx, x, y, w, h, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mood
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${this.i18n.t('share.mood')}`, x + 50, y + 70);
    ctx.textAlign = 'right';
    ctx.fillText(`${moodPct}/100`, x + w - 50, y + 70);

    // Mood bar
    const barX = x + 50;
    const barY = y + 95;
    const barW = w - 100;
    const barH = 22;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.roundRect(ctx, barX, barY, barW, barH, 11);
    ctx.fill();
    const moodGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    moodGrad.addColorStop(0, '#f87171');
    moodGrad.addColorStop(0.5, '#fbbf24');
    moodGrad.addColorStop(1, '#4ade80');
    ctx.fillStyle = moodGrad;
    this.roundRect(ctx, barX, barY, (barW * moodPct) / 100, barH, 11);
    ctx.fill();

    // Streak
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔥  ${this.i18n.t('share.streak')}`, x + 50, y + 200);
    ctx.textAlign = 'right';
    ctx.fillText(`${streak}`, x + w - 50, y + 200);

    // Traits
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'italic 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(traits || '·', x + 50, y + 300);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /**
   * Share via Web Share API. Falls back to download + clipboard URL.
   */
  async share() {
    const blob = await this.generateBlob();
    const name = this.state.getState('name') || 'Mochi';
    const ageDays = Math.max(0, Math.floor((Date.now() - (this.state.getState('birthday') || Date.now())) / 86400000));
    const seed = this.state.getState('dnaSeed') || '00000000';
    const adoptUrl = `${PAGE_URL}?adopt=${seed}`;
    const text = this.i18n.t('share.text', { name, days: ageDays }) + ' ' + adoptUrl;

    const file = new File([blob], `mochi-${name}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${name} 🍡`,
          text
        });
        return { ok: true, method: 'share' };
      } catch (e) {
        if (e.name === 'AbortError') return { ok: false, method: 'cancelled' };
        // fall through to download
      }
    }

    // Fallback: download the PNG + copy text to clipboard
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mochi-${name}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    try {
      await navigator.clipboard.writeText(text);
    } catch { /* ignore */ }

    return { ok: true, method: 'download' };
  }

  // ─── Color utils ───
  lighten(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }
  darken(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent / 100));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }
}
