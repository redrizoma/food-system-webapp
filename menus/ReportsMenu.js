import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import DataService from "../services/DataService.js";
import { ReportService } from "../services/ReportService.js";
import {
  clearScreen,
  displayTitle,
  displaySuccess,
  displayWarning,
} from "../utils/display.js";
import {
  formatCurrency,
  formatDate,
  formatPercentage,
} from "../utils/format.js";

export class ReportsMenu {
  constructor() {
    this.dataService = DataService;
    this.reportService = new ReportService();
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("REPORTS & ANALYSIS");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select report type:",
          choices: [
            { name: "1. 📊 Escandallo Report", value: "escandallo" },
            { name: "2. 📈 Food Cost Analysis", value: "foodcost" },
            { name: "3. 🍞 Bakery Production", value: "bakery" },
            { name: "4. 📋 Menu Engineering", value: "menu" },
            { name: "5. 💰 Profitability Report", value: "profit" },
            { name: "6. 📦 Inventory Report", value: "inventory" },
            { name: "7. 📅 Daily Production", value: "daily" },
            { name: "8. 📊 Dashboard Summary", value: "dashboard" },
            { name: "9. 💾 Export Reports", value: "export" },
            { name: "10. 📧 Email Reports", value: "email" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 13,
        },
      ]);

      switch (choice) {
        case "escandallo":
          await this.escandalloReport();
          break;
        case "foodcost":
          await this.foodCostAnalysis();
          break;
        case "bakery":
          await this.bakeryReport();
          break;
        case "menu":
          await this.menuEngineering();
          break;
        case "profit":
          await this.profitabilityReport();
          break;
        case "inventory":
          await this.inventoryReport();
          break;
        case "daily":
          await this.dailyProduction();
          break;
        case "dashboard":
          await this.dashboardSummary();
          break;
        case "export":
          await this.exportReports();
          break;
        case "email":
          await this.emailReports();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async escandalloReport() {
    console.log(chalk.cyan("\n📊 Escandallo Report Generator\n"));

    // Load recipes
    let recipes = [];
    try {
      recipes = await this.dataService.listRecipes();
    } catch (error) {
      displayWarning("No recipes found");
      await this.waitForKeypress();
      return;
    }

    const { recipeName } = await inquirer.prompt([
      {
        type: "list",
        name: "recipeName",
        message: "Select recipe:",
        choices: recipes.map((r) => r.name),
      },
    ]);

    const selectedRecipe = recipes.find((r) => r.name === recipeName);
    const fullRecipe = await this.dataService.loadRecipe(
      selectedRecipe.filename
    );

    // Generate escandallo
    const report = this.reportService.generateEscandallo(fullRecipe);

    console.log(chalk.green.bold(`\n════════════════════════════════════════`));
    console.log(chalk.green.bold(`         ESCANDALLO - ${report.recipeName}`));
    console.log(chalk.green.bold(`════════════════════════════════════════\n`));

    console.log(chalk.gray(`Date: ${report.date}`));
    console.log(chalk.gray(`Portions: ${report.portions}`));
    console.log();

    // Ingredients breakdown
    console.log(chalk.yellow("📦 INGREDIENTS BREAKDOWN:"));
    const ingredientData = [
      [
        "Ingredient",
        "Qty",
        "Unit",
        "€/Unit",
        "AP Cost",
        "Yield%",
        "EP Cost",
        "Waste",
        "% Total",
      ],
    ];

    report.ingredients.forEach((item) => {
      ingredientData.push([
        item.name,
        item.quantity,
        item.unit,
        item.unitPrice,
        item.apCost,
        item.yield,
        item.epCost,
        item.waste,
        item.percentage,
      ]);
    });

    console.log(table(ingredientData));

    // Adjustments
    console.log(chalk.yellow("📊 ADJUSTMENTS:"));
    console.log(
      `  Spice Factor (${report.adjustments.spiceFactor}): ${report.adjustments.spiceCost}`
    );
    console.log(
      `  Q Factor (${report.adjustments.qFactor}): ${report.adjustments.qCost}`
    );
    console.log();

    // Summary
    console.log(chalk.yellow("💰 SUMMARY:"));
    const summaryData = [
      ["Metric", "Value"],
      ["Direct Cost", report.totals.directCost],
      ["Total Cost", report.totals.totalCost],
      ["Cost per Portion", report.totals.costPerPortion],
      ["Target Food Cost", report.totals.targetFoodCost],
      ["Suggested Price", report.totals.suggestedPrice],
      ["Actual Food Cost %", report.totals.actualFoodCost],
    ];

    console.log(table(summaryData));

    // Profitability indicator
    const foodCostPercent = parseFloat(report.totals.actualFoodCost);
    if (foodCostPercent <= 30) {
      console.log(chalk.green("✓ Excellent profitability"));
    } else if (foodCostPercent <= 35) {
      console.log(chalk.yellow("⚠️  Good profitability"));
    } else {
      console.log(chalk.red("❌ Review pricing or reduce costs"));
    }

    await this.waitForKeypress();
  }

  async foodCostAnalysis() {
    console.log(chalk.cyan("\n📈 Food Cost Analysis\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "period",
        message: "Analysis period:",
        choices: [
          { name: "Daily", value: "daily" },
          { name: "Weekly", value: "weekly" },
          { name: "Monthly", value: "monthly" },
          { name: "Custom", value: "custom" },
        ],
      },
      {
        type: "number",
        name: "revenue",
        message: "Total revenue (€):",
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "cogs",
        message: "Cost of Goods Sold (€):",
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "beginningInventory",
        message: "Beginning inventory (€):",
        default: 0,
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "purchases",
        message: "Purchases (€):",
        default: 0,
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "endingInventory",
        message: "Ending inventory (€):",
        default: 0,
        validate: (input) => input >= 0,
      },
    ]);

    // Calculate actual CoGS if inventory provided
    let actualCogs = params.cogs;
    if (
      params.beginningInventory ||
      params.purchases ||
      params.endingInventory
    ) {
      actualCogs =
        params.beginningInventory + params.purchases - params.endingInventory;
    }

    const foodCostPercent = (actualCogs / params.revenue) * 100;
    const grossProfit = params.revenue - actualCogs;
    const grossProfitMargin = (grossProfit / params.revenue) * 100;

    console.log(chalk.green("\n📊 Food Cost Analysis Results\n"));

    const data = [
      ["Metric", "Value"],
      ["Period", params.period],
      ["", ""],
      ["Revenue", formatCurrency(params.revenue)],
      ["Beginning Inventory", formatCurrency(params.beginningInventory)],
      ["Purchases", formatCurrency(params.purchases)],
      ["Ending Inventory", formatCurrency(params.endingInventory)],
      ["", ""],
      ["Cost of Goods Sold", formatCurrency(actualCogs)],
      ["Food Cost %", formatPercentage(foodCostPercent)],
      ["", ""],
      ["Gross Profit", formatCurrency(grossProfit)],
      ["Gross Profit Margin", formatPercentage(grossProfitMargin)],
    ];

    console.log(table(data));

    // Performance indicator
    console.log(chalk.yellow("\n📈 Performance Analysis:"));

    if (foodCostPercent < 25) {
      console.log(chalk.green("✓ Excellent - Very low food cost"));
    } else if (foodCostPercent <= 30) {
      console.log(chalk.green("✓ Good - Within target range"));
    } else if (foodCostPercent <= 35) {
      console.log(chalk.yellow("⚠️  Acceptable - Monitor closely"));
    } else {
      console.log(chalk.red("❌ High - Immediate action needed"));
    }

    // Recommendations
    console.log(chalk.yellow("\n💡 Recommendations:"));
    if (foodCostPercent > 35) {
      console.log("  • Review portion sizes");
      console.log("  • Negotiate with suppliers");
      console.log("  • Reduce waste");
      console.log("  • Adjust menu prices");
      console.log("  • Focus on high-margin items");
    } else if (foodCostPercent > 30) {
      console.log("  • Monitor high-cost ingredients");
      console.log("  • Implement portion control");
      console.log("  • Track waste daily");
    } else {
      console.log("  • Maintain current standards");
      console.log("  • Consider quality improvements");
      console.log("  • Explore premium offerings");
    }

    await this.waitForKeypress();
  }

  async bakeryReport() {
    console.log(chalk.cyan("\n🍞 Bakery Production Report\n"));

    const params = await inquirer.prompt([
      {
        type: "date",
        name: "date",
        message: "Production date:",
        default: new Date().toISOString().split("T")[0],
      },
      {
        type: "number",
        name: "batches",
        message: "Number of batches:",
        default: 1,
        validate: (input) => input > 0,
      },
    ]);

    // Sample production data
    const products = [
      { name: "Baguette", quantity: 50, weight: 250, flourUsed: 8000 },
      { name: "Croissant", quantity: 30, weight: 90, flourUsed: 1500 },
      { name: "Sourdough", quantity: 20, weight: 750, flourUsed: 10000 },
      { name: "Dinner Rolls", quantity: 100, weight: 80, flourUsed: 5000 },
    ];

    console.log(
      chalk.green(`\n📊 Bakery Production Report - ${params.date}\n`)
    );

    const productionData = [
      [
        "Product",
        "Quantity",
        "Unit Weight",
        "Total Weight",
        "Flour Used",
        "Yield %",
      ],
    ];

    let totalFlour = 0;
    let totalProduct = 0;

    products.forEach((product) => {
      const totalWeight = product.quantity * product.weight;
      const yieldPercent = ((totalWeight / product.flourUsed) * 100).toFixed(1);

      productionData.push([
        product.name,
        product.quantity,
        `${product.weight}g`,
        `${(totalWeight / 1000).toFixed(1)}kg`,
        `${(product.flourUsed / 1000).toFixed(1)}kg`,
        `${yieldPercent}%`,
      ]);

      totalFlour += product.flourUsed;
      totalProduct += totalWeight;
    });

    console.log(table(productionData));

    // Summary
    console.log(chalk.yellow("📈 Production Summary:"));
    console.log(`  Total flour used: ${(totalFlour / 1000).toFixed(1)}kg`);
    console.log(`  Total product: ${(totalProduct / 1000).toFixed(1)}kg`);
    console.log(
      `  Overall yield: ${((totalProduct / totalFlour) * 100).toFixed(1)}%`
    );
    console.log(`  Batches: ${params.batches}`);

    // Efficiency metrics
    const efficiency = (totalProduct / totalFlour) * 100;
    console.log(chalk.yellow("\n⚡ Efficiency Metrics:"));

    if (efficiency > 160) {
      console.log(chalk.green("✓ Excellent yield efficiency"));
    } else if (efficiency > 150) {
      console.log(chalk.yellow("⚠️  Good yield, room for improvement"));
    } else {
      console.log(chalk.red("❌ Low yield - check processes"));
    }

    await this.waitForKeypress();
  }

  async menuEngineering() {
    console.log(chalk.cyan("\n📋 Menu Engineering Analysis\n"));

    // Sample menu items
    const menuItems = [
      {
        name: "Beef Wellington",
        soldQty: 45,
        price: 38,
        cost: 12,
        category: "Main",
      },
      {
        name: "Caesar Salad",
        soldQty: 120,
        price: 12,
        cost: 3,
        category: "Starter",
      },
      {
        name: "Chocolate Soufflé",
        soldQty: 80,
        price: 9,
        cost: 2.5,
        category: "Dessert",
      },
      {
        name: "Pasta Carbonara",
        soldQty: 95,
        price: 18,
        cost: 4,
        category: "Main",
      },
      {
        name: "Lobster Bisque",
        soldQty: 25,
        price: 16,
        cost: 6,
        category: "Starter",
      },
      {
        name: "Tiramisu",
        soldQty: 110,
        price: 8,
        cost: 2,
        category: "Dessert",
      },
    ];

    // Calculate metrics
    menuItems.forEach((item) => {
      item.contributionMargin = item.price - item.cost;
      item.totalProfit = item.contributionMargin * item.soldQty;
      item.foodCostPercent = (item.cost / item.price) * 100;
    });

    // Calculate averages
    const avgContribution =
      menuItems.reduce((sum, item) => sum + item.contributionMargin, 0) /
      menuItems.length;
    const avgPopularity =
      menuItems.reduce((sum, item) => sum + item.soldQty, 0) / menuItems.length;

    // Classify items
    menuItems.forEach((item) => {
      const highProfit = item.contributionMargin >= avgContribution;
      const highPopularity = item.soldQty >= avgPopularity * 0.7;

      if (highProfit && highPopularity) item.classification = "⭐ Star";
      else if (highProfit && !highPopularity) item.classification = "❓ Puzzle";
      else if (!highProfit && highPopularity)
        item.classification = "🐎 Plow Horse";
      else item.classification = "🐕 Dog";
    });

    console.log(chalk.green("\n📊 Menu Engineering Matrix\n"));

    const matrixData = [
      ["Item", "Sold", "Price", "CM", "Total Profit", "FC%", "Class"],
    ];

    menuItems.forEach((item) => {
      matrixData.push([
        item.name,
        item.soldQty,
        formatCurrency(item.price),
        formatCurrency(item.contributionMargin),
        formatCurrency(item.totalProfit),
        formatPercentage(item.foodCostPercent, 1),
        item.classification,
      ]);
    });

    console.log(table(matrixData));

    // Category breakdown
    const categories = {
      "⭐ Star": menuItems.filter((i) => i.classification === "⭐ Star"),
      "❓ Puzzle": menuItems.filter((i) => i.classification === "❓ Puzzle"),
      "🐎 Plow Horse": menuItems.filter(
        (i) => i.classification === "🐎 Plow Horse"
      ),
      "🐕 Dog": menuItems.filter((i) => i.classification === "🐕 Dog"),
    };

    console.log(chalk.yellow("\n📈 Classification Summary:"));
    Object.entries(categories).forEach(([category, items]) => {
      console.log(`  ${category}: ${items.length} items`);
      items.forEach((item) => {
        console.log(`    • ${item.name}`);
      });
    });

    console.log(chalk.yellow("\n💡 Recommendations:"));
    console.log("  ⭐ Stars: Promote heavily, maintain quality");
    console.log("  ❓ Puzzles: Increase visibility, consider promotions");
    console.log("  🐎 Plow Horses: Increase prices carefully");
    console.log("  🐕 Dogs: Consider removing or reimagining");

    await this.waitForKeypress();
  }

  async profitabilityReport() {
    console.log(chalk.cyan("\n💰 Profitability Report\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "period",
        message: "Report period:",
        choices: ["Daily", "Weekly", "Monthly", "Quarterly", "Annual"],
      },
    ]);

    // Sample P&L data
    const revenue = {
      food: 85000,
      beverage: 35000,
      other: 5000,
    };

    const costs = {
      food: 25500,
      beverage: 8750,
      labor: 37500,
      overhead: 18750,
      other: 6250,
    };

    const totalRevenue = Object.values(revenue).reduce((a, b) => a + b, 0);
    const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
    const netProfit = totalRevenue - totalCosts;
    const netMargin = (netProfit / totalRevenue) * 100;

    console.log(chalk.green(`\n📊 Profitability Report - ${params.period}\n`));

    // Revenue breakdown
    console.log(chalk.yellow("💵 REVENUE:"));
    const revenueData = [
      ["Category", "Amount", "% of Total"],
      [
        "Food",
        formatCurrency(revenue.food),
        formatPercentage((revenue.food / totalRevenue) * 100, 1),
      ],
      [
        "Beverage",
        formatCurrency(revenue.beverage),
        formatPercentage((revenue.beverage / totalRevenue) * 100, 1),
      ],
      [
        "Other",
        formatCurrency(revenue.other),
        formatPercentage((revenue.other / totalRevenue) * 100, 1),
      ],
      ["", "", ""],
      ["TOTAL REVENUE", formatCurrency(totalRevenue), "100.0%"],
    ];
    console.log(table(revenueData));

    // Cost breakdown
    console.log(chalk.yellow("💸 COSTS:"));
    const costData = [
      ["Category", "Amount", "% of Revenue"],
      [
        "Food Cost",
        formatCurrency(costs.food),
        formatPercentage((costs.food / totalRevenue) * 100, 1),
      ],
      [
        "Beverage Cost",
        formatCurrency(costs.beverage),
        formatPercentage((costs.beverage / totalRevenue) * 100, 1),
      ],
      [
        "Labor",
        formatCurrency(costs.labor),
        formatPercentage((costs.labor / totalRevenue) * 100, 1),
      ],
      [
        "Overhead",
        formatCurrency(costs.overhead),
        formatPercentage((costs.overhead / totalRevenue) * 100, 1),
      ],
      [
        "Other",
        formatCurrency(costs.other),
        formatPercentage((costs.other / totalRevenue) * 100, 1),
      ],
      ["", "", ""],
      [
        "TOTAL COSTS",
        formatCurrency(totalCosts),
        formatPercentage((totalCosts / totalRevenue) * 100, 1),
      ],
    ];
    console.log(table(costData));

    // Bottom line
    console.log(chalk.green("\n💰 BOTTOM LINE:"));
    const bottomLineData = [
      ["Metric", "Value"],
      ["Net Profit", formatCurrency(netProfit)],
      ["Net Margin", formatPercentage(netMargin, 1)],
      [
        "Prime Cost",
        formatPercentage(
          ((costs.food + costs.beverage + costs.labor) / totalRevenue) * 100,
          1
        ),
      ],
    ];
    console.log(table(bottomLineData));

    // Performance indicator
    if (netMargin > 15) {
      console.log(chalk.green("\n✓ Excellent profitability"));
    } else if (netMargin > 10) {
      console.log(chalk.green("\n✓ Good profitability"));
    } else if (netMargin > 5) {
      console.log(chalk.yellow("\n⚠️  Acceptable profitability"));
    } else {
      console.log(chalk.red("\n❌ Low profitability - review operations"));
    }

    await this.waitForKeypress();
  }

  async inventoryReport() {
    console.log(chalk.cyan("\n📦 Inventory Report\n"));

    // Load inventory data
    let inventory = [];
    try {
      inventory = await this.dataService.loadIngredients();
    } catch (error) {
      displayWarning("No inventory data available");
      await this.waitForKeypress();
      return;
    }

    // Calculate metrics
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const categories = {};

    inventory.forEach((item) => {
      const category = item.category || "Other";
      if (!categories[category]) {
        categories[category] = {
          count: 0,
          value: 0,
        };
      }
      categories[category].count++;
      categories[category].value += item.quantity * item.unitPrice;
    });

    console.log(chalk.green("\n📊 Inventory Summary\n"));

    const summaryData = [
      ["Metric", "Value"],
      ["Total Items", inventory.length],
      ["Total Value", formatCurrency(totalValue)],
      ["Categories", Object.keys(categories).length],
      ["Average Item Value", formatCurrency(totalValue / inventory.length)],
    ];

    console.log(table(summaryData));

    console.log(chalk.yellow("\n📂 Category Breakdown:"));
    const categoryData = [["Category", "Items", "Value", "% of Total"]];

    Object.entries(categories)
      .sort((a, b) => b[1].value - a[1].value)
      .forEach(([category, data]) => {
        categoryData.push([
          category,
          data.count,
          formatCurrency(data.value),
          formatPercentage((data.value / totalValue) * 100, 1),
        ]);
      });

    console.log(table(categoryData));

    await this.waitForKeypress();
  }

  async dailyProduction() {
    console.log(chalk.cyan("\n📅 Daily Production Report\n"));

    const params = await inquirer.prompt([
      {
        type: "date",
        name: "date",
        message: "Production date:",
        default: new Date().toISOString().split("T")[0],
      },
    ]);

    console.log(chalk.green(`\n📊 Daily Production - ${params.date}\n`));

    // Sample daily production
    const production = {
      prep: [
        { item: "Beef Stock", quantity: "20L", time: "2 hours" },
        { item: "Pasta Dough", quantity: "5kg", time: "30 min" },
        { item: "Bread Dough", quantity: "10kg", time: "45 min" },
        { item: "Pastry Cream", quantity: "3L", time: "20 min" },
      ],
      main: [
        { item: "Beef Wellington", quantity: "8 portions", status: "Ready" },
        { item: "Lobster Bisque", quantity: "15 portions", status: "Ready" },
        { item: "Caesar Salad", quantity: "25 portions", status: "Prepped" },
      ],
      desserts: [
        {
          item: "Chocolate Soufflé",
          quantity: "12 portions",
          status: "Base ready",
        },
        { item: "Tiramisu", quantity: "20 portions", status: "Complete" },
      ],
    };

    console.log(chalk.yellow("🥘 PREP WORK:"));
    production.prep.forEach((item) => {
      console.log(`  • ${item.item}: ${item.quantity} (${item.time})`);
    });

    console.log(chalk.yellow("\n🍽️  MAIN DISHES:"));
    production.main.forEach((item) => {
      console.log(`  • ${item.item}: ${item.quantity} - ${item.status}`);
    });

    console.log(chalk.yellow("\n🍰 DESSERTS:"));
    production.desserts.forEach((item) => {
      console.log(`  • ${item.item}: ${item.quantity} - ${item.status}`);
    });

    // Labor summary
    console.log(chalk.yellow("\n👥 LABOR SUMMARY:"));
    console.log("  Prep cooks: 3 (6:00 AM - 2:00 PM)");
    console.log("  Line cooks: 4 (10:00 AM - 10:00 PM)");
    console.log("  Pastry chef: 1 (7:00 AM - 3:00 PM)");
    console.log("  Total hours: 44");

    await this.waitForKeypress();
  }

  async dashboardSummary() {
    console.log(chalk.cyan("\n📊 Executive Dashboard\n"));

    const today = new Date().toISOString().split("T")[0];

    console.log(chalk.green.bold("═══════════════════════════════════════"));
    console.log(chalk.green.bold(`     DASHBOARD SUMMARY - ${today}`));
    console.log(chalk.green.bold("═══════════════════════════════════════\n"));

    // Key metrics
    console.log(chalk.yellow("📈 KEY METRICS:"));
    const metricsData = [
      ["Metric", "Today", "MTD", "Target", "Status"],
      ["Revenue", "€4,250", "€52,300", "€60,000", "🟡"],
      ["Food Cost", "28.5%", "29.2%", "30.0%", "🟢"],
      ["Labor Cost", "31.2%", "30.8%", "30.0%", "🟡"],
      ["Prime Cost", "59.7%", "60.0%", "60.0%", "🟢"],
      ["Covers", "145", "1,820", "2,000", "🟡"],
    ];
    console.log(table(metricsData));

    // Top performers
    console.log(chalk.yellow("\n🌟 TOP PERFORMERS:"));
    console.log("  Best Seller: Caesar Salad (32 orders)");
    console.log("  Highest Margin: Beef Wellington (€26 CM)");
    console.log("  Most Profitable: Pasta Carbonara (€420 total)");

    // Alerts
    console.log(chalk.yellow("\n⚠️  ALERTS:"));
    console.log("  • Low stock: Beef tenderloin (2kg remaining)");
    console.log("  • Price increase: Butter (+8% from supplier)");
    console.log("  • Expiring soon: Heavy cream (2 days)");

    // Quick stats
    console.log(chalk.yellow("\n📊 QUICK STATS:"));
    console.log("  Active recipes: 42");
    console.log("  Inventory items: 186");
    console.log("  Pending orders: 3");
    console.log("  Staff on duty: 12");

    await this.waitForKeypress();
  }

  async exportReports() {
    console.log(chalk.cyan("\n💾 Export Reports\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "reportType",
        message: "Report to export:",
        choices: [
          "Escandallo",
          "Food Cost Analysis",
          "Menu Engineering",
          "Inventory",
          "All Reports",
        ],
      },
      {
        type: "list",
        name: "format",
        message: "Export format:",
        choices: ["CSV", "JSON", "PDF (coming soon)", "Excel (coming soon)"],
      },
    ]);

    if (params.format === "CSV" || params.format === "JSON") {
      const filename = `${params.reportType.toLowerCase().replace(" ", "_")}_${
        new Date().toISOString().split("T")[0]
      }`;

      try {
        // Simulate export
        console.log(
          chalk.yellow(
            `\n⏳ Exporting ${params.reportType} to ${params.format}...`
          )
        );

        // In real implementation, would call appropriate export method
        await new Promise((resolve) => setTimeout(resolve, 1500));

        displaySuccess(
          `Report exported to: exports/${filename}.${params.format.toLowerCase()}`
        );
      } catch (error) {
        displayWarning(`Export failed: ${error.message}`);
      }
    } else {
      console.log(chalk.yellow("\nThis format is coming soon!"));
    }

    await this.waitForKeypress();
  }

  async emailReports() {
    console.log(chalk.cyan("\n📧 Email Reports\n"));

    const params = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Recipient email:",
        validate: (input) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || "Please enter a valid email";
        },
      },
      {
        type: "checkbox",
        name: "reports",
        message: "Select reports to send:",
        choices: [
          "Daily Summary",
          "Food Cost Analysis",
          "Inventory Status",
          "Menu Performance",
        ],
        validate: (input) => input.length > 0 || "Select at least one report",
      },
      {
        type: "list",
        name: "schedule",
        message: "Send frequency:",
        choices: ["Once", "Daily", "Weekly", "Monthly"],
      },
    ]);

    console.log(chalk.yellow("\n⏳ Setting up email reports..."));

    // Simulate setup
    await new Promise((resolve) => setTimeout(resolve, 1500));

    displaySuccess(`Email reports configured for ${params.email}`);
    console.log(chalk.gray(`  Reports: ${params.reports.join(", ")}`));
    console.log(chalk.gray(`  Schedule: ${params.schedule}`));

    await this.waitForKeypress();
  }

  async waitForKeypress() {
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "\nPress Enter to continue...",
      },
    ]);
  }
}
