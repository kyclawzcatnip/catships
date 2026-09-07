/**
 * Catnip Warships — Lifeboat Entity (Spawned from Sinking Ships & Playable Captain Raft)
 * Inflatable yellow/orange rafts carrying cat survivors drifting to safety.
 */
class Lifeboat {
  constructor(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.team = config.team || 'blue';
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.isFollower = config.isFollower || false;
    this.targetLeader = config.targetLeader || null;

    this.lifeTimer = this.isPlayerControlled ? 9999 : 22.0;
    this.maxLifeTimer = 22.0;
    this.rotation = Math.atan2(this.vy, this.vx) || (Math.random() * Math.PI * 2);
    this.speed = 140; // Paddling speed
    this.turnSpeed = 4.0;
    this.bobPhase = Math.random() * 10;
    this.isDestroyed = false;
  }

  update(dt, world, inputHandler) {
    if (this.isDestroyed) return;

    if (this.isPlayerControlled && inputHandler) {
      // --- PLAYER DIRECT LIFEBOAT PADDLING ENGINE ---
      this.lifeTimer = 9999;

      let turning = 0;
      if (inputHandler.isTurnLeft()) turning -= 1;
      if (inputHandler.isTurnRight()) turning += 1;

      this.rotation += turning * this.turnSpeed * dt;

      let targetSp = 0;
      if (inputHandler.isForward()) {
        targetSp = this.speed;
      } else if (inputHandler.isBackward()) {
        targetSp = -this.speed * 0.5;
      }

      this.vx = Math.cos(this.rotation) * targetSp;
      this.vy = Math.sin(this.rotation) * targetSp;

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Keep inside map bounds
      this.x = Math.max(30, Math.min(CONFIG.MAP_WIDTH - 30, this.x));
      this.y = Math.max(30, Math.min(CONFIG.MAP_HEIGHT - 30, this.y));
    } else if (this.isFollower && this.targetLeader && !this.targetLeader.isDestroyed) {
      // --- FLOTILLA FOLLOWER LIFEBOAT ROUTINE (Flocks behind Flagship Lifeboat!) ---
      this.lifeTimer = 9999;

      const dist = Math.hypot(this.targetLeader.x - this.x, this.targetLeader.y - this.y);
      const desiredAngle = Math.atan2(this.targetLeader.y - this.y, this.targetLeader.x - this.x);

      // Turn toward leader
      const angleDiff = Math.atan2(Math.sin(desiredAngle - this.rotation), Math.cos(desiredAngle - this.rotation));
      this.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 4.5 * dt);

      // Maintain 35-60px flotilla formation distance
      let currentSp = 0;
      if (dist > 45) {
        currentSp = Math.min(160, this.targetLeader.speed || 140);
      } else if (dist < 25) {
        currentSp = -20;
      }

      this.vx = Math.cos(this.rotation) * currentSp;
      this.vy = Math.sin(this.rotation) * currentSp;

      this.x += this.vx * dt;
      this.y += this.vy * dt;
    } else {
      // Gentle water drag slowing initial escape burst for passive AI rafts
      this.lifeTimer -= dt;
      if (this.lifeTimer <= 0) {
        this.isDestroyed = true;
        return;
      }

      this.vx *= 0.98;
      this.vy *= 0.98;

      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    this.bobPhase += dt * 2.5;
  }

  draw(ctx, camera) {
    if (this.isDestroyed) return;
    const screenX = this.x - camera.getRenderOffsetX();
    const screenY = this.y - camera.getRenderOffsetY();

    const alpha = this.isPlayerControlled ? 1.0 : Math.min(1.0, this.lifeTimer / 2.0);
    const bobOffset = Math.sin(this.bobPhase) * 2;

    ctx.save();
    ctx.translate(screenX, screenY + bobOffset);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = alpha;

    // 0. Flagship Glowing Commander Ring (Gold Aura for Player's Lifeboat!)
    if (this.isPlayerControlled) {
      ctx.strokeStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    // 1. Water Ripple Ring beneath raft
    ctx.strokeStyle = this.isPlayerControlled ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 + Math.sin(this.bobPhase * 0.8) * 2.5, 7.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Inflatable Emergency Raft Body 🚣
    ctx.fillStyle = this.isPlayerControlled ? '#ffd700' : '#ffb703';
    ctx.strokeStyle = '#ff8500';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Survivor Cat Ears & Helmets 🐱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Cat Ear 1
    ctx.moveTo(-2, -3.5);
    ctx.lineTo(0.5, -6.5);
    ctx.lineTo(2.5, -3.5);
    // Cat Ear 2
    ctx.moveTo(-2, 3.5);
    ctx.lineTo(0.5, 6.5);
    ctx.lineTo(2.5, 3.5);
    ctx.fill();

    // Cat Face/Head in raft
    ctx.fillStyle = '#ffcca4';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Captain Hat on Player's Lifeboat! 👑
    if (this.isPlayerControlled) {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-1, -2, 5, 2);
    }

    ctx.restore();
  }
}
