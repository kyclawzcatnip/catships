/**
 * Catnip Warships — Special Ability Registry & Implementation Engine (100 Ships)
 */
window.ABILITIES = {
  /**
   * Execute Special Ability by Ship Data ID
   */
  triggerAbility(ship, world) {
    if (!ship || ship.saCooldownTimer > 0 || ship.isDestroyed) return false;

    // Set Cooldown Timer
    ship.saCooldownTimer = ship.data.saCd;
    ship.abilitiesUsed++;

    // Audio SFX
    if (window.AudioSystem) {
      AudioSystem.playAbilitySound(ship.data.saName, ship.data.isDark);
    }

    // Floating text notification
    if (window.Renderer) {
      Renderer.addFloatingText(ship.x, ship.y - 40, `✨ ${ship.data.saName}!`, ship.data.color);
    }

    // Ability-specific Logic Execution
    switch(ship.data.id) {
      // --- SHIPS 1 TO 30 ---
      case 1: ship.applyBuff('regen', 6, { rate: 13.3 }); break;
      case 2: ship.applyBuff('speed', 6, { multiplier: 1.5, stealth: true }); break;
      case 3: ship.applyBuff('armor', 8, { reduction: 0.75, glowing: true }); break;
      case 4: ship.dash(240, 0.4); ship.applyBuff('speed', 5, { multiplier: 2.0 }); break;
      case 5: this.fireDeadeyeShot(ship, world); break;
      case 6: ship.applyBuff('rapidfire', 5, { multiplier: 3.0 }); break;
      case 7: this.fireBroadside(ship, world); break;
      case 8: ship.shieldHP = Math.min(ship.maxShieldHP || 150, (ship.shieldHP || 0) + 150); ship.applyBuff('shield', 8, { color: '#7b2cbf' }); break;
      case 9: this.fireHeavySalvo(ship, world); break;
      case 10: ship.dash(180, 0.4); ship.applyBuff('invulnerable', 0.6); break;
      case 11: ship.dash(260, 0.3); ship.applyBuff('stealth', 3.0); break;
      case 12: ship.applyBuff('speed', 4, { multiplier: 1.4 }); break;
      case 13: ship.applyBuff('siege', 8, { damageMult: 1.6, rangeMult: 2.0, speedMult: 0.0 }); break;
      case 14: this.fireShadowShot(ship, world); break;
      case 15: ship.applyBuff('fortress', 10, { reduction: 0.8, speedMult: 0.4 }); break;
      case 16: this.fireAssaultStream(ship, world); break;
      case 17: this.fireDarkTorpedoes(ship, world); break;
      case 18: this.applyWarCry(ship, world); break;
      case 19: ship.applyBuff('invulnerable', 5.0, { goldShield: true }); break;
      case 20: this.triggerRecon(ship, world); break;
      case 21: this.fireRailCannon(ship, world); break;
      case 22: this.fireDarkBarrage(ship, world); break;
      case 23: this.fireTorpedoRush(ship, world); break;
      case 24: this.deployCatFighters(ship, world); break;
      case 25: this.deployShadowSquadron(ship, world); break;
      case 26: ship.applyBuff('armor', 8, { reduction: 0.5 }); break;
      case 27: this.executeStrikeAttack(ship, world); break;
      case 28: this.executeDarkWarp(ship, world); break;
      case 29: this.fireSuperSalvo(ship, world); break;
      case 30: this.fireUltimateBarrage(ship, world); break;

      // --- SHIPS 31 TO 100 EXPANDED ROSTER ---
      case 31: this.triggerRecon(ship, world); break; // Catnip Scout II
      case 32: ship.applyBuff('stealth', 6.0); break; // Dark Scout
      case 33: ship.applyBuff('armor', 6, { reduction: 0.6 }); break; // Catnip Defender
      case 34: ship.applyBuff('rapidfire', 6, { multiplier: 2.0 }); ship.applyBuff('warcry', 6, { damageMult: 1.3 }); break; // Catnip Assault Cruiser
      case 35: this.fireDarkBarrage(ship, world); break; // Dark Assault Cruiser
      case 36: this.fireTorpedoRush(ship, world); break; // Catnip Torpedo Cruiser
      case 37: ship.applyBuff('armor', 8, { reduction: 0.5 }); break; // Catnip Heavy Destroyer
      case 38: ship.dash(280, 0.4); ship.applyBuff('speed', 5, { multiplier: 1.8 }); break; // Dark Destroyer II
      case 39: this.fireMissileSalvo(ship, world, false); break; // Catnip Missile Ship
      case 40: this.fireMissileSalvo(ship, world, true); break; // Dark Missile Ship
      case 41: ship.applyBuff('armor', 10, { reduction: 0.7 }); break; // Catnip Heavy Battleship
      case 42: ship.shieldHP = 250; ship.applyBuff('shield', 10, { color: '#10002b' }); break; // Dark Heavy Battleship
      case 43: ship.dash(320, 0.5); ship.applyBuff('speed', 6, { multiplier: 2.2 }); break; // Catnip Fast Cruiser
      case 44: this.fireBroadside(ship, world); break; // Catnip Battlecruiser
      case 45: this.fireBroadside(ship, world); break; // Dark Battlecruiser
      case 46: this.fireDeadeyeShot(ship, world); break; // Catnip Longbow
      case 47: this.fireShadowShot(ship, world); break; // Dark Longbow
      case 48: ship.dash(350, 0.5); ship.applyBuff('speed', 5, { multiplier: 2.5 }); break; // Catnip Speedboat
      case 49: ship.dash(350, 0.5); ship.applyBuff('stealth', 5.0); break; // Dark Speedboat
      case 50: this.applyGuardianShield(ship, world); break; // Catnip Guardian
      case 51: this.fireHeavyCannonRound(ship, world, false); break; // Catnip Hammer
      case 52: this.fireHeavyCannonRound(ship, world, true); break; // Dark Hammer
      case 53: this.executeHunterSurge(ship, world, false); break; // Catnip Hunter
      case 54: this.executeHunterSurge(ship, world, true); break; // Dark Hunter
      case 55: this.fireMortarStrike(ship, world, false); break; // Catnip Mortar Ship
      case 56: this.fireMortarStrike(ship, world, true); break; // Dark Mortar Ship
      case 57: ship.shieldHP = 300; ship.applyBuff('armor', 8, { reduction: 0.4 }); break; // Catnip Defender II
      case 58: this.fireFlameBurst(ship, world, false); break; // Catnip Flame Ship
      case 59: this.fireFlameBurst(ship, world, true); break; // Dark Flame Ship
      case 60: ship.dash(250, 0.4); ship.applyBuff('strike', 2.0, { damageMult: 1.8 }); break; // Catnip Rammer
      case 61: ship.dash(250, 0.4); ship.applyBuff('armor', 4, { reduction: 0.6 }); break; // Dark Rammer
      case 62: this.fireDeadeyeShot(ship, world); break; // Catnip Sniper II
      case 63: this.fireShadowShot(ship, world); break; // Dark Sniper II
      case 64: this.deployCatFighters(ship, world); break; // Catnip Heavy Carrier
      case 65: this.deployShadowSquadron(ship, world); break; // Dark Heavy Carrier
      case 66: this.deployCatFighters(ship, world); ship.applyBuff('warcry', 8, { damageMult: 1.25 }); break; // Catnip Assault Carrier
      case 67: this.deployShadowSquadron(ship, world); ship.applyBuff('warcry', 8, { damageMult: 1.3 }); break; // Dark Assault Carrier
      case 68: this.fireHeavySalvo(ship, world); break; // Catnip Mini Battleship
      case 69: this.fireDarkBarrage(ship, world); break; // Dark Mini Battleship
      case 70: this.fireMissileSalvo(ship, world, false); break; // Catnip Missile Cruiser
      case 71: this.fireMissileSalvo(ship, world, true); break; // Dark Missile Cruiser
      case 72: this.fireLightningStrike(ship, world, false); break; // Catnip Lightning Ship
      case 73: this.fireLightningStrike(ship, world, true); break; // Dark Lightning Ship
      case 74: ship.applyBuff('stealth', 8.0); break; // Catnip Phantom
      case 75: ship.dash(200, 0.4); ship.applyBuff('stealth', 8.0); break; // Dark Phantom
      case 76: ship.shieldHP = 400; ship.applyBuff('invulnerable', 4.0); break; // Catnip Fortress II
      case 77: ship.applyBuff('fortress', 10, { reduction: 0.85, speedMult: 0.3 }); break; // Dark Fortress
      case 78: this.fireSuperSalvo(ship, world); break; // Catnip Siege Battleship
      case 79: this.fireDarkBarrage(ship, world); break; // Dark Siege Battleship
      case 80: ship.dash(300, 0.4); break; // Catnip Interceptor
      case 81: ship.dash(300, 0.4); this.executeDisableWeapons(ship, world); break; // Dark Interceptor
      case 82: this.applyGuardianShield(ship, world); break; // Catnip Guardian Cruiser
      case 83: this.applyGuardianShield(ship, world); break; // Dark Guardian Cruiser
      case 84: this.firePlasmaBlast(ship, world, false); break; // Catnip Plasma Ship
      case 85: this.firePlasmaBlast(ship, world, true); break; // Dark Plasma Ship
      case 86: this.fireShockwave(ship, world, false); break; // Catnip Shockwave Ship
      case 87: this.fireShockwave(ship, world, true); break; // Dark Shockwave Ship
      case 88: ship.applyBuff('armor', 10, { reduction: 0.8 }); break; // Catnip Titan
      case 89: ship.shieldHP = 500; ship.applyBuff('armor', 10, { reduction: 0.85 }); break; // Dark Titan
      case 90: this.executeStrikeAttack(ship, world); break; // Catnip Assassin
      case 91: ship.applyBuff('stealth', 3.0); this.executeStrikeAttack(ship, world); break; // Dark Assassin
      case 92: this.fireOrbitalStrike(ship, world, false); break; // Catnip Orbital Ship
      case 93: this.fireOrbitalStrike(ship, world, true); break; // Dark Orbital Ship
      case 94: this.fireBroadside(ship, world); this.fireHeavySalvo(ship, world); break; // Catnip Mega Cruiser
      case 95: this.fireBroadside(ship, world); this.fireDarkBarrage(ship, world); break; // Dark Mega Cruiser
      case 96: ship.applyBuff('armor', 10, { reduction: 0.7 }); ship.applyBuff('warcry', 10, { damageMult: 1.4 }); break; // Catnip War Machine
      case 97: ship.applyBuff('armor', 10, { reduction: 0.75 }); ship.applyBuff('warcry', 10, { damageMult: 1.5 }); break; // Dark War Machine
      case 98: this.fireSuperSalvo(ship, world); this.fireBroadside(ship, world); break; // Catnip Super Cruiser
      case 99: this.fireSuperSalvo(ship, world); this.fireDarkBarrage(ship, world); break; // Dark Super Cruiser
      case 100: // Catnip Infinity — Infinity Catnip (30s 3x Bullet DA)
        ship.applyBuff('infinity', 30.0, { bulletDamageMult: 3.0 });
        if (window.Renderer) {
          Renderer.addParticleBurst(ship.x, ship.y, '#ffd700', 30);
          Renderer.addFloatingText(ship.x, ship.y - 45, '♾️ INFINITY CATNIP (3x BULLET DA)!', '#ffd700');
        }
        break;

      default:
        ship.applyBuff('speed', 5, { multiplier: 1.3 });
        break;
    }

    return true;
  },

  // Helper Ability Actions
  fireDeadeyeShot(ship, world) {
    const angle = ship.turretAngle;
    world.addProjectile(new Projectile({
      x: ship.x + Math.cos(angle) * (ship.length / 2),
      y: ship.y + Math.sin(angle) * (ship.length / 2),
      vx: Math.cos(angle) * 1200,
      vy: Math.sin(angle) * 1200,
      damage: ship.data.da * 2.5,
      owner: ship,
      color: '#f72585',
      radius: 6,
      range: 1500,
      isSniper: true
    }));
  },

  fireBroadside(ship, world) {
    const portAngle = ship.rotation - Math.PI / 2;
    const starboardAngle = ship.rotation + Math.PI / 2;

    for (let offset of [-15, 0, 15]) {
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(ship.rotation) * offset,
        y: ship.y + Math.sin(ship.rotation) * offset,
        vx: Math.cos(portAngle) * 650,
        vy: Math.sin(portAngle) * 650,
        damage: ship.data.da,
        owner: ship,
        color: ship.data.color || '#48cae4',
        radius: 5,
        range: 750
      }));
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(ship.rotation) * offset,
        y: ship.y + Math.sin(ship.rotation) * offset,
        vx: Math.cos(starboardAngle) * 650,
        vy: Math.sin(starboardAngle) * 650,
        damage: ship.data.da,
        owner: ship,
        color: ship.data.color || '#48cae4',
        radius: 5,
        range: 750
      }));
    }
  },

  fireHeavySalvo(ship, world) {
    const angle = ship.turretAngle;
    for (let i = -1.5; i <= 1.5; i += 1) {
      const spreadAngle = angle + (i * 0.08);
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(angle) * (ship.length / 2),
        y: ship.y + Math.sin(angle) * (ship.length / 2),
        vx: Math.cos(spreadAngle) * 750,
        vy: Math.sin(spreadAngle) * 750,
        damage: ship.data.da * 1.2,
        owner: ship,
        color: ship.data.color || '#0077b6',
        radius: 7,
        range: 950,
        explosive: true
      }));
    }
  },

  fireShadowShot(ship, world) {
    const angle = ship.turretAngle;
    world.addProjectile(new Projectile({
      x: ship.x + Math.cos(angle) * (ship.length / 2),
      y: ship.y + Math.sin(angle) * (ship.length / 2),
      vx: Math.cos(angle) * 1100,
      vy: Math.sin(angle) * 1100,
      damage: ship.data.da * 2.2,
      owner: ship,
      color: '#9d4edd',
      radius: 5,
      range: 1400,
      armorPierce: 0.5,
      stealth: true
    }));
  },

  fireAssaultStream(ship, world) {
    let count = 0;
    const interval = setInterval(() => {
      if (!ship || ship.isDestroyed || count >= 6) {
        clearInterval(interval);
        return;
      }
      const angle = ship.turretAngle + (Math.random() - 0.5) * 0.1;
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(angle) * (ship.length / 2),
        y: ship.y + Math.sin(angle) * (ship.length / 2),
        vx: Math.cos(angle) * 800,
        vy: Math.sin(angle) * 800,
        damage: ship.data.da * 0.8,
        owner: ship,
        color: '#ffb703',
        radius: 5,
        range: 850
      }));
      count++;
    }, 120);
  },

  fireDarkTorpedoes(ship, world) {
    for (let i = 0; i < 4; i++) {
      const spreadAngle = ship.rotation + ((i - 1.5) * 0.25);
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(spreadAngle) * 450,
        vy: Math.sin(spreadAngle) * 450,
        damage: ship.data.da * 1.5,
        owner: ship,
        color: '#7b2cbf',
        radius: 6,
        range: 1100,
        isTorpedo: true,
        isHoming: true
      }));
    }
  },

  fireMissileSalvo(ship, world, isDark = false) {
    for (let i = 0; i < 3; i++) {
      const spreadAngle = ship.rotation + ((i - 1) * 0.3);
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(spreadAngle) * 500,
        vy: Math.sin(spreadAngle) * 500,
        damage: ship.data.da * 1.4,
        owner: ship,
        color: isDark ? '#9d4edd' : '#e63946',
        radius: 5,
        range: 1200,
        isTorpedo: true,
        isHoming: true
      }));
    }
  },

  fireHeavyCannonRound(ship, world, isDark = false) {
    const angle = ship.turretAngle;
    world.addProjectile(new Projectile({
      x: ship.x + Math.cos(angle) * (ship.length / 2),
      y: ship.y + Math.sin(angle) * (ship.length / 2),
      vx: Math.cos(angle) * 600,
      vy: Math.sin(angle) * 600,
      damage: ship.data.da * 2.2,
      owner: ship,
      color: isDark ? '#d00000' : '#f77f00',
      radius: 9,
      range: 1000,
      explosive: true
    }));
  },

  fireFlameBurst(ship, world, isDark = false) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(angle) * 400,
        vy: Math.sin(angle) * 400,
        damage: ship.data.da * 0.7,
        owner: ship,
        color: isDark ? '#e85d04' : '#ffba08',
        radius: 6,
        range: 400
      }));
    }
  },

  fireLightningStrike(ship, world, isDark = false) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      target.takeDamage(ship.data.da * 1.8, ship);
      if (window.Renderer) {
        Renderer.addParticleBurst(target.x, target.y, isDark ? '#9d4edd' : '#4cc9f0', 25);
        Renderer.addFloatingText(target.x, target.y - 40, '⚡ LIGHTNING!', isDark ? '#9d4edd' : '#4cc9f0');
      }
    }
  },

  firePlasmaBlast(ship, world, isDark = false) {
    const angle = ship.turretAngle;
    world.addProjectile(new Projectile({
      x: ship.x + Math.cos(angle) * (ship.length / 2),
      y: ship.y + Math.sin(angle) * (ship.length / 2),
      vx: Math.cos(angle) * 1000,
      vy: Math.sin(angle) * 1000,
      damage: ship.data.da * 2.0,
      owner: ship,
      color: isDark ? '#9d4edd' : '#4cc9f0',
      radius: 8,
      range: 1300,
      piercing: true
    }));
  },

  fireShockwave(ship, world, isDark = false) {
    world.ships.forEach(s => {
      if (s !== ship && s.team !== ship.team && !s.isDestroyed && ship.distanceTo(s) < 350) {
        s.takeDamage(ship.data.da * 1.2, ship);
        // Push enemy back
        const angle = Math.atan2(s.y - ship.y, s.x - ship.x);
        s.vx += Math.cos(angle) * 400;
        s.vy += Math.sin(angle) * 400;
      }
    });
    if (window.Renderer) {
      Renderer.addParticleBurst(ship.x, ship.y, isDark ? '#7b2cbf' : '#00e5ff', 35);
    }
  },

  fireOrbitalStrike(ship, world, isDark = false) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      setTimeout(() => {
        if (!target.isDestroyed) {
          target.takeDamage(ship.data.da * 2.5, ship);
          if (window.Renderer) {
            Renderer.addParticleBurst(target.x, target.y, isDark ? '#7b2cbf' : '#ffd700', 40);
            Renderer.addFloatingText(target.x, target.y - 45, '🛰️ ORBITAL STRIKE!', isDark ? '#7b2cbf' : '#ffd700');
          }
        }
      }, 1000);
    }
  },

  executeDisableWeapons(ship, world) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      target.primaryReloadTimer = 4.0; // Disables weapons for 4 seconds
      if (window.Renderer) {
        Renderer.addFloatingText(target.x, target.y - 30, '🚫 WEAPONS DISABLED!', '#ff3366');
      }
    }
  },

  executeHunterSurge(ship, world, isDark = false) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      const angle = Math.atan2(target.y - ship.y, target.x - ship.x);
      ship.rotation = angle;
      ship.dash(240, 0.4);
      if (isDark) ship.applyBuff('stealth', 3.0);
    }
  },

  fireMortarStrike(ship, world, isDark = false) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      const angle = Math.atan2(target.y - ship.y, target.x - ship.x);
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(angle) * 650,
        vy: Math.sin(angle) * 650,
        damage: ship.data.da * 1.8,
        owner: ship,
        color: isDark ? '#9d4edd' : '#e63946',
        radius: 8,
        range: 1100,
        explosive: true
      }));
    }
  },

  applyGuardianShield(ship, world) {
    world.ships.forEach(s => {
      if (s.team === ship.team && !s.isDestroyed && ship.distanceTo(s) < 400) {
        s.shieldHP = (s.shieldHP || 0) + 150;
        s.applyBuff('shield', 8, { color: '#00b4d8' });
      }
    });
  },

  applyWarCry(ship, world) {
    const radius = 450;
    world.ships.forEach(s => {
      if (s.team === ship.team && !s.isDestroyed && s.distanceTo(ship) <= radius) {
        s.applyBuff('warcry', 8, { damageMult: 1.3 });
        if (window.Renderer) {
          Renderer.addFloatingText(s.x, s.y - 30, '⚡ WAR CRY BUFF!', '#fb8500');
        }
      }
    });
  },

  triggerRecon(ship, world) {
    world.reconActiveTimer = 10.0;
    world.ships.forEach(s => {
      if (s.team !== ship.team) {
        s.isRevealed = true;
      }
    });
  },

  fireRailCannon(ship, world) {
    ship.isChargingRail = true;
    setTimeout(() => {
      if (ship.isDestroyed) return;
      ship.isChargingRail = false;
      const angle = ship.rotation;
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(angle) * (ship.length / 2),
        y: ship.y + Math.sin(angle) * (ship.length / 2),
        vx: Math.cos(angle) * 2000,
        vy: Math.sin(angle) * 2000,
        damage: ship.data.da * 2.8,
        owner: ship,
        color: '#4cc9f0',
        radius: 8,
        range: 1800,
        isLaserBeam: true,
        piercing: true
      }));
    }, 1500);
  },

  fireDarkBarrage(ship, world) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(angle) * 550,
        vy: Math.sin(angle) * 550,
        damage: ship.data.da,
        owner: ship,
        color: '#9d4edd',
        radius: 5,
        range: 800
      }));
    }
  },

  fireTorpedoRush(ship, world) {
    for (let i = 0; i < 6; i++) {
      const spreadAngle = ship.rotation + ((i - 2.5) * 0.15);
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(spreadAngle) * 520,
        vy: Math.sin(spreadAngle) * 520,
        damage: ship.data.da * 1.3,
        owner: ship,
        color: '#4895ef',
        radius: 6,
        range: 1200,
        isTorpedo: true
      }));
    }
  },

  deployCatFighters(ship, world) {
    for (let i = 0; i < 3; i++) {
      world.addAircraft(new Aircraft({
        owner: ship,
        team: ship.team,
        type: 'CatFighter',
        color: '#00e5ff',
        damage: 25,
        orbitRadius: 180 + i * 40
      }));
    }
  },

  deployShadowSquadron(ship, world) {
    for (let i = 0; i < 4; i++) {
      world.addAircraft(new Aircraft({
        owner: ship,
        team: ship.team,
        type: 'ShadowDrone',
        color: '#9d4edd',
        damage: 30,
        orbitRadius: 200 + i * 35
      }));
    }
  },

  executeStrikeAttack(ship, world) {
    let target = world.findNearestEnemy(ship);
    if (target) {
      const angle = Math.atan2(target.y - ship.y, target.x - ship.x);
      ship.rotation = angle;
      ship.vx = Math.cos(angle) * 650;
      ship.vy = Math.sin(angle) * 650;
      ship.applyBuff('strike', 1.5, { damageMult: 1.5 });
    }
  },

  executeDarkWarp(ship, world) {
    const angle = ship.rotation;
    const distance = 220;
    ship.x += Math.cos(angle) * distance;
    ship.y += Math.sin(angle) * distance;
    ship.x = Math.max(100, Math.min(CONFIG.MAP_WIDTH - 100, ship.x));
    ship.y = Math.max(100, Math.min(CONFIG.MAP_HEIGHT - 100, ship.y));

    if (window.Renderer) {
      Renderer.addParticleBurst(ship.x, ship.y, '#9d4edd', 20);
    }
  },

  fireSuperSalvo(ship, world) {
    const angle = ship.turretAngle;
    for (let i = -3.5; i <= 3.5; i += 1) {
      const spreadAngle = angle + (i * 0.06);
      world.addProjectile(new Projectile({
        x: ship.x + Math.cos(angle) * (ship.length / 2),
        y: ship.y + Math.sin(angle) * (ship.length / 2),
        vx: Math.cos(spreadAngle) * 800,
        vy: Math.sin(spreadAngle) * 800,
        damage: ship.data.da * 1.25,
        owner: ship,
        color: '#ff4d4d',
        radius: 7,
        range: 1100,
        explosive: true
      }));
    }
  },

  fireUltimateBarrage(ship, world) {
    const angle = ship.turretAngle;
    world.addProjectile(new Projectile({
      x: ship.x + Math.cos(angle) * (ship.length / 2),
      y: ship.y + Math.sin(angle) * (ship.length / 2),
      vx: Math.cos(angle) * 1500,
      vy: Math.sin(angle) * 1500,
      damage: 250,
      owner: ship,
      color: '#ffd700',
      radius: 12,
      range: 1600,
      isLaserBeam: true,
      piercing: true
    }));

    for (let i = 0; i < 16; i++) {
      const omniAngle = (i / 16) * Math.PI * 2;
      world.addProjectile(new Projectile({
        x: ship.x,
        y: ship.y,
        vx: Math.cos(omniAngle) * 700,
        vy: Math.sin(omniAngle) * 700,
        damage: 60,
        owner: ship,
        color: '#39ff14',
        radius: 6,
        range: 900
      }));
    }
  }
};
