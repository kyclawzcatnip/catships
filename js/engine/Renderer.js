/**
 * Catnip Warships — Vector Renderer Engine (Multi-Turret Deck Alignment)
 */
class RendererEngine {
  constructor() {
    this.floatingTexts = [];
    this.particles = [];
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    this.floatingTexts.push({
      x, y, text, color,
      life: 1.2,
      maxLife: 1.2,
      vy: -30
    });
  }

  addParticleBurst(x, y, color, count = 15) {
    if (this.particles.length > 120) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push(new Particle({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        radius: 2 + Math.random() * 4,
        life: 0.4 + Math.random() * 0.5
      }));
    }
  }

  addMuzzleFlash(x, y, angle, color = '#ff9e00') {
    if (this.particles.length > 100) return;
    for (let i = 0; i < 4; i++) {
      const spread = angle + (Math.random() - 0.5) * 0.4;
      const speed = 80 + Math.random() * 120;
      this.particles.push(new Particle({
        x, y,
        vx: Math.cos(spread) * speed,
        vy: Math.sin(spread) * speed,
        color: Math.random() > 0.4 ? '#ffb703' : color,
        radius: 2.5 + Math.random() * 2,
        life: 0.15 + Math.random() * 0.15
      }));
    }
  }

  update(dt) {
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      if (ft) {
        ft.life -= dt;
        ft.y += ft.vy * dt;
      }
    }
    this.floatingTexts = this.floatingTexts.filter(ft => ft && ft.life > 0);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p) {
        p.update(dt);
      }
    }
    this.particles = this.particles.filter(p => p && p.life > 0);
  }

  /**
   * Draw Ship Entity
   */
  drawShip(ctx, ship, camera) {
    if (!ship || ship.isDestroyed) return;

    const screenX = ship.x - camera.getRenderOffsetX();
    const screenY = ship.y - camera.getRenderOffsetY();

    ctx.save();
    ctx.translate(screenX, screenY);

    // 1. Water Wake Foam behind moving ship
    if (Math.abs(ship.currentSpeed) > 10) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(-ship.length * 0.4, 0, ship.width * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Target Lock Crosshair
    if (ship.isLockedTarget) {
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, ship.length * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Shield / Invulnerability Aura / Infinity Forcefield Matrix
    if (ship.buffs && (ship.buffs.infinity || ship.buffs.invulnerable || ship.buffs.shield || ship.buffs.warcry)) {
      ctx.strokeStyle = (ship.buffs.infinity || ship.buffs.invulnerable) ? '#ffd700' : (ship.data.isDark ? '#9d4edd' : '#00e5ff');
      ctx.fillStyle = ship.buffs.infinity ? 'rgba(255, 215, 0, 0.2)' : 'transparent';
      ctx.shadowColor = ship.buffs.infinity ? '#ffd700' : 'transparent';
      ctx.shadowBlur = ship.buffs.infinity ? 18 : 0;
      ctx.lineWidth = 3;
      if (ship.buffs.infinity) ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, ship.length * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    // 4. Stealth Shadow Blur Effect
    if (ship.isSubmerged) {
      ctx.globalAlpha = 0.35;
    } else if (ship.buffs && ship.buffs.stealth) {
      ctx.globalAlpha = 0.4;
    }

    // Rotate context to ship angle
    ctx.rotate(ship.rotation);

    // 5. Ship Hull Drawing
    const halfL = ship.length / 2;
    const halfW = ship.width / 2;

    ctx.fillStyle = ship.data.color;
    ctx.strokeStyle = ship.data.isDark ? '#240046' : '#ffffff';
    ctx.lineWidth = 2;

    // Pointed Bow (Front) & Sleek Stern (Back)
    ctx.beginPath();
    ctx.moveTo(halfL, 0); // Bow tip
    ctx.lineTo(halfL * 0.4, halfW); // Right shoulder
    ctx.lineTo(-halfL * 0.8, halfW * 0.8); // Rear right
    ctx.lineTo(-halfL * 0.8, -halfW * 0.8); // Rear left
    ctx.lineTo(halfL * 0.4, -halfW); // Left shoulder
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6. Deck Bridge & CAT EARS!
    ctx.fillStyle = ship.team === 'blue' ? '#00e5ff' : '#ff4d4d';
    // Shift cabin bridge slightly so it doesn't overlap midship turret
    ctx.fillRect(-halfL * 0.35, -halfW * 0.4, halfL * 0.3, halfW * 0.8);

    // Cute Cat Ears on Bridge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-halfL * 0.25, -halfW * 0.4);
    ctx.lineTo(-halfL * 0.15, -halfW * 0.8);
    ctx.lineTo(-halfL * 0.1, -halfW * 0.4);
    ctx.moveTo(-halfL * 0.25, halfW * 0.4);
    ctx.lineTo(-halfL * 0.15, halfW * 0.8);
    ctx.lineTo(-halfL * 0.1, halfW * 0.4);
    ctx.fill();

    // 7. Paw Print Emblem on Deck
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-halfL * 0.6, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // 8. DRAW ROTATING CANNON TURRETS (1, 2, OR 3 TURRETS ON DECK)
    const tCount = ship.data.turretCount || 1;
    let localTurretPositions = [0];

    if (tCount === 2) {
      localTurretPositions = [halfL * 0.4, -halfL * 0.45];
    } else if (tCount === 3) {
      localTurretPositions = [halfL * 0.5, -halfL * 0.05, -halfL * 0.55];
    }

    localTurretPositions.forEach(lx => {
      ctx.save();
      ctx.translate(lx, 0); // Move along local ship deck length
      ctx.rotate(ship.turretAngle - ship.rotation); // Aim turret relative to ship angle

      // 1. Forcefield Shield Visuals
      if (ship.shieldHP > 0 || (ship.buffs && ship.buffs.shieldwall)) {
        ctx.strokeStyle = '#00e5ff';
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, halfL * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Infinity Catnip Golden Forcefield Shield Matrix (Blocks all incoming bullets!)
      if (ship.buffs && ship.buffs.infinity) {
        ctx.strokeStyle = '#ffd700';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, halfL * 1.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // Turret Base Ring
      ctx.fillStyle = '#1c2541';
      ctx.strokeStyle = ship.data.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, tCount > 1 ? 7 : 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cannon Barrels (Dual barrels for multi-turret ships!)
      ctx.fillStyle = '#ffffff';
      if (tCount > 1) {
        ctx.fillRect(0, -3.5, halfL * 0.5, 2.5);
        ctx.fillRect(0, 1.0, halfL * 0.5, 2.5);
      } else {
        ctx.fillRect(0, -2, halfL * 0.7, 4);
      }

      ctx.restore();
    });

    ctx.restore(); // Restore ship rotation & translation

    // 9. Overhead HP Bar
    ctx.save();
    ctx.translate(screenX, screenY - ship.length * 0.7);

    const barW = 50;
    const barH = 6;
    const hpPercent = Math.max(0, ship.hp / ship.maxHp);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-barW / 2, 0, barW, barH);

    ctx.fillStyle = ship.team === 'blue' ? '#39ff14' : '#ff3366';
    ctx.fillRect(-barW / 2, 0, barW * hpPercent, barH);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, 0, barW, barH);

    ctx.font = '700 10px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(ship.data.name, 0, -4);

    ctx.restore();
  }

  drawParticles(ctx, camera) {
    this.drawFX(ctx, camera);
  }

  drawFloatingTexts(ctx, camera) {
    // Handled seamlessly within drawFX
  }

  /**
   * Render FX, Particles & Floating Text
   */
  drawFX(ctx, camera) {
    const renderOffsetX = camera.getRenderOffsetX();
    const renderOffsetY = camera.getRenderOffsetY();

    // Render Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p) p.draw(ctx, renderOffsetX, renderOffsetY);
    }

    // Render Floating Text
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      if (!ft) continue;
      const screenX = ft.x - renderOffsetX;
      const screenY = ft.y - renderOffsetY;

      ctx.save();
      ctx.font = '800 14px "Space Grotesk", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, screenX, screenY);
      ctx.restore();
    }
  }
}

const Renderer = new RendererEngine();
