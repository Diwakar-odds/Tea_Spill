/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Pages, Groups, Channels Module
   Full interactivity: follow, join, subscribe,
   view detail, post within communities.
   ═══════════════════════════════════════════════════ */

'use strict';

const Pages = {

  /* ═══════ PAGES ═══════ */

  renderPages() {
    const page = document.getElementById('page-pages');
    const user = Storage.getUser();
    const pages = Storage.getPages();

    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">📄</div>
        <h1 class="pages-hero-title">Pages</h1>
        <p class="pages-hero-desc">Follow curated pages for the hottest tea across topics and campuses</p>
      </div>

      <div class="search-bar">
        <input type="search" id="pages-search" placeholder="Search pages..." />
      </div>

      <div class="community-grid" id="pages-grid">
        ${pages.map(p => this._pageCard(p, user)).join('')}
      </div>
    `;

    this._bindPageEvents(pages);
  },

  _pageCard(p, user) {
    const isFollowed = user.followedPages.includes(p.id);
    return `
      <div class="community-card" data-page-id="${p.id}">
        <div class="community-card-banner"></div>
        <div class="community-card-body">
          <div class="community-card-icon">${p.icon}</div>
          <div class="community-card-name">${Utils.escapeHtml(p.name)}</div>
          <div class="community-card-desc">${Utils.escapeHtml(p.desc)}</div>
          <div class="community-card-meta">
            <span>${Utils.formatNumber(p.followers)} followers</span>
            <button class="btn btn-sm ${isFollowed ? 'btn-primary' : 'btn-ghost'}"
                    onclick="event.stopPropagation(); Pages.toggleFollow('${p.id}')">
              ${isFollowed ? '✓ Following' : '+ Follow'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleFollow(pageId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('follow pages')) {
      return;
    }

    const user = Storage.getUser();
    const pages = Storage.getPages();
    const pg = pages.find(p => p.id === pageId);
    if (!pg) return;

    const idx = user.followedPages.indexOf(pageId);
    if (idx > -1) {
      user.followedPages.splice(idx, 1);
      pg.followers = Math.max(0, pg.followers - 1);
      Utils.toast('📄 Unfollowed page', 'info');
    } else {
      user.followedPages.push(pageId);
      pg.followers += 1;
      user.teaPoints += 2;
      Utils.toast('📄 Following page!', 'success');
    }

    Storage.saveUser(user);
    Storage.savePages(pages);
    this.renderPages();
  },

  renderPageDetail(pageId) {
    const pages = Storage.getPages();
    const pg = pages.find(p => p.id === pageId);
    if (!pg) return;

    const spills = Storage.getSpills().filter(s => s.pageId === pageId);
    const user = Storage.getUser();
    const isFollowed = user.followedPages.includes(pageId);

    const page = document.getElementById('page-pages');
    page.innerHTML = `
      <div class="college-detail-header">
        <div class="college-detail-icon">${pg.icon}</div>
        <h1 class="college-detail-name">${Utils.escapeHtml(pg.name)}</h1>
        <p class="college-detail-location">${Utils.escapeHtml(pg.desc)}</p>
        <div class="college-detail-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${Utils.formatNumber(pg.followers)}</div>
            <div class="profile-stat-label">Followers</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${pg.posts || spills.length}</div>
            <div class="profile-stat-label">Posts</div>
          </div>
        </div>
        <div style="margin-top: var(--space-lg);">
          <button class="btn ${isFollowed ? 'btn-primary' : 'btn-ghost'}"
                  onclick="Pages.toggleFollow('${pg.id}'); Pages.renderPageDetail('${pg.id}');">
            ${isFollowed ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>

      <div class="feed-list">
        ${spills.length > 0
          ? spills.map(s => Feed._spillCard(s)).join('')
          : `<div class="empty-state">
               <div class="empty-state-icon">📄</div>
               <div class="empty-state-title">No posts on this page yet</div>
               <div class="empty-state-text">Spills tagged to this page will appear here.</div>
             </div>`}
      </div>

      <button class="reader-back" onclick="Pages.renderPages()" style="margin-top:var(--space-2xl)">
        ← Back to all pages
      </button>
    `;
  },

  _bindPageEvents(pages) {
    document.querySelectorAll('#pages-grid .community-card').forEach(card => {
      card.addEventListener('click', () => {
        this.renderPageDetail(card.dataset.pageId);
      });
    });

    const search = document.getElementById('pages-search');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        const user = Storage.getUser();
        const filtered = q ? pages.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) : pages;
        document.getElementById('pages-grid').innerHTML = filtered.map(p => this._pageCard(p, user)).join('');
        document.querySelectorAll('#pages-grid .community-card').forEach(card => {
          card.addEventListener('click', () => this.renderPageDetail(card.dataset.pageId));
        });
      });
    }
  },

  /* ═══════ GROUPS ═══════ */

  renderGroups() {
    const page = document.getElementById('page-groups');
    const user = Storage.getUser();
    const groups = Storage.getGroups();

    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">👥</div>
        <h1 class="pages-hero-title">Groups</h1>
        <p class="pages-hero-desc">Join private and public groups to spill tea with your tribe</p>
      </div>

      <div class="search-bar">
        <input type="search" id="groups-search" placeholder="Search groups..." />
      </div>

      <div class="community-grid" id="groups-grid">
        ${groups.map(g => this._groupCard(g, user)).join('')}
      </div>
    `;

    this._bindGroupEvents(groups);
  },

  _groupCard(g, user) {
    const isJoined = user.joinedGroups.includes(g.id);
    const typeClass = g.type === 'public' ? 'group-type-public' : g.type === 'private' ? 'group-type-private' : 'group-type-secret';
    const typeLabel = g.type.charAt(0).toUpperCase() + g.type.slice(1);
    const banner = g.type === 'secret'
      ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
      : g.type === 'private'
        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
        : 'var(--gradient-primary)';

    return `
      <div class="community-card" data-group-id="${g.id}">
        <div class="community-card-banner" style="background:${banner}"></div>
        <div class="community-card-body">
          <div class="community-card-icon">${g.icon}</div>
          <div class="community-card-name">${Utils.escapeHtml(g.name)}</div>
          <div class="community-card-desc">${Utils.escapeHtml(g.desc)}</div>
          <div class="community-card-meta">
            <span class="group-type ${typeClass}">${g.type === 'secret' ? '🔒' : g.type === 'private' ? '🔐' : '🌐'} ${typeLabel}</span>
            <button class="btn btn-sm ${isJoined ? 'btn-primary' : 'btn-ghost'}"
                    onclick="event.stopPropagation(); Pages.toggleJoinGroup('${g.id}')">
              ${isJoined ? '✓ Joined' : '+ Join'}
            </button>
          </div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-sm)">
            ${Utils.formatNumber(g.members)} members
          </div>
        </div>
      </div>
    `;
  },

  toggleJoinGroup(groupId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('join groups')) {
      return;
    }

    const user = Storage.getUser();
    const groups = Storage.getGroups();
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;

    const idx = user.joinedGroups.indexOf(groupId);
    if (idx > -1) {
      user.joinedGroups.splice(idx, 1);
      grp.members = Math.max(0, grp.members - 1);
      Utils.toast('👥 Left group', 'info');
    } else {
      if (grp.type === 'secret') {
        Utils.toast('🔒 This group is invite-only', 'error');
        return;
      }
      user.joinedGroups.push(groupId);
      grp.members += 1;
      user.teaPoints += 3;
      Utils.toast(`👥 Joined ${grp.name}!`, 'success');
    }

    Storage.saveUser(user);
    Storage.saveGroups(groups);
    this.renderGroups();
  },

  renderGroupDetail(groupId) {
    const groups = Storage.getGroups();
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;

    const user = Storage.getUser();
    const isJoined = user.joinedGroups.includes(groupId);
    const spills = Storage.getSpills().filter(s => s.groupId === groupId);
    const messages = grp.messages || [];

    const page = document.getElementById('page-groups');
    page.innerHTML = `
      <button class="reader-back" onclick="Pages.renderGroups()">← Back to groups</button>

      <div class="college-detail-header">
        <div class="college-detail-icon">${grp.icon}</div>
        <h1 class="college-detail-name">${Utils.escapeHtml(grp.name)}</h1>
        <p class="college-detail-location">${Utils.escapeHtml(grp.desc)}</p>
        <div class="college-detail-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${Utils.formatNumber(grp.members)}</div>
            <div class="profile-stat-label">Members</div>
          </div>
          <div class="profile-stat">
            <div class="profile-stat-value">${spills.length}</div>
            <div class="profile-stat-label">Spills</div>
          </div>
        </div>
      </div>

      <!-- Group Chat -->
      <div style="margin-bottom:var(--space-2xl)">
        <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">💬 Group Chat</h2>
        ${isJoined ? `
          <div class="group-chat-box" id="group-chat-box" style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-lg);max-height:300px;overflow-y:auto;margin-bottom:var(--space-md)">
            ${messages.length > 0
              ? messages.map(m => `
                <div class="comment" style="border-bottom:1px solid var(--border-subtle);padding-bottom:var(--space-md);margin-bottom:var(--space-md)">
                  <div class="comment-avatar">${m.emoji}</div>
                  <div class="comment-content">
                    <div class="comment-author">${Utils.escapeHtml(m.alias)}</div>
                    <div class="comment-time">${m.time}</div>
                    <div class="comment-body">${Utils.escapeHtml(m.body)}</div>
                  </div>
                </div>
              `).join('')
              : '<p style="color:var(--text-muted);text-align:center;padding:var(--space-xl)">No messages yet. Start the conversation! 💬</p>'
            }
          </div>
          <div class="comment-input-wrapper">
            <textarea id="group-chat-input" placeholder="Type a message..." rows="2"></textarea>
            <button class="btn btn-primary btn-sm" onclick="Pages.sendGroupMessage('${groupId}')" style="align-self:flex-end">Send</button>
          </div>
        ` : `
          <div class="empty-state" style="padding:var(--space-xl)">
            <div class="empty-state-text">Join this group to access the chat</div>
            <button class="btn btn-primary" onclick="Pages.toggleJoinGroup('${groupId}');Pages.renderGroupDetail('${groupId}')" style="margin-top:var(--space-lg)">+ Join Group</button>
          </div>
        `}
      </div>

      <!-- Group Spills -->
      <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">🍵 Group Spills</h2>
      <div class="feed-list" id="group-spills-list">
        ${spills.length > 0
          ? spills.map(s => Feed._spillCard(s)).join('')
          : `<div class="empty-state">
               <div class="empty-state-icon">👥</div>
               <div class="empty-state-title">No spills in this group yet</div>
             </div>`}
      </div>
    `;

    // Bind spill cards
    document.querySelectorAll('#group-spills-list .spill-card').forEach(card => {
      card.addEventListener('click', () => App.navigate('reader', card.dataset.spillId));
    });

    // Auto-scroll chat to bottom
    const chatBox = document.getElementById('group-chat-box');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  },

  sendGroupMessage(groupId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('send group messages')) {
      return;
    }

    const input = document.getElementById('group-chat-input');
    const body = input.value.trim();
    if (!body) return;

    const groups = Storage.getGroups();
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return;

    if (!grp.messages) grp.messages = [];
    const user = Storage.getUser();
    const aliasName = user.alias || 'Tea User';
    const aliasEmoji = user.aliasEmoji || '👤';
    grp.messages.push({
      alias: aliasName,
      emoji: aliasEmoji,
      body,
      time: 'Just now'
    });

    Storage.saveGroups(groups);
    user.teaPoints += 1;
    Storage.saveUser(user);

    this.renderGroupDetail(groupId);
    Utils.toast('💬 Message sent!', 'success');
  },

  _bindGroupEvents(groups) {
    document.querySelectorAll('#groups-grid .community-card').forEach(card => {
      card.addEventListener('click', () => {
        this.renderGroupDetail(card.dataset.groupId);
      });
    });

    const search = document.getElementById('groups-search');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        const user = Storage.getUser();
        const filtered = q ? groups.filter(g => g.name.toLowerCase().includes(q)) : groups;
        document.getElementById('groups-grid').innerHTML = filtered.map(g => this._groupCard(g, user)).join('');
        document.querySelectorAll('#groups-grid .community-card').forEach(card => {
          card.addEventListener('click', () => this.renderGroupDetail(card.dataset.groupId));
        });
      });
    }
  },

  /* ═══════ CHANNELS ═══════ */

  renderChannels() {
    const page = document.getElementById('page-channels');
    const user = Storage.getUser();
    const channels = Storage.getChannels();

    page.innerHTML = `
      <div class="pages-hero">
        <div class="pages-hero-emoji">📢</div>
        <h1 class="pages-hero-title">Channels</h1>
        <p class="pages-hero-desc">Subscribe to broadcast channels for curated tea delivered to your feed</p>
      </div>

      <div class="community-grid" id="channels-grid">
        ${channels.map(c => this._channelCard(c, user)).join('')}
      </div>
    `;

    this._bindChannelEvents(channels);
  },

  _channelCard(c, user) {
    const isSub = user.subscribedChannels.includes(c.id);
    return `
      <div class="community-card" data-channel-id="${c.id}">
        <div class="community-card-banner" style="background:linear-gradient(135deg,#7c3aed,#6d28d9)"></div>
        <div class="community-card-body">
          <div class="community-card-icon">${c.icon}</div>
          <div class="community-card-name">${Utils.escapeHtml(c.name)}</div>
          <div class="community-card-desc">${Utils.escapeHtml(c.desc)}</div>
          <div class="community-card-meta">
            <div class="channel-subscribers">
              <span class="subscriber-dot"></span>
              <span>${Utils.formatNumber(c.subscribers)} subscribers</span>
            </div>
            <button class="btn btn-sm ${isSub ? 'btn-primary' : 'btn-ghost'}"
                    onclick="event.stopPropagation(); Pages.toggleSubscribe('${c.id}')">
              ${isSub ? '🔔 Subscribed' : '+ Subscribe'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleSubscribe(channelId) {
    if (typeof window.App !== 'undefined' && App.requireVerified && !App.requireVerified('subscribe to channels')) {
      return;
    }

    const user = Storage.getUser();
    const channels = Storage.getChannels();
    const ch = channels.find(c => c.id === channelId);
    if (!ch) return;

    const idx = user.subscribedChannels.indexOf(channelId);
    if (idx > -1) {
      user.subscribedChannels.splice(idx, 1);
      ch.subscribers = Math.max(0, ch.subscribers - 1);
      Utils.toast('📢 Unsubscribed', 'info');
    } else {
      user.subscribedChannels.push(channelId);
      ch.subscribers += 1;
      user.teaPoints += 2;
      Utils.toast('🔔 Subscribed!', 'success');
    }

    Storage.saveUser(user);
    Storage.saveChannels(channels);
    this.renderChannels();
  },

  renderChannelDetail(channelId) {
    const channels = Storage.getChannels();
    const ch = channels.find(c => c.id === channelId);
    if (!ch) return;

    const user = Storage.getUser();
    const isSub = user.subscribedChannels.includes(channelId);
    const broadcasts = ch.broadcasts || [];

    const page = document.getElementById('page-channels');
    page.innerHTML = `
      <button class="reader-back" onclick="Pages.renderChannels()">← Back to channels</button>

      <div class="college-detail-header">
        <div class="college-detail-icon">${ch.icon}</div>
        <h1 class="college-detail-name">${Utils.escapeHtml(ch.name)}</h1>
        <p class="college-detail-location">${Utils.escapeHtml(ch.desc)}</p>
        <div class="college-detail-stats">
          <div class="profile-stat">
            <div class="profile-stat-value">${Utils.formatNumber(ch.subscribers)}</div>
            <div class="profile-stat-label">Subscribers</div>
          </div>
        </div>
        <div style="margin-top:var(--space-lg)">
          <button class="btn ${isSub ? 'btn-primary' : 'btn-ghost'}"
                  onclick="Pages.toggleSubscribe('${ch.id}');Pages.renderChannelDetail('${ch.id}')">
            ${isSub ? '🔔 Subscribed' : '+ Subscribe'}
          </button>
        </div>
      </div>

      <h2 class="section-title" style="font-size:var(--font-size-lg);margin-bottom:var(--space-lg)">📢 Broadcasts</h2>
      <div class="feed-list">
        ${broadcasts.length > 0
          ? broadcasts.map(b => `
            <div class="spill-card">
              <div class="spill-card-header">
                <div class="spill-meta">
                  <div class="spill-avatar">${ch.icon}</div>
                  <div>
                    <div class="spill-author">${Utils.escapeHtml(ch.name)}</div>
                    <div class="spill-time">${b.time}</div>
                  </div>
                </div>
              </div>
              <h3 class="spill-card-title">${Utils.escapeHtml(b.title)}</h3>
              <p class="spill-card-body">${Utils.escapeHtml(b.body)}</p>
            </div>
          `).join('')
          : `<div class="empty-state">
               <div class="empty-state-icon">📢</div>
               <div class="empty-state-title">No broadcasts yet</div>
               <div class="empty-state-text">New broadcasts from this channel will appear here.</div>
             </div>`}
      </div>
    `;
  },

  _bindChannelEvents(channels) {
    document.querySelectorAll('#channels-grid .community-card').forEach(card => {
      card.addEventListener('click', () => {
        this.renderChannelDetail(card.dataset.channelId);
      });
    });
  }
};
