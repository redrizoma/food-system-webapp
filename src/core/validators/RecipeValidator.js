import Joi from "joi";

/**
 * Recipe Validator
 * Validates recipe data structures
 */
export class RecipeValidator {
  constructor() {
    // Define validation schemas
    this.ingredientSchema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      quantity: Joi.number().positive().required(),
      unit: Joi.string().min(1).max(20).required(),
      unitPrice: Joi.number().min(0).required(),
      yieldPercentage: Joi.number().min(0).max(100).default(100),
    });

    this.recipeSchema = Joi.object({
      name: Joi.string().min(3).max(100).required(),
      category: Joi.string()
        .valid(
          "Appetizer",
          "Main Course",
          "Dessert",
          "Beverage",
          "Sauce",
          "Bread",
          "Pastry",
          "Other"
        )
        .default("Other"),
      portions: Joi.number().integer().min(1).max(10000).required(),
      ingredients: Joi.array().items(this.ingredientSchema).min(1).required(),
      spiceFactor: Joi.number().min(0).max(0.1).default(0.02),
      qFactor: Joi.number().min(0).max(0.1).default(0.03),
      targetFoodCost: Joi.number().min(0).max(100).default(30),
      prepTime: Joi.number().min(0).optional(),
      cookTime: Joi.number().min(0).optional(),
      difficulty: Joi.number().integer().min(1).max(5).optional(),
      notes: Joi.string().max(1000).optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional(),
    });

    this.bakersFormulaSchema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      ingredients: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            type: Joi.string()
              .valid(
                "flour",
                "liquid",
                "salt",
                "yeast",
                "sugar",
                "fat",
                "egg",
                "milk",
                "other"
              )
              .required(),
            weight: Joi.number().positive().required(),
          })
        )
        .min(2)
        .required(),
    });
  }

  /**
   * Validate a recipe
   * @param {Object} recipe - Recipe object to validate
   * @returns {Object} Validation result
   */
  validateRecipe(recipe) {
    const result = this.recipeSchema.validate(recipe, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      return {
        isValid: false,
        errors: result.error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
        value: null,
      };
    }

    return {
      isValid: true,
      errors: [],
      value: result.value,
    };
  }

  /**
   * Validate an ingredient
   * @param {Object} ingredient - Ingredient object to validate
   * @returns {Object} Validation result
   */
  validateIngredient(ingredient) {
    const result = this.ingredientSchema.validate(ingredient, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      return {
        isValid: false,
        errors: result.error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
        value: null,
      };
    }

    return {
      isValid: true,
      errors: [],
      value: result.value,
    };
  }

  /**
   * Validate baker's formula
   * @param {Object} formula - Formula object to validate
   * @returns {Object} Validation result
   */
  validateBakersFormula(formula) {
    const result = this.bakersFormulaSchema.validate(formula, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      return {
        isValid: false,
        errors: result.error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
        value: null,
      };
    }

    // Additional validation for baker's formula
    const warnings = [];
    const flourIngredients = formula.ingredients.filter(
      (i) => i.type === "flour"
    );

    if (flourIngredients.length === 0) {
      return {
        isValid: false,
        errors: [
          {
            field: "ingredients",
            message: "Formula must contain at least one flour",
          },
        ],
        warnings: [],
        value: null,
      };
    }

    // Check for water/liquid
    const liquidIngredients = formula.ingredients.filter(
      (i) => i.type === "liquid"
    );
    if (liquidIngredients.length === 0) {
      warnings.push("No liquid found - unusual for most bread formulas");
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      value: result.value,
    };
  }

  /**
   * Validate food cost percentage
   * @param {number} percentage - Food cost percentage
   * @param {string} businessType - Type of business
   * @returns {Object} Validation result
   */
  validateFoodCost(percentage, businessType = "casual_dining") {
    const ranges = {
      fine_dining: { min: 30, max: 40 },
      casual_dining: { min: 28, max: 35 },
      quick_service: { min: 20, max: 30 },
      bakery: { min: 25, max: 35 },
    };

    const range = ranges[businessType] || ranges.casual_dining;

    if (percentage < 0 || percentage > 100) {
      return {
        isValid: false,
        message: "Food cost percentage must be between 0 and 100",
        inRange: false,
      };
    }

    return {
      isValid: true,
      inRange: percentage >= range.min && percentage <= range.max,
      range,
      message:
        percentage < range.min
          ? "Food cost is below target range (good for profit)"
          : percentage > range.max
          ? "Food cost is above target range (consider adjusting)"
          : "Food cost is within target range",
    };
  }

  /**
   * Validate yield percentage
   * @param {number} yieldPercentage - Yield percentage
   * @returns {Object} Validation result
   */
  validateYield(yieldPercentage) {
    if (yieldPercentage <= 0 || yieldPercentage > 100) {
      return {
        isValid: false,
        message: "Yield percentage must be between 0 and 100",
      };
    }

    let quality;
    if (yieldPercentage >= 90) quality = "excellent";
    else if (yieldPercentage >= 75) quality = "good";
    else if (yieldPercentage >= 60) quality = "average";
    else quality = "poor";

    return {
      isValid: true,
      quality,
      message: `Yield of ${yieldPercentage.toFixed(1)}% is ${quality}`,
    };
  }

  /**
   * Validate temperature
   * @param {number} temperature - Temperature value
   * @param {string} unit - Temperature unit (C or F)
   * @param {string} application - Application type
   * @returns {Object} Validation result
   */
  validateTemperature(temperature, unit = "C", application = "general") {
    // Convert to Celsius if needed
    const tempC = unit === "F" ? ((temperature - 32) * 5) / 9 : temperature;

    const ranges = {
      sous_vide: { min: 20, max: 95 },
      sugar_syrup: { min: 100, max: 180 },
      chocolate: { min: 20, max: 60 },
      fermentation: { min: 0, max: 45 },
      general: { min: -273, max: 1000 },
    };

    const range = ranges[application] || ranges.general;

    if (tempC < range.min || tempC > range.max) {
      return {
        isValid: false,
        message: `Temperature out of range for ${application}`,
        range,
      };
    }

    return {
      isValid: true,
      message: "Temperature is valid",
      range,
    };
  }

  /**
   * Validate batch size
   * @param {number} batchSize - Batch size in grams
   * @param {string} equipment - Equipment type
   * @returns {Object} Validation result
   */
  validateBatchSize(batchSize, equipment = "standard_mixer") {
    const capacities = {
      home_mixer: 2000, // 2kg
      standard_mixer: 5000, // 5kg
      commercial_mixer: 20000, // 20kg
      industrial_mixer: 100000, // 100kg
    };

    const capacity = capacities[equipment] || capacities.standard_mixer;

    if (batchSize <= 0) {
      return {
        isValid: false,
        message: "Batch size must be positive",
      };
    }

    if (batchSize > capacity) {
      const batches = Math.ceil(batchSize / capacity);
      return {
        isValid: true,
        warning: true,
        message: `Batch exceeds ${equipment} capacity. Requires ${batches} batches.`,
        batches,
      };
    }

    return {
      isValid: true,
      warning: false,
      message: "Batch size is within equipment capacity",
      utilizationPercentage: (batchSize / capacity) * 100,
    };
  }
}

// Export validators index
export { RecipeValidator as default };
