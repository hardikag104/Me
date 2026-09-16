/**
 * ===============================================================================
 * ME LIFE OS — FOOD & HEALTH COMPONENT ADAPTER
 * File: food-health.js
 * 
 * Backwards-compatibility adapter forwarding to ui-food.js
 * ===============================================================================
 */

// Load core engine into global scope if in browser
if (typeof window !== 'undefined' && !window.renderFoodTab) {
  const script = document.createElement('script');
  script.src = 'ui-food.js';
  document.head.appendChild(script);
}

const getRoot = () => typeof window !== 'undefined' ? window : globalThis;

export const FoodHealthUIComponent = getRoot().FoodHealthUIComponent;
export const FoodHealthStorage = getRoot().FoodHealthStorage;
export const DailyHealthScoreEngine = getRoot().DailyHealthScoreEngine;
export const SmartFoodQualityAnalyzer = getRoot().SmartFoodQualityAnalyzer;
export const renderFoodTab = getRoot().renderFoodTab;

export default {
  FoodHealthUIComponent,
  FoodHealthStorage,
  DailyHealthScoreEngine,
  SmartFoodQualityAnalyzer,
  renderFoodTab
};
