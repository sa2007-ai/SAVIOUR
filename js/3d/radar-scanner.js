/**
 * Radar Scanner Canvas Effect for SAVIOUR
 * Renders glowing scanning sweeps and radar dots for Lost & Found search tracking.
 */

export class RadarScanner {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.angle = 0;
    this.blips = [];
    this.animId = null;

    this.resize();
    this.generateBlips();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * (window.devicePixelRatio || 1);
    this.canvas.height = rect.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    this.width = rect.width;
    this.height = rect.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.maxRadius = Math.min(this.centerX, this.centerY) - 10;
  }

  generateBlips() {
    this.blips = [
      { angle: 0.8, distance: 0.45, opacity: 0, label: 'Library' },
      { angle: 2.3, distance: 0.70, opacity: 0, label: 'Cafeteria' },
      { angle: 4.1, distance: 0.55, opacity: 0, label: 'ECE Lab' },
      { angle: 5.2, distance: 0.85, opacity: 0, label: 'Hostel B' }
    ];
  }

  start() {
    const loop = () => {
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  draw() {
    if (!this.ctx) return;
    const { ctx, width, height, centerX, centerY, maxRadius } = this;

    // Clear background with soft alpha trail
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.fillRect(0, 0, width, height);

    // Draw concentric radar rings
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 1;

    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 4) * r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();

    // Radar Sweep Cone
    this.angle += 0.035;
    if (this.angle > Math.PI * 2) this.angle = 0;

    const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    sweepGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    sweepGradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, maxRadius, this.angle - 0.4, this.angle);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
    ctx.fill();
    ctx.restore();

    // Sweep Line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(this.angle) * maxRadius,
      centerY + Math.sin(this.angle) * maxRadius
    );
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw and pulse detected blips
    this.blips.forEach(blip => {
      const bx = centerX + Math.cos(blip.angle) * (maxRadius * blip.distance);
      const by = centerY + Math.sin(blip.angle) * (maxRadius * blip.distance);

      // Check if sweep line passed near the blip
      const angleDiff = Math.abs(this.angle - blip.angle);
      if (angleDiff < 0.1 || angleDiff > Math.PI * 2 - 0.1) {
        blip.opacity = 1.0;
      } else {
        blip.opacity = Math.max(0.15, blip.opacity - 0.015);
      }

      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${blip.opacity})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${blip.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (blip.opacity > 0.5) {
        ctx.fillStyle = `rgba(226, 232, 240, ${blip.opacity})`;
        ctx.font = '10px sans-serif';
        ctx.fillText(blip.label, bx + 6, by - 4);
      }
    });

    // Center Hub Dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
