/**
 * Food Cost Calculator
 * Handles food cost analysis and menu engineering calculations
 */

export class FoodCostCalculator {
  constructor() {
    this.targetRanges = {
      fine_dining: { min: 30, max: 40 },
      casual_dining: { min: 28, max: 35 },
      quick_service: { min: 20, max: 30 },
      bakery: { min: 25, max: 35 }
    };
  }

  /**
   * Calculate Cost of Goods Sold (CoGS)
   * @param {number} beginningInventory - Beginning inventory value
   * @param {number} purchases - Purchases during period
   * @param {number} endingInventory - Ending inventory value
   * @returns {number} Cost of goods sold
   */
  calculateCoGS(beginningInventory, purchases, endingInventory) {
    return beginningInventory + purchases - endingInventory;
  }

  /**
   * Calculate food cost percentage
   * @param {number} foodCost - Total food cost
   * @param {number} revenue - Total revenue
   * @returns {number} Food cost percentage
   */
  calculateTotalFoodCostPercentage(foodCost, revenue) {
    if (revenue <= 0) return 0;
    return (foodCost / revenue) * 100;
  }

  /**
   * Calculate gross profit margin
   * @param {number} revenue - Total revenue
   * @param {number} cogs - Cost of goods sold
   * @returns {number} Gross profit margin percentage
   */
  calculateGrossProfitMargin(revenue, cogs) {
    if (revenue <= 0) return 0;
    const grossProfit = revenue - cogs;
    return (grossProfit / revenue) * 100;
  }

  /**
   * Calculate prime cost
   * @param {number} foodCost - Total food cost
   * @param {number} laborCost - Total labor cost
   * @returns {number} Prime cost
   */
  calculatePrimeCost(foodCost, laborCost) {
    return foodCost + laborCost;
  }

  /**
   * Calculate prime cost percentage
   * @param {number} primeCost - Prime cost
   * @param {number} revenue - Total revenue
   * @returns {number} Prime cost percentage
   */
  calculatePrimeCostPercentage(primeCost, revenue) {
    if (revenue <= 0) return 0;
    return (primeCost / revenue) * 100;
  }

  /**
   * Menu engineering analysis
   * @param {Array} menuItems - Array of menu items with sales data
   * @returns {Array} Menu items with classification
   */
  calculateMenuEngineering(menuItems) {
    if (!menuItems || menuItems.length === 0) return [];

    // Calculate metrics for each item
    const itemsWithMetrics = menuItems.map(item => ({
      ...item,
      contributionMargin: item.price - item.cost,
      totalContribution: (item.price - item.cost) * item.soldQty,
      foodCostPercent: (item.cost / item.price) * 100
    }));

    // Calculate averages
    const avgContribution = itemsWithMetrics.reduce((sum, item) => 
      sum + item.contributionMargin, 0) / itemsWithMetrics.length;
    
    const totalSold = itemsWithMetrics.reduce((sum, item) => 
      sum + item.soldQty, 0);
    
    const avgPopularity = totalSold / itemsWithMetrics.length;

    // Classify items
    return itemsWithMetrics.map(item => {
      const contributionMarginRatio = item.contributionMargin / avgContribution;
      const popularityRatio = item.soldQty / avgPopularity;
      
      let classification;
      if (contributionMarginRatio >= 1 && popularityRatio >= 0.7) {
        classification = 'star';
      } else if (contributionMarginRatio >= 1 && popularityRatio < 0.7) {
        classification = 'puzzle';
      } else if (contributionMarginRatio < 1 && popularityRatio >= 0.7) {
        classification = 'plow_horse';
      } else {
        classification = 'dog';
      }

      return {
        ...item,
        contributionMarginRatio,
        popularityRatio,
        classification
      };
    });
  }

  /**
   * Calculate theoretical food cost
   * @param {Array} recipes - Array of recipes with portions sold
   * @returns {Object} Theoretical food cost analysis
   */
  calculateTheoreticalFoodCost(recipes) {
    let totalTheoreticalCost = 0;
    let totalRevenue = 0;

    recipes.forEach(recipe => {
      const recipeCost = recipe.costPerPortion * recipe.portionsSold;
      const recipeRevenue = recipe.sellingPrice * recipe.portionsSold;
      
      totalTheoreticalCost += recipeCost;
      totalRevenue += recipeRevenue;
    });

    const theoreticalFoodCostPercent = (totalTheoreticalCost / totalRevenue) * 100;

    return {
      totalTheoreticalCost,
      totalRevenue,
      theoreticalFoodCostPercent
    };
  }

  /**
   * Calculate variance between actual and theoretical food cost
   * @param {number} actualCost - Actual food cost
   * @param {number} theoreticalCost - Theoretical food cost
   * @returns {Object} Variance analysis
   */
  calculateVariance(actualCost, theoreticalCost) {
    const variance = actualCost - theoreticalCost;
    const variancePercent = (variance / theoreticalCost) * 100;

    return {
      variance,
      variancePercent,
      analysis: variancePercent > 5 ? 'High variance - investigate waste/theft' :
                variancePercent > 2 ? 'Moderate variance - review portions' :
                'Variance within acceptable range'
    };
  }

  /**
   * Calculate item popularity index
   * @param {number} itemSold - Units of item sold
   * @param {number} totalSold - Total units sold (all items)
   * @param {number} itemCount - Total number of menu items
   * @returns {number} Popularity index (1.0 = average)
   */
  calculatePopularityIndex(itemSold, totalSold, itemCount) {
    const avgSold = totalSold / itemCount;
    if (avgSold === 0) return 0;
    return itemSold / avgSold;
  }

  /**
   * Calculate contribution margin ratio
   * @param {number} sellingPrice - Item selling price
   * @param {number} variableCost - Item variable cost
   * @returns {number} Contribution margin ratio
   */
  calculateContributionMarginRatio(sellingPrice, variableCost) {
    if (sellingPrice <= 0) return 0;
    return ((sellingPrice - variableCost) / sellingPrice) * 100;
  }

  /**
   * Calculate break-even point
   * @param {number} fixedCosts - Total fixed costs
   * @param {number} contributionMargin - Contribution margin per unit
   * @returns {number} Break-even point in units
   */
  calculateBreakEvenPoint(fixedCosts, contributionMargin) {
    if (contributionMargin <= 0) return Infinity;
    return Math.ceil(fixedCosts / contributionMargin);
  }

  /**
   * Validate food cost percentage
   * @param {number} percentage - Food cost percentage
   * @param {string} businessType - Type of business
   * @returns {Object} Validation result with recommendations
   */
  validateFoodCostPercentage(percentage, businessType = 'casual_dining') {
    const range = this.targetRanges[businessType] || this.targetRanges.casual_dining;
    
    let status, recommendations = [];
    
    if (percentage < range.min) {
      status = 'below_target';
      recommendations = [
        'Consider improving ingredient quality',
        'Review portion sizes for adequacy',
        'Ensure pricing reflects value'
      ];
    } else if (percentage > range.max) {
      status = 'above_target';
      recommendations = [
        'Review supplier contracts',
        'Implement portion control',
        'Consider menu price adjustments',
        'Focus on high-margin items',
        'Reduce waste'
      ];
    } else {
      status = 'on_target';
      recommendations = ['Maintain current standards'];
    }

    return {
      percentage,
      range,
      status,
      recommendations
    };
  }

  /**
   * Calculate inventory turnover ratio
   * @param {number} cogs - Cost of goods sold (annual)
   * @param {number} avgInventory - Average inventory value
   * @returns {number} Inventory turnover ratio
   */
  calculateInventoryTurnover(cogs, avgInventory) {
    if (avgInventory <= 0) return 0;
    return cogs / avgInventory;
  }

  /**
   * Calculate days inventory outstanding
   * @param {number} avgInventory - Average inventory value
   * @param {number} dailyCogs - Daily cost of goods sold
   * @returns {number} Days inventory outstanding
   */
  calculateDaysInventoryOutstanding(avgInventory, dailyCogs) {
    if (dailyCogs <= 0) return 0;
    return avgInventory / dailyCogs;
  }
}

// Export as default for compatibility
export default FoodCostCalculator;