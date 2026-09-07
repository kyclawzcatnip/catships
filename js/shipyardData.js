/**
 * Catnip Warships — Shipyard Data Registry (Custom Paints, Turret Modules & Currency)
 */
const SHIPYARD_PAINTS = [
  { id: 'default', name: 'Original Class', icon: '🎨', color: null, glow: null, cost: 0 },
  { id: 'golden_cat', name: '👑 Golden Catnip', icon: '👑', color: '#ffd700', glow: '#ffb703', cost: 150 },
  { id: 'stealth_shadow', name: '🖤 Stealth Shadow', icon: '🖤', color: '#10002b', glow: '#7b2cbf', cost: 200 },
  { id: 'cyber_neon', name: '⚡ Cyber Neon', icon: '⚡', color: '#00f5d4', glow: '#00b4d8', cost: 250 },
  { id: 'royal_velvet', name: '💜 Royal Velvet', icon: '💜', color: '#560bad', glow: '#b5179e', cost: 200 },
  { id: 'volcano_magma', name: '🌋 Magma Reef', icon: '🌋', color: '#ff4d6d', glow: '#ff758f', cost: 300 }
];

const TURRET_MODULES = [
  { id: 'standard', name: 'Standard Cannon', icon: '💣', damageMult: 1.0, reloadMult: 1.0, description: 'Balanced naval deck artillery.' },
  { id: 'siege_heavy', name: 'Heavy Siege Cannon', icon: '💥', damageMult: 1.35, reloadMult: 1.25, description: '+35% Damage with 25% slower reload.' },
  { id: 'rapid_flak', name: 'Quad Rapid Flak', icon: '⚡', damageMult: 0.80, reloadMult: 0.55, description: '+45% Faster firing rate with light shells.' },
  { id: 'torpedo_rail', name: 'Dual Torpedo Rail', icon: '🚀', damageMult: 1.20, reloadMult: 1.10, description: '+20% Damage with homing torpedo rails.' }
];

if (typeof window !== 'undefined') {
  window.SHIPYARD_PAINTS = SHIPYARD_PAINTS;
  window.TURRET_MODULES = TURRET_MODULES;
}
