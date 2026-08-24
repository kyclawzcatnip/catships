/**
 * Catnip Warships — Fleet AI Controller Engine with Line-of-Sight (LOS) & Vision Range Enforcement
 */
class FleetAI {
  static update(aiShip, dt, world) {
    if (!aiShip || aiShip.isDestroyed || !world || !world.map) return;

    // Is this ship an Ally (blue team) or Enemy (red team)?
    const isAlly = (aiShip.team === 'blue');
    const player = world.playerShip;
    const command = world.fleetCommand || 'ATTACK';

    // 1. Determine Vision Range (4000px full map coverage)
    const visionRange = 4000;

    // 2. Target Acquisition within Vision Range & Line-of-Sight
    let target = null;
    if (isAlly && command === 'FOCUS' && world.lockedTarget && !world.lockedTarget.isDestroyed) {
      target = world.lockedTarget;
    } else {
      target = this.findVisibleEnemy(aiShip, world, visionRange);
    }    let desiredAngle = 0;
    let dist = Infinity;
    let hasClearSight = false;

    if (!target) {
      // Fallback navigation: Navigate toward center of battlefield!
      desiredAngle = Math.atan2(CONFIG.MAP_HEIGHT / 2 - aiShip.y, CONFIG.MAP_WIDTH / 2 - aiShip.x);
      aiShip.targetSpeed = (aiShip.data.sp || 5) * CONFIG.BASE_SHIP_SPEED * 0.5;
    } else {
      dist = aiShip.distanceTo(target);
      const angleToTarget = Math.atan2(target.y - aiShip.y, target.x - aiShip.x);

      // 3. Check Line of Sight (Island Obstacle Blocking)
      hasClearSight = this.hasLineOfSight(aiShip, target, world.map);

      // 4. Turret Aiming towards target with lead prediction
      const leadFactor = Math.min(1.5, dist / 700);
      const targetVx = target.vx || 0;
      const targetVy = target.vy || 0;
      const leadX = target.x + targetVx * leadFactor;
      const leadY = target.y + targetVy * leadFactor;
      aiShip.turretAngle = Math.atan2(leadY - aiShip.y, leadX - aiShip.x);

      // 5. Movement Behavior
      desiredAngle = angleToTarget;

      // Tactical Retreat Movement: Turn away from threat to repair!
      if (aiShip.isRetreating) {
        desiredAngle = angleToTarget + Math.PI;
        aiShip.targetSpeed = (aiShip.data.sp || 5) * CONFIG.BASE_SHIP_SPEED;
      } else if (isAlly && command === 'FOLLOW' && player && !player.isDestroyed) {
        const distToPlayer = aiShip.distanceTo(player);
        if (distToPlayer > 220) {
          desiredAngle = Math.atan2(player.y - aiShip.y, player.x - aiShip.x);
          aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
        } else {
          desiredAngle = angleToTarget;
          aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED * 0.5;
        }
      } else {
        // Standard Role Movement
        const role = aiShip.data.type;
        switch(role) {
          case 'Tank':
            if (dist > 250) {
              desiredAngle = angleToTarget;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
            } else {
              desiredAngle = angleToTarget + Math.PI / 2;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED * 0.7;
            }
            if (aiShip.hp < aiShip.maxHp * 0.45 && aiShip.saCooldownTimer <= 0) {
              aiShip.useAbility(world);
            }
            break;

          case 'Rusher':
            if (dist > 180) {
              desiredAngle = angleToTarget + Math.sin(Date.now() * 0.002) * 0.4;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
            } else {
              desiredAngle = angleToTarget + Math.PI;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
            }
            if (aiShip.hp < aiShip.maxHp * 0.5 && aiShip.saCooldownTimer <= 0) {
              aiShip.useAbility(world);
            }
            break;

          case 'Long Ranged':
            if (dist > 500) {
              desiredAngle = angleToTarget;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
            } else if (dist < 320) {
              desiredAngle = angleToTarget + Math.PI;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED * 0.8;
            } else {
              desiredAngle = angleToTarget + Math.PI / 2;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED * 0.4;
            }
            if (dist < 600 && aiShip.saCooldownTimer <= 0) {
              aiShip.useAbility(world);
            }
            break;

          default: // Attacker
            if (dist > 300) {
              desiredAngle = angleToTarget;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED;
            } else {
              desiredAngle = angleToTarget + Math.sin(Date.now() * 0.001) * 0.6;
              aiShip.targetSpeed = aiShip.data.sp * CONFIG.BASE_SHIP_SPEED * 0.8;
            }
            if (dist < 450 && aiShip.saCooldownTimer <= 0) {
              aiShip.useAbility(world);
            }
            break;
        }
      }
    }

    // 6. OBSTACLE AVOIDANCE PROBES (Prevents AI from crashing into islands!)
    desiredAngle = this.avoidIslands(aiShip, world.map, desiredAngle);

    // 7. ALLY SEPARATION (Prevents friendly ships from crowding into each other)
    desiredAngle = this.separateFromAllies(aiShip, world, desiredAngle);

    // 8. Smooth Rotation towards desired angle
    const angleDiff = Math.atan2(Math.sin(desiredAngle - aiShip.rotation), Math.cos(desiredAngle - aiShip.rotation));
    const turnRate = CONFIG.BASE_TURN_SPEED * dt * 1.8;
    aiShip.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);

    // 9. Fire Primary Weapon ONLY IF in weapon range AND has clear Line of Sight (not blocked by islands)
    const weaponRange = Math.min(750, visionRange);
    if (dist <= weaponRange && hasClearSight) {
      aiShip.firePrimary(world);
    }
  }

  /**
   * Find nearest enemy ship that is within Vision Range and not hidden
   */
  static findVisibleEnemy(ship, world, visionRange) {
    if (!ship || !world || !world.ships) return null;
    let nearest = null;
    let minDist = visionRange;

    for (let i = 0; i < world.ships.length; i++) {
      const target = world.ships[i];
      if (target && target !== ship && target.team !== ship.team && !target.isDestroyed) {
        // Skip stealthed ships unless revealed by Recon
        if (target.buffs && target.buffs.stealth && !target.isRevealed && world.reconActiveTimer <= 0) {
          continue;
        }

        const d = ship.distanceTo(target);
        if (d <= minDist) {
          minDist = d;
          nearest = target;
        }
      }
    }
    return nearest;
  }

  /**
   * Check Raycast Line of Sight between 2 points (Returns false if blocked by an island)
   */
  static hasLineOfSight(shipA, shipB, map) {
    if (!shipA || !shipB || !map || !map.checkIslandCollision) return true;

    const samples = 6;
    const dx = (shipB.x - shipA.x) / samples;
    const dy = (shipB.y - shipA.y) / samples;

    for (let i = 1; i < samples; i++) {
      const sampleX = shipA.x + dx * i;
      const sampleY = shipA.y + dy * i;
      const hit = map.checkIslandCollision(sampleX, sampleY, 12);
      if (hit && hit.collided) {
        return false; // Line of sight blocked by island!
      }
    }
    return true;
  }

  /**
   * Steering separation to keep friendly ships from crowding into each other
   */
  static separateFromAllies(ship, world, desiredAngle) {
    if (!world || !world.ships) return desiredAngle;
    let pushX = 0;
    let pushY = 0;
    let count = 0;

    for (let i = 0; i < world.ships.length; i++) {
      const other = world.ships[i];
      if (other && other !== ship && other.team === ship.team && !other.isDestroyed) {
        const d = ship.distanceTo(other);
        if (d < 140 && d > 0) {
          pushX += (ship.x - other.x) / d;
          pushY += (ship.y - other.y) / d;
          count++;
        }
      }
    }

    if (count > 0) {
      const separationAngle = Math.atan2(pushY, pushX);
      return desiredAngle + Math.atan2(Math.sin(separationAngle - desiredAngle), Math.cos(separationAngle - desiredAngle)) * 0.4;
    }

    return desiredAngle;
  }

  /**
   * Raycast Probe Obstacle Avoidance for Islands
   */
  static avoidIslands(ship, map, desiredAngle) {
    const probeLength = 200 + (Math.abs(ship.currentSpeed) * 0.5);
    
    // Cast 3 probes ahead of ship
    const centerProbeX = ship.x + Math.cos(ship.rotation) * probeLength;
    const centerProbeY = ship.y + Math.sin(ship.rotation) * probeLength;

    const leftProbeX = ship.x + Math.cos(ship.rotation - 0.6) * probeLength;
    const leftProbeY = ship.y + Math.sin(ship.rotation - 0.6) * probeLength;

    const rightProbeX = ship.x + Math.cos(ship.rotation + 0.6) * probeLength;
    const rightProbeY = ship.y + Math.sin(ship.rotation + 0.6) * probeLength;

    const shipRadius = ship.length / 2;
    const hitCenter = map.checkIslandCollision(centerProbeX, centerProbeY, shipRadius);
    const hitLeft = map.checkIslandCollision(leftProbeX, leftProbeY, shipRadius);
    const hitRight = map.checkIslandCollision(rightProbeX, rightProbeY, shipRadius);

    if (hitCenter.collided || hitLeft.collided || hitRight.collided) {
      const island = (hitCenter.island || hitLeft.island || hitRight.island);
      const angleAwayFromIsland = Math.atan2(ship.y - island.y, ship.x - island.x);
      
      if (hitLeft.collided && !hitRight.collided) {
        return ship.rotation + 0.8;
      } else if (hitRight.collided && !hitLeft.collided) {
        return ship.rotation - 0.8;
      } else {
        return angleAwayFromIsland;
      }
    }

    return desiredAngle;
  }
}
