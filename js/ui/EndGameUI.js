/**
 * Catnip Warships — End Game UI Controller
 */
class EndGameUIClass {
  init(onPlayAgain, onReturnHangar) {
    this.onPlayAgain = onPlayAgain;
    this.onReturnHangar = onReturnHangar;

    const playAgainBtn = document.getElementById('btn-play-again');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.hide();
        if (this.onPlayAgain) this.onPlayAgain();
      });
    }

    const exitBtn = document.getElementById('btn-hangar-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.hide();
        if (this.onReturnHangar) this.onReturnHangar();
      });
    }
  }

  show(isVictory, playerShip) {
    const modal = document.getElementById('endgame-modal');
    if (!modal) return;

    const banner = document.getElementById('endgame-banner');
    const title = document.getElementById('endgame-title');

    if (isVictory) {
      banner.innerText = 'VICTORY!';
      banner.className = 'endgame-banner victory';
      title.innerText = 'The Dark Fleet was defeated by Catnip Armada!';
    } else {
      banner.innerText = 'DEFEATED!';
      banner.className = 'endgame-banner defeat';
      title.innerText = 'Your Warship was sunk in battle!';
    }

    // Stats Breakdown
    if (playerShip) {
      document.getElementById('stat-kills').innerText = playerShip.kills || 0;
      document.getElementById('stat-damage').innerText = (playerShip.damageDealt || 0).toLocaleString();
      document.getElementById('stat-abilities').innerText = playerShip.abilitiesUsed || 0;
    }

    modal.classList.remove('hidden');
  }

  hide() {
    const modal = document.getElementById('endgame-modal');
    if (modal) modal.classList.add('hidden');
  }
}

const EndGameUI = new EndGameUIClass();
