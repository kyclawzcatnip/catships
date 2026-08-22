/**
 * Catnip Warships — Viewport Tracking Camera with Screen Shake
 */
class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.shakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  follow(targetX, targetY) {
    const targetCamX = targetX - this.viewportWidth / 2;
    const targetCamY = targetY - this.viewportHeight / 2;

    // Smooth linear interpolation (Lerp)
    this.x += (targetCamX - this.x) * CONFIG.CAMERA_SMOOTHING;
    this.y += (targetCamY - this.y) * CONFIG.CAMERA_SMOOTHING;

    // Map bounds clamp
    this.x = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.viewportWidth, this.x));
    this.y = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.viewportHeight, this.y));

    // Handle screen shake
    if (this.shakeIntensity > 0) {
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  addShake(amount) {
    this.shakeIntensity = Math.min(30, this.shakeIntensity + amount);
  }

  getRenderOffsetX() {
    return this.x + this.shakeOffsetX;
  }

  getRenderOffsetY() {
    return this.y + this.shakeOffsetY;
  }
}
