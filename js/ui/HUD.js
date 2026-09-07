/**
 * Catnip Warships — Dynamic HUD & Cat Captain Controller
 */
class HUDClass {
  constructor() {
    this.captainCanvas = null;
    this.captainCtx = null;
  }

  init() {
    this.captainCanvas = document.getElementById('captain-canvas');
    if (this.captainCanvas) {
      this.captainCtx = this.captainCanvas.getContext('2d');
    }
  }

  update(playerShip, world) {
    if (!playerShip || !playerShip.data) return;

    // 1. Update Player HP Bar & Overcharge Shield Boost
    const hpFill = document.getElementById('hud-hp-fill');
    const hpNum = document.getElementById('hud-hp-num');
    if (hpFill && hpNum) {
      const hpPct = Math.max(0, (playerShip.hp / playerShip.maxHp) * 100);
      hpFill.style.width = `${Math.min(110, hpPct)}%`;
      if (playerShip.hp > playerShip.maxHp) {
        hpFill.style.background = 'linear-gradient(90deg, #39ff14, #ffd700)';
        hpNum.innerText = `🛡️ OVERCHARGE ${Math.ceil(playerShip.hp)} / ${playerShip.maxHp} (${Math.round(hpPct)}%)`;
      } else if (playerShip.isRetreating) {
        hpFill.style.background = 'linear-gradient(90deg, #ff9e00, #39ff14)';
        hpNum.innerText = `💚 REPAIRING ${Math.ceil(playerShip.hp)} / ${playerShip.maxHp} (${Math.round(hpPct)}%)`;
      } else {
        hpFill.style.background = '';
        hpNum.innerText = `${Math.ceil(playerShip.hp)} / ${playerShip.maxHp}`;
      }
    }

    // 2. Update Speedometer
    const spdFill = document.getElementById('hud-spd-fill');
    const spdNum = document.getElementById('hud-spd-num');
    if (spdFill && spdNum) {
      const knots = Math.round(Math.abs(playerShip.currentSpeed) / 10);
      spdFill.style.width = `${Math.min(100, (knots / 45) * 100)}%`;
      spdNum.innerText = `${knots} Knots`;
    }

    // 2b. Update Crew Morale Bar & High Morale Status
    const moraleFill = document.getElementById('hud-morale-fill');
    const moraleNum = document.getElementById('hud-morale-num');
    if (moraleFill && moraleNum) {
      const moraleVal = Math.round(playerShip.morale || 50);
      moraleFill.style.width = `${moraleVal}%`;
      if (moraleVal >= 75) {
        moraleFill.style.background = 'linear-gradient(90deg, #ffd700, #39ff14)';
        moraleNum.innerText = `⭐ HIGH MORALE ${moraleVal}% (+15% SPD/RELOAD)`;
      } else {
        moraleFill.style.background = 'linear-gradient(90deg, #ff9e00, #ffd700)';
        moraleNum.innerText = `⭐ MORALE: ${moraleVal}%`;
      }
    }

    // 3. Update Ability Cooldown Ring Timer & Icon
    const cdText = document.getElementById('hud-ability-cd-text');
    const cdCircle = document.getElementById('hud-cd-circle');
    const iconSlot = document.getElementById('hud-ability-icon');
    const nameSlot = document.getElementById('hud-ability-name');

    if (nameSlot) nameSlot.innerText = playerShip.data.saName;
    if (iconSlot) iconSlot.innerText = playerShip.data.icon || '✨';

    if (playerShip.saCooldownTimer > 0) {
      const cdPct = (playerShip.saCooldownTimer / playerShip.data.saCd) * 100;
      if (cdCircle) cdCircle.setAttribute('stroke-dasharray', `${cdPct}, 100`);
      if (cdText) {
        cdText.innerText = `${Math.ceil(playerShip.saCooldownTimer)}s`;
        cdText.style.color = '#ff9e00';
      }
    } else {
      if (cdCircle) cdCircle.setAttribute('stroke-dasharray', `0, 100`);
      if (cdText) {
        cdText.innerText = 'READY';
        cdText.style.color = '#39ff14';
      }
    }

    // 4. Update Team Fleet Scores
    const blueScore = document.getElementById('blue-score');
    const redScore = document.getElementById('red-score');
    if (blueScore && redScore && world) {
      const blueAlive = world.ships.filter(s => s.team === 'blue' && !s.isDestroyed).length;
      const redAlive = world.ships.filter(s => s.team === 'red' && !s.isDestroyed).length;
      blueScore.innerText = blueAlive;
      redScore.innerText = redAlive;
    }

    // 5. Draw Animated Cat Captain Avatar
    this.drawCaptainAvatar(playerShip.captainMood, playerShip.data.color);
  }

  /**
   * Vector Drawing of Animated Cat Captain Avatar
   */
  drawCaptainAvatar(mood = 'normal', accentColor = '#00e5ff') {
    if (!this.captainCtx) return;
    const ctx = this.captainCtx;
    const w = this.captainCanvas.width;
    const h = this.captainCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Circle
    ctx.fillStyle = '#0a182e';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(w / 2, h / 2 + 5);

    // 1. Cat Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // 2. Cat Ears
    ctx.fillStyle = accentColor;
    // Left ear
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-8, -26);
    ctx.lineTo(-2, -14);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.moveTo(16, -10);
    ctx.lineTo(8, -26);
    ctx.lineTo(2, -14);
    ctx.fill();

    // 3. Naval Captain Hat!
    ctx.fillStyle = '#050a12';
    ctx.fillRect(-15, -20, 30, 8);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12, -22, 24, 4); // Gold trim

    // 4. Cat Eyes based on Mood
    ctx.fillStyle = '#050a12';
    if (mood === 'hit') {
      // Shocked > < eyes
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -5); ctx.lineTo(-4, 1);
      ctx.moveTo(-4, -5); ctx.lineTo(-10, 1);
      ctx.moveTo(4, -5); ctx.lineTo(10, 1);
      ctx.moveTo(10, -5); ctx.lineTo(4, 1);
      ctx.stroke();
    } else if (mood === 'happy') {
      // Happy ^ ^ eyes
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-7, -2, 4, Math.PI, 0);
      ctx.arc(7, -2, 4, Math.PI, 0);
      ctx.stroke();
    } else if (mood === 'ability') {
      // Fierce glowing eyes
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(-7, -2, 5, 0, Math.PI * 2);
      ctx.arc(7, -2, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal cute cat eyes
      ctx.beginPath();
      ctx.arc(-7, -2, 3.5, 0, Math.PI * 2);
      ctx.arc(7, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Cat Nose & Whiskers
    ctx.fillStyle = '#ff7676';
    ctx.beginPath();
    ctx.arc(0, 4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#8b949e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, 4); ctx.lineTo(-18, 2);
    ctx.moveTo(-8, 6); ctx.lineTo(-17, 8);
    ctx.moveTo(8, 4); ctx.lineTo(18, 2);
    ctx.moveTo(8, 6); ctx.lineTo(17, 8);
    ctx.stroke();

    ctx.restore();
  }
}

const HUD = new HUDClass();
