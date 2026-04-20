/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Reader View
   Full article reader with reactions, comments,
   save/bookmark, report, and shareable cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Reader = {
  currentSpillId: null,
  reactionPickerOpen: false,
  moreMenuOpen: false,
  _longPressTimer: null,
  _longPressTriggered: false,
  _outsideDismissBound: false,

  async render(spillId) {
    if (this.currentSpillId !== spillId) {
      this.reactionPickerOpen = false;
      this.moreMenuOpen = false;
    }
    this.currentSpillId = spillId;
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) {
      App.navigate('feed');
      return;
    }

    let cloudComments = [];
    if (window.API && API.isLive) {
      cloudComments = await API.fetchComments(spillId);
    } else {
      cloudComments = spill.comments || [];
    }

    const college = Utils.getCollege(spill.collegeId);
    const category = Utils.getCategory(spill.category);
    const temp = Utils.teaTemperature(spill.reactions);
    const displayAlias = spill.alias || 'Tea User';
    const displayAvatar = spill.aliasEmoji || '👤';
    const mediaUrls = Array.isArray(spill.mediaUrls)
      ? spill.mediaUrls.filter(u => typeof u === 'string' && (/^https?:\/\//i.test(u) || /^blob:/i.test(u)))
      : [];
    const user = Storage.getUser();
    const currentReactionId = Feed._getMyReactionId(spill.id, user);
    const currentReaction = Feed._getReactionMeta(currentReactionId);
    const isSaved = Array.isArray(user.savedSpills) && user.savedSpills.includes(spill.id);
    const isReported = Array.isArray(user.reportedSpills) && user.reportedSpills.includes(spill.id);
    const canInteract = !(window.App && App.isReadOnly && App.isReadOnly());
    const page = document.getElementById('page-reader');

    page.innerHTML = `
      <div class="reader">
        <button class="reader-back" onclick="App.goBack()">← Back</button>

        <div class="reader-header">
          ${category ? `<span class="reader-category">${category.emoji} ${category.name}</span>` : ''}
          <h1 class="reader-title">${Utils.escapeHtml(spill.title)}</h1>

          <div class="reader-meta">
            <div class="reader-author">
              <div class="reader-author-avatar">${displayAvatar}</div>
              <div>
                <div class="reader-author-name">${Utils.escapeHtml(displayAlias)}</div>
                <div class="reader-author-detail">
                  ${spill.timeAgo} · ${college ? Utils.escapeHtml(college.name) : 'Unknown'}${spill.department ? ' · ' + spill.department : ''}${spill.section ? ' · ' + spill.section : ''}
                </div>
              </div>
            </div>
            <div class="spill-temp ${temp.class}">${temp.label} · ${Utils.formatNumber(temp.score)}</div>
          </div>
        </div>

        <div class="reader-divider"></div>

        <div class="reader-body">${Utils.textToParagraphs(spill.body)}</div>
        ${mediaUrls.length ? `
          <div class="reader-media-grid">
            ${mediaUrls.map(url => `<img class="reader-media-item" src="${Utils.escapeHtml(url)}" alt="Spill image" loading="lazy" />`).join('')}
          </div>
        ` : ''}

        <!-- Action Bar -->
        <div class="reader-actions">
          <div class="reaction-summary-strip">
            ${REACTIONS.map(r => `
              <span class="reaction-stat ${currentReactionId === r.id ? 'active' : ''}">
                <span>${r.emoji}</span>
                <span>${Utils.formatNumber(spill.reactions?.[r.id] || 0)}</span>
              </span>
            `).join('')}
          </div>

          <div class="post-action-row">
            <button class="post-action-btn reaction-main-btn ${currentReactionId ? 'active' : ''}"
                    data-action="reader-react-primary"
                    onmousedown="Reader.onReactionPressStart(event)"
                    onmouseup="Reader.onReactionPressEnd()"
                    onmouseleave="Reader.onReactionPressCancel()"
                    ontouchstart="Reader.onReactionPressStart(event)"
                    ontouchend="Reader.onReactionPressEnd()"
                    ontouchcancel="Reader.onReactionPressCancel()"
                    onclick="Reader.handleReactionTap(event)"
                    ${canInteract ? '' : 'disabled'}>
              <span class="post-action-icon">${currentReaction ? currentReaction.emoji : '🤍'}</span>
              <span>${currentReaction ? currentReaction.label : 'React'}</span>
            </button>

            <button class="post-action-btn" onclick="Reader.focusCommentInput()">
              <span class="post-action-icon">💬</span>
              <span>Comments (${cloudComments.length})</span>
            </button>

            <button class="post-action-btn" onclick="Reader.shareCard()">
              <span class="post-action-icon">📤</span>
              <span>Share</span>
            </button>

            <button class="post-action-btn post-action-more-btn ${this.moreMenuOpen ? 'active' : ''}"
                    data-action="reader-open-more"
                    onclick="Reader.toggleMoreMenu(event)"
                    aria-label="More actions">
              <span class="post-action-icon">⋯</span>
            </button>
          </div>

          <div class="reaction-picker ${this.reactionPickerOpen ? 'open' : ''}" onclick="event.stopPropagation();">
            ${REACTIONS.map(r => `
              <button class="reaction-picker-option ${currentReactionId === r.id ? 'active' : ''}"
                      title="${Utils.escapeHtml(r.label)}"
                      onclick="Reader.selectReaction(event, '${r.id}')"
                      ${canInteract ? '' : 'disabled'}>
                <span>${r.emoji}</span>
                <small>${Utils.escapeHtml(r.label)}</small>
              </button>
            `).join('')}
          </div>

          <div class="post-more-menu ${this.moreMenuOpen ? 'open' : ''}" onclick="event.stopPropagation();">
            <button onclick="Reader.toggleSaveFromMenu(event)">${isSaved ? 'Remove Bookmark' : 'Bookmark Post'}</button>
            <button onclick="Reader.shareCardFromMenu(event)">Share Post</button>
            <button onclick="Reader.openReportFromMenu(event)" ${isReported ? 'disabled' : ''}>${isReported ? 'Reported' : 'Report Post'}</button>
          </div>
        </div>

        <!-- Comments -->
        <div class="comments-section">
          <h2 class="comments-title">💬 Comments (${cloudComments.length})</h2>

          <div class="comment-input-wrapper">
            <textarea id="comment-input" placeholder="${canInteract ? 'Drop your take...' : 'Verification pending. Read-only mode is active.'}" rows="2" ${canInteract ? '' : 'disabled'}></textarea>
            <button class="btn btn-primary btn-sm" onclick="Reader.addComment()" style="align-self:flex-end" ${canInteract ? '' : 'disabled'}>Send</button>
          </div>

          <div id="comments-list">
            ${cloudComments.map(c => `
              <div class="comment">
                <div class="comment-avatar">${c.alias_emoji || c.emoji || '👻'}</div>
                <div class="comment-content">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="comment-author">${Utils.escapeHtml(c.alias)}</div>
                    ${(typeof window.App !== 'undefined' && App.isAdmin) ? `
                      <div style="display:flex; gap:var(--space-xs);">
                        <button class="btn-ghost" style="padding:0 var(--space-xs); font-size:12px; color:var(--rose);" onclick="Admin.nukeComment('${c.id}')" title="Delete Comment">🗑️</button>
                        ${c.auth_id ? `<button class="btn-ghost" style="padding:0 var(--space-xs); font-size:12px; color:#ef4444;" onclick="Admin.banUser('${c.auth_id}')" title="Ban Author">🚫</button>` : ''}
                      </div>
                    ` : ''}
                  </div>
                  <div class="comment-time">${c.time || 'A while ago'}</div>
                  <div class="comment-body">${Utils.escapeHtml(c.body)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Report Modal (hidden) -->
      <div id="report-modal" class="report-modal-overlay hidden" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000">
        <div style="background:var(--bg-modal);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:var(--space-2xl);max-width:400px;width:90%">
          <h3 style="margin-bottom:var(--space-lg)">🚩 Report this spill</h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)" id="report-options">
            <button class="btn btn-ghost" onclick="Reader.submitReport('bullying')">🎯 Bullying / Harassment</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('fake')">🧢 Fake / Misleading</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('personal_info')">🔒 Contains Personal Info</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('hate_speech')">🚫 Hate Speech</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('spam')">📧 Spam</button>
          </div>
          <button class="btn btn-ghost" onclick="Reader.closeReport()" style="margin-top:var(--space-lg);width:100%">Cancel</button>
        </div>
      </div>

      <!-- Share Card Preview (hidden) -->
      <div id="share-modal" class="share-modal-overlay hidden" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000;padding:var(--space-lg)">
        <div style="background:var(--bg-modal);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:var(--space-2xl);max-width:440px;width:100%">
          <h3 style="margin-bottom:var(--space-lg)">📤 Share this spill</h3>
          <div id="share-card-preview"></div>
          <div style="display:flex;gap:var(--space-md);margin-top:var(--space-lg)">
            <button class="btn btn-primary" onclick="Reader.copyShareText()" style="flex:1">📋 Copy Text</button>
            <button class="btn btn-ghost" onclick="Reader.closeShare()" style="flex:1">Close</button>
          </div>
        </div>
      </div>
    `;

    this._bindOutsideDismiss();
    this._syncActionUi();
  },

  async react(reactionId = null) {
    if (!this.currentSpillId) return;
    await Feed.react(this.currentSpillId, reactionId);
    this.reactionPickerOpen = false;
    this.moreMenuOpen = false;
    await this.render(this.currentSpillId);
  },

  onReactionPressStart(event) {
    if (event.type === 'mousedown' && event.button !== 0) return;
    if (event.type.startsWith('touch') && event.cancelable) event.preventDefault();

    this._longPressTriggered = false;
    clearTimeout(this._longPressTimer);

    this._longPressTimer = setTimeout(() => {
      this._longPressTriggered = true;
      this.reactionPickerOpen = true;
      this.moreMenuOpen = false;
      this._syncActionUi();
    }, 420);
  },

  onReactionPressEnd() {
    clearTimeout(this._longPressTimer);
  },

  onReactionPressCancel() {
    clearTimeout(this._longPressTimer);
  },

  async handleReactionTap(event) {
    event.stopPropagation();
    if (!this.currentSpillId) return;

    if (this._longPressTriggered) {
      this._longPressTriggered = false;
      return;
    }

    const current = Feed._getMyReactionId(this.currentSpillId, Storage.getUser());
    const next = current ? null : 'sip';
    await this.react(next);
  },

  async selectReaction(event, reactionId) {
    event.stopPropagation();
    await this.react(reactionId);
  },

  toggleMoreMenu(event) {
    event.stopPropagation();
    this.reactionPickerOpen = false;
    this.moreMenuOpen = !this.moreMenuOpen;
    this._syncActionUi();
  },

  toggleSaveFromMenu(event) {
    event.stopPropagation();
    this.moreMenuOpen = false;
    this.toggleSave();
  },

  shareCardFromMenu(event) {
    event.stopPropagation();
    this.moreMenuOpen = false;
    this._syncActionUi();
    this.shareCard();
  },

  openReportFromMenu(event) {
    event.stopPropagation();
    this.moreMenuOpen = false;
    this._syncActionUi();
    this.openReport();
  },

  focusCommentInput() {
    const input = document.getElementById('comment-input');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
  },

  _syncActionUi() {
    const pageReader = document.getElementById('page-reader');
    if (!pageReader || !pageReader.classList.contains('active')) return;

    const picker = pageReader.querySelector('.reaction-picker');
    if (picker) picker.classList.toggle('open', this.reactionPickerOpen);

    const menu = pageReader.querySelector('.post-more-menu');
    if (menu) menu.classList.toggle('open', this.moreMenuOpen);

    const menuTrigger = pageReader.querySelector('[data-action="reader-open-more"]');
    if (menuTrigger) menuTrigger.classList.toggle('active', this.moreMenuOpen);
  },

  _bindOutsideDismiss() {
    if (this._outsideDismissBound) return;

    document.addEventListener('click', (e) => {
      if (!this.currentSpillId) return;
      const pageReader = document.getElementById('page-reader');
      if (!pageReader || !pageReader.classList.contains('active')) return;

      let shouldRender = false;

      const inPicker = e.target.closest('.reaction-picker');
      const onPrimaryReaction = e.target.closest('[data-action="reader-react-primary"]');
      if (!inPicker && !onPrimaryReaction && this.reactionPickerOpen) {
        this.reactionPickerOpen = false;
        shouldRender = true;
      }

      const inMenu = e.target.closest('.post-more-menu');
      const onMenuTrigger = e.target.closest('[data-action="reader-open-more"]');
      if (!inMenu && !onMenuTrigger && this.moreMenuOpen) {
        this.moreMenuOpen = false;
        shouldRender = true;
      }

      if (shouldRender) {
        this._syncActionUi();
      }
    });

    this._outsideDismissBound = true;
  },

  async addComment() {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('comment on spills')) {
      return;
    }

    const input = document.getElementById('comment-input');
    const body = input.value.trim();
    if (!body) return;

    const user = Storage.getUser();
    input.value = '';

    if (window.API && API.isLive) {
      input.disabled = true;
      const success = await API.postComment(this.currentSpillId, body, user.alias, user.aliasEmoji);
      input.disabled = false;
      if (!success) { Utils.toast('Failed to post comment', 'error'); return; }
    } else {
      // Local Fallback
      const spills = Storage.getSpills();
      const spill = spills.find(s => s.id === this.currentSpillId);
      if (!spill.comments) spill.comments = [];
      spill.comments.push({ alias: user.alias, emoji: user.aliasEmoji, body, time: 'Just now' });
      Storage.saveSpills(spills);
    }

    user.teaPoints += 2;
    Storage.saveUser(user);

    Utils.toast('💬 Comment posted!', 'success');
    this.render(this.currentSpillId);
  },

  toggleSave() {
    const user = Storage.getUser();
    if (!Array.isArray(user.savedSpills)) user.savedSpills = [];
    const idx = user.savedSpills.indexOf(this.currentSpillId);
    if (idx > -1) {
      user.savedSpills.splice(idx, 1);
      Utils.toast('📌 Removed from saved', 'info');
    } else {
      user.savedSpills.push(this.currentSpillId);
      user.teaPoints += 1;
      Utils.toast('🔖 Saved!', 'success');
    }
    Storage.saveUser(user);
    this.render(this.currentSpillId);
  },

  /* ─── Report ─── */

  openReport() {
    this.moreMenuOpen = false;
    this.reactionPickerOpen = false;
    this._syncActionUi();
    document.getElementById('report-modal').classList.remove('hidden');
  },

  closeReport() {
    document.getElementById('report-modal').classList.add('hidden');
  },

  async submitReport(reason) {
    let submitted = false;
    if (window.API && API.isLive) {
      submitted = await API.submitReport(this.currentSpillId, reason);
    } else {
      Storage.addReport({
        spillId: this.currentSpillId,
        reason,
        timestamp: new Date().toISOString()
      });
      submitted = true;
    }

    if (!submitted) {
      Utils.toast('Could not submit report right now.', 'error');
      return;
    }

    const user = Storage.getUser();
    if (!user.reportedSpills) user.reportedSpills = [];
    if (!user.reportedSpills.includes(this.currentSpillId)) {
      user.reportedSpills.push(this.currentSpillId);
    }
    Storage.saveUser(user);

    this.closeReport();
    Utils.toast('🚩 Report submitted. Thank you for keeping Tea Spill safe.', 'success');
    this.render(this.currentSpillId);
  },

  /* ─── Share Card ─── */

  shareCard() {
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === this.currentSpillId);
    if (!spill) return;

    const category = Utils.getCategory(spill.category);
    const college = Utils.getCollege(spill.collegeId);
    const temp = Utils.teaTemperature(spill.reactions);

    document.getElementById('share-card-preview').innerHTML = `
      <div style="background:linear-gradient(135deg,#0a0a0f,#16161f);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-xl);font-family:var(--font-family)">
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
          <span style="font-size:1.2rem">☕</span>
          <span style="font-weight:800;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Tea Spill</span>
          <span style="margin-left:auto;font-size:var(--font-size-xs);color:var(--text-muted)">${temp.label}</span>
        </div>
        ${category ? `<span style="display:inline-block;font-size:var(--font-size-xs);color:var(--amber);background:var(--amber-soft);padding:2px 10px;border-radius:var(--radius-full);margin-bottom:var(--space-sm)">${category.emoji} ${category.name}</span>` : ''}
        <h4 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-sm);line-height:1.4">${Utils.escapeHtml(spill.title)}</h4>
        <p style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${Utils.escapeHtml(spill.body)}</p>
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-top:var(--space-md);font-size:var(--font-size-xs);color:var(--text-muted)">
          <span>${spill.aliasEmoji || '👤'} ${Utils.escapeHtml(spill.alias || 'Tea User')}</span>
          <span>·</span>
          <span>${college ? college.name : ''}</span>
          <span style="margin-left:auto">${Utils.formatNumber(Utils.totalReactions(spill.reactions))} reactions</span>
        </div>
      </div>
    `;

    document.getElementById('share-modal').classList.remove('hidden');
  },

  copyShareText() {
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === this.currentSpillId);
    if (!spill) return;

    const college = Utils.getCollege(spill.collegeId);
    const text = `☕ Tea Spill\n\n"${spill.title}"\n\n${spill.body.slice(0, 200)}...\n\n— ${spill.alias || 'Tea User'} | ${college ? college.name : 'Unknown'}\n\n🔥 ${Utils.formatNumber(Utils.totalReactions(spill.reactions))} reactions on Tea Spill`;

    navigator.clipboard.writeText(text).then(() => {
      Utils.toast('📋 Copied to clipboard!', 'success');
    }).catch(() => {
      Utils.toast('📋 Could not copy — try manually', 'error');
    });
  },

  closeShare() {
    document.getElementById('share-modal').classList.add('hidden');
  }
};
