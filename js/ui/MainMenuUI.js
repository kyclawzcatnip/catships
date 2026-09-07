/**
 * Catnip Warships — Main Menu UI
 */
class MainMenuUI {
  static init(onPlay, onOpenWiki, onQuit) {
    this.screen = document.getElementById('main-menu-screen');
    this.btnPlay = document.getElementById('btn-main-play');
    this.btnWiki = document.getElementById('btn-main-wiki');
    this.btnQuit = document.getElementById('btn-main-quit');

    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => {
        if (onPlay) onPlay();
      });
    }

    if (this.btnWiki) {
      this.btnWiki.addEventListener('click', () => {
        if (onOpenWiki) onOpenWiki();
      });
    }

    if (this.btnQuit) {
      this.btnQuit.addEventListener('click', () => {
        if (onQuit) {
          onQuit();
        } else {
          try {
            window.close();
          } catch(e) {}
          alert('🚪 Thank you for playing Catnip Warships! You can now close this browser tab.');
        }
      });
    }
  }

  static show() {
    if (this.screen) {
      this.screen.classList.add('active');
    }
  }

  static hide() {
    if (this.screen) {
      this.screen.classList.remove('active');
    }
  }
}
window.MainMenuUI = MainMenuUI;
