/**
 * MiniGame - Simple touch-optimized game (Tap Mochi)
 * Ultra-lightweight, 15 seconds, runs inside #mochi-container
 */

export class MiniGame {
  constructor(emotionalSystem) {
    this.emotionalSystem = emotionalSystem;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.score = 0;
    this.startTime = 0;
    this.duration = 15000; // 15 seconds
    this.animationFrame = null;
    this.mochiX = 0;
    this.mochiY = 0;
    this.mochiR = 0;
    this.squish = 1;
    this.targetX = 0;
    this.targetY = 0;
    this._boundHandleInput = this.handleInput.bind(this);
  }

  /**
   * Start game
   */
  start() {
    const container = document.getElementById('mochi-container');
    if (!container) return;

    // Create overlay for the game canvas
    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    overlay.id = 'game-overlay';

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game-canvas';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.touchAction = 'none';

    overlay.appendChild(this.canvas);
    container.appendChild(overlay);

    // Size canvas to container
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width * 2;  // 2x for retina
    this.canvas.height = rect.height * 2;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.ctx = this.canvas.getContext('2d');
    this.running = true;
    this.score = 0;
    this.startTime = Date.now();

    // Mochi position (center)
    this.mochiX = this.canvas.width / 2;
    this.mochiY = this.canvas.height / 2;
    this.mochiR = Math.min(this.canvas.width, this.canvas.height) * 0.22;
    this.targetX = this.mochiX;
    this.targetY = this.mochiY;
    this.squish = 1;

    // Bind input
    this.canvas.addEventListener('click', this._boundHandleInput);
    this.canvas.addEventListener('touchstart', this._boundHandleInput, { passive: true });

    // Start game loop
    this.gameLoop();
  }

  /**
   * Game loop
   */
  gameLoop() {
    if (!this.running) return;

    const elapsed = Date.now() - this.startTime;

    if (elapsed >= this.duration) {
      this.end();
      return;
    }

    this.update(elapsed);
    this.render(elapsed);

    this.animationFrame = requestAnimationFrame(() => this.gameLoop());
  }

  /**
   * Update game state
   * @param {number} elapsed - Elapsed time in ms
   */
  update(elapsed) {
    // Move Mochi to random position every 2 seconds
    if (Math.floor(elapsed / 2000) !== Math.floor((elapsed - 16) / 2000)) {
      const margin = this.mochiR + 20;
      this.targetX = margin + Math.random() * (this.canvas.width - margin * 2);
      this.targetY = margin + Math.random() * (this.canvas.height - margin * 2);
    }

    // Smooth movement
    this.mochiX += (this.targetX - this.mochiX) * 0.08;
    this.mochiY += (this.targetY - this.mochiY) * 0.08;

    // Bounce back squish
    this.squish += (1 - this.squish) * 0.15;
  }

  /**
   * Render game
   */
  render(elapsed) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear with dark background
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    // Grid pattern (Game Boy aesthetic)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Mochi body
    ctx.save();
    ctx.translate(this.mochiX, this.mochiY);
    ctx.scale(this.squish, 2 - this.squish); // squish effect

    ctx.fillStyle = '#FF69B4';
    ctx.shadowColor = 'rgba(255,105,180,0.4)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, this.mochiR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outline
    ctx.strokeStyle = '#e8558a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Happy eyes (arcs)
    const eyeOffset = this.mochiR * 0.3;
    const eyeY = -this.mochiR * 0.15;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left eye arc
    ctx.beginPath();
    ctx.arc(-eyeOffset, eyeY, this.mochiR * 0.12, 0, Math.PI);
    ctx.stroke();

    // Right eye arc
    ctx.beginPath();
    ctx.arc(eyeOffset, eyeY, this.mochiR * 0.12, 0, Math.PI);
    ctx.stroke();

    // Mouth (smile)
    ctx.beginPath();
    ctx.arc(0, this.mochiR * 0.15, this.mochiR * 0.2, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Blush
    ctx.fillStyle = 'rgba(255,158,197,0.5)';
    ctx.beginPath();
    ctx.ellipse(-eyeOffset * 1.4, this.mochiR * 0.18, this.mochiR * 0.12, this.mochiR * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(eyeOffset * 1.4, this.mochiR * 0.18, this.mochiR * 0.12, this.mochiR * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // UI: Score
    const scale = w / 400;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${24 * scale}px 'Outfit', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`🍡 ${this.score}`, 20 * scale, 40 * scale);

    // UI: Timer
    const remaining = Math.ceil((this.duration - elapsed) / 1000);
    ctx.textAlign = 'right';
    ctx.fillStyle = remaining <= 5 ? '#f87171' : '#fff';
    ctx.fillText(`${remaining}s`, w - 20 * scale, 40 * scale);

    // UI: Instruction
    ctx.textAlign = 'center';
    ctx.font = `${14 * scale}px 'Outfit', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Tap Mochi!', w / 2, h - 20 * scale);
  }

  /**
   * Handle touch/click input
   * @param {Event} event - Click/touch event
   */
  handleInput(event) {
    if (!this.running) return;
    event.preventDefault?.();

    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = (clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (clientY - rect.top) * (this.canvas.height / rect.height);

    // Check if hit Mochi
    const dx = x - this.mochiX;
    const dy = y - this.mochiY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.mochiR * 1.2) {
      this.score++;
      this.squish = 0.7; // visual feedback

      // Move to new random position immediately
      const margin = this.mochiR + 20;
      this.targetX = margin + Math.random() * (this.canvas.width - margin * 2);
      this.targetY = margin + Math.random() * (this.canvas.height - margin * 2);
    }
  }

  /**
   * End game
   */
  end() {
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Show final score overlay
    if (this.ctx) {
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const scale = w / 400;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${32 * scale}px 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🎮 Game Over!', w / 2, h / 2 - 30 * scale);

      ctx.font = `${24 * scale}px 'Outfit', sans-serif`;
      ctx.fillStyle = '#FF69B4';
      ctx.fillText(`Score: ${this.score} 🍡`, w / 2, h / 2 + 20 * scale);

      ctx.font = `${14 * scale}px 'Outfit', sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Returning in 3s...', w / 2, h / 2 + 60 * scale);
    }

    // Increase mood based on score
    this.emotionalSystem.adjustMood(Math.min(this.score * 2, 30));
    this.emotionalSystem.adjustEnergy(-5);

    // Remove events
    if (this.canvas) {
      this.canvas.removeEventListener('click', this._boundHandleInput);
      this.canvas.removeEventListener('touchstart', this._boundHandleInput);
    }

    // Clean up after 3 seconds
    setTimeout(() => {
      const overlay = document.getElementById('game-overlay');
      if (overlay) overlay.remove();
    }, 3000);
  }
}
