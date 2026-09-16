/**
 * ===============================================================================
 * ME LIFE OS — BITS PILANI TIMETABLE & ATTENDANCE UI ENGINE (AGENT 3 LEAD)
 * ===============================================================================
 * File: ui-timetable.js
 * 
 * Gorgeous, clean, ultra-usable Timetable & Attendance tab component:
 * 1. Exact BITS Pilani Courses & Schedule:
 *    - Mon: ME F314 Tut (8am FD I 1227), ME F316 Lec (9am LTC 5106), ME F317 Lec (10am FD I 1201),
 *           BIO F421 Lec (2pm NAB 6158), BITS F462 Lec (3pm FD I 1231), ME F340 Lec (4pm FD I 1202)
 *    - Tue: ME F316 Tut (8am FD I 1223), ME F315 Lec (11am FD I 1201), ME F314 Lec (12pm LTC 5101),
 *           ME F315 Lab (2-3:50pm Workshop 7101), ME F317 Tut (4pm FD I 1202)
 *    - Wed: ME F315 Tut (8am FD I 1201), ME F316 Lec (9am LTC 5106), ME F317 Lec (10am FD I 1201),
 *           BIO F421 Lec (2pm NAB 6158), BITS F462 Lec (3pm FD I 1231), ME F340 Lec (4pm FD I 1202)
 *    - Thu: ME F315 Lec (11am FD I 1201), ME F314 Lec (12pm LTC 5101), BITS F468 Lec (6-7:50pm LTC 5103)
 *    - Fri: ME F314 Lec (12pm LTC 5101), BIO F421 Lec (2pm NAB 6158), BITS F462 Lec (3pm FD I 1231),
 *           ME F340 Lec (4pm FD I 1202)
 *    - Sat & Sun: Free (celebration badge)
 * 2. UI Features:
 *    - Day pill selector (Mon, Tue, Wed, Thu, Fri, Sat, Sun), default to today.
 *    - Class cards with room number, course code, full name, time badge, type badge.
 *    - Ongoing class live pulse banner ('Happening Now') with remaining time progress.
 *    - Attendance buttons: Present ✅, Absent ❌, Cancelled 🚫 with instant state feedback.
 *    - Overall Subject Attendance Analytics card with <75% warning, safe-to-bunk count,
 *      and must-attend recovery count (+ expandable 8-subject breakdown drawer).
 *    - Expandable Class Notes textarea under each card to log formulas, homework, exam hints.
 *    - Free day celebration badge for weekends.
 *    - UMD / Browser Global wrapper (window.BITS_TIMETABLE, window.TimetableUIComponent).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
    root.TimetableUIComponent = exports.TimetableUIComponent;
    root.TimetableUI = exports.TimetableUIComponent;
    root.BITS_TIMETABLE = exports.BITS_TIMETABLE;
    root.TimetableEngine = exports.TimetableEngine;
    root.TimetableStorage = exports.TimetableStorage;
    root.COURSES = exports.COURSES;
    root.WEEKLY_SCHEDULE = exports.WEEKLY_SCHEDULE;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ===============================================================================
  // 1. DATA STRUCTURES: EXACT BITS PILANI COURSES
  // ===============================================================================

  const COURSES = {
    me_f314: {
      id: 'me_f314',
      code: 'ME F314',
      name: 'Design of Machine Elements',
      shortName: 'Machine Elements',
      icon: '⚙️',
      color: '#6366f1', // Indigo
      badgeBg: 'rgba(99, 102, 241, 0.15)',
      borderGlow: 'rgba(99, 102, 241, 0.4)',
      textColor: '#c7d2fe'
    },
    me_f315: {
      id: 'me_f315',
      code: 'ME F315',
      name: 'Advanced Manufacturing Processes',
      shortName: 'Adv Mfg',
      icon: '🔬',
      color: '#3b82f6', // Blue
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      borderGlow: 'rgba(59, 130, 246, 0.4)',
      textColor: '#bfdbfe'
    },
    me_f316: {
      id: 'me_f316',
      code: 'ME F316',
      name: 'Mechanics of Machinery',
      shortName: 'Mechanics of Mach',
      icon: '🏭',
      color: '#ec4899', // Pink
      badgeBg: 'rgba(236, 72, 153, 0.15)',
      borderGlow: 'rgba(236, 72, 153, 0.4)',
      textColor: '#fbcfe8'
    },
    me_f317: {
      id: 'me_f317',
      code: 'ME F317',
      name: 'Engines and Motors',
      shortName: 'Engines & Motors',
      icon: '🚗',
      color: '#f97316', // Orange
      badgeBg: 'rgba(249, 115, 22, 0.15)',
      borderGlow: 'rgba(249, 115, 22, 0.4)',
      textColor: '#fed7aa'
    },
    bio_f421: {
      id: 'bio_f421',
      code: 'BIO F421',
      name: 'Enzymology',
      shortName: 'Enzymology',
      icon: '🧬',
      color: '#10b981', // Emerald
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
      textColor: '#a7f3d0'
    },
    bits_f462: {
      id: 'bits_f462',
      code: 'BITS F462',
      name: 'Renewable Energy',
      shortName: 'Renewable Energy',
      icon: '🌱',
      color: '#06b6d4', // Cyan
      badgeBg: 'rgba(6, 182, 212, 0.15)',
      borderGlow: 'rgba(6, 182, 212, 0.4)',
      textColor: '#a5f3fc'
    },
    me_f340: {
      id: 'me_f340',
      code: 'ME F340',
      name: 'Intro to Sport Engineering',
      shortName: 'Sport Eng',
      icon: '⚽',
      color: '#8b5cf6', // Purple
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      borderGlow: 'rgba(139, 92, 246, 0.4)',
      textColor: '#ddd6fe'
    },
    bits_f468: {
      id: 'bits_f468',
      code: 'BITS F468',
      name: 'New Venture Creation',
      shortName: 'New Venture',
      icon: '🚀',
      color: '#eab308', // Amber
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      borderGlow: 'rgba(234, 179, 8, 0.4)',
      textColor: '#fef08a'
    }
  };

  // Backwards compatibility aliases for previous course keys
  COURSES.machine_elements = COURSES.me_f314;
  COURSES.mfg_mgmt = COURSES.me_f316;
  COURSES.engines_motors = COURSES.me_f317;
  COURSES.enzymology = COURSES.bio_f421;
  COURSES.renewable_energy = COURSES.bits_f462;
  COURSES.sports_eng = COURSES.me_f340;
  COURSES.adv_mfg = COURSES.me_f315;
  COURSES.new_venture = COURSES.bits_f468;

  // ===============================================================================
  // 2. DATA STRUCTURES: EXACT WEEKLY SCHEDULE (1 = Mon, 2 = Tue, ..., 0 = Sun)
  // ===============================================================================

  const WEEKLY_SCHEDULE = {
    // Monday: 6 classes
    1: [
      { id: 'mon_0800_me314_tut', courseId: 'me_f314', type: 'Tutorial', room: 'FD I 1227', startTime: '08:00', endTime: '08:50', hours: 1 },
      { id: 'mon_0900_me316_lec', courseId: 'me_f316', type: 'Lecture', room: 'LTC 5106', startTime: '09:00', endTime: '09:50', hours: 1 },
      { id: 'mon_1000_me317_lec', courseId: 'me_f317', type: 'Lecture', room: 'FD I 1201', startTime: '10:00', endTime: '10:50', hours: 1 },
      { id: 'mon_1400_bio421_lec', courseId: 'bio_f421', type: 'Lecture', room: 'NAB 6158', startTime: '14:00', endTime: '14:50', hours: 1 },
      { id: 'mon_1500_bits462_lec', courseId: 'bits_f462', type: 'Lecture', room: 'FD I 1231', startTime: '15:00', endTime: '15:50', hours: 1 },
      { id: 'mon_1600_me340_lec', courseId: 'me_f340', type: 'Lecture', room: 'FD I 1202', startTime: '16:00', endTime: '16:50', hours: 1 }
    ],

    // Tuesday: 5 classes (including 2hr Lab)
    2: [
      { id: 'tue_0800_me316_tut', courseId: 'me_f316', type: 'Tutorial', room: 'FD I 1223', startTime: '08:00', endTime: '08:50', hours: 1 },
      { id: 'tue_1100_me315_lec', courseId: 'me_f315', type: 'Lecture', room: 'FD I 1201', startTime: '11:00', endTime: '11:50', hours: 1 },
      { id: 'tue_1200_me314_lec', courseId: 'me_f314', type: 'Lecture', room: 'LTC 5101', startTime: '12:00', endTime: '12:50', hours: 1 },
      { id: 'tue_1400_me315_lab', courseId: 'me_f315', type: 'Practical / Lab', room: 'Workshop 7101', startTime: '14:00', endTime: '15:50', hours: 2 },
      { id: 'tue_1600_me317_tut', courseId: 'me_f317', type: 'Tutorial', room: 'FD I 1202', startTime: '16:00', endTime: '16:50', hours: 1 }
    ],

    // Wednesday: 6 classes
    3: [
      { id: 'wed_0800_me315_tut', courseId: 'me_f315', type: 'Tutorial', room: 'FD I 1201', startTime: '08:00', endTime: '08:50', hours: 1 },
      { id: 'wed_0900_me316_lec', courseId: 'me_f316', type: 'Lecture', room: 'LTC 5106', startTime: '09:00', endTime: '09:50', hours: 1 },
      { id: 'wed_1000_me317_lec', courseId: 'me_f317', type: 'Lecture', room: 'FD I 1201', startTime: '10:00', endTime: '10:50', hours: 1 },
      { id: 'wed_1400_bio421_lec', courseId: 'bio_f421', type: 'Lecture', room: 'NAB 6158', startTime: '14:00', endTime: '14:50', hours: 1 },
      { id: 'wed_1500_bits462_lec', courseId: 'bits_f462', type: 'Lecture', room: 'FD I 1231', startTime: '15:00', endTime: '15:50', hours: 1 },
      { id: 'wed_1600_me340_lec', courseId: 'me_f340', type: 'Lecture', room: 'FD I 1202', startTime: '16:00', endTime: '16:50', hours: 1 }
    ],

    // Thursday: 3 classes (including 2hr evening class)
    4: [
      { id: 'thu_1100_me315_lec', courseId: 'me_f315', type: 'Lecture', room: 'FD I 1201', startTime: '11:00', endTime: '11:50', hours: 1 },
      { id: 'thu_1200_me314_lec', courseId: 'me_f314', type: 'Lecture', room: 'LTC 5101', startTime: '12:00', endTime: '12:50', hours: 1 },
      { id: 'thu_1800_bits468_lec', courseId: 'bits_f468', type: 'Lecture', room: 'LTC 5103', startTime: '18:00', endTime: '19:50', hours: 2 }
    ],

    // Friday: 4 classes
    5: [
      { id: 'fri_1200_me314_lec', courseId: 'me_f314', type: 'Lecture', room: 'LTC 5101', startTime: '12:00', endTime: '12:50', hours: 1 },
      { id: 'fri_1400_bio421_lec', courseId: 'bio_f421', type: 'Lecture', room: 'NAB 6158', startTime: '14:00', endTime: '14:50', hours: 1 },
      { id: 'fri_1500_bits462_lec', courseId: 'bits_f462', type: 'Lecture', room: 'FD I 1231', startTime: '15:00', endTime: '15:50', hours: 1 },
      { id: 'fri_1600_me340_lec', courseId: 'me_f340', type: 'Lecture', room: 'FD I 1202', startTime: '16:00', endTime: '16:50', hours: 1 }
    ],

    // Saturday & Sunday: Free (Celebration)
    6: [],
    0: []
  };

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const BITS_MINIMUM_ATTENDANCE = 75.0;

  // Legacy Course ID Migration Mapping
  const LEGACY_COURSE_MAP = {
    'machine_elements': 'me_f314',
    'mfg_mgmt': 'me_f316',
    'engines_motors': 'me_f317',
    'enzymology': 'bio_f421',
    'renewable_energy': 'bits_f462',
    'sports_eng': 'me_f340',
    'adv_mfg': 'me_f315',
    'new_venture': 'bits_f468'
  };

  // ===============================================================================
  // 3. PERSISTENCE LAYER
  // ===============================================================================

  const STORAGE_KEYS = {
    ATTENDANCE: 'me_timetable_attendance',
    NOTES: 'me_timetable_notes',
    BASELINE: 'me_timetable_baseline'
  };

  class TimetableStorage {
    static get(key, fallback = {}) {
      if (typeof localStorage === 'undefined') return fallback;
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.warn(`[TimetableStorage] Error reading ${key}:`, e);
        return fallback;
      }
    }

    static set(key, value) {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`[TimetableStorage] Error saving ${key}:`, e);
      }
    }

    static remove(key) {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[TimetableStorage] Error removing ${key}:`, e);
      }
    }
  }

  // ===============================================================================
  // 4. CORE ENGINE & BITS PILANI ACADEMIC ATTENDANCE ALGORITHM
  // ===============================================================================

  class TimetableEngine {
    static parseDateContext(input = new Date()) {
      let target = new Date();

      if (input instanceof Date) {
        target = new Date(input.getTime());
      } else if (typeof input === 'number') {
        const currentDay = target.getDay();
        const diff = (input - currentDay);
        target.setDate(target.getDate() + diff);
      } else if (typeof input === 'string') {
        const str = input.trim().toLowerCase();
        if (str === 'today') {
          // already today
        } else if (str === 'tomorrow') {
          target.setDate(target.getDate() + 1);
        } else if (str === 'yesterday') {
          target.setDate(target.getDate() - 1);
        } else {
          const foundDay = DAY_NAMES.findIndex(d => d.toLowerCase() === str) !== -1
            ? DAY_NAMES.findIndex(d => d.toLowerCase() === str)
            : DAY_ABBR.findIndex(d => d.toLowerCase() === str);
          
          if (foundDay !== -1) {
            const currentDay = target.getDay();
            target.setDate(target.getDate() + (foundDay - currentDay));
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            const [y, m, d] = input.split('-').map(Number);
            target = new Date(y, m - 1, d);
          } else {
            const parsed = new Date(input);
            if (!isNaN(parsed.getTime())) target = parsed;
          }
        }
      }

      const dayIndex = target.getDay();
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const d = String(target.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      return {
        dateObj: target,
        dateStr,
        dayIndex,
        dayName: DAY_NAMES[dayIndex],
        dayAbbr: DAY_ABBR[dayIndex],
        isWeekend: dayIndex === 0 || dayIndex === 6
      };
    }

    static getDailySchedule(dateRef = new Date()) {
      const { dateStr, dayIndex, dayName, dayAbbr, isWeekend, dateObj } = this.parseDateContext(dateRef);
      const slots = WEEKLY_SCHEDULE[dayIndex] || [];
      const attendanceRecords = TimetableStorage.get(STORAGE_KEYS.ATTENDANCE, {});
      const notesRecords = TimetableStorage.get(STORAGE_KEYS.NOTES, {});

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const enrichedClasses = slots.map(slot => {
        const course = COURSES[slot.courseId] || {
          id: slot.courseId,
          code: 'COURSE',
          name: 'General Subject',
          shortName: 'Subject',
          icon: '📚',
          color: '#6366f1',
          badgeBg: 'rgba(99, 102, 241, 0.15)',
          borderGlow: 'rgba(99, 102, 241, 0.4)',
          textColor: '#c7d2fe'
        };

        const recordKey = `${dateStr}_${slot.id}`;
        let attRecord = attendanceRecords[recordKey] || null;
        let noteRecord = notesRecords[recordKey] || null;

        if (!attRecord) {
          const altKey = Object.keys(attendanceRecords).find(k => k.startsWith(dateStr) && (k.endsWith(slot.id) || k.includes(slot.courseId)));
          if (altKey) attRecord = attendanceRecords[altKey];
        }

        const classNote = noteRecord ? noteRecord.text : '';

        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);
        const slotStartMins = startH * 60 + startM;
        const slotEndMins = endH * 60 + endM;

        let isNow = false;
        let isPast = false;
        let isUpcoming = false;
        let minutesRemaining = 0;
        let progressPercent = 0;

        if (isToday) {
          if (nowMinutes >= slotStartMins && nowMinutes < slotEndMins) {
            isNow = true;
            minutesRemaining = slotEndMins - nowMinutes;
            const duration = slotEndMins - slotStartMins;
            progressPercent = Math.min(100, Math.max(0, Math.round(((nowMinutes - slotStartMins) / duration) * 100)));
          } else if (nowMinutes >= slotEndMins) {
            isPast = true;
          } else {
            isUpcoming = true;
          }
        } else {
          const isBeforeToday = dateStr < todayStr;
          isPast = isBeforeToday;
          isUpcoming = !isBeforeToday;
        }

        const format12h = (t24) => {
          const [h, m] = t24.split(':').map(Number);
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
        };

        const timeFormatted = `${format12h(slot.startTime)} - ${format12h(slot.endTime)}`;

        return {
          id: slot.id,
          courseId: slot.courseId,
          courseName: course.name,
          shortName: course.shortName,
          courseCode: course.code,
          courseColor: course.color,
          courseBadgeBg: course.badgeBg,
          courseBorderGlow: course.borderGlow,
          courseTextColor: course.textColor,
          icon: course.icon,
          type: slot.type,
          room: slot.room,
          startTime: slot.startTime,
          endTime: slot.endTime,
          hours: slot.hours || 1,
          timeFormatted,
          status: attRecord ? attRecord.status : 'unmarked',
          markedAt: attRecord ? attRecord.timestamp : null,
          note: classNote,
          isNow,
          isPast,
          isUpcoming,
          minutesRemaining,
          progressPercent
        };
      });

      return {
        date: dateStr,
        dateObj,
        dayIndex,
        dayName,
        dayAbbr,
        isToday,
        isWeekend,
        isFreeDay: slots.length === 0,
        classes: enrichedClasses
      };
    }

    static getCurrentAndUpcoming() {
      const daily = this.getDailySchedule(new Date());
      if (daily.isFreeDay) return { current: null, upcoming: null, isFreeDay: true, daily };

      const current = daily.classes.find(c => c.isNow) || null;
      const upcoming = daily.classes.find(c => c.isUpcoming) || null;

      return { current, upcoming, isFreeDay: false, daily };
    }

    static markAttendance(dateStr, slotId, status) {
      const valid = ['present', 'absent', 'cancelled', 'unmarked'];
      if (!valid.includes(status)) {
        throw new Error(`Invalid status "${status}". Allowed: ${valid.join(', ')}`);
      }

      let courseId = null;
      for (const daySlots of Object.values(WEEKLY_SCHEDULE)) {
        const match = daySlots.find(s => s.id === slotId);
        if (match) {
          courseId = match.courseId;
          break;
        }
      }

      const records = TimetableStorage.get(STORAGE_KEYS.ATTENDANCE, {});
      const recordKey = `${dateStr}_${slotId}`;
      const current = records[recordKey] ? records[recordKey].status : 'unmarked';

      let finalStatus = status;
      if (current === status) {
        finalStatus = 'unmarked';
        delete records[recordKey];
      } else if (status === 'unmarked') {
        delete records[recordKey];
      } else {
        records[recordKey] = {
          slotId,
          date: dateStr,
          courseId,
          status,
          timestamp: new Date().toISOString()
        };
      }

      TimetableStorage.set(STORAGE_KEYS.ATTENDANCE, records);

      return {
        recordKey,
        status: finalStatus,
        courseId,
        subjectStats: courseId ? this.getSubjectAttendance(courseId) : null
      };
    }

    static getSubjectAttendance(courseId) {
      const course = COURSES[courseId] || {
        id: courseId,
        code: courseId.toUpperCase(),
        name: 'Unknown Course',
        shortName: 'Unknown',
        icon: '📚',
        color: '#6366f1',
        badgeBg: 'rgba(99, 102, 241, 0.15)',
        borderGlow: 'rgba(99, 102, 241, 0.4)',
        textColor: '#c7d2fe'
      };

      const records = TimetableStorage.get(STORAGE_KEYS.ATTENDANCE, {});
      const baselineMap = TimetableStorage.get(STORAGE_KEYS.BASELINE, {});
      const baseline = baselineMap[courseId] || { attended: 0, absent: 0 };

      let attended = baseline.attended || 0;
      let absent = baseline.absent || 0;
      let cancelled = 0;

      Object.values(records).forEach(rec => {
        const isMatch = rec.courseId === courseId || LEGACY_COURSE_MAP[rec.courseId] === courseId;
        if (isMatch) {
          if (rec.status === 'present') attended++;
          else if (rec.status === 'absent') absent++;
          else if (rec.status === 'cancelled') cancelled++;
        }
      });

      const totalHeld = attended + absent;
      const percentage = totalHeld > 0
        ? Number(((attended / totalHeld) * 100).toFixed(1))
        : 100.0;

      const isLowAttendance = percentage < BITS_MINIMUM_ATTENDANCE;

      let safeToBunk = 0;
      if (percentage >= BITS_MINIMUM_ATTENDANCE && totalHeld > 0) {
        safeToBunk = Math.max(0, Math.floor((attended / 0.75) - totalHeld));
      }

      let mustAttend = 0;
      if (percentage < BITS_MINIMUM_ATTENDANCE) {
        mustAttend = Math.max(0, Math.ceil((3 * absent) - attended));
      }

      return {
        courseId,
        courseName: course.name,
        shortName: course.shortName,
        code: course.code,
        color: course.color,
        badgeBg: course.badgeBg,
        borderGlow: course.borderGlow,
        textColor: course.textColor,
        icon: course.icon,
        attended,
        absent,
        cancelled,
        totalHeld,
        percentage,
        isLowAttendance,
        warning: isLowAttendance,
        safeToBunk,
        mustAttend,
        warningMessage: isLowAttendance
          ? `Attendance (${percentage}%) is below 75%! Attend the next ${mustAttend} class(es) to recover.`
          : `Attendance healthy (${percentage}%). Safe to bunk ${safeToBunk} class(es).`
      };
    }

    static getAllSubjectsAttendance() {
      const uniqueCourseIds = ['me_f314', 'me_f315', 'me_f316', 'me_f317', 'bio_f421', 'bits_f462', 'me_f340', 'bits_f468'];
      const subjects = uniqueCourseIds.map(id => this.getSubjectAttendance(id));

      const totalHeld = subjects.reduce((sum, s) => sum + s.totalHeld, 0);
      const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
      const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);
      const totalCancelled = subjects.reduce((sum, s) => sum + s.cancelled, 0);

      const overallPercentage = totalHeld > 0
        ? Number(((totalAttended / totalHeld) * 100).toFixed(1))
        : 100.0;

      const lowAttendanceList = subjects.filter(s => s.isLowAttendance);
      const totalSafeToBunk = subjects.reduce((sum, s) => sum + s.safeToBunk, 0);
      const totalMustAttend = subjects.reduce((sum, s) => sum + s.mustAttend, 0);

      return {
        subjects,
        overall: {
          totalHeld,
          totalAttended,
          totalAbsent,
          totalCancelled,
          overallPercentage,
          totalSafeToBunk,
          totalMustAttend,
          hasLowAttendance: lowAttendanceList.length > 0,
          lowAttendanceCount: lowAttendanceList.length
        },
        lowAttendanceList
      };
    }

    static saveClassNote(dateStr, slotId, noteText) {
      const notes = TimetableStorage.get(STORAGE_KEYS.NOTES, {});
      const recordKey = `${dateStr}_${slotId}`;

      if (!noteText || noteText.trim() === '') {
        delete notes[recordKey];
      } else {
        notes[recordKey] = {
          date: dateStr,
          slotId,
          text: noteText.trim(),
          updatedAt: new Date().toISOString()
        };
      }

      TimetableStorage.set(STORAGE_KEYS.NOTES, notes);
      return { recordKey, note: notes[recordKey] || null };
    }

    static getClassNote(dateStr, slotId) {
      const notes = TimetableStorage.get(STORAGE_KEYS.NOTES, {});
      const record = notes[`${dateStr}_${slotId}`];
      return record ? record.text : '';
    }

    static getSubjectNotes(courseId) {
      const notes = TimetableStorage.get(STORAGE_KEYS.NOTES, {});
      const courseSlotIds = new Set();
      Object.values(WEEKLY_SCHEDULE).forEach(daySlots => {
        daySlots.forEach(s => {
          if (s.courseId === courseId) courseSlotIds.add(s.id);
        });
      });

      const matches = [];
      Object.values(notes).forEach(item => {
        if (courseSlotIds.has(item.slotId)) matches.push(item);
      });

      return matches.sort((a, b) => (b.date > a.date ? 1 : -1));
    }

    static exportData() {
      return {
        attendance: TimetableStorage.get(STORAGE_KEYS.ATTENDANCE, {}),
        notes: TimetableStorage.get(STORAGE_KEYS.NOTES, {}),
        baseline: TimetableStorage.get(STORAGE_KEYS.BASELINE, {}),
        exportedAt: new Date().toISOString()
      };
    }

    static importData(data) {
      if (!data) return false;
      if (data.attendance) TimetableStorage.set(STORAGE_KEYS.ATTENDANCE, data.attendance);
      if (data.notes) TimetableStorage.set(STORAGE_KEYS.NOTES, data.notes);
      if (data.baseline) TimetableStorage.set(STORAGE_KEYS.BASELINE, data.baseline);
      return true;
    }

    static resetAllAttendance() {
      TimetableStorage.remove(STORAGE_KEYS.ATTENDANCE);
      TimetableStorage.remove(STORAGE_KEYS.NOTES);
      TimetableStorage.remove(STORAGE_KEYS.BASELINE);
    }
  }

  // ===============================================================================
  // 5. CSS STYLING INJECTOR
  // ===============================================================================

  const CSS_STYLES = `
  .tt-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    color: var(--text-primary, #f3f4f8);
  }

  .tt-live-banner {
    background: linear-gradient(135deg, rgba(124, 92, 252, 0.16) 0%, rgba(16, 185, 129, 0.12) 100%);
    border: 1px solid rgba(124, 92, 252, 0.38);
    border-radius: var(--radius-md, 14px);
    padding: 14px 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(124, 92, 252, 0.2);
    animation: ttSlideDown 0.3s ease;
  }

  .tt-live-banner.is-upcoming {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(18, 18, 26, 0.9) 100%);
    border-color: rgba(6, 182, 212, 0.35);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .tt-live-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .tt-beacon-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid var(--mint, #10b981);
    color: var(--mint, #10b981);
    padding: 3px 9px;
    border-radius: 9999px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .tt-beacon-tag.upcoming {
    background: rgba(6, 182, 212, 0.18);
    border-color: var(--cyan, #06b6d4);
    color: var(--cyan, #06b6d4);
  }

  .tt-beacon-dot {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
    animation: ttBeaconPulse 1.8s infinite ease-in-out;
  }

  .tt-live-title {
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tt-live-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    color: var(--text-secondary, #9494a8);
    margin-top: 4px;
  }

  .tt-live-progress-track {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-top: 10px;
    overflow: hidden;
  }

  .tt-live-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mint, #10b981), var(--accent, #7c5cfc));
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .tt-day-selector {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    margin-bottom: 2px;
  }

  .tt-day-pill {
    background: var(--bg-surface, #12121a);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-sm, 10px);
    padding: 8px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    cursor: pointer;
    color: var(--text-secondary, #9494a8);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    position: relative;
  }

  .tt-day-pill:hover {
    background: var(--bg-surface-elevated, #181824);
    border-color: var(--border-focus, #2f2f48);
    color: var(--text-primary, #f3f4f8);
  }

  .tt-day-pill.active {
    background: var(--accent-dim, rgba(124, 92, 252, 0.16));
    border-color: var(--accent, #7c5cfc);
    color: #c4b5fd;
    box-shadow: 0 0 14px var(--accent-glow, rgba(124, 92, 252, 0.35));
  }

  .tt-day-pill.is-today {
    border-bottom: 2px solid var(--mint, #10b981);
  }

  .tt-day-pill-name {
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .tt-day-pill-count {
    font-size: 0.62rem;
    opacity: 0.85;
    font-weight: 600;
  }

  .tt-day-pill.active .tt-day-pill-count {
    color: #fff;
    opacity: 1;
  }

  .tt-analytics-card {
    background: linear-gradient(135deg, rgba(18, 18, 26, 0.95) 0%, rgba(24, 24, 36, 0.9) 100%);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-md, 14px);
    padding: 16px;
    position: relative;
    transition: border-color 0.2s;
  }
  .tt-analytics-card:hover {
    border-color: var(--border-focus, #2f2f48);
  }

  .tt-analytics-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .tt-analytics-title {
    font-size: 0.82rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary, #9494a8);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .tt-overall-percent-badge {
    font-size: 1.15rem;
    font-weight: 900;
    padding: 3px 10px;
    border-radius: 9999px;
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    letter-spacing: -0.02em;
  }

  .tt-overall-percent-badge.safe {
    color: var(--mint, #10b981);
    border-color: rgba(16, 185, 129, 0.35);
    background: rgba(16, 185, 129, 0.1);
  }

  .tt-overall-percent-badge.warning {
    color: var(--rose, #ef4444);
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.12);
    animation: ttPulseRed 2s infinite ease-in-out;
  }

  .tt-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .tt-stat-cell {
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-sm, 8px);
    padding: 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tt-stat-cell .val {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .tt-stat-cell .lbl {
    font-size: 0.62rem;
    color: var(--text-secondary, #9494a8);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .tt-buffer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border-subtle, #1f1f2e);
    font-size: 0.76rem;
    gap: 8px;
  }

  .tt-buffer-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-weight: 700;
  }

  .tt-buffer-pill.safe {
    background: rgba(16, 185, 129, 0.12);
    color: var(--mint, #10b981);
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .tt-buffer-pill.recovery {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.35);
  }

  .tt-toggle-subjects-btn {
    background: transparent;
    border: 1px solid var(--border-subtle, #1f1f2e);
    color: var(--text-secondary, #9494a8);
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .tt-toggle-subjects-btn:hover {
    border-color: var(--accent, #7c5cfc);
    color: #c4b5fd;
  }

  .tt-critical-warning-box {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid var(--rose, #ef4444);
    color: #fca5a5;
    padding: 10px 14px;
    border-radius: var(--radius-sm, 8px);
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.77rem;
    line-height: 1.45;
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
  }

  .tt-subject-breakdown-drawer {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border-subtle, #1f1f2e);
    display: none;
    flex-direction: column;
    gap: 8px;
    animation: ttSlideDown 0.25s ease;
  }
  .tt-subject-breakdown-drawer.open {
    display: flex;
  }

  .tt-subject-item-row {
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-sm, 8px);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .tt-sub-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .tt-sub-code {
    font-size: 0.75rem;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 6px;
    background: var(--bg-surface-elevated, #181824);
    color: var(--text-primary, #f3f4f8);
  }

  .tt-sub-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary, #f3f4f8);
  }

  .tt-sub-metrics {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tt-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
    margin-bottom: -4px;
  }

  .tt-section-title {
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary, #9494a8);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tt-section-count {
    font-size: 0.74rem;
    color: var(--text-secondary, #9494a8);
    font-weight: 600;
  }

  .tt-classes-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tt-class-card {
    background: var(--bg-surface, #12121a);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-left: 4px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-md, 14px);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  }

  .tt-class-card:hover {
    border-color: var(--border-focus, #2f2f48);
  }

  .tt-class-card.is-now {
    border-color: var(--accent, #7c5cfc);
    background: linear-gradient(135deg, rgba(124, 92, 252, 0.09) 0%, var(--bg-surface, #12121a) 100%);
    box-shadow: 0 0 16px var(--accent-glow, rgba(124, 92, 252, 0.35));
  }

  .tt-class-card.present {
    border-left-color: var(--mint, #10b981);
  }

  .tt-class-card.absent {
    border-left-color: var(--rose, #ef4444);
  }

  .tt-class-card.cancelled {
    border-left-color: var(--amber, #f59e0b);
    opacity: 0.75;
  }

  .tt-card-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .tt-course-meta-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
  }

  .tt-course-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    transition: transform 0.2s;
  }
  .tt-class-card:hover .tt-course-icon {
    transform: scale(1.05);
  }

  .tt-course-text-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }

  .tt-course-code-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tt-code-pill {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 2px 7px;
    border-radius: 6px;
    background: var(--bg-surface-elevated, #181824);
    border: 1px solid var(--border-subtle, #1f1f2e);
    color: var(--text-primary, #f3f4f8);
  }

  .tt-live-pill {
    font-size: 0.62rem;
    font-weight: 800;
    background: var(--accent, #7c5cfc);
    color: #fff;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    animation: ttBeaconPulse 1.6s infinite ease-in-out;
  }

  .tt-course-full-name {
    font-size: 0.96rem;
    font-weight: 700;
    color: var(--text-primary, #f3f4f8);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  .tt-card-badges-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-size: 0.72rem;
    color: var(--text-secondary, #9494a8);
  }

  .tt-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.68rem;
    font-weight: 700;
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
  }

  .tt-badge.room {
    color: #67e8f9;
    border-color: rgba(6, 182, 212, 0.25);
    background: rgba(6, 182, 212, 0.08);
  }

  .tt-badge.type {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #c4b5fd;
    border-color: rgba(124, 92, 252, 0.25);
    background: rgba(124, 92, 252, 0.08);
  }

  .tt-badge.time {
    color: var(--text-secondary, #9494a8);
  }

  .tt-badge.status-pill {
    font-weight: 800;
  }
  .tt-badge.status-pill.present {
    color: var(--mint, #10b981);
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.35);
  }
  .tt-badge.status-pill.absent {
    color: var(--rose, #ef4444);
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.35);
  }
  .tt-badge.status-pill.cancelled {
    color: var(--amber, #f59e0b);
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.35);
  }

  .tt-action-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-subtle, #1f1f2e);
    padding-top: 10px;
    gap: 10px;
  }

  .tt-action-strip-lbl {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-secondary, #9494a8);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tt-att-buttons-group {
    display: flex;
    gap: 6px;
  }

  .tt-att-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: var(--radius-sm, 8px);
    border: 1px solid var(--border-subtle, #1f1f2e);
    background: var(--bg-primary, #09090d);
    color: var(--text-secondary, #9494a8);
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
  }

  .tt-att-btn:hover {
    border-color: var(--border-focus, #2f2f48);
    color: var(--text-primary, #f3f4f8);
    background: var(--bg-surface-elevated, #181824);
  }

  .tt-att-btn.present.active {
    background: var(--mint, #10b981);
    border-color: var(--mint, #10b981);
    color: #09090d;
    box-shadow: 0 0 10px var(--mint-glow, rgba(16, 185, 129, 0.45));
  }

  .tt-att-btn.absent.active {
    background: var(--rose, #ef4444);
    border-color: var(--rose, #ef4444);
    color: #fff;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.45);
  }

  .tt-att-btn.cancelled.active {
    background: var(--amber, #f59e0b);
    border-color: var(--amber, #f59e0b);
    color: #09090d;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
  }

  .tt-notes-section {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 8px;
  }

  .tt-notes-toggle-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    padding: 4px 2px;
  }

  .tt-notes-toggle-lbl {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-secondary, #9494a8);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: color 0.2s;
  }
  .tt-notes-toggle-bar:hover .tt-notes-toggle-lbl {
    color: #c4b5fd;
  }

  .tt-notes-count-badge {
    font-size: 0.65rem;
    padding: 1px 6px;
    border-radius: 9999px;
    background: var(--bg-surface-elevated, #181824);
    border: 1px solid var(--border-subtle, #1f1f2e);
    color: var(--text-secondary, #9494a8);
  }
  .tt-notes-count-badge.has-content {
    background: var(--accent-dim, rgba(124, 92, 252, 0.16));
    border-color: var(--accent, #7c5cfc);
    color: #c4b5fd;
  }

  .tt-notes-expandable-box {
    display: none;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    animation: ttSlideDown 0.22s ease;
  }
  .tt-notes-expandable-box.open {
    display: flex;
  }

  .tt-notes-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .tt-note-chip {
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    color: var(--text-secondary, #9494a8);
    font-size: 0.68rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
  }
  .tt-note-chip:hover {
    border-color: var(--accent, #7c5cfc);
    color: #c4b5fd;
    background: var(--accent-dim, rgba(124, 92, 252, 0.15));
  }

  .tt-notes-textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 70px;
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-sm, 8px);
    color: var(--text-primary, #f3f4f8);
    font-family: inherit;
    font-size: 0.82rem;
    padding: 8px 10px;
    line-height: 1.45;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
  }
  .tt-notes-textarea:focus {
    border-color: var(--accent, #7c5cfc);
    box-shadow: 0 0 10px var(--accent-glow, rgba(124, 92, 252, 0.2));
  }

  .tt-notes-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.68rem;
    color: var(--text-secondary, #9494a8);
  }

  .tt-notes-saved-msg {
    color: var(--mint, #10b981);
    font-weight: 700;
    display: none;
  }
  .tt-notes-saved-msg.show {
    display: inline;
  }

  .tt-weekend-card {
    background: linear-gradient(135deg, rgba(124, 92, 252, 0.14) 0%, rgba(18, 18, 26, 0.95) 100%);
    border: 1px solid rgba(124, 92, 252, 0.35);
    border-radius: var(--radius-md, 14px);
    padding: 32px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .tt-celebration-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 9999px;
    background: var(--accent-dim, rgba(124, 92, 252, 0.16));
    border: 1px solid var(--accent, #7c5cfc);
    color: #c4b5fd;
    font-size: 0.74rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .tt-weekend-title {
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: var(--text-primary, #f3f4f8);
  }

  .tt-weekend-desc {
    font-size: 0.82rem;
    color: var(--text-secondary, #9494a8);
    max-width: 440px;
    line-height: 1.5;
  }

  .tt-weekend-ethos-box {
    background: var(--bg-primary, #09090d);
    border: 1px solid var(--border-subtle, #1f1f2e);
    border-radius: var(--radius-sm, 8px);
    padding: 12px 16px;
    margin-top: 6px;
    width: 100%;
    max-width: 460px;
    text-align: left;
    font-size: 0.76rem;
    color: var(--text-secondary, #9494a8);
    line-height: 1.55;
  }

  @keyframes ttBeaconPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }

  @keyframes ttPulseRed {
    0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
    50% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
  }

  @keyframes ttSlideDown {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  `;

  function injectStyles() {
    if (typeof document === 'undefined') return;
    const styleId = 'me-timetable-ui-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = CSS_STYLES;
      document.head.appendChild(styleEl);
    }
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

  // ===============================================================================
  // 6. INTERACTIVE UI COMPONENT (TimetableUIComponent)
  // ===============================================================================

  class TimetableUIComponent {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.options = Object.assign({
        onAttendanceChange: null,
        onToast: null
      }, options);

      this.selectedDay = new Date().getDay();
      this.subjectBreakdownOpen = false;
      this.notesExpandedMap = {};
      this.saveTimers = {};
      this.intervalTicker = null;
    }

    init() {
      if (!this.container) {
        console.warn('[TimetableUIComponent] Container not found.');
        return;
      }
      injectStyles();
      this.render();
      this.startTicker();
    }

    destroy() {
      if (this.intervalTicker) {
        clearInterval(this.intervalTicker);
        this.intervalTicker = null;
      }
      if (this.container) this.container.innerHTML = '';
    }

    startTicker() {
      if (this.intervalTicker) clearInterval(this.intervalTicker);
      this.intervalTicker = setInterval(() => {
        const todayDay = new Date().getDay();
        if (this.selectedDay === todayDay) {
          this.renderLiveBanner();
        }
      }, 30000);
    }

    setDay(dayIndex) {
      this.selectedDay = parseInt(dayIndex, 10);
      this.render();
    }

    toast(msg, icon = '✓') {
      if (typeof this.options.onToast === 'function') {
        this.options.onToast(msg, icon);
      } else if (typeof window !== 'undefined' && window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(msg, icon);
      }
    }

    render() {
      if (!this.container) return;

      const dailySchedule = TimetableEngine.getDailySchedule(this.selectedDay);
      const analytics = TimetableEngine.getAllSubjectsAttendance();
      const liveStatus = TimetableEngine.getCurrentAndUpcoming();

      let html = `<div class="tt-root">`;
      html += this.renderLiveBannerHtml(liveStatus, dailySchedule);
      html += this.renderDaySelectorHtml();
      html += this.renderAnalyticsCardHtml(analytics);
      html += this.renderScheduleHeaderHtml(dailySchedule);

      if (dailySchedule.isFreeDay) {
        html += this.renderWeekendCardHtml(dailySchedule);
      } else {
        html += this.renderClassesListHtml(dailySchedule);
      }

      html += `</div>`;

      this.container.innerHTML = html;
      this.bindEvents();
    }

    renderLiveBannerHtml(liveStatus, dailySchedule) {
      const todayDay = new Date().getDay();
      const isTodayView = this.selectedDay === todayDay;

      if (!isTodayView) {
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface, #12121a); border: 1px solid var(--border-subtle, #1f1f2e); padding: 8px 14px; border-radius: var(--radius-sm, 8px); font-size: 0.76rem; color: var(--text-secondary, #9494a8);">
            <span>📅 Viewing <strong>${dailySchedule.dayName}</strong> (${dailySchedule.date})</span>
            <button class="tt-toggle-subjects-btn" data-action="jump-today">⚡ Jump to Today</button>
          </div>
        `;
      }

      const { current, upcoming, isFreeDay } = liveStatus;

      if (isFreeDay) {
        return `
          <div class="tt-live-banner" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 18, 26, 0.9) 100%); border-color: rgba(16, 185, 129, 0.35);">
            <div class="tt-live-top-row">
              <span class="tt-beacon-tag" style="background: rgba(16, 185, 129, 0.15);">
                <span class="tt-beacon-dot"></span> WEEKEND RECOVERY
              </span>
              <span style="font-size: 0.72rem; color: var(--mint, #10b981); font-weight: 700;">No classes today</span>
            </div>
            <div class="tt-live-title">🏖️ Zero Academic Pressure Today</div>
            <div class="tt-live-meta">Enjoy your free weekend, lock in your sleep targets, and recharge your cognitive battery.</div>
          </div>
        `;
      }

      if (current) {
        return `
          <div class="tt-live-banner">
            <div class="tt-live-top-row">
              <span class="tt-beacon-tag">
                <span class="tt-beacon-dot"></span> HAPPENING NOW
              </span>
              <span style="font-size: 0.75rem; color: var(--mint, #10b981); font-weight: 800;">
                ⏳ Ends in ${current.minutesRemaining} min
              </span>
            </div>
            <div class="tt-live-title">
              <span>${current.icon || '📚'}</span>
              <span>${escapeHtml(current.courseCode)} — ${escapeHtml(current.courseName)}</span>
            </div>
            <div class="tt-live-meta">
              <span>📍 ${escapeHtml(current.room)}</span>
              <span>·</span>
              <span>⏰ ${escapeHtml(current.timeFormatted)}</span>
              <span>·</span>
              <span>🏷️ ${escapeHtml(current.type)}</span>
            </div>
            <div class="tt-live-progress-track">
              <div class="tt-live-progress-fill" style="width: ${current.progressPercent}%;"></div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary, #9494a8);">Quick Attendance:</span>
              <div class="tt-att-buttons-group">
                <button class="tt-att-btn present ${current.status === 'present' ? 'active' : ''}" data-action="mark" data-slot="${current.id}" data-date="${dailySchedule.date}" data-status="present">✅ Present</button>
                <button class="tt-att-btn absent ${current.status === 'absent' ? 'active' : ''}" data-action="mark" data-slot="${current.id}" data-date="${dailySchedule.date}" data-status="absent">❌ Absent</button>
                <button class="tt-att-btn cancelled ${current.status === 'cancelled' ? 'active' : ''}" data-action="mark" data-slot="${current.id}" data-date="${dailySchedule.date}" data-status="cancelled">🚫 Cancelled</button>
              </div>
            </div>
          </div>
        `;
      }

      if (upcoming) {
        return `
          <div class="tt-live-banner is-upcoming">
            <div class="tt-live-top-row">
              <span class="tt-beacon-tag upcoming">
                <span class="tt-beacon-dot"></span> UPCOMING NEXT
              </span>
              <span style="font-size: 0.74rem; color: var(--cyan, #06b6d4); font-weight: 700;">
                ⏰ Starts at ${upcoming.startTime}
              </span>
            </div>
            <div class="tt-live-title">
              <span>${upcoming.icon || '📚'}</span>
              <span>${escapeHtml(upcoming.courseCode)} — ${escapeHtml(upcoming.courseName)}</span>
            </div>
            <div class="tt-live-meta">
              <span>📍 ${escapeHtml(upcoming.room)}</span>
              <span>·</span>
              <span>⏰ ${escapeHtml(upcoming.timeFormatted)}</span>
              <span>·</span>
              <span>🏷️ ${escapeHtml(upcoming.type)}</span>
            </div>
          </div>
        `;
      }

      return `
        <div class="tt-live-banner" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(18, 18, 26, 0.9) 100%); border-color: rgba(16, 185, 129, 0.3);">
          <div class="tt-live-top-row">
            <span class="tt-beacon-tag">
              <span class="tt-beacon-dot"></span> ALL DONE TODAY
            </span>
            <span style="font-size: 0.74rem; color: var(--mint, #10b981); font-weight: 700;">🎉 Academic Day Complete</span>
          </div>
          <div class="tt-live-title">Classes Finished for Today!</div>
          <div class="tt-live-meta">All lectures & tutorials logged. Time to hit your workout, clean eating, and evening deep work.</div>
        </div>
      `;
    }

    renderLiveBanner() {
      const liveStatus = TimetableEngine.getCurrentAndUpcoming();
      const dailySchedule = TimetableEngine.getDailySchedule(this.selectedDay);
      const existing = this.container.querySelector('.tt-live-banner');
      if (existing) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderLiveBannerHtml(liveStatus, dailySchedule);
        const newEl = tempDiv.firstElementChild;
        if (newEl) existing.replaceWith(newEl);
        this.bindLiveBannerEvents();
      }
    }

    renderDaySelectorHtml() {
      const todayIndex = new Date().getDay();
      const dayOrder = [1, 2, 3, 4, 5, 6, 0];

      return `
        <div class="tt-day-selector" id="ttDaySelector">
          ${dayOrder.map(dayIdx => {
            const isSelected = this.selectedDay === dayIdx;
            const isToday = todayIndex === dayIdx;
            const slots = WEEKLY_SCHEDULE[dayIdx] || [];
            const countText = slots.length === 0 ? 'Free' : `${slots.length} cls`;

            return `
              <button class="tt-day-pill ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}" data-day="${dayIdx}" title="${DAY_NAMES[dayIdx]} (${countText})">
                <span class="tt-day-pill-name">${DAY_ABBR[dayIdx]}</span>
                <span class="tt-day-pill-count">${countText}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    renderAnalyticsCardHtml(analytics) {
      const overall = analytics.overall;
      const isSafe = overall.overallPercentage >= BITS_MINIMUM_ATTENDANCE;
      const hasWarnings = overall.hasLowAttendance;

      return `
        <div class="tt-analytics-card">
          <div class="tt-analytics-header">
            <div class="tt-analytics-title">
              <span>📊</span>
              <span>75% Attendance Guard</span>
            </div>
            <div class="tt-overall-percent-badge ${isSafe ? 'safe' : 'warning'}">
              ${overall.overallPercentage}%
            </div>
          </div>

          <div class="tt-stats-grid">
            <div class="tt-stat-cell">
              <span class="val">${overall.totalHeld}</span>
              <span class="lbl">Held</span>
            </div>
            <div class="tt-stat-cell">
              <span class="val" style="color: var(--mint, #10b981);">${overall.totalAttended}</span>
              <span class="lbl">Attended</span>
            </div>
            <div class="tt-stat-cell">
              <span class="val" style="color: var(--rose, #ef4444);">${overall.totalAbsent}</span>
              <span class="lbl">Missed</span>
            </div>
            <div class="tt-stat-cell">
              <span class="val" style="color: var(--amber, #f59e0b);">${overall.totalCancelled}</span>
              <span class="lbl">Cancelled</span>
            </div>
          </div>

          <div class="tt-buffer-row">
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <span class="tt-buffer-pill safe" title="Classes you can miss without falling below 75%">
                🟢 Safe to Bunk: ${overall.totalSafeToBunk}
              </span>
              ${hasWarnings ? `
                <span class="tt-buffer-pill recovery" title="Classes you must attend consecutively to reach 75%">
                  🔴 Must Attend: ${overall.totalMustAttend}
                </span>
              ` : ''}
            </div>
            <button class="tt-toggle-subjects-btn" id="btnToggleSubjectDrawer">
              <span>${this.subjectBreakdownOpen ? 'Hide Subjects ▴' : 'All 8 Subjects ▾'}</span>
            </button>
          </div>

          ${hasWarnings ? `
            <div class="tt-critical-warning-box">
              <span style="font-size: 1.2rem;">⚠️</span>
              <div>
                <strong>Low Attendance Alert:</strong> ${analytics.lowAttendanceList.map(s => `${s.code} (${s.percentage}%)`).join(', ')} below BITS 75% minimum!
                Attend next <strong>${overall.totalMustAttend} class(es)</strong> to recover grade eligibility.
              </div>
            </div>
          ` : ''}

          <div class="tt-subject-breakdown-drawer ${this.subjectBreakdownOpen ? 'open' : ''}" id="ttSubjectDrawer">
            ${analytics.subjects.map(sub => {
              const subIsSafe = sub.percentage >= BITS_MINIMUM_ATTENDANCE;
              return `
                <div class="tt-subject-item-row" style="border-left: 3px solid ${sub.color};">
                  <div class="tt-sub-info">
                    <span style="font-size: 1rem;">${sub.icon}</span>
                    <div>
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="tt-sub-code">${escapeHtml(sub.code)}</span>
                        <span class="tt-sub-name">${escapeHtml(sub.shortName)}</span>
                      </div>
                      <div style="font-size: 0.68rem; color: var(--text-secondary, #9494a8); margin-top: 2px;">
                        ${sub.attended}/${sub.totalHeld} attended · ${subIsSafe ? `<span style="color: var(--mint, #10b981);">Safe bunk: ${sub.safeToBunk}</span>` : `<span style="color: var(--rose, #ef4444);">Need recovery: ${sub.mustAttend}</span>`}
                      </div>
                    </div>
                  </div>
                  <div class="tt-sub-metrics">
                    <span style="font-weight: 800; font-size: 0.88rem; color: ${subIsSafe ? 'var(--mint, #10b981)' : 'var(--rose, #ef4444)'};">
                      ${sub.percentage}%
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    renderScheduleHeaderHtml(dailySchedule) {
      const classesCount = dailySchedule.classes ? dailySchedule.classes.length : 0;
      return `
        <div class="tt-section-head">
          <div class="tt-section-title">
            <span>🏛️</span>
            <span>${dailySchedule.dayName}'s Schedule</span>
          </div>
          <span class="tt-section-count">${classesCount} ${classesCount === 1 ? 'class' : 'classes'}</span>
        </div>
      `;
    }

    renderClassesListHtml(dailySchedule) {
      const classes = dailySchedule.classes || [];

      return `
        <div class="tt-classes-list">
          ${classes.map(cls => {
            const isNow = cls.isNow;
            const status = cls.status || 'unmarked';
            const isNotesOpen = !!this.notesExpandedMap[cls.id];
            const hasNote = cls.note && cls.note.trim().length > 0;

            return `
              <div class="tt-class-card ${status} ${isNow ? 'is-now' : ''}" data-id="${cls.id}" style="border-left-color: ${status === 'present' ? 'var(--mint, #10b981)' : status === 'absent' ? 'var(--rose, #ef4444)' : status === 'cancelled' ? 'var(--amber, #f59e0b)' : cls.courseColor};">
                <div class="tt-card-top-row">
                  <div class="tt-course-meta-group">
                    <div class="tt-course-icon" style="box-shadow: 0 0 10px ${cls.courseBadgeBg}; border-color: ${cls.courseColor}44;">
                      ${cls.icon || '📚'}
                    </div>
                    <div class="tt-course-text-col">
                      <div class="tt-course-code-line">
                        <span class="tt-code-pill" style="color: ${cls.courseTextColor}; border-color: ${cls.courseColor}55;">${escapeHtml(cls.courseCode)}</span>
                        ${isNow ? '<span class="tt-live-pill">LIVE NOW</span>' : ''}
                      </div>
                      <div class="tt-course-full-name">${escapeHtml(cls.courseName)}</div>
                      <div class="tt-card-badges-line">
                        <span class="tt-badge room">📍 ${escapeHtml(cls.room)}</span>
                        <span class="tt-badge type">${escapeHtml(cls.type)}</span>
                        <span class="tt-badge time">⏰ ${escapeHtml(cls.timeFormatted)}</span>
                        ${status !== 'unmarked' ? `
                          <span class="tt-badge status-pill ${status}">
                            ${status === 'present' ? '✓ PRESENT' : status === 'absent' ? '✗ ABSENT' : '⊘ CANCELLED'}
                          </span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="tt-action-strip">
                  <span class="tt-action-strip-lbl">Attendance:</span>
                  <div class="tt-att-buttons-group">
                    <button class="tt-att-btn present ${status === 'present' ? 'active' : ''}" data-action="mark" data-slot="${cls.id}" data-date="${dailySchedule.date}" data-status="present" title="Mark Present">
                      ✅ Present
                    </button>
                    <button class="tt-att-btn absent ${status === 'absent' ? 'active' : ''}" data-action="mark" data-slot="${cls.id}" data-date="${dailySchedule.date}" data-status="absent" title="Mark Absent">
                      ❌ Absent
                    </button>
                    <button class="tt-att-btn cancelled ${status === 'cancelled' ? 'active' : ''}" data-action="mark" data-slot="${cls.id}" data-date="${dailySchedule.date}" data-status="cancelled" title="Class Cancelled / Holiday">
                      🚫 Cancelled
                    </button>
                  </div>
                </div>

                <div class="tt-notes-section">
                  <div class="tt-notes-toggle-bar" data-action="toggle-notes" data-slot="${cls.id}">
                    <div class="tt-notes-toggle-lbl">
                      <span>📝</span>
                      <span>Class Notes, Formulas & Exam Hints</span>
                    </div>
                    <span class="tt-notes-count-badge ${hasNote ? 'has-content' : ''}">
                      ${hasNote ? '✓ Has Note' : '+ Add Note'}
                    </span>
                  </div>

                  <div class="tt-notes-expandable-box ${isNotesOpen ? 'open' : ''}" id="notesBox_${cls.id}">
                    <div class="tt-notes-chips-row">
                      <button class="tt-note-chip" data-action="insert-chip" data-slot="${cls.id}" data-prefix="📐 [Formula]: ">📐 + Formula</button>
                      <button class="tt-note-chip" data-action="insert-chip" data-slot="${cls.id}" data-prefix="📚 [Homework]: ">📚 + Homework</button>
                      <button class="tt-note-chip" data-action="insert-chip" data-slot="${cls.id}" data-prefix="🎯 [Exam Hint]: ">🎯 + Exam Hint</button>
                      <button class="tt-note-chip" data-action="insert-chip" data-slot="${cls.id}" data-prefix="⚡ [Key Point]: ">⚡ + Concept</button>
                    </div>

                    <textarea class="tt-notes-textarea" id="notesInput_${cls.id}" placeholder="Log formulas, homework, exam hints, professor tips..." data-slot="${cls.id}" data-date="${dailySchedule.date}">${escapeHtml(cls.note)}</textarea>

                    <div class="tt-notes-footer">
                      <span>Auto-saves on typing</span>
                      <span class="tt-notes-saved-msg" id="notesSaved_${cls.id}">✓ Saved</span>
                    </div>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    renderWeekendCardHtml(dailySchedule) {
      return `
        <div class="tt-weekend-card">
          <div style="font-size: 2.8rem; line-height: 1;">🎉</div>
          <div class="tt-celebration-badge">✨ Free Academic Day</div>
          <div class="tt-weekend-title">Zero Scheduled Classes on ${dailySchedule.dayName}!</div>
          <div class="tt-weekend-desc">
            Enjoy your weekend recovery, catch up on personal coding projects, review lecture notes, and lock in your Spartan sleep schedule.
          </div>
          <div class="tt-weekend-ethos-box">
            <div style="font-weight: 800; color: var(--accent-hover, #8e71ff); margin-bottom: 4px; text-transform: uppercase; font-size: 0.7rem;">
              🏛️ BITSian Weekend Playbook:
            </div>
            <div>• <strong>Sleep Discipline:</strong> Maintain the 11:00 PM Bedtime & 6:30 AM Wake-up target.</div>
            <div>• <strong>Academic Momentum:</strong> Review Machine Elements (ME F314) & Mechanics of Machinery (ME F316) for Monday morning 8:00 AM.</div>
            <div>• <strong>Deep Work:</strong> 2 hours of uninterrupted flow state on side projects.</div>
          </div>
        </div>
      `;
    }

    bindEvents() {
      const daySelector = this.container.querySelector('#ttDaySelector');
      if (daySelector) {
        daySelector.querySelectorAll('.tt-day-pill').forEach(btn => {
          btn.onclick = () => {
            const day = btn.getAttribute('data-day');
            this.setDay(day);
          };
        });
      }

      this.container.querySelectorAll('[data-action="jump-today"]').forEach(btn => {
        btn.onclick = () => {
          this.setDay(new Date().getDay());
        };
      });

      const toggleBtn = this.container.querySelector('#btnToggleSubjectDrawer');
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          this.subjectBreakdownOpen = !this.subjectBreakdownOpen;
          const drawer = this.container.querySelector('#ttSubjectDrawer');
          if (drawer) drawer.classList.toggle('open', this.subjectBreakdownOpen);
          const span = toggleBtn.querySelector('span');
          if (span) span.textContent = this.subjectBreakdownOpen ? 'Hide Subjects ▴' : 'All 8 Subjects ▾';
        };
      }

      this.container.querySelectorAll('[data-action="mark"]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const dateStr = btn.getAttribute('data-date');
          const slotId = btn.getAttribute('data-slot');
          const status = btn.getAttribute('data-status');

          const result = TimetableEngine.markAttendance(dateStr, slotId, status);
          const statusMsg = result.status === 'unmarked' ? 'Attendance Unmarked' : `Marked ${result.status.toUpperCase()} ✅`;
          this.toast(statusMsg);

          if (typeof this.options.onAttendanceChange === 'function') {
            this.options.onAttendanceChange(result);
          }

          this.render();
        };
      });

      this.container.querySelectorAll('[data-action="toggle-notes"]').forEach(bar => {
        bar.onclick = () => {
          const slotId = bar.getAttribute('data-slot');
          this.notesExpandedMap[slotId] = !this.notesExpandedMap[slotId];
          const box = this.container.querySelector(`#notesBox_${slotId}`);
          if (box) box.classList.toggle('open', this.notesExpandedMap[slotId]);
        };
      });

      this.container.querySelectorAll('[data-action="insert-chip"]').forEach(chip => {
        chip.onclick = () => {
          const slotId = chip.getAttribute('data-slot');
          const prefix = chip.getAttribute('data-prefix');
          const textarea = this.container.querySelector(`#notesInput_${slotId}`);
          if (textarea) {
            const current = textarea.value;
            textarea.value = current ? `${current}\n${prefix}` : prefix;
            textarea.focus();
            this.handleNoteChange(textarea);
          }
        };
      });

      this.container.querySelectorAll('.tt-notes-textarea').forEach(textarea => {
        textarea.oninput = () => {
          this.handleNoteChange(textarea);
        };
      });
    }

    bindLiveBannerEvents() {
      const banner = this.container.querySelector('.tt-live-banner');
      if (!banner) return;
      banner.querySelectorAll('[data-action="mark"]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const dateStr = btn.getAttribute('data-date');
          const slotId = btn.getAttribute('data-slot');
          const status = btn.getAttribute('data-status');

          const result = TimetableEngine.markAttendance(dateStr, slotId, status);
          this.toast(result.status === 'unmarked' ? 'Attendance Unmarked' : `Marked ${result.status.toUpperCase()} ✅`);

          if (typeof this.options.onAttendanceChange === 'function') {
            this.options.onAttendanceChange(result);
          }

          this.render();
        };
      });
    }

    handleNoteChange(textarea) {
      const slotId = textarea.getAttribute('data-slot');
      const dateStr = textarea.getAttribute('data-date');
      const text = textarea.value;

      if (this.saveTimers[slotId]) clearTimeout(this.saveTimers[slotId]);
      this.saveTimers[slotId] = setTimeout(() => {
        TimetableEngine.saveClassNote(dateStr, slotId, text);
        const savedMsg = this.container.querySelector(`#notesSaved_${slotId}`);
        if (savedMsg) {
          savedMsg.classList.add('show');
          setTimeout(() => savedMsg.classList.remove('show'), 1800);
        }
      }, 350);
    }
  }

  // Backwards compatible window.BITS_TIMETABLE interface
  const BITS_TIMETABLE = {
    COURSES,
    WEEKLY_SCHEDULE,
    DAY_NAMES,
    DAY_ABBR,
    BITS_MINIMUM_ATTENDANCE,
    parseDateContext: (d) => TimetableEngine.parseDateContext(d),
    getDailySchedule: (d) => TimetableEngine.getDailySchedule(d),
    getCurrentAndUpcoming: () => TimetableEngine.getCurrentAndUpcoming(),
    markAttendance: (d, s, st) => TimetableEngine.markAttendance(d, s, st),
    getSubjectAttendance: (c) => TimetableEngine.getSubjectAttendance(c),
    getAllSubjectsAttendance: () => TimetableEngine.getAllSubjectsAttendance(),
    saveClassNote: (d, s, n) => TimetableEngine.saveClassNote(d, s, n),
    getClassNote: (d, s) => TimetableEngine.getClassNote(d, s),
    getSubjectNotes: (c) => TimetableEngine.getSubjectNotes(c),
    exportData: () => TimetableEngine.exportData(),
    importData: (d) => TimetableEngine.importData(d),
    resetAllAttendance: () => TimetableEngine.resetAllAttendance()
  };

  return {
    COURSES,
    WEEKLY_SCHEDULE,
    DAY_NAMES,
    DAY_ABBR,
    BITS_MINIMUM_ATTENDANCE,
    STORAGE_KEYS,
    TimetableStorage,
    TimetableEngine,
    TimetableUIComponent,
    BITS_TIMETABLE
  };
});
