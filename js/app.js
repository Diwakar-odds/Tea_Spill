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

  /* ─── Onboarding state ─── */
  _onboardingAlias: null,
  _onboardingEmoji: null,

  async init() {
    // Load full college database first
    await Storage.loadCollegesJSON();

    // Splash screen → then decide: onboarding or straight to app
    setTimeout(async () => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('hidden');

      const session = await API.getUserSession();
      if (!session) {
        // User isn't logged in, redirect them specifically to Google Auth
        await API.signInWithGoogle();
        return;
      }
      this.session = session;

      // Cross-Platform Sync: Clone Cloud Profile to Local Device Memory
      if (session.user.user_metadata && session.user.user_metadata.tea_profile) {
        Storage.saveUser(session.user.user_metadata.tea_profile, true);
      }

      // Pre-fetch live community content before unveiling the app
      await Storage.syncSpillsFromCloud();

      const verif = await API.checkVerificationStatus(session.user.id);
      this.isAdmin = verif.isAdmin;

      if (this.isAdmin) {
        document.getElementById('admin-nav-item').style.display = 'block';
      }

      if (verif.status === 'banned') {
        document.body.innerHTML = `
          <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#000; color:#ff4444; text-align:center; padding:20px;">
            <div style="font-size:4rem; margin-bottom:20px;">🚫</div>
            <h1 style="font-size:2rem; margin-bottom:10px;">ACCESS DENIED</h1>
            <p style="color:#aaa; font-size:1.1rem; max-width:400px; line-height:1.5;">Your account has been permanently suspended for violating community guidelines.</p>
          </div>
        `;
        return;
      }

      if (verif.status === 'unverified') {
        this._showOnboarding();
      } else {
        this._enterApp(verif.status);
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
    const dobInput = document.getElementById('onboarding-dob');
    const fileInput = document.getElementById('onboarding-id-file');
    const enterBtn = document.getElementById('onboarding-submit-verification');
    const dobError = document.getElementById('dob-error');

    const checkValidity = () => {
      let valid = true;
      dobError.style.display = 'none';
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

    dobInput.addEventListener('change', checkValidity);
    fileInput.addEventListener('change', checkValidity);

    enterBtn.addEventListener('click', () => {
      if (!enterBtn.disabled) this._completeOnboarding();
    });
  },

  async _completeOnboarding() {
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
    
    // Submit details
    const success = await API.submitVerificationDetails(this.session.user.id, dobInput.value, fileUrl);

    if (!success) {
      enterBtn.innerHTML = 'Submit for Verification →';
      enterBtn.disabled = false;
      return;
    }

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
    // Restore app chrome visibility
    document.getElementById('sidebar').style.display = '';
    document.getElementById('main-content').style.display = '';
    document.getElementById('bottom-nav').style.display = '';

    // Initialize user
    const user = Storage.getUser();
    if (!user.alias) {
      user.alias = Utils.randomAlias().name;
      user.aliasEmoji = '👻';
    }
    Storage.saveUser(user);

    // Initial background sync from PocketBase
    await Storage.syncSpillsFromCloud();

    // Initialize spill module
    Spill.init();
    this._updateSidebarProfile();
    this._bindNavigation();

    // Apply read-only mode for pending users
    if (status !== 'verified') {
      const spillBtns = document.querySelectorAll('[data-action="new-spill"]');
      spillBtns.forEach(btn => {
        btn.style.opacity = '0.5';
        // Intercept clicks to block modal and show alert
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          Utils.showToast("Your account is pending verification. You can read, but you cannot spill tea yet!", "error");
        }, { capture: true });
      });
    }

    // Default page
    this.navigate('feed');
  },

  /* ═══════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════ */

  /**
   * Navigate to a page with optional data payload.
   * @param {string} page
   * @param {*} [data]
   */
  navigate(page, data) {
    this.history.push({ page: this.currentPage, data: null });
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
    const prev = this.history.pop();
    if (prev) {
      this.navigate(prev.page, prev.data);
    } else {
      this.navigate('feed');
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
  }
};

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => App.init());
