/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — PocketBase API Layer
   Handles database connection and anonymous auth.
   ═══════════════════════════════════════════════════ */

'use strict';

const API = {
  // TODO: Replace this with your actual PocketHost URL once you create it
  // Example: 'https://teaspill.pockethost.io'
  PB_URL: 'https://APP_URL_HERE.pockethost.io',
  pb: null,
  isLive: false,

  init() {
    try {
      if (typeof PocketBase !== 'undefined') {
        this.pb = new PocketBase(this.PB_URL);
        
        // If the URL is actually configured, we are running in Live Mode
        if (this.PB_URL !== 'https://APP_URL_HERE.pockethost.io') {
          this.isLive = true;
          console.log('[API] Connected to PocketBase Cloud Database.');
        } else {
          console.warn('[API] PocketBase URL not set. Running in Local Mode.');
        }
      }
    } catch (e) {
      console.warn('[API] Failed to initialize PocketBase SDK.', e);
    }
  },

  /**
   * Authenticates the user anonymously.
   * In PocketBase, we achieve this by auto-generating a unique username/password
   * for first-time visitors and saving those credentials securely in localStorage.
   */
  async authenticateUser(alias, emoji) {
    if (!this.isLive) return true; // Pretend it worked if in local mode

    try {
      // 1. Check if we already have credentials stored from a previous session
      const storedCreds = localStorage.getItem('teaspill_pb_auth');
      
      if (storedCreds) {
        // We are a returning user. Just log back in.
        const { username, password } = JSON.parse(storedCreds);
        await this.pb.collection('users').authWithPassword(username, password);
        return true;
      }

      // 2. We are a NEW user. Generate a random identity.
      const rawUsername = 'user_' + Math.random().toString(36).substr(2, 9);
      const rawPassword = Math.random().toString(36).substr(2, 12) + '!A'; // meets PB complexity rules

      // Create the record in PocketBase
      await this.pb.collection('users').create({
        username: rawUsername,
        password: rawPassword,
        passwordConfirm: rawPassword,
        alias: alias,
        aliasEmoji: emoji,
        teaPoints: 5,
        badges: ['first_visit']
      });

      // Login immediately with the new account
      await this.pb.collection('users').authWithPassword(rawUsername, rawPassword);

      // Save credentials to browser memory so they stay logged in forever
      localStorage.setItem('teaspill_pb_auth', JSON.stringify({
        username: rawUsername,
        password: rawPassword
      }));

      return true;

    } catch (error) {
      console.error('[API Auth] Error during automatic sign-in:', error);
      return false;
    }
  }
};

// Initialize the API handler immediately
API.init();
