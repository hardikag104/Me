/**
 * SLEEP & EMOTIONAL MOTIVATION ENGINE — LIFE TRACKER PWA
 * Agent 4: Sleep & Discipline Lead
 * 
 * Features:
 * 1. Sleep Targets: Hard target 11:00 PM bedtime, 6:30 AM wake up (7.5 hrs).
 * 2. Sleep Logging: Bedtime, wake time, duration, deficit/surplus, consistency scoring.
 * 3. Sleep Streak: Consecutive days meeting 11 PM bedtime & 6:30 AM wake up targets.
 * 4. Late-Night Lockdown / Reality Check Overlay: Active 11:00 PM - 5:00 AM with deliberate unlock.
 * 5. Emotional Motivation Database: 50+ hard-hitting quotes across 4 critical pillars:
 *    - Parents & Family Sacrifice
 *    - Career, Ambition & Competition ('Someone hungrier is outworking you right now')
 *    - Future Self & Regret Prevention
 *    - BITSian Excellence & Mental Toughness
 * 6. Emergency Motivation / Wake-Up Call: Instant reality check modal with actionable reset protocol.
 */

// ==========================================
// 1. CONFIGURATION & TARGETS
// ==========================================
const SLEEP_CONFIG = {
  targetBedtime: '23:00',     // 11:00 PM Hard Cutoff
  targetWakeTime: '06:30',    // 6:30 AM Hard Wakeup
  targetHours: 7.5,           // Optimal 7.5 hours duration
  lockdownStartHour: 23,      // 11:00 PM (23:00)
  lockdownEndHour: 5,         // 5:00 AM (05:00)
  unlockHoldDurationMs: 3000, // 3-second deliberate hold to override lockdown
};

// ==========================================
// 2. EMOTIONAL MOTIVATION DATABASE
// ==========================================
const MOTIVATION_DATABASE = {
  parents: [
    {
      id: 'p1',
      category: 'Parents & Family Sacrifice',
      tag: 'Sacrifice',
      quote: "Your father didn't swallow his pride, wake up exhausted for thirty years, and work through sickness so you could scroll through junk feeds at 2 AM. Honor the sacrifice.",
      author: "Reality Check",
      context: "Every rupee invested in you came at the expense of their comfort."
    },
    {
      id: 'p2',
      category: 'Parents & Family Sacrifice',
      tag: 'Aging Parents',
      quote: "Look at your mother's hands and the lines on your father's forehead. They are getting older every single day. The window where they can see you succeed, travel the world, and rest peacefully is closing. Hurry up.",
      author: "The Clock Is Ticking",
      context: "Time waits for no one, least of all aging parents."
    },
    {
      id: 'p3',
      category: 'Parents & Family Sacrifice',
      tag: 'Trust',
      quote: "Somewhere right now, your parents are proudly telling a relative that their child is working hard to build a great life. Are you making them proud, or are you making them a liar?",
      author: "Unspoken Belief",
      context: "Their belief in you is unconditional. Don't exploit it."
    },
    {
      id: 'p4',
      category: 'Parents & Family Sacrifice',
      tag: 'Debt of Honor',
      quote: "Every luxury you enjoy today was paid for by a sacrifice they never told you about: medical checkups postponed, worn shoes worn another year, holidays skipped. Repay the debt with mastery.",
      author: "Debt of Honor",
      context: "Your work ethic is the only currency that repays their faith."
    },
    {
      id: 'p5',
      category: 'Parents & Family Sacrifice',
      tag: 'Duty',
      quote: "Your father never had a 'mental health day' when the rent was due. He didn't wait for 'motivation' when you needed food and school fees. He got up and did the job. Show up for him.",
      author: "The Quiet Providers",
      context: "Consistency is love made visible through discipline."
    },
    {
      id: 'p6',
      category: 'Parents & Family Sacrifice',
      tag: 'Legacy',
      quote: "You have air conditioning, high-speed internet, and access to all the knowledge in human history. Your parents started with fraction of that and still built your foundation. Softness is an insult to your lineage.",
      author: "Privilege & Responsibility",
      context: "You start where they finished. Act like a builder."
    },
    {
      id: 'p7',
      category: 'Parents & Family Sacrifice',
      tag: 'Mother\'s Prayer',
      quote: "Your mother prayed for your success before you even knew how to write code or take an exam. Don't let her prayers be answered by someone who had zero work ethic.",
      author: "Silent Prayers",
      context: "Don't let tears of hope turn into tears of quiet disappointment."
    },
    {
      id: 'p8',
      category: 'Parents & Family Sacrifice',
      tag: 'Old Age',
      quote: "The greatest gift you will ever give your parents is the peace of mind that their child is independent, formidable, and unbreakable. That gift is forged by sleeping at 11 PM and waking at 6:30 AM.",
      author: "Peace of Mind",
      context: "Discipline today buys their security tomorrow."
    },
    {
      id: 'p9',
      category: 'Parents & Family Sacrifice',
      tag: 'Gratitude',
      quote: "When you feel like quitting or sleeping in, picture your parents' tired smiles when you finally hand them your first major achievement. Let that image pull you out of bed.",
      author: "The Destination",
      context: "Their pride will be worth every early morning."
    },
    {
      id: 'p10',
      category: 'Parents & Family Sacrifice',
      tag: 'Accountability',
      quote: "They didn't give you everything they had so that you could settle for 'average'. You owe it to your family name to be extraordinary.",
      author: "Family Standard",
      context: "Average effort produces mediocre lives. You were not raised for mediocre."
    },
    {
      id: 'p11',
      category: 'Parents & Family Sacrifice',
      tag: 'Respect',
      quote: "Respect isn't what you say to your parents on their birthdays. Respect is what you do when you are alone with your laptop, phone, and time.",
      author: "True Respect",
      context: "Your private habits reveal how much you truly value their sacrifice."
    },
    {
      id: 'p12',
      category: 'Parents & Family Sacrifice',
      tag: 'Resolve',
      quote: "Stop dreaming about paying off their mortgage and buying them luxury cars while staying up until 3 AM playing games. Action precedes the reward.",
      author: "Action Over Talk",
      context: "Dreams without sleep discipline are merely delusions."
    }
  ],

  career: [
    {
      id: 'c1',
      category: 'Career, Ambition & Competition',
      tag: 'Competition',
      quote: "Someone hungrier is outworking you right now. While you debate going to bed, a competitor in a cramped hostel room is finishing their 400th problem and reading system architecture whitepapers.",
      author: "The Hunger Rule",
      context: "The market is ruthless. It awards the crown to the prepared."
    },
    {
      id: 'c2',
      category: 'Career, Ambition & Competition',
      tag: 'Placements & Day 1',
      quote: "Placement season does not reward who wanted it most or who had the most potential. It rewards the student who logged 500 hours of deep work between 6 AM and 11 PM while others partied.",
      author: "The Placement Truth",
      context: "Day 1 offers are won in silent mornings months in advance."
    },
    {
      id: 'c3',
      category: 'Career, Ambition & Competition',
      tag: 'Meritocracy',
      quote: "The tech industry does not care about your excuses, your bad days, or your good intentions. It only cares about competence. You are either indispensable or completely replaceable.",
      author: "Market Reality",
      context: "Skill is the only real leverage in the modern economy."
    },
    {
      id: 'c4',
      category: 'Career, Ambition & Competition',
      tag: 'The Top 1%',
      quote: "You claim you want top 1% income, top 1% prestige, and complete creative freedom. But your sleep, habits, and focus look like the bottom 50%. You cannot live like the average and expect the exceptional.",
      author: "1% Mathematics",
      context: "The price of top-tier success must be paid in full."
    },
    {
      id: 'c5',
      category: 'Career, Ambition & Competition',
      tag: 'Unfair Advantage',
      quote: "Discipline is the ultimate unfair advantage. It cannot be bought, inherited, or faked. When you own your morning and sleep before 11 PM, you destroy 95% of your competition before lunch.",
      author: "The Asymmetry of Grit",
      context: "Most people self-sabotage with late nights. Don't be most people."
    },
    {
      id: 'c6',
      category: 'Career, Ambition & Competition',
      tag: 'Comfort Trap',
      quote: "Every single time you choose comfort, dopamine, and procrastination over hard work, your rival smiles. You just handed them your interview, your salary, and your seat.",
      author: "Zero Sum Game",
      context: "There are only so many elite seats. Are you giving yours away?"
    },
    {
      id: 'c7',
      category: 'Career, Ambition & Competition',
      tag: 'Excellence',
      quote: "Excellence is not an accident; it is the accumulation of unglamorous, repetitive, solitary discipline when nobody is watching, clapping, or cheering.",
      author: "The Craft",
      context: "Public triumphs are purchased with private sweat."
    },
    {
      id: 'c8',
      category: 'Career, Ambition & Competition',
      tag: 'Proof vs Dreams',
      quote: "The market will never pay you for your potential. It will only pay you for your proof. Stop daydreaming about unicorns and build the portfolio.",
      author: "Show the Code",
      context: "Execution beats visionary talk every single day."
    },
    {
      id: 'c9',
      category: 'Career, Ambition & Competition',
      tag: 'Sharp Minds',
      quote: "Staying awake past 11 PM doesn't make you a hustler; it turns you into a sluggish, brain-fogged zombie who codes at 30% speed tomorrow. Sleep like a pro athlete so you can dominate like one.",
      author: "High Performance Protocol",
      context: "Sleep is biological performance-enhancing technology."
    },
    {
      id: 'c10',
      category: 'Career, Ambition & Competition',
      tag: 'Speed & Urgency',
      quote: "In five years, AI and global talent will eliminate every mediocre engineer. If you don't master deep focus and high-order thinking today, you won't even be in the arena tomorrow.",
      author: "The AI Crucible",
      context: "Discipline is your survival armor in a hyper-competitive century."
    },
    {
      id: 'c11',
      category: 'Career, Ambition & Competition',
      tag: 'Ruthless Focus',
      quote: "Amateurs wait for inspiration. Titans put their phones away, sit down at their desks at 7:00 AM, and execute until the mission is finished.",
      author: "Professional Standard",
      context: "Treat your craft as a sacred duty, not a casual hobby."
    },
    {
      id: 'c12',
      category: 'Career, Ambition & Competition',
      tag: 'The Clock',
      quote: "While you are wasting 3 hours on social media arguments, your future coworker is deploying microservices and mastering system design. Close the gap now.",
      author: "Opportunity Cost",
      context: "Every wasted hour widens the gap between where you are and where you need to be."
    }
  ],

  regret: [
    {
      id: 'r1',
      category: 'Future Self & Regret Prevention',
      tag: 'The Two Pains',
      quote: "There are only two pains in life: the pain of discipline which weighs ounces, and the pain of regret which weighs tons. You must choose which one you will carry forever.",
      author: "Jim Rohn / Eternal Truth",
      context: "Discipline is temporary discomfort. Regret is permanent anguish."
    },
    {
      id: 'r2',
      category: 'Future Self & Regret Prevention',
      tag: 'The Ghost of Potential',
      quote: "Imagine meeting the person you could have become at the end of your life. They had your brain, your college, your advantages—but they kept their promises, slept on time, and did the work. Will that meeting be your greatest pride or your deepest hell?",
      author: "The Mirror Test",
      context: "Don't let your unfulfilled potential haunt you for decades."
    },
    {
      id: 'r3',
      category: 'Future Self & Regret Prevention',
      tag: 'Cheap Dopamine',
      quote: "In five years, you won't remember a single YouTube short, reel, or meme you stayed up late to watch. But you will carry the permanent scar of the opportunities you threw away.",
      author: "Vanishing Dopamine",
      context: "Stop trading lifelong greatness for 15 seconds of synthetic dopamine."
    },
    {
      id: 'r4',
      category: 'Future Self & Regret Prevention',
      tag: 'Bitter Poison',
      quote: "Regret is the most bitter poison known to the human soul. It whispers when you're 30: 'You had the mind. You had the chance. You just lacked the backbone to get out of bed.'",
      author: "The Mid-Career Awakening",
      context: "Fix it now while your youth is still on your side."
    },
    {
      id: 'r5',
      category: 'Future Self & Regret Prevention',
      tag: 'Tomorrow Lie',
      quote: "The easiest person to lie to is yourself. You tell yourself 'I'll start tomorrow' every night before falling into a sleep coma. How many tomorrows do you think you have left?",
      author: "The Tomorrow Fallacy",
      context: "Tomorrow is the graveyard where great lives go to die."
    },
    {
      id: 'r6',
      category: 'Future Self & Regret Prevention',
      tag: 'Self-Respect',
      quote: "Every broken promise to yourself chips away at your self-esteem. When you say 'I'll sleep at 11' and stay up till 2, you tell your subconscious that your word is worthless. Rebuild your honor tonight.",
      author: "Integrity",
      context: "Confidence is simply keeping promises you make to yourself."
    },
    {
      id: 'r7',
      category: 'Future Self & Regret Prevention',
      tag: 'The Turning Point',
      quote: "Ten years from now, you will look back on this exact period of your life as the pivot: the moment you either woke up and seized control, or let yourself slide into lifelong mediocrity.",
      author: "The Crossroads",
      context: "History is made at crossroads like tonight."
    },
    {
      id: 'r8',
      category: 'Future Self & Regret Prevention',
      tag: 'Unforgiving Time',
      quote: "Time does not pause while you feel unmotivated. The days burn away like dry timber. You cannot buy back your 20s with all the money in the world.",
      author: "Memento Mori",
      context: "Treasure your prime years by demanding excellence of yourself."
    },
    {
      id: 'r9',
      category: 'Future Self & Regret Prevention',
      tag: 'The 6:30 Alarm',
      quote: "Suffer the harsh sound of the 6:30 AM alarm clock now, or suffer the heartbreak of watching less capable people live the dream you were too lazy to build.",
      author: "Choose Your Hard",
      context: "Waking up early is hard. Wasted potential is 1,000x harder."
    },
    {
      id: 'r10',
      category: 'Future Self & Regret Prevention',
      tag: 'The Price of Quitting',
      quote: "When you feel like quitting, ask yourself: 'If I quit now, what will I be doing five years from now?' If the answer disgusts you, get back to work.",
      author: "The Disgust Trigger",
      context: "Use positive disgust to kill procrastination."
    },
    {
      id: 'r11',
      category: 'Future Self & Regret Prevention',
      tag: 'Future Children',
      quote: "One day your future child will ask you why you didn't reach the heights you dreamed of. What will you say? 'I liked staying up late on my smartphone'? Let that shame wake you up.",
      author: "Generational Accountability",
      context: "Set the standard your descendants will be proud to follow."
    },
    {
      id: 'r12',
      category: 'Future Self & Regret Prevention',
      tag: 'Now Or Never',
      quote: "Nobody is coming to save you. No mentor, no miracle, no lucky lottery. It is you against your own laziness. Win the battle tonight.",
      author: "Total Ownership",
      context: "You are the author of your own redemption."
    }
  ],

  bitsian: [
    {
      id: 'b1',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Zero Percent Attendance',
      quote: "Zero percent attendance is not a license to rot in bed until noon. It is BITS' greatest test of character: can you govern yourself with iron discipline when no professor is taking roll call?",
      author: "The BITSian Ethos",
      context: "True freedom requires supreme self-governance."
    },
    {
      id: 'b2',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Pilani Spirit',
      quote: "BITS Pilani was forged in the desert by titans who built unicorns, scaled global institutions, and wrote legendary software. You earned a seat among the elite. Act like you belong in this lineage.",
      author: "Desert Crucible",
      context: "The BITS brand was built on grit. Don't dilute it."
    },
    {
      id: 'b3',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Freedom vs Anarchy',
      quote: "BITS gave you absolute freedom. Fools use it to destroy their sleep, ruin their CGPA, and binge distractions. Masters use it to build companies, master algorithms, and become lethal.",
      author: "The Two Paths",
      context: "How you use your autonomy defines your destiny."
    },
    {
      id: 'b4',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Compre Season & CGPA',
      quote: "The grading curve does not care about your wing gossip or how late you chilled at ANC. When compres arrive, only your stamina, clarity of mind, and disciplined preparation will stand between you and an 8+ CGPA.",
      author: "The Curve Truth",
      context: "Protect your CGPA like your career depends on it—because it does."
    },
    {
      id: 'b5',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Library Grinds',
      quote: "Remember why you fought through the BITSAT gauntlet to get here. You beat 150,000 people to sit in this campus. Don't let that hunger die because you're comfortable in your hostel room.",
      author: "The BITSAT Fire",
      context: "Rekindle the relentless fire that brought you here."
    },
    {
      id: 'b6',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Wing Culture vs Mission',
      quote: "Your wingmates might stay up gaming or bantering until 4 AM. Let them. You are on a different mission. Sleep at 11:00 PM, rise at 6:30 AM, and let your results do the talking.",
      author: "The Lone Wolf Standard",
      context: "Eagles don't flock with pigeons. Lead by example."
    },
    {
      id: 'b7',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Mental Toughness',
      quote: "Mental toughness is doing what must be done, when it must be done, whether you feel like it or not. That is the true BITSian code.",
      author: "The Code",
      context: "Feelings are fickle. Standards are permanent."
    },
    {
      id: 'b8',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Unicorn Legacy',
      quote: "From Swiggy to Postman, BITSians didn't build billion-dollar legacies by sleeping through morning opportunities. They dominated because when challenges struck, they doubled down.",
      author: "Founder Mindset",
      context: "You have founder blood in your alma mater. Live up to it."
    },
    {
      id: 'b9',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'ANC Reality Check',
      quote: "Eating Maggi at ANC at 2:30 AM while doing nothing productive is not 'college culture'—it's slow suicide of your potential. Go to bed. Your future self needs you sharp.",
      author: "Hard Truth",
      context: "Romanticizing bad sleep habits is for fools."
    },
    {
      id: 'b10',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Rotunda / Campus Walk',
      quote: "When you walk past the Clock Tower and Rotunda at 6:30 AM in the crisp morning air, you feel what ordinary students never taste: absolute ownership of your day.",
      author: "Morning Clarity",
      context: "Early mornings in Pilani/Goa/Hyderabad belong to the champions."
    },
    {
      id: 'b11',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Self-Respect',
      quote: "You didn't come to BITS to be average. You came to test the outer limits of your intellect. Set your bedtime to 11 PM and give your brain the recovery it deserves.",
      author: "Intellectual Vitality",
      context: "Your brain is your primary weapon. Sharpen it every night."
    },
    {
      id: 'b12',
      category: 'BITSian Excellence & Mental Toughness',
      tag: 'Unbreakable Spirit',
      quote: "The world expects BITSians to lead, to innovate, and to triumph. Leadership starts with leading yourself to bed at 11 PM. Execute without excuses.",
      author: "The High Standard",
      context: "If you cannot command yourself, you cannot command an organization."
    }
  ]
};

// ==========================================
// 3. SLEEP MATH & CALCULATION ALGORITHMS
// ==========================================

/**
 * Converts "HH:MM" string to minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return (hours * 60) + minutes;
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
 * Calculates total hours slept between bedtime and wake time.
 * Handles crossing midnight correctly.
 * Example: Bedtime 22:45, Wake 06:15 -> 7.50 hrs.
 * Example: Bedtime 01:30, Wake 06:30 -> 5.00 hrs.
 */
function calculateHoursSlept(bedtimeStr, wakeTimeStr) {
  const bedMins = parseTimeToMinutes(bedtimeStr);
  const wakeMins = parseTimeToMinutes(wakeTimeStr);

  if (bedMins === null || wakeMins === null) return 0;

  let diffMins;
  if (wakeMins <= bedMins) {
    // Crossed midnight (e.g. Bed 22:30 -> Wake 06:30)
    diffMins = (wakeMins + 1440) - bedMins;
  } else {
    // Slept and woke in same cycle (e.g. Bed 01:00 -> Wake 06:30)
    diffMins = wakeMins - bedMins;
  }

  // Sanity check: max 16 hours, min 0.5 hours
  if (diffMins > 16 * 60) diffMins = 16 * 60;
  if (diffMins < 0) diffMins = 0;

  return +(diffMins / 60).toFixed(2);
}

/**
 * Checks if bedtime is on or before the 11:00 PM hard cutoff.
 * Eligible on-target window: 19:00 (7 PM) through 23:00 (11:00 PM).
 * After 23:00 or past midnight before 06:00 is considered late.
 */
function isBedtimeOnTarget(bedtimeStr) {
  const mins = parseTimeToMinutes(bedtimeStr);
  if (mins === null) return false;
  // 19:00 = 1140, 23:00 = 1380
  return mins >= 1140 && mins <= 1380;
}

/**
 * Checks if wake time is on or before the 6:30 AM hard target.
 * Eligible on-target window: 04:30 through 06:30.
 * After 06:30 (e.g., 07:00, 08:30) is considered late.
 */
function isWakeTimeOnTarget(wakeTimeStr) {
  const mins = parseTimeToMinutes(wakeTimeStr);
  if (mins === null) return false;
  // 04:30 = 270, 06:30 = 390
  return mins >= 270 && mins <= 390;
}

/**
 * Evaluates whether both sleep targets were achieved.
 */
function isSleepTargetMet(bedtimeStr, wakeTimeStr) {
  return isBedtimeOnTarget(bedtimeStr) && isWakeTimeOnTarget(wakeTimeStr);
}

/**
 * Calculates sleep deficit or surplus relative to target (7.5 hrs).
 */
function calculateSleepDeficit(hoursSlept, targetHours = SLEEP_CONFIG.targetHours) {
  const diff = targetHours - hoursSlept;
  const deficit = diff > 0 ? +diff.toFixed(2) : 0;
  const surplus = diff < 0 ? +Math.abs(diff).toFixed(2) : 0;

  let severity = 'optimal';
  if (deficit >= 2.5) severity = 'severe';
  else if (deficit >= 1.0) severity = 'moderate';
  else if (deficit > 0) severity = 'mild';

  return {
    hoursSlept,
    targetHours,
    deficit,
    surplus,
    isDeficit: deficit > 0,
    severity,
    label: deficit === 0 ? 'Optimal (0h Deficit)' : `-${deficit}h Deficit`
  };
}

/**
 * Calculates Sleep Consistency Score (0 - 100%) and Multi-Day Metrics:
 * - Bedtime & Wake Time Standard Deviation (lower = better)
 * - Adherence % to Target Bedtime (<= 11:00 PM)
 * - Adherence % to Target Wake Time (<= 6:30 AM)
 * - Average hours and 7-day cumulative sleep debt
 */
function calculateSleepConsistency(sleepLogsArray) {
  if (!Array.isArray(sleepLogsArray) || sleepLogsArray.length === 0) {
    return {
      score: 100,
      rating: 'No Data Yet',
      avgHours: 0,
      cumulativeDebt: 0,
      targetAdherenceRate: 0,
      bedtimeVarianceMins: 0,
      wakeVarianceMins: 0
    };
  }

  // Take the most recent 7 logs
  const logs = sleepLogsArray.slice(-7);
  let totalHours = 0;
  let totalDebt = 0;
  let targetMetCount = 0;

  const normalizedBedtimes = [];
  const normalizedWaketimes = [];

  logs.forEach(log => {
    const hours = log.hours || calculateHoursSlept(log.bed, log.wake);
    totalHours += hours;
    
    // Deficit calculation
    if (hours < SLEEP_CONFIG.targetHours) {
      totalDebt += (SLEEP_CONFIG.targetHours - hours);
    }

    if (isSleepTargetMet(log.bed, log.wake)) {
      targetMetCount++;
    }

    // Convert bedtime to relative scale where 23:00 = 0
    const bMins = parseTimeToMinutes(log.bed);
    if (bMins !== null) {
      // If after 12:00 PM (e.g. 22:30 -> 1350 mins, relative to 23:00 is -30 mins)
      // If past midnight (e.g. 01:00 -> 60 mins -> +120 mins late)
      const relBed = bMins >= 720 ? (bMins - 1380) : (bMins + 60);
      normalizedBedtimes.push(relBed);
    }

    // Convert wake time relative to 06:30 (390 mins)
    const wMins = parseTimeToMinutes(log.wake);
    if (wMins !== null) {
      normalizedWaketimes.push(wMins - 390);
    }
  });

  const count = logs.length;
  const avgHours = +(totalHours / count).toFixed(1);
  const cumulativeDebt = +totalDebt.toFixed(1);
  const targetAdherenceRate = Math.round((targetMetCount / count) * 100);

  // Helper for standard deviation
  const calcStdDev = (arr) => {
    if (arr.length <= 1) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  };

  const bedStdDev = calcStdDev(normalizedBedtimes);
  const wakeStdDev = calcStdDev(normalizedWaketimes);

  // Scoring weights:
  // 40% Target Adherence (% days sleeping <= 11 PM & waking <= 6:30 AM)
  // 30% Schedule Stability (Bedtime & Wake standard deviation)
  // 30% Duration Adequacy (avoiding cumulative debt)

  const adherenceScore = targetAdherenceRate;
  
  // Stability score: 0 std dev = 100, 120 mins std dev = 0
  const avgStdDev = (bedStdDev + wakeStdDev) / 2;
  const stabilityScore = Math.max(0, Math.min(100, Math.round(100 - (avgStdDev / 1.2))));

  // Debt penalty: 0h debt = 100, 10h debt = 0
  const debtScore = Math.max(0, Math.min(100, Math.round(100 - (cumulativeDebt * 10))));

  const compositeScore = Math.round((adherenceScore * 0.40) + (stabilityScore * 0.30) + (debtScore * 0.30));

  let rating = 'Spartan Discipline';
  let badgeColor = 'var(--green)';
  if (compositeScore >= 90) {
    rating = 'Elite Spartan (90%+)';
    badgeColor = '#22c55e';
  } else if (compositeScore >= 75) {
    rating = 'Consistent & Solid (75-89%)';
    badgeColor = '#3b82f6';
  } else if (compositeScore >= 50) {
    rating = 'Fluctuating / Warning (50-74%)';
    badgeColor = '#f59e0b';
  } else {
    rating = 'Chaotic / Crisis Level (<50%)';
    badgeColor = '#ef4444';
  }

  return {
    score: compositeScore,
    rating,
    badgeColor,
    avgHours,
    cumulativeDebt,
    targetAdherenceRate,
    bedtimeVarianceMins: Math.round(bedStdDev),
    wakeVarianceMins: Math.round(wakeStdDev)
  };
}

/**
 * Calculates current and best consecutive sleep streaks.
 * Rule: Both Bedtime <= 11:00 PM AND Wake time <= 6:30 AM.
 */
function calculateSleepStreaks(dateSleepMap) {
  const dates = Object.keys(dateSleepMap).sort();
  if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  let bestStreak = 0;
  let running = 0;
  let prevDate = null;

  dates.forEach(dateStr => {
    const record = dateSleepMap[dateStr];
    const isMet = isSleepTargetMet(record.bed, record.wake);

    if (isMet) {
      if (!prevDate) {
        running = 1;
      } else {
        const dCurrent = new Date(dateStr);
        const dPrev = new Date(prevDate);
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
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Check if today is logged and met
  let checkDate = new Date(today);
  if (dateSleepMap[todayStr] && isSleepTargetMet(dateSleepMap[todayStr].bed, dateSleepMap[todayStr].wake)) {
    // start from today
  } else if (dateSleepMap[yesterdayStr] && isSleepTargetMet(dateSleepMap[yesterdayStr].bed, dateSleepMap[yesterdayStr].wake)) {
    // start from yesterday
    checkDate = new Date(yesterday);
  } else {
    // Streak broken
    return { currentStreak: 0, bestStreak };
  }

  while (true) {
    const curStr = checkDate.toISOString().slice(0, 10);
    const rec = dateSleepMap[curStr];
    if (rec && isSleepTargetMet(rec.bed, rec.wake)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, bestStreak };
}

// ==========================================
// 4. LATE-NIGHT CHECK & LOCKDOWN LOGIC
// ==========================================

/**
 * Checks if the current time falls in the lockdown window (11:00 PM - 5:00 AM).
 */
function isLateNightLockdownTime(dateObj = new Date()) {
  const hours = dateObj.getHours();
  // 11 PM (23) or midnight to 4:59 AM (0, 1, 2, 3, 4)
  return hours >= SLEEP_CONFIG.lockdownStartHour || hours < SLEEP_CONFIG.lockdownEndHour;
}

/**
 * Calculates exact minutes past 11:00 PM deadline and minutes until 6:30 AM wake target.
 */
function getLateNightTimeMetrics(dateObj = new Date()) {
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const currentTotal = hours * 60 + minutes;

  // Minutes past 11:00 PM (1380 mins)
  let minutesPastBedtime = 0;
  if (hours >= 23) {
    minutesPastBedtime = currentTotal - 1380;
  } else if (hours < 5) {
    minutesPastBedtime = (currentTotal + 1440) - 1380;
  }

  // Minutes until 6:30 AM (390 mins)
  let minutesUntilWakeup = 0;
  if (hours >= 23) {
    minutesUntilWakeup = (390 + 1440) - currentTotal;
  } else if (hours < 7) {
    minutesUntilWakeup = Math.max(0, 390 - currentTotal);
  }

  const hoursPast = Math.floor(minutesPastBedtime / 60);
  const minsPast = minutesPastBedtime % 60;
  const pastString = hoursPast > 0 ? `${hoursPast}h ${minsPast}m` : `${minsPast}m`;

  const hoursLeft = Math.floor(minutesUntilWakeup / 60);
  const minsLeft = minutesUntilWakeup % 60;
  const leftString = `${hoursLeft}h ${minsLeft}m`;

  return {
    minutesPastBedtime,
    minutesUntilWakeup,
    pastString,
    leftString,
    sleepRemainingHours: +(minutesUntilWakeup / 60).toFixed(1)
  };
}

/**
 * Fetches a random or targeted quote from the Motivation Database.
 */
function getRandomMotivation(category = 'all') {
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

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// ==========================================
// 5. AUDIO & HAPTIC FEEDBACK HELPERS
// ==========================================
const SensoryFeedback = {
  vibrate: function(pattern = [50, 100, 50]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  },

  playAlertTone: function() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be blocked or unsupported
    }
  }
};

// ==========================================
// 6. UI CONTROLLERS (MODALS & OVERLAYS)
// ==========================================

const SleepMotivationUI = {
  lockdownOverlayId: 'lateLockdownOverlay',
  emergencyModalId: 'emergencyRealityModal',

  /**
   * Initializes late night checking and auto-triggers overlay if between 11PM and 5AM.
   */
  initLateNightCheck: function() {
    if (isLateNightLockdownTime()) {
      const dismissedUntil = sessionStorage.getItem('lockdown_override_until');
      const now = Date.now();
      if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
        this.showLateNightLockdown();
      }
    }

    // Periodically re-check every minute
    setInterval(() => {
      if (isLateNightLockdownTime()) {
        const dismissedUntil = sessionStorage.getItem('lockdown_override_until');
        const now = Date.now();
        if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
          const overlay = document.getElementById(this.lockdownOverlayId);
          if (!overlay || !overlay.classList.contains('show')) {
            this.showLateNightLockdown();
          }
        }
      }
    }, 60000);
  },

  /**
   * Renders and displays the Late-Night Lockdown Overlay.
   */
  showLateNightLockdown: function() {
    let overlay = document.getElementById(this.lockdownOverlayId);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = this.lockdownOverlayId;
      overlay.className = 'lockdown-overlay';
      document.body.appendChild(overlay);
    }

    const metrics = getLateNightTimeMetrics();
    // Prioritize career & parents quote for late-night impact
    const quote = Math.random() > 0.5 ? getRandomMotivation('career') : getRandomMotivation('parents');

    SensoryFeedback.vibrate([100, 150, 200]);
    SensoryFeedback.playAlertTone();

    overlay.innerHTML = `
      <div class="lockdown-content">
        <div class="lockdown-header">
          <span class="lockdown-badge">⚠️ LATE-NIGHT REALITY CHECK</span>
          <h1 class="lockdown-title">11:00 PM Hard Cutoff Violated</h1>
          <div class="lockdown-clock" id="lockdownLiveClock">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>

        <div class="lockdown-metrics">
          <div class="metric-card danger">
            <div class="metric-val">+${metrics.pastString}</div>
            <div class="metric-lbl">Past Sleep Target</div>
          </div>
          <div class="metric-card warning">
            <div class="metric-val">${metrics.leftString}</div>
            <div class="metric-lbl">Until 6:30 AM Alarm</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">${metrics.sleepRemainingHours}h</div>
            <div class="metric-lbl">Max Sleep Remaining</div>
          </div>
        </div>

        <div class="lockdown-quote-box">
          <div class="quote-pillar">${quote.category.toUpperCase()}</div>
          <p class="quote-body">"${quote.quote}"</p>
          <div class="quote-meta">— ${quote.author}</div>
          <div class="quote-context">💡 ${quote.context}</div>
        </div>

        <div class="lockdown-impact">
          <strong>The Biological Consequence:</strong> Every minute past 11 PM degrades tomorrow's prefrontal cortex speed, raises cortisol, and costs you your BITSian edge against your competition.
        </div>

        <div class="lockdown-actions">
          <button class="btn-lockdown-sleep" onclick="SleepMotivationUI.activateSleepBlackout()">
            💤 Power Down & Sleep Now
          </button>
          
          <div class="override-container">
            <button class="btn-lockdown-override" id="btnOverrideHold" 
                    onmousedown="SleepMotivationUI.startOverrideHold(event)"
                    onmouseup="SleepMotivationUI.cancelOverrideHold()"
                    onmouseleave="SleepMotivationUI.cancelOverrideHold()"
                    ontouchstart="SleepMotivationUI.startOverrideHold(event)"
                    ontouchend="SleepMotivationUI.cancelOverrideHold()">
              Hold 3s to Override Lockdown
            </button>
            <div class="hold-progress-bar"><div class="hold-progress-fill" id="holdProgressFill"></div></div>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('show');

    // Live clock ticker
    if (this._clockInterval) clearInterval(this._clockInterval);
    this._clockInterval = setInterval(() => {
      const clockEl = document.getElementById('lockdownLiveClock');
      if (clockEl) {
        clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }, 1000);
  },

  /**
   * Manages deliberate 3-second hold to avoid accidental dismissals.
   */
  _holdTimer: null,
  _holdStartTime: 0,
  _animFrame: null,

  startOverrideHold: function(e) {
    if (e && e.preventDefault) e.preventDefault();
    this._holdStartTime = Date.now();
    const fill = document.getElementById('holdProgressFill');

    const updateFill = () => {
      const elapsed = Date.now() - this._holdStartTime;
      const pct = Math.min(100, (elapsed / SLEEP_CONFIG.unlockHoldDurationMs) * 100);
      if (fill) fill.style.width = pct + '%';

      if (elapsed >= SLEEP_CONFIG.unlockHoldDurationMs) {
        this.confirmOverride();
      } else {
        this._animFrame = requestAnimationFrame(updateFill);
      }
    };
    this._animFrame = requestAnimationFrame(updateFill);
  },

  cancelOverrideHold: function() {
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    const fill = document.getElementById('holdProgressFill');
    if (fill) fill.style.width = '0%';
  },

  confirmOverride: function() {
    this.cancelOverrideHold();
    // Allow 45 minutes before warning pops up again
    sessionStorage.setItem('lockdown_override_until', (Date.now() + 45 * 60 * 1000).toString());
    const overlay = document.getElementById(this.lockdownOverlayId);
    if (overlay) overlay.classList.remove('show');
    if (this._clockInterval) clearInterval(this._clockInterval);
  },

  /**
   * Blackout Sleep Mode: Puts the screen in low-light breathing mode to guide sleep.
   */
  activateSleepBlackout: function() {
    const overlay = document.getElementById(this.lockdownOverlayId);
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="blackout-sleep-box">
        <div class="sleep-moon">🌙</div>
        <h2>Phone Face Down. Screens Off.</h2>
        <p>Hard target: <strong>6:30 AM Wake Up</strong>.</p>
        <div class="breathing-circle"></div>
        <p class="breathe-sub">Breathe with the circle: Inhale 4s, Hold 7s, Exhale 8s.</p>
        <button class="btn-exit-blackout" onclick="SleepMotivationUI.closeBlackout()">Exit Blackout</button>
      </div>
    `;
  },

  closeBlackout: function() {
    const overlay = document.getElementById(this.lockdownOverlayId);
    if (overlay) overlay.classList.remove('show');
  },

  /**
   * Renders the Emergency Motivation / Wake-Up Call Modal.
   */
  openEmergencyMotivation: function(category = 'all') {
    let modal = document.getElementById(this.emergencyModalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = this.emergencyModalId;
      modal.className = 'emergency-modal';
      document.body.appendChild(modal);
    }

    const quote = getRandomMotivation(category);
    SensoryFeedback.vibrate([80, 50, 80]);

    modal.innerHTML = `
      <div class="emergency-modal-dialog">
        <div class="emergency-modal-header">
          <div class="emergency-icon-tag">🚨 WAKE-UP CALL / REALITY CHECK</div>
          <button class="emergency-modal-close" onclick="SleepMotivationUI.closeEmergencyMotivation()">&times;</button>
        </div>

        <!-- Category Filter Tabs -->
        <div class="category-tabs">
          <button class="tab-btn ${category === 'all' ? 'active' : ''}" onclick="SleepMotivationUI.openEmergencyMotivation('all')">🎲 Random</button>
          <button class="tab-btn ${category === 'parents' ? 'active' : ''}" onclick="SleepMotivationUI.openEmergencyMotivation('parents')">👨‍👩‍👧 Parents</button>
          <button class="tab-btn ${category === 'career' ? 'active' : ''}" onclick="SleepMotivationUI.openEmergencyMotivation('career')">⚔️ Career</button>
          <button class="tab-btn ${category === 'regret' ? 'active' : ''}" onclick="SleepMotivationUI.openEmergencyMotivation('regret')">⏳ Regret</button>
          <button class="tab-btn ${category === 'bitsian' ? 'active' : ''}" onclick="SleepMotivationUI.openEmergencyMotivation('bitsian')">🏛️ BITSian</button>
        </div>

        <div class="emergency-quote-card">
          <div class="quote-category-title">${quote.category}</div>
          <div class="quote-text-large">"${quote.quote}"</div>
          <div class="quote-author-tag">— ${quote.author}</div>
          <div class="quote-context-highlight">⚡ <strong>Context:</strong> ${quote.context}</div>
        </div>

        <div class="reset-protocol-box">
          <div class="protocol-header">⚡ 5-Minute Reset Protocol</div>
          <ul class="protocol-list">
            <li><strong>1. Cold Shock:</strong> Wash your face with cold water or drink a full glass immediately.</li>
            <li><strong>2. Kill Dopamine:</strong> Close all social media, YouTube, and messaging tabs.</li>
            <li><strong>3. Stand Up:</strong> Do 10 pushups or 20 jumping jacks to spike heart rate and alertness.</li>
            <li><strong>4. Single Task:</strong> Set a timer for 25 minutes. Do not touch your phone until it rings.</li>
          </ul>
        </div>

        <div class="emergency-modal-footer">
          <button class="btn-refresh-quote" onclick="SleepMotivationUI.openEmergencyMotivation('${category}')">
            🔄 Another Reality Check
          </button>
          <button class="btn-im-locked-in" onclick="SleepMotivationUI.closeEmergencyMotivation()">
            ⚔️ I Am Locked In. Let's Work.
          </button>
        </div>
      </div>
    `;

    modal.classList.add('show');
  },

  closeEmergencyMotivation: function() {
    const modal = document.getElementById(this.emergencyModalId);
    if (modal) modal.classList.remove('show');
  },

  /**
   * Injects CSS styles dynamically into document head for lockdown and emergency modals.
   */
  injectStyles: function() {
    if (typeof document === 'undefined' || document.getElementById('sleep-motivation-styles')) return;

    const style = document.createElement('style');
    style.id = 'sleep-motivation-styles';
    style.textContent = `
      /* Late-Night Lockdown Overlay */
      .lockdown-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(8, 8, 12, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 10000;
        overflow-y: auto;
        align-items: center;
        justify-content: center;
        padding: 20px 16px;
        animation: fadeIn 0.3s ease;
      }
      .lockdown-overlay.show { display: flex; }
      .lockdown-content {
        width: 100%;
        max-width: 500px;
        background: #11111a;
        border: 1px solid rgba(239, 68, 68, 0.45);
        border-radius: 18px;
        padding: 24px 20px;
        box-shadow: 0 0 60px rgba(239, 68, 68, 0.25);
        text-align: center;
      }
      .lockdown-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid #ef4444;
        color: #fca5a5;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .lockdown-title {
        font-size: 1.35rem;
        color: #fff;
        font-weight: 800;
        margin-bottom: 6px;
      }
      .lockdown-clock {
        font-size: 1.8rem;
        font-weight: 800;
        color: #ef4444;
        letter-spacing: -0.02em;
        margin-bottom: 16px;
      }
      .lockdown-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 18px;
      }
      .metric-card {
        background: #171724;
        border: 1px solid #232336;
        border-radius: 8px;
        padding: 10px 4px;
      }
      .metric-card.danger {
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
      }
      .metric-card.warning {
        border-color: rgba(245, 158, 11, 0.4);
        color: #fcd34d;
      }
      .metric-val {
        font-size: 1.15rem;
        font-weight: 800;
      }
      .metric-lbl {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        opacity: 0.8;
        margin-top: 2px;
      }
      .lockdown-quote-box {
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid #232336;
        border-radius: 12px;
        padding: 16px 14px;
        margin-bottom: 16px;
        text-align: left;
      }
      .quote-pillar {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #a78bfa;
        margin-bottom: 6px;
      }
      .quote-body {
        font-size: 0.95rem;
        font-style: italic;
        line-height: 1.5;
        color: #f3f4f8;
        margin-bottom: 8px;
      }
      .quote-meta {
        font-size: 0.75rem;
        font-weight: 700;
        color: #9494a8;
        text-align: right;
      }
      .quote-context {
        font-size: 0.72rem;
        color: #6b7280;
        margin-top: 6px;
        border-top: 1px solid #232336;
        padding-top: 6px;
      }
      .lockdown-impact {
        font-size: 0.75rem;
        color: #9ca3af;
        line-height: 1.5;
        margin-bottom: 20px;
        background: rgba(239, 68, 68, 0.08);
        border-left: 3px solid #ef4444;
        padding: 8px 10px;
        text-align: left;
        border-radius: 4px;
      }
      .btn-lockdown-sleep {
        width: 100%;
        background: #7c5cfc;
        color: #fff;
        border: none;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(124, 92, 252, 0.35);
        transition: all 0.2s;
        margin-bottom: 12px;
      }
      .btn-lockdown-sleep:hover {
        background: #8f72ff;
        transform: translateY(-1px);
      }
      .override-container { position: relative; }
      .btn-lockdown-override {
        width: 100%;
        background: transparent;
        border: 1px solid #2a2a3a;
        color: #8888a4;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        user-select: none;
      }
      .hold-progress-bar {
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        margin-top: 4px;
      }
      .hold-progress-fill {
        height: 100%;
        width: 0%;
        background: #ef4444;
        transition: width 0.05s linear;
      }

      /* Blackout Sleep Guide */
      .blackout-sleep-box {
        text-align: center;
        color: #f3f4f8;
        padding: 40px 20px;
      }
      .sleep-moon {
        font-size: 4rem;
        margin-bottom: 16px;
        animation: pulse 3s infinite;
      }
      .breathing-circle {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: rgba(124, 92, 252, 0.15);
        border: 2px solid #7c5cfc;
        margin: 30px auto;
        animation: breatheAnim 19s infinite ease-in-out;
      }
      @keyframes breatheAnim {
        0% { transform: scale(0.8); opacity: 0.5; }
        21% { transform: scale(1.3); opacity: 1; }
        58% { transform: scale(1.3); opacity: 0.9; }
        100% { transform: scale(0.8); opacity: 0.5; }
      }
      .breathe-sub {
        font-size: 0.8rem;
        color: #9494a8;
        margin-bottom: 24px;
      }
      .btn-exit-blackout {
        background: transparent;
        border: 1px solid #2a2a3a;
        color: #8888a4;
        padding: 8px 18px;
        border-radius: 9999px;
        font-size: 0.75rem;
        cursor: pointer;
      }

      /* Emergency Reality Check Modal */
      .emergency-modal {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(6, 6, 10, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 10001;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 0.2s ease;
      }
      .emergency-modal.show { display: flex; }
      .emergency-modal-dialog {
        width: 100%;
        max-width: 520px;
        background: #13131d;
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 18px;
        padding: 22px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85);
      }
      .emergency-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .emergency-icon-tag {
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #f87171;
      }
      .emergency-modal-close {
        background: transparent;
        border: none;
        color: #8888a4;
        font-size: 1.4rem;
        cursor: pointer;
        line-height: 1;
      }
      .category-tabs {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 14px;
        -webkit-overflow-scrolling: touch;
      }
      .category-tabs::-webkit-scrollbar { display: none; }
      .tab-btn {
        padding: 6px 12px;
        border-radius: 9999px;
        border: 1px solid #232336;
        background: #181824;
        color: #9494a8;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }
      .tab-btn.active {
        background: rgba(239, 68, 68, 0.15);
        border-color: #ef4444;
        color: #fca5a5;
      }
      .emergency-quote-card {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid #232336;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 14px;
      }
      .quote-category-title {
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #a78bfa;
        margin-bottom: 8px;
      }
      .quote-text-large {
        font-size: 1.02rem;
        font-weight: 600;
        line-height: 1.55;
        color: #fff;
        font-style: italic;
        margin-bottom: 10px;
      }
      .quote-author-tag {
        font-size: 0.75rem;
        font-weight: 700;
        color: #9494a8;
        text-align: right;
      }
      .quote-context-highlight {
        margin-top: 10px;
        font-size: 0.75rem;
        color: #d1d5db;
        background: rgba(255, 255, 255, 0.04);
        padding: 8px 10px;
        border-radius: 6px;
      }
      .reset-protocol-box {
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 16px;
      }
      .protocol-header {
        font-size: 0.75rem;
        font-weight: 800;
        color: #10b981;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }
      .protocol-list {
        list-style: none;
        font-size: 0.74rem;
        color: #9494a8;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .protocol-list strong { color: #f3f4f8; }
      .emergency-modal-footer {
        display: flex;
        gap: 10px;
      }
      .btn-refresh-quote {
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        background: #181824;
        border: 1px solid #232336;
        color: #f3f4f8;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-im-locked-in {
        flex: 1.5;
        padding: 10px;
        border-radius: 8px;
        background: #7c5cfc;
        border: none;
        color: #fff;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 0 14px rgba(124, 92, 252, 0.3);
      }
    `;
    document.head.appendChild(style);
  }
};

// Auto-inject styles when loaded in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SleepMotivationUI.injectStyles());
  } else {
    SleepMotivationUI.injectStyles();
  }
}

// ==========================================
// 7. EXPORT TO GLOBAL SCOPE FOR BROWSER / PWA
// ==========================================
window.SLEEP_CONFIG = SLEEP_CONFIG;
window.MOTIVATION_DATABASE = MOTIVATION_DATABASE;
window.parseTimeToMinutes = parseTimeToMinutes;
window.minutesToTimeString = minutesToTimeString;
window.calculateHoursSlept = calculateHoursSlept;
window.isBedtimeOnTarget = isBedtimeOnTarget;
window.isWakeTimeOnTarget = isWakeTimeOnTarget;
window.isSleepTargetMet = isSleepTargetMet;
window.calculateSleepDeficit = calculateSleepDeficit;
window.calculateSleepConsistency = calculateSleepConsistency;
window.calculateSleepStreaks = calculateSleepStreaks;
window.isLateNightLockdownTime = isLateNightLockdownTime;
window.getLateNightTimeMetrics = getLateNightTimeMetrics;
window.getRandomMotivation = getRandomMotivation;
window.SensoryFeedback = SensoryFeedback;
window.SleepMotivationUI = SleepMotivationUI;

