/**
 * Catnip Warships — Advanced Aircraft Entity (Free-Roaming Strike Aircraft & Playable Fighter Jets)
 */
class Aircraft {
  constructor(config) {
    this.owner = config.owner;
    this.team = config.team || 'blue';
    this.type = config.type || 'CatFighter';
    this.color = config.color || '#00e5ff';
    this.damage = config.damage || 35;
    this.isPlayerControlled = config.isPlayerControlled || false;

    this.x = config.x || (this.owner ? this.owner.x : 1000);
    this.y = config.y || (this.owner ? this.owner.y : 1000);
    this.rotation = Math.random() * Math.PI * 2;
    this.speed = 350; // High speed jet flight
    this.hp = 120;
    this.maxHp = 120;
    this.length = 32;
    this.width = 24;

    this.targetEntity = null;
    this.lifeTimer = 35.0; // 35 seconds active combat sortie
    this.isDestroyed = false;
    this.fireCooldown = 0.6;
    this.missileCooldown = 3.5;
  }

  takeDamage(amount) {
    if (this.isDestroyed) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;
      if (window.AudioSystem) AudioSystem.playExplosion();
      if (window.Renderer) {
        Renderer.addParticleBurst(this.x, this.y, '#ffb703', 20);
        Renderer.addFloatingText(this.x, this.y - 30, '💥 AIRCRAFT SHOT DOWN!', '#ff3366');
      }
    }
  }

  update(dt, world, inputHandler) {
    if (this.isDestroyed) return;

    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) {
      this.isDestroyed = true;
      return;
    }

    if (this.isPlayerControlled && inputHandler) {
      // --- PLAYER DIRECT AIRCRAFT FLIGHT ENGINE (100% Independent from Ship Controls!) ---
      this.lifeTimer = 9999; // Infinite flight timer while player is piloting

      const k = inputHandler.keys || {};
      const up = !!(k['KeyW'] || k['ArrowUp']);
      const down = !!(k['KeyS'] || k['ArrowDown']);
      const left = !!(k['KeyA'] || k['ArrowLeft']);
      const right = !!(k['KeyD'] || k['ArrowRight']);

      let targetAngle = this.rotation;
      let hasInput = false;

      if (up && left) {
        targetAngle = -Math.PI * 0.75; // Up-Left
        hasInput = true;
      } else if (up && right) {
        targetAngle = -Math.PI * 0.25; // Up-Right
        hasInput = true;
      } else if (down && left) {
        targetAngle = Math.PI * 0.75; // Down-Left
        hasInput = true;
      } else if (down && right) {
        targetAngle = Math.PI * 0.25; // Down-Right
        hasInput = true;
      } else if (up) {
        targetAngle = -Math.PI * 0.5; // Up (-90 deg)
        hasInput = true;
      } else if (down) {
        targetAngle = Math.PI * 0.5; // Down (+90 deg)
        hasInput = true;
      } else if (left) {
        targetAngle = Math.PI; // Left (180 deg)
        hasInput = true;
      } else if (right) {
        targetAngle = 0; // Right (0 deg)
        hasInput = true;
      }

      // Smooth Jet Turn Interpolation (Direct 9.0 * dt response rate)
      if (hasInput) {
        const angleDiff = Math.atan2(Math.sin(targetAngle - this.rotation), Math.cos(targetAngle - this.rotation));
        this.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 9.0 * dt);
      }

      // Jet Forward Velocity (2x Slower Precision Flight Speed: 210 px/sec)
      this.speed = 210;
      this.x += Math.cos(this.rotation) * this.speed * dt;
      this.y += Math.sin(this.rotation) * this.speed * dt;

      // Keep Fighter Jet inside Map Boundaries
      this.x = Math.max(100, Math.min(CONFIG.MAP_WIDTH - 100, this.x));
      this.y = Math.max(100, Math.min(CONFIG.MAP_HEIGHT - 100, this.y));

      // Player Firing Gatling Cannon
      this.fireCooldown -= dt;
      const spacePressed = inputHandler.consumeSpaceTrigger() || (inputHandler.keys && inputHandler.keys['Space']);
      if ((inputHandler.mouse.isDown || spacePressed) && this.fireCooldown <= 0) {
        this.fireCooldown = 0.10; // Rapid Gatling cannon Fire
        if (window.AudioSystem) AudioSystem.playPew();
        world.addProjectile(new Projectile({
          x: this.x + Math.cos(this.rotation) * 20,
          y: this.y + Math.sin(this.rotation) * 20,
          vx: Math.cos(this.rotation) * 1100,
          vy: Math.sin(this.rotation) * 1100,
          damage: 25,
          owner: this,
          color: '#ffd700',
          radius: 3.5,
          range: 850
        }));
      }

      // Player Firing Sidewinder Homing Missile
      this.missileCooldown -= dt;
      const abilityPressed = inputHandler.consumeAbilityTrigger() || (inputHandler.keys && inputHandler.keys['KeyE']);
      if (abilityPressed && this.missileCooldown <= 0) {
        this.missileCooldown = 2.5;
        world.addProjectile(new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(this.rotation) * 650,
          vy: Math.sin(this.rotation) * 650,
          damage: 90,
          owner: this,
          color: '#ff3366',
          radius: 5,
          range: 1300,
          isTorpedo: true,
          isHoming: true
        }));
        if (window.Renderer) {
          Renderer.addFloatingText(this.x, this.y - 30, '🚀 SIDEWINDER MISSILE!', '#ff3366');
        }
      }
    } else {
      // --- AI FREE-ROAMING STRIKE SORTIE MODE ---
      // Search for nearest enemy ship across the ENTIRE map
      if (!this.targetEntity || this.targetEntity.isDestroyed) {
        this.targetEntity = world ? world.findNearestEnemy(this) : null;
      }

      let desiredAngle = this.rotation;

      if (this.targetEntity && !this.targetEntity.isDestroyed) {
        const distToTarget = this.distanceTo(this.targetEntity);
        desiredAngle = Math.atan2(this.targetEntity.y - this.y, this.targetEntity.x - this.x);

        // Perform aggressive high-speed strafing pass over target
        if (distToTarget < 350) {
          this.fireCooldown -= dt;
          if (this.fireCooldown <= 0) {
            this.fireCooldown = 0.8;
            world.addProjectile(new Projectile({
              x: this.x,
              y: this.y,
              vx: Math.cos(desiredAngle) * 850,
              vy: Math.sin(desiredAngle) * 850,
              damage: this.damage,
              owner: this.owner || this,
              color: this.color,
              radius: 4,
              range: 700
            }));
          }
        }
      } else if (this.owner && !this.owner.isDestroyed) {
        // Orbit carrier if no enemies active
        const orbitAngle = Math.atan2(this.y - this.owner.y, this.x - this.owner.x) + 1.2 * dt;
        const targetX = this.owner.x + Math.cos(orbitAngle) * 220;
        const targetY = this.owner.y + Math.sin(orbitAngle) * 220;
        desiredAngle = Math.atan2(targetY - this.y, targetX - this.x);
      }

      // Smooth AI Jet Turn towards target
      const angleDiff = Math.atan2(Math.sin(desiredAngle - this.rotation), Math.cos(desiredAngle - this.rotation));
      this.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 3.2 * dt);

      // Jet Forward Velocity
      this.x += Math.cos(this.rotation) * this.speed * dt;
      this.y += Math.sin(this.rotation) * this.speed * dt;
    }

    // Boundary Wrap/Clamp
    this.x = Math.max(50, Math.min(CONFIG.MAP_WIDTH - 50, this.x));
    this.y = Math.max(50, Math.min(CONFIG.MAP_HEIGHT - 50, this.y));
  }

  distanceTo(target) {
    if (!target) return Infinity;
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    return Math.hypot(dx, dy);
  }

  draw(ctx, camera) {
    if (this.isDestroyed) return;
    const screenX = this.x - camera.getRenderOffsetX();
    const screenY = this.y - camera.getRenderOffsetY();

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    const isShadow = (this.type === 'ShadowDrone');

    // 1. Dual Jet Engine Afterburner Thrust Flames & Smoke Trails
    ctx.fillStyle = isShadow ? 'rgba(157, 78, 221, 0.9)' : 'rgba(255, 140, 0, 0.95)';
    const flameL = 12 + Math.sin(Date.now() * 0.04) * 4;
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-10 - flameL, -3);
    ctx.lineTo(-10, -2);
    ctx.moveTo(-10, 2);
    ctx.lineTo(-10 - flameL, 3);
    ctx.lineTo(-10, 4);
    ctx.fill();

    // 2. High-Detail Modern Jet Airframe (F-22 Raptor / Stealth Interceptor)
    ctx.fillStyle = isShadow ? '#1b003a' : '#1c2541';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    if (isShadow) {
      // Stealth Diamond Wing Drone
      ctx.moveTo(18, 0);   // Sharp stealth nose
      ctx.lineTo(6, -5);   // Intake right
      ctx.lineTo(-2, -18); // Right stealth wingtip
      ctx.lineTo(-6, -8);  // Right trailing edge
      ctx.lineTo(-12, -7); // Right vertical stabilizer
      ctx.lineTo(-10, 0);  // Tail center notch
      ctx.lineTo(-12, 7);  // Left vertical stabilizer
      ctx.lineTo(-6, 8);   // Left trailing edge
      ctx.lineTo(-2, 18);  // Left stealth wingtip
      ctx.lineTo(6, 5);    // Intake left
    } else {
      // Iconic F-22 Fighter Jet Airframe
      ctx.moveTo(22, 0);   // Nose cone
      ctx.lineTo(10, -3);  // Cockpit right
      ctx.lineTo(4, -6);   // Intake right
      ctx.lineTo(-4, -20); // Right main wingtip
      ctx.lineTo(-4, -18); // Wingtip missile rail right
      ctx.lineTo(-8, -7);  // Wing trailing edge right
      ctx.lineTo(-14, -10);// Right tail fin
      ctx.lineTo(-10, 0);  // Dual engine tail center
      ctx.lineTo(-14, 10); // Left tail fin
      ctx.lineTo(-8, 7);   // Wing trailing edge left
      ctx.lineTo(-4, 18);  // Wingtip missile rail left
      ctx.lineTo(-4, 20);  // Left main wingtip
      ctx.lineTo(4, 6);    // Intake left
      ctx.lineTo(10, 3);   // Cockpit left
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Wingtip Sidewinder Missiles (Red / Neon Tips)
    ctx.fillStyle = isShadow ? '#ff007f' : '#ff3366';
    ctx.fillRect(-6, -20, 8, 1.8);
    ctx.fillRect(-6, 18, 8, 1.8);

    // 4. Cockpit Tinted Glass Canopy
    ctx.fillStyle = isShadow ? '#c77dff' : '#00e5ff';
    ctx.beginPath();
    ctx.arc(6, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Cat Pilot Ear Helmet! 🐱
    if (!isShadow) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      // Left Cat Ear
      ctx.moveTo(8, -3);
      ctx.lineTo(12, -7);
      ctx.lineTo(5, -4);
      // Right Cat Ear
      ctx.moveTo(8, 3);
      ctx.lineTo(12, 7);
      ctx.lineTo(5, 4);
      ctx.fill();
    } else {
      // Glowing Stealth Core
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
