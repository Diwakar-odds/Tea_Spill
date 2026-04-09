/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Pages, Groups, Channels Module
   ═══════════════════════════════════════════════════ */

const Pages = {
  renderPages() {
    const page = document.getElementById('page-pages');
    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">📄</div>
        <h1 class="pages-hero-title">Pages</h1>
        <p class="pages-hero-desc">Follow curated pages for the hottest tea across topics and campuses</p>
      </div>
      <div class="community-grid">
        ${MOCK_PAGES.map(p => `
          <div class="community-card">
            <div class="community-card-banner"></div>
            <div class="community-card-body">
              <div class="community-card-icon">${p.icon}</div>
              <div class="community-card-name">${Utils.escapeHtml(p.name)}</div>
              <div class="community-card-desc">${Utils.escapeHtml(p.desc)}</div>
              <div class="community-card-meta">
                <span>${Utils.formatNumber(p.followers)} followers</span>
                <span>${p.posts} posts</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderGroups() {
    const page = document.getElementById('page-groups');
    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">👥</div>
        <h1 class="pages-hero-title">Groups</h1>
        <p class="pages-hero-desc">Join private and public groups to spill tea with your tribe</p>
      </div>
      <div class="community-grid">
        ${MOCK_GROUPS.map(g => {
          const typeClass = g.type === 'public' ? 'group-type-public' : g.type === 'private' ? 'group-type-private' : 'group-type-secret';
          const typeLabel = g.type.charAt(0).toUpperCase() + g.type.slice(1);
          return `
            <div class="community-card">
              <div class="community-card-banner" style="background: ${g.type === 'secret' ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : g.type === 'private' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--gradient-primary)'}"></div>
              <div class="community-card-body">
                <div class="community-card-icon">${g.icon}</div>
                <div class="community-card-name">${Utils.escapeHtml(g.name)}</div>
                <div class="community-card-desc">${Utils.escapeHtml(g.desc)}</div>
                <div class="community-card-meta">
                  <span class="group-type ${typeClass}">${g.type === 'secret' ? '🔒' : g.type === 'private' ? '🔐' : '🌐'} ${typeLabel}</span>
                  <span>${Utils.formatNumber(g.members)} members</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderChannels() {
    const page = document.getElementById('page-channels');
    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">📢</div>
        <h1 class="pages-hero-title">Channels</h1>
        <p class="pages-hero-desc">Subscribe to broadcast channels for curated tea delivered to your feed</p>
      </div>
      <div class="community-grid">
        ${MOCK_CHANNELS.map(c => `
          <div class="community-card">
            <div class="community-card-banner" style="background: linear-gradient(135deg, #7c3aed, #6d28d9)"></div>
            <div class="community-card-body">
              <div class="community-card-icon">${c.icon}</div>
              <div class="community-card-name">${Utils.escapeHtml(c.name)}</div>
              <div class="community-card-desc">${Utils.escapeHtml(c.desc)}</div>
              <div class="community-card-meta">
                <div class="channel-subscribers">
                  <span class="subscriber-dot"></span>
                  <span>${Utils.formatNumber(c.subscribers)} subscribers</span>
                </div>
                <button class="btn btn-sm btn-ghost" onclick="Utils.toast('🔔 Subscribed!', 'success')">Subscribe</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
