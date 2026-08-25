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
        const main = window.CatnipMain || window.Game;
        if (main && main.isStoryMode && main.storyMission && window.StoryMode) {
          const nextId = main.storyMission.id + 1;
          if (nextId <= 8) {
            window.StoryMode.startMission(nextId);
          } else {
            window.StoryMode.openChapterSelectModal();
          }
        } else if (this.onPlayAgain) {
          this.onPlayAgain();
        }
      });
    }

    const exitBtn = document.getElementById('btn-hangar-exit');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.hide();
        const main = window.CatnipMain || window.Game;
        const isStory = main && main.isStoryMode;
        if (this.onReturnHangar) this.onReturnHangar();
        if (isStory && window.StoryMode) {
          window.StoryMode.openChapterSelectModal();
        }
      });
    }
  }

  show(isVictory, playerShip) {
    const modal = document.getElementById('endgame-modal');
    if (!modal) return;

    const banner = document.getElementById('endgame-banner');
    const title = document.getElementById('endgame-title');
    const playAgainBtn = document.getElementById('btn-play-again');
    const exitBtn = document.getElementById('btn-hangar-exit');

    const main = window.CatnipMain || window.Game;
    const isStory = main && main.isStoryMode;
    const ch = isStory ? main.storyMission : null;

    if (isStory && isVictory && ch) {
      banner.innerText = '⭐ MISSION ACCOMPLISHED!';
      banner.className = 'endgame-banner victory';
      title.innerText = `${ch.title} Cleared! 3 Stars Earned! ⭐⭐⭐`;
      if (playAgainBtn) playAgainBtn.innerText = ch.id < 8 ? '▶ NEXT CHAPTER' : '🏆 CAMPAIGN COMPLETED!';
      if (exitBtn) exitBtn.innerText = '📖 STORY SELECT';
    } else if (isVictory) {
      banner.innerText = 'VICTORY!';
      banner.className = 'endgame-banner victory';
      title.innerText = 'The Dark Fleet was defeated by Catnip Armada!';
      if (playAgainBtn) playAgainBtn.innerText = 'Battle Again';
      if (exitBtn) exitBtn.innerText = 'Back to Hangar';
    } else {
      banner.innerText = 'DEFEATED!';
      banner.className = 'endgame-banner defeat';
      title.innerText = isStory ? 'Mission Failed! Retrying Chapter...' : 'Your Warship was sunk in battle!';
      if (playAgainBtn) playAgainBtn.innerText = isStory ? '🔁 RETRY MISSION' : 'Battle Again';
      if (exitBtn) exitBtn.innerText = isStory ? '📖 STORY SELECT' : 'Back to Hangar';
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
