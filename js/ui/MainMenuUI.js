/**
 * Catnip Warships — Main Menu UI
 */
class MainMenuUI {
  static init(onPlay, onOpenWiki, onQuit) {
    this.screen = document.getElementById('main-menu-screen');
    this.btnPlay = document.getElementById('btn-main-play');
    this.btnWiki = document.getElementById('btn-main-wiki');
    this.btnQuit = document.getElementById('btn-main-quit');

    if (onPlay) this.onPlay = onPlay;
    if (onOpenWiki) this.onOpenWiki = onOpenWiki;
    if (onQuit) this.onQuit = onQuit;

    if (this.btnPlay) {
      this.btnPlay.onclick = (e) => {
        if (e) e.stopPropagation();
        if (this.onPlay) {
          this.onPlay();
        } else if (window.CatnipMain) {
          window.CatnipMain.enterHarborHub();
        }
      };
    }

    if (this.btnWiki) {
      this.btnWiki.onclick = (e) => {
        if (e) e.stopPropagation();
        if (this.onOpenWiki) {
          this.onOpenWiki();
        } else if (window.WikiUI) {
          window.WikiUI.show('ships');
        }
      };
    }

    if (this.btnQuit) {
      this.btnQuit.onclick = (e) => {
        if (e) e.stopPropagation();
        if (this.onQuit) {
          this.onQuit();
        } else {
          alert('🚪 Thank you for playing Catnip Warships! You can safely close this browser tab now.');
        }
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
