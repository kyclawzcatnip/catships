/**
 * Catnip Warships — Hangar & Ship Selection UI Controller
 */
class HangarUIClass {
  constructor() {
    this.selectedShipId = 1; // Default to Ship 1 (Catnip)
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.previewAnimFrame = null;
    this.previewAngle = 0;
    this.previewShipInstance = null;
    this.isHangarActive = true;
  }

  init(onLaunchCallback) {
    this.onLaunch = onLaunchCallback;

    this.bindEvents();
    this.renderShipGrid();
    this.selectShip(1);
    this.startPreviewAnimation();
  }

  bindEvents() {
    // Filter tabs
    const tabs = document.querySelectorAll('.filter-tabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this.renderShipGrid();
      });
    });

    // Search input
    const searchInput = document.getElementById('ship-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderShipGrid();
      });
    }

    // Story Mode Campaign UI Event Listeners
    const btnStory = document.getElementById('btn-open-story-mode');
    const btnCloseStory = document.getElementById('btn-close-story');
    const btnBackHangar = document.getElementById('btn-back-to-hangar');

    if (btnStory) {
      btnStory.addEventListener('click', () => {
        if (window.StoryMode) window.StoryMode.openChapterSelectModal();
      });
    }
    if (btnCloseStory) {
      btnCloseStory.addEventListener('click', () => {
        if (window.StoryMode) window.StoryMode.closeChapterSelectModal();
      });
    }
    if (btnBackHangar) {
      btnBackHangar.addEventListener('click', () => {
        if (window.StoryMode) window.StoryMode.closeChapterSelectModal();
      });
    }

    // Sync top header Game Mode dropdown and update Launch Button label dynamically
    const modeSelectHeader = document.getElementById('game-mode-select');
    const typeSelectPanel = document.getElementById('setting-battle-type');
    if (modeSelectHeader) {
      modeSelectHeader.addEventListener('change', (e) => {
        if (typeSelectPanel) typeSelectPanel.value = e.target.value;
        this.updateLaunchButtonText();
      });
      this.updateLaunchButtonText();
    }
    if (typeSelectPanel) {
      typeSelectPanel.addEventListener('change', (e) => {
        if (modeSelectHeader) modeSelectHeader.value = e.target.value;
        this.updateLaunchButtonText();
      });
    }

    // Custom Outnumbered Fleet Count Stepper Listeners
    const allyInput = document.getElementById('input-ally-count');
    const enemyInput = document.getElementById('input-enemy-count');
    const allyMinus = document.getElementById('btn-ally-minus');
    const allyPlus = document.getElementById('btn-ally-plus');
    const enemyMinus = document.getElementById('btn-enemy-minus');
    const enemyPlus = document.getElementById('btn-enemy-plus');

    const updateCounts = () => {
      this.updateLaunchButtonText();
    };

    if (allyMinus && allyInput) {
      allyMinus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = Math.max(1, (parseInt(allyInput.value) || 3) - 1);
        allyInput.value = val;
        updateCounts();
      });
    }
    if (allyPlus && allyInput) {
      allyPlus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = Math.min(50, (parseInt(allyInput.value) || 3) + 1);
        allyInput.value = val;
        updateCounts();
      });
    }
    if (enemyMinus && enemyInput) {
      enemyMinus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = Math.max(1, (parseInt(enemyInput.value) || 8) - 1);
        enemyInput.value = val;
        updateCounts();
      });
    }
    if (enemyPlus && enemyInput) {
      enemyPlus.addEventListener('click', (e) => {
        e.preventDefault();
        let val = Math.min(50, (parseInt(enemyInput.value) || 8) + 1);
        enemyInput.value = val;
        updateCounts();
      });
    }

    if (allyInput) allyInput.addEventListener('input', updateCounts);
    if (enemyInput) enemyInput.addEventListener('input', updateCounts);

    // Launch Battle button
    const launchBtn = document.getElementById('btn-deploy-ship');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        this.stopPreviewAnimation();
        const diffSelect = document.getElementById('difficulty-select');
        const themeSelect = document.getElementById('setting-map-theme');
        const weatherSelect = document.getElementById('setting-weather');
        const fleetSelect = document.getElementById('setting-fleet-size');
        const cdSelect = document.getElementById('setting-cooldown-speed');
        const sideSelect = document.getElementById('setting-ambush-side');

        const chosenBattleType = (modeSelectHeader && modeSelectHeader.value) || (typeSelectPanel && typeSelectPanel.value) || 'skirmish';

        const settings = {
          difficulty: diffSelect ? diffSelect.value : 'easy',
          battleType: chosenBattleType,
          ambushSide: sideSelect ? sideSelect.value : 'DEFEND',
          mapTheme: themeSelect ? themeSelect.value : 'tropical',
          weather: weatherSelect ? weatherSelect.value : 'clear',
          fleetSize: fleetSelect ? fleetSelect.value : '5v5',
          cooldownSpeed: cdSelect ? parseFloat(cdSelect.value) : 1.0,
          allyCount: allyInput ? Math.min(50, Math.max(1, parseInt(allyInput.value) || 3)) : 3,
          enemyCount: enemyInput ? Math.min(50, Math.max(1, parseInt(enemyInput.value) || 8)) : 8
        };

        if (this.onLaunch) {
          this.onLaunch(this.selectedShipId, settings);
        }
      });
    }

    // Sound toggle button
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = AudioSystem.toggleSound();
        soundBtn.innerHTML = enabled ? '<span class="icon">🔊</span> Sound: ON' : '<span class="icon">🔇</span> Sound: OFF';
      });
    }
  }

  renderShipGrid() {
    const grid = document.getElementById('ship-grid');
    if (!grid) return;
    grid.innerHTML = '';

    console.log("SHIPS_DATA:", window.SHIPS_DATA);
    console.log("Global SHIPS_DATA:", typeof SHIPS_DATA);

    const data = (typeof SHIPS_DATA !== 'undefined' && Array.isArray(SHIPS_DATA)) ? SHIPS_DATA : (window.SHIPS_DATA || []);
    const query = (this.searchQuery || '').trim().toLowerCase();

    const filtered = data.filter(ship => {
      if (!ship) return false;
      const matchFilter = (this.activeFilter === 'all' || !this.activeFilter) || (ship.type && ship.type.toLowerCase() === this.activeFilter.toLowerCase());
      const matchSearch = !query || (ship.name && ship.name.toLowerCase().includes(query)) || (ship.saName && ship.saName.toLowerCase().includes(query));
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); padding: 2rem; text-align: center; grid-column: 1/-1; font-family: var(--font-heading);">No ships found matching search filter.</div>';
      return;
    }

    filtered.forEach(ship => {
      const card = document.createElement('div');
      card.className = `ship-card ${ship.id === this.selectedShipId ? 'selected' : ''}`;
      card.dataset.id = ship.id;

      const typeClass = (ship.type || 'Attacker').toLowerCase().replace(' ', '-');

      card.innerHTML = `
        <div class="card-top">
          <span class="ship-number">#${ship.id}</span>
          <span class="type-badge ${typeClass}">${ship.type}</span>
        </div>
        <div class="card-title">${ship.icon || '⚓'} ${ship.name}</div>
        <div class="card-stats-mini">
          <span class="mini-stat">❤️ ${ship.hp}</span>
          <span class="mini-stat">⚔️ ${ship.da}</span>
          <span class="mini-stat">⚡ ${ship.sp}/10</span>
        </div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.ship-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectShip(ship.id);
      });

      grid.appendChild(card);
    });
  }

  selectShip(shipId) {
    this.selectedShipId = shipId;
    const ship = SHIPS_DATA.find(s => s.id === shipId);
    if (!ship) return;

    this.previewShipInstance = new Ship(ship, 'blue', 0, 0);

    const elName = document.getElementById('inspector-name');
    if (elName) elName.innerText = `#${ship.id} ${ship.name}`;

    const elDesc = document.getElementById('inspector-desc');
    if (elDesc) elDesc.innerText = ship.flavor || ship.saDesc;

    const badge = document.getElementById('inspector-badge');
    if (badge) {
      badge.innerText = ship.type;
      badge.className = `type-badge ${ship.type.toLowerCase().replace(' ', '-')}`;
    }

    const valHp = document.getElementById('val-hp'); if (valHp) valHp.innerText = ship.hp;
    const barHp = document.getElementById('bar-hp'); if (barHp) barHp.style.width = `${Math.min(100, (ship.hp / 1000) * 100)}%`;

    const valDa = document.getElementById('val-da'); if (valDa) valDa.innerText = ship.da;
    const barDa = document.getElementById('bar-da'); if (barDa) barDa.style.width = `${Math.min(100, (ship.da / 120) * 100)}%`;

    const valSp = document.getElementById('val-sp'); if (valSp) valSp.innerText = `${ship.sp}/10`;
    const barSp = document.getElementById('bar-sp'); if (barSp) barSp.style.width = `${ship.sp * 10}%`;

    const saName = document.getElementById('inspector-sa-name'); if (saName) saName.innerText = ship.saName;
    const saCd = document.getElementById('inspector-sa-cd'); if (saCd) saCd.innerText = `Cooldown: ${ship.saCd}s`;
    const saDesc = document.getElementById('inspector-sa-desc'); if (saDesc) saDesc.innerText = ship.saDesc;
  }

  updateLaunchButtonText() {
    const modeSelectHeader = document.getElementById('game-mode-select');
    const launchBtn = document.getElementById('btn-deploy-ship');
    const panel = document.getElementById('outnumbered-count-panel');
    const allyInput = document.getElementById('input-ally-count');
    const enemyInput = document.getElementById('input-enemy-count');

    if (!modeSelectHeader || !launchBtn) return;

    const val = modeSelectHeader.value || 'skirmish';

    if (panel) {
      panel.classList.toggle('hidden', val !== 'outnumbered');
    }

    const allyCount = (allyInput && parseInt(allyInput.value)) || 3;
    const enemyCount = (enemyInput && parseInt(enemyInput.value)) || 8;

    const labels = {
      'skirmish': 'LAUNCH FLEET SKIRMISH',
      'outnumbered': `LAUNCH ${allyCount} vs ${enemyCount} OUTNUMBERED CLASH!`,
      'ambush': 'LAUNCH PROTECT CARRIER AMBUSH',
      'survival': 'LAUNCH WAVE SURVIVAL MODE',
      'boss': 'LAUNCH BOSS RUSH: ULTIMATE CATNIP',
      'testdrive': 'LAUNCH TARGET RANGE TEST DRIVE'
    };

    const labelText = labels[val] || labels['skirmish'];
    launchBtn.innerHTML = `<span class="paw">🐾</span> ${labelText}`;
  }

  startPreviewAnimation() {
    this.isHangarActive = true;
    const canvas = document.getElementById('hangar-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderLoop = () => {
      if (!this.isHangarActive) return;

      this.previewAngle += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.previewShipInstance) {
        this.previewShipInstance.x = 0;
        this.previewShipInstance.y = 0;
        this.previewShipInstance.rotation = this.previewAngle;
        this.previewShipInstance.turretAngle = this.previewAngle + Math.sin(this.previewAngle * 2) * 0.5;

        // Mock camera centering ship at canvas center
        const mockCam = {
          getRenderOffsetX: () => -canvas.width / 2,
          getRenderOffsetY: () => -canvas.height / 2,
          viewportWidth: canvas.width,
          viewportHeight: canvas.height
        };
        Renderer.drawShip(ctx, this.previewShipInstance, mockCam);
      }

      this.previewAnimFrame = requestAnimationFrame(renderLoop);
    };

    if (this.previewAnimFrame) cancelAnimationFrame(this.previewAnimFrame);
    renderLoop();
  }

  stopPreviewAnimation() {
    this.isHangarActive = false;
    if (this.previewAnimFrame) {
      cancelAnimationFrame(this.previewAnimFrame);
      this.previewAnimFrame = null;
    }
  }
}

const HangarUI = new HangarUIClass();
