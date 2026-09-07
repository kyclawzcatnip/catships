/**
 * Catnip Warships — In-Game Wiki & Field Manual
 */
class WikiUI {
  static init() {
    this.modal = document.getElementById('wiki-modal');
    this.btnClose = document.getElementById('btn-close-wiki');
    this.tabBtns = document.querySelectorAll('.wiki-tab-btn');
    this.tabContents = document.querySelectorAll('.wiki-tab-content');

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.hide());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.hide();
      });
    }

    this.tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-tab');
        this.switchTab(tabKey);
      });
    });
  }

  static show(tab = 'ships') {
    if (!this.modal) this.modal = document.getElementById('wiki-modal');
    if (this.modal) {
      this.modal.style.display = 'flex';
      this.modal.classList.remove('hidden');
      this.modal.classList.add('active');
      this.switchTab(tab);
    }
  }

  static hide() {
    if (!this.modal) this.modal = document.getElementById('wiki-modal');
    if (this.modal) {
      this.modal.style.display = 'none';
      this.modal.classList.remove('active');
      this.modal.classList.add('hidden');
    }
  }

  static switchTab(tabKey) {
    this.tabBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    });
    this.tabContents.forEach((content) => {
      content.classList.toggle('active', content.id === `wiki-tab-${tabKey}`);
    });
  }
}
window.WikiUI = WikiUI;
