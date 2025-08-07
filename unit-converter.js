import Decimal from "decimal.js";

/**
 * Unit Converter for Metric and Bakery Units
 */
export class UnitConverter {
  constructor() {
    // Weight conversions to grams (base unit)
    this.WEIGHT_TO_GRAMS = {
      // Metric
      mg: 0.001,
      g: 1,
      kg: 1000,
      // Imperial
      oz: 28.3495,
      lb: 453.592,
      // Bakery specific
      dram: 1.77185,
      // Common ingredients by volume (approximate)
      tsp_salt: 6,
      tbsp_salt: 18,
      cup_flour: 120,
      cup_sugar: 200,
      cup_butter: 227,
    };

    // Volume conversions to milliliters (base unit)
    this.VOLUME_TO_ML = {
      // Metric
      ml: 1,
      cl: 10,
      dl: 100,
      l: 1000,
      // Imperial
      tsp: 4.92892,
      tbsp: 14.7868,
      fl_oz: 29.5735,
      cup: 236.588,
      pint: 473.176,
      quart: 946.353,
      gallon: 3785.41,
      // Bakery specific
      gill: 118.294,
      // Egg sizes (approximate)
      egg_small: 38,
      egg_medium: 44,
      egg_large: 50,
      egg_xlarge: 56,
    };

    // Temperature conversions
    this.TEMPERATURE = {
      celsiusToFahrenheit: (c) => (c * 9) / 5 + 32,
      fahrenheitToCelsius: (f) => ((f - 32) * 5) / 9,
      celsiusToKelvin: (c) => c + 273.15,
      kelvinToCelsius: (k) => k - 273.15,
    };

    // Common ingredient densities (g/ml)
    this.DENSITIES = {
      water: 1.0,
      milk: 1.03,
      cream: 0.994,
      honey: 1.42,
      oil: 0.92,
      butter: 0.911,
      flour_ap: 0.52,
      flour_bread: 0.55,
      flour_cake: 0.45,
      flour_whole: 0.48,
      sugar_granulated: 0.85,
      sugar_powdered: 0.56,
      sugar_brown: 0.82,
      salt_table: 1.22,
      salt_kosher: 0.65,
      yeast_active: 0.65,
      yeast_instant: 0.6,
      cocoa: 0.43,
      baking_powder: 0.9,
      baking_soda: 2.2,
    };
  }

  /**
   * Convert weight units
   */
  convertWeight(value, fromUnit, toUnit) {
    if (!this.WEIGHT_TO_GRAMS[fromUnit]) {
      throw new Error(`Unknown weight unit: ${fromUnit}`);
    }
    if (!this.WEIGHT_TO_GRAMS[toUnit]) {
      throw new Error(`Unknown weight unit: ${toUnit}`);
    }

    const val = new Decimal(value);
    const grams = val.times(this.WEIGHT_TO_GRAMS[fromUnit]);
    const result = grams.dividedBy(this.WEIGHT_TO_GRAMS[toUnit]);

    return result.toNumber();
  }

  /**
   * Convert volume units
   */
  convertVolume(value, fromUnit, toUnit) {
    if (!this.VOLUME_TO_ML[fromUnit]) {
      throw new Error(`Unknown volume unit: ${fromUnit}`);
    }
    if (!this.VOLUME_TO_ML[toUnit]) {
      throw new Error(`Unknown volume unit: ${toUnit}`);
    }

    const val = new Decimal(value);
    const ml = val.times(this.VOLUME_TO_ML[fromUnit]);
    const result = ml.dividedBy(this.VOLUME_TO_ML[toUnit]);

    return result.toNumber();
  }

  /**
   * Convert volume to weight using density
   */
  volumeToWeight(value, volumeUnit, ingredient) {
    if (!this.VOLUME_TO_ML[volumeUnit]) {
      throw new Error(`Unknown volume unit: ${volumeUnit}`);
    }
    if (!this.DENSITIES[ingredient]) {
      throw new Error(`Unknown ingredient density: ${ingredient}`);
    }

    const val = new Decimal(value);
    const ml = val.times(this.VOLUME_TO_ML[volumeUnit]);
    const grams = ml.times(this.DENSITIES[ingredient]);

    return grams.toNumber();
  }

  /**
   * Convert weight to volume using density
   */
  weightToVolume(value, weightUnit, ingredient) {
    if (!this.WEIGHT_TO_GRAMS[weightUnit]) {
      throw new Error(`Unknown weight unit: ${weightUnit}`);
    }
    if (!this.DENSITIES[ingredient]) {
      throw new Error(`Unknown ingredient density: ${ingredient}`);
    }

    const val = new Decimal(value);
    const grams = val.times(this.WEIGHT_TO_GRAMS[weightUnit]);
    const ml = grams.dividedBy(this.DENSITIES[ingredient]);

    return ml.toNumber();
  }

  /**
   * Convert temperature
   */
  convertTemperature(value, fromScale, toScale) {
    const scales = ["celsius", "fahrenheit", "kelvin"];

    if (
      !scales.includes(fromScale.toLowerCase()) ||
      !scales.includes(toScale.toLowerCase())
    ) {
      throw new Error("Invalid temperature scale");
    }

    if (fromScale === toScale) return value;

    // Convert to Celsius first
    let celsius = value;
    if (fromScale.toLowerCase() === "fahrenheit") {
      celsius = this.TEMPERATURE.fahrenheitToCelsius(value);
    } else if (fromScale.toLowerCase() === "kelvin") {
      celsius = this.TEMPERATURE.kelvinToCelsius(value);
    }

    // Convert from Celsius to target
    if (toScale.toLowerCase() === "fahrenheit") {
      return this.TEMPERATURE.celsiusToFahrenheit(celsius);
    } else if (toScale.toLowerCase() === "kelvin") {
      return this.TEMPERATURE.celsiusToKelvin(celsius);
    }

    return celsius;
  }

  /**
   * Parse ingredient measurement string
   */
  parseIngredientMeasurement(measurementString) {
    // Regular expression to match number and unit
    const regex = /^([\d.\/\s]+)\s*(.+)$/;
    const match = measurementString.trim().match(regex);

    if (!match) {
      throw new Error("Invalid measurement format");
    }

    let quantity = match[1].trim();
    const unit = match[2].trim().toLowerCase();

    // Handle fractions
    if (quantity.includes("/")) {
      const parts = quantity.split("/");
      if (parts.length === 2) {
        quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else if (parts.length === 3) {
        // Mixed number (e.g., "1 1/2")
        const whole = parseFloat(parts[0]);
        const fraction = parseFloat(parts[1]) / parseFloat(parts[2]);
        quantity = whole + fraction;
      }
    } else {
      quantity = parseFloat(quantity);
    }

    return { quantity, unit };
  }

  /**
   * Format measurement for display
   */
  formatMeasurement(value, unit, precision = 2) {
    const rounded = new Decimal(value).toFixed(precision);

    // Remove trailing zeros
    const formatted = parseFloat(rounded).toString();

    return `${formatted} ${unit}`;
  }

  /**
   * Convert recipe to metric
   */
  convertRecipeToMetric(recipe) {
    const convertedIngredients = recipe.ingredients.map((ingredient) => {
      let convertedQuantity = ingredient.quantity;
      let convertedUnit = ingredient.unit;

      // Check if it's a weight unit
      if (this.WEIGHT_TO_GRAMS[ingredient.unit]) {
        if (ingredient.quantity < 5 && ingredient.unit === "g") {
          // Small amounts stay in grams
          convertedQuantity = ingredient.quantity;
          convertedUnit = "g";
        } else if (ingredient.quantity >= 1000 && ingredient.unit === "g") {
          // Large amounts convert to kg
          convertedQuantity = this.convertWeight(
            ingredient.quantity,
            "g",
            "kg"
          );
          convertedUnit = "kg";
        } else {
          // Convert to grams
          convertedQuantity = this.convertWeight(
            ingredient.quantity,
            ingredient.unit,
            "g"
          );
          convertedUnit = "g";
        }
      }
      // Check if it's a volume unit
      else if (this.VOLUME_TO_ML[ingredient.unit]) {
        if (ingredient.quantity < 10 && ingredient.unit === "ml") {
          // Small amounts stay in ml
          convertedQuantity = ingredient.quantity;
          convertedUnit = "ml";
        } else if (ingredient.quantity >= 1000 && ingredient.unit === "ml") {
          // Large amounts convert to liters
          convertedQuantity = this.convertVolume(
            ingredient.quantity,
            "ml",
            "l"
          );
          convertedUnit = "l";
        } else {
          // Convert to ml
          convertedQuantity = this.convertVolume(
            ingredient.quantity,
            ingredient.unit,
            "ml"
          );
          convertedUnit = "ml";
        }
      }

      return {
        ...ingredient,
        quantity: convertedQuantity,
        unit: convertedUnit,
        originalQuantity: ingredient.quantity,
        originalUnit: ingredient.unit,
      };
    });

    return {
      ...recipe,
      ingredients: convertedIngredients,
      converted: true,
      conversionType: "metric",
    };
  }

  /**
   * Get common bakery conversions
   */
  getBakeryConversions(ingredient, amount, fromUnit) {
    const conversions = {};

    // Weight conversions
    if (this.WEIGHT_TO_GRAMS[fromUnit]) {
      conversions.grams = this.convertWeight(amount, fromUnit, "g");
      conversions.kilograms = this.convertWeight(amount, fromUnit, "kg");
      conversions.ounces = this.convertWeight(amount, fromUnit, "oz");
      conversions.pounds = this.convertWeight(amount, fromUnit, "lb");
    }

    // Volume conversions
    if (this.VOLUME_TO_ML[fromUnit]) {
      conversions.milliliters = this.convertVolume(amount, fromUnit, "ml");
      conversions.liters = this.convertVolume(amount, fromUnit, "l");
      conversions.cups = this.convertVolume(amount, fromUnit, "cup");
      conversions.tablespoons = this.convertVolume(amount, fromUnit, "tbsp");
      conversions.teaspoons = this.convertVolume(amount, fromUnit, "tsp");
    }

    // If we know the ingredient density, add weight/volume conversions
    if (this.DENSITIES[ingredient]) {
      if (this.WEIGHT_TO_GRAMS[fromUnit]) {
        const mlVolume = this.weightToVolume(amount, fromUnit, ingredient);
        conversions.volume_ml = mlVolume;
        conversions.volume_cups = mlVolume / this.VOLUME_TO_ML.cup;
      } else if (this.VOLUME_TO_ML[fromUnit]) {
        conversions.weight_grams = this.volumeToWeight(
          amount,
          fromUnit,
          ingredient
        );
      }
    }

    return conversions;
  }

  /**
   * Scale recipe by factor
   */
  scaleRecipe(recipe, scaleFactor) {
    const scaledIngredients = recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity * scaleFactor,
      originalQuantity: ingredient.quantity,
    }));

    return {
      ...recipe,
      ingredients: scaledIngredients,
      originalServings: recipe.servings,
      servings: Math.round(recipe.servings * scaleFactor),
      scaleFactor,
    };
  }
}
