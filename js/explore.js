/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Explore Module
   ═══════════════════════════════════════════════════ */

const Explore = {
  render() {
    const page = document.getElementById('page-explore');
    const spills = Storage.getSpills();

    // Trending spills (top 5 by reaction count)
    const trending = Utils.sortSpills(spills, 'hot').slice(0, 5);

    page.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">🔍 Explore</h1>
          <p class="section-subtitle">Discover tea by category, trending topics, and more</p>
        </div>
      </div>

      <div class="search-bar">
        <input type="search" id="explore-search" placeholder="Search for tea..." />
      </div>

      <!-- Categories -->
      <h2 class="section-title" style="font-size: var(--font-size-lg); margin-bottom: var(--space-lg);">📂 Categories</h2>
      <div class="explore-categories">
        ${CATEGORIES.map(c => `
          <div class="explore-cat-card" data-category="${c.id}">
            <span class="explore-cat-emoji">${c.emoji}</span>
            <div class="explore-cat-name">${c.name}</div>
            <div class="explore-cat-count">${Utils.categoryCount(spills, c.id)} spills</div>
          </div>
        `).join('')}
      </div>

      <!-- Trending -->
      <h2 class="section-title" style="font-size: var(--font-size-lg); margin-bottom: var(--space-lg);">📈 Trending Now</h2>
      <div class="trending-list">
        ${trending.map((s, i) => {
          const college = Utils.getCollege(s.collegeId);
          const cat = Utils.getCategory(s.category);
          return `
            <div class="trending-item" data-spill="${s.id}">
              <div class="trending-rank">${i + 1}</div>
              <div class="trending-info">
                <div class="trending-title">${Utils.escapeHtml(s.title)}</div>
                <div class="trending-meta">${cat ? cat.emoji + ' ' + cat.name : ''} · ${college ? college.name : ''} · ${Utils.formatNumber(Utils.totalReactions(s.reactions))} reactions</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this._bindEvents(spills);
  },

  _bindEvents(spills) {
    // Category cards → navigate to feed with filter
    document.querySelectorAll('.explore-cat-card').forEach(card => {
      card.addEventListener('click', () => {
        Feed.currentCategory = card.dataset.category;
        Feed.render();
        App.navigate('feed');
        // Activate the right category tab
        setTimeout(() => {
          document.querySelectorAll('#feed-category-filter .feed-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.category === card.dataset.category);
          });
        }, 50);
      });
    });

    // Trending items → open reader
    document.querySelectorAll('.trending-item').forEach(item => {
      item.addEventListener('click', () => {
        App.navigate('reader', item.dataset.spill);
      });
    });

    // Search
    const searchInput = document.getElementById('explore-search');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      if (q.length < 2) return;
      const results = spills.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q)
      );
      // Just navigate to feed with results for now
      if (results.length > 0) {
        App.navigate('reader', results[0].id);
      }
    });
  }
};
