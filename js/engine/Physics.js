/**
 * Catnip Warships — Physics Engine (Naval Mechanics, Island Sliding & Collision)
 */
class PhysicsEngine {
  static updateShipMovement(ship, dt, input) {
    if (!ship || ship.isDestroyed) return;

    // 1. Calculate Effective Speed & Acceleration based on ship's SP rating (1-10)
    let spRating = ship.data.sp;
    const crewSpeed = (ship.crewStats && ship.crewStats.speedMult) ? ship.crewStats.speedMult : 1.0;
    const crewTurn = (ship.crewStats && ship.crewStats.turnMult) ? ship.crewStats.turnMult : 1.0;
    const moraleBoost = (ship.morale >= 75) ? 1.15 : 1.0;

    let maxSpeed = spRating * CONFIG.BASE_SHIP_SPEED * (ship.speedMultiplier || 1.0) * crewSpeed * moraleBoost;
    let turnSpeed = CONFIG.BASE_TURN_SPEED * (1 + (10 - spRating) * 0.05) * crewTurn * moraleBoost;

    // Apply Siege Mode restriction (0 speed if siege active)
    if (ship.buffs && ship.buffs.siege) {
      maxSpeed = 0;
    }

    // 2. Input Steering (Turn left / Turn right)
    if (input) {
      if (input.isTurnLeft()) {
        ship.rotation -= turnSpeed * dt;
      }
      if (input.isTurnRight()) {
        ship.rotation += turnSpeed * dt;
      }

      // Throttle Forward / Backward
      if (input.isForward()) {
        ship.targetSpeed = maxSpeed;
      } else if (input.isBackward()) {
        ship.targetSpeed = -maxSpeed * 0.4;
      } else {
        ship.targetSpeed = 0;
      }
    }

    // 3. Water Friction & Acceleration
    const accelRate = 2.5;
    ship.currentSpeed += (ship.targetSpeed - ship.currentSpeed) * (accelRate * dt);

    // Velocity Vector
    ship.vx = Math.cos(ship.rotation) * ship.currentSpeed;
    ship.vy = Math.sin(ship.rotation) * ship.currentSpeed;

    // 4. Update Position
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;

    // 5. World Map Bounds Collision
    const margin = ship.length / 2;
    if (ship.x < margin) { ship.x = margin; ship.vx = 0; }
    if (ship.x > CONFIG.MAP_WIDTH - margin) { ship.x = CONFIG.MAP_WIDTH - margin; ship.vx = 0; }
    if (ship.y < margin) { ship.y = margin; ship.vy = 0; }
    if (ship.y > CONFIG.MAP_HEIGHT - margin) { ship.y = CONFIG.MAP_HEIGHT - margin; ship.vy = 0; }
  }

  /**
   * Handle collisions between ships and islands with shoreline sliding
   */
  static handleIslandCollisions(ship, map) {
    if (!ship || ship.isDestroyed || !map) return;
    const radius = ship.length / 2.4;
    const res = map.checkIslandCollision(ship.x, ship.y, radius);

    if (res.collided) {
      // 1. Push ship clear out of island landmass
      ship.x += res.normalX * (res.overlap + 3);
      ship.y += res.normalY * (res.overlap + 3);

      // 2. Deflect velocity vector along island shore tangent (smooth sliding)
      const dot = ship.vx * res.normalX + ship.vy * res.normalY;
      ship.vx -= dot * res.normalX;
      ship.vy -= dot * res.normalY;

      // 3. Steer ship heading facing back toward open water
      const openWaterAngle = Math.atan2(res.normalY, res.normalX);
      const angleDiff = Math.atan2(Math.sin(openWaterAngle - ship.rotation), Math.cos(openWaterAngle - ship.rotation));
      ship.rotation += angleDiff * 0.3;

      ship.currentSpeed *= 0.5; // Slow down on shore bump
    }
  }

  /**
   * Handle ship-to-ship collisions (No friendly fire ramming damage!)
   */
  static handleShipCollisions(shipA, shipB) {
    if (!shipA || !shipB || shipA.isDestroyed || shipB.isDestroyed) return;
    const dx = shipB.x - shipA.x;
    const dy = shipB.y - shipA.y;
    const dist = Math.hypot(dx, dy);
    const minDist = (shipA.length + shipB.length) / 2.6;

    if (dist < minDist && dist > 0) {
      const overlap = minDist - dist;
      const nx = dx / dist;
      const ny = dy / dist;

      // Push ships apart smoothly
      shipA.x -= nx * overlap * 0.55;
      shipA.y -= ny * overlap * 0.55;
      shipB.x += nx * overlap * 0.55;
      shipB.y += ny * overlap * 0.55;

      // Ramming Damage ONLY applies against ENEMY ships! (Zero damage between friendly allies)
      if (shipA.team !== shipB.team) {
        const relSpeed = Math.abs(shipA.currentSpeed - shipB.currentSpeed);
        if (relSpeed > 120) {
          const ramDmg = 15;
          shipA.takeDamage(ramDmg, shipB);
          shipB.takeDamage(ramDmg, shipA);
        }
      }
    }
  }

  /**
   * Handle lifeboat rescues by Catnip Alliance ships (Dark Fleet IS EVIL and NEVER collects lifeboats!)
   */
  static handleLifeboatRescue(ship, lifeboat, world) {
    if (!ship || !lifeboat || ship.isDestroyed || ship.isSinking || lifeboat.isDestroyed) return;

    // EXCLUSIVE RULE: Dark Fleet (red team) IS EVIL and NEVER collects lifeboats!
    // ONLY Catnip Alliance (blue team) rescues survivors!
    if (ship.team !== 'blue') return;

    const dx = lifeboat.x - ship.x;
    const dy = lifeboat.y - ship.y;
    const dist = Math.hypot(dx, dy);
    const hitDist = (ship.length / 2.2) + 14;

    if (dist < hitDist) {
      lifeboat.isDestroyed = true;
      ship.rescuedCount = (ship.rescuedCount || 0) + 1;

      // Heal ship +50 HP
      ship.hp = Math.min(ship.maxHp, ship.hp + 50);

      // Boost Crew Morale +20%
      ship.morale = Math.min(100, (ship.morale || 50) + 20);

      // Award +25 Catnip Coins
      if (world) {
        world.coins = (world.coins || 0) + 25;
      }

      if (window.AudioSystem) AudioSystem.playPew();
      if (window.Renderer) {
        Renderer.addFloatingText(ship.x, ship.y - 50, '🐱 CAT SURVIVOR RESCUED (+50 HP, +25 COINS)!', '#39ff14');
        Renderer.addParticleBurst(lifeboat.x, lifeboat.y, '#ffd700', 15);
      }
    }
  }
}
