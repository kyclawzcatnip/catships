/**
 * Catnip Warships — Cat Officer Crew Data Registry & Leveling System
 */
window.CREW_OFFICERS = [
  {
    id: 'captain_whisker',
    name: 'Captain Whisker',
    role: 'Captain',
    icon: '🧑‍✈️',
    color: '#ffd700',
    description: '+15% Special Ability Cooldown Speed',
    stats: { saCdMult: 0.85 }
  },
  {
    id: 'chief_barnaby',
    name: 'Chief Barnaby',
    role: 'Chief Engineer',
    icon: '🔧',
    color: '#39ff14',
    description: '+20% Max HP & Faster Auto-Repairs',
    stats: { maxHpMult: 1.20, repairMult: 1.50 }
  },
  {
    id: 'gunner_claws',
    name: 'Officer Claws',
    role: 'Gunnery Officer',
    icon: '🎯',
    color: '#ff3366',
    description: '+15% Main Cannon Damage & Accuracy',
    stats: { damageMult: 1.15 }
  },
  {
    id: 'helmsman_paw',
    name: 'Helmsman Paw',
    role: 'Chief Helmsman',
    icon: '☸️',
    color: '#00e5ff',
    description: '+25% Ship Turn Speed & Throttle Response',
    stats: { turnMult: 1.25, speedMult: 1.15 }
  },
  {
    id: 'scout_purr',
    name: 'Scout Purr',
    role: 'Radar Specialist',
    icon: '📡',
    color: '#9d4edd',
    description: '+30% Vision Range & Lock-On Speed',
    stats: { rangeMult: 1.30 }
  },
  {
    id: 'marshal_mittens',
    name: 'Marshal Mittens',
    role: 'Flight Deck Officer',
    icon: '✈️',
    color: '#ff8500',
    description: '+25% Fighter Jet Speed & Air Damage',
    stats: { jetMult: 1.25 }
  }
];

window.getOfficerLevel = function(officerId) {
  try {
    const raw = localStorage.getItem(`catnip_officer_lvl_${officerId}`);
    return raw ? Math.min(5, Math.max(1, parseInt(raw))) : 1;
  } catch (e) {
    return 1;
  }
};

window.getOfficerLevelStats = function(officer) {
  if (!officer || !officer.stats) return officer;
  const lvl = window.getOfficerLevel(officer.id);
  const lvlMult = 1.0 + (lvl - 1) * 0.15; // +15% power scaling per level!

  const scaledStats = {};
  for (let k in officer.stats) {
    if (k === 'saCdMult') {
      scaledStats[k] = 1.0 - ((1.0 - officer.stats[k]) * lvlMult);
    } else {
      scaledStats[k] = 1.0 + ((officer.stats[k] - 1.0) * lvlMult);
    }
  }

  return { ...officer, level: lvl, stats: scaledStats };
};

var CREW_OFFICERS = window.CREW_OFFICERS;
