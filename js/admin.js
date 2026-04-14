/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Admin Verification Portal
   Allows admins to review and approve/reject ID cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Admin = {
  _tab: 'pending',

  _safe(value, fallback = '—') {
    if (value === null || value === undefined || value === '') return fallback;
    return Utils.escapeHtml(String(value));
  },

  async _attachSignedIdUrls(users) {
    if (!Array.isArray(users) || users.length === 0) return [];

    const brokenNetlifyPattern = /^https?:\/\/[^/]*spill-wise\.netlify\.app\/verification_ids\/(.+)$/i;

    const signed = await Promise.all(
      users.map(async (user) => {
        let idUrl = null;
        if (window.API && typeof API.resolveVerificationUrl === 'function') {
          idUrl = await API.resolveVerificationUrl(user.id_url, 3600);

          // If any legacy/broken Netlify path slips through, retry once using object key only.
          if (typeof idUrl === 'string') {
            const match = idUrl.match(brokenNetlifyPattern);
            if (match && match[1]) {
              idUrl = await API.resolveVerificationUrl(match[1], 3600);
            }
          }
        } else {
          idUrl = null;
        }

        if (typeof idUrl === 'string' && brokenNetlifyPattern.test(idUrl)) {
          // Never expose broken static-site paths in admin preview links.
          idUrl = null;
        }

        return { ...user, signed_id_url: idUrl };
      })
    );

    return signed;
  },

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
        <button id="admin-tab-reports" class="btn btn-ghost btn-sm" onclick="Admin._switchTab('reports')">🚩 Reports</button>
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
    document.getElementById('admin-tab-pending').className =
      tab === 'pending' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
    document.getElementById('admin-tab-all').className =
      tab === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
    document.getElementById('admin-tab-reports').className =
      tab === 'reports' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';

    if (tab === 'pending') this.fetchPending();
    else if (tab === 'all') this.fetchAll();
    else this.fetchReports();
  },

  async fetchAll() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">Loading all users... ☕</div>';

    if (!API.isLive || !API.client) {
      container.innerHTML = '<div style="color:var(--rose);">Live database not connected.</div>';
      return;
    }

    try {
      const data = await API.getAdminUsers('all');

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
              const safeName = this._safe(user.real_name || user.username || '—');
              const safeUsername = this._safe(user.username || '');
              const safeEmail = this._safe(user.email || 'Missing');
              const safeCollege = this._safe(user.college_name || '—');
              const safeDepartment = this._safe(user.department || '—');
              const authId = String(user.auth_id || '').replace(/'/g, "\\'");

              return `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:10px 12px;">
                  <div style="font-weight:600; color:var(--text-primary);">${safeName}</div>
                  <div style="color:var(--text-tertiary); font-size:11px;">${safeUsername}</div>
                  <div style="color:var(--text-secondary); font-size:11px; font-weight:600; margin-top:4px;">📧 ${safeEmail}</div>
                </td>
                <td style="padding:10px 12px; color:var(--text-secondary);">${safeCollege}</td>
                <td style="padding:10px 12px; color:var(--text-tertiary);">${safeDepartment}</td>
                <td style="padding:10px 12px;">
                  <span style="background:${s.bg}; color:${s.color}; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600;">${s.label}</span>
                </td>
                <td style="padding:10px 12px; text-align:right;">
                  <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">
                    ${user.verification_status !== 'verified' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:#22c55e; border-color:#22c55e;" onclick="Admin.approve('${authId}')">✅ Approve</button>` : ''}
                    ${user.verification_status !== 'rejected' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--amber); border-color:var(--amber);" onclick="Admin.reject('${authId}')">⛔ Reject</button>` : ''}
                    ${user.verification_status !== 'banned' ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--rose); border-color:var(--rose);" onclick="Admin.banUser('${authId}')">🚫 Ban</button>` : ''}
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
      const data = await API.getAdminUsers('pending');
      const users = await this._attachSignedIdUrls(data);

      if (!users || users.length === 0) {
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
          ${users.map(user => {
            const dob = user.dob ? new Date(user.dob) : null;
            const validDob = dob && !Number.isNaN(dob.getTime());
            const diffMs = validDob ? Date.now() - dob.getTime() : 0;
            const age = validDob ? Math.abs(new Date(diffMs).getUTCFullYear() - 1970) : null;

            const safeName = this._safe(user.real_name || '—');
            const safeUsername = this._safe(user.username || '—');
            const safeEmail = this._safe(user.email || '—');
            const safeCollege = this._safe(user.college_name || '—');
            const safeDepartment = this._safe(user.department || '—');
            const safeSection = this._safe(user.section || '—');
            const safeDob = this._safe(user.dob || '—');
            const authId = String(user.auth_id || '').replace(/'/g, "\\'");

            const resolvedUrl = String(user.signed_id_url || '').trim();
            const hasSignedUrl =
              /^https?:\/\//i.test(resolvedUrl) &&
              !/^https?:\/\/[^/]*spill-wise\.netlify\.app\/verification_ids\//i.test(resolvedUrl);
            const safeSignedUrl = hasSignedUrl ? Utils.escapeHtml(resolvedUrl) : '';
            const rawIdReference = this._safe(user.id_url || '—');

            return `
            <div class="admin-card" style="background:var(--bg-card); border:1px solid var(--border-default); border-radius:var(--radius-lg); overflow:hidden;">
              <!-- ID Card Photo -->
              ${hasSignedUrl ? `
              <a href="${safeSignedUrl}" target="_blank" rel="noopener noreferrer" title="Click to view full ID">
                <div style="height:180px; border-bottom:1px solid var(--border-subtle); position:relative; overflow:hidden; background:#111;">
                  <img src="${safeSignedUrl}" alt="Student ID" style="width:100%; height:100%; object-fit:cover;" />
                  <span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;padding:3px 8px;border-radius:99px;">🔍 View Full ID</span>
                </div>
              </a>
              ` : `
              <div style="height:180px; border-bottom:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:center; color:var(--text-tertiary); background:#111;">
                <div style="text-align:center; padding: 10px 14px; font-size:12px; line-height:1.4;">
                  <div style="margin-bottom:6px; color:var(--text-secondary);">No ID preview available</div>
                  <div style="word-break:break-all; color:var(--text-muted);">${rawIdReference}</div>
                </div>
              </div>
              `}

              <!-- User Details -->
              <div style="padding:var(--space-md);">
                <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); margin-bottom:var(--space-md);">
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0; white-space:nowrap;">👤 Name</td>
                    <td style="color:var(--text-primary); font-weight:600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🏷️ Username</td>
                    <td style="color:var(--text-secondary);">${safeUsername}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">📧 Email</td>
                    <td style="color:var(--text-secondary); font-weight:600;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🏫 College</td>
                    <td style="color:var(--text-primary); font-weight:600;">${safeCollege}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">📚 Dept</td>
                    <td style="color:var(--text-secondary);">${safeDepartment}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">📅 Section</td>
                    <td style="color:var(--text-secondary);">${safeSection}</td>
                  </tr>
                  <tr>
                    <td style="color:var(--text-tertiary); padding:4px 8px 4px 0;">🎂 Age</td>
                    <td style="color:var(--text-secondary);">${age !== null ? age + ' yrs' : '—'} (DOB: ${safeDob})</td>
                  </tr>
                </table>

                <!-- Action Buttons -->
                <div style="display:flex; gap:var(--space-sm); flex-wrap:wrap;">
                  <button class="btn btn-primary" style="flex:1; min-width:100px;" onclick="Admin.approve('${authId}')">✅ Approve</button>
                  <button class="btn btn-ghost" style="flex:1; min-width:100px; border-color:var(--amber); color:var(--amber);" onclick="Admin.reject('${authId}')">⛔ Reject</button>
                  <button class="btn btn-ghost" style="width:100%; border-color:var(--rose); color:var(--rose); margin-top:var(--space-xs);" onclick="Admin.banUser('${authId}')">🚫 Permanently Ban</button>
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

  async fetchReports() {
    const container = document.getElementById('admin-content');
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">Loading reports... ☕</div>';

    if (!API.isLive || !API.client) {
      container.innerHTML = '<div style="color:var(--rose);">Live database not connected.</div>';
      return;
    }

    try {
      const reports = await API.fetchReports();
      const openReports = reports.filter((r) => !r.status || r.status === 'open');

      if (openReports.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding: 80px 20px;">
            <div style="font-size:3rem; opacity:0.5; margin-bottom:10px;">✅</div>
            <h3 style="color:var(--text-secondary);">No open reports</h3>
            <p style="color:var(--text-tertiary);">The moderation queue is clear.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm);">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default); color:var(--text-tertiary); text-align:left;">
              <th style="padding:10px 12px;">Reported At</th>
              <th style="padding:10px 12px;">Reason</th>
              <th style="padding:10px 12px;">Spill</th>
              <th style="padding:10px 12px;">Reporter</th>
              <th style="padding:10px 12px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${openReports
              .map((report) => {
                const reportId = String(report.id || '').replace(/'/g, "\\'");
                const spillId = String(report.spill_id || '').replace(/'/g, "\\'");
                const safeReason = this._safe(report.reason || 'unspecified');
                const safeReporter = this._safe(report.auth_id || 'unknown');
                const safeSpill = this._safe(report.spill_id || 'unknown');
                const safeDate = this._safe(
                  report.created_at ? new Date(report.created_at).toLocaleString('en-IN') : 'Unknown'
                );

                return `
                  <tr style="border-bottom:1px solid var(--border-subtle);">
                    <td style="padding:10px 12px; color:var(--text-secondary);">${safeDate}</td>
                    <td style="padding:10px 12px; color:var(--text-primary); font-weight:600;">${safeReason}</td>
                    <td style="padding:10px 12px; color:var(--text-secondary);">${safeSpill}</td>
                    <td style="padding:10px 12px; color:var(--text-tertiary);">${safeReporter}</td>
                    <td style="padding:10px 12px; text-align:right;">
                      <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">
                        <button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:#22c55e; border-color:#22c55e;" onclick="Admin.resolveReport('${reportId}','resolved')">✅ Resolve</button>
                        <button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--amber); border-color:var(--amber);" onclick="Admin.resolveReport('${reportId}','dismissed')">📝 Dismiss</button>
                        ${spillId ? `<button class="btn btn-ghost" style="font-size:11px; padding:3px 10px; color:var(--rose); border-color:var(--rose);" onclick="Admin.nukeSpill('${spillId}')">🗑️ Nuke Spill</button>` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="color:var(--rose);">Error loading reports.</div>';
    }
  },

  async resolveReport(reportId, status) {
    if (!reportId) return;

    const ok = await API.resolveReport(reportId, status || 'resolved');
    if (!ok) {
      Utils.toast('Failed to update report status.', 'error');
      return;
    }

    Utils.toast('Report status updated.', 'success');
    if (this._tab === 'reports') this.fetchReports();
  },

  async approve(authId) {
    if (!confirm('Approve this student?')) return;
    try {
      const success = await API.setUserVerificationStatus(authId, 'verified');
      if (!success) throw new Error('Unable to approve user.');
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
      const success = await API.setUserVerificationStatus(authId, 'rejected');
      if (!success) throw new Error('Unable to reject user.');
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
