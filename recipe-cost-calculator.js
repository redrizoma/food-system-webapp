import Decimal from "decimal.js";

/**
 * Recipe Cost Calculator with Escandallo Support
 * Implements professional recipe costing with yield management
 */
export class RecipeCostCalculator {
  constructor() {
    this.DEFAULT_SPICE_FACTOR = 0.02; // 2% default
    this.DEFAULT_Q_FACTOR = 0.03; // 3% for accompaniments
  }

  /**
   * Calculate As Purchased (AP) Cost
   */
  calculateAPCost(quantity, unitPrice) {
    const qty = new Decimal(quantity);
    const price = new Decimal(unitPrice);
    return qty.times(price).toNumber();
  }

  /**
   * Calculate Yield Percentage
   * Formula: (EP Weight / AP Weight) × 100
   */
  calculateYieldPercentage(epWeight, apWeight) {
    if (apWeight === 0) {
      throw new Error("AP weight cannot be zero");
    }

    const ep = new Decimal(epWeight);
    const ap = new Decimal(apWeight);

    return ep.dividedBy(ap).times(100).toNumber();
  }

  /**
   * Calculate Edible Portion (EP) Cost
   * Formula: (AP Cost × 100) / Yield Percentage
   */
  calculateEPCost(apCost, yieldPercentage) {
    if (yieldPercentage === 0) {
      throw new Error("Yield percentage cannot be zero");
    }

    const ap = new Decimal(apCost);
    const yieldPct = new Decimal(yieldPercentage);

    return ap.times(100).dividedBy(yieldPct).toNumber();
  }

  /**
   * Calculate Waste Cost
   * Formula: EP Cost - AP Cost
   */
  calculateWasteCost(epCost, apCost) {
    const ep = new Decimal(epCost);
    const ap = new Decimal(apCost);

    return ep.minus(ap).toNumber();
  }

  /**
   * Calculate Factor (for yield conversions)
   * Formula: 100 / Yield Percentage
   */
  calculateFactor(yieldPercentage) {
    if (yieldPercentage === 0) {
      throw new Error("Yield percentage cannot be zero");
    }

    const yieldPct = new Decimal(yieldPercentage);
    return new Decimal(100).dividedBy(yieldPct).toNumber();
  }

  /**
   * Calculate Complete Recipe Cost (Escandallo)
   */
  calculateRecipeCost(recipe) {
    let totalCost = new Decimal(0);
    const breakdown = [];

    // Process each ingredient
    for (const ingredient of recipe.ingredients) {
      const apCost = this.calculateAPCost(
        ingredient.quantity,
        ingredient.unitPrice
      );

      let epCost = apCost;
      let wasteCost = 0;

      // Apply yield if specified
      if (ingredient.yieldPercentage && ingredient.yieldPercentage < 100) {
        epCost = this.calculateEPCost(apCost, ingredient.yieldPercentage);
        wasteCost = this.calculateWasteCost(epCost, apCost);
      }

      totalCost = totalCost.plus(epCost);

      breakdown.push({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitPrice: ingredient.unitPrice,
        apCost,
        yieldPercentage: ingredient.yieldPercentage || 100,
        epCost,
        wasteCost,
        percentageOfTotal: 0, // Will be calculated after total
      });
    }

    // Apply spice factor
    const spiceFactor = recipe.spiceFactor || this.DEFAULT_SPICE_FACTOR;
    const spiceCost = totalCost.times(spiceFactor).toNumber();
    totalCost = totalCost.plus(spiceCost);

    // Apply Q factor (accompaniments, garnishes, etc.)
    const qFactor = recipe.qFactor || this.DEFAULT_Q_FACTOR;
    const qCost = totalCost.times(qFactor).toNumber();
    totalCost = totalCost.plus(qCost);

    // Calculate percentages
    const finalTotal = totalCost.toNumber();
    breakdown.forEach((item) => {
      item.percentageOfTotal = (item.epCost / finalTotal) * 100;
    });

    // Calculate per portion costs
    const costPerPortion = finalTotal / recipe.portions;

    return {
      recipeName: recipe.name,
      portions: recipe.portions,
      breakdown,
      spiceFactor,
      spiceCost,
      qFactor,
      qCost,
      totalCost: finalTotal,
      costPerPortion,
      suggestedPrice: this.calculateSuggestedPrice(
        costPerPortion,
        recipe.targetFoodCost || 30
      ),
    };
  }

  /**
   * Calculate suggested menu price based on target food cost
   */
  calculateSuggestedPrice(costPerPortion, targetFoodCostPercentage) {
    const cost = new Decimal(costPerPortion);
    const target = new Decimal(targetFoodCostPercentage).dividedBy(100);

    return cost.dividedBy(target).toNumber();
  }

  /**
   * Calculate cooking loss
   */
  calculateCookingLoss(rawWeight, cookedWeight) {
    if (rawWeight === 0) {
      throw new Error("Raw weight cannot be zero");
    }

    const raw = new Decimal(rawWeight);
    const cooked = new Decimal(cookedWeight);
    const loss = raw.minus(cooked);

    return {
      weightLoss: loss.toNumber(),
      percentageLoss: loss.dividedBy(raw).times(100).toNumber(),
    };
  }

  /**
   * Calculate moisture loss percentage
   */
  calculateMoistureLoss(initialWeight, finalWeight) {
    if (initialWeight === 0) {
      throw new Error("Initial weight cannot be zero");
    }

    const initial = new Decimal(initialWeight);
    const final = new Decimal(finalWeight);

    return initial.minus(final).dividedBy(initial).times(100).toNumber();
  }

  /**
   * Process meat/protein yield test
   */
  processMeatYieldTest(test) {
    const apWeight = new Decimal(test.apWeight);
    const apCost = new Decimal(test.apCost);
    const pricePerUnit = apCost.dividedBy(apWeight);

    const results = [];
    let totalUsableWeight = new Decimal(0);
    let totalWasteWeight = new Decimal(0);

    // Process each part
    for (const part of test.parts) {
      const weight = new Decimal(part.weight);
      const percentage = weight.dividedBy(apWeight).times(100);
      const value = weight.times(pricePerUnit);

      if (part.usable) {
        totalUsableWeight = totalUsableWeight.plus(weight);
      } else {
        totalWasteWeight = totalWasteWeight.plus(weight);
      }

      results.push({
        name: part.name,
        weight: weight.toNumber(),
        percentage: percentage.toNumber(),
        value: value.toNumber(),
        usable: part.usable,
      });
    }

    const yieldPercentage = totalUsableWeight.dividedBy(apWeight).times(100);
    const wastePercentage = totalWasteWeight.dividedBy(apWeight).times(100);
    const epCostPerUnit = apCost.dividedBy(totalUsableWeight);

    return {
      apWeight: apWeight.toNumber(),
      apCost: apCost.toNumber(),
      pricePerUnit: pricePerUnit.toNumber(),
      parts: results,
      totalUsableWeight: totalUsableWeight.toNumber(),
      totalWasteWeight: totalWasteWeight.toNumber(),
      yieldPercentage: yieldPercentage.toNumber(),
      wastePercentage: wastePercentage.toNumber(),
      epCostPerUnit: epCostPerUnit.toNumber(),
      costIncreaseFactor: epCostPerUnit.dividedBy(pricePerUnit).toNumber(),
    };
  }

  /**
   * Batch scaling calculator
   */
  scaleBatch(recipe, targetPortions) {
    const scaleFactor = targetPortions / recipe.portions;

    const scaledIngredients = recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity * scaleFactor,
    }));

    return {
      ...recipe,
      portions: targetPortions,
      ingredients: scaledIngredients,
      scaleFactor,
    };
  }

  /**
   * Calculate recipe profitability
   */
  calculateRecipeProfitability(costPerPortion, sellingPrice, unitsSold) {
    const cost = new Decimal(costPerPortion);
    const price = new Decimal(sellingPrice);
    const units = new Decimal(unitsSold);

    const contributionMargin = price.minus(cost);
    const totalProfit = contributionMargin.times(units);
    const profitMargin = contributionMargin.dividedBy(price).times(100);

    return {
      costPerPortion: cost.toNumber(),
      sellingPrice: price.toNumber(),
      contributionMargin: contributionMargin.toNumber(),
      profitMargin: profitMargin.toNumber(),
      unitsSold: units.toNumber(),
      totalRevenue: price.times(units).toNumber(),
      totalCost: cost.times(units).toNumber(),
      totalProfit: totalProfit.toNumber(),
    };
  }

  /**
   * Generate escandallo report
   */
  generateEscandalloReport(recipeCost) {
    const report = {
      title: `ESCANDALLO - ${recipeCost.recipeName}`,
      date: new Date().toISOString().split("T")[0],
      portions: recipeCost.portions,
      ingredients: recipeCost.breakdown.map((item) => ({
        ingredient: item.name,
        quantity: `${item.quantity} ${item.unit}`,
        apCost: this.formatCurrency(item.apCost),
        yield: `${item.yieldPercentage}%`,
        epCost: this.formatCurrency(item.epCost),
        waste: this.formatCurrency(item.wasteCost),
        percentage: `${item.percentageOfTotal.toFixed(2)}%`,
      })),
      adjustments: {
        spiceFactor: `${(recipeCost.spiceFactor * 100).toFixed(1)}%`,
        spiceCost: this.formatCurrency(recipeCost.spiceCost),
        qFactor: `${(recipeCost.qFactor * 100).toFixed(1)}%`,
        qCost: this.formatCurrency(recipeCost.qCost),
      },
      totals: {
        totalCost: this.formatCurrency(recipeCost.totalCost),
        costPerPortion: this.formatCurrency(recipeCost.costPerPortion),
        suggestedPrice: this.formatCurrency(recipeCost.suggestedPrice),
      },
    };

    return report;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
