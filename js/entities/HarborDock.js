/**
 * Catnip Warships — In-Battle Harbor Dock Entity (Mid-Battle Island Port & Coastal Batteries)
 * Safe haven docking slip granting +15 HP/s repairs and harbor gun fire support!
 */
class HarborDock {
  constructor(config) {
    this.x = config.x || 1200;
    this.y = config.y || 1200;
    this.team = config.team || 'blue';
    this.dockRadius = 110;
    this.turretAngle = 0;
    this.reloadTimer = 0;
    this.fireCooldown = 1.2;
    this.isDestroyed = false;
  }

  update(dt, world) {
    if (this.isDestroyed || !world) return;

    // 1. Safe Haven Docking Repair & Cooldown Assist for Friendly Blue Ships inside Dock Slip!
    if (world.ships) {
      world.ships.forEach(ship => {
        if (ship && !ship.isDestroyed && !ship.isSinking && ship.team === this.team) {
          const dist = Math.hypot(ship.x - this.x, ship.y - this.y);
          if (dist < this.dockRadius) {
            // Repair +15 HP/sec
            ship.hp = Math.min(ship.maxHp, ship.hp + 15 * dt);

            // Faster ability reload while docked
            if (ship.saCooldownTimer > 0) {
              ship.saCooldownTimer -= dt * 1.5;
            }

            // Repair particles
            if (Math.random() < 0.15 && window.Renderer) {
              Renderer.addParticleBurst(ship.x + (Math.random() - 0.5) * 20, ship.y + (Math.random() - 0.5) * 20, '#00f5d4', 2);
            }
          }
        }
      });
    }

    // 2. Coastal Harbor Flak Gun Auto-Aim & Fire Support
    this.reloadTimer -= dt;
    if (this.reloadTimer <= 0) {
      let target = null;
      let minDist = 750;

      if (world.ships) {
        world.ships.forEach(enemy => {
          if (enemy && !enemy.isDestroyed && enemy.team !== this.team) {
            const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (d < minDist) {
              minDist = d;
              target = enemy;
            }
          }
        });
      }

      if (target) {
        this.reloadTimer = this.fireCooldown;
        this.turretAngle = Math.atan2(target.y - this.y, target.x - this.x);

        if (window.AudioSystem) AudioSystem.playPew();
        world.addProjectile(new Projectile({
          x: this.x + Math.cos(this.turretAngle) * 30,
          y: this.y + Math.sin(this.turretAngle) * 30,
          vx: Math.cos(this.turretAngle) * 850,
          vy: Math.sin(this.turretAngle) * 850,
          damage: 35,
          owner: this,
          color: '#00e5ff',
          radius: 4,
          range: 800
        }));

        if (window.Renderer) {
          Renderer.addMuzzleFlash(this.x + Math.cos(this.turretAngle) * 30, this.y + Math.sin(this.turretAngle) * 30, this.turretAngle);
        }
      }
    }
  }

  draw(ctx, camera) {
    if (this.isDestroyed) return;
    const screenX = this.x - camera.getRenderOffsetX();
    const screenY = this.y - camera.getRenderOffsetY();

    ctx.save();
    ctx.translate(screenX, screenY);

    // 1. Docking Slip Harbor Water Ring
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, this.dockRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Wooden Pier Slips
    ctx.fillStyle = '#8d5b4c';
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 2;

    // Pier 1
    ctx.fillRect(-60, -15, 120, 30);
    ctx.strokeRect(-60, -15, 120, 30);
    // Pier 2
    ctx.fillRect(-15, -60, 30, 120);
    ctx.strokeRect(-15, -60, 30, 120);

    // 3. Central Harbor Lighthouse & Battery Tower
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 4. Coastal Battery Cannon Barrel
    ctx.rotate(this.turretAngle);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -3, 24, 6);

    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.HarborDock = HarborDock;
}
