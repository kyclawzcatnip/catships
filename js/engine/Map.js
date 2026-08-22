/**
 * Catnip Warships — Map & Ocean Island Generator Engine (Caldera Volcano & 5s Meteor Warning Red Zones)
 */
class MapEngine {
  constructor(theme = 'tropical') {
    this.width = CONFIG.MAP_WIDTH;
    this.height = CONFIG.MAP_HEIGHT;
    this.theme = theme;
    this.islands = [];
    this.volcanicStrikes = [];
    this.eruptionTimer = 4.0;

    this.generateMap();
  }

  generateMap() {
    this.islands = [];
    this.volcanicStrikes = [];

    let sandColor = '#e9c46a';
    let foliageColor = '#2a9d8f';
    let shallowColor = 'rgba(72, 202, 228, 0.25)';

    if (this.theme === 'arctic') {
      sandColor = '#a8dadc';
      foliageColor = '#f1faee';
      shallowColor = 'rgba(200, 240, 255, 0.35)';
    } else if (this.theme === 'volcano') {
      sandColor = '#2b0903'; // Obsidian rock coast
      foliageColor = '#ff4500'; // Molten lava core
      shallowColor = 'rgba(255, 69, 0, 0.35)';
    }

    // 1. Central Grand Atoll / Caldera Volcano Island
    this.islands.push({
      x: this.width / 2,
      y: this.height / 2,
      radius: 240,
      sandColor: sandColor,
      foliageColor: foliageColor,
      shallowColor: shallowColor,
      isVolcano: (this.theme === 'volcano'),
      name: (this.theme === 'volcano') ? 'Mt. Catamorez Volcano' : 'Catnip Central Atoll'
    });

    // 2. Corner & Side Islands forming tactical straits
    const presetIslands = [
      { x: 700, y: 700, radius: 160 },
      { x: 2900, y: 700, radius: 170 },
      { x: 700, y: 2900, radius: 180 },
      { x: 2900, y: 2900, radius: 160 },
      { x: 1800, y: 800, radius: 130 },
      { x: 1800, y: 2800, radius: 140 },
      { x: 800, y: 1800, radius: 140 },
      { x: 2800, y: 1800, radius: 150 },
      { x: 1300, y: 1400, radius: 80 },
      { x: 2300, y: 1400, radius: 90 },
      { x: 1300, y: 2200, radius: 85 },
      { x: 2300, y: 2200, radius: 95 }
    ];

    presetIslands.forEach(is => {
      this.islands.push({
        x: is.x,
        y: is.y,
        radius: is.radius,
        sandColor: sandColor,
        foliageColor: foliageColor,
        shallowColor: shallowColor
      });
    });
  }

  update(dt, world) {
    if (this.theme !== 'volcano' || !world) return;

    // 1. Eruption Spawner (Every 5-7 seconds)
    this.eruptionTimer -= dt;
    if (this.eruptionTimer <= 0) {
      this.eruptionTimer = 5.0 + Math.random() * 2.5;

      // Spawn volcanic rock target strike within 1300px radius of volcano
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 1000;
      const targetX = this.width / 2 + Math.cos(angle) * dist;
      const targetY = this.height / 2 + Math.sin(angle) * dist;

      this.volcanicStrikes.push({
        x: targetX,
        y: targetY,
        radius: 90,
        warningTimer: 5.0, // 5-second red area warning countdown!
        maxWarningTimer: 5.0,
        hasStruck: false
      });
    }

    // 2. Update active Volcanic Warning Zones
    for (let i = 0; i < this.volcanicStrikes.length; i++) {
      const strike = this.volcanicStrikes[i];
      if (!strike || strike.hasStruck) continue;

      strike.warningTimer -= dt;

      // 5-second countdown expired -> VOLCANIC METEOR IMPACT!
      if (strike.warningTimer <= 0) {
        strike.hasStruck = true;

        // Deal 80 splash damage to any ships caught in the red warning zone
        if (world.ships) {
          world.ships.forEach(ship => {
            if (ship && !ship.isDestroyed && Math.hypot(ship.x - strike.x, ship.y - strike.y) <= strike.radius + ship.length / 2) {
              ship.takeDamage(85, null);
            }
          });
        }

        // Camera Shake & Particle Explosion
        if (world.camera) world.camera.addShake(8);
        if (window.AudioSystem) AudioSystem.playExplosion();
        if (window.Renderer) {
          Renderer.addParticleBurst(strike.x, strike.y, '#ff4500', 35);
          Renderer.addParticleBurst(strike.x, strike.y, '#ffba08', 25);
          Renderer.addFloatingText(strike.x, strike.y - 30, '💥 VOLCANIC ROCK IMPACT!', '#ff4500');
        }
      }
    }

    // Clean up finished strikes
    this.volcanicStrikes = this.volcanicStrikes.filter(s => s && !s.hasStruck);
  }

  checkIslandCollision(x, y, radius = 0) {
    for (let island of this.islands) {
      const dx = x - island.x;
      const dy = y - island.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < island.radius + radius) {
        return {
          collided: true,
          island: island,
          overlap: (island.radius + radius) - dist,
          normalX: dx / (dist || 1),
          normalY: dy / (dist || 1)
        };
      }
    }
    return { collided: false };
  }

  draw(ctx, camera) {
    let waterBg = CONFIG.WATER_COLOR;
    if (this.theme === 'arctic') {
      waterBg = '#0b253a';
    } else if (this.theme === 'volcano') {
      waterBg = '#140505';
    }

    // 1. Water Background
    ctx.fillStyle = waterBg;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    const renderOffsetX = camera.getRenderOffsetX();
    const renderOffsetY = camera.getRenderOffsetY();

    // 2. Grid lines
    ctx.strokeStyle = (this.theme === 'volcano') ? 'rgba(255, 69, 0, 0.08)' : 'rgba(0, 229, 255, 0.04)';
    ctx.lineWidth = 1;

    const startX = Math.floor(renderOffsetX / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const endX = startX + camera.viewportWidth + CONFIG.GRID_SIZE;
    const startY = Math.floor(renderOffsetY / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const endY = startY + camera.viewportHeight + CONFIG.GRID_SIZE;

    ctx.beginPath();
    for (let x = startX; x < endX; x += CONFIG.GRID_SIZE) {
      const screenX = x - renderOffsetX;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, camera.viewportHeight);
    }
    for (let y = startY; y < endY; y += CONFIG.GRID_SIZE) {
      const screenY = y - renderOffsetY;
      ctx.moveTo(0, screenY);
      ctx.lineTo(camera.viewportWidth, screenY);
    }
    ctx.stroke();

    // 3. Islands & Central Volcano
    this.islands.forEach(island => {
      const screenX = island.x - renderOffsetX;
      const screenY = island.y - renderOffsetY;

      if (
        screenX + island.radius < 0 ||
        screenX - island.radius > camera.viewportWidth ||
        screenY + island.radius < 0 ||
        screenY - island.radius > camera.viewportHeight
      ) {
        return;
      }

      // Shallow Water Ring
      ctx.fillStyle = island.shallowColor || 'rgba(72, 202, 228, 0.25)';
      ctx.beginPath();
      ctx.arc(screenX, screenY, island.radius + 25, 0, Math.PI * 2);
      ctx.fill();

      // Coast Base
      ctx.fillStyle = island.sandColor || '#e9c46a';
      ctx.beginPath();
      ctx.arc(screenX, screenY, island.radius, 0, Math.PI * 2);
      ctx.fill();

      if (island.isVolcano) {
        // --- CALDERA VOLCANO RENDERING ---
        // Obsidian Mountain Base
        ctx.fillStyle = '#1a0502';
        ctx.beginPath();
        ctx.arc(screenX, screenY, island.radius * 0.82, 0, Math.PI * 2);
        ctx.fill();

        // Crater Rim Rock
        ctx.fillStyle = '#3d0c02';
        ctx.beginPath();
        ctx.arc(screenX, screenY, island.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Lava Core Lake
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(screenX, screenY, island.radius * 0.35 + Math.sin(Date.now() * 0.003) * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Volcanic Smoke Plumes
        ctx.fillStyle = 'rgba(255, 120, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(screenX, screenY, island.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard Jungle / Ice Center
        ctx.fillStyle = island.foliageColor || '#2a9d8f';
        ctx.beginPath();
        ctx.arc(screenX, screenY, island.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }

      // Island Outline
      ctx.strokeStyle = (this.theme === 'volcano') ? '#ff4500' : ((this.theme === 'arctic') ? '#a8dadc' : '#1d3557');
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // 4. DRAW 5-SECOND VOLCANIC RED WARNING TARGET ZONES
    if (this.theme === 'volcano') {
      this.volcanicStrikes.forEach(strike => {
        if (!strike || strike.hasStruck) return;

        const screenX = strike.x - renderOffsetX;
        const screenY = strike.y - renderOffsetY;

        ctx.save();
        ctx.translate(screenX, screenY);

        const pulseScale = 1.0 + Math.sin(Date.now() * 0.01) * 0.08;
        const radius = strike.radius * pulseScale;

        // Pulsing Red Danger Circle Fill
        ctx.fillStyle = 'rgba(255, 51, 102, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Red Danger Border
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Target Crosshairs
        ctx.strokeStyle = '#ff4500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.6, 0); ctx.lineTo(radius * 0.6, 0);
        ctx.moveTo(0, -radius * 0.6); ctx.lineTo(0, radius * 0.6);
        ctx.stroke();

        // 5-Second Warning Countdown Text!
        ctx.font = '800 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fillText(`⚠️ METEOR IN ${strike.warningTimer.toFixed(1)}s`, 0, -radius - 8);
        ctx.restore();
      });
    }
  }
}
