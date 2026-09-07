/**
 * Catnip Warships — Main Menu UI
 */
class MainMenuUI {
  static init() {
    this.screen = document.getElementById('main-menu-screen');
    this.btnPlayHangar = document.getElementById('btn-main-play-hangar');
    this.btnPlayHarbor = document.getElementById('btn-main-play-harbor');
    this.btnWiki = document.getElementById('btn-main-wiki');
    this.btnQuit = document.getElementById('btn-main-quit');

    if (this.btnPlayHangar) {
      this.btnPlayHangar.onclick = (e) => {
        if (e) e.stopPropagation();
        const game = window.CatnipMain || (typeof getGameEngine === 'function' ? getGameEngine() : null);
        if (game) game.openHangarScreen();
      };
    }

    if (this.btnPlayHarbor) {
      this.btnPlayHarbor.onclick = (e) => {
        if (e) e.stopPropagation();
        const game = window.CatnipMain || (typeof getGameEngine === 'function' ? getGameEngine() : null);
        if (game) game.enterHarborHub();
      };
    }

    if (this.btnWiki) {
      this.btnWiki.onclick = (e) => {
        if (e) e.stopPropagation();
        if (window.WikiUI) {
          window.WikiUI.show('ships');
        }
      };
    }

    if (this.btnQuit) {
      this.btnQuit.onclick = (e) => {
        if (e) e.stopPropagation();
        alert('🚪 Thank you for playing Catnip Warships! You can safely close this browser tab now.');
      };
    }
  }

  static show() {
    if (!this.screen) this.screen = document.getElementById('main-menu-screen');
    if (this.screen) {
      this.screen.style.display = 'flex';
      this.screen.classList.add('active');
    }
  }

  static hide() {
    if (!this.screen) this.screen = document.getElementById('main-menu-screen');
    if (this.screen) {
      this.screen.style.display = 'none';
      this.screen.classList.remove('active');
    }
  }
}
window.MainMenuUI = MainMenuUI;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MainMenuUI.init());
  } else {
    MainMenuUI.init();
  }
}
