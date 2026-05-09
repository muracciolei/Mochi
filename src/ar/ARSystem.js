/**
 * ARSystem - "Augmented reality" mode: live camera feed as backdrop with
 * Mochi rendered on top of it via canvas, plus photo capture.
 *
 * - Back camera (environment): Mochi is centered, full size — "Mochi in your room"
 * - Front camera (selfie/user): Mochi is small, bottom-left, leaving the
 *   right side of the frame for the user
 *
 * Photo capture composites the current video frame with Mochi onto a single
 * canvas, then offers it via Web Share API or download fallback.
 */

import { PetRenderer } from '../share/PetRenderer.js';
import { IdentitySystem } from '../state/IdentitySystem.js';

export class ARSystem {
  constructor({ state, i18n, colorSystem, evolution }) {
    this.state = state;
    this.i18n = i18n;
    this.colorSystem = colorSystem;
    this.evolution = evolution;

    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.facingMode = 'environment'; // 'environment' = back, 'user' = selfie
    this.active = false;
    this._rafId = null;
    this._startTime = 0;
  }

  /**
   * Mount the AR view, request camera permission, and start drawing.
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, error: 'unsupported' };
    }

    this.video = document.getElementById('ar-video');
    this.canvas = document.getElementById('ar-canvas');
    if (!this.video || !this.canvas) return { ok: false, error: 'dom' };

    this.ctx = this.canvas.getContext('2d');

    try {
      await this._openStream();
    } catch (e) {
      console.error('Camera error:', e);
      const msg = (e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'))
        ? 'denied'
        : 'failed';
      return { ok: false, error: msg };
    }

    document.getElementById('ar-overlay').classList.remove('hidden');
    this.active = true;
    this._startTime = Date.now();
    this._loop();

    // Resize canvas to match window on rotation
    this._onResize = () => this._resizeCanvas();
    window.addEventListener('resize', this._onResize);
    this._onOrientation = () => setTimeout(() => this._resizeCanvas(), 200);
    window.addEventListener('orientationchange', this._onOrientation);

    return { ok: true };
  }

  async _openStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    const constraints = {
      video: {
        facingMode: this.facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
    this.video.muted = true;
    this.video.playsInline = true;

    // Mirror only for selfie camera (matches user's expectation)
    this.video.style.transform = (this.facingMode === 'user') ? 'scaleX(-1)' : 'none';

    await this.video.play();
    this._resizeCanvas();
  }

  /**
   * Switch front <-> back camera.
   */
  async flipCamera() {
    this.facingMode = (this.facingMode === 'environment') ? 'user' : 'environment';
    try {
      await this._openStream();
      return true;
    } catch (e) {
      console.warn('Flip failed:', e);
      // Try fallback: just toggle flag back
      this.facingMode = (this.facingMode === 'environment') ? 'user' : 'environment';
      try { await this._openStream(); } catch {}
      return false;
    }
  }

  /**
   * Stop everything and hide overlay.
   */
  stop() {
    this.active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.video) this.video.srcObject = null;
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._onOrientation) window.removeEventListener('orientationchange', this._onOrientation);
    document.getElementById('ar-overlay').classList.add('hidden');
  }

  _resizeCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Compute Mochi position and size based on facingMode + canvas size.
   */
  _layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isSelfie = this.facingMode === 'user';

    if (isSelfie) {
      // Bottom-left so user (right side) is visible
      const radius = Math.min(w, h) * 0.16;
      return {
        cx: radius + 24,
        cy: h - radius - 80,
        radius
      };
    }

    // Back camera: bottom-center, larger
    const radius = Math.min(w, h) * 0.22;
    return {
      cx: w / 2,
      cy: h - radius - 90,
      radius
    };
  }

  _loop() {
    if (!this.active) return;
    this._draw();
    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const palette = this.colorSystem.getPalette(this.state.getState('colorPreset'));
    const seed = this.state.getState('dnaSeed') || '00000000';
    const dna = IdentitySystem.decode(seed);
    const stage = this.evolution.getStage();
    const stageScale = this.evolution.getScaleFor(stage.id);

    const { cx, cy, radius } = this._layout();
    const t = (Date.now() - this._startTime) / 1000;
    const bob = Math.sin(t * 2) * 6; // gentle idle bob

    PetRenderer.drawPet(ctx, {
      palette,
      dna,
      stageId: stage.id,
      cx,
      cy,
      radius: radius * stageScale,
      emotion: this.state.getState('emotion') || 'happy',
      bobOffset: bob
    });
  }

  /**
   * Capture a still: draw video + Mochi to a fresh canvas, return a Blob.
   */
  async capture() {
    if (!this.video || !this.video.videoWidth) return null;

    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');

    // Draw video frame (mirror for selfie to match what user saw)
    octx.save();
    if (this.facingMode === 'user') {
      octx.translate(w, 0);
      octx.scale(-1, 1);
    }
    octx.drawImage(this.video, 0, 0, w, h);
    octx.restore();

    // Compute Mochi position in *video* coordinates (not screen).
    // Use same proportional layout as _layout() but mapped to video pixels.
    const isSelfie = this.facingMode === 'user';
    let cx, cy, radius;
    if (isSelfie) {
      radius = Math.min(w, h) * 0.16;
      cx = radius + 30;
      cy = h - radius - 60;
    } else {
      radius = Math.min(w, h) * 0.22;
      cx = w / 2;
      cy = h - radius - 70;
    }

    const palette = this.colorSystem.getPalette(this.state.getState('colorPreset'));
    const seed = this.state.getState('dnaSeed') || '00000000';
    const dna = IdentitySystem.decode(seed);
    const stage = this.evolution.getStage();
    const stageScale = this.evolution.getScaleFor(stage.id);

    PetRenderer.drawPet(octx, {
      palette,
      dna,
      stageId: stage.id,
      cx,
      cy,
      radius: radius * stageScale,
      emotion: this.state.getState('emotion') || 'happy'
    });

    // Watermark: name + Mochi badge bottom-right
    const name = this.state.getState('name') || 'Mochi';
    octx.fillStyle = 'rgba(0,0,0,0.45)';
    const badgeText = `🍡 ${name}`;
    const fontSize = Math.round(h * 0.035);
    octx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    const padding = fontSize * 0.4;
    const textWidth = octx.measureText(badgeText).width;
    const badgeX = w - textWidth - padding * 4;
    const badgeY = h - fontSize - padding * 2;
    octx.beginPath();
    const r = fontSize * 0.4;
    octx.moveTo(badgeX + r, badgeY);
    octx.arcTo(badgeX + textWidth + padding * 2, badgeY, badgeX + textWidth + padding * 2, badgeY + fontSize + padding, r);
    octx.arcTo(badgeX + textWidth + padding * 2, badgeY + fontSize + padding, badgeX, badgeY + fontSize + padding, r);
    octx.arcTo(badgeX, badgeY + fontSize + padding, badgeX, badgeY, r);
    octx.arcTo(badgeX, badgeY, badgeX + textWidth + padding * 2, badgeY, r);
    octx.closePath();
    octx.fill();
    octx.fillStyle = '#fff';
    octx.fillText(badgeText, badgeX + padding, badgeY + fontSize + padding * 0.2);

    return await new Promise(resolve => out.toBlob(resolve, 'image/png'));
  }

  /**
   * Capture and share.
   * @returns {Promise<{ok, method, error?}>}
   */
  async captureAndShare() {
    try {
      const blob = await this.capture();
      if (!blob) return { ok: false, error: 'capture' };

      const name = this.state.getState('name') || 'Mochi';
      const seed = this.state.getState('dnaSeed') || '00000000';
      const url = `https://muracciolei.github.io/Mochi/?adopt=${seed}`;
      const text = this.i18n.t('share.text', {
        name,
        days: Math.max(0, Math.floor((Date.now() - (this.state.getState('birthday') || Date.now())) / 86400000))
      }) + ' ' + url;

      const file = new File([blob], `mochi-photo-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${name} 🍡`, text });
          return { ok: true, method: 'share' };
        } catch (e) {
          if (e.name === 'AbortError') return { ok: false, method: 'cancelled' };
        }
      }

      // Fallback: download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `mochi-photo-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      try { await navigator.clipboard.writeText(text); } catch {}
      return { ok: true, method: 'download' };
    } catch (e) {
      console.error('Capture share failed:', e);
      return { ok: false, error: 'unknown' };
    }
  }
}
