/**
 * Format Utilities for Food System WebApp
 */

/**
 * Format currency with proper symbol and decimals
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = "EUR") {
  const currencySymbols = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = Math.abs(amount).toFixed(2);

  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

/**
 * Format percentage with specified decimals
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format weight with appropriate unit
 * @param {number} grams - Weight in grams
 * @returns {string} Formatted weight string
 */
export function formatWeight(grams) {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(0)} g`;
}

/**
 * Format volume with appropriate unit
 * @param {number} milliliters - Volume in milliliters
 * @returns {string} Formatted volume string
 */
export function formatVolume(milliliters) {
  if (milliliters >= 1000) {
    return `${(milliliters / 1000).toFixed(2)} L`;
  }
  return `${milliliters.toFixed(0)} ml`;
}

/**
 * Format temperature with unit
 * @param {number} temp - Temperature value
 * @param {string} unit - Temperature unit (C or F)
 * @returns {string} Formatted temperature string
 */
export function formatTemperature(temp, unit = "C") {
  return `${temp.toFixed(1)}°${unit}`;
}

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${mins}min`;
}

/**
 * Format date to local string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 0) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format ratio (e.g., 1:2:3)
 * @param {number[]} values - Array of ratio values
 * @returns {string} Formatted ratio string
 */
export function formatRatio(values) {
  return values.join(":");
}

/**
 * Format baker's percentage
 * @param {number} value - Percentage value
 * @returns {string} Formatted baker's percentage
 */
export function formatBakersPercentage(value) {
  return `${value.toFixed(1)}%`;
}

/**
 * Format pH value
 * @param {number} ph - pH value
 * @returns {string} Formatted pH string
 */
export function formatPH(ph) {
  return `pH ${ph.toFixed(2)}`;
}

/**
 * Format Brix value
 * @param {number} brix - Brix value
 * @returns {string} Formatted Brix string
 */
export function formatBrix(brix) {
  return `${brix.toFixed(1)}°Bx`;
}

/**
 * Format yield percentage with color coding
 * @param {number} yield - Yield percentage
 * @returns {string} Formatted yield string
 */
export function formatYield(yieldPercentage) {
  const formatted = `${yieldPercentage.toFixed(1)}%`;

  if (yieldPercentage >= 90) {
    return `${formatted} (Excellent)`;
  } else if (yieldPercentage >= 75) {
    return `${formatted} (Good)`;
  } else if (yieldPercentage >= 60) {
    return `${formatted} (Average)`;
  } else {
    return `${formatted} (Poor)`;
  }
}

/**
 * Format food cost percentage with indicator
 * @param {number} percentage - Food cost percentage
 * @param {string} businessType - Type of business
 * @returns {string} Formatted food cost string
 */
export function formatFoodCost(percentage, businessType = "casual") {
  const formatted = `${percentage.toFixed(1)}%`;

  const targets = {
    fine_dining: { min: 30, max: 40 },
    casual: { min: 28, max: 35 },
    quick_service: { min: 20, max: 30 },
  };

  const target = targets[businessType] || targets.casual;

  if (percentage < target.min) {
    return `${formatted} ✓`;
  } else if (percentage <= target.max) {
    return `${formatted}`;
  } else {
    return `${formatted} ⚠`;
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 30) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Pad text to specified length
 * @param {string} text - Text to pad
 * @param {number} length - Desired length
 * @param {string} align - Alignment (left, right, center)
 * @returns {string} Padded text
 */
export function pad(text, length, align = "left") {
  const str = String(text);

  if (str.length >= length) {
    return str.substring(0, length);
  }

  const padding = length - str.length;

  switch (align) {
    case "right":
      return " ".repeat(padding) + str;
    case "center":
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return " ".repeat(leftPad) + str + " ".repeat(rightPad);
    default:
      return str + " ".repeat(padding);
  }
}
