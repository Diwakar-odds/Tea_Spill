/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Admin Verification Portal
   Allows admins to review and approve/reject ID cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Admin = {
  async render() {
    const page = document.getElementById('page-admin');
    page.innerHTML = `
      <div class="page-header" style="padding:var(--space-xl) var(--space-lg) var(--space-md);">
        <h1 class="page-title">🛡️ Admin Portal</h1>
        <p class="page-subtitle">Pending User Verifications</p>
      </div>
      <div id="admin-content" style="padding: 0 var(--space-lg);">
        <div style="text-align:center; padding: 40px; color:var(--text-tertiary);">
          Loading pending IDs... ☕
        </div>
      </div>
    `;

    this.fetchPending();
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
        <div class="admin-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-lg);">
          ${data.map(user => {
            const dob = new Date(user.dob);
            const diffMs = Date.now() - dob.getTime();
            const age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
            return `
            <div class="admin-card" style="background:var(--bg-card); border:1px solid var(--border-default); border-radius:var(--radius-lg); overflow:hidden;">
              <a href="${user.id_url}" target="_blank">
                <div style="height: 200px; background: url('${user.id_url}') center/cover no-repeat; border-bottom:1px solid var(--border-subtle);"></div>
              </a>
              <div style="padding:var(--space-md);">
                <div style="font-size:var(--font-size-md); font-weight:700; color:var(--text-primary);">${user.username}</div>
                <div style="font-size:var(--font-size-sm); color:var(--text-secondary); margin-bottom:var(--space-md);">Age: ${age} (DOB: ${user.dob})</div>
                <div style="display:flex; gap:var(--space-sm);">
                  <button class="btn btn-primary" style="flex:1;" onclick="Admin.approve('${user.auth_id}')">✅ Approve</button>
                  <button class="btn btn-ghost" style="flex:1; border-color:var(--rose); color:var(--rose);" onclick="Admin.reject('${user.auth_id}')">🚫 Reject</button>
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
  }
};
