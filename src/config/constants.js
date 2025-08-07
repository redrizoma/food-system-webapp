/**
 * System-wide constants and configuration
 */

// Business Settings
export const BUSINESS_TYPES = {
  FINE_DINING: "fine_dining",
  CASUAL_DINING: "casual_dining",
  QUICK_SERVICE: "quick_service",
  BAKERY: "bakery",
  CATERING: "catering",
};

// Default Factors
export const DEFAULT_FACTORS = {
  SPICE_FACTOR: 0.02, // 2%
  Q_FACTOR: 0.03, // 3%
  LABOR_FACTOR: 0.25, // 25%
  OVERHEAD_FACTOR: 0.15, // 15%
};

// Food Cost Targets by Business Type
export const FOOD_COST_TARGETS = {
  [BUSINESS_TYPES.FINE_DINING]: { min: 30, max: 40 },
  [BUSINESS_TYPES.CASUAL_DINING]: { min: 28, max: 35 },
  [BUSINESS_TYPES.QUICK_SERVICE]: { min: 20, max: 30 },
  [BUSINESS_TYPES.BAKERY]: { min: 25, max: 35 },
  [BUSINESS_TYPES.CATERING]: { min: 35, max: 45 },
};

// Common Yield Percentages
export const STANDARD_YIELDS = {
  // Proteins
  BEEF_TENDERLOIN: 70,
  BEEF_RIBEYE: 75,
  BEEF_STRIP: 78,
  CHICKEN_WHOLE: 65,
  CHICKEN_BREAST: 85,
  FISH_WHOLE: 45,
  FISH_FILLET: 95,
  PORK_LOIN: 75,
  LAMB_RACK: 70,

  // Vegetables
  ASPARAGUS: 55,
  BROCCOLI: 47,
  CARROT: 82,
  CELERY: 75,
  LETTUCE_ICEBERG: 76,
  LETTUCE_ROMAINE: 64,
  ONION: 89,
  POTATO: 81,
  TOMATO: 91,

  // Fruits
  APPLE: 76,
  AVOCADO: 67,
  LEMON: 40,
  ORANGE: 67,
  STRAWBERRY: 92,
};

// Temperature Settings
export const TEMPERATURES = {
  // Sous Vide
  SOUS_VIDE: {
    BEEF_RARE: 49,
    BEEF_MEDIUM_RARE: 55,
    BEEF_MEDIUM: 60,
    BEEF_WELL: 71,
    CHICKEN: 65,
    FISH: 50,
    EGGS: 63,
  },

  // Sugar Stages
  SUGAR_STAGES: {
    THREAD: { min: 106, max: 112 },
    SOFT_BALL: { min: 112, max: 116 },
    FIRM_BALL: { min: 118, max: 120 },
    HARD_BALL: { min: 121, max: 130 },
    SOFT_CRACK: { min: 132, max: 143 },
    HARD_CRACK: { min: 146, max: 154 },
    CARAMEL: { min: 160, max: 177 },
  },

  // Chocolate Tempering
  CHOCOLATE: {
    DARK: { melt: 50, cool: 28, working: 31 },
    MILK: { melt: 45, cool: 27, working: 29 },
    WHITE: { melt: 40, cool: 26, working: 28 },
  },

  // Fermentation
  FERMENTATION: {
    WINE: { min: 18, max: 24 },
    BEER_ALE: { min: 18, max: 22 },
    BEER_LAGER: { min: 7, max: 13 },
    BREAD: { min: 24, max: 29 },
    YOGURT: { min: 40, max: 45 },
  },
};

// Baker's Percentages
export const BAKERS_PERCENTAGES = {
  HYDRATION: {
    BAGEL: { min: 50, max: 57 },
    STANDARD_BREAD: { min: 58, max: 65 },
    CIABATTA: { min: 70, max: 80 },
    FOCACCIA: { min: 75, max: 85 },
  },

  STANDARD_INGREDIENTS: {
    SALT: { min: 1.8, max: 2.2 },
    YEAST: { min: 0.5, max: 2.0 },
    SUGAR: { min: 0, max: 10 },
    FAT: { min: 0, max: 10 },
  },
};

// Molecular Gastronomy Concentrations
export const MOLECULAR_CONCENTRATIONS = {
  SODIUM_ALGINATE: { min: 0.5, max: 1.0 },
  CALCIUM_CHLORIDE: { min: 0.5, max: 1.5 },
  AGAR: { min: 0.5, max: 3.0 },
  GELLAN: { min: 0.2, max: 1.0 },
  XANTHAN: { min: 0.1, max: 0.5 },
  LECITHIN: { min: 0.3, max: 0.5 },
  METHYLCELLULOSE: { min: 1.0, max: 2.0 },
};

// Unit Systems
export const UNIT_SYSTEMS = {
  METRIC: "metric",
  IMPERIAL: "imperial",
  BAKERS: "bakers",
};

// Default Units by System
export const DEFAULT_UNITS = {
  [UNIT_SYSTEMS.METRIC]: {
    weight: "g",
    volume: "ml",
    temperature: "C",
  },
  [UNIT_SYSTEMS.IMPERIAL]: {
    weight: "oz",
    volume: "cup",
    temperature: "F",
  },
  [UNIT_SYSTEMS.BAKERS]: {
    weight: "%",
    volume: "%",
    temperature: "C",
  },
};

// Currency Settings
export const CURRENCIES = {
  EUR: { symbol: "€", position: "before", decimals: 2 },
  USD: { symbol: "$", position: "before", decimals: 2 },
  GBP: { symbol: "£", position: "before", decimals: 2 },
  JPY: { symbol: "¥", position: "before", decimals: 0 },
};

// Menu Engineering Categories
export const MENU_CATEGORIES = {
  STAR: "star", // High popularity, high profit
  PUZZLE: "puzzle", // Low popularity, high profit
  PLOW_HORSE: "plow_horse", // High popularity, low profit
  DOG: "dog", // Low popularity, low profit
};

// File Paths
export const DATA_PATHS = {
  RECIPES: "./src/data/recipes/",
  INGREDIENTS: "./src/data/ingredients/",
  COSTS: "./src/data/costs/",
  TEMPLATES: "./src/data/templates/",
  EXPORTS: "./exports/",
};

// Validation Rules
export const VALIDATION = {
  RECIPE_NAME_MIN: 3,
  RECIPE_NAME_MAX: 100,
  PORTIONS_MIN: 1,
  PORTIONS_MAX: 10000,
  COST_MIN: 0,
  COST_MAX: 100000,
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  TEMPERATURE_MIN: -273, // Absolute zero
  TEMPERATURE_MAX: 1000,
};

// Display Settings
export const DISPLAY = {
  TABLE_MAX_WIDTH: 120,
  DECIMAL_PLACES: 2,
  PERCENTAGE_DECIMALS: 1,
  CURRENCY_DECIMALS: 2,
  PAGE_SIZE: 10,
};

// Export Formats
export const EXPORT_FORMATS = {
  JSON: "json",
  CSV: "csv",
  PDF: "pdf",
  EXCEL: "excel",
  TEXT: "text",
};

// Recipe Categories
export const RECIPE_CATEGORIES = [
  "Appetizer",
  "Soup",
  "Salad",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Beverage",
  "Sauce",
  "Bread",
  "Pastry",
  "Other",
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  MASTER: 5,
};

// Time Ranges
export const TIME_RANGES = {
  QUICK: { min: 0, max: 30, label: "Quick (< 30 min)" },
  MEDIUM: { min: 30, max: 60, label: "Medium (30-60 min)" },
  LONG: { min: 60, max: 120, label: "Long (1-2 hours)" },
  VERY_LONG: { min: 120, max: null, label: "Very Long (> 2 hours)" },
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: "Invalid input. Please try again.",
  FILE_NOT_FOUND: "File not found.",
  SAVE_FAILED: "Failed to save data.",
  LOAD_FAILED: "Failed to load data.",
  CALCULATION_ERROR: "Error in calculation.",
  NETWORK_ERROR: "Network error. Please check your connection.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Data saved successfully.",
  LOADED: "Data loaded successfully.",
  CALCULATED: "Calculation completed.",
  EXPORTED: "Data exported successfully.",
  IMPORTED: "Data imported successfully.",
};
