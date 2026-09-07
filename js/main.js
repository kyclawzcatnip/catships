/**
 * Catnip Warships — Main Application & Game Engine
 */
class GameEngine {
  constructor() {
    window.CatnipMain = this;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = 'MAIN_MENU'; // 'MAIN_MENU', 'HARBOR_HUB', 'HANGAR', 'BATTLE', 'PAUSED', 'ENDGAME'
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

    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.world.camera = this.camera;

    this.playerShip = null;
    this.playerPlane = null;
    this.playerLifeboat = null;
    this.isPilotingPlane = false;
    this.isPilotingLifeboat = false;
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

    if (window.HUD) window.HUD.init();

    if (window.MainMenuUI) {
      MainMenuUI.init(
        () => this.enterHarborHub(),
        () => {
          if (window.WikiUI) window.WikiUI.show('ships');
        },
        () => {
          try {
            window.close();
          } catch(e) {}
          alert('🚪 Thank you for playing Catnip Warships! You can safely close this browser tab now.');
        }
      );
    }

    if (window.WikiUI) {
      WikiUI.init();
    }

    HangarUI.init((shipId, settings) => {
      this.launchBattle(shipId, settings);
    });

    EndGameUI.init(
      () => {
        this.launchBattle(this.selectedShipId, this.battleSettings);
      },
      () => {
        this.enterHarborHub();
      }
    );

    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.addEventListener('click', () => {
        this.togglePause();
      });
    }

    const btnReturnHangar = document.getElementById('btn-return-hangar');
    if (btnReturnHangar) {
      btnReturnHangar.addEventListener('click', () => {
        this.togglePause();
        this.enterHarborHub();
      });
    }

    const btnPauseGame = document.getElementById('btn-pause-game');
    if (btnPauseGame) {
      btnPauseGame.addEventListener('click', () => {
        this.togglePause();
      });
    }

    const btnHarborDeploy = document.getElementById('btn-harbor-deploy');
    if (btnHarborDeploy) {
      btnHarborDeploy.addEventListener('click', () => {
        this.launchBattle(this.selectedShipId, this.battleSettings);
      });
    }

    const btnHarborMainMenu = document.getElementById('btn-harbor-main-menu');
    if (btnHarborMainMenu) {
      btnHarborMainMenu.addEventListener('click', () => {
        this.returnToMainMenu();
      });
    }

    const pilotBtn = document.getElementById('pilot-plane-btn');
    if (pilotBtn) {
      pilotBtn.style.cursor = 'pointer';
      pilotBtn.addEventListener('click', () => {
        if (this.state === 'BATTLE' || this.state === 'HARBOR_HUB') {
          this.togglePlanePiloting();
        }
      });
    }

    // Default startup state: MAIN_MENU
    this.returnToMainMenu();

    requestAnimationFrame((now) => this.loop(now));
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.resize(this.canvas.width, this.canvas.height);
  }

  returnToMainMenu() {
    this.state = 'MAIN_MENU';
    this.isPilotingPlane = false;
    this.playerPlane = null;
    this.isEndingMatch = false;

    if (window.MainMenuUI) MainMenuUI.show();
    const hangarScreen = document.getElementById('hangar-screen');
    const battleScreen = document.getElementById('battle-screen');
    if (hangarScreen) {
      hangarScreen.style.display = 'none';
      hangarScreen.classList.remove('active');
    }
    if (battleScreen) {
      battleScreen.style.display = 'none';
      battleScreen.classList.remove('active');
    }
    const promptEl = document.getElementById('harbor-hud-prompt');
    if (promptEl) promptEl.style.display = 'none';
  }

  openHangarScreen() {
    this.state = 'HANGAR';
    this.isPilotingPlane = false;
    this.playerPlane = null;
    this.isEndingMatch = false;

    if (window.MainMenuUI) MainMenuUI.hide();
    const hangarScreen = document.getElementById('hangar-screen');
    const battleScreen = document.getElementById('battle-screen');
    if (battleScreen) {
      battleScreen.style.display = 'none';
      battleScreen.classList.remove('active');
    }
    if (hangarScreen) {
      hangarScreen.style.display = 'flex';
      hangarScreen.classList.add('active');
    }
    const promptEl = document.getElementById('harbor-hud-prompt');
    if (promptEl) promptEl.style.display = 'none';

    if (window.HangarUI) HangarUI.startPreviewAnimation();
  }

  closeHangarToHarbor() {
    const hangarScreen = document.getElementById('hangar-screen');
    const battleScreen = document.getElementById('battle-screen');
    if (hangarScreen) {
      hangarScreen.style.display = 'none';
      hangarScreen.classList.remove('active');
    }
    if (battleScreen) {
      battleScreen.style.display = 'flex';
      battleScreen.classList.add('active');
    }
    if (this.playerShip) {
      try {
        const savedPaintId = localStorage.getItem(`catnip_paint_${this.selectedShipId}`);
        if (savedPaintId && window.SHIPYARD_PAINTS) {
          const paintObj = window.SHIPYARD_PAINTS.find(p => p.id === savedPaintId);
          if (paintObj) this.playerShip.paintObj = paintObj;
        }
      } catch (e) {}
    }
  }

  enterHarborHub(forceReset = false) {
    if (this.state === 'HARBOR_HUB' && this.playerShip && !forceReset) {
      this.closeHangarToHarbor();
      return;
    }

    this.state = 'HARBOR_HUB';
    this.isPilotingPlane = false;
    this.playerPlane = null;
    this.isEndingMatch = false;

    if (window.MainMenuUI) MainMenuUI.hide();
    const hangarScreen = document.getElementById('hangar-screen');
    const battleScreen = document.getElementById('battle-screen');
    if (hangarScreen) {
      hangarScreen.style.display = 'none';
      hangarScreen.classList.remove('active');
    }
    if (battleScreen) {
      battleScreen.style.display = 'flex';
      battleScreen.classList.add('active');
    }
    
    const hubHeader = document.getElementById('harbor-hub-header');
    const battleScore = document.getElementById('battle-score-box');
    if (hubHeader) hubHeader.classList.remove('hidden');
    if (battleScore) battleScore.classList.add('hidden');

    this.resizeCanvas();

    // Setup World & Map for Harbor Basin
    this.world.map = new MapEngine('tropical');
    this.world.ships = [];
    this.world.projectiles = [];
    this.world.aircraft = [];
    this.world.lifeboats = [];
    this.world.docks = [];
    this.world.addProjectile = (p) => this.world.projectiles.push(p);
    this.world.addAircraft = (a) => this.world.aircraft.push(a);
    this.world.addLifeboat = (l) => this.world.lifeboats.push(l);
    this.world.findNearestEnemy = () => null;

    // Create Player Ship at central Harbor Basin slip
    const pData = SHIPS_DATA.find(s => Number(s.id) === Number(this.selectedShipId)) || SHIPS_DATA[0];
    this.playerShip = new Ship(pData, 'blue', 1500, 1600);
    this.playerShip.isPlayer = true;
    this.playerShip.hp = this.playerShip.maxHp;

    // Apply Shipyard Paint
    try {
      const savedPaintId = localStorage.getItem(`catnip_paint_${this.selectedShipId}`);
      if (savedPaintId && window.SHIPYARD_PAINTS) {
        const paintObj = window.SHIPYARD_PAINTS.find(p => p.id === savedPaintId);
        if (paintObj) this.playerShip.paintObj = paintObj;
      }
    } catch (e) {}

    this.world.ships.push(this.playerShip);
    this.world.playerShip = this.playerShip;

    // Add 3 Physical Harbor Districts
    if (window.HarborDock) {
      // 1. Catnip Shipyard (North Pier)
      this.world.docks.push(new HarborDock({
        x: 1200, y: 1000, team: 'blue', label: 'Catnip Shipyard', icon: '🏗️'
      }));
      // 2. Harbor Basin Resupply (Central Basin)
      this.world.docks.push(new HarborDock({
        x: 1500, y: 1400, team: 'blue', label: 'Harbor Basin Resupply', icon: '⚓'
      }));
      // 3. "The Salty Meow" Officer Quarters (South Coastal Tavern)
      this.world.docks.push(new HarborDock({
        x: 1800, y: 1200, team: 'blue', label: '"The Salty Meow" Officer Quarters', icon: '🐱'
      }));
    }

    // Camera Follow
    const targetCamX = this.playerShip.x - this.camera.viewportWidth / 2;
    const targetCamY = this.playerShip.y - this.camera.viewportHeight / 2;
    this.camera.x = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.camera.viewportWidth, targetCamX));
    this.camera.y = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.camera.viewportHeight, targetCamY));

    if (window.Renderer) {
      Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 50, '⚓ WELCOME TO CATNIP HARBOR BASIN HUB!', '#00e5ff');
    }
  }

  handleDockInteraction(dock) {
    if (!dock) return;
    const label = dock.label || '';
    const hangarScreen = document.getElementById('hangar-screen');

    if (label.includes('Shipyard')) {
      if (hangarScreen) {
        hangarScreen.style.display = 'flex';
        hangarScreen.classList.add('active');
      }
      if (window.HangarUI) {
        HangarUI.startPreviewAnimation();
        HangarUI.renderShipyardCustomizer(this.playerShip);
      }
      setTimeout(() => {
        const card = document.querySelector('.shipyard-card');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.outline = '3px solid #00e5ff';
          card.style.boxShadow = '0 0 35px #00e5ff';
          setTimeout(() => { card.style.outline = ''; card.style.boxShadow = ''; }, 3000);
        }
      }, 50);
      if (window.Renderer && this.playerShip) {
        Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '🏗️ ENTERING CATNIP SHIPYARD...', '#00e5ff');
      }
    } else if (label.includes('Salty Meow') || label.includes('Officer')) {
      if (hangarScreen) {
        hangarScreen.style.display = 'flex';
        hangarScreen.classList.add('active');
      }
      if (window.HangarUI) {
        HangarUI.startPreviewAnimation();
        HangarUI.renderCrewStations(this.playerShip);
      }
      setTimeout(() => {
        const card = document.querySelector('.crew-card');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.outline = '3px solid #ffd700';
          card.style.boxShadow = '0 0 35px #ffd700';
          setTimeout(() => { card.style.outline = ''; card.style.boxShadow = ''; }, 3000);
        }
      }, 50);
      if (window.Renderer && this.playerShip) {
        Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '🐱 ENTERING "THE SALTY MEOW" OFFICER QUARTERS...', '#ffd700');
      }
    } else if (label.includes('Harbor') || label.includes('Resupply')) {
      if (this.playerShip) {
        this.playerShip.hp = this.playerShip.maxHp;
        this.playerShip.saCooldownTimer = 0;
        if (window.Renderer) {
          Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, '⚓ HARBOR BASIN RESUPPLY COMPLETE! (+100% HP & AMMO)', '#00f5d4');
          Renderer.addParticleBurst(this.playerShip.x, this.playerShip.y, '#00f5d4', 30);
        }
      }
      const resupplyModal = document.getElementById('harbor-resupply-modal');
      if (resupplyModal) {
        resupplyModal.classList.remove('hidden');
      }
    }
  }

  returnToHangar() {
    this.enterHarborHub();
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
        cooldownSpeed: 1.0,
        allyCount: 3,
        enemyCount: 8
      };
    } else if (!settings || typeof settings !== 'object') {
      settings = {
        difficulty: 'easy',
        battleType: 'skirmish',
        ambushSide: 'DEFEND',
        mapTheme: 'tropical',
        weather: 'clear',
        fleetSize: '5v5',
        cooldownSpeed: 1.0,
        allyCount: 3,
        enemyCount: 8
      };
    }

    this.battleSettings = JSON.parse(JSON.stringify(settings));
    this.difficultyKey = this.battleSettings.difficulty || 'easy';
    this.gameMode = this.battleSettings.battleType || 'skirmish';
    this.state = 'BATTLE';
    this.isEndingMatch = false;
    if (this.battleSettings.battleType !== 'story') {
      this.isStoryMode = false;
      this.storyMission = null;
    }

    if (this.gameMode !== 'survival') {
      this.waveState = 'NONE';
      this.currentWave = 1;
      this.waveTimer = 0;
    }

    window.CatnipMain = this;
    this.lockedTarget = null;
    this.fleetCommand = 'ATTACK';
    this.isPilotingPlane = false;
    this.playerPlane = null;

    const diff = CONFIG.DIFFICULTY[this.difficultyKey] || CONFIG.DIFFICULTY.easy;

    // Switch Screens & Resize Canvas Buffer
    const hangarScreen = document.getElementById('hangar-screen');
    const battleScreen = document.getElementById('battle-screen');
    if (hangarScreen) {
      hangarScreen.style.display = 'none';
      hangarScreen.classList.remove('active');
    }
    if (battleScreen) {
      battleScreen.style.display = 'flex';
      battleScreen.classList.add('active');
    }
    
    const hubHeader = document.getElementById('harbor-hub-header');
    const battleScore = document.getElementById('battle-score-box');
    if (hubHeader) hubHeader.classList.add('hidden');
    if (battleScore) battleScore.classList.remove('hidden');

    this.resizeCanvas();

    // Strip focus from any active HTML input/select box so WASD keys reach the game engine
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    if (typeof window.focus === 'function') {
      window.focus();
    }

    // Setup World & Map with selected Theme
    this.world.map = new MapEngine(this.battleSettings.mapTheme || 'tropical');
    this.world.ships = [];
    this.world.projectiles = [];
    this.world.aircraft = [];
    this.world.lifeboats = [];
    this.world.docks = [];
    this.world.addProjectile = (p) => this.world.projectiles.push(p);
    this.world.addAircraft = (a) => this.world.aircraft.push(a);
    this.world.addLifeboat = (l) => this.world.lifeboats.push(l);
    this.world.findNearestEnemy = (fromEntity) => this.findNearestEnemy(fromEntity);
    this.world.fleetCommand = 'ATTACK';
    this.world.playerShip = null;

    // Create Player Ship
    const pData = SHIPS_DATA.find(s => Number(s.id) === Number(shipId)) || SHIPS_DATA[0];
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

    // Apply Equipped Cat Officers from LocalStorage
    try {
      const rawCrew = localStorage.getItem(`catnip_crew_${shipId}`);
      const officersList = window.CREW_OFFICERS || [];
      let equippedOfficerIds = rawCrew ? JSON.parse(rawCrew) : [];
      if (!Array.isArray(equippedOfficerIds) || equippedOfficerIds.length === 0) {
        equippedOfficerIds = ['captain_whisker', 'chief_barnaby', 'gunner_claws', 'helmsman_paw'];
      }
      const equippedOfficers = equippedOfficerIds.map(id => officersList.find(o => o.id === id)).filter(Boolean);
      this.playerShip.applyCrew(equippedOfficers);
    } catch (e) {}

    // Apply Shipyard Customizations (Paint & Turret Modules)
    try {
      const savedPaintId = localStorage.getItem(`catnip_paint_${shipId}`);
      if (savedPaintId && window.SHIPYARD_PAINTS) {
        const paintObj = window.SHIPYARD_PAINTS.find(p => p.id === savedPaintId);
        if (paintObj) this.playerShip.paintObj = paintObj;
      }
      const savedTurretId = localStorage.getItem(`catnip_turret_${shipId}`);
      if (savedTurretId && window.TURRET_MODULES) {
        const turretObj = window.TURRET_MODULES.find(t => t.id === savedTurretId);
        if (turretObj) {
          this.playerShip.turretModule = turretObj;
          this.playerShip.damage = Math.round(this.playerShip.damage * turretObj.damageMult);
          this.playerShip.baseReloadTime *= turretObj.reloadMult;
        }
      }
    } catch (e) {}

    document.getElementById('hud-player-ship-name').innerText = pData.name;
    document.getElementById('hud-type-badge').innerText = pData.type;

    this.world.ships.push(this.playerShip);
    this.world.playerShip = this.playerShip;

    // Instantly snap camera focus directly to player ship position on launch!
    const targetCamX = this.playerShip.x - this.camera.viewportWidth / 2;
    const targetCamY = this.playerShip.y - this.camera.viewportHeight / 2;
    this.camera.x = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.camera.viewportWidth, targetCamX));
    this.camera.y = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.camera.viewportHeight, targetCamY));

    InputHandler.resetMouse();
    this.playerShip.turretAngle = this.playerShip.rotation;

    // Setup Fleet Roster according to Battle Type & Fleet Size
    this.setupFleetForMode(this.battleSettings, diff);

    // Spawn Friendly Harbor Dock near Base Port
    if (window.HarborDock) {
      this.world.docks.push(new HarborDock({
        x: playerSpawnX - 220,
        y: (CONFIG.MAP_HEIGHT / 2) - 220,
        team: playerTeam
      }));
    }
  }

  launchStoryMission(ch) {
    if (!ch) return;
    this.isStoryMode = true;
    this.storyMission = ch;

    const settings = {
      difficulty: ch.difficulty || 'normal',
      battleType: 'story',
      mapTheme: ch.mapTheme || 'tropical',
      weather: ch.weather || 'clear',
      fleetSize: '5v5',
      cooldownSpeed: 1.0,
      allyCount: ch.allyCount || 1,
      enemyCount: ch.enemyFleet ? ch.enemyFleet.length : 3
    };

    this.launchBattle(ch.playerShipId || 1, settings);

    if (window.StoryMode && ch.briefing) {
      window.StoryMode.showBriefingOverlay(ch.briefing);
    }
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
      // ⚠️ CUSTOM OUTNUMBERED FLEET CLASH (Supports 1 to 50 Allies vs 1 to 50 Enemies!)
      const targetAllyTotal = Math.min(50, Math.max(1, (settings && settings.allyCount) || 3));
      const targetEnemyTotal = Math.min(50, Math.max(1, (settings && settings.enemyCount) || 8));

      // Spawn Additional Ally Ships (Target Ally Total - 1 for Player Ship)
      const alliesToSpawn = targetAllyTotal - 1;
      for (let i = 0; i < alliesToSpawn; i++) {
        const sampleId = [29, 9, 7, 18, 76, 88, 98][i % 7];
        const data = SHIPS_DATA.find(s => s.id === sampleId) || SHIPS_DATA[0];
        const col = Math.floor(i / 5);
        const row = i % 5;
        const ally = new Ship(data, 'blue', 450 - col * 120, 400 + row * 220);
        ally.maxHp = Math.round(ally.maxHp * diff.allyHpMult);
        ally.hp = ally.maxHp;
        if (cdMult < 1.0) ally.baseReloadTime *= cdMult;
        this.world.ships.push(ally);
      }

      // Spawn Custom Enemy Ships (Target Enemy Total, up to 50 cap!)
      for (let i = 0; i < targetEnemyTotal; i++) {
        const sampleId = [2, 8, 14, 17, 22, 28, 35, 38, 42, 45, 52, 67, 73, 77, 85, 93, 99][i % 17];
        const data = SHIPS_DATA.find(s => s.id === sampleId) || SHIPS_DATA[1];
        const col = Math.floor(i / 6);
        const row = i % 6;
        const enemy = new Ship(data, 'red', CONFIG.MAP_WIDTH - 650 - col * 140, 350 + row * 200);
        enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult);
        this.world.ships.push(enemy);
      }
    } else if ((mode === 'story' || this.isStoryMode) && this.storyMission) {
      const ch = this.storyMission;
      const allyCount = ch.allyCount || 1;
      for (let i = 0; i < allyCount - 1; i++) {
        const sampleId = [29, 9, 7, 18, 76, 88, 98][i % 7];
        const data = SHIPS_DATA.find(s => s.id === sampleId) || SHIPS_DATA[0];
        const ally = new Ship(data, 'blue', 500 - i * 140, CONFIG.MAP_HEIGHT / 2 + (i % 2 === 0 ? 180 : -180));
        ally.maxHp = Math.round(ally.maxHp * diff.allyHpMult);
        ally.hp = ally.maxHp;
        this.world.ships.push(ally);
      }

      const enemyIds = ch.enemyFleet || [2, 10, 11];
      enemyIds.forEach((id, idx) => {
        const data = SHIPS_DATA.find(s => s.id === id) || SHIPS_DATA[1];
        const col = Math.floor(idx / 3);
        const row = idx % 3;
        const enemy = new Ship(data, 'red', 1600 + col * 160, CONFIG.MAP_HEIGHT / 2 + (row - 1) * 180);
        enemy.damage = Math.round(enemy.damage * diff.enemyDmgMult);
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
      let jet = this.world.aircraft.find(a => a && a.team === (this.playerShip ? this.playerShip.team : 'blue') && !a.isDestroyed);
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
      this.playerPlane.lifeTimer = 9999;
      this.isPilotingPlane = true;

      // Position jet at captain's ship position when taking off
      if (this.playerShip) {
        this.playerPlane.x = this.playerShip.x;
        this.playerPlane.y = this.playerShip.y;
        this.playerPlane.rotation = this.playerShip.rotation;
      }

      if (window.Renderer) {
        Renderer.addFloatingText(this.playerPlane.x, this.playerPlane.y - 40, '✈️ PILOTING CAT FIGHTER JET! (Press P or Click HUD to Exit)', '#ffd700');
      }
    }
  }

  togglePause() {
    const pauseModal = document.getElementById('pause-modal');
    if (this.state === 'BATTLE') {
      this.state = 'PAUSED';
      if (pauseModal) {
        pauseModal.classList.add('active');
        pauseModal.classList.remove('hidden');
      }
    } else if (this.state === 'PAUSED') {
      this.state = 'BATTLE';
      if (pauseModal) {
        pauseModal.classList.remove('active');
        pauseModal.classList.add('hidden');
      }
    }
  }

  loop(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    if (this.state === 'BATTLE' || this.state === 'HARBOR_HUB') {
      try {
        this.update(dt);
        this.render();
      } catch (err) {
        console.error("Catnip Warships loop error:", err);
      }
    } else if (this.state === 'ENDGAME') {
      // Continue updating ocean ripples, particles, floating text & camera during victory cutscenes!
      try {
        this.updateEndGame(dt);
        this.render();
      } catch (err) {
        console.error("Catnip Warships endgame loop error:", err);
      }
    } else if (this.state === 'PAUSED') {
      if (InputHandler.consumePauseTrigger()) {
        this.togglePause();
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  updateEndGame(dt) {
    if (this.world.map) {
      this.world.map.update(dt, this.world);
    }
    const shipsCount = this.world.ships ? this.world.ships.length : 0;
    for (let i = 0; i < shipsCount; i++) {
      const ship = this.world.ships[i];
      if (ship && !ship.isDestroyed) {
        ship.vx *= 0.95;
        ship.vy *= 0.95;
        ship.x += ship.vx * dt;
        ship.y += ship.vy * dt;
      }
    }
    if (window.Renderer) {
      Renderer.updateFX(dt);
    }
    const activeTarget = (this.isPilotingPlane && this.playerPlane) ? this.playerPlane : this.playerShip;
    if (activeTarget && this.camera) {
      this.camera.follow(activeTarget.x, activeTarget.y);
    }
  }

  update(dt) {
    // 0. Update Map Environmental Effects
    if (this.world.map) {
      this.world.map.update(dt, this.world);
    }

    // Interactive Harbor Hub Handling
    if (this.state === 'HARBOR_HUB') {
      let nearDock = null;
      if (this.world.docks && this.playerShip) {
        this.world.docks.forEach(dock => {
          const dist = Math.hypot(this.playerShip.x - dock.x, this.playerShip.y - dock.y);
          if (dist < dock.dockRadius + 60) {
            nearDock = dock;
          }
        });
      }

      let promptEl = document.getElementById('harbor-hud-prompt');
      if (!promptEl) {
        promptEl = document.createElement('div');
        promptEl.id = 'harbor-hud-prompt';
        document.getElementById('app').appendChild(promptEl);
      }

      if (nearDock) {
        promptEl.style.display = 'flex';
        promptEl.innerHTML = `<span>${nearDock.icon} ${nearDock.label}</span> — Click or Press <b>[E]</b> to Enter`;
        promptEl.onclick = (e) => {
          if (e) e.stopPropagation();
          this.handleDockInteraction(nearDock);
        };

        if (InputHandler.consumeAbilityTrigger()) {
          this.handleDockInteraction(nearDock);
        }

        // Canvas direct click on harbor dock slip
        if (InputHandler.mouse.isDown && InputHandler.mouse.hasMoved) {
          InputHandler.updateWorldMouse(this.camera);
          const distToMouse = Math.hypot(InputHandler.mouse.worldX - nearDock.x, InputHandler.mouse.worldY - nearDock.y);
          if (distToMouse < nearDock.dockRadius + 20) {
            InputHandler.mouse.isDown = false;
            this.handleDockInteraction(nearDock);
          }
        }
      } else {
        promptEl.style.display = 'none';
      }

      // Check if player sails past Harbor Exit Buoy Gate to launch fleet battle
      if (this.playerShip) {
        if (this.playerShip.x < 300 || this.playerShip.x > 3700 || this.playerShip.y < 300 || this.playerShip.y > 3700) {
          if (window.Renderer) {
            Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 60, '🌊 DEPLOYING TO OPEN SEA COMBAT!', '#ffd700');
          }
          this.launchBattle(this.selectedShipId, this.battleSettings);
          return;
        }
      }
    } else {
      const promptEl = document.getElementById('harbor-hud-prompt');
      if (promptEl) promptEl.style.display = 'none';
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

      // 🤖 5x COMMANDER AUTOPILOT ASSIST: Command warship auto-navigates & aims with 5x skill while captain is in fighter jet!
      if (this.playerShip && !this.playerShip.isDestroyed) {
        this.playerShip.isPlayerAutopilot = true;
        FleetAI.update(this.playerShip, dt, this.world);
        this.playerShip.update(dt, this.world, null);
      }
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
      } else if (InputHandler.mouse.hasMoved) {
        this.playerShip.turretAngle = Math.atan2(
          InputHandler.mouse.worldY - this.playerShip.y,
          InputHandler.mouse.worldX - this.playerShip.x
        );
      } else {
        this.playerShip.turretAngle = this.playerShip.rotation;
      }

      // Fire Main Cannon
      if (InputHandler.mouse.isDown || InputHandler.consumeSpaceTrigger()) {
        this.playerShip.firePrimary(this.world);
      }

      // AA Anti-Aircraft Flak Guns (Key F)
      if (InputHandler.consumeAATrigger()) {
        this.playerShip.fireAA(this.world);
      }

      // 🤿 Submarine Dive / Surface Toggle (Key Shift / Key X)
      if (InputHandler.consumeSubmarineDiveTrigger()) {
        this.playerShip.isSubmerged = !this.playerShip.isSubmerged;
        if (window.Renderer) {
          const label = this.playerShip.isSubmerged ? '🤿 SUBMERGED UNDERWATER (BULLET PROOF)!' : '⚓ SURFACED TO WATERLINE!';
          const color = this.playerShip.isSubmerged ? '#00e5ff' : '#ffd700';
          Renderer.addFloatingText(this.playerShip.x, this.playerShip.y - 45, label, color);
          Renderer.addParticleBurst(this.playerShip.x, this.playerShip.y, '#00e5ff', 25);
        }
      }

      // Special Ability (Key E)
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

    // Catnip Alliance Rescue Floating Lifeboats (Dark Fleet IS EVIL & IGNORES LIFEBOATS)
    if (this.world.lifeboats && this.world.lifeboats.length > 0) {
      for (let i = 0; i < shipsCount; i++) {
        const s = this.world.ships[i];
        if (s && !s.isDestroyed && !s.isSinking && s.team === 'blue') {
          for (let j = 0; j < this.world.lifeboats.length; j++) {
            PhysicsEngine.handleLifeboatRescue(s, this.world.lifeboats[j], this.world);
          }
        }
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

      // Check Projectile Collisions vs Enemy Aircraft (Aerial Dogfighting!)
      const aircraftCount = this.world.aircraft ? this.world.aircraft.length : 0;
      let hitAircraft = false;
      for (let k = 0; k < aircraftCount; k++) {
        const jet = this.world.aircraft[k];
        if (jet && !jet.isDestroyed && jet.team !== p.team) {
          const hitDist = (jet.length / 2.0) + p.radius;
          const dx = jet.x - p.x;
          const dy = jet.y - p.y;
          if (p.distanceTraveled > 8 && Math.hypot(dx, dy) < hitDist) {
            jet.takeDamage(p.damage);
            p.isDestroyed = true;
            hitAircraft = true;
            if (window.Renderer) {
              Renderer.addParticleBurst(p.x, p.y, '#ffd700', 10);
              Renderer.addFloatingText(jet.x, jet.y - 25, '💥 DOGFIGHT HIT!', '#ff3366');
            }
            break;
          }
        }
      }
      if (hitAircraft) continue;

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

            target.takeDamage(p.damage, p.owner, this.world);
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

    // 5b. Update Lifeboats
    if (this.world.lifeboats) {
      for (let i = 0; i < this.world.lifeboats.length; i++) {
        const boat = this.world.lifeboats[i];
        if (boat && !boat.isDestroyed) {
          boat.update(dt, this.world, InputHandler);
        }
      }
      this.world.lifeboats = this.world.lifeboats.filter(b => b && !b.isDestroyed);
    }

    // 5b-2. Update Harbor Docks
    if (this.world.docks) {
      this.world.docks.forEach(d => d.update(dt, this.world));
    }

    // 5c. Playable Lifeboat Re-Boarding Ally Warship Routine
    if (this.isPilotingLifeboat && this.playerLifeboat && !this.playerLifeboat.isDestroyed) {
      const allyShips = this.world.ships.filter(s => s && s.team === 'blue' && !s.isDestroyed && !s.isSinking);
      for (let i = 0; i < allyShips.length; i++) {
        const ally = allyShips[i];
        if (Math.hypot(ally.x - this.playerLifeboat.x, ally.y - this.playerLifeboat.y) < (ally.length / 2 + 20)) {
          // Re-board Ally Ship!
          if (this.playerShip) this.playerShip.isPlayer = false;
          ally.isPlayer = true;
          this.playerShip = ally;
          this.world.playerShip = ally;
          this.isPilotingLifeboat = false;

          // Heal Ally Ship & Surge Morale
          ally.hp = Math.min(ally.maxHp, ally.hp + 100);
          ally.morale = 100;
          this.world.coins = (this.world.coins || 0) + 50;

          // Destroy flagship & follower lifeboats safely as crew boards ship
          if (this.world.lifeboats) {
            this.world.lifeboats.forEach(b => {
              if (b && b.team === 'blue') b.isDestroyed = true;
            });
          }

          if (window.Renderer) {
            Renderer.addFloatingText(ally.x, ally.y - 50, '⚓ CAPTAIN RE-BOARDED ALLY WARSHIP (+100 HP, MORALE 100%)!', '#39ff14');
            Renderer.addParticleBurst(ally.x, ally.y, '#ffd700', 30);
          }
          break;
        }
      }
    }

    // 6. Wave Survival Spawner & Healing Logic (STRICTLY ISOLATED TO SURVIVAL MODE ONLY)
    if (this.gameMode === 'survival' && !this.isStoryMode && this.playerShip && !this.playerShip.isDestroyed) {
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

    // 7. Update Camera Focus (Lifeboat -> Fighter Jet -> Player Warship)
    const activeTarget = (this.isPilotingLifeboat && this.playerLifeboat && !this.playerLifeboat.isDestroyed)
      ? this.playerLifeboat
      : ((this.isPilotingPlane && this.playerPlane && !this.playerPlane.isDestroyed) ? this.playerPlane : this.playerShip);

    if (activeTarget && !activeTarget.isDestroyed) {
      this.camera.follow(activeTarget.x, activeTarget.y);
    }

    // 8. Update HUD Elements
    HUD.update(this.playerShip, this.world);

    // 9. Check Match Win/Loss End Condition
    this.checkMatchEnd();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Reset Context Defaults to prevent state leakage from previous passes
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;
    if (this.ctx.setLineDash) this.ctx.setLineDash([]);

    // 1. Draw Map & Ocean Environment
    if (this.world.map) {
      this.world.map.draw(this.ctx, this.camera);
    }

    // Reset Context State after map before drawing entities
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;
    if (this.ctx.setLineDash) this.ctx.setLineDash([]);

    // 1b. Draw Harbor Docks
    if (this.world.docks) {
      this.world.docks.forEach(d => d.draw(this.ctx, this.camera));
    }

    // 1c. Draw Lifeboats floating on ocean
    if (this.world.lifeboats) {
      for (let i = 0; i < this.world.lifeboats.length; i++) {
        const boat = this.world.lifeboats[i];
        if (boat && !boat.isDestroyed) {
          boat.draw(this.ctx, this.camera);
        }
      }
    }

    // 2. Draw Ship Entities
    const shipsCount = this.world.ships ? this.world.ships.length : 0;
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
    Renderer.drawFX(this.ctx, this.camera);

    // 6. Draw Minimap Radar
    Minimap.draw(this.world, this.camera);
  }

  findNearestEnemy(fromEntity) {
    if (!fromEntity || !this.world.ships) return null;
    let nearest = null;
    let minDist = Infinity;

    for (let i = 0; i < this.world.ships.length; i++) {
      const ship = this.world.ships[i];
      if (ship && ship !== fromEntity && ship.team !== fromEntity.team && !ship.isDestroyed && !ship.isSinking) {
        const d = Math.hypot(ship.x - fromEntity.x, ship.y - fromEntity.y);
        if (d < minDist) {
          minDist = d;
          nearest = ship;
        }
      }
    }

    // Fallback: If no enemy ships remain, auto-target active enemy aircraft!
    if (!nearest && this.world.aircraft) {
      for (let i = 0; i < this.world.aircraft.length; i++) {
        const jet = this.world.aircraft[i];
        if (jet && jet !== fromEntity && jet.team !== fromEntity.team && !jet.isDestroyed) {
          const d = Math.hypot(jet.x - fromEntity.x, jet.y - fromEntity.y);
          if (d < minDist) {
            minDist = d;
            nearest = jet;
          }
        }
      }
    }

    return nearest;
  }

  checkMatchEnd() {
    if (!this.playerShip || this.state !== 'BATTLE' || this.isEndingMatch) return;
    if (this.gameMode === 'survival') return; // Survival mode ends only when player ship is destroyed

    // Victory requirement: ALL enemy ships AND ALL enemy planes must be eliminated!
    const blueShips = this.world.ships.filter(s => s && s.team === 'blue' && !s.isDestroyed && !s.isSinking && s.hp > 0).length;
    const bluePlanes = (this.world.aircraft || []).filter(a => a && a.team === 'blue' && !a.isDestroyed && a.hp > 0).length;
    const blueLifeboatAlive = (this.isPilotingLifeboat && this.playerLifeboat && !this.playerLifeboat.isDestroyed) ? 1 : 0;
    const blueAlive = blueShips + bluePlanes + blueLifeboatAlive;

    const redShips = this.world.ships.filter(s => s && s.team === 'red' && !s.isDestroyed && !s.isSinking && s.hp > 0).length;
    const redPlanes = (this.world.aircraft || []).filter(a => a && a.team === 'red' && !a.isDestroyed && a.hp > 0).length;
    const redAlive = redShips + redPlanes;

    if (blueAlive === 0 || (this.playerShip && (this.playerShip.isDestroyed || (this.playerShip.hp <= 0 && !this.playerShip.isSinking)) && !this.isPilotingLifeboat)) {
      this.isEndingMatch = true;
      this.state = 'ENDGAME';
      EndGameUI.show(false, this.playerShip);
    } else if (redAlive === 0) {
      this.isEndingMatch = true;
      this.state = 'ENDGAME';

      if (this.isStoryMode && this.storyMission && window.StoryMode) {
        // Save Mission Completion to StoryMode & localStorage!
        window.StoryMode.completeMission(this.storyMission.id);

        if (this.storyMission.debriefing) {
          window.StoryMode.showBriefingOverlay(this.storyMission.debriefing, () => {
            window.StoryMode.showMissionAccomplishedModal(this.storyMission);
          });
          return;
        } else {
          window.StoryMode.showMissionAccomplishedModal(this.storyMission);
          return;
        }
      }

      EndGameUI.show(true, this.playerShip);
    }
  }
}

// Fail-safe Game Engine Bootstrapper with Dynamic Version Auto-Sync
function getGameEngine() {
  if (!window.Game) {
    window.Game = new GameEngine();
  }
  window.CatnipMain = window.Game;
  return window.CatnipMain;
}
window.getGameEngine = getGameEngine;

function bootGameEngine() {
  getGameEngine();
  const verTag = document.querySelector('.version-tag');
  if (verTag && typeof CONFIG !== 'undefined' && CONFIG.VERSION) {
    verTag.innerText = `⚡ ${CONFIG.VERSION} — 📖 Story Campaign Edition`;
  }
  const verInline = document.querySelector('.version-badge-inline');
  if (verInline && typeof CONFIG !== 'undefined' && CONFIG.VERSION) {
    verInline.innerText = CONFIG.VERSION;
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootGameEngine);
} else {
  bootGameEngine();
}
