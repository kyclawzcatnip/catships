/**
 * Catnip Warships — Global Configuration & Constants
 */
window.CONFIG = {
  VERSION: 'v2.8.7',
  // World & Physics Settings
  MAP_WIDTH: 3600,
  MAP_HEIGHT: 3600,
  WATER_COLOR: '#0a1728',
  GRID_SIZE: 120,

  // Speed scaling factor: converts SP (1 to 10) into pixel units per second
  BASE_SHIP_SPEED: 45, // SP=1 is 45 px/s, SP=10 is 450 px/s
  BASE_TURN_SPEED: 1.8, // Radians per second base turn rate

  // Camera Settings
  CAMERA_SMOOTHING: 0.1,

  // Combat Types Matrix
  COMBAT_TYPES: {
    'Attacker': {
      color: '#ff9e00',
      badgeClass: 'attacker',
      icon: '🗡️',
      desc: 'Balanced ships designed for direct combat.'
    },
    'Tank': {
      color: '#00b4d8',
      badgeClass: 'tank',
      icon: '🛡️',
      desc: 'High-HP ships designed to absorb damage.'
    },
    'Rusher': {
      color: '#00f5d4',
      badgeClass: 'rusher',
      icon: '⚡',
      desc: 'Extremely fast ships designed to quickly attack enemies.'
    },
    'Long Ranged': {
      color: '#f72585',
      badgeClass: 'long-ranged',
      icon: '🎯',
      desc: 'Ships designed to deal damage from far away.'
    }
  },

  // Difficulty Settings
  DIFFICULTY: {
    easy: { name: 'Easy', enemyDmgMult: 0.65, allyHpMult: 1.35 },
    normal: { name: 'Normal', enemyDmgMult: 1.0, allyHpMult: 1.0 },
    hard: { name: 'Hard', enemyDmgMult: 1.3, allyHpMult: 0.85 }
  },

  // Fleet Command States
  FLEET_COMMANDS: {
    FOLLOW: 'FOLLOW',     // Key 1: Regroup / Follow Player
    FOCUS: 'FOCUS',       // Key 2: Focus Fire Locked Target
    ATTACK: 'ATTACK'      // Key 3: Charge Aggressively
  },

  // Teams
  TEAMS: {
    PLAYER: 'blue',
    ENEMY: 'red'
  },

  // Sound Defaults
  SOUND_ENABLED: true
};
