/**
 * ===============================================================================
 * ME LIFE OS — FOOD & NUTRITION UI/UX ENGINE
 * File: ui-food.js
 * 
 * Completely self-contained, zero-dependency Food & Nutrition module:
 *  1. Hydration Tracker (Target: 8 glasses / 3L, interactive glasses 1..8, quick buttons, fluid progress bar)
 *  2. Meal Logger (Breakfast, Lunch, Dinner, Evening Snacks, tags, quick-add chips, trash/cross delete)
 *  3. Smart Instant Health Analysis (Junk vs Clean classifier, 0-100% score, biohacking feedback)
 *  4. Standalone & Embedded UI Component (renderFoodTab, persistent storage in me_food_logs & me_hydration_logs)
 * ===============================================================================
 */

(function(root) {
  'use strict';

  // =============================================================================
  // CONSTANTS & CLASSIFICATION LEXICON
  // =============================================================================
  const HYDRATION_TARGET_GLASSES = 8;
  const HYDRATION_TARGET_ML = 3000;
  const ML_PER_GLASS = 375;

  const STORAGE_KEY_MEALS = 'me_food_logs';
  const STORAGE_KEY_HYDRATION = 'me_hydration_logs';

  // Common student meal chips as requested
  const COMMON_STUDENT_CHIPS = [
    { label: 'Eggs & Toast', icon: '🍳', quality: 'clean', tags: ['Protein', 'Whole Grain'], score: 90 },
    { label: 'Dal Roti & Sabzi', icon: '🍲', quality: 'clean', tags: ['Clean Fuel', 'High Fiber'], score: 92 },
    { label: 'Oatmeal & Milk', icon: '🥣', quality: 'clean', tags: ['Clean Fuel', 'Slow Carbs'], score: 94 },
    { label: 'Fresh Fruits', icon: '🍎', quality: 'clean', tags: ['Micronutrients', 'Vitamins'], score: 98 },
    { label: 'Dry Fruits', icon: '🥜', quality: 'clean', tags: ['Healthy Fats', 'Brain Fuel'], score: 95 },
    { label: 'Salad', icon: '🥗', quality: 'clean', tags: ['Micronutrients', 'Hydrating'], score: 99 },
    { label: 'Burger / Pizza (Junk)', icon: '🍔', quality: 'junk', tags: ['Ultra-Processed', 'High Sodium'], score: 25 },
    { label: 'Maggi / Noodles', icon: '🍜', quality: 'junk', tags: ['Ultra-Processed', 'Refined Carbs'], score: 30 },
    { label: 'Samosa / Fried', icon: '🥟', quality: 'junk', tags: ['Heavy Oil', 'Trans Fats'], score: 20 },
    { label: 'Cold Drink / Soda', icon: '🥤', quality: 'junk', tags: ['High Sugar', 'Empty Calories'], score: 10 }
  ];

  // Specific chips tailored for each meal slot
  const SLOT_QUICK_CHIPS = {
    breakfast: [
      'Eggs & Toast', 'Oatmeal & Milk', 'Fresh Fruits', 'Dry Fruits', 'Maggi / Noodles'
    ],
    lunch: [
      'Dal Roti & Sabzi', 'Salad', 'Burger / Pizza (Junk)', 'Fresh Fruits', 'Cold Drink / Soda'
    ],
    snacks: [
      'Dry Fruits', 'Fresh Fruits', 'Samosa / Fried', 'Cold Drink / Soda', 'Maggi / Noodles'
    ],
    dinner: [
      'Dal Roti & Sabzi', 'Salad', 'Eggs & Toast', 'Burger / Pizza (Junk)', 'Maggi / Noodles'
    ]
  };

  // Lexicon for smart quality analysis
  const FOOD_LEXICON = {
    clean: {
      items: [
        'egg', 'eggs', 'egg whites', 'boiled egg', 'omelet', 'omelette',
        'toast', 'whole wheat', 'multigrain', 'bread', 'oats', 'oatmeal',
        'dal', 'roti', 'sabzi', 'phulka', 'chapati', 'paneer', 'tofu',
        'curd', 'dahi', 'yogurt', 'greek yogurt', 'milk', 'soya', 'sprouts',
        'chana', 'rajma', 'chole', 'lentil', 'lentils', 'beans', 'chicken',
        'grilled chicken', 'fish', 'salmon', 'tuna', 'salad', 'cucumber',
        'tomato', 'spinach', 'palak', 'broccoli', 'carrot', 'beetroot',
        'vegetable', 'veggie', 'steamed', 'fruit', 'fruits', 'apple',
        'banana', 'papaya', 'watermelon', 'berries', 'orange', 'pomegranate',
        'guava', 'dry fruits', 'almond', 'almonds', 'walnut', 'walnuts',
        'cashew', 'chia', 'flax', 'pumpkin seeds', 'green tea', 'coconut water'
      ],
      tags: ['Clean Fuel', 'Micronutrients', 'High Protein']
    },
    junk: {
      items: [
        'burger', 'pizza', 'junk', 'fries', 'french fries', 'samosa',
        'fried', 'pakora', 'pakoda', 'kachori', 'bhature', 'chole bhature',
        'puri', 'maggi', 'noodles', 'ramen', 'chowmein', 'cold drink',
        'soda', 'coke', 'pepsi', 'fanta', 'sprite', 'mountain dew', 'sting',
        'energy drink', 'chips', 'nachos', 'kurkure', 'lays', 'bhujia',
        'namkeen', 'cake', 'pastry', 'donut', 'cookie', 'biscuit', 'oreo',
        'chocolate', 'candy', 'ice cream', 'mithai', 'gulab jamun', 'jalebi',
        'sweets', 'sweet', 'processed', 'momos (fried)', 'deep fried', 'oily', 'excess oil'
      ],
      tags: ['Ultra-Processed', 'Heavy Oil', 'High Sugar']
    },
    neutral: {
      items: [
        'rice', 'white rice', 'khichdi', 'poha', 'upma', 'idli', 'dosa',
        'sandwich', 'paratha', 'butter', 'tea', 'chai', 'coffee', 'cheese'
      ],
      tags: ['Staple Carbs', 'Moderate Energy']
    }
  };

  // =============================================================================
  // STORAGE MANAGER ('me_food_logs', 'me_hydration_logs')
  // =============================================================================
  function getLocalDateStr(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const FoodHealthStorage = {
    getTodayStr() {
      return getLocalDateStr();
    },

    // Load full meals object from localStorage ('me_food_logs')
    loadAllMeals() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_MEALS);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.warn('[FoodStorage] Error reading me_food_logs:', e);
        return {};
      }
    },

    saveAllMeals(allMeals) {
      try {
        localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(allMeals));
      } catch (e) {
        console.warn('[FoodStorage] Error writing me_food_logs:', e);
      }
    },

    // Load meals for a specific date
    loadMeals(dateStr = getLocalDateStr()) {
      const all = this.loadAllMeals();
      if (all[dateStr]) {
        return all[dateStr];
      }
      // Check legacy format fallback (e.g., 'me_2026-09-17_meals')
      try {
        const legacy = localStorage.getItem(`me_${dateStr}_meals`) || localStorage.getItem(`lt_${dateStr}_meals`);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          all[dateStr] = parsed;
          this.saveAllMeals(all);
          return parsed;
        }
      } catch {}

      return {
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
      };
    },

    // Save meals for a specific date
    saveMeals(mealsForDate, dateStr = getLocalDateStr()) {
      const all = this.loadAllMeals();
      all[dateStr] = mealsForDate;
      this.saveAllMeals(all);

      // Keep legacy key synced for backwards compatibility
      try {
        localStorage.setItem(`me_${dateStr}_meals`, JSON.stringify(mealsForDate));
      } catch {}
    },

    // Load all hydration logs ('me_hydration_logs')
    loadAllHydration() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_HYDRATION);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        console.warn('[FoodStorage] Error reading me_hydration_logs:', e);
        return {};
      }
    },

    saveAllHydration(allHydro) {
      try {
        localStorage.setItem(STORAGE_KEY_HYDRATION, JSON.stringify(allHydro));
      } catch (e) {
        console.warn('[FoodStorage] Error writing me_hydration_logs:', e);
      }
    },

    // Load hydration for a specific date
    loadHydration(dateStr = getLocalDateStr()) {
      const all = this.loadAllHydration();
      if (all[dateStr]) {
        return all[dateStr];
      }
      // Legacy fallback
      try {
        const legacy = localStorage.getItem(`me_${dateStr}_hydration`) || localStorage.getItem(`lt_${dateStr}_hydration`);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          all[dateStr] = parsed;
          this.saveAllHydration(all);
          return parsed;
        }
      } catch {}

      return {
        glasses: 0,
        ml: 0,
        targetGlasses: HYDRATION_TARGET_GLASSES,
        targetMl: HYDRATION_TARGET_ML,
        history: []
      };
    },

    // Save hydration for a specific date
    saveHydration(hydroData, dateStr = getLocalDateStr()) {
      const all = this.loadAllHydration();
      all[dateStr] = hydroData;
      this.saveAllHydration(all);

      // Sync legacy key for backwards compatibility
      try {
        localStorage.setItem(`me_${dateStr}_hydration`, JSON.stringify(hydroData));
      } catch {}
    }
  };

  // =============================================================================
  // SMART FOOD QUALITY ANALYZER
  // =============================================================================
  const SmartFoodQualityAnalyzer = {
    analyzeItem(text = '') {
      const clean = text.trim();
      if (!clean) {
        return {
          text: '',
          quality: 'neutral',
          score: 50,
          tags: ['Empty'],
          summary: 'No item'
        };
      }

      // Check predefined chips first for 100% exact match
      const chipMatch = COMMON_STUDENT_CHIPS.find(c => 
        c.label.toLowerCase() === clean.toLowerCase()
      );
      if (chipMatch) {
        return {
          text: clean,
          quality: chipMatch.quality,
          score: chipMatch.score,
          tags: [...chipMatch.tags],
          summary: chipMatch.quality === 'clean' ? 'Nutrient-Dense Fuel' : 'Ultra-Processed Junk'
        };
      }

      const lower = clean.toLowerCase();
      let isJunk = false;
      let isClean = false;
      const detectedTags = new Set();

      // Check junk lexicon
      function hasWord(str, term) {
        if (term.includes(' ') || term.includes('/') || term.includes('(')) {
          return str.includes(term);
        }
        return new RegExp('\\b' + term + '\\b', 'i').test(str);
      }

      // Check junk lexicon
      for (const j of FOOD_LEXICON.junk.items) {
        if (hasWord(lower, j)) {
          isJunk = true;
          if (j.includes('oil') || j.includes('fried') || j.includes('samosa') || j.includes('pakora')) {
            detectedTags.add('Heavy Oil');
          }
          if (j.includes('soda') || j.includes('sweet') || j.includes('sugar') || j.includes('cake') || j.includes('chocolate')) {
            detectedTags.add('High Sugar');
          }
          if (j.includes('burger') || j.includes('pizza') || j.includes('maggi') || j.includes('chips')) {
            detectedTags.add('Ultra-Processed');
          }
          break;
        }
      }

      // Check clean lexicon
      for (const c of FOOD_LEXICON.clean.items) {
        if (hasWord(lower, c)) {
          isClean = true;
          if (c.includes('egg') || c.includes('chicken') || c.includes('paneer') || c.includes('tofu') || c.includes('dal') || c.includes('fish')) {
            detectedTags.add('High Protein');
          }
          if (c.includes('salad') || c.includes('fruit') || c.includes('spinach') || c.includes('veggie')) {
            detectedTags.add('Micronutrients');
          }
          if (c.includes('oats') || c.includes('wheat') || c.includes('sprouts')) {
            detectedTags.add('High Fiber');
          }
          if (c.includes('almond') || c.includes('walnut') || c.includes('seeds')) {
            detectedTags.add('Healthy Fats');
          }
        }
      }

      // Modifier evaluation
      if (lower.includes('fried') || lower.includes('deep-fried') || lower.includes('greasy')) {
        isJunk = true;
        detectedTags.add('Heavy Oil');
      }
      if (lower.includes('steamed') || lower.includes('boiled') || lower.includes('sugar-free') || lower.includes('fresh')) {
        isClean = true;
        detectedTags.add('Clean Fuel');
      }

      let quality = 'neutral';
      let score = 55;

      if (isJunk && !isClean) {
        quality = 'junk';
        score = 25;
        if (detectedTags.size === 0) detectedTags.add('Ultra-Processed');
      } else if (isClean && !isJunk) {
        quality = 'clean';
        score = 90;
        if (detectedTags.size === 0) detectedTags.add('Clean Fuel');
      } else if (isJunk && isClean) {
        quality = 'junk'; // Conservative safety rating: junk ingredients dominate
        score = 40;
        detectedTags.add('Mixed Quality');
      } else {
        quality = 'neutral';
        score = 65;
        detectedTags.add('Home Staple');
      }

      return {
        text: clean,
        quality,
        score,
        tags: Array.from(detectedTags),
        summary: quality === 'clean' ? 'Clean Whole Food' : (quality === 'junk' ? 'High Processed / Sugar' : 'Neutral Staple')
      };
    }
  };

  // =============================================================================
  // HEALTH SCORE & BIOHACKING ADVICE ENGINE
  // =============================================================================
  const DailyHealthScoreEngine = {
    calculate({ meals = {}, hydrationGlasses = 0 }) {
      const allItems = Object.values(meals).flat();
      const cleanItems = allItems.filter(i => i.quality === 'clean');
      const junkItems = allItems.filter(i => i.quality === 'junk');
      const neutralItems = allItems.filter(i => i.quality === 'neutral');

      // 1. Hydration Component (up to 35 pts)
      const hydroFrac = Math.min(1, Math.max(0, hydrationGlasses / HYDRATION_TARGET_GLASSES));
      const hydroScore = Math.round(hydroFrac * 35);

      // 2. Food Quality Component (up to 50 pts)
      let foodScore = 20; // baseline if empty
      if (allItems.length > 0) {
        const cleanCount = cleanItems.length;
        const junkCount = junkItems.length;
        const neutralCount = neutralItems.length;

        // Base 25 + bonuses - penalties
        foodScore = 25 + (cleanCount * 8) + (neutralCount * 3) - (junkCount * 14);
        foodScore = Math.max(0, Math.min(50, foodScore));
      }

      // 3. Regularity / Slot Coverage Component (up to 15 pts)
      const filledSlots = ['breakfast', 'lunch', 'snacks', 'dinner'].filter(s => meals[s] && meals[s].length > 0).length;
      const regularityScore = Math.min(15, filledSlots * 4);

      const totalScore = Math.min(100, Math.max(0, hydroScore + foodScore + regularityScore));

      // Tier & Color
      let tier = 'Spartan Clean Fuel';
      let color = '#10b981';
      let badgeClass = 'tier-emerald';

      if (totalScore >= 80) {
        tier = '🌟 Spartan Fuel';
        color = '#10b981';
        badgeClass = 'tier-emerald';
      } else if (totalScore >= 60) {
        tier = '⚡ Steady Fuel';
        color = '#06b6d4';
        badgeClass = 'tier-cyan';
      } else if (totalScore >= 40) {
        tier = '⚠️ Sub-Optimal';
        color = '#f59e0b';
        badgeClass = 'tier-amber';
      } else {
        tier = '🚨 High Inflammation';
        color = '#ef4444';
        badgeClass = 'tier-rose';
      }

      // Honest Biohacking Feedback
      const feedback = this.generateBiohackingFeedback({
        totalScore,
        cleanCount: cleanItems.length,
        junkCount: junkItems.length,
        hydrationGlasses,
        allItems
      });

      return {
        score: totalScore,
        tier,
        color,
        badgeClass,
        hydroScore,
        foodScore,
        regularityScore,
        totalItems: allItems.length,
        cleanCount: cleanItems.length,
        junkCount: junkItems.length,
        neutralCount: neutralItems.length,
        hydrationGlasses,
        feedback
      };
    },

    generateBiohackingFeedback({ totalScore, cleanCount, junkCount, hydrationGlasses, allItems }) {
      if (allItems.length === 0 && hydrationGlasses === 0) {
        return {
          headline: '⏳ Awaiting Daily Fuel Input',
          subtext: 'Log your meals and tap glasses of water to compute your metabolic health score.',
          type: 'neutral'
        };
      }

      // High junk detected (Samosa, soda, maggi, burger, etc.)
      if (junkCount >= 1) {
        return {
          headline: '🚨 High oil & sugar detected! Drink extra water',
          subtext: 'Processed oils & refined glucose cause gut inflammation and cognitive crashes. Flush with 2 extra glasses of water & take a 15-min walk to blunt insulin spikes.',
          type: 'alert'
        };
      }

      // Clean fuel & high hydration
      if (cleanCount >= 2 && hydrationGlasses >= 4) {
        return {
          headline: '🌟 Clean fuel! High micronutrients & steady energy',
          subtext: 'Supercharged cellular ATP production. Zero glycemic crashes, optimal acetylcholine for long study blocks.',
          type: 'success'
        };
      }

      // Clean fuel but lagging hydration
      if (cleanCount >= 1 && hydrationGlasses < 4) {
        return {
          headline: '💧 Clean food, but cellular hydration is lagging!',
          subtext: 'Your meals are clean, but blood viscosity is elevated. Drink 2 full glasses right now to maximize nutrient uptake and mental focus.',
          type: 'warning'
        };
      }

      // Only hydration logged
      if (allItems.length === 0 && hydrationGlasses >= 4) {
        return {
          headline: '💧 Solid hydration underway!',
          subtext: 'Keep water flowing. Next step: anchor your focus with a protein & fiber rich whole meal.',
          type: 'info'
        };
      }

      // Balanced/neutral
      return {
        headline: '⚖️ Baseline nutrition maintained',
        subtext: 'Good discipline. Add more raw greens, fruits, or dry nuts to optimize micronutrient bioavailability.',
        type: 'neutral'
      };
    }
  };

  // =============================================================================
  // EMBEDDED CSS STYLES (Modern Dark Cyberpunk Glassmorphism)
  // =============================================================================
  function injectFoodStyles() {
    if (document.getElementById('me-food-styles')) return;

    const css = `
      /* --- Food & Nutrition Container Scoped CSS --- */
      .food-tab-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-bottom: 24px;
        color: #f3f4f8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      /* Card Glass Container */
      .food-card {
        background: #111118;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        position: relative;
        overflow: hidden;
      }
      .food-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
      }

      /* Top Header Card: Score & Honest Feedback */
      .score-hero-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px;
        align-items: center;
      }
      .score-dial-wrap {
        width: 86px;
        height: 86px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .score-dial-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .score-dial-track {
        fill: none;
        stroke: rgba(255, 255, 255, 0.08);
        stroke-width: 8;
      }
      .score-dial-fill {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s;
      }
      .score-dial-val {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .score-dial-val .num {
        font-size: 1.4rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .score-dial-val .label {
        font-size: 0.62rem;
        color: #8888a4;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-top: 2px;
      }

      .score-info-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .score-info-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
      }
      .score-title {
        font-size: 1.05rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .score-tier-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 9999px;
        letter-spacing: 0.03em;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .tier-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
      .tier-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); }
      .tier-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
      .tier-rose { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

      /* Biohacking Feedback Banner */
      .biohack-banner {
        margin-top: 12px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
        transition: all 0.3s;
      }
      .biohack-banner.alert {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.3);
        box-shadow: 0 0 16px rgba(239, 68, 68, 0.1);
      }
      .biohack-banner.success {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.3);
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.1);
      }
      .biohack-banner.warning {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.3);
      }
      .biohack-headline {
        font-size: 0.88rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .biohack-banner.alert .biohack-headline { color: #fca5a5; }
      .biohack-banner.success .biohack-headline { color: #6ee7b7; }
      .biohack-banner.warning .biohack-headline { color: #fcd34d; }
      .biohack-subtext {
        font-size: 0.78rem;
        color: #a1a1aa;
        line-height: 1.4;
      }

      /* Macro Quick Counters */
      .macro-counters-row {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
      }
      .macro-pill {
        flex: 1;
        min-width: 80px;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .macro-pill .val {
        font-size: 0.95rem;
        font-weight: 800;
      }
      .macro-pill .lbl {
        font-size: 0.66rem;
        color: #8888a4;
        text-transform: uppercase;
        font-weight: 600;
      }
      .macro-pill.clean .val { color: #10b981; }
      .macro-pill.junk .val { color: #ef4444; }
      .macro-pill.water .val { color: #38bdf8; }

      /* =========================================================================
         HYDRATION TRACKER STYLES
         ========================================================================= */
      .hydro-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .hydro-title {
        font-size: 1rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .hydro-stats-badge {
        font-size: 0.82rem;
        font-weight: 700;
        color: #38bdf8;
        background: rgba(14, 165, 233, 0.12);
        border: 1px solid rgba(14, 165, 233, 0.25);
        padding: 4px 10px;
        border-radius: 9999px;
      }

      /* Visual Fluid Progress Bar */
      .hydro-bar-wrap {
        margin-bottom: 16px;
      }
      .hydro-bar-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        color: #9494a8;
        margin-bottom: 6px;
        font-weight: 600;
      }
      .hydro-bar-track {
        height: 14px;
        background: rgba(14, 165, 233, 0.1);
        border: 1px solid rgba(14, 165, 233, 0.2);
        border-radius: 9999px;
        overflow: hidden;
        position: relative;
      }
      .hydro-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%);
        box-shadow: 0 0 12px rgba(14, 165, 233, 0.5);
        border-radius: 9999px;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      .hydro-bar-fill::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: hydroWave 2.5s infinite linear;
      }
      @keyframes hydroWave {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* 8 Glasses Tumbler Grid */
      .hydro-glasses-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 6px;
        margin-bottom: 14px;
      }
      @media (max-width: 440px) {
        .hydro-glasses-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
      }
      .glass-btn {
        background: rgba(14, 165, 233, 0.05);
        border: 1.5px dashed rgba(14, 165, 233, 0.25);
        border-radius: 6px 6px 12px 12px;
        padding: 8px 4px 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        user-select: none;
        position: relative;
        min-height: 52px;
      }
      .glass-btn:hover {
        background: rgba(14, 165, 233, 0.12);
        border-color: rgba(14, 165, 233, 0.4);
        transform: translateY(-2px);
      }
      .glass-btn:active {
        transform: scale(0.94);
      }
      .glass-btn.filled {
        background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
        border: 1.5px solid #38bdf8;
        box-shadow: 0 0 10px rgba(14, 165, 233, 0.4);
      }
      .glass-icon {
        font-size: 1.15rem;
        line-height: 1;
        transition: transform 0.2s;
      }
      .glass-btn.filled .glass-icon {
        transform: scale(1.1);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }
      .glass-num {
        font-size: 0.65rem;
        font-weight: 800;
        margin-top: 3px;
        color: #8888a4;
      }
      .glass-btn.filled .glass-num {
        color: #ffffff;
      }

      /* Quick Action Buttons */
      .hydro-actions-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .hydro-btn {
        flex: 1;
        min-width: 90px;
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .hydro-btn:active {
        transform: scale(0.96);
      }
      .hydro-btn-sub {
        background: rgba(255, 255, 255, 0.06);
        color: #e4e4ef;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .hydro-btn-sub:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .hydro-btn-add {
        background: rgba(14, 165, 233, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(14, 165, 233, 0.35);
      }
      .hydro-btn-add:hover {
        background: rgba(14, 165, 233, 0.25);
        box-shadow: 0 0 12px rgba(14, 165, 233, 0.25);
      }
      .hydro-btn-bottle {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(124, 92, 252, 0.2));
        color: #bae6fd;
        border: 1px solid rgba(14, 165, 233, 0.4);
      }
      .hydro-btn-bottle:hover {
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(124, 92, 252, 0.3));
        box-shadow: 0 0 14px rgba(14, 165, 233, 0.3);
      }
      .hydro-btn-reset {
        padding: 8px 10px;
        background: transparent;
        color: #71717a;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        font-size: 0.78rem;
        cursor: pointer;
        flex: 0 0 auto;
      }
      .hydro-btn-reset:hover {
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
      }

      /* =========================================================================
         MEAL LOGGER STYLES
         ========================================================================= */
      .meal-slots-wrap {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .meal-slot-card {
        background: #111118;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 14px;
        transition: border-color 0.2s;
      }
      .meal-slot-card:focus-within {
        border-color: rgba(124, 92, 252, 0.35);
      }
      .slot-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .slot-title {
        font-size: 0.95rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .slot-count-badge {
        font-size: 0.72rem;
        color: #9494a8;
        background: rgba(255, 255, 255, 0.05);
        padding: 2px 8px;
        border-radius: 9999px;
        font-weight: 600;
      }

      /* Logged Food Items List */
      .logged-items-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }
      .logged-item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        gap: 8px;
      }
      .logged-item-row.clean-border { border-left: 3px solid #10b981; }
      .logged-item-row.junk-border { border-left: 3px solid #ef4444; }
      .logged-item-row.neutral-border { border-left: 3px solid #9494a8; }

      .logged-item-main {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        flex: 1;
      }
      .item-name {
        font-size: 0.88rem;
        font-weight: 600;
        color: #f3f4f8;
      }
      .item-quality-pill {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .item-quality-pill.clean { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      .item-quality-pill.junk { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
      .item-quality-pill.neutral { background: rgba(255, 255, 255, 0.08); color: #9494a8; }

      .item-tags-wrap {
        display: inline-flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .item-tag {
        font-size: 0.65rem;
        color: #a1a1aa;
        background: rgba(255, 255, 255, 0.04);
        padding: 1px 6px;
        border-radius: 4px;
      }

      .btn-del-item {
        background: transparent;
        border: none;
        color: #71717a;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        transition: all 0.2s;
      }
      .btn-del-item:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.12);
        transform: scale(1.1);
      }

      /* Quick-Add Chips Strip */
      .chips-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .chips-strip {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .quick-chip {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 9999px;
        padding: 4px 9px;
        font-size: 0.74rem;
        color: #d4d4d8;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s;
        user-select: none;
      }
      .quick-chip:hover {
        background: rgba(124, 92, 252, 0.15);
        border-color: rgba(124, 92, 252, 0.35);
        color: #ffffff;
        transform: translateY(-1px);
      }
      .quick-chip:active {
        transform: scale(0.95);
      }
      .quick-chip.is-junk:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.35);
      }

      /* Input + Add Button Row */
      .slot-input-row {
        display: flex;
        gap: 6px;
      }
      .slot-text-input {
        flex: 1;
        background: #09090d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 0.84rem;
        color: #f3f4f8;
        outline: none;
        transition: border-color 0.2s;
      }
      .slot-text-input:focus {
        border-color: #7c5cfc;
        box-shadow: 0 0 0 2px rgba(124, 92, 252, 0.2);
      }
      .slot-text-input::placeholder {
        color: #52525b;
      }
      .slot-add-btn {
        background: #7c5cfc;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s;
      }
      .slot-add-btn:hover {
        background: #6d48fa;
        box-shadow: 0 0 12px rgba(124, 92, 252, 0.35);
      }
      .slot-add-btn:active {
        transform: scale(0.96);
      }

      /* Empty State in Slot */
      .slot-empty-notice {
        font-size: 0.76rem;
        color: #52525b;
        font-style: italic;
        padding: 6px 0 8px;
      }

      /* Bottom Utility Controls */
      .food-footer-tools {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 4px;
        padding: 0 4px;
      }
      .footer-tool-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #8888a4;
        font-size: 0.74rem;
        padding: 6px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .footer-tool-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #f3f4f8;
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'me-food-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // =============================================================================
  // UI CONTROLLER & RENDERER
  // =============================================================================
  class FoodUIController {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.getElementById(container) : container;
      this.dateStr = options.dateStr || FoodHealthStorage.getTodayStr();
      this.loadData();
    }

    loadData() {
      this.meals = FoodHealthStorage.loadMeals(this.dateStr);
      this.hydration = FoodHealthStorage.loadHydration(this.dateStr);
    }

    saveAll() {
      FoodHealthStorage.saveMeals(this.meals, this.dateStr);
      FoodHealthStorage.saveHydration(this.hydration, this.dateStr);
    }

    // Hydration Actions
    setGlasses(count) {
      const g = Math.max(0, Math.min(12, count));
      this.hydration.glasses = g;
      this.hydration.ml = Math.round(g * ML_PER_GLASS);
      this.saveAll();
      this.render();
    }

    addGlasses(delta) {
      const cur = this.hydration.glasses || 0;
      this.setGlasses(Math.max(0, cur + delta));
    }

    addBottle500ml() {
      const curMl = this.hydration.ml !== undefined ? this.hydration.ml : Math.round((this.hydration.glasses || 0) * ML_PER_GLASS);
      const newMl = curMl + 500;
      this.hydration.ml = newMl;
      this.hydration.glasses = Math.round((newMl / ML_PER_GLASS) * 10) / 10;
      this.saveAll();
      this.render();
    }

    toggleGlassIndex(index) {
      // index is 1..8
      const current = Math.round(this.hydration.glasses || 0);
      if (current === index) {
        // Tapping currently filled glass toggles back one
        this.setGlasses(index - 1);
      } else {
        this.setGlasses(index);
      }
    }

    resetHydration() {
      this.hydration.glasses = 0;
      this.hydration.ml = 0;
      this.saveAll();
      this.render();
    }

    // Meal Actions
    addMealItem(slot, rawText) {
      if (!rawText || !rawText.trim()) return;
      if (!this.meals[slot]) this.meals[slot] = [];

      const analysis = SmartFoodQualityAnalyzer.analyzeItem(rawText.trim());
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      this.meals[slot].push({
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        text: rawText.trim(),
        quality: analysis.quality,
        score: analysis.score,
        tags: analysis.tags,
        time: timeStr
      });

      this.saveAll();
      this.render();
    }

    removeMealItem(slot, index) {
      if (this.meals[slot] && this.meals[slot][index] !== undefined) {
        this.meals[slot].splice(index, 1);
        this.saveAll();
        this.render();
      }
    }

    // Quick demo loader for testing/instant student fill
    loadStudentDemo() {
      this.hydration.glasses = 6;
      this.hydration.ml = 6 * ML_PER_GLASS;
      this.meals = {
        breakfast: [
          { id: 'd_1', text: 'Eggs & Toast', quality: 'clean', score: 90, tags: ['Protein', 'Whole Grain'], time: '08:15 AM' },
          { id: 'd_2', text: 'Oatmeal & Milk', quality: 'clean', score: 94, tags: ['Clean Fuel', 'Slow Carbs'], time: '08:25 AM' }
        ],
        lunch: [
          { id: 'd_3', text: 'Dal Roti & Sabzi', quality: 'clean', score: 92, tags: ['Clean Fuel', 'High Fiber'], time: '01:30 PM' },
          { id: 'd_4', text: 'Salad', quality: 'clean', score: 99, tags: ['Micronutrients', 'Hydrating'], time: '01:40 PM' }
        ],
        snacks: [
          { id: 'd_5', text: 'Dry Fruits', quality: 'clean', score: 95, tags: ['Healthy Fats', 'Brain Fuel'], time: '05:15 PM' }
        ],
        dinner: [
          { id: 'd_6', text: 'Dal Roti & Sabzi', quality: 'clean', score: 92, tags: ['Clean Fuel', 'High Fiber'], time: '08:45 PM' }
        ]
      };
      this.saveAll();
      this.render();
    }

    clearToday() {
      if (!confirm('Clear all food logs and hydration for this day?')) return;
      this.hydration = { glasses: 0, ml: 0, targetGlasses: HYDRATION_TARGET_GLASSES, targetMl: HYDRATION_TARGET_ML, history: [] };
      this.meals = { breakfast: [], lunch: [], snacks: [], dinner: [] };
      this.saveAll();
      this.render();
    }

    // Main Render Routine
    render() {
      if (!this.container) return;
      injectFoodStyles();

      const hydroGlasses = this.hydration.glasses || 0;
      const hydroMl = this.hydration.ml !== undefined ? this.hydration.ml : Math.round(hydroGlasses * ML_PER_GLASS);
      const hydroPercent = Math.min(100, Math.round((hydroMl / HYDRATION_TARGET_ML) * 100));

      // Calculate health score & biohacking feedback
      const scoreResult = DailyHealthScoreEngine.calculate({
        meals: this.meals,
        hydrationGlasses: hydroGlasses
      });

      // SVG Dial calculations
      const radius = 35;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (scoreResult.score / 100) * circumference;

      // Render 8 Glass Tumblers HTML
      let glassesHtml = '';
      for (let i = 1; i <= 8; i++) {
        const isFilled = hydroGlasses >= i;
        glassesHtml += `
          <button class="glass-btn ${isFilled ? 'filled' : ''}" data-glass-idx="${i}" title="Tap glass ${i} (${i * ML_PER_GLASS}ml)">
            <span class="glass-icon">${isFilled ? '🥛' : '🥤'}</span>
            <span class="glass-num">${i}</span>
          </button>
        `;
      }

      // Render Meal Slots HTML
      const slotConfigs = [
        { key: 'breakfast', title: 'Breakfast', icon: '🍳' },
        { key: 'lunch', title: 'Lunch', icon: '🥗' },
        { key: 'snacks', title: 'Evening Snacks', icon: '🍵' },
        { key: 'dinner', title: 'Dinner', icon: '🍲' }
      ];

      let mealSlotsHtml = '';
      slotConfigs.forEach(slot => {
        const items = this.meals[slot.key] || [];
        const quickChips = SLOT_QUICK_CHIPS[slot.key] || [];

        let itemsHtml = '';
        if (items.length === 0) {
          itemsHtml = `<div class="slot-empty-notice">No items logged yet. Quick add below or type custom food.</div>`;
        } else {
          itemsHtml = '<div class="logged-items-list">';
          items.forEach((item, idx) => {
            const borderClass = item.quality === 'clean' ? 'clean-border' : (item.quality === 'junk' ? 'junk-border' : 'neutral-border');
            const qualityLabel = item.quality === 'clean' ? '✓ Clean' : (item.quality === 'junk' ? '⚠️ Junk' : 'Staple');

            let tagsHtml = '';
            if (item.tags && item.tags.length > 0) {
              tagsHtml = `<span class="item-tags-wrap">${item.tags.map(t => `<span class="item-tag">#${t}</span>`).join('')}</span>`;
            }

            itemsHtml += `
              <div class="logged-item-row ${borderClass}">
                <div class="logged-item-main">
                  <span class="item-name">${escapeHtml(item.text)}</span>
                  <span class="item-quality-pill ${item.quality}">${qualityLabel}</span>
                  ${tagsHtml}
                </div>
                <button class="btn-del-item" data-action="delete-item" data-slot="${slot.key}" data-index="${idx}" title="Remove item">
                  ✕
                </button>
              </div>
            `;
          });
          itemsHtml += '</div>';
        }

        // Quick chips HTML for this slot
        let chipsHtml = quickChips.map(chipName => {
          const chipMeta = COMMON_STUDENT_CHIPS.find(c => c.label === chipName) || { icon: '🍽️', quality: 'neutral' };
          const junkClass = chipMeta.quality === 'junk' ? 'is-junk' : '';
          return `
            <button class="quick-chip ${junkClass}" data-action="add-chip" data-slot="${slot.key}" data-item="${escapeHtml(chipName)}">
              <span>${chipMeta.icon}</span>
              <span>${escapeHtml(chipName)}</span>
            </button>
          `;
        }).join('');

        mealSlotsHtml += `
          <div class="meal-slot-card">
            <div class="slot-header">
              <div class="slot-title">
                <span>${slot.icon}</span>
                <span>${slot.title}</span>
              </div>
              <span class="slot-count-badge">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
            </div>

            ${itemsHtml}

            <div class="chips-label">⚡ Common Student Meals:</div>
            <div class="chips-strip">
              ${chipsHtml}
            </div>

            <div class="slot-input-row">
              <input type="text" class="slot-text-input" data-slot="${slot.key}" placeholder="Type custom food (e.g., Paneer, Samosa, Oats)..." />
              <button class="slot-add-btn" data-action="add-input" data-slot="${slot.key}">
                + Add
              </button>
            </div>
          </div>
        `;
      });

      // Assemble Full DOM
      this.container.innerHTML = `
        <div class="food-tab-wrapper">
          
          <!-- 1. HEALTH SCORE & BIOHACKING ADVICE CARD -->
          <div class="food-card">
            <div class="score-hero-grid">
              
              <!-- Circular Dial Gauge -->
              <div class="score-dial-wrap">
                <svg class="score-dial-svg" viewBox="0 0 86 86">
                  <circle class="score-dial-track" cx="43" cy="43" r="${radius}" />
                  <circle class="score-dial-fill" cx="43" cy="43" r="${radius}"
                    stroke="${scoreResult.color}"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${strokeDashoffset}" />
                </svg>
                <div class="score-dial-val">
                  <span class="num" style="color:${scoreResult.color}">${scoreResult.score}%</span>
                  <span class="label">Health</span>
                </div>
              </div>

              <!-- Score Summary & Category -->
              <div class="score-info-col">
                <div class="score-info-top">
                  <span class="score-title">🍎 Nutrition Intelligence</span>
                  <span class="score-tier-badge ${scoreResult.badgeClass}">${scoreResult.tier}</span>
                </div>

                <!-- Biohacking Feedback Box -->
                <div class="biohack-banner ${scoreResult.feedback.type}">
                  <div class="biohack-headline">${scoreResult.feedback.headline}</div>
                  <div class="biohack-subtext">${scoreResult.feedback.subtext}</div>
                </div>
              </div>

            </div>

            <!-- Macro & Intake Breakdown Pills -->
            <div class="macro-counters-row">
              <div class="macro-pill clean">
                <span class="val">${scoreResult.cleanCount}</span>
                <span class="lbl">🥦 Clean Items</span>
              </div>
              <div class="macro-pill junk">
                <span class="val">${scoreResult.junkCount}</span>
                <span class="lbl">🍟 Junk Items</span>
              </div>
              <div class="macro-pill water">
                <span class="val">${hydroGlasses} / 8</span>
                <span class="lbl">💧 Water Glasses</span>
              </div>
            </div>
          </div>

          <!-- 2. CELLULAR HYDRATION TRACKER CARD -->
          <div class="food-card">
            <div class="hydro-header">
              <div class="hydro-title">
                <span>💧</span>
                <span>Cellular Hydration Tracker</span>
              </div>
              <div class="hydro-stats-badge">
                ${hydroMl} ml / ${HYDRATION_TARGET_ML} ml (${hydroPercent}%)
              </div>
            </div>

            <!-- Visual Fluid Progress Bar -->
            <div class="hydro-bar-wrap">
              <div class="hydro-bar-label">
                <span>Fluid Progress</span>
                <span>Target: 8 Glasses (3.0 Liters)</span>
              </div>
              <div class="hydro-bar-track">
                <div class="hydro-bar-fill" style="width: ${hydroPercent}%"></div>
              </div>
            </div>

            <!-- Interactive 8 Tumbler Glass Icons -->
            <div class="hydro-glasses-grid">
              ${glassesHtml}
            </div>

            <!-- Quick Action Buttons -->
            <div class="hydro-actions-row">
              <button class="hydro-btn hydro-btn-sub" data-action="hydro-minus">
                - 1 Glass
              </button>
              <button class="hydro-btn hydro-btn-add" data-action="hydro-plus">
                + 1 Glass
              </button>
              <button class="hydro-btn hydro-btn-bottle" data-action="hydro-bottle">
                🍼 +500ml Bottle
              </button>
              <button class="hydro-btn hydro-btn-reset" data-action="hydro-reset" title="Reset Water">
                ↺ Reset
              </button>
            </div>
          </div>

          <!-- 3. MEAL LOGGER (BREAKFAST, LUNCH, DINNER, EVENING SNACKS) -->
          <div class="meal-slots-wrap">
            ${mealSlotsHtml}
          </div>

          <!-- 4. BOTTOM UTILITY TOOLS -->
          <div class="food-footer-tools">
            <button class="footer-tool-btn" data-action="load-demo">
              ⚡ Fill Student Demo Data
            </button>
            <button class="footer-tool-btn" data-action="clear-today">
              🗑️ Clear Today's Log
            </button>
          </div>

        </div>
      `;

      // Attach all event listeners
      this.attachEventListeners();
    }

    attachEventListeners() {
      // 1. Glass tap toggles
      this.container.querySelectorAll('.glass-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.getAttribute('data-glass-idx'), 10);
          if (!isNaN(idx)) this.toggleGlassIndex(idx);
        });
      });

      // 2. Hydration quick action buttons
      this.container.querySelector('[data-action="hydro-minus"]')?.addEventListener('click', () => {
        this.addGlasses(-1);
      });
      this.container.querySelector('[data-action="hydro-plus"]')?.addEventListener('click', () => {
        this.addGlasses(1);
      });
      this.container.querySelector('[data-action="hydro-bottle"]')?.addEventListener('click', () => {
        this.addBottle500ml();
      });
      this.container.querySelector('[data-action="hydro-reset"]')?.addEventListener('click', () => {
        this.resetHydration();
      });

      // 3. Quick Chips
      this.container.querySelectorAll('[data-action="add-chip"]').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const slot = chip.getAttribute('data-slot');
          const item = chip.getAttribute('data-item');
          if (slot && item) {
            this.addMealItem(slot, item);
          }
        });
      });

      // 4. Delete item buttons
      this.container.querySelectorAll('[data-action="delete-item"]').forEach(delBtn => {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const slot = delBtn.getAttribute('data-slot');
          const idx = parseInt(delBtn.getAttribute('data-index'), 10);
          if (slot && !isNaN(idx)) {
            this.removeMealItem(slot, idx);
          }
        });
      });

      // 5. Text input + Add button
      this.container.querySelectorAll('.slot-input-row').forEach(row => {
        const input = row.querySelector('.slot-text-input');
        const addBtn = row.querySelector('.slot-add-btn');
        const slot = addBtn?.getAttribute('data-slot');

        const doAdd = () => {
          if (input && slot && input.value.trim()) {
            this.addMealItem(slot, input.value.trim());
            input.value = '';
          }
        };

        addBtn?.addEventListener('click', (e) => {
          e.preventDefault();
          doAdd();
        });

        input?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doAdd();
          }
        });
      });

      // 6. Utility actions (demo, clear)
      this.container.querySelector('[data-action="load-demo"]')?.addEventListener('click', () => {
        this.loadStudentDemo();
      });
      this.container.querySelector('[data-action="clear-today"]')?.addEventListener('click', () => {
        this.clearToday();
      });
    }
  }

  // Helper escape function
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =============================================================================
  // MAIN STANDALONE EXPORT: renderFoodTab(containerId)
  // =============================================================================
  function renderFoodTab(containerId) {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) {
      console.warn('[FoodTab] Target container not found:', containerId);
      return null;
    }
    const controller = new FoodUIController(container);
    controller.render();
    return controller;
  }

  // Backwards-compatible class wrapper
  class FoodHealthUIComponent {
    constructor(containerId = 'foodHealthContainer', options = {}) {
      this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
      this.options = options;
      this.controller = null;
    }
    init() {
      if (!this.container) return;
      this.controller = new FoodUIController(this.container, this.options);
      this.controller.render();
      return this;
    }
    render() {
      if (!this.controller && this.container) {
        this.controller = new FoodUIController(this.container, this.options);
      }
      if (this.controller) {
        this.controller.loadData();
        this.controller.render();
      }
    }
    getScoreCalculation() {
      const today = FoodHealthStorage.getTodayStr();
      const meals = FoodHealthStorage.loadMeals(today);
      const hydration = FoodHealthStorage.loadHydration(today);
      return DailyHealthScoreEngine.calculate({
        meals,
        hydrationGlasses: hydration.glasses || 0
      });
    }
  }

  // Attach all to global window object
  root.renderFoodTab = renderFoodTab;
  root.FoodHealthUIComponent = FoodHealthUIComponent;
  root.FoodHealthStorage = FoodHealthStorage;
  root.DailyHealthScoreEngine = DailyHealthScoreEngine;
  root.SmartFoodQualityAnalyzer = SmartFoodQualityAnalyzer;

  // Also support CommonJS / ES module environments if imported
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      renderFoodTab,
      FoodHealthUIComponent,
      FoodHealthStorage,
      DailyHealthScoreEngine,
      SmartFoodQualityAnalyzer
    };
  }

})(typeof window !== 'undefined' ? window : globalThis);
