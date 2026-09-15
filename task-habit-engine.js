/**
 * ==============================================================================
 * ME PWA — TASKS, CHORES & HABIT ENGINE
 * Agent 2: Tasks, Chores & Habit Engine Lead
 * ==============================================================================
 * Complete modular JavaScript engine providing:
 * 1. Flexible To-Do List (Daily chore, Test/Exam, Meeting, Urgent)
 * 2. Customizable Recurring Tasks (Dynamic Habit Engine: Add, Edit, Remove, Streak calculation)
 * 3. 'Somebody Told Me' Quick Capture Scratchpad (Instant capture, Reminders, Convert to Task)
 * 4. Resilient LocalStorage Persistence & PubSub Event System
 *
 * Self-contained, zero-dependency, works in browser, PWA, Service Worker, and Node.
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const engine = factory();
    root.TaskHabitEngine = engine;
    root.LifeTasksEngine = engine; // convenient alias
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ============================================================================
  // 1. CONSTANTS & SCHEMAS
  // ============================================================================

  const STORAGE_KEYS = {
    TODOS: 'me_tasks_todos',
    HABITS: 'me_tasks_habits',
    HABIT_LOGS: 'me_tasks_habit_logs',
    SCRATCHPAD: 'me_tasks_scratchpad',
    SETTINGS: 'me_tasks_settings',
    META: 'me_tasks_meta'
  };

  const TASK_CATEGORIES = {
    DAILY_CHORE: 'Daily chore',
    TEST_EXAM: 'Test/Exam',
    MEETING: 'Meeting',
    URGENT: 'Urgent'
  };

  const TASK_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  };

  const HABIT_FREQUENCIES = {
    DAILY: 'daily',
    CUSTOM_DAYS: 'custom_days',
    INTERVAL: 'interval',
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

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Default pre-seeded habits specified by user requirements
  const DEFAULT_HABITS = [
    {
      id: 'habit_oil_hair',
      name: 'Oil Hair',
      description: 'Oil hair with coconut/almond oil before sleep (Custom: Wed & Sun)',
      icon: '🧴',
      category: 'Grooming',
      frequency: HABIT_FREQUENCIES.CUSTOM_DAYS,
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
      frequency: HABIT_FREQUENCIES.DAILY,
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
      description: 'Stay hydrated throughout the day with regular water intake',
      icon: '💧',
      category: 'Hydration',
      frequency: HABIT_FREQUENCIES.DAILY,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeOfDay: TIME_OF_DAY.ANYTIME,
      targetValue: 3,
      unit: 'Liters',
      isActive: true,
      order: 3,
      createdAt: '2026-09-01T00:00:00.000Z'
    }
  ];

  // Pre-seeded starter examples for To-Do and Scratchpad (first-time experience)
  const SEED_TODOS = [
    {
      id: 'seed_task_1',
      title: 'Submit Operating Systems Lab 2 Code',
      category: TASK_CATEGORIES.URGENT,
      description: 'Push Git commit and upload zip to university portal before midnight.',
      completed: false,
      priority: TASK_PRIORITIES.URGENT,
      dueDate: getTodayString(),
      dueTime: '23:59',
      tags: ['academic', 'urgent'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed_task_2',
      title: 'Data Structures & Algorithms Mid-Term Exam',
      category: TASK_CATEGORIES.TEST_EXAM,
      description: 'Syllabus: Trees, Graphs, Dynamic Programming. Venue: Hall B204.',
      completed: false,
      priority: TASK_PRIORITIES.HIGH,
      dueDate: addDaysToString(getTodayString(), 3),
      dueTime: '10:00',
      tags: ['exam', 'prep'],
      locationOrLink: 'Hall B204',
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed_task_3',
      title: 'Project Group Sync with Prof. Verma',
      category: TASK_CATEGORIES.MEETING,
      description: 'Review architecture diagram and PWA offline storage strategy.',
      completed: false,
      priority: TASK_PRIORITIES.MEDIUM,
      dueDate: addDaysToString(getTodayString(), 1),
      dueTime: '15:30',
      tags: ['meeting', 'project'],
      locationOrLink: 'Cabin 302 / GMeet',
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed_task_4',
      title: 'Laundry & Room Cleaning',
      category: TASK_CATEGORIES.DAILY_CHORE,
      description: 'Wash hostel bedsheets and refill water jars.',
      completed: false,
      priority: TASK_PRIORITIES.LOW,
      dueDate: getTodayString(),
      tags: ['chore', 'hostel'],
      createdAt: new Date().toISOString()
    }
  ];

  const SEED_SCRATCHPAD = [
    {
      id: 'seed_note_1',
      person: 'Rahul (Batchmate)',
      context: 'After Physics lecture outside Audi 3',
      text: 'Return the electrodynamics reference book to library counter before Friday so fine is waived.',
      reminderTag: 'Return book by Friday',
      reminderDate: addDaysToString(getTodayString(), 2),
      isResolved: false,
      priority: 'high',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'seed_note_2',
      person: 'Hostel Caretaker',
      context: 'Ground floor notice board',
      text: 'Maintenance water shutdown between 2 PM to 5 PM tomorrow. Store drinking water in advance.',
      reminderTag: 'Store water before 2 PM',
      reminderDate: addDaysToString(getTodayString(), 1),
      isResolved: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function getDayOfWeekFromDateString(dateStr) {
    const d = parseDateString(dateStr);
    return d ? d.getDay() : 0; // 0 = Sun, 1 = Mon ...
  }

  function daysDifference(dateStrA, dateStrB) {
    const da = parseDateString(dateStrA);
    const db = parseDateString(dateStrB);
    if (!da || !db) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((db.getTime() - da.getTime()) / msPerDay);
  }

  function generateId(prefix = 'item') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return Object.assign({}, obj);
    }
  }

  function formatRelativeDate(dateStr, timeStr) {
    if (!dateStr) return 'No due date';
    const today = getTodayString();
    const diff = daysDifference(today, dateStr);

    let label = '';
    if (diff === 0) label = 'Today';
    else if (diff === 1) label = 'Tomorrow';
    else if (diff === -1) label = 'Yesterday';
    else if (diff > 1) label = `In ${diff} days`;
    else label = `${Math.abs(diff)} days overdue`;

    if (timeStr) {
      label += ` at ${timeStr}`;
    }
    return label;
  }

  // ============================================================================
  // 3. STORAGE & EVENT SYSTEM
  // ============================================================================

  class StorageService {
    constructor() {
      this.inMemoryFallback = {};
      this.listeners = new Map();
      this.isStorageAvailable = this.checkStorage();
    }

    checkStorage() {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        const testKey = '__me_test_storage__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }

    get(key, fallback = null) {
      if (this.isStorageAvailable) {
        try {
          const raw = window.localStorage.getItem(key);
          if (raw === null || raw === undefined) return deepClone(fallback);
          return JSON.parse(raw);
        } catch (err) {
          console.warn(`[TaskHabitEngine] Error parsing localStorage key: "${key}"`, err);
          return deepClone(fallback);
        }
      }
      return this.inMemoryFallback[key] !== undefined
        ? deepClone(this.inMemoryFallback[key])
        : deepClone(fallback);
    }

    set(key, value) {
      const cloned = deepClone(value);
      if (this.isStorageAvailable) {
        try {
          window.localStorage.setItem(key, JSON.stringify(cloned));
        } catch (err) {
          console.error(`[TaskHabitEngine] Error saving to localStorage key: "${key}"`, err);
        }
      }
      this.inMemoryFallback[key] = cloned;
    }

    remove(key) {
      if (this.isStorageAvailable) {
        try {
          window.localStorage.removeItem(key);
        } catch (err) {
          console.error(`[TaskHabitEngine] Error removing localStorage key: "${key}"`, err);
        }
      }
      delete this.inMemoryFallback[key];
    }

    // PubSub Event Handling
    subscribe(eventType, callback) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }
      this.listeners.get(eventType).add(callback);

      // Return unsubscribe function
      return () => {
        const set = this.listeners.get(eventType);
        if (set) {
          set.delete(callback);
          if (set.size === 0) this.listeners.delete(eventType);
        }
      };
    }

    emit(eventType, payload) {
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).forEach(cb => {
          try {
            cb(payload);
          } catch (err) {
            console.error(`[TaskHabitEngine] Event listener error on "${eventType}":`, err);
          }
        });
      }
      if (eventType !== '*' && this.listeners.has('*')) {
        this.listeners.get('*').forEach(cb => {
          try {
            cb({ eventType, payload });
          } catch (err) {
            console.error(`[TaskHabitEngine] Global event listener error:`, err);
          }
        });
      }
    }
  }

  const storage = new StorageService();

  // ============================================================================
  // 4. MODULE 1: FLEXIBLE TO-DO LIST
  // ============================================================================
  /**
   * Tasks with categories:
   * - Daily chore
   * - Test/Exam (user manages exams directly here since no separate calendar is used)
   * - Meeting (user manages meetings directly here since no separate calendar is used)
   * - Urgent (priority / critical deadline items)
   */

  class TodoModule {
    constructor(storageInstance) {
      this.storage = storageInstance;
      this.init();
    }

    init() {
      const existing = this.storage.get(STORAGE_KEYS.TODOS, null);
      if (!existing || !Array.isArray(existing)) {
        this.storage.set(STORAGE_KEYS.TODOS, SEED_TODOS);
      }
    }

    getAll() {
      return this.storage.get(STORAGE_KEYS.TODOS, []);
    }

    getById(taskId) {
      const tasks = this.getAll();
      return tasks.find(t => t.id === taskId) || null;
    }

    /**
     * Add a new task
     * @param {Object} taskInput
     * @param {string} taskInput.title - Mandatory title
     * @param {string} [taskInput.category='Daily chore'] - 'Daily chore' | 'Test/Exam' | 'Meeting' | 'Urgent'
     * @param {string} [taskInput.description=''] - Syllabus, agenda, or notes
     * @param {string} [taskInput.dueDate] - 'YYYY-MM-DD'
     * @param {string} [taskInput.dueTime] - 'HH:mm'
     * @param {string} [taskInput.priority] - 'low' | 'medium' | 'high' | 'urgent'
     * @param {string[]} [taskInput.tags] - Array of tags
     * @param {string} [taskInput.locationOrLink] - Venue / Room / Meet link
     * @param {string} [taskInput.sourceNoteId] - Link to Scratchpad note if converted
     * @returns {Object} Created task
     */
    addTask(taskInput) {
      if (!taskInput || typeof taskInput !== 'object') {
        throw new Error('Task data must be an object');
      }
      const title = (taskInput.title || '').trim();
      if (!title) {
        throw new Error('Task title cannot be empty');
      }

      // Validate category
      let category = taskInput.category || TASK_CATEGORIES.DAILY_CHORE;
      const validCategories = Object.values(TASK_CATEGORIES);
      if (!validCategories.includes(category)) {
        // Fallback or custom category preservation
        if (typeof category !== 'string' || !category.trim()) {
          category = TASK_CATEGORIES.DAILY_CHORE;
        }
      }

      // Determine default priority
      let priority = taskInput.priority;
      if (!priority) {
        if (category === TASK_CATEGORIES.URGENT) {
          priority = TASK_PRIORITIES.URGENT;
        } else if (category === TASK_CATEGORIES.TEST_EXAM) {
          priority = TASK_PRIORITIES.HIGH;
        } else {
          priority = TASK_PRIORITIES.MEDIUM;
        }
      }

      const newTask = {
        id: taskInput.id || generateId('task'),
        title: title,
        category: category,
        description: (taskInput.description || '').trim(),
        completed: Boolean(taskInput.completed),
        completedAt: taskInput.completed ? new Date().toISOString() : null,
        priority: priority,
        dueDate: taskInput.dueDate || (category === TASK_CATEGORIES.DAILY_CHORE ? getTodayString() : null),
        dueTime: taskInput.dueTime || null,
        tags: Array.isArray(taskInput.tags) ? taskInput.tags.map(t => String(t).trim()).filter(Boolean) : [],
        locationOrLink: (taskInput.locationOrLink || '').trim(),
        sourceNoteId: taskInput.sourceNoteId || null,
        reminderMinutesBefore: Number.isInteger(taskInput.reminderMinutesBefore) ? taskInput.reminderMinutesBefore : null,
        createdAt: taskInput.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const tasks = this.getAll();
      tasks.unshift(newTask);
      this.storage.set(STORAGE_KEYS.TODOS, tasks);
      this.storage.emit('todos:changed', { action: 'add', task: newTask });
      return deepClone(newTask);
    }

    /**
     * Update an existing task
     */
    updateTask(taskId, updates) {
      if (!taskId) throw new Error('Task ID is required for update');
      const tasks = this.getAll();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) {
        throw new Error(`Task with ID "${taskId}" not found`);
      }

      const current = tasks[index];
      const updated = {
        ...current,
        ...updates,
        id: current.id, // ID cannot be altered
        createdAt: current.createdAt, // Created date immutable
        updatedAt: new Date().toISOString()
      };

      if (updates.completed !== undefined) {
        updated.completed = Boolean(updates.completed);
        updated.completedAt = updated.completed ? (current.completedAt || new Date().toISOString()) : null;
      }

      tasks[index] = updated;
      this.storage.set(STORAGE_KEYS.TODOS, tasks);
      this.storage.emit('todos:changed', { action: 'update', task: updated });
      return deepClone(updated);
    }

    /**
     * Toggle task completion status
     */
    toggleTask(taskId, forceState) {
      if (!taskId) throw new Error('Task ID is required');
      const tasks = this.getAll();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) {
        throw new Error(`Task with ID "${taskId}" not found`);
      }

      const task = tasks[index];
      const nextState = forceState !== undefined ? Boolean(forceState) : !task.completed;
      task.completed = nextState;
      task.completedAt = nextState ? new Date().toISOString() : null;
      task.updatedAt = new Date().toISOString();

      tasks[index] = task;
      this.storage.set(STORAGE_KEYS.TODOS, tasks);
      this.storage.emit('todos:changed', { action: 'toggle', task });
      return deepClone(task);
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
      if (!taskId) return false;
      const tasks = this.getAll();
      const initialLength = tasks.length;
      const filtered = tasks.filter(t => t.id !== taskId);

      if (filtered.length !== initialLength) {
        this.storage.set(STORAGE_KEYS.TODOS, filtered);
        this.storage.emit('todos:changed', { action: 'delete', taskId });
        return true;
      }
      return false;
    }

    /**
     * Clear all completed tasks (optionally by category)
     */
    clearCompleted(categoryFilter = null) {
      const tasks = this.getAll();
      const remaining = tasks.filter(t => {
        if (!t.completed) return true;
        if (categoryFilter && t.category !== categoryFilter) return true;
        return false;
      });

      const removedCount = tasks.length - remaining.length;
      this.storage.set(STORAGE_KEYS.TODOS, remaining);
      this.storage.emit('todos:changed', { action: 'clearCompleted', removedCount });
      return removedCount;
    }

    /**
     * Filter & Query Tasks
     * @param {Object} filterOptions
     * @param {string} [filterOptions.category='all'] - 'all' | 'Daily chore' | 'Test/Exam' | 'Meeting' | 'Urgent'
     * @param {string} [filterOptions.status='all'] - 'all' | 'active' | 'completed'
     * @param {string} [filterOptions.priority='all'] - 'all' | 'urgent' | 'high' | 'medium' | 'low'
     * @param {string} [filterOptions.dateFilter='all'] - 'all' | 'today' | 'tomorrow' | 'upcoming' | 'overdue' | 'unscheduled'
     * @param {string} [filterOptions.search=''] - text query
     * @param {string} [filterOptions.sortBy='dueDate'] - 'dueDate' | 'priority' | 'createdAt' | 'title' | 'category'
     * @param {string} [filterOptions.sortOrder='asc'] - 'asc' | 'desc'
     */
    getTasks(filterOptions = {}) {
      const {
        category = 'all',
        status = 'all',
        priority = 'all',
        dateFilter = 'all',
        search = '',
        sortBy = 'dueDate',
        sortOrder = 'asc'
      } = filterOptions;

      const today = getTodayString();
      let list = this.getAll();

      // 1. Filter by category
      if (category && category !== 'all') {
        list = list.filter(t => t.category.toLowerCase() === category.toLowerCase());
      }

      // 2. Filter by status (active vs completed)
      if (status === 'active') {
        list = list.filter(t => !t.completed);
      } else if (status === 'completed') {
        list = list.filter(t => t.completed);
      }

      // 3. Filter by priority
      if (priority && priority !== 'all') {
        list = list.filter(t => (t.priority || '').toLowerCase() === priority.toLowerCase());
      }

      // 4. Filter by date
      if (dateFilter && dateFilter !== 'all') {
        list = list.filter(t => {
          if (!t.dueDate) return dateFilter === 'unscheduled';
          const diff = daysDifference(today, t.dueDate);

          switch (dateFilter) {
            case 'today':
              return diff === 0;
            case 'tomorrow':
              return diff === 1;
            case 'upcoming':
              return diff >= 0;
            case 'overdue':
              return diff < 0 && !t.completed;
            case 'unscheduled':
              return !t.dueDate;
            default:
              // Custom date string match 'YYYY-MM-DD'
              return t.dueDate === dateFilter;
          }
        });
      }

      // 5. Text Search query
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(t => {
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = (t.description || '').toLowerCase().includes(q);
          const matchLocation = (t.locationOrLink || '').toLowerCase().includes(q);
          const matchTags = Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchLocation || matchTags;
        });
      }

      // 6. Sorting
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      list.sort((a, b) => {
        let compare = 0;
        if (sortBy === 'priority') {
          const wa = priorityWeight[a.priority] || 0;
          const wb = priorityWeight[b.priority] || 0;
          compare = wb - wa; // high priority first
        } else if (sortBy === 'dueDate') {
          // Tasks without due date go to the bottom
          if (!a.dueDate && !b.dueDate) compare = 0;
          else if (!a.dueDate) compare = 1;
          else if (!b.dueDate) compare = -1;
          else {
            const dateA = a.dueDate + (a.dueTime ? 'T' + a.dueTime : 'T23:59');
            const dateB = b.dueDate + (b.dueTime ? 'T' + b.dueTime : 'T23:59');
            compare = dateA.localeCompare(dateB);
          }
        } else if (sortBy === 'createdAt') {
          compare = (a.createdAt || '').localeCompare(b.createdAt || '');
        } else if (sortBy === 'title') {
          compare = a.title.localeCompare(b.title);
        } else if (sortBy === 'category') {
          compare = a.category.localeCompare(b.category);
        }

        return sortOrder === 'desc' ? -compare : compare;
      });

      return deepClone(list);
    }

    /**
     * Dedicated method for user to view upcoming Tests/Exams and Meetings
     * (Crucial since the user explicitly manages these here with no separate calendar!)
     */
    getUpcomingTestsAndMeetings(limit = 10) {
      const today = getTodayString();
      const all = this.getAll();

      const filtered = all.filter(t => {
        const isExamOrMeeting =
          t.category === TASK_CATEGORIES.TEST_EXAM ||
          t.category === TASK_CATEGORIES.MEETING;
        return isExamOrMeeting && !t.completed;
      });

      // Sort chronologically by dueDate and dueTime
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dateTimeA = a.dueDate + (a.dueTime ? 'T' + a.dueTime : 'T00:00');
        const dateTimeB = b.dueDate + (b.dueTime ? 'T' + b.dueTime : 'T00:00');
        return dateTimeA.localeCompare(dateTimeB);
      });

      // Augment with friendly countdown strings
      const result = filtered.slice(0, limit).map(item => {
        const diff = item.dueDate ? daysDifference(today, item.dueDate) : null;
        let countdown = 'No date';
        if (diff !== null) {
          if (diff === 0) countdown = 'Today!';
          else if (diff === 1) countdown = 'Tomorrow';
          else if (diff > 1) countdown = `In ${diff} days`;
          else countdown = `${Math.abs(diff)} days ago`;
        }

        return {
          ...item,
          relativeSchedule: formatRelativeDate(item.dueDate, item.dueTime),
          daysRemaining: diff,
          countdownBadge: countdown
        };
      });

      return deepClone(result);
    }

    /**
     * Get Daily Chores for today
     */
    getDailyChores(dateStr = getTodayString()) {
      return this.getTasks({
        category: TASK_CATEGORIES.DAILY_CHORE,
        dateFilter: dateStr,
        sortBy: 'priority'
      });
    }

    /**
     * Get overall statistics for dashboard
     */
    getStats() {
      const all = this.getAll();
      const today = getTodayString();

      let total = all.length;
      let completed = 0;
      let active = 0;
      let urgentPending = 0;
      let upcomingExams = 0;
      let upcomingMeetings = 0;
      let overdue = 0;

      all.forEach(t => {
        if (t.completed) {
          completed++;
        } else {
          active++;
          if (t.priority === TASK_PRIORITIES.URGENT || t.category === TASK_CATEGORIES.URGENT) {
            urgentPending++;
          }
          if (t.category === TASK_CATEGORIES.TEST_EXAM) {
            upcomingExams++;
          }
          if (t.category === TASK_CATEGORIES.MEETING) {
            upcomingMeetings++;
          }
          if (t.dueDate && daysDifference(today, t.dueDate) < 0) {
            overdue++;
          }
        }
      });

      return {
        total,
        completed,
        active,
        urgentPending,
        upcomingExams,
        upcomingMeetings,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }
  }

  // ============================================================================
  // 5. MODULE 2: CUSTOMIZABLE RECURRING TASKS (DYNAMIC HABIT ENGINE)
  // ============================================================================
  /**
   * Dynamic habit engine:
   * - User can ADD, EDIT, and REMOVE recurring habits.
   * - Default pre-seeded with:
   *   1. 'Oil Hair' (custom days: Wed & Sun, night)
   *   2. 'Eat Dry Fruits' (Daily morning)
   *   3. 'Drink 3L Water' (Daily, target 3 Liters)
   * - Full streak calculations taking non-scheduled days into account!
   * - Date-indexed completion logging in localStorage.
   */

  class HabitEngine {
    constructor(storageInstance) {
      this.storage = storageInstance;
      this.init();
    }

    init() {
      const existingHabits = this.storage.get(STORAGE_KEYS.HABITS, null);
      if (!existingHabits || !Array.isArray(existingHabits) || existingHabits.length === 0) {
        this.storage.set(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      }
      const existingLogs = this.storage.get(STORAGE_KEYS.HABIT_LOGS, null);
      if (!existingLogs || typeof existingLogs !== 'object') {
        this.storage.set(STORAGE_KEYS.HABIT_LOGS, {});
      }
    }

    getAllHabits(includeInactive = false) {
      const habits = this.storage.get(STORAGE_KEYS.HABITS, []);
      if (!includeInactive) {
        return habits.filter(h => h.isActive !== false);
      }
      return habits;
    }

    getHabitById(habitId) {
      const habits = this.storage.get(STORAGE_KEYS.HABITS, []);
      return habits.find(h => h.id === habitId) || null;
    }

    /**
     * ADD a new recurring habit
     * @param {Object} habitData
     * @param {string} habitData.name - Habit name (e.g. 'Exercise', 'Read 20 pages')
     * @param {string} [habitData.icon='🎯'] - Emoji icon
     * @param {string} [habitData.category='General'] - Category
     * @param {string} [habitData.frequency='daily'] - 'daily' | 'custom_days' | 'interval' | 'weekdays' | 'weekends'
     * @param {number[]} [habitData.daysOfWeek] - Array of days [0..6] (0=Sun, 1=Mon, ..., 6=Sat)
     * @param {number} [habitData.intervalDays] - For interval frequency (e.g. every 2 days)
     * @param {string} [habitData.timeOfDay='anytime'] - 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime'
     * @param {number} [habitData.targetValue=1] - Numeric target (e.g. 3 for 3L water)
     * @param {string} [habitData.unit='times'] - Unit ('Liters', 'glasses', 'pages', 'times')
     * @param {string} [habitData.description=''] - Instructions or notes
     */
    addHabit(habitData) {
      if (!habitData || typeof habitData !== 'object') {
        throw new Error('Habit configuration must be an object');
      }
      const name = (habitData.name || '').trim();
      if (!name) {
        throw new Error('Habit name cannot be empty');
      }

      const frequency = habitData.frequency || HABIT_FREQUENCIES.DAILY;
      let daysOfWeek = habitData.daysOfWeek;

      // Ensure appropriate daysOfWeek for frequencies
      if (frequency === HABIT_FREQUENCIES.DAILY) {
        daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      } else if (frequency === HABIT_FREQUENCIES.WEEKDAYS) {
        daysOfWeek = [1, 2, 3, 4, 5];
      } else if (frequency === HABIT_FREQUENCIES.WEEKENDS) {
        daysOfWeek = [0, 6];
      } else if (frequency === HABIT_FREQUENCIES.CUSTOM_DAYS) {
        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
          // default to all days if unspecified
          daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
        } else {
          // Normalize and deduplicate 0..6
          daysOfWeek = [...new Set(daysOfWeek.map(d => Number(d) % 7))].sort((a, b) => a - b);
        }
      }

      const habits = this.storage.get(STORAGE_KEYS.HABITS, []);
      const newHabit = {
        id: habitData.id || generateId('habit'),
        name: name,
        description: (habitData.description || '').trim(),
        icon: habitData.icon || '🎯',
        category: habitData.category || 'General',
        frequency: frequency,
        daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
        intervalDays: habitData.intervalDays ? Math.max(1, parseInt(habitData.intervalDays, 10)) : null,
        timeOfDay: habitData.timeOfDay || TIME_OF_DAY.ANYTIME,
        targetValue: habitData.targetValue !== undefined ? Math.max(1, Number(habitData.targetValue)) : 1,
        unit: habitData.unit || 'times',
        isActive: habitData.isActive !== false,
        order: habits.length + 1,
        createdAt: habitData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      habits.push(newHabit);
      this.storage.set(STORAGE_KEYS.HABITS, habits);
      this.storage.emit('habits:changed', { action: 'add', habit: newHabit });
      return deepClone(newHabit);
    }

    /**
     * EDIT an existing recurring habit
     * @param {string} habitId
     * @param {Object} updates
     */
    editHabit(habitId, updates) {
      if (!habitId) throw new Error('Habit ID is required for editing');
      const habits = this.storage.get(STORAGE_KEYS.HABITS, []);
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) {
        throw new Error(`Habit with ID "${habitId}" not found`);
      }

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

      // Recalculate daysOfWeek if frequency updated
      if (updates.frequency) {
        if (updates.frequency === HABIT_FREQUENCIES.DAILY) {
          updated.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
        } else if (updates.frequency === HABIT_FREQUENCIES.WEEKDAYS) {
          updated.daysOfWeek = [1, 2, 3, 4, 5];
        } else if (updates.frequency === HABIT_FREQUENCIES.WEEKENDS) {
          updated.daysOfWeek = [0, 6];
        } else if (updates.frequency === HABIT_FREQUENCIES.CUSTOM_DAYS && Array.isArray(updates.daysOfWeek)) {
          updated.daysOfWeek = [...new Set(updates.daysOfWeek.map(d => Number(d) % 7))].sort((a, b) => a - b);
        }
      }

      habits[index] = updated;
      this.storage.set(STORAGE_KEYS.HABITS, habits);
      this.storage.emit('habits:changed', { action: 'edit', habit: updated });
      return deepClone(updated);
    }

    /**
     * REMOVE a recurring habit
     * @param {string} habitId
     * @param {boolean} [permanent=false] - true: deletes from array; false: marks isActive=false
     */
    removeHabit(habitId, permanent = false) {
      if (!habitId) return false;
      const habits = this.storage.get(STORAGE_KEYS.HABITS, []);
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) return false;

      if (permanent) {
        habits.splice(index, 1);
      } else {
        habits[index].isActive = false;
        habits[index].updatedAt = new Date().toISOString();
      }

      this.storage.set(STORAGE_KEYS.HABITS, habits);
      this.storage.emit('habits:changed', { action: 'remove', habitId, permanent });
      return true;
    }

    /**
     * Check if a habit is scheduled to be performed on a specific date
     * @param {Object} habit
     * @param {string} dateStr - 'YYYY-MM-DD'
     * @returns {boolean}
     */
    isHabitScheduledForDate(habit, dateStr = getTodayString()) {
      if (!habit || habit.isActive === false) return false;

      // Don't schedule before habit creation date (by day)
      if (habit.createdAt) {
        const createdDayStr = habit.createdAt.slice(0, 10);
        if (daysDifference(createdDayStr, dateStr) < 0) {
          return false;
        }
      }

      const dayOfWeek = getDayOfWeekFromDateString(dateStr); // 0 = Sun, 1 = Mon ...

      switch (habit.frequency) {
        case HABIT_FREQUENCIES.DAILY:
          return true;

        case HABIT_FREQUENCIES.CUSTOM_DAYS:
          return Array.isArray(habit.daysOfWeek) && habit.daysOfWeek.includes(dayOfWeek);

        case HABIT_FREQUENCIES.WEEKDAYS:
          return dayOfWeek >= 1 && dayOfWeek <= 5;

        case HABIT_FREQUENCIES.WEEKENDS:
          return dayOfWeek === 0 || dayOfWeek === 6;

        case HABIT_FREQUENCIES.INTERVAL: {
          if (!habit.intervalDays || habit.intervalDays <= 1) return true;
          const createdDayStr = (habit.createdAt || getTodayString()).slice(0, 10);
          const diff = Math.abs(daysDifference(createdDayStr, dateStr));
          return diff % habit.intervalDays === 0;
        }

        default:
          return true;
      }
    }

    /**
     * Get all logs for a specific date
     * Structure: { [dateStr]: { [habitId]: { completed: boolean, value: number, timestamp: string } } }
     */
    getDateLogs(dateStr = getTodayString()) {
      const allLogs = this.storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      return allLogs[dateStr] || {};
    }

    /**
     * Get scheduled habits for a specific date, enriched with log status
     * @param {string} dateStr - 'YYYY-MM-DD'
     */
    getScheduledHabitsForDate(dateStr = getTodayString()) {
      const allHabits = this.getAllHabits(false);
      const dateLogs = this.getDateLogs(dateStr);

      const scheduled = allHabits.filter(h => this.isHabitScheduledForDate(h, dateStr));

      return scheduled.map(habit => {
        const log = dateLogs[habit.id] || null;
        const isDone = log ? Boolean(log.completed) : false;
        const currentValue = log && log.value !== undefined ? log.value : (isDone ? habit.targetValue : 0);
        const progressPercent = habit.targetValue > 0 ? Math.min(100, Math.round((currentValue / habit.targetValue) * 100)) : (isDone ? 100 : 0);

        return {
          ...habit,
          date: dateStr,
          completed: isDone,
          currentValue: currentValue,
          targetValue: habit.targetValue,
          progressPercent: progressPercent,
          completedAt: log ? log.timestamp : null,
          scheduleSummary: this.getFrequencyDescription(habit)
        };
      });
    }

    /**
     * Generate human-readable frequency description
     */
    getFrequencyDescription(habit) {
      if (!habit) return '';
      switch (habit.frequency) {
        case HABIT_FREQUENCIES.DAILY:
          return habit.timeOfDay && habit.timeOfDay !== TIME_OF_DAY.ANYTIME
            ? `Daily (${habit.timeOfDay})`
            : 'Daily';
        case HABIT_FREQUENCIES.WEEKDAYS:
          return 'Mon to Fri';
        case HABIT_FREQUENCIES.WEEKENDS:
          return 'Sat & Sun';
        case HABIT_FREQUENCIES.CUSTOM_DAYS: {
          if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return 'Custom';
          if (habit.daysOfWeek.length === 7) return 'Every day';
          const names = habit.daysOfWeek.map(d => DAY_SHORT[d]);
          return names.join(' & ');
        }
        case HABIT_FREQUENCIES.INTERVAL:
          return `Every ${habit.intervalDays} days`;
        default:
          return 'Scheduled';
      }
    }

    /**
     * TOGGLE completion of a habit for a given date
     * @param {string} habitId
     * @param {string} [dateStr=today]
     * @param {number} [forceValue]
     */
    toggleHabitCompletion(habitId, dateStr = getTodayString(), forceValue) {
      const habit = this.getHabitById(habitId);
      if (!habit) throw new Error(`Habit "${habitId}" not found`);

      const allLogs = this.storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      if (!allLogs[dateStr]) {
        allLogs[dateStr] = {};
      }

      const current = allLogs[dateStr][habitId];
      const currentlyDone = current ? Boolean(current.completed) : false;
      const nextDone = !currentlyDone;

      let nextValue = nextDone ? habit.targetValue : 0;
      if (forceValue !== undefined) {
        nextValue = forceValue;
      }

      allLogs[dateStr][habitId] = {
        completed: nextDone,
        value: nextValue,
        timestamp: nextDone ? new Date().toISOString() : null
      };

      this.storage.set(STORAGE_KEYS.HABIT_LOGS, allLogs);
      this.storage.emit('habit_logs:changed', {
        action: 'toggle',
        habitId,
        date: dateStr,
        completed: nextDone,
        value: nextValue
      });

      return {
        habitId,
        date: dateStr,
        completed: nextDone,
        value: nextValue
      };
    }

    /**
     * Log numerical progress for habits with target values (e.g. 3L Water)
     * @param {string} habitId
     * @param {number} value
     * @param {string} [dateStr=today]
     */
    logHabitProgress(habitId, value, dateStr = getTodayString()) {
      const habit = this.getHabitById(habitId);
      if (!habit) throw new Error(`Habit "${habitId}" not found`);

      const numVal = Math.max(0, Number(value) || 0);
      const isCompleted = numVal >= habit.targetValue;

      const allLogs = this.storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      if (!allLogs[dateStr]) {
        allLogs[dateStr] = {};
      }

      allLogs[dateStr][habitId] = {
        completed: isCompleted,
        value: numVal,
        timestamp: new Date().toISOString()
      };

      this.storage.set(STORAGE_KEYS.HABIT_LOGS, allLogs);
      this.storage.emit('habit_logs:changed', {
        action: 'progress',
        habitId,
        date: dateStr,
        completed: isCompleted,
        value: numVal
      });

      return {
        habitId,
        date: dateStr,
        completed: isCompleted,
        value: numVal,
        targetValue: habit.targetValue
      };
    }

    /**
     * CALCULATE HABIT STREAK (Smart calculation!)
     * Takes non-scheduled days into account:
     * e.g., if 'Oil Hair' is scheduled only for Wednesday & Sunday,
     * missing Thursday/Friday does NOT break the streak!
     * @param {string} habitId
     * @param {string} [referenceDateStr=today]
     * @returns {Object} { currentStreak: number, longestStreak: number, lastCompletedDate: string|null }
     */
    getHabitStreak(habitId, referenceDateStr = getTodayString()) {
      const habit = this.getHabitById(habitId);
      if (!habit) return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };

      const allLogs = this.storage.get(STORAGE_KEYS.HABIT_LOGS, {});
      const createdDayStr = (habit.createdAt || '2026-01-01').slice(0, 10);

      // Collect all scheduled days up to reference date in chronological order
      let checkDate = createdDayStr;
      const scheduledDays = [];

      while (daysDifference(checkDate, referenceDateStr) >= 0) {
        if (this.isHabitScheduledForDate(habit, checkDate)) {
          scheduledDays.push(checkDate);
        }
        checkDate = addDaysToString(checkDate, 1);
      }

      if (scheduledDays.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
      }

      // Track completions
      let longestStreak = 0;
      let tempStreak = 0;
      let lastCompletedDate = null;

      for (let i = 0; i < scheduledDays.length; i++) {
        const day = scheduledDays[i];
        const dayLog = allLogs[day] && allLogs[day][habitId];
        const isDone = dayLog && Boolean(dayLog.completed);

        if (isDone) {
          tempStreak++;
          lastCompletedDate = day;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      // Determine current active streak
      // Check backwards from the latest scheduled day
      let currentStreak = 0;
      let i = scheduledDays.length - 1;

      // If the latest scheduled day is today and not done yet, grace period allows checking from previous scheduled day
      if (i >= 0 && scheduledDays[i] === referenceDateStr) {
        const todayLog = allLogs[referenceDateStr] && allLogs[referenceDateStr][habitId];
        if (!todayLog || !todayLog.completed) {
          i--; // Check streak up to previous scheduled day
        }
      }

      while (i >= 0) {
        const day = scheduledDays[i];
        const dayLog = allLogs[day] && allLogs[day][habitId];
        if (dayLog && Boolean(dayLog.completed)) {
          currentStreak++;
          i--;
        } else {
          break;
        }
      }

      return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastCompletedDate
      };
    }

    /**
     * Get Daily Score (% of scheduled habits completed on that day)
     * @param {string} [dateStr=today]
     * @returns {number} 0 to 100
     */
    getDailyScore(dateStr = getTodayString()) {
      const scheduled = this.getScheduledHabitsForDate(dateStr);
      if (scheduled.length === 0) return 100; // No habits scheduled = 100% clean day
      const completedCount = scheduled.filter(h => h.completed).length;
      return Math.round((completedCount / scheduled.length) * 100);
    }

    /**
     * Get weekly / multi-day heatmap data
     * @param {string} [startDateStr] - Start of week
     * @param {number} [daysCount=7] - Number of days to render
     */
    getHeatmapData(startDateStr, daysCount = 7) {
      const today = getTodayString();
      let start = startDateStr;
      if (!start) {
        // Default to Mon of current week
        const d = new Date();
        const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
        const diffToMon = (dayOfWeek + 6) % 7;
        start = addDaysToString(today, -diffToMon);
      }

      const days = [];
      for (let i = 0; i < daysCount; i++) {
        const curDate = addDaysToString(start, i);
        const scheduled = this.getScheduledHabitsForDate(curDate);
        const isFuture = daysDifference(today, curDate) > 0;
        const score = isFuture ? 0 : this.getDailyScore(curDate);

        let level = 'lv0';
        if (!isFuture && scheduled.length > 0) {
          if (score >= 90) level = 'lv5';
          else if (score >= 70) level = 'lv4';
          else if (score >= 50) level = 'lv3';
          else if (score >= 25) level = 'lv2';
          else if (score > 0) level = 'lv1';
        }

        days.push({
          date: curDate,
          dayOfWeek: getDayOfWeekFromDateString(curDate),
          dayNameShort: DAY_SHORT[getDayOfWeekFromDateString(curDate)],
          dayNameFull: DAY_NAMES[getDayOfWeekFromDateString(curDate)],
          score: isFuture ? null : score,
          level: level,
          isToday: curDate === today,
          isFuture: isFuture,
          totalScheduled: scheduled.length,
          totalCompleted: scheduled.filter(h => h.completed).length
        });
      }

      return days;
    }

    /**
     * Restore default pre-seeded habits
     */
    resetToDefaults() {
      this.storage.set(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      this.storage.emit('habits:changed', { action: 'resetDefaults' });
      return deepClone(DEFAULT_HABITS);
    }
  }

  // ============================================================================
  // 6. MODULE 3: 'SOMEBODY TOLD ME' QUICK CAPTURE SCRATCHPAD
  // ============================================================================
  /**
   * Instant note taking for things people told them:
   * - Person name/context (e.g. "Rahul", "Prof. Sharma", "Hostel Warden")
   * - Context (e.g. "Hostel corridor", "Phone call", "After Physics class")
   * - Note text (the advice, request, exam hint, chore, book return, etc.)
   * - Date created
   * - Optional reminder tag (e.g. "Friday", "2026-09-18", "Before 5pm")
   * - Instant conversion into a flexible To-Do task with 1 click!
   */

  class ScratchpadModule {
    constructor(storageInstance, todoModuleInstance) {
      this.storage = storageInstance;
      this.todoModule = todoModuleInstance;
      this.init();
    }

    init() {
      const existing = this.storage.get(STORAGE_KEYS.SCRATCHPAD, null);
      if (!existing || !Array.isArray(existing)) {
        this.storage.set(STORAGE_KEYS.SCRATCHPAD, SEED_SCRATCHPAD);
      }
    }

    getAll() {
      return this.storage.get(STORAGE_KEYS.SCRATCHPAD, []);
    }

    getById(noteId) {
      const notes = this.getAll();
      return notes.find(n => n.id === noteId) || null;
    }

    /**
     * Add an instant scratchpad note
     * @param {Object} input
     * @param {string} input.person - Who told you (e.g. "Rahul", "Mom")
     * @param {string} [input.context=''] - Where/Situation (e.g. "In corridor")
     * @param {string} input.text - The message / instruction / note text
     * @param {string} [input.reminderTag=''] - Optional reminder tag (e.g. "Return book by Friday")
     * @param {string} [input.reminderDate] - Optional reminder date 'YYYY-MM-DD'
     * @param {string} [input.priority='medium'] - 'low' | 'medium' | 'high'
     */
    addNote(input) {
      if (!input || typeof input !== 'object') {
        throw new Error('Note data must be an object');
      }

      const text = (input.text || '').trim();
      if (!text) {
        throw new Error('Note text cannot be empty');
      }

      const person = (input.person || 'Anonymous').trim();
      const context = (input.context || '').trim();
      const reminderTag = (input.reminderTag || '').trim();

      const newNote = {
        id: input.id || generateId('stm'),
        person: person,
        context: context,
        text: text,
        reminderTag: reminderTag,
        reminderDate: input.reminderDate || null,
        priority: input.priority || 'medium',
        isResolved: Boolean(input.isResolved),
        resolvedAt: input.isResolved ? new Date().toISOString() : null,
        convertedToTaskId: input.convertedToTaskId || null,
        createdAt: input.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const notes = this.getAll();
      notes.unshift(newNote);
      this.storage.set(STORAGE_KEYS.SCRATCHPAD, notes);
      this.storage.emit('scratchpad:changed', { action: 'add', note: newNote });
      return deepClone(newNote);
    }

    /**
     * Update an existing note
     */
    updateNote(noteId, updates) {
      if (!noteId) throw new Error('Note ID is required');
      const notes = this.getAll();
      const index = notes.findIndex(n => n.id === noteId);
      if (index === -1) {
        throw new Error(`Note with ID "${noteId}" not found`);
      }

      const current = notes[index];
      const updated = {
        ...current,
        ...updates,
        id: current.id,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString()
      };

      if (updates.isResolved !== undefined) {
        updated.isResolved = Boolean(updates.isResolved);
        updated.resolvedAt = updated.isResolved ? (current.resolvedAt || new Date().toISOString()) : null;
      }

      notes[index] = updated;
      this.storage.set(STORAGE_KEYS.SCRATCHPAD, notes);
      this.storage.emit('scratchpad:changed', { action: 'update', note: updated });
      return deepClone(updated);
    }

    /**
     * Toggle resolved status
     */
    toggleResolved(noteId) {
      if (!noteId) throw new Error('Note ID is required');
      const notes = this.getAll();
      const index = notes.findIndex(n => n.id === noteId);
      if (index === -1) {
        throw new Error(`Note with ID "${noteId}" not found`);
      }

      const note = notes[index];
      const nextState = !note.isResolved;
      note.isResolved = nextState;
      note.resolvedAt = nextState ? new Date().toISOString() : null;
      note.updatedAt = new Date().toISOString();

      notes[index] = note;
      this.storage.set(STORAGE_KEYS.SCRATCHPAD, notes);
      this.storage.emit('scratchpad:changed', { action: 'toggleResolved', note });
      return deepClone(note);
    }

    /**
     * Delete a note permanently
     */
    deleteNote(noteId) {
      if (!noteId) return false;
      const notes = this.getAll();
      const initialLength = notes.length;
      const filtered = notes.filter(n => n.id !== noteId);

      if (filtered.length !== initialLength) {
        this.storage.set(STORAGE_KEYS.SCRATCHPAD, filtered);
        this.storage.emit('scratchpad:changed', { action: 'delete', noteId });
        return true;
      }
      return false;
    }

    /**
     * CONVERT TO TO-DO TASK
     * Directly turns something someone told you into an actionable to-do item!
     * @param {string} noteId
     * @param {string} [targetCategory='Daily chore'] - 'Daily chore' | 'Test/Exam' | 'Meeting' | 'Urgent'
     * @param {Object} [taskOverrides] - Optional custom title, date, etc.
     */
    convertToTask(noteId, targetCategory = TASK_CATEGORIES.DAILY_CHORE, taskOverrides = {}) {
      const note = this.getById(noteId);
      if (!note) throw new Error(`Note "${noteId}" not found`);

      if (!this.todoModule) {
        throw new Error('TodoModule is not attached to ScratchpadModule');
      }

      // Compose task title and description
      const taskTitle = taskOverrides.title || note.text;
      const contextDesc = `Told by ${note.person}${note.context ? ` (${note.context})` : ''}.${note.reminderTag ? ` Reminder tag: "${note.reminderTag}".` : ''}`;
      const taskDesc = taskOverrides.description
        ? `${taskOverrides.description}\n\n${contextDesc}`
        : contextDesc;

      const createdTask = this.todoModule.addTask({
        title: taskTitle,
        category: targetCategory,
        description: taskDesc,
        dueDate: taskOverrides.dueDate || note.reminderDate || getTodayString(),
        dueTime: taskOverrides.dueTime || null,
        priority: taskOverrides.priority || (targetCategory === TASK_CATEGORIES.URGENT ? TASK_PRIORITIES.URGENT : note.priority || TASK_PRIORITIES.MEDIUM),
        tags: ['somebody-told-me', ...(taskOverrides.tags || [])],
        sourceNoteId: note.id,
        locationOrLink: taskOverrides.locationOrLink || ''
      });

      // Update the note to link the task and mark as resolved
      this.updateNote(note.id, {
        isResolved: true,
        convertedToTaskId: createdTask.id
      });

      return {
        note: this.getById(note.id),
        task: createdTask
      };
    }

    /**
     * Query & Filter Scratchpad Notes
     * @param {Object} filters
     * @param {string} [filters.status='all'] - 'all' | 'active' | 'resolved'
     * @param {string} [filters.person='all'] - specific person name
     * @param {boolean} [filters.hasReminder=false] - only items with reminders
     * @param {string} [filters.search=''] - search text
     * @param {string} [filters.sortBy='createdAt'] - 'createdAt' | 'person' | 'priority'
     * @param {string} [filters.sortOrder='desc']
     */
    getNotes(filters = {}) {
      const {
        status = 'all',
        person = 'all',
        hasReminder = false,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      let list = this.getAll();

      // Filter by status
      if (status === 'active') {
        list = list.filter(n => !n.isResolved);
      } else if (status === 'resolved') {
        list = list.filter(n => n.isResolved);
      }

      // Filter by person
      if (person && person !== 'all') {
        list = list.filter(n => n.person.toLowerCase() === person.toLowerCase());
      }

      // Filter by reminder presence
      if (hasReminder) {
        list = list.filter(n => Boolean(n.reminderTag || n.reminderDate));
      }

      // Search text across all fields
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(n =>
          n.text.toLowerCase().includes(q) ||
          n.person.toLowerCase().includes(q) ||
          (n.context || '').toLowerCase().includes(q) ||
          (n.reminderTag || '').toLowerCase().includes(q)
        );
      }

      // Sorting
      list.sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'createdAt') {
          cmp = (a.createdAt || '').localeCompare(b.createdAt || '');
        } else if (sortBy === 'person') {
          cmp = a.person.localeCompare(b.person);
        } else if (sortBy === 'priority') {
          const w = { high: 3, medium: 2, low: 1 };
          cmp = (w[b.priority] || 0) - (w[a.priority] || 0);
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });

      return deepClone(list);
    }

    /**
     * Get unique list of people who have told the user things, with counts
     * Perfect for auto-complete and filter chips!
     */
    getPeopleList() {
      const notes = this.getAll();
      const map = {};
      notes.forEach(n => {
        const name = n.person ? n.person.trim() : 'Anonymous';
        map[name] = (map[name] || 0) + 1;
      });

      return Object.keys(map).map(name => ({
        name,
        count: map[name]
      })).sort((a, b) => b.count - a.count);
    }

    /**
     * Get notes with active reminders
     */
    getPendingReminders() {
      return this.getNotes({
        status: 'active',
        hasReminder: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    }
  }

  // ============================================================================
  // 7. UNIFIED FACADE & EXPORT / IMPORT ENGINE
  // ============================================================================

  const todoModule = new TodoModule(storage);
  const habitEngine = new HabitEngine(storage);
  const scratchpadModule = new ScratchpadModule(storage, todoModule);

  const TaskHabitEngine = {
    // Sub-modules
    todos: todoModule,
    habits: habitEngine,
    scratchpad: scratchpadModule,
    storage: storage,

    // Constants exposed for UI binding
    TASK_CATEGORIES,
    TASK_PRIORITIES,
    HABIT_FREQUENCIES,
    TIME_OF_DAY,
    DAY_NAMES,
    DAY_SHORT,

    // Utility methods
    utils: {
      getTodayString,
      addDaysToString,
      parseDateString,
      getDayOfWeekFromDateString,
      daysDifference,
      formatRelativeDate,
      generateId,
      deepClone
    },

    /**
     * Event Subscriptions:
     * engine.subscribe('todos:changed', handler)
     * engine.subscribe('habits:changed', handler)
     * engine.subscribe('habit_logs:changed', handler)
     * engine.subscribe('scratchpad:changed', handler)
     * engine.subscribe('*', handler)
     */
    subscribe(eventType, callback) {
      return storage.subscribe(eventType, callback);
    },

    /**
     * Comprehensive Backup Export (JSON object)
     */
    exportBackup() {
      return {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        todos: todoModule.getAll(),
        habits: habitEngine.getAllHabits(true),
        habitLogs: storage.get(STORAGE_KEYS.HABIT_LOGS, {}),
        scratchpad: scratchpadModule.getAll(),
        meta: {
          totalTodos: todoModule.getAll().length,
          totalHabits: habitEngine.getAllHabits(true).length,
          totalNotes: scratchpadModule.getAll().length
        }
      };
    },

    /**
     * Restore from JSON backup
     * @param {Object|string} data - Backup object or JSON string
     * @param {string} [mode='merge'] - 'overwrite' or 'merge'
     */
    importBackup(data, mode = 'merge') {
      let parsed = data;
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          throw new Error('Invalid JSON backup format');
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid backup data');
      }

      if (mode === 'overwrite') {
        if (Array.isArray(parsed.todos)) storage.set(STORAGE_KEYS.TODOS, parsed.todos);
        if (Array.isArray(parsed.habits)) storage.set(STORAGE_KEYS.HABITS, parsed.habits);
        if (parsed.habitLogs && typeof parsed.habitLogs === 'object') {
          storage.set(STORAGE_KEYS.HABIT_LOGS, parsed.habitLogs);
        }
        if (Array.isArray(parsed.scratchpad)) storage.set(STORAGE_KEYS.SCRATCHPAD, parsed.scratchpad);
      } else {
        // Merge mode
        if (Array.isArray(parsed.todos)) {
          const existing = todoModule.getAll();
          const existingIds = new Set(existing.map(t => t.id));
          parsed.todos.forEach(t => {
            if (!existingIds.has(t.id)) existing.push(t);
          });
          storage.set(STORAGE_KEYS.TODOS, existing);
        }

        if (Array.isArray(parsed.habits)) {
          const existing = habitEngine.getAllHabits(true);
          const existingIds = new Set(existing.map(h => h.id));
          parsed.habits.forEach(h => {
            if (!existingIds.has(h.id)) existing.push(h);
          });
          storage.set(STORAGE_KEYS.HABITS, existing);
        }

        if (parsed.habitLogs && typeof parsed.habitLogs === 'object') {
          const existing = storage.get(STORAGE_KEYS.HABIT_LOGS, {});
          Object.keys(parsed.habitLogs).forEach(date => {
            if (!existing[date]) existing[date] = {};
            Object.assign(existing[date], parsed.habitLogs[date]);
          });
          storage.set(STORAGE_KEYS.HABIT_LOGS, existing);
        }

        if (Array.isArray(parsed.scratchpad)) {
          const existing = scratchpadModule.getAll();
          const existingIds = new Set(existing.map(n => n.id));
          parsed.scratchpad.forEach(n => {
            if (!existingIds.has(n.id)) existing.push(n);
          });
          storage.set(STORAGE_KEYS.SCRATCHPAD, existing);
        }
      }

      storage.emit('*', { action: 'imported', mode });
      return true;
    },

    /**
     * Reset everything to clean initial state
     */
    resetAll() {
      storage.set(STORAGE_KEYS.TODOS, SEED_TODOS);
      storage.set(STORAGE_KEYS.HABITS, DEFAULT_HABITS);
      storage.set(STORAGE_KEYS.HABIT_LOGS, {});
      storage.set(STORAGE_KEYS.SCRATCHPAD, SEED_SCRATCHPAD);
      storage.emit('*', { action: 'resetAll' });
      return true;
    }
  };

  return TaskHabitEngine;
});
