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
      alias: 'Tea User',
      aliasEmoji: '👤',
      teaPoints: 0,
      spills: 0,
      reactions: 0,
      badges: ['first_visit'],
      joined: new Date().toISOString(),
      college: null,
      department: null,
      savedSpills: [],
      mySpillIds: [],
      myReactions: {},
      followedPages: [],
      joinedGroups: [],
      subscribedChannels: [],
      reportedSpills: []
    };
  },

  saveUser(user, skipCloudSync = false) { 
    this.set('user', user); 
    
    // Cross-device sync stores only minimal public profile fields.
    if (!skipCloudSync && window.API && API.client) {
      const safeProfile = {
        alias: user.alias,
        aliasEmoji: user.aliasEmoji,
        teaPoints: user.teaPoints || 0,
        spills: user.spills || 0,
        reactions: user.reactions || 0,
        joined: user.joined || new Date().toISOString(),
        collegeName: user.collegeName || null,
        department: user.department || null
      };

      API.client.auth.updateUser({ 
        data: { tea_profile: safeProfile } 
      }).catch(err => console.warn('[Cloud Sync] Meta backup failed:', err));
    }
  },

  /* ─── Spills ─── */

  getSpills() {
    const stored = this.get('spills');
    if (!stored || stored.length === 0) {
      // In live mode, never inject mock data — wait for cloud sync to populate.
      if (window.API && API.isLive) {
        return [];
      }
      this.set('spills', MOCK_SPILLS);
      return [...MOCK_SPILLS];
    }
    return stored;
  },

  saveSpills(spills) { 
    this.set('spills', spills); 
  },

  async addSpill(spill) {
    if (window.App && App.isReadOnly && App.isReadOnly()) {
      if (window.Utils && Utils.toast) {
        Utils.toast('Your account is pending verification. You cannot post yet.', 'error');
      }
      return { ok: false, error: 'Your account is pending verification.' };
    }

    // In live mode, write to cloud first to prevent phantom local posts.
    if (window.API && API.isLive && API.client) {
      const authId = await API.getCurrentUserId();
      if (!authId) {
        return { ok: false, error: 'You must be signed in to post.' };
      }

      const profile = typeof API.getMyProfile === 'function'
        ? await API.getMyProfile(authId)
        : null;
      if (!profile) {
        return { ok: false, error: 'Could not load your profile details.' };
      }

      const profileCollegeName = String(profile.college_name || '').trim();
      if (!profileCollegeName) {
        return { ok: false, error: 'Please complete your college profile details first.' };
      }

      const mediaUrls = Array.isArray(spill.mediaUrls) ? spill.mediaUrls : [];
      const profileCollegeId = this._buildCollegeIdFromName(profileCollegeName);
      const displayAlias = String(profile.username || spill.alias || 'Tea User').trim() || 'Tea User';

      const payload = {
        spill_id: spill.id,
        user_id: authId,
        college_id: profileCollegeId,
        college_name: profileCollegeName,
        department: profile.department || null,
        section: profile.section || null,
        category: spill.category,
        title: spill.title,
        body: spill.body,
        alias: displayAlias,
        alias_emoji: '👤',
        media_urls: mediaUrls,
        self_destruct: spill.selfDestruct || false,
        reactions: { sip: 0, fire: 0, shook: 0, dead: 0, cap: 0 }
      };

      const { error } = await API.client.from('spills').insert([payload]);
      if (error) {
        console.warn('[Storage] Failed to push spill to Supabase:', error);
        if (/media_urls/i.test(error.message || '') && /column/i.test(error.message || '')) {
          return {
            ok: false,
            error: 'Database missing spill image column. Run the spill media SQL migration.'
          };
        }
        return {
          ok: false,
          error: error.message || 'Cloud write failed',
          raw: error
        };
      }

      // Pull canonical rows from cloud after successful insert.
      await this.syncSpillsFromCloud();
      return { ok: true };
    }

    const spills = this.getSpills();
    spill.alias = spill.alias || 'Tea User';
    spill.aliasEmoji = '👤';
    spill.mediaUrls = Array.isArray(spill.mediaUrls) ? spill.mediaUrls : [];
    spills.unshift(spill);
    this.saveSpills(spills);
    return { ok: true };
  },

  removeSpill(spillId) {
    let spills = this.getSpills();
    spills = spills.filter(s => s.id !== spillId);
    this.saveSpills(spills);
    
    // [Supabase] Background Sync: Remove from cloud
    if (API.isLive && API.client) {
      API.client.from('spills').delete().eq('spill_id', spillId)
        .then(({ error }) => {
          if (error) console.warn('[Storage] Failed to delete spill from Supabase:', error);
        });
    }

    return spills;
  },

  /**
   * [Supabase] Fetch latest spills from the cloud and update local cache.
   * This allows the UI to remain instantaneous using local data,
   * while getting fresh data in the background.
   */
  async syncSpillsFromCloud() {
    if (!API.isLive || !API.client) return;
    try {
      const { data, error } = await API.client.from('spills').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.warn('[Storage] Supabase sync failed:', error);
        return;
      }

      // Map Supabase structure back to our local JS camelCase format
      const cloudSpills = data.map(r => ({
        id: r.spill_id,
        userId: r.user_id,
        collegeId: r.college_id,
        collegeName: r.college_name,
        department: r.department,
        section: r.section,
        category: r.category,
        title: r.title,
        body: r.body,
        alias: r.alias || 'Tea User',
        aliasEmoji: r.alias_emoji || '👤',
        mediaUrls: Array.isArray(r.media_urls) ? r.media_urls : [],
        selfDestruct: r.self_destruct,
        reactions: r.reactions || { sip: 0, fire: 0, shook: 0, dead: 0, cap: 0 },
        createdAt: new Date(r.created_at).getTime()
      }));

      // Update local storage explicitly, including the empty state.
      this.saveSpills(cloudSpills);

      // Reconcile local user spill counters with canonical cloud data.
      const currentAuthId = await API.getCurrentUserId();
      if (currentAuthId) {
        const myCloudSpillIds = cloudSpills
          .filter(s => s.userId === currentAuthId)
          .map(s => s.id);

        const user = this.getUser();
        user.mySpillIds = myCloudSpillIds;
        user.spills = myCloudSpillIds.length;
        this.saveUser(user, true);
      }

      console.log('[Storage] Live spills synced from Supabase.');
    } catch (e) {
      console.warn('[Storage] Background sync exception:', e);
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

  _buildCollegeIdFromName(name) {
    const normalized = String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return normalized ? `profile_${normalized}` : `profile_${Date.now()}`;
  },

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
