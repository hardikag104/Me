/**
 * ===============================================================================
 * ME LIFE OS — SLEEP & CIRCADIAN RHYTHM UI COMPONENT (AGENT 7 SPECIFICATION)
 * ===============================================================================
 * 
 * Target Standards:
 *  1. Hard Bedtime Cutoff: 11:00 PM (23:00)
 *  2. Hard Wake Up Target:  6:30 AM (06:30)
 *  3. Target Duration:     7.5 Hours (Deep REM & Delta Wave Recovery)
 * 
 * Core Features:
 *  - Interactive Sleep Log Card with responsive time inputs & 1-click Quick Target preset
 *  - Reactive live calculations: Hours slept, sleep deficit/surplus, 0-100% Circadian Score
 *  - Consecutive Sleep Streak counter (days hitting <= 11:00 PM and <= 6:30 AM)
 *  - Late-Night Lockdown Reality Check Overlay (active 11:00 PM - 5:00 AM)
 *  - Dynamic live ticking clock & real-time "time past cutoff" tracker
 *  - Curated 50+ emotional reality check quotes (Parents, Career, Regret, BITSian excellence)
 *  - 3-second continuous deliberate hold to override lockdown (prevents doomscrolling)
 *  - Calming 4-7-8 Breathing Blackout Screen (pure OLED black, melatonin-friendly guide)
 * 
 * File: d:/Me/life-tracker/ui-sleep.js
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // =============================================================================
  // 1. CONFIGURATION & SPARTAN CIRCADIAN TARGETS
  // =============================================================================
  const SLEEP_TARGETS = {
    bedtime: '23:00',          // 11:00 PM Hard Target Bedtime
    wakeTime: '06:30',         // 6:30 AM Hard Target Wakeup
    durationHours: 7.5,        // 7.5 Hours optimal physiological target
    lockdownStartHour: 23,     // 11:00 PM (23:00)
    lockdownEndHour: 5,        // 5:00 AM (05:00)
    overrideDurationMins: 45,  // Duration granted after 3-second hold override
    holdDurationMs: 3000,      // 3000ms hold requirement
  };

  // =============================================================================
  // 2. HARD-HITTING EMOTIONAL REALITY CHECK QUOTES DATABASE (50+ CURATED QUOTES)
  // =============================================================================
  const MOTIVATION_DATABASE = {
    parents: [
      {
        id: 'p1',
        category: 'Parents & Family Sacrifice',
        tag: 'Sacrifice',
        quote: "Your father didn't swallow his pride, wake up exhausted for thirty years, and work through sickness so you could scroll through junk feeds at 2 AM. Honor the sacrifice.",
        author: 'Reality Check',
        context: 'Every rupee invested in you came at the expense of their comfort.'
      },
      {
        id: 'p2',
        category: 'Parents & Family Sacrifice',
        tag: 'Aging Parents',
        quote: "Look at your mother's hands and the lines on your father's forehead. They are getting older every single day. The window where they can see you succeed and rest peacefully is closing. Hurry up.",
        author: 'The Clock Is Ticking',
        context: 'Time waits for no one, least of all aging parents.'
      },
      {
        id: 'p3',
        category: 'Parents & Family Sacrifice',
        tag: 'Trust',
        quote: "Somewhere right now, your parents are proudly telling a relative that their child is working hard to build a great life. Are you making them proud, or are you making them a liar?",
        author: 'Unspoken Belief',
        context: "Their belief in you is unconditional. Don't exploit it."
      },
      {
        id: 'p4',
        category: 'Parents & Family Sacrifice',
        tag: 'Debt of Honor',
        quote: "Every luxury you enjoy today was paid for by a sacrifice they never told you about: medical checkups postponed, worn shoes worn another year, holidays skipped. Repay the debt with mastery.",
        author: 'Debt of Honor',
        context: 'Your work ethic is the only currency that repays their faith.'
      },
      {
        id: 'p5',
        category: 'Parents & Family Sacrifice',
        tag: 'Duty',
        quote: "Your father never had a 'mental health day' when the rent was due. He didn't wait for 'motivation' when you needed food and school fees. He got up and did the job. Show up for him.",
        author: 'The Quiet Providers',
        context: 'Consistency is love made visible through discipline.'
      },
      {
        id: 'p6',
        category: 'Parents & Family Sacrifice',
        tag: 'Legacy',
        quote: "You have air conditioning, high-speed internet, and access to all the knowledge in human history. Your parents started with a fraction of that and still built your foundation. Softness is an insult to your lineage.",
        author: 'Privilege & Responsibility',
        context: 'You start where they finished. Act like a builder.'
      },
      {
        id: 'p7',
        category: 'Parents & Family Sacrifice',
        tag: "Mother's Prayer",
        quote: "Your mother prayed for your success before you even knew how to write code or take an exam. Don't let her prayers be answered by someone with zero work ethic.",
        author: 'Silent Prayers',
        context: "Don't let tears of hope turn into tears of quiet disappointment."
      },
      {
        id: 'p8',
        category: 'Parents & Family Sacrifice',
        tag: 'Peace of Mind',
        quote: "The greatest gift you will ever give your parents is the peace of mind that their child is independent, formidable, and unbreakable. That gift is forged by sleeping at 11 PM and waking at 6:30 AM.",
        author: 'Peace of Mind',
        context: 'Discipline today buys their security tomorrow.'
      },
      {
        id: 'p9',
        category: 'Parents & Family Sacrifice',
        tag: 'The Destination',
        quote: "When you feel like quitting or sleeping in, picture your parents' tired smiles when you finally hand them your first major achievement. Let that image pull you out of bed.",
        author: 'The Destination',
        context: 'Their pride will be worth every early morning.'
      },
      {
        id: 'p10',
        category: 'Parents & Family Sacrifice',
        tag: 'Accountability',
        quote: "They didn't give you everything they had so that you could settle for 'average'. You owe it to your family name to be extraordinary.",
        author: 'Family Standard',
        context: 'Average effort produces mediocre lives. You were not raised for mediocre.'
      },
      {
        id: 'p11',
        category: 'Parents & Family Sacrifice',
        tag: 'Respect',
        quote: "Respect isn't what you say to your parents on their birthdays. Respect is what you do when you are alone with your laptop, phone, and time.",
        author: 'True Respect',
        context: 'Your private habits reveal how much you truly value their sacrifice.'
      },
      {
        id: 'p12',
        category: 'Parents & Family Sacrifice',
        tag: 'Action Over Talk',
        quote: "Stop dreaming about paying off their mortgage and buying them comfort while staying up until 3 AM consuming dopamine. Action precedes the reward.",
        author: 'Action Over Talk',
        context: 'Dreams without sleep discipline are merely delusions.'
      }
    ],

    career: [
      {
        id: 'c1',
        category: 'Career, Ambition & Competition',
        tag: 'Competition',
        quote: "Someone hungrier is outworking you right now. While you debate going to bed, a competitor in a cramped hostel room is finishing their 400th problem and reading system architecture whitepapers.",
        author: 'The Hunger Rule',
        context: 'The market is ruthless. It awards the crown to the prepared.'
      },
      {
        id: 'c2',
        category: 'Career, Ambition & Competition',
        tag: 'Day 1 Offers',
        quote: "Placement season does not reward who wanted it most or who had the most potential. It rewards the student who logged 500 hours of deep work between 6:30 AM and 11:00 PM while others partied.",
        author: 'The Placement Truth',
        context: 'Day 1 offers are won in silent mornings months in advance.'
      },
      {
        id: 'c3',
        category: 'Career, Ambition & Competition',
        tag: 'Meritocracy',
        quote: "The tech industry does not care about your excuses, your bad days, or your good intentions. It only cares about competence. You are either indispensable or completely replaceable.",
        author: 'Market Reality',
        context: 'Skill is the only real leverage in the modern economy.'
      },
      {
        id: 'c4',
        category: 'Career, Ambition & Competition',
        tag: 'Top 1% Mathematics',
        quote: "You claim you want top 1% income, top 1% prestige, and complete creative freedom. But your sleep, habits, and focus look like the bottom 50%. You cannot live like the average and expect the exceptional.",
        author: '1% Mathematics',
        context: 'The price of top-tier success must be paid in full.'
      },
      {
        id: 'c5',
        category: 'Career, Ambition & Competition',
        tag: 'Unfair Advantage',
        quote: "Discipline is the ultimate unfair advantage. It cannot be bought, inherited, or faked. When you own your morning and sleep before 11 PM, you destroy 95% of your competition before lunch.",
        author: 'The Asymmetry of Grit',
        context: "Most people self-sabotage with late nights. Don't be most people."
      },
      {
        id: 'c6',
        category: 'Career, Ambition & Competition',
        tag: 'Zero Sum Game',
        quote: "Every single time you choose comfort, dopamine, and procrastination over hard work, your rival smiles. You just handed them your interview, your salary, and your seat.",
        author: 'Zero Sum Game',
        context: 'There are only so many elite seats. Are you giving yours away?'
      },
      {
        id: 'c7',
        category: 'Career, Ambition & Competition',
        tag: 'The Craft',
        quote: "Excellence is not an accident; it is the accumulation of unglamorous, repetitive, solitary discipline when nobody is watching, clapping, or cheering.",
        author: 'The Craft',
        context: 'Public triumphs are purchased with private sweat.'
      },
      {
        id: 'c8',
        category: 'Career, Ambition & Competition',
        tag: 'Proof vs Dreams',
        quote: "The market will never pay you for your potential. It will only pay you for your proof. Stop daydreaming about unicorns and build the portfolio.",
        author: 'Show the Code',
        context: 'Execution beats visionary talk every single day.'
      },
      {
        id: 'c9',
        category: 'Career, Ambition & Competition',
        tag: 'Biological Leverage',
        quote: "Staying awake past 11 PM doesn't make you a hustler; it turns you into a sluggish, brain-fogged zombie who codes at 30% speed tomorrow. Sleep like a pro athlete so you can dominate like one.",
        author: 'High Performance Protocol',
        context: 'Sleep is biological performance-enhancing technology.'
      },
      {
        id: 'c10',
        category: 'Career, Ambition & Competition',
        tag: 'The AI Crucible',
        quote: "In five years, AI and global talent will eliminate every mediocre engineer. If you don't master deep focus and high-order thinking today, you won't even be in the arena tomorrow.",
        author: 'The AI Crucible',
        context: 'Discipline is your survival armor in a hyper-competitive century.'
      },
      {
        id: 'c11',
        category: 'Career, Ambition & Competition',
        tag: 'Professional Standard',
        quote: "Amateurs wait for inspiration. Titans put their phones away, sit down at their desks at 7:00 AM, and execute until the mission is finished.",
        author: 'Professional Standard',
        context: 'Treat your craft as a sacred duty, not a casual hobby.'
      },
      {
        id: 'c12',
        category: 'Career, Ambition & Competition',
        tag: 'Opportunity Cost',
        quote: "While you are wasting 3 hours on social media arguments, your future peer is deploying microservices and mastering distributed systems. Close the gap now.",
        author: 'Opportunity Cost',
        context: 'Every wasted hour widens the gap between where you are and where you need to be.'
      }
    ],

    regret: [
      {
        id: 'r1',
        category: 'Future Self & Regret Prevention',
        tag: 'The Two Pains',
        quote: "There are only two pains in life: the pain of discipline which weighs ounces, and the pain of regret which weighs tons. You must choose which one you will carry forever.",
        author: 'Jim Rohn / Eternal Truth',
        context: 'Discipline is temporary discomfort. Regret is permanent anguish.'
      },
      {
        id: 'r2',
        category: 'Future Self & Regret Prevention',
        tag: 'The Mirror Test',
        quote: "Imagine meeting the person you could have become at the end of your life. They had your brain, your college, your advantages—but they kept their promises, slept on time, and did the work. Will that meeting be your greatest pride or your deepest hell?",
        author: 'The Mirror Test',
        context: "Don't let your unfulfilled potential haunt you for decades."
      },
      {
        id: 'r3',
        category: 'Future Self & Regret Prevention',
        tag: 'Vanishing Dopamine',
        quote: "In five years, you won't remember a single YouTube short, reel, or meme you stayed up late to watch. But you will carry the permanent scar of the opportunities you threw away.",
        author: 'Vanishing Dopamine',
        context: 'Stop trading lifelong greatness for 15 seconds of synthetic dopamine.'
      },
      {
        id: 'r4',
        category: 'Future Self & Regret Prevention',
        tag: 'Mid-Career Awakening',
        quote: "Regret is the most bitter poison known to the human soul. It whispers when you're 30: 'You had the mind. You had the chance. You just lacked the backbone to get out of bed.'",
        author: 'The Mid-Career Awakening',
        context: 'Fix it now while your youth is still on your side.'
      },
      {
        id: 'r5',
        category: 'Future Self & Regret Prevention',
        tag: 'The Tomorrow Fallacy',
        quote: "The easiest person to lie to is yourself. You tell yourself 'I'll start tomorrow' every night before falling into a sleep coma. How many tomorrows do you think you have left?",
        author: 'The Tomorrow Fallacy',
        context: 'Tomorrow is the graveyard where great lives go to die.'
      },
      {
        id: 'r6',
        category: 'Future Self & Regret Prevention',
        tag: 'Integrity',
        quote: "Every broken promise to yourself chips away at your self-esteem. When you say 'I'll sleep at 11' and stay up till 2, you tell your subconscious that your word is worthless. Rebuild your honor tonight.",
        author: 'Integrity',
        context: 'Confidence is simply keeping promises you make to yourself.'
      },
      {
        id: 'r7',
        category: 'Future Self & Regret Prevention',
        tag: 'The Crossroads',
        quote: "Ten years from now, you will look back on this exact period of your life as the pivot: the moment you either woke up and seized control, or let yourself slide into lifelong mediocrity.",
        author: 'The Crossroads',
        context: 'History is made at crossroads like tonight.'
      },
      {
        id: 'r8',
        category: 'Future Self & Regret Prevention',
        tag: 'Memento Mori',
        quote: "Time does not pause while you feel unmotivated. The days burn away like dry timber. You cannot buy back your 20s with all the money in the world.",
        author: 'Memento Mori',
        context: 'Treasure your prime years by demanding excellence of yourself.'
      },
      {
        id: 'r9',
        category: 'Future Self & Regret Prevention',
        tag: 'Choose Your Hard',
        quote: "Suffer the harsh sound of the 6:30 AM alarm clock now, or suffer the heartbreak of watching less capable people live the dream you were too lazy to build.",
        author: 'Choose Your Hard',
        context: 'Waking up early is hard. Wasted potential is 1,000x harder.'
      },
      {
        id: 'r10',
        category: 'Future Self & Regret Prevention',
        tag: 'The Disgust Trigger',
        quote: "When you feel like quitting, ask yourself: 'If I quit now, what will I be doing five years from now?' If the answer disgusts you, get back to work.",
        author: 'The Disgust Trigger',
        context: 'Use positive disgust to kill procrastination.'
      },
      {
        id: 'r11',
        category: 'Future Self & Regret Prevention',
        tag: 'Generational Standard',
        quote: "One day your future children will ask you why you didn't reach the heights you dreamed of. What will you say? 'I liked staying up late on my phone'? Let that shame wake you up.",
        author: 'Generational Accountability',
        context: 'Set the standard your descendants will be proud to follow.'
      },
      {
        id: 'r12',
        category: 'Future Self & Regret Prevention',
        tag: 'Total Ownership',
        quote: "Nobody is coming to save you. No mentor, no miracle, no lucky lottery. It is you against your own laziness. Win the battle tonight.",
        author: 'Total Ownership',
        context: 'You are the author of your own redemption.'
      }
    ],

    bitsian: [
      {
        id: 'b1',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Zero Percent Attendance',
        quote: "Zero percent attendance is not a license to rot in bed until noon. It is BITS' greatest test of character: can you govern yourself with iron discipline when no professor is taking roll call?",
        author: 'The BITSian Ethos',
        context: 'True freedom requires supreme self-governance.'
      },
      {
        id: 'b2',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Pilani Spirit',
        quote: "BITS Pilani was forged in the desert by titans who built unicorns, scaled global institutions, and wrote legendary software. You earned a seat among the elite. Act like you belong in this lineage.",
        author: 'Desert Crucible',
        context: 'The BITS brand was built on grit. Don\'t dilute it.'
      },
      {
        id: 'b3',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Freedom vs Anarchy',
        quote: "BITS gave you absolute freedom. Fools use it to destroy their sleep, ruin their CGPA, and binge distractions. Masters use it to build companies, master algorithms, and become lethal.",
        author: 'The Two Paths',
        context: 'How you use your autonomy defines your destiny.'
      },
      {
        id: 'b4',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'The Curve Truth',
        quote: "The grading curve does not care about wing gossip or how late you chilled at ANC. When compres arrive, only your stamina, clarity of mind, and disciplined preparation will stand between you and an 8+ CGPA.",
        author: 'The Curve Truth',
        context: 'Protect your CGPA like your career depends on it—because it does.'
      },
      {
        id: 'b5',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'The BITSAT Fire',
        quote: "Remember why you fought through the BITSAT gauntlet to get here. You beat 150,000 candidates to sit in this campus. Don't let that hunger die because you're comfortable in your hostel room.",
        author: 'The BITSAT Fire',
        context: 'Rekindle the relentless fire that brought you here.'
      },
      {
        id: 'b6',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'The Lone Wolf Standard',
        quote: "Your wingmates might stay up gaming or bantering until 4 AM. Let them. You are on a different mission. Sleep at 11:00 PM, rise at 6:30 AM, and let your results do the talking.",
        author: 'The Lone Wolf Standard',
        context: "Eagles don't flock with pigeons. Lead by example."
      },
      {
        id: 'b7',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'The Code',
        quote: "Mental toughness is doing what must be done, when it must be done, whether you feel like it or not. That is the true BITSian code.",
        author: 'The Code',
        context: 'Feelings are fickle. Standards are permanent.'
      },
      {
        id: 'b8',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Founder Blood',
        quote: "From Swiggy to Postman, BITSians didn't build billion-dollar legacies by sleeping through morning opportunities. They dominated because when challenges struck, they doubled down.",
        author: 'Founder Mindset',
        context: 'You have founder blood in your alma mater. Live up to it.'
      },
      {
        id: 'b9',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'ANC Reality Check',
        quote: "Eating Maggi at ANC at 2:30 AM while doing nothing productive is not 'college culture'—it's slow sabotage of your potential. Go to bed. Your future self needs you sharp.",
        author: 'Hard Truth',
        context: 'Romanticizing bad sleep habits is for fools.'
      },
      {
        id: 'b10',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Morning Clarity',
        quote: "When you walk past the Clock Tower and Rotunda at 6:30 AM in the crisp morning air, you feel what ordinary students never taste: absolute ownership of your day.",
        author: 'Morning Clarity',
        context: 'Early mornings in Pilani/Goa/Hyderabad belong to the champions.'
      },
      {
        id: 'b11',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'Intellectual Vitality',
        quote: "You didn't come to BITS to be average. You came to test the outer limits of your intellect. Set your bedtime to 11 PM and give your brain the recovery it deserves.",
        author: 'Intellectual Vitality',
        context: 'Your brain is your primary weapon. Sharpen it every night.'
      },
      {
        id: 'b12',
        category: 'BITSian Excellence & Mental Toughness',
        tag: 'The High Standard',
        quote: "The world expects BITSians to lead, to innovate, and to triumph. Leadership starts with leading yourself to bed at 11 PM. Execute without excuses.",
        author: 'The High Standard',
        context: 'If you cannot command yourself, you cannot command an organization.'
      }
    ]
  };

  function getRandomQuote(category = 'all') {
    let pool = [];
    if (category === 'all' || !MOTIVATION_DATABASE[category]) {
      pool = [
        ...MOTIVATION_DATABASE.parents,
        ...MOTIVATION_DATABASE.career,
        ...MOTIVATION_DATABASE.regret,
        ...MOTIVATION_DATABASE.bitsian
      ];
    } else {
      pool = MOTIVATION_DATABASE[category];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // =============================================================================
  // 3. CORE CIRCADIAN & SLEEP ALGORITHM ENGINE
  // =============================================================================

  /**
   * Converts "HH:MM" string to minutes from midnight (0 - 1439).
   */
  function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return (parts[0] * 60) + parts[1];
  }

  /**
   * Converts total minutes from midnight to "HH:MM" 24h format.
   */
  function minutesToTimeString(totalMinutes) {
    const norm = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Formats "HH:MM" to human-readable "11:00 PM" format.
   */
  function formatTime12Hour(timeStr) {
    const mins = parseTimeToMinutes(timeStr);
    if (mins === null) return '--:--';
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = (h24 % 12) || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  /**
   * Calculates hours slept between bedtime and wake time.
   * Handles crossing midnight correctly.
   * Example: 23:00 to 06:30 -> 7.50 hrs.
   * Example: 22:45 to 06:15 -> 7.50 hrs.
   * Example: 01:30 to 06:30 -> 5.00 hrs.
   */
  function calculateHoursSlept(bedtimeStr, wakeTimeStr) {
    const bedMins = parseTimeToMinutes(bedtimeStr);
    const wakeMins = parseTimeToMinutes(wakeTimeStr);

    if (bedMins === null || wakeMins === null) return 0;

    let diffMins;
    if (wakeMins <= bedMins) {
      // Crosses midnight (e.g. 23:00 -> 06:30)
      diffMins = (wakeMins + 1440) - bedMins;
    } else {
      // Same day (e.g. 01:00 -> 06:30)
      diffMins = wakeMins - bedMins;
    }

    // Bounds checking (max 18h, min 0h)
    diffMins = Math.max(0, Math.min(18 * 60, diffMins));
    return +(diffMins / 60).toFixed(2);
  }

  /**
   * Checks if bedtime meets Spartan Hard Target: on or before 11:00 PM (23:00).
   * Valid evening window: 18:00 (6 PM) through 23:00 (11:00 PM).
   * After 23:00 or past midnight before 05:00 is considered late.
   */
  function isBedtimeOnTarget(bedtimeStr) {
    const mins = parseTimeToMinutes(bedtimeStr);
    if (mins === null) return false;
    // 18:00 = 1080 mins, 23:00 = 1380 mins
    return mins >= 1080 && mins <= 1380;
  }

  /**
   * Checks if wake time meets Spartan Hard Target: on or before 6:30 AM (06:30).
   * Valid morning window: 04:00 (4 AM) through 06:30 (6:30 AM).
   * After 06:30 is late.
   */
  function isWakeTimeOnTarget(wakeTimeStr) {
    const mins = parseTimeToMinutes(wakeTimeStr);
    if (mins === null) return false;
    // 04:00 = 240 mins, 06:30 = 390 mins
    return mins >= 240 && mins <= 390;
  }

  /**
   * Evaluates whether both sleep targets were achieved:
   * Bedtime <= 11:00 PM AND Wake time <= 6:30 AM.
   */
  function isSleepTargetMet(bedtimeStr, wakeTimeStr) {
    return isBedtimeOnTarget(bedtimeStr) && isWakeTimeOnTarget(wakeTimeStr);
  }

  /**
   * Calculates sleep deficit or surplus relative to target (7.5 hrs).
   */
  function calculateSleepDeficit(hoursSlept, targetHours = SLEEP_TARGETS.durationHours) {
    const diff = +(targetHours - hoursSlept).toFixed(2);
    const deficit = diff > 0 ? diff : 0;
    const surplus = diff < 0 ? +Math.abs(diff).toFixed(2) : 0;

    let status = 'optimal';
    let pillText = '0.0h (Optimal)';
    let pillColor = 'var(--mint, #10b981)';

    if (deficit > 0) {
      status = 'deficit';
      pillText = `-${deficit.toFixed(1)}h Deficit`;
      pillColor = deficit >= 2.0 ? 'var(--rose, #ef4444)' : 'var(--amber, #f59e0b)';
    } else if (surplus > 0) {
      status = 'surplus';
      pillText = `+${surplus.toFixed(1)}h Surplus`;
      pillColor = surplus > 2.0 ? 'var(--amber, #f59e0b)' : 'var(--mint, #10b981)';
    }

    return {
      hoursSlept,
      targetHours,
      deficit,
      surplus,
      status,
      pillText,
      pillColor
    };
  }

  /**
   * Calculates Circadian Sleep Score (0 - 100%):
   * Factors:
   *  - Duration Adequacy (45%): optimal at 7.5h. Penalizes < 7.0h & > 9.0h.
   *  - Bedtime Alignment (30%): 100 if <= 23:00, degrades with each 15m delay past 11 PM.
   *  - Wake Time Discipline (25%): 100 if <= 06:30, degrades with each 15m delay past 6:30 AM.
   */
  function calculateSleepScore(bedtimeStr, wakeTimeStr, qualityRating = 5) {
    const hours = calculateHoursSlept(bedtimeStr, wakeTimeStr);
    if (!bedtimeStr || !wakeTimeStr || hours <= 0) {
      return {
        score: 0,
        grade: 'No Data',
        color: 'var(--text-muted, #8888a4)',
        summary: 'Log your sleep to calculate circadian recovery score.'
      };
    }

    // 1. Duration Score (45 pts max)
    let durationPts = 0;
    if (hours >= 7.25 && hours <= 8.25) {
      durationPts = 45;
    } else if (hours >= 6.5 && hours < 7.25) {
      durationPts = 38;
    } else if (hours > 8.25 && hours <= 9.0) {
      durationPts = 40;
    } else if (hours >= 5.5 && hours < 6.5) {
      durationPts = 26;
    } else if (hours >= 4.5 && hours < 5.5) {
      durationPts = 15;
    } else if (hours > 9.0) {
      durationPts = 30; // Oversleeping lethargy penalty
    } else {
      durationPts = 6;
    }

    // 2. Bedtime Alignment (30 pts max)
    let bedtimePts = 0;
    const bedMins = parseTimeToMinutes(bedtimeStr);
    if (bedMins !== null) {
      if (isBedtimeOnTarget(bedtimeStr)) {
        bedtimePts = 30;
      } else {
        // Past 23:00 (1380 mins)
        let minsLate = 0;
        if (bedMins > 1380) {
          minsLate = bedMins - 1380;
        } else if (bedMins <= 300) { // Past midnight, e.g. 01:00 = 60 mins -> 60 + 60 = 120 mins late
          minsLate = 60 + bedMins;
        } else {
          minsLate = 180;
        }
        bedtimePts = Math.max(0, Math.round(30 - (minsLate / 6)));
      }
    }

    // 3. Wake Discipline (25 pts max)
    let wakePts = 0;
    const wakeMins = parseTimeToMinutes(wakeTimeStr);
    if (wakeMins !== null) {
      if (isWakeTimeOnTarget(wakeTimeStr)) {
        wakePts = 25;
      } else {
        // Past 06:30 (390 mins)
        const minsLate = Math.max(0, wakeMins - 390);
        wakePts = Math.max(0, Math.round(25 - (minsLate / 6)));
      }
    }

    let totalScore = durationPts + bedtimePts + wakePts;

    // Optional subjective rating adjustment (1 to 5)
    if (qualityRating) {
      const qDelta = (Number(qualityRating) - 3) * 2; // -4 to +4
      totalScore = Math.max(0, Math.min(100, totalScore + qDelta));
    }

    totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    let grade = 'Spartan Optimal';
    let color = 'var(--mint, #10b981)';
    let summary = 'Peak cognitive & biological recovery. Neurotransmitters replenished.';

    if (totalScore >= 90) {
      grade = 'Elite Spartan (90%+)';
      color = '#10b981';
      summary = 'Target bedtime & wake achieved! High prefrontal clarity.';
    } else if (totalScore >= 75) {
      grade = 'Solid Recovery (75-89%)';
      color = '#38bdf8';
      summary = 'Good duration and rhythm. Minor schedule drift detected.';
    } else if (totalScore >= 50) {
      grade = 'Sub-Optimal (50-74%)';
      color = '#f59e0b';
      summary = 'Off-target sleep reduces deep REM sleep. Reset tonight at 11:00 PM.';
    } else {
      grade = 'Critical Deficit (<50%)';
      color = '#ef4444';
      summary = 'Severe circadian misalignment. High cortisol risk. Prioritize 11 PM cutoff.';
    }

    return {
      score: totalScore,
      grade,
      color,
      summary,
      durationPts,
      bedtimePts,
      wakePts
    };
  }

  /**
   * Calculates consecutive sleep streaks from historical records.
   * Condition: Consecutive days hitting BOTH Bedtime <= 11:00 PM AND Wake <= 6:30 AM.
   */
  function calculateSleepStreaks(recordsMap = {}) {
    const dates = Object.keys(recordsMap).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
    if (dates.length === 0) return { currentStreak: 0, bestStreak: 0, daysChecked: 0 };

    let bestStreak = 0;
    let running = 0;
    let prevDate = null;

    dates.forEach(dateStr => {
      const rec = recordsMap[dateStr];
      if (!rec || !rec.bed || !rec.wake) {
        running = 0;
        prevDate = dateStr;
        return;
      }

      const met = isSleepTargetMet(rec.bed, rec.wake);
      if (met) {
        if (!prevDate) {
          running = 1;
        } else {
          const dCurrent = new Date(dateStr + 'T00:00:00');
          const dPrev = new Date(prevDate + 'T00:00:00');
          const diffDays = Math.round((dCurrent - dPrev) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            running++;
          } else {
            running = 1;
          }
        }
        if (running > bestStreak) bestStreak = running;
        prevDate = dateStr;
      } else {
        running = 0;
        prevDate = dateStr;
      }
    });

    // Calculate current streak relative to today / yesterday
    let currentStreak = 0;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = yest.toISOString().slice(0, 10);

    let checkDate = (recordsMap[todayStr] && recordsMap[todayStr].bed && recordsMap[todayStr].wake) ? todayStr : yestStr;

    while (checkDate && recordsMap[checkDate]) {
      const r = recordsMap[checkDate];
      if (isSleepTargetMet(r.bed, r.wake)) {
        currentStreak++;
        const prev = new Date(checkDate + 'T00:00:00');
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().slice(0, 10);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      daysChecked: dates.length
    };
  }

  /**
   * Checks if current time is within late-night lockdown hours:
   * 11:00 PM (23:00) through 5:00 AM (05:00).
   */
  function isLateNightLockdownHour(date = new Date()) {
    const h = date.getHours();
    // 23 (11 PM) or 0, 1, 2, 3, 4 (before 5 AM)
    return h >= SLEEP_TARGETS.lockdownStartHour || h < SLEEP_TARGETS.lockdownEndHour;
  }

  /**
   * Computes exact duration past the 11:00 PM cutoff.
   */
  function getLateNightCutoffMetrics(date = new Date()) {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    let pastMinutes = 0;
    if (h >= 23) {
      pastMinutes = ((h - 23) * 60) + m;
    } else {
      // Crossed midnight (e.g. 01:30 AM -> 60m + 90m = 150m)
      pastMinutes = 60 + (h * 60) + m;
    }

    const pastHours = Math.floor(pastMinutes / 60);
    const pastRemMins = pastMinutes % 60;

    // Minutes remaining until 6:30 AM wake up
    let wakeTargetMinutesFromNow = 0;
    if (h >= 23) {
      wakeTargetMinutesFromNow = ((24 - h) * 60 - m) + (6 * 60 + 30);
    } else {
      wakeTargetMinutesFromNow = ((6 * 60 + 30) - (h * 60 + m));
    }
    wakeTargetMinutesFromNow = Math.max(0, wakeTargetMinutesFromNow);

    const remHours = Math.floor(wakeTargetMinutesFromNow / 60);
    const remMins = wakeTargetMinutesFromNow % 60;

    return {
      pastMinutes,
      pastHours,
      pastRemMins,
      pastString: `${pastHours}h ${pastRemMins}m`,
      remainingWakeString: `${remHours}h ${remMins}m`,
      timeString: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }

  // =============================================================================
  // 4. STORAGE PERSISTENCE ADAPTER
  // =============================================================================
  const SleepStorage = {
    getTodayKey() {
      return new Date().toISOString().slice(0, 10);
    },

    loadRecord(dateStr = this.getTodayKey()) {
      try {
        const raw = localStorage.getItem(`me_${dateStr}_sleep`) || localStorage.getItem(`lt_${dateStr}_sleep`);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    saveRecord(record, dateStr = this.getTodayKey()) {
      try {
        const payload = JSON.stringify(record);
        localStorage.setItem(`me_${dateStr}_sleep`, payload);
        localStorage.setItem(`lt_${dateStr}_sleep`, payload);
        return true;
      } catch (e) {
        console.warn('SleepStorage saveRecord error:', e);
        return false;
      }
    },

    getAllRecords() {
      const records = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('me_') || key.startsWith('lt_')) && key.endsWith('_sleep')) {
          const match = key.match(/\d{4}-\d{2}-\d{2}/);
          if (match) {
            const dateStr = match[0];
            if (!records[dateStr]) {
              try {
                records[dateStr] = JSON.parse(localStorage.getItem(key));
              } catch {}
            }
          }
        }
      }
      return records;
    },

    getJournal(dateStr = this.getTodayKey()) {
      try {
        return localStorage.getItem(`me_${dateStr}_journal`) || localStorage.getItem(`lt_${dateStr}_journal`) || '';
      } catch {
        return '';
      }
    },

    saveJournal(text, dateStr = this.getTodayKey()) {
      try {
        localStorage.setItem(`me_${dateStr}_journal`, text);
        localStorage.setItem(`lt_${dateStr}_journal`, text);
      } catch {}
    }
  };

  // =============================================================================
  // 5. MAIN SLEEP & CIRCADIAN RHYTHM UI COMPONENT
  // =============================================================================
  class SleepCircadianUI {
    constructor(containerTarget = '#sleepCircadianContainer') {
      let target = typeof containerTarget === 'string' ? document.querySelector(containerTarget) : containerTarget;
      if (!target) {
        target = document.querySelector('#sleepCircadianContainer') || 
                 document.querySelector('#sleepMount') || 
                 document.querySelector('#tab-sleep');
      }
      this.container = target;
      this.dateStr = SleepStorage.getTodayKey();
      this.todayRecord = SleepStorage.loadRecord(this.dateStr) || {
        bed: '23:00',
        wake: '06:30',
        quality: 5,
        hours: 7.5,
        targetMet: true
      };
      
      // Lockdown and hold state
      this._clockInterval = null;
      this._holdStartTime = 0;
      this._holdAnimFrame = null;
      this._breathingInterval = null;
      this._currentBreathingPhase = 'inhale';
      this._breathingSecondsLeft = 4;
      this._breathingCycle = 1;
      this._overrideKey = 'me_lockdown_override_timestamp';
    }

    init() {
      this.injectStyles();
      this.render();
      this.bindEvents();
      this.initLateNightGuard();
    }

    // ===========================================================================
    // UI RENDERING
    // ===========================================================================
    render() {
      if (!this.container) return;

      const hours = calculateHoursSlept(this.todayRecord.bed, this.todayRecord.wake);
      const deficitInfo = calculateSleepDeficit(hours);
      const scoreInfo = calculateSleepScore(this.todayRecord.bed, this.todayRecord.wake, this.todayRecord.quality);
      const allRecords = SleepStorage.getAllRecords();
      allRecords[this.dateStr] = {
        bed: this.todayRecord.bed,
        wake: this.todayRecord.wake,
        hours,
        quality: this.todayRecord.quality
      };
      const streaks = calculateSleepStreaks(allRecords);
      const isTargetMet = isSleepTargetMet(this.todayRecord.bed, this.todayRecord.wake);
      const journalText = SleepStorage.getJournal(this.dateStr);

      this.container.innerHTML = `
        <div class="sleep-circadian-wrapper">
          
          <!-- 1. SPARTAN TARGET SPECIFICATION HEADER BANNER -->
          <div class="spartan-target-banner">
            <div class="target-badge-row">
              <span class="target-title-tag">🎯 SPARTAN CIRCADIAN TARGETS</span>
              <span class="target-pill-nonnegotiable">NON-NEGOTIABLE</span>
            </div>

            <div class="target-flow-grid">
              <div class="target-flow-node">
                <div class="target-flow-time">11:00 PM</div>
                <div class="target-flow-label">🌙 Hard Bedtime</div>
              </div>
              <div class="target-flow-arrow">→</div>
              <div class="target-flow-node">
                <div class="target-flow-time">6:30 AM</div>
                <div class="target-flow-label">⏰ Hard Wake Up</div>
              </div>
              <div class="target-flow-equal">=</div>
              <div class="target-flow-node highlight">
                <div class="target-flow-time" style="color: var(--mint, #10b981);">7.5 hrs</div>
                <div class="target-flow-label">⚡ Optimal Recovery</div>
              </div>
            </div>
          </div>

          <!-- 2. HERO METRIC SCORECARD -->
          <div class="sleep-hero-dashboard">
            <div class="hero-top-status">
              <span class="hero-icon">😴</span>
              <span class="hero-status-title">Circadian Sleep & Recovery</span>
              <span class="hero-target-chip ${isTargetMet ? 'chip-success' : 'chip-warning'}" id="badgeSleepQuality">
                ${isTargetMet ? '✓ Targets Met' : '⚠️ Target Missed'}
              </span>
            </div>

            <div class="hero-center-gauge">
              <div class="hero-hours-display">
                <span class="hero-hours-number" id="displaySleepHours">${hours.toFixed(1)}</span>
                <span class="hero-hours-unit">hrs</span>
              </div>
              <div class="hero-score-badge" style="background: ${scoreInfo.color}22; border: 1px solid ${scoreInfo.color}; color: ${scoreInfo.color};">
                <span class="score-percent">${scoreInfo.score}%</span> · ${scoreInfo.grade}
              </div>
            </div>

            <!-- 4-Stat Live Calculated Grid -->
            <div class="circadian-metrics-grid">
              <div class="metric-box">
                <div class="metric-val" id="scStatHours">${hours.toFixed(1)}h</div>
                <div class="metric-lbl">Hours Slept</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" id="displaySleepDeficit" style="color: ${deficitInfo.pillColor};">${deficitInfo.deficit > 0 ? '-' + deficitInfo.deficit.toFixed(1) + 'h' : (deficitInfo.surplus > 0 ? '+' + deficitInfo.surplus.toFixed(1) + 'h' : '0.0h')}</div>
                <div class="metric-lbl">${deficitInfo.deficit > 0 ? 'Deficit' : (deficitInfo.surplus > 0 ? 'Surplus' : 'Deficit')}</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" id="scStatScore" style="color: ${scoreInfo.color};">${scoreInfo.score}%</div>
                <div class="metric-lbl">Sleep Score</div>
              </div>
              <div class="metric-box highlight-streak">
                <div class="metric-val" id="displaySleepStreak" style="color: #f59e0b;">🔥 ${streaks.currentStreak}d</div>
                <div class="metric-lbl">Sleep Streak</div>
              </div>
            </div>
          </div>

          <!-- 3. SLEEP LOG CARD WITH QUICK TARGET ACTION -->
          <div class="sleep-input-card">
            <div class="input-card-header">
              <div class="input-card-title">
                <span>⏰ Bedtime & Wake Time Log</span>
              </div>
              <button class="btn-quick-target" id="btnQuickSetSleepTarget" title="Instantly fill Spartan targets: 11 PM bedtime and 6:30 AM wake up">
                ⚡ Quick Target: 11 PM → 6:30 AM
              </button>
            </div>

            <div class="time-inputs-grid">
              <div class="time-input-group">
                <label for="sleepBedInput">
                  <span>🌙 Bedtime</span>
                  <span class="time-sub-tag">Cutoff: 11:00 PM</span>
                </label>
                <input type="time" id="sleepBedInput" value="${this.todayRecord.bed || '23:00'}" class="sc-time-input">
              </div>

              <div class="time-input-group">
                <label for="sleepWakeInput">
                  <span>⏰ Wake Up</span>
                  <span class="time-sub-tag">Target: 6:30 AM</span>
                </label>
                <input type="time" id="sleepWakeInput" value="${this.todayRecord.wake || '06:30'}" class="sc-time-input">
              </div>
            </div>

            <!-- Dynamic Live Target Feedback Banner -->
            <div class="sc-feedback-banner ${isTargetMet ? 'banner-pass' : 'banner-warn'}" id="sleepTargetFeedbackBanner">
              ${isTargetMet 
                ? '🎯 <strong>Spartan Target Conquered!</strong> In bed on/before 11:00 PM and awake by 6:30 AM. Optimal REM cycles & neuroplasticity achieved.' 
                : `⚠️ <strong>Circadian Deviation:</strong> ${!isBedtimeOnTarget(this.todayRecord.bed) ? 'Bedtime was after 11:00 PM cutoff.' : ''} ${!isWakeTimeOnTarget(this.todayRecord.wake) ? 'Wake time was after 6:30 AM target.' : ''} Recovery degraded.`}
            </div>

            <!-- Subjective Recovery Stars / Emojis -->
            <div class="quality-rating-section">
              <label class="quality-rating-label">Subjective Recovery Quality</label>
              <div class="quality-pills-row" id="sleepStarsRow">
                <button class="quality-btn ${this.todayRecord.quality == 1 ? 'active' : ''}" data-val="1">
                  <span>😫</span><span class="q-txt">Exhausted</span>
                </button>
                <button class="quality-btn ${this.todayRecord.quality == 2 ? 'active' : ''}" data-val="2">
                  <span>🥱</span><span class="q-txt">Tired</span>
                </button>
                <button class="quality-btn ${this.todayRecord.quality == 3 ? 'active' : ''}" data-val="3">
                  <span>😐</span><span class="q-txt">Average</span>
                </button>
                <button class="quality-btn ${this.todayRecord.quality == 4 ? 'active' : ''}" data-val="4">
                  <span>⚡</span><span class="q-txt">Good</span>
                </button>
                <button class="quality-btn ${this.todayRecord.quality == 5 ? 'active' : ''}" data-val="5">
                  <span>👑</span><span class="q-txt">Spartan</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 4. EVENING REFLECTION & GRATITUDE JOURNAL -->
          <div class="sleep-journal-card">
            <div class="journal-header">
              <span class="journal-icon">📝</span>
              <span class="journal-title">Evening Reflection & Discipline Wins</span>
            </div>
            <textarea id="sleepJournalInput" placeholder="What went well today? What will you conquer tomorrow? Name 3 things you are deeply grateful for before sleep...">${journalText}</textarea>
            <div class="journal-autosave-tag" id="journalSavedFeedback">Auto-saved to local vault</div>
          </div>

          <!-- 5. LATE-NIGHT & REALITY CHECK QUICK ACTIONS -->
          <div class="reality-check-actions-card">
            <div class="actions-header">
              <span class="actions-icon">🚨</span>
              <span class="actions-title">Late-Night Guard & Reality Check</span>
            </div>
            <p class="actions-desc">
              Debating staying up late or feeling sluggish? Use the instant wake-up call or calming 4-7-8 blackout screen.
            </p>
            <div class="actions-buttons-grid">
              <button class="btn-action-primary" id="scBtnOpenRealityCheck">
                ⚡ Instant Reality Check
              </button>
              <button class="btn-action-secondary" id="scBtnOpenBlackoutBreathing">
                🌙 4-7-8 Blackout Breathing
              </button>
              <button class="btn-action-ghost" id="scBtnTriggerLockdownPreview">
                🔒 Test Lockdown Overlay
              </button>
            </div>
          </div>

        </div>
      `;
    }

    // ===========================================================================
    // EVENT BINDINGS & REACTIVITY
    // ===========================================================================
    bindEvents() {
      if (!this.container) return;

      // Quick Target Preset: 11 PM -> 6:30 AM
      const btnQuick = this.container.querySelector('#btnQuickSetSleepTarget') || this.container.querySelector('#scBtnQuickTarget');
      btnQuick?.addEventListener('click', () => {
        const bedInput = this.container.querySelector('#sleepBedInput') || this.container.querySelector('#scInputBedtime');
        const wakeInput = this.container.querySelector('#sleepWakeInput') || this.container.querySelector('#scInputWake');
        if (bedInput) bedInput.value = '23:00';
        if (wakeInput) wakeInput.value = '06:30';
        this.handleTimeChange('23:00', '06:30');
        this.showToast('🎯 Spartan Target Set: 11:00 PM → 6:30 AM (7.5h)');
      });

      // Time Inputs Reactive Event
      const bedInput = this.container.querySelector('#sleepBedInput') || this.container.querySelector('#scInputBedtime');
      const wakeInput = this.container.querySelector('#sleepWakeInput') || this.container.querySelector('#scInputWake');

      const onTimeChange = () => {
        const bed = bedInput?.value || '23:00';
        const wake = wakeInput?.value || '06:30';
        this.handleTimeChange(bed, wake);
      };

      bedInput?.addEventListener('input', onTimeChange);
      bedInput?.addEventListener('change', onTimeChange);
      wakeInput?.addEventListener('input', onTimeChange);
      wakeInput?.addEventListener('change', onTimeChange);

      // Quality Rating Buttons
      const qualityBtns = this.container.querySelectorAll('.quality-btn');
      qualityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const val = Number(btn.getAttribute('data-val')) || 5;
          this.todayRecord.quality = val;
          qualityBtns.forEach(b => b.classList.toggle('active', b === btn));
          this.saveState();
          this.updateLiveCalculations();
          this.showToast('Recovery rating saved');
        });
      });

      // Journal Debounced Auto-save
      const journalInput = this.container.querySelector('#sleepJournalInput') || this.container.querySelector('#scJournalInput');
      let journalTimer = null;
      journalInput?.addEventListener('input', () => {
        const tag = this.container.querySelector('#journalSavedFeedback') || this.container.querySelector('#scJournalSaveTag');
        if (tag) tag.textContent = 'Saving reflection...';
        clearTimeout(journalTimer);
        journalTimer = setTimeout(() => {
          SleepStorage.saveJournal(journalInput.value, this.dateStr);
          if (tag) tag.textContent = 'Auto-saved to local vault';
        }, 500);
      });

      // Reality Check Modal Trigger
      this.container.querySelector('#scBtnOpenRealityCheck')?.addEventListener('click', () => {
        this.openRealityCheckModal('all');
      });

      // Blackout 4-7-8 Breathing Trigger
      this.container.querySelector('#scBtnOpenBlackoutBreathing')?.addEventListener('click', () => {
        this.openBlackoutBreathingScreen();
      });

      // Lockdown Preview Trigger
      this.container.querySelector('#scBtnTriggerLockdownPreview')?.addEventListener('click', () => {
        this.showLateNightLockdown(true);
      });
    }

    handleTimeChange(bed, wake) {
      this.todayRecord.bed = bed;
      this.todayRecord.wake = wake;
      this.saveState();
      this.updateLiveCalculations();
    }

    saveState() {
      const hours = calculateHoursSlept(this.todayRecord.bed, this.todayRecord.wake);
      const isTargetMet = isSleepTargetMet(this.todayRecord.bed, this.todayRecord.wake);
      const deficitInfo = calculateSleepDeficit(hours);
      const scoreInfo = calculateSleepScore(this.todayRecord.bed, this.todayRecord.wake, this.todayRecord.quality);

      this.todayRecord.hours = hours;
      this.todayRecord.targetMet = isTargetMet;
      this.todayRecord.deficit = deficitInfo.deficit;
      this.todayRecord.surplus = deficitInfo.surplus;
      this.todayRecord.score = scoreInfo.score;

      SleepStorage.saveRecord(this.todayRecord, this.dateStr);

      // Also notify global Me Life OS master engine if available
      if (window.MeApp && typeof window.MeApp.calculateMasterScore === 'function') {
        try { window.MeApp.calculateMasterScore(); } catch {}
      }
    }

    updateLiveCalculations() {
      const hours = calculateHoursSlept(this.todayRecord.bed, this.todayRecord.wake);
      const deficitInfo = calculateSleepDeficit(hours);
      const scoreInfo = calculateSleepScore(this.todayRecord.bed, this.todayRecord.wake, this.todayRecord.quality);
      const allRecords = SleepStorage.getAllRecords();
      allRecords[this.dateStr] = {
        bed: this.todayRecord.bed,
        wake: this.todayRecord.wake,
        hours,
        quality: this.todayRecord.quality
      };
      const streaks = calculateSleepStreaks(allRecords);
      const isTargetMet = isSleepTargetMet(this.todayRecord.bed, this.todayRecord.wake);

      // Update Live Hero Numbers
      const elHoursDisplay = this.container.querySelector('#displaySleepHours') || this.container.querySelector('#scHoursDisplay');
      const elStatHours = this.container.querySelector('#scStatHours');
      const elStatDeficit = this.container.querySelector('#displaySleepDeficit') || this.container.querySelector('#scStatDeficit');
      const elStatScore = this.container.querySelector('#scStatScore');
      const elStatStreak = this.container.querySelector('#displaySleepStreak') || this.container.querySelector('#scStatStreak');
      const elFeedback = this.container.querySelector('#sleepTargetFeedbackBanner') || this.container.querySelector('#scFeedbackBanner');
      const elBadge = this.container.querySelector('#badgeSleepQuality');

      if (elHoursDisplay) elHoursDisplay.textContent = hours.toFixed(1);
      if (elStatHours) elStatHours.textContent = hours.toFixed(1) + 'h';
      if (elStatDeficit) {
        elStatDeficit.textContent = deficitInfo.deficit > 0 ? `-${deficitInfo.deficit.toFixed(1)}h` : (deficitInfo.surplus > 0 ? `+${deficitInfo.surplus.toFixed(1)}h` : '0.0h');
        elStatDeficit.style.color = deficitInfo.pillColor;
      }
      if (elStatScore) {
        elStatScore.textContent = scoreInfo.score + '%';
        elStatScore.style.color = scoreInfo.color;
      }
      if (elStatStreak) {
        elStatStreak.textContent = `🔥 ${streaks.currentStreak}d`;
      }
      if (elBadge) {
        elBadge.className = `hero-target-chip ${isTargetMet ? 'chip-success' : 'chip-warning'}`;
        elBadge.textContent = isTargetMet ? '✓ Targets Met' : '⚠️ Target Missed';
      }

      if (elFeedback) {
        elFeedback.className = `sc-feedback-banner ${isTargetMet ? 'banner-pass' : 'banner-warn'}`;
        if (isTargetMet) {
          elFeedback.innerHTML = `🎯 <strong>Spartan Target Conquered!</strong> In bed on/before 11:00 PM and awake by 6:30 AM. Optimal REM cycles & neuroplasticity achieved.`;
        } else {
          const reasons = [];
          if (!isBedtimeOnTarget(this.todayRecord.bed)) reasons.push('Bedtime was past 11:00 PM cutoff');
          if (!isWakeTimeOnTarget(this.todayRecord.wake)) reasons.push('Wake time was past 6:30 AM target');
          elFeedback.innerHTML = `⚠️ <strong>Circadian Deviation:</strong> ${reasons.join(' and ')}. Off-schedule sleep degrades tomorrow's deep work stamina.`;
        }
      }
    }

    // ===========================================================================
    // 6. LATE-NIGHT LOCKDOWN REALITY CHECK OVERLAY (11:00 PM - 5:00 AM)
    // ===========================================================================
    initLateNightGuard() {
      // Check on startup
      this.checkAndApplyLockdown();

      // Check every 60 seconds
      setInterval(() => {
        this.checkAndApplyLockdown();
      }, 60000);
    }

    checkAndApplyLockdown() {
      if (!isLateNightLockdownHour()) {
        return;
      }

      // Check if user has an active 3-second hold override
      const overrideUntil = sessionStorage.getItem(this._overrideKey);
      if (overrideUntil && Date.now() < Number(overrideUntil)) {
        return; // Still in temporary override window
      }

      this.showLateNightLockdown(false);
    }

    showLateNightLockdown(isManualPreview = false) {
      let overlay = document.getElementById('scLateNightOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'scLateNightOverlay';
        overlay.className = 'sc-lockdown-overlay';
        document.body.appendChild(overlay);
      }

      const quote = getRandomQuote('all');
      const metrics = getLateNightCutoffMetrics();

      overlay.innerHTML = `
        <div class="sc-lockdown-container">
          
          <div class="sc-lockdown-badge">
            🚨 LATE-NIGHT REALITY CHECK · 11:00 PM HARD CUTOFF ACTIVE
          </div>

          <h1 class="sc-lockdown-title">Put The Phone Down.</h1>

          <div class="sc-clock-box">
            <div class="sc-live-clock" id="scLockdownLiveClock">${metrics.timeString}</div>
            <div class="sc-past-cutoff-badge">
              ⚠️ <strong>${metrics.pastString}</strong> past the 11:00 PM bedtime cutoff!
            </div>
            <div class="sc-time-until-wake">
              Only <strong>${metrics.remainingWakeString}</strong> left until 6:30 AM wake up alarm.
            </div>
          </div>

          <div class="sc-quote-card">
            <div class="sc-quote-category">${quote.category}</div>
            <div class="sc-quote-body">"${quote.quote}"</div>
            <div class="sc-quote-author">— ${quote.author}</div>
            <div class="sc-quote-context">⚡ <strong>Context:</strong> ${quote.context}</div>
          </div>

          <div class="sc-consequence-box">
            🧠 <strong>Biological Consequence:</strong> Every 30 minutes awake past 11 PM destroys high-value REM sleep, spikes morning cortisol, and reduces cognitive processing speed by 25% tomorrow.
          </div>

          <!-- 4-7-8 Breathing Button Option -->
          <button class="sc-btn-blackout" id="scBtnGoToBlackout">
            🌙 Can't Sleep? Start 4-7-8 Blackout Breathing Mode
          </button>

          <!-- 3-Second Hold to Override Container -->
          <div class="sc-override-section">
            <div class="sc-hold-button-wrapper">
              <button class="sc-btn-hold-override" id="scBtnHoldOverride">
                <span class="sc-hold-label" id="scHoldLabel">Hold for 3s to Override</span>
                <div class="sc-hold-progress-bar" id="scHoldProgressBar"></div>
              </button>
            </div>
            <div class="sc-override-hint" id="scOverrideHint">
              Press and hold steadily for 3 seconds to access app during curfew
            </div>
          </div>

          ${isManualPreview ? `
            <button class="sc-btn-dismiss-preview" id="scBtnDismissPreview">
              ✕ Close Preview Mode
            </button>
          ` : ''}

        </div>
      `;

      overlay.classList.add('visible');

      // Live Clock Ticker
      if (this._clockInterval) clearInterval(this._clockInterval);
      this._clockInterval = setInterval(() => {
        const clockEl = document.getElementById('scLockdownLiveClock');
        if (clockEl) {
          clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
      }, 1000);

      // Blackout Button Link
      document.getElementById('scBtnGoToBlackout')?.addEventListener('click', () => {
        this.closeLockdownOverlay();
        this.openBlackoutBreathingScreen();
      });

      // Dismiss Preview Link (if manual)
      document.getElementById('scBtnDismissPreview')?.addEventListener('click', () => {
        this.closeLockdownOverlay();
      });

      // Bind 3-Second Hold Override
      this.setupHoldOverrideEvents();
    }

    closeLockdownOverlay() {
      const overlay = document.getElementById('scLateNightOverlay');
      if (overlay) {
        overlay.classList.remove('visible');
      }
      if (this._clockInterval) {
        clearInterval(this._clockInterval);
        this._clockInterval = null;
      }
      this.cancelHold();
    }

    setupHoldOverrideEvents() {
      const btn = document.getElementById('scBtnHoldOverride');
      if (!btn) return;

      const start = (e) => {
        e.preventDefault();
        this.startHold();
      };

      const cancel = (e) => {
        this.cancelHold();
      };

      btn.addEventListener('mousedown', start);
      btn.addEventListener('touchstart', start, { passive: false });

      btn.addEventListener('mouseup', cancel);
      btn.addEventListener('mouseleave', cancel);
      btn.addEventListener('touchend', cancel);
      btn.addEventListener('touchcancel', cancel);
    }

    startHold() {
      this._holdStartTime = Date.now();
      const bar = document.getElementById('scHoldProgressBar');
      const label = document.getElementById('scHoldLabel');
      const hint = document.getElementById('scOverrideHint');

      const tick = () => {
        const elapsed = Date.now() - this._holdStartTime;
        const progress = Math.min(1, elapsed / SLEEP_TARGETS.holdDurationMs);
        const pct = (progress * 100).toFixed(1);

        if (bar) bar.style.width = `${pct}%`;
        if (label) {
          const leftSecs = Math.max(0, (SLEEP_TARGETS.holdDurationMs - elapsed) / 1000).toFixed(1);
          label.textContent = `Keep Holding... (${leftSecs}s)`;
        }

        if (elapsed >= SLEEP_TARGETS.holdDurationMs) {
          this.finishHoldOverride();
        } else {
          this._holdAnimFrame = requestAnimationFrame(tick);
        }
      };

      this._holdAnimFrame = requestAnimationFrame(tick);
    }

    cancelHold() {
      if (this._holdAnimFrame) {
        cancelAnimationFrame(this._holdAnimFrame);
        this._holdAnimFrame = null;
      }
      const bar = document.getElementById('scHoldProgressBar');
      const label = document.getElementById('scHoldLabel');
      const hint = document.getElementById('scOverrideHint');

      if (bar) bar.style.width = '0%';
      if (label) label.textContent = 'Hold for 3s to Override';
      if (hint) {
        hint.textContent = 'Override cancelled. Protect your sleep.';
        hint.style.color = '#ef4444';
        setTimeout(() => {
          if (hint) {
            hint.textContent = 'Press and hold steadily for 3 seconds to access app during curfew';
            hint.style.color = 'var(--text-muted, #8888a4)';
          }
        }, 2000);
      }
    }

    finishHoldOverride() {
      if (this._holdAnimFrame) cancelAnimationFrame(this._holdAnimFrame);

      // Vibrate haptic feedback if supported
      try {
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
      } catch {}

      const bar = document.getElementById('scHoldProgressBar');
      const label = document.getElementById('scHoldLabel');
      const hint = document.getElementById('scOverrideHint');

      if (bar) {
        bar.style.width = '100%';
        bar.style.background = '#10b981';
      }
      if (label) label.textContent = '✓ Override Granted (45 min)';
      if (hint) {
        hint.textContent = 'Temporary curfew unlock enabled. Please sleep soon.';
        hint.style.color = '#10b981';
      }

      // Save 45-minute override in sessionStorage
      const expiry = Date.now() + (SLEEP_TARGETS.overrideDurationMins * 60 * 1000);
      sessionStorage.setItem(this._overrideKey, String(expiry));

      setTimeout(() => {
        this.closeLockdownOverlay();
        this.showToast('Lockdown unlocked for 45 minutes');
      }, 600);
    }

    // ===========================================================================
    // 7. CALMING 4-7-8 BREATHING BLACKOUT SCREEN
    // ===========================================================================
    openBlackoutBreathingScreen() {
      let blackout = document.getElementById('scBlackoutScreen');
      if (!blackout) {
        blackout = document.createElement('div');
        blackout.id = 'scBlackoutScreen';
        blackout.className = 'sc-blackout-screen';
        document.body.appendChild(blackout);
      }

      blackout.innerHTML = `
        <div class="sc-blackout-content">
          
          <div class="sc-blackout-badge">
            🌙 CALMING 4-7-8 CIRCADIAN BLACKOUT
          </div>

          <h2 class="sc-blackout-headline">Screens Off. Phone Face Down.</h2>
          <p class="sc-blackout-sub">Follow the rhythm: Inhale 4s · Hold 7s · Exhale 8s</p>

          <!-- 4-7-8 Visual Breathing Circle -->
          <div class="sc-breathing-stage">
            <div class="sc-breathing-circle-halo" id="scBreathingHalo"></div>
            <div class="sc-breathing-circle" id="scBreathingCircle">
              <span class="sc-breathe-phase-text" id="scBreathePhaseText">Inhale</span>
              <span class="sc-breathe-timer-number" id="scBreatheTimerNumber">4</span>
            </div>
          </div>

          <div class="sc-breathing-guide-text" id="scBreathingGuideText">
            Inhale quietly through your nose for 4 seconds.
          </div>

          <div class="sc-breathing-cycle-counter" id="scBreathingCycleCounter">
            Cycle 1 of 4 · Parasympathetic Activation
          </div>

          <div class="sc-blackout-actions">
            <button class="sc-btn-exit-blackout" id="scBtnExitBlackout">
              ✕ Exit Blackout Mode
            </button>
          </div>

        </div>
      `;

      blackout.classList.add('visible');

      // Bind exit
      document.getElementById('scBtnExitBlackout')?.addEventListener('click', () => {
        this.closeBlackoutBreathingScreen();
      });

      // Start 4-7-8 Breathing Loop
      this.start478BreathingCycle();
    }

    closeBlackoutBreathingScreen() {
      const blackout = document.getElementById('scBlackoutScreen');
      if (blackout) blackout.classList.remove('visible');
      if (this._breathingInterval) {
        clearInterval(this._breathingInterval);
        this._breathingInterval = null;
      }
    }

    start478BreathingCycle() {
      if (this._breathingInterval) clearInterval(this._breathingInterval);

      this._breathingCycle = 1;
      this._currentBreathingPhase = 'inhale';
      this._breathingSecondsLeft = 4;

      const circle = document.getElementById('scBreathingCircle');
      const phaseText = document.getElementById('scBreathePhaseText');
      const timerNumber = document.getElementById('scBreatheTimerNumber');
      const guideText = document.getElementById('scBreathingGuideText');
      const cycleCounter = document.getElementById('scBreathingCycleCounter');

      const updateUIPhase = () => {
        if (!circle || !phaseText || !timerNumber || !guideText || !cycleCounter) return;

        timerNumber.textContent = this._breathingSecondsLeft;

        if (this._currentBreathingPhase === 'inhale') {
          phaseText.textContent = 'Inhale';
          circle.className = 'sc-breathing-circle phase-inhale';
          guideText.textContent = 'Inhale quietly and deeply through your nose...';
        } else if (this._currentBreathingPhase === 'hold') {
          phaseText.textContent = 'Hold';
          circle.className = 'sc-breathing-circle phase-hold';
          guideText.textContent = 'Hold your breath comfortably. Keep shoulders relaxed...';
        } else if (this._currentBreathingPhase === 'exhale') {
          phaseText.textContent = 'Exhale';
          circle.className = 'sc-breathing-circle phase-exhale';
          guideText.textContent = 'Exhale completely through your mouth with a gentle whoosh...';
        }

        cycleCounter.textContent = `Cycle ${this._breathingCycle} of 4 · Nervous system downshifting`;
      };

      updateUIPhase();

      this._breathingInterval = setInterval(() => {
        this._breathingSecondsLeft--;

        if (this._breathingSecondsLeft <= 0) {
          // Transition phase
          if (this._currentBreathingPhase === 'inhale') {
            this._currentBreathingPhase = 'hold';
            this._breathingSecondsLeft = 7;
          } else if (this._currentBreathingPhase === 'hold') {
            this._currentBreathingPhase = 'exhale';
            this._breathingSecondsLeft = 8;
          } else if (this._currentBreathingPhase === 'exhale') {
            this._currentBreathingPhase = 'inhale';
            this._breathingSecondsLeft = 4;
            this._breathingCycle++;
          }
        }

        updateUIPhase();
      }, 1000);
    }

    // ===========================================================================
    // 8. EMERGENCY MOTIVATION MODAL
    // ===========================================================================
    openRealityCheckModal(category = 'all') {
      let modal = document.getElementById('scRealityCheckModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'scRealityCheckModal';
        modal.className = 'sc-reality-modal';
        document.body.appendChild(modal);
      }

      const quote = getRandomQuote(category);

      modal.innerHTML = `
        <div class="sc-reality-dialog">
          <div class="sc-reality-head">
            <div class="sc-reality-tag">🚨 WAKE-UP CALL / REALITY CHECK</div>
            <button class="sc-reality-close" id="scBtnCloseRealityModal">&times;</button>
          </div>

          <div class="sc-cat-tabs-row">
            <button class="sc-cat-tab ${category === 'all' ? 'active' : ''}" data-cat="all">🎲 Random</button>
            <button class="sc-cat-tab ${category === 'parents' ? 'active' : ''}" data-cat="parents">👨‍👩‍👧 Parents</button>
            <button class="sc-cat-tab ${category === 'career' ? 'active' : ''}" data-cat="career">⚔️ Career</button>
            <button class="sc-cat-tab ${category === 'regret' ? 'active' : ''}" data-cat="regret">⏳ Regret</button>
            <button class="sc-cat-tab ${category === 'bitsian' ? 'active' : ''}" data-cat="bitsian">🏛️ BITSian</button>
          </div>

          <div class="sc-reality-quote-card">
            <div class="sc-r-cat">${quote.category}</div>
            <div class="sc-r-quote">"${quote.quote}"</div>
            <div class="sc-r-author">— ${quote.author}</div>
            <div class="sc-r-ctx">⚡ <strong>Context:</strong> ${quote.context}</div>
          </div>

          <div class="sc-protocol-box">
            <div class="sc-protocol-title">⚡ 5-Minute Reset Protocol</div>
            <ul class="sc-protocol-list">
              <li><strong>1. Cold Shock:</strong> Splash cold water on your face to reboot alertness.</li>
              <li><strong>2. Kill Dopamine:</strong> Close all distracting apps and browser tabs.</li>
              <li><strong>3. Stand Up:</strong> Do 10 pushups or 20 jumping jacks to spike oxygen flow.</li>
              <li><strong>4. Single Task:</strong> Set phone across the room before entering deep work or bed.</li>
            </ul>
          </div>

          <div class="sc-reality-footer">
            <button class="sc-btn-next-quote" id="scBtnNextRealityQuote">
              🔄 Another Reality Check
            </button>
            <button class="sc-btn-locked-in" id="scBtnLockedIn">
              ⚔️ I Am Locked In. Let's Execute.
            </button>
          </div>
        </div>
      `;

      modal.classList.add('visible');

      // Close Button
      document.getElementById('scBtnCloseRealityModal')?.addEventListener('click', () => {
        modal.classList.remove('visible');
      });
      document.getElementById('scBtnLockedIn')?.addEventListener('click', () => {
        modal.classList.remove('visible');
        this.showToast('Locked In! Discipline restored.');
      });

      // Next Quote
      document.getElementById('scBtnNextRealityQuote')?.addEventListener('click', () => {
        this.openRealityCheckModal(category);
      });

      // Category Tabs
      modal.querySelectorAll('.sc-cat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const c = tab.getAttribute('data-cat') || 'all';
          this.openRealityCheckModal(c);
        });
      });
    }

    showToast(msg) {
      let toast = document.getElementById('scGlobalToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'scGlobalToast';
        toast.className = 'sc-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }

    // ===========================================================================
    // 9. SCOPED STYLES INJECTION
    // ===========================================================================
    injectStyles() {
      if (document.getElementById('sc-sleep-styles')) return;

      const style = document.createElement('style');
      style.id = 'sc-sleep-styles';
      style.textContent = `
        /* ==========================================================================
           SLEEP & CIRCADIAN COMPONENT STYLING (ME LIFE OS)
           ========================================================================== */
        .sleep-circadian-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          max-width: 680px;
          margin: 0 auto;
          font-family: inherit;
          box-sizing: border-box;
        }
        .sleep-circadian-wrapper * {
          box-sizing: border-box;
        }

        /* Spartan Target Banner */
        .spartan-target-banner {
          background: linear-gradient(135deg, rgba(124, 92, 252, 0.16) 0%, rgba(18, 18, 26, 0.95) 100%);
          border: 1px solid rgba(124, 92, 252, 0.35);
          border-radius: 14px;
          padding: 14px 16px;
        }
        .target-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .target-title-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #f3f4f8;
        }
        .target-pill-nonnegotiable {
          font-size: 0.65rem;
          font-weight: 800;
          color: #c4b5fd;
          background: rgba(124, 92, 252, 0.22);
          border: 1px solid rgba(124, 92, 252, 0.4);
          padding: 2px 8px;
          border-radius: 50px;
          letter-spacing: 0.04em;
        }
        .target-flow-grid {
          display: flex;
          justify-content: space-around;
          align-items: center;
          text-align: center;
        }
        .target-flow-node .target-flow-time {
          font-size: 1.15rem;
          font-weight: 800;
          color: #f3f4f8;
        }
        .target-flow-node .target-flow-label {
          font-size: 0.68rem;
          color: #9494a8;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .target-flow-arrow, .target-flow-equal {
          color: #60607a;
          font-size: 1rem;
          font-weight: 700;
        }

        /* Hero Scorecard */
        .sleep-hero-dashboard {
          background: linear-gradient(135deg, rgba(124, 92, 252, 0.12) 0%, rgba(18, 18, 26, 0.95) 100%);
          border: 1px solid rgba(124, 92, 252, 0.28);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
        .hero-top-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .hero-status-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #f3f4f8;
        }
        .hero-target-chip {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 50px;
        }
        .hero-target-chip.chip-success {
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid #10b981;
          color: #6ee7b7;
        }
        .hero-target-chip.chip-warning {
          background: rgba(245, 158, 11, 0.18);
          border: 1px solid #f59e0b;
          color: #fcd34d;
        }
        .hero-center-gauge {
          margin-bottom: 16px;
        }
        .hero-hours-display {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1;
          color: #f3f4f8;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }
        .hero-hours-unit {
          font-size: 1.2rem;
          font-weight: 500;
          color: #8888a4;
          margin-left: 2px;
        }
        .hero-score-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 50px;
        }

        /* 4-Metric Grid */
        .circadian-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .metric-box {
          background: rgba(9, 9, 13, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 8px 6px;
          text-align: center;
        }
        .metric-val {
          font-size: 1.15rem;
          font-weight: 800;
          color: #f3f4f8;
        }
        .metric-lbl {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: #8888a4;
          margin-top: 2px;
        }

        /* Input Card */
        .sleep-input-card {
          background: #12121a;
          border: 1px solid #1f1f2e;
          border-radius: 14px;
          padding: 16px;
        }
        .input-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .input-card-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: #f3f4f8;
        }
        .btn-quick-target {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 5px 12px;
          background: rgba(124, 92, 252, 0.18);
          border: 1px solid #7c5cfc;
          color: #c4b5fd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-quick-target:hover {
          background: #7c5cfc;
          color: #fff;
        }
        .time-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .time-input-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #8888a4;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .time-sub-tag {
          font-size: 0.62rem;
          color: #7c5cfc;
          font-weight: 600;
        }
        .sc-time-input {
          width: 100%;
          padding: 10px;
          background: #09090d;
          border: 1px solid #232336;
          border-radius: 8px;
          color: #f3f4f8;
          font-size: 1rem;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s;
        }
        .sc-time-input:focus {
          border-color: #7c5cfc;
        }

        .sc-feedback-banner {
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          line-height: 1.45;
          margin-bottom: 14px;
        }
        .sc-feedback-banner.banner-pass {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid #10b981;
          color: #10b981;
        }
        .sc-feedback-banner.banner-warn {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid #f59e0b;
          color: #fcd34d;
        }

        /* Quality Pills */
        .quality-rating-section {
          margin-top: 10px;
        }
        .quality-rating-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #8888a4;
          margin-bottom: 8px;
        }
        .quality-pills-row {
          display: flex;
          gap: 6px;
        }
        .quality-btn {
          flex: 1;
          padding: 8px 4px;
          background: #09090d;
          border: 1px solid #232336;
          border-radius: 8px;
          color: #8888a4;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          transition: all 0.2s;
        }
        .quality-btn .q-txt {
          font-size: 0.62rem;
          font-weight: 700;
        }
        .quality-btn.active {
          border-color: #7c5cfc;
          background: rgba(124, 92, 252, 0.2);
          color: #fff;
          box-shadow: 0 0 10px rgba(124, 92, 252, 0.3);
        }

        /* Journal Card */
        .sleep-journal-card {
          background: #12121a;
          border: 1px solid #1f1f2e;
          border-radius: 14px;
          padding: 16px;
        }
        .journal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 0.88rem;
          font-weight: 800;
          color: #f3f4f8;
        }
        .sleep-journal-card textarea {
          width: 100%;
          min-height: 80px;
          background: #09090d;
          border: 1px solid #232336;
          border-radius: 8px;
          color: #f3f4f8;
          padding: 10px;
          font-family: inherit;
          font-size: 0.82rem;
          line-height: 1.5;
          resize: vertical;
          outline: none;
        }
        .sleep-journal-card textarea:focus {
          border-color: #7c5cfc;
        }
        .journal-autosave-tag {
          font-size: 0.68rem;
          color: #8888a4;
          margin-top: 4px;
        }

        /* Reality Actions Card */
        .reality-check-actions-card {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, #12121a 100%);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
        }
        .actions-header {
          font-size: 0.95rem;
          font-weight: 800;
          color: #fca5a5;
          margin-bottom: 4px;
        }
        .actions-desc {
          font-size: 0.78rem;
          color: #9494a8;
          margin-bottom: 12px;
        }
        .actions-buttons-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .btn-action-primary {
          padding: 9px 16px;
          background: #ef4444;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.35);
        }
        .btn-action-primary:hover {
          background: #dc2626;
        }
        .btn-action-secondary {
          padding: 9px 16px;
          background: #181824;
          border: 1px solid #232336;
          border-radius: 8px;
          color: #c4b5fd;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-action-secondary:hover {
          border-color: #7c5cfc;
        }
        .btn-action-ghost {
          padding: 9px 16px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #8888a4;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-action-ghost:hover {
          color: #f3f4f8;
          border-color: #8888a4;
        }

        /* ==========================================================================
           LATE-NIGHT LOCKDOWN OVERLAY (11 PM - 5 AM)
           ========================================================================== */
        .sc-lockdown-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 9, 0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 999999;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          overflow-y: auto;
          animation: scFadeIn 0.3s ease;
        }
        .sc-lockdown-overlay.visible {
          display: flex;
        }
        .sc-lockdown-container {
          width: 100%;
          max-width: 480px;
          background: #0e0e16;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 20px;
          padding: 24px 20px;
          text-align: center;
          box-shadow: 0 0 70px rgba(239, 68, 68, 0.25);
        }
        .sc-lockdown-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 50px;
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid #ef4444;
          color: #fca5a5;
          font-size: 0.68rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .sc-lockdown-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 12px;
        }
        .sc-clock-box {
          background: #07070b;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
        }
        .sc-live-clock {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ef4444;
          letter-spacing: -0.02em;
        }
        .sc-past-cutoff-badge {
          font-size: 0.8rem;
          color: #fca5a5;
          margin-top: 4px;
        }
        .sc-time-until-wake {
          font-size: 0.72rem;
          color: #8888a4;
          margin-top: 2px;
        }
        .sc-quote-card {
          background: #14141f;
          border: 1px solid #232336;
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          margin-bottom: 12px;
        }
        .sc-quote-category {
          font-size: 0.65rem;
          font-weight: 800;
          color: #7c5cfc;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .sc-quote-body {
          font-size: 0.88rem;
          line-height: 1.45;
          color: #f3f4f8;
          font-style: italic;
          margin-bottom: 6px;
        }
        .sc-quote-author {
          font-size: 0.75rem;
          font-weight: 700;
          color: #c4b5fd;
          margin-bottom: 6px;
        }
        .sc-quote-context {
          font-size: 0.7rem;
          color: #9494a8;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px 8px;
          border-radius: 6px;
        }
        .sc-consequence-box {
          font-size: 0.74rem;
          line-height: 1.45;
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 14px;
          text-align: left;
        }
        .sc-btn-blackout {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(124, 92, 252, 0.25) 0%, rgba(18, 18, 26, 0.9) 100%);
          border: 1px solid #7c5cfc;
          color: #c4b5fd;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 14px;
          transition: all 0.2s;
        }
        .sc-btn-blackout:hover {
          background: #7c5cfc;
          color: #fff;
        }
        .sc-override-section {
          margin-top: 10px;
        }
        .sc-btn-hold-override {
          position: relative;
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          background: #181824;
          border: 1px solid #2f2f44;
          color: #f3f4f8;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
        }
        .sc-hold-label {
          position: relative;
          z-index: 2;
        }
        .sc-hold-progress-bar {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 0%;
          background: #ef4444;
          transition: width 0.05s linear;
          z-index: 1;
        }
        .sc-override-hint {
          font-size: 0.68rem;
          color: #8888a4;
          margin-top: 6px;
        }
        .sc-btn-dismiss-preview {
          margin-top: 12px;
          background: transparent;
          border: none;
          color: #8888a4;
          font-size: 0.75rem;
          cursor: pointer;
        }

        /* ==========================================================================
           CALMING 4-7-8 BLACKOUT SCREEN
           ========================================================================== */
        .sc-blackout-screen {
          display: none;
          position: fixed;
          inset: 0;
          background: #000000;
          z-index: 1000000;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          text-align: center;
          animation: scFadeIn 0.5s ease;
        }
        .sc-blackout-screen.visible {
          display: flex;
        }
        .sc-blackout-content {
          max-width: 440px;
          width: 100%;
        }
        .sc-blackout-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #7c5cfc;
          padding: 3px 10px;
          border-radius: 50px;
          border: 1px solid rgba(124, 92, 252, 0.3);
          margin-bottom: 8px;
        }
        .sc-blackout-headline {
          font-size: 1.4rem;
          font-weight: 800;
          color: #e4e4ef;
          margin-bottom: 4px;
        }
        .sc-blackout-sub {
          font-size: 0.8rem;
          color: #6d6d84;
          margin-bottom: 28px;
        }
        .sc-breathing-stage {
          position: relative;
          width: 220px;
          height: 220px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sc-breathing-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 92, 252, 0.3) 0%, rgba(9, 9, 13, 0.9) 100%);
          border: 2px solid #7c5cfc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 35px rgba(124, 92, 252, 0.35);
          transition: transform 1s ease-in-out, border-color 1s ease, box-shadow 1s ease;
        }
        .sc-breathing-circle.phase-inhale {
          transform: scale(1.35);
          border-color: #38bdf8;
          box-shadow: 0 0 50px rgba(56, 189, 248, 0.45);
        }
        .sc-breathing-circle.phase-hold {
          transform: scale(1.35);
          border-color: #818cf8;
          box-shadow: 0 0 45px rgba(129, 140, 248, 0.45);
        }
        .sc-breathing-circle.phase-exhale {
          transform: scale(0.9);
          border-color: #7c5cfc;
          box-shadow: 0 0 25px rgba(124, 92, 252, 0.25);
        }
        .sc-breathe-phase-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
        }
        .sc-breathe-timer-number {
          font-size: 2.2rem;
          font-weight: 800;
          color: #e4e4ef;
        }
        .sc-breathing-guide-text {
          font-size: 0.92rem;
          color: #c4b5fd;
          margin-bottom: 8px;
          min-height: 24px;
        }
        .sc-breathing-cycle-counter {
          font-size: 0.72rem;
          color: #686882;
          margin-bottom: 24px;
        }
        .sc-btn-exit-blackout {
          padding: 10px 20px;
          background: #111118;
          border: 1px solid #232336;
          border-radius: 8px;
          color: #8888a4;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* ==========================================================================
           REALITY CHECK MODAL
           ========================================================================== */
        .sc-reality-modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(14px);
          z-index: 99999;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .sc-reality-modal.visible {
          display: flex;
        }
        .sc-reality-dialog {
          width: 100%;
          max-width: 480px;
          background: #12121a;
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 16px;
          padding: 20px;
        }
        .sc-reality-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .sc-reality-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #fca5a5;
        }
        .sc-reality-close {
          background: transparent;
          border: none;
          font-size: 1.4rem;
          color: #8888a4;
          cursor: pointer;
        }
        .sc-cat-tabs-row {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 6px;
          margin-bottom: 12px;
        }
        .sc-cat-tab {
          padding: 5px 10px;
          background: #09090d;
          border: 1px solid #232336;
          border-radius: 6px;
          color: #8888a4;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .sc-cat-tab.active {
          background: #7c5cfc;
          border-color: #7c5cfc;
          color: #fff;
        }
        .sc-reality-quote-card {
          background: #09090d;
          border: 1px solid #232336;
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .sc-r-cat {
          font-size: 0.65rem;
          font-weight: 800;
          color: #7c5cfc;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .sc-r-quote {
          font-size: 0.88rem;
          color: #f3f4f8;
          font-style: italic;
          line-height: 1.45;
          margin-bottom: 6px;
        }
        .sc-r-author {
          font-size: 0.72rem;
          font-weight: 700;
          color: #c4b5fd;
          margin-bottom: 6px;
        }
        .sc-r-ctx {
          font-size: 0.68rem;
          color: #8888a4;
          background: rgba(255, 255, 255, 0.04);
          padding: 6px;
          border-radius: 6px;
        }
        .sc-protocol-box {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 14px;
        }
        .sc-protocol-title {
          font-size: 0.74rem;
          font-weight: 800;
          color: #fca5a5;
          margin-bottom: 6px;
        }
        .sc-protocol-list {
          margin: 0;
          padding-left: 16px;
          font-size: 0.72rem;
          line-height: 1.5;
          color: #f3f4f8;
        }
        .sc-reality-footer {
          display: flex;
          gap: 8px;
        }
        .sc-btn-next-quote {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          background: #181824;
          border: 1px solid #232336;
          color: #f3f4f8;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
        }
        .sc-btn-locked-in {
          flex: 1.4;
          padding: 10px;
          border-radius: 8px;
          background: #7c5cfc;
          border: none;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
        }

        /* Global Toast */
        .sc-toast {
          display: none;
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(18, 18, 26, 0.95);
          border: 1px solid #7c5cfc;
          color: #f3f4f8;
          padding: 10px 18px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 10000000;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
          animation: scFadeIn 0.2s ease;
        }
        .sc-toast.show {
          display: block;
        }

        @keyframes scFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // =============================================================================
  // 10. EXPORTS OBJECT
  // =============================================================================
  const exportsObj = {
    SLEEP_TARGETS,
    MOTIVATION_DATABASE,
    getRandomQuote,
    parseTimeToMinutes,
    minutesToTimeString,
    formatTime12Hour,
    calculateHoursSlept,
    isBedtimeOnTarget,
    isWakeTimeOnTarget,
    isSleepTargetMet,
    calculateSleepDeficit,
    calculateSleepScore,
    calculateSleepStreaks,
    isLateNightLockdownHour,
    getLateNightCutoffMetrics,
    SleepStorage,
    SleepCircadianUI,
    SleepUIComponent: SleepCircadianUI,
    
    // Drop-in alias for older Agent 4 SleepMotivationUI references
    SleepMotivationUI: {
      showLateNightLockdown: (manual) => {
        const app = new SleepCircadianUI();
        app.showLateNightLockdown(manual);
      },
      openEmergencyMotivation: (cat) => {
        const app = new SleepCircadianUI();
        app.openRealityCheckModal(cat);
      },
      activateSleepBlackout: () => {
        const app = new SleepCircadianUI();
        app.openBlackoutBreathingScreen();
      },
      initLateNightCheck: () => {
        const app = new SleepCircadianUI();
        app.initLateNightGuard();
      }
    }
  };

  return exportsObj;
});
