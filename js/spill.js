/* ═══════════════════════════════════════════════════
  TEA SPILL ☕ — Spill Creation Module
  Streamlined composer with category, content,
  optional image upload, and profile auto-tagging.
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
  selectedCategory: null,
  _selectedMediaFiles: [],
  _previewObjectUrls: [],
  _isSubmitting: false,

  init() {
    this._populateCategories();
    this._bindEvents();
  },

  _populateCategories() {
    const container = document.getElementById('category-chips');
    if (!container) return;
    container.innerHTML = CATEGORIES.map(c => `
      <div class="chip" data-category="${c.id}">${c.emoji} ${c.name}</div>
    `).join('');
  },

  _bindEvents() {
    // Category chips
    const chips = document.getElementById('category-chips');
    if (chips) {
      chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        this.selectedCategory = chip.dataset.category;
      });
    }

    // Title char count
    const titleInput = document.getElementById('spill-title');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        const count = document.getElementById('title-chars');
        if (count) count.textContent = e.target.value.length;
      });
    }

    const imageInput = document.getElementById('spill-image');
    if (imageInput) {
      imageInput.addEventListener('change', () => this._handleImageSelection(imageInput.files));
    }

    // Form submit
    const form = document.getElementById('spill-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._submit();
      });
    }

    // Cancel
    const cancelBtn = document.getElementById('spill-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());

    // Close modal
    const closeBtn = document.getElementById('spill-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Close on overlay click
    const modal = document.getElementById('spill-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }
  },

  open(templateId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('post a spill')) {
      return;
    }

    this.selectedCategory = null;
    this._selectedMediaFiles = [];
    document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('spill-form').reset();
    document.getElementById('title-chars').textContent = '0';
    this._clearImagePreview();

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

  _handleImageSelection(fileList) {
    const files = fileList ? Array.from(fileList).slice(0, 3) : [];
    if (!files.length) {
      this._selectedMediaFiles = [];
      this._clearImagePreview();
      return;
    }

    for (const file of files) {
      if (!file.type || !file.type.startsWith('image/')) {
        Utils.toast('Please choose image files only.', 'error');
        this._selectedMediaFiles = [];
        const input = document.getElementById('spill-image');
        if (input) input.value = '';
        this._clearImagePreview();
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Utils.toast(`Image too large (${file.name}). Max size is 5MB each.`, 'error');
        this._selectedMediaFiles = [];
        const input = document.getElementById('spill-image');
        if (input) input.value = '';
        this._clearImagePreview();
        return;
      }
    }

    this._selectedMediaFiles = files;
    this._renderImagePreview(files);
  },

  _renderImagePreview(files) {
    const box = document.getElementById('spill-image-preview');
    if (!box) return;

    if (this._previewObjectUrls.length) {
      this._previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      this._previewObjectUrls = [];
    }

    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        url,
        name: file.name,
        sizeKb: Math.round(file.size / 1024)
      };
    });

    this._previewObjectUrls = previews.map((p) => p.url);

    box.innerHTML = `
      <div class="spill-image-preview-grid">
        ${previews
          .map(
            (p) => `
              <div class="spill-image-preview-item">
                <img src="${p.url}" alt="Spill image preview" />
                <div class="spill-image-meta">${Utils.escapeHtml(p.name)} · ${p.sizeKb}KB</div>
              </div>
            `
          )
          .join('')}
      </div>
    `;
    box.classList.remove('hidden');
  },

  _clearImagePreview() {
    const box = document.getElementById('spill-image-preview');
    if (!box) return;
    if (this._previewObjectUrls.length) {
      this._previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      this._previewObjectUrls = [];
    }
    box.classList.add('hidden');
    box.innerHTML = '';
  },

  _injectTemplatesBar() {
    const existing = document.getElementById('templates-bar');
    if (existing) existing.remove();

    const form = document.getElementById('spill-form');
    if (!form) return;

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
    if (this._isSubmitting) return;

    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('post a spill')) {
      return;
    }

    const title = document.getElementById('spill-title').value.trim();
    const body = document.getElementById('spill-body').value.trim();
    const selfDestruct = document.getElementById('spill-timer').checked;
    const imageFiles = this._selectedMediaFiles;
    const submitBtn = document.querySelector('#spill-form button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';

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

    this._isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
    }

    try {
      let mediaUrls = [];
      if (imageFiles && imageFiles.length) {
        if (window.API && API.isLive) {
          for (const imageFile of imageFiles) {
            const uploadedUrl = await API.uploadSpillImage(imageFile);
            if (!uploadedUrl) {
              Utils.toast('Image upload failed. Please try again.', 'error');
              return;
            }
            mediaUrls.push(uploadedUrl);
          }
        } else {
          // Local mode preview support.
          mediaUrls = imageFiles.map(file => URL.createObjectURL(file));
        }
      }

      const user = Storage.getUser();
      const spill = {
        id: Utils.uid(),
        userId: (window.App && App.session && App.session.user) ? App.session.user.id : null,
        title,
        body,
        collegeId: user.collegeId || null,
        collegeName: user.collegeName || null,
        department: user.department || null,
        section: user.section || null,
        category: this.selectedCategory,
        alias: user.alias || 'Tea User',
        aliasEmoji: '👤',
        mediaUrls,
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
        } else if (/college profile details/i.test(msg)) {
          Utils.toast('Complete your profile details before posting.', 'error');
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
    } finally {
      this._isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  }
};
