/**
 * Catnip Warships — Story Mode Campaign Data Registry (Chapters 1 - 8)
 */
window.STORY_DATA = [
  {
    id: 1,
    title: "Chapter 1 — The First Attack",
    subtitle: "A routine patrol is suddenly attacked by the Dark Fleet.",
    icon: "🚨",
    playerShipId: 1,
    mapTheme: "tropical",
    weather: "clear",
    difficulty: "easy",
    briefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "Captain! Our routine morning patrol near Sector 4 has just been ambushed by Dark Fleet scouting craft! Engage weapons and repel the aggressors immediately!"
    },
    debriefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "Outstanding work, Captain! The scouting vanguard has been destroyed. But radar shows this was just the beginning of a major Dark Fleet invasion force..."
    },
    objective: "Destroy all 3 Dark Fleet scouting vessels.",
    allyCount: 1,
    enemyFleet: [2, 10, 11], // Dark Cat, Catnip Corvette, Shadow Rusher
    stars: 3
  },
  {
    id: 2,
    title: "Chapter 2 — The Island Front",
    subtitle: "The player fights to reclaim strategic islands.",
    icon: "🏝️",
    playerShipId: 7,
    mapTheme: "archipelago",
    weather: "foggy",
    difficulty: "normal",
    briefing: {
      speaker: "Commander Whiskers",
      avatar: "⛵",
      text: "The Dark Fleet has seized our island outposts! Command has assigned twin cruisers to assist us. Reclaim the archipelago and crush their artillery emplacements!"
    },
    debriefing: {
      speaker: "Commander Whiskers",
      avatar: "⛵",
      text: "The islands are ours once again! Enemy communications reveal their fleet is regrouping to target our main aircraft carrier..."
    },
    objective: "Reclaim the island chain and eliminate all 5 enemy cruisers.",
    allyCount: 3,
    enemyFleet: [8, 12, 14, 17, 28],
    stars: 3
  },
  {
    id: 3,
    title: "Chapter 3 — Carrier Under Fire",
    subtitle: "The player must protect a carrier from an enemy attack.",
    icon: "⚓",
    playerShipId: 9,
    mapTheme: "open_ocean",
    weather: "rain",
    difficulty: "normal",
    briefing: {
      speaker: "Admiral Pawson",
      avatar: "📡",
      text: "MAYDAY! Fleet Carrier #24 is under heavy assault by dark torpedo bombers and attack boats! Form a defensive perimeter and shield the carrier at all costs!"
    },
    debriefing: {
      speaker: "Admiral Pawson",
      avatar: "📡",
      text: "Carrier #24 is safe! Your defensive line held against overwhelming odds. Intel reports enemy submarines moving in from the deep sea..."
    },
    objective: "Defend Carrier #24 and destroy the 7 incoming assault craft.",
    allyCount: 4,
    enemyFleet: [23, 25, 36, 40, 49, 53, 59],
    stars: 3
  },
  {
    id: 4,
    title: "Chapter 4 — Into the Deep",
    subtitle: "Enemy submarines become a major threat.",
    icon: "🤿",
    playerShipId: 101, // Submarine #101
    mapTheme: "deep_sea",
    weather: "storm",
    difficulty: "hard",
    briefing: {
      speaker: "Sub-Commander Splash",
      avatar: "🤿",
      text: "We are diving into enemy territory! The Dark Fleet has deployed stealth submarines (#102) beneath the waves. Use your dive controls [SHIFT/X] and torpedo spreads to neutralize them!"
    },
    debriefing: {
      speaker: "Sub-Commander Splash",
      avatar: "🤿",
      text: "Enemy sub-squadron neutralized! The sea floor is clear. The main Dark Fleet battle group is assembling for all-out war!"
    },
    objective: "Dive underwater and eliminate 6 enemy stealth submarines & torpedo ships.",
    allyCount: 3,
    enemyFleet: [102, 102, 102, 17, 23, 38],
    stars: 3
  },
  {
    id: 5,
    title: "Chapter 5 — The Fleet War",
    subtitle: "The conflict expands into massive fleet battles.",
    icon: "⚔️",
    playerShipId: 29, // Super Battleship
    mapTheme: "open_ocean",
    weather: "clear",
    difficulty: "hard",
    briefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "This is it — full fleet engagement! 10 Allied warships against 10 Dark Fleet dreadnoughts across open waters. Lead the battle line to total victory!"
    },
    debriefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "Triumphant victory! The enemy main line is shattered! But dark reconnaissance reports they are preparing their apex superweapons..."
    },
    objective: "Command the fleet battle line and destroy all 10 enemy dreadnoughts.",
    allyCount: 10,
    enemyFleet: [22, 27, 35, 42, 45, 52, 63, 69, 73, 81],
    stars: 3
  },
  {
    id: 6,
    title: "Chapter 6 — Enemy Superweapons",
    subtitle: "The Dark Fleet begins deploying extremely powerful warships.",
    icon: "👑",
    playerShipId: 76, // Fortress II (Quad turrets)
    mapTheme: "archipelago",
    weather: "foggy",
    difficulty: "hard",
    briefing: {
      speaker: "Admiral Pawson",
      avatar: "📡",
      text: "WARNING! Radar has picked up Dark Super Cruisers (#98 & #99) equipped with 4 Quad-barrel cannon batteries! Brace for immense salvo firepower!"
    },
    debriefing: {
      speaker: "Admiral Pawson",
      avatar: "📡",
      text: "The enemy superweapons have been reduced to scrap metal! Path to the Dark Fleet stronghold is completely open!"
    },
    objective: "Destroy enemy 4-Quad Super Cruisers #98 and #99.",
    allyCount: 5,
    enemyFleet: [98, 99, 42, 79, 89],
    stars: 3
  },
  {
    id: 7,
    title: "Chapter 7 — The Final Fleet",
    subtitle: "The player launches a major assault into enemy territory.",
    icon: "🌋",
    playerShipId: 88, // Catnip Titan
    mapTheme: "deep_sea",
    weather: "storm",
    difficulty: "extreme",
    briefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "We are breaching the outer perimeter of Dark Fleet High Command! 12 Allied strike craft against 15 fortified enemy warships. Advance without fear!"
    },
    debriefing: {
      speaker: "Captain Catnip",
      avatar: "🐱",
      text: "Outer perimeter breached! Only the Dark Fleet Emperor remains..."
    },
    objective: "Penetrate enemy territory and defeat 15 elite dark capital ships.",
    allyCount: 12,
    enemyFleet: [22, 27, 35, 42, 45, 52, 63, 69, 73, 77, 79, 83, 89, 93, 97],
    stars: 3
  },
  {
    id: 8,
    title: "Chapter 8 — The Final Battle (50v50 Armada!)",
    subtitle: "50 Allied Warships vs 50 Dark Fleet Vessels in an epic climax!",
    icon: "♾️",
    playerShipId: 100, // Catnip Infinity
    mapTheme: "open_ocean",
    weather: "clear",
    difficulty: "extreme",
    briefing: {
      speaker: "Supreme Commander Catnip",
      avatar: "♾️",
      text: "THIS IS THE ULTIMATE FINAL BATTLE! 50 Allied Warships against the 50-Ship Dark Armada! Take command of your chosen flagship, activate 16-bullet Quad salvos, Cosmic Armor, and Infinity Shields to defeat #30 The Ultimate Catnip and claim peace for the feline cosmos!"
    },
    debriefing: {
      speaker: "Supreme Commander Catnip",
      avatar: "♾️",
      text: "VICTORY! THE 50-SHIP DARK ARMADA IS DEFEATED! PEACE HAS BEEN RESTORED TO THE CATNIP SEAS! CONGRATULATIONS, SUPREME ADMIRAL!"
    },
    objective: "Vanquish #30 The Ultimate Catnip and destroy the entire 50v50 Dark Armada!",
    allyCount: 50,
    enemyFleet: [
      30, 99, 98, 97, 95, 93, 91, 89, 87, 85, 83, 81, 79, 77, 75, 73, 71, 69, 67, 65,
      63, 61, 59, 57, 55, 53, 51, 49, 47, 45, 43, 41, 39, 37, 35, 33, 31, 29, 27, 25,
      23, 21, 19, 17, 15, 13, 11, 8, 2, 12
    ], // Exactly 50 elite Dark Armada ships!
    stars: 3
  }
];
