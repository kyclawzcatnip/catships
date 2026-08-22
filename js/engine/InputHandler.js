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
      this.keys[e.code] = true;

      if (e.code === 'KeyP') {
        this.pilotPlaneTriggered = true;
      }
      if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.abilityTriggered = true;
      }
      if (e.code === 'Space') {
        this.spaceTriggered = true;
      }
      if (e.code === 'KeyF') {
        this.aaTriggered = true;
      }
      if (e.code === 'KeyK') {
        this.skipWaveTriggered = true;
      }
      if (e.code === 'Escape') {
        this.pauseTriggered = true;
      }
      if (e.code === 'Tab' || e.code === 'KeyT') {
        e.preventDefault();
        this.lockTargetTriggered = true;
      }
      if (e.code === 'Digit1') {
        this.fleetCommandTriggered = 'FOLLOW';
      }
      if (e.code === 'Digit2') {
        this.fleetCommandTriggered = 'FOCUS';
      }
      if (e.code === 'Digit3') {
        this.fleetCommandTriggered = 'ATTACK';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.hasMoved = true;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = true;
        this.mouse.hasMoved = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mouse.isDown = false;
      }
    });

    // Touch support
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
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

  isForward() {
    return this.keys['KeyW'] || this.keys['ArrowUp'];
  }

  isBackward() {
    return this.keys['KeyS'] || this.keys['ArrowDown'];
  }

  isTurnLeft() {
    return this.keys['KeyA'] || this.keys['ArrowLeft'];
  }

  isTurnRight() {
    return this.keys['KeyD'] || this.keys['ArrowRight'];
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

  consumePauseTrigger() {
    if (this.pauseTriggered) {
      this.pauseTriggered = false;
      return true;
    }
    return false;
  }
}

const InputHandler = new InputHandlerClass();
