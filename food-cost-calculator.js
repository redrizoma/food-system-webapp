import Decimal from "decimal.js";

/**
 * Food Cost Calculator
 * Implements industry-standard food cost calculations
 * Based on research from TouchBistro, Lightspeed, and professional culinary standards
 */
export class FoodCostCalculator {
  constructor() {
    // Industry standard ranges
    this.IDEAL_FOOD_COST_RANGES = {
      fine_dining: { min: 0.3, max: 0.4 },
      casual_dining: { min: 0.28, max: 0.35 },
      quick_service: { min: 0.2, max: 0.3 },
      bakery: { min: 0.25, max: 0.35 },
    };
  }

  /**
   * Calculate Cost of Goods Sold (CoGS)
   * Formula: CoGS = (Beginning Inventory + Purchases) - Ending Inventory
   */
  calculateCoGS(beginningInventory, purchases, endingInventory) {
    const beginning = new Decimal(beginningInventory);
    const purch = new Decimal(purchases);
    const ending = new Decimal(endingInventory);

    return beginning.plus(purch).minus(ending).toNumber();
  }

  /**
   * Calculate Total Food Cost Percentage
   * Formula: (Total CoGS / Total Revenue) × 100
   */
  calculateTotalFoodCostPercentage(coGS, totalRevenue) {
    if (totalRevenue === 0) {
      throw new Error("Total revenue cannot be zero");
    }

    const cost = new Decimal(coGS);
    const revenue = new Decimal(totalRevenue);

    return cost.dividedBy(revenue).times(100).toNumber();
  }

  /**
   * Calculate Food Cost Per Serving
   * Formula: (Cost of Ingredients / Number of Servings)
   */
  calculateCostPerServing(ingredientsCost, numberOfServings) {
    if (numberOfServings === 0) {
      throw new Error("Number of servings cannot be zero");
    }

    const cost = new Decimal(ingredientsCost);
    const servings = new Decimal(numberOfServings);

    return cost.dividedBy(servings).toNumber();
  }

  /**
   * Calculate Food Cost Percentage Per Dish
   * Formula: (Cost per Serving / Menu Price) × 100
   */
  calculateDishFoodCostPercentage(costPerServing, menuPrice) {
    if (menuPrice === 0) {
      throw new Error("Menu price cannot be zero");
    }

    const cost = new Decimal(costPerServing);
    const price = new Decimal(menuPrice);

    return cost.dividedBy(price).times(100).toNumber();
  }

  /**
   * Calculate Ideal Menu Price
   * Formula: Cost per Serving / Target Food Cost Percentage
   */
  calculateIdealMenuPrice(costPerServing, targetFoodCostPercentage) {
    if (targetFoodCostPercentage === 0) {
      throw new Error("Target food cost percentage cannot be zero");
    }

    const cost = new Decimal(costPerServing);
    const target = new Decimal(targetFoodCostPercentage).dividedBy(100);

    return cost.dividedBy(target).toNumber();
  }

  /**
   * Calculate Markup Factor
   * Formula: 100 / Food Cost Percentage
   */
  calculateMarkupFactor(foodCostPercentage) {
    if (foodCostPercentage === 0) {
      throw new Error("Food cost percentage cannot be zero");
    }

    const percentage = new Decimal(foodCostPercentage);
    return new Decimal(100).dividedBy(percentage).toNumber();
  }

  /**
   * Calculate Contribution Margin
   * Formula: Menu Price - Food Cost
   */
  calculateContributionMargin(menuPrice, foodCost) {
    const price = new Decimal(menuPrice);
    const cost = new Decimal(foodCost);

    return price.minus(cost).toNumber();
  }

  /**
   * Calculate Gross Profit Margin
   * Formula: ((Revenue - CoGS) / Revenue) × 100
   */
  calculateGrossProfitMargin(revenue, coGS) {
    if (revenue === 0) {
      throw new Error("Revenue cannot be zero");
    }

    const rev = new Decimal(revenue);
    const cost = new Decimal(coGS);

    const profit = rev.minus(cost);
    return profit.dividedBy(rev).times(100).toNumber();
  }

  /**
   * Calculate Prime Cost
   * Formula: Food Cost + Labor Cost
   */
  calculatePrimeCost(foodCost, laborCost) {
    const food = new Decimal(foodCost);
    const labor = new Decimal(laborCost);

    return food.plus(labor).toNumber();
  }

  /**
   * Calculate Prime Cost Percentage
   * Formula: (Prime Cost / Total Sales) × 100
   */
  calculatePrimeCostPercentage(primeCost, totalSales) {
    if (totalSales === 0) {
      throw new Error("Total sales cannot be zero");
    }

    const prime = new Decimal(primeCost);
    const sales = new Decimal(totalSales);

    return prime.dividedBy(sales).times(100).toNumber();
  }

  /**
   * Analyze food cost performance
   */
  analyzeFoodCostPerformance(
    actualFoodCost,
    idealFoodCost,
    businessType = "casual_dining"
  ) {
    const actual = new Decimal(actualFoodCost);
    const ideal = new Decimal(idealFoodCost);
    const variance = actual.minus(ideal).toNumber();
    const variancePercentage = (variance / idealFoodCost) * 100;

    const range = this.IDEAL_FOOD_COST_RANGES[businessType];
    const isWithinRange =
      actualFoodCost >= range.min * 100 && actualFoodCost <= range.max * 100;

    return {
      actualFoodCost: actual.toNumber(),
      idealFoodCost: ideal.toNumber(),
      variance,
      variancePercentage,
      isWithinRange,
      recommendedRange: range,
      performance:
        variancePercentage <= 0
          ? "excellent"
          : variancePercentage <= 2
          ? "good"
          : variancePercentage <= 5
          ? "acceptable"
          : "needs improvement",
    };
  }

  /**
   * Calculate menu engineering metrics
   */
  calculateMenuEngineering(items) {
    const avgContributionMargin =
      items.reduce((sum, item) => sum + item.contributionMargin, 0) /
      items.length;

    const avgPopularity =
      items.reduce((sum, item) => sum + item.unitsSold, 0) / items.length;

    return items.map((item) => {
      const classification = this.classifyMenuItem(
        item.contributionMargin,
        item.unitsSold,
        avgContributionMargin,
        avgPopularity
      );

      return {
        ...item,
        classification,
        contributionMarginRatio:
          item.contributionMargin / avgContributionMargin,
        popularityRatio: item.unitsSold / avgPopularity,
      };
    });
  }

  /**
   * Classify menu item (Menu Engineering Matrix)
   */
  classifyMenuItem(contributionMargin, popularity, avgMargin, avgPopularity) {
    const highMargin = contributionMargin >= avgMargin;
    const highPopularity = popularity >= avgPopularity * 0.7; // 70% threshold

    if (highMargin && highPopularity) return "star";
    if (highMargin && !highPopularity) return "puzzle";
    if (!highMargin && highPopularity) return "plow_horse";
    return "dog";
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount, currency = "EUR") {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
  }
}
