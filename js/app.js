/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Main Application Router
   ═══════════════════════════════════════════════════ */

const App = {
  currentPage: 'feed',
  previousPage: 'feed',

  init() {
    // Wait for splash animation
    setTimeout(() => {
      document.getElementById('splash-screen').classList.add('hidden');
    }, 1800);

    // Initialize user (creates default if none)
    const user = Storage.getUser();
    Storage.saveUser(user);

    // Initialize modules
    Spill.init();
    this._updateSidebarProfile();

    // Bind navigation
    this._bindNavigation();

    // Render default page
    this.navigate('feed');
  },

  navigate(page, data) {
    this.previousPage = this.currentPage;
    this.currentPage = page;

    // Render the right page
    switch (page) {
      case 'feed':
        Feed.render();
        break;
      case 'explore':
        Explore.render();
        break;
      case 'colleges':
        College.render();
        break;
      case 'college-detail':
        College.renderDetail(data);
        return; // renderDetail handles page activation
      case 'pages':
        Pages.renderPages();
        break;
      case 'groups':
        Pages.renderGroups();
        break;
      case 'channels':
        Pages.renderChannels();
        break;
      case 'profile':
        Profile.render();
        break;
      case 'reader':
        Reader.render(data);
        break;
      default:
        Feed.render();
        page = 'feed';
    }

    this._showPage(page);
    this._setActiveNav(page);

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top
    window.scrollTo(0, 0);
  },

  goBack() {
    this.navigate(this.previousPage);
  },

  _showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
  },

  _setActiveNav(page) {
    // Sidebar
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));
    const sidebarLink = document.getElementById('nav-' + page);
    if (sidebarLink) sidebarLink.classList.add('active');

    // Bottom nav
    document.querySelectorAll('.bnav-link').forEach(l => l.classList.remove('active'));
    const bnav = document.getElementById('bnav-' + page);
    if (bnav) bnav.classList.add('active');

    // Profile link
    if (page === 'profile') {
      document.querySelector('.profile-link')?.classList.add('active');
    } else {
      document.querySelector('.profile-link')?.classList.remove('active');
    }
  },

  _updateSidebarProfile() {
    const user = Storage.getUser();
    document.getElementById('sidebar-avatar').textContent = user.aliasEmoji;
    document.getElementById('sidebar-username').textContent = user.alias;
    document.getElementById('sidebar-points').textContent = user.teaPoints + ' 🍵';
  },

  _bindNavigation() {
    // All elements with data-navigate
    document.addEventListener('click', (e) => {
      // Navigation links
      const navEl = e.target.closest('[data-navigate]');
      if (navEl) {
        e.preventDefault();
        this.navigate(navEl.dataset.navigate);
        return;
      }

      // New spill actions
      const spillAction = e.target.closest('[data-action="new-spill"]');
      if (spillAction) {
        e.preventDefault();
        Spill.open();
        return;
      }
    });

    // Mobile menu toggle
    document.getElementById('btn-menu').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const menuBtn = document.getElementById('btn-menu');
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    // Keyboard shortcut: Escape to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        Spill.close();
      }
    });
  }
};

// ─── Boot ───
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
