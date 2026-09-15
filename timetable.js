/**
 * ====================================================================
 * BITS Pilani Timetable & Attendance Engine — 'Me' PWA
 * ====================================================================
 * 
 * Core module providing complete data structures and operational logic for:
 * 1. Timetable Matrix: Daily schedule filtered by current day of week.
 * 2. Real-time class status (Current class, Upcoming, Past, Free day).
 * 3. Attendance Logging: Mark 'present', 'absent', or 'cancelled'.
 * 4. 75% Attendance Analytics: Percentage calculation, warnings below 75%,
 *    bunk margin (classes safe to miss), and recovery buffer (classes to attend).
 * 5. Class Notes: Persistent per-slot note taking and subject-level history.
 * 6. Universal compatibility: Supports ES Module and vanilla <script> (window.BITS_TIMETABLE).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BITS_TIMETABLE = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // ==========================================
  // 1. DATA STRUCTURES: COURSES
  // ==========================================

  const COURSES = {
    machine_elements: {
      id: 'machine_elements',
      code: 'ME F312',
      name: 'Machine Elements',
      shortName: 'Mach Elements',
      color: '#6366f1', // Indigo
      badgeBg: '#e0e7ff',
      textColor: '#3730a3',
      icon: '⚙️'
    },
    mfg_mgmt: {
      id: 'mfg_mgmt',
      code: 'MF F311',
      name: 'Manufacturing Management',
      shortName: 'Mfg Mgmt',
      color: '#ec4899', // Pink
      badgeBg: '#fce7f3',
      textColor: '#9d174d',
      icon: '🏭'
    },
    engines_motors: {
      id: 'engines_motors',
      code: 'ME F313',
      name: 'Engines & Motors',
      shortName: 'Engines Motors',
      color: '#f97316', // Orange
      badgeBg: '#ffedd5',
      textColor: '#9a3412',
      icon: '🚗'
    },
    enzymology: {
      id: 'enzymology',
      code: 'BIO F215',
      name: 'Enzymology',
      shortName: 'Enzymology',
      color: '#10b981', // Emerald
      badgeBg: '#d1fae5',
      textColor: '#065f46',
      icon: '🧬'
    },
    renewable_energy: {
      id: 'renewable_energy',
      code: 'ME F433',
      name: 'Renewable Energy',
      shortName: 'Renewable Energy',
      color: '#06b6d4', // Cyan
      badgeBg: '#cffafe',
      textColor: '#155e75',
      icon: '🌱'
    },
    sports_eng: {
      id: 'sports_eng',
      code: 'BITS F316',
      name: 'Intro to Sport Engineering',
      shortName: 'Sport Eng',
      color: '#8b5cf6', // Purple
      badgeBg: '#ede9fe',
      textColor: '#5b21b6',
      icon: '⚽'
    },
    adv_mfg: {
      id: 'adv_mfg',
      code: 'MF F312',
      name: 'Advanced Manufacturing Processes',
      shortName: 'Adv Mfg',
      color: '#3b82f6', // Blue
      badgeBg: '#dbeafe',
      textColor: '#1e40af',
      icon: '🔬'
    },
    new_venture: {
      id: 'new_venture',
      code: 'MGTS F211',
      name: 'New Venture Creation',
      shortName: 'New Venture',
      color: '#eab308', // Amber
      badgeBg: '#fef9c3',
      textColor: '#854d0e',
      icon: '🚀'
    }
  };

  // ==========================================
  // 2. DATA STRUCTURES: WEEKLY SCHEDULE
  // ==========================================
  // Day indexing: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

  const WEEKLY_SCHEDULE = {
    1: [ // Monday
      {
        id: 'mon_0800_me_tut',
        courseId: 'machine_elements',
        type: 'Tutorial',
        room: 'FD I 1227',
        startTime: '08:00',
        endTime: '08:50',
        hours: 1
      },
      {
        id: 'mon_0900_mm_lec',
        courseId: 'mfg_mgmt',
        type: 'Lecture',
        room: 'LTC 5106',
        startTime: '09:00',
        endTime: '09:50',
        hours: 1
      },
      {
        id: 'mon_1000_em_lec',
        courseId: 'engines_motors',
        type: 'Lecture',
        room: 'FD I 1201',
        startTime: '10:00',
        endTime: '10:50',
        hours: 1
      },
      {
        id: 'mon_1400_enz_lec',
        courseId: 'enzymology',
        type: 'Lecture',
        room: 'NAB 6158',
        startTime: '14:00',
        endTime: '14:50',
        hours: 1
      },
      {
        id: 'mon_1500_re_lec',
        courseId: 'renewable_energy',
        type: 'Lecture',
        room: 'FD I 1231',
        startTime: '15:00',
        endTime: '15:50',
        hours: 1
      },
      {
        id: 'mon_1600_se_lec',
        courseId: 'sports_eng',
        type: 'Lecture',
        room: 'FD I 1202',
        startTime: '16:00',
        endTime: '16:50',
        hours: 1
      }
    ],

    2: [ // Tuesday
      {
        id: 'tue_0800_mm_tut',
        courseId: 'mfg_mgmt',
        type: 'Tutorial',
        room: 'FD I 1223',
        startTime: '08:00',
        endTime: '08:50',
        hours: 1
      },
      {
        id: 'tue_1100_am_lec',
        courseId: 'adv_mfg',
        type: 'Lecture',
        room: 'FD I 1201',
        startTime: '11:00',
        endTime: '11:50',
        hours: 1
      },
      {
        id: 'tue_1200_me_lec',
        courseId: 'machine_elements',
        type: 'Lecture',
        room: 'LTC 5101',
        startTime: '12:00',
        endTime: '12:50',
        hours: 1
      },
      {
        id: 'tue_1400_am_lab',
        courseId: 'adv_mfg',
        type: 'Practical / Lab',
        room: 'Workshop 7101',
        startTime: '14:00',
        endTime: '15:50',
        hours: 2
      },
      {
        id: 'tue_1600_em_tut',
        courseId: 'engines_motors',
        type: 'Tutorial',
        room: 'FD I 1202',
        startTime: '16:00',
        endTime: '16:50',
        hours: 1
      }
    ],

    3: [ // Wednesday
      {
        id: 'wed_0800_am_tut',
        courseId: 'adv_mfg',
        type: 'Tutorial',
        room: 'FD I 1201',
        startTime: '08:00',
        endTime: '08:50',
        hours: 1
      },
      {
        id: 'wed_0900_mm_lec',
        courseId: 'mfg_mgmt',
        type: 'Lecture',
        room: 'LTC 5106',
        startTime: '09:00',
        endTime: '09:50',
        hours: 1
      },
      {
        id: 'wed_1000_em_lec',
        courseId: 'engines_motors',
        type: 'Lecture',
        room: 'FD I 1201',
        startTime: '10:00',
        endTime: '10:50',
        hours: 1
      },
      {
        id: 'wed_1400_enz_lec',
        courseId: 'enzymology',
        type: 'Lecture',
        room: 'NAB 6158',
        startTime: '14:00',
        endTime: '14:50',
        hours: 1
      },
      {
        id: 'wed_1500_re_lec',
        courseId: 'renewable_energy',
        type: 'Lecture',
        room: 'FD I 1231',
        startTime: '15:00',
        endTime: '15:50',
        hours: 1
      },
      {
        id: 'wed_1600_se_lec',
        courseId: 'sports_eng',
        type: 'Lecture',
        room: 'FD I 1202',
        startTime: '16:00',
        endTime: '16:50',
        hours: 1
      }
    ],

    4: [ // Thursday
      {
        id: 'thu_1100_am_lec',
        courseId: 'adv_mfg',
        type: 'Lecture',
        room: 'FD I 1201',
        startTime: '11:00',
        endTime: '11:50',
        hours: 1
      },
      {
        id: 'thu_1200_me_lec',
        courseId: 'machine_elements',
        type: 'Lecture',
        room: 'LTC 5101',
        startTime: '12:00',
        endTime: '12:50',
        hours: 1
      },
      {
        id: 'thu_1800_nvc_lec',
        courseId: 'new_venture',
        type: 'Lecture',
        room: 'LTC 5103',
        startTime: '18:00',
        endTime: '19:50',
        hours: 2
      }
    ],

    5: [ // Friday
      {
        id: 'fri_1200_me_lec',
        courseId: 'machine_elements',
        type: 'Lecture',
        room: 'LTC 5101',
        startTime: '12:00',
        endTime: '12:50',
        hours: 1
      },
      {
        id: 'fri_1400_enz_lec',
        courseId: 'enzymology',
        type: 'Lecture',
        room: 'NAB 6158',
        startTime: '14:00',
        endTime: '14:50',
        hours: 1
      },
      {
        id: 'fri_1500_re_lec',
        courseId: 'renewable_energy',
        type: 'Lecture',
        room: 'FD I 1231',
        startTime: '15:00',
        endTime: '15:50',
        hours: 1
      },
      {
        id: 'fri_1600_se_lec',
        courseId: 'sports_eng',
        type: 'Lecture',
        room: 'FD I 1202',
        startTime: '16:00',
        endTime: '16:50',
        hours: 1
      }
    ],

    6: [], // Saturday: Free / No classes
    0: []  // Sunday: Free / No classes
  };

  // ==========================================
  // 3. PERSISTENCE LAYER (localStorage)
  // ==========================================

  const STORAGE_KEYS = {
    ATTENDANCE: 'me_timetable_attendance',
    NOTES: 'me_timetable_notes',
    BASELINE: 'me_timetable_baseline' // Optional: prior attendance totals
  };

  function getStorage(key, fallback) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`[Timetable] Failed to read ${key}:`, e);
      return fallback;
    }
  }

  function setStorage(key, value) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Timetable] Failed to save ${key}:`, e);
    }
  }

  // ==========================================
  // 4. LOGIC 1: DAILY SCHEDULE FILTER
  // ==========================================

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * Resolves reference (date object, string, or number) into date context
   */
  function parseDateContext(input = new Date()) {
    let target = new Date();

    if (input instanceof Date) {
      target = new Date(input);
    } else if (typeof input === 'number') {
      // Day of week index 0-6
      const currentDay = target.getDay();
      target.setDate(target.getDate() + (input - currentDay));
    } else if (typeof input === 'string') {
      const str = input.trim().toLowerCase();
      if (str === 'today') {
        // target is today
      } else if (str === 'tomorrow') {
        target.setDate(target.getDate() + 1);
      } else if (str === 'yesterday') {
        target.setDate(target.getDate() - 1);
      } else {
        const foundDay = DAY_NAMES.findIndex(d => d.toLowerCase() === str);
        if (foundDay !== -1) {
          const currentDay = target.getDay();
          target.setDate(target.getDate() + (foundDay - currentDay));
        } else {
          target = new Date(input);
        }
      }
    }

    const dayIndex = target.getDay();
    const dateStr = target.toISOString().slice(0, 10);
    return {
      dateObj: target,
      dateStr,
      dayIndex,
      dayName: DAY_NAMES[dayIndex],
      isWeekend: dayIndex === 0 || dayIndex === 6
    };
  }

  /**
   * Filter daily schedule for current day (or specified date)
   * Enriches each class slot with:
   * - Full course info (name, code, colors, icon)
   * - Recorded attendance status & timestamp
   * - Quick class note
   * - Live timeline status (isNow, isPast, isUpcoming)
   * 
   * @param {Date|string|number} [dateRef=new Date()]
   * @returns {{ date: string, dayName: string, isFreeDay: boolean, classes: Array<Object> }}
   */
  function getDailySchedule(dateRef = new Date()) {
    const { dateStr, dayIndex, dayName, isWeekend } = parseDateContext(dateRef);
    const slots = WEEKLY_SCHEDULE[dayIndex] || [];
    const attendanceRecords = getStorage(STORAGE_KEYS.ATTENDANCE, {});
    const notesRecords = getStorage(STORAGE_KEYS.NOTES, {});

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const isToday = dateStr === todayStr;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const enrichedClasses = slots.map(slot => {
      const course = COURSES[slot.courseId] || {
        name: 'Unknown Subject',
        shortName: 'Unknown',
        code: '',
        color: '#64748b',
        badgeBg: '#f1f5f9',
        textColor: '#0f172a',
        icon: '📚'
      };

      const recordKey = `${dateStr}_${slot.id}`;
      const attRecord = attendanceRecords[recordKey] || null;
      const classNote = notesRecords[recordKey] ? notesRecords[recordKey].text : '';

      // Calculate class timeframe in minutes
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const slotStartMins = startH * 60 + startM;
      const slotEndMins = endH * 60 + endM;

      let isNow = false;
      let isPast = false;
      let isUpcoming = false;

      if (isToday) {
        if (nowMinutes >= slotStartMins && nowMinutes <= slotEndMins) {
          isNow = true;
        } else if (nowMinutes > slotEndMins) {
          isPast = true;
        } else {
          isUpcoming = true;
        }
      } else {
        const isBeforeToday = dateStr < todayStr;
        isPast = isBeforeToday;
        isUpcoming = !isBeforeToday;
      }

      return {
        id: slot.id,
        courseId: slot.courseId,
        courseName: course.name,
        shortName: course.shortName,
        courseCode: course.code,
        courseColor: course.color,
        courseBadgeBg: course.badgeBg,
        courseTextColor: course.textColor,
        icon: course.icon,
        type: slot.type, // Lecture, Tutorial, Practical / Lab
        room: slot.room,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hours: slot.hours || 1,
        timeFormatted: `${slot.startTime} - ${slot.endTime}`,
        // Attendance Status: 'present' | 'absent' | 'cancelled' | 'unmarked'
        status: attRecord ? attRecord.status : 'unmarked',
        markedAt: attRecord ? attRecord.timestamp : null,
        // Class Note
        note: classNote,
        // Temporal state
        isNow,
        isPast,
        isUpcoming
      };
    });

    return {
      date: dateStr,
      dayName,
      isFreeDay: slots.length === 0,
      classes: enrichedClasses
    };
  }

  /**
   * Helper to retrieve active class and upcoming class for today
   */
  function getCurrentAndUpcoming() {
    const { classes, isFreeDay } = getDailySchedule(new Date());
    if (isFreeDay) return { current: null, upcoming: null, isFreeDay: true };

    const current = classes.find(c => c.isNow) || null;
    const upcoming = classes.find(c => c.isUpcoming) || null;

    return { current, upcoming, isFreeDay: false };
  }

  // ==========================================
  // 5. LOGIC 2: MARK ATTENDANCE
  // ==========================================

  const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    CANCELLED: 'cancelled',
    UNMARKED: 'unmarked'
  };

  /**
   * Mark attendance for a slot on a specific date.
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @param {string} slotId - e.g. 'mon_0800_me_tut'
   * @param {'present'|'absent'|'cancelled'|'unmarked'} status
   * @returns {Object} Updated slot record & subject updated stats
   */
  function markAttendance(dateStr, slotId, status) {
    const valid = ['present', 'absent', 'cancelled', 'unmarked'];
    if (!valid.includes(status)) {
      throw new Error(`Invalid attendance status "${status}". Allowed: ${valid.join(', ')}`);
    }

    // Find courseId for this slot
    let courseId = null;
    for (const daySlots of Object.values(WEEKLY_SCHEDULE)) {
      const match = daySlots.find(s => s.id === slotId);
      if (match) {
        courseId = match.courseId;
        break;
      }
    }

    const records = getStorage(STORAGE_KEYS.ATTENDANCE, {});
    const recordKey = `${dateStr}_${slotId}`;

    if (status === 'unmarked') {
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

    setStorage(STORAGE_KEYS.ATTENDANCE, records);

    return {
      recordKey,
      status,
      subjectStats: courseId ? getSubjectAttendance(courseId) : null
    };
  }

  /**
   * Get attendance status of a slot on a given date
   */
  function getAttendanceStatus(dateStr, slotId) {
    const records = getStorage(STORAGE_KEYS.ATTENDANCE, {});
    const record = records[`${dateStr}_${slotId}`];
    return record ? record.status : 'unmarked';
  }

  // ==========================================
  // 6. LOGIC 3: ATTENDANCE PERCENTAGE & 75% WARNING
  // ==========================================

  const BITS_MINIMUM_ATTENDANCE = 75.0;

  /**
   * Calculates attendance metrics, 75% policy compliance, and bunk buffer
   * for a given subject.
   * 
   * BITS Pilani Academic Rules applied:
   * - Held Classes = Present + Absent.
   * - Cancelled classes are NOT counted as held classes.
   * - Attendance % = (Present / Held) * 100.
   * - Warning is triggered if percentage < 75.0%.
   * - Can Bunk: Max upcoming classes you can safely miss without dropping below 75%.
   * - Must Attend: Minimum consecutive upcoming classes you MUST attend to reach 75%.
   * 
   * @param {string} courseId - e.g. 'machine_elements'
   * @returns {Object} Subject attendance report
   */
  function getSubjectAttendance(courseId) {
    const course = COURSES[courseId];
    if (!course) {
      throw new Error(`Course not found: "${courseId}"`);
    }

    const records = getStorage(STORAGE_KEYS.ATTENDANCE, {});
    const baselineMap = getStorage(STORAGE_KEYS.BASELINE, {});
    const baseline = baselineMap[courseId] || { attended: 0, absent: 0 };

    let attended = baseline.attended || 0;
    let absent = baseline.absent || 0;
    let cancelled = 0;

    Object.values(records).forEach(rec => {
      if (rec.courseId === courseId) {
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

    // Bunk Buffer: Maximum future classes you can miss while keeping attendance >= 75%
    // attended / (totalHeld + B) >= 0.75  =>  B <= (attended / 0.75) - totalHeld
    let safeToBunk = 0;
    if (percentage >= BITS_MINIMUM_ATTENDANCE && totalHeld > 0) {
      safeToBunk = Math.max(0, Math.floor((attended / 0.75) - totalHeld));
    }

    // Recovery Buffer: Number of consecutive classes to attend to reach 75%
    // (attended + R) / (totalHeld + R) >= 0.75 => R >= (0.75 * totalHeld - attended) / 0.25 = 3 * absent - attended
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
        ? `Attendance ${percentage}% is below 75%! Attend the next ${mustAttend} class(es) to recover.` 
        : `Attendance is healthy (${percentage}%). You can safely bunk ${safeToBunk} class(es).`
    };
  }

  /**
   * Generates full attendance dashboard across all 8 subjects
   */
  function getAllSubjectsAttendance() {
    const subjects = Object.keys(COURSES).map(id => getSubjectAttendance(id));

    const totalHeld = subjects.reduce((sum, s) => sum + s.totalHeld, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const totalAbsent = subjects.reduce((sum, s) => sum + s.absent, 0);
    const totalCancelled = subjects.reduce((sum, s) => sum + s.cancelled, 0);
    const overallPercentage = totalHeld > 0 
      ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) 
      : 100.0;

    const lowAttendanceList = subjects.filter(s => s.isLowAttendance);

    return {
      subjects,
      overall: {
        totalHeld,
        totalAttended,
        totalAbsent,
        totalCancelled,
        overallPercentage,
        hasLowAttendance: lowAttendanceList.length > 0,
        lowAttendanceCount: lowAttendanceList.length
      },
      lowAttendanceList
    };
  }

  // ==========================================
  // 7. LOGIC 4: QUICK CLASS NOTE LOGGING
  // ==========================================

  /**
   * Save or edit quick note for a specific class instance
   * @param {string} dateStr - 'YYYY-MM-DD'
   * @param {string} slotId - e.g. 'mon_0800_me_tut'
   * @param {string} noteText - content of the note
   */
  function saveClassNote(dateStr, slotId, noteText) {
    const notes = getStorage(STORAGE_KEYS.NOTES, {});
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

    setStorage(STORAGE_KEYS.NOTES, notes);
    return { recordKey, note: notes[recordKey] || null };
  }

  /**
   * Get note for a specific class slot
   */
  function getClassNote(dateStr, slotId) {
    const notes = getStorage(STORAGE_KEYS.NOTES, {});
    const record = notes[`${dateStr}_${slotId}`];
    return record ? record.text : '';
  }

  /**
   * Retrieve all notes recorded across time for a specific subject
   * @param {string} courseId 
   */
  function getSubjectNotes(courseId) {
    const notes = getStorage(STORAGE_KEYS.NOTES, {});
    
    // Find all slots belonging to this course
    const courseSlotIds = new Set();
    Object.values(WEEKLY_SCHEDULE).forEach(daySlots => {
      daySlots.forEach(s => {
        if (s.courseId === courseId) courseSlotIds.add(s.id);
      });
    });

    const matches = [];
    Object.values(notes).forEach(item => {
      if (courseSlotIds.has(item.slotId)) {
        matches.push(item);
      }
    });

    return matches.sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  // ==========================================
  // 8. DATA IMPORT / EXPORT / RESET
  // ==========================================

  function exportData() {
    return {
      attendance: getStorage(STORAGE_KEYS.ATTENDANCE, {}),
      notes: getStorage(STORAGE_KEYS.NOTES, {}),
      baseline: getStorage(STORAGE_KEYS.BASELINE, {}),
      exportedAt: new Date().toISOString()
    };
  }

  function importData(data) {
    if (!data) return false;
    if (data.attendance) setStorage(STORAGE_KEYS.ATTENDANCE, data.attendance);
    if (data.notes) setStorage(STORAGE_KEYS.NOTES, data.notes);
    if (data.baseline) setStorage(STORAGE_KEYS.BASELINE, data.baseline);
    return true;
  }

  function resetAllAttendance() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.BASELINE);
  }

  // ==========================================
  // EXPORT INTERFACE
  // ==========================================

  return {
    COURSES,
    WEEKLY_SCHEDULE,
    ATTENDANCE_STATUS,
    BITS_MINIMUM_ATTENDANCE,
    // Daily schedule
    parseDateContext,
    getDailySchedule,
    getCurrentAndUpcoming,
    // Attendance
    markAttendance,
    getAttendanceStatus,
    getSubjectAttendance,
    getAllSubjectsAttendance,
    // Notes
    saveClassNote,
    getClassNote,
    getSubjectNotes,
    // Backup & Sync
    exportData,
    importData,
    resetAllAttendance
  };
});
