/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Supabase API Layer
   Handles database connection and anonymous auth.
   ═══════════════════════════════════════════════════ */

'use strict';

const API = {
  // TODO: Replace these with your actual Supabase URL and ANON Key
  // Example: 'https://xyz.supabase.co'
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_KEY: 'YOUR_ANON_KEY',
  
  client: null,
  isLive: false,

  init() {
    try {
      if (typeof supabase !== 'undefined') {
        // If the URL is actually configured, we are running in Live Mode
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

  /**
   * Authenticates the user silently.
   * Supabase expects a true Identity for Row Level Security.
   * We generate a random username and register them silently.
   */
  async authenticateUser(alias, emoji) {
    if (!this.isLive) return true; // Pretend it worked if in local mode

    try {
      // 1. Check if we already have credentials stored
      const storedCreds = localStorage.getItem('teaspill_sb_auth');
      
      if (storedCreds) {
        // We already created an identity on the server, just use the local cache to remember who we are.
        // For a more advanced setup, you could use true Supabase Auth tokens here.
        return true;
      }

      // 2. We are a NEW user. Generate a random identity
      const rawUsername = 'user_' + Math.random().toString(36).substr(2, 9);
      
      // We manually insert them into our 'users' public table 
      // (This bypasses needing them to type an email/password)
      const { data, error } = await this.client.from('users').insert([{
        username: rawUsername,
        alias: alias,
        alias_emoji: emoji,
        tea_points: 5,
        badges: ['first_visit']
      }]).select();

      if (error) {
        console.error('[API Auth] Failed to register user to Supabase:', error);
        return false;
      }

      // Save credentials to browser memory so we know who we are next time
      if (data && data[0]) {
        localStorage.setItem('teaspill_sb_auth', JSON.stringify({
          userId: data[0].id,
          username: rawUsername
        }));
      }

      return true;

    } catch (error) {
      console.error('[API Auth] Error during automatic sign-in:', error);
      return false;
    }
  }
};

// Initialize the API handler immediately
API.init();
