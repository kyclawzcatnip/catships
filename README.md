# 🐾⚓ Catnip Warships

> **Action-Packed 100-Ship Naval Combat & Interactive Harbor Basin Simulator**

[![Play Live on GitHub Pages](https://img.shields.io/badge/Play%20Online-GitHub%20Pages-00e5ff?style=for-the-badge&logo=github)](https://kyclawzcatnip.github.io/catships/)
[![Version](https://img.shields.io/badge/Version-v3.0.1-39ff14?style=for-the-badge)](https://github.com/kyclawzcatnip/catships)
[![Platform](https://img.shields.io/badge/Platform-HTML5%20%7C%20Canvas%202D-ffd700?style=for-the-badge)](https://github.com/kyclawzcatnip/catships)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Vanilla%20JS%20(Zero)-ff007f?style=for-the-badge)](https://github.com/kyclawzcatnip/catships)

Playable in any modern web browser — no installation, downloads, or plugins required!

👉 **[PLAY NOW IN BROWSER](https://kyclawzcatnip.github.io/catships/)**

---

## 🌟 Highlights & Key Features

### 🚢 Complete 100-Ship Naval Fleet Roster
Take command of 100 specialized naval warships across 4 tactical roles:
- 🗡️ **Attackers**: High-damage frontline combatants with heavy catnip cannons & torpedo salvos.
- 🛡️ **Tanks**: Heavily armored dreadnoughts designed to absorb devastating bombardments.
- ⚡ **Rushers**: High-speed interceptors with rapid turning and fast-reloading light guns.
- 🎯 **Long Ranged**: Siege cruisers, snipers, and aircraft carriers delivering long-distance strikes.

### ⚓ Playable Harbor Basin Hub Map
Sail freely inside a peaceful, interactive naval port before heading into open-sea warfare:
- 🏗️ **Catnip Shipyard**: Customize hull camo paint schemes (*Golden Cat*, *Cyber Neon*, *Arctic Camo*, *Crimson Phantom*) and swap specialized turret modules (*Standard*, *Siege Heavy*, *Quad Rapid Flak*).
- 🐱 **"The Salty Meow" Officer Quarters**: Recruit elite Cat Officers (*Captain Whisker*, *Chief Barnaby*, *Officer Claws*, *Helmsman Paw*, *Scout Purr*, *Marshal Mittens*) to staff active ship crew stations.
- ⚓ **Harbor Basin Resupply & Dry Dock**: Instantly repair your hull to 100% HP, clear ability cooldowns, and reload torpedoes & flak guns.
- 🌊 **Harbor Exit Buoy Gate**: Sail past the harbor perimeter gates to seamlessly deploy into open-sea fleet combat!

### ✈️ Fighter Jet Piloting & 5x Commander Autopilot
Press **`[P]`** at any time to launch from your flagship and manually pilot a supersonic **Cat Fighter Jet** with high-speed strafing runs, while your command warship auto-navigates and defends itself with 5x AI tactical skill!

### 🏊 Lifeboat Rescue & Crew Morale
When allied warships are sunk, surviving cat sailors deploy in yellow lifeboats. Rescue them by steering near their lifeboats to earn **+50 HP**, **+25 Coins**, and high-morale speed boosts!

### 📖 8-Chapter Story Campaign Mode
Experience a complete story campaign with chapter selection, dialogue portraits, tactical mission objectives, and 3-star ratings!

### 🏝️ Dynamic Archipelago Map & Weather Engine
Battle across **Tropical Archipelagos**, **Arctic Glaciers** (with drifting icebergs), and **Volcanic Atolls** under **Clear Daylight**, **Midnight Lightning Storms**, or **Sunset Twilight**.

---

## 🎮 Controls Guide

| Action | Keyboard / Mouse Control |
| :--- | :--- |
| **Throttle & Steering** | <kbd>W</kbd> Forward / Accelerate • <kbd>S</kbd> Reverse • <kbd>A</kbd> Turn Port (Left) • <kbd>D</kbd> Turn Starboard (Right) |
| **Aim Cannons** | Move <kbd>MOUSE</kbd> or use <kbd>J</kbd> / <kbd>L</kbd> |
| **Fire Main Cannon** | <kbd>SPACE</kbd> or <kbd>LEFT CLICK</kbd> |
| **Anti-Aircraft Flak Guns** | <kbd>F</kbd> |
| **Special Ability** | <kbd>E</kbd> |
| **Dock Interaction (Harbor)** | <kbd>E</kbd> or <kbd>F</kbd> or Click Dock / Prompt |
| **Pilot Fighter Jet** | <kbd>P</kbd> (Press again to return to warship) |
| **Submarine Dive / Surface**| <kbd>X</kbd> or <kbd>SHIFT</kbd> |
| **Lock-On Target / Auto-Aim**| <kbd>TAB</kbd> or <kbd>T</kbd> |
| **Fleet Tactical Commands** | <kbd>1</kbd> Regroup / Follow • <kbd>2</kbd> Focus Fire • <kbd>3</kbd> Charge Attack |
| **Pause Game** | <kbd>ESC</kbd> |

---

## 🛠️ Technology Stack & Architecture

- **Core**: Pure HTML5 & Vanilla JavaScript (ES6+ modular class architecture).
- **Graphics**: Hardware-accelerated HTML5 Canvas 2D with vector procedural rendering, particle bursts, and dynamic ocean ripple shaders.
- **Audio**: Web Audio API Procedural Synthesizer (Zero external audio file latency; procedural cannon thuds, torpedo whooshes, engine hums, and victory fanfares).
- **CSS**: Responsive glassmorphic layout using modern CSS custom properties and Google Fonts (*Space Grotesk* & *Outfit*).
- **Hosting**: GitHub Pages via automated GitHub Actions CI/CD.

---

## 💻 Running Locally

To run the game locally on your computer:

```bash
# Clone the repository
git clone https://github.com/kyclawzcatnip/catships.git

# Enter the game directory
cd catships

# Start a lightweight local HTTP server (Python 3)
python3 -m http.server 8765
```

Open your browser to [http://localhost:8765](http://localhost:8765) and enjoy!

---

## 🧪 Automated Integrity Testing

Run the built-in pre-release automated test suite anytime:

```bash
python3 scripts/test-runner.py
```

---

*Developed with ❤️ for the Catnip Alliance Navy.*
