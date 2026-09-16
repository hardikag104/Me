/**
 * ==============================================================================
 * ME LIFE OS — DYNAMIC HABIT & ROUTINE ENGINE (AGENT 5 LEAD)
 * ==============================================================================
 * Self-contained, modular Recurring Habits & Routine Engine providing:
 * 1. Pre-seeded habits:
 *    - 'Oil Hair' (Wednesday & Sunday night)
 *    - 'Eat Dry Fruits' (Daily morning)
 *    - 'Drink 3L Water' (Daily)
 * 2. Full Dynamic Customization:
 *    - ADD custom habits (Name, Icon, Category, Frequency: Daily/Custom Days, Time of Day, Target Value)
 *    - EDIT any habit
 *    - DELETE or PAUSE / RESUME any habit (Paused habits don't count against daily rate)
 * 3. Habit Cards:
 *    - Check-off circle with smooth check animation & numeric progress support (+0.5L, +1L)
 *    - Flame streak counter (e.g. 🔥 5 days) with smart streak logic (non-scheduled days do NOT break streak)
 *    - Frequency pill ('Wed, Sun', 'Daily', etc.), Time of Day badge, Category tag
 * 4. Weekly Mini-Heatmap:
 *    - 7-day dot/box progress row showing daily habit completion rate (0-100%)
 *    - Interactive day navigation and completion rate analytics
 *
 * Designed to cleanly embed in the Tasks tab or render as its own dedicated view.
 * Zero-dependency, pure vanilla JS + modern luxury dark-mode CSS styling.
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.HabitsUI = exports.HabitsUI;
    root.DynamicHabitsUI = exports.HabitsUI;
    root.RecurringHabitsEngine = exports.RecurringHabitsEngine;
    root.HabitsEngine = exports.RecurringHabitsEngine;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ============================================================================
  // 1. CONSTANTS & SCHEMAS
  // ============================================================================

  const STORAGE_KEYS = {
    HABITS: 'me_tasks_habits',
    HABIT_LOGS: 'me_tasks_habit_logs',
    UI_SETTINGS: 'me_habits_ui_settings'
  };

  const FREQUENCIES = {
    DAILY: 'daily',
    CUSTOM_DAYS: 'custom_days',
    WEEKDAYS: 'weekdays',
    WEEKENDS: 'weekends'
  };

  const TIME_OF_DAY = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    NIGHT: 'night',
    ANYTIME: 'anytime'
  };

  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const DEFAULT_CATEGORIES = [
    'Grooming',
    'Nutrition',
    'Hydration',
    'Fitness',
    'Mindset',
    'Academics',
    'Sleep',
    'Discipline'
  ];

  const POPULAR_ICONS = [
    '🧴', '🥜', '💧', '🏃', '📚', '🧘', '💤', '🥗',
    '🎯', '💪', '☕', '💊', '🧠', '☀️', '🌙', '🚶',
    '🥑', '⚡', '🚿', '✍️', '🍎', '🏋️', '🫖', '🕯️'
  ];

  // Pre-seeded habits strictly matching user requirements
  const PRE_SEEDED_HABITS = [
    {
      id: 'habit_oil_hair',
      name: 'Oil Hair',
      description: 'Oil hair with coconut/almond oil before sleep (Wed & Sun)',
      icon: '🧴',
      category: 'Grooming',
      frequency: FREQUENCIES.CUSTOM_DAYS,
      daysOfWeek: [0, 3], // Sunday (0) & Wednesday (3)
      timeOfDay: TIME_OF_DAY.NIGHT,
      targetValue: 1,
      unit: 'times',
      isActive: true,
      order: 1,
      createdAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'habit_dry_fruits',
      name: 'Eat Dry Fruits',
      description: 'Soaked almonds, walnuts, and raisins (Daily morning)',
      icon: '🥜',
      category: 'Nutrition',
      frequency: FREQUENCIES.DAILY,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeOfDay: TIME_OF_DAY.MORNING,
      targetValue: 1,
      unit: 'bowl',
      isActive: true,
      order: 2,
      createdAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'habit_water_3l',
      name: 'Drink 3L Water',
      description: 'Stay hydrated with regular water intake throughout the day',
      icon: '💧',
      category: 'Hydration',
      frequency: FREQUENCIES.DAILY,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeOfDay: TIME_OF_DAY.ANYTIME,
      targetValue: 3,
      unit: 'Liters',
      isActive: true,
      order: 3,
      createdAt: '2026-09-01T00:00:00.000Z'
    }
  ];

  // ============================================================================
  // 2. DATE & UTILITY HELPERS
  // ============================================================================

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDaysToString(dateStr, days) {
    const parts = (dateStr || getTodayString()).split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateString(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function getDayOfWeek(dateStr) {
    const d = parseDateString(dateStr);
    return d.getDay(); // 0=Sun..6=Sat
  }

  function daysDifference(dateStrA, dateStrB) {
    const da = parseDateString(dateStrA);
    const db = parseDateString(dateStrB);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((db.getTime() - da.getTime()) / msPerDay);
  }

  function generateId(prefix = 'habit') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 7);
    return `${prefix}_${ts}_${rand}`;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return Object.assign({}, obj);
    }
  }

  // ============================================================================
  // 3. STORAGE ADAPTER & EVENT BUS
  // ============================================================================

  class HabitStorage {
    constructor() {
      this.listeners = new Map();
      this.inMemory = {};
      this.isAvailable = this.testStorage();
      this.ensureDefaults();
    }

    testStorage() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const test = '__me_test_habits__';
        window.localStorage.setItem(test, '1');
        window.localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    }

    get(key, fallback = null) {
      if (this.isAvailable) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw === null || raw === undefined) return deepClone(fallback);
          return JSON.parse(raw);
        } catch (e) {
          console.warn(`[HabitsUI] Error reading key "${key}":`, e);
          return deepClone(fallback);
        }
      }
      return this.inMemory[key] !== undefined ? deepClone(this.inMemory[key]) : deepClone(fallback);
    }

    set(key, val) {
      const cloned = deepClone(val);
      if (this.isAvailable) {
        try {
          window.localStorage.setItem(key, JSON.stringify(cloned));
        } catch (e) {
          console.error(`[HabitsUI] Error writing key "${key}":`, e);
        }
      }
      this.inMemory[key] = cloned;
    }

    subscribe(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event).add(callback);
      return () => {
        const set = this.listeners.get(event);
        if (set) {
          set.delete(callback);
          if (set.size === 0) this.listeners.delete(event);
        }
      };
    }

    emit(event, payload) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(cb => {
          try { cb(payload); } catch (err) { console.error(`[HabitsUI] Event listener error (${event}):`, err); }
        });
      }
      if (event !== '*' && this.listeners.has('*')) {
        this.listeners.get('*').forEach(cb => {
          try { cb({ event, payload }); } catch (err) { console.error('[HabitsUI] Global listener error:', err); }
        });
      }
    }

    ensureDefaults() {
      let habits = this.get(STORAGE_KEYS.HABITS, null);
      if (!Array.isArray(habits) || habits.length === 0) {
        this.set(STORAGE_KEYS.HABITS, PRE_SEEDED_HABITS);
      } else {
        // Ensure the 3 pre-seeded habits exist
        const existingNames = new Set(habits.map(h => (h.name || '').trim().toLowerCase()));
        let added = false;
        PRE_SEEDED_HABITS.forEach(seed => {
          if (!existingNames.has(seed.name.trim().toLowerCase())) {
            habits.push(deepClone(seed));
            added = true;
          }
        });
        if (added) {
          this.set(STORAGE_KEYS.HABITS, habits);
        }
      }

      const logs = this.get(STORAGE_KEYS.HABIT_LOGS, null);
      if (!logs || typeof logs !== 'object') {
        this.set(STORAGE_KEYS.HABIT_LOGS, {});
      }
    }
  }

  const storage = new HabitStorage();

  // ============================================================================
  // 4. CORE ENGINE & SMART STREAK LOGIC
  // ============================================================================

  const RecurringHabitsEngine = {
    storage,

    getHabits(includeInactive = true) {
      const list = storage.get(STORAGE_KEYS.HABITS, []);
      if (includeInactive) return deepClone(list);
      return deepClone(list.filter(h => h.isActive !== false));
    },

    getHabitById(id) {
      const list = this.getHabits(true);
      return list.find(h => h.id === id) || null;
    },

    /**
     * Check if habit is scheduled on a given date.
     * Non-scheduled days return false.
     * Paused habits return false.
     */
    isHabitScheduledForDate(habit, dateStr = getTodayString()) {
      if (!habit || habit.isActive === false) return false;

      // Don't schedule before habit creation date
      if (habit.createdAt) {
        const createdDayStr = habit.createdAt.slice(0, 10);
        if (daysDifference(createdDayStr, dateStr) < 0) {
          return false;
        }
      }

      const dow = getDayOfWeek(dateStr); // 0=Sun..6=Sat

      switch (habit.frequency) {
        case FREQUENCIES.DAILY:
          return true;
        case FREQUENCIES.CUSTOM_DAYS:
          return Array.isArray(habit.daysOfWeek) && habit.daysOfWeek.includes(dow);
        case FREQUENCIES.WEEKDAYS:
          return dow >= 1 && dow <= 5;
        case FREQUENCIES.WEEKENDS:
          return dow === 0 || dow === 6;
        default:
          return true;
      }
    },

    /**
     * Get all logs for a date.
     * Map of habitId -> { completed: boolean, value: number, timestamp: string }
     */
    getLogsForDate(dateStr = getTodayString()) {
      const allLogs = storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      return allLogs[dateStr] || {};
    },

    /**
     * Check if a habit was completed on a given date
     */
    isHabitCompletedOnDate(habitId, dateStr = getTodayString()) {
      const dateLogs = this.getLogsForDate(dateStr);
      const log = dateLogs[habitId];
      return Boolean(log && log.completed);
    },

    /**
     * Get numeric progress logged for a habit on a given date
     */
    getHabitProgress(habitId, dateStr = getTodayString()) {
      const dateLogs = this.getLogsForDate(dateStr);
      const log = dateLogs[habitId];
      if (!log) return 0;
      if (log.value !== undefined) return Number(log.value) || 0;
      return log.completed ? 1 : 0;
    },

    /**
     * SMART STREAK LOGIC:
     * Non-scheduled days (e.g. oiling hair on Monday when scheduled Wed & Sun)
     * do NOT break the streak!
     *
     * How it works:
     * 1. Collect all scheduled calendar days for this habit in chronological order up to referenceDate.
     * 2. If the habit is not scheduled today, today does not break the streak.
     * 3. If today IS scheduled and not yet marked done, grace period preserves the streak from
     *    the previous scheduled day so user's morning streak doesn't drop to 0!
     * 4. When completed on a scheduled day, the streak increments by 1.
     */
    getHabitStreak(habitId, referenceDateStr = getTodayString()) {
      const habit = this.getHabitById(habitId);
      if (!habit) return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, isPendingToday: false };

      const allLogs = storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      const createdDayStr = (habit.createdAt || '2026-09-01').slice(0, 10);

      // We evaluate up to 120 days of history for performance and accuracy
      let checkDate = createdDayStr;
      if (daysDifference(checkDate, referenceDateStr) > 120) {
        checkDate = addDaysToString(referenceDateStr, -120);
      }

      const scheduledDays = [];
      while (daysDifference(checkDate, referenceDateStr) >= 0) {
        if (this.isHabitScheduledForDate(habit, checkDate)) {
          scheduledDays.push(checkDate);
        }
        checkDate = addDaysToString(checkDate, 1);
      }

      if (scheduledDays.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, isPendingToday: false };
      }

      // Calculate longest streak across history
      let longestStreak = 0;
      let tempStreak = 0;
      let lastCompletedDate = null;

      for (let i = 0; i < scheduledDays.length; i++) {
        const day = scheduledDays[i];
        const isDone = allLogs[day] && allLogs[day][habitId] && Boolean(allLogs[day][habitId].completed);
        if (isDone) {
          tempStreak++;
          lastCompletedDate = day;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      // Calculate active current streak
      let currentStreak = 0;
      let i = scheduledDays.length - 1;
      let isPendingToday = false;

      // Grace period if today is scheduled and not yet marked done
      if (i >= 0 && scheduledDays[i] === referenceDateStr) {
        const todayDone = allLogs[referenceDateStr] && allLogs[referenceDateStr][habitId] && Boolean(allLogs[referenceDateStr][habitId].completed);
        if (!todayDone) {
          isPendingToday = true;
          i--; // Count streak backwards starting from previous scheduled day
        }
      }

      while (i >= 0) {
        const day = scheduledDays[i];
        const isDone = allLogs[day] && allLogs[day][habitId] && Boolean(allLogs[day][habitId].completed);
        if (isDone) {
          currentStreak++;
          i--;
        } else {
          break;
        }
      }

      return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastCompletedDate,
        isPendingToday
      };
    },

    /**
     * Toggle completion of a habit for a date
     */
    toggleHabitCompletion(habitId, dateStr = getTodayString()) {
      const habit = this.getHabitById(habitId);
      if (!habit) throw new Error(`Habit "${habitId}" not found`);

      const allLogs = storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      if (!allLogs[dateStr]) allLogs[dateStr] = {};

      const current = allLogs[dateStr][habitId];
      const currentlyDone = current ? Boolean(current.completed) : false;
      const nextDone = !currentlyDone;

      const targetVal = habit.targetValue || 1;
      const nextVal = nextDone ? targetVal : 0;

      allLogs[dateStr][habitId] = {
        completed: nextDone,
        value: nextVal,
        timestamp: nextDone ? new Date().toISOString() : null
      };

      storage.set(STORAGE_KEYS.HABIT_LOGS, allLogs);
      storage.emit('habits:changed', { action: 'toggle', habitId, dateStr, completed: nextDone, value: nextVal });

      // Keep window.TaskHabitEngine logs synchronized if present
      this.syncWithTaskHabitEngine();

      return { habitId, dateStr, completed: nextDone, value: nextVal };
    },

    /**
     * Log numeric progress for quantitative habits (e.g. 3L Water)
     */
    logHabitProgress(habitId, value, dateStr = getTodayString()) {
      const habit = this.getHabitById(habitId);
      if (!habit) throw new Error(`Habit "${habitId}" not found`);

      const target = habit.targetValue || 1;
      const numVal = Math.max(0, Math.round(Number(value) * 10) / 10);
      const isCompleted = numVal >= target;

      const allLogs = storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      if (!allLogs[dateStr]) allLogs[dateStr] = {};

      allLogs[dateStr][habitId] = {
        completed: isCompleted,
        value: numVal,
        timestamp: isCompleted ? new Date().toISOString() : null
      };

      storage.set(STORAGE_KEYS.HABIT_LOGS, allLogs);
      storage.emit('habits:changed', { action: 'progress', habitId, dateStr, completed: isCompleted, value: numVal });

      this.syncWithTaskHabitEngine();
      return { habitId, dateStr, completed: isCompleted, value: numVal, targetValue: target };
    },

    /**
     * ADD any new custom habit
     */
    addHabit(habitData) {
      if (!habitData || typeof habitData !== 'object') throw new Error('Habit data must be an object');
      const name = (habitData.name || '').trim();
      if (!name) throw new Error('Habit name cannot be empty');

      const frequency = habitData.frequency || FREQUENCIES.DAILY;
      let daysOfWeek = habitData.daysOfWeek;

      if (frequency === FREQUENCIES.DAILY) {
        daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      } else if (frequency === FREQUENCIES.WEEKDAYS) {
        daysOfWeek = [1, 2, 3, 4, 5];
      } else if (frequency === FREQUENCIES.WEEKENDS) {
        daysOfWeek = [0, 6];
      } else if (frequency === FREQUENCIES.CUSTOM_DAYS) {
        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
          daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
        } else {
          daysOfWeek = [...new Set(daysOfWeek.map(d => Number(d) % 7))].sort((a, b) => a - b);
        }
      }

      const habits = storage.get(STORAGE_KEYS.HABITS, []);
      const newHabit = {
        id: habitData.id || generateId('habit'),
        name: name,
        icon: habitData.icon || '🎯',
        category: (habitData.category || 'General').trim(),
        frequency: frequency,
        daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        timeOfDay: habitData.timeOfDay || TIME_OF_DAY.ANYTIME,
        targetValue: habitData.targetValue !== undefined ? Math.max(1, Number(habitData.targetValue)) : 1,
        unit: habitData.unit || 'times',
        description: (habitData.description || '').trim(),
        isActive: habitData.isActive !== false,
        order: habits.length + 1,
        createdAt: habitData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      habits.push(newHabit);
      storage.set(STORAGE_KEYS.HABITS, habits);
      storage.emit('habits:changed', { action: 'add', habit: newHabit });

      this.syncWithTaskHabitEngine();
      return deepClone(newHabit);
    },

    /**
     * EDIT an existing habit
     */
    editHabit(habitId, updates) {
      if (!habitId) throw new Error('Habit ID is required for editing');
      const habits = storage.get(STORAGE_KEYS.HABITS, []);
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) throw new Error(`Habit with ID "${habitId}" not found`);

      const current = habits[index];
      const updated = {
        ...current,
        ...updates,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (updates.name) updated.name = updates.name.trim();
      if (updates.description !== undefined) updated.description = updates.description.trim();
      if (updates.category) updated.category = updates.category.trim();

      if (updates.frequency) {
        if (updates.frequency === FREQUENCIES.DAILY) {
          updated.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
        } else if (updates.frequency === FREQUENCIES.WEEKDAYS) {
          updated.daysOfWeek = [1, 2, 3, 4, 5];
        } else if (updates.frequency === FREQUENCIES.WEEKENDS) {
          updated.daysOfWeek = [0, 6];
        } else if (updates.frequency === FREQUENCIES.CUSTOM_DAYS && Array.isArray(updates.daysOfWeek)) {
          updated.daysOfWeek = [...new Set(updates.daysOfWeek.map(d => Number(d) % 7))].sort((a, b) => a - b);
        }
      }

      habits[index] = updated;
      storage.set(STORAGE_KEYS.HABITS, habits);
      storage.emit('habits:changed', { action: 'edit', habit: updated });

      this.syncWithTaskHabitEngine();
      return deepClone(updated);
    },

    /**
     * PAUSE or RESUME a habit.
     * Paused habits don't count against daily completion rate and don't break streaks.
     */
    togglePauseHabit(habitId) {
      const habit = this.getHabitById(habitId);
      if (!habit) return false;
      const nextActive = !habit.isActive;
      this.editHabit(habitId, { isActive: nextActive });
      return nextActive;
    },

    /**
     * DELETE a habit
     */
    deleteHabit(habitId) {
      if (!habitId) return false;
      const habits = storage.get(STORAGE_KEYS.HABITS, []);
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) return false;

      habits.splice(index, 1);
      storage.set(STORAGE_KEYS.HABITS, habits);
      storage.emit('habits:changed', { action: 'delete', habitId });

      this.syncWithTaskHabitEngine();
      return true;
    },

    /**
     * Restore original pre-seeded habits
     */
    restorePreSeededDefaults() {
      storage.set(STORAGE_KEYS.HABITS, PRE_SEEDED_HABITS);
      storage.emit('habits:changed', { action: 'resetDefaults' });
      this.syncWithTaskHabitEngine();
      return deepClone(PRE_SEEDED_HABITS);
    },

    /**
     * Get Daily Score: % of active scheduled habits completed on a date (0 - 100%)
     */
    getDailyScore(dateStr = getTodayString()) {
      const activeHabits = this.getHabits(false);
      const scheduled = activeHabits.filter(h => this.isHabitScheduledForDate(h, dateStr));
      if (scheduled.length === 0) return 100; // Rest / unburdened day = 100%

      const logs = this.getLogsForDate(dateStr);
      const completedCount = scheduled.filter(h => logs[h.id] && Boolean(logs[h.id].completed)).length;
      return Math.round((completedCount / scheduled.length) * 100);
    },

    /**
     * Get Weekly 7-Day Mini-Heatmap Data:
     * Returns exactly 7 days ending with today (or a specified anchor date)
     */
    getWeeklyHeatmap(anchorDateStr = getTodayString()) {
      const days = [];
      const today = getTodayString();
      const activeHabits = this.getHabits(false);

      // Past 6 days + anchor day = 7 days total
      for (let i = 6; i >= 0; i--) {
        const curDate = addDaysToString(anchorDateStr, -i);
        const scheduled = activeHabits.filter(h => this.isHabitScheduledForDate(h, curDate));
        const logs = this.getLogsForDate(curDate);
        const completedCount = scheduled.filter(h => logs[h.id] && Boolean(logs[h.id].completed)).length;
        const isFuture = daysDifference(today, curDate) > 0;
        const rate = scheduled.length > 0 ? Math.round((completedCount / scheduled.length) * 100) : 100;

        let level = 'empty';
        if (!isFuture) {
          if (scheduled.length === 0) level = 'rest';
          else if (rate === 100) level = 'perfect';
          else if (rate >= 67) level = 'high';
          else if (rate >= 34) level = 'medium';
          else if (rate > 0) level = 'low';
          else level = 'zero';
        }

        days.push({
          date: curDate,
          dayNumber: parseDateString(curDate).getDate(),
          dayShort: DAY_SHORT[getDayOfWeek(curDate)],
          dayFull: DAY_FULL[getDayOfWeek(curDate)],
          isToday: curDate === today,
          isFuture,
          rate: isFuture ? 0 : rate,
          completedCount,
          scheduledCount: scheduled.length,
          level
        });
      }

      // Calculate weekly average completion rate
      const nonFutureDays = days.filter(d => !d.isFuture);
      const totalScheduled = nonFutureDays.reduce((acc, d) => acc + d.scheduledCount, 0);
      const totalCompleted = nonFutureDays.reduce((acc, d) => acc + d.completedCount, 0);
      const weeklyAverage = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 100;

      return {
        days,
        weeklyAverage,
        totalCompleted,
        totalScheduled
      };
    },

    /**
     * Get frequency pill text representation
     */
    getFrequencyPillText(habit) {
      if (!habit) return 'Daily';
      switch (habit.frequency) {
        case FREQUENCIES.DAILY:
          return 'Daily';
        case FREQUENCIES.WEEKDAYS:
          return 'Mon to Fri';
        case FREQUENCIES.WEEKENDS:
          return 'Sat, Sun';
        case FREQUENCIES.CUSTOM_DAYS: {
          if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return 'Custom';
          if (habit.daysOfWeek.length === 7) return 'Daily';
          if (habit.daysOfWeek.length === 2 && habit.daysOfWeek.includes(0) && habit.daysOfWeek.includes(3)) {
            return 'Wed, Sun';
          }
          return habit.daysOfWeek.map(d => DAY_SHORT[d]).join(', ');
        }
        default:
          return 'Daily';
      }
    },

    /**
     * Synchronize and polyfill window.TaskHabitEngine so Agent 2 or other views never break
     */
    syncWithTaskHabitEngine() {
      if (typeof window === 'undefined' || !window.TaskHabitEngine) return;
      const engine = window.TaskHabitEngine;

      // Provide aliases on engine.habits if not already defined
      if (engine.habits) {
        if (!engine.habits.getHabitsForDate) {
          engine.habits.getHabitsForDate = (dateStr = getTodayString()) => {
            const habits = RecurringHabitsEngine.getHabits(false);
            const scheduled = habits.filter(h => RecurringHabitsEngine.isHabitScheduledForDate(h, dateStr));
            const logs = RecurringHabitsEngine.getLogsForDate(dateStr);

            return scheduled.map(h => {
              const log = logs[h.id];
              const isDone = Boolean(log && log.completed);
              return {
                ...h,
                isCompleted: isDone,
                completed: isDone,
                currentValue: log && log.value !== undefined ? log.value : (isDone ? h.targetValue : 0)
              };
            });
          };
        }

        if (!engine.habits.getHabitProgress) {
          engine.habits.getHabitProgress = (id, dateStr) => RecurringHabitsEngine.getHabitProgress(id, dateStr);
        }

        if (!engine.habits.logCompletion) {
          engine.habits.logCompletion = (id, dateStr, val) => {
            if (val > 0) {
              return RecurringHabitsEngine.logHabitProgress(id, val, dateStr);
            } else {
              return RecurringHabitsEngine.toggleHabitCompletion(id, dateStr);
            }
          };
        }
      }
    }
  };

  // Run compatibility hook on init
  RecurringHabitsEngine.syncWithTaskHabitEngine();

  // ============================================================================
  // 5. CSS STYLING (MINIMALIST LUXURY DESIGN SYSTEM)
  // ============================================================================

  const STYLES = `
    /* ========================================================================
       RECURRING HABITS LUXURY COMPONENT STYLING
       ======================================================================== */
    .habit-engine-root {
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-family: inherit;
      color: var(--text-primary, #f3f4f8);
      margin-bottom: 24px;
    }

    /* Heatmap Box */
    .habit-heatmap-card {
      background: linear-gradient(145deg, rgba(18, 18, 26, 0.95), rgba(24, 24, 36, 0.75));
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      padding: 14px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }

    .habit-heatmap-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .habit-heatmap-title {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .habit-heatmap-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: var(--radius-full, 9999px);
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--mint, #10b981);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .habit-heatmap-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .habit-heat-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px 4px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .habit-heat-col:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(124, 92, 252, 0.3);
      transform: translateY(-2px);
    }

    .habit-heat-col.is-today {
      background: rgba(124, 92, 252, 0.12);
      border-color: rgba(124, 92, 252, 0.4);
    }

    .habit-heat-day {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-secondary, #9494a8);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .habit-heat-col.is-today .habit-heat-day {
      color: var(--accent, #7c5cfc);
      font-weight: 800;
    }

    .habit-heat-box {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      transition: all 0.2s ease;
      position: relative;
    }

    /* Heatmap Color Levels */
    .habit-heat-box.lvl-perfect {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }

    .habit-heat-box.lvl-high {
      background: rgba(16, 185, 129, 0.35);
      border: 1px solid rgba(16, 185, 129, 0.6);
      color: #a7f3d0;
    }

    .habit-heat-box.lvl-medium {
      background: rgba(245, 158, 11, 0.3);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fde68a;
    }

    .habit-heat-box.lvl-low {
      background: rgba(124, 92, 252, 0.25);
      border: 1px solid rgba(124, 92, 252, 0.45);
      color: #ddd6fe;
    }

    .habit-heat-box.lvl-zero {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-muted, #5e5e76);
    }

    .habit-heat-box.lvl-rest {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border-subtle, #1f1f2e);
      color: var(--text-muted, #5e5e76);
    }

    .habit-heat-num {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-secondary, #9494a8);
    }

    /* Action & Filter Toolbar */
    .habit-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }

    .habit-filter-chips {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }
    .habit-filter-chips::-webkit-scrollbar { display: none; }

    .habit-chip {
      padding: 5px 12px;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-secondary, #9494a8);
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .habit-chip:hover {
      background: var(--bg-surface-elevated, #181824);
      color: var(--text-primary, #f3f4f8);
    }

    .habit-chip.active {
      background: var(--accent-dim, rgba(124, 92, 252, 0.16));
      border-color: var(--accent, #7c5cfc);
      color: var(--text-primary, #f3f4f8);
    }

    .btn-add-habit-main {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--accent, #7c5cfc), #6243df);
      border: none;
      color: #ffffff;
      padding: 7px 14px;
      border-radius: var(--radius-md, 14px);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(124, 92, 252, 0.35);
    }

    .btn-add-habit-main:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(124, 92, 252, 0.5);
    }

    /* Habit Cards List */
    .habit-cards-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .habit-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .habit-card:hover {
      background: var(--bg-surface-elevated, #181824);
      border-color: rgba(124, 92, 252, 0.3);
      transform: translateY(-1px);
    }

    .habit-card.done {
      border-color: rgba(16, 185, 129, 0.3);
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.05), var(--bg-surface, #12121a));
    }

    .habit-card.paused {
      opacity: 0.55;
      filter: grayscale(0.5);
      border-style: dashed;
    }

    /* Check-off Circle */
    .habit-check-button {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      border: 2px solid var(--border-focus, #2f2f48);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: transparent;
      font-size: 1rem;
      font-weight: 900;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      outline: none;
    }

    .habit-check-button:hover {
      border-color: var(--accent, #7c5cfc);
      background: rgba(124, 92, 252, 0.1);
      transform: scale(1.08);
    }

    .habit-card.done .habit-check-button {
      background: linear-gradient(135deg, var(--mint, #10b981), #059669);
      border-color: var(--mint, #10b981);
      color: #ffffff;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.45);
      transform: scale(1.04);
    }

    /* Icon Avatar */
    .habit-icon-avatar {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle, #1f1f2e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }

    /* Content Area */
    .habit-card-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .habit-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .habit-name {
      font-size: 0.94rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-primary, #f3f4f8);
      transition: all 0.15s ease;
    }

    .habit-card.done .habit-name {
      color: var(--text-secondary, #9494a8);
      text-decoration: line-through;
      text-decoration-color: rgba(16, 185, 129, 0.6);
    }

    .habit-desc {
      font-size: 0.74rem;
      color: var(--text-secondary, #9494a8);
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Pills Row */
    .habit-pills-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .habit-pill {
      font-size: 0.66rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full, 9999px);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      letter-spacing: 0.02em;
    }

    .habit-pill.frequency {
      background: rgba(124, 92, 252, 0.12);
      border: 1px solid rgba(124, 92, 252, 0.28);
      color: #c4b5fd;
    }

    .habit-pill.time {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.28);
      color: #fde68a;
    }

    .habit-pill.category {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-secondary, #9494a8);
    }

    .habit-pill.paused-badge {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
    }

    .habit-pill.due-today {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.35);
      color: #67e8f9;
    }

    .habit-pill.not-today {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-muted, #5e5e76);
    }

    /* Numerical Habits Progress Strip */
    .habit-progress-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .habit-progress-bar-bg {
      flex: 1;
      height: 6px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .habit-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #10b981);
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    .habit-progress-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-secondary, #9494a8);
    }

    .habit-stepper-btn {
      padding: 2px 7px;
      font-size: 0.65rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: 6px;
      color: var(--text-primary, #f3f4f8);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .habit-stepper-btn:hover {
      background: var(--accent-dim, rgba(124, 92, 252, 0.2));
      border-color: var(--accent, #7c5cfc);
    }

    /* Right Action Area: Streak Flame & Menu */
    .habit-card-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      min-width: 72px;
    }

    .habit-streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 9px;
      border-radius: var(--radius-full, 9999px);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.12));
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
      font-size: 0.74rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
    }

    .habit-streak-badge.zero {
      background: rgba(255, 255, 255, 0.03);
      border-color: var(--border-subtle, #1f1f2e);
      color: var(--text-muted, #5e5e76);
      box-shadow: none;
    }

    /* Card Context Menu */
    .habit-quick-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .btn-habit-action {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: 6px;
      color: var(--text-secondary, #9494a8);
      padding: 3px 7px;
      font-size: 0.68rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-habit-action:hover {
      background: var(--bg-surface-elevated, #181824);
      color: var(--text-primary, #f3f4f8);
      border-color: var(--border-focus, #2f2f48);
    }

    .btn-habit-action.danger:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    /* Modal Backdrop & Dialog */
    .habit-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .habit-modal-backdrop.open {
      opacity: 1;
      visibility: visible;
    }

    .habit-modal-card {
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      background: #14141e;
      border: 1px solid rgba(124, 92, 252, 0.28);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      gap: 16px;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .habit-modal-backdrop.open .habit-modal-card {
      transform: scale(1) translateY(0);
    }

    .habit-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle, #1f1f2e);
      padding-bottom: 12px;
    }

    .habit-modal-title {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .habit-modal-close {
      background: transparent;
      border: none;
      color: var(--text-secondary, #9494a8);
      font-size: 1.3rem;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .habit-modal-close:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .habit-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .habit-form-label {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--text-secondary, #9494a8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .habit-form-input {
      width: 100%;
      background: #0d0d14;
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.88rem;
      color: var(--text-primary, #f3f4f8);
      outline: none;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .habit-form-input:focus {
      border-color: var(--accent, #7c5cfc);
      box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.2);
    }

    /* Emoji Picker Grid */
    .habit-emoji-picker {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .habit-emoji-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
      max-height: 110px;
      overflow-y: auto;
      padding: 4px;
      background: #0d0d14;
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: 10px;
    }

    .habit-emoji-item {
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      background: transparent;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }

    .habit-emoji-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: scale(1.15);
    }

    .habit-emoji-item.selected {
      background: rgba(124, 92, 252, 0.25);
      border-color: var(--accent, #7c5cfc);
    }

    /* Segmented Controls */
    .habit-segmented {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(65px, 1fr));
      gap: 6px;
    }

    .habit-seg-btn {
      padding: 8px 6px;
      border-radius: 8px;
      background: #0d0d14;
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-secondary, #9494a8);
      font-size: 0.74rem;
      font-weight: 700;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .habit-seg-btn:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary, #f3f4f8);
    }

    .habit-seg-btn.active {
      background: rgba(124, 92, 252, 0.22);
      border-color: var(--accent, #7c5cfc);
      color: var(--text-primary, #f3f4f8);
    }

    /* Day Checkboxes (7 days) */
    .habit-day-chips {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-top: 4px;
    }

    .habit-day-chip {
      height: 36px;
      border-radius: 8px;
      background: #0d0d14;
      border: 1px solid var(--border-subtle, #1f1f2e);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--text-secondary, #9494a8);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .habit-day-chip:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .habit-day-chip.active {
      background: linear-gradient(135deg, var(--accent, #7c5cfc), #6243df);
      border-color: var(--accent, #7c5cfc);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(124, 92, 252, 0.4);
    }

    .habit-modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid var(--border-subtle, #1f1f2e);
      padding-top: 14px;
      margin-top: 6px;
    }

    .btn-modal-cancel {
      padding: 9px 16px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-secondary, #9494a8);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-modal-cancel:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
    }

    .btn-modal-save {
      padding: 9px 20px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent, #7c5cfc), #6243df);
      border: none;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(124, 92, 252, 0.35);
    }

    .btn-modal-save:hover {
      box-shadow: 0 4px 18px rgba(124, 92, 252, 0.55);
    }

    .habit-empty-notice {
      text-align: center;
      padding: 24px 12px;
      color: var(--text-muted, #5e5e76);
      font-size: 0.85rem;
      border: 1px dashed var(--border-subtle, #1f1f2e);
      border-radius: 14px;
    }
  `;

  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('habit-engine-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'habit-engine-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  // ============================================================================
  // 6. HABITS UI COMPONENT CLASS
  // ============================================================================

  class HabitsUIComponent {
    constructor(container = null) {
      this.container = container;
      this.activeFilter = 'all'; // 'all' | 'today' | 'morning' | 'night' | 'paused'
      this.selectedDateStr = getTodayString();
      this.editingHabitId = null;
      this.unsub = null;

      injectStyles();
    }

    mount(targetElementOrSelector) {
      if (typeof targetElementOrSelector === 'string') {
        this.container = document.querySelector(targetElementOrSelector);
      } else {
        this.container = targetElementOrSelector;
      }

      if (!this.container) {
        console.warn('[HabitsUI] Container element not found for mounting');
        return false;
      }

      this.init();
      return true;
    }

    init() {
      injectStyles();
      this.ensureModalContainers();
      this.render();

      // Subscribe to changes in habits or logs
      if (this.unsub) this.unsub();
      this.unsub = storage.subscribe('*', () => {
        this.render();
      });
    }

    ensureModalContainers() {
      if (typeof document === 'undefined') return;
      if (!document.getElementById('habitFormModalBackdrop')) {
        const modalWrap = document.createElement('div');
        modalWrap.id = 'habitFormModalBackdrop';
        modalWrap.className = 'habit-modal-backdrop';
        modalWrap.innerHTML = `
          <div class="habit-modal-card" role="dialog" aria-modal="true">
            <div class="habit-modal-header">
              <div class="habit-modal-title" id="habitModalHeading">Create New Habit</div>
              <button type="button" class="habit-modal-close" id="btnHabitModalClose">✕</button>
            </div>
            <form id="habitModalForm" onsubmit="return false;" style="display:flex; flex-direction:column; gap:14px;">
              <input type="hidden" id="habitFormId">

              <!-- Name & Icon -->
              <div class="habit-form-group">
                <label class="habit-form-label">Habit Name *</label>
                <div style="display:flex; gap:8px;">
                  <div id="habitFormIconPreview" style="font-size:1.6rem; width:44px; height:44px; min-width:44px; display:flex; align-items:center; justify-content:center; background:#0d0d14; border:1px solid var(--border-subtle, #1f1f2e); border-radius:10px; cursor:pointer;" title="Pick icon">🎯</div>
                  <input type="text" id="habitFormName" class="habit-form-input" placeholder="e.g. Read 20 Pages, Cold Shower" required>
                </div>
              </div>

              <!-- Emoji Grid Picker -->
              <div class="habit-form-group" id="habitEmojiPickerContainer" style="display:none;">
                <label class="habit-form-label">Pick Emoji Icon</label>
                <div class="habit-emoji-grid" id="habitEmojiGrid"></div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                  <input type="text" id="habitFormCustomEmoji" class="habit-form-input" style="padding:6px 10px; font-size:0.8rem;" placeholder="Or type any custom emoji (e.g. 🧗)">
                </div>
              </div>

              <!-- Category -->
              <div class="habit-form-group">
                <label class="habit-form-label">Category</label>
                <input type="text" id="habitFormCategory" class="habit-form-input" list="habitCategoriesDatalist" placeholder="e.g. Grooming, Nutrition, Hydration">
                <datalist id="habitCategoriesDatalist">
                  ${DEFAULT_CATEGORIES.map(c => `<option value="${c}"></option>`).join('')}
                </datalist>
              </div>

              <!-- Frequency -->
              <div class="habit-form-group">
                <label class="habit-form-label">Frequency</label>
                <div class="habit-segmented" id="habitFormFreqSegmented">
                  <button type="button" class="habit-seg-btn active" data-val="daily">Daily</button>
                  <button type="button" class="habit-seg-btn" data-val="custom_days">Custom Days</button>
                  <button type="button" class="habit-seg-btn" data-val="weekdays">Weekdays</button>
                  <button type="button" class="habit-seg-btn" data-val="weekends">Weekends</button>
                </div>
                <div id="habitCustomDaysWrap" style="display:none;">
                  <div style="font-size:0.7rem; color:var(--text-secondary); margin: 6px 0 2px 0;">Select active days:</div>
                  <div class="habit-day-chips" id="habitCustomDaysChips">
                    ${DAY_SHORT.map((d, idx) => `<div class="habit-day-chip" data-day="${idx}">${d}</div>`).join('')}
                  </div>
                </div>
              </div>

              <!-- Time of Day -->
              <div class="habit-form-group">
                <label class="habit-form-label">Time of Day</label>
                <div class="habit-segmented" id="habitFormTimeSegmented">
                  <button type="button" class="habit-seg-btn" data-val="morning">🌅 Morning</button>
                  <button type="button" class="habit-seg-btn" data-val="afternoon">☀️ Afternoon</button>
                  <button type="button" class="habit-seg-btn" data-val="evening">🌆 Evening</button>
                  <button type="button" class="habit-seg-btn" data-val="night">🌙 Night</button>
                  <button type="button" class="habit-seg-btn active" data-val="anytime">⚡ Anytime</button>
                </div>
              </div>

              <!-- Target Value & Unit -->
              <div class="habit-form-group">
                <label class="habit-form-label">Target (Optional)</label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                  <input type="number" id="habitFormTargetVal" class="habit-form-input" min="1" step="0.5" value="1" placeholder="Target count">
                  <input type="text" id="habitFormTargetUnit" class="habit-form-input" value="times" placeholder="Unit (Liters, times)">
                </div>
              </div>

              <!-- Description -->
              <div class="habit-form-group">
                <label class="habit-form-label">Notes / Spartan Cue</label>
                <input type="text" id="habitFormDesc" class="habit-form-input" placeholder="e.g. No screens after oiling, sleep deeply">
              </div>

              <!-- Modal Footer -->
              <div class="habit-modal-footer">
                <button type="button" class="btn-modal-cancel" id="btnHabitModalCancel">Cancel</button>
                <button type="button" class="btn-modal-save" id="btnHabitModalSave">Save Habit</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modalWrap);
        this.bindModalEvents();
      }
    }

    bindModalEvents() {
      const backdrop = document.getElementById('habitFormModalBackdrop');
      if (!backdrop) return;

      const btnClose = document.getElementById('btnHabitModalClose');
      const btnCancel = document.getElementById('btnHabitModalCancel');
      const btnSave = document.getElementById('btnHabitModalSave');
      const iconPreview = document.getElementById('habitFormIconPreview');
      const emojiPicker = document.getElementById('habitEmojiPickerContainer');
      const customEmojiInput = document.getElementById('habitFormCustomEmoji');
      const emojiGrid = document.getElementById('habitEmojiGrid');
      const freqSegmented = document.getElementById('habitFormFreqSegmented');
      const customDaysWrap = document.getElementById('habitCustomDaysWrap');
      const customDaysChips = document.getElementById('habitCustomDaysChips');
      const timeSegmented = document.getElementById('habitFormTimeSegmented');

      // Populate emoji grid
      if (emojiGrid && emojiGrid.children.length === 0) {
        emojiGrid.innerHTML = POPULAR_ICONS.map(ic => `
          <button type="button" class="habit-emoji-item" data-emoji="${ic}">${ic}</button>
        `).join('');

        emojiGrid.querySelectorAll('.habit-emoji-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const em = btn.getAttribute('data-emoji');
            iconPreview.textContent = em;
            emojiGrid.querySelectorAll('.habit-emoji-item').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          });
        });
      }

      iconPreview?.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'flex' : 'none';
      });

      customEmojiInput?.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) iconPreview.textContent = val;
      });

      // Frequency segmented selector
      freqSegmented?.querySelectorAll('.habit-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          freqSegmented.querySelectorAll('.habit-seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const val = btn.getAttribute('data-val');
          if (customDaysWrap) {
            customDaysWrap.style.display = val === 'custom_days' ? 'block' : 'none';
          }
        });
      });

      // Custom day chips toggle
      customDaysChips?.querySelectorAll('.habit-day-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
        });
      });

      // Time segmented selector
      timeSegmented?.querySelectorAll('.habit-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          timeSegmented.querySelectorAll('.habit-seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      const closeModal = () => {
        backdrop.classList.remove('open');
        this.editingHabitId = null;
      };

      btnClose?.addEventListener('click', closeModal);
      btnCancel?.addEventListener('click', closeModal);

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });

      btnSave?.addEventListener('click', () => this.saveModalForm());
    }

    openAddModal() {
      this.ensureModalContainers();
      const backdrop = document.getElementById('habitFormModalBackdrop');
      if (!backdrop) return;

      document.getElementById('habitModalHeading').textContent = 'Create New Habit';
      document.getElementById('habitFormId').value = '';
      document.getElementById('habitFormName').value = '';
      document.getElementById('habitFormIconPreview').textContent = '🎯';
      document.getElementById('habitFormCategory').value = 'General';
      document.getElementById('habitFormTargetVal').value = '1';
      document.getElementById('habitFormTargetUnit').value = 'times';
      document.getElementById('habitFormDesc').value = '';

      // Reset frequency to daily
      const freqBtns = document.querySelectorAll('#habitFormFreqSegmented .habit-seg-btn');
      freqBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-val') === 'daily'));
      document.getElementById('habitCustomDaysWrap').style.display = 'none';

      // Reset day chips (Wed & Sun active by default if custom)
      const dayChips = document.querySelectorAll('#habitCustomDaysChips .habit-day-chip');
      dayChips.forEach(c => {
        const d = Number(c.getAttribute('data-day'));
        c.classList.toggle('active', d === 0 || d === 3);
      });

      // Reset time to anytime
      const timeBtns = document.querySelectorAll('#habitFormTimeSegmented .habit-seg-btn');
      timeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-val') === 'anytime'));

      document.getElementById('habitEmojiPickerContainer').style.display = 'none';
      backdrop.classList.add('open');
      document.getElementById('habitFormName').focus();
    }

    openEditModal(habitId) {
      const habit = RecurringHabitsEngine.getHabitById(habitId);
      if (!habit) return;

      this.ensureModalContainers();
      const backdrop = document.getElementById('habitFormModalBackdrop');
      if (!backdrop) return;

      this.editingHabitId = habitId;
      document.getElementById('habitModalHeading').textContent = 'Edit Habit';
      document.getElementById('habitFormId').value = habit.id;
      document.getElementById('habitFormName').value = habit.name || '';
      document.getElementById('habitFormIconPreview').textContent = habit.icon || '🎯';
      document.getElementById('habitFormCategory').value = habit.category || 'General';
      document.getElementById('habitFormTargetVal').value = habit.targetValue || 1;
      document.getElementById('habitFormTargetUnit').value = habit.unit || 'times';
      document.getElementById('habitFormDesc').value = habit.description || '';

      // Set frequency
      const freq = habit.frequency || FREQUENCIES.DAILY;
      const freqBtns = document.querySelectorAll('#habitFormFreqSegmented .habit-seg-btn');
      freqBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-val') === freq));
      document.getElementById('habitCustomDaysWrap').style.display = freq === 'custom_days' ? 'block' : 'none';

      // Set custom day chips
      const activeDays = new Set(habit.daysOfWeek || []);
      const dayChips = document.querySelectorAll('#habitCustomDaysChips .habit-day-chip');
      dayChips.forEach(c => {
        const d = Number(c.getAttribute('data-day'));
        c.classList.toggle('active', activeDays.has(d));
      });

      // Set time
      const time = habit.timeOfDay || TIME_OF_DAY.ANYTIME;
      const timeBtns = document.querySelectorAll('#habitFormTimeSegmented .habit-seg-btn');
      timeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-val') === time));

      document.getElementById('habitEmojiPickerContainer').style.display = 'none';
      backdrop.classList.add('open');
      document.getElementById('habitFormName').focus();
    }

    saveModalForm() {
      const id = document.getElementById('habitFormId').value;
      const name = document.getElementById('habitFormName').value.trim();
      if (!name) {
        alert('Please enter a habit name.');
        return;
      }

      const icon = document.getElementById('habitFormIconPreview').textContent || '🎯';
      const category = document.getElementById('habitFormCategory').value.trim() || 'General';
      const targetValue = Math.max(1, parseFloat(document.getElementById('habitFormTargetVal').value) || 1);
      const unit = document.getElementById('habitFormTargetUnit').value.trim() || 'times';
      const description = document.getElementById('habitFormDesc').value.trim();

      const activeFreqBtn = document.querySelector('#habitFormFreqSegmented .habit-seg-btn.active');
      const frequency = activeFreqBtn ? activeFreqBtn.getAttribute('data-val') : FREQUENCIES.DAILY;

      let daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      if (frequency === FREQUENCIES.CUSTOM_DAYS) {
        const selected = [];
        document.querySelectorAll('#habitCustomDaysChips .habit-day-chip.active').forEach(c => {
          selected.push(Number(c.getAttribute('data-day')));
        });
        if (selected.length === 0) {
          alert('Please select at least one day of the week for custom frequency.');
          return;
        }
        daysOfWeek = selected;
      } else if (frequency === FREQUENCIES.WEEKDAYS) {
        daysOfWeek = [1, 2, 3, 4, 5];
      } else if (frequency === FREQUENCIES.WEEKENDS) {
        daysOfWeek = [0, 6];
      }

      const activeTimeBtn = document.querySelector('#habitFormTimeSegmented .habit-seg-btn.active');
      const timeOfDay = activeTimeBtn ? activeTimeBtn.getAttribute('data-val') : TIME_OF_DAY.ANYTIME;

      const payload = {
        name,
        icon,
        category,
        frequency,
        daysOfWeek,
        timeOfDay,
        targetValue,
        unit,
        description
      };

      if (id) {
        RecurringHabitsEngine.editHabit(id, payload);
      } else {
        RecurringHabitsEngine.addHabit(payload);
      }

      document.getElementById('habitFormModalBackdrop').classList.remove('open');
      this.render();
      this.notifyMasterApp();
    }

    confirmDelete(habitId) {
      const habit = RecurringHabitsEngine.getHabitById(habitId);
      if (!habit) return;
      if (confirm(`Delete habit "${habit.name}"? This action cannot be undone.`)) {
        RecurringHabitsEngine.deleteHabit(habitId);
        this.render();
        this.notifyMasterApp();
      }
    }

    togglePause(habitId) {
      const isNowActive = RecurringHabitsEngine.togglePauseHabit(habitId);
      this.render();
      this.notifyMasterApp();
    }

    toggleHabit(habitId) {
      RecurringHabitsEngine.toggleHabitCompletion(habitId, this.selectedDateStr);
      this.render();
      this.notifyMasterApp();
    }

    adjustNumerical(habitId, delta) {
      const current = RecurringHabitsEngine.getHabitProgress(habitId, this.selectedDateStr);
      const nextVal = Math.max(0, current + delta);
      RecurringHabitsEngine.logHabitProgress(habitId, nextVal, this.selectedDateStr);
      this.render();
      this.notifyMasterApp();
    }

    notifyMasterApp() {
      // Sync MeApp master score pill and calculations if present in window
      if (typeof window !== 'undefined' && window.MeApp) {
        if (typeof window.MeApp.calculateMasterScore === 'function') {
          window.MeApp.calculateMasterScore();
        }
      }
      this.updateScorePill();
    }

    updateScorePill() {
      const pill = document.getElementById('habitsScorePill');
      if (!pill) return;
      const today = getTodayString();
      const habits = RecurringHabitsEngine.getHabits(false);
      const scheduled = habits.filter(h => RecurringHabitsEngine.isHabitScheduledForDate(h, today));
      const done = scheduled.filter(h => RecurringHabitsEngine.isHabitCompletedOnDate(h.id, today)).length;
      pill.textContent = `${done}/${scheduled.length} Done`;
    }

    render() {
      if (!this.container) {
        this.container = document.getElementById('habitsContainerList');
        if (!this.container) return;
      }

      const today = getTodayString();
      const allHabits = RecurringHabitsEngine.getHabits(true);
      const heatmap = RecurringHabitsEngine.getWeeklyHeatmap(today);

      // Filter habits based on current activeFilter
      let displayedHabits = allHabits;
      if (this.activeFilter === 'today') {
        displayedHabits = allHabits.filter(h => h.isActive && RecurringHabitsEngine.isHabitScheduledForDate(h, today));
      } else if (this.activeFilter === 'morning') {
        displayedHabits = allHabits.filter(h => h.isActive && h.timeOfDay === 'morning');
      } else if (this.activeFilter === 'night') {
        displayedHabits = allHabits.filter(h => h.isActive && h.timeOfDay === 'night');
      } else if (this.activeFilter === 'paused') {
        displayedHabits = allHabits.filter(h => !h.isActive);
      }

      // Count metrics
      const scheduledToday = allHabits.filter(h => h.isActive && RecurringHabitsEngine.isHabitScheduledForDate(h, today));
      const completedToday = scheduledToday.filter(h => RecurringHabitsEngine.isHabitCompletedOnDate(h.id, today)).length;

      // Build HTML
      this.container.innerHTML = `
        <div class="habit-engine-root">

          <!-- 1. WEEKLY 7-DAY MINI HEATMAP ROW -->
          <div class="habit-heatmap-card">
            <div class="habit-heatmap-header">
              <div class="habit-heatmap-title">
                <span>📊 Weekly Consistency</span>
                <span style="font-size:0.75rem; color:var(--text-secondary); font-weight:normal;">(7-Day Progress)</span>
              </div>
              <div class="habit-heatmap-badge">
                🔥 ${heatmap.weeklyAverage}% Consistency
              </div>
            </div>

            <div class="habit-heatmap-row">
              ${heatmap.days.map(d => {
                let boxContent = `${d.rate}%`;
                if (d.isFuture) boxContent = '—';
                else if (d.scheduledCount === 0) boxContent = 'Rest';

                return `
                  <div class="habit-heat-col ${d.isToday ? 'is-today' : ''}" data-date="${d.date}" title="${d.dayFull} (${d.date}): ${d.completedCount}/${d.scheduledCount} completed (${d.rate}%)">
                    <span class="habit-heat-day">${d.dayShort}</span>
                    <div class="habit-heat-box lvl-${d.level}">
                      ${d.level === 'perfect' ? '✓' : boxContent}
                    </div>
                    <span class="habit-heat-num">${d.dayNumber}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 2. TOOLBAR & FILTER CHIPS -->
          <div class="habit-toolbar">
            <div class="habit-filter-chips">
              <button type="button" class="habit-chip ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${allHabits.length})</button>
              <button type="button" class="habit-chip ${this.activeFilter === 'today' ? 'active' : ''}" data-filter="today">Due Today (${scheduledToday.length})</button>
              <button type="button" class="habit-chip ${this.activeFilter === 'morning' ? 'active' : ''}" data-filter="morning">🌅 Morning</button>
              <button type="button" class="habit-chip ${this.activeFilter === 'night' ? 'active' : ''}" data-filter="night">🌙 Night</button>
              <button type="button" class="habit-chip ${this.activeFilter === 'paused' ? 'active' : ''}" data-filter="paused">⏸ Paused (${allHabits.filter(h => !h.isActive).length})</button>
            </div>

            <button type="button" class="btn-add-habit-main" id="btnOpenAddHabit">
              <span>+</span>
              <span>New Habit</span>
            </button>
          </div>

          <!-- 3. HABIT CARDS LIST -->
          <div class="habit-cards-list">
            ${displayedHabits.length === 0 ? `
              <div class="habit-empty-notice">
                No habits found in this view. Click "+ New Habit" to create one!
              </div>
            ` : displayedHabits.map(habit => {
              const isScheduledToday = RecurringHabitsEngine.isHabitScheduledForDate(habit, today);
              const isDone = RecurringHabitsEngine.isHabitCompletedOnDate(habit.id, this.selectedDateStr);
              const currentProgress = RecurringHabitsEngine.getHabitProgress(habit.id, this.selectedDateStr);
              const streak = RecurringHabitsEngine.getHabitStreak(habit.id, today);
              const freqText = RecurringHabitsEngine.getFrequencyPillText(habit);
              const isQuantitative = habit.targetValue && habit.targetValue > 1;
              const progressPct = isQuantitative ? Math.min(100, Math.round((currentProgress / habit.targetValue) * 100)) : (isDone ? 100 : 0);

              return `
                <div class="habit-card ${isDone ? 'done' : ''} ${!habit.isActive ? 'paused' : ''}" data-id="${habit.id}">

                  <!-- Check Button -->
                  <button type="button" class="habit-check-button" data-action="toggle" data-id="${habit.id}" aria-label="Toggle ${escapeHtml(habit.name)}">
                    ${isDone ? '✓' : ''}
                  </button>

                  <!-- Icon Avatar -->
                  <div class="habit-icon-avatar">${habit.icon || '✨'}</div>

                  <!-- Body -->
                  <div class="habit-card-body">
                    <div class="habit-title-row">
                      <span class="habit-name">${escapeHtml(habit.name)}</span>
                    </div>

                    ${habit.description ? `<div class="habit-desc">${escapeHtml(habit.description)}</div>` : ''}

                    <!-- Pills Row -->
                    <div class="habit-pills-row">
                      <span class="habit-pill frequency">📅 ${freqText}</span>
                      <span class="habit-pill time">${habit.timeOfDay === 'morning' ? '🌅 Morning' : habit.timeOfDay === 'night' ? '🌙 Night' : habit.timeOfDay === 'afternoon' ? '☀️ Afternoon' : habit.timeOfDay === 'evening' ? '🌆 Evening' : '⚡ Anytime'}</span>
                      <span class="habit-pill category">${escapeHtml(habit.category || 'General')}</span>

                      ${!habit.isActive ? '<span class="habit-pill paused-badge">⏸ Paused</span>' : ''}
                      ${habit.isActive && isScheduledToday ? '<span class="habit-pill due-today">Due Today</span>' : ''}
                      ${habit.isActive && !isScheduledToday ? '<span class="habit-pill not-today">Non-scheduled today</span>' : ''}
                    </div>

                    <!-- Numerical Progress Strip for Quantifiable Habits (e.g. 3L Water) -->
                    ${isQuantitative ? `
                      <div class="habit-progress-strip">
                        <div class="habit-progress-bar-bg">
                          <div class="habit-progress-bar-fill" style="width: ${progressPct}%;"></div>
                        </div>
                        <span class="habit-progress-label">${currentProgress} / ${habit.targetValue} ${escapeHtml(habit.unit || '')}</span>
                        <button type="button" class="habit-stepper-btn" data-action="step" data-id="${habit.id}" data-delta="0.5">+0.5</button>
                        <button type="button" class="habit-stepper-btn" data-action="step" data-id="${habit.id}" data-delta="1.0">+1.0</button>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Right Side: Flame Streak & Quick Actions -->
                  <div class="habit-card-right">
                    <div class="habit-streak-badge ${streak.currentStreak === 0 ? 'zero' : ''}" title="Current Streak: ${streak.currentStreak} days (Best: ${streak.longestStreak} days). Non-scheduled days do not break streak!">
                      🔥 ${streak.currentStreak} ${streak.currentStreak === 1 ? 'day' : 'days'}
                    </div>

                    <div class="habit-quick-actions">
                      <button type="button" class="btn-habit-action" data-action="edit" data-id="${habit.id}" title="Edit habit">✏️ Edit</button>
                      <button type="button" class="btn-habit-action" data-action="pause" data-id="${habit.id}" title="${habit.isActive ? 'Pause habit' : 'Resume habit'}">
                        ${habit.isActive ? '⏸ Pause' : '▶ Resume'}
                      </button>
                      <button type="button" class="btn-habit-action danger" data-action="delete" data-id="${habit.id}" title="Delete habit">🗑️</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      this.bindCardEvents();
      this.updateScorePill();
    }

    bindCardEvents() {
      if (!this.container) return;

      // Add Button
      const btnAdd = this.container.querySelector('#btnOpenAddHabit');
      btnAdd?.addEventListener('click', () => this.openAddModal());

      // Filter Chips
      this.container.querySelectorAll('.habit-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.activeFilter = chip.getAttribute('data-filter');
          this.render();
        });
      });

      // Day column clicks in heatmap
      this.container.querySelectorAll('.habit-heat-col').forEach(col => {
        col.addEventListener('click', () => {
          const dateStr = col.getAttribute('data-date');
          this.selectedDateStr = dateStr;
          this.render();
        });
      });

      // Card actions (toggle, step, edit, pause, delete)
      this.container.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = el.getAttribute('data-action');
          const id = el.getAttribute('data-id');

          if (action === 'toggle') {
            this.toggleHabit(id);
          } else if (action === 'step') {
            const delta = parseFloat(el.getAttribute('data-delta')) || 1.0;
            this.adjustNumerical(id, delta);
          } else if (action === 'edit') {
            this.openEditModal(id);
          } else if (action === 'pause') {
            this.togglePause(id);
          } else if (action === 'delete') {
            this.confirmDelete(id);
          }
        });
      });
    }
  }

  // ============================================================================
  // 7. SINGLETON INSTANCE & GLOBAL EXPORT
  // ============================================================================

  const defaultInstance = new HabitsUIComponent();

  // Auto-mount if document is ready or on DOMContentLoaded
  if (typeof document !== 'undefined') {
    const launch = () => {
      injectStyles();
      const container = document.getElementById('habitsContainerList');
      if (container) {
        defaultInstance.mount(container);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', launch);
    } else {
      launch();
    }
  }

  // Hook into MeAppGlue if present so inline HTML onclick calls function properly
  if (typeof window !== 'undefined') {
    if (!window.MeAppGlue) window.MeAppGlue = {};
    window.MeAppGlue.toggleHabit = function (id) {
      defaultInstance.toggleHabit(id);
    };
  }

  return {
    HabitsUI: defaultInstance,
    HabitsUIComponent,
    RecurringHabitsEngine,
    PRE_SEEDED_HABITS,
    FREQUENCIES,
    TIME_OF_DAY
  };
});
