/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Reader View
   ═══════════════════════════════════════════════════ */

const Reader = {
  currentSpillId: null,

  render(spillId) {
    this.currentSpillId = spillId;
    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === spillId);
    if (!spill) return;

    const college = Utils.getCollege(spill.collegeId);
    const category = Utils.getCategory(spill.category);
    const temp = Utils.teaTemperature(spill.reactions);
    const user = Storage.getUser();
    const myReactions = user.myReactions?.[spill.id] || [];
    const page = document.getElementById('page-reader');

    page.innerHTML = `
      <div class="reader">
        <button class="reader-back" onclick="App.goBack()">← Back to feed</button>

        <div class="reader-header">
          ${category ? `<span class="reader-category">${category.emoji} ${category.name}</span>` : ''}
          <h1 class="reader-title">${Utils.escapeHtml(spill.title)}</h1>

          <div class="reader-meta">
            <div class="reader-author">
              <div class="reader-author-avatar">${spill.aliasEmoji}</div>
              <div>
                <div class="reader-author-name">${Utils.escapeHtml(spill.alias)}</div>
                <div class="reader-author-detail">${spill.timeAgo} · ${college ? Utils.escapeHtml(college.name) : 'Unknown College'}${spill.department ? ` · ${spill.department}` : ''}</div>
              </div>
            </div>
            <div class="spill-temp ${temp.class}">${temp.label} · ${Utils.formatNumber(temp.score)}</div>
          </div>
        </div>

        <div class="reader-divider"></div>

        <div class="reader-body">
          ${Utils.textToParagraphs(spill.body)}
        </div>

        <!-- Reactions -->
        <div class="reader-reactions">
          ${REACTIONS.map(r => `
            <button class="reaction-btn ${myReactions.includes(r.id) ? 'active' : ''}"
                    data-reaction="${r.id}"
                    onclick="Reader.react('${r.id}')">
              <span>${r.emoji}</span>
              <span>${Utils.formatNumber(spill.reactions[r.id] || 0)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Comments -->
        <div class="comments-section">
          <h2 class="comments-title">💬 Comments (${spill.comments ? spill.comments.length : 0})</h2>

          <div class="comment-input-wrapper">
            <textarea id="comment-input" placeholder="Drop your take..." rows="2"></textarea>
            <button class="btn btn-primary btn-sm" onclick="Reader.addComment()" style="align-self: flex-end;">Send</button>
          </div>

          <div id="comments-list">
            ${(spill.comments || []).map(c => `
              <div class="comment">
                <div class="comment-avatar">${c.emoji}</div>
                <div class="comment-content">
                  <div class="comment-author">${Utils.escapeHtml(c.alias)}</div>
                  <div class="comment-time">${c.time}</div>
                  <div class="comment-body">${Utils.escapeHtml(c.body)}</div>
                </div>
              </div>
            `).join('')}
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

  addComment() {
    const input = document.getElementById('comment-input');
    const body = input.value.trim();
    if (!body) return;

    const spills = Storage.getSpills();
    const spill = spills.find(s => s.id === this.currentSpillId);
    if (!spill) return;

    const alias = Utils.randomAlias();
    const comment = {
      alias: alias.name,
      emoji: alias.emoji,
      body,
      time: 'Just now'
    };

    if (!spill.comments) spill.comments = [];
    spill.comments.push(comment);
    Storage.saveSpills(spills);

    // Update user stats
    const user = Storage.getUser();
    user.teaPoints += 2;
    Storage.saveUser(user);

    Utils.toast('💬 Comment posted!', 'success');
    this.render(this.currentSpillId);
  }
};
