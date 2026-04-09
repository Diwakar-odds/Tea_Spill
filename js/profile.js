/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Profile Module
   ═══════════════════════════════════════════════════ */

const Profile = {
  render() {
    const page = document.getElementById('page-profile');
    const user = Storage.getUser();
    const spills = Storage.getSpills();

    const allBadges = [
      { id: 'first_visit', label: '👀 First Visit', class: 'badge-purple' },
      { id: 'first_spill', label: '🍵 First Spill', class: 'badge-amber' },
      { id: 'hot_spiller', label: '🔥 Hot Spiller', class: 'badge-amber' },
      { id: 'ghost_mode', label: '👻 Ghost Mode', class: 'badge-purple' },
      { id: 'alumni', label: '🎓 Alumni', class: 'badge-emerald' }
    ];

    const userBadges = allBadges.filter(b => user.badges.includes(b.id));

    page.innerHTML = `
      <div class="profile-header-section">
        <div class="profile-avatar-large">${user.aliasEmoji}</div>
        <h1 class="profile-display-name">${Utils.escapeHtml(user.alias)}</h1>
        <p class="profile-college-info">Anonymous Tea Spiller · Joined ${new Date(user.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>

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
        </div>

        ${userBadges.length > 0 ? `
        <div class="profile-badges">
          ${userBadges.map(b => `<span class="badge ${b.class}">${b.label}</span>`).join('')}
        </div>
        ` : ''}
      </div>

      <div class="section-header">
        <h2 class="section-title" style="font-size: var(--font-size-lg);">Your Saved Spills</h2>
      </div>

      <div id="saved-spills-list" class="feed-list">
        ${user.savedSpills && user.savedSpills.length > 0
          ? user.savedSpills.map(id => {
              const spill = spills.find(s => s.id === id);
              return spill ? Feed._spillCard(spill) : '';
            }).join('')
          : `<div class="empty-state">
               <div class="empty-state-icon">📌</div>
               <div class="empty-state-title">No saved spills yet</div>
               <div class="empty-state-text">Save interesting tea to read later!</div>
             </div>`
        }
      </div>

      <div style="margin-top: var(--space-3xl); padding-top: var(--space-2xl); border-top: 1px solid var(--border-subtle);">
        <h2 class="section-title" style="font-size: var(--font-size-lg); margin-bottom: var(--space-lg);">⚙️ Settings</h2>
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <button class="btn btn-ghost" onclick="Profile.rerollIdentity()">🎲 Reroll Anonymous Identity</button>
          <button class="btn btn-ghost" onclick="Profile.clearData()" style="color: var(--rose);">🗑️ Clear All Data</button>
        </div>
      </div>
    `;

    // Bind saved spill cards
    document.querySelectorAll('#saved-spills-list .spill-card').forEach(card => {
      card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
    });
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
    if (confirm('Are you sure? This will delete all your spills, reactions, and profile data.')) {
      localStorage.clear();
      Utils.toast('🗑️ All data cleared!', 'info');
      location.reload();
    }
  }
};
