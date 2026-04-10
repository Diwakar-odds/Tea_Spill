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
    // Load full college database first (needed by onboarding college picker)
    await Storage.loadCollegesJSON();

    // Splash screen → then decide: onboarding or straight to app
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('hidden');

      const hasOnboarded = localStorage.getItem('ts_onboarded');
      if (hasOnboarded) {
        this._enterApp();
      } else {
        this._showOnboarding();
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

    // Generate initial alias
    this._onboardingAlias = Utils.randomAlias();
    this._onboardingEmoji = this._onboardingAlias.emoji;

    // Populate emoji grid
    const grid = document.getElementById('onboarding-emoji-grid');
    grid.innerHTML = ONBOARDING_EMOJIS.map(e => `
      <button type="button" class="onboarding-emoji-btn ${e === this._onboardingEmoji ? 'selected' : ''}" data-emoji="${e}">${e}</button>
    `).join('');

    // Update alias preview
    this._updateOnboardingPreview();

    // Populate college dropdown
    const select = document.getElementById('onboarding-college');
    const colleges = Storage.getColleges();
    const grouped = {};
    colleges.forEach(c => {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c);
    });
    Object.keys(grouped).sort().forEach(state => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = state;
      grouped[state].sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.icon} ${c.name} — ${c.city}`;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    });

    // Show the screen
    screen.classList.remove('hidden');
    screen.classList.add('visible');

    // Bind events
    this._bindOnboarding();
  },

  _bindOnboarding() {
    // Emoji grid
    document.getElementById('onboarding-emoji-grid').addEventListener('click', (e) => {
      const btn = e.target.closest('.onboarding-emoji-btn');
      if (!btn) return;
      document.querySelectorAll('.onboarding-emoji-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      this._onboardingEmoji = btn.dataset.emoji;
      this._updateOnboardingPreview();
    });

    // Reroll alias
    document.getElementById('onboarding-reroll').addEventListener('click', () => {
      this._onboardingAlias = Utils.randomAlias();
      this._updateOnboardingPreview();
    });

    // Checkbox enables enter button
    const checkbox = document.getElementById('onboarding-agree');
    const enterBtn = document.getElementById('onboarding-enter');
    checkbox.addEventListener('change', () => {
      enterBtn.disabled = !checkbox.checked;
    });

    // Enter app
    enterBtn.addEventListener('click', () => {
      if (!checkbox.checked) return;
      this._completeOnboarding();
    });
  },

  _updateOnboardingPreview() {
    const preview = document.getElementById('onboarding-alias-preview');
    if (preview) {
      preview.textContent = `${this._onboardingEmoji} ${this._onboardingAlias.name}`;
    }
  },

  async _completeOnboarding() {
    // Save user with chosen identity
    const user = Storage.getUser();
    user.alias = this._onboardingAlias.name;
    user.aliasEmoji = this._onboardingEmoji;

    // Save college preference if selected
    const collegeSelect = document.getElementById('onboarding-college');
    if (collegeSelect.value) {
      user.defaultCollege = collegeSelect.value;
    }

    // Grant first_visit badge
    if (!user.badges.includes('first_visit')) {
      user.badges.push('first_visit');
      user.teaPoints += 5;
    }

    Storage.saveUser(user);
    localStorage.setItem('ts_onboarded', '1');

    // Authenticate with PocketBase API
    const enterBtn = document.getElementById('onboarding-enter');
    const originalText = enterBtn.innerHTML;
    enterBtn.innerHTML = 'Brewing... ☕';
    await API.authenticateUser(user.alias, user.aliasEmoji);
    enterBtn.innerHTML = originalText;

    // Hide onboarding with animation
    const screen = document.getElementById('onboarding-screen');
    screen.classList.remove('visible');
    screen.classList.add('hidden');

    // Show the app
    setTimeout(() => {
      this._enterApp();
    }, 500);
  },

  /* ═══════════════════════════════════════════
     ENTER APP (post-onboarding)
     ═══════════════════════════════════════════ */

  async _enterApp() {
    // Restore app chrome visibility
    document.getElementById('sidebar').style.display = '';
    document.getElementById('main-content').style.display = '';
    document.getElementById('bottom-nav').style.display = '';

    // Initialize user and ensure authenticated
    const user = Storage.getUser();
    Storage.saveUser(user);
    await API.authenticateUser(user.alias, user.aliasEmoji);

    // Initial background sync from PocketBase
    await Storage.syncSpillsFromCloud();

    // Initialize spill module
    Spill.init();
    this._updateSidebarProfile();
    this._bindNavigation();

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
