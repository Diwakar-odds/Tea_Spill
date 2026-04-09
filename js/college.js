/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — College Hub Module
   ═══════════════════════════════════════════════════ */

const College = {
  render() {
    const page = document.getElementById('page-colleges');
    const colleges = Storage.getColleges();
    const spills = Storage.getSpills();

    // Top colleges by spill count
    const leaderboard = [...colleges]
      .map(c => ({ ...c, spillCount: Utils.collegeSpillCount(spills, c.id) }))
      .filter(c => c.spillCount > 0)
      .sort((a, b) => b.spillCount - a.spillCount)
      .slice(0, 5);

    page.innerHTML = `
      <div class="section-header">
        <div>
          <h1 class="section-title">🏫 College Hub</h1>
          <p class="section-subtitle">Explore campuses across India</p>
        </div>
      </div>

      <div class="search-bar">
        <input type="search" id="college-search" placeholder="Search colleges..." />
      </div>

      ${leaderboard.length > 0 ? `
      <div class="leaderboard">
        <h2 class="section-title" style="font-size: var(--font-size-lg); margin-bottom: var(--space-lg);">🏆 Hottest Campuses</h2>
        <div class="leaderboard-list">
          ${leaderboard.map((c, i) => `
            <div class="leaderboard-item" data-college="${c.id}" style="cursor:pointer">
              <div class="lb-rank">${i === 0 ? '👑' : i + 1}</div>
              <div class="lb-college">
                <div class="lb-college-name">${c.icon} ${Utils.escapeHtml(c.name)}</div>
                <div class="lb-college-city">${Utils.escapeHtml(c.city)}, ${Utils.escapeHtml(c.state)}</div>
              </div>
              <div class="lb-spills">${c.spillCount} 🍵</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <h2 class="section-title" style="font-size: var(--font-size-lg); margin-bottom: var(--space-lg);">All Colleges</h2>
      <div class="college-grid" id="college-grid">
        ${colleges.map(c => this._collegeCard(c, spills)).join('')}
      </div>
    `;

    this._bindSearch(colleges, spills);
    this._bindCards();
  },

  _collegeCard(college, spills) {
    const spillCount = Utils.collegeSpillCount(spills, college.id);
    return `
      <div class="college-card" data-college="${college.id}">
        <div class="college-card-icon">${college.icon}</div>
        <div class="college-card-name">${Utils.escapeHtml(college.name)}</div>
        <div class="college-card-location">${Utils.escapeHtml(college.city)}, ${Utils.escapeHtml(college.state)}</div>
        <div class="college-card-stats">
          <div><span class="stat-value">${spillCount}</span> Spills</div>
          <div><span class="stat-value">${college.verified ? '✅' : '⏳'}</span> ${college.verified ? 'Verified' : 'Pending'}</div>
        </div>
      </div>
    `;
  },

  _bindSearch(colleges, spills) {
    const input = document.getElementById('college-search');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      const filtered = q
        ? colleges.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.state.toLowerCase().includes(q)
          )
        : colleges;
      document.getElementById('college-grid').innerHTML =
        filtered.map(c => this._collegeCard(c, spills)).join('');
      this._bindCards();
    });
  },

  _bindCards() {
    document.querySelectorAll('.college-card, .leaderboard-item[data-college]').forEach(card => {
      card.addEventListener('click', () => {
        this.renderDetail(card.dataset.college);
      });
    });
  },

  renderDetail(collegeId) {
    const college = Utils.getCollege(collegeId);
    if (!college) return;

    const spills = Storage.getSpills();
    const collegeSpills = Utils.filterByCollege(spills, collegeId);
    const page = document.getElementById('page-college-detail');

    // Get unique departments in this college
    const depts = [...new Set(collegeSpills.map(s => s.department).filter(Boolean))];

    page.innerHTML = `
      <div class="college-detail-header">
        <div class="college-detail-icon">${college.icon}</div>
        <h1 class="college-detail-name">${Utils.escapeHtml(college.name)}</h1>
        <p class="college-detail-location">${Utils.escapeHtml(college.city)}, ${Utils.escapeHtml(college.state)}</p>
        <div class="college-detail-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${collegeSpills.length}</div>
            <div class="profile-stat-label">Spills</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${depts.length}</div>
            <div class="profile-stat-label">Departments</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${Utils.formatNumber(collegeSpills.reduce((sum, s) => sum + Utils.totalReactions(s.reactions), 0))}</div>
            <div class="profile-stat-label">Reactions</div>
          </div>
        </div>
      </div>

      ${depts.length > 0 ? `
      <div class="dept-filter" id="dept-filter">
        <button class="feed-tab active" data-dept="all">All</button>
        ${depts.map(d => `<button class="feed-tab" data-dept="${d}">${d}</button>`).join('')}
      </div>
      ` : ''}

      <div class="feed-list" id="college-spill-list">
        ${collegeSpills.length > 0
          ? collegeSpills.map(s => Feed._spillCard(s)).join('')
          : `<div class="empty-state">
               <div class="empty-state-icon">🏫</div>
               <div class="empty-state-title">No tea from this campus yet</div>
               <div class="empty-state-text">Be the first to spill!</div>
             </div>`
        }
      </div>

      <button class="reader-back" onclick="App.navigate('colleges')" style="margin-top: var(--space-2xl);">
        ← Back to all colleges
      </button>
    `;

    // Activate college detail page
    App._showPage('college-detail');

    // Bind department filter
    const deptFilter = document.getElementById('dept-filter');
    if (deptFilter) {
      deptFilter.addEventListener('click', (e) => {
        const tab = e.target.closest('.feed-tab');
        if (!tab) return;
        deptFilter.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const dept = tab.dataset.dept;
        const filtered = dept === 'all' ? collegeSpills : collegeSpills.filter(s => s.department === dept);
        document.getElementById('college-spill-list').innerHTML =
          filtered.map(s => Feed._spillCard(s)).join('');
        // Rebind cards
        document.querySelectorAll('#college-spill-list .spill-card').forEach(card => {
          card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
        });
      });
    }

    // Bind spill cards
    document.querySelectorAll('#college-spill-list .spill-card').forEach(card => {
      card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
    });
  }
};
