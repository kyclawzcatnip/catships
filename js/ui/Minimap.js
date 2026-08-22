/**
 * Catnip Warships — Tactical Radar Minimap Engine
 */
class MinimapClass {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.radarAngle = 0;
  }

  init() {
    this.canvas = document.getElementById('minimap-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  update(world, camera) {
    if (!this.canvas || !this.ctx || !world) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear Minimap
    ctx.fillStyle = '#040c18';
    ctx.fillRect(0, 0, w, h);

    const scaleX = w / CONFIG.MAP_WIDTH;
    const scaleY = h / CONFIG.MAP_HEIGHT;

    // 1. Draw Islands on Radar
    ctx.fillStyle = 'rgba(42, 157, 143, 0.6)';
    world.map.islands.forEach(island => {
      ctx.beginPath();
      ctx.arc(island.x * scaleX, island.y * scaleY, island.radius * scaleX, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Rotating Radar Pulse Sweep
    this.radarAngle += 0.04;
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2 + Math.cos(this.radarAngle) * (w / 2), h / 2 + Math.sin(this.radarAngle) * (h / 2));
    ctx.stroke();

    // 3. Draw Ships as Blips
    world.ships.forEach(ship => {
      if (ship.isDestroyed) return;

      const mapX = ship.x * scaleX;
      const mapY = ship.y * scaleY;

      ctx.fillStyle = ship.team === 'blue' ? '#00e5ff' : '#ff3366';
      ctx.beginPath();
      ctx.arc(mapX, mapY, ship.isPlayer ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Highlight Player with ring
      if (ship.isPlayer) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // 4. Viewport Camera Box
    const camX = camera.x * scaleX;
    const camY = camera.y * scaleY;
    const camW = camera.viewportWidth * scaleX;
    const camH = camera.viewportHeight * scaleY;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(camX, camY, camW, camH);
  }
}

const Minimap = new MinimapClass();
