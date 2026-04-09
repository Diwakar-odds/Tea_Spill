/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — localStorage Persistence
   ═══════════════════════════════════════════════════ */

const Storage = {
  PREFIX: 'teaspill_',

  get(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage full or unavailable:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  // ─── User Profile ───
  getUser() {
    return this.get('user') || {
      alias: this._generateAlias(),
      aliasEmoji: ALIAS_EMOJIS[Math.floor(Math.random() * ALIAS_EMOJIS.length)],
      teaPoints: 0,
      spills: 0,
      reactions: 0,
      badges: ['first_visit'],
      joined: new Date().toISOString(),
      college: null,
      department: null,
      savedSpills: [],
      myReactions: {}   // { spillId: ['sip','fire'] }
    };
  },

  saveUser(user) {
    this.set('user', user);
  },

  // ─── Spills ───
  getSpills() {
    const stored = this.get('spills');
    if (!stored || stored.length === 0) {
      // Seed with mock data
      this.set('spills', MOCK_SPILLS);
      return [...MOCK_SPILLS];
    }
    return stored;
  },

  saveSpills(spills) {
    this.set('spills', spills);
  },

  addSpill(spill) {
    const spills = this.getSpills();
    spills.unshift(spill);
    this.saveSpills(spills);
    return spills;
  },

  // ─── Colleges ───
  getColleges() {
    const custom = this.get('custom_colleges') || [];
    return [...DEFAULT_COLLEGES, ...custom];
  },

  addCollege(college) {
    const custom = this.get('custom_colleges') || [];
    custom.push(college);
    this.set('custom_colleges', custom);
    return this.getColleges();
  },

  // ─── Helper ───
  _generateAlias() {
    const adj = ALIASES_ADJECTIVES[Math.floor(Math.random() * ALIASES_ADJECTIVES.length)];
    const noun = ALIASES_NOUNS[Math.floor(Math.random() * ALIASES_NOUNS.length)];
    return `${adj} ${noun}`;
  }
};
