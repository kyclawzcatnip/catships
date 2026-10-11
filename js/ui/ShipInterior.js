/**
 * Catnip Warships — Interactive Top-Down Multi-Deck Ship Interior Blueprint System
 * Displays procedural cross-section architectural floorplans with machineries,
 * rooms, bulkheads, cat officer duty stations, and interactive inspection nodes.
 */
class ShipInteriorClass {
  constructor() {
    this.currentShipId = 1;
    this.currentDeck = 1; // 1 to 5
    this.hoveredRoom = null;
    this.selectedRoom = null;
    this.animFrame = null;
    this.pulsePhase = 0;
    this.canvas = null;
    this.ctx = null;
    this.boundMouseMove = (e) => this.onMouseMove(e);
    this.boundMouseClick = (e) => this.onMouseClick(e);
  }

  init() {
    this.canvas = document.getElementById('interior-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.addEventListener('mousemove', this.boundMouseMove);
      this.canvas.addEventListener('click', this.boundMouseClick);
    }
  }

  open(shipId) {
    if (!this.canvas) this.init();
    this.currentShipId = shipId || (window.HangarUI ? window.HangarUI.selectedShipId : 1);
    this.currentDeck = 1;
    this.selectedRoom = null;
    this.hoveredRoom = null;

    const modal = document.getElementById('ship-interior-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }

    this.updateHeader();
    this.updateDeckTabs();
    this.updateRoomDetails();
    this.startAnimation();
  }

  close() {
    const modal = document.getElementById('ship-interior-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.stopAnimation();
  }

  selectDeck(deckNum) {
    this.currentDeck = Math.max(1, Math.min(5, deckNum));
    this.selectedRoom = null;
    this.hoveredRoom = null;
    this.updateDeckTabs();
    this.updateRoomDetails();
  }

  getShipData() {
    const data = (typeof window !== 'undefined' && window.SHIPS_DATA) ? window.SHIPS_DATA : [];
    return data.find(s => Number(s.id) === Number(this.currentShipId)) || data[0] || {
      id: 1, name: "Catnip", type: "Attacker", hp: 200, da: 25, sp: 5
    };
  }

  getAssignedOfficers() {
    let savedCrew = [];
    try {
      const raw = localStorage.getItem(`catnip_crew_${this.currentShipId}`);
      if (raw) savedCrew = JSON.parse(raw);
    } catch (e) {}

    const officersList = (typeof window !== 'undefined' && window.CREW_OFFICERS) ? window.CREW_OFFICERS : [];
    return savedCrew.map(id => officersList.find(o => o.id === id)).filter(Boolean);
  }

  updateHeader() {
    const ship = this.getShipData();
    const titleEl = document.getElementById('interior-ship-name');
    const badgeEl = document.getElementById('interior-ship-badge');
    if (titleEl) {
      titleEl.innerHTML = `<span style="color: #ffd700;">#${ship.id}</span> ${ship.icon || '⚓'} ${ship.name} — Technical Blueprints`;
    }
    if (badgeEl) {
      badgeEl.innerText = `${ship.type} Class • 5 Decks`;
      badgeEl.className = `type-badge ${(ship.type || 'Attacker').toLowerCase().replace(' ', '-')}`;
    }
  }

  updateDeckTabs() {
    const tabs = document.querySelectorAll('.interior-deck-tab');
    tabs.forEach(tab => {
      const dNum = parseInt(tab.dataset.deck);
      if (dNum === this.currentDeck) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const labelEl = document.getElementById('interior-active-deck-title');
    if (labelEl) {
      const deckNames = {
        1: 'Deck 01: Bridge, Navigation Helm & Tactical Radar',
        2: 'Deck 02: Officer Quarters, Crew Mess & Sickbay',
        3: 'Deck 03: Barbette Citadels, Hydraulic Shell Hoists & Magazines',
        4: 'Deck 04: Catnip Steam Boilers, Turbines & Propulsion Shafts',
        5: 'Deck 05: Torpedo Compartments, Trim Ballast Tanks & Bilge Keel'
      };
      labelEl.innerText = deckNames[this.currentDeck] || `Deck 0${this.currentDeck}`;
    }
  }

  getDeckRooms(deckNum) {
    const ship = this.getShipData();
    const isCarrier = (ship.type === 'Carrier' || (ship.name && ship.name.toLowerCase().includes('carrier')));
    const isSubmarine = (ship.type === 'Submarine' || (ship.name && ship.name.toLowerCase().includes('submarine')) || (ship.id >= 101 && ship.id <= 103));
    const officers = this.getAssignedOfficers();

    const findOfficer = (roleKeyword) => {
      return officers.find(o => o.role.toLowerCase().includes(roleKeyword) || o.description.toLowerCase().includes(roleKeyword)) || null;
    };

    if (deckNum === 1) {
      // DECK 01: BRIDGE & COMMAND
      return [
        {
          id: 'wheelhouse', name: 'Wheelhouse & Helm Station', x: 260, y: 155, w: 140, h: 110,
          officer: findOfficer('helm') || findOfficer('speed'),
          desc: 'Primary steering station equipped with bronze helm wheel, gyrocompass repeater, and engine order telegraphs.',
          specs: { 'Manning': 'Helmsman & Watch Officer', 'Steering': 'Hydraulic Teledyne Ram', 'Armor': '180mm Face Plate' }
        },
        {
          id: 'radarrank', name: 'Radar Shack & Tactical Plotting', x: 410, y: 155, w: 130, h: 110,
          officer: findOfficer('scout') || findOfficer('vision'),
          desc: 'High-frequency radar cathode scope and dead-reckoning plotting table mapping enemy surface formations.',
          specs: { 'Radar': 'Type 271 Cavity Magnetron', 'Range': '18 Nautical Miles', 'Frequency': '3.0 GHz S-Band' }
        },
        {
          id: 'director', name: 'Optical Fire Director Tower', x: 130, y: 170, w: 120, h: 80,
          officer: findOfficer('claw') || findOfficer('acc') || findOfficer('crit'),
          desc: '15-meter stereoscopic coincidence rangefinder providing target bearing and lead angles to gun turrets.',
          specs: { 'Optics': 'Zeiss 15m Coincidence', 'Computer': 'Mark I Ballistic Analogue', 'Elevation': '+45° / -10°' }
        },
        {
          id: 'cabin', name: "Captain's Sea Day Cabin", x: 550, y: 170, w: 120, h: 80,
          officer: findOfficer('whisker') || findOfficer('captain'),
          desc: 'Operational command office with direct pneumatic voice pipes to engine control and flag signalling lockers.',
          specs: { 'Furniture': 'Oak chart desk, secure safe', 'Comms': 'Triple Brass Voice Tubes', 'Security': 'Class-A Watertight' }
        }
      ];
    } else if (deckNum === 2) {
      // DECK 02: CREW, MESS & SICKBAY (OR CARRIER HANGAR DECK)
      if (isCarrier) {
        return [
          {
            id: 'carrier_hangar', name: 'Enclosed Aviation Lower Hangar', x: 180, y: 140, w: 440, h: 140,
            officer: findOfficer('mitten') || findOfficer('jet') || findOfficer('flight'),
            desc: 'Expansive fire-curtained hangar deck housing frontline Cat Fighter Jets with folded wings and fueling hydrants.',
            specs: { 'Capacity': '18 Stowed Fighters', 'Fire Suppression': 'Halon Spray Foam', 'Elevators': 'Dual Hydraulic 15-Ton' }
          },
          {
            id: 'flight_brief', name: 'Pilot Ready Room & Briefing', x: 80, y: 160, w: 90, h: 100,
            officer: findOfficer('scout'),
            desc: 'Leather armchairs and blackboard tactical charts where naval aviators receive flight attack vector orders.',
            specs: { 'Seating': '24 Aviators', 'Briefing Table': 'Illuminated Atoll Chart', 'Equipment': 'Oxygen Masks & G-Suits' }
          },
          {
            id: 'sickbay', name: 'Naval Sickbay & Nanobot Tanks', x: 630, y: 160, w: 100, h: 100,
            officer: findOfficer('barnaby') || findOfficer('repair'),
            desc: 'Emergency surgical station and bio-active catnip broth healing vats restoring injured sailor health.',
            specs: { 'Capacity': '12 Intensive Pods', 'Medicine': 'Purr-Heal Nanobots', 'Sterility': 'UV Pressurized' }
          }
        ];
      } else {
        return [
          {
            id: 'officer_quarters', name: 'Cat Officers Staterooms', x: 130, y: 150, w: 150, h: 120,
            officer: findOfficer('captain') || findOfficer('whisker'),
            desc: 'Private mahogany bunks and quarters for your decorated feline commissioned officers.',
            specs: { 'Beds': '4 Brass Bunks', 'Comfort': 'Down Feathers & Scratching Posts', 'Storage': 'Officer Sea Chests' }
          },
          {
            id: 'mess_hall', name: 'Cat Sailors Mess & Fish Galley', x: 290, y: 150, w: 220, h: 120,
            officer: null,
            desc: 'Communal dining hall serving hot catnip soup, roasted sardines, and fresh tuna rations for crew morale.',
            specs: { 'Seating': '60 Crewmen', 'Stoves': 'Twin Oil-Fired Rangetops', 'Morale Boost': '+15% Fleet Stamina' }
          },
          {
            id: 'sickbay', name: 'Naval Sickbay & Healing Pods', x: 520, y: 150, w: 110, h: 120,
            officer: findOfficer('repair') || findOfficer('barnaby'),
            desc: 'Emergency medical center equipped with sterile bandages, antiseptic, and catnip restorative vapors.',
            specs: { 'Beds': '8 Intensive Care Bunks', 'Doctor': 'Senior Surgeon Paw', 'Healing Rate': '+15 HP / Second' }
          },
          {
            id: 'damage_control', name: 'Damage Control Central Locker', x: 640, y: 165, w: 70, h: 90,
            officer: null,
            desc: 'Shoring timbers, hydraulic jacks, collision mats, and emergency submersible bilge pumps.',
            specs: { 'Pumps': '3x 500 GPM Portable', 'Timber': 'Hardwood Wedge Planks', 'Response': 'Immediate Flash Flooding' }
          }
        ];
      }
    } else if (deckNum === 3) {
      // DECK 03: COMBAT & MUNITIONS CITADEL
      return [
        {
          id: 'barbette_a', name: 'Forward Main Turret Barbette A', x: 140, y: 145, w: 120, h: 130,
          officer: findOfficer('claw') || findOfficer('acc'),
          desc: 'Heavy cylindrical armored barbette housing rotating shell cages and hydraulic ammunition hoists.',
          specs: { 'Armor': '300mm Face / 200mm Sides', 'Rotation': 'Electric Ward-Leonard Drive', 'Shell Weight': '380 kg AP' }
        },
        {
          id: 'mag_powder', name: 'Forward Flash-Proof Powder Room', x: 270, y: 150, w: 150, h: 120,
          officer: null,
          desc: 'Sealed magazine storing cordite propellant charges with high-speed automated seawater flood valves.',
          specs: { 'Safety': 'Double Flash-Tight Interlocks', 'Cooling': 'Chilled Air Circulation', 'Sprinklers': 'Automatic Pyrometer' }
        },
        {
          id: 'mag_shells', name: 'Central Armored Shell Handling Room', x: 430, y: 150, w: 140, h: 120,
          officer: findOfficer('damage') || findOfficer('da'),
          desc: 'Overhead traveling monorail cranes lifting high-explosive and armor-piercing shells onto loading trays.',
          specs: { 'Capacity': '400 Heavy Shells', 'Types': 'Armor-Piercing & High-Explosive', 'Feed Rate': '2.5 Rounds / Min' }
        },
        {
          id: 'barbette_b', name: 'Aft Main Turret Barbette B', x: 580, y: 145, w: 120, h: 130,
          officer: null,
          desc: 'Aft armored barbette shaft delivering ammunition directly up to the stern firing deck.',
          specs: { 'Hoists': 'Dual Vertical Dredger Chains', 'Breech Interlock': 'Hydraulic Rammer', 'Protection': 'Heavy Citadel Belt' }
        }
      ];
    } else if (deckNum === 4) {
      // DECK 04: PROPULSION & TURBINE PLANT
      return [
        {
          id: 'boiler_room', name: 'High-Pressure Catnip Boilers', x: 170, y: 150, w: 170, h: 120,
          officer: findOfficer('speed') || findOfficer('turn'),
          desc: 'Express water-tube marine boilers generating superheated steam at 450 PSI into the main headers.',
          specs: { 'Steam Pressure': '450 PSI Superheated', 'Burners': 'Forced-Draft Atomizers', 'Water': 'Deaerated Feed Supply' }
        },
        {
          id: 'engine_turbines', name: 'Catnip Geared Steam Turbines', x: 350, y: 145, w: 180, h: 130,
          officer: findOfficer('barnaby') || findOfficer('repair'),
          desc: 'High-pressure impulse and low-pressure reaction steam turbines driving reduction gear assemblies.',
          specs: { 'Output': `${ship.sp * 14000} Shaft HP`, 'Turbine RPM': '3,600 RPM', 'Propeller RPM': '280 RPM at Full Ahead' }
        },
        {
          id: 'gearbox_shafts', name: 'Reduction Gearbox & Twin Propeller Shafts', x: 540, y: 160, w: 160, h: 100,
          officer: null,
          desc: 'Double helical reduction gears connecting to forged steel propeller shafts spinning bronze screws.',
          specs: { 'Shafts': 'Twin Forged Nickel-Steel', 'Bearings': 'Lignum Vitae Water-Lubricated', 'Thrust Block': 'Michell Pivot Pad' }
        }
      ];
    } else {
      // DECK 05: SUB-WATERLINE, TORPEDOES & KEEL
      if (isSubmarine) {
        return [
          {
            id: 'sub_torp_fwd', name: 'Forward Torpedo Launch Tubes', x: 100, y: 160, w: 140, h: 100,
            officer: findOfficer('claw') || findOfficer('torp'),
            desc: 'Pneumatic bow impulse tubes armed with 533mm acoustic homing catnip stealth torpedoes.',
            specs: { 'Tubes': '4x 533mm Bow Tubes', 'Range': '12,000 Yards', 'Warhead': '300kg Torpex High Explosive' }
          },
          {
            id: 'sub_batteries', name: 'Submarine Battery Wells & Scrubbers', x: 250, y: 155, w: 250, h: 110,
            officer: findOfficer('barnaby') || findOfficer('speed'),
            desc: 'Massive lead-acid battery cells providing silent underwater electric propulsion while submerged.',
            specs: { 'Voltage': '440V DC Bus', 'Submerged Endurance': '72 Hours Silent Running', 'Air Scrubber': 'Lithium Hydroxide' }
          },
          {
            id: 'sub_ballast', name: 'Ballast Flood & Vent Tanks', x: 510, y: 155, w: 180, h: 110,
            officer: null,
            desc: 'Kingston seawater valves and compressed air blow manifolds regulating dive depth and trim angle.',
            specs: { 'Blow Pressure': '3,000 PSI Air Banks', 'Dive Time': '18 Seconds to Periscope Depth', 'Depth Rating': '250 Meters' }
          }
        ];
      } else {
        return [
          {
            id: 'torpedo_room', name: 'Forward Keel Torpedo Bay', x: 120, y: 160, w: 150, h: 100,
            officer: findOfficer('claw') || findOfficer('torp'),
            desc: 'Sub-waterline torpedo handling bay with compressed-air launch pistons and gyro angle presets.',
            specs: { 'Launch Tubes': '2x Submerged Beam Tubes', 'Reloads': '6x 21-inch Heavy Torpedoes', 'Guidance': 'Preset Gyro Angle' }
          },
          {
            id: 'fuel_cells', name: 'Double Bottom Fuel Oil Bunkers', x: 280, y: 160, w: 240, h: 100,
            officer: null,
            desc: 'Reinforced cellular double-bottom hull tanks providing structural flotation and bunker fuel storage.',
            specs: { 'Capacity': '2,400 Metric Tons Oil', 'Hull Type': 'Welded Double Skin', 'Impact Buffer': 'Torpedo Protection Bulkhead' }
          },
          {
            id: 'sonar_dome', name: 'Bow Keel Sonar Hydrophone Dome', x: 530, y: 165, w: 140, h: 90,
            officer: findOfficer('scout') || findOfficer('purr'),
            desc: 'Streamlined underwater acoustic listening dome detecting enemy submarine propellers and torpedo wakes.',
            specs: { 'Array': 'Quartz Piezoelectric Crystals', 'Modes': 'Active Ping & Passive Audio', 'Detection Arc': '360° Azimuth' }
          }
        ];
      }
    }
  }

  updateRoomDetails() {
    const detailsContainer = document.getElementById('interior-room-details');
    if (!detailsContainer) return;

    const rooms = this.getDeckRooms(this.currentDeck);
    const activeRoom = this.selectedRoom || this.hoveredRoom || rooms[0];

    if (!activeRoom) {
      detailsContainer.innerHTML = '<div style="color: #a0aec0; padding: 1rem;">Select a machinery room to view specifications.</div>';
      return;
    }

    let specsHtml = '';
    if (activeRoom.specs) {
      for (const [key, val] of Object.entries(activeRoom.specs)) {
        specsHtml += `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(0, 229, 255, 0.2); padding: 4px 0; font-size: 0.85rem;">
            <span style="color: #a0aec0;">${key}:</span>
            <span style="color: #00e5ff; font-weight: 700;">${val}</span>
          </div>
        `;
      }
    }

    let officerHtml = '';
    if (activeRoom.officer) {
      officerHtml = `
        <div style="background: rgba(255, 215, 0, 0.12); border: 1px solid #ffd700; border-radius: 8px; padding: 0.6rem 0.8rem; margin-top: 0.75rem; display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.8rem;">${activeRoom.officer.icon || '🐱'}</span>
          <div>
            <div style="color: #ffd700; font-weight: 800; font-size: 0.9rem;">Stationed: ${activeRoom.officer.name}</div>
            <div style="color: #fff; font-size: 0.75rem; margin-top: 2px;">${activeRoom.officer.role} — ${activeRoom.officer.description}</div>
          </div>
        </div>
      `;
    } else {
      officerHtml = `
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.5rem 0.8rem; margin-top: 0.75rem; font-size: 0.78rem; color: #a0aec0;">
          ⚓ Automated Duty Station • Crew Managed
        </div>
      `;
    }

    detailsContainer.innerHTML = `
      <div style="border-left: 3px solid #00e5ff; padding-left: 0.75rem; margin-bottom: 0.75rem;">
        <h3 style="color: #00e5ff; margin: 0; font-size: 1.15rem; font-family: var(--font-heading);">${activeRoom.name}</h3>
        <span style="color: #00f5d4; font-size: 0.75rem; font-weight: 700;">DECK 0${this.currentDeck} COMPARTMENT</span>
      </div>
      <p style="color: #e2e8f0; font-size: 0.88rem; line-height: 1.45; margin: 0.5rem 0 0.75rem 0;">
        ${activeRoom.desc}
      </p>
      <div style="background: rgba(5, 15, 30, 0.75); border: 1px solid rgba(0, 229, 255, 0.25); border-radius: 8px; padding: 0.6rem 0.8rem; margin-top: 0.5rem;">
        <div style="font-size: 0.78rem; color: #ffd700; font-weight: 700; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 1px;">Machinery Specifications</div>
        ${specsHtml}
      </div>
      ${officerHtml}
    `;
  }

  onMouseMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    const rooms = this.getDeckRooms(this.currentDeck);
    let found = null;
    rooms.forEach(r => {
      if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
        found = r;
      }
    });

    if (this.hoveredRoom !== found) {
      this.hoveredRoom = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
      this.updateRoomDetails();
    }
  }

  onMouseClick(e) {
    if (this.hoveredRoom) {
      this.selectedRoom = this.hoveredRoom;
      if (window.AudioSystem) AudioSystem.playBeep(650, 0.08);
      this.updateRoomDetails();
    }
  }

  startAnimation() {
    this.stopAnimation();
    const loop = () => {
      this.pulsePhase += 0.035;
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  stopAnimation() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Dark Blueprint Grid Background
    ctx.fillStyle = '#050f1d';
    ctx.fillRect(0, 0, w, h);

    // Subtle technical grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Technical Waterline / Centerline markings
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.25)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(30, h / 2); ctx.lineTo(w - 30, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Outer Hull Cross-Section Cutaway Contour
    ctx.save();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;

    const ship = this.getShipData();
    const isSub = (ship.type === 'Submarine' || (ship.id >= 101 && ship.id <= 103));

    ctx.beginPath();
    if (isSub) {
      // Cylindrical Submarine Hull
      ctx.ellipse(w / 2, h / 2, w * 0.42, h * 0.32, 0, 0, Math.PI * 2);
    } else {
      // Ship Hull contour: Sharp tapered bow (left), wide midship citadel, rounded stern (right)
      ctx.moveTo(60, h / 2); // Bow tip
      ctx.bezierCurveTo(120, 80, 250, 70, w * 0.5, 70); // Port midship
      ctx.bezierCurveTo(w * 0.75, 70, w - 100, 85, w - 60, 110); // Port stern
      ctx.lineTo(w - 60, h - 110); // Stern transom
      ctx.bezierCurveTo(w - 100, h - 85, w * 0.75, h - 70, w * 0.5, h - 70); // Starboard midship
      ctx.bezierCurveTo(250, h - 70, 120, h - 80, 60, h / 2); // Starboard bow
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Double-bottom armor plating hatch lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 3. Render Compartments & Machineries for Current Deck
    const rooms = this.getDeckRooms(this.currentDeck);
    rooms.forEach(room => {
      const isHovered = (this.hoveredRoom && this.hoveredRoom.id === room.id);
      const isSelected = (this.selectedRoom && this.selectedRoom.id === room.id);

      ctx.save();
      // Room background fill
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(0, 245, 212, 0.2)';
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = 'rgba(10, 25, 45, 0.85)';
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 1.5;
      }

      ctx.fillRect(room.x, room.y, room.w, room.h);
      ctx.strokeRect(room.x, room.y, room.w, room.h);
      ctx.shadowBlur = 0;

      // Draw Watertight Bulkhead Rivets
      ctx.fillStyle = '#00e5ff';
      const dotCountX = Math.floor(room.w / 18);
      for (let i = 0; i <= dotCountX; i++) {
        ctx.fillRect(room.x + i * 18 - 1, room.y - 1, 2, 2);
        ctx.fillRect(room.x + i * 18 - 1, room.y + room.h - 1, 2, 2);
      }

      // Draw Machinery Icons & Animated Coils/Pipes inside specific rooms
      if (room.id.includes('boiler') || room.id.includes('turbines')) {
        // Rotating Turbine / Boiler Fan
        ctx.save();
        ctx.translate(room.x + room.w / 2, room.y + room.h / 2);
        ctx.rotate(this.pulsePhase * 1.5);
        ctx.strokeStyle = isHovered ? '#00f5d4' : '#00e5ff';
        ctx.lineWidth = 2;
        for (let b = 0; b < 6; b++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(16, 0);
          ctx.stroke();
        }
        ctx.restore();
      } else if (room.id.includes('barbette')) {
        // Armored Gun Barbette Circular Ring
        ctx.save();
        ctx.strokeStyle = isHovered ? '#00f5d4' : '#ffd700';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(room.x + room.w / 2, room.y + room.h / 2, Math.min(room.w, room.h) * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else if (room.id.includes('wheelhouse')) {
        // Helm wheel icon
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(room.x + 30, room.y + 35, 10, 0, Math.PI * 2);
        ctx.stroke();
      } else if (room.id.includes('torp')) {
        // Torpedo Tubes lines
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(room.x + 15, room.y + room.h / 2 - 8); ctx.lineTo(room.x + room.w - 15, room.y + room.h / 2 - 8);
        ctx.moveTo(room.x + 15, room.y + room.h / 2 + 8); ctx.lineTo(room.x + room.w - 15, room.y + room.h / 2 + 8);
        ctx.stroke();
      }

      // Room Title Label
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.fillStyle = isSelected ? '#ffd700' : (isHovered ? '#00f5d4' : '#ffffff');
      ctx.textAlign = 'center';
      ctx.fillText(room.name, room.x + room.w / 2, room.y + 18);

      // Stationed Cat Officer Avatar
      if (room.officer) {
        ctx.font = '16px "Segoe UI Emoji", sans-serif';
        ctx.fillText(room.officer.icon || '🐱', room.x + room.w / 2, room.y + room.h - 14);

        ctx.font = 'bold 9px "Outfit", sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(room.officer.name.split(' ')[0], room.x + room.w / 2, room.y + room.h - 4);
      }

      ctx.restore();
    });

    // 4. Blueprint Title Legend & Compass Rose
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(`◄ BOW (FORWARD)  •  SCALE 1:250  •  STERN (AFT) ►`, 70, h - 20);

    // Decorative Compass Rose (Top Right)
    ctx.save();
    ctx.translate(w - 75, 45);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.moveTo(0, -22); ctx.lineTo(0, 22);
    ctx.moveTo(-22, 0); ctx.lineTo(22, 0);
    ctx.stroke();
    ctx.font = '9px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#00e5ff';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -26);
    ctx.restore();
  }
}

if (typeof window !== 'undefined') {
  window.ShipInterior = new ShipInteriorClass();
}
