/**
 * Catnip Warships — Base Ship Entity Class (Multi-Barrel Cannon Firing)
 */
class Ship {
  constructor(data, team = 'blue', x = 0, y = 0) {
    this.data = data || { id: 1, name: 'Warship', type: 'Attacker', hp: 200, da: 25, sp: 5, length: 50, width: 24, icon: '⚓', color: '#00e5ff', turretCount: 1 };
    this.team = team;
    this.x = x;
    this.y = y;
    this.rotation = (team === 'blue') ? 0 : Math.PI;
    this.turretAngle = this.rotation;

    this.length = this.data.length || 50;
    this.width = this.data.width || 24;

    this.maxHp = this.data.hp || 200;
    this.hp = this.maxHp;
    this.damage = this.data.da || 25;
    this.speedRating = this.data.sp || 5;

    this.vx = 0;
    this.vy = 0;
    this.currentSpeed = 0;
    this.targetSpeed = 0;

    this.shieldHP = 0;
    this.maxShieldHP = 150;
    this.buffs = {};

    this.baseReloadTime = 1.0;
    this.primaryReloadTimer = 0;
    this.saCooldownTimer = 0;
    this.abilitiesUsed = 0;
    this.isDestroyed = false;
    this.isPlayer = false;

    this.captainMood = 'normal'; // 'normal', 'happy', 'hit', 'ability'
    this.moodTimer = 0;
  }

  update(dt, world, inputHandler) {
    if (this.isDestroyed) return;

    // 1. Cooldown Timers
    if (this.primaryReloadTimer > 0) this.primaryReloadTimer -= dt;
    if (this.saCooldownTimer > 0) this.saCooldownTimer -= dt;
    if (this.aaReloadTimer > 0) this.aaReloadTimer -= dt;

    if (this.moodTimer > 0) {
      this.moodTimer -= dt;
      if (this.moodTimer <= 0) this.captainMood = 'normal';
    }

    // 2. Update Active Buffs
    for (let key in this.buffs) {
      const buff = this.buffs[key];
      if (buff) {
        buff.duration -= dt;
        if (buff.rate && buff.duration > 0) {
          this.hp = Math.min(this.maxHp, this.hp + buff.rate * dt);
        }
        if (buff.duration <= 0) {
          delete this.buffs[key];
        }
      }
    }

    // Initialize angular velocity if undefined
    if (typeof this.angularVelocity !== 'number') this.angularVelocity = 0;

    // 3. Player Movement Control
    if (this.isPlayer && inputHandler) {
      const sp = this.speedRating || 5;
      const maxSpeed = sp * CONFIG.BASE_SHIP_SPEED;

      if (inputHandler.isForward()) {
        this.targetSpeed = maxSpeed;
      } else if (inputHandler.isBackward()) {
        this.targetSpeed = -maxSpeed * 0.4;
      } else {
        this.targetSpeed = 0;
      }

      const maxTurnSpeed = CONFIG.BASE_TURN_SPEED * 1.4 * (sp / 5);
      let targetAngularVel = 0;
      if (inputHandler.isTurnLeft()) {
        targetAngularVel = -maxTurnSpeed;
      } else if (inputHandler.isTurnRight()) {
        targetAngularVel = maxTurnSpeed;
      }

      // Smooth turn momentum interpolation
      this.angularVelocity += (targetAngularVel - this.angularVelocity) * Math.min(1.0, 12 * dt);
      this.rotation += this.angularVelocity * dt;
    }

    // 4. Physics Velocity Interpolation (Hydrodynamic Drag & Speed Smoothing)
    const smoothFactor = Math.min(1.0, 6.0 * dt);
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * smoothFactor;

    let speedMult = 1.0;
    if (this.buffs.speed) speedMult *= this.buffs.speed.multiplier || 1.4;
    if (this.buffs.siege) speedMult *= 0;
    if (this.buffs.fortress) speedMult *= 0.4;

    const netSpeed = this.currentSpeed * speedMult;
    this.vx = Math.cos(this.rotation) * netSpeed;
    this.vy = Math.sin(this.rotation) * netSpeed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 5. Map Boundaries Clamping
    this.x = Math.max(80, Math.min(CONFIG.MAP_WIDTH - 80, this.x));
    this.y = Math.max(80, Math.min(CONFIG.MAP_HEIGHT - 80, this.y));
  }

  /**
   * Fire Main Cannons (Fires Parallel Shells from 2 or 3 Physical Barrels)
   */
  firePrimary(world) {
    if (!world || this.isDestroyed || this.primaryReloadTimer > 0) return false;

    // Calculate Reload Time considering buffs (Rapid Fire)
    const reloadSpeedMult = this.buffs && this.buffs.rapidfire ? this.buffs.rapidfire.multiplier : 1.0;
    this.primaryReloadTimer = this.baseReloadTime / reloadSpeedMult;

    // Audio SFX
    if (window.AudioSystem) {
      AudioSystem.playCannon();
    }

    // Calculate Damage considering Siege, WarCry, or Infinity Catnip buffs
    let dmg = this.damage;
    if (this.buffs && this.buffs.siege) dmg *= this.buffs.siege.damageMult || 1.6;
    if (this.buffs && this.buffs.warcry) dmg *= this.buffs.warcry.damageMult || 1.3;
    if (this.buffs && this.buffs.infinity) dmg *= this.buffs.infinity.bulletDamageMult || 3.0;

    const angle = this.turretAngle;
    const tCount = this.data.turretCount || 1;
    const halfL = this.length / 2;
    let localTurretPositions = [0];

    if (tCount === 2) {
      localTurretPositions = [halfL * 0.4, -halfL * 0.45];
    } else if (tCount === 3) {
      localTurretPositions = [halfL * 0.5, -halfL * 0.05, -halfL * 0.55];
    }

    // Perpendicular unit vector to firing angle for parallel barrel offsets
    const perpX = Math.cos(angle + Math.PI / 2);
    const perpY = Math.sin(angle + Math.PI / 2);

    localTurretPositions.forEach(lx => {
      const turretWorldX = this.x + Math.cos(this.rotation) * lx;
      const turretWorldY = this.y + Math.sin(this.rotation) * lx;

      // Parallel barrel offsets for 2 or 3 barrel turrets
      let barrelOffsets = [0];
      if (tCount === 2) {
        barrelOffsets = [-3.0, 3.0]; // 2 Parallel Barrels
      } else if (tCount === 3) {
        barrelOffsets = [-4.5, 0, 4.5]; // 3 Parallel Barrels
      }

      const numBarrels = barrelOffsets.length;
      const perShellDmg = Math.max(5, Math.round(dmg / (tCount * numBarrels * 0.5)));

      barrelOffsets.forEach(bOff => {
        const spawnX = turretWorldX + Math.cos(angle) * (this.length * 0.35) + perpX * bOff;
        const spawnY = turretWorldY + Math.sin(angle) * (this.length * 0.35) + perpY * bOff;

        const projectile = new Projectile({
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * 780,
          vy: Math.sin(angle) * 780,
          damage: perShellDmg,
          owner: this,
          color: this.data.color,
          radius: tCount > 1 ? 3.5 : 5.0,
          range: 850
        });

        world.addProjectile(projectile);

        // Realistic Muzzle Flash Sparks
        if (window.Renderer && window.Renderer.addMuzzleFlash) {
          Renderer.addMuzzleFlash(spawnX, spawnY, angle, this.data.color);
        }
      });
    });

    return true;
  }

  /**
   * Fire AA (Anti-Aircraft) Flak Cannons (Key F) auto-aimed at separate incoming aircraft
   */
  fireAA(world) {
    if (!world || this.isDestroyed || !world.aircraft) return false;
    if (this.aaReloadTimer && this.aaReloadTimer > 0) return false;
    this.aaReloadTimer = 0.35;

    const enemyJets = world.aircraft.filter(a => a && !a.isDestroyed && a.team !== this.team);
    if (enemyJets.length === 0) {
      if (this.isPlayer && window.Renderer) {
        Renderer.addFloatingText(this.x, this.y - 45, '⚠️ NO ENEMY AIRCRAFT IN AA RANGE!', '#ff3366');
      }
      return false;
    }

    let firedCount = 0;
    enemyJets.forEach((jet, idx) => {
      if (firedCount >= 3) return;
      const d = Math.hypot(jet.x - this.x, jet.y - this.y);
      if (d <= 800) {
        const aaAngle = Math.atan2(jet.y - this.y, jet.x - this.x);
        const aaProj = new Projectile({
          x: this.x + Math.cos(aaAngle) * 20,
          y: this.y + Math.sin(aaAngle) * 20,
          vx: Math.cos(aaAngle) * 1150,
          vy: Math.sin(aaAngle) * 1150,
          damage: 40,
          owner: this,
          color: '#ffb703',
          radius: 3.5,
          range: 850,
          isAA: true
        });
        world.addProjectile(aaProj);
        if (window.Renderer) {
          Renderer.addMuzzleFlash(this.x, this.y, aaAngle, '#ffb703');
        }
        firedCount++;
      }
    });

    if (firedCount > 0) {
      if (window.AudioSystem) AudioSystem.playCannon();
      if (this.isPlayer && window.Renderer) {
        Renderer.addFloatingText(this.x, this.y - 50, '💥 AA FLAK GUNS ENGAGED!', '#ffb703');
      }
      return true;
    }
    return false;
  }

  useAbility(world) {
    if (this.isDestroyed || this.saCooldownTimer > 0) return false;
    const success = ABILITIES.triggerAbility(this, world);
    if (success) {
      this.setCaptainMood('ability', 2.0);
    }
    return success;
  }

  takeDamage(amount, attacker) {
    if (this.isDestroyed) return;

    let damageTaken = amount;

    // Apply Armor Buff Reduction
    if (this.buffs.armor) {
      damageTaken *= (1 - (this.buffs.armor.reduction || 0.5));
    }
    if (this.buffs.fortress) {
      damageTaken *= 0.2;
    }
    if (this.buffs.invulnerable) {
      damageTaken = 0;
    }

    // Shield Absorption
    if (this.shieldHP > 0) {
      if (this.shieldHP >= damageTaken) {
        this.shieldHP -= damageTaken;
        damageTaken = 0;
      } else {
        damageTaken -= this.shieldHP;
        this.shieldHP = 0;
      }
    }

    this.hp -= damageTaken;
    this.setCaptainMood('hit', 1.5);

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDestroyed = true;

      if (window.AudioSystem) {
        AudioSystem.playExplosion();
      }
      if (window.Renderer) {
        Renderer.addParticleBurst(this.x, this.y, '#ff3366', 30);
      }
    }
  }

  dash(distance = 180, duration = 0.4) {
    const angle = this.rotation;
    const speedBoost = distance / (duration || 0.4);
    this.vx += Math.cos(angle) * speedBoost;
    this.vy += Math.sin(angle) * speedBoost;
    this.currentSpeed = Math.hypot(this.vx, this.vy);
    if (window.Renderer) {
      Renderer.addParticleBurst(this.x, this.y, this.data.color || '#00f5d4', 15);
    }
  }

  applyBuff(type, duration, extra = {}) {
    this.buffs[type] = { duration, ...extra };
  }

  setCaptainMood(mood, duration = 2.0) {
    this.captainMood = mood;
    this.moodTimer = duration;
  }

  distanceTo(target) {
    if (!target) return Infinity;
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    return Math.hypot(dx, dy);
  }
}
