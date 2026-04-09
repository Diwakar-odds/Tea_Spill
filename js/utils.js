/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Utility Helpers
   ═══════════════════════════════════════════════════ */

const Utils = {
  // Generate a unique ID
  uid() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // Generate a random alias
  randomAlias() {
    const adj = ALIASES_ADJECTIVES[Math.floor(Math.random() * ALIASES_ADJECTIVES.length)];
    const noun = ALIASES_NOUNS[Math.floor(Math.random() * ALIASES_NOUNS.length)];
    const emoji = ALIAS_EMOJIS[Math.floor(Math.random() * ALIAS_EMOJIS.length)];
    return { name: `${adj} ${noun}`, emoji };
  },

  // Calculate tea temperature label based on total reactions
  teaTemperature(reactions) {
    const total = Object.values(reactions).reduce((a, b) => a + b, 0);
    if (total > 2000) return { label: '🔥 Nuclear', class: 'temp-nuclear', score: total };
    if (total > 1000) return { label: '🔥 On Fire', class: 'temp-fire', score: total };
    if (total > 500) return { label: '🌶️ Hot', class: 'temp-hot', score: total };
    if (total > 100) return { label: '☕ Warm', class: 'temp-warm', score: total };
    return { label: '🧊 Fresh', class: 'temp-cold', score: total };
  },

  // Total reaction count
  totalReactions(reactions) {
    return Object.values(reactions).reduce((a, b) => a + b, 0);
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Convert body text to paragraphs
  textToParagraphs(text) {
    return text.split(/\n\n+/).map(p => `<p>${this.escapeHtml(p.trim())}</p>`).join('');
  },

  // Format large numbers
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  // Get college by ID
  getCollege(id) {
    return Storage.getColleges().find(c => c.id === id);
  },

  // Get category by ID
  getCategory(id) {
    return CATEGORIES.find(c => c.id === id);
  },

  // Today's daily challenge
  dailyChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
  },

  // Sort spills
  sortSpills(spills, sortBy) {
    const copy = [...spills];
    switch (sortBy) {
      case 'hot':
        return copy.sort((a, b) => this.totalReactions(b.reactions) - this.totalReactions(a.reactions));
      case 'new':
        return copy; // Already in chronological order (newest first)
      case 'top':
        return copy.sort((a, b) => {
          const aScore = (b.reactions.sip || 0) + (b.reactions.fire || 0);
          const bScore = (a.reactions.sip || 0) + (a.reactions.fire || 0);
          return aScore - bScore;
        });
      case 'trending':
      default:
        // Trending = high reactions + recency
        return copy.sort((a, b) => {
          const aTotal = this.totalReactions(a.reactions);
          const bTotal = this.totalReactions(b.reactions);
          return bTotal - aTotal;
        });
    }
  },

  // Filter spills by category
  filterByCategory(spills, category) {
    if (!category || category === 'all') return spills;
    return spills.filter(s => s.category === category);
  },

  // Filter spills by college
  filterByCollege(spills, collegeId) {
    if (!collegeId) return spills;
    return spills.filter(s => s.collegeId === collegeId);
  },

  // Show toast notification
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Count spills per category
  categoryCount(spills, categoryId) {
    return spills.filter(s => s.category === categoryId).length;
  },

  // Count spills per college
  collegeSpillCount(spills, collegeId) {
    return spills.filter(s => s.collegeId === collegeId).length;
  }
};
