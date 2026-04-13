/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Supabase API Layer
   Auth, verification, moderation, reactions, reports.
   ═══════════════════════════════════════════════════ */

'use strict';

const API = {
  SUPABASE_URL: '',
  SUPABASE_KEY: '',
  GOOGLE_CLIENT_ID: '',
  ALLOW_INSECURE_DB_FALLBACK: false,

  client: null,
  session: null,
  isLive: false,

  _readRuntimeConfig() {
    const runtime =
      typeof window.TEA_SPILL_CONFIG === 'object' && window.TEA_SPILL_CONFIG
        ? window.TEA_SPILL_CONFIG
        : {};

    return {
      supabaseUrl: runtime.SUPABASE_URL || '',
      supabaseKey: runtime.SUPABASE_KEY || '',
      googleClientId: runtime.GOOGLE_CLIENT_ID || '',
      allowInsecureFallback: !!runtime.ALLOW_INSECURE_DB_FALLBACK
    };
  },

  init() {
    const cfg = this._readRuntimeConfig();
    this.SUPABASE_URL = cfg.supabaseUrl;
    this.SUPABASE_KEY = cfg.supabaseKey;
    this.GOOGLE_CLIENT_ID = cfg.googleClientId;
    this.ALLOW_INSECURE_DB_FALLBACK = cfg.allowInsecureFallback;

    try {
      if (typeof supabase === 'undefined') {
        console.warn('[API] Supabase SDK not loaded. Running in Local Mode.');
        return;
      }

      if (this.SUPABASE_URL && this.SUPABASE_KEY) {
        this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
        this.isLive = true;
        console.log('[API] Connected to Supabase Cloud Database.');
      } else {
        console.warn('[API] Runtime config missing. Running in Local Mode.');
      }
    } catch (e) {
      console.warn('[API] Failed to initialize Supabase SDK.', e);
    }
  },

  setSession(session) {
    this.session = session || null;
  },

  async signInWithGoogle() {
    if (!this.isLive) {
      // Local development fallback
      localStorage.setItem(
        'teaspill_sb_auth',
        JSON.stringify({
          userId: 'local_dev_user',
          email: 'dev@student.edu'
        })
      );
      window.location.reload();
      return true;
    }

    if (!this.GOOGLE_CLIENT_ID) {
      console.error('[API] Missing GOOGLE_CLIENT_ID runtime config.');
      alert('Missing Google Client ID configuration.');
      return false;
    }

    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && typeof google !== 'undefined') {
      document.getElementById('sidebar').style.display = 'none';
      document.getElementById('main-content').style.display = 'none';
      document.getElementById('bottom-nav').style.display = 'none';
      loginScreen.classList.remove('hidden');
      loginScreen.classList.add('visible');

      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: this._handleGoogleCallback.bind(this)
      });

      google.accounts.id.renderButton(document.getElementById('google-btn-container'), {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with'
      });
    } else {
      console.error('[API] Google Identity script not loaded or login screen missing.');
    }

    return false;
  },

  async _handleGoogleCallback(response) {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.innerHTML =
        '<div style="text-align:center;padding:40px;color:white;font-size:1.2rem;">Authenticating... ☕</div>';
    }

    try {
      const { data, error } = await this.client.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential
      });
      if (error) throw error;

      this.setSession(data.session || null);
      window.location.reload();
    } catch (error) {
      console.error('[API Auth] Google Token Sign-In Error:', error);
      alert('Failed to authenticate with Google. Please verify your client configuration.');
      window.location.reload();
    }
  },

  async signOut() {
    this.setSession(null);
    if (!this.isLive) {
      localStorage.removeItem('teaspill_sb_auth');
      window.location.href = 'index.html';
      return;
    }
    await this.client.auth.signOut();
    window.location.href = 'index.html';
  },

  async getUserSession() {
    if (!this.isLive) {
      return localStorage.getItem('teaspill_sb_auth')
        ? { user: { id: 'local_dev_user', email: 'dev@student.edu' } }
        : null;
    }

    const {
      data: { session },
      error
    } = await this.client.auth.getSession();

    if (error || !session) {
      this.setSession(null);
      return null;
    }

    this.setSession(session);
    return session;
  },

  async getCurrentUserId() {
    if (!this.isLive) return 'local_dev_user';
    if (this.session && this.session.user && this.session.user.id) return this.session.user.id;

    const { data, error } = await this.client.auth.getUser();
    if (error || !data || !data.user) return null;

    if (!this.session) this.session = {};
    this.session.user = data.user;
    return data.user.id;
  },

  _normalizeUsername(value) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 32);
  },

  _buildDefaultUsername() {
    let candidate = '';

    if (
      this.session &&
      this.session.user &&
      this.session.user.user_metadata &&
      this.session.user.user_metadata.tea_profile
    ) {
      candidate = this.session.user.user_metadata.tea_profile.alias || '';
    }

    if (!candidate && typeof Storage !== 'undefined' && Storage.getUser) {
      const local = Storage.getUser();
      candidate = local && local.alias ? local.alias : '';
    }

    if (!candidate && this.session && this.session.user && this.session.user.email) {
      const emailPrefix = String(this.session.user.email).split('@')[0] || '';
      candidate = `user_${emailPrefix}`;
    }

    const normalized = this._normalizeUsername(candidate);
    return normalized || `user_${Math.random().toString(36).slice(2, 11)}`;
  },

  async getOrCreateUserProfile(userId) {
    if (!this.isLive || !this.client) return null;

    const authId = userId || (await this.getCurrentUserId());
    if (!authId) return null;

    const cols =
      'id, auth_id, username, real_name, college_name, department, section, dob, id_url, tea_points, verification_status, is_admin, created_at';
    const { data: existing, error: fetchError } = await this.client
      .from('users')
      .select(cols)
      .eq('auth_id', authId)
      .maybeSingle();

    if (fetchError) {
      console.error('[API Auth] getOrCreateUserProfile fetch error:', fetchError);
      return null;
    }

    if (existing) return existing;

    const username = this._buildDefaultUsername();

    const { data: created, error: createError } = await this.client
      .from('users')
      .insert([
        {
          auth_id: authId,
          username,
          tea_points: 0,
          verification_status: 'unverified'
        }
      ])
      .select(cols)
      .maybeSingle();

    if (createError) {
      if (createError.code === '23505') {
        const { data: retry, error: retryError } = await this.client
          .from('users')
          .select(cols)
          .eq('auth_id', authId)
          .maybeSingle();

        if (retryError) {
          console.error('[API Auth] getOrCreateUserProfile retry fetch error:', retryError);
          return null;
        }

        return retry || null;
      }

      console.error('[API Auth] getOrCreateUserProfile create error:', createError);
      return null;
    }

    return created || null;
  },

  async getMyProfile(userId) {
    if (!this.isLive || !this.client) return null;
    return this.getOrCreateUserProfile(userId);
  },

  async _requireAdmin() {
    const userId = await this.getCurrentUserId();
    if (!userId) return false;
    const verif = await this.checkVerificationStatus(userId);
    return !!verif.isAdmin;
  },

  async _callAdminRpc(functionName, params, insecureFallbackFn) {
    try {
      const { data, error } = await this.client.rpc(functionName, params);
      if (!error) return { ok: true, data };

      console.error(`[API] RPC ${functionName} failed:`, error);

      if (this.ALLOW_INSECURE_DB_FALLBACK && typeof insecureFallbackFn === 'function') {
        const fallbackOk = await insecureFallbackFn();
        return { ok: !!fallbackOk, data: null, fallback: true };
      }

      return { ok: false, error };
    } catch (err) {
      console.error(`[API] RPC ${functionName} exception:`, err);
      return { ok: false, error: err };
    }
  },

  async checkVerificationStatus(userId) {
    if (!this.isLive) {
      const status = localStorage.getItem('teaspill_verification') || 'unverified';
      return { status, isAdmin: false };
    }

    const authId = userId || (await this.getCurrentUserId());
    if (!authId) return { status: 'unverified', isAdmin: false };

    const { data, error } = await this.client
      .from('users')
      .select('verification_status, is_admin')
      .eq('auth_id', authId)
      .maybeSingle();

    if (error) {
      console.error('[API Auth] checkVerificationStatus Error:', error);
      return { status: 'unverified', isAdmin: false };
    }

    if (!data) {
      const profile = await this.getOrCreateUserProfile(authId);
      if (!profile) return { status: 'unverified', isAdmin: false };
      return {
        status: profile.verification_status || 'unverified',
        isAdmin: !!profile.is_admin
      };
    }

    return {
      status: data.verification_status || 'unverified',
      isAdmin: !!data.is_admin
    };
  },

  async getAdminUsers(status = 'all') {
    if (!this.isLive || !this.client) return [];
    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return [];

    try {
      const params = status && status !== 'all' ? { p_status: status } : {};
      const { data, error } = await this.client.rpc('get_admin_users', params);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[API] getAdminUsers error:', err);

      if (!this.ALLOW_INSECURE_DB_FALLBACK) return [];

      let query = this.client.from('users').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') query = query.eq('verification_status', status);
      const { data, error } = await query;
      if (error) {
        console.error('[API] getAdminUsers fallback failed:', error);
        return [];
      }
      return data || [];
    }
  },

  async setUserVerificationStatus(authId, status) {
    if (!this.isLive || !authId) return false;

    const allowed = ['verified', 'rejected', 'pending', 'banned'];
    if (!allowed.includes(status)) return false;

    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return false;

    const result = await this._callAdminRpc(
      'admin_set_user_status',
      { p_target_auth_id: authId, p_status: status },
      async () => {
        const { error } = await this.client
          .from('users')
          .update({ verification_status: status })
          .eq('auth_id', authId);
        return !error;
      }
    );

    return result.ok;
  },

  async submitVerificationDetails(userId, dob, idFilePath, realName, collegeName, department, section) {
    if (!this.isLive) {
      localStorage.setItem('teaspill_verification', 'pending');
      return true;
    }

    const { data: existingUser, error: existingError } = await this.client
      .from('users')
      .select('id, verification_status')
      .eq('auth_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('[API Auth] Failed to check existing profile:', existingError);
      alert('Could not load your profile. Please try again.');
      return false;
    }

    const persistedUsername = this._buildDefaultUsername();

    let result;
    if (existingUser) {
      if (existingUser.verification_status !== 'unverified') {
        alert('Warning: An identity is already registered for this account.');
        return false;
      }

      result = await this.client
        .from('users')
        .update({
          username: persistedUsername,
          dob,
          id_url: idFilePath,
          real_name: realName,
          college_name: collegeName,
          department,
          section,
          verification_status: 'pending'
        })
        .eq('auth_id', userId);
    } else {
      result = await this.client.from('users').insert([
        {
          auth_id: userId,
          username: persistedUsername,
          tea_points: 0,
          dob,
          id_url: idFilePath,
          real_name: realName,
          college_name: collegeName,
          department,
          section,
          verification_status: 'pending'
        }
      ]);
    }

    if (result.error) {
      if (result.error.code === '23505') {
        console.warn('[API Auth] Profile already exists, ignoring duplicate insert.');
        return true;
      }
      console.error('[API Auth] Failed to submit verification:', result.error);
      alert('Database Update Error: ' + result.error.message);
      return false;
    }

    return true;
  },

  async uploadCollegeId(file) {
    if (!file) return null;

    if (!this.isLive) {
      return 'verification_ids/local-dev-id.png';
    }

    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please upload an image file only.');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum allowed size is 10MB.');
      return null;
    }

    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = rawExt.replace(/[^a-z0-9]/g, '').slice(0, 6) || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
    const filePath = `verification_ids/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from('verification_ids')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error('[API Auth] Upload failed:', uploadError);
      return null;
    }

    // Store private path. Admins resolve this to a short-lived signed URL when needed.
    return filePath;
  },

  async uploadSpillImage(file) {
    if (!file) return null;
    if (!this.isLive || !this.client) return null;

    if (!file.type || !file.type.startsWith('image/')) {
      console.warn('[API Spill] Non-image file rejected.');
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.warn('[API Spill] File too large.');
      return null;
    }

    const authId = await this.getCurrentUserId();
    if (!authId) return null;

    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = rawExt.replace(/[^a-z0-9]/g, '').slice(0, 6) || 'jpg';
    const filePath = `${authId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

    const { error: uploadError } = await this.client.storage
      .from('spill_media')
      .upload(filePath, file, { upsert: false, contentType: file.type || 'image/jpeg' });

    if (uploadError) {
      console.error('[API Spill] Upload failed:', uploadError);
      return null;
    }

    const { data } = this.client.storage.from('spill_media').getPublicUrl(filePath);
    return data && data.publicUrl ? data.publicUrl : null;
  },

  async resolveVerificationUrl(idReference, expiresIn = 300) {
    if (!idReference) return null;
    const ref = String(idReference).trim();
    if (!ref) return null;

    if (/^https?:\/\//i.test(ref)) {
      // Legacy records may still contain historical public URLs.
      return ref;
    }

    if (!this.isLive || !this.client) return null;

    const { data, error } = await this.client.storage
      .from('verification_ids')
      .createSignedUrl(ref, expiresIn);

    if (error) {
      console.error('[API] Failed to sign verification URL:', error);
      return null;
    }

    return data && data.signedUrl ? data.signedUrl : null;
  },

  async fetchComments(spillId) {
    if (!this.isLive) return [];
    try {
      const { data, error } = await this.client
        .from('comments')
        .select('*')
        .eq('spill_id', spillId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[API] fetchComments error:', err);
      return [];
    }
  },

  async postComment(spillId, body, alias, aliasEmoji) {
    if (!this.isLive) return false;
    try {
      const authId = await this.getCurrentUserId();
      if (!authId) return false;

      const { error } = await this.client.from('comments').insert([
        {
          auth_id: authId,
          spill_id: spillId,
          body,
          alias,
          alias_emoji: aliasEmoji
        }
      ]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] postComment error:', err);
      return false;
    }
  },

  async reactToSpill(spillId, reactionId) {
    if (!this.isLive) return { ok: true, reactions: null };

    try {
      const authId = await this.getCurrentUserId();
      if (!authId) return { ok: false, error: 'unauthorized' };

      const { data, error } = await this.client.rpc('set_spill_reaction', {
        p_spill_id: spillId,
        p_reaction: reactionId
      });
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      return { ok: true, reactions: row && row.reactions ? row.reactions : null };
    } catch (err) {
      console.error('[API] reactToSpill error:', err);

      if (this.ALLOW_INSECURE_DB_FALLBACK) {
        try {
          const { data: fetch, error: fetchErr } = await this.client
            .from('spills')
            .select('reactions')
            .eq('spill_id', spillId)
            .single();
          if (fetchErr) throw fetchErr;

          const currentReactions = fetch.reactions || {
            sip: 0,
            fire: 0,
            shook: 0,
            dead: 0,
            cap: 0
          };
          currentReactions[reactionId] = (currentReactions[reactionId] || 0) + 1;

          const { error: pushErr } = await this.client
            .from('spills')
            .update({ reactions: currentReactions })
            .eq('spill_id', spillId);
          if (pushErr) throw pushErr;

          return { ok: true, reactions: currentReactions };
        } catch (fallbackErr) {
          console.error('[API] reactToSpill fallback error:', fallbackErr);
        }
      }

      return { ok: false, error: err };
    }
  },

  async submitReport(spillId, reason) {
    if (!this.isLive) return false;

    try {
      const authId = await this.getCurrentUserId();
      if (!authId) return false;

      const { error } = await this.client.from('reports').insert([
        {
          spill_id: spillId,
          reason,
          auth_id: authId,
          status: 'open'
        }
      ]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] submitReport error:', err);
      return false;
    }
  },

  async fetchReports() {
    if (!this.isLive) return [];
    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return [];

    try {
      const { data, error } = await this.client
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[API] fetchReports error:', err);
      return [];
    }
  },

  async resolveReport(reportId, status = 'resolved') {
    if (!this.isLive || !reportId) return false;
    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return false;

    const result = await this._callAdminRpc(
      'admin_resolve_report',
      { p_report_id: reportId, p_status: status },
      async () => {
        const { error } = await this.client
          .from('reports')
          .update({ status })
          .eq('id', reportId)
          .eq('status', 'open');
        return !error;
      }
    );

    return result.ok;
  },

  async deleteSpill(spillId) {
    if (!this.isLive) return false;
    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return false;

    const result = await this._callAdminRpc(
      'admin_delete_spill',
      { p_spill_id: spillId },
      async () => {
        const { error } = await this.client.from('spills').delete().eq('spill_id', spillId);
        return !error;
      }
    );

    return result.ok;
  },

  async deleteComment(commentId) {
    if (!this.isLive) return false;
    const isAdmin = await this._requireAdmin();
    if (!isAdmin) return false;

    const result = await this._callAdminRpc(
      'admin_delete_comment',
      { p_comment_id: commentId },
      async () => {
        const { error } = await this.client.from('comments').delete().eq('id', commentId);
        return !error;
      }
    );

    return result.ok;
  },

  async banUser(userAuthId) {
    return this.setUserVerificationStatus(userAuthId, 'banned');
  }
};

// Initialize immediately
API.init();
