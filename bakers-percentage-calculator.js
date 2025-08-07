import Decimal from "decimal.js";

/**
 * Baker's Percentage Calculator
 * Implements professional bakery calculations and formulas
 */
export class BakersPercentageCalculator {
  constructor() {
    // Common hydration ranges for different bread types
    this.HYDRATION_RANGES = {
      bagel: { min: 50, max: 57 },
      standard_bread: { min: 58, max: 65 },
      ciabatta: { min: 70, max: 80 },
      focaccia: { min: 75, max: 85 },
      brioche: { min: 60, max: 65 },
    };

    // Standard ingredient percentages
    this.STANDARD_PERCENTAGES = {
      salt: { min: 1.8, max: 2.2 },
      yeast: { min: 0.5, max: 2.0 },
      sugar: { min: 0, max: 10 },
      fat: { min: 0, max: 10 },
    };
  }

  /**
   * Calculate baker's percentage for an ingredient
   * Formula: (Ingredient Weight / Total Flour Weight) × 100
   */
  calculateBakersPercentage(ingredientWeight, totalFlourWeight) {
    if (totalFlourWeight === 0) {
      throw new Error("Total flour weight cannot be zero");
    }

    const ingredient = new Decimal(ingredientWeight);
    const flour = new Decimal(totalFlourWeight);

    return ingredient.dividedBy(flour).times(100).toNumber();
  }

  /**
   * Calculate ingredient weight from baker's percentage
   * Formula: (Baker's Percentage × Total Flour Weight) / 100
   */
  calculateIngredientWeight(bakersPercentage, totalFlourWeight) {
    const percentage = new Decimal(bakersPercentage);
    const flour = new Decimal(totalFlourWeight);

    return percentage.times(flour).dividedBy(100).toNumber();
  }

  /**
   * Calculate hydration percentage
   * Formula: (Total Water Weight / Total Flour Weight) × 100
   */
  calculateHydration(waterWeight, flourWeight) {
    if (flourWeight === 0) {
      throw new Error("Flour weight cannot be zero");
    }

    const water = new Decimal(waterWeight);
    const flour = new Decimal(flourWeight);

    return water.dividedBy(flour).times(100).toNumber();
  }

  /**
   * Convert recipe to baker's percentages
   */
  convertToBakersPercentages(recipe) {
    // Calculate total flour weight
    let totalFlourWeight = new Decimal(0);
    const flourIngredients = [];

    for (const ingredient of recipe.ingredients) {
      if (ingredient.type === "flour") {
        totalFlourWeight = totalFlourWeight.plus(ingredient.weight);
        flourIngredients.push(ingredient);
      }
    }

    if (totalFlourWeight.equals(0)) {
      throw new Error("Recipe must contain flour");
    }

    // Calculate percentages for all ingredients
    const formula = recipe.ingredients.map((ingredient) => {
      const percentage = this.calculateBakersPercentage(
        ingredient.weight,
        totalFlourWeight.toNumber()
      );

      return {
        name: ingredient.name,
        type: ingredient.type,
        weight: ingredient.weight,
        percentage: percentage,
        isFlour: ingredient.type === "flour",
      };
    });

    // Calculate total formula percentage
    const totalPercentage = formula.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    // Calculate hydration if water is present
    const waterIngredient = recipe.ingredients.find((i) => i.type === "liquid");
    const hydration = waterIngredient
      ? this.calculateHydration(
          waterIngredient.weight,
          totalFlourWeight.toNumber()
        )
      : 0;

    return {
      name: recipe.name,
      formula,
      totalFlourWeight: totalFlourWeight.toNumber(),
      totalPercentage,
      hydration,
      flourBreakdown: flourIngredients.map((flour) => ({
        name: flour.name,
        weight: flour.weight,
        percentage: (flour.weight / totalFlourWeight.toNumber()) * 100,
      })),
    };
  }

  /**
   * Scale recipe using baker's percentages
   */
  scaleRecipe(bakersFormula, targetFlourWeight) {
    const flourWeight = new Decimal(targetFlourWeight);

    const scaledIngredients = bakersFormula.formula.map((ingredient) => {
      const weight = this.calculateIngredientWeight(
        ingredient.percentage,
        targetFlourWeight
      );

      return {
        name: ingredient.name,
        type: ingredient.type,
        percentage: ingredient.percentage,
        weight: weight,
      };
    });

    // Calculate total dough weight
    const totalDoughWeight = scaledIngredients.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    return {
      name: bakersFormula.name,
      targetFlourWeight,
      ingredients: scaledIngredients,
      totalDoughWeight,
      hydration: bakersFormula.hydration,
      scaleFactor: targetFlourWeight / bakersFormula.totalFlourWeight,
    };
  }

  /**
   * Calculate dough weight from desired number of pieces
   */
  calculateDoughWeight(pieceWeight, numberOfPieces, lossPercentage = 2) {
    const totalWeight = new Decimal(pieceWeight).times(numberOfPieces);
    const lossFactor = new Decimal(100).plus(lossPercentage).dividedBy(100);

    return totalWeight.times(lossFactor).toNumber();
  }

  /**
   * Calculate flour weight from total dough weight
   */
  calculateFlourWeight(totalDoughWeight, totalFormulaPercentage) {
    if (totalFormulaPercentage === 0) {
      throw new Error("Total formula percentage cannot be zero");
    }

    const doughWeight = new Decimal(totalDoughWeight);
    const formulaPercentage = new Decimal(totalFormulaPercentage).dividedBy(
      100
    );

    return doughWeight.dividedBy(formulaPercentage).toNumber();
  }

  /**
   * Process preferment (poolish, biga, sourdough starter)
   */
  processPreferment(preferment, totalFlourWeight) {
    const prefermentFlour = new Decimal(preferment.flourWeight);
    const prefermentWater = new Decimal(preferment.waterWeight);
    const prefermentTotal = prefermentFlour.plus(prefermentWater);

    const flourPercentage = prefermentFlour
      .dividedBy(totalFlourWeight)
      .times(100);
    const prefermentHydration = prefermentWater
      .dividedBy(prefermentFlour)
      .times(100);

    return {
      type: preferment.type,
      flourWeight: prefermentFlour.toNumber(),
      waterWeight: prefermentWater.toNumber(),
      totalWeight: prefermentTotal.toNumber(),
      flourPercentage: flourPercentage.toNumber(),
      hydration: prefermentHydration.toNumber(),
      fermentationTime: preferment.fermentationTime,
      temperature: preferment.temperature,
    };
  }

  /**
   * Calculate overall formula with preferment
   */
  calculateOverallFormula(finalDough, preferment) {
    // Combine flour weights
    const totalFlour = new Decimal(finalDough.flourWeight).plus(
      preferment.flourWeight
    );

    // Combine water weights
    const totalWater = new Decimal(finalDough.waterWeight).plus(
      preferment.waterWeight
    );

    // Calculate overall hydration
    const overallHydration = totalWater.dividedBy(totalFlour).times(100);

    // Calculate prefermented flour percentage
    const prefermentedFlourPercentage = new Decimal(preferment.flourWeight)
      .dividedBy(totalFlour)
      .times(100);

    return {
      totalFlour: totalFlour.toNumber(),
      totalWater: totalWater.toNumber(),
      overallHydration: overallHydration.toNumber(),
      prefermentedFlourPercentage: prefermentedFlourPercentage.toNumber(),
      finalDough: {
        flour: finalDough.flourWeight,
        water: finalDough.waterWeight,
        salt: finalDough.saltWeight,
        yeast: finalDough.yeastWeight,
      },
      preferment: {
        flour: preferment.flourWeight,
        water: preferment.waterWeight,
        type: preferment.type,
      },
    };
  }

  /**
   * Calculate mixing time based on dough type
   */
  calculateMixingTime(doughType, flourWeight) {
    const baseTime = {
      standard: 8,
      enriched: 12,
      whole_grain: 10,
      high_hydration: 6,
    };

    const time = baseTime[doughType] || 8;
    const weightFactor = Math.sqrt(flourWeight / 1000); // Adjust for batch size

    return Math.round(time * weightFactor);
  }

  /**
   * Validate formula
   */
  validateFormula(formula) {
    const warnings = [];
    const errors = [];

    // Check hydration
    if (formula.hydration < 45) {
      errors.push("Hydration too low (< 45%). Dough will be very dry.");
    } else if (formula.hydration > 100) {
      warnings.push(
        "Very high hydration (> 100%). Requires advanced technique."
      );
    }

    // Check salt percentage
    const saltIngredient = formula.formula.find((i) => i.type === "salt");
    if (saltIngredient) {
      if (saltIngredient.percentage < 1.8) {
        warnings.push(
          "Low salt percentage. May affect flavor and fermentation."
        );
      } else if (saltIngredient.percentage > 2.5) {
        warnings.push("High salt percentage. May inhibit fermentation.");
      }
    } else {
      errors.push("No salt in formula.");
    }

    // Check yeast percentage
    const yeastIngredient = formula.formula.find((i) => i.type === "yeast");
    if (yeastIngredient && yeastIngredient.percentage > 3) {
      warnings.push("High yeast percentage. May result in rapid fermentation.");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate formula report
   */
  generateFormulaReport(formula, scaledRecipe = null) {
    const report = {
      title: `Baker's Formula - ${formula.name}`,
      date: new Date().toISOString().split("T")[0],
      formula: formula.formula.map((item) => ({
        ingredient: item.name,
        percentage: `${item.percentage.toFixed(1)}%`,
        weight: scaledRecipe
          ? `${scaledRecipe.ingredients
              .find((i) => i.name === item.name)
              .weight.toFixed(0)}g`
          : `${item.weight}g`,
      })),
      metrics: {
        totalFlour: `${formula.totalFlourWeight}g`,
        hydration: `${formula.hydration.toFixed(1)}%`,
        totalPercentage: `${formula.totalPercentage.toFixed(1)}%`,
      },
    };

    if (scaledRecipe) {
      report.scaling = {
        targetFlour: `${scaledRecipe.targetFlourWeight}g`,
        totalDough: `${scaledRecipe.totalDoughWeight.toFixed(0)}g`,
        scaleFactor: `×${scaledRecipe.scaleFactor.toFixed(2)}`,
      };
    }

    return report;
  }
}
