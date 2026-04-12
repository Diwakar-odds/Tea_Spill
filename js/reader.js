/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Reader View
   Full article reader with reactions, comments,
   save/bookmark, report, and shareable cards.
   ═══════════════════════════════════════════════════ */

'use strict';

const Reader = {
  currentSpillId: null,

  async render(spillId) {
    this.currentSpillId = spillId;
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) {
      App.navigate('feed');
      return;
    }

    let cloudComments = [];
    if (window.API && API.isLive) {
      cloudComments = await API.fetchComments(spillId);
    } else {
      cloudComments = spill.comments || [];
    }

    const college = Utils.getCollege(spill.collegeId);
    const category = Utils.getCategory(spill.category);
    const temp = Utils.teaTemperature(spill.reactions);
    const user = Storage.getUser();
    const myReactions = user.myReactions?.[spill.id] || [];
    const isSaved = user.savedSpills.includes(spill.id);
    const isReported = user.reportedSpills?.includes(spill.id);
    const page = document.getElementById('page-reader');

    page.innerHTML = `
      <div class="reader">
        <button class="reader-back" onclick="App.goBack()">← Back</button>

        <div class="reader-header">
          ${category ? `<span class="reader-category">${category.emoji} ${category.name}</span>` : ''}
          <h1 class="reader-title">${Utils.escapeHtml(spill.title)}</h1>

          <div class="reader-meta">
            <div class="reader-author">
              <div class="reader-author-avatar">${spill.aliasEmoji}</div>
              <div>
                <div class="reader-author-name">${Utils.escapeHtml(spill.alias)}</div>
                <div class="reader-author-detail">
                  ${spill.timeAgo} · ${college ? Utils.escapeHtml(college.name) : 'Unknown'}${spill.department ? ' · ' + spill.department : ''}${spill.section ? ' · ' + spill.section : ''}
                </div>
              </div>
            </div>
            <div class="spill-temp ${temp.class}">${temp.label} · ${Utils.formatNumber(temp.score)}</div>
          </div>
        </div>

        <div class="reader-divider"></div>

        <div class="reader-body">${Utils.textToParagraphs(spill.body)}</div>

        <!-- Action Bar -->
        <div class="reader-actions" style="display:flex;gap:var(--space-md);padding:var(--space-lg) 0;border-top:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);margin:var(--space-xl) 0;flex-wrap:wrap">
          ${REACTIONS.map(r => `
            <button class="reaction-btn ${myReactions.includes(r.id) ? 'active' : ''}"
                    onclick="Reader.react('${r.id}')">
              <span>${r.emoji}</span>
              <span>${Utils.formatNumber(spill.reactions[r.id] || 0)}</span>
            </button>
          `).join('')}

          <div style="flex:1"></div>

          <button class="btn-icon" onclick="Reader.toggleSave()" title="${isSaved ? 'Unsave' : 'Save'}" style="${isSaved ? 'color:var(--amber);border-color:var(--amber)' : ''}">
            ${isSaved ? '🔖' : '📌'}
          </button>
          <button class="btn-icon" onclick="Reader.shareCard()" title="Share">
            📤
          </button>
          <button class="btn-icon" onclick="Reader.openReport()" title="Report" ${isReported ? 'disabled style="opacity:0.4"' : ''}>
            ${isReported ? '✅' : '🚩'}
          </button>
        </div>

        <!-- Comments -->
        <div class="comments-section">
          <h2 class="comments-title">💬 Comments (${cloudComments.length})</h2>

          <div class="comment-input-wrapper">
            <textarea id="comment-input" placeholder="Drop your take..." rows="2"></textarea>
            <button class="btn btn-primary btn-sm" onclick="Reader.addComment()" style="align-self:flex-end">Send</button>
          </div>

          <div id="comments-list">
            ${cloudComments.map(c => `
              <div class="comment">
                <div class="comment-avatar">${c.alias_emoji || c.emoji || '👻'}</div>
                <div class="comment-content">
                  <div class="comment-author">${Utils.escapeHtml(c.alias)}</div>
                  <div class="comment-time">${c.time || 'A while ago'}</div>
                  <div class="comment-body">${Utils.escapeHtml(c.body)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Report Modal (hidden) -->
      <div id="report-modal" class="report-modal-overlay hidden" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000">
        <div style="background:var(--bg-modal);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:var(--space-2xl);max-width:400px;width:90%">
          <h3 style="margin-bottom:var(--space-lg)">🚩 Report this spill</h3>
          <div style="display:flex;flex-direction:column;gap:var(--space-sm)" id="report-options">
            <button class="btn btn-ghost" onclick="Reader.submitReport('bullying')">🎯 Bullying / Harassment</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('fake')">🧢 Fake / Misleading</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('personal_info')">🔒 Contains Personal Info</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('hate_speech')">🚫 Hate Speech</button>
            <button class="btn btn-ghost" onclick="Reader.submitReport('spam')">📧 Spam</button>
          </div>
          <button class="btn btn-ghost" onclick="Reader.closeReport()" style="margin-top:var(--space-lg);width:100%">Cancel</button>
        </div>
      </div>

      <!-- Share Card Preview (hidden) -->
      <div id="share-modal" class="share-modal-overlay hidden" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000;padding:var(--space-lg)">
        <div style="background:var(--bg-modal);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:var(--space-2xl);max-width:440px;width:100%">
          <h3 style="margin-bottom:var(--space-lg)">📤 Share this spill</h3>
          <div id="share-card-preview"></div>
          <div style="display:flex;gap:var(--space-md);margin-top:var(--space-lg)">
            <button class="btn btn-primary" onclick="Reader.copyShareText()" style="flex:1">📋 Copy Text</button>
            <button class="btn btn-ghost" onclick="Reader.closeShare()" style="flex:1">Close</button>
          </div>
        </div>
      </div>
    `;
  },

  react(reactionId) {
    if (!this.currentSpillId) return;
    Feed.react(this.currentSpillId, reactionId);
    this.render(this.currentSpillId);
  },

  async addComment() {
    const input = document.getElementById('comment-input');
    const body = input.value.trim();
    if (!body) return;

    const user = Storage.getUser();
    input.value = '';

    if (window.API && API.isLive) {
      input.disabled = true;
      const success = await API.postComment(this.currentSpillId, body, user.alias, user.aliasEmoji);
      input.disabled = false;
      if (!success) { Utils.toast('Failed to post comment', 'error'); return; }
    } else {
      // Local Fallback
      const spills = Storage.getSpills();
      const spill = spills.find(s => s.id === this.currentSpillId);
      if (!spill.comments) spill.comments = [];
      spill.comments.push({ alias: user.alias, emoji: user.aliasEmoji, body, time: 'Just now' });
      Storage.saveSpills(spills);
    }

    user.teaPoints += 2;
    Storage.saveUser(user);

    Utils.toast('💬 Comment posted!', 'success');
    this.render(this.currentSpillId);
  },

  toggleSave() {
    const user = Storage.getUser();
    const idx = user.savedSpills.indexOf(this.currentSpillId);
    if (idx > -1) {
      user.savedSpills.splice(idx, 1);
      Utils.toast('📌 Removed from saved', 'info');
    } else {
      user.savedSpills.push(this.currentSpillId);
      user.teaPoints += 1;
      Utils.toast('🔖 Saved!', 'success');
    }
    Storage.saveUser(user);
    this.render(this.currentSpillId);
  },

  /* ─── Report ─── */

  openReport() {
    document.getElementById('report-modal').classList.remove('hidden');
  },

  closeReport() {
    document.getElementById('report-modal').classList.add('hidden');
  },

  submitReport(reason) {
    Storage.addReport({
      spillId: this.currentSpillId,
      reason,
      timestamp: new Date().toISOString()
    });

    const user = Storage.getUser();
    if (!user.reportedSpills) user.reportedSpills = [];
    user.reportedSpills.push(this.currentSpillId);
    Storage.saveUser(user);

    this.closeReport();
    Utils.toast('🚩 Report submitted. Thank you for keeping Tea Spill safe.', 'success');
    this.render(this.currentSpillId);
  },

  /* ─── Share Card ─── */

  shareCard() {
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === this.currentSpillId);
    if (!spill) return;

    const category = Utils.getCategory(spill.category);
    const college = Utils.getCollege(spill.collegeId);
    const temp = Utils.teaTemperature(spill.reactions);

    document.getElementById('share-card-preview').innerHTML = `
      <div style="background:linear-gradient(135deg,#0a0a0f,#16161f);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-xl);font-family:var(--font-family)">
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-md)">
          <span style="font-size:1.2rem">☕</span>
          <span style="font-weight:800;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Tea Spill</span>
          <span style="margin-left:auto;font-size:var(--font-size-xs);color:var(--text-muted)">${temp.label}</span>
        </div>
        ${category ? `<span style="display:inline-block;font-size:var(--font-size-xs);color:var(--amber);background:var(--amber-soft);padding:2px 10px;border-radius:var(--radius-full);margin-bottom:var(--space-sm)">${category.emoji} ${category.name}</span>` : ''}
        <h4 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-sm);line-height:1.4">${Utils.escapeHtml(spill.title)}</h4>
        <p style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${Utils.escapeHtml(spill.body)}</p>
        <div style="display:flex;align-items:center;gap:var(--space-md);margin-top:var(--space-md);font-size:var(--font-size-xs);color:var(--text-muted)">
          <span>${spill.aliasEmoji} ${Utils.escapeHtml(spill.alias)}</span>
          <span>·</span>
          <span>${college ? college.name : ''}</span>
          <span style="margin-left:auto">${Utils.formatNumber(Utils.totalReactions(spill.reactions))} reactions</span>
        </div>
      </div>
    `;

    document.getElementById('share-modal').classList.remove('hidden');
  },

  copyShareText() {
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === this.currentSpillId);
    if (!spill) return;

    const college = Utils.getCollege(spill.collegeId);
    const text = `☕ Tea Spill\n\n"${spill.title}"\n\n${spill.body.slice(0, 200)}...\n\n— ${spill.alias} | ${college ? college.name : 'Unknown'}\n\n🔥 ${Utils.formatNumber(Utils.totalReactions(spill.reactions))} reactions on Tea Spill`;

    navigator.clipboard.writeText(text).then(() => {
      Utils.toast('📋 Copied to clipboard!', 'success');
    }).catch(() => {
      Utils.toast('📋 Could not copy — try manually', 'error');
    });
  },

  closeShare() {
    document.getElementById('share-modal').classList.add('hidden');
  }
};
