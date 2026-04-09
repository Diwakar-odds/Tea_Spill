/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — localStorage Persistence
   ═══════════════════════════════════════════════════ */

const Storage = {
  PREFIX: 'teaspill_',
  _jsonColleges: [],   // loaded from colleges.json
  _jsonLoaded: false,

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

  // ─── Load colleges.json ───
  async loadCollegesJSON() {
    if (this._jsonLoaded) return;
    try {
      const resp = await fetch('data/colleges.json');
      const data = await resp.json();
      const icons = { IIT: '🏛️', NIT: '🎓', IIIT: '💻', IIM: '📊', IISER: '🔬', AIIMS: '🏥', Private: '🏫', Government: '🎓', 'Private University': '🏫', 'Deemed University': '🏫', 'State University': '📚', 'Central University': '📚', 'Central Institute': '🏛️' };
      let id = 0;
      this._jsonColleges = [];
      for (const stateObj of data.states) {
        for (const c of stateObj.colleges) {
          this._jsonColleges.push({
            id: 'json_' + (id++),
            name: c.name,
            city: c.city,
            state: stateObj.state,
            icon: icons[c.type] || '🏫',
            verified: true
          });
        }
      }
      this._jsonLoaded = true;
    } catch (e) {
      console.warn('Could not load colleges.json, using defaults:', e);
    }
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
    // Merge: DEFAULT_COLLEGES (from data.js) + JSON colleges + user-added
    // De-duplicate by name
    const all = [...DEFAULT_COLLEGES, ...this._jsonColleges, ...custom];
    const seen = new Set();
    return all.filter(c => {
      const key = c.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
