/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Main Application Router
   SPA navigation, page switching, onboarding,
   delegated events.
   ═══════════════════════════════════════════════════ */

'use strict';

const ONBOARDING_EMOJIS = [
  '👻','🐱','🦊','🐺','🦅','🐍','🦉','🔮',
  '⚡','🌙','🎭','🕶️','🥷','🐉','🦁','🐯',
  '🦋','🌸','🎧','🎮','🧊','💎','🪐','🫧'
];

const App = {
  currentPage: 'feed',
  previousPage: 'feed',
  history: [],
  verificationStatus: 'unverified',
  _liveSyncTimer: null,

  /* ─── Onboarding state ─── */
  _onboardingAlias: null,
  _onboardingEmoji: null,

  async init() {
    const switchedToHosted = await this._tryHybridHostedTakeover();
    if (switchedToHosted) return;

    // Load full college database first
    await Storage.loadCollegesJSON();

    // Splash screen → then decide: onboarding or straight to app
    setTimeout(async () => {
      try {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('hidden');

        const session = await API.getUserSession();
        if (!session) {
          // User isn't logged in, redirect them specifically to Google Auth
          const googleLoginReady = await API.signInWithGoogle();
          if (!googleLoginReady) {
            console.warn('[App] Google sign-in unavailable. Entering read-only mode to avoid blank screen.');
            this._enterApp('pending');
            if (typeof Utils !== 'undefined' && Utils.toast) {
              Utils.toast('Google sign-in is temporarily unavailable in app. Running in read-only mode.', 'error');
            }
          }
          return;
        }
        this.session = session;
        if (window.API && typeof API.setSession === 'function') {
          API.setSession(session);
        }

        // Cross-Platform Sync: Clone Cloud Profile to Local Device Memory
        if (session.user && session.user.user_metadata && session.user.user_metadata.tea_profile) {
          const mergedProfile = {
            ...Storage.getUser(),
            ...session.user.user_metadata.tea_profile
          };
          Storage.saveUser(mergedProfile, true);
        }

        // Ensure a canonical DB profile exists and align local alias/profile fields.
        const dbProfile = await API.getOrCreateUserProfile(session.user.id);
        if (dbProfile) {
          const mergedLocal = { ...Storage.getUser() };
          if (dbProfile.username) mergedLocal.alias = dbProfile.username;
          if (dbProfile.college_name) mergedLocal.collegeName = dbProfile.college_name;
          if (dbProfile.department) mergedLocal.department = dbProfile.department;
          Storage.saveUser(mergedLocal, true);
        }

        // Start sync in background so first screen cannot be blocked by network stalls.
        this._syncSpillsFromCloudWithTimeout();

        const verif = await API.checkVerificationStatus(session.user.id);
        this.isAdmin = !!(verif && verif.isAdmin);

        if (this.isAdmin) {
          const adminNav = document.getElementById('admin-nav-item');
          if (adminNav) adminNav.style.display = 'block';
        }

        if (verif && verif.status === 'banned') {
          document.body.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#000; color:#ff4444; text-align:center; padding:20px;">
              <div style="font-size:4rem; margin-bottom:20px;">🚫</div>
              <h1 style="font-size:2rem; margin-bottom:10px;">ACCESS DENIED</h1>
              <p style="color:#aaa; font-size:1.1rem; max-width:400px; line-height:1.5;">Your account has been permanently suspended for violating community guidelines.</p>
            </div>
          `;
          return;
        }

        if (verif && verif.status === 'unverified') {
          this._showOnboarding();
        } else {
          if (typeof Utils !== 'undefined' && Utils.toast) {
            Utils.toast('Welcome back! Automatically signed in.', 'success');
          }
          this._enterApp(verif && verif.status ? verif.status : 'verified');
        }
      } catch (error) {
        console.error('[App] Bootstrap error:', error);
        this._enterApp('verified');
      }
    }, 1800);
  },

  /* ═══════════════════════════════════════════
     ONBOARDING
     ═══════════════════════════════════════════ */

  _showOnboarding() {
    const screen = document.getElementById('onboarding-screen');
    if (!screen) { this._enterApp(); return; }

    // Hide the main app chrome while onboarding
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'none';

    // Show the screen
    screen.classList.remove('hidden');
    screen.classList.add('visible');

    // Bind events
    this._bindOnboarding();
  },

  _bindOnboarding() {
    const nameInput = document.getElementById('onboarding-realname');
    const collegeInput = document.getElementById('onboarding-college');
    const deptInput = document.getElementById('onboarding-department');
    const sectionInput = document.getElementById('onboarding-section');
    const dobInput = document.getElementById('onboarding-dob');
    const fileInput = document.getElementById('onboarding-id-file');
    const enterBtn = document.getElementById('onboarding-submit-verification');
    const dobError = document.getElementById('dob-error');

    const checkValidity = () => {
      let valid = true;
      dobError.style.display = 'none';
      if (!nameInput.value.trim()) valid = false;
      if (!collegeInput.value.trim()) valid = false;
      if (!deptInput.value.trim()) valid = false;

      if (!dobInput.value) { valid = false; }
      else {
        const dob = new Date(dobInput.value);
        const diffMs = Date.now() - dob.getTime();
        const age = Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
        if (age < 13) {
          dobError.style.display = 'block';
          valid = false;
        }
      }
      if (!fileInput.files || fileInput.files.length === 0) valid = false;
      enterBtn.disabled = !valid;
    };

    nameInput.addEventListener('input', checkValidity);
    collegeInput.addEventListener('input', checkValidity);
    deptInput.addEventListener('input', checkValidity);
    dobInput.addEventListener('change', checkValidity);
    fileInput.addEventListener('change', checkValidity);

    enterBtn.addEventListener('click', () => {
      if (!enterBtn.disabled) this._completeOnboarding();
    });
  },

  async _completeOnboarding() {
    const nameInput = document.getElementById('onboarding-realname').value.trim();
    const collegeInput = document.getElementById('onboarding-college').value.trim();
    const deptInput = document.getElementById('onboarding-department').value.trim();
    const sectionInput = document.getElementById('onboarding-section').value.trim();
    
    const fileInput = document.getElementById('onboarding-id-file');
    const dobInput = document.getElementById('onboarding-dob');
    const enterBtn = document.getElementById('onboarding-submit-verification');
    const file = fileInput.files[0];

    enterBtn.innerHTML = 'Uploading... ☕';
    enterBtn.disabled = true;

    // Upload ID
    const fileUrl = await API.uploadCollegeId(file);
    if (!fileUrl) {
      alert("Failed to upload ID. Please try again.");
      enterBtn.innerHTML = 'Submit for Verification →';
      enterBtn.disabled = false;
      return;
    }

    enterBtn.innerHTML = 'Verifying... ✨';
    
    // Submit All Details
    const success = await API.submitVerificationDetails(this.session.user.id, dobInput.value, fileUrl, nameInput, collegeInput, deptInput, sectionInput);

    if (!success) {
      enterBtn.innerHTML = 'Submit for Verification →';
      enterBtn.disabled = false;
      return;
    }

    // Cross-Device Sync Fix: Force push the freshly generated local alias to the Cloud!
    const localProfile = Storage.getUser();
    localProfile.collegeName = collegeInput;
    localProfile.department = deptInput;
    Storage.saveUser(localProfile);

    localStorage.setItem('ts_onboarded', '1');

    // Hide onboarding with animation
    const screen = document.getElementById('onboarding-screen');
    screen.classList.remove('visible');
    screen.classList.add('hidden');

    // Show the app
    setTimeout(() => {
      this._enterApp('pending');
    }, 500);
  },

  /* ═══════════════════════════════════════════
     ENTER APP (post-onboarding)
     ═══════════════════════════════════════════ */

  async _enterApp(status = 'verified') {
    this.verificationStatus = status;

    // Restore app chrome visibility
    document.getElementById('sidebar').style.display = '';
    document.getElementById('main-content').style.display = '';
    document.getElementById('bottom-nav').style.display = '';

    // Initialize user
    const user = Storage.getUser();
    if (!user.alias) {
      user.alias = 'Tea User';
      user.aliasEmoji = '👤';
    }
    Storage.saveUser(user);

    // Initialize spill module
    try {
      Spill.init();
    } catch (error) {
      console.error('[App] Spill init failed:', error);
    }
    this._updateSidebarProfile();
    this._bindNavigation();

    // Apply read-only mode for pending users
    if (this.isReadOnly()) {
      const spillBtns = document.querySelectorAll('[data-action="new-spill"]');
      spillBtns.forEach(btn => {
        btn.style.opacity = '0.5';
        // Intercept clicks to block modal and show alert
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          Utils.toast('Your account is pending verification. You can read, but you cannot post yet!', 'error');
        }, { capture: true });
      });
    }

    // Default page
    try {
      this.navigate('feed');
    } catch (error) {
      console.error('[App] Feed navigation failed:', error);
      this._renderEmergencyFeed();
    }

    // Sync in background; re-render feed once fresh data arrives.
    this._syncSpillsFromCloudWithTimeout().then((didSync) => {
      if (!didSync) return;
      if (this.currentPage === 'feed' && typeof Feed !== 'undefined' && Feed.render) {
        Feed.render();
      }
    });

    // Keep community feed fresh across devices while app is open.
    this._startLiveSyncLoop();
  },

  async _syncSpillsFromCloudWithTimeout(timeoutMs = 4000) {
    if (!window.Storage || typeof Storage.syncSpillsFromCloud !== 'function') return false;

    let timeoutId = null;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(false), timeoutMs);
    });

    const syncPromise = (async () => {
      try {
        await Storage.syncSpillsFromCloud();
        return true;
      } catch (error) {
        console.warn('[App] Cloud sync failed:', error);
        return false;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    })();

    return Promise.race([syncPromise, timeoutPromise]);
  },

  _renderEmergencyFeed() {
    const feedPage = document.getElementById('page-feed');
    if (!feedPage) return;

    feedPage.innerHTML = `
      <div class="empty-state" style="margin-top:20px;">
        <div class="empty-state-icon">☕</div>
        <div class="empty-state-title">Feed is starting</div>
        <div class="empty-state-text">Please reopen the app if content does not appear in a few seconds.</div>
      </div>
    `;
    this._showPage('feed');
    this._setActiveNav('feed');
  },

  async _tryHybridHostedTakeover() {
    const cfg =
      typeof window.TEA_SPILL_CONFIG === 'object' && window.TEA_SPILL_CONFIG
        ? window.TEA_SPILL_CONFIG
        : {};

    const otaMode = String(cfg.MOBILE_OTA_MODE || 'hybrid').toLowerCase();
    if (otaMode !== 'hybrid') return false;

    const host = (window.location && window.location.hostname) || '';
    const isLocalWebViewHost = host === 'localhost' || host === '127.0.0.1';
    if (!isLocalWebViewHost) return false;

    const cap = window.Capacitor || null;
    const platform = cap && typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'web';
    const isNativeApp = platform === 'android' || platform === 'ios';
    if (!isNativeApp) return false;

    if (sessionStorage.getItem('ts_hybrid_remote_attempted') === '1') return false;
    sessionStorage.setItem('ts_hybrid_remote_attempted', '1');

    const remoteUrl = String(cfg.MOBILE_REMOTE_APP_URL || '').trim();
    if (!remoteUrl || !/^https:\/\//i.test(remoteUrl)) return false;

    const timeoutMs = Number.parseInt(cfg.MOBILE_REMOTE_BOOT_TIMEOUT_MS, 10) || 2500;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      await fetch(remoteUrl, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });

      const joiner = remoteUrl.includes('?') ? '&' : '?';
      window.location.replace(`${remoteUrl}${joiner}mobile_mode=hybrid`);
      return true;
    } catch (error) {
      console.info('[App Hybrid] Remote app unavailable. Staying on local bundle.', error);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  },

  /* ═══════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════ */

  isReadOnly() {
    return this.verificationStatus !== 'verified';
  },

  requireVerified(actionLabel = 'do that') {
    if (!this.isReadOnly()) return true;
    if (typeof Utils !== 'undefined' && Utils.toast) {
      Utils.toast(`Your account is pending verification. You cannot ${actionLabel} yet.`, 'error');
    }
    return false;
  },

  /**
   * Navigate to a page with optional data payload.
   * @param {string} page
   * @param {*} [data]
   */
  navigate(page, data, options = {}) {
    const shouldPushHistory =
      !options.skipHistory && this.currentPage && (page !== this.currentPage || data != null);

    if (shouldPushHistory) {
      this.history.push({ page: this.currentPage, data: null });
    }

    this.previousPage = this.currentPage;
    this.currentPage = page;

    switch (page) {
      case 'feed':       Feed.render();             break;
      case 'explore':    Explore.render();           break;
      case 'colleges':   College.render();           break;
      case 'college-detail':
        College.renderDetail(data);
        return; // renderDetail manages page activation
      case 'pages':      Pages.renderPages();        break;
      case 'groups':     Pages.renderGroups();        break;
      case 'channels':   Pages.renderChannels();      break;
      case 'profile':    Profile.render();           break;
      case 'reader':     Reader.render(data);        break;
      case 'admin':      if(this.isAdmin) Admin.render(); break;
      default:
        Feed.render();
        page = 'feed';
    }

    this._showPage(page);
    this._setActiveNav(page);

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /** Go back to the previous page. */
  goBack() {
    let prev = this.history.pop();
    while (prev && prev.page === this.currentPage && this.history.length > 0) {
      prev = this.history.pop();
    }

    if (prev) {
      this.navigate(prev.page, prev.data, { skipHistory: true });
    } else {
      this.navigate('feed', null, { skipHistory: true });
    }
  },

  /** Show a page container by ID. */
  _showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
  },

  /** Highlight the active nav link. */
  _setActiveNav(page) {
    // Sidebar links
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
    const sidebarLink = document.getElementById('nav-' + page);
    if (sidebarLink) sidebarLink.classList.add('active');

    // Bottom nav
    document.querySelectorAll('.bnav-link').forEach(l => l.classList.remove('active'));
    const bnav = document.getElementById('bnav-' + page);
    if (bnav) bnav.classList.add('active');

    // Profile
    const profileLink = document.querySelector('.profile-link');
    if (profileLink) profileLink.classList.toggle('active', page === 'profile');
  },

  /** Update the sidebar profile card with current user data. */
  _updateSidebarProfile() {
    const user = Storage.getUser();
    const avatarEl = document.getElementById('sidebar-avatar');
    const nameEl = document.getElementById('sidebar-username');
    const pointsEl = document.getElementById('sidebar-points');
    if (avatarEl) avatarEl.textContent = user.aliasEmoji;
    if (nameEl) nameEl.textContent = user.alias;
    if (pointsEl) pointsEl.textContent = user.teaPoints + ' 🍵';
  },

  /** Bind global navigation events using event delegation. */
  _bindNavigation() {
    // Delegated click handler
    document.addEventListener('click', (e) => {
      // [data-navigate] links
      const navEl = e.target.closest('[data-navigate]');
      if (navEl) {
        e.preventDefault();
        this.navigate(navEl.dataset.navigate);
        return;
      }

      // [data-action="new-spill"] buttons
      const spillAction = e.target.closest('[data-action="new-spill"]');
      if (spillAction) {
        e.preventDefault();
        if (!this.requireVerified('create a new spill')) return;
        Spill.open();
        return;
      }
    });

    // Mobile menu toggle
    const menuBtn = document.getElementById('btn-menu');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
      });
    }

    // Close sidebar on outside click
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('btn-menu');
      if (sidebar && menuBtn &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    // Escape → close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Spill.close();
        const reportModal = document.getElementById('report-modal');
        if (reportModal) reportModal.classList.add('hidden');
        const shareModal = document.getElementById('share-modal');
        if (shareModal) shareModal.classList.add('hidden');
      }
    });
  },

  _startLiveSyncLoop() {
    if (this._liveSyncTimer || !window.API || !API.isLive) return;

    const runSync = async () => {
      await Storage.syncSpillsFromCloud();
      if (this.currentPage === 'feed' && typeof Feed !== 'undefined' && Feed.render) {
        Feed.render();
      }
    };

    this._liveSyncTimer = setInterval(runSync, 15000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) runSync();
    });
  }
};

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => App.init());
