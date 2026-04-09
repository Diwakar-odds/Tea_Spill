/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Explore Module
   Categories, trending, college leaderboard,
   weekly highlights.
   ═══════════════════════════════════════════════════ */

'use strict';

const Explore = {

  render() {
    const page = document.getElementById('page-explore');
    const spills = Storage.getSpills();
    const colleges = Storage.getColleges();

    // Trending spills (top 5)
    const trending = Utils.sortSpills(spills, 'hot').slice(0, 5);

    // Top colleges by spill + reaction count
    const collegeStats = {};
    spills.forEach(s => {
      if (!s.collegeId) return;
      if (!collegeStats[s.collegeId]) collegeStats[s.collegeId] = { count: 0, reactions: 0 };
      collegeStats[s.collegeId].count++;
      collegeStats[s.collegeId].reactions += Utils.totalReactions(s.reactions);
    });
    const topColleges = Object.entries(collegeStats)
      .map(([id, stats]) => ({ college: Utils.getCollege(id), ...stats }))
      .filter(c => c.college)
      .sort((a, b) => b.reactions - a.reactions)
      .slice(0, 5);

    // Weekly highlights
    const totalReactions = spills.reduce((sum, s) => sum + Utils.totalReactions(s.reactions), 0);
    const totalComments = spills.reduce((sum, s) => sum + (s.comments?.length || 0), 0);

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

      <!-- Weekly Stats Banner -->
      <div class="daily-challenge" style="margin-bottom:var(--space-2xl);background:linear-gradient(135deg,#7c3aed,#4c1d95)">
        <div class="daily-challenge-label">📊 Platform Stats</div>
        <div style="display:flex;gap:var(--space-2xl);flex-wrap:wrap;margin-top:var(--space-sm)">
          <div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:#fff">${spills.length}</div>
            <div style="font-size:var(--font-size-xs);opacity:0.7;color:#fff">Total Spills</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:#fff">${Utils.formatNumber(totalReactions)}</div>
            <div style="font-size:var(--font-size-xs);opacity:0.7;color:#fff">Reactions</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:#fff">${totalComments}</div>
            <div style="font-size:var(--font-size-xs);opacity:0.7;color:#fff">Comments</div>
          </div>
          <div>
            <div style="font-size:var(--font-size-xl);font-weight:800;color:#fff">${colleges.length}</div>
            <div style="font-size:var(--font-size-xs);opacity:0.7;color:#fff">Colleges</div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">📂 Categories</h2>
      <div class="explore-categories" id="explore-categories">
        ${CATEGORIES.map(c => `
          <div class="explore-cat-card" data-category="${c.id}">
            <span class="explore-cat-emoji">${c.emoji}</span>
            <div class="explore-cat-name">${c.name}</div>
            <div class="explore-cat-count">${Utils.categoryCount(spills, c.id)} spills</div>
          </div>
        `).join('')}
      </div>

      <!-- Trending -->
      <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">📈 Trending Now</h2>
      <div class="trending-list" id="explore-trending">
        ${trending.map((s, i) => {
          const college = Utils.getCollege(s.collegeId);
          const cat = Utils.getCategory(s.category);
          return `
            <div class="trending-item" data-spill="${s.id}">
              <div class="trending-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</div>
              <div class="trending-info">
                <div class="trending-title">${Utils.escapeHtml(s.title)}</div>
                <div class="trending-meta">${cat ? cat.emoji + ' ' + cat.name : ''} · ${college ? college.name : ''} · ${Utils.formatNumber(Utils.totalReactions(s.reactions))} reactions</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- College Leaderboard -->
      ${topColleges.length > 0 ? `
      <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg);margin-top:var(--space-3xl)">🏆 College Leaderboard</h2>
      <div class="leaderboard-list">
        ${topColleges.map((c, i) => `
          <div class="leaderboard-item" data-college="${c.college.id}" style="cursor:pointer">
            <div class="lb-rank">${i === 0 ? '👑' : i + 1}</div>
            <div class="lb-college">
              <div class="lb-college-name">${c.college.icon} ${Utils.escapeHtml(c.college.name)}</div>
              <div class="lb-college-city">${Utils.escapeHtml(c.college.city)}, ${Utils.escapeHtml(c.college.state)}</div>
            </div>
            <div class="lb-spills">${c.count} 🍵 · ${Utils.formatNumber(c.reactions)} 🔥</div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <!-- Search Results (hidden by default) -->
      <div id="explore-search-results" class="hidden" style="margin-top:var(--space-2xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">🔍 Search Results</h2>
        <div class="feed-list" id="search-results-list"></div>
      </div>
    `;

    this._bindEvents(spills);
  },

  _bindEvents(spills) {
    // Category cards
    document.querySelectorAll('#explore-categories .explore-cat-card').forEach(card => {
      card.addEventListener('click', () => {
        Feed.currentCategory = card.dataset.category;
        Feed.render();
        App.navigate('feed');
        setTimeout(() => {
          document.querySelectorAll('#feed-category-filter .feed-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.category === card.dataset.category);
          });
        }, 50);
      });
    });

    // Trending items
    document.querySelectorAll('#explore-trending .trending-item').forEach(item => {
      item.addEventListener('click', () => {
        App.navigate('reader', item.dataset.spill);
      });
    });

    // College leaderboard items
    document.querySelectorAll('.leaderboard-item[data-college]').forEach(item => {
      item.addEventListener('click', () => {
        College.renderDetail(item.dataset.college);
      });
    });

    // Search
    const searchInput = document.getElementById('explore-search');
    let debounce = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = searchInput.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('explore-search-results');
        const resultsList = document.getElementById('search-results-list');

        if (q.length < 2) {
          resultsContainer.classList.add('hidden');
          return;
        }

        const results = spills.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.body.toLowerCase().includes(q) ||
          s.alias.toLowerCase().includes(q)
        );

        resultsContainer.classList.remove('hidden');
        resultsList.innerHTML = results.length > 0
          ? results.slice(0, 10).map(s => Feed._spillCard(s)).join('')
          : `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No results for "${Utils.escapeHtml(q)}"</div></div>`;

        // Bind search result cards
        resultsList.querySelectorAll('.spill-card').forEach(card => {
          card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
        });
      }, 300);
    });
  }
};
