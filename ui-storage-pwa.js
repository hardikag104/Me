/**
 * ============================================================================
 * Me Life OS — Agent 9: Data Persistence, Backup & PWA Engine
 * File: d:/Me/life-tracker/ui-storage-pwa.js
 * 
 * Bulletproof, high-performance architecture for:
 * 1. UnifiedStorageAdapter (window.MeStorage):
 *    - Centralized wrapper over localStorage with safe JSON parse/stringify
 *    - Schema versioning & automated migrations (v1 -> v2)
 *    - Seamless in-memory auto-fallback for private browsing, quota exceptions, or restricted environments
 *    - PubSub event bus & cross-tab synchronization via 'storage' events
 *    - Typed domain accessors for Timetable, Tasks, Habits, Scratchpad, Food, Sleep, Theme
 * 
 * 2. BackupSyncEngine (window.MeBackup):
 *    - 'Export Backup (JSON)': Downloads me-life-os-backup-YYYY-MM-DD.json containing all data
 *      (timetable, attendance, tasks, habits, scratchpad, food, sleep, theme, and rawStorage).
 *    - 'Import Backup (JSON)': File upload that restores all data and refreshes all views seamlessly.
 *    - 'Copy / Paste JSON': Direct clipboard transfer for easy PC <-> Android mobile syncing without files.
 *    - Interactive direct text paste drawer for mobile Android Chrome clipboard restrictions.
 *    - Live storage metrics (stored record count and payload byte size).
 * 
 * 3. PWAEngine (window.MePWA):
 *    - Service Worker registration & update notification lifecycle.
 *    - Install prompt handler: Show '📲 Install App' banner on mobile Chrome & header action button.
 *    - Offline status banner: Detect online/offline events, update UI banners, and show toast notifications.
 * ============================================================================
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.MeStorage = exports.MeStorage;
    root.MeBackup = exports.MeBackup;
    root.MePWA = exports.MePWA;
    root.MeStoragePWA = exports;
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // ============================================================================
  // UTILITY HELPERS
  // ============================================================================

  function getTodayIsoString() {
    return new Date().toISOString().slice(0, 10);
  }

  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return Object.assign({}, obj);
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function isDateKey(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
  }

  // Known key prefixes belonging to Me Life OS
  const APP_KEY_PREFIXES = ['me_', 'lt_', 'bits_', 'food_', 'sleep_', 'task_'];

  function isAppStorageKey(key) {
    if (!key || typeof key !== 'string') return false;
    return APP_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
  }

  // ============================================================================
  // 1. IN-MEMORY STORAGE FALLBACK
  // ============================================================================

  class MemoryStorage {
    constructor() {
      this._map = new Map();
    }
    getItem(key) {
      return this._map.has(key) ? this._map.get(key) : null;
    }
    setItem(key, value) {
      this._map.set(key, String(value));
    }
    removeItem(key) {
      this._map.delete(key);
    }
    clear() {
      this._map.clear();
    }
    key(index) {
      const keys = Array.from(this._map.keys());
      return keys[index] !== undefined ? keys[index] : null;
    }
    get length() {
      return this._map.size;
    }
  }

  // ============================================================================
  // 2. UNIFIED STORAGE ADAPTER (window.MeStorage)
  // ============================================================================

  const CURRENT_SCHEMA_VERSION = 2;
  const SCHEMA_KEY = 'me_storage_schema_version';

  class UnifiedStorageAdapter {
    constructor() {
      this.isLocalStorageAvailable = this._verifyStorage();
      this.storage = this.isLocalStorageAvailable ? window.localStorage : new MemoryStorage();
      this.listeners = new Map(); // Event PubSub

      // Initialize versioning and run migrations if necessary
      this._initVersioning();

      // Listen for multi-tab storage synchronization
      this._setupCrossTabSync();
    }

    _verifyStorage() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const testKey = '__me_test_storage_probe__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (err) {
        console.warn('[MeStorage] LocalStorage is unavailable or restricted. Operating in In-Memory mode.', err);
        return false;
      }
    }

    _initVersioning() {
      const storedVersion = this.getItem(SCHEMA_KEY, 1);
      if (typeof storedVersion === 'number' && storedVersion < CURRENT_SCHEMA_VERSION) {
        this._runMigrations(storedVersion, CURRENT_SCHEMA_VERSION);
      }
      this.setItem(SCHEMA_KEY, CURRENT_SCHEMA_VERSION);
    }

    _runMigrations(fromVersion, toVersion) {
      console.log(`[MeStorage] Running storage migration from v${fromVersion} to v${toVersion}...`);
      try {
        if (fromVersion < 2) {
          // Migration v1 -> v2: Standardize task and attendance aliases if needed
          const legacyTodos = this.getItem('todos', null);
          if (legacyTodos && !this.hasItem('me_tasks_todos')) {
            this.setItem('me_tasks_todos', legacyTodos);
            this.removeItem('todos');
          }
          const legacyHabits = this.getItem('habits', null);
          if (legacyHabits && !this.hasItem('me_tasks_habits')) {
            this.setItem('me_tasks_habits', legacyHabits);
            this.removeItem('habits');
          }
        }
      } catch (err) {
        console.error('[MeStorage] Migration error:', err);
      }
    }

    _setupCrossTabSync() {
      if (typeof window === 'undefined') return;
      window.addEventListener('storage', (event) => {
        if (!event.key) {
          // Storage clear
          this.emit('storage:clear', { url: event.url });
          this.emit('change', { key: null, action: 'clear' });
          return;
        }

        const oldValue = this.safeParse(event.oldValue, null);
        const newValue = this.safeParse(event.newValue, null);

        this.emit(`change:${event.key}`, { key: event.key, oldValue, newValue, remote: true });
        this.emit('change', { key: event.key, oldValue, newValue, remote: true });
      });
    }

    // --- Serialization Helpers ---

    safeParse(raw, fallback = null) {
      if (raw === null || raw === undefined) return deepClone(fallback);
      if (typeof raw !== 'string') return deepClone(raw);
      try {
        return JSON.parse(raw);
      } catch (err) {
        console.warn('[MeStorage] Error parsing JSON string:', err, raw);
        return deepClone(fallback);
      }
    }

    safeStringify(value, fallback = '{}') {
      try {
        const seen = new WeakSet();
        return JSON.stringify(value, (k, val) => {
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return '[Circular]';
            seen.add(val);
          }
          if (typeof val === 'bigint') return val.toString();
          return val;
        });
      } catch (err) {
        console.error('[MeStorage] Error stringifying object:', err);
        return typeof fallback === 'string' ? fallback : JSON.stringify(fallback);
      }
    }

    // --- Core Key-Value Operations ---

    getItem(key, fallback = null) {
      try {
        const raw = this.storage.getItem(key);
        if (raw === null || raw === undefined) return deepClone(fallback);
        return this.safeParse(raw, fallback);
      } catch (err) {
        console.warn(`[MeStorage] Error reading key "${key}":`, err);
        return deepClone(fallback);
      }
    }

    setItem(key, value) {
      const cloned = deepClone(value);
      try {
        const str = this.safeStringify(cloned);
        this.storage.setItem(key, str);
        this.emit(`change:${key}`, { key, value: cloned, remote: false });
        this.emit('change', { key, value: cloned, remote: false });
        return true;
      } catch (err) {
        console.error(`[MeStorage] Error writing key "${key}":`, err);
        // If quota exceeded and using localStorage, attempt fallback to in-memory for this session
        if (this.isLocalStorageAvailable) {
          console.warn('[MeStorage] LocalStorage quota exceeded. Switching to in-memory fallback.');
          const mem = new MemoryStorage();
          for (let i = 0; i < this.storage.length; i++) {
            const k = this.storage.key(i);
            if (k) mem.setItem(k, this.storage.getItem(k));
          }
          this.storage = mem;
          this.isLocalStorageAvailable = false;
          this.storage.setItem(key, this.safeStringify(cloned));
          return true;
        }
        return false;
      }
    }

    removeItem(key) {
      try {
        this.storage.removeItem(key);
        this.emit(`change:${key}`, { key, value: null, action: 'remove', remote: false });
        this.emit('change', { key, value: null, action: 'remove', remote: false });
        return true;
      } catch (err) {
        console.error(`[MeStorage] Error removing key "${key}":`, err);
        return false;
      }
    }

    hasItem(key) {
      try {
        return this.storage.getItem(key) !== null;
      } catch {
        return false;
      }
    }

    getAllKeys(prefix = null) {
      const keys = [];
      try {
        for (let i = 0; i < this.storage.length; i++) {
          const k = this.storage.key(i);
          if (k) {
            if (!prefix || k.startsWith(prefix)) {
              keys.push(k);
            }
          }
        }
      } catch (err) {
        console.warn('[MeStorage] Error listing keys:', err);
      }
      return keys;
    }

    getAll(prefix = null) {
      const dump = {};
      const keys = this.getAllKeys(prefix);
      keys.forEach(k => {
        dump[k] = this.getItem(k);
      });
      return dump;
    }

    setAll(keyValueMap) {
      if (!keyValueMap || typeof keyValueMap !== 'object') return false;
      Object.entries(keyValueMap).forEach(([k, v]) => {
        this.setItem(k, v);
      });
      return true;
    }

    clear(prefix = null) {
      if (!prefix) {
        this.storage.clear();
        this.emit('storage:clear');
        this.emit('change', { key: null, action: 'clear' });
        return true;
      }
      const keys = this.getAllKeys(prefix);
      keys.forEach(k => this.removeItem(k));
      return true;
    }

    getStorageUsage() {
      let totalBytes = 0;
      let appBytes = 0;
      let totalKeys = 0;
      let appKeys = 0;

      try {
        for (let i = 0; i < this.storage.length; i++) {
          const k = this.storage.key(i);
          if (k) {
            totalKeys++;
            const val = this.storage.getItem(k) || '';
            const itemBytes = (k.length + val.length) * 2; // UTF-16 approximation
            totalBytes += itemBytes;
            if (isAppStorageKey(k)) {
              appKeys++;
              appBytes += itemBytes;
            }
          }
        }
      } catch (err) {
        console.warn('[MeStorage] Error calculating storage usage:', err);
      }

      return {
        totalKeys,
        appKeys,
        totalBytes,
        appBytes,
        formattedTotalSize: formatBytes(totalBytes),
        formattedAppSize: formatBytes(appBytes),
        sizeKB: (appBytes / 1024).toFixed(2),
        isLocalStorage: this.isLocalStorageAvailable
      };
    }

    // --- PubSub Event System ---

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    }

    emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(cb => {
          try {
            cb(data);
          } catch (e) {
            console.error(`[MeStorage] Error in listener for "${event}":`, e);
          }
        });
      }
    }

    // --- Domain-Specific Accessors ---

    // 1. Timetable & Attendance
    getTimetableData() {
      return {
        attendance: this.getItem('me_timetable_attendance', {}),
        notes: this.getItem('me_timetable_notes', {}),
        baseline: this.getItem('me_timetable_baseline', null)
      };
    }

    saveTimetableData({ attendance, notes, baseline }) {
      if (attendance !== undefined) this.setItem('me_timetable_attendance', attendance);
      if (notes !== undefined) this.setItem('me_timetable_notes', notes);
      if (baseline !== undefined) this.setItem('me_timetable_baseline', baseline);
    }

    // 2. Tasks & Chores
    getTasksData() {
      return {
        todos: this.getItem('me_tasks_todos', []),
        settings: this.getItem('me_tasks_settings', {}),
        meta: this.getItem('me_tasks_meta', {})
      };
    }

    saveTasksData({ todos, settings, meta }) {
      if (todos !== undefined) this.setItem('me_tasks_todos', todos);
      if (settings !== undefined) this.setItem('me_tasks_settings', settings);
      if (meta !== undefined) this.setItem('me_tasks_meta', meta);
    }

    // 3. Habits
    getHabitsData() {
      return {
        habits: this.getItem('me_tasks_habits', []),
        habitLogs: this.getItem('me_tasks_habit_logs', {})
      };
    }

    saveHabitsData({ habits, habitLogs }) {
      if (habits !== undefined) this.setItem('me_tasks_habits', habits);
      if (habitLogs !== undefined) this.setItem('me_tasks_habit_logs', habitLogs);
    }

    // 4. Scratchpad
    getScratchpadData() {
      return this.getItem('me_tasks_scratchpad', []);
    }

    saveScratchpadData(notes) {
      this.setItem('me_tasks_scratchpad', notes);
    }

    // 5. Food & Hydration
    getFoodData(dateStr = getTodayIsoString()) {
      return {
        meals: this.getItem(`lt_${dateStr}_meals`, { breakfast: [], lunch: [], snacks: [], dinner: [] }),
        hydration: this.getItem(`lt_${dateStr}_hydration`, { glasses: 0, timestamps: [] })
      };
    }

    saveFoodData(dateStr, { meals, hydration }) {
      if (meals !== undefined) this.setItem(`lt_${dateStr}_meals`, meals);
      if (hydration !== undefined) this.setItem(`lt_${dateStr}_hydration`, hydration);
    }

    // 6. Sleep & Journal
    getSleepData(dateStr = getTodayIsoString()) {
      return {
        sleep: this.getItem(`me_${dateStr}_sleep`, this.getItem(`lt_${dateStr}_sleep`, {})),
        journal: this.getItem(`me_${dateStr}_journal`, this.getItem(`lt_${dateStr}_journal`, ''))
      };
    }

    saveSleepData(dateStr, { sleep, journal }) {
      if (sleep !== undefined) {
        this.setItem(`me_${dateStr}_sleep`, sleep);
        this.setItem(`lt_${dateStr}_sleep`, sleep);
      }
      if (journal !== undefined) {
        this.setItem(`me_${dateStr}_journal`, journal);
        this.setItem(`lt_${dateStr}_journal`, journal);
      }
    }

    // 7. Theme & Preferences
    getThemeData() {
      return this.getItem('me_theme', {
        mode: 'dark',
        accent: '#7c5cfc',
        amoled: false,
        activeTab: this.getItem('me_active_tab', 'timetable')
      });
    }

    saveThemeData(themeObj) {
      this.setItem('me_theme', themeObj);
      if (themeObj.activeTab) {
        this.setItem('me_active_tab', themeObj.activeTab);
      }
    }
  }

  // Create singleton instance
  const MeStorage = new UnifiedStorageAdapter();

  // ============================================================================
  // 3. 1-CLICK BACKUP & RESTORE ENGINE (window.MeBackup)
  // ============================================================================

  class BackupSyncEngine {
    constructor(storageAdapter) {
      this.storage = storageAdapter || MeStorage;
      this.callbacks = {
        onRestore: null,
        showToast: null
      };
      this.modalInitialized = false;
    }

    init(options = {}) {
      if (options.onRestore) this.callbacks.onRestore = options.onRestore;
      if (options.showToast) this.callbacks.showToast = options.showToast;

      this._bindModalUI();
      this.refreshStatsUI();
    }

    _showToast(message, icon = '✓') {
      if (typeof this.callbacks.showToast === 'function') {
        this.callbacks.showToast(message, icon);
      } else if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(message, icon);
      } else {
        const toast = document.getElementById('global-toast');
        const iconEl = document.getElementById('globalToastIcon');
        const msgEl = document.getElementById('globalToastMsg');
        if (toast && msgEl) {
          msgEl.textContent = message;
          if (iconEl) iconEl.textContent = icon;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3200);
        }
      }
    }

    // --- Data Collection & Payload Generation ---

    generatePayload() {
      const allKeys = this.storage.getAllKeys();
      const rawStorage = {};
      const foodLogs = {};
      const sleepLogs = {};
      const journalLogs = {};

      allKeys.forEach(k => {
        if (isAppStorageKey(k)) {
          const val = this.storage.getItem(k);
          rawStorage[k] = val;

          // Categorize date-indexed food logs
          if (k.startsWith('lt_') && k.endsWith('_meals')) {
            const date = k.replace('lt_', '').replace('_meals', '');
            if (isDateKey(date)) {
              if (!foodLogs[date]) foodLogs[date] = {};
              foodLogs[date].meals = val;
            }
          } else if (k.startsWith('lt_') && k.endsWith('_hydration')) {
            const date = k.replace('lt_', '').replace('_hydration', '');
            if (isDateKey(date)) {
              if (!foodLogs[date]) foodLogs[date] = {};
              foodLogs[date].hydration = val;
            }
          }

          // Categorize date-indexed sleep logs
          if ((k.startsWith('me_') || k.startsWith('lt_')) && k.endsWith('_sleep')) {
            const date = k.replace(/^(me_|lt_)/, '').replace('_sleep', '');
            if (isDateKey(date)) {
              sleepLogs[date] = val;
            }
          }

          // Categorize date-indexed reflections / journals
          if ((k.startsWith('me_') || k.startsWith('lt_')) && k.endsWith('_journal')) {
            const date = k.replace(/^(me_|lt_)/, '').replace('_journal', '');
            if (isDateKey(date)) {
              journalLogs[date] = val;
            }
          }
        }
      });

      const timetable = this.storage.getTimetableData();
      const tasks = this.storage.getTasksData();
      const habits = this.storage.getHabitsData();
      const scratchpad = this.storage.getScratchpadData();
      const theme = this.storage.getThemeData();

      const attendanceDates = Object.keys(timetable.attendance || {}).length;
      const tasksCount = Array.isArray(tasks.todos) ? tasks.todos.length : 0;
      const habitsCount = Array.isArray(habits.habits) ? habits.habits.length : 0;
      const scratchpadCount = Array.isArray(scratchpad) ? scratchpad.length : 0;
      const foodDays = Object.keys(foodLogs).length;
      const sleepDays = Object.keys(sleepLogs).length;

      const payload = {
        app: 'Me — Minimalist Life OS',
        version: '2.0.0',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        exportedAtLocal: new Date().toLocaleString(),
        deviceInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
        },
        stats: {
          recordCount: Object.keys(rawStorage).length,
          timetableRecords: attendanceDates,
          tasksCount,
          habitsCount,
          scratchpadCount,
          foodDaysLogged: foodDays,
          sleepDaysLogged: sleepDays
        },
        data: {
          timetable,
          attendance: timetable.attendance,
          tasks,
          habits,
          scratchpad,
          food: foodLogs,
          sleep: {
            logs: sleepLogs,
            journals: journalLogs
          },
          theme
        },
        rawStorage,
        storage: rawStorage
      };

      return payload;
    }

    // --- 1. Export Backup (JSON) ---

    exportBackupJson() {
      const payload = this.generatePayload();
      const jsonStr = this.storage.safeStringify(payload, null);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const today = getTodayIsoString();
      const filename = `me-life-os-backup-${today}.json`;

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      this._showToast(`Backup exported: ${filename}`, '📥');
      this.refreshStatsUI();
      return filename;
    }

    // --- 2. Import Backup (JSON) ---

    handleFileInput(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          this.restorePayload(content);
        } catch (err) {
          alert('Failed to parse backup JSON file: ' + err.message);
        }
      };
      reader.onerror = () => {
        alert('Failed to read selected file.');
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input so same file can be chosen again
    }

    restorePayload(payloadData, options = {}) {
      let parsed = payloadData;
      if (typeof payloadData === 'string') {
        try {
          parsed = JSON.parse(payloadData);
        } catch (err) {
          alert('Invalid JSON structure: ' + err.message);
          return false;
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        alert('Invalid backup payload.');
        return false;
      }

      // Detect payload format:
      // Case A: New format with rawStorage
      // Case B: Legacy format with storage
      // Case C: Semantic data dictionary with data: { ... }
      // Case D: Direct key-value dictionary { me_... : ... }
      let storageDict = null;

      if (parsed.rawStorage && typeof parsed.rawStorage === 'object') {
        storageDict = parsed.rawStorage;
      } else if (parsed.storage && typeof parsed.storage === 'object') {
        storageDict = parsed.storage;
      } else if (parsed.data && typeof parsed.data === 'object') {
        // Rebuild key dictionary from semantic data
        storageDict = this._rebuildStorageFromData(parsed.data);
      } else {
        // Check if root object itself contains app keys
        const rootKeys = Object.keys(parsed);
        const appKeys = rootKeys.filter(isAppStorageKey);
        if (appKeys.length > 0) {
          storageDict = parsed;
        }
      }

      if (!storageDict || Object.keys(storageDict).length === 0) {
        alert('Could not find recognizable Life OS records in this backup.');
        return false;
      }

      const totalRecords = Object.keys(storageDict).length;
      const exportDate = parsed.exportedAtLocal || parsed.exportedAt || 'Unknown date';

      if (!options.skipConfirm) {
        const confirmMsg = `Restore ${totalRecords} records from backup dated ${exportDate}?\n\nThis will safely update your timetable, attendance, tasks, habits, food, and sleep records.`;
        if (!confirm(confirmMsg)) {
          return false;
        }
      }

      // Perform atomic-like restoration
      Object.entries(storageDict).forEach(([key, val]) => {
        this.storage.setItem(key, val);
      });

      // Close modal if open
      const modal = document.getElementById('backupSyncModal');
      if (modal) modal.classList.remove('open');

      // Seamlessly refresh all application views
      this.refreshAllViews(parsed);

      this._showToast('Data restored successfully! All views refreshed.', '✨');
      this.refreshStatsUI();

      // Dispatch global window event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('me:data-restored', { detail: { payload: parsed, count: totalRecords } }));
      }

      return true;
    }

    _rebuildStorageFromData(data) {
      const dict = {};
      if (!data) return dict;

      if (data.timetable) {
        if (data.timetable.attendance) dict['me_timetable_attendance'] = data.timetable.attendance;
        if (data.timetable.notes) dict['me_timetable_notes'] = data.timetable.notes;
        if (data.timetable.baseline) dict['me_timetable_baseline'] = data.timetable.baseline;
      }
      if (data.attendance) {
        dict['me_timetable_attendance'] = data.attendance;
      }

      if (data.tasks) {
        if (data.tasks.todos) dict['me_tasks_todos'] = data.tasks.todos;
        if (data.tasks.settings) dict['me_tasks_settings'] = data.tasks.settings;
        if (data.tasks.meta) dict['me_tasks_meta'] = data.tasks.meta;
      }

      if (data.habits) {
        if (data.habits.habits) dict['me_tasks_habits'] = data.habits.habits;
        if (data.habits.habitLogs) dict['me_tasks_habit_logs'] = data.habits.habitLogs;
      }

      if (data.scratchpad) {
        dict['me_tasks_scratchpad'] = data.scratchpad;
      }

      if (data.food && typeof data.food === 'object') {
        Object.entries(data.food).forEach(([date, val]) => {
          if (val.meals) dict[`lt_${date}_meals`] = val.meals;
          if (val.hydration) dict[`lt_${date}_hydration`] = val.hydration;
        });
      }

      if (data.sleep && typeof data.sleep === 'object') {
        if (data.sleep.logs) {
          Object.entries(data.sleep.logs).forEach(([date, val]) => {
            dict[`me_${date}_sleep`] = val;
            dict[`lt_${date}_sleep`] = val;
          });
        }
        if (data.sleep.journals) {
          Object.entries(data.sleep.journals).forEach(([date, val]) => {
            dict[`me_${date}_journal`] = val;
            dict[`lt_${date}_journal`] = val;
          });
        }
      }

      if (data.theme) {
        dict['me_theme'] = data.theme;
        if (data.theme.activeTab) dict['me_active_tab'] = data.theme.activeTab;
      }

      return dict;
    }

    refreshAllViews(payload) {
      // 1. Registered custom callback
      if (typeof this.callbacks.onRestore === 'function') {
        try {
          this.callbacks.onRestore(payload);
        } catch (e) {
          console.warn('[MeBackup] Error in onRestore callback:', e);
        }
      }

      // 2. Refresh MeApp views if available
      if (window.MeApp) {
        const app = window.MeApp;
        try {
          if (typeof app.renderTimetableClasses === 'function') app.renderTimetableClasses();
          if (typeof app.updateAttendanceAnalytics === 'function') app.updateAttendanceAnalytics();
          if (typeof app.renderHabits === 'function') app.renderHabits();
          if (typeof app.renderTodos === 'function') app.renderTodos();
          if (typeof app.renderScratchpad === 'function') app.renderScratchpad();
          if (app.foodComponent && typeof app.foodComponent.render === 'function') app.foodComponent.render();
          if (typeof app.setupSleep === 'function') app.setupSleep();
          if (typeof app.calculateMasterScore === 'function') app.calculateMasterScore();
        } catch (err) {
          console.error('[MeBackup] Error during live view refresh:', err);
        }
      }
    }

    // --- 3. Copy / Paste JSON (Direct Clipboard PC <-> Android Mobile Sync) ---

    copyBackupClipboard() {
      const payload = this.generatePayload();
      const jsonStr = this.storage.safeStringify(payload, null);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr)
          .then(() => {
            this._showToast('JSON copied to clipboard! Ready to paste on Android / PC.', '📋');
          })
          .catch(() => {
            this._copyFallback(jsonStr);
          });
      } else {
        this._copyFallback(jsonStr);
      }
    }

    _copyFallback(text) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this._showToast('JSON copied to clipboard! Ready to paste on Android / PC.', '📋');
      } catch (err) {
        this._showToast('Failed to copy to clipboard. Please use file export.', '⚠️');
      }
    }

    pasteFromClipboard() {
      // Try reading clipboard directly
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText()
          .then(text => {
            if (text && text.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(text.trim());
                if (this.restorePayload(parsed)) {
                  return;
                }
              } catch {
                // fall through to manual paste drawer
              }
            }
            this.openDirectPasteDrawer(text);
          })
          .catch(() => {
            // Permission denied or blocked on mobile Chrome — open direct paste drawer
            this.openDirectPasteDrawer('');
          });
      } else {
        this.openDirectPasteDrawer('');
      }
    }

    openDirectPasteDrawer(initialText = '') {
      const section = document.getElementById('pasteJsonSection');
      const textarea = document.getElementById('directJsonInput');
      if (section && textarea) {
        section.style.display = 'block';
        if (initialText) textarea.value = initialText;
        textarea.focus();
        this._showToast('Paste your backup JSON into the box below', '📲');
      } else {
        const userJson = prompt('Paste your backup JSON string here:');
        if (userJson) {
          this.restorePayload(userJson);
        }
      }
    }

    restoreFromDirectInput() {
      const textarea = document.getElementById('directJsonInput');
      if (!textarea) return;
      const text = textarea.value.trim();
      if (!text) {
        alert('Please paste a JSON backup payload first.');
        return;
      }
      if (this.restorePayload(text)) {
        textarea.value = '';
        const section = document.getElementById('pasteJsonSection');
        if (section) section.style.display = 'none';
      }
    }

    // --- Modal Binding & Real-Time Stats ---

    _bindModalUI() {
      if (this.modalInitialized) return;
      this.modalInitialized = true;

      const modal = document.getElementById('backupSyncModal');
      const openBtn = document.getElementById('btnOpenBackupModal');
      const closeBtn = document.getElementById('btnCloseBackupModal');
      const exportBtn = document.getElementById('btnExportJsonFile');
      const importTrigger = document.getElementById('btnTriggerImportFile');
      const fileInput = document.getElementById('backupFileInput');
      const copyBtn = document.getElementById('btnCopyJsonToClipboard');
      const pasteBtn = document.getElementById('btnPasteJsonClipboard');
      const restoreDirectBtn = document.getElementById('btnRestoreDirectJson');
      const clearDirectBtn = document.getElementById('btnClearDirectJson');
      const closePasteBtn = document.getElementById('btnClosePasteSection');
      const demoBtn = document.getElementById('btnLoadDemoData');
      const resetTodayBtn = document.getElementById('btnResetTodayProgress');
      const factoryResetBtn = document.getElementById('btnHardWipeStorage');

      openBtn?.addEventListener('click', () => {
        this.refreshStatsUI();
        modal?.classList.add('open');
      });

      closeBtn?.addEventListener('click', () => {
        modal?.classList.remove('open');
      });

      modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });

      exportBtn?.addEventListener('click', () => this.exportBackupJson());
      importTrigger?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', (e) => this.handleFileInput(e));
      copyBtn?.addEventListener('click', () => this.copyBackupClipboard());
      pasteBtn?.addEventListener('click', () => this.pasteFromClipboard());
      restoreDirectBtn?.addEventListener('click', () => this.restoreFromDirectInput());

      clearDirectBtn?.addEventListener('click', () => {
        const textarea = document.getElementById('directJsonInput');
        if (textarea) textarea.value = '';
      });

      closePasteBtn?.addEventListener('click', () => {
        const section = document.getElementById('pasteJsonSection');
        if (section) section.style.display = 'none';
      });

      demoBtn?.addEventListener('click', () => this.loadDemoData());
      resetTodayBtn?.addEventListener('click', () => this.resetToday());
      factoryResetBtn?.addEventListener('click', () => this.factoryReset());
    }

    refreshStatsUI() {
      const usage = this.storage.getStorageUsage();
      const keysEl = document.getElementById('statStoredKeys');
      const sizeEl = document.getElementById('statPayloadSize');
      const engineEl = document.getElementById('statStorageEngine');

      if (keysEl) keysEl.textContent = `Stored Records: ${usage.appKeys} keys`;
      if (sizeEl) sizeEl.textContent = `Payload Size: ${usage.sizeKB} KB`;
      if (engineEl) {
        engineEl.textContent = usage.isLocalStorage
          ? 'Client-Side LocalStorage (Private & Offline)'
          : 'In-Memory Fallback (Active Session Only)';
      }
    }

    loadDemoData() {
      if (!confirm('Load sample demonstration data? This populates today with BITS classes, habits, meals, and sleep.')) {
        return;
      }

      const today = getTodayIsoString();

      // Habits
      const habits = {
        sleep_early: true,
        wake_early: true,
        water_target: true,
        healthy_meal: true,
        no_junk: true,
        workout: true,
        deep_work: true,
        no_doomscroll: false,
        learn: true
      };
      this.storage.setItem(`me_${today}_habits`, habits);
      this.storage.setItem(`lt_${today}_habits`, habits);

      // Sleep
      const sleep = { bed: '22:45', wake: '06:30', quality: '5' };
      this.storage.setItem(`me_${today}_sleep`, sleep);
      this.storage.setItem(`lt_${today}_sleep`, sleep);

      // Reflection
      const reflection = 'Crushed 3 hours of focused system design. Hydration on point. Ready to conquer tomorrow.';
      this.storage.setItem(`me_${today}_journal`, reflection);
      this.storage.setItem(`lt_${today}_journal`, reflection);

      // Attendance sample
      if (window.BITS_TIMETABLE) {
        const schedule = window.BITS_TIMETABLE.getDailySchedule(new Date());
        if (schedule.classes && schedule.classes.length > 0) {
          window.BITS_TIMETABLE.markAttendance(today, schedule.classes[0].id, 'present');
        }
      }

      const modal = document.getElementById('backupSyncModal');
      if (modal) modal.classList.remove('open');

      this._showToast('Sample demonstration data loaded!', '⚡');
      this.refreshAllViews();
      this.refreshStatsUI();
    }

    resetToday() {
      if (!confirm("Reset today's logged data? This resets today's habits, todos, sleep, and journal.")) return;
      const today = getTodayIsoString();
      const keys = [
        `me_${today}_habits`, `me_${today}_todos`, `me_${today}_sleep`, `me_${today}_journal`,
        `lt_${today}_habits`, `lt_${today}_sleep`, `lt_${today}_journal`,
        `lt_${today}_meals`, `lt_${today}_hydration`
      ];
      keys.forEach(k => this.storage.removeItem(k));
      this.refreshAllViews();
      this.refreshStatsUI();
      this._showToast("Today's progress reset", '↺');
    }

    factoryReset() {
      if (!confirm('⚠️ Factory reset will completely wipe all storage records across all dates. Continue?')) return;
      if (!confirm('Are you 100% sure? This cannot be undone.')) return;
      this.storage.clear();
      this.refreshAllViews();
      this.refreshStatsUI();
      this._showToast('All storage wiped. Factory clean state.', '⚠️');
      setTimeout(() => location.reload(), 600);
    }
  }

  // Create singleton instance
  const MeBackup = new BackupSyncEngine(MeStorage);

  // ============================================================================
  // 4. PWA ENGINE (window.MePWA)
  // ============================================================================

  class PWAEngine {
    constructor() {
      this.deferredPrompt = null;
      this.isStandalone = false;
      this.callbacks = {
        showToast: null
      };
      this.initialized = false;
    }

    init(options = {}) {
      if (this.initialized) return;
      this.initialized = true;

      if (options.showToast) this.callbacks.showToast = options.showToast;

      this._checkStandalone();
      this._registerServiceWorker();
      this._setupInstallPrompt();
      this._setupOfflineBanner();
    }

    _showToast(msg, icon = '✓') {
      if (typeof this.callbacks.showToast === 'function') {
        this.callbacks.showToast(msg, icon);
      } else if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(msg, icon);
      }
    }

    _checkStandalone() {
      if (typeof window === 'undefined') return;
      this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true ||
                          document.referrer.includes('android-app://');
    }

    _registerServiceWorker() {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('[MePWA] ServiceWorker registered with scope:', reg.scope);

            // Listen for waiting service worker (updates)
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this._showToast('New update available. Reloading...', '🔄');
                  }
                });
              }
            });
          })
          .catch(err => {
            console.warn('[MePWA] ServiceWorker registration failed:', err);
          });
      });
    }

    _setupInstallPrompt() {
      if (typeof window === 'undefined') return;

      const headerBtn = document.getElementById('btnHeaderInstall');
      const bannerInstall = document.getElementById('bannerInstallPwa');
      const btnPromptInstall = document.getElementById('btnPwaPromptInstall');
      const btnPromptDismiss = document.getElementById('btnPwaPromptDismiss');

      // If already in standalone mode, do not display install banners
      if (this.isStandalone) {
        if (headerBtn) headerBtn.style.display = 'none';
        if (bannerInstall) bannerInstall.style.display = 'none';
        return;
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar
        e.preventDefault();
        this.deferredPrompt = e;

        // Show header install button
        headerBtn?.classList.add('visible');

        // Show banner if not dismissed in this session
        const dismissed = sessionStorage.getItem('pwa_install_dismissed');
        if (!dismissed) {
          bannerInstall?.classList.add('show');
        }
      });

      const triggerInstall = () => {
        if (!this.deferredPrompt) {
          this._showToast('To install: tap browser menu (⋮) -> Add to Home Screen', '📲');
          return;
        }

        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            this._showToast('Me OS installed successfully! 🎉', '🚀');
          }
          this.deferredPrompt = null;
          bannerInstall?.classList.remove('show');
          headerBtn?.classList.remove('visible');
        });
      };

      headerBtn?.addEventListener('click', triggerInstall);
      btnPromptInstall?.addEventListener('click', triggerInstall);

      btnPromptDismiss?.addEventListener('click', () => {
        bannerInstall?.classList.remove('show');
        sessionStorage.setItem('pwa_install_dismissed', '1');
      });

      window.addEventListener('appinstalled', () => {
        this._showToast('Me OS added to home screen! 🚀', '📱');
        bannerInstall?.classList.remove('show');
        headerBtn?.classList.remove('visible');
        this.deferredPrompt = null;
      });
    }

    _setupOfflineBanner() {
      if (typeof window === 'undefined') return;

      const bannerOffline = document.getElementById('bannerOffline');

      const updateNetworkStatus = () => {
        const isOnline = navigator.onLine;
        if (!isOnline) {
          bannerOffline?.classList.add('show');
          this._showToast('Working offline (Local database active)', '⚡');
        } else {
          bannerOffline?.classList.remove('show');
          this._showToast('Back online — Sync ready', '🌐');
        }
      };

      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);

      // Initial check
      if (!navigator.onLine) {
        bannerOffline?.classList.add('show');
      }
    }

    canInstall() {
      return !!this.deferredPrompt;
    }

    isOnline() {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
  }

  // Create singleton instance
  const MePWA = new PWAEngine();

  // Auto-initialize when DOM is ready if running in browser
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        MeBackup._bindModalUI();
        MeBackup.refreshStatsUI();
        MePWA.init();
      });
    } else {
      MeBackup._bindModalUI();
      MeBackup.refreshStatsUI();
      MePWA.init();
    }
  }

  return {
    MeStorage,
    MeBackup,
    MePWA
  };
});
