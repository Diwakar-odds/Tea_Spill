/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Utility Helpers
   ═══════════════════════════════════════════════════ */

'use strict';

const Utils = {
  /**
   * Generate a unique ID with prefix.
   * @returns {string}
   */
  uid() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /**
   * Generate a random alias with emoji.
   * @returns {{ name: string, emoji: string }}
   */
  randomAlias() {
    const adj = ALIASES_ADJECTIVES[Math.floor(Math.random() * ALIASES_ADJECTIVES.length)];
    const noun = ALIASES_NOUNS[Math.floor(Math.random() * ALIASES_NOUNS.length)];
    const emoji = ALIAS_EMOJIS[Math.floor(Math.random() * ALIAS_EMOJIS.length)];
    return { name: `${adj} ${noun}`, emoji };
  },

  /**
   * Calculate tea temperature label based on total reactions.
   * @param {{ [key: string]: number }} reactions
   * @returns {{ label: string, class: string, score: number }}
   */
  teaTemperature(reactions) {
    const total = this.totalReactions(reactions);
    if (total > 2000) return { label: '☢️ Nuclear', class: 'temp-nuclear', score: total };
    if (total > 1000) return { label: '🔥 On Fire', class: 'temp-fire', score: total };
    if (total > 500)  return { label: '🌶️ Hot',     class: 'temp-hot', score: total };
    if (total > 100)  return { label: '☕ Warm',    class: 'temp-warm', score: total };
    return { label: '🧊 Fresh', class: 'temp-cold', score: total };
  },

  /** Sum all reaction values. */
  totalReactions(reactions) {
    if (!reactions) return 0;
    return Object.values(reactions).reduce((a, b) => a + b, 0);
  },

  /** Escape HTML to prevent XSS. */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /** Convert body text to HTML paragraphs. */
  textToParagraphs(text) {
    if (!text) return '';
    return text.split(/\n\n+/).map(p =>
      `<p>${this.escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`
    ).join('');
  },

  /** Format large numbers with K/M suffix. */
  formatNumber(num) {
    if (typeof num !== 'number') num = parseInt(num) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000)    return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  /** Get a college object by ID. */
  getCollege(id) {
    if (!id) return null;
    return Storage.getColleges().find(c => c.id === id) || null;
  },

  /** Get a category object by ID. */
  getCategory(id) {
    if (!id) return null;
    return CATEGORIES.find(c => c.id === id) || null;
  },

  /** Get today's daily challenge prompt. */
  dailyChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
  },

  /**
   * Sort spills by strategy.
   * @param {Array} spills
   * @param {'trending'|'hot'|'new'|'top'} sortBy
   * @returns {Array}
   */
  sortSpills(spills, sortBy) {
    const copy = [...spills];
    switch (sortBy) {
      case 'hot':
        return copy.sort((a, b) => this.totalReactions(b.reactions) - this.totalReactions(a.reactions));
      case 'new':
        return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      case 'top':
        return copy.sort((a, b) => {
          const scoreA = (a.reactions?.sip || 0) + (a.reactions?.fire || 0);
          const scoreB = (b.reactions?.sip || 0) + (b.reactions?.fire || 0);
          return scoreB - scoreA;
        });
      case 'trending':
      default:
        return copy.sort((a, b) => this.totalReactions(b.reactions) - this.totalReactions(a.reactions));
    }
  },

  /** Filter spills by category. */
  filterByCategory(spills, category) {
    if (!category || category === 'all') return spills;
    return spills.filter(s => s.category === category);
  },

  /** Filter spills by college. */
  filterByCollege(spills, collegeId) {
    if (!collegeId) return spills;
    return spills.filter(s => s.collegeId === collegeId);
  },

  /**
   * Show a toast notification.
   * @param {string} message
   * @param {'info'|'success'|'error'} type
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
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

  /** Count spills for a given category. */
  categoryCount(spills, categoryId) {
    return spills.filter(s => s.category === categoryId).length;
  },

  /** Count spills for a given college. */
  collegeSpillCount(spills, collegeId) {
    return spills.filter(s => s.collegeId === collegeId).length;
  },

  /**
   * Debounce a function.
   * @param {Function} fn
   * @param {number} ms
   * @returns {Function}
   */
  debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
};
