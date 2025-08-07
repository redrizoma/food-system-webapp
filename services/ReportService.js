import { formatCurrency, formatPercentage, formatDate } from "../utils/format.js";
import { RecipeCostCalculator } from "../core/calculations/RecipeCostCalculator.js";
import { FoodCostCalculator } from "../core/calculations/FoodCostCalculator.js";

/**
 * Report Service for generating formatted reports
 */
export class ReportService {
  constructor() {
    this.recipeCostCalculator = new RecipeCostCalculator();
    this.foodCostCalculator = new FoodCostCalculator();
  }

  /**
   * Generate Escandallo report
   * @param {Object} recipe - Recipe data
   * @returns {Object} - Formatted escandallo report
   */
  generateEscandallo(recipe) {
    // Calculate recipe costs
    const recipeCost = this.recipeCostCalculator.calculateRecipeCost(recipe);

    // Format the report
    const report = {
      recipeName: recipe.name,
      category: recipe.category,
      portions: recipe.portions,
      date: new Date().toISOString().split("T")[0],
      ingredients: [],
      adjustments: {},
      totals: {},
    };

    // Process ingredients
    recipeCost.breakdown.forEach((item) => {
      report.ingredients.push({
        name: item.name,
        quantity: item.quantity.toFixed(2),
        unit: item.unit,
        unitPrice: formatCurrency(item.unitPrice),
        apCost: formatCurrency(item.apCost),
        yield: formatPercentage(item.yieldPercentage),
        epCost: formatCurrency(item.epCost),
        waste: formatCurrency(item.wasteCost),
        percentage: formatPercentage(item.percentageOfTotal, 1),
      });
    });

    // Adjustments
    report.adjustments = {
      spiceFactor: formatPercentage(recipeCost.spiceFactor * 100),
      spiceCost: formatCurrency(recipeCost.spiceCost),
      qFactor: formatPercentage(recipeCost.qFactor * 100),
      qCost: formatCurrency(recipeCost.qCost),
    };

    // Totals
    const directCost = recipeCost.totalCost - recipeCost.spiceCost - recipeCost.qCost;
    const actualFoodCost = (recipeCost.costPerPortion / recipeCost.suggestedPrice) * 100;

    report.totals = {
      directCost: formatCurrency(directCost),
      totalCost: formatCurrency(recipeCost.totalCost),
      costPerPortion: formatCurrency(recipeCost.costPerPortion),
      targetFoodCost: formatPercentage(recipe.targetFoodCost || 30),
      suggestedPrice: formatCurrency(recipeCost.suggestedPrice),
      actualFoodCost: formatPercentage(actualFoodCost, 1),
    };

    return report;
  }

  /**
   * Generate Food Cost Analysis report
   * @param {Object} data - Food cost data
   * @returns {Object} - Formatted food cost report
   */
  generateFoodCostAnalysis(data) {
    const cogs = this.foodCostCalculator.calculateCoGS(
      data.beginningInventory,
      data.purchases,
      data.endingInventory
    );

    const foodCostPercentage = this.foodCostCalculator.calculateTotalFoodCostPercentage(
      cogs,
      data.revenue
    );

    const grossProfitMargin = this.foodCostCalculator.calculateGrossProfitMargin(
      data.revenue,
      cogs
    );

    const primeCost = this.foodCostCalculator.calculatePrimeCost(cogs, data.laborCost || 0);
    const primeCostPercentage = this.foodCostCalculator.calculatePrimeCostPercentage(
      primeCost,
      data.revenue
    );

    return {
      period: data.period,
      date: new Date().toISOString().split("T")[0],
      revenue: formatCurrency(data.revenue),
      cogs: formatCurrency(cogs),
      foodCostPercentage: formatPercentage(foodCostPercentage, 1),
      grossProfitMargin: formatPercentage(grossProfitMargin, 1),
      primeCost: formatCurrency(primeCost),
      primeCostPercentage: formatPercentage(primeCostPercentage, 1),
      performance: this.assessPerformance(foodCostPercentage),
    };
  }

  /**
   * Generate Menu Engineering report
   * @param {Array} menuItems - Array of menu items with sales data
   * @returns {Object} - Menu engineering analysis
   */
  generateMenuEngineering(menuItems) {
    const analysis = this.foodCostCalculator.calculateMenuEngineering(menuItems);

    const report = {
      date: new Date().toISOString().split("T")[0],
      items: [],
      summary: {
        stars: [],
        puzzles: [],
        plowHorses: [],
        dogs: [],
      },
      recommendations: {},
    };

    analysis.forEach((item) => {
      const formattedItem = {
        name: item.name,
        classification: item.classification,
        contributionMargin: formatCurrency(item.contributionMargin),
        unitsSold: item.unitsSold,
        contributionMarginRatio: item.contributionMarginRatio.toFixed(2),
        popularityRatio: item.popularityRatio.toFixed(2),
      };

      report.items.push(formattedItem);

      // Categorize items
      switch (item.classification) {
        case "star":
          report.summary.stars.push(item.name);
          break;
        case "puzzle":
          report.summary.puzzles.push(item.name);
          break;
        case "plow_horse":
          report.summary.plowHorses.push(item.name);
          break;
        case "dog":
          report.summary.dogs.push(item.name);
          break;
      }
    });

    // Add recommendations
    report.recommendations = {
      stars: "Promote heavily, maintain quality and availability",
      puzzles: "Increase visibility through specials and server recommendations",
      plowHorses: "Consider small price increases or portion adjustments",
      dogs: "Remove from menu or completely reimagine",
    };

    return report;
  }

  /**
   * Generate Inventory Valuation report
   * @param {Array} inventory - Inventory items
   * @returns {Object} - Inventory valuation report
   */
  generateInventoryValuation(inventory) {
    const report = {
      date: new Date().toISOString().split("T")[0],
      totalItems: inventory.length,
      totalValue: 0,
      categories: {},
      lowStock: [],
      expiringSoon: [],
      topValueItems: [],
    };

    const today = new Date();
    const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    inventory.forEach((item) => {
      const itemValue = item.quantity * item.unitPrice;
      report.totalValue += itemValue;

      // Categorize
      const category = item.category || "Other";
      if (!report.categories[category]) {
        report.categories[category] = {
          count: 0,
          value: 0,
          percentage: 0,
        };
      }
      report.categories[category].count++;
      report.categories[category].value += itemValue;

      // Check stock levels
      if (item.quantity <= (item.parLevel || 10)) {
        report.lowStock.push({
          name: item.name,
          current: item.quantity,
          par: item.parLevel || 10,
          orderQty: (item.maxLevel || 100) - item.quantity,
        });
      }

      // Check expiry
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        if (expiryDate <= thirtyDays) {
          report.expiringSoon.push({
            name: item.name,
            expiryDate: formatDate(item.expiryDate),
            daysLeft: Math.floor((expiryDate - today) / (24 * 60 * 60 * 1000)),
          });
        }
      }
    });

    // Calculate category percentages
    Object.keys(report.categories).forEach((category) => {
      report.categories[category].percentage =
        (report.categories[category].value / report.totalValue) * 100;
      report.categories[category].value = formatCurrency(report.categories[category].value);
    });

    // Get top value items
    report.topValueItems = inventory
      .map((item) => ({
        name: item.name,
        value: item.quantity * item.unitPrice,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => ({
        name: item.name,
        value: formatCurrency(item.value),
      }));

    report.totalValue = formatCurrency(report.totalValue);

    return report;
  }

  /**
   * Generate Production Schedule report
   * @param {Object} schedule - Production schedule data
   * @returns {Object} - Formatted production schedule
   */
  generateProductionSchedule(schedule) {
    const report = {
      date: schedule.date || new Date().toISOString().split("T")[0],
      shift: schedule.shift || "All Day",
      stations: {},
      timeline: [],
      staffing: {},
      notes: [],
    };

    // Process stations
    if (schedule.stations) {
      Object.entries(schedule.stations).forEach(([station, tasks]) => {
        report.stations[station] = tasks.map((task) => ({
          item: task.item,
          quantity: task.quantity,
          time: task.time,
          priority: task.priority || "Normal",
          status: task.status || "Pending",
        }));
      });
    }

    // Process timeline
    if (schedule.timeline) {
      report.timeline = schedule.timeline.map((entry) => ({
        time: entry.time,
        task: entry.task,
        station: entry.station,
        duration: entry.duration,
      }));
    }

    // Process staffing
    if (schedule.staffing) {
      report.staffing = {
        total: Object.values(schedule.staffing).reduce((sum, count) => sum + count, 0),
        breakdown: schedule.staffing,
      };
    }

    // Add notes
    if (schedule.notes) {
      report.notes = schedule.notes;
    }

    return report;
  }

  /**
   * Generate Profitability Summary
   * @param {Object} financial - Financial data
   * @returns {Object} - Profitability summary report
   */
  generateProfitabilitySummary(financial) {
    const totalRevenue = financial.revenue.food + financial.revenue.beverage + financial.revenue.other;
    const totalCosts = Object.values(financial.costs).reduce((sum, cost) => sum + cost, 0);
    const netProfit = totalRevenue - totalCosts;
    const netMargin = (netProfit / totalRevenue) * 100;

    const primeCost = financial.costs.food + financial.costs.beverage + financial.costs.labor;
    const primeCostPercentage = (primeCost / totalRevenue) * 100;

    return {
      period: financial.period,
      date: new Date().toISOString().split("T")[0],
      revenue: {
        total: formatCurrency(totalRevenue),
        breakdown: {
          food: formatCurrency(financial.revenue.food),
          beverage: formatCurrency(financial.revenue.beverage),
          other: formatCurrency(financial.revenue.other),
        },
      },
      costs: {
        total: formatCurrency(totalCosts),
        breakdown: Object.entries(financial.costs).reduce((acc, [key, value]) => {
          acc[key] = formatCurrency(value);
          return acc;
        }, {}),
      },
      profitability: {
        netProfit: formatCurrency(netProfit),
        netMargin: formatPercentage(netMargin, 1),
        primeCost: formatCurrency(primeCost),
        primeCostPercentage: formatPercentage(primeCostPercentage, 1),
      },
      performance: this.assessProfitability(netMargin),
    };
  }

  /**
   * Assess performance based on food cost percentage
   * @param {number} foodCostPercentage - Food cost percentage
   * @returns {string} - Performance assessment
   */
  assessPerformance(foodCostPercentage) {
    if (foodCostPercentage < 25) return "Excellent";
    if (foodCostPercentage <= 30) return "Good";
    if (foodCostPercentage <= 35) return "Acceptable";
    return "Needs Improvement";
  }

  /**
   * Assess profitability based on net margin
   * @param {number} netMargin - Net profit margin percentage
   * @returns {string} - Profitability assessment
   */
  assessProfitability(netMargin) {
    if (netMargin > 15) return "Excellent";
    if (netMargin > 10) return "Good";
    if (netMargin > 5) return "Acceptable";
    return "Poor";
  }

  /**
   * Export report to CSV format
   * @param {Object} report - Report data
   * @param {string} type - Report type
   * @returns {string} - CSV formatted string
   */
  exportToCSV(report, type) {
    let csv = "";

    switch (type) {
      case "escandallo":
        csv = this.escandalloToCSV(report);
        break;
      case "inventory":
        csv = this.inventoryToCSV(report);
        break;
      case "menu":
        csv = this.menuEngineeringToCSV(report);
        break;
      default:
        csv = this.genericToCSV(report);
    }

    return csv;
  }

  /**
   * Convert escandallo report to CSV
   * @param {Object} report - Escandallo report
   * @returns {string} - CSV string
   */
  escandalloToCSV(report) {
    let csv = `Recipe,${report.recipeName}\n`;
    csv += `Date,${report.date}\n`;
    csv += `Portions,${report.portions}\n\n`;

    csv += "Ingredient,Quantity,Unit,Unit Price,AP Cost,Yield %,EP Cost,Waste,% of Total\n";
    report.ingredients.forEach((item) => {
      csv += `${item.name},${item.quantity},${item.unit},${item.unitPrice},${item.apCost},${item.yield},${item.epCost},${item.waste},${item.percentage}\n`;
    });

    csv += `\nSpice Factor,${report.adjustments.spiceFactor},${report.adjustments.spiceCost}\n`;
    csv += `Q Factor,${report.adjustments.qFactor},${report.adjustments.qCost}\n`;
    csv += `\nTotal Cost,${report.totals.totalCost}\n`;
    csv += `Cost per Portion,${report.totals.costPerPortion}\n`;
    csv += `Suggested Price,${report.totals.suggestedPrice}\n`;
    csv += `Food Cost %,${report.totals.actualFoodCost}\n`;

    return csv;
  }

  /**
   * Convert inventory report to CSV
   * @param {Object} report - Inventory report
   * @returns {string} - CSV string
   */
  inventoryToCSV(report) {
    let csv = `Inventory Valuation Report\n`;
    csv += `Date,${report.date}\n`;
    csv += `Total Items,${report.totalItems}\n`;
    csv += `Total Value,${report.totalValue}\n\n`;

    csv += "Category,Count,Value,Percentage\n";
    Object.entries(report.categories).forEach(([category, data]) => {
      csv += `${category},${data.count},${data.value},${data.percentage.toFixed(1)}%\n`;
    });

    if (report.lowStock.length > 0) {
      csv += "\nLow Stock Items\n";
      csv += "Item,Current,Par Level,Order Qty\n";
      report.lowStock.forEach((item) => {
        csv += `${item.name},${item.current},${item.par},${item.orderQty}\n`;
      });
    }

    return csv;
  }

  /**
   * Convert menu engineering report to CSV
   * @param {Object} report - Menu engineering report
   * @returns {string} - CSV string
   */
  menuEngineeringToCSV(report) {
    let csv = `Menu Engineering Analysis\n`;
    csv += `Date,${report.date}\n\n`;

    csv += "Item,Classification,Contribution Margin,Units Sold,CM Ratio,Popularity Ratio\n`;
    report.items.forEach((item) => {
      csv += `${item.name},${item.classification},${item.contributionMargin},${item.unitsSold},${item.contributionMarginRatio},${item.popularityRatio}\n`;
    });

    csv += "\nClassification Summary\n";
    csv += `Stars,${report.summary.stars.join("; ")}\n`;
    csv += `Puzzles,${report.summary.puzzles.join("; ")}\n`;
    csv += `Plow Horses,${report.summary.plowHorses.join("; ")}\n`;
    csv += `Dogs,${report.summary.dogs.join("; ")}\n`;

    return csv;
  }

  /**
   * Generic report to CSV conversion
   * @param {Object} report - Generic report object
   * @returns {string} - CSV string
   */
  genericToCSV(report) {
    let csv = "";

    // Convert object to CSV recursively
    const processObject = (obj, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          processObject(value, `${prefix}${key}.`);
        } else if (Array.isArray(value)) {
          csv += `${prefix}${key},"${value.join(", ")}"\n`;
        } else {
          csv += `${prefix}${key},${value}\n`;
        }
      });
    };

    processObject(report);
    return csv;
  }
}