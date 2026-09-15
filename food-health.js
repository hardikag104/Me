/**
 * ===============================================================================
 * ME PWA — FOOD & HEALTH INTELLIGENCE ENGINE (AGENT 3 LEAD SPECIFICATION)
 * ===============================================================================
 * 
 * Features:
 *  1. Meal Logger (Breakfast, Lunch, Evening Snacks, Dinner)
 *  2. Smart Food Quality Analyzer (Lexicon matching, tokenization, junk vs clean classification)
 *  3. Instant Health Feedback Generator (Contextual, honest, biohacking-inspired advice)
 *  4. Daily Health Score Engine (0 - 100% weighted multi-factor algorithm)
 *  5. Hydration Tracker (Quick-tap glass counter, 8 glasses / 3L target, hydration velocity)
 *  6. Full UI Component & CSS styling matching the 'Me' PWA theme
 */

// ===============================================================================
// 1. COMPREHENSIVE FOOD INTELLIGENCE LEXICON & CLASSIFIER DATABASE
// ===============================================================================

export const FOOD_DATABASE = {
  // CLEAN / NUTRIENT-DENSE FOODS (+Score, High Bioavailability, Whole Foods)
  clean: {
    baseScore: 90,
    categories: {
      fruits: [
        'apple', 'banana', 'orange', 'blueberry', 'blueberries', 'strawberry', 'strawberries',
        'blackberry', 'blackberries', 'raspberry', 'raspberries', 'papaya', 'watermelon',
        'mango', 'grapes', 'pineapple', 'kiwi', 'pomegranate', 'guava', 'pear', 'peach',
        'avocado', 'fig', 'figs', 'plum', 'cherries', 'citrus', 'muskmelon', 'coconut'
      ],
      vegetables: [
        'salad', 'spinach', 'palak', 'kale', 'lettuce', 'cucumber', 'tomato', 'carrot',
        'broccoli', 'cauliflower', 'cabbage', 'beetroot', 'bell pepper', 'capsicum',
        'zucchini', 'asparagus', 'sprouts', 'beans', 'green beans', 'peas', 'mushrooms',
        'garlic', 'ginger', 'onion', 'radish', 'sweet potato', 'bhindi', 'okra', 'methi',
        'lauki', 'gourd', 'microgreens', 'celery'
      ],
      leanProtein: [
        'egg', 'eggs', 'egg whites', 'boiled egg', 'omelette', 'chicken breast', 'grilled chicken',
        'turkey', 'fish', 'salmon', 'tuna', 'cod', 'shrimp', 'prawns', 'dal', 'lentils',
        'moong dal', 'masoor dal', 'chana dal', 'toor dal', 'chickpeas', 'chole', 'rajma',
        'black beans', 'tofu', 'tempeh', 'paneer', 'cottage cheese', 'edamame', 'greek yogurt',
        'curd', 'dahi', 'whey', 'whey protein', 'protein shake', 'soya chunks', 'seitan'
      ],
      wholeGrainsAndFiber: [
        'oats', 'oatmeal', 'rolled oats', 'steel cut oats', 'quinoa', 'brown rice',
        'millet', 'millets', 'ragi', 'jowar', 'bajra', 'chia seeds', 'flax seeds',
        'pumpkin seeds', 'sunflower seeds', 'hemp seeds', 'whole wheat bread',
        'multigrain bread', 'muesli', 'bran', 'daliya', 'barley'
      ],
      healthyFatsAndNuts: [
        'almonds', 'walnuts', 'cashews', 'pistachios', 'peanuts', 'peanut butter',
        'almond butter', 'olive oil', 'extra virgin olive oil', 'ghee', 'mustard oil',
        'sesame seeds', 'coconut oil'
      ],
      beverages: [
        'water', 'green tea', 'herbal tea', 'black tea', 'black coffee', 'matcha',
        'lemon water', 'coconut water', 'buttermilk', 'chaas', 'warm water'
      ]
    }
  },

  // NEUTRAL / STAPLE HOME-COOKED FOODS (Moderate score, Energy sustained, balance required)
  neutral: {
    baseScore: 68,
    categories: {
      staples: [
        'roti', 'chapati', 'phulka', 'rice', 'white rice', 'basmati rice', 'khichdi',
        'idli', 'plain dosa', 'poha', 'upma', 'dosa', 'vermicelli', 'plain sandwich',
        'wrap', 'corn', 'cornflakes', 'potatoes', 'boiled potato', 'sambar', 'soup',
        'vegetable soup', 'lentil soup', 'milk', 'cow milk', 'soy milk', 'almond milk',
        'chai', 'tea', 'coffee', 'latte', 'cappuccino'
      ]
    }
  },

  // JUNK / ULTRA-PROCESSED / INFLAMMATORY FOODS (-Score, High Glycemic, Trans Fats, Sodium)
  junk: {
    baseScore: 25,
    categories: {
      deepFried: [
        'samosa', 'pakora', 'pakoda', 'kachori', 'french fries', 'fries', 'chips',
        'crisps', 'fried chicken', 'chicken nuggets', 'nuggets', 'bhujia', 'namkeen',
        'vada pav', 'batata vada', 'bhature', 'chole bhature', 'puri', 'poori', 'tempura',
        'onion rings', 'churros', 'puff', 'patties', 'mirchi bajji'
      ],
      fastFoodAndProcessed: [
        'burger', 'cheeseburger', 'pizza', 'hot dog', 'instant noodles', 'maggi',
        'ramen', 'loaded nachos', 'nachos', 'processed cheese', 'sausage', 'bacon',
        'pepperoni', 'salami', 'spring roll', 'momos (fried)', 'fried rice (fast food)',
        'manchurian', 'shawarma', 'tacos (fast food)'
      ],
      sugaryAndDesserts: [
        'cake', 'cupcake', 'pastry', 'donut', 'doughnut', 'ice cream', 'chocolate',
        'milk chocolate', 'candy', 'cookies', 'biscuit', 'biscuits', 'brownie', 'sweet',
        'sweets', 'mithai', 'gulab jamun', 'jalebi', 'rasgulla', 'halwa', 'kaju katli',
        'syrup', 'dessert', 'pudding', 'waffles', 'pancakes with syrup', 'muffin'
      ],
      sweetenedBeverages: [
        'soda', 'coke', 'coca cola', 'pepsi', 'sprite', 'fanta', 'mountain dew',
        'soft drink', 'energy drink', 'red bull', 'monster', 'packaged juice',
        'milkshake', 'frappuccino', 'sweet lassi', 'cold coffee (sweet)'
      ]
    }
  }
};

// Dietary modifiers that influence scoring
export const MODIFIERS = {
  positive: [
    { word: 'grilled', bonus: 6 },
    { word: 'boiled', bonus: 6 },
    { word: 'steamed', bonus: 8 },
    { word: 'baked', bonus: 5 },
    { word: 'raw', bonus: 8 },
    { word: 'fresh', bonus: 6 },
    { word: 'organic', bonus: 4 },
    { word: 'sugar-free', bonus: 10 },
    { word: 'unsweetened', bonus: 10 },
    { word: 'low sugar', bonus: 8 },
    { word: 'low fat', bonus: 4 },
    { word: 'homemade', bonus: 8 },
    { word: 'air fried', bonus: 8 },
    { word: 'olive oil', bonus: 5 }
  ],
  negative: [
    { word: 'deep fried', penalty: -22 },
    { word: 'fried', penalty: -16 },
    { word: 'crispy', penalty: -10 },
    { word: 'oily', penalty: -14 },
    { word: 'greasy', penalty: -15 },
    { word: 'extra cheese', penalty: -12 },
    { word: 'double cheese', penalty: -14 },
    { word: 'sugary', penalty: -18 },
    { word: 'sweet', penalty: -10 },
    { word: 'loaded', penalty: -12 },
    { word: 'creamy', penalty: -8 },
    { word: 'processed', penalty: -15 },
    { word: 'salted', penalty: -6 },
    { word: 'sweetened', penalty: -14 }
  ]
};

// ===============================================================================
// 2. SMART FOOD QUALITY ANALYZER
// ===============================================================================

export class SmartFoodQualityAnalyzer {
  constructor() {
    this.cleanIndex = this._buildInvertedIndex(FOOD_DATABASE.clean.categories, 'clean');
    this.neutralIndex = this._buildInvertedIndex(FOOD_DATABASE.neutral.categories, 'neutral');
    this.junkIndex = this._buildInvertedIndex(FOOD_DATABASE.junk.categories, 'junk');
  }

  _buildInvertedIndex(categories, qualityType) {
    const index = new Map();
    for (const [subCategory, items] of Object.entries(categories)) {
      for (const item of items) {
        index.set(item.toLowerCase(), { subCategory, qualityType });
      }
    }
    return index;
  }

  /**
   * Tokenizes text and looks for multi-word phrases and single words
   */
  _extractMatches(rawText) {
    const cleanText = rawText.toLowerCase().replace(/[,/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    const tokens = cleanText.split(/\s+/).filter(t => t.length > 1);
    const matches = [];
    const usedIndices = new Set();

    // Try trigrams and bigrams first, then unigrams
    for (let n = 3; n >= 1; n--) {
      for (let i = 0; i <= tokens.length - n; i++) {
        // Skip if any token in this n-gram has been matched in a longer n-gram
        let alreadyUsed = false;
        for (let j = 0; j < n; j++) {
          if (usedIndices.has(i + j)) {
            alreadyUsed = true;
            break;
          }
        }
        if (alreadyUsed) continue;

        const phrase = tokens.slice(i, i + n).join(' ');
        
        // Match against database
        const match = this.cleanIndex.get(phrase) || 
                      this.neutralIndex.get(phrase) || 
                      this.junkIndex.get(phrase);

        if (match) {
          matches.push({
            term: phrase,
            subCategory: match.subCategory,
            quality: match.qualityType
          });
          for (let j = 0; j < n; j++) usedIndices.add(i + j);
        }
      }
    }

    return matches;
  }

  /**
   * Evaluates modifiers like 'fried', 'steamed', 'sugar-free'
   */
  _evaluateModifiers(rawText) {
    const lower = rawText.toLowerCase();
    let scoreModifier = 0;
    const appliedModifiers = [];

    for (const mod of MODIFIERS.positive) {
      if (lower.includes(mod.word)) {
        scoreModifier += mod.bonus;
        appliedModifiers.push({ text: mod.word, effect: 'positive', value: mod.bonus });
      }
    }
    for (const mod of MODIFIERS.negative) {
      if (lower.includes(mod.word)) {
        scoreModifier += mod.penalty;
        appliedModifiers.push({ text: mod.word, effect: 'negative', value: mod.penalty });
      }
    }

    return { scoreModifier, appliedModifiers };
  }

  /**
   * Analyzes an individual logged food item or meal string
   * @param {string} rawText 
   * @param {Array<string>} userTags 
   * @returns {Object} Comprehensive item analysis
   */
  analyzeItem(rawText, userTags = []) {
    if (!rawText || !rawText.trim()) {
      return {
        text: '',
        quality: 'neutral',
        score: 50,
        flags: [],
        matches: [],
        summary: 'No item entered'
      };
    }

    const matches = this._extractMatches(rawText);
    const { scoreModifier, appliedModifiers } = this._evaluateModifiers(rawText);

    // Also include user tags in matching
    userTags.forEach(tag => {
      const tagMatch = this.cleanIndex.get(tag.toLowerCase()) ||
                       this.neutralIndex.get(tag.toLowerCase()) ||
                       this.junkIndex.get(tag.toLowerCase());
      if (tagMatch) {
        matches.push({ term: tag.toLowerCase(), subCategory: tagMatch.subCategory, quality: tagMatch.qualityType });
      }
    });

    let cleanCount = 0;
    let neutralCount = 0;
    let junkCount = 0;
    const flags = new Set();

    matches.forEach(m => {
      if (m.quality === 'clean') cleanCount++;
      if (m.quality === 'neutral') neutralCount++;
      if (m.quality === 'junk') junkCount++;

      // Tag-specific flags
      if (m.subCategory === 'deepFried') flags.add('heavy-oil');
      if (m.subCategory === 'sugaryAndDesserts' || m.subCategory === 'sweetenedBeverages') flags.add('high-sugar');
      if (m.subCategory === 'fastFoodAndProcessed') flags.add('ultra-processed');
      if (m.subCategory === 'leanProtein') flags.add('protein-rich');
      if (m.subCategory === 'vegetables' || m.subCategory === 'fruits') flags.add('micronutrients');
      if (m.subCategory === 'wholeGrainsAndFiber') flags.add('fiber-source');
      if (m.subCategory === 'healthyFatsAndNuts') flags.add('healthy-fats');
    });

    // Score calculation
    let baseScore = 65; // default fallback if unclassified
    let primaryQuality = 'neutral';

    if (matches.length > 0) {
      if (junkCount > 0 && junkCount >= cleanCount) {
        primaryQuality = 'junk';
        baseScore = Math.max(10, FOOD_DATABASE.junk.baseScore - (junkCount - 1) * 10);
      } else if (cleanCount > junkCount) {
        primaryQuality = 'clean';
        baseScore = Math.min(100, FOOD_DATABASE.clean.baseScore + (cleanCount - 1) * 3);
        if (junkCount > 0) baseScore -= 20; // penalized for having junk alongside
      } else if (junkCount > 0) {
        primaryQuality = 'junk';
        baseScore = 40;
      } else {
        primaryQuality = 'neutral';
        baseScore = FOOD_DATABASE.neutral.baseScore;
      }
    } else {
      // Heuristic fallback for untracked terms
      const lower = rawText.toLowerCase();
      if (/fried|soda|burger|pizza|chip|candy|sweet|sugar|snack/.test(lower)) {
        primaryQuality = 'junk';
        baseScore = 30;
        flags.add('ultra-processed');
      } else if (/salad|fruit|dal|sprout|egg|protein|grain|boiled|veggie/.test(lower)) {
        primaryQuality = 'clean';
        baseScore = 85;
        flags.add('micronutrients');
      }
    }

    // Apply modifiers
    let finalScore = Math.max(0, Math.min(100, baseScore + scoreModifier));

    // Summary badge text
    let badgeText = '🥗 Clean Nutrition';
    if (primaryQuality === 'junk') badgeText = '⚠️ Ultra-Processed / Junk';
    else if (primaryQuality === 'neutral') badgeText = '🍚 Neutral Home Staple';

    return {
      text: rawText.trim(),
      quality: primaryQuality,
      score: finalScore,
      matches,
      flags: Array.from(flags),
      appliedModifiers,
      badgeText
    };
  }

  /**
   * Analyzes an entire meal slot (e.g. Breakfast, Lunch, Dinner, Evening Snacks)
   */
  analyzeMealSlot(items = []) {
    if (!items || items.length === 0) {
      return {
        logged: false,
        score: 0,
        quality: 'empty',
        items: [],
        flags: []
      };
    }

    const analyzedItems = items.map(it => 
      typeof it === 'string' ? this.analyzeItem(it) : this.analyzeItem(it.text, it.tags || [])
    );

    const totalScore = analyzedItems.reduce((sum, item) => sum + item.score, 0);
    const avgScore = Math.round(totalScore / analyzedItems.length);

    const allFlags = new Set();
    let hasJunk = false;
    let hasClean = false;

    analyzedItems.forEach(item => {
      item.flags.forEach(f => allFlags.add(f));
      if (item.quality === 'junk') hasJunk = true;
      if (item.quality === 'clean') hasClean = true;
    });

    let overallQuality = 'neutral';
    if (hasJunk && avgScore < 50) overallQuality = 'junk';
    else if (hasClean && avgScore >= 75) overallQuality = 'clean';
    else if (hasJunk) overallQuality = 'mixed';

    return {
      logged: true,
      itemCount: items.length,
      score: avgScore,
      quality: overallQuality,
      items: analyzedItems,
      flags: Array.from(allFlags)
    };
  }
}

// ===============================================================================
// 3. DAILY HEALTH SCORE ENGINE (0 - 100%)
// ===============================================================================

export class DailyHealthScoreEngine {
  /**
   * Evaluates overall day's health score
   * @param {Object} params
   * @param {Object} params.meals - { breakfast: [], lunch: [], snacks: [], dinner: [] }
   * @param {number} params.hydrationGlasses - Number of glasses drunk (target 8)
   * @returns {Object} Score breakdown and verdict
   */
  static calculate({ meals = {}, hydrationGlasses = 0 }) {
    const analyzer = new SmartFoodQualityAnalyzer();
    const slots = ['breakfast', 'lunch', 'snacks', 'dinner'];
    
    const analyzedSlots = {};
    let totalItemsLogged = 0;
    let cleanItemCount = 0;
    let junkItemCount = 0;
    let neutralItemCount = 0;
    let totalFoodScoreSum = 0;
    const globalFlags = new Set();

    slots.forEach(slot => {
      const meal = analyzer.analyzeMealSlot(meals[slot] || []);
      analyzedSlots[slot] = meal;
      if (meal.logged) {
        meal.items.forEach(it => {
          totalItemsLogged++;
          if (it.quality === 'clean') cleanItemCount++;
          if (it.quality === 'junk') junkItemCount++;
          if (it.quality === 'neutral') neutralItemCount++;
          it.flags.forEach(f => globalFlags.add(f));
          totalFoodScoreSum += it.score;
        });
      }
    });

    // 1. Food Quality Component (Max: 55 pts)
    let foodQualityPoints = 0;
    if (totalItemsLogged > 0) {
      const averageItemScore = totalFoodScoreSum / totalItemsLogged; // 0 - 100
      foodQualityPoints = (averageItemScore / 100) * 45; // 0 - 45 base

      // Clean ratio bonus (0 - 10 pts)
      const cleanRatio = cleanItemCount / (totalItemsLogged);
      foodQualityPoints += cleanRatio * 10;

      // Heavy junk penalty
      if (junkItemCount >= 2) {
        foodQualityPoints = Math.max(0, foodQualityPoints - (junkItemCount * 5));
      }
    }
    foodQualityPoints = Math.min(55, Math.max(0, Math.round(foodQualityPoints)));

    // 2. Hydration Component (Max: 25 pts)
    // 8 glasses is 100% of hydration quota (3L)
    const hydrationTarget = 8;
    const hydrationRatio = Math.min(1.0, hydrationGlasses / hydrationTarget);
    let hydrationPoints = Math.round(hydrationRatio * 25);

    // 3. Nutritional Balance & Variety Bonus (Max: 12 pts)
    let balancePoints = 0;
    if (globalFlags.has('protein-rich')) balancePoints += 4;
    if (globalFlags.has('fiber-source') || globalFlags.has('micronutrients')) balancePoints += 4;
    if (globalFlags.has('healthy-fats')) balancePoints += 4;

    // 4. Meal Regularity & Discipline Component (Max: 8 pts)
    let consistencyPoints = 0;
    const loggedMainMealsCount = ['breakfast', 'lunch', 'dinner'].filter(s => analyzedSlots[s].logged).length;
    if (loggedMainMealsCount === 3) consistencyPoints += 6;
    else if (loggedMainMealsCount === 2) consistencyPoints += 4;
    else if (loggedMainMealsCount === 1) consistencyPoints += 2;

    // Evening snack discipline check:
    const snackSlot = analyzedSlots.snacks;
    if (!snackSlot.logged || snackSlot.quality === 'clean') {
      consistencyPoints += 2; // Bonus for not binging on evening junk
    }

    // 5. Penalties
    let penalties = 0;
    if (globalFlags.has('heavy-oil') && globalFlags.has('high-sugar')) penalties += 10;
    if (globalFlags.has('ultra-processed')) penalties += 6;
    if (hydrationGlasses < 3 && totalItemsLogged > 0) penalties += 6; // Dehydration penalty

    // Total Composite Score
    let rawScore = (foodQualityPoints + hydrationPoints + balancePoints + consistencyPoints) - penalties;
    
    // Default score if nothing logged yet today
    if (totalItemsLogged === 0 && hydrationGlasses === 0) {
      rawScore = 0;
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Tier calculation
    let tier = 'Needs Focus';
    let color = 'var(--red)';
    if (finalScore >= 85) {
      tier = 'Elite Vitality';
      color = 'var(--green)';
    } else if (finalScore >= 70) {
      tier = 'Clean & Energized';
      color = 'var(--green)';
    } else if (finalScore >= 50) {
      tier = 'Moderate — Room to Improve';
      color = 'var(--yellow)';
    } else if (finalScore > 0) {
      tier = 'Inflammatory Alert';
      color = 'var(--red)';
    } else {
      tier = 'Awaiting Logs';
      color = 'var(--text-dim)';
    }

    return {
      score: finalScore,
      tier,
      color,
      breakdown: {
        foodQualityPoints,      // out of 55
        hydrationPoints,        // out of 25
        balancePoints,          // out of 12
        consistencyPoints,      // out of 8
        penalties
      },
      stats: {
        totalItemsLogged,
        cleanItemCount,
        junkItemCount,
        neutralItemCount,
        hydrationGlasses,
        flags: Array.from(globalFlags)
      },
      slots: analyzedSlots
    };
  }
}

// ===============================================================================
// 4. INSTANT HEALTH FEEDBACK GENERATOR
// ===============================================================================

export class InstantHealthFeedbackGenerator {
  /**
   * Generates honest, motivational, actionable feedback
   * @param {Object} scoreResult Output of DailyHealthScoreEngine.calculate()
   * @returns {Object} Feedback payload { headline, message, status, actionTips, badge }
   */
  static generate(scoreResult) {
    const { stats, slots, score } = scoreResult;
    const flags = new Set(stats.flags || []);
    const hour = new Date().getHours();

    // Case 0: Nothing logged yet
    if (stats.totalItemsLogged === 0 && stats.hydrationGlasses === 0) {
      return {
        headline: "Ready to Fuel Your Body? ⚡",
        message: "Log your first glass of water or breakfast. Your metabolic health sets the baseline for today's mental clarity.",
        status: "neutral",
        badge: "Waiting for Input",
        actionTips: [
          "Start with 1 large glass of water before caffeine.",
          "Keep breakfast rich in protein and dietary fiber."
        ]
      };
    }

    // Case 1: Heavy Oil & Deep Fried Detected
    if (flags.has('heavy-oil') && flags.has('high-sugar')) {
      return {
        headline: "High Toxic & Inflammatory Load Detected 🚨",
        message: "Heavy oil and refined sugar recorded today. This triggers lethargy, endotoxemia, and evening brain fog. Flush immediately with water and avoid late-night snacks.",
        status: "critical",
        badge: "Gut Reset Required",
        actionTips: [
          "Drink 2-3 extra glasses of water right now to assist kidneys.",
          "Take a brisk 15-20 min walk to blunt post-meal glucose spikes.",
          "Zero snacks after 8:30 PM to allow liver regeneration."
        ]
      };
    }

    // Case 2: Deep Fried / Heavy Oil only
    if (flags.has('heavy-oil')) {
      return {
        headline: "Heavy Oil & Fried Food Detected ⚠️",
        message: "Deep fried food logged. High trans/saturated lipids slow down gastric emptying. Counterbalance with raw greens and clean water.",
        status: "warning",
        badge: "Heavy Digestion",
        actionTips: [
          "Flush with warm lemon or cumin water.",
          "Keep your next meal strictly light (soup, curd, or steamed veggies).",
          "Avoid lying down for at least 2 hours after eating."
        ]
      };
    }

    // Case 3: High Sugar / Soda Detected
    if (flags.has('high-sugar')) {
      return {
        headline: "Sugar Spike & Crash Alert ⚡",
        message: "High liquid sugar or confectionery detected. Expect an insulin drop soon. Do not fix the energy crash with more caffeine or sweets.",
        status: "warning",
        badge: "Sugar Spike",
        actionTips: [
          "Hydrate to speed up glucose clearance.",
          "Pair your next meal with healthy fats (almonds/walnuts) to stabilize blood sugar.",
          "Sleep at a normal hour to restore insulin sensitivity."
        ]
      };
    }

    // Case 4: Severe Dehydration
    if (stats.hydrationGlasses < 4 && hour >= 15) {
      return {
        headline: "Dehydration Dragging Down Your Focus 💧",
        message: "You have logged under 4 glasses of water past mid-afternoon. Dehydration mimics hunger and reduces cognitive output by 15-20%.",
        status: "warning",
        badge: "Low Hydration",
        actionTips: [
          "Drink 2 glasses of water immediately.",
          "Keep a water bottle on your desk at arm's length.",
          "Track each glass using the quick-tap buttons below."
        ]
      };
    }

    // Case 5: Clean Nutrition Champion
    if (stats.cleanItemCount >= 3 && stats.junkItemCount === 0 && score >= 75) {
      const hydrationMessage = stats.hydrationGlasses >= 6 
        ? "Hydration is on point." 
        : "Top it off with 2 more glasses of water.";
      return {
        headline: "Clean Nutrition! Peak Metabolic Energy 🌟",
        message: `Outstanding whole-food fuel! Steady glucose, rich micronutrients, and high fiber. ${hydrationMessage} You'll wake up tomorrow feeling crisp and energized.`,
        status: "clean",
        badge: "High Performance",
        actionTips: [
          "Keep this momentum for dinner.",
          "Finish your last meal at least 3 hours before sleep for maximum deep sleep."
        ]
      };
    }

    // Case 6: Mixed Day (Some junk, some clean)
    if (stats.junkItemCount > 0 && stats.cleanItemCount > 0) {
      return {
        headline: "Mixed Diet Day — Balance is Rescuable ⚖️",
        message: "Some processed foods logged alongside good choices. Don't let one bad snack derail your entire day. Win the remaining meals.",
        status: "neutral",
        badge: "Course Correct",
        actionTips: [
          "Double down on hydration (reach 8 glasses).",
          "Ensure dinner is pure clean fuel: greens, dal/protein, and zero sugar."
        ]
      };
    }

    // Case 7: High Hydration, Moderate Food
    if (stats.hydrationGlasses >= 8 && score >= 60) {
      return {
        headline: "Hydration Champion! Optimal 3L Achieved 💧",
        message: "You've hit your full daily hydration target! Your lymphatic drainage, kidney filtration, and skin cell turgor are optimized.",
        status: "clean",
        badge: "Hydrated",
        actionTips: [
          "Space out your sips for the rest of the evening.",
          "Avoid chugging excess water right before bed to protect uninterrupted sleep."
        ]
      };
    }

    // Default Fallback
    return {
      headline: "Solid Foundation — Keep Building 📈",
      message: "Meals are being logged consistently. Aim for higher protein, darker leafy greens, and complete your 8 glasses of water.",
      status: "neutral",
      badge: "In Progress",
      actionTips: [
        "Include at least one raw salad or fruit bowl today.",
        "Tap to log water as you drink."
      ]
    };
  }
}

// ===============================================================================
// 5. HYDRATION TRACKER ENGINE
// ===============================================================================

export class HydrationTracker {
  constructor(options = {}) {
    this.targetGlasses = options.targetGlasses || 8;
    this.mlPerGlass = options.mlPerGlass || 350; // 8 * 350ml = 2.8L (approx 3L)
  }

  calculateTotalMl(glasses) {
    return glasses * this.mlPerGlass;
  }

  getPercentage(glasses) {
    return Math.min(100, Math.round((glasses / this.targetGlasses) * 100));
  }

  getStatusBadge(glasses) {
    if (glasses >= 8) return { label: 'Optimal 3L Reached', color: 'var(--green)', icon: '🌊' };
    if (glasses >= 6) return { label: 'Good Progress (2.1L+)', color: 'var(--green)', icon: '💧' };
    if (glasses >= 4) return { label: 'Halfway (1.4L)', color: 'var(--yellow)', icon: '🥤' };
    return { label: 'Dehydrated (<1.4L)', color: 'var(--red)', icon: '⚠️' };
  }
}

// ===============================================================================
// 6. FOOD & HEALTH STORAGE LAYER (PWA LocalStorage Integration)
// ===============================================================================

export class FoodHealthStorage {
  static getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  static getMealsKey(dateStr = FoodHealthStorage.getTodayStr()) {
    return `lt_${dateStr}_meals`;
  }

  static getHydrationKey(dateStr = FoodHealthStorage.getTodayStr()) {
    return `lt_${dateStr}_hydration`;
  }

  static loadMeals(dateStr) {
    try {
      const raw = localStorage.getItem(FoodHealthStorage.getMealsKey(dateStr));
      return raw ? JSON.parse(raw) : { breakfast: [], lunch: [], snacks: [], dinner: [] };
    } catch (e) {
      console.error('Failed to load meals', e);
      return { breakfast: [], lunch: [], snacks: [], dinner: [] };
    }
  }

  static saveMeals(meals, dateStr) {
    try {
      localStorage.setItem(FoodHealthStorage.getMealsKey(dateStr), JSON.stringify(meals));
    } catch (e) {
      console.error('Failed to save meals', e);
    }
  }

  static loadHydration(dateStr) {
    try {
      const raw = localStorage.getItem(FoodHealthStorage.getHydrationKey(dateStr));
      return raw ? JSON.parse(raw) : { glasses: 0, timestamps: [] };
    } catch (e) {
      console.error('Failed to load hydration', e);
      return { glasses: 0, timestamps: [] };
    }
  }

  static saveHydration(data, dateStr) {
    try {
      localStorage.setItem(FoodHealthStorage.getHydrationKey(dateStr), JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save hydration', e);
    }
  }
}

// ===============================================================================
// 7. COMPLETE UI COMPONENT RENDERER (HTML, CSS & CONTROLLER)
// ===============================================================================

export const FOOD_HEALTH_CSS = `
  /* Food & Health Component Styles */
  .fh-container {
    margin-top: 24px;
  }

  .fh-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    transition: border-color 0.2s ease;
  }
  .fh-card:hover {
    border-color: rgba(124, 92, 252, 0.4);
  }

  .fh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .fh-title {
    font-size: 1.05rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .fh-badge {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 50px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .fh-badge.clean { background: var(--green-dim); color: var(--green); border: 1px solid var(--green); }
  .fh-badge.warning { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow); }
  .fh-badge.critical { background: var(--red-dim); color: var(--red); border: 1px solid var(--red); }
  .fh-badge.neutral { background: var(--border); color: var(--text-dim); }

  /* Daily Health Score Gauge */
  .fh-score-box {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;
    align-items: center;
    background: linear-gradient(135deg, rgba(26, 26, 36, 0.9), rgba(34, 34, 47, 0.9));
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 16px;
  }

  .fh-dial {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }
  .fh-dial svg { transform: rotate(-90deg); }
  .fh-dial-bg { fill: none; stroke: var(--border); stroke-width: 8; }
  .fh-dial-prog {
    fill: none;
    stroke: var(--green);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s;
  }
  .fh-dial-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .fh-dial-num { font-size: 1.6rem; font-weight: 800; }
  .fh-dial-sub { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }

  .fh-score-info h4 { font-size: 1.1rem; margin-bottom: 4px; }
  .fh-score-sub { font-size: 0.82rem; color: var(--text-dim); line-height: 1.4; }
  .fh-metrics-row {
    display: flex;
    gap: 12px;
    margin-top: 10px;
  }
  .fh-metric-pill {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 0.75rem;
  }
  .fh-metric-pill span { font-weight: 700; color: var(--accent); }

  /* Instant Feedback Banner */
  .fh-feedback-box {
    border-left: 4px solid var(--accent);
    padding: 14px 16px;
    background: var(--bg);
    border-radius: 0 var(--radius) var(--radius) 0;
    margin-bottom: 16px;
  }
  .fh-feedback-box.critical { border-left-color: var(--red); background: rgba(239, 68, 68, 0.08); }
  .fh-feedback-box.warning { border-left-color: var(--yellow); background: rgba(245, 158, 11, 0.08); }
  .fh-feedback-box.clean { border-left-color: var(--green); background: rgba(34, 197, 94, 0.08); }
  .fh-fb-head { font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .fh-fb-msg { font-size: 0.85rem; color: var(--text); line-height: 1.5; margin-bottom: 8px; }
  .fh-fb-tips { margin-left: 18px; font-size: 0.8rem; color: var(--text-dim); line-height: 1.4; }
  .fh-fb-tips li { margin-bottom: 3px; }

  /* Hydration Section */
  .fh-hydro-card {
    background: linear-gradient(145deg, #151d30 0%, #1a1a24 100%);
  }
  .fh-hydro-progress-bar {
    width: 100%;
    height: 10px;
    background: var(--bg);
    border-radius: 5px;
    overflow: hidden;
    margin: 12px 0 16px;
    border: 1px solid var(--border);
  }
  .fh-hydro-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #38bdf8, #3b82f6);
    border-radius: 5px;
    transition: width 0.4s ease;
  }
  .fh-hydro-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }
  .fh-glass-btn {
    aspect-ratio: 1;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
    color: var(--text-dim);
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    user-select: none;
  }
  .fh-glass-btn.active {
    background: #0284c7;
    border-color: #38bdf8;
    color: #fff;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    transform: translateY(-2px);
  }
  .fh-glass-btn span.vol {
    font-size: 0.55rem;
    font-weight: 700;
    margin-top: 2px;
  }
  .fh-hydro-controls {
    display: flex;
    gap: 10px;
  }
  .fh-btn {
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--card-hover);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .fh-btn:hover {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .fh-btn.btn-sm {
    padding: 6px 12px;
    font-size: 0.78rem;
  }
  .fh-btn.btn-danger {
    color: var(--red);
  }
  .fh-btn.btn-danger:hover {
    background: var(--red);
    color: #fff;
  }

  /* Meal Logger Slots */
  .fh-meal-slot {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .fh-meal-slot:focus-within {
    border-color: var(--accent);
  }
  .fh-meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .fh-meal-name {
    font-weight: 700;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fh-meal-meta {
    font-size: 0.75rem;
    color: var(--text-dim);
  }

  /* Quick-tag pills for rapid logging */
  .fh-quicktags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .fh-tag-chip {
    font-size: 0.72rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 10px;
    cursor: pointer;
    color: var(--text-dim);
    transition: all 0.15s;
  }
  .fh-tag-chip:hover {
    border-color: var(--accent);
    color: var(--text);
    background: var(--card-hover);
  }

  .fh-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  .fh-input {
    flex: 1;
    padding: 10px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-size: 0.88rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .fh-input:focus {
    border-color: var(--accent);
  }
  .fh-input::placeholder {
    color: var(--text-dim);
  }

  /* Logged Items List */
  .fh-items-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .fh-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card);
    border: 1px solid var(--border);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
  }
  .fh-item-row.clean { border-left: 3px solid var(--green); }
  .fh-item-row.neutral { border-left: 3px solid var(--yellow); }
  .fh-item-row.junk { border-left: 3px solid var(--red); }
  
  .fh-item-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .fh-item-text { font-weight: 600; }
  .fh-item-badge-strip {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .fh-item-subtag {
    font-size: 0.65rem;
    color: var(--text-dim);
  }
  .fh-item-del {
    background: transparent;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    padding: 4px;
    font-size: 1rem;
    transition: color 0.2s;
  }
  .fh-item-del:hover {
    color: var(--red);
  }

  @media (max-width: 480px) {
    .fh-score-box {
      grid-template-columns: 1fr;
      text-align: center;
    }
    .fh-dial {
      margin: 0 auto;
    }
    .fh-metrics-row {
      justify-content: center;
    }
    .fh-hydro-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

// Recommended quick-entry chips per meal slot
export const QUICK_TAGS_CONFIG = {
  breakfast: ['🍳 2 Eggs', '🥣 Oatmeal & Fruits', '🥪 Brown Bread', '🥑 Avocado Toast', '☕ Black Coffee', '🥞 Pancakes', '🥐 Pastry'],
  lunch: ['🥗 Green Salad', '🍲 Dal & Rice', '🫓 2 Rotis & Veggie', '🍗 Grilled Chicken', '🍛 Chole Rice', '🍔 Burger & Fries', '🍕 Pizza Slice'],
  snacks: ['🍵 Green Tea', '🥜 Almonds & Walnuts', '🍎 Apple / Banana', '🍿 Makhana', '☕ Chai & Biscuits', '🍟 Chips & Dip', '🥤 Soda Can'],
  dinner: ['🍲 Lentil Soup', '🥗 Paneer Salad', '🫓 2 Phulkas & Sabzi', '🍛 Light Khichdi', '🍗 Fish & Veggies', '🥡 Fried Rice', '🍜 Maggi Noodles']
};

/**
 * Controller class to bind UI events and handle live reactivity
 */
export class FoodHealthUIComponent {
  constructor(containerId = 'foodHealthContainer', options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.dateStr = options.dateStr || FoodHealthStorage.getTodayStr();
    this.analyzer = new SmartFoodQualityAnalyzer();
    this.hydrationTracker = new HydrationTracker();
    this.meals = FoodHealthStorage.loadMeals(this.dateStr);
    this.hydration = FoodHealthStorage.loadHydration(this.dateStr);
  }

  init() {
    this._injectStyles();
    this.render();
  }

  _injectStyles() {
    if (!document.getElementById('food-health-styles')) {
      const style = document.createElement('style');
      style.id = 'food-health-styles';
      style.textContent = FOOD_HEALTH_CSS;
      document.head.appendChild(style);
    }
  }

  getScoreCalculation() {
    return DailyHealthScoreEngine.calculate({
      meals: this.meals,
      hydrationGlasses: this.hydration.glasses || 0
    });
  }

  render() {
    if (!this.container) return;

    const scoreResult = this.getScoreCalculation();
    const feedback = InstantHealthFeedbackGenerator.generate(scoreResult);
    const hydroMl = this.hydrationTracker.calculateTotalMl(this.hydration.glasses || 0);
    const hydroPercent = this.hydrationTracker.getPercentage(this.hydration.glasses || 0);
    const hydroBadge = this.hydrationTracker.getStatusBadge(this.hydration.glasses || 0);

    const circumference = 2 * Math.PI * 42; // r=42 in 100x100 dial
    const offset = circumference - (scoreResult.score / 100) * circumference;

    this.container.innerHTML = `
      <div class="fh-container">
        
        <!-- DAILY HEALTH SCORE GAUGE -->
        <div class="fh-card">
          <div class="fh-header">
            <div class="fh-title">🍎 Food & Health Intelligence</div>
            <div class="fh-badge ${feedback.status}">${scoreResult.tier}</div>
          </div>

          <div class="fh-score-box">
            <div class="fh-dial">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle class="fh-dial-bg" cx="50" cy="50" r="42" />
                <circle class="fh-dial-prog" cx="50" cy="50" r="42"
                  stroke="${scoreResult.color}"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}" />
              </svg>
              <div class="fh-dial-text">
                <div class="fh-dial-num" style="color:${scoreResult.color}">${scoreResult.score}%</div>
                <div class="fh-dial-sub">Health</div>
              </div>
            </div>

            <div class="fh-score-info">
              <h4>Daily Bio-Score</h4>
              <div class="fh-score-sub">Holistic balance of clean nutrition, junk minimization, and continuous cellular hydration.</div>
              <div class="fh-metrics-row">
                <div class="fh-metric-pill">Food: <span>${scoreResult.breakdown.foodQualityPoints}/55</span></div>
                <div class="fh-metric-pill">Water: <span>${scoreResult.breakdown.hydrationPoints}/25</span></div>
                <div class="fh-metric-pill">Clean items: <span>${scoreResult.stats.cleanItemCount}</span></div>
                <div class="fh-metric-pill">Junk: <span style="color:${scoreResult.stats.junkItemCount > 0 ? 'var(--red)' : 'var(--green)'}">${scoreResult.stats.junkItemCount}</span></div>
              </div>
            </div>
          </div>

          <!-- INSTANT HEALTH FEEDBACK BOX -->
          <div class="fh-feedback-box ${feedback.status}">
            <div class="fh-fb-head">
              <span>${feedback.headline}</span>
            </div>
            <div class="fh-fb-msg">${feedback.message}</div>
            <ul class="fh-fb-tips">
              ${feedback.actionTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- HYDRATION TRACKER (3L / 8 GLASSES) -->
        <div class="fh-card fh-hydro-card">
          <div class="fh-header">
            <div class="fh-title">💧 Hydration Velocity (Target: 8 Glasses / 3L)</div>
            <div class="fh-badge" style="background:${hydroBadge.color}33; color:${hydroBadge.color}; border:1px solid ${hydroBadge.color};">
              ${hydroBadge.icon} ${this.hydration.glasses || 0}/8 Glasses (${hydroMl} ml)
            </div>
          </div>

          <div class="fh-hydro-progress-bar">
            <div class="fh-hydro-fill" style="width: ${hydroPercent}%;"></div>
          </div>

          <!-- 8 Tap-to-toggle Glasses -->
          <div class="fh-hydro-grid">
            ${Array.from({ length: 8 }).map((_, idx) => {
              const active = idx < (this.hydration.glasses || 0);
              return `
                <button class="fh-glass-btn ${active ? 'active' : ''}" data-glass-idx="${idx + 1}" title="Glass ${idx + 1} (~350ml)">
                  ${active ? '🌊' : '🥤'}
                  <span class="vol">#${idx + 1}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="fh-hydro-controls">
            <button class="fh-btn" id="fh-add-glass">💧 +1 Glass (350ml)</button>
            <button class="fh-btn" id="fh-add-bottle">🍶 +500ml Bottle</button>
            <button class="fh-btn btn-danger" id="fh-minus-glass">↺ -1 Glass</button>
          </div>
        </div>

        <!-- MEAL LOGGER SLOTS (Breakfast, Lunch, Snacks, Dinner) -->
        <div class="fh-card">
          <div class="fh-header">
            <div class="fh-title">🍽️ Meal Quality Logger</div>
            <div class="fh-score-sub">Smart junk detection & nutrient quality analysis</div>
          </div>

          ${this._renderMealSlot('breakfast', '🍳 Breakfast', '7:00 AM – 10:30 AM')}
          ${this._renderMealSlot('lunch', '🥗 Lunch', '12:30 PM – 3:00 PM')}
          ${this._renderMealSlot('snacks', '🍵 Evening Snacks', '4:30 PM – 6:30 PM')}
          ${this._renderMealSlot('dinner', '🍲 Dinner', '7:30 PM – 9:30 PM')}
        </div>

      </div>
    `;

    this._bindEvents();
  }

  _renderMealSlot(slotKey, title, timeWindow) {
    const items = this.meals[slotKey] || [];
    const quickTags = QUICK_TAGS_CONFIG[slotKey] || [];

    return `
      <div class="fh-meal-slot" data-slot="${slotKey}">
        <div class="fh-meal-header">
          <div class="fh-meal-name">${title}</div>
          <div class="fh-meal-meta">${timeWindow} • ${items.length} logged</div>
        </div>

        <!-- Quick Tags for Rapid 1-Tap Entry -->
        <div class="fh-quicktags">
          ${quickTags.map(tag => `
            <button type="button" class="fh-tag-chip" data-slot="${slotKey}" data-chip="${tag}">${tag}</button>
          `).join('')}
        </div>

        <!-- Input Bar -->
        <div class="fh-input-group">
          <input type="text" class="fh-input" id="input-${slotKey}" placeholder="e.g. 2 boiled eggs, sourdough toast, black coffee..." />
          <button type="button" class="fh-btn" data-action="add-item" data-slot="${slotKey}">Add</button>
        </div>

        <!-- Logged Items List with Smart Quality Badge -->
        <div class="fh-items-list" id="list-${slotKey}">
          ${items.map((it, idx) => {
            const analysis = this.analyzer.analyzeItem(it.text || it, it.tags || []);
            return `
              <div class="fh-item-row ${analysis.quality}">
                <div class="fh-item-details">
                  <div class="fh-item-text">${analysis.text}</div>
                  <div class="fh-item-badge-strip">
                    <span class="fh-item-subtag">${analysis.badgeText} (${analysis.score} pts)</span>
                    ${analysis.flags.map(f => `<span class="fh-item-subtag" style="color:var(--accent);">#${f}</span>`).join(' ')}
                  </div>
                </div>
                <button type="button" class="fh-item-del" data-action="del-item" data-slot="${slotKey}" data-index="${idx}" title="Remove item">✕</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  _bindEvents() {
    // 1. Hydration Quick Glass Toggle
    this.container.querySelectorAll('.fh-glass-btn').forEach(btn => {
      btn.onclick = (e) => {
        const targetCount = parseInt(btn.getAttribute('data-glass-idx'), 10);
        this.setGlasses(targetCount);
      };
    });

    // 2. Hydration Buttons
    const addGlassBtn = this.container.querySelector('#fh-add-glass');
    if (addGlassBtn) addGlassBtn.onclick = () => this.addGlasses(1);

    const addBottleBtn = this.container.querySelector('#fh-add-bottle');
    if (addBottleBtn) addBottleBtn.onclick = () => this.addGlasses(1.5);

    const minusGlassBtn = this.container.querySelector('#fh-minus-glass');
    if (minusGlassBtn) minusGlassBtn.onclick = () => this.addGlasses(-1);

    // 3. Quick Tag Chips
    this.container.querySelectorAll('.fh-tag-chip').forEach(chip => {
      chip.onclick = () => {
        const slot = chip.getAttribute('data-slot');
        // Clean tag text removing emojis for cleaner text matching
        const chipText = chip.getAttribute('data-chip').replace(/^[^\w\s]+/, '').trim();
        this.addItemToSlot(slot, chipText);
      };
    });

    // 4. Add Item Button and Enter Key
    this.container.querySelectorAll('[data-action="add-item"]').forEach(btn => {
      btn.onclick = () => {
        const slot = btn.getAttribute('data-slot');
        const input = this.container.querySelector(`#input-${slot}`);
        if (input && input.value.trim()) {
          this.addItemToSlot(slot, input.value.trim());
          input.value = '';
        }
      };
    });

    ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(slot => {
      const input = this.container.querySelector(`#input-${slot}`);
      if (input) {
        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (input.value.trim()) {
              this.addItemToSlot(slot, input.value.trim());
              input.value = '';
            }
          }
        };
      }
    });

    // 5. Delete Item Buttons
    this.container.querySelectorAll('[data-action="del-item"]').forEach(btn => {
      btn.onclick = () => {
        const slot = btn.getAttribute('data-slot');
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.removeItemFromSlot(slot, idx);
      };
    });
  }

  setGlasses(count) {
    this.hydration.glasses = Math.max(0, count);
    this.hydration.timestamps = this.hydration.timestamps || [];
    this.hydration.timestamps.push({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), glasses: this.hydration.glasses });
    FoodHealthStorage.saveHydration(this.hydration, this.dateStr);
    this.render();
  }

  addGlasses(delta) {
    const cur = this.hydration.glasses || 0;
    this.setGlasses(Math.max(0, Math.round((cur + delta) * 10) / 10));
  }

  addItemToSlot(slot, text) {
    if (!this.meals[slot]) this.meals[slot] = [];
    const analysis = this.analyzer.analyzeItem(text);
    this.meals[slot].push({
      id: 'fh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      text: text,
      tags: analysis.flags,
      quality: analysis.quality,
      score: analysis.score,
      loggedAt: new Date().toISOString()
    });

    FoodHealthStorage.saveMeals(this.meals, this.dateStr);
    this.render();
  }

  removeItemFromSlot(slot, index) {
    if (this.meals[slot] && this.meals[slot][index] !== undefined) {
      this.meals[slot].splice(index, 1);
      FoodHealthStorage.saveMeals(this.meals, this.dateStr);
      this.render();
    }
  }
}

// Global browser window attachment
if (typeof window !== 'undefined') {
  window.FOOD_DATABASE = FOOD_DATABASE;
  window.MODIFIERS = MODIFIERS;
  window.SmartFoodQualityAnalyzer = SmartFoodQualityAnalyzer;
  window.InstantHealthFeedbackGenerator = InstantHealthFeedbackGenerator;
  window.DailyHealthScoreEngine = DailyHealthScoreEngine;
  window.HydrationTracker = HydrationTracker;
  window.FoodHealthStorage = FoodHealthStorage;
  window.FoodHealthUIComponent = FoodHealthUIComponent;
}
