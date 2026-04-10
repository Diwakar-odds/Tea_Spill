/* ═══════════════════════════════════════════════════
   TEA SPILL ☕ — Theme Manager
   Handles Light/Dark Mode toggling and persistence.
   WARNING: This script must run in <head> to prevent
   white-flashing on load.
   ═══════════════════════════════════════════════════ */

'use strict';

const Theme = {
  current: 'dark',

  init() {
    // 1. Check local storage
    const stored = localStorage.getItem('teaspill_theme');
    if (stored) {
      this.current = stored;
    } else {
      // 2. Fallback to OS preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.current = 'light';
      }
    }

    // Apply immediately (blocks render to prevent flicker)
    this.applyTheme(this.current);

    // Bind UI buttons when DOM is completely loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.bindToggles();
      this.updateUIIcons();
    });
  },

  applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    this.current = theme;
  },

  toggle() {
    const newTheme = this.current === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    localStorage.setItem('teaspill_theme', newTheme);
    this.updateUIIcons();
  },

  bindToggles() {
    document.body.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-action="toggle-theme"]');
      if (toggleBtn) {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  updateUIIcons() {
    // Find all theme toggle buttons and swap their text/icon based on current state
    const toggles = document.querySelectorAll('[data-action="toggle-theme"]');
    toggles.forEach(btn => {
      if (this.current === 'light') {
        // In light mode, the button should offer "Dark Mode"
        btn.innerHTML = btn.innerHTML.replace('☀️', '🌙').replace('Light Mode', 'Dark Mode');
      } else {
        // In dark mode, the button should offer "Light Mode"
        btn.innerHTML = btn.innerHTML.replace('🌙', '☀️').replace('Dark Mode', 'Light Mode');
      }
    });
  }
};

// Execute immediately during HTML parse
Theme.init();
