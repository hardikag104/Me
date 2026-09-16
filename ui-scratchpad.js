/**
 * ==============================================================================
 * ME LIFE OS — 'SOMEBODY TOLD ME' QUICK CAPTURE SCRATCHPAD
 * Agent 6: Scratchpad Specialist
 * ==============================================================================
 * 
 * The Problem:
 * Friends, professors, parents, and wardens tell the user random tasks, tips, 
 * or verbal requests on random days ('Rahul said bring book on Friday',
 * 'Prof said study chapter 4 for quiz', 'Mom said take dry fruits and call uncle').
 * Without a rapid capture mechanism, these verbal requests slip through the cracks.
 * 
 * Features:
 * 1. Floating / Top Quick Capture Card:
 *    - 'Who told you?' (with rapid suggestion chips: Mom, Dad, Prof. Sharma, Rahul, etc.)
 *    - 'What did they say?' (quick auto-expanding text)
 *    - Optional context badge ('Phone call', 'Outside Audi 3', 'Corridor', 'Mess')
 *    - Optional reminder date (Date picker + rapid shortcuts: Today, Tomorrow, Friday, +3 Days)
 *    - Priority & category tagging
 *    - Floating action button (FAB) + Global Quick Capture Modal accessible from any tab
 * 2. List of Captured Notes:
 *    - Person avatar circle with initials & deterministic vibrant gradient
 *    - Context badge (📍 Where / How)
 *    - Relative date added ('Just now', 'Today, 4:15 PM', 'Yesterday')
 *    - Due / Reminder countdown badge ('📅 Due Friday', '⏰ Overdue')
 *    - Status badge: Active (mint glow) vs Resolved (dimmed checkmark)
 * 3. 1-Click 'Convert to To-Do':
 *    - Directly escalates the note into a scheduled task in the task list (Agent 4 / Agent 2)
 *    - Preserves provenance (who told you, context, original text, priority, due date)
 *    - Automatically marks the scratchpad note as Resolved and links the converted Task ID
 * 4. Filter by Person & Search Notes:
 *    - Dynamic person filter chips with note counts (e.g. 'Prof. Sharma (2)', 'Rahul (1)')
 *    - Status tabs (All, Active, Resolved, Has Reminder)
 *    - Instant live search across person, text, context, and reminders
 *    - Sorting (Newest, Oldest, Reminder Date, Priority, Person A-Z)
 * 
 * Architecture:
 * - Clean modular JavaScript, zero dependencies
 * - Dual export: ES Module + UMD / Window global attachment
 * - Self-injected CSS matching the 'Me' Life OS dark design system
 * - Bi-directional integration with TaskHabitEngine & MeApp with resilient fallback
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.SomebodyToldMeUI = exports.SomebodyToldMeUI;
    root.ScratchpadUIComponent = exports.SomebodyToldMeUI; // convenient alias
    root.ScratchpadStorage = exports.ScratchpadStorage;
    root.ScratchpadTaskConverter = exports.ScratchpadTaskConverter;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ============================================================================
  // 1. CONSTANTS & SEED DATA
  // ============================================================================

  const STORAGE_KEYS = {
    SCRATCHPAD: 'me_tasks_scratchpad',
    TODOS: 'me_tasks_todos'
  };

  const DEFAULT_PERSON_SUGGESTIONS = [
    { name: 'Prof. Sharma', role: 'Professor', icon: '🏛️' },
    { name: 'Rahul', role: 'Batchmate', icon: '🎒' },
    { name: 'Mom', role: 'Family', icon: '❤️' },
    { name: 'Dad', role: 'Family', icon: '💼' },
    { name: 'Hostel Warden', role: 'Campus', icon: '🏢' },
    { name: 'Roommate', role: 'Hostel', icon: '🛏️' },
    { name: 'TA Ananya', role: 'Teaching Assistant', icon: '📚' }
  ];

  const SEED_NOTES = [
    {
      id: 'stm_seed_1',
      person: 'Prof. Sharma',
      context: 'Signal Processing lecture',
      text: 'Study chapter 4 thoroughly for the upcoming surprise quiz on digital filter design.',
      reminderTag: 'Quiz prep on Ch 4',
      reminderDate: getOffsetDateString(2),
      priority: 'high',
      categoryHint: 'Test/Exam',
      isResolved: false,
      resolvedAt: null,
      convertedToTaskId: null,
      createdAt: getOffsetISOString(0, -3), // 3 hours ago
      updatedAt: getOffsetISOString(0, -3)
    },
    {
      id: 'stm_seed_2',
      person: 'Rahul',
      context: 'Hostel 4 corridor',
      text: 'Bring the Machine Elements textbook on Friday morning before the 10 AM tutorial.',
      reminderTag: 'Return book by Friday',
      reminderDate: getNextDayOfWeekString(5), // Friday
      priority: 'medium',
      categoryHint: 'Daily chore',
      isResolved: false,
      resolvedAt: null,
      convertedToTaskId: null,
      createdAt: getOffsetISOString(0, -6), // 6 hours ago
      updatedAt: getOffsetISOString(0, -6)
    },
    {
      id: 'stm_seed_3',
      person: 'Mom',
      context: 'Evening phone call',
      text: 'Eat soaked dry fruits every morning before tea and drink warm water right after waking up.',
      reminderTag: 'Daily dry fruits reminder',
      reminderDate: getTodayString(),
      priority: 'medium',
      categoryHint: 'Daily chore',
      isResolved: false,
      resolvedAt: null,
      convertedToTaskId: null,
      createdAt: getOffsetISOString(-1, -2), // yesterday
      updatedAt: getOffsetISOString(-1, -2)
    },
    {
      id: 'stm_seed_4',
      person: 'Hostel Warden',
      context: 'Notice board & mess announcement',
      text: 'Submit mess rebate declaration form before the 20th of this month at the warden office.',
      reminderTag: 'Mess rebate form',
      reminderDate: getOffsetDateString(4),
      priority: 'urgent',
      categoryHint: 'Urgent',
      isResolved: false,
      resolvedAt: null,
      convertedToTaskId: null,
      createdAt: getOffsetISOString(-2, 0),
      updatedAt: getOffsetISOString(-2, 0)
    }
  ];

  // ============================================================================
  // 2. DATE & FORMATTING UTILITIES
  // ============================================================================

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getOffsetDateString(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getOffsetISOString(daysOffset = 0, hoursOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(d.getHours() + hoursOffset);
    return d.toISOString();
  }

  function getNextDayOfWeekString(targetDay) {
    // 0=Sun, 1=Mon, ..., 5=Fri
    const d = new Date();
    const currentDay = d.getDay();
    let distance = (targetDay - currentDay + 7) % 7;
    if (distance === 0) distance = 7; // next occurrence
    d.setDate(d.getDate() + distance);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatRelativeDate(isoStr) {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24 && date.getDate() === now.getDate()) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays === 1 || (diffHour < 48 && date.getDate() === now.getDate() - 1)) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays < 7) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[date.getDay()]}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  function formatReminderBadge(dateStr) {
    if (!dateStr) return null;
    try {
      const target = new Date(dateStr + 'T00:00:00');
      const today = new Date(getTodayString() + 'T00:00:00');
      const diffMs = target.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const formattedDate = target.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      if (diffDays < 0) {
        return {
          type: 'overdue',
          label: `⏰ Overdue (${formattedDate})`,
          diffDays
        };
      }
      if (diffDays === 0) {
        return {
          type: 'today',
          label: `🚨 Due Today`,
          diffDays
        };
      }
      if (diffDays === 1) {
        return {
          type: 'tomorrow',
          label: `⏳ Due Tomorrow`,
          diffDays
        };
      }
      if (diffDays <= 6) {
        return {
          type: 'soon',
          label: `📅 ${formattedDate} (in ${diffDays}d)`,
          diffDays
        };
      }
      return {
        type: 'future',
        label: `📅 ${formattedDate}`,
        diffDays
      };
    } catch {
      return { type: 'future', label: `📅 ${dateStr}`, diffDays: 0 };
    }
  }

  /**
   * Deterministically generate a two-color gradient based on a person's name hash
   */
  function getPersonAvatarStyle(name) {
    if (!name) name = 'Anonymous';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 45) % 360;
    const gradient = `linear-gradient(135deg, hsl(${h1}, 75%, 48%), hsl(${h2}, 85%, 38%))`;

    // Calculate initials
    const parts = name.trim().split(/\s+/).filter(Boolean);
    let initials = '';
    if (parts.length === 1) {
      initials = parts[0].slice(0, 2).toUpperCase();
    } else {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return { gradient, initials };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generateId(prefix = 'stm') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // ============================================================================
  // 3. STORAGE & EVENT BUS ADAPTER
  // ============================================================================

  class ScratchpadStorage {
    static getAll() {
      // 1. Prefer window.TaskHabitEngine.scratchpad if available
      if (window.TaskHabitEngine && window.TaskHabitEngine.scratchpad && typeof window.TaskHabitEngine.scratchpad.getAll === 'function') {
        const notes = window.TaskHabitEngine.scratchpad.getAll();
        if (Array.isArray(notes) && notes.length > 0) return notes;
      }

      // 2. Direct localStorage lookup
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SCRATCHPAD);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn('[ScratchpadStorage] Failed to parse scratchpad from storage:', e);
      }

      // 3. First time seeding
      ScratchpadStorage.saveAll(SEED_NOTES);
      return [...SEED_NOTES];
    }

    static saveAll(notes) {
      try {
        localStorage.setItem(STORAGE_KEYS.SCRATCHPAD, JSON.stringify(notes));
      } catch (e) {
        console.error('[ScratchpadStorage] Storage save failed:', e);
      }
      ScratchpadStorage.emit('scratchpad:changed', { notes });
    }

    static getById(id) {
      const notes = ScratchpadStorage.getAll();
      return notes.find(n => n.id === id) || null;
    }

    static addNote(noteInput) {
      if (!noteInput || !noteInput.text) {
        throw new Error('Note text is mandatory');
      }

      // If TaskHabitEngine is available, leverage its validation & hooks
      if (window.TaskHabitEngine && window.TaskHabitEngine.scratchpad && typeof window.TaskHabitEngine.scratchpad.addNote === 'function') {
        try {
          const note = window.TaskHabitEngine.scratchpad.addNote({
            person: noteInput.person || 'Anonymous',
            context: noteInput.context || '',
            text: noteInput.text.trim(),
            reminderTag: noteInput.reminderTag || '',
            reminderDate: noteInput.reminderDate || null,
            priority: noteInput.priority || 'medium'
          });
          // Enrich with custom attributes if needed
          if (noteInput.categoryHint) {
            ScratchpadStorage.updateNote(note.id, { categoryHint: noteInput.categoryHint });
          }
          ScratchpadStorage.emit('scratchpad:changed', { action: 'add', note });
          return note;
        } catch (e) {
          console.warn('[ScratchpadStorage] TaskHabitEngine.addNote failed, falling back to local:', e);
        }
      }

      const newNote = {
        id: noteInput.id || generateId('stm'),
        person: (noteInput.person || 'Anonymous').trim(),
        context: (noteInput.context || '').trim(),
        text: noteInput.text.trim(),
        reminderTag: (noteInput.reminderTag || '').trim(),
        reminderDate: noteInput.reminderDate || null,
        priority: noteInput.priority || 'medium',
        categoryHint: noteInput.categoryHint || 'Daily chore',
        isResolved: Boolean(noteInput.isResolved),
        resolvedAt: noteInput.isResolved ? new Date().toISOString() : null,
        convertedToTaskId: noteInput.convertedToTaskId || null,
        createdAt: noteInput.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const notes = ScratchpadStorage.getAll();
      notes.unshift(newNote);
      ScratchpadStorage.saveAll(notes);
      return newNote;
    }

    static updateNote(id, updates) {
      if (window.TaskHabitEngine && window.TaskHabitEngine.scratchpad && typeof window.TaskHabitEngine.scratchpad.updateNote === 'function') {
        try {
          const updated = window.TaskHabitEngine.scratchpad.updateNote(id, updates);
          ScratchpadStorage.emit('scratchpad:changed', { action: 'update', note: updated });
          return updated;
        } catch {
          // fall through to local update
        }
      }

      const notes = ScratchpadStorage.getAll();
      const idx = notes.findIndex(n => n.id === id);
      if (idx === -1) return null;

      const current = notes[idx];
      const updated = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: new Date().toISOString()
      };

      if (updates.isResolved !== undefined) {
        updated.isResolved = Boolean(updates.isResolved);
        updated.resolvedAt = updated.isResolved ? (current.resolvedAt || new Date().toISOString()) : null;
      }

      notes[idx] = updated;
      ScratchpadStorage.saveAll(notes);
      return updated;
    }

    static toggleResolved(id) {
      const note = ScratchpadStorage.getById(id);
      if (!note) return null;
      return ScratchpadStorage.updateNote(id, {
        isResolved: !note.isResolved
      });
    }

    static deleteNote(id) {
      if (window.TaskHabitEngine && window.TaskHabitEngine.scratchpad && typeof window.TaskHabitEngine.scratchpad.deleteNote === 'function') {
        try {
          window.TaskHabitEngine.scratchpad.deleteNote(id);
          ScratchpadStorage.emit('scratchpad:changed', { action: 'delete', id });
          return true;
        } catch {
          // fall through
        }
      }

      const notes = ScratchpadStorage.getAll();
      const filtered = notes.filter(n => n.id !== id);
      if (filtered.length !== notes.length) {
        ScratchpadStorage.saveAll(filtered);
        ScratchpadStorage.emit('scratchpad:changed', { action: 'delete', id });
        return true;
      }
      return false;
    }

    static getUniquePeople() {
      const notes = ScratchpadStorage.getAll();
      const map = new Map();

      // Seed with frequent contacts first
      DEFAULT_PERSON_SUGGESTIONS.forEach(p => {
        map.set(p.name.toLowerCase(), { name: p.name, count: 0, icon: p.icon, role: p.role });
      });

      // Count notes per person
      notes.forEach(n => {
        const name = (n.person || 'Anonymous').trim();
        const key = name.toLowerCase();
        if (map.has(key)) {
          const item = map.get(key);
          item.count++;
        } else {
          map.set(key, { name, count: 1, icon: '👤', role: 'Contact' });
        }
      });

      return Array.from(map.values()).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });
    }

    static emit(eventName, detail) {
      try {
        window.dispatchEvent(new CustomEvent(`me:${eventName}`, { detail }));
      } catch {}
    }

    static on(eventName, handler) {
      window.addEventListener(`me:${eventName}`, handler);
      return () => window.removeEventListener(`me:${eventName}`, handler);
    }
  }

  // ============================================================================
  // 4. TASK CONVERTER (1-CLICK 'CONVERT TO TO-DO')
  // ============================================================================

  class ScratchpadTaskConverter {
    /**
     * Converts a scratchpad note into a scheduled To-Do task in Agent 4's task list!
     * 1. Constructs rich task description referencing the person, context, and time told
     * 2. Adds task to TaskEngine / To-Do list
     * 3. Marks note resolved and links convertedTaskId
     * 4. Triggers UI refresh and celebrations
     */
    static convert(noteId, options = {}) {
      const note = ScratchpadStorage.getById(noteId);
      if (!note) throw new Error(`Note ${noteId} not found`);

      const targetCategory = options.category || note.categoryHint || 'Daily chore';
      const targetPriority = options.priority || note.priority || 'medium';
      const dueDate = options.dueDate || note.reminderDate || getTodayString();

      // Build context provenance description
      const provenanceLine = `🗣️ Told by: ${note.person}${note.context ? ` (${note.context})` : ''}`;
      const reminderLine = note.reminderTag ? `⏰ Reminder tag: "${note.reminderTag}"` : '';
      const fullDesc = [options.description || '', provenanceLine, reminderLine]
        .filter(Boolean)
        .join('\n');

      let createdTask = null;

      // 1. Try window.TaskHabitEngine.scratchpad.convertToTask
      if (window.TaskHabitEngine && window.TaskHabitEngine.scratchpad && typeof window.TaskHabitEngine.scratchpad.convertToTask === 'function') {
        try {
          const res = window.TaskHabitEngine.scratchpad.convertToTask(note.id, targetCategory, {
            title: options.title || note.text,
            description: fullDesc,
            dueDate: dueDate,
            priority: targetPriority
          });
          createdTask = res.task;
        } catch (err) {
          console.warn('[TaskConverter] TaskHabitEngine conversion error:', err);
        }
      }

      // 2. Try window.TaskHabitEngine.todos.addTask directly if scratchpad module conversion was skipped
      if (!createdTask && window.TaskHabitEngine && window.TaskHabitEngine.todos && typeof window.TaskHabitEngine.todos.addTask === 'function') {
        try {
          createdTask = window.TaskHabitEngine.todos.addTask({
            title: options.title || note.text,
            category: targetCategory,
            description: fullDesc,
            dueDate: dueDate,
            priority: targetPriority,
            tags: ['somebody-told-me', note.person.toLowerCase().replace(/\s+/g, '-')],
            sourceNoteId: note.id
          });
        } catch (err) {
          console.warn('[TaskConverter] TaskHabitEngine.todos.addTask error:', err);
        }
      }

      // 3. LocalStorage fallback if TaskHabitEngine is absent
      if (!createdTask) {
        const taskId = generateId('todo');
        createdTask = {
          id: taskId,
          title: options.title || note.text,
          category: targetCategory,
          description: fullDesc,
          dueDate: dueDate,
          priority: targetPriority,
          completed: false,
          sourceNoteId: note.id,
          createdAt: new Date().toISOString()
        };

        try {
          const rawTodos = localStorage.getItem(STORAGE_KEYS.TODOS);
          const todos = rawTodos ? JSON.parse(rawTodos) : [];
          todos.unshift(createdTask);
          localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));

          // Also save in today's dated list if MeApp uses me_${today}_todos
          const datedKey = `me_${getTodayString()}_todos`;
          const datedRaw = localStorage.getItem(datedKey);
          const datedTodos = datedRaw ? JSON.parse(datedRaw) : [];
          datedTodos.unshift(createdTask);
          localStorage.setItem(datedKey, JSON.stringify(datedTodos));
        } catch (e) {
          console.error('[TaskConverter] Local todo save error:', e);
        }
      }

      // Mark the scratchpad note as resolved and store task link
      const updatedNote = ScratchpadStorage.updateNote(note.id, {
        isResolved: true,
        convertedToTaskId: createdTask ? createdTask.id : 'task_generated'
      });

      // Notify Master App (MeApp) to re-render tasks if present
      if (window.MeApp) {
        if (typeof window.MeApp.renderTodos === 'function') window.MeApp.renderTodos();
        if (typeof window.MeApp.renderScratchpad === 'function') window.MeApp.renderScratchpad();
        if (typeof window.MeApp.showToast === 'function') {
          window.MeApp.showToast(`Converted to "${targetCategory}"!`, '⚡');
        }
        if (typeof window.MeApp.calculateMasterScore === 'function') {
          window.MeApp.calculateMasterScore();
        }
      }

      ScratchpadStorage.emit('scratchpad:converted', {
        note: updatedNote,
        task: createdTask
      });

      return { note: updatedNote, task: createdTask };
    }
  }

  // ============================================================================
  // 5. CSS STYLESHEET FOR 'SOMEBODY TOLD ME' COMPONENT
  // ============================================================================

  const SCRATCHPAD_CSS = `
    /* ==========================================================================
       Agent 6: Somebody Told Me Scratchpad CSS Tokens & Styles
       ========================================================================== */
    .stm-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
      font-family: inherit;
    }

    /* Top Capture Card */
    .stm-capture-card {
      background: linear-gradient(135deg, rgba(26, 26, 38, 0.95) 0%, rgba(18, 18, 26, 0.98) 100%);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: hidden;
      transition: all 0.25s ease;
    }
    .stm-capture-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent, #7c5cfc), #06b6d4, var(--mint, #10b981));
    }
    .stm-capture-card:focus-within {
      border-color: var(--accent, #7c5cfc);
      box-shadow: 0 8px 30px rgba(124, 92, 252, 0.18);
    }

    .stm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .stm-header-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary, #f3f4f8);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stm-header-subtitle {
      font-size: 0.72rem;
      color: var(--text-secondary, #9494a8);
      margin-top: 2px;
    }
    .stm-badge-count {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full, 9999px);
      background: rgba(124, 92, 252, 0.15);
      color: #c4b5fd;
      border: 1px solid rgba(124, 92, 252, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* Quick Person Suggestions Chips */
    .stm-suggestions-row {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 10px;
      scrollbar-width: none;
    }
    .stm-suggestions-row::-webkit-scrollbar {
      display: none;
    }
    .stm-suggestion-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted, #5e5e76);
      flex-shrink: 0;
      margin-right: 2px;
    }
    .stm-chip-btn {
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-full, 9999px);
      color: var(--text-secondary, #9494a8);
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
      user-select: none;
    }
    .stm-chip-btn:hover {
      background: rgba(124, 92, 252, 0.15);
      border-color: var(--accent, #7c5cfc);
      color: var(--text-primary, #f3f4f8);
      transform: translateY(-1px);
    }
    .stm-chip-btn.active {
      background: var(--accent, #7c5cfc);
      color: #ffffff;
      border-color: var(--accent, #7c5cfc);
    }

    /* Form Fields Grid */
    .stm-form-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    @media (max-width: 480px) {
      .stm-form-row {
        grid-template-columns: 1fr;
      }
    }

    .stm-input, .stm-textarea, .stm-select {
      width: 100%;
      background: var(--bg-primary, #09090d);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-sm, 8px);
      padding: 9px 12px;
      color: var(--text-primary, #f3f4f8);
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, background 0.2s;
    }
    .stm-input:focus, .stm-textarea:focus, .stm-select:focus {
      border-color: var(--accent, #7c5cfc);
      background: #0d0d14;
    }
    .stm-input::placeholder, .stm-textarea::placeholder {
      color: var(--text-muted, #5e5e76);
    }

    .stm-textarea {
      min-height: 54px;
      resize: vertical;
      line-height: 1.4;
    }

    /* Advanced Meta Controls Row */
    .stm-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
    }
    .stm-meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-primary, #09090d);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-sm, 8px);
      padding: 4px 8px;
      font-size: 0.75rem;
      color: var(--text-secondary, #9494a8);
    }
    .stm-meta-item label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--text-muted, #5e5e76);
      text-transform: uppercase;
    }
    .stm-meta-input {
      background: transparent;
      border: none;
      color: var(--text-primary, #f3f4f8);
      font-size: 0.75rem;
      outline: none;
      font-family: inherit;
    }
    .stm-meta-input[type="date"] {
      color-scheme: dark;
      cursor: pointer;
    }

    /* Quick Date Shortcuts */
    .stm-date-shortcuts {
      display: flex;
      gap: 4px;
    }
    .stm-date-btn {
      background: transparent;
      border: 1px solid var(--border-subtle, #1f1f2e);
      color: var(--text-secondary, #9494a8);
      border-radius: 4px;
      font-size: 0.68rem;
      padding: 2px 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .stm-date-btn:hover {
      background: var(--border-subtle, #1f1f2e);
      color: var(--text-primary, #f3f4f8);
    }

    /* Form Actions Row */
    .stm-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .stm-hint-text {
      font-size: 0.7rem;
      color: var(--text-muted, #5e5e76);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stm-hint-kbd {
      background: var(--bg-primary, #09090d);
      border: 1px solid var(--border-subtle, #1f1f2e);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 0.65rem;
      font-family: monospace;
    }
    .stm-submit-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-sm, 8px);
      padding: 8px 18px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
    }
    .stm-submit-btn:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }
    .stm-submit-btn:active {
      transform: translateY(0);
    }

    /* Filter & Search Bar */
    .stm-filter-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      padding: 12px 14px;
    }
    .stm-search-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .stm-search-box {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .stm-search-box .search-icon {
      position: absolute;
      left: 10px;
      font-size: 0.85rem;
      color: var(--text-muted, #5e5e76);
      pointer-events: none;
    }
    .stm-search-input {
      width: 100%;
      background: var(--bg-primary, #09090d);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-sm, 8px);
      padding: 8px 10px 8px 32px;
      color: var(--text-primary, #f3f4f8);
      font-size: 0.8rem;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .stm-search-input:focus {
      border-color: var(--accent, #7c5cfc);
    }
    .stm-search-clear {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      color: var(--text-muted, #5e5e76);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 2px 4px;
    }

    /* Status Filter Tabs */
    .stm-tabs-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .stm-status-tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-primary, #09090d);
      padding: 3px;
      border-radius: var(--radius-sm, 8px);
      border: 1px solid var(--border-subtle, #1f1f2e);
    }
    .stm-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary, #9494a8);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .stm-tab-btn.active {
      background: var(--bg-surface-elevated, #181824);
      color: var(--text-primary, #f3f4f8);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .stm-tab-badge {
      font-size: 0.65rem;
      padding: 1px 5px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
    }

    /* Person Chips Filter */
    .stm-people-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 2px 0;
      scrollbar-width: none;
    }
    .stm-people-chips::-webkit-scrollbar {
      display: none;
    }
    .stm-person-chip {
      background: var(--bg-primary, #09090d);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-full, 9999px);
      color: var(--text-secondary, #9494a8);
      padding: 3px 8px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .stm-person-chip:hover {
      border-color: var(--accent, #7c5cfc);
      color: var(--text-primary, #f3f4f8);
    }
    .stm-person-chip.active {
      background: var(--accent, #7c5cfc);
      color: #ffffff;
      border-color: var(--accent, #7c5cfc);
    }
    .stm-person-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--mint, #10b981);
    }

    /* Notes List */
    .stm-notes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .stm-note-card {
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      padding: 14px 16px;
      position: relative;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .stm-note-card:hover {
      border-color: rgba(124, 92, 252, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .stm-note-card.resolved {
      opacity: 0.72;
      background: rgba(18, 18, 26, 0.6);
      border-color: rgba(31, 31, 46, 0.7);
    }
    .stm-note-card.resolved .stm-note-text {
      text-decoration: line-through;
      color: var(--text-muted, #5e5e76);
    }

    /* Note Card Header */
    .stm-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }
    .stm-author-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }
    .stm-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.8rem;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      letter-spacing: -0.02em;
    }
    .stm-author-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .stm-author-name {
      font-size: 0.86rem;
      font-weight: 700;
      color: var(--text-primary, #f3f4f8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .stm-context-pill {
      font-size: 0.68rem;
      color: var(--text-secondary, #9494a8);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle, #1f1f2e);
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      width: fit-content;
      margin-top: 2px;
    }

    /* Badges & Status */
    .stm-card-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .stm-status-badge {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 3px 7px;
      border-radius: var(--radius-full, 9999px);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .stm-status-badge.active {
      background: rgba(16, 185, 129, 0.12);
      color: var(--mint, #10b981);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .stm-status-badge.resolved {
      background: rgba(107, 114, 128, 0.15);
      color: #9ca3af;
      border: 1px solid rgba(107, 114, 128, 0.3);
    }

    /* Note Content Body */
    .stm-note-body {
      padding-left: 44px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    @media (max-width: 480px) {
      .stm-note-body {
        padding-left: 0;
      }
    }
    .stm-note-text {
      font-size: 0.88rem;
      line-height: 1.5;
      color: var(--text-primary, #f3f4f8);
      background: rgba(9, 9, 13, 0.4);
      border-left: 3px solid var(--accent, #7c5cfc);
      padding: 8px 12px;
      border-radius: 0 8px 8px 0;
      position: relative;
      font-style: italic;
    }
    .stm-note-text::before {
      content: '“';
      font-size: 1.2rem;
      font-family: Georgia, serif;
      color: var(--accent, #7c5cfc);
      margin-right: 2px;
      opacity: 0.7;
    }
    .stm-note-text::after {
      content: '”';
      font-size: 1.2rem;
      font-family: Georgia, serif;
      color: var(--accent, #7c5cfc);
      margin-left: 2px;
      opacity: 0.7;
    }

    /* Reminder & Converted Tag Row */
    .stm-tag-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
    }
    .stm-reminder-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .stm-reminder-badge.overdue {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .stm-reminder-badge.today, .stm-reminder-badge.tomorrow {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .stm-reminder-badge.soon, .stm-reminder-badge.future {
      background: rgba(124, 92, 252, 0.12);
      color: #c4b5fd;
      border: 1px solid rgba(124, 92, 252, 0.3);
    }
    .stm-converted-badge {
      background: rgba(16, 185, 129, 0.14);
      color: var(--mint, #10b981);
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .stm-date-label {
      font-size: 0.68rem;
      color: var(--text-muted, #5e5e76);
      margin-left: auto;
    }

    /* Note Card Footer Action Controls */
    .stm-card-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      margin-top: 4px;
    }

    /* 1-Click Convert to To-Do Button */
    .stm-convert-btn {
      background: linear-gradient(135deg, rgba(124, 92, 252, 0.25) 0%, rgba(124, 92, 252, 0.1) 100%);
      color: #c4b5fd;
      border: 1px solid rgba(124, 92, 252, 0.4);
      border-radius: var(--radius-sm, 8px);
      padding: 5px 11px;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }
    .stm-convert-btn:hover {
      background: var(--accent, #7c5cfc);
      color: #ffffff;
      border-color: var(--accent, #7c5cfc);
      box-shadow: 0 3px 12px rgba(124, 92, 252, 0.35);
      transform: translateY(-1px);
    }
    .stm-convert-btn:active {
      transform: translateY(0);
    }
    .stm-convert-btn.converted {
      background: rgba(16, 185, 129, 0.1);
      color: var(--mint, #10b981);
      border-color: rgba(16, 185, 129, 0.3);
      cursor: default;
    }

    .stm-icon-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted, #5e5e76);
      border-radius: 6px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: 0.8rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .stm-icon-btn:hover {
      background: var(--bg-surface-elevated, #181824);
      color: var(--text-primary, #f3f4f8);
      border-color: var(--border-subtle, #1f1f2e);
    }
    .stm-icon-btn.delete:hover {
      color: var(--rose, #ef4444);
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.1);
    }

    /* Empty State */
    .stm-empty-state {
      text-align: center;
      padding: 36px 16px;
      background: var(--bg-surface, #12121a);
      border: 1px dashed var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-md, 14px);
      color: var(--text-secondary, #9494a8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .stm-empty-icon {
      font-size: 2.2rem;
      margin-bottom: 4px;
    }
    .stm-empty-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary, #f3f4f8);
    }
    .stm-empty-desc {
      font-size: 0.78rem;
      max-width: 320px;
      line-height: 1.4;
      color: var(--text-muted, #5e5e76);
    }

    /* Floating Action Button (FAB) */
    .stm-fab {
      position: fixed;
      bottom: calc(var(--nav-height, 64px) + 20px);
      right: 20px;
      background: linear-gradient(135deg, var(--accent, #7c5cfc) 0%, #06b6d4 100%);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-full, 9999px);
      padding: 10px 18px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 6px 20px rgba(124, 92, 252, 0.4);
      z-index: 90;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .stm-fab:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 26px rgba(124, 92, 252, 0.55);
    }
    .stm-fab:active {
      transform: translateY(0);
    }

    /* Floating Capture Modal */
    .stm-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .stm-modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .stm-modal-dialog {
      width: 100%;
      max-width: 520px;
      background: var(--bg-surface, #12121a);
      border: 1px solid var(--border-subtle, #1f1f2e);
      border-radius: var(--radius-lg, 20px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
      padding: 20px;
      box-sizing: border-box;
      transform: translateY(12px) scale(0.98);
      transition: transform 0.2s ease;
      position: relative;
    }
    .stm-modal-overlay.open .stm-modal-dialog {
      transform: translateY(0) scale(1);
    }
    .stm-modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: transparent;
      border: none;
      color: var(--text-muted, #5e5e76);
      font-size: 1.1rem;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .stm-modal-close:hover {
      color: var(--text-primary, #f3f4f8);
      background: var(--bg-surface-elevated, #181824);
    }
  `;

  // ============================================================================
  // 6. MAIN CONTROLLER & UI COMPONENT: SomebodyToldMeUI
  // ============================================================================

  class SomebodyToldMeUI {
    /**
     * @param {HTMLElement|string} container - Mount element or CSS selector
     * @param {Object} [options]
     * @param {boolean} [options.enableFab=false] - Show floating quick capture button
     * @param {Function} [options.onConvert] - Callback when converted to To-Do
     * @param {Function} [options.onAdd] - Callback when new note added
     */
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.options = Object.assign({
        enableFab: false,
        onConvert: null,
        onAdd: null
      }, options);

      // State
      this.activeTab = 'all'; // 'all' | 'active' | 'resolved' | 'reminder'
      this.selectedPerson = 'all';
      this.searchQuery = '';
      this.sortBy = 'newest'; // 'newest' | 'oldest' | 'reminder' | 'priority' | 'person'
      this.isModalOpen = false;

      // Draft form state
      this.draftPerson = '';
      this.draftContext = '';
      this.draftText = '';
      this.draftReminderDate = '';
      this.draftPriority = 'medium';
      this.draftCategory = 'Daily chore';

      this.init();
    }

    init() {
      this.injectStyles();
      this.setupEventListeners();
      this.render();

      if (this.options.enableFab) {
        this.renderFab();
      }
    }

    injectStyles() {
      if (!document.getElementById('stm-scratchpad-styles')) {
        const style = document.createElement('style');
        style.id = 'stm-scratchpad-styles';
        style.textContent = SCRATCHPAD_CSS;
        document.head.appendChild(style);
      }
    }

    setupEventListeners() {
      // Listen to storage sync events
      ScratchpadStorage.on('scratchpad:changed', () => {
        this.render();
      });

      // Global keyboard shortcut: Alt + S opens quick capture modal
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          this.toggleModal();
        }
      });
    }

    // ==========================================================================
    // FILTERING, SEARCH & SORTING LOGIC
    // ==========================================================================

    getFilteredNotes() {
      let notes = ScratchpadStorage.getAll();

      // 1. Filter by status tab
      if (this.activeTab === 'active') {
        notes = notes.filter(n => !n.isResolved);
      } else if (this.activeTab === 'resolved') {
        notes = notes.filter(n => n.isResolved);
      } else if (this.activeTab === 'reminder') {
        notes = notes.filter(n => Boolean(n.reminderDate || n.reminderTag));
      }

      // 2. Filter by person
      if (this.selectedPerson && this.selectedPerson !== 'all') {
        const q = this.selectedPerson.toLowerCase();
        notes = notes.filter(n => (n.person || '').toLowerCase() === q);
      }

      // 3. Filter by search query
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase();
        notes = notes.filter(n =>
          (n.person || '').toLowerCase().includes(q) ||
          (n.text || '').toLowerCase().includes(q) ||
          (n.context || '').toLowerCase().includes(q) ||
          (n.reminderTag || '').toLowerCase().includes(q)
        );
      }

      // 4. Sort notes
      notes.sort((a, b) => {
        if (this.sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (this.sortBy === 'oldest') {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (this.sortBy === 'reminder') {
          if (!a.reminderDate) return 1;
          if (!b.reminderDate) return -1;
          return a.reminderDate.localeCompare(b.reminderDate);
        }
        if (this.sortBy === 'priority') {
          const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (weight[b.priority] || 2) - (weight[a.priority] || 2);
        }
        if (this.sortBy === 'person') {
          return (a.person || '').localeCompare(b.person || '');
        }
        return 0;
      });

      return notes;
    }

    getCounts() {
      const all = ScratchpadStorage.getAll();
      const active = all.filter(n => !n.isResolved).length;
      const resolved = all.filter(n => n.isResolved).length;
      const reminder = all.filter(n => Boolean(n.reminderDate || n.reminderTag)).length;
      return { total: all.length, active, resolved, reminder };
    }

    // ==========================================================================
    // RENDERING CORE
    // ==========================================================================

    render() {
      if (!this.container) return;

      const counts = this.getCounts();
      const filteredNotes = this.getFilteredNotes();
      const uniquePeople = ScratchpadStorage.getUniquePeople();

      this.container.innerHTML = `
        <div class="stm-wrapper">
          
          <!-- 1. TOP QUICK CAPTURE CARD -->
          ${this.renderQuickCaptureCard(counts)}

          <!-- 2. SEARCH & FILTER TOOLBAR -->
          ${this.renderFilterToolbar(counts, uniquePeople)}

          <!-- 3. CAPTURED NOTES LIST -->
          <div class="stm-notes-list" id="stmNotesList">
            ${filteredNotes.length > 0
              ? filteredNotes.map(note => this.renderNoteCard(note)).join('')
              : this.renderEmptyState()
            }
          </div>

        </div>

        <!-- 4. FLOATING QUICK CAPTURE MODAL -->
        <div class="stm-modal-overlay ${this.isModalOpen ? 'open' : ''}" id="stmModalOverlay">
          <div class="stm-modal-dialog">
            <button class="stm-modal-close" id="stmModalCloseBtn" title="Close">✕</button>
            ${this.renderQuickCaptureCard(counts, true)}
          </div>
        </div>
      `;

      this.bindCardEvents();
    }

    renderQuickCaptureCard(counts, isModal = false) {
      const prefix = isModal ? 'stm_m_' : 'stm_';

      return `
        <div class="stm-capture-card">
          <div class="stm-header">
            <div>
              <div class="stm-header-title">
                <span>👂</span>
                <span>Somebody Told Me</span>
              </div>
              <div class="stm-header-subtitle">Capture random tasks, tips & verbal reminders instantly</div>
            </div>
            <div class="stm-badge-count" title="${counts.active} active notes waiting">
              <span>●</span> ${counts.active} Active
            </div>
          </div>

          <!-- Quick Person Suggestion Chips -->
          <div class="stm-suggestions-row">
            <span class="stm-suggestion-label">Quick:</span>
            ${DEFAULT_PERSON_SUGGESTIONS.map(p => `
              <button type="button" class="stm-chip-btn ${this.draftPerson === p.name ? 'active' : ''}" data-person-pick="${escapeHtml(p.name)}">
                <span>${p.icon}</span> ${escapeHtml(p.name)}
              </button>
            `).join('')}
          </div>

          <!-- Who & Context Row -->
          <div class="stm-form-row">
            <div>
              <input type="text" id="${prefix}inputPerson" class="stm-input" 
                placeholder="Who told you? *" 
                value="${escapeHtml(this.draftPerson)}"
                autocomplete="off">
            </div>
            <div>
              <input type="text" id="${prefix}inputContext" class="stm-input" 
                placeholder="Where / Situation? (e.g. Phone call, Outside class, Corridor)" 
                value="${escapeHtml(this.draftContext)}">
            </div>
          </div>

          <!-- What did they say / Main Note Text -->
          <div style="margin-bottom: 8px;">
            <textarea id="${prefix}inputText" class="stm-textarea" 
              placeholder="What did they say? (e.g. 'Rahul said bring book on Friday', 'Prof said study chapter 4 for quiz') *"
              rows="2">${escapeHtml(this.draftText)}</textarea>
          </div>

          <!-- Metadata row (Reminder Date, Priority, Category Hint) -->
          <div class="stm-meta-row">
            <div class="stm-meta-item">
              <label>📅 Due:</label>
              <input type="date" id="${prefix}inputDate" class="stm-meta-input" value="${this.draftReminderDate || ''}">
              <div class="stm-date-shortcuts">
                <button type="button" class="stm-date-btn" data-date-set="today">Today</button>
                <button type="button" class="stm-date-btn" data-date-set="tomorrow">Tomorrow</button>
                <button type="button" class="stm-date-btn" data-date-set="friday">Friday</button>
              </div>
            </div>

            <div class="stm-meta-item">
              <label>⚡ Pri:</label>
              <select id="${prefix}selectPriority" class="stm-meta-input" style="cursor: pointer;">
                <option value="low" ${this.draftPriority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${this.draftPriority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high" ${this.draftPriority === 'high' ? 'selected' : ''}>High</option>
                <option value="urgent" ${this.draftPriority === 'urgent' ? 'selected' : ''}>Urgent</option>
              </select>
            </div>

            <div class="stm-meta-item">
              <label>🏷️ Type:</label>
              <select id="${prefix}selectCategory" class="stm-meta-input" style="cursor: pointer;">
                <option value="Daily chore" ${this.draftCategory === 'Daily chore' ? 'selected' : ''}>Chore</option>
                <option value="Test/Exam" ${this.draftCategory === 'Test/Exam' ? 'selected' : ''}>Test/Exam</option>
                <option value="Meeting" ${this.draftCategory === 'Meeting' ? 'selected' : ''}>Meeting</option>
                <option value="Urgent" ${this.draftCategory === 'Urgent' ? 'selected' : ''}>Urgent</option>
              </select>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="stm-actions-row">
            <div class="stm-hint-text">
              <span class="stm-hint-kbd">Ctrl</span> + <span class="stm-hint-kbd">Enter</span> to quick capture
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-styled sm ghost" id="${prefix}btnClearForm" style="font-size: 0.76rem; padding: 6px 12px;">Clear</button>
              <button type="button" class="stm-submit-btn" id="${prefix}btnSubmitNote">
                <span>⚡</span>
                <span>Capture Note</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderFilterToolbar(counts, uniquePeople) {
      return `
        <div class="stm-filter-bar">
          <!-- Search Row -->
          <div class="stm-search-row">
            <div class="stm-search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="stmSearchInput" class="stm-search-input" 
                placeholder="Search notes, people, contexts..." 
                value="${escapeHtml(this.searchQuery)}">
              ${this.searchQuery ? `<button class="stm-search-clear" id="stmSearchClearBtn">✕</button>` : ''}
            </div>

            <!-- Sort dropdown -->
            <select id="stmSortSelect" class="stm-select" style="width: auto; padding: 8px 10px; font-size: 0.75rem; cursor: pointer;">
              <option value="newest" ${this.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              <option value="oldest" ${this.sortBy === 'oldest' ? 'selected' : ''}>Oldest First</option>
              <option value="reminder" ${this.sortBy === 'reminder' ? 'selected' : ''}>Reminder Date</option>
              <option value="priority" ${this.sortBy === 'priority' ? 'selected' : ''}>Priority</option>
              <option value="person" ${this.sortBy === 'person' ? 'selected' : ''}>Person (A-Z)</option>
            </select>
          </div>

          <!-- Tabs & People Chips Row -->
          <div class="stm-tabs-row">
            <div class="stm-status-tabs">
              <button class="stm-tab-btn ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
                All <span class="stm-tab-badge">${counts.total}</span>
              </button>
              <button class="stm-tab-btn ${this.activeTab === 'active' ? 'active' : ''}" data-tab="active">
                Active <span class="stm-tab-badge">${counts.active}</span>
              </button>
              <button class="stm-tab-btn ${this.activeTab === 'resolved' ? 'active' : ''}" data-tab="resolved">
                Resolved <span class="stm-tab-badge">${counts.resolved}</span>
              </button>
              <button class="stm-tab-btn ${this.activeTab === 'reminder' ? 'active' : ''}" data-tab="reminder">
                Reminders <span class="stm-tab-badge">${counts.reminder}</span>
              </button>
            </div>
          </div>

          <!-- Person Chips List -->
          <div class="stm-people-chips">
            <button class="stm-person-chip ${this.selectedPerson === 'all' ? 'active' : ''}" data-person="all">
              <span class="dot" style="${this.selectedPerson === 'all' ? 'background: #fff;' : ''}"></span>
              All People (${counts.total})
            </button>
            ${uniquePeople.filter(p => p.count > 0).map(p => `
              <button class="stm-person-chip ${this.selectedPerson.toLowerCase() === p.name.toLowerCase() ? 'active' : ''}" data-person="${escapeHtml(p.name)}">
                <span>${p.icon || '👤'}</span>
                <span>${escapeHtml(p.name)}</span>
                <span style="opacity: 0.7; font-size: 0.65rem;">(${p.count})</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderNoteCard(note) {
      const avatar = getPersonAvatarStyle(note.person);
      const reminder = formatReminderBadge(note.reminderDate);
      const isConverted = Boolean(note.convertedToTaskId);
      const relativeTime = formatRelativeDate(note.createdAt);

      const priColors = {
        urgent: '#ec4899',
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
      };

      return `
        <div class="stm-note-card ${note.isResolved ? 'resolved' : ''}" data-note-id="${note.id}">
          <!-- Header with Avatar, Name, Context & Status -->
          <div class="stm-card-header">
            <div class="stm-author-group">
              <div class="stm-avatar" style="background: ${avatar.gradient};">
                ${avatar.initials}
              </div>
              <div class="stm-author-meta">
                <div class="stm-author-name">
                  <span>${escapeHtml(note.person || 'Anonymous')}</span>
                  <span style="width: 7px; height: 7px; border-radius: 50%; background: ${priColors[note.priority] || '#f59e0b'};" title="Priority: ${note.priority}"></span>
                </div>
                ${note.context ? `
                  <div class="stm-context-pill">
                    <span>📍</span>
                    <span>${escapeHtml(note.context)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="stm-card-badges">
              <div class="stm-status-badge ${note.isResolved ? 'resolved' : 'active'}">
                <span>${note.isResolved ? '✓' : '●'}</span>
                <span>${note.isResolved ? 'Resolved' : 'Active'}</span>
              </div>
            </div>
          </div>

          <!-- Body with Speech Bubble Text -->
          <div class="stm-note-body">
            <div class="stm-note-text">
              ${escapeHtml(note.text)}
            </div>

            <!-- Tags & Reminders row -->
            <div class="stm-tag-row">
              ${reminder ? `
                <div class="stm-reminder-badge ${reminder.type}">
                  ${reminder.label}
                </div>
              ` : ''}

              ${note.reminderTag && (!reminder || !reminder.label.includes(note.reminderTag)) ? `
                <div class="stm-reminder-badge soon" style="font-style: italic;">
                  🏷️ "${escapeHtml(note.reminderTag)}"
                </div>
              ` : ''}

              ${isConverted ? `
                <div class="stm-converted-badge" title="Escalated into To-Do task list">
                  <span>✓</span> Converted to To-Do
                </div>
              ` : ''}

              <div class="stm-date-label">
                ${relativeTime}
              </div>
            </div>
          </div>

          <!-- Footer Actions Row -->
          <div class="stm-card-actions">
            <!-- 1-Click 'Convert to To-Do' button -->
            <button class="stm-convert-btn ${isConverted ? 'converted' : ''}" 
              data-action="convert" 
              data-id="${note.id}"
              title="Escalate into scheduled To-Do task in Agent 4's task list">
              <span>${isConverted ? '✓ In Task List' : '⚡ Convert to To-Do'}</span>
            </button>

            <!-- Toggle Resolved -->
            <button class="stm-icon-btn" 
              data-action="toggle" 
              data-id="${note.id}" 
              title="${note.isResolved ? 'Mark as Active' : 'Mark as Resolved'}">
              <span>${note.isResolved ? '↺ Re-open' : '✓ Resolve'}</span>
            </button>

            <!-- Edit Note -->
            <button class="stm-icon-btn" 
              data-action="edit" 
              data-id="${note.id}" 
              title="Edit Note">
              <span>✏️</span>
            </button>

            <!-- Delete Note -->
            <button class="stm-icon-btn delete" 
              data-action="delete" 
              data-id="${note.id}" 
              title="Delete Note">
              <span>✕</span>
            </button>
          </div>
        </div>
      `;
    }

    renderEmptyState() {
      return `
        <div class="stm-empty-state">
          <div class="stm-empty-icon">👂</div>
          <div class="stm-empty-title">No notes found</div>
          <div class="stm-empty-desc">
            ${this.searchQuery || this.selectedPerson !== 'all' || this.activeTab !== 'all'
              ? 'No captured notes match your current filters. Try resetting the search or person filter!'
              : 'Whenever a friend, professor, or family member mentions a task or exam tip, quickly log it in the box above!'
            }
          </div>
        </div>
      `;
    }

    renderFab() {
      if (document.getElementById('stmFloatingFab')) return;
      const fab = document.createElement('button');
      fab.id = 'stmFloatingFab';
      fab.className = 'stm-fab';
      fab.innerHTML = `<span>👂</span> <span>Somebody Told Me</span>`;
      fab.title = 'Quick Capture (Alt + S)';
      fab.onclick = () => this.toggleModal(true);
      document.body.appendChild(fab);
    }

    // ==========================================================================
    // EVENT BINDINGS & INTERACTIONS
    // ==========================================================================

    bindCardEvents() {
      // 1. Person suggestion chips (auto-fills person input)
      this.container.querySelectorAll('[data-person-pick]').forEach(btn => {
        btn.onclick = (e) => {
          const person = e.currentTarget.getAttribute('data-person-pick');
          const input = this.container.querySelector('#stm_inputPerson') || this.container.querySelector('#stm_m_inputPerson');
          if (input) {
            input.value = person;
            input.focus();
          }
          this.draftPerson = person;
        };
      });

      // 2. Date preset shortcuts
      this.container.querySelectorAll('[data-date-set]').forEach(btn => {
        btn.onclick = (e) => {
          const type = e.currentTarget.getAttribute('data-date-set');
          let dateStr = '';
          if (type === 'today') dateStr = getTodayString();
          else if (type === 'tomorrow') dateStr = getOffsetDateString(1);
          else if (type === 'friday') dateStr = getNextDayOfWeekString(5);

          const dateInput = this.container.querySelector('#stm_inputDate') || this.container.querySelector('#stm_m_inputDate');
          if (dateInput) dateInput.value = dateStr;
          this.draftReminderDate = dateStr;
        };
      });

      // 3. Quick Capture Submit button
      const submitBtn = this.container.querySelector('#stm_btnSubmitNote');
      if (submitBtn) {
        submitBtn.onclick = () => this.handleFormSubmit(false);
      }
      const modalSubmitBtn = document.querySelector('#stm_m_btnSubmitNote');
      if (modalSubmitBtn) {
        modalSubmitBtn.onclick = () => this.handleFormSubmit(true);
      }

      // 4. Clear Form Button
      const clearBtn = this.container.querySelector('#stm_btnClearForm');
      if (clearBtn) {
        clearBtn.onclick = () => this.clearDraft(false);
      }

      // 5. Keyboard shortcut (Ctrl+Enter in textarea)
      const textarea = this.container.querySelector('#stm_inputText');
      if (textarea) {
        textarea.onkeydown = (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.handleFormSubmit(false);
          }
        };
      }
      const modalTextarea = document.querySelector('#stm_m_inputText');
      if (modalTextarea) {
        modalTextarea.onkeydown = (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.handleFormSubmit(true);
          }
        };
      }

      // 6. Search Bar live typing
      const searchInput = this.container.querySelector('#stmSearchInput');
      if (searchInput) {
        searchInput.oninput = (e) => {
          this.searchQuery = e.target.value;
          this.renderNotesOnly();
        };
      }
      const searchClear = this.container.querySelector('#stmSearchClearBtn');
      if (searchClear) {
        searchClear.onclick = () => {
          this.searchQuery = '';
          this.render();
        };
      }

      // 7. Sort selector
      const sortSelect = this.container.querySelector('#stmSortSelect');
      if (sortSelect) {
        sortSelect.onchange = (e) => {
          this.sortBy = e.target.value;
          this.renderNotesOnly();
        };
      }

      // 8. Status Filter Tabs
      this.container.querySelectorAll('.stm-tab-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.activeTab = e.currentTarget.getAttribute('data-tab');
          this.render();
        };
      });

      // 9. Person Filter Chips
      this.container.querySelectorAll('.stm-person-chip').forEach(btn => {
        btn.onclick = (e) => {
          this.selectedPerson = e.currentTarget.getAttribute('data-person');
          this.render();
        };
      });

      // 10. Note Card Actions (Convert, Toggle, Edit, Delete)
      this.container.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const action = e.currentTarget.getAttribute('data-action');
          const id = e.currentTarget.getAttribute('data-id');

          if (action === 'convert') {
            this.handleConvertNote(id);
          } else if (action === 'toggle') {
            this.handleToggleNote(id);
          } else if (action === 'edit') {
            this.handleEditNote(id);
          } else if (action === 'delete') {
            this.handleDeleteNote(id);
          }
        };
      });

      // 11. Modal Close
      const closeBtn = document.querySelector('#stmModalCloseBtn');
      if (closeBtn) {
        closeBtn.onclick = () => this.toggleModal(false);
      }
      const modalOverlay = document.querySelector('#stmModalOverlay');
      if (modalOverlay) {
        modalOverlay.onclick = (e) => {
          if (e.target === modalOverlay) this.toggleModal(false);
        };
      }
    }

    renderNotesOnly() {
      const listEl = this.container.querySelector('#stmNotesList');
      if (!listEl) {
        this.render();
        return;
      }
      const filteredNotes = this.getFilteredNotes();
      listEl.innerHTML = filteredNotes.length > 0
        ? filteredNotes.map(note => this.renderNoteCard(note)).join('')
        : this.renderEmptyState();

      // Re-bind note actions
      listEl.querySelectorAll('[data-action]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const action = e.currentTarget.getAttribute('data-action');
          const id = e.currentTarget.getAttribute('data-id');
          if (action === 'convert') this.handleConvertNote(id);
          else if (action === 'toggle') this.handleToggleNote(id);
          else if (action === 'edit') this.handleEditNote(id);
          else if (action === 'delete') this.handleDeleteNote(id);
        };
      });
    }

    // ==========================================================================
    // ACTION HANDLERS
    // ==========================================================================

    handleFormSubmit(isModal = false) {
      const prefix = isModal ? 'stm_m_' : 'stm_';
      const personInput = document.getElementById(`${prefix}inputPerson`);
      const contextInput = document.getElementById(`${prefix}inputContext`);
      const textInput = document.getElementById(`${prefix}inputText`);
      const dateInput = document.getElementById(`${prefix}inputDate`);
      const priSelect = document.getElementById(`${prefix}selectPriority`);
      const catSelect = document.getElementById(`${prefix}selectCategory`);

      const text = textInput ? textInput.value.trim() : '';
      if (!text) {
        if (textInput) {
          textInput.focus();
          textInput.style.borderColor = '#ef4444';
          setTimeout(() => textInput.style.borderColor = '', 1500);
        }
        return;
      }

      const person = personInput && personInput.value.trim() ? personInput.value.trim() : 'Anonymous';
      const context = contextInput ? contextInput.value.trim() : '';
      const reminderDate = dateInput && dateInput.value ? dateInput.value : null;
      const priority = priSelect ? priSelect.value : 'medium';
      const categoryHint = catSelect ? catSelect.value : 'Daily chore';

      const newNote = ScratchpadStorage.addNote({
        person,
        context,
        text,
        reminderDate,
        reminderTag: reminderDate ? `Due ${reminderDate}` : '',
        priority,
        categoryHint
      });

      this.clearDraft(isModal);
      if (isModal) this.toggleModal(false);

      this.render();

      if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(`Saved reminder from ${person}!`, '👂');
      }

      if (typeof this.options.onAdd === 'function') {
        this.options.onAdd(newNote);
      }
    }

    clearDraft(isModal = false) {
      const prefix = isModal ? 'stm_m_' : 'stm_';
      const p = document.getElementById(`${prefix}inputPerson`);
      const c = document.getElementById(`${prefix}inputContext`);
      const t = document.getElementById(`${prefix}inputText`);
      const d = document.getElementById(`${prefix}inputDate`);
      if (p) p.value = '';
      if (c) c.value = '';
      if (t) t.value = '';
      if (d) d.value = '';

      this.draftPerson = '';
      this.draftContext = '';
      this.draftText = '';
      this.draftReminderDate = '';
    }

    handleConvertNote(noteId) {
      try {
        const result = ScratchpadTaskConverter.convert(noteId);
        this.render();
        if (typeof this.options.onConvert === 'function') {
          this.options.onConvert(result);
        }
      } catch (err) {
        console.error('Conversion failed:', err);
        alert('Could not convert note: ' + err.message);
      }
    }

    handleToggleNote(noteId) {
      ScratchpadStorage.toggleResolved(noteId);
      this.render();
    }

    handleEditNote(noteId) {
      const note = ScratchpadStorage.getById(noteId);
      if (!note) return;

      const newText = prompt('Edit note text:', note.text);
      if (newText === null) return;
      if (!newText.trim()) {
        alert('Note text cannot be empty');
        return;
      }

      const newPerson = prompt('Who told you?', note.person);
      const newContext = prompt('Where / Situation context:', note.context || '');
      const newDate = prompt('Reminder date (YYYY-MM-DD) or blank:', note.reminderDate || '');

      ScratchpadStorage.updateNote(noteId, {
        text: newText.trim(),
        person: (newPerson || note.person).trim(),
        context: (newContext !== null ? newContext : note.context).trim(),
        reminderDate: newDate ? newDate.trim() : null
      });

      this.render();
      if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast('Note updated', '✏️');
      }
    }

    handleDeleteNote(noteId) {
      const note = ScratchpadStorage.getById(noteId);
      if (!note) return;

      if (confirm(`Delete note from "${note.person}"?`)) {
        ScratchpadStorage.deleteNote(noteId);
        this.render();
        if (window.MeApp && typeof window.MeApp.showToast === 'function') {
          window.MeApp.showToast('Note deleted', '🗑️');
        }
      }
    }

    toggleModal(open = null) {
      this.isModalOpen = open !== null ? open : !this.isModalOpen;
      const overlay = document.getElementById('stmModalOverlay');
      if (overlay) {
        overlay.classList.toggle('open', this.isModalOpen);
        if (this.isModalOpen) {
          const input = document.getElementById('stm_m_inputPerson');
          if (input) input.focus();
        }
      }
    }
  }

  // ============================================================================
  // 7. EXPORTS
  // ============================================================================

  return {
    SomebodyToldMeUI,
    ScratchpadUIComponent: SomebodyToldMeUI,
    ScratchpadStorage,
    ScratchpadTaskConverter,
    SCRATCHPAD_CSS
  };
});
