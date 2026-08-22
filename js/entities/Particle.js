/**
 * Catnip Warships — Particle Entity
 */
class Particle {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.color = config.color || '#ffffff';
    this.radius = config.radius || 3;
    this.life = config.life || 0.5;
    this.maxLife = this.life;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx, offsetX, offsetY) {
    if (this.life <= 0) return;
    const screenX = this.x - offsetX;
    const screenY = this.y - offsetY;

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
