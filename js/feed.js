/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Feed Module
   ═══════════════════════════════════════════════════ */

const Feed = {
  currentSort: 'trending',
  currentCategory: 'all',

  render() {
    const page = document.getElementById('page-feed');
    const spills = Storage.getSpills();
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
        <button class="feed-tab active" data-sort="trending">🔥 Trending</button>
        <button class="feed-tab" data-sort="hot">🌶️ Hot</button>
        <button class="feed-tab" data-sort="new">✨ New</button>
        <button class="feed-tab" data-sort="top">🏆 Top</button>
      </div>

      <!-- Category Filter -->
      <div class="feed-tabs" id="feed-category-filter">
        <button class="feed-tab active" data-category="all">All</button>
        ${CATEGORIES.map(c => `
          <button class="feed-tab" data-category="${c.id}">${c.emoji} ${c.name}</button>
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

  _spillCard(spill) {
    const college = Utils.getCollege(spill.collegeId);
    const category = Utils.getCategory(spill.category);
    const temp = Utils.teaTemperature(spill.reactions);
    const user = Storage.getUser();
    const myReactions = user.myReactions?.[spill.id] || [];

    return `
      <article class="spill-card" data-spill-id="${spill.id}">
        <div class="spill-card-header">
          <div class="spill-meta">
            <div class="spill-avatar">${spill.aliasEmoji}</div>
            <div>
              <div class="spill-author">${Utils.escapeHtml(spill.alias)}</div>
              <div class="spill-time">${spill.timeAgo}${spill.selfDestruct ? ' · ⏱️ Self-destruct' : ''}</div>
            </div>
          </div>
          <div class="spill-temp ${temp.class}">${temp.label}</div>
        </div>

        ${college ? `<span class="spill-college-tag">🏫 ${Utils.escapeHtml(college.name)}</span>` : ''}
        ${category ? `<span class="spill-card-category">${category.emoji} ${category.name}</span>` : ''}

        <h3 class="spill-card-title">${Utils.escapeHtml(spill.title)}</h3>
        <p class="spill-card-body">${Utils.escapeHtml(spill.body)}</p>

        <div class="spill-card-footer">
          ${REACTIONS.map(r => `
            <button class="reaction-btn ${myReactions.includes(r.id) ? 'active' : ''}"
                    data-reaction="${r.id}" data-spill="${spill.id}"
                    onclick="event.stopPropagation(); Feed.react('${spill.id}','${r.id}')">
              <span>${r.emoji}</span>
              <span>${Utils.formatNumber(spill.reactions[r.id] || 0)}</span>
            </button>
          `).join('')}
          <button class="reaction-btn" onclick="event.stopPropagation(); App.navigate('reader', '${spill.id}')">
            <span>💬</span>
            <span>${spill.comments ? spill.comments.length : 0}</span>
          </button>
        </div>
      </article>
    `;
  },

  react(spillId, reactionId) {
    const user = Storage.getUser();
    if (!user.myReactions) user.myReactions = {};
    if (!user.myReactions[spillId]) user.myReactions[spillId] = [];

    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) return;

    const idx = user.myReactions[spillId].indexOf(reactionId);
    if (idx > -1) {
      // Un-react
      user.myReactions[spillId].splice(idx, 1);
      spill.reactions[reactionId] = Math.max(0, (spill.reactions[reactionId] || 1) - 1);
    } else {
      // React
      user.myReactions[spillId].push(reactionId);
      spill.reactions[reactionId] = (spill.reactions[reactionId] || 0) + 1;
      user.teaPoints += 1;
      user.reactions += 1;
    }

    Storage.saveUser(user);
    Storage.saveSpills(spills);
    this._renderSpills();
  },

  _bindTabs() {
    // Sort tabs
    document.getElementById('feed-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.feed-tab');
      if (!tab) return;
      document.querySelectorAll('#feed-tabs .feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.currentSort = tab.dataset.sort;
      this._renderSpills();
    });

    // Category filter
    document.getElementById('feed-category-filter').addEventListener('click', (e) => {
      const tab = e.target.closest('.feed-tab');
      if (!tab) return;
      document.querySelectorAll('#feed-category-filter .feed-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      this.currentCategory = tab.dataset.category;
      this._renderSpills();
    });
  },

  _bindCards() {
    document.querySelectorAll('.spill-card').forEach(card => {
      card.addEventListener('click', () => {
        App.navigate('reader', card.dataset.spillId);
      });
    });
  }
};
