/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Feed Module
   Home feed with sort, category filter,
   daily challenge, and spill cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Feed = {
  currentSort: 'trending',
  currentCategory: 'all',
  activeReactionPickerSpillId: null,
  activePostMenuSpillId: null,
  _longPressTimer: null,
  _longPressTriggered: false,
  _longPressSpillId: null,
  _globalDismissBound: false,

  render() {
    const page = document.getElementById('page-feed');
    const challenge = Utils.dailyChallenge();

    page.innerHTML = `
      <!-- Daily Challenge -->
      <div class="daily-challenge">
        <div class="daily-challenge-label">☕ Daily Tea Challenge</div>
        <div class="daily-challenge-text">${Utils.escapeHtml(challenge)}</div>
        <button class="daily-challenge-btn" data-action="new-spill">Accept Challenge →</button>
      </div>

      <div class="feed-header">
        <h1 class="feed-title">Tea Feed</h1>
        <p class="feed-subtitle">The freshest spills from campuses across India</p>
      </div>

      <!-- Sort Tabs -->
      <div class="feed-tabs" id="feed-tabs">
        <button class="feed-tab ${this.currentSort === 'trending' ? 'active' : ''}" data-sort="trending">🔥 Trending</button>
        <button class="feed-tab ${this.currentSort === 'hot' ? 'active' : ''}" data-sort="hot">🌶️ Hot</button>
        <button class="feed-tab ${this.currentSort === 'new' ? 'active' : ''}" data-sort="new">✨ New</button>
        <button class="feed-tab ${this.currentSort === 'top' ? 'active' : ''}" data-sort="top">🏆 Top</button>
      </div>

      <!-- Category Filter -->
      <div class="feed-tabs" id="feed-category-filter">
        <button class="feed-tab ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">All</button>
        ${CATEGORIES.map(c => `
          <button class="feed-tab ${this.currentCategory === c.id ? 'active' : ''}" data-category="${c.id}">${c.emoji} ${c.name}</button>
        `).join('')}
      </div>

      <!-- Feed List -->
      <div class="feed-list" id="feed-list"></div>
    `;

    this._bindTabs();
    this._renderSpills();
  },

  _renderSpills() {
    const list = document.getElementById('feed-list');
    if (!list) return;

    let spills = Storage.getSpills();

    // Apply filters
    spills = Utils.filterByCategory(spills, this.currentCategory);
    spills = Utils.sortSpills(spills, this.currentSort);

    if (spills.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">☕</div>
          <div class="empty-state-title">No tea here yet</div>
          <div class="empty-state-text">Be the first to spill some tea in this category!</div>
        </div>
      `;
      return;
    }

    list.innerHTML = spills.map(spill => this._spillCard(spill)).join('');
    this._bindCards();
  },

  /**
   * Render a spill card. Used by Feed and other modules.
   * @param {Object} spill
   * @param {Object} options
   * @returns {string} HTML
   */
  _spillCard(spill, options = {}) {
    const college = Utils.getCollege(spill.collegeId);
    const category = Utils.getCategory(spill.category);
    const temp = Utils.teaTemperature(spill.reactions);
    const user = Storage.getUser();
    const currentReactionId = this._getMyReactionId(spill.id, user);
    const currentReaction = this._getReactionMeta(currentReactionId);
    const isSaved = Array.isArray(user.savedSpills) && user.savedSpills.includes(spill.id);
    const isReported = Array.isArray(user.reportedSpills) && user.reportedSpills.includes(spill.id);
    const isPickerOpen = this.activeReactionPickerSpillId === spill.id;
    const isMenuOpen = this.activePostMenuSpillId === spill.id;
    const displayAlias = spill.alias || 'Tea User';
    const displayAvatar = spill.aliasEmoji || '👤';
    const mediaUrls = Array.isArray(spill.mediaUrls)
      ? spill.mediaUrls.filter(u => typeof u === 'string' && (/^https?:\/\//i.test(u) || /^blob:/i.test(u)))
      : [];
    const coverMedia = mediaUrls[0] || null;

    return `
      <article class="spill-card" data-spill-id="${spill.id}">
        <div class="spill-card-header">
          <div class="spill-meta">
            <div class="spill-avatar">${displayAvatar}</div>
            <div>
              <div class="spill-author">${Utils.escapeHtml(displayAlias)}</div>
              <div class="spill-time">${spill.timeAgo || 'Just now'}${spill.selfDestruct ? ' · ⏱️' : ''}</div>
            </div>
          </div>
          <div class="spill-temp ${temp.class}">${temp.label}</div>
        </div>

        ${(() => {
          const cName = college ? college.name : (spill.collegeName || 'Unknown College');
          return `<span class="spill-college-tag">🏫 ${Utils.escapeHtml(cName)}</span>`;
        })()}
        ${category ? `<span class="spill-card-category">${category.emoji} ${category.name}</span>` : ''}

        <h3 class="spill-card-title">${Utils.escapeHtml(spill.title)}</h3>
        <p class="spill-card-body">${Utils.escapeHtml(spill.body)}</p>
        ${coverMedia ? `
          <div class="spill-media-preview">
            <img src="${Utils.escapeHtml(coverMedia)}" alt="Spill image" loading="lazy" />
            ${mediaUrls.length > 1 ? `<span class="spill-media-count">+${mediaUrls.length - 1}</span>` : ''}
          </div>
        ` : ''}

        <div class="spill-card-footer" onclick="event.stopPropagation();">
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
                    data-action="react-primary"
                    onmousedown="Feed.onReactionPressStart(event, '${spill.id}')"
                    onmouseup="Feed.onReactionPressEnd()"
                    onmouseleave="Feed.onReactionPressCancel()"
                    ontouchstart="Feed.onReactionPressStart(event, '${spill.id}')"
                    ontouchend="Feed.onReactionPressEnd()"
                    ontouchcancel="Feed.onReactionPressCancel()"
                    onclick="Feed.handleReactionTap(event, '${spill.id}')">
              <span class="post-action-icon">${currentReaction ? currentReaction.emoji : '🤍'}</span>
              <span>${currentReaction ? currentReaction.label : 'React'}</span>
            </button>

            <button class="post-action-btn" onclick="event.stopPropagation(); App.navigate('reader', '${spill.id}')">
              <span class="post-action-icon">💬</span>
              <span>Comment</span>
            </button>

            <button class="post-action-btn" onclick="Feed.shareSpill(event, '${spill.id}')">
              <span class="post-action-icon">📤</span>
              <span>Share</span>
            </button>

            <button class="post-action-btn post-action-more-btn ${isMenuOpen ? 'active' : ''}"
                    data-action="open-more-menu"
                    onclick="Feed.togglePostMenu(event, '${spill.id}')"
                    aria-label="More actions">
              <span class="post-action-icon">⋯</span>
            </button>
          </div>

          <div class="reaction-picker ${isPickerOpen ? 'open' : ''}" onclick="event.stopPropagation();">
            ${REACTIONS.map(r => `
              <button class="reaction-picker-option ${currentReactionId === r.id ? 'active' : ''}"
                      title="${Utils.escapeHtml(r.label)}"
                      onclick="Feed.selectReaction(event, '${spill.id}', '${r.id}')">
                <span>${r.emoji}</span>
                <small>${Utils.escapeHtml(r.label)}</small>
              </button>
            `).join('')}
          </div>

          <div class="post-more-menu ${isMenuOpen ? 'open' : ''}" onclick="event.stopPropagation();">
            <button onclick="event.stopPropagation(); App.navigate('reader', '${spill.id}')">Open Post</button>
            <button onclick="Feed.toggleSaveSpill(event, '${spill.id}')">${isSaved ? 'Remove Bookmark' : 'Bookmark Post'}</button>
            <button onclick="Feed.shareSpill(event, '${spill.id}')">Share Post</button>
            <button onclick="Feed.reportSpill(event, '${spill.id}')" ${isReported ? 'disabled' : ''}>${isReported ? 'Reported' : 'Report Post'}</button>
          </div>

          ${options.isOwner ? `
            <div class="post-owner-actions">
              <button class="reaction-btn" style="color:var(--rose); background:rgba(244,63,94,0.1);" title="Delete" onclick="event.stopPropagation(); Profile.deleteSpill('${spill.id}')">
                🗑️ Delete
              </button>
            </div>
          ` : ''}

          ${(typeof window.App !== 'undefined' && App.isAdmin && !options.isOwner) ? `
            <div class="post-owner-actions">
              <button class="reaction-btn" style="color:var(--rose); background:rgba(244,63,94,0.1);" title="Nuke Spill" onclick="event.stopPropagation(); Admin.nukeSpill('${spill.id}')">
                🗑️ Nuke
              </button>
              ${spill.userId ? `
              <button class="reaction-btn" style="color:#ef4444; background:rgba(239,68,68,0.1);" title="Ban Author" onclick="event.stopPropagation(); Admin.banUser('${spill.userId}')">
                🚫 Ban
              </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  },

  _getReactionMeta(reactionId) {
    if (!reactionId) return null;
    return REACTIONS.find(r => r.id === reactionId) || null;
  },

  _getMyReactionId(spillId, user = null) {
    const sourceUser = user || Storage.getUser();
    const raw = sourceUser && sourceUser.myReactions ? sourceUser.myReactions[spillId] : null;

    if (Array.isArray(raw)) {
      return raw.find(id => typeof id === 'string' && id.trim()) || null;
    }

    if (typeof raw === 'string' && raw.trim()) {
      return raw;
    }

    return null;
  },

  _setMyReactionId(user, spillId, reactionId) {
    if (!user.myReactions || typeof user.myReactions !== 'object') {
      user.myReactions = {};
    }

    if (reactionId) {
      user.myReactions[spillId] = reactionId;
    } else {
      delete user.myReactions[spillId];
    }
  },

  /**
   * Toggle a reaction on a spill.
   * @param {string} spillId
   * @param {string} reactionId
   */
  async react(spillId, requestedReactionId = null) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('react to spills')) {
      return;
    }

    const user = Storage.getUser();
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) return;
    if (!spill.reactions) spill.reactions = {};

    const isValidReaction = !requestedReactionId || REACTIONS.some(r => r.id === requestedReactionId);
    if (!isValidReaction) return;

    const currentReactionId = this._getMyReactionId(spillId, user);
    let nextReactionId = requestedReactionId;

    // Tap on current reaction means undo.
    if (nextReactionId && currentReactionId === nextReactionId) {
      nextReactionId = null;
    }

    if (!nextReactionId && !currentReactionId) {
      return;
    }

    let cloudReactions = null;
    if (window.API && API.isLive) {
      const reactionResult = await API.reactToSpill(spillId, nextReactionId, currentReactionId);
      if (!reactionResult.ok) {
        Utils.toast('Failed to record reaction. Please try again.', 'error');
        return;
      }
      cloudReactions = reactionResult.reactions;
    }

    this._setMyReactionId(user, spillId, nextReactionId);

    if (cloudReactions) spill.reactions = cloudReactions;
    else {
      if (currentReactionId) {
        spill.reactions[currentReactionId] = Math.max((spill.reactions[currentReactionId] || 0) - 1, 0);
      }
      if (nextReactionId) {
        spill.reactions[nextReactionId] = (spill.reactions[nextReactionId] || 0) + 1;
      }
    }

    if (!currentReactionId && nextReactionId) {
      user.teaPoints = (user.teaPoints || 0) + 1;
      user.reactions = (user.reactions || 0) + 1;
      Utils.toast('Reaction added.', 'success');
    } else if (currentReactionId && !nextReactionId) {
      user.teaPoints = Math.max((user.teaPoints || 0) - 1, 0);
      user.reactions = Math.max((user.reactions || 0) - 1, 0);
      Utils.toast('Reaction removed.', 'info');
    } else {
      Utils.toast('Reaction updated.', 'success');
    }

    Storage.saveUser(user);
    Storage.saveSpills(spills);

    // Re-render only on feed page to avoid flash on reader
    if (document.getElementById('page-feed').classList.contains('active')) {
      this._renderSpills();
    }
    if (typeof App !== 'undefined' && App._updateSidebarProfile) {
      App._updateSidebarProfile();
    }
  },

  onReactionPressStart(event, spillId) {
    if (event.type === 'mousedown' && event.button !== 0) return;
    if (event.type.startsWith('touch') && event.cancelable) event.preventDefault();

    this._longPressTriggered = false;
    this._longPressSpillId = spillId;
    clearTimeout(this._longPressTimer);

    this._longPressTimer = setTimeout(() => {
      this._longPressTriggered = true;
      this.activePostMenuSpillId = null;
      this.activeReactionPickerSpillId = spillId;
      if (document.getElementById('page-feed').classList.contains('active')) {
        this._renderSpills();
      }
    }, 420);
  },

  onReactionPressEnd() {
    clearTimeout(this._longPressTimer);
  },

  onReactionPressCancel() {
    clearTimeout(this._longPressTimer);
  },

  async handleReactionTap(event, spillId) {
    event.stopPropagation();

    if (this._longPressTriggered && this._longPressSpillId === spillId) {
      this._longPressTriggered = false;
      return;
    }

    this.activePostMenuSpillId = null;
    this.activeReactionPickerSpillId = null;

    const current = this._getMyReactionId(spillId);
    const next = current ? null : 'sip';
    await this.react(spillId, next);
  },

  async selectReaction(event, spillId, reactionId) {
    event.stopPropagation();

    this.activeReactionPickerSpillId = null;
    this.activePostMenuSpillId = null;
    await this.react(spillId, reactionId);
  },

  togglePostMenu(event, spillId) {
    event.stopPropagation();

    const isOpen = this.activePostMenuSpillId === spillId;
    this.activeReactionPickerSpillId = null;
    this.activePostMenuSpillId = isOpen ? null : spillId;

    if (document.getElementById('page-feed').classList.contains('active')) {
      this._renderSpills();
    }
  },

  async shareSpill(event, spillId) {
    event.stopPropagation();
    this.activePostMenuSpillId = null;

    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) return;

    const college = Utils.getCollege(spill.collegeId);
    const shareText = `☕ Tea Spill\n\n${spill.title}\n\n${spill.body.slice(0, 220)}${spill.body.length > 220 ? '...' : ''}\n\n— ${spill.alias || 'Tea User'}${college ? ' | ' + college.name : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: spill.title || 'Tea Spill',
          text: shareText
        });
        Utils.toast('Share sheet opened.', 'success');
        if (document.getElementById('page-feed').classList.contains('active')) {
          this._renderSpills();
        }
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') {
          if (document.getElementById('page-feed').classList.contains('active')) {
            this._renderSpills();
          }
          return;
        }
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        Utils.toast('Share text copied.', 'success');
      } catch {
        Utils.toast('Could not copy share text.', 'error');
      }
    } else {
      Utils.toast('Share is not supported on this device.', 'error');
    }

    if (document.getElementById('page-feed').classList.contains('active')) {
      this._renderSpills();
    }
  },

  toggleSaveSpill(event, spillId) {
    event.stopPropagation();

    const user = Storage.getUser();
    if (!Array.isArray(user.savedSpills)) user.savedSpills = [];

    const idx = user.savedSpills.indexOf(spillId);
    if (idx > -1) {
      user.savedSpills.splice(idx, 1);
      Utils.toast('Removed from saved.', 'info');
    } else {
      user.savedSpills.push(spillId);
      Utils.toast('Saved for later.', 'success');
    }

    this.activePostMenuSpillId = null;
    Storage.saveUser(user);

    if (document.getElementById('page-feed').classList.contains('active')) {
      this._renderSpills();
    }
  },

  reportSpill(event, spillId) {
    event.stopPropagation();
    this.activePostMenuSpillId = null;

    const user = Storage.getUser();
    if (Array.isArray(user.reportedSpills) && user.reportedSpills.includes(spillId)) {
      Utils.toast('You already reported this post.', 'info');
      if (document.getElementById('page-feed').classList.contains('active')) {
        this._renderSpills();
      }
      return;
    }

    App.navigate('reader', spillId);
    setTimeout(() => {
      if (typeof Reader !== 'undefined' && Reader.openReport) {
        Reader.openReport();
      }
    }, 120);
  },

  _bindTabs() {
    document.getElementById('feed-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.feed-tab');
      if (!tab || !tab.dataset.sort) return;
      document.querySelectorAll('#feed-tabs .feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.currentSort = tab.dataset.sort;
      this._renderSpills();
    });

    document.getElementById('feed-category-filter').addEventListener('click', (e) => {
      const tab = e.target.closest('.feed-tab');
      if (!tab || tab.dataset.category === undefined) return;
      document.querySelectorAll('#feed-category-filter .feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.currentCategory = tab.dataset.category;
      this._renderSpills();
    });
  },

  _bindCards() {
    document.querySelectorAll('#feed-list .spill-card').forEach(card => {
      card.addEventListener('click', () => {
        App.navigate('reader', card.dataset.spillId);
      });
    });

    if (!this._globalDismissBound) {
      document.addEventListener('click', (e) => {
        let shouldRender = false;

        const clickedPicker = e.target.closest('.reaction-picker');
        const clickedReactTrigger = e.target.closest('[data-action="react-primary"]');
        if (!clickedPicker && !clickedReactTrigger && this.activeReactionPickerSpillId) {
          this.activeReactionPickerSpillId = null;
          shouldRender = true;
        }

        const clickedMenu = e.target.closest('.post-more-menu');
        const clickedMenuTrigger = e.target.closest('[data-action="open-more-menu"]');
        if (!clickedMenu && !clickedMenuTrigger && this.activePostMenuSpillId) {
          this.activePostMenuSpillId = null;
          shouldRender = true;
        }

        if (shouldRender && document.getElementById('page-feed').classList.contains('active')) {
          this._renderSpills();
        }
      });

      this._globalDismissBound = true;
    }
  }
};
