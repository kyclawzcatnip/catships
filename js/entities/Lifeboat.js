/**
 * Catnip Warships — Lifeboat Entity (Spawned from Sinking Ships)
 * Inflatable yellow/orange rafts carrying cat survivors drifting to safety.
 */
class Lifeboat {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.team = config.team || 'blue';
    this.lifeTimer = 18.0; // 18 seconds drifting before paddling to safety
    this.maxLifeTimer = 18.0;
    this.rotation = Math.atan2(this.vy, this.vx) || (Math.random() * Math.PI * 2);
    this.bobPhase = Math.random() * 10;
    this.isDestroyed = false;
  }

  update(dt) {
    if (this.isDestroyed) return;
    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) {
      this.isDestroyed = true;
      return;
    }

    // Gentle water drag slowing initial escape burst
    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.bobPhase += dt * 2.5;
  }

  draw(ctx, camera) {
    if (this.isDestroyed) return;
    const screenX = this.x - camera.getRenderOffsetX();
    const screenY = this.y - camera.getRenderOffsetY();

    const alpha = Math.min(1.0, this.lifeTimer / 2.0); // Smooth end fade out
    const bobOffset = Math.sin(this.bobPhase) * 2;

    ctx.save();
    ctx.translate(screenX, screenY + bobOffset);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;

    // 1. Water Ripple Ring beneath raft
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11 + Math.sin(this.bobPhase * 0.8) * 2.5, 7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Inflatable Emergency Raft Body 🚣
    ctx.fillStyle = '#ffb703';
    ctx.strokeStyle = '#ff8500';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Survivor Cat Ears & Helmets 🐱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Cat Ear 1
    ctx.moveTo(-2, -3.5);
    ctx.lineTo(0.5, -6.5);
    ctx.lineTo(2.5, -3.5);
    // Cat Ear 2
    ctx.moveTo(-2, 3.5);
    ctx.lineTo(0.5, 6.5);
    ctx.lineTo(2.5, 3.5);
    ctx.fill();

    // Cat Face/Head in raft
    ctx.fillStyle = '#ffcca4';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
