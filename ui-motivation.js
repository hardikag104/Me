/**
 * EMOTIONAL MOTIVATION & REALITY CHECK SYSTEM — LIFE TRACKER PWA
 * Agent 8: Emotional Motivation & Reality Check Lead
 * 
 * Capabilities:
 * 1. Motivation Database: 60+ hard-hitting, unfiltered quotes across 4 pillars:
 *    - 👨‍👩‍👦 Parents & Sacrifice
 *    - ⚔️ Career & Ruthless Competition
 *    - ⏳ Future Self & Regret Prevention
 *    - 🏛️ BITSian Toughness & Excellence
 * 2. UI Features:
 *    - Header Daily Wisdom pill / ticker with auto-rotation & click-to-awaken.
 *    - Emergency Reality Check modal ('🚨 Wake-Up Call') accessible from anywhere in the app.
 *    - Dynamic 5-minute dopamine reset protocol with interactive countdown timer.
 *    - Native Text-to-Speech audio reader and 1-click quote clipboard sharing.
 *    - Motivational Cards embedded inside both the Tasks tab and Sleep tab.
 *    - Global keyboard shortcuts ('w' or 'r' for instant reality check, 'Esc' to dismiss).
 *    - Full backwards compatibility with Agent 4 SleepMotivationUI.
 */

(function() {
  'use strict';

  // ==========================================================================
  // 1. HARD-HITTING MOTIVATION DATABASE (60+ UNFILTERED TRUTHS)
  // ==========================================================================
  const MOTIVATION_DATABASE = {
    parents: [
      {
        id: 'p1',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Sacrifice',
        quote: "Your parents didn't sacrifice everything for you to scroll at 2 AM. Honor the blood, sweat, and dignity they surrendered to give you a fighting chance.",
        author: "The Reality Check",
        context: "Every rupee, every meal, and every quiet prayer they gave came at the expense of their own comfort."
      },
      {
        id: 'p2',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Aging Parents',
        quote: "Look at your mother's hands and the lines on your father's forehead. They are getting older every single day. The window where they can see you succeed, travel the world, and rest peacefully is closing. Hurry up.",
        author: "The Ticking Clock",
        context: "Time waits for no one, least of all aging parents who carried you on their shoulders."
      },
      {
        id: 'p3',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Unspoken Faith',
        quote: "Somewhere right now, your parents are proudly telling a relative that their child is working hard to build a great life. Are you making them proud, or are you making them a liar?",
        author: "Unspoken Belief",
        context: "Their belief in you is pure and unconditional. Never exploit it with cheap laziness."
      },
      {
        id: 'p4',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Debt of Honor',
        quote: "Every luxury you enjoy today was paid for by a sacrifice they never spoke about: medical visits postponed, worn-out shoes worn another year, holidays skipped. Repay that debt with mastery.",
        author: "Debt of Honor",
        context: "Your relentless work ethic is the only currency that repays their silent sacrifices."
      },
      {
        id: 'p5',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Quiet Providers',
        quote: "Your father never took a 'mental health day' when the rent was due. He didn't wait for 'motivation' when you needed food and school fees. He got up and did the job. Show up for him.",
        author: "The Provider Standard",
        context: "Consistency is love made visible through discipline. Act like the child of a warrior."
      },
      {
        id: 'p6',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Lineage Standard',
        quote: "You have air conditioning, high-speed Wi-Fi, and access to all the knowledge in human history. Your parents started with nothing and built your foundation. Softness is an insult to your lineage.",
        author: "Privilege & Responsibility",
        context: "You stand on the shoulders of giants. Stop acting like you have an excuse to be weak."
      },
      {
        id: 'p7',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Mother\'s Tears',
        quote: "Your mother prayed for your success before you even knew how to write code or take an exam. Don't let her prayers be answered by someone who had zero work ethic.",
        author: "Sacred Duty",
        context: "Do not let tears of hope and motherly pride dissolve into quiet disappointment."
      },
      {
        id: 'p8',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Peace of Mind',
        quote: "The greatest gift you will ever give your parents is the peace of mind that their child is independent, formidable, and unbreakable. That gift is forged by sleeping at 11 PM and waking at 6:30 AM.",
        author: "Ultimate Gratitude",
        context: "Iron discipline today buys their tranquil retirement tomorrow."
      },
      {
        id: 'p9',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'The Breakthrough',
        quote: "When you feel like slacking off or sleeping in, picture your parents' tired smiles when you hand them your first major breakthrough. Let that image drag you out of bed.",
        author: "The Finish Line",
        context: "The tears of joy on their faces will make every cold shower and early morning worth it."
      },
      {
        id: 'p10',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Family Name',
        quote: "They didn't give you everything they had so you could settle for 'average'. You owe it to your family name to be extraordinary.",
        author: "Family Standard",
        context: "Average effort produces mediocre lives. You were not raised to be a bystander."
      },
      {
        id: 'p11',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'True Respect',
        quote: "Respect isn't what you say to your parents on special occasions. Respect is what you do when you are alone in your room with your laptop, phone, and time.",
        author: "Integrity",
        context: "Your private habits reveal whether you truly revere their sacrifices."
      },
      {
        id: 'p12',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Action Over Talk',
        quote: "Stop dreaming about buying them houses and cars while staying up until 3 AM scrolling meaningless feeds. Action precedes the reward.",
        author: "Action Over Talk",
        context: "Grand promises without brutal daily execution are simply childish delusions."
      },
      {
        id: 'p13',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Youth for Future',
        quote: "Your parents traded their prime youth so you could have a shot at greatness. Every wasted hour is a fraction of their sacrifice discarded into the trash.",
        author: "The Exchange Rate",
        context: "Respect the currency of time that was spent to put you in this chair."
      },
      {
        id: 'p14',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Unspoken Weight',
        quote: "When was the last time your father complained about being exhausted? Never. He carried the weight in silence. The least you can do is endure the mild discomfort of focused work.",
        author: "Silent Pillars",
        context: "Endure your minor discomforts with the same grace and fortitude they showed for decades."
      },
      {
        id: 'p15',
        category: 'Parents & Sacrifice',
        categoryKey: 'parents',
        tag: 'Generational Turn',
        quote: "Do not let your parents pass away with their greatest achievement being that they gave everything to a child who gave up on himself. Take the torch and run.",
        author: "The Torchbearer",
        context: "You are the culmination of generations of survival and hope. Deliver the victory."
      }
    ],

    career: [
      {
        id: 'c1',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'The Hunger Rule',
        quote: "Every hour you waste, someone hungrier is taking your future. While you debate going to bed or starting work, a competitor in a cramped hostel room is solving their 500th problem.",
        author: "The Hunger Rule",
        context: "The market is ruthless. It awards the crown only to the prepared and obsessed."
      },
      {
        id: 'c2',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Placements & Day 1',
        quote: "Placement season does not reward who wanted it most or who had potential. It rewards the student who logged 500 hours of deep work between 6 AM and 11 PM while others partied.",
        author: "The Placement Truth",
        context: "Day 1 offers and life-changing roles are won in silent mornings months in advance."
      },
      {
        id: 'c3',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'The Meritocracy',
        quote: "The tech industry does not care about your excuses, your bad days, or your good intentions. It only cares about competence. You are either indispensable or completely replaceable.",
        author: "Market Reality",
        context: "Skill and speed are the only real leverage in the modern economy. Everything else is noise."
      },
      {
        id: 'c4',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: '1% Mathematics',
        quote: "You claim you want top 1% income, top 1% prestige, and complete creative freedom. But your sleep, habits, and focus look like the bottom 50%. You cannot live like the average and expect the exceptional.",
        author: "1% Mathematics",
        context: "The price of top-tier success must be paid in full, upfront, in advance."
      },
      {
        id: 'c5',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Unfair Advantage',
        quote: "Discipline is the ultimate unfair advantage. It cannot be bought, inherited, or faked. When you own your morning and sleep before 11 PM, you destroy 95% of your competition before lunch.",
        author: "Asymmetry of Grit",
        context: "Most people destroy themselves through late-night brain fog. Out-discipline them."
      },
      {
        id: 'c6',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Zero Sum Game',
        quote: "Every single time you choose comfort, dopamine, and procrastination over hard work, your rival smiles. You just handed them your interview, your salary, and your seat.",
        author: "Zero Sum Reality",
        context: "There are only so many elite seats at the table. Are you giving yours away?"
      },
      {
        id: 'c7',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'The Craft',
        quote: "Excellence is not an accident; it is the accumulation of unglamorous, repetitive, solitary discipline when nobody is watching, clapping, or cheering.",
        author: "The Craft",
        context: "Public triumphs are purchased with private sweat and silent hours."
      },
      {
        id: 'c8',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Proof vs Dreams',
        quote: "The market will never pay you for your potential. It will only pay you for your proof. Stop daydreaming about unicorns and build the portfolio.",
        author: "Show The Code",
        context: "Execution beats visionary talk every single day of the week."
      },
      {
        id: 'c9',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Cognitive Weapon',
        quote: "Staying awake past 11 PM doesn't make you a hustler; it turns you into a sluggish, brain-fogged amateur who codes at 30% speed tomorrow. Sleep like a pro athlete so you can dominate like one.",
        author: "High-Performance Protocol",
        context: "Sleep is biological performance-enhancing technology. Protect your mental edge."
      },
      {
        id: 'c10',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'The AI Crucible',
        quote: "In five years, AI and global talent will eliminate every mediocre engineer. If you don't master deep focus and high-order thinking today, you won't even be in the arena tomorrow.",
        author: "The AI Crucible",
        context: "Discipline is your survival armor in a hyper-competitive, automated century."
      },
      {
        id: 'c11',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Professional Standard',
        quote: "Amateurs wait for inspiration. Titans put their phones in another room, sit down at their desks at 7:00 AM, and execute until the mission is finished.",
        author: "Professional Standard",
        context: "Treat your craft as a sacred duty, not a casual hobby dependent on your mood."
      },
      {
        id: 'c12',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Opportunity Cost',
        quote: "While you are wasting 3 hours on social media arguments, your future coworker is deploying microservices and mastering system design. Close the gap now.",
        author: "Opportunity Cost",
        context: "Every wasted hour widens the gap between where you are and where you need to be."
      },
      {
        id: 'c13',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Binary Choice',
        quote: "There are two kinds of people: those who make excuses, and those who make results. You cannot be both. Choose which one you are right now.",
        author: "Binary Standard",
        context: "Excuses don't build software, pay bills, or earn respect. Results do."
      },
      {
        id: 'c14',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Lethal Execution',
        quote: "No company hires you to make you feel comfortable. They hire you to solve problems that are on fire. Train yourself to be the engineer who never flinches.",
        author: "The Mercenary Mindset",
        context: "Become so competent that the thought of competing against you terrifies your rivals."
      },
      {
        id: 'c15',
        category: 'Career & Ruthless Competition',
        categoryKey: 'career',
        tag: 'Pure Grit',
        quote: "The world is full of educated derelicts who had potential but lacked grit. Grit is doing what you hate to do, but doing it with the intensity of someone who loves it.",
        author: "Iron Will",
        context: "Talent without relentless grit is just a tragic story waiting to be told."
      }
    ],

    regret: [
      {
        id: 'r1',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'The Two Pains',
        quote: "The pain of discipline weighs ounces, the pain of regret weighs tons. You must choose which burden you will carry for the rest of your life.",
        author: "Jim Rohn / Eternal Truth",
        context: "Discipline is temporary discomfort. Regret is permanent, agonizing baggage."
      },
      {
        id: 'r2',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'The Mirror Test',
        quote: "Imagine meeting the person you could have become at the end of your life. They had your brain, your college, your advantages—but they kept their promises, slept on time, and did the work. Will that meeting be your greatest pride or your deepest hell?",
        author: "The Mirror Test",
        context: "Don't let your unfulfilled potential haunt your conscience for the next fifty years."
      },
      {
        id: 'r3',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Cheap Dopamine',
        quote: "In five years, you won't remember a single YouTube short, reel, or meme you stayed up late to watch. But you will carry the permanent scar of the opportunities you threw away.",
        author: "Vanishing Dopamine",
        context: "Stop trading lifelong greatness for 15 seconds of synthetic dopamine."
      },
      {
        id: 'r4',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Bitter Poison',
        quote: "Regret is the most bitter poison known to the human soul. It whispers when you're 30: 'You had the mind. You had the chance. You just lacked the backbone to get out of bed.'",
        author: "The Mid-Career Awakening",
        context: "Fix your discipline now while your youth, health, and energy are still on your side."
      },
      {
        id: 'r5',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Tomorrow Lie',
        quote: "The easiest person to lie to is yourself. You tell yourself 'I'll start tomorrow' every night before falling into a dopamine coma. How many tomorrows do you think you have left?",
        author: "The Tomorrow Fallacy",
        context: "Tomorrow is the graveyard where great lives and noble dreams go to rot."
      },
      {
        id: 'r6',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Self-Respect',
        quote: "Every broken promise to yourself chips away at your self-esteem. When you say 'I'll sleep at 11' and stay up till 2, you tell your subconscious that your word is worthless. Rebuild your honor tonight.",
        author: "Integrity",
        context: "Confidence isn't bravado; it is simply keeping promises you make to yourself."
      },
      {
        id: 'r7',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'The Crossroads',
        quote: "Ten years from now, you will look back on this exact season of your life as the pivot: the moment you either woke up and seized control, or let yourself slide into lifelong mediocrity.",
        author: "The Crossroads",
        context: "History is made at crossroads like right now. Choose strength."
      },
      {
        id: 'r8',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Memento Mori',
        quote: "Time does not pause while you feel unmotivated. The days burn away like dry timber. You cannot buy back your 20s with all the money in the world.",
        author: "Memento Mori",
        context: "Treasure your prime years by demanding uncompromised excellence of yourself."
      },
      {
        id: 'r9',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Choose Your Hard',
        quote: "Suffer the harsh sound of the 6:30 AM alarm clock now, or suffer the heartbreak of watching less capable people live the dream you were too lazy to build.",
        author: "Choose Your Hard",
        context: "Waking up early is hard. Wasted potential is 1,000x harder and lasts forever."
      },
      {
        id: 'r10',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Disgust Trigger',
        quote: "When you feel like quitting, ask yourself: 'If I quit now, what will I be doing five years from now?' If the answer disgusts you, get back to work.",
        author: "The Disgust Trigger",
        context: "Use positive disgust toward mediocrity to exterminate procrastination."
      },
      {
        id: 'r11',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Future Bloodline',
        quote: "One day your future child will ask you why you didn't reach the heights you dreamed of. What will you say? 'I liked staying up late on my smartphone'? Let that shame wake you up.",
        author: "Generational Accountability",
        context: "Set the standard your descendants will be fiercely proud to follow."
      },
      {
        id: 'r12',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Total Ownership',
        quote: "Nobody is coming to save you. No mentor, no miracle, no lucky lottery. It is you against your own laziness. Win the battle tonight.",
        author: "Total Ownership",
        context: "You are the sole author of your own redemption. Start writing it."
      },
      {
        id: 'r13',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Arrogance of Procrastination',
        quote: "Procrastination is arrogance. It is acting as if you have infinite time, infinite health, and infinite second chances. You have none of those.",
        author: "The Fragile Reality",
        context: "Treat every sunrise as a borrowed gift that must be repaid with focused labor."
      },
      {
        id: 'r14',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Quiet Decay',
        quote: "You don't ruin your life in one catastrophic explosion. You ruin it one delayed task, one late bedtime, and one skipped gym session at a time. Guard the small habits.",
        author: "The Compound Decay",
        context: "Discipline compounds into mastery; neglect compounds into ruin."
      },
      {
        id: 'r15',
        category: 'Future Self & Regret Prevention',
        categoryKey: 'regret',
        tag: 'Future Self Plea',
        quote: "Your future self is begging you right now: stop sabotaging our destiny for 10 minutes of cheap, meaningless comfort.",
        author: "A Plea from Tomorrow",
        context: "Be a good ancestor to your future self. Make decisions they will thank you for."
      }
    ],

    bitsian: [
      {
        id: 'b1',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Zero Percent Attendance',
        quote: "0% attendance is a test of character, not a license to slack. It is BITS' greatest test of character: can you govern yourself with iron discipline when no professor is taking roll call?",
        author: "The BITSian Ethos",
        context: "True freedom requires supreme self-governance. If you can't govern yourself, freedom destroys you."
      },
      {
        id: 'b2',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Desert Crucible',
        quote: "BITS Pilani was forged in the desert by titans who built unicorns, scaled global institutions, and wrote legendary software. You earned a seat among the elite. Act like you belong in this lineage.",
        author: "Desert Crucible",
        context: "The BITS brand was built on grit and audacious builders. Don't dilute it with laziness."
      },
      {
        id: 'b3',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Freedom vs Anarchy',
        quote: "BITS gave you absolute freedom. Fools use it to destroy their sleep, ruin their CGPA, and binge distractions. Masters use it to build companies, master algorithms, and become lethal.",
        author: "The Two Paths",
        context: "How you use your autonomy defines your entire adult trajectory."
      },
      {
        id: 'b4',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'The Grading Curve',
        quote: "The grading curve does not care about your wing gossip or how late you chilled at ANC. When compres arrive, only your stamina, clarity of mind, and disciplined preparation will stand between you and an 8+ CGPA.",
        author: "The Curve Truth",
        context: "Protect your CGPA like your career depends on it—because it does."
      },
      {
        id: 'b5',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'The BITSAT Fire',
        quote: "Remember why you fought through the BITSAT gauntlet to get here. You beat 150,000 people to sit in this campus. Don't let that hunger die because you're comfortable in your hostel room.",
        author: "The BITSAT Fire",
        context: "Rekindle the relentless fire that conquered one of the toughest exams in the country."
      },
      {
        id: 'b6',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Wing Culture vs Mission',
        quote: "Your wingmates might stay up gaming or bantering until 4 AM. Let them. You are on a different mission. Sleep at 11:00 PM, rise at 6:30 AM, and let your results do the talking.",
        author: "The Lone Wolf Standard",
        context: "Eagles do not flock with pigeons. Lead by silent, devastating example."
      },
      {
        id: 'b7',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'The BITSian Code',
        quote: "Mental toughness is doing what must be done, when it must be done, whether you feel like it or not. That is the true BITSian code.",
        author: "The Code",
        context: "Feelings are fickle and deceptive. Standards and systems are permanent."
      },
      {
        id: 'b8',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Unicorn Legacy',
        quote: "From Swiggy to Postman, BITSians didn't build billion-dollar legacies by sleeping through morning opportunities. They dominated because when challenges struck, they doubled down.",
        author: "Founder Mindset",
        context: "You have founder blood in your alma mater. Live up to the high standard."
      },
      {
        id: 'b9',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'ANC Reality Check',
        quote: "Eating Maggi at ANC at 2:30 AM while doing nothing productive is not 'college culture'—it's slow suicide of your potential. Go to bed. Your future self needs you sharp.",
        author: "Hard Truth",
        context: "Romanticizing destructive sleep habits is for amateurs. Pros sleep to conquer."
      },
      {
        id: 'b10',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Morning Clarity',
        quote: "When you walk past the Clock Tower and Rotunda at 6:30 AM in the crisp morning air, you feel what ordinary students never taste: absolute ownership of your day.",
        author: "Morning Clarity",
        context: "Early mornings in Pilani, Goa, and Hyderabad belong strictly to the champions."
      },
      {
        id: 'b11',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Intellectual Vitality',
        quote: "You didn't come to BITS to be average. You came to test the outer limits of your intellect. Set your bedtime to 11 PM and give your brain the recovery it deserves.",
        author: "Intellectual Vitality",
        context: "Your brain is your primary capital asset. Sharpen it every single night."
      },
      {
        id: 'b12',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'The High Standard',
        quote: "The world expects BITSians to lead, to innovate, and to triumph. Leadership starts with leading yourself to bed at 11 PM. Execute without excuses.",
        author: "The High Standard",
        context: "If you cannot command yourself, you can never command an organization or an army."
      },
      {
        id: 'b13',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Compre Domination',
        quote: "Compres will mercilessly expose every shortcut you took in the semester. Study now so you walk into the exam hall like a king, not a desperate gambler.",
        author: "The Exam Gauntlet",
        context: "Confidence in the examination hall is merely thorough preparation remembered."
      },
      {
        id: 'b14',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'Execution Engine',
        quote: "Hostel corridors have echoed a million grand startup ideas that died because the founder couldn't wake up before noon. Execution is the only differentiator.",
        author: "Execution Is Everything",
        context: "Ideas are cheap commodities. Ruthless daily execution is the rarest currency on campus."
      },
      {
        id: 'b15',
        category: 'BITSian Toughness & Excellence',
        categoryKey: 'bitsian',
        tag: 'The Heritage',
        quote: "You carry the prestigious badge of one of India's finest technical universities. Carry it with honor, back it up with monstrous technical skill, and never settle for mediocrity.",
        author: "The BITS Heritage",
        context: "Excellence is an obligation, not an option, for those blessed to be here."
      }
    ]
  };

  // Flattened array of all 60 quotes for random queries
  const ALL_QUOTES = [
    ...MOTIVATION_DATABASE.parents,
    ...MOTIVATION_DATABASE.career,
    ...MOTIVATION_DATABASE.regret,
    ...MOTIVATION_DATABASE.bitsian
  ];

  // ==========================================================================
  // 2. MOTIVATION ENGINE: SELECTION, DAILY WISDOM & SPEECH SYNTHESIS
  // ==========================================================================
  const MotivationEngine = {
    database: MOTIVATION_DATABASE,
    allQuotes: ALL_QUOTES,

    /**
     * Returns a random quote for a category ('all', 'parents', 'career', 'regret', 'bitsian')
     */
    getRandomQuote(category = 'all') {
      if (category === 'all' || !MOTIVATION_DATABASE[category]) {
        return ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
      }
      const pool = MOTIVATION_DATABASE[category];
      return pool[Math.floor(Math.random() * pool.length)];
    },

    /**
     * Deterministic daily quote of the day based on day of the year
     */
    getDailyQuote() {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      return ALL_QUOTES[dayOfYear % ALL_QUOTES.length];
    },

    /**
     * Returns quotes for a specific category
     */
    getByCategory(category) {
      if (!category || category === 'all') return ALL_QUOTES;
      return MOTIVATION_DATABASE[category] || ALL_QUOTES;
    },

    /**
     * Native Text-to-Speech audio reader
     */
    speakQuote(text, author) {
      if (!('speechSynthesis' in window)) return false;
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const speechText = `${text} ... Reality check by ${author || 'Life OS'}.`;
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.95; // Slightly deliberate pace
        utterance.pitch = 0.9; // Deeper commanding tone
        
        // Pick an English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google')));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
        return true;
      } catch (e) {
        console.warn('Speech synthesis failed:', e);
        return false;
      }
    }
  };

  // ==========================================================================
  // 3. MOTIVATION UI CONTROLLER & MODAL PROTOCOL
  // ==========================================================================
  const MotivationUI = {
    emergencyModalId: 'emergencyRealityCheckModal',
    activeCategory: 'all',
    currentQuote: null,
    timerInterval: null,
    timerRemainingSeconds: 300, // 5 minutes
    timerRunning: false,
    dailyQuoteTickerIndex: 0,

    init() {
      this.injectStyles();
      this.renderHeaderTicker();
      this.renderTasksCard();
      this.renderSleepCard();
      this.attachGlobalEvents();

      // Synchronize with existing buttons in the DOM
      this.bindExistingTriggers();

      // Ensure Daily Wisdom cycles smoothly
      this.setupDailyTickerInterval();
    },

    /**
     * Binds existing reality buttons across index.html
     */
    bindExistingTriggers() {
      // Header button (#btnTriggerReality)
      const btnHeaderReality = document.getElementById('btnTriggerReality');
      if (btnHeaderReality) {
        btnHeaderReality.onclick = (e) => {
          e.preventDefault();
          this.openEmergencyMotivation('all');
        };
      }
    },

    /**
     * Attaches global keyboard shortcuts ('w' or 'r' for Wake-up Call, 'Esc' to dismiss)
     */
    attachGlobalEvents() {
      document.addEventListener('keydown', (e) => {
        // Ignore typing in input/textarea/editable
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
          return;
        }

        if (e.key === 'Escape') {
          this.closeEmergencyMotivation();
        } else if ((e.key === 'r' || e.key === 'R' || e.key === 'w' || e.key === 'W') && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.openEmergencyMotivation('all');
        }
      });
    },

    /**
     * Renders or updates the Header Daily Wisdom Pill / Ticker
     */
    renderHeaderTicker() {
      let ticker = document.getElementById('dailyWisdomTicker');
      const dailyQuote = this.currentTickerQuote || MotivationEngine.getDailyQuote();
      this.currentTickerQuote = dailyQuote;

      if (!ticker) {
        // Look for the top-status-bar to mount the wisdom strip directly below it
        const header = document.querySelector('.top-status-bar');
        if (!header) return;

        ticker = document.createElement('div');
        ticker.id = 'dailyWisdomTicker';
        ticker.className = 'header-wisdom-strip';
        ticker.setAttribute('role', 'button');
        ticker.setAttribute('tabindex', '0');
        ticker.setAttribute('title', 'Click for Instant Reality Check / Wake-Up Call (Shortcut: R)');

        header.parentNode.insertBefore(ticker, header.nextSibling);
      }

      // Compact category icon
      let categoryIcon = '🔥';
      if (dailyQuote.categoryKey === 'parents') categoryIcon = '👨‍👩‍👦';
      else if (dailyQuote.categoryKey === 'career') categoryIcon = '⚔️';
      else if (dailyQuote.categoryKey === 'regret') categoryIcon = '⏳';
      else if (dailyQuote.categoryKey === 'bitsian') categoryIcon = '🏛️';

      ticker.innerHTML = `
        <div class="wisdom-badge">
          <span class="wisdom-fire">${categoryIcon}</span>
          <span class="wisdom-title">DAILY WISDOM</span>
        </div>
        <div class="wisdom-track">
          <span class="wisdom-quote">"${this.escapeHtml(dailyQuote.quote)}"</span>
        </div>
        <button class="wisdom-wake-pill" title="Trigger Instant Wake-Up Call">
          <span class="alarm-pulse">🚨</span> Wake-Up
        </button>
      `;

      ticker.onclick = (e) => {
        e.stopPropagation();
        this.openEmergencyMotivation(dailyQuote.categoryKey || 'all');
      };
    },

    /**
     * Rotates the ticker quote every 45 seconds for continuous ambient vigilance
     */
    setupDailyTickerInterval() {
      setInterval(() => {
        this.currentTickerQuote = MotivationEngine.getRandomQuote('all');
        this.renderHeaderTicker();
      }, 45000);
    },

    /**
     * Renders the Motivational Card inside Tasks tab (#tab-tasks)
     */
    renderTasksCard() {
      const tabTasks = document.getElementById('tab-tasks');
      if (!tabTasks) return;

      let cardContainer = document.getElementById('tasksMotivationCardContainer');
      if (!cardContainer) {
        cardContainer = document.createElement('div');
        cardContainer.id = 'tasksMotivationCardContainer';
        
        // Insert right below .discipline-overview-card if it exists, else at top
        const overview = tabTasks.querySelector('.discipline-overview-card');
        if (overview && overview.nextSibling) {
          tabTasks.insertBefore(cardContainer, overview.nextSibling);
        } else {
          tabTasks.prepend(cardContainer);
        }
      }

      // Prefer Career, Regret, or BITSian quotes for tasks
      const taskCategories = ['career', 'regret', 'bitsian'];
      const pickedCat = taskCategories[Math.floor(Math.random() * taskCategories.length)];
      const quote = MotivationEngine.getRandomQuote(pickedCat);

      cardContainer.innerHTML = `
        <div class="ui-card motivation-tab-card tasks-accent">
          <div class="card-head-row">
            <div class="motivation-tag-badge">
              <span class="icon">⚔️</span>
              <span>ANTI-PROCRASTINATION ARMOR · ${this.escapeHtml(quote.category.toUpperCase())}</span>
            </div>
            <button class="btn-card-refresh" onclick="window.MotivationUI.renderTasksCard()" title="New Reality Check">
              🔄
            </button>
          </div>
          <div class="quote-statement">"${this.escapeHtml(quote.quote)}"</div>
          <div class="quote-author-row">
            <span class="author-title">— ${this.escapeHtml(quote.author)}</span>
          </div>
          <div class="context-pill">
            <span class="spark">⚡</span> <strong>Reality Check:</strong> ${this.escapeHtml(quote.context)}
          </div>
          <div class="tab-card-actions">
            <button class="btn-launch-wakeup" onclick="window.MotivationUI.openEmergencyMotivation('${quote.categoryKey}')">
              🚨 Open Wake-Up Call
            </button>
            <button class="btn-copy-mini" onclick="window.MotivationUI.copyQuote('${this.escapeAttr(quote.quote)}')">
              📋 Copy Truth
            </button>
          </div>
        </div>
      `;
    },

    /**
     * Renders the Motivational Card inside Sleep tab (#tab-sleep)
     */
    renderSleepCard() {
      const tabSleep = document.getElementById('tab-sleep');
      if (!tabSleep) return;

      let cardContainer = document.getElementById('sleepMotivationCardContainer');
      if (!cardContainer) {
        cardContainer = document.createElement('div');
        cardContainer.id = 'sleepMotivationCardContainer';

        // Find existing quick reality check card in Sleep Tab and enhance or replace
        const oldCard = tabSleep.querySelector('.ui-card:has(.btn-reality-call)');
        if (oldCard) {
          oldCard.parentNode.replaceChild(cardContainer, oldCard);
        } else {
          tabSleep.appendChild(cardContainer);
        }
      }

      // Prefer Parents & Sacrifice or Future Regret for Sleep discipline
      const sleepCategories = ['parents', 'regret', 'bitsian'];
      const pickedCat = sleepCategories[Math.floor(Math.random() * sleepCategories.length)];
      const quote = MotivationEngine.getRandomQuote(pickedCat);

      cardContainer.innerHTML = `
        <div class="ui-card motivation-tab-card sleep-accent">
          <div class="card-head-row">
            <div class="motivation-tag-badge sleep">
              <span class="icon">🌙</span>
              <span>BEDTIME STANDARD · 11:00 PM CUTOFF</span>
            </div>
            <button class="btn-card-refresh" onclick="window.MotivationUI.renderSleepCard()" title="New Reality Check">
              🔄
            </button>
          </div>
          <div class="quote-statement">"${this.escapeHtml(quote.quote)}"</div>
          <div class="quote-author-row">
            <span class="author-title">— ${this.escapeHtml(quote.author)}</span>
          </div>
          <div class="context-pill sleep">
            <span class="spark">🎯</span> <strong>Tomorrow's Edge:</strong> ${this.escapeHtml(quote.context)}
          </div>
          <div class="tab-card-actions">
            <button class="btn-launch-wakeup full" onclick="window.MotivationUI.openEmergencyMotivation('parents')">
              🚨 Emergency Reality Check: Parents & Sacrifice
            </button>
          </div>
        </div>
      `;
    },

    /**
     * Opens the Emergency Reality Check modal ('🚨 Wake-Up Call')
     */
    openEmergencyMotivation(category = 'all') {
      this.activeCategory = category;
      this.currentQuote = MotivationEngine.getRandomQuote(category);

      let modal = document.getElementById(this.emergencyModalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = this.emergencyModalId;
        modal.className = 'emergency-reality-modal';
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) this.closeEmergencyMotivation();
        });
      }

      // Haptic sensory feedback
      this.triggerHaptic([60, 40, 60]);

      this.renderModalContent();
      modal.classList.add('show');
    },

    /**
     * Closes the Emergency Reality Check modal
     */
    closeEmergencyMotivation() {
      const modal = document.getElementById(this.emergencyModalId);
      if (modal) {
        modal.classList.remove('show');
      }
      this.stopResetTimer();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    },

    /**
     * Renders inner HTML of the Emergency Reality Check modal
     */
    renderModalContent() {
      const modal = document.getElementById(this.emergencyModalId);
      if (!modal || !this.currentQuote) return;

      const q = this.currentQuote;
      const cat = this.activeCategory;

      modal.innerHTML = `
        <div class="reality-modal-dialog">
          
          <!-- Modal Header -->
          <div class="reality-modal-header">
            <div class="reality-tag-pill">
              <span class="pulse-icon">🚨</span>
              <span>WAKE-UP CALL · REALITY CHECK</span>
            </div>
            <button class="reality-close-btn" onclick="window.MotivationUI.closeEmergencyMotivation()" aria-label="Close modal">
              ✕
            </button>
          </div>

          <!-- Category Switcher Tabs -->
          <div class="reality-category-nav" role="tablist">
            <button class="cat-pill-btn ${cat === 'all' ? 'active' : ''}" onclick="window.MotivationUI.switchCategory('all')">
              🎲 All
            </button>
            <button class="cat-pill-btn ${cat === 'parents' ? 'active' : ''}" onclick="window.MotivationUI.switchCategory('parents')">
              👨‍👩‍👦 Parents
            </button>
            <button class="cat-pill-btn ${cat === 'career' ? 'active' : ''}" onclick="window.MotivationUI.switchCategory('career')">
              ⚔️ Career
            </button>
            <button class="cat-pill-btn ${cat === 'regret' ? 'active' : ''}" onclick="window.MotivationUI.switchCategory('regret')">
              ⏳ Regret
            </button>
            <button class="cat-pill-btn ${cat === 'bitsian' ? 'active' : ''}" onclick="window.MotivationUI.switchCategory('bitsian')">
              🏛️ BITSian
            </button>
          </div>

          <!-- High-Voltage Quote Display -->
          <div class="reality-quote-surface">
            <div class="surface-category-indicator">${this.escapeHtml(q.category)}</div>
            <div class="surface-quote-body">"${this.escapeHtml(q.quote)}"</div>
            <div class="surface-quote-author">— ${this.escapeHtml(q.author)}</div>
            <div class="surface-context-box">
              <div class="context-label">⚡ THE HARD TRUTH</div>
              <div class="context-text">${this.escapeHtml(q.context)}</div>
            </div>
          </div>

          <!-- Control Actions Strip -->
          <div class="reality-control-strip">
            <button class="btn-reality-action" onclick="window.MotivationUI.nextQuote('${cat}')">
              🔄 Next Reality Check
            </button>
            <button class="btn-reality-action" onclick="window.MotivationUI.speakCurrentQuote()">
              🔊 Read Aloud
            </button>
            <button class="btn-reality-action" onclick="window.MotivationUI.copyQuote('${this.escapeAttr(q.quote)}')">
              📋 Copy Truth
            </button>
          </div>

          <!-- 5-Minute Dopamine Reset Protocol -->
          <div class="dopamine-reset-card">
            <div class="reset-card-header">
              <div class="protocol-badge">⚡ 5-MINUTE DOPAMINE RESET PROTOCOL</div>
              <div class="protocol-sub">Break the instant-gratification trance. Reclaim your focus right now.</div>
            </div>

            <div class="protocol-steps-grid">
              <div class="step-item">
                <div class="step-num">1</div>
                <div class="step-content">
                  <div class="step-title">Cold Shock</div>
                  <div class="step-desc">Splash face with ice water or chug 500ml cold water to trigger the mammalian dive reflex.</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-num">2</div>
                <div class="step-content">
                  <div class="step-title">Digital Cutoff</div>
                  <div class="step-desc">Close all reels, YouTube, and feeds. Put your phone face-down across the room.</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-num">3</div>
                <div class="step-content">
                  <div class="step-title">Biomechanical Spike</div>
                  <div class="step-desc">Drop and do 10 pushups or 20 jumping jacks to flood epinephrine and clear brain fog.</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-num">4</div>
                <div class="step-content">
                  <div class="step-title">Spartan Sprint</div>
                  <div class="step-desc">Pick 1 high-leverage objective and work for 25 uninterrupted minutes. Zero excuses.</div>
                </div>
              </div>
            </div>

            <!-- Interactive 5-Minute Timer -->
            <div class="reset-timer-dock">
              <div class="timer-display-box" id="resetTimerClock">05:00</div>
              <div class="timer-controls">
                <button class="btn-timer-trigger" id="btnToggleResetTimer" onclick="window.MotivationUI.toggleResetTimer()">
                  ${this.timerRunning ? '⏸️ Pause Reset' : '⏱️ Start 5-Min Reset Timer'}
                </button>
                <button class="btn-timer-reset" onclick="window.MotivationUI.resetTimerClock()" title="Reset to 5:00">
                  ↺
                </button>
              </div>
            </div>
          </div>

          <!-- Final Lock-In Commitment Button -->
          <div class="reality-modal-footer">
            <button class="btn-lock-in-hero" onclick="window.MotivationUI.confirmLockIn()">
              ⚔️ I AM LOCKED IN. LET'S WORK.
            </button>
          </div>

        </div>
      `;
    },

    /**
     * Switches category in the modal and loads a new quote
     */
    switchCategory(category) {
      this.activeCategory = category;
      this.currentQuote = MotivationEngine.getRandomQuote(category);
      this.renderModalContent();
    },

    /**
     * Cycles to the next quote in the current category
     */
    nextQuote(category) {
      this.currentQuote = MotivationEngine.getRandomQuote(category || this.activeCategory);
      this.renderModalContent();
    },

    /**
     * Speaks current quote using native SpeechSynthesis
     */
    speakCurrentQuote() {
      if (!this.currentQuote) return;
      const success = MotivationEngine.speakQuote(this.currentQuote.quote, this.currentQuote.author);
      if (success) {
        this.showToast('Playing reality check voice...', '🔊');
      } else {
        this.showToast('Speech audio not supported on this browser', '⚠️');
      }
    },

    /**
     * Copies text to clipboard and displays confirmation toast
     */
    copyQuote(text) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => this.showToast('Quote copied to clipboard!', '📋'))
          .catch(() => this.fallbackCopy(text));
      } else {
        this.fallbackCopy(text);
      }
    },

    fallbackCopy(text) {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        this.showToast('Quote copied to clipboard!', '📋');
      } catch (e) {
        this.showToast('Unable to copy quote', '❌');
      }
    },

    /**
     * 5-Minute Dopamine Reset Timer toggle (Start / Pause)
     */
    toggleResetTimer() {
      if (this.timerRunning) {
        this.stopResetTimer();
      } else {
        this.startResetTimer();
      }
      this.renderTimerDisplay();
    },

    startResetTimer() {
      this.timerRunning = true;
      if (this.timerRemainingSeconds <= 0) {
        this.timerRemainingSeconds = 300;
      }
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.timerRemainingSeconds > 0) {
          this.timerRemainingSeconds--;
          this.renderTimerDisplay();
        } else {
          this.finishResetTimer();
        }
      }, 1000);
      this.renderTimerDisplay();
    },

    stopResetTimer() {
      this.timerRunning = false;
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.renderTimerDisplay();
    },

    resetTimerClock() {
      this.stopResetTimer();
      this.timerRemainingSeconds = 300;
      this.renderTimerDisplay();
    },

    renderTimerDisplay() {
      const clock = document.getElementById('resetTimerClock');
      const btn = document.getElementById('btnToggleResetTimer');
      if (!clock) return;

      const mins = Math.floor(this.timerRemainingSeconds / 60);
      const secs = this.timerRemainingSeconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      clock.textContent = formatted;

      if (btn) {
        btn.innerHTML = this.timerRunning ? '⏸️ Pause Reset' : '⏱️ Start 5-Min Reset Timer';
      }
    },

    finishResetTimer() {
      this.stopResetTimer();
      this.triggerHaptic([100, 80, 100, 80, 150]);
      this.showToast('5-Minute Reset Complete! Lock in now.', '⚡');
    },

    /**
     * "I AM LOCKED IN. LET'S WORK." confirmation
     */
    confirmLockIn() {
      this.triggerHaptic([80, 50, 80]);
      this.closeEmergencyMotivation();
      this.showToast('Locked in! Destroy your tasks.', '⚔️');

      // Switch to tasks tab if user is not already there
      if (window.MeApp && typeof window.MeApp.switchTab === 'function') {
        window.MeApp.switchTab('tasks');
      } else {
        const tasksTabBtn = document.getElementById('nav-tasks');
        if (tasksTabBtn) tasksTabBtn.click();
      }
    },

    /**
     * Sensory haptic feedback safely wrapped
     */
    triggerHaptic(pattern) {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(pattern);
        } catch (_) {}
      }
    },

    /**
     * Displays application toast if available, or fallback
     */
    showToast(msg, icon = '✓') {
      if (window.MeApp && typeof window.MeApp.showToast === 'function') {
        window.MeApp.showToast(msg, icon);
      } else {
        const toast = document.getElementById('global-toast');
        if (toast) {
          const iconEl = document.getElementById('globalToastIcon');
          const msgEl = document.getElementById('globalToastMsg');
          if (iconEl) iconEl.textContent = icon;
          if (msgEl) msgEl.textContent = msg;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2400);
        }
      }
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    escapeAttr(str) {
      if (!str) return '';
      return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    /**
     * Injects CSS styles for header ticker, tabs cards, and emergency reality modal
     */
    injectStyles() {
      if (document.getElementById('ui-motivation-styles')) return;

      const style = document.createElement('style');
      style.id = 'ui-motivation-styles';
      style.textContent = `
        /* ======================================================================
           HEADER DAILY WISDOM TICKER / PILL
           ====================================================================== */
        .header-wisdom-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(18, 18, 26, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(124, 92, 252, 0.25);
          padding: 7px 16px;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          z-index: 40;
          user-select: none;
        }
        .header-wisdom-strip:hover {
          background: rgba(24, 24, 36, 0.98);
          border-bottom-color: rgba(124, 92, 252, 0.45);
        }
        .wisdom-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(124, 92, 252, 0.15);
          border: 1px solid rgba(124, 92, 252, 0.35);
          border-radius: 9999px;
          padding: 2px 8px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #c4b5fd;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .wisdom-fire {
          font-size: 0.8rem;
          animation: flamePulse 2s infinite ease-in-out;
        }
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        .wisdom-track {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.74rem;
          color: #d1d5db;
          font-style: italic;
          font-weight: 500;
        }
        .wisdom-wake-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(239, 68, 68, 0.16);
          border: 1px solid rgba(239, 68, 68, 0.45);
          color: #fca5a5;
          padding: 3px 9px;
          border-radius: 9999px;
          font-size: 0.68rem;
          font-weight: 800;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .wisdom-wake-pill:hover {
          background: #ef4444;
          color: #fff;
          transform: scale(1.03);
        }
        .alarm-pulse {
          animation: pulse 1.8s infinite;
        }

        /* ======================================================================
           MOTIVATION CARDS INSIDE TABS (TASKS & SLEEP)
           ====================================================================== */
        .motivation-tab-card {
          margin-bottom: 14px;
          background: linear-gradient(135deg, rgba(24, 24, 36, 0.95) 0%, rgba(14, 14, 22, 0.98) 100%);
          border-radius: 14px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .motivation-tab-card.tasks-accent {
          border: 1px solid rgba(239, 68, 68, 0.35);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.08);
        }
        .motivation-tab-card.sleep-accent {
          border: 1px solid rgba(124, 92, 252, 0.35);
          box-shadow: 0 4px 20px rgba(124, 92, 252, 0.08);
        }
        .motivation-tab-card:hover {
          transform: translateY(-1px);
        }
        .card-head-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .motivation-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #f87171;
          background: rgba(239, 68, 68, 0.12);
          padding: 3px 9px;
          border-radius: 9999px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .motivation-tag-badge.sleep {
          color: #c4b5fd;
          background: rgba(124, 92, 252, 0.15);
          border-color: rgba(124, 92, 252, 0.3);
        }
        .btn-card-refresh {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9494a8;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-card-refresh:hover {
          color: #fff;
          border-color: #fff;
          transform: rotate(180deg);
        }
        .quote-statement {
          font-size: 0.96rem;
          font-weight: 600;
          line-height: 1.55;
          color: #f3f4f8;
          font-style: italic;
          margin-bottom: 8px;
        }
        .quote-author-row {
          text-align: right;
          font-size: 0.74rem;
          font-weight: 700;
          color: #9494a8;
          margin-bottom: 10px;
        }
        .context-pill {
          background: rgba(255, 255, 255, 0.04);
          border-left: 3px solid #ef4444;
          padding: 8px 10px;
          border-radius: 0 6px 6px 0;
          font-size: 0.74rem;
          color: #cbd5e1;
          line-height: 1.45;
          margin-bottom: 12px;
        }
        .context-pill.sleep {
          border-left-color: #7c5cfc;
        }
        .context-pill .spark {
          color: #f59e0b;
        }
        .tab-card-actions {
          display: flex;
          gap: 8px;
        }
        .btn-launch-wakeup {
          flex: 1;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-launch-wakeup:hover {
          background: #ef4444;
          color: #fff;
        }
        .btn-launch-wakeup.full {
          width: 100%;
        }
        .btn-copy-mini {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid #282838;
          color: #9494a8;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-copy-mini:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        /* ======================================================================
           EMERGENCY REALITY CHECK MODAL ('🚨 WAKE-UP CALL')
           ====================================================================== */
        .emergency-reality-modal {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(6, 6, 11, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 10005;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
          animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .emergency-reality-modal.show {
          display: flex;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .reality-modal-dialog {
          width: 100%;
          max-width: 540px;
          background: #111119;
          border: 1px solid rgba(239, 68, 68, 0.45);
          border-radius: 20px;
          padding: 22px 20px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(239, 68, 68, 0.2);
          position: relative;
        }
        .reality-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .reality-tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.06em;
        }
        .pulse-icon {
          animation: pulse 1.5s infinite;
        }
        .reality-close-btn {
          background: transparent;
          border: none;
          color: #717188;
          font-size: 1.25rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .reality-close-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Category Nav */
        .reality-category-nav {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 14px;
          -webkit-overflow-scrolling: touch;
        }
        .reality-category-nav::-webkit-scrollbar { display: none; }
        .cat-pill-btn {
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
        .cat-pill-btn.active {
          background: rgba(239, 68, 68, 0.18);
          border-color: #ef4444;
          color: #fca5a5;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.25);
        }

        /* Quote Surface */
        .reality-quote-surface {
          background: rgba(0, 0, 0, 0.45);
          border: 1px solid #28283d;
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 14px;
        }
        .surface-category-indicator {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #a78bfa;
          margin-bottom: 8px;
        }
        .surface-quote-body {
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.6;
          color: #fff;
          font-style: italic;
          margin-bottom: 10px;
        }
        .surface-quote-author {
          font-size: 0.76rem;
          font-weight: 700;
          color: #9494a8;
          text-align: right;
          margin-bottom: 12px;
        }
        .surface-context-box {
          background: rgba(255, 255, 255, 0.04);
          border-left: 3px solid #ef4444;
          border-radius: 0 8px 8px 0;
          padding: 10px 12px;
        }
        .context-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #fca5a5;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .context-text {
          font-size: 0.76rem;
          color: #d1d5db;
          line-height: 1.45;
        }

        /* Action Control Strip */
        .reality-control-strip {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .btn-reality-action {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          background: #181824;
          border: 1px solid #28283c;
          color: #f3f4f8;
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .btn-reality-action:hover {
          background: #222232;
          border-color: #3b3b55;
          transform: translateY(-1px);
        }

        /* 5-Minute Dopamine Reset Protocol */
        .dopamine-reset-card {
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.28);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }
        .reset-card-header {
          margin-bottom: 10px;
        }
        .protocol-badge {
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #10b981;
          margin-bottom: 2px;
        }
        .protocol-sub {
          font-size: 0.68rem;
          color: #9494a8;
        }
        .protocol-steps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) {
          .protocol-steps-grid {
            grid-template-columns: 1fr;
          }
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 8px 10px;
        }
        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          color: #09090d;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .step-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #f3f4f8;
          margin-bottom: 2px;
        }
        .step-desc {
          font-size: 0.66rem;
          color: #9494a8;
          line-height: 1.35;
        }

        /* Timer Dock */
        .reset-timer-dock {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .timer-display-box {
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 1.2rem;
          font-weight: 800;
          color: #10b981;
          letter-spacing: 0.05em;
        }
        .timer-controls {
          display: flex;
          gap: 6px;
        }
        .btn-timer-trigger {
          background: #10b981;
          border: none;
          color: #09090d;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-timer-trigger:hover {
          background: #34d399;
          transform: translateY(-1px);
        }
        .btn-timer-reset {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #9494a8;
          width: 30px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .btn-timer-reset:hover {
          color: #fff;
          border-color: #fff;
        }

        /* Lock In Hero */
        .reality-modal-footer {
          margin-top: 4px;
        }
        .btn-lock-in-hero {
          width: 100%;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border: none;
          color: #fff;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
          transition: all 0.2s ease;
        }
        .btn-lock-in-hero:hover {
          background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }
  };

  // ==========================================================================
  // 4. EXPORT & COMPLETE BACKWARDS COMPATIBILITY
  // ==========================================================================
  window.MotivationEngine = MotivationEngine;
  window.MotivationUI = MotivationUI;
  window.MOTIVATION_DATABASE = MOTIVATION_DATABASE;

  // Intercept and enrich Agent 4 SleepMotivationUI for backwards compatibility
  if (!window.SleepMotivationUI) {
    window.SleepMotivationUI = {};
  }
  window.SleepMotivationUI.openEmergencyMotivation = function(category = 'all') {
    MotivationUI.openEmergencyMotivation(category);
  };
  window.SleepMotivationUI.closeEmergencyMotivation = function() {
    MotivationUI.closeEmergencyMotivation();
  };

  // Global helper for inline HTML triggers
  window.MeRealityCheck = {
    open(category = 'all') {
      MotivationUI.openEmergencyMotivation(category);
    },
    resetToday() {
      MotivationUI.renderTasksCard();
      MotivationUI.renderSleepCard();
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MotivationUI.init());
  } else {
    MotivationUI.init();
  }

})();
