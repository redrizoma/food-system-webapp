import inquirer from "inquirer";
import chalk from "chalk";

/**
 * Input validation and handling utilities
 */

/**
 * Validate numeric input
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validateNumber(value, options = {}) {
  const { min = 0, max = Infinity, integer = false, required = true } = options;

  if (required && (value === "" || value === null || value === undefined)) {
    return "This field is required";
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return "Please enter a valid number";
  }

  if (integer && !Number.isInteger(num)) {
    return "Please enter a whole number";
  }

  if (num < min) {
    return `Value must be at least ${min}`;
  }

  if (num > max) {
    return `Value must be at most ${max}`;
  }

  return true;
}

/**
 * Validate string input
 * @param {string} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validateString(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Infinity,
    pattern = null,
    required = true,
  } = options;

  if (required && !value) {
    return "This field is required";
  }

  if (value.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }

  if (value.length > maxLength) {
    return `Must be at most ${maxLength} characters`;
  }

  if (pattern && !pattern.test(value)) {
    return "Invalid format";
  }

  return true;
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return "Email is required";
  }

  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }

  return true;
}

/**
 * Validate percentage
 * @param {number} value - Percentage value
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validatePercentage(value) {
  return validateNumber(value, { min: 0, max: 100 });
}

/**
 * Validate temperature
 * @param {number} value - Temperature value
 * @param {string} unit - Temperature unit (C or F)
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validateTemperature(value, unit = "C") {
  const limits = {
    C: { min: -273, max: 1000 },
    F: { min: -459, max: 1832 },
  };

  const limit = limits[unit] || limits.C;
  return validateNumber(value, { min: limit.min, max: limit.max });
}

/**
 * Validate pH value
 * @param {number} value - pH value
 * @returns {boolean|string} - True if valid, error message if not
 */
export function validatePH(value) {
  return validateNumber(value, { min: 0, max: 14 });
}

/**
 * Parse numeric input with unit
 * @param {string} input - Input string (e.g., "100g", "2.5kg")
 * @returns {Object} - Parsed value and unit
 */
export function parseNumericWithUnit(input) {
  const match = input.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);

  if (!match) {
    return { value: null, unit: null };
  }

  return {
    value: parseFloat(match[1]),
    unit: match[2] || null,
  };
}

/**
 * Prompt for multiple ingredients
 * @returns {Promise<Array>} - Array of ingredients
 */
export async function promptForIngredients() {
  const ingredients = [];
  let addMore = true;

  while (addMore) {
    console.log(chalk.yellow(`\n➕ Add Ingredient #${ingredients.length + 1}`));

    const ingredient = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Ingredient name:",
        validate: (input) => validateString(input, { minLength: 1 }),
      },
      {
        type: "number",
        name: "quantity",
        message: "Quantity:",
        validate: (input) => validateNumber(input, { min: 0 }),
      },
      {
        type: "list",
        name: "unit",
        message: "Unit:",
        choices: ["g", "kg", "ml", "l", "units", "cup", "tbsp", "tsp"],
      },
      {
        type: "number",
        name: "unitPrice",
        message: "Price per unit:",
        validate: (input) => validateNumber(input, { min: 0 }),
      },
      {
        type: "number",
        name: "yieldPercentage",
        message: "Yield percentage (100 if no waste):",
        default: 100,
        validate: validatePercentage,
      },
    ]);

    ingredients.push(ingredient);

    const { continueAdding } = await inquirer.prompt([
      {
        type: "confirm",
        name: "continueAdding",
        message: "Add another ingredient?",
        default: true,
      },
    ]);

    addMore = continueAdding;
  }

  return ingredients;
}

/**
 * Confirm action
 * @param {string} message - Confirmation message
 * @param {boolean} defaultValue - Default value
 * @returns {Promise<boolean>} - User confirmation
 */
export async function confirmAction(message, defaultValue = false) {
  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message,
      default: defaultValue,
    },
  ]);

  return confirmed;
}

/**
 * Select from list with search
 * @param {string} message - Prompt message
 * @param {Array} choices - Available choices
 * @returns {Promise<any>} - Selected choice
 */
export async function selectWithSearch(message, choices) {
  const { selected } = await inquirer.prompt([
    {
      type: "autocomplete",
      name: "selected",
      message,
      choices,
      searchText: "Search...",
      emptyText: "No results found",
    },
  ]);

  return selected;
}

/**
 * Prompt for date
 * @param {string} message - Prompt message
 * @param {Date} defaultDate - Default date
 * @returns {Promise<Date>} - Selected date
 */
export async function promptForDate(message, defaultDate = new Date()) {
  const { dateString } = await inquirer.prompt([
    {
      type: "input",
      name: "dateString",
      message,
      default: defaultDate.toISOString().split("T")[0],
      validate: (input) => {
        const date = new Date(input);
        if (isNaN(date.getTime())) {
          return "Please enter a valid date (YYYY-MM-DD)";
        }
        return true;
      },
    },
  ]);

  return new Date(dateString);
}

/**
 * Prompt for time duration
 * @param {string} message - Prompt message
 * @returns {Promise<number>} - Duration in minutes
 */
export async function promptForDuration(message) {
  const { duration, unit } = await inquirer.prompt([
    {
      type: "number",
      name: "duration",
      message: `${message} (number):`,
      validate: (input) => validateNumber(input, { min: 0 }),
    },
    {
      type: "list",
      name: "unit",
      message: "Unit:",
      choices: ["minutes", "hours", "days"],
    },
  ]);

  // Convert to minutes
  const multipliers = {
    minutes: 1,
    hours: 60,
    days: 1440,
  };

  return duration * multipliers[unit];
}

/**
 * Prompt for multiple choice selection
 * @param {string} message - Prompt message
 * @param {Array} choices - Available choices
 * @returns {Promise<Array>} - Selected choices
 */
export async function promptForMultipleChoice(message, choices) {
  const { selected } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selected",
      message,
      choices,
      validate: (input) => {
        if (input.length === 0) {
          return "Please select at least one option";
        }
        return true;
      },
    },
  ]);

  return selected;
}

/**
 * Wait for user to press Enter
 * @param {string} message - Message to display
 * @returns {Promise<void>}
 */
export async function waitForEnter(message = "Press Enter to continue...") {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message,
    },
  ]);
}

/**
 * Format validation error
 * @param {string} field - Field name
 * @param {string} message - Error message
 * @returns {string} - Formatted error message
 */
export function formatValidationError(field, message) {
  return chalk.red(`❌ ${field}: ${message}`);
}

/**
 * Display validation errors
 * @param {Array} errors - Array of validation errors
 */
export function displayValidationErrors(errors) {
  console.log(chalk.red("\n⚠️  Validation Errors:"));
  errors.forEach((error) => {
    console.log(`  • ${error.field}: ${error.message}`);
  });
}

/**
 * Parse fraction string to decimal
 * @param {string} fraction - Fraction string (e.g., "1/2", "1 1/2")
 * @returns {number} - Decimal value
 */
export function parseFraction(fraction) {
  const parts = fraction.trim().split(" ");

  if (parts.length === 1) {
    // Simple fraction like "1/2"
    const [numerator, denominator] = parts[0].split("/");
    if (denominator) {
      return parseFloat(numerator) / parseFloat(denominator);
    }
    return parseFloat(parts[0]);
  } else if (parts.length === 2) {
    // Mixed number like "1 1/2"
    const whole = parseFloat(parts[0]);
    const [numerator, denominator] = parts[1].split("/");
    if (denominator) {
      return whole + parseFloat(numerator) / parseFloat(denominator);
    }
    return whole;
  }

  return parseFloat(fraction) || 0;
}

/**
 * Format number for input display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export function formatInputNumber(value, decimals = 2) {
  if (value === null || value === undefined) {
    return "";
  }

  return value.toFixed(decimals).replace(/\.?0+$/, "");
}
