/**
 * Catnip Warships — Story Mode Campaign Manager & Persistence System
 */
class StoryModeClass {
  constructor() {
    this.storageKey = 'catnip_warships_story_progress';
    this.progress = this.loadProgress();
    this.currentChapterId = 1;
    this.activeMissionData = null;
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load Story Mode progress from localStorage:', e);
    }
    return {
      unlockedChapter: 1,
      completedChapters: [],
      stars: {}
    };
  }

  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Could not save Story Mode progress:', e);
    }
  }

  openChapterSelectModal() {
    const modal = document.getElementById('story-modal');
    if (!modal) return;

    const unlockBtn = document.getElementById('btn-unlock-all-chapters');
    if (unlockBtn) {
      unlockBtn.onclick = () => {
        this.progress.unlockedChapter = 8;
        this.saveProgress();
        this.renderChapterGrid();
      };
    }

    this.renderChapterGrid();
    modal.classList.remove('hidden');
  }

  closeChapterSelectModal() {
    const modal = document.getElementById('story-modal');
    if (modal) modal.classList.add('hidden');
  }

  renderChapterGrid() {
    const grid = document.getElementById('story-chapter-grid');
    if (!grid || !window.STORY_DATA) return;

    grid.innerHTML = '';
    window.STORY_DATA.forEach(ch => {
      const isUnlocked = ch.id <= this.progress.unlockedChapter;
      const isCompleted = this.progress.completedChapters.includes(ch.id);
      const earnedStars = this.progress.stars[ch.id] || 0;

      const card = document.createElement('div');
      card.className = `story-chapter-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`;

      card.innerHTML = `
        <div class="chapter-header">
          <span class="chapter-icon">${ch.icon}</span>
          <span class="chapter-badge">${isUnlocked ? (isCompleted ? '⭐ COMPLETED' : '▶️ UNLOCKED') : '🔒 LOCKED'}</span>
        </div>
        <h3 class="chapter-title">${ch.title}</h3>
        <p class="chapter-subtitle">${ch.subtitle}</p>
        <div class="chapter-meta" style="flex-direction: column; align-items: flex-start; gap: 0.3rem;">
          <span class="meta-item" style="color: #00e5ff; font-weight: 600;">⚔️ Fleet Clash: ${ch.allyCount} Ally vs ${ch.enemyFleet ? ch.enemyFleet.length : 3} Enemy (${ch.allyCount}v${ch.enemyFleet ? ch.enemyFleet.length : 3})</span>
          <span class="meta-item">🎯 ${ch.objective}</span>
          <span class="meta-stars">${'⭐'.repeat(earnedStars)}${'☆'.repeat(3 - earnedStars)}</span>
        </div>
        <button class="btn btn-primary btn-start-mission ${isUnlocked ? '' : 'disabled'}" ${isUnlocked ? '' : 'disabled'}>
          ${isUnlocked ? '▶ START MISSION' : '🔒 CHAPTER LOCKED'}
        </button>
      `;

      if (isUnlocked) {
        const startBtn = card.querySelector('.btn-start-mission');
        if (startBtn) {
          startBtn.addEventListener('click', () => {
            this.closeChapterSelectModal();
            this.startMission(ch.id);
          });
        }
      }

      grid.appendChild(card);
    });
  }

  startMission(chapterId) {
    const ch = window.STORY_DATA.find(c => c.id === chapterId);
    if (!ch) return;

    this.currentChapterId = chapterId;
    this.activeMissionData = ch;

    const engine = window.CatnipMain || window.Game;
    const hangar = window.HangarUI;
    const chosenShipId = (hangar && hangar.selectedShipId) ? hangar.selectedShipId : ((engine && engine.selectedShipId) ? engine.selectedShipId : (ch.playerShipId || 1));

    if (engine && typeof engine.launchStoryMission === 'function') {
      engine.launchStoryMission({ ...ch, playerShipId: chosenShipId });
    } else {
      console.error('Game engine not ready for story mission launch:', engine);
    }
  }

  completeMission(chapterId) {
    if (!this.progress.completedChapters.includes(chapterId)) {
      this.progress.completedChapters.push(chapterId);
    }
    this.progress.stars[chapterId] = 3;

    if (chapterId >= this.progress.unlockedChapter && chapterId < 8) {
      this.progress.unlockedChapter = chapterId + 1;
    }

    this.saveProgress();
  }

  showBriefingOverlay(briefing, onContinue) {
    if (!briefing) {
      if (onContinue) onContinue();
      return;
    }

    const overlay = document.getElementById('story-dialogue-overlay');
    const speakerEl = document.getElementById('dialogue-speaker');
    const avatarEl = document.getElementById('dialogue-avatar');
    const textEl = document.getElementById('dialogue-text');
    const nextBtn = document.getElementById('btn-dialogue-next');

    if (!overlay || !speakerEl || !avatarEl || !textEl || !nextBtn) {
      if (onContinue) onContinue();
      return;
    }

    speakerEl.innerText = briefing.speaker || 'Captain Catnip';
    avatarEl.innerText = briefing.avatar || '🐱';
    textEl.innerText = briefing.text || '';

    overlay.classList.remove('hidden');

    let dismissed = false;
    const dismissOverlay = () => {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.add('hidden');
      if (onContinue) onContinue();
    };

    nextBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dismissOverlay();
    };

    overlay.onclick = (e) => {
      e.preventDefault();
      dismissOverlay();
    };
  }

  showMissionAccomplishedModal(ch) {
    if (!ch) return;

    // Ensure dialogue overlay is hidden
    const dialogueOverlay = document.getElementById('story-dialogue-overlay');
    if (dialogueOverlay) dialogueOverlay.classList.add('hidden');

    const modal = document.getElementById('story-accomplished-modal');
    const titleEl = document.getElementById('story-accomplished-title');
    const subtitleEl = document.getElementById('story-accomplished-subtitle');
    const replayBtn = document.getElementById('btn-story-replay-chapter');
    const selectBtn = document.getElementById('btn-story-select-chapter');
    const nextBtn = document.getElementById('btn-story-next-chapter');

    if (!modal) return;

    if (titleEl) titleEl.innerText = ch.title || 'CHAPTER CLEARED!';
    if (subtitleEl) subtitleEl.innerText = `${ch.subtitle}\nMission Accomplished! 3 Stars Earned ⭐⭐⭐`;

    if (replayBtn) {
      replayBtn.onclick = (e) => {
        e.preventDefault();
        modal.classList.add('hidden');
        this.startMission(ch.id);
      };
    }

    if (selectBtn) {
      selectBtn.onclick = (e) => {
        e.preventDefault();
        modal.classList.add('hidden');
        document.getElementById('battle-screen').classList.remove('active');
        document.getElementById('hangar-screen').classList.add('active');
        this.openChapterSelectModal();
      };
    }

    if (nextBtn) {
      nextBtn.innerText = ch.id < 8 ? `▶ NEXT CHAPTER (Ch ${ch.id + 1})` : '🏆 CAMPAIGN COMPLETED!';
      nextBtn.onclick = (e) => {
        e.preventDefault();
        modal.classList.add('hidden');
        if (ch.id < 8) {
          this.startMission(ch.id + 1);
        } else {
          this.openChapterSelectModal();
        }
      };
    }

    modal.classList.remove('hidden');
  }
}

window.StoryMode = new StoryModeClass();
