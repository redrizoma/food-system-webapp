/**
 * Baker's Percentage Calculator
 * Handles bakery-specific calculations and formulas
 */

export class BakersPercentageCalculator {
  constructor() {
    this.flourTypes = ['flour', 'bread flour', 'all-purpose flour', 'whole wheat flour', 'rye flour', 'spelt flour'];
    this.liquidTypes = ['water', 'milk', 'liquid'];
    this.hydrationRanges = {
      bagel: { min: 50, max: 57 },
      standard_bread: { min: 58, max: 65 },
      ciabatta: { min: 70, max: 80 },
      focaccia: { min: 75, max: 85 }
    };
  }

  /**
   * Convert recipe to baker's percentages
   * @param {Object} recipe - Recipe with ingredients
   * @returns {Object} Recipe in baker's percentages
   */
  convertToBakersPercentages(recipe) {
    const ingredients = recipe.ingredients || [];
    let totalFlourWeight = 0;

    // Calculate total flour weight
    ingredients.forEach(ingredient => {
      if (this.isFlour(ingredient)) {
        totalFlourWeight += ingredient.weight;
      }
    });

    if (totalFlourWeight === 0) {
      throw new Error('Recipe must contain flour');
    }

    // Calculate percentages
    const formula = ingredients.map(ingredient => ({
      name: ingredient.name,
      type: ingredient.type,
      weight: ingredient.weight,
      percentage: (ingredient.weight / totalFlourWeight) * 100,
      isFlour: this.isFlour(ingredient)
    }));

    // Calculate hydration
    const waterWeight = this.calculateTotalLiquid(ingredients);
    const hydration = (waterWeight / totalFlourWeight) * 100;

    // Calculate total percentage
    const totalPercentage = formula.reduce((sum, item) => sum + item.percentage, 0);

    return {
      name: recipe.name,
      formula: formula,
      totalFlourWeight: totalFlourWeight,
      totalPercentage: totalPercentage,
      hydration: hydration
    };
  }

  /**
   * Check if ingredient is flour
   * @param {Object} ingredient - Ingredient object
   * @returns {boolean} True if flour
   */
  isFlour(ingredient) {
    const name = ingredient.name?.toLowerCase() || '';
    const type = ingredient.type?.toLowerCase() || '';
    return type === 'flour' || this.flourTypes.some(flour => name.includes(flour));
  }

  /**
   * Calculate total liquid in recipe
   * @param {Array} ingredients - Array of ingredients
   * @returns {number} Total liquid weight
   */
  calculateTotalLiquid(ingredients) {
    return ingredients.reduce((total, ingredient) => {
      const type = ingredient.type?.toLowerCase() || '';
      const name = ingredient.name?.toLowerCase() || '';
      if (type === 'liquid' || this.liquidTypes.some(liquid => name.includes(liquid))) {
        return total + ingredient.weight;
      }
      return total;
    }, 0);
  }

  /**
   * Scale recipe by target flour weight
   * @param {Object} formula - Baker's percentage formula
   * @param {number} targetFlourWeight - Target flour weight in grams
   * @returns {Object} Scaled recipe
   */
  scaleRecipe(formula, targetFlourWeight) {
    const scaleFactor = targetFlourWeight / formula.totalFlourWeight;
    
    const scaledIngredients = formula.formula.map(item => ({
      name: item.name,
      percentage: item.percentage,
      weight: (item.percentage / 100) * targetFlourWeight
    }));

    const totalDoughWeight = scaledIngredients.reduce((sum, item) => sum + item.weight, 0);

    return {
      name: formula.name,
      ingredients: scaledIngredients,
      targetFlourWeight: targetFlourWeight,
      totalDoughWeight: totalDoughWeight,
      scaleFactor: scaleFactor,
      hydration: formula.hydration
    };
  }

  /**
   * Calculate hydration percentage
   * @param {number} waterWeight - Water weight in grams
   * @param {number} flourWeight - Flour weight in grams
   * @returns {number} Hydration percentage
   */
  calculateHydration(waterWeight, flourWeight) {
    if (flourWeight <= 0) return 0;
    return (waterWeight / flourWeight) * 100;
  }

  /**
   * Calculate flour weight from dough weight and total percentage
   * @param {number} doughWeight - Total dough weight
   * @param {number} totalPercentage - Total baker's percentage
   * @returns {number} Flour weight needed
   */
  calculateFlourWeight(doughWeight, totalPercentage) {
    if (totalPercentage <= 0) return 0;
    return doughWeight / (totalPercentage / 100);
  }

  /**
   * Calculate dough weight from pieces
   * @param {number} pieceWeight - Weight per piece
   * @param {number} pieces - Number of pieces
   * @param {number} lossFactor - Loss factor percentage (default 2%)
   * @returns {number} Total dough weight needed
   */
  calculateDoughWeight(pieceWeight, pieces, lossFactor = 2) {
    const rawWeight = pieceWeight * pieces;
    return rawWeight * (1 + lossFactor / 100);
  }

  /**
   * Validate baker's formula
   * @param {Object} formula - Baker's percentage formula
   * @returns {Object} Validation result
   */
  validateFormula(formula) {
    const errors = [];
    const warnings = [];

    // Check for flour
    const hasFlour = formula.formula.some(item => item.isFlour);
    if (!hasFlour) {
      errors.push('Formula must contain at least one flour');
    }

    // Check hydration
    if (formula.hydration < 40) {
      errors.push('Hydration too low - dough will be impossible to work');
    } else if (formula.hydration < 50) {
      warnings.push('Very low hydration - suitable only for crackers or pasta');
    } else if (formula.hydration > 100) {
      warnings.push('Very high hydration - requires advanced technique');
    }

    // Check for salt
    const salt = formula.formula.find(item => 
      item.name.toLowerCase().includes('salt') || item.type === 'salt'
    );
    if (!salt) {
      warnings.push('No salt found - unusual for most breads');
    } else if (salt.percentage < 1.5) {
      warnings.push('Low salt percentage - may affect flavor and gluten development');
    } else if (salt.percentage > 3) {
      warnings.push('High salt percentage - may inhibit fermentation');
    }

    // Check for yeast/starter
    const yeast = formula.formula.find(item => 
      item.type === 'yeast' || 
      item.name.toLowerCase().includes('yeast') ||
      item.name.toLowerCase().includes('starter')
    );
    if (!yeast && formula.name?.toLowerCase().includes('bread')) {
      warnings.push('No yeast or starter found - check if intentional');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Calculate preferment percentages
   * @param {Object} preferment - Preferment data
   * @param {number} totalFlour - Total flour in recipe
   * @returns {Object} Preferment calculations
   */
  processPreferment(preferment, totalFlour) {
    const flourPercentage = (preferment.flourWeight / totalFlour) * 100;
    const hydration = (preferment.waterWeight / preferment.flourWeight) * 100;
    const totalWeight = preferment.flourWeight + preferment.waterWeight;

    return {
      type: preferment.type,
      flourWeight: preferment.flourWeight,
      waterWeight: preferment.waterWeight,
      totalWeight: totalWeight,
      hydration: hydration,
      flourPercentage: flourPercentage,
      fermentationTime: preferment.fermentationTime || '12-16 hours',
      temperature: preferment.temperature || '21-24°C'
    };
  }

  /**
   * Calculate sourdough starter feeding
   * @param {number} currentStarter - Current starter amount
   * @param {string} ratio - Feeding ratio (e.g., "1:1:1")
   * @returns {Object} Feeding calculations
   */
  calculateStarterFeeding(currentStarter, ratio) {
    const parts = ratio.split(':').map(Number);
    const [starterPart, flourPart, waterPart] = parts;
    
    const keepStarter = currentStarter;
    const addFlour = keepStarter * (flourPart / starterPart);
    const addWater = keepStarter * (waterPart / starterPart);
    const totalStarter = keepStarter + addFlour + addWater;
    const hydration = 100; // Assuming 100% hydration starter

    const peakTime = flourPart <= 2 ? '4-6 hours' : 
                     flourPart <= 5 ? '6-8 hours' : 
                     '8-12 hours';

    return {
      keepStarter,
      addFlour,
      addWater,
      totalStarter,
      hydration,
      peakTime,
      schedule: {
        daily: {
          morning: 'Feed 1:1:1 at room temperature',
          evening: 'Feed 1:1:1 if baking tomorrow'
        },
        weekly: {
          refresh: 'Feed 1:5:5, let peak, then refrigerate'
        }
      }
    };
  }

  /**
   * Calculate batch requirements for production
   * @param {Object} formula - Baker's formula
   * @param {number} pieces - Number of pieces needed
   * @param {number} pieceWeight - Weight per piece in grams
   * @returns {Object} Batch calculations
   */
  calculateBatch(formula, pieces, pieceWeight) {
    const totalDoughNeeded = this.calculateDoughWeight(pieceWeight, pieces);
    const flourNeeded = this.calculateFlourWeight(totalDoughNeeded, formula.totalPercentage);
    
    const ingredients = formula.formula.map(item => ({
      name: item.name,
      percentage: item.percentage,
      weight: (item.percentage / 100) * flourNeeded
    }));

    return {
      pieces: pieces,
      pieceWeight: pieceWeight,
      totalDoughNeeded: totalDoughNeeded,
      flourNeeded: flourNeeded,
      ingredients: ingredients,
      batches: Math.ceil(totalDoughNeeded / 5000) // Assuming 5kg mixer capacity
    };
  }

  /**
   * Generate production schedule
   * @param {string} method - Production method
   * @returns {Array} Production schedule steps
   */
  generateProductionSchedule(method) {
    const schedules = {
      straight_dough: [
        { step: 'Mix ingredients', time: 10, temperature: 24 },
        { step: 'Knead', time: 10, temperature: 24 },
        { step: 'Bulk fermentation', time: 120, temperature: 24 },
        { step: 'Divide & pre-shape', time: 20, temperature: 24 },
        { step: 'Bench rest', time: 20, temperature: 24 },
        { step: 'Final shape', time: 10, temperature: 24 },
        { step: 'Final proof', time: 60, temperature: 24 },
        { step: 'Bake', time: 35, temperature: 230 }
      ],
      preferment: [
        { step: 'Mix preferment', time: 5, temperature: 24 },
        { step: 'Preferment fermentation', time: 720, temperature: 21 },
        { step: 'Mix final dough', time: 10, temperature: 24 },
        { step: 'Autolyse', time: 30, temperature: 24 },
        { step: 'Add salt & knead', time: 10, temperature: 24 },
        { step: 'Bulk fermentation', time: 180, temperature: 24 },
        { step: 'Divide & pre-shape', time: 20, temperature: 24 },
        { step: 'Bench rest', time: 20, temperature: 24 },
        { step: 'Final shape', time: 10, temperature: 24 },
        { step: 'Final proof', time: 90, temperature: 24 },
        { step: 'Bake', time: 35, temperature: 230 }
      ]
    };

    return schedules[method] || schedules.straight_dough;
  }
}