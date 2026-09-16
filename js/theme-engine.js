/**
 * ==============================================================================
 * ME LIFE OS — THEME SWITCHER ENGINE
 * Modular Theme Manager & Customization Engine
 * Aesthetic: Linear / Things 3 / Apple Health
 * ==============================================================================
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.ThemeEngine = exports;
    root.MeThemeEngine = exports;
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const STORAGE_KEY = 'me_theme';

  const THEMES = [
    {
      id: 'midnight-slate',
      name: 'Midnight Slate',
      tagline: 'Deep Obsidian & Violet Accent',
      icon: '🌌',
      category: 'dark',
      metaColor: '#090a0f',
      colors: {
        bg: '#090a0f',
        card: '#12141d',
        border: '#1e2230',
        accent: '#818cf8',
        mint: '#34d399',
        text: '#f8fafc'
      },
      description: 'Default dark mode. Obsidian black with muted indigo borders, soft violet glow, and mint indicators.'
    },
    {
      id: 'clean-luxury-light',
      name: 'Clean Luxury Light',
      tagline: 'Crisp White & Subtle Shadows',
      icon: '☀️',
      category: 'light',
      metaColor: '#f8fafc',
      colors: {
        bg: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        accent: '#6366f1',
        mint: '#10b981',
        text: '#0f172a'
      },
      description: 'Apple Health & Things 3 luxury aesthetic. Crisp paper white, fine hairlines, and electric indigo.'
    },
    {
      id: 'nord-frost',
      name: 'Nord Frost',
      tagline: 'Cool Blue-Grey & Icy Cyan',
      icon: '❄️',
      category: 'dark',
      metaColor: '#0f172a',
      colors: {
        bg: '#0f172a',
        card: '#1e293b',
        border: '#334155',
        accent: '#38bdf8',
        mint: '#10b981',
        text: '#f8fafc'
      },
      description: 'Arctic maritime palette. Deep navy slate, glacial cyan highlights, and muted emerald accents.'
    },
    {
      id: 'oled-pitch-black',
      name: 'OLED Pitch Black',
      tagline: 'Absolute #000000 & Stark Neon',
      icon: '🖤',
      category: 'dark',
      metaColor: '#000000',
      colors: {
        bg: '#000000',
        card: '#0c0c0c',
        border: '#1a1a1a',
        accent: '#a855f7',
        mint: '#22c55e',
        text: '#ffffff'
      },
      description: 'True pixel shutdown for maximum OLED battery savings. High-contrast cards with vivid neon punches.'
    }
  ];

  const THEME_MAP = new Map(THEMES.map(t => [t.id, t]));

  // Normalize aliases (e.g. 'Midnight Slate', 'midnight', 'light', 'nord', 'oled')
  function normalizeThemeId(id) {
    if (!id || typeof id !== 'string') return 'midnight-slate';
    const clean = id.trim().toLowerCase().replace(/\s+/g, '-');
    if (THEME_MAP.has(clean)) return clean;

    if (clean.includes('light') || clean.includes('luxury') || clean.includes('white')) {
      return 'clean-luxury-light';
    }
    if (clean.includes('nord') || clean.includes('frost') || clean.includes('cyan')) {
      return 'nord-frost';
    }
    if (clean.includes('oled') || clean.includes('black') || clean.includes('pitch')) {
      return 'oled-pitch-black';
    }
    if (clean.includes('midnight') || clean.includes('slate') || clean.includes('dark')) {
      return 'midnight-slate';
    }
    return 'midnight-slate';
  }

  let currentThemeId = 'midnight-slate';
  let isInitialized = false;

  const ThemeEngine = {
    STORAGE_KEY,

    /**
     * Get list of all available themes
     */
    getThemes() {
      return THEMES.map(t => ({ ...t }));
    },

    /**
     * Get current active theme ID
     */
    getTheme() {
      return currentThemeId;
    },

    /**
     * Get theme metadata object
     */
    getThemeInfo(themeId = currentThemeId) {
      const normalized = normalizeThemeId(themeId);
      return THEME_MAP.get(normalized) || THEMES[0];
    },

    /**
     * Set active theme by ID or alias
     * @param {string} themeId 
     * @param {Object} options { notify: boolean, save: boolean, silent: boolean }
     */
    setTheme(themeId, options = {}) {
      const { notify = true, save = true, silent = false } = options;
      const targetId = normalizeThemeId(themeId);
      const themeInfo = THEME_MAP.get(targetId) || THEMES[0];
      const prevThemeId = currentThemeId;

      currentThemeId = targetId;

      // 1. Update HTML and Body attributes
      const root = document.documentElement;
      const body = document.body;

      if (root) {
        root.setAttribute('data-theme', targetId);
      }
      if (body) {
        body.setAttribute('data-theme', targetId);

        // Remove old theme classes
        THEMES.forEach(t => {
          body.classList.remove(`theme-${t.id}`);
        });
        body.classList.add(`theme-${targetId}`);
      }

      // 2. Update Browser Chrome Theme Color Meta
      this.updateMetaThemeColor(themeInfo.metaColor);

      // 3. Persist to LocalStorage
      if (save) {
        try {
          localStorage.setItem(STORAGE_KEY, targetId);
        } catch (e) {
          console.warn('[ThemeEngine] Storage write failed:', e);
        }
      }

      // 4. Update UI Elements
      this.syncThemeUI(themeInfo);

      // 5. Fire Theme Change Event
      if (!silent) {
        const event = new CustomEvent('me:themechange', {
          detail: {
            theme: targetId,
            themeInfo: themeInfo,
            previousTheme: prevThemeId
          },
          bubbles: true
        });
        window.dispatchEvent(event);
      }

      // 6. User Feedback Toast
      if (notify && !silent && prevThemeId !== targetId) {
        this.notifyUser(themeInfo);
      }

      return themeInfo;
    },

    /**
     * Cycle sequentially to next theme
     */
    toggleTheme(options = { notify: true }) {
      const idx = THEMES.findIndex(t => t.id === currentThemeId);
      const nextIdx = (idx + 1) % THEMES.length;
      const nextTheme = THEMES[nextIdx];
      return this.setTheme(nextTheme.id, options);
    },

    /**
     * Update <meta name="theme-color"> dynamically
     */
    updateMetaThemeColor(color) {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', color);
    },

    /**
     * Synchronize header button icons, theme badges, and modal active states
     */
    syncThemeUI(themeInfo) {
      // Header theme icon
      const iconEl = document.getElementById('themeToggleIcon');
      if (iconEl) {
        iconEl.textContent = themeInfo.icon;
      }

      // Header theme toggle button tooltip
      const btnToggle = document.getElementById('btnThemeToggle');
      if (btnToggle) {
        btnToggle.setAttribute('title', `Active: ${themeInfo.name} (${themeInfo.tagline}) — Click to cycle`);
      }

      // Theme name indicators
      const nameEls = document.querySelectorAll('.active-theme-name');
      nameEls.forEach(el => {
        el.textContent = themeInfo.name;
      });

      // Update Theme Picker Modal Options (if rendered)
      const options = document.querySelectorAll('.theme-card-option');
      options.forEach(opt => {
        const optId = opt.getAttribute('data-theme-id');
        if (optId === themeInfo.id) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
    },

    /**
     * Show elegant toast notification
     */
    notifyUser(themeInfo) {
      const msg = `Theme set to ${themeInfo.name}`;
      if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(msg, themeInfo.icon);
      } else {
        const toast = document.getElementById('global-toast');
        const iconEl = document.getElementById('globalToastIcon');
        const msgEl = document.getElementById('globalToastMsg');
        if (toast && msgEl) {
          if (iconEl) iconEl.textContent = themeInfo.icon;
          msgEl.textContent = msg;
          toast.classList.add('show');
          clearTimeout(this._toastTimer);
          this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
        }
      }
    },

    /**
     * Open Theme Picker Modal Dialog
     */
    openThemeModal() {
      let modal = document.getElementById('themePickerModal');
      if (!modal) {
        modal = this.createThemeModalDOM();
        document.body.appendChild(modal);
      }
      this.syncThemeUI(this.getThemeInfo());
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    },

    /**
     * Close Theme Picker Modal Dialog
     */
    closeThemeModal() {
      const modal = document.getElementById('themePickerModal');
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    },

    /**
     * Dynamically generate modal dialog for picking themes
     */
    createThemeModalDOM() {
      const modal = document.createElement('div');
      modal.className = 'app-modal-overlay';
      modal.id = 'themePickerModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'themeModalTitle');

      const card = document.createElement('div');
      card.className = 'app-modal-card';

      // Header
      const head = document.createElement('div');
      head.className = 'modal-head';
      head.innerHTML = `
        <h3 id="themeModalTitle">🎨 Appearance & Themes</h3>
        <button class="modal-close-btn" id="btnCloseThemeModal" aria-label="Close theme modal">&times;</button>
      `;

      // Subtitle
      const sub = document.createElement('div');
      sub.style.cssText = 'font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.4;';
      sub.textContent = 'Select your aesthetic. All themes are precision-tuned for typography, contrast, and visual elegance.';

      // Grid
      const grid = document.createElement('div');
      grid.className = 'theme-picker-grid';

      THEMES.forEach(t => {
        const opt = document.createElement('button');
        opt.className = `theme-card-option ${t.id === currentThemeId ? 'active' : ''}`;
        opt.setAttribute('data-theme-id', t.id);
        opt.setAttribute('type', 'button');

        opt.innerHTML = `
          <div class="theme-card-preview" style="background: ${t.colors.bg}; border-color: ${t.colors.border};">
            <span class="theme-swatch" style="background: ${t.colors.accent};" title="Accent"></span>
            <span class="theme-swatch" style="background: ${t.colors.mint};" title="Status Mint"></span>
            <span class="theme-swatch" style="background: ${t.colors.card}; border: 1px solid ${t.colors.border};" title="Card Surface"></span>
          </div>
          <div class="theme-card-name">
            <span>${t.icon} ${t.name}</span>
            <span class="theme-check-icon">✓</span>
          </div>
          <div class="theme-card-desc">${t.description}</div>
        `;

        opt.addEventListener('click', () => {
          this.setTheme(t.id, { notify: true, save: true });
        });

        grid.appendChild(opt);
      });

      // Quick Cycle Button Footer
      const footer = document.createElement('div');
      footer.style.cssText = 'display: flex; gap: 8px; margin-top: 14px;';
      footer.innerHTML = `
        <button class="btn-styled accent" id="btnModalCycleTheme" style="flex: 1;">
          <span>⚡ Next Theme</span>
        </button>
        <button class="btn-styled ghost" id="btnModalDoneTheme" style="flex: 1;">
          <span>Done</span>
        </button>
      `;

      card.appendChild(head);
      card.appendChild(sub);
      card.appendChild(grid);
      card.appendChild(footer);
      modal.appendChild(card);

      // Event listeners
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeThemeModal();
      });
      card.querySelector('#btnCloseThemeModal')?.addEventListener('click', () => this.closeThemeModal());
      card.querySelector('#btnModalDoneTheme')?.addEventListener('click', () => this.closeThemeModal());
      card.querySelector('#btnModalCycleTheme')?.addEventListener('click', () => {
        this.toggleTheme({ notify: true });
      });

      return modal;
    },

    /**
     * Initialize Theme Engine: Auto-load, bind controls, listen for shortcuts
     */
    init() {
      if (isInitialized) return;
      isInitialized = true;

      // 1. Read persisted theme or default
      let savedTheme = 'midnight-slate';
      try {
        savedTheme = localStorage.getItem(STORAGE_KEY) || 'midnight-slate';
      } catch (e) {
        console.warn('[ThemeEngine] Could not read localStorage:', e);
      }

      // Apply initial theme silently (prevents unwanted toast on initial boot)
      this.setTheme(savedTheme, { notify: false, save: false, silent: true });

      // 2. Bind Header Theme Switcher Button if present
      const bindToggleBtn = () => {
        const btn = document.getElementById('btnThemeToggle');
        if (btn && !btn._themeBound) {
          btn._themeBound = true;
          // Click cycles themes
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If user double-clicks or holds alt/ctrl, open modal; else quick cycle
            if (e.altKey || e.shiftKey) {
              this.openThemeModal();
            } else {
              this.toggleTheme();
            }
          });

          // Right-click or context menu opens theme modal
          btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.openThemeModal();
          });
        }
      };

      bindToggleBtn();
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindToggleBtn);
      }

      // 3. Escape key closes open modal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeThemeModal();
        }
      });

      console.log(`[ThemeEngine] Initialized with theme: ${this.getThemeInfo().name}`);
    }
  };

  // Auto-init immediately
  ThemeEngine.init();

  return ThemeEngine;
});
