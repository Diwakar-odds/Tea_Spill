/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Supabase API Layer
   Handles database connection and Google auth.
   ═══════════════════════════════════════════════════ */

'use strict';

const API = {
  // TODO: Replace these with your actual Supabase URL and ANON Key
  SUPABASE_URL: 'https://zcxpcozoblyjwquqnwoc.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjeHBjb3pvYmx5andxdXFud29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDU3MzQsImV4cCI6MjA5MTQyMTczNH0.WC77QdODgBNYXtRjl3EEjnzMJgsPP38dwwZtjyPHPsE',

  // TODO: Replace with your Google OAuth Web Client ID
  GOOGLE_CLIENT_ID: '426631892589-gf3ldbjt0cuh2pu63ghes7v4s8iuhqi9.apps.googleusercontent.com',

  client: null,
  isLive: false,

  init() {
    try {
      if (typeof supabase !== 'undefined') {
        if (this.SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
          this.client = supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
          this.isLive = true;
          console.log('[API] Connected to Supabase Cloud Database.');
        } else {
          console.warn('[API] Supabase URL not set. Running in Local Mode.');
        }
      }
    } catch (e) {
      console.warn('[API] Failed to initialize Supabase SDK.', e);
    }
  },

  async signInWithGoogle() {
    if (!this.isLive) {
      // Fake login for local dev
      localStorage.setItem('teaspill_sb_auth', JSON.stringify({
        userId: 'local_dev_user',
        email: 'dev@student.edu'
      }));
      window.location.reload();
      return true;
    }

    // Hide main app chrome and show the Google login overlay
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen && typeof google !== 'undefined') {
      document.getElementById('sidebar').style.display = 'none';
      document.getElementById('main-content').style.display = 'none';
      document.getElementById('bottom-nav').style.display = 'none';
      loginScreen.classList.remove('hidden');
      loginScreen.classList.add('visible');

      // Initialize Native Google Identity Services
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: this._handleGoogleCallback.bind(this)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        { theme: 'filled_black', size: 'large', shape: 'rectangular', text: 'signin_with' }
      );
    } else {
      console.error("[API] Google Identity script not loaded or login screen missing.");
    }
  },

  async _handleGoogleCallback(response) {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.innerHTML = '<div style="text-align:center;padding:40px;color:white;font-size:1.2rem;">Authenticating... ☕</div>';
    }

    try {
      const { data, error } = await this.client.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential
      });
      if (error) throw error;

      // Successfully authenticated! Re-trigger App.init() to route them properly
      window.location.reload();
    } catch (error) {
      console.error('[API Auth] Google Token Sign-In Error:', error);
      alert("Failed to authenticate with Google via ID Token. Please check your Client ID or origin.");
      window.location.reload();
    }
  },

  async signOut() {
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
      return localStorage.getItem('teaspill_sb_auth') ? { user: { id: 'local_dev_user', email: 'dev@student.edu' } } : null;
    }
    const { data: { session }, error } = await this.client.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async checkVerificationStatus(userId) {
    if (!this.isLive) {
      const status = localStorage.getItem('teaspill_verification') || 'unverified';
      return { status, isAdmin: false };
    }
    const { data, error } = await this.client
      .from('users')
      .select('verification_status, is_admin')
      .eq('auth_id', userId)
      .single();

    if (error || !data) return { status: 'unverified', isAdmin: false };
    return { status: data.verification_status, isAdmin: data.is_admin };
  },

  /**
   * Called during onboarding after verifying age, College ID, and parameters.
   */
  async submitVerificationDetails(userId, dob, idFileUrl, realName, collegeName, department, section) {
    if (!this.isLive) {
      localStorage.setItem('teaspill_verification', 'pending');
      return true;
    }

    // Check if user record exists
    const { data: existingUser } = await this.client
      .from('users')
      .select('id, verification_status')
      .eq('auth_id', userId)
      .single();

    let result;
    if (existingUser) {
      if (existingUser.verification_status !== 'unverified') {
        alert('Warning: An identity is already registered for this account.');
        return false;
      }

      result = await this.client.from('users').update({
        dob: dob,
        id_url: idFileUrl,
        real_name: realName,
        college_name: collegeName,
        department: department,
        section: section,
        verification_status: 'pending'
      }).eq('auth_id', userId);
    } else {
      result = await this.client.from('users').insert([{
        auth_id: userId,
        username: 'user_' + Math.random().toString(36).substr(2, 9),
        tea_points: 0,
        dob: dob,
        id_url: idFileUrl,
        real_name: realName,
        college_name: collegeName,
        department: department,
        section: section,
        verification_status: 'pending'
      }]);
    }

    if (result.error) {
      if (result.error.code === '23505') {
        console.warn('[API Auth] Profile already exists, ignoring duplicate insert.');
        // If it's a duplicate key, they are already inserted! 
        return true; 
      }
      console.error('[API Auth] Failed to submit verification:', result.error);
      alert('Database Update Error: ' + result.error.message);
      return false;
    }
    return true;
  },

  /**
   * For uploading the college ID photo to storage
   */
  async uploadCollegeId(file) {
    if (!this.isLive) {
      // Simulate file upload
      return 'https://fake-storage.com/bucket/fake_id.png';
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `verification_ids/${fileName}`;

    const { error: uploadError } = await this.client.storage
      .from('verification_ids')
      .upload(filePath, file);

    if (uploadError) {
      console.error('[API Auth] Upload failed:', uploadError);
      return null;
    }

    const { data } = this.client.storage.from('verification_ids').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /* ─── Comments & Interactions ─── */

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
      const { error } = await this.client.from('comments').insert([{
        auth_id: this.session.user.id,
        spill_id: spillId,
        body,
        alias,
        alias_emoji: aliasEmoji
      }]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] postComment error:', err);
      return false;
    }
  },

  async reactToSpill(spillId, reactionId) {
    if (!this.isLive) return false;
    try {
      // Read-Modify-Write pattern for JSONB
      const { data: fetch, error: fetchErr } = await this.client
        .from('spills')
        .select('reactions')
        .eq('spill_id', spillId)
        .single();
      if (fetchErr) throw fetchErr;

      const currentReactions = fetch.reactions || { sip: 0, fire: 0, shook: 0, dead: 0, cap: 0 };
      
      // Safety increment
      if (typeof currentReactions[reactionId] === 'number') {
        currentReactions[reactionId] += 1;
      } else {
        currentReactions[reactionId] = 1;
      }

      // Push back up
      const { error: pushErr } = await this.client
        .from('spills')
        .update({ reactions: currentReactions })
        .eq('spill_id', spillId);
      if (pushErr) throw pushErr;
      
      return true;
    } catch (err) {
      console.error('[API] reactToSpill error:', err);
      return false;
    }
  },

  /* ─── Admin Moderation Hooks ─── */

  async deleteSpill(spillId) {
    if (!this.isLive) return false;
    try {
      const { error } = await this.client.from('spills').delete().eq('spill_id', spillId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] deleteSpill error:', err);
      return false;
    }
  },

  async deleteComment(commentId) {
    if (!this.isLive) return false;
    try {
      const { error } = await this.client.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] deleteComment error:', err);
      return false;
    }
  },

  async banUser(userId) {
    if (!this.isLive) return false;
    try {
      // Provide the users table UUID instead of the auth_id
      const { error } = await this.client.from('users').update({ verification_status: 'banned' }).eq('id', userId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[API] banUser error:', err);
      return false;
    }
  }
};

// Initialize the API handler immediately
API.init();
