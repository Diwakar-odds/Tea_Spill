/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Spill Creation Module
   College picker, categories, aliases,
   spill templates, form validation.
   ═══════════════════════════════════════════════════ */

'use strict';

const SPILL_TEMPLATES = [
  {
    id: 'confession',
    label: '💌 Confession',
    title: 'I need to confess something...',
    body: 'I\'ve been holding this in for a while and I need to get it off my chest. Here goes...\n\n[Your confession here]\n\nPlease don\'t judge me. 🥺',
    category: 'confession'
  },
  {
    id: 'placement',
    label: '💼 Placement Story',
    title: 'My placement interview experience at [Company Name]',
    body: 'Company: [Name]\nRole: [Position]\nPackage: [CTC]\n\nRound 1 (Online Test):\n[Describe your experience]\n\nRound 2 (Technical):\n[What questions were asked?]\n\nRound 3 (HR):\n[How did it go?]\n\nResult: [Selected/Rejected]\n\nTips for future candidates:\n1. [Tip 1]\n2. [Tip 2]\n3. [Tip 3]',
    category: 'placement'
  },
  {
    id: 'professor',
    label: '👨‍🏫 Professor Legend',
    title: 'The legendary thing [Professor Name] did today',
    body: 'Subject: [Subject Name]\nProfessor: [Prof Name / Nickname]\n\nSo today in class, something absolutely legendary happened...\n\n[Describe what happened]\n\nThis professor is honestly built different. If you haven\'t taken their class, you\'re missing out. 🫡',
    category: 'professor'
  },
  {
    id: 'hostel',
    label: '🏠 Hostel Story',
    title: 'Hostel [Block/Name] will never be the same after this',
    body: 'Hostel: [Block / Name]\nTime: [When did this happen?]\n\nOkay so this is what went down...\n\n[Tell the story]\n\nThe warden still doesn\'t know about this. Or maybe they do. Who knows. 😂',
    category: 'hostel'
  },
  {
    id: 'rant',
    label: '😤 Rant',
    title: 'I can\'t take this anymore — [topic]',
    body: 'I need to vent about [topic]. I\'ve been dealing with this for [duration] and I\'ve reached my breaking point.\n\nHere\'s the issue:\n[Describe the problem]\n\nWhat makes it worse:\n[Additional frustrations]\n\nAll I\'m asking for is:\n[What you want to change]\n\nAm I being unreasonable? Please tell me I\'m not the only one feeling this way. 😤',
    category: 'rant'
  },
  {
    id: 'crush',
    label: '💘 Crush Story',
    title: 'Dear [Initial], you probably don\'t know this...',
    body: 'To the person in [Department/Section] who [description]...\n\nI\'ve been wanting to say this for a while:\n\n[Your message]\n\nI know this is anonymous but if you\'re reading this and you think it might be about you... it probably is. ❤️',
    category: 'crush'
  },
  {
    id: 'review',
    label: '⭐ College Review',
    title: 'Honest review of [College Name] after [X] years',
    body: 'College: [Name]\nCourse: [Your course]\nYear: [Current year / Alumni]\n\n📚 Academics: [X]/10\n[Your thoughts]\n\n🏠 Hostel Life: [X]/10\n[Your thoughts]\n\n🍛 Food: [X]/10\n[Your thoughts]\n\n💼 Placements: [X]/10\n[Your thoughts]\n\n🎉 Campus Life: [X]/10\n[Your thoughts]\n\nOverall: [X]/10\n\nWould I choose this college again? [Yes/No and why]',
    category: 'wholesome'
  },
  {
    id: 'exam',
    label: '📝 Exam Tea',
    title: 'What just happened in the [Subject] exam...',
    body: 'Subject: [Name]\nType: [Mid-sem / End-sem / Quiz]\nDifficulty: [Easy / Medium / Hard / Impossible]\n\n[Describe what happened]\n\nExpected marks: [Your estimate]\nActual effort put in: [Honest assessment]\n\nNote to future batches: [Any advice?]\n\n😭 or 🎉 — you decide.',
    category: 'exam'
  }
];

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
    select.innerHTML = '<option value="">Select your college...</option>';

    // Group by state for better UX
    const grouped = {};
    colleges.forEach(c => {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c);
    });

    Object.keys(grouped).sort().forEach(state => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = state;
      grouped[state].sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.icon} ${c.name} — ${c.city}`;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
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
    document.getElementById('spill-cancel').addEventListener('click', () => this.close());

    // Close modal
    document.getElementById('spill-modal-close').addEventListener('click', () => this.close());

    // Close on overlay click
    document.getElementById('spill-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('spill-modal')) {
        this.close();
      }
    });
  },

  open(templateId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('post a spill')) {
      return;
    }

    this.currentAlias = Utils.randomAlias();
    this._updateAliasPreview();
    this._populateColleges();
    this.selectedCategory = null;
    document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('spill-form').reset();
    document.getElementById('title-chars').textContent = '0';
    document.getElementById('add-college-fields').classList.add('hidden');

    // Apply template if provided
    if (templateId) {
      const tmpl = SPILL_TEMPLATES.find(t => t.id === templateId);
      if (tmpl) {
        document.getElementById('spill-title').value = tmpl.title;
        document.getElementById('spill-body').value = tmpl.body;
        document.getElementById('title-chars').textContent = tmpl.title.length;
        this.selectedCategory = tmpl.category;
        document.querySelectorAll('#category-chips .chip').forEach(c => {
          c.classList.toggle('selected', c.dataset.category === tmpl.category);
        });
      }
    }

    // Inject templates bar at top of form if not there
    this._injectTemplatesBar();

    document.getElementById('spill-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  _injectTemplatesBar() {
    const existing = document.getElementById('templates-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.id = 'templates-bar';
    bar.style.cssText = 'margin-bottom:var(--space-lg);overflow-x:auto;white-space:nowrap;padding-bottom:var(--space-sm)';
    bar.innerHTML = `
      <label style="display:block;font-size:var(--font-size-sm);font-weight:600;color:var(--text-secondary);margin-bottom:var(--space-sm)">📋 Templates</label>
      <div style="display:flex;gap:var(--space-sm);overflow-x:auto;padding-bottom:var(--space-sm)">
        ${SPILL_TEMPLATES.map(t => `
          <button type="button" class="chip" onclick="Spill.applyTemplate('${t.id}')" style="flex-shrink:0">${t.label}</button>
        `).join('')}
      </div>
    `;

    const form = document.getElementById('spill-form');
    form.insertBefore(bar, form.firstChild);
  },

  applyTemplate(templateId) {
    const tmpl = SPILL_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;

    document.getElementById('spill-title').value = tmpl.title;
    document.getElementById('spill-body').value = tmpl.body;
    document.getElementById('title-chars').textContent = tmpl.title.length;
    this.selectedCategory = tmpl.category;
    document.querySelectorAll('#category-chips .chip').forEach(c => {
      c.classList.toggle('selected', c.dataset.category === tmpl.category);
    });

    Utils.toast(`📋 Template applied: ${tmpl.label}`, 'success');
  },

  close() {
    document.getElementById('spill-modal').classList.add('hidden');
    document.body.style.overflow = '';
  },

  async _submit() {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('post a spill')) {
      return;
    }

    const title = document.getElementById('spill-title').value.trim();
    const body = document.getElementById('spill-body').value.trim();
    let collegeId = document.getElementById('spill-college').value;
    const department = document.getElementById('spill-department').value;
    const section = document.getElementById('spill-section').value.trim();
    const selfDestruct = document.getElementById('spill-timer').checked;

    // Validation
    if (!title) {
      Utils.toast('✏️ Please add a title', 'error');
      document.getElementById('spill-title').focus();
      return;
    }
    if (title.length < 10) {
      Utils.toast('✏️ Title too short (min 10 characters)', 'error');
      return;
    }
    if (!body) {
      Utils.toast('📝 Please write the tea body', 'error');
      document.getElementById('spill-body').focus();
      return;
    }
    if (body.length < 20) {
      Utils.toast('📝 Body too short (min 20 characters)', 'error');
      return;
    }
    if (!this.selectedCategory) {
      Utils.toast('🏷️ Please select a category', 'error');
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
        Utils.toast('🏫 Select a college or fill in the new college form', 'error');
        return;
      }
    }

    const user = Storage.getUser();
    const spill = {
      id: Utils.uid(),
      userId: (window.App && App.session && App.session.user) ? App.session.user.id : null,
      title,
      body,
      collegeId,
      department,
      section,
      category: this.selectedCategory,
      alias: user.alias,
      aliasEmoji: user.aliasEmoji,
      reactions: { sip: 0, fire: 0, shook: 0, dead: 0, cap: 0 },
      comments: [],
      timeAgo: 'Just now',
      selfDestruct,
      createdAt: Date.now()
    };

    const addResult = await Storage.addSpill(spill);
    if (!addResult || !addResult.ok) {
      const msg = String(addResult && addResult.error ? addResult.error : 'Could not post right now.');
      if (/row-level security|permission|violates/i.test(msg)) {
        Utils.toast('Post blocked by server policy. Verify your account status first.', 'error');
      } else {
        Utils.toast('Could not publish this spill: ' + msg, 'error');
      }
      return;
    }

    // Update user stats
    user.mySpillIds = user.mySpillIds || [];
    user.mySpillIds.push(spill.id);
    user.spills += 1;
    user.teaPoints += 10;
    if (user.spills === 1 && !user.badges.includes('first_spill')) {
      user.badges.push('first_spill');
    }
    Storage.saveUser(user);

    this.close();
    Utils.toast('☕ Tea has been spilled!', 'success');
    App._updateSidebarProfile();

    // Refresh feed
    if (document.getElementById('page-feed').classList.contains('active')) {
      Feed.render();
    }
  }
};
