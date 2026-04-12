/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Admin Verification Portal
   Allows admins to review and approve/reject ID cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Admin = {
  _tab: 'pending',

  async render() {
    const page = document.getElementById('page-admin');
    page.innerHTML = `
      <div class="page-header" style="padding:var(--space-xl) var(--space-lg) var(--space-sm);">
        <h1 class="page-title">🛡️ Admin Portal</h1>
        <p class="page-subtitle">Manage users, verify IDs, and moderate content</p>
      </div>

      <!-- Tab Bar -->
      <div style="display:flex; gap:var(--space-sm); padding:0 var(--space-lg) var(--space-md); border-bottom:1px solid var(--border-subtle); margin-bottom:var(--space-lg);">
        <button id="admin-tab-pending" class="btn btn-primary btn-sm" onclick="Admin._switchTab('pending')">⏳ Pending Verification</button>
        <button id="admin-tab-all" class="btn btn-ghost btn-sm" onclick="Admin._switchTab('all')">👥 All Users</button>
      </div>

      <div id="admin-content" style="padding: 0 var(--space-lg) var(--space-xl);">
        <div style="text-align:center; padding: 40px; color:var(--text-tertiary);">
          Loading... ☕
        </div>
      </div>
    `;

    this.fetchPending();
  },

  _switchTab(tab) {
    this._tab = tab;
    document.getElementById('admin-tab-pending').className = tab === 'pending' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
    document.getElementById('admin-tab-all').className = tab === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
    if (tab === 'pending') this.fetchPending();
    else this.fetchAll();
  },

  async fetchAll() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">Loading all users... ☕</div>';

    if (!API.isLive || !API.client) {
      container.innerHTML = '<div style="color:var(--rose);">Live database not connected.</div>';
      return;
    }

    try {
      const { data, error } = await API.client.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-tertiary);">No users found.</div>';
        return;
      }

      const statusColors = {
        verified: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: '✅ Verified' },
        pending:  { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', label: '⏳ Pending' },
        rejected: { bg: 'rgba(244,63,94,0.1)', color: 'var(--rose)', label: '⛔ Rejected' },
        banned:   { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '🚫 Banned' },
        unverified: { bg: 'rgba(148,163,184,0.1)', color: 'var(--text-tertiary)', label: '🔓 Unverified' },
      };

      container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm);">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default); color:var(--text-tertiary); text-align:left;">
              <th style="padding:10px 12px;">User</th>
              <th style="padding:10px 12px;">College</th>
              <th style="padding:10px 12px;">Dept</th>
              <th style="padding:10px 12px;">Status</th>
              <th style="padding:10px 12px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(user => {
              const s = statusColors[user.verification_status] || statusColors.unverified;
              return `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:10px 12px;">
                  <div style="font-weight:600; color:var(--text-primary);">${user.real_name || user.username || '—'}</div>
                  <div style="color:var(--text-tertiary); font-size:11px;">${user.username || ''}</div>
                </td>
                <td style="padding:10px 12px; color:var(--text-secondary);">${user.college_name || '—'}</td>
                <td style="padding:10px 12px; color:var(--text-tertiary);">${user.department || '—'}</td>
                <td style="padding:10px 12px;">
                  <span style="background:${s.bg}; color:${s.color}; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600;">${s.label}</span>
                </td>
                <td style="padding:10px 12px; text-align:right;">
                  <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">
                    ${user.verification_status !== 'verified' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:#22c55e; border-color:#22c55e;" onclick="Admin.approve('${user.auth_id}')">✅ Approve</button>` : ''}
                    ${user.verification_status !== 'rejected' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--amber); border-color:var(--amber);" onclick="Admin.reject('${user.auth_id}')">⛔ Reject</button>` : ''}
                    ${user.verification_status !== 'banned' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--rose); border-color:var(--rose);" onclick="Admin.banUser('${user.auth_id}')">🚫 Ban</button>` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="color:var(--rose);">Error loading users.</div>';
    }
  },

  async fetchPending() {
    const container = document.getElementById('admin-content');
    
    if (!API.isLive || !API.client) {
      container.innerHTML = '<div style="color:var(--rose);">Live database not connected.</div>';
      return;
    }

    try {
      const { data, error } = await API.client.from('users').select('*').eq('verification_status', 'pending');
      
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding: 80px 20px;">
            <div style="font-size:3rem; opacity:0.5; margin-bottom:10px;">✨</div>
            <h3 style="color:var(--text-secondary);">Inbox Zero</h3>
            <p style="color:var(--text-tertiary);">No pending verifications to review.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="admin-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-lg);">
          ${data.map(user => {
            const dob = new Date(user.dob);
            const diffMs = Date.now() - dob.getTime();
            const age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
            return `
            <div class="admin-card" style="background:var(--bg-card); border:1px solid var(--border-default); border-radius:var(--radius-lg); overflow:hidden;">
              <!-- ID Card Photo -->
              <a href="${user.id_url}" target="_blank" title="Click to view full ID">
                <div style="height:180px; background:url('${user.id_url}') center/cover no-repeat; border-bottom:1px solid var(--border-subtle); position:relative;">
                  <span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;padding:3px 8px;border-radius:99px;">🔍 View Full ID</span>
                </div>
              </a>

              <!-- User Details -->
              <div style="padding:var(--space-md);">
                <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); margin-bottom:var(--space-md);">
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0; white-space:nowrap;">👤 Name</td>
                    <td style="color:var(--text-primary); font-weight:600;">${user.real_name || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🏷️ Username</td>
                    <td style="color:var(--text-secondary);">${user.username || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🏫 College</td>
                    <td style="color:var(--text-primary); font-weight:600;">${user.college_name || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">📚 Dept</td>
                    <td style="color:var(--text-secondary);">${user.department || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">📅 Section</td>
                    <td style="color:var(--text-secondary);">${user.section || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🎂 Age</td>
                    <td style="color:var(--text-secondary);">${age} yrs (DOB: ${user.dob})</td>
                  </tr>
                </table>

                <!-- Action Buttons -->
                <div style="display:flex; gap:var(--space-sm); flex-wrap:wrap;">
                  <button class="btn btn-primary" style="flex:1; min-width:100px;" onclick="Admin.approve('${user.auth_id}')">✅ Approve</button>
                  <button class="btn btn-ghost" style="flex:1; min-width:100px; border-color:var(--amber); color:var(--amber);" onclick="Admin.reject('${user.auth_id}')">⛔ Reject</button>
                  <button class="btn btn-ghost" style="width:100%; border-color:var(--rose); color:var(--rose); margin-top:var(--space-xs);" onclick="Admin.banUser('${user.auth_id}')">🚫 Permanently Ban</button>
                </div>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      `;

    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="color:var(--rose);">Error loading verifications. Are you sure you have Admin privileges?</div>';
    }
  },

  async approve(authId) {
    if (!confirm('Approve this student?')) return;
    try {
      const { error } = await API.client.from('users').update({ verification_status: 'verified' }).eq('auth_id', authId);
      if (error) throw error;
      Utils.toast('✅ Student approved!', 'success');
      this.fetchPending();
    } catch (err) {
      console.error(err);
      Utils.toast('Failed to approve. Check permissions.', 'error');
    }
  },

  async reject(authId) {
    if (!confirm('Reject this student? This is permanent.')) return;
    try {
      const { error } = await API.client.from('users').update({ verification_status: 'rejected' }).eq('auth_id', authId);
      if (error) throw error;
      Utils.toast('🚫 Student rejected.', 'info');
      this.fetchPending();
    } catch (err) {
      console.error(err);
      Utils.toast('Failed to reject. Check permissions.', 'error');
    }
  },

  /* ─── In-Place Moderation Actions ─── */

  async nukeSpill(spillId) {
    if (!confirm('🚨 NUKE THIS SPILL? This is permanent.')) return;
    const success = await API.deleteSpill(spillId);
    if (success) {
      Utils.toast('💥 Spill deleted from server.', 'success');
      // Update local storage to match
      Storage.removeSpill(spillId);
      if (typeof Feed !== 'undefined') Feed.render();
      if (typeof window.App !== 'undefined' && App.currentPage === 'reader') App.navigate('feed');
    } else {
      Utils.toast('Failed to delete. Check permissions.', 'error');
    }
  },

  async nukeComment(commentId) {
    if (!confirm('🚨 NUKE THIS COMMENT? This is permanent.')) return;
    const success = await API.deleteComment(commentId);
    if (success) {
      Utils.toast('💥 Comment deleted.', 'success');
      if (typeof Reader !== 'undefined' && Reader.currentSpillId) {
        Reader.render(Reader.currentSpillId); // Reload comments to clear it out
      }
    } else {
      Utils.toast('Failed to delete comment.', 'error');
    }
  },

  async banUser(authId) {
    if (!authId) {
      Utils.toast('Auth ID missing. Cannot ban.', 'error');
      return;
    }
    if (!confirm('🚨 PERMANENTLY BAN THIS AUTHOR?')) return;
    
    // Warning: AuthID may not be directly available for anonymous spills unless we attach it.
    // If the database returns authId on the spill payload, we can ban them.
    const success = await API.banUser(authId);
    if (success) {
      Utils.toast('🚫 Author has been banned.', 'success');
    } else {
      Utils.toast('Failed to ban user.', 'error');
    }
  }
};
