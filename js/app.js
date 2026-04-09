/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Main Application Router
   SPA navigation, page switching, delegated events.
   ═══════════════════════════════════════════════════ */

'use strict';

const App = {
  currentPage: 'feed',
  previousPage: 'feed',
  history: [],

  async init() {
    // Splash screen
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) splash.classList.add('hidden');
    }, 1800);

    // Initialize user
    const user = Storage.getUser();
    Storage.saveUser(user);

    // Load full college database
    await Storage.loadCollegesJSON();

    // Initialize spill module
    Spill.init();
    this._updateSidebarProfile();
    this._bindNavigation();

    // Default page
    this.navigate('feed');
  },

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
