/**
 * Catnip Warships — Main Application & Game Engine
 */
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = 'HANGAR'; // 'HANGAR', 'BATTLE', 'PAUSED', 'ENDGAME'
    this.selectedShipId = 1;
    this.difficultyKey = 'easy';
    this.gameMode = 'skirmish';
    this.battleSettings = {};

    this.world = {
      ships: [],
      projectiles: [],
      aircraft: [],
      map: null,
      camera: null,
      playerShip: null,
      lockedTarget: null,
      fleetCommand: 'ATTACK',
      reconActiveTimer: 0
    };

    this.camera = new CameraEngine(this.canvas.width, this.canvas.height);
    this.world.camera = this.camera;

    this.playerShip = null;
    this.playerPlane = null;
    this.isPilotingPlane = false;
    this.lockedTarget = null;
    this.fleetCommand = 'ATTACK';
    this.isEndingMatch = false;

    this.currentWave = 1;
    this.waveState = 'COMBAT';
    this.waveTimer = 0;

    this.lastTime = performance.now();
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    HangarUI.init((shipId, settings) => {
      this.launchBattle(shipId, settings);
    });

    EndGameUI.init(() => {
      this.returnToHangar();
    });

    requestAnimationFrame((now) => this.loop(now));
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.resizeViewport(this.canvas.width, this.canvas.height);
  }

  returnToHangar() {
    this.state = 'HANGAR';
    this.isPilotingPlane = false;
    this.playerPlane = null;
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('hangar-screen').classList.add('active');

    HangarUI.startPreviewAnimation();
  }

  launchBattle(shipId, settings) {
    this.selectedShipId = shipId;

    if (typeof settings === 'string') {
      settings = {
        difficulty: 'easy',
        battleType: settings,
        ambushSide: 'DEFEND',
        mapTheme: 'tropical',
        weather: 'clear',
        fleetSize: '5v5',
        cooldownSpeed: 1.0
      };
    } else if (!settings || typeof settings !== 'object') {
      settings = {
        difficulty: 'easy',
        battleType: 'skirmish',
        ambushSide: 'DEFEND',
        mapTheme: 'tropical',
        weather: 'clear',
        fleetSize: '5v5',
        cooldownSpeed: 1.0
      };
    }

    this.battleSettings = settings;
    this.difficultyKey = this.battleSettings.difficulty || 'easy';
    this.gameMode = this.battleSettings.battleType || 'skirmish';
    this.state = 'BATTLE';
    this.isEndingMatch = false;
    this.lockedTarget = null;
    this.fleetCommand = 'ATTACK';
    this.isPilotingPlane = false;
    this.playerPlane = null;

    const diff = CONFIG.DIFFICULTY[this.difficultyKey] || CONFIG.DIFFICULTY.easy;

    // Switch Screens
    document.getElementById('hangar-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');

    // Setup World & Map with selected Theme
    this.world.map = new MapEngine(this.battleSettings.mapTheme || 'tropical');
    this.world.ships = [];
    this.world.projectiles = [];
    this.world.aircraft = [];
    this.world.addProjectile = (p) => this.world.projectiles.push(p);
    this.world.addAircraft = (a) => this.world.aircraft.push(a);
    this.world.findNearestEnemy = (fromEntity) => this.findNearestEnemy(fromEntity);
    this.world.fleetCommand = 'ATTACK';
    this.world.playerShip = null;

    // Create Player Ship
    const pData = SHIPS_DATA.find(s => s.id === shipId) || SHIPS_DATA[0];
    const playerTeam = (this.gameMode === 'ambush' && this.battleSettings.ambushSide === 'ATTACK') ? 'red' : 'blue';
    const playerSpawnX = (playerTeam === 'red') ? CONFIG.MAP_WIDTH - 600 : 600;
    
    this.playerShip = new Ship(pData, playerTeam, playerSpawnX, CONFIG.MAP_HEIGHT / 2);
    this.playerShip.isPlayer = true;
    this.playerShip.maxHp = Math.round(this.playerShip.maxHp * diff.allyHpMult);
    this.playerShip.hp = this.playerShip.maxHp;

    // Rapid Arcade Cooldown Multiplier
    if (this.battleSettings.cooldownSpeed && this.battleSettings.cooldownSpeed < 1.0) {
      this.playerShip.baseReloadTime *= this.battleSettings.cooldownSpeed;
    }

    document.getElementById('hud-player-ship-name').innerText = pData.name;
    document.getElementById('hud-type-badge').innerText = pData.type;

    this.world.ships.push(this.playerShip);
    this.world.playerShip = this.playerShip;

    // Setup Fleet Roster according to Battle Type & Fleet Size
    this.setupFleetForMode(this.battleSettings, diff);
  }

  setupFleetForMode(settings, diff) {
    let mode = 'skirmish';
    let fleetSize = '5v5';
    let cdMult = 1.0;

    if (typeof settings === 'string') {
      mode = settings;
    } else if (settings && typeof settings === 'object') {
      mode = settings.battleType || 'skirmish';
      fleetSize = settings.fleetSize || '5v5';
      cdMult = settings.cooldownSpeed || 1.0;
    }

    if (mode === 'outnumbered') {
      // ⚠️ OUTNUMBERED CLASH: True 3 Allies (Player + #29 Super Battleship + #9 Battleship) vs 8 Hostile Enemies!
      const allyIds = [29, 9];
      allyIds.forEach((id, idx) => {
        const data = SHIPS_DATA.find(s => s.id === id);
        const ally = new Ship(data, 'blue', 500, CONFIG.MAP_HEIGHT / 2 + (idx - 0.5) * 160);
        ally.maxHp = Math.round(ally.maxHp * diff.allyHpMult);
        ally.hp = ally.maxHp;
        if (cdMult < 1.0) ally.baseReloadTime *= cdMult;
        this.world.ships.push(ally);
      });

      const enemyIds = [2, 8, 14, 17, 22, 28, 35, 38]; // 8 Hostile warships
      enemyIds.forEach((id, idx) => {
        const data = SHIPS_DATA.find(s => s.id === id);
        const enemy = new Ship(data, 'red', CONFIG.MAP_WIDTH - 750 - Math.floor(idx / 3) * 160, 600 + (idx % 3) * 280);
        enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult);
        if (cdMult < 1.0) enemy.baseReloadTime *= cdMult;
        this.world.ships.push(enemy);
      });
    } else if (mode === 'ambush') {
      // ⚓ PROTECT CARRIER AMBUSH: ATTACK vs DEFEND Role Selection
      const isAttacker = (settings && settings.ambushSide === 'ATTACK');

      if (isAttacker) {
        // Player is Red Ambush Commander! Target Blue Carrier #24
        const carrierData = SHIPS_DATA.find(s => s.id === 24);
        const carrier = new Ship(carrierData, 'blue', 600, CONFIG.MAP_HEIGHT / 2);
        carrier.maxHp = Math.round(carrier.maxHp * diff.allyHpMult * 1.5);
        carrier.hp = carrier.maxHp;
        this.world.ships.push(carrier);

        [6, 7, 15].forEach((id, idx) => {
          const data = SHIPS_DATA.find(s => s.id === id);
          const defender = new Ship(data, 'blue', 550, CONFIG.MAP_HEIGHT / 2 + (idx - 1) * 160);
          this.world.ships.push(defender);
        });

        [17, 28, 38, 49, 54].forEach((id, idx) => {
          const data = SHIPS_DATA.find(s => s.id === id);
          const redAlly = new Ship(data, 'red', CONFIG.MAP_WIDTH - 550, CONFIG.MAP_HEIGHT / 2 + (idx - 2) * 160);
          this.world.ships.push(redAlly);
        });
      } else {
        // Player is Blue Defender! Defend Carrier #24
        const carrierData = SHIPS_DATA.find(s => s.id === 24);
        const carrier = new Ship(carrierData, 'blue', 500, CONFIG.MAP_HEIGHT / 2 + 100);
        carrier.maxHp = Math.round(carrier.maxHp * diff.allyHpMult * 1.5);
        carrier.hp = carrier.maxHp;
        this.world.ships.push(carrier);

        const escortData = SHIPS_DATA.find(s => s.id === 6);
        const escort = new Ship(escortData, 'blue', 550, CONFIG.MAP_HEIGHT / 2 - 120);
        this.world.ships.push(escort);

        const ambusherIds = [17, 28, 38, 49, 54, 61];
        ambusherIds.forEach((id, idx) => {
          const data = SHIPS_DATA.find(s => s.id === id);
          const enemy = new Ship(data, 'red', 1600 + (idx % 2) * 400, 500 + idx * 300);
          enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult);
          this.world.ships.push(enemy);
        });
      }
    } else if (mode === 'boss') {
      // 👑 Boss Rush vs #30 Ultimate Catnip + 3 #28 Dark Dreadnought Escorts!
      const bossData = SHIPS_DATA.find(s => s.id === 30);
      const boss = new Ship(bossData, 'red', CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2);
      boss.damage = Math.round(boss.damage * diff.enemyDmgMult);
      this.world.ships.push(boss);

      [1, 2, 3].forEach((_, idx) => {
        const escortData = SHIPS_DATA.find(s => s.id === 28);
        const escort = new Ship(escortData, 'red', CONFIG.MAP_WIDTH / 2 + 220, CONFIG.MAP_HEIGHT / 2 + (idx - 1) * 220);
        escort.damage = Math.round(escort.damage * diff.enemyDmgMult);
        this.world.ships.push(escort);
      });

      [3, 9, 15, 29].forEach((id, idx) => {
        const data = SHIPS_DATA.find(s => s.id === id);
        const ally = new Ship(data, 'blue', 600, CONFIG.MAP_HEIGHT / 2 + (idx - 1.5) * 140);
        ally.maxHp = Math.round(ally.maxHp * diff.allyHpMult);
        ally.hp = ally.maxHp;
        this.world.ships.push(ally);
      });
    } else if (mode === 'survival') {
      // 🌊 WAVE SURVIVAL MODE SPAWNER ENGINE
      this.currentWave = 1;
      this.waveState = 'COMBAT';
      this.waveTimer = 0;
      this.spawnSurvivalWave(this.currentWave, diff);
    } else if (mode === 'testdrive') {
      [15, 19, 29, 100].forEach((id, idx) => {
        const data = SHIPS_DATA.find(s => s.id === id);
        const dummy = new Ship(data, 'red', 1800, 800 + idx * 350);
        dummy.targetSpeed = 0;
        this.world.ships.push(dummy);
      });
    } else {
      // STANDARD FLEET SKIRMISH (3v3, 5v5, or 10v10 Mega Armada War!)
      let count = 4; // 5v5 default (1 player + 4 allies)
      if (fleetSize === '3v3') count = 2;
      else if (fleetSize === '10v10') count = 9;

      const poolAllyIds = [3, 7, 9, 15, 16, 21, 24, 26, 29, 34, 41, 44, 50, 64, 76, 88, 100];
      const poolEnemyIds = [2, 8, 11, 14, 17, 22, 25, 30, 35, 38, 42, 45, 52, 65, 77, 89, 99];

      for (let i = 0; i < count; i++) {
        const aId = poolAllyIds[i % poolAllyIds.length];
        const data = SHIPS_DATA.find(s => s.id === aId);
        const ally = new Ship(data, 'blue', 500 + Math.floor(i / 5) * 120, CONFIG.MAP_HEIGHT / 2 + ((i % 5) - 2) * 130);
        ally.maxHp = Math.round(ally.maxHp * diff.allyHpMult);
        ally.hp = ally.maxHp;
        if (cdMult < 1.0) ally.baseReloadTime *= cdMult;
        this.world.ships.push(ally);
      }

      const enemyCount = count + 1; // Equal team size
      for (let i = 0; i < enemyCount; i++) {
        const eId = poolEnemyIds[i % poolEnemyIds.length];
        const data = SHIPS_DATA.find(s => s.id === eId);
        const enemy = new Ship(data, 'red', CONFIG.MAP_WIDTH - 600 - Math.floor(i / 5) * 120, CONFIG.MAP_HEIGHT / 2 + ((i % 5) - 2) * 140);
        enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult);
        if (cdMult < 1.0) enemy.baseReloadTime *= cdMult;
        this.world.ships.push(enemy);
      }
    }
  }

  spawnSurvivalWave(waveNum, diff) {
    if (window.Renderer && this.playerShip) {
      Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 60, `🌊 WAVE ${waveNum} INCOMING!`, '#00f5d4');
    }

    if (waveNum === 100) {
      // 💥 LEVEL 100: 10 #100 CATNIP INFINITY WARSHIPS!
      if (window.Renderer && this.playerShip) {
        Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 80, '⚠️ FINAL BOSS WAVE 100: 10 INFINITY WARSHIPS!', '#ffd700');
      }
      for (let i = 0; i < 10; i++) {
        const infData = SHIPS_DATA.find(s => s.id === 100);
        const infBoss = new Ship(infData, 'red', CONFIG.MAP_WIDTH - 650 - Math.floor(i / 5) * 150, 500 + (i % 5) * 260);
        infBoss.damage = Math.round(infBoss.damage * diff.enemyDmgMult);
        this.world.ships.push(infBoss);
      }
    } else {
      const pool = [2, 8, 10, 11, 12, 14, 17, 22, 28, 35, 38, 45, 52, 65, 77, 89, 99];
      const count = Math.min(12, 3 + Math.floor(waveNum * 0.75));
      for (let i = 0; i < count; i++) {
        const eId = pool[i % pool.length];
        const data = SHIPS_DATA.find(s => s.id === eId);
        const enemy = new Ship(data, 'red', CONFIG.MAP_WIDTH - 650 - Math.floor(i / 4) * 140, 500 + (i % 4) * 240);
        enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult * (1 + waveNum * 0.04));
        this.world.ships.push(enemy);
      }
    }
  }

  togglePlanePiloting() {
    if (this.isPilotingPlane) {
      this.isPilotingPlane = false;
      if (this.playerPlane) {
        this.playerPlane.isPlayerControlled = false;
      }
      if (window.Renderer && this.playerShip) {
        Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '⚓ CAPTAIN RETURNED TO WARSHIP!', '#00e5ff');
      }
    } else {
      let jet = this.world.aircraft.find(a => a.team === (this.playerShip ? this.playerShip.team : 'blue') && !a.isDestroyed);
      if (!jet) {
        jet = new Aircraft({
          owner: this.playerShip,
          team: this.playerShip ? this.playerShip.team : 'blue',
          type: 'CatFighter',
          color: '#00e5ff',
          damage: 35,
          x: this.playerShip ? this.playerShip.x : 1000,
          y: this.playerShip ? this.playerShip.y : 1000,
          isPlayerControlled: true
        });
        this.world.addAircraft(jet);
      }
      this.playerPlane = jet;
      this.playerPlane.isPlayerControlled = true;
      this.isPilotingPlane = true;

      if (window.Renderer) {
        Renderer.addFloatingText(this.playerPlane.x, this.playerPlane.y - 40, '✈️ PILOTING CAT FIGHTER JET! (Press Key P to Exit)', '#ffd700');
      }
    }
  }

  togglePause() {
    if (this.state === 'BATTLE') {
      this.state = 'PAUSED';
      document.getElementById('pause-modal').classList.add('active');
    } else if (this.state === 'PAUSED') {
      this.state = 'BATTLE';
      document.getElementById('pause-modal').classList.remove('active');
    }
  }

  loop(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    if (this.state === 'BATTLE') {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 0. Update Map Environmental Effects (Caldera Volcano & Volcanic Meteor Warnings)
    if (this.world.map) {
      this.world.map.update(dt, this.world);
    }

    // 1. ESC key pause check
    if (InputHandler.consumePauseTrigger()) {
      this.togglePause();
      return;
    }

    // 2. Input handling for Player Ship or Player Fighter Jet
    if (InputHandler.consumePilotPlaneTrigger()) {
      this.togglePlanePiloting();
    }

    // Safety check if piloted plane gets destroyed
    if (this.isPilotingPlane && (!this.playerPlane || this.playerPlane.isDestroyed)) {
      this.isPilotingPlane = false;
      this.playerPlane = null;
      if (window.Renderer && this.playerShip) {
        Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '⚠️ FIGHTER DESTROYED! BACK TO WARSHIP', '#ff3366');
      }
    }

    if (this.isPilotingPlane && this.playerPlane && !this.playerPlane.isDestroyed) {
      InputHandler.updateWorldMouse(this.camera);
      this.playerPlane.update(dt, this.world, InputHandler);
    } else if (this.playerShip && !this.playerShip.isDestroyed) {
      InputHandler.updateWorldMouse(this.camera);

      // Handle Fleet Commands (Key 1: Regroup/Follow, Key 2: Focus Target, Key 3: Attack)
      const fleetCmd = InputHandler.consumeFleetCommandTrigger();
      if (fleetCmd) {
        this.fleetCommand = fleetCmd;
        this.world.fleetCommand = fleetCmd;
        if (window.Renderer && this.playerShip) {
          const label = fleetCmd === 'FOLLOW' ? '🛡️ FLEET: REGROUP!' : (fleetCmd === 'FOCUS' ? '🎯 FLEET: FOCUS TARGET!' : '⚡ FLEET: CHARGE ATTACK!');
          Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, label, '#00e5ff');
        }
      }

      // TAB / T Lock-On Target Toggle
      if (InputHandler.consumeLockTargetTrigger()) {
        const nextTarget = this.findNearestEnemy(this.playerShip);
        if (nextTarget) {
          this.lockedTarget = (this.lockedTarget === nextTarget) ? null : nextTarget;
          this.world.lockedTarget = this.lockedTarget;
          if (this.lockedTarget && window.Renderer) {
            Renderer.addFloatingText(this.lockedTarget.x, this.lockedTarget.y - 40, '🎯 TARGET LOCKED!', '#ff3366');
          }
        }
      }

      // Turret Aiming (Manual Aim: Mouse / Left-Right Arrow Keys)
      if (InputHandler.isAimLeft()) {
        this.playerShip.turretAngle -= 3.0 * dt;
        this.lockedTarget = null;
      } else if (InputHandler.isAimRight()) {
        this.playerShip.turretAngle += 3.0 * dt;
        this.lockedTarget = null;
      } else if (this.lockedTarget && !this.lockedTarget.isDestroyed) {
        this.playerShip.turretAngle = Math.atan2(
          this.lockedTarget.y - this.playerShip.y,
          this.lockedTarget.x - this.playerShip.x
        );
      } else {
        this.playerShip.turretAngle = Math.atan2(
          InputHandler.mouse.worldY - this.playerShip.y,
          InputHandler.mouse.worldX - this.playerShip.x
        );
      }

      // Fire Main Cannon
      if (InputHandler.mouse.isDown || InputHandler.consumeSpaceTrigger()) {
        this.playerShip.firePrimary(this.world);
      }

      // AA Anti-Aircraft Flak Guns (Key F)
      if (InputHandler.consumeAATrigger()) {
        this.playerShip.fireAA(this.world);
      }

      // Special Ability (Key E / SHIFT)
      if (InputHandler.consumeAbilityTrigger()) {
        this.playerShip.useAbility(this.world);
      }

      // Skip Wave Test Trigger (Key K)
      if (this.gameMode === 'survival' && InputHandler.consumeSkipWaveTrigger()) {
        const enemyShips = this.world.ships.filter(s => s && s.team !== this.playerShip.team && !s.isDestroyed);
        enemyShips.forEach(s => s.takeDamage(99999, this.playerShip));
        if (window.Renderer) {
          Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '⚡ WAVE SKIPPED (TEST KEY K)!', '#ffd700');
        }
      }

      // Physics update
      this.playerShip.update(dt, this.world, InputHandler);
    }

    // 3. Update AI Ships & Subsystems (Anti-Despawn Boundary Clamping)
    const shipsCount = this.world.ships.length;
    for (let i = 0; i < shipsCount; i++) {
      const ship = this.world.ships[i];
      if (!ship) continue;

      ship.isLockedTarget = (this.lockedTarget === ship);

      if (!ship.isPlayer) {
        FleetAI.update(ship, dt, this.world);
        ship.update(dt, this.world, null);
      }
      PhysicsEngine.handleIslandCollisions(ship, this.world.map);
    }

    // Ship-to-ship collisions
    for (let i = 0; i < shipsCount; i++) {
      for (let j = i + 1; j < shipsCount; j++) {
        PhysicsEngine.handleShipCollisions(this.world.ships[i], this.world.ships[j]);
      }
    }

    // 4. Update Projectiles & Hits
    for (let i = 0; i < this.world.projectiles.length; i++) {
      const p = this.world.projectiles[i];
      if (!p || p.isDestroyed) continue;
      p.update(dt, this.world);

      if (p.isDestroyed) continue;

      // AA Flak Shell vs Aircraft Collision
      if (p.isAA) {
        for (let j = 0; j < this.world.aircraft.length; j++) {
          const jet = this.world.aircraft[j];
          if (jet && !jet.isDestroyed && jet.team !== p.team) {
            if (Math.hypot(jet.x - p.x, jet.y - p.y) < 35) {
              jet.takeDamage(p.damage);
              p.isDestroyed = true;
              if (window.Renderer) {
                Renderer.addParticleBurst(p.x, p.y, '#ffb703', 12);
                Renderer.addFloatingText(jet.x, jet.y - 25, '💥 AA FLAK HIT!', '#ffb703');
              }
              break;
            }
          }
        }
        continue;
      }

      // Cannon Shell vs Target Ships Collision
      for (let j = 0; j < shipsCount; j++) {
        const target = this.world.ships[j];
        if (target && !target.isDestroyed && target.team !== p.team) {
          const hitDist = (target.length / 2.5) + p.radius;
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          if (p.distanceTraveled > 10 && Math.hypot(dx, dy) < hitDist) {
            if (target.buffs && (target.buffs.infinity || target.buffs.invulnerable)) {
              p.isDestroyed = true;
              if (window.Renderer) {
                Renderer.addParticleBurst(p.x, p.y, '#ffd700', 8);
                Renderer.addFloatingText(target.x, target.y - 35, '🛡️ BLOCKED!', '#ffd700');
              }
              break;
            }

            target.takeDamage(p.damage, p.owner);
            this.camera.addShake(3);
            if (window.Renderer) {
              Renderer.addParticleBurst(p.x, p.y, p.color, 8);
            }
            if (!p.piercing) {
              p.isDestroyed = true;
              break;
            }
          }
        }
      }
    }

    // Clean up destroyed projectiles once per frame
    this.world.projectiles = this.world.projectiles.filter(p => p && !p.isDestroyed);

    // 5. Update Aircraft
    for (let i = 0; i < this.world.aircraft.length; i++) {
      const a = this.world.aircraft[i];
      if (a && !a.isDestroyed) {
        a.update(dt, this.world, InputHandler);
      }
    }
    this.world.aircraft = this.world.aircraft.filter(a => a && !a.isDestroyed);

    // 6. Wave Survival Spawner & Healing Logic
    if (this.gameMode === 'survival' && this.playerShip && !this.playerShip.isDestroyed) {
      const redAlive = this.world.ships.filter(s => s && s.team !== this.playerShip.team && !s.isDestroyed && s.hp > 0).length;

      if (redAlive === 0) {
        if (this.waveState === 'COMBAT') {
          this.waveState = 'INTERMISSION';
          this.waveTimer = 2.5;

          // FULL HEAL PLAYER SHIP
          this.playerShip.hp = this.playerShip.maxHp;
          if (window.Renderer) {
            Renderer.addParticleBurst(this.playerShip.x, this.playerShip.y, '#00f5d4', 30);
            Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 50, '💚 WAVE CLEAR! SHIP FULLY REPAIRED!', '#00f5d4');
          }
        } else if (this.waveState === 'INTERMISSION') {
          this.waveTimer -= dt;
          if (this.waveTimer <= 0) {
            this.currentWave++;
            this.waveState = 'COMBAT';
            const diff = CONFIG.DIFFICULTY[this.difficultyKey] || CONFIG.DIFFICULTY.easy;
            this.spawnSurvivalWave(this.currentWave, diff);
          }
        }
      }
    }

    // 7. Update Camera Focus
    const activeTarget = (this.isPilotingPlane && this.playerPlane) ? this.playerPlane : this.playerShip;
    if (activeTarget && !activeTarget.isDestroyed) {
      this.camera.follow(activeTarget, dt);
    }
    this.camera.update(dt);

    // 8. Update HUD Elements
    HUD.update(this.playerShip, this.world);

    // 9. Check Match Win/Loss End Condition
    this.checkMatchEnd();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Map & Ocean Environment
    if (this.world.map) {
      this.world.map.draw(this.ctx, this.camera);
    }

    // 2. Draw Ship Entities
    const shipsCount = this.world.ships.length;
    for (let i = 0; i < shipsCount; i++) {
      const ship = this.world.ships[i];
      if (ship && !ship.isDestroyed) {
        Renderer.drawShip(this.ctx, ship, this.camera);
      }
    }

    // 3. Draw Projectiles
    for (let i = 0; i < this.world.projectiles.length; i++) {
      const p = this.world.projectiles[i];
      if (p && !p.isDestroyed) {
        p.draw(this.ctx, this.camera);
      }
    }

    // 4. Draw Aircraft Entities
    for (let i = 0; i < this.world.aircraft.length; i++) {
      const a = this.world.aircraft[i];
      if (a && !a.isDestroyed) {
        a.draw(this.ctx, this.camera);
      }
    }

    // 5. Draw Particle Explosions & Floating Text
    Renderer.drawParticles(this.ctx, this.camera);
    Renderer.drawFloatingTexts(this.ctx, this.camera);

    // 6. Draw Minimap Radar
    Minimap.draw(this.world, this.camera);
  }

  findNearestEnemy(fromEntity) {
    if (!fromEntity || !this.world.ships) return null;
    let nearest = null;
    let minDist = Infinity;

    for (let i = 0; i < this.world.ships.length; i++) {
      const ship = this.world.ships[i];
      if (ship && ship !== fromEntity && ship.team !== fromEntity.team && !ship.isDestroyed) {
        const d = Math.hypot(ship.x - fromEntity.x, ship.y - fromEntity.y);
        if (d < minDist) {
          minDist = d;
          nearest = ship;
        }
      }
    }
    return nearest;
  }

  checkMatchEnd() {
    if (!this.playerShip || this.state !== 'BATTLE' || this.isEndingMatch) return;
    if (this.gameMode === 'survival') return; // Survival mode ends only when player ship is destroyed

    const blueAlive = this.world.ships.filter(s => s && s.team === 'blue' && !s.isDestroyed && s.hp > 0).length;
    const redAlive = this.world.ships.filter(s => s && s.team === 'red' && !s.isDestroyed && s.hp > 0).length;

    if (this.playerShip.isDestroyed || this.playerShip.hp <= 0 || blueAlive === 0) {
      this.isEndingMatch = true;
      this.state = 'ENDGAME';
      EndGameUI.show(false, this.playerShip);
    } else if (redAlive === 0) {
      this.isEndingMatch = true;
      this.state = 'ENDGAME';
      EndGameUI.show(true, this.playerShip);
    }
  }
}

// Fail-safe Game Engine Bootstrapper with Dynamic Version Auto-Sync
function bootGameEngine() {
  if (!window.Game) {
    window.Game = new GameEngine();
  }
  const verTag = document.querySelector('.version-tag');
  if (verTag && typeof CONFIG !== 'undefined' && CONFIG.VERSION) {
    verTag.innerText = `⚡ ${CONFIG.VERSION} — Tactical Scenarios & AA Flak Edition`;
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGameEngine);
} else {
  bootGameEngine();
}
