/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Supabase API Layer
   Handles database connection and Google auth.
   ═══════════════════════════════════════════════════ */

'use strict';

const API = {
  // TODO: Replace these with your actual Supabase URL and ANON Key
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_KEY: 'YOUR_ANON_KEY',
  
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
    
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/app.html'
        }
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[API Auth] Google Sign-In Error:', error);
      return false;
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
      return { status };
    }
    const { data, error } = await this.client
      .from('users')
      .select('verification_status')
      .eq('auth_id', userId)
      .single();
      
    if (error || !data) return { status: 'unverified' };
    return { status: data.verification_status };
  },

  /**
   * Called during onboarding after verifying age and College ID.
   */
  async submitVerificationDetails(userId, dob, idFileUrl) {
    if (!this.isLive) {
      localStorage.setItem('teaspill_verification', 'pending');
      return true;
    }
    
    // Check if user record exists
    const { data: existingUser } = await this.client
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    let result;
    if (existingUser) {
      result = await this.client.from('users').update({
        dob: dob,
        id_url: idFileUrl,
        verification_status: 'pending'
      }).eq('auth_id', userId);
    } else {
      result = await this.client.from('users').insert([{
        auth_id: userId,
        username: 'user_' + Math.random().toString(36).substr(2, 9),
        tea_points: 0,
        badges: ['verified_student'],
        dob: dob,
        id_url: idFileUrl,
        verification_status: 'pending'
      }]);
    }

    if (result.error) {
      console.error('[API Auth] Failed to submit verification:', result.error);
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
  }
};

// Initialize the API handler immediately
API.init();
