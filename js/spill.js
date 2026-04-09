/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Spill Creation Module
   ═══════════════════════════════════════════════════ */

const Spill = {
  currentAlias: null,
  selectedCategory: null,

  init() {
    this.currentAlias = Utils.randomAlias();
    this._populateColleges();
    this._populateStates();
    this._populateCategories();
    this._updateAliasPreview();
    this._bindEvents();
  },

  _populateColleges() {
    const select = document.getElementById('spill-college');
    const colleges = Storage.getColleges();
    // Keep the placeholder
    select.innerHTML = '<option value="">Select your college...</option>';
    colleges.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.icon} ${c.name} — ${c.city}`;
      select.appendChild(opt);
    });
  },

  _populateStates() {
    const select = document.getElementById('new-college-state');
    select.innerHTML = '<option value="">State...</option>';
    INDIAN_STATES.forEach(state => {
      const opt = document.createElement('option');
      opt.value = state;
      opt.textContent = state;
      select.appendChild(opt);
    });
  },

  _populateCategories() {
    const container = document.getElementById('category-chips');
    container.innerHTML = CATEGORIES.map(c => `
      <div class="chip" data-category="${c.id}">${c.emoji} ${c.name}</div>
    `).join('');
  },

  _updateAliasPreview() {
    document.getElementById('alias-preview').textContent =
      `${this.currentAlias.emoji} ${this.currentAlias.name}`;
  },

  _bindEvents() {
    // Toggle add college fields
    document.getElementById('btn-add-college').addEventListener('click', () => {
      document.getElementById('add-college-fields').classList.toggle('hidden');
    });

    // Reroll alias
    document.getElementById('btn-reroll-alias').addEventListener('click', () => {
      this.currentAlias = Utils.randomAlias();
      this._updateAliasPreview();
    });

    // Category chips
    document.getElementById('category-chips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      this.selectedCategory = chip.dataset.category;
    });

    // Title char count
    document.getElementById('spill-title').addEventListener('input', (e) => {
      document.getElementById('title-chars').textContent = e.target.value.length;
    });

    // Form submit
    document.getElementById('spill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._submit();
    });

    // Cancel
    document.getElementById('spill-cancel').addEventListener('click', () => {
      this.close();
    });

    // Close modal
    document.getElementById('spill-modal-close').addEventListener('click', () => {
      this.close();
    });

    // Close on overlay click
    document.getElementById('spill-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('spill-modal')) {
        this.close();
      }
    });
  },

  open() {
    this.currentAlias = Utils.randomAlias();
    this._updateAliasPreview();
    this._populateColleges();
    this.selectedCategory = null;
    document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('spill-form').reset();
    document.getElementById('title-chars').textContent = '0';
    document.getElementById('add-college-fields').classList.add('hidden');
    document.getElementById('spill-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('spill-modal').classList.add('hidden');
    document.body.style.overflow = '';
  },

  _submit() {
    const title = document.getElementById('spill-title').value.trim();
    const body = document.getElementById('spill-body').value.trim();
    let collegeId = document.getElementById('spill-college').value;
    const department = document.getElementById('spill-department').value;
    const section = document.getElementById('spill-section').value.trim();
    const selfDestruct = document.getElementById('spill-timer').checked;

    if (!title || !body) {
      Utils.toast('☕ Please fill in the title and body!', 'error');
      return;
    }

    if (!this.selectedCategory) {
      Utils.toast('🏷️ Please select a category!', 'error');
      return;
    }

    // Handle new college
    if (!collegeId) {
      const newName = document.getElementById('new-college-name').value.trim();
      const newCity = document.getElementById('new-college-city').value.trim();
      const newState = document.getElementById('new-college-state').value;

      if (newName && newCity && newState) {
        const newCollege = {
          id: 'custom_' + Utils.uid(),
          name: newName,
          city: newCity,
          state: newState,
          icon: '🏫',
          verified: false
        };
        Storage.addCollege(newCollege);
        collegeId = newCollege.id;
      } else {
        Utils.toast('🏫 Please select a college or fill in the new college details!', 'error');
        return;
      }
    }

    const spill = {
      id: Utils.uid(),
      title,
      body,
      collegeId,
      department,
      section,
      category: this.selectedCategory,
      alias: this.currentAlias.name,
      aliasEmoji: this.currentAlias.emoji,
      reactions: { sip: 0, fire: 0, shook: 0, dead: 0, cap: 0 },
      comments: [],
      timeAgo: 'Just now',
      selfDestruct,
      createdAt: Date.now()
    };

    Storage.addSpill(spill);

    // Update user stats
    const user = Storage.getUser();
    user.spills += 1;
    user.teaPoints += 10;
    if (user.spills === 1 && !user.badges.includes('first_spill')) {
      user.badges.push('first_spill');
    }
    Storage.saveUser(user);

    this.close();
    Utils.toast('☕ Tea has been spilled!', 'success');

    // Refresh feed
    if (document.getElementById('page-feed').classList.contains('active')) {
      Feed.render();
    }
  }
};
