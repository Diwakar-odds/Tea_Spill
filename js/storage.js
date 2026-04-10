/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — localStorage Persistence Layer
   ═══════════════════════════════════════════════════ */

'use strict';

const Storage = {
  PREFIX: 'teaspill_',
  _jsonColleges: [],
  _jsonLoaded: false,

  /**
   * Read a value from localStorage.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  /**
   * Write a value to localStorage.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[Storage] quota exceeded or unavailable:', e);
    }
  },

  /** Remove a key from localStorage. */
  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  /* ─── Colleges JSON loader ─── */

  async loadCollegesJSON() {
    if (this._jsonLoaded) return;
    try {
      const resp = await fetch('data/colleges.json');
      const data = await resp.json();
      const ICONS = {
        IIT: '🏛️', NIT: '🎓', IIIT: '💻', IIM: '📊',
        IISER: '🔬', AIIMS: '🏥', Private: '🏫',
        Government: '🎓', 'Private University': '🏫',
        'Deemed University': '🏫', 'State University': '📚',
        'Central University': '📚', 'Central Institute': '🏛️'
      };
      let id = 0;
      this._jsonColleges = [];
      for (const stateObj of data.states) {
        for (const c of stateObj.colleges) {
          this._jsonColleges.push({
            id: 'json_' + (id++),
            name: c.name,
            city: c.city,
            state: stateObj.state,
            icon: ICONS[c.type] || '🏫',
            verified: true
          });
        }
      }
      this._jsonLoaded = true;
    } catch (e) {
      console.warn('[Storage] colleges.json unavailable, using defaults:', e);
    }
  },

  /* ─── User ─── */

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
      myReactions: {},
      followedPages: [],
      joinedGroups: [],
      subscribedChannels: [],
      reportedSpills: []
    };
  },

  saveUser(user) { this.set('user', user); },

  /* ─── Spills ─── */

  getSpills() {
    const stored = this.get('spills');
    if (!stored || stored.length === 0) {
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

    // [PocketBase] Background Sync: Push new spill to cloud
    if (API.isLive && API.pb) {
      // Don't await, let it run in background
      API.pb.collection('spills').create({
        spillId: spill.id,
        title: spill.title,
        body: spill.body,
        category: spill.category,
        template: spill.template,
        alias: spill.alias,
        aliasEmoji: spill.aliasEmoji,
        collegeId: spill.collegeId,
        date: spill.date,
        isSelfDestruct: spill.isSelfDestruct || false,
        reactions: spill.reactions || { cold: 0, warm: 0, hot: 0, fire: 0, nuclear: 0 },
        comments: spill.comments || []
      }).catch(err => console.warn('[Storage] Failed to push spill to cloud:', err));
    }

    return spills;
  },

  removeSpill(spillId) {
    let spills = this.getSpills();
    spills = spills.filter(s => s.id !== spillId);
    this.saveSpills(spills);
    
    // [PocketBase] Background Sync: Remove from cloud
    if (API.isLive && API.pb) {
      API.pb.collection('spills').getFirstListItem(`spillId="${spillId}"`)
        .then(record => API.pb.collection('spills').delete(record.id))
        .catch(err => console.warn('[Storage] Failed to delete spill from cloud:', err));
    }

    return spills;
  },

  /**
   * [PocketBase] Fetch latest spills from the cloud and update local cache.
   * This allows the UI to remain instantaneous using local data,
   * while getting fresh data in the background.
   */
  async syncSpillsFromCloud() {
    if (!API.isLive || !API.pb) return;
    try {
      const records = await API.pb.collection('spills').getFullList({ sort: '-created' });
      
      // Map PocketBase structure back to our local format
      const cloudSpills = records.map(r => ({
        id: r.spillId,
        title: r.title,
        body: r.body,
        category: r.category,
        template: r.template,
        alias: r.alias,
        aliasEmoji: r.aliasEmoji,
        collegeId: r.collegeId,
        date: r.date,
        isSelfDestruct: r.isSelfDestruct,
        reactions: r.reactions,
        comments: r.comments
      }));

      // Update local storage explicitly
      if (cloudSpills.length > 0) {
        this.saveSpills(cloudSpills);
        console.log('[Storage] Live spills synced from cloud.');
      }
    } catch (e) {
      console.warn('[Storage] Background sync failed:', e);
    }
  },

  /* ─── Colleges ─── */

  getColleges() {
    const custom = this.get('custom_colleges') || [];
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

  /* ─── Pages / Groups / Channels ─── */

  getPages()    { return this.get('pages')    || [...MOCK_PAGES]; },
  getGroups()   { return this.get('groups')   || [...MOCK_GROUPS]; },
  getChannels() { return this.get('channels') || [...MOCK_CHANNELS]; },

  savePages(p)    { this.set('pages', p); },
  saveGroups(g)   { this.set('groups', g); },
  saveChannels(c) { this.set('channels', c); },

  /* ─── Reports / Moderation ─── */

  getReports() { return this.get('reports') || []; },

  addReport(report) {
    const reports = this.getReports();
    reports.push(report);
    this.set('reports', reports);
  },

  /* ─── Awards ─── */

  getAwards() { return this.get('awards') || []; },
  saveAwards(a) { this.set('awards', a); },

  /* ─── Helpers ─── */

  _generateAlias() {
    const adj = ALIASES_ADJECTIVES[Math.floor(Math.random() * ALIASES_ADJECTIVES.length)];
    const noun = ALIASES_NOUNS[Math.floor(Math.random() * ALIASES_NOUNS.length)];
    return `${adj} ${noun}`;
  }
};
