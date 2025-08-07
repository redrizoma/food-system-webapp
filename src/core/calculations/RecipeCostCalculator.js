/**
 * Recipe Cost Calculator
 * Handles all recipe costing calculations including escandallo
 */

export class RecipeCostCalculator {
  constructor() {
    this.defaultSpiceFactor = 0.02; // 2%
    this.defaultQFactor = 0.03; // 3%
    this.defaultTargetFoodCost = 0.30; // 30%
  }

  /**
   * Calculate complete recipe cost with all factors
   * @param {Object} recipe - Recipe object with ingredients
   * @returns {Object} Complete cost breakdown
   */
  calculateRecipeCost(recipe) {
    if (!recipe || !recipe.ingredients) {
      throw new Error('Invalid recipe data');
    }

    const breakdown = [];
    let totalAPCost = 0;
    let totalEPCost = 0;
    let totalWasteCost = 0;

    // Process each ingredient
    recipe.ingredients.forEach(ingredient => {
      const apCost = ingredient.quantity * ingredient.unitPrice;
      const yieldPercentage = ingredient.yieldPercentage || 100;
      const epCost = (apCost * 100) / yieldPercentage;
      const wasteCost = epCost - apCost;

      totalAPCost += apCost;
      totalEPCost += epCost;
      totalWasteCost += wasteCost;

      breakdown.push({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitPrice: ingredient.unitPrice,
        apCost: apCost,
        yieldPercentage: yieldPercentage,
        epCost: epCost,
        wasteCost: wasteCost,
        percentageOfTotal: 0 // Will calculate after totals
      });
    });

    // Calculate adjustments
    const spiceFactor = recipe.spiceFactor || this.defaultSpiceFactor;
    const qFactor = recipe.qFactor || this.defaultQFactor;
    const spiceCost = totalEPCost * spiceFactor;
    const qCost = totalEPCost * qFactor;
    
    const totalCost = totalEPCost + spiceCost + qCost;
    const costPerPortion = totalCost / (recipe.portions || 1);
    
    // Calculate percentage of total for each ingredient
    breakdown.forEach(item => {
      item.percentageOfTotal = (item.epCost / totalEPCost) * 100;
    });

    // Calculate suggested menu price
    const targetFoodCost = recipe.targetFoodCost || this.defaultTargetFoodCost;
    const suggestedPrice = costPerPortion / (targetFoodCost / 100);

    return {
      recipeName: recipe.name,
      portions: recipe.portions || 1,
      breakdown: breakdown,
      totalAPCost: totalAPCost,
      totalEPCost: totalEPCost,
      totalWasteCost: totalWasteCost,
      spiceFactor: spiceFactor,
      spiceCost: spiceCost,
      qFactor: qFactor,
      qCost: qCost,
      totalCost: totalCost,
      costPerPortion: costPerPortion,
      suggestedPrice: suggestedPrice,
      targetFoodCost: targetFoodCost
    };
  }

  /**
   * Calculate yield percentage
   * @param {number} epWeight - Edible portion weight
   * @param {number} apWeight - As purchased weight
   * @returns {number} Yield percentage
   */
  calculateYieldPercentage(epWeight, apWeight) {
    if (apWeight <= 0) return 0;
    return (epWeight / apWeight) * 100;
  }

  /**
   * Calculate EP cost from AP cost and yield
   * @param {number} apCost - As purchased cost
   * @param {number} yieldPercentage - Yield percentage
   * @returns {number} Edible portion cost
   */
  calculateEPCost(apCost, yieldPercentage) {
    if (yieldPercentage <= 0) return 0;
    return (apCost * 100) / yieldPercentage;
  }

  /**
   * Calculate cost factor from yield percentage
   * @param {number} yieldPercentage - Yield percentage
   * @returns {number} Cost factor
   */
  calculateFactor(yieldPercentage) {
    if (yieldPercentage <= 0) return 0;
    return 100 / yieldPercentage;
  }

  /**
   * Process meat yield test
   * @param {Object} testData - Meat yield test data
   * @returns {Object} Processed yield test results
   */
  processMeatYieldTest(testData) {
    const { apWeight, apCost, parts } = testData;
    const pricePerUnit = apCost / apWeight;
    
    let totalUsableWeight = 0;
    let totalWasteWeight = 0;
    const processedParts = [];

    parts.forEach(part => {
      const percentage = (part.weight / apWeight) * 100;
      const value = part.weight * pricePerUnit;
      
      if (part.usable) {
        totalUsableWeight += part.weight;
      } else {
        totalWasteWeight += part.weight;
      }

      processedParts.push({
        name: part.name,
        weight: part.weight,
        percentage: percentage,
        value: value,
        usable: part.usable
      });
    });

    const yieldPercentage = (totalUsableWeight / apWeight) * 100;
    const wastePercentage = (totalWasteWeight / apWeight) * 100;
    const epCostPerUnit = apCost / totalUsableWeight;
    const costIncreaseFactor = epCostPerUnit / pricePerUnit;

    return {
      apWeight: apWeight,
      apCost: apCost,
      pricePerUnit: pricePerUnit,
      parts: processedParts,
      totalUsableWeight: totalUsableWeight,
      totalWasteWeight: totalWasteWeight,
      yieldPercentage: yieldPercentage,
      wastePercentage: wastePercentage,
      epCostPerUnit: epCostPerUnit,
      costIncreaseFactor: costIncreaseFactor
    };
  }

  /**
   * Scale recipe batch
   * @param {Object} recipe - Original recipe
   * @param {number} targetPortions - Target number of portions
   * @returns {Object} Scaled recipe
   */
  scaleBatch(recipe, targetPortions) {
    const scaleFactor = targetPortions / recipe.portions;
    
    const scaledIngredients = recipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * scaleFactor
    }));

    return {
      ...recipe,
      portions: targetPortions,
      ingredients: scaledIngredients,
      scaleFactor: scaleFactor
    };
  }

  /**
   * Calculate recipe profitability
   * @param {number} costPerPortion - Cost per portion
   * @param {number} sellingPrice - Menu selling price
   * @param {number} unitsSold - Units sold per period
   * @returns {Object} Profitability metrics
   */
  calculateRecipeProfitability(costPerPortion, sellingPrice, unitsSold) {
    const contributionMargin = sellingPrice - costPerPortion;
    const profitMargin = (contributionMargin / sellingPrice) * 100;
    const totalRevenue = sellingPrice * unitsSold;
    const totalCost = costPerPortion * unitsSold;
    const totalProfit = contributionMargin * unitsSold;

    return {
      costPerPortion: costPerPortion,
      sellingPrice: sellingPrice,
      contributionMargin: contributionMargin,
      profitMargin: profitMargin,
      unitsSold: unitsSold,
      totalRevenue: totalRevenue,
      totalCost: totalCost,
      totalProfit: totalProfit
    };
  }

  /**
   * Calculate food cost percentage
   * @param {number} cost - Recipe cost
   * @param {number} price - Selling price
   * @returns {number} Food cost percentage
   */
  calculateFoodCostPercentage(cost, price) {
    if (price <= 0) return 0;
    return (cost / price) * 100;
  }

  /**
   * Calculate menu price from target food cost
   * @param {number} cost - Recipe cost
   * @param {number} targetPercentage - Target food cost percentage
   * @returns {number} Suggested menu price
   */
  calculateMenuPrice(cost, targetPercentage) {
    if (targetPercentage <= 0) return 0;
    return cost / (targetPercentage / 100);
  }

  /**
   * Validate recipe cost data
   * @param {Object} recipe - Recipe to validate
   * @returns {Object} Validation result
   */
  validateRecipeCost(recipe) {
    const errors = [];
    const warnings = [];

    if (!recipe.name) {
      errors.push('Recipe name is required');
    }

    if (!recipe.portions || recipe.portions <= 0) {
      errors.push('Valid portion count is required');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    }

    recipe.ingredients?.forEach((ingredient, index) => {
      if (!ingredient.name) {
        errors.push(`Ingredient ${index + 1}: Name is required`);
      }
      if (!ingredient.quantity || ingredient.quantity <= 0) {
        errors.push(`Ingredient ${ingredient.name || index + 1}: Valid quantity is required`);
      }
      if (!ingredient.unitPrice || ingredient.unitPrice < 0) {
        errors.push(`Ingredient ${ingredient.name || index + 1}: Valid unit price is required`);
      }
      if (ingredient.yieldPercentage && (ingredient.yieldPercentage <= 0 || ingredient.yieldPercentage > 100)) {
        warnings.push(`Ingredient ${ingredient.name || index + 1}: Unusual yield percentage`);
      }
    });

    const targetFoodCost = recipe.targetFoodCost || 30;
    if (targetFoodCost < 20) {
      warnings.push('Very low target food cost - may be difficult to achieve');
    } else if (targetFoodCost > 40) {
      warnings.push('High target food cost - consider reducing for better profitability');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }
}