/**
 * Catnip Warships — Input Handler Engine (AA Guns & Skip Wave Triggers)
 */
class InputHandlerClass {
  constructor() {
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      isDown: false,
      hasMoved: false
    };
    this.abilityTriggered = false;
    this.pauseTriggered = false;
    this.spaceTriggered = false;
    this.aaTriggered = false;
    this.skipWaveTriggered = false;
    this.lockTargetTriggered = false;
    this.pilotPlaneTriggered = false;
    this.fleetCommandTriggered = null; // 'FOLLOW', 'FOCUS', 'ATTACK'

    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => {
      if (e.code) this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.key.toUpperCase()] = true;
      }

      const kCode = e.code || '';
      const kKey = (e.key || '').toUpperCase();

      if (kCode === 'KeyP' || kKey === 'P') {
        this.pilotPlaneTriggered = true;
      }
      if (kCode === 'KeyE' || kKey === 'E' || e.shiftKey || kCode.startsWith('Shift')) {
        this.abilityTriggered = true;
      }
      if (kCode === 'Space' || kKey === ' ') {
        this.spaceTriggered = true;
      }
      if (kCode === 'KeyF' || kKey === 'F' || kKey === 'f') {
        this.aaTriggered = true;
      }
      if (kCode === 'KeyX' || kCode === 'ShiftLeft' || kCode === 'ShiftRight' || kKey === 'X' || kKey === 'x') {
        this.subDiveTriggered = true;
      }
      if (kCode === 'KeyK' || kKey === 'K') {
        this.skipWaveTriggered = true;
      }
      if (kCode === 'Escape' || kKey === 'ESCAPE') {
        this.pauseTriggered = true;
      }
      if (kCode === 'Tab' || kKey === 'TAB' || kCode === 'KeyT' || kKey === 'T') {
        e.preventDefault();
        this.lockTargetTriggered = true;
      }
      if (kCode === 'Digit1' || kKey === '1') {
        this.fleetCommandTriggered = 'FOLLOW';
      }
      if (kCode === 'Digit2' || kKey === '2') {
        this.fleetCommandTriggered = 'FOCUS';
      }
      if (kCode === 'Digit3' || kKey === '3') {
        this.fleetCommandTriggered = 'ATTACK';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.key.toUpperCase()] = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.hasMoved = true;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = false;
      }
    });

    // Touch support
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.isDown = true;
        this.mouse.hasMoved = true;
      }
    });

    window.addEventListener('touchend', () => {
      this.mouse.isDown = false;
    });
  }

  updateWorldMouse(camera) {
    this.mouse.worldX = this.mouse.x + camera.x;
    this.mouse.worldY = this.mouse.y + camera.y;
  }

  resetMouse() {
    this.mouse.hasMoved = false;
  }

  isForward() {
    return !!(this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']);
  }

  isBackward() {
    return !!(this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']);
  }

  isTurnLeft() {
    return !!(this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']);
  }

  isTurnRight() {
    return !!(this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']);
  }

  isAimLeft() {
    return this.keys['KeyJ'] || this.keys['KeyQ'];
  }

  isAimRight() {
    return this.keys['KeyL'] || this.keys['KeyE'];
  }

  consumeLockTargetTrigger() {
    if (this.lockTargetTriggered) {
      this.lockTargetTriggered = false;
      return true;
    }
    return false;
  }

  consumeFleetCommandTrigger() {
    if (this.fleetCommandTriggered) {
      const cmd = this.fleetCommandTriggered;
      this.fleetCommandTriggered = null;
      return cmd;
    }
    return null;
  }

  consumePilotPlaneTrigger() {
    if (this.pilotPlaneTriggered) {
      this.pilotPlaneTriggered = false;
      return true;
    }
    return false;
  }

  consumeAbilityTrigger() {
    if (this.abilityTriggered) {
      this.abilityTriggered = false;
      return true;
    }
    return false;
  }

  consumeSpaceTrigger() {
    if (this.spaceTriggered) {
      this.spaceTriggered = false;
      return true;
    }
    return false;
  }

  consumeAATrigger() {
    if (this.aaTriggered) {
      this.aaTriggered = false;
      return true;
    }
    return false;
  }

  consumeSkipWaveTrigger() {
    if (this.skipWaveTriggered) {
      this.skipWaveTriggered = false;
      return true;
    }
    return false;
  }

  consumeSubmarineDiveTrigger() {
    if (this.subDiveTriggered) {
      this.subDiveTriggered = false;
      return true;
    }
    return false;
  }

  consumePauseTrigger() {
    if (this.pauseTriggered) {
      this.pauseTriggered = false;
      return true;
    }
    return false;
  }
}

const InputHandler = new InputHandlerClass();
