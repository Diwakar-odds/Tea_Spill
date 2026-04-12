/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Profile Module
   User stats, badges, awards, leaderboard,
   saved spills, settings.
   ═══════════════════════════════════════════════════ */

'use strict';

const Profile = {

  render() {
    const page = document.getElementById('page-profile');
    const user = Storage.getUser();
    const spills = Storage.getSpills();

    // Calculate derived stats
    user.mySpillIds = user.mySpillIds || [];
    const mySpills = spills.filter(s => user.mySpillIds.includes(s.id));
    const totalReactionsReceived = mySpills.reduce((sum, s) => sum + Utils.totalReactions(s.reactions), 0);

    // Badge logic
    user.badges = user.badges || [];
    this._updateBadges(user, mySpills);

    const allBadges = [
      { id: 'first_visit',   label: '👀 First Visit',    class: 'badge-purple',  desc: 'Joined Tea Spill' },
      { id: 'first_spill',   label: '🍵 First Spill',    class: 'badge-amber',   desc: 'Posted your first spill' },
      { id: 'hot_spiller',   label: '🔥 Hot Spiller',    class: 'badge-amber',   desc: 'Got 10+ trending spills' },
      { id: 'ghost_mode',    label: '👻 Ghost Mode',     class: 'badge-purple',  desc: 'Posted 20+ anonymous spills' },
      { id: 'tea_master',    label: '🏆 Tea Master',     class: 'badge-amber',   desc: 'Earned 100+ tea points' },
      { id: 'social',        label: '🤝 Social Butterfly', class: 'badge-emerald', desc: 'Joined 3+ groups' },
      { id: 'commenter',     label: '💬 Commentator',    class: 'badge-emerald', desc: 'Posted 10+ comments' },
      { id: 'streak_3',      label: '⚡ 3-Day Streak',   class: 'badge-amber',   desc: 'Visited 3 days in a row' }
    ];
    const userBadges = allBadges.filter(b => user.badges.includes(b.id));
    const lockedBadges = allBadges.filter(b => !user.badges.includes(b.id));

    page.innerHTML = `
      <div class="profile-header-section">
        <div class="profile-avatar-large">${user.aliasEmoji}</div>
        <h1 class="profile-display-name">${Utils.escapeHtml(user.alias)}</h1>
        <p class="profile-college-info">
          Anonymous Tea Spiller · Joined ${new Date(user.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </p>

        <div class="profile-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${user.teaPoints}</div>
            <div class="profile-stat-label">🍵 Tea Points</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${user.spills}</div>
            <div class="profile-stat-label">Spills</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${user.reactions}</div>
            <div class="profile-stat-label">Reactions</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${totalReactionsReceived}</div>
            <div class="profile-stat-label">Received</div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div style="margin-bottom:var(--space-3xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">🏅 Badges (${userBadges.length}/${allBadges.length})</h2>
        ${userBadges.length > 0 ? `
          <div class="profile-badges" style="justify-content:flex-start;flex-wrap:wrap;gap:var(--space-sm)">
            ${userBadges.map(b => `
              <span class="badge ${b.class}" title="${b.desc}">${b.label}</span>
            `).join('')}
          </div>
        ` : ''}
        ${lockedBadges.length > 0 ? `
          <div class="profile-badges" style="justify-content:flex-start;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-md)">
            ${lockedBadges.map(b => `
              <span class="badge" style="opacity:0.35" title="${b.desc}">🔒 ${b.label.split(' ').slice(1).join(' ')}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- My Spills -->
      <div style="margin-bottom:var(--space-3xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">☕ My Spills (${mySpills.length})</h2>
        <div class="feed-list" id="my-spills-list">
          ${mySpills.length > 0
            ? mySpills.reverse().map(s => Feed._spillCard(s, { isOwner: true })).join('')
            : `<div class="empty-state">
                 <div class="empty-state-icon">👻</div>
                 <div class="empty-state-title">You're a ghost...</div>
                 <div class="empty-state-text">You haven't posted any anonymous tea yet.</div>
               </div>`
          }
        </div>
      </div>

      <!-- Weekly Leaderboard -->
      <div style="margin-bottom:var(--space-3xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">🏆 Tea Awards</h2>
        ${this._renderAwards(spills)}
      </div>

      <!-- Saved Spills -->
      <div style="margin-bottom:var(--space-3xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">🔖 Saved Spills (${user.savedSpills?.length || 0})</h2>
        <div class="feed-list" id="saved-spills-list">
          ${user.savedSpills && user.savedSpills.length > 0
            ? user.savedSpills.map(id => {
                const spill = spills.find(s => s.id === id);
                return spill ? Feed._spillCard(spill) : '';
              }).join('')
            : `<div class="empty-state">
                 <div class="empty-state-icon">📌</div>
                 <div class="empty-state-title">No saved spills yet</div>
                 <div class="empty-state-text">Save interesting tea from the reader view!</div>
               </div>`
          }
        </div>
      </div>

      <!-- Settings -->
      <div style="padding-top:var(--space-2xl);border-top:1px solid var(--border-subtle)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">⚙️ Settings</h2>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <button class="btn btn-ghost" onclick="Profile.rerollIdentity()">🎲 Reroll Anonymous Identity</button>
          <button class="btn btn-ghost" onclick="API.signOut()" style="color:var(--text-secondary); border: 1px solid var(--border-default);">🚪 Sign Out</button>
          <button class="btn btn-ghost" onclick="Profile.clearData()" style="color:var(--rose)">🗑️ Clear All Data</button>
        </div>
      </div>
    `;

    // Bind saved spill cards
    document.querySelectorAll('#saved-spills-list .spill-card').forEach(card => {
      card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
    });
  },

  _updateBadges(user, mySpills) {
    let changed = false;
    const add = (id) => {
      if (!user.badges.includes(id)) { user.badges.push(id); changed = true; }
    };

    if (user.spills >= 1)                   add('first_spill');
    if (user.teaPoints >= 100)              add('tea_master');
    if (user.spills >= 20)                  add('ghost_mode');
    if ((user.joinedGroups?.length || 0) >= 3) add('social');

    // Hot spiller: at least one spill with 500+ reactions
    if (mySpills.some(s => Utils.totalReactions(s.reactions) >= 500)) add('hot_spiller');

    if (changed) Storage.saveUser(user);
  },

  _renderAwards(spills) {
    // Top spill
    const sorted = [...spills].sort((a, b) => Utils.totalReactions(b.reactions) - Utils.totalReactions(a.reactions));
    const top = sorted[0];
    const categories = {};
    spills.forEach(s => { categories[s.category] = (categories[s.category] || 0) + 1; });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return `
      <div class="trending-list">
        ${top ? `
        <div class="trending-item" style="cursor:pointer" onclick="App.navigate('reader','${top.id}')">
          <div class="trending-rank">🏆</div>
          <div class="trending-info">
            <div class="trending-title">Spill of the Month</div>
            <div class="trending-meta">"${Utils.escapeHtml(top.title.slice(0, 60))}..." · ${Utils.formatNumber(Utils.totalReactions(top.reactions))} reactions</div>
          </div>
        </div>
        ` : ''}
        ${topCategory ? `
        <div class="trending-item">
          <div class="trending-rank">📊</div>
          <div class="trending-info">
            <div class="trending-title">Hottest Category</div>
            <div class="trending-meta">${Utils.getCategory(topCategory[0])?.emoji || ''} ${Utils.getCategory(topCategory[0])?.name || topCategory[0]} — ${topCategory[1]} spills</div>
          </div>
        </div>
        ` : ''}
        <div class="trending-item">
          <div class="trending-rank">📈</div>
          <div class="trending-info">
            <div class="trending-title">Total Platform Activity</div>
            <div class="trending-meta">${spills.length} spills · ${spills.reduce((s, sp) => s + (sp.comments?.length || 0), 0)} comments · ${spills.reduce((s, sp) => s + Utils.totalReactions(sp.reactions), 0)} reactions</div>
          </div>
        </div>
      </div>
    `;
  },

  rerollIdentity() {
    const user = Storage.getUser();
    const newAlias = Utils.randomAlias();
    user.alias = newAlias.name;
    user.aliasEmoji = newAlias.emoji;
    Storage.saveUser(user);
    Utils.toast('🎲 New identity: ' + newAlias.emoji + ' ' + newAlias.name, 'success');
    this.render();
    App._updateSidebarProfile();
  },

  clearData() {
    if (confirm('Are you sure? This will delete ALL your spills, reactions, and profile data.')) {
      localStorage.clear();
      Utils.toast('🗑️ All data cleared!', 'info');
      location.reload();
    }
  },

  deleteSpill(spillId) {
    if (confirm('🚨 PANIC DELETE: Are you sure you want to permanently destroy this spill? It will vanish globally.')) {
      // 1. Remove from local user array
      const user = Storage.getUser();
      user.mySpillIds = user.mySpillIds.filter(id => id !== spillId);
      Storage.saveUser(user);

      // 2. Remove globally (local Storage handles Supabase trigger internally)
      Storage.removeSpill(spillId);

      Utils.toast('🗑️ Spill destroyed.', 'info');
      
      // 3. Re-render UI entirely to wipe it from view
      this.render();
    }
  }
};
