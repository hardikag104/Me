/**
 * ===============================================================================
 * ME LIFE OS — TASKS & EXAMS MANAGEMENT LEAD (AGENT 4)
 * File: ui-tasks.js
 * ===============================================================================
 * 
 * Features:
 *  1. Category Segmented Controls:
 *     - All Tasks
 *     - 📝 Tests & Exams (prominent countdown badge: 'Tomorrow!', 'In 3 days', 'Due next week')
 *     - 🤝 Meetings & Syncs
 *     - ⚡ Daily Chores
 *     - 🚨 Urgent
 *  2. Task Cards:
 *     - Custom squircle checkbox with smooth SVG micro-animation & strike-through transition
 *     - Title, detailed description / syllabus box, category pill, priority tag (low, medium, high, urgent)
 *     - Due date/time display with prominent countdown badges & overdue warnings
 *     - Delete / Edit buttons
 *  3. Quick Add Task Drawer / Modal:
 *     - Bottom sheet (mobile) / centered dialog (desktop) with backdrop blur
 *     - Title, category selector, due date picker with quick chips (Today, Tomorrow, 3 Days, Next Week),
 *       time picker, priority selector, syllabus & notes textarea
 *     - Supports both Add New Task and Edit Existing Task modes
 *  4. Stats Bar:
 *     - Total tasks (active vs total)
 *     - Completed today (with visual progress indicator)
 *     - Pending tests/exams (with prominent next exam countdown)
 *  5. Persistence & Engine Integration:
 *     - Seamlessly connects with window.TaskHabitEngine if present, with direct resilient
 *       localStorage fallback.
 *     - Zero external dependencies, self-injected scoped CSS, fully accessible.
 * ===============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.TasksUIComponent = exports.TasksUIComponent;
    root.LifeTasksUI = exports.TasksUIComponent;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // =============================================================================
  // 1. CONSTANTS, CATEGORIES & CONFIGURATION
  // =============================================================================

  const STORAGE_KEY = 'me_tasks_todos';

  const CATEGORIES = {
    all: {
      id: 'all',
      label: 'All Tasks',
      icon: '📋',
      color: '#7c5cfc'
    },
    exams: {
      id: 'exams',
      label: 'Tests & Exams',
      icon: '📝',
      categoryVal: 'Test/Exam',
      color: '#8b5cf6',
      badgeColor: 'rgba(139, 92, 246, 0.18)',
      textColor: '#c4b5fd'
    },
    meetings: {
      id: 'meetings',
      label: 'Meetings & Syncs',
      icon: '🤝',
      categoryVal: 'Meeting',
      color: '#06b6d4',
      badgeColor: 'rgba(6, 182, 212, 0.18)',
      textColor: '#67e8f9'
    },
    chores: {
      id: 'chores',
      label: 'Daily Chores',
      icon: '⚡',
      categoryVal: 'Daily chore',
      color: '#10b981',
      badgeColor: 'rgba(16, 185, 129, 0.18)',
      textColor: '#6ee7b7'
    },
    urgent: {
      id: 'urgent',
      label: 'Urgent',
      icon: '🚨',
      categoryVal: 'Urgent',
      color: '#ef4444',
      badgeColor: 'rgba(239, 68, 68, 0.22)',
      textColor: '#fca5a5'
    }
  };

  const PRIORITIES = {
    low: { label: 'Low', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' },
    medium: { label: 'Medium', color: '#fcd34d', bg: 'rgba(245, 158, 11, 0.15)' },
    high: { label: 'High', color: '#fdba74', bg: 'rgba(249, 115, 22, 0.18)' },
    urgent: { label: 'Urgent', color: '#fca5a5', bg: 'rgba(239, 68, 68, 0.25)' }
  };

  // Pre-seeded starter tasks if storage is completely empty
  const DEFAULT_STARTER_TASKS = [
    {
      id: 'task_exam_1',
      title: 'Data Structures & Algorithms Mid-Term Exam',
      category: 'Test/Exam',
      description: 'Syllabus: Trees, Binary Heaps, Graph Traversals (BFS/DFS), Dynamic Programming. Venue: Hall B204.',
      completed: false,
      priority: 'high',
      dueDate: addDaysToString(getTodayString(), 3),
      dueTime: '10:00',
      locationOrLink: 'Hall B204',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_urgent_1',
      title: 'Submit Operating Systems Lab 2 Assignment',
      category: 'Urgent',
      description: 'Push Git commit and upload zip to university portal before 11:59 PM deadline.',
      completed: false,
      priority: 'urgent',
      dueDate: getTodayString(),
      dueTime: '23:59',
      locationOrLink: 'Portal / LMS',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_meeting_1',
      title: 'Project Group Sync with Prof. Verma',
      category: 'Meeting',
      description: 'Review architecture diagram, database schemas, and PWA offline storage strategy.',
      completed: false,
      priority: 'medium',
      dueDate: addDaysToString(getTodayString(), 1),
      dueTime: '15:30',
      locationOrLink: 'Cabin 302 / GMeet',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_exam_2',
      title: 'Digital Electronics Surprise Quiz',
      category: 'Test/Exam',
      description: 'Syllabus: Karnaugh Maps, Multiplexers, Synchronous Sequential Circuits.',
      completed: false,
      priority: 'high',
      dueDate: addDaysToString(getTodayString(), 5),
      dueTime: '09:00',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task_chore_1',
      title: 'Laundry & Room Organization',
      category: 'Daily chore',
      description: 'Wash hostel bedsheets and refill 5L water container.',
      completed: true,
      completedAt: new Date().toISOString(),
      priority: 'low',
      dueDate: getTodayString(),
      createdAt: new Date().toISOString()
    }
  ];

  // =============================================================================
  // 2. DATE & STRING HELPERS
  // =============================================================================

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

  function daysDifference(todayStr, targetStr) {
    if (!targetStr) return null;
    const p1 = todayStr.split('-').map(Number);
    const p2 = targetStr.split('-').map(Number);
    const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
    const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    try {
      const parts = timeStr.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1] || '00';
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  }

  function formatDateReadable(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  /**
   * Generates prominent countdown badge info matching exact specs:
   * 'Tomorrow!', 'In 3 days', 'Due next week', 'Today!', Overdue warnings.
   */
  function getCountdownInfo(dueDate, isCompleted = false) {
    if (!dueDate) return null;
    const diff = daysDifference(getTodayString(), dueDate);
    if (diff === null) return null;

    if (diff < 0) {
      const daysAgo = Math.abs(diff);
      return {
        isOverdue: !isCompleted,
        text: daysAgo === 1 ? '⚠️ Overdue (Yesterday)' : `⚠️ Overdue by ${daysAgo}d`,
        badgeClass: isCompleted ? 'countdown-settled' : 'countdown-overdue',
        urgencyLevel: 'critical'
      };
    }

    if (diff === 0) {
      return {
        isOverdue: false,
        text: '🔥 Today!',
        badgeClass: 'countdown-today',
        urgencyLevel: 'high'
      };
    }

    if (diff === 1) {
      return {
        isOverdue: false,
        text: 'Tomorrow!',
        badgeClass: 'countdown-tomorrow',
        urgencyLevel: 'high'
      };
    }

    if (diff === 2) {
      return {
        isOverdue: false,
        text: 'In 2 days',
        badgeClass: 'countdown-soon',
        urgencyLevel: 'medium'
      };
    }

    if (diff === 3) {
      return {
        isOverdue: false,
        text: 'In 3 days',
        badgeClass: 'countdown-soon',
        urgencyLevel: 'medium'
      };
    }

    if (diff >= 4 && diff <= 7) {
      return {
        isOverdue: false,
        text: 'Due next week',
        badgeClass: 'countdown-next-week',
        urgencyLevel: 'normal'
      };
    }

    return {
      isOverdue: false,
      text: `In ${diff} days`,
      badgeClass: 'countdown-later',
      urgencyLevel: 'low'
    };
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

  function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/"/g, '&quot;');
  }

  function generateId(prefix = 'task') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // =============================================================================
  // 3. STYLESHEET INJECTION (SCOPED, MINIMALIST LUXURY THEME)
  // =============================================================================

  function injectStyles() {
    if (document.getElementById('ui-tasks-styles')) return;

    const style = document.createElement('style');
    style.id = 'ui-tasks-styles';
    style.textContent = `
      /* ==========================================================================
         UI-TASKS: MINIMALIST LUXURY DESIGN SYSTEM
         ========================================================================== */
      .tasks-lead-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        color: var(--text-primary, #f3f4f8);
        width: 100%;
        margin-bottom: 24px;
        position: relative;
      }

      /* ---------------- Header & Quick Actions Strip ---------------- */
      .tasks-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        gap: 12px;
      }

      .tasks-headline {
        display: flex;
        flex-direction: column;
      }

      .tasks-headline-title {
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tasks-headline-sub {
        font-size: 0.76rem;
        color: var(--text-secondary, #9494a8);
        margin-top: 2px;
      }

      .btn-quick-add-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
        color: #ffffff;
        border: none;
        padding: 8px 16px;
        border-radius: var(--radius-sm, 10px);
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(124, 92, 252, 0.35);
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;
      }

      .btn-quick-add-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(124, 92, 252, 0.5);
        background: linear-gradient(135deg, #8e71ff 0%, #7073ff 100%);
      }

      .btn-quick-add-trigger:active {
        transform: translateY(1px);
      }

      /* ---------------- Stats Bar ---------------- */
      .tasks-stats-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 18px;
      }

      .tasks-stat-card {
        background: var(--bg-surface, #12121a);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-md, 14px);
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .tasks-stat-card:hover {
        border-color: var(--border-focus, #2f2f48);
        transform: translateY(-1px);
      }

      .tasks-stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .tasks-stat-label {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary, #9494a8);
      }

      .tasks-stat-icon {
        font-size: 0.95rem;
        opacity: 0.85;
      }

      .tasks-stat-value {
        font-size: 1.4rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1.1;
      }

      .tasks-stat-sub {
        font-size: 0.68rem;
        color: var(--text-muted, #5e5e76);
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tasks-stat-card.stat-exams {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(18, 18, 26, 0.95) 100%);
        border-color: rgba(139, 92, 246, 0.25);
      }
      .tasks-stat-card.stat-exams .tasks-stat-value {
        color: #c4b5fd;
      }

      .tasks-stat-card.stat-completed {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 18, 26, 0.95) 100%);
        border-color: rgba(16, 185, 129, 0.25);
      }
      .tasks-stat-card.stat-completed .tasks-stat-value {
        color: #10b981;
      }

      .tasks-stat-card.stat-total .tasks-stat-value {
        color: var(--text-primary, #f3f4f8);
      }

      .stat-progress-line {
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 999px;
        margin-top: 6px;
        overflow: hidden;
      }

      .stat-progress-fill {
        height: 100%;
        background: var(--mint, #10b981);
        border-radius: 999px;
        transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* ---------------- Category Segmented Controls ---------------- */
      .tasks-segment-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-surface, #12121a);
        padding: 5px;
        border-radius: var(--radius-md, 14px);
        border: 1px solid var(--border-subtle, #1f1f2e);
        margin-bottom: 16px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .tasks-segment-bar::-webkit-scrollbar {
        display: none;
      }

      .tasks-segment-btn {
        flex: 1;
        min-width: fit-content;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: var(--radius-sm, 10px);
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-secondary, #9494a8);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        white-space: nowrap;
      }

      .tasks-segment-btn:hover {
        color: var(--text-primary, #f3f4f8);
        background: var(--bg-surface-elevated, #181824);
      }

      .tasks-segment-btn.active {
        background: var(--bg-surface-elevated, #1a1a28);
        color: var(--text-primary, #f3f4f8);
        border-color: var(--accent, #7c5cfc);
        box-shadow: 0 2px 10px rgba(124, 92, 252, 0.25);
      }

      .segment-count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1px 6px;
        border-radius: 999px;
        font-size: 0.65rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.08);
        color: inherit;
        min-width: 18px;
      }

      .tasks-segment-btn.active .segment-count-badge {
        background: var(--accent-dim, rgba(124, 92, 252, 0.3));
        color: #d8b4fe;
      }

      /* ---------------- Search & Filter Strip ---------------- */
      .tasks-search-filter-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }

      .tasks-search-box {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
      }

      .tasks-search-box svg {
        position: absolute;
        left: 10px;
        width: 14px;
        height: 14px;
        color: var(--text-muted, #5e5e76);
        pointer-events: none;
      }

      .tasks-search-input {
        width: 100%;
        background: var(--bg-surface, #12121a);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-sm, 10px);
        padding: 7px 10px 7px 32px;
        color: var(--text-primary, #f3f4f8);
        font-size: 0.8rem;
        outline: none;
        transition: border-color 0.2s;
      }

      .tasks-search-input:focus {
        border-color: var(--accent, #7c5cfc);
      }

      .tasks-filter-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 10px;
        background: var(--bg-surface, #12121a);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-sm, 10px);
        color: var(--text-secondary, #9494a8);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .tasks-filter-toggle-btn:hover, .tasks-filter-toggle-btn.active {
        border-color: var(--border-focus, #2f2f48);
        color: var(--text-primary, #f3f4f8);
      }

      /* ---------------- Task Cards Container ---------------- */
      .tasks-cards-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* ---------------- Individual Task Card ---------------- */
      .task-card {
        background: var(--bg-surface, #12121a);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-md, 14px);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        border-left: 3.5px solid var(--border-subtle, #1f1f2e);
      }

      .task-card:hover {
        border-color: var(--border-focus, #2f2f48);
        transform: translateY(-1px);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      }

      /* Category left border branding */
      .task-card.cat-exam {
        border-left-color: #8b5cf6;
      }
      .task-card.cat-meeting {
        border-left-color: #06b6d4;
      }
      .task-card.cat-chore {
        border-left-color: #10b981;
      }
      .task-card.cat-urgent {
        border-left-color: #ef4444;
      }

      /* Overdue warning state */
      .task-card.is-overdue {
        border-color: rgba(239, 68, 68, 0.4);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, var(--bg-surface, #12121a) 100%);
      }

      /* Completed state */
      .task-card.is-completed {
        opacity: 0.58;
        background: rgba(18, 18, 26, 0.6);
        border-left-color: var(--border-subtle, #1f1f2e);
      }

      .task-card.is-completed:hover {
        opacity: 0.85;
      }

      /* Card Top Row */
      .task-card-main-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      /* Custom Micro-animated Checkbox */
      .task-checkbox-btn {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 2px solid var(--border-focus, #2f2f48);
        background: var(--bg-surface-elevated, #181824);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 1px;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        padding: 0;
        outline: none;
      }

      .task-checkbox-btn:hover {
        border-color: var(--accent, #7c5cfc);
        transform: scale(1.1);
        box-shadow: 0 0 10px var(--accent-glow, rgba(124, 92, 252, 0.3));
      }

      .task-checkbox-btn:active {
        transform: scale(0.92);
      }

      .task-checkbox-btn.checked {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
      }

      .task-check-svg {
        width: 15px;
        height: 15px;
        color: #ffffff;
        pointer-events: none;
      }

      .task-check-path {
        stroke-dasharray: 26;
        stroke-dashoffset: 26;
        transition: stroke-dashoffset 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .task-checkbox-btn.checked .task-check-path {
        stroke-dashoffset: 0;
      }

      /* Card Center Content */
      .task-content-col {
        flex: 1;
        min-width: 0;
      }

      .task-card-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }

      .task-card-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary, #f3f4f8);
        line-height: 1.35;
        transition: all 0.2s ease;
        word-break: break-word;
      }

      .task-card.is-completed .task-card-title {
        text-decoration: line-through;
        text-decoration-color: var(--mint, #10b981);
        text-decoration-thickness: 2px;
        color: var(--text-muted, #5e5e76);
      }

      /* Badges & Tags Row */
      .task-badges-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
      }

      .task-cat-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2.5px 8px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        white-space: nowrap;
      }
      .task-cat-pill.cat-exam {
        background: rgba(139, 92, 246, 0.16);
        color: #c4b5fd;
        border: 1px solid rgba(139, 92, 246, 0.35);
      }
      .task-cat-pill.cat-meeting {
        background: rgba(6, 182, 212, 0.16);
        color: #67e8f9;
        border: 1px solid rgba(6, 182, 212, 0.35);
      }
      .task-cat-pill.cat-chore {
        background: rgba(16, 185, 129, 0.16);
        color: #6ee7b7;
        border: 1px solid rgba(16, 185, 129, 0.35);
      }
      .task-cat-pill.cat-urgent {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.4);
      }
      .task-cat-pill.cat-general {
        background: rgba(148, 163, 184, 0.12);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.25);
      }

      .task-priority-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 0.66rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .task-priority-tag.low {
        background: rgba(148, 163, 184, 0.1);
        color: #94a3b8;
      }
      .task-priority-tag.medium {
        background: rgba(245, 158, 11, 0.14);
        color: #fcd34d;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .task-priority-tag.high {
        background: rgba(249, 115, 22, 0.16);
        color: #fdba74;
        border: 1px solid rgba(249, 115, 22, 0.35);
      }
      .task-priority-tag.urgent {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border: 1px solid #ef4444;
        animation: pulseUrgent 2.2s infinite ease-in-out;
      }

      /* Countdown Badges */
      .task-countdown-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2.5px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        white-space: nowrap;
      }

      .task-countdown-badge.countdown-overdue {
        background: rgba(239, 68, 68, 0.22);
        color: #fca5a5;
        border: 1px solid #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.35);
        animation: pulseOverdue 2s infinite ease-in-out;
      }

      .task-countdown-badge.countdown-today {
        background: rgba(245, 158, 11, 0.2);
        color: #fde68a;
        border: 1px solid rgba(245, 158, 11, 0.45);
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.25);
      }

      .task-countdown-badge.countdown-tomorrow {
        background: rgba(124, 92, 252, 0.25);
        color: #e9d5ff;
        border: 1px solid #7c5cfc;
        box-shadow: 0 0 10px rgba(124, 92, 252, 0.35);
      }

      .task-countdown-badge.countdown-soon {
        background: rgba(139, 92, 246, 0.18);
        color: #ddd6fe;
        border: 1px solid rgba(139, 92, 246, 0.4);
      }

      .task-countdown-badge.countdown-next-week {
        background: rgba(6, 182, 212, 0.16);
        color: #a5f3fc;
        border: 1px solid rgba(6, 182, 212, 0.35);
      }

      .task-countdown-badge.countdown-later {
        background: rgba(100, 116, 139, 0.14);
        color: #cbd5e1;
        border: 1px solid rgba(100, 116, 139, 0.25);
      }

      .task-countdown-badge.countdown-settled {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-muted, #5e5e76);
        border: 1px solid transparent;
      }

      /* Description / Syllabus Box */
      .task-description-box {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-sm, 8px);
        padding: 8px 10px;
        font-size: 0.77rem;
        color: var(--text-secondary, #9494a8);
        line-height: 1.45;
        margin-top: 4px;
        word-break: break-word;
      }

      .task-description-box strong {
        color: var(--text-primary, #f3f4f8);
        font-weight: 700;
      }

      /* Card Bottom Footer: Due Date & Action Buttons */
      .task-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 8px;
        margin-top: 2px;
        font-size: 0.73rem;
        color: var(--text-secondary, #9494a8);
      }

      .task-due-info {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }

      .task-actions-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .task-action-btn {
        background: transparent;
        border: 1px solid var(--border-subtle, #1f1f2e);
        color: var(--text-secondary, #9494a8);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }

      .task-action-btn:hover {
        color: var(--text-primary, #f3f4f8);
        border-color: var(--border-focus, #2f2f48);
        background: var(--bg-surface-elevated, #181824);
      }

      .task-action-btn.btn-delete:hover {
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.12);
      }

      /* ---------------- Empty State ---------------- */
      .tasks-empty-state {
        background: var(--bg-surface, #12121a);
        border: 1px dashed var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-md, 14px);
        padding: 36px 20px;
        text-align: center;
        color: var(--text-secondary, #9494a8);
      }

      .tasks-empty-icon {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      .tasks-empty-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-primary, #f3f4f8);
        margin-bottom: 4px;
      }

      .tasks-empty-sub {
        font-size: 0.78rem;
        color: var(--text-muted, #5e5e76);
        max-width: 320px;
        margin: 0 auto 14px;
      }

      /* ---------------- Quick Add / Edit Modal / Drawer ---------------- */
      .task-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: none;
        align-items: flex-end;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.25s ease;
        padding: 0;
      }

      .task-modal-overlay.open {
        display: flex;
        opacity: 1;
      }

      @media (min-width: 640px) {
        .task-modal-overlay {
          align-items: center;
          padding: 20px;
        }
      }

      .task-modal-drawer {
        background: var(--bg-surface, #12121a);
        border: 1px solid var(--border-focus, #2f2f48);
        width: 100%;
        max-width: 540px;
        border-radius: 24px 24px 0 0;
        padding: 22px 20px calc(24px + env(safe-area-inset-bottom, 0px));
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.85);
        transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 90vh;
        overflow-y: auto;
      }

      @media (min-width: 640px) {
        .task-modal-drawer {
          border-radius: 20px;
          transform: translateY(20px) scale(0.96);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.9);
          padding: 24px;
        }
      }

      .task-modal-overlay.open .task-modal-drawer {
        transform: translateY(0) scale(1);
      }

      .task-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .task-modal-title {
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .task-modal-close-btn {
        background: var(--bg-surface-elevated, #181824);
        border: 1px solid var(--border-subtle, #1f1f2e);
        color: var(--text-secondary, #9494a8);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
      }

      .task-modal-close-btn:hover {
        color: var(--text-primary, #f3f4f8);
        border-color: var(--accent, #7c5cfc);
      }

      /* Modal Form Fields */
      .task-form-group {
        margin-bottom: 14px;
      }

      .task-form-label {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-secondary, #9494a8);
        margin-bottom: 6px;
      }

      .task-form-input, .task-form-select, .task-form-textarea {
        width: 100%;
        background: var(--bg-primary, #09090d);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: var(--radius-sm, 10px);
        padding: 10px 12px;
        color: var(--text-primary, #f3f4f8);
        font-size: 0.88rem;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }

      .task-form-input:focus, .task-form-select:focus, .task-form-textarea:focus {
        border-color: var(--accent, #7c5cfc);
      }

      .task-form-textarea {
        min-height: 72px;
        resize: vertical;
        line-height: 1.45;
        font-family: inherit;
      }

      /* Category Selector Chips */
      .task-cat-selector-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
      }

      @media (min-width: 480px) {
        .task-cat-selector-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .task-cat-chip-btn {
        background: var(--bg-primary, #09090d);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: 8px;
        padding: 8px 6px;
        text-align: center;
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--text-secondary, #9494a8);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .task-cat-chip-btn:hover {
        border-color: var(--border-focus, #2f2f48);
        color: var(--text-primary, #f3f4f8);
      }

      .task-cat-chip-btn.selected {
        background: var(--accent-dim, rgba(124, 92, 252, 0.2));
        border-color: var(--accent, #7c5cfc);
        color: #ffffff;
      }

      /* Priority Selector */
      .task-pri-selector-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
      }

      .task-pri-chip-btn {
        background: var(--bg-primary, #09090d);
        border: 1px solid var(--border-subtle, #1f1f2e);
        border-radius: 8px;
        padding: 7px 4px;
        text-align: center;
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--text-secondary, #9494a8);
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s;
      }

      .task-pri-chip-btn:hover {
        color: var(--text-primary, #f3f4f8);
        border-color: var(--border-focus, #2f2f48);
      }

      .task-pri-chip-btn.selected[data-pri="low"] {
        border-color: #94a3b8;
        background: rgba(148, 163, 184, 0.2);
        color: #ffffff;
      }
      .task-pri-chip-btn.selected[data-pri="medium"] {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.2);
        color: #fde68a;
      }
      .task-pri-chip-btn.selected[data-pri="high"] {
        border-color: #f97316;
        background: rgba(249, 115, 22, 0.2);
        color: #fed7aa;
      }
      .task-pri-chip-btn.selected[data-pri="urgent"] {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.25);
        color: #fca5a5;
      }

      /* Quick Date Presets Strip */
      .quick-date-chips-row {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
        overflow-x: auto;
      }

      .quick-date-chip {
        padding: 4px 9px;
        border-radius: 6px;
        background: var(--bg-surface-elevated, #181824);
        border: 1px solid var(--border-subtle, #1f1f2e);
        color: var(--text-secondary, #9494a8);
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }

      .quick-date-chip:hover {
        border-color: var(--accent, #7c5cfc);
        color: var(--text-primary, #f3f4f8);
      }

      /* Date & Time Row */
      .task-date-time-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 8px;
      }

      /* Modal Action Buttons */
      .task-modal-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
        padding-top: 14px;
        border-top: 1px solid var(--border-subtle, #1f1f2e);
      }

      .btn-modal-cancel {
        padding: 9px 16px;
        border-radius: var(--radius-sm, 10px);
        background: transparent;
        border: 1px solid var(--border-subtle, #1f1f2e);
        color: var(--text-secondary, #9494a8);
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-modal-cancel:hover {
        border-color: var(--border-focus, #2f2f48);
        color: var(--text-primary, #f3f4f8);
      }

      .btn-modal-submit {
        padding: 9px 20px;
        border-radius: var(--radius-sm, 10px);
        background: linear-gradient(135deg, #7c5cfc 0%, #6366f1 100%);
        border: none;
        color: #ffffff;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(124, 92, 252, 0.35);
        transition: all 0.2s;
      }
      .btn-modal-submit:hover {
        background: linear-gradient(135deg, #8e71ff 0%, #7073ff 100%);
        box-shadow: 0 6px 20px rgba(124, 92, 252, 0.5);
      }

      /* Keyframe animations */
      @keyframes pulseOverdue {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.02); }
      }

      @keyframes pulseUrgent {
        0%, 100% { box-shadow: 0 0 6px rgba(239, 68, 68, 0.35); }
        50% { box-shadow: 0 0 14px rgba(239, 68, 68, 0.7); }
      }
    `;

    document.head.appendChild(style);
  }

  // =============================================================================
  // 4. STORAGE & ENGINE WRAPPER
  // =============================================================================

  class TasksDataStore {
    constructor() {
      this.init();
    }

    init() {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        return; // Connected to engine
      }

      // LocalStorage direct initialization
      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STARTER_TASKS));
        }
      } catch (e) {
        console.warn('[TasksDataStore] Storage init warning:', e);
      }
    }

    getAll() {
      let list = null;
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        list = window.TaskHabitEngine.todos.getAll();
      }

      if (!Array.isArray(list)) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          list = raw ? JSON.parse(raw) : null;
        } catch {
          list = null;
        }
      }

      if (!Array.isArray(list)) {
        list = DEFAULT_STARTER_TASKS.slice();
      }
      return list;
    }

    saveAll(tasks) {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.storage) {
        window.TaskHabitEngine.storage.set(STORAGE_KEY, tasks);
        window.TaskHabitEngine.storage.emit('todos:changed', { action: 'sync', tasks });
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.warn('[TasksDataStore] Storage save warning:', e);
      }
    }

    addTask(taskData) {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        try {
          if (!Array.isArray(window.TaskHabitEngine.todos.getAll())) {
            window.TaskHabitEngine.storage.set(STORAGE_KEY, []);
          }
          return window.TaskHabitEngine.todos.addTask(taskData);
        } catch (err) {
          console.warn('[TasksDataStore] Engine addTask fallback:', err);
        }
      }

      const tasks = this.getAll();
      const newTask = {
        id: generateId('task'),
        title: taskData.title.trim(),
        category: taskData.category || 'Daily chore',
        description: (taskData.description || '').trim(),
        completed: false,
        completedAt: null,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        dueTime: taskData.dueTime || null,
        locationOrLink: (taskData.locationOrLink || '').trim(),
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      this.saveAll(tasks);
      return newTask;
    }

    updateTask(taskId, updates) {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        try {
          if (!Array.isArray(window.TaskHabitEngine.todos.getAll())) {
            window.TaskHabitEngine.storage.set(STORAGE_KEY, []);
          }
          return window.TaskHabitEngine.todos.updateTask(taskId, updates);
        } catch (err) {
          console.warn('[TasksDataStore] Engine updateTask fallback:', err);
        }
      }

      const tasks = this.getAll();
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return null;

      const current = tasks[index];
      const updated = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      if (updates.completed !== undefined) {
        updated.completed = Boolean(updates.completed);
        updated.completedAt = updated.completed ? (current.completedAt || new Date().toISOString()) : null;
      }

      tasks[index] = updated;
      this.saveAll(tasks);
      return updated;
    }

    toggleTask(taskId) {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        try {
          return window.TaskHabitEngine.todos.toggleTask(taskId);
        } catch (err) {
          console.warn('[TasksDataStore] Engine toggleTask fallback:', err);
        }
      }

      const tasks = this.getAll();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return null;

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      task.updatedAt = new Date().toISOString();
      this.saveAll(tasks);
      return task;
    }

    deleteTask(taskId) {
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.todos) {
        try {
          return window.TaskHabitEngine.todos.deleteTask(taskId);
        } catch (err) {
          console.warn('[TasksDataStore] Engine deleteTask fallback:', err);
        }
      }

      const tasks = this.getAll();
      const filtered = tasks.filter(t => t.id !== taskId);
      this.saveAll(filtered);
      return true;
    }
  }

  // =============================================================================
  // 5. TASKS UI COMPONENT (MAIN CONTROLLER)
  // =============================================================================

  class TasksUIComponent {
    constructor(options = {}) {
      this.container = typeof options.container === 'string'
        ? document.querySelector(options.container)
        : (options.container || null);

      this.store = new TasksDataStore();
      this.activeCategory = options.defaultCategory || 'all';
      this.searchQuery = '';
      this.hideCompleted = false;
      this.editingTaskId = null;

      injectStyles();

      if (this.container) {
        this.init();
      }
    }

    mount(container) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (this.container) {
        this.init();
      }
    }

    init() {
      if (!this.container) return;
      this.render();
      this.bindGlobalEvents();
    }

    bindGlobalEvents() {
      // Listen to TaskHabitEngine pubsub changes if present
      if (typeof window !== 'undefined' && window.TaskHabitEngine && window.TaskHabitEngine.storage) {
        if (typeof window.TaskHabitEngine.storage.subscribe === 'function') {
          window.TaskHabitEngine.storage.subscribe('todos:changed', () => {
            this.refresh();
          });
        } else if (typeof window.TaskHabitEngine.storage.on === 'function') {
          window.TaskHabitEngine.storage.on('todos:changed', () => {
            this.refresh();
          });
        }
      }

      // Close modal on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
        }
      });
    }

    refresh() {
      this.render();
    }

    // Filter tasks by active category and search query
    getFilteredTasks() {
      const all = Array.isArray(this.store.getAll()) ? this.store.getAll() : [];
      const query = this.searchQuery.trim().toLowerCase();

      return all.filter(t => {
        // 1. Category Filter
        let matchesCat = true;
        const cat = (t.category || '').toLowerCase();
        const pri = (t.priority || '').toLowerCase();

        if (this.activeCategory === 'exams') {
          matchesCat = cat.includes('test') || cat.includes('exam');
        } else if (this.activeCategory === 'meetings') {
          matchesCat = cat.includes('meet') || cat.includes('sync');
        } else if (this.activeCategory === 'chores') {
          matchesCat = cat.includes('chore') || cat.includes('daily');
        } else if (this.activeCategory === 'urgent') {
          matchesCat = cat === 'urgent' || pri === 'urgent';
        }

        if (!matchesCat) return false;

        // 2. Completed visibility filter
        if (this.hideCompleted && t.completed) return false;

        // 3. Search query
        if (query) {
          const matchTitle = (t.title || '').toLowerCase().includes(query);
          const matchDesc = (t.description || '').toLowerCase().includes(query);
          const matchLoc = (t.locationOrLink || '').toLowerCase().includes(query);
          return matchTitle || matchDesc || matchLoc;
        }

        return true;
      });
    }

    // Compute stats for the dashboard stats bar
    calculateStats() {
      const all = Array.isArray(this.store.getAll()) ? this.store.getAll() : [];
      const today = getTodayString();

      let total = all.length;
      let completedToday = 0;
      let pendingExams = 0;
      let nextExamCountdown = null;
      let activeCount = 0;

      const examTasks = [];

      all.forEach(t => {
        const isDone = !!t.completed;
        const cat = (t.category || '').toLowerCase();
        const isExam = cat.includes('test') || cat.includes('exam');

        if (isDone) {
          if (t.completedAt && t.completedAt.slice(0, 10) === today) {
            completedToday++;
          }
        } else {
          activeCount++;
          if (isExam) {
            pendingExams++;
            if (t.dueDate) {
              examTasks.push(t);
            }
          }
        }
      });

      // Sort exam tasks chronologically to find next exam
      if (examTasks.length > 0) {
        examTasks.sort((a, b) => {
          const dateA = a.dueDate + (a.dueTime ? 'T' + a.dueTime : 'T00:00');
          const dateB = b.dueDate + (b.dueTime ? 'T' + b.dueTime : 'T00:00');
          return dateA.localeCompare(dateB);
        });
        const next = examTasks[0];
        const diff = daysDifference(today, next.dueDate);
        if (diff === 0) nextExamCountdown = 'Next: Today!';
        else if (diff === 1) nextExamCountdown = 'Next: Tomorrow!';
        else if (diff > 1) nextExamCountdown = `Next: in ${diff}d`;
        else nextExamCountdown = `Next: ⚠️ Overdue`;
      }

      const percent = total > 0 ? Math.round(((total - activeCount) / total) * 100) : 0;

      // Category counts for badges
      const counts = {
        all: all.length,
        exams: all.filter(t => (t.category || '').toLowerCase().includes('test') || (t.category || '').toLowerCase().includes('exam')).length,
        meetings: all.filter(t => (t.category || '').toLowerCase().includes('meet') || (t.category || '').toLowerCase().includes('sync')).length,
        chores: all.filter(t => (t.category || '').toLowerCase().includes('chore') || (t.category || '').toLowerCase().includes('daily')).length,
        urgent: all.filter(t => (t.category || '').toLowerCase() === 'urgent' || (t.priority || '').toLowerCase() === 'urgent').length
      };

      return {
        total,
        activeCount,
        completedToday,
        pendingExams,
        nextExamCountdown,
        percent,
        counts
      };
    }

    render() {
      if (!this.container) return;

      const stats = this.calculateStats();
      const filteredTasks = this.getFilteredTasks();

      // Separate active and completed for clean visual hierarchy
      const activeTasks = filteredTasks.filter(t => !t.completed);
      const completedTasks = filteredTasks.filter(t => t.completed);

      // Sort active tasks: overdue first, then by date, high priority first
      activeTasks.sort((a, b) => {
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const wa = priorityWeight[a.priority] || 2;
        const wb = priorityWeight[b.priority] || 2;

        if (a.dueDate && b.dueDate) {
          if (a.dueDate === b.dueDate) return wb - wa;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return wb - wa;
      });

      this.container.innerHTML = `
        <div class="tasks-lead-wrapper" id="tasksLeadMainRoot">
          <!-- 1. Header & Quick Add Strip -->
          <div class="tasks-header-row">
            <div class="tasks-headline">
              <div class="tasks-headline-title">
                <span>⚡</span> Tasks & Exams
              </div>
              <div class="tasks-headline-sub">Execute with spartan discipline & zero excuses</div>
            </div>
            <button class="btn-quick-add-trigger" id="btnTriggerQuickAdd" type="button">
              <span style="font-size: 1.1rem; line-height: 0.9;">+</span> New Task
            </button>
          </div>

          <!-- 2. Stats Bar -->
          <div class="tasks-stats-bar">
            <!-- Total Tasks -->
            <div class="tasks-stat-card stat-total">
              <div class="tasks-stat-top">
                <span class="tasks-stat-label">Total Tasks</span>
                <span class="tasks-stat-icon">📋</span>
              </div>
              <div class="tasks-stat-value">${stats.total}</div>
              <div class="tasks-stat-sub">${stats.activeCount} active · ${stats.percent}% done</div>
              <div class="stat-progress-line">
                <div class="stat-progress-fill" style="width: ${stats.percent}%;"></div>
              </div>
            </div>

            <!-- Completed Today -->
            <div class="tasks-stat-card stat-completed">
              <div class="tasks-stat-top">
                <span class="tasks-stat-label">Completed Today</span>
                <span class="tasks-stat-icon">✓</span>
              </div>
              <div class="tasks-stat-value">${stats.completedToday}</div>
              <div class="tasks-stat-sub">Logged today</div>
              <div class="stat-progress-line">
                <div class="stat-progress-fill" style="width: ${stats.completedToday > 0 ? 100 : 0}%;"></div>
              </div>
            </div>

            <!-- Pending Tests & Exams -->
            <div class="tasks-stat-card stat-exams">
              <div class="tasks-stat-top">
                <span class="tasks-stat-label">Tests & Exams</span>
                <span class="tasks-stat-icon">📝</span>
              </div>
              <div class="tasks-stat-value">${stats.pendingExams}</div>
              <div class="tasks-stat-sub" style="color: #c4b5fd; font-weight: 700;">
                ${stats.nextExamCountdown || (stats.pendingExams === 0 ? 'All exams cleared 🎉' : 'Review syllabus')}
              </div>
              <div class="stat-progress-line">
                <div class="stat-progress-fill" style="width: 100%; background: #8b5cf6;"></div>
              </div>
            </div>
          </div>

          <!-- 3. Category Segmented Controls -->
          <div class="tasks-segment-bar" role="tablist" aria-label="Task categories">
            <button class="tasks-segment-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all" type="button">
              <span>📋</span> All Tasks
              <span class="segment-count-badge">${stats.counts.all}</span>
            </button>
            <button class="tasks-segment-btn ${this.activeCategory === 'exams' ? 'active' : ''}" data-cat="exams" type="button">
              <span>📝</span> Tests & Exams
              <span class="segment-count-badge">${stats.counts.exams}</span>
            </button>
            <button class="tasks-segment-btn ${this.activeCategory === 'meetings' ? 'active' : ''}" data-cat="meetings" type="button">
              <span>🤝</span> Meetings & Syncs
              <span class="segment-count-badge">${stats.counts.meetings}</span>
            </button>
            <button class="tasks-segment-btn ${this.activeCategory === 'chores' ? 'active' : ''}" data-cat="chores" type="button">
              <span>⚡</span> Daily Chores
              <span class="segment-count-badge">${stats.counts.chores}</span>
            </button>
            <button class="tasks-segment-btn ${this.activeCategory === 'urgent' ? 'active' : ''}" data-cat="urgent" type="button">
              <span>🚨</span> Urgent
              <span class="segment-count-badge">${stats.counts.urgent}</span>
            </button>
          </div>

          <!-- 4. Search & Filter Bar -->
          <div class="tasks-search-filter-row">
            <div class="tasks-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" class="tasks-search-input" id="inputTasksSearch" placeholder="Search tasks, syllabus topics, venue..." value="${escapeAttr(this.searchQuery)}">
            </div>
            <button class="tasks-filter-toggle-btn ${this.hideCompleted ? 'active' : ''}" id="btnToggleHideCompleted" type="button">
              ${this.hideCompleted ? 'Show Done' : 'Hide Done'}
            </button>
          </div>

          <!-- 5. Task Cards List -->
          <div class="tasks-cards-list" id="tasksCardsContainer">
            ${this.renderCardsList(activeTasks, completedTasks)}
          </div>
        </div>

        <!-- 6. Quick Add / Edit Modal Drawer -->
        ${this.renderModalHtml()}
      `;

      this.bindDomHandlers();
    }

    renderCardsList(activeTasks, completedTasks) {
      if (activeTasks.length === 0 && completedTasks.length === 0) {
        return `
          <div class="tasks-empty-state">
            <div class="tasks-empty-icon">🎉</div>
            <div class="tasks-empty-title">All tasks completed</div>
            <div class="tasks-empty-sub">
              ${this.activeCategory === 'exams'
                ? 'No pending tests or exams in this category. You are fully on schedule!'
                : 'No actionable tasks in this view. Add a new task or test using the button above.'}
            </div>
            <button class="btn-quick-add-trigger" style="margin: 0 auto;" id="btnEmptyAddTrigger" type="button">
              + Add New Task
            </button>
          </div>
        `;
      }

      let html = '';

      // Render Active Tasks
      if (activeTasks.length > 0) {
        html += activeTasks.map(t => this.renderSingleCard(t)).join('');
      }

      // Render Completed Tasks Section if any
      if (completedTasks.length > 0 && !this.hideCompleted) {
        html += `
          <div style="display: flex; align-items: center; gap: 8px; margin: 16px 0 6px;">
            <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted, #5e5e76);">
              Completed (${completedTasks.length})
            </div>
            <div style="flex: 1; height: 1px; background: rgba(255, 255, 255, 0.06);"></div>
          </div>
        `;
        html += completedTasks.map(t => this.renderSingleCard(t)).join('');
      }

      return html;
    }

    renderSingleCard(task) {
      const isDone = !!task.completed;
      const cat = (task.category || 'General').toLowerCase();

      let catClass = 'cat-general';
      let catIcon = '📌';
      let catLabel = task.category || 'General';

      if (cat.includes('test') || cat.includes('exam')) {
        catClass = 'cat-exam';
        catIcon = '📝';
        catLabel = 'Test / Exam';
      } else if (cat.includes('meet') || cat.includes('sync')) {
        catClass = 'cat-meeting';
        catIcon = '🤝';
        catLabel = 'Meeting / Sync';
      } else if (cat.includes('chore') || cat.includes('daily')) {
        catClass = 'cat-chore';
        catIcon = '⚡';
        catLabel = 'Daily Chore';
      } else if (cat === 'urgent') {
        catClass = 'cat-urgent';
        catIcon = '🚨';
        catLabel = 'Urgent';
      }

      const pri = (task.priority || 'medium').toLowerCase();
      const priConfig = PRIORITIES[pri] || PRIORITIES.medium;

      // Countdown badge
      const countdown = getCountdownInfo(task.dueDate, isDone);
      const isOverdue = countdown ? countdown.isOverdue : false;

      // Format Due Date & Time
      let dateText = '';
      if (task.dueDate) {
        dateText = formatDateReadable(task.dueDate);
        if (task.dueTime) {
          dateText += ` · ${formatTime(task.dueTime)}`;
        }
      }

      return `
        <div class="task-card ${catClass} ${isDone ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}" data-id="${task.id}">
          <!-- Top Row: Checkbox + Title & Badges -->
          <div class="task-card-main-row">
            <button class="task-checkbox-btn ${isDone ? 'checked' : ''}" data-action="toggle" data-id="${task.id}" type="button" aria-label="Toggle task">
              <svg class="task-check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path class="task-check-path" d="M4.5 12.5L9.5 17.5L19.5 6.5" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="task-content-col">
              <div class="task-card-title-row">
                <div class="task-card-title">${escapeHtml(task.title)}</div>
              </div>

              <!-- Badges Row: Category Pill, Priority Tag, Countdown Badge -->
              <div class="task-badges-row">
                <span class="task-cat-pill ${catClass}">
                  <span>${catIcon}</span> ${escapeHtml(catLabel)}
                </span>

                <span class="task-priority-tag ${pri}">
                  ${priConfig.label}
                </span>

                ${countdown ? `
                  <span class="task-countdown-badge ${countdown.badgeClass}">
                    ${countdown.text}
                  </span>
                ` : ''}

                ${task.locationOrLink ? `
                  <span style="font-size: 0.68rem; color: var(--text-secondary); background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">
                    📍 ${escapeHtml(task.locationOrLink)}
                  </span>
                ` : ''}
              </div>

              <!-- Detailed Syllabus / Description Box -->
              ${task.description && task.description.trim() ? `
                <div class="task-description-box">
                  <strong>${catClass === 'cat-exam' ? '📖 Syllabus:' : '📝 Notes:'}</strong>
                  ${escapeHtml(task.description)}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Bottom Footer: Due Date Display & Actions -->
          <div class="task-card-footer">
            <div class="task-due-info">
              ${dateText ? `
                <span>⏰ Due ${dateText}</span>
              ` : `
                <span style="color: var(--text-muted);">No due date set</span>
              `}
            </div>

            <div class="task-actions-group">
              <button class="task-action-btn" data-action="edit" data-id="${task.id}" type="button">
                ✏️ Edit
              </button>
              <button class="task-action-btn btn-delete" data-action="delete" data-id="${task.id}" type="button">
                ✕ Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderModalHtml() {
      return `
        <div class="task-modal-overlay" id="taskModalOverlay" role="dialog" aria-modal="true" aria-labelledby="modalTaskTitle">
          <div class="task-modal-drawer">
            <div class="task-modal-header">
              <div class="task-modal-title" id="modalTaskTitle">
                <span>⚡</span> <span id="modalHeaderLabel">New Task / Exam</span>
              </div>
              <button class="task-modal-close-btn" id="btnCloseTaskModal" type="button" aria-label="Close modal">✕</button>
            </div>

            <form id="taskModalForm" onsubmit="return false;">
              <input type="hidden" id="taskEditId" value="">

              <!-- 1. Task Title -->
              <div class="task-form-group">
                <label class="task-form-label" for="taskModalInputTitle">Task / Exam Title *</label>
                <input type="text" class="task-form-input" id="taskModalInputTitle" placeholder="e.g. Discrete Mathematics Final Exam, OS Lab 2..." required autocomplete="off">
              </div>

              <!-- 2. Category Selector -->
              <div class="task-form-group">
                <label class="task-form-label">Category</label>
                <div class="task-cat-selector-grid" id="modalCatSelector">
                  <button type="button" class="task-cat-chip-btn selected" data-cat="Test/Exam">
                    <span style="font-size: 1.1rem;">📝</span>
                    <span>Tests & Exams</span>
                  </button>
                  <button type="button" class="task-cat-chip-btn" data-cat="Meeting">
                    <span style="font-size: 1.1rem;">🤝</span>
                    <span>Meeting / Sync</span>
                  </button>
                  <button type="button" class="task-cat-chip-btn" data-cat="Daily chore">
                    <span style="font-size: 1.1rem;">⚡</span>
                    <span>Daily Chore</span>
                  </button>
                  <button type="button" class="task-cat-chip-btn" data-cat="Urgent">
                    <span style="font-size: 1.1rem;">🚨</span>
                    <span>Urgent Task</span>
                  </button>
                </div>
                <input type="hidden" id="taskModalInputCategory" value="Test/Exam">
              </div>

              <!-- 3. Due Date & Quick Presets -->
              <div class="task-form-group">
                <label class="task-form-label">Due Date & Time</label>
                
                <div class="quick-date-chips-row">
                  <button type="button" class="quick-date-chip" data-days="0">Today</button>
                  <button type="button" class="quick-date-chip" data-days="1">Tomorrow</button>
                  <button type="button" class="quick-date-chip" data-days="3">In 3 Days</button>
                  <button type="button" class="quick-date-chip" data-days="7">Next Week</button>
                  <button type="button" class="quick-date-chip" data-days="clear">Clear Date</button>
                </div>

                <div class="task-date-time-grid">
                  <input type="date" class="task-form-input" id="taskModalInputDueDate">
                  <input type="time" class="task-form-input" id="taskModalInputDueTime">
                </div>
              </div>

              <!-- 4. Priority Selector -->
              <div class="task-form-group">
                <label class="task-form-label">Priority</label>
                <div class="task-pri-selector-grid" id="modalPriSelector">
                  <button type="button" class="task-pri-chip-btn" data-pri="low">Low</button>
                  <button type="button" class="task-pri-chip-btn" data-pri="medium">Medium</button>
                  <button type="button" class="task-pri-chip-btn selected" data-pri="high">High</button>
                  <button type="button" class="task-pri-chip-btn" data-pri="urgent">Urgent</button>
                </div>
                <input type="hidden" id="taskModalInputPriority" value="high">
              </div>

              <!-- 5. Description / Syllabus / Location Notes -->
              <div class="task-form-group">
                <label class="task-form-label" for="taskModalInputNotes">Description / Syllabus / Venue</label>
                <textarea class="task-form-textarea" id="taskModalInputNotes" placeholder="Syllabus topics, chapter numbers, meeting link, room number, or special instructions..."></textarea>
              </div>

              <!-- 6. Modal Action Buttons -->
              <div class="task-modal-actions">
                <button type="button" class="btn-modal-cancel" id="btnCancelTaskModal">Cancel</button>
                <button type="submit" class="btn-modal-submit" id="btnSubmitTaskModal">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    bindDomHandlers() {
      // 1. Quick Add Trigger Buttons
      const triggerBtn = this.container.querySelector('#btnTriggerQuickAdd');
      const emptyAddBtn = this.container.querySelector('#btnEmptyAddTrigger');

      triggerBtn?.addEventListener('click', () => this.openModal(null));
      emptyAddBtn?.addEventListener('click', () => this.openModal(null));

      // 2. Segmented Category Controls
      const segmentBtns = this.container.querySelectorAll('.tasks-segment-btn');
      segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-cat');
          this.activeCategory = cat;
          this.render();
        });
      });

      // 3. Search Box Input
      const searchInput = this.container.querySelector('#inputTasksSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value;
          const container = this.container.querySelector('#tasksCardsContainer');
          if (container) {
            const active = this.getFilteredTasks().filter(t => !t.completed);
            const done = this.getFilteredTasks().filter(t => t.completed);
            container.innerHTML = this.renderCardsList(active, done);
            this.bindCardActions();
          }
        });
      }

      // 4. Hide/Show Completed Toggle
      const hideCompletedBtn = this.container.querySelector('#btnToggleHideCompleted');
      hideCompletedBtn?.addEventListener('click', () => {
        this.hideCompleted = !this.hideCompleted;
        this.render();
      });

      // 5. Card Level Actions (Toggle checkbox, Edit, Delete)
      this.bindCardActions();

      // 6. Modal Form Handlers
      this.bindModalHandlers();
    }

    bindCardActions() {
      // Checkbox click (micro-animated toggle)
      this.container.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const taskId = btn.getAttribute('data-id');
          this.toggleTask(taskId, btn);
        };
      });

      // Edit button click
      this.container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const taskId = btn.getAttribute('data-id');
          const task = this.store.getAll().find(t => t.id === taskId);
          if (task) {
            this.openModal(task);
          }
        };
      });

      // Delete button click
      this.container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const taskId = btn.getAttribute('data-id');
          this.deleteTask(taskId);
        };
      });
    }

    bindModalHandlers() {
      const overlay = this.container.querySelector('#taskModalOverlay');
      const closeBtn = this.container.querySelector('#btnCloseTaskModal');
      const cancelBtn = this.container.querySelector('#btnCancelTaskModal');
      const form = this.container.querySelector('#taskModalForm');

      // Dismiss handlers
      closeBtn?.addEventListener('click', () => this.closeModal());
      cancelBtn?.addEventListener('click', () => this.closeModal());
      overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });

      // Category chip selection
      const catChips = this.container.querySelectorAll('#modalCatSelector .task-cat-chip-btn');
      const catHiddenInput = this.container.querySelector('#taskModalInputCategory');
      catChips.forEach(chip => {
        chip.onclick = () => {
          catChips.forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          if (catHiddenInput) catHiddenInput.value = chip.getAttribute('data-cat');
        };
      });

      // Priority chip selection
      const priChips = this.container.querySelectorAll('#modalPriSelector .task-pri-chip-btn');
      const priHiddenInput = this.container.querySelector('#taskModalInputPriority');
      priChips.forEach(chip => {
        chip.onclick = () => {
          priChips.forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          if (priHiddenInput) priHiddenInput.value = chip.getAttribute('data-pri');
        };
      });

      // Quick Date chips (Today, Tomorrow, 3 Days, Next Week)
      const dateChips = this.container.querySelectorAll('.quick-date-chip');
      const dateInput = this.container.querySelector('#taskModalInputDueDate');
      dateChips.forEach(chip => {
        chip.onclick = () => {
          const days = chip.getAttribute('data-days');
          if (days === 'clear') {
            if (dateInput) dateInput.value = '';
          } else {
            const num = parseInt(days, 10);
            if (dateInput) dateInput.value = addDaysToString(getTodayString(), num);
          }
        };
      });

      // Form submit handler
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromModal();
      });
    }

    openModal(taskToEdit = null) {
      const overlay = this.container.querySelector('#taskModalOverlay');
      const headerLabel = this.container.querySelector('#modalHeaderLabel');
      const editIdInput = this.container.querySelector('#taskEditId');
      const titleInput = this.container.querySelector('#taskModalInputTitle');
      const catHiddenInput = this.container.querySelector('#taskModalInputCategory');
      const dateInput = this.container.querySelector('#taskModalInputDueDate');
      const timeInput = this.container.querySelector('#taskModalInputDueTime');
      const priHiddenInput = this.container.querySelector('#taskModalInputPriority');
      const notesInput = this.container.querySelector('#taskModalInputNotes');
      const submitBtn = this.container.querySelector('#btnSubmitTaskModal');

      if (!overlay) return;

      if (taskToEdit) {
        // Edit Mode
        this.editingTaskId = taskToEdit.id;
        if (headerLabel) headerLabel.textContent = 'Edit Task / Exam';
        if (submitBtn) submitBtn.textContent = 'Update Task';
        if (editIdInput) editIdInput.value = taskToEdit.id;
        if (titleInput) titleInput.value = taskToEdit.title || '';
        if (dateInput) dateInput.value = taskToEdit.dueDate || '';
        if (timeInput) timeInput.value = taskToEdit.dueTime || '';
        if (notesInput) notesInput.value = taskToEdit.description || '';

        // Category Selection
        const targetCat = taskToEdit.category || 'Daily chore';
        if (catHiddenInput) catHiddenInput.value = targetCat;
        this.container.querySelectorAll('#modalCatSelector .task-cat-chip-btn').forEach(btn => {
          btn.classList.toggle('selected', btn.getAttribute('data-cat') === targetCat);
        });

        // Priority Selection
        const targetPri = taskToEdit.priority || 'medium';
        if (priHiddenInput) priHiddenInput.value = targetPri;
        this.container.querySelectorAll('#modalPriSelector .task-pri-chip-btn').forEach(btn => {
          btn.classList.toggle('selected', btn.getAttribute('data-pri') === targetPri);
        });
      } else {
        // Create Mode
        this.editingTaskId = null;
        if (headerLabel) headerLabel.textContent = 'New Task / Exam';
        if (submitBtn) submitBtn.textContent = 'Save Task';
        if (editIdInput) editIdInput.value = '';
        if (titleInput) titleInput.value = '';
        if (dateInput) dateInput.value = this.activeCategory === 'chores' ? getTodayString() : addDaysToString(getTodayString(), 1);
        if (timeInput) timeInput.value = '10:00';
        if (notesInput) notesInput.value = '';

        // Default category matching currently active tab
        let defaultCat = 'Test/Exam';
        if (this.activeCategory === 'meetings') defaultCat = 'Meeting';
        else if (this.activeCategory === 'chores') defaultCat = 'Daily chore';
        else if (this.activeCategory === 'urgent') defaultCat = 'Urgent';

        if (catHiddenInput) catHiddenInput.value = defaultCat;
        this.container.querySelectorAll('#modalCatSelector .task-cat-chip-btn').forEach(btn => {
          btn.classList.toggle('selected', btn.getAttribute('data-cat') === defaultCat);
        });

        // Default priority
        const defaultPri = defaultCat === 'Urgent' ? 'urgent' : (defaultCat === 'Test/Exam' ? 'high' : 'medium');
        if (priHiddenInput) priHiddenInput.value = defaultPri;
        this.container.querySelectorAll('#modalPriSelector .task-pri-chip-btn').forEach(btn => {
          btn.classList.toggle('selected', btn.getAttribute('data-pri') === defaultPri);
        });
      }

      overlay.classList.add('open');
      setTimeout(() => titleInput?.focus(), 150);
    }

    closeModal() {
      const overlay = this.container.querySelector('#taskModalOverlay');
      if (overlay) {
        overlay.classList.remove('open');
      }
      this.editingTaskId = null;
    }

    saveTaskFromModal() {
      const titleInput = this.container.querySelector('#taskModalInputTitle');
      const catHiddenInput = this.container.querySelector('#taskModalInputCategory');
      const dateInput = this.container.querySelector('#taskModalInputDueDate');
      const timeInput = this.container.querySelector('#taskModalInputDueTime');
      const priHiddenInput = this.container.querySelector('#taskModalInputPriority');
      const notesInput = this.container.querySelector('#taskModalInputNotes');

      const title = titleInput?.value.trim();
      if (!title) {
        titleInput?.focus();
        return;
      }

      const category = catHiddenInput ? catHiddenInput.value : 'Test/Exam';
      const dueDate = dateInput?.value || null;
      const dueTime = timeInput?.value || null;
      const priority = priHiddenInput ? priHiddenInput.value : 'medium';
      const description = notesInput?.value.trim() || '';

      if (this.editingTaskId) {
        // Update existing task
        this.store.updateTask(this.editingTaskId, {
          title,
          category,
          dueDate,
          dueTime,
          priority,
          description
        });
        this.showToast('Task updated successfully!');
      } else {
        // Create new task
        this.store.addTask({
          title,
          category,
          dueDate,
          dueTime,
          priority,
          description
        });
        this.showToast('Task scheduled! 🎯');
      }

      this.closeModal();
      this.render();
    }

    toggleTask(taskId, buttonElement) {
      if (!taskId) return;

      // Micro-animation visual trigger immediately on button
      if (buttonElement) {
        const isNowChecked = !buttonElement.classList.contains('checked');
        buttonElement.classList.toggle('checked', isNowChecked);

        const card = buttonElement.closest('.task-card');
        if (card) {
          card.classList.toggle('is-completed', isNowChecked);
        }
      }

      // Persist to store
      this.store.toggleTask(taskId);

      // Re-render shortly after micro-animation finishes
      setTimeout(() => {
        this.render();
      }, 260);
    }

    deleteTask(taskId) {
      if (!taskId) return;
      const task = this.store.getAll().find(t => t.id === taskId);
      const title = task ? task.title : 'Task';

      if (confirm(`Delete "${title}"?`)) {
        this.store.deleteTask(taskId);
        this.showToast('Task removed');
        this.render();
      }
    }

    showToast(message, icon = '✓') {
      const globalToast = document.getElementById('globalToast');
      const globalToastMsg = document.getElementById('globalToastMsg');
      const globalToastIcon = document.getElementById('globalToastIcon');

      if (globalToast && globalToastMsg) {
        globalToastMsg.textContent = message;
        if (globalToastIcon) globalToastIcon.textContent = icon;
        globalToast.classList.add('show');
        setTimeout(() => globalToast.classList.remove('show'), 2800);
        return;
      }

      // Fallback in-page micro toast
      let toastEl = document.getElementById('tasksMicroToast');
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'tasksMicroToast';
        toastEl.style.cssText = `
          position: fixed;
          bottom: calc(var(--nav-height, 64px) + 24px);
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: rgba(18, 18, 26, 0.95);
          border: 1px solid var(--accent, #7c5cfc);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
          opacity: 0;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10000;
          pointer-events: none;
        `;
        document.body.appendChild(toastEl);
      }

      toastEl.textContent = `${icon} ${message}`;
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateX(-50%) translateY(0)';

      setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(-50%) translateY(20px)';
      }, 2500);
    }
  }

  // =============================================================================
  // 6. EXPORTS & GLOBAL WINDOW ATTACHMENT
  // =============================================================================

  if (typeof window !== 'undefined') {
    window.TasksUIComponent = TasksUIComponent;
    window.LifeTasksUI = TasksUIComponent;
  }

  return {
    TasksUIComponent,
    LifeTasksUI: TasksUIComponent,
    CATEGORIES,
    PRIORITIES,
    getCountdownInfo
  };
});
