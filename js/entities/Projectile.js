/**
 * Catnip Warships — Projectile Entity (Cannons, Torpedoes, Lasers)
 */
class Projectile {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.damage = config.damage || 20;
    this.owner = config.owner;
    this.team = config.owner ? config.owner.team : 'blue';
    this.color = config.color || '#ffff00';
    this.radius = config.radius || 4;
    this.range = config.range || 800;
    this.distanceTraveled = 0;
    this.isDestroyed = false;

    // Special Flags
    this.isTorpedo = config.isTorpedo || false;
    this.isHoming = config.isHoming || false;
    this.isLaserBeam = config.isLaserBeam || false;
    this.isAA = config.isAA || false;
    this.armorPierce = config.armorPierce || 0;
    this.explosive = config.explosive || false;
    this.piercing = config.piercing || false;
    this.stealth = config.stealth || false;
  }

  update(dt, world) {
    if (this.isDestroyed) return;

    // 1. Homing Logic for Dark Torpedoes
    if (this.isHoming && world) {
      let target = world.findNearestEnemy(this);
      if (target && !target.isDestroyed) {
        const targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        const speed = Math.hypot(this.vx, this.vy);
        const currentAngle = Math.atan2(this.vy, this.vx);
        let newAngle = currentAngle + Math.sign(targetAngle - currentAngle) * Math.min(Math.abs(targetAngle - currentAngle), 2.5 * dt);
        this.vx = Math.cos(newAngle) * speed;
        this.vy = Math.sin(newAngle) * speed;
      }
    }

    // 2. Position Increment
    const moveDist = Math.hypot(this.vx, this.vy) * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.distanceTraveled += moveDist;

    // 3. Exceed Range Check
    if (this.distanceTraveled >= this.range) {
      this.isDestroyed = true;
    }

    // 4. Island Collision Check
    if (world && world.map) {
      const islandHit = world.map.checkIslandCollision(this.x, this.y, this.radius);
      if (islandHit.collided) {
        this.isDestroyed = true;
        if (window.Renderer) {
          Renderer.addParticleBurst(this.x, this.y, '#e9c46a', 6);
        }
      }
    }
  }

  draw(ctx, camera) {
    if (this.isDestroyed) return;

    const screenX = this.x - camera.getRenderOffsetX();
    const screenY = this.y - camera.getRenderOffsetY();

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;

    if (this.isLaserBeam) {
      // Long Laser Beam Trail
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(screenX, screenY);
      ctx.rotate(angle);
      ctx.fillStyle = '#4cc9f0';
      ctx.fillRect(-60, -this.radius, 120, this.radius * 2);
    } else if (this.isTorpedo) {
      // Torpedo oval shape with bubble trail
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Ballistic Cannon Shell with Glowing Tracer Streak
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(screenX, screenY);
      ctx.rotate(angle);

      // Shell Tracer Trail (Glowing streak behind shell)
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(2, this.radius * 0.85);
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Glowing White-Hot Shell Core Tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.8, this.radius * 0.65), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
