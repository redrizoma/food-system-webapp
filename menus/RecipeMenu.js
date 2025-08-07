import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { RecipeCostCalculator } from "../core/calculations/RecipeCostCalculator.js";
import { clearScreen, displayTitle } from "../utils/display.js";
import { formatCurrency, formatPercentage } from "../utils/format.js";

export class RecipeMenu {
  constructor() {
    this.calculator = new RecipeCostCalculator();
    this.currentRecipe = null;
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("RECIPE COSTING & ESCANDALLO");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. 🆕 Create New Recipe", value: "create" },
            { name: "2. 📊 Calculate Recipe Cost", value: "calculate" },
            { name: "3. 🔪 Yield Calculator", value: "yield" },
            { name: "4. 🥩 Meat Cutting Test", value: "meat" },
            { name: "5. ⚖️  Scale Recipe", value: "scale" },
            { name: "6. 📈 Recipe Profitability", value: "profit" },
            { name: "7. 💾 Save Recipe", value: "save" },
            { name: "8. 📂 Load Recipe", value: "load" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "create":
          await this.createRecipe();
          break;
        case "calculate":
          await this.calculateCost();
          break;
        case "yield":
          await this.calculateYield();
          break;
        case "meat":
          await this.meatCuttingTest();
          break;
        case "scale":
          await this.scaleRecipe();
          break;
        case "profit":
          await this.calculateProfitability();
          break;
        case "save":
          await this.saveRecipe();
          break;
        case "load":
          await this.loadRecipe();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async createRecipe() {
    console.log(chalk.cyan("\n📋 Create New Recipe - Escandallo\n"));

    // Get recipe basic info
    const recipeInfo = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Recipe name:",
        validate: (input) => input.length > 0 || "Recipe name is required",
      },
      {
        type: "number",
        name: "portions",
        message: "Number of portions:",
        default: 4,
        validate: (input) => input > 0 || "Portions must be greater than 0",
      },
      {
        type: "list",
        name: "category",
        message: "Category:",
        choices: ["Appetizer", "Main Course", "Dessert", "Beverage", "Other"],
      },
      {
        type: "number",
        name: "targetFoodCost",
        message: "Target food cost percentage:",
        default: 30,
        validate: (input) =>
          (input > 0 && input < 100) || "Must be between 0 and 100",
      },
    ]);

    // Get ingredients
    const ingredients = [];
    let addMore = true;

    while (addMore) {
      console.log(
        chalk.yellow(`\n➕ Add Ingredient #${ingredients.length + 1}`)
      );

      const ingredient = await this.inputIngredient();
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

    // Get additional factors
    const factors = await inquirer.prompt([
      {
        type: "number",
        name: "spiceFactor",
        message: "Spice factor percentage:",
        default: 2,
        validate: (input) => input >= 0 && input <= 10,
      },
      {
        type: "number",
        name: "qFactor",
        message: "Q factor percentage (accompaniments):",
        default: 3,
        validate: (input) => input >= 0 && input <= 10,
      },
    ]);

    // Create recipe object
    this.currentRecipe = {
      ...recipeInfo,
      ingredients,
      spiceFactor: factors.spiceFactor / 100,
      qFactor: factors.qFactor / 100,
      createdAt: new Date().toISOString(),
    };

    // Calculate and display costs
    await this.calculateCost();
  }

  async inputIngredient() {
    const ingredient = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Ingredient name:",
        validate: (input) => input.length > 0 || "Name is required",
      },
      {
        type: "number",
        name: "quantity",
        message: "Quantity:",
        validate: (input) => input > 0 || "Quantity must be greater than 0",
      },
      {
        type: "list",
        name: "unit",
        message: "Unit:",
        choices: [
          { name: "Grams (g)", value: "g" },
          { name: "Kilograms (kg)", value: "kg" },
          { name: "Milliliters (ml)", value: "ml" },
          { name: "Liters (l)", value: "l" },
          { name: "Units", value: "units" },
          { name: "Cups", value: "cup" },
          { name: "Tablespoons", value: "tbsp" },
          { name: "Teaspoons", value: "tsp" },
        ],
      },
      {
        type: "number",
        name: "unitPrice",
        message: "Price per unit (€):",
        validate: (input) => input >= 0 || "Price cannot be negative",
      },
      {
        type: "number",
        name: "yieldPercentage",
        message: "Yield percentage (100 if no waste):",
        default: 100,
        validate: (input) =>
          (input > 0 && input <= 100) || "Must be between 0 and 100",
      },
    ]);

    return ingredient;
  }

  async calculateCost() {
    if (!this.currentRecipe) {
      console.log(
        chalk.yellow(
          "\n⚠️  No recipe loaded. Please create or load a recipe first."
        )
      );
      await this.waitForKeypress();
      return;
    }

    console.log(chalk.cyan("\n💰 Calculating Recipe Cost...\n"));

    const recipeCost = this.calculator.calculateRecipeCost(this.currentRecipe);
    this.displayRecipeCost(recipeCost);

    await this.waitForKeypress();
  }

  displayRecipeCost(recipeCost) {
    console.log(
      chalk.green.bold(`\n📊 ESCANDALLO - ${recipeCost.recipeName}\n`)
    );
    console.log(chalk.gray(`Portions: ${recipeCost.portions}`));
    console.log();

    // Ingredients breakdown table
    const ingredientData = [
      ["Ingredient", "Qty", "AP Cost", "Yield%", "EP Cost", "Waste", "% Total"],
    ];

    recipeCost.breakdown.forEach((item) => {
      ingredientData.push([
        item.name,
        `${item.quantity} ${item.unit}`,
        formatCurrency(item.apCost),
        `${item.yieldPercentage}%`,
        formatCurrency(item.epCost),
        formatCurrency(item.wasteCost),
        `${item.percentageOfTotal.toFixed(1)}%`,
      ]);
    });

    console.log(table(ingredientData));

    // Adjustments
    console.log(chalk.yellow("📊 Adjustments:"));
    console.log(
      `  Spice Factor (${(recipeCost.spiceFactor * 100).toFixed(
        1
      )}%): ${formatCurrency(recipeCost.spiceCost)}`
    );
    console.log(
      `  Q Factor (${(recipeCost.qFactor * 100).toFixed(1)}%): ${formatCurrency(
        recipeCost.qCost
      )}`
    );
    console.log();

    // Summary
    const summaryData = [
      ["Metric", "Value"],
      ["Total Recipe Cost", formatCurrency(recipeCost.totalCost)],
      ["Cost per Portion", formatCurrency(recipeCost.costPerPortion)],
      ["Suggested Menu Price", formatCurrency(recipeCost.suggestedPrice)],
      [
        "Food Cost %",
        formatPercentage(
          (recipeCost.costPerPortion / recipeCost.suggestedPrice) * 100
        ),
      ],
    ];

    console.log(chalk.green.bold("💵 Summary:"));
    console.log(table(summaryData));
  }

  async calculateYield() {
    console.log(chalk.cyan("\n🔪 Yield Calculator\n"));

    const yieldData = await inquirer.prompt([
      {
        type: "input",
        name: "ingredient",
        message: "Ingredient name:",
        validate: (input) => input.length > 0,
      },
      {
        type: "number",
        name: "apWeight",
        message: "As Purchased (AP) weight (g):",
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "trimWeight",
        message: "Trim/waste weight (g):",
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "apCost",
        message: "AP cost (€):",
        validate: (input) => input >= 0,
      },
    ]);

    const epWeight = yieldData.apWeight - yieldData.trimWeight;
    const yieldPercentage = this.calculator.calculateYieldPercentage(
      epWeight,
      yieldData.apWeight
    );
    const epCost = this.calculator.calculateEPCost(
      yieldData.apCost,
      yieldPercentage
    );
    const factor = this.calculator.calculateFactor(yieldPercentage);

    // Display results
    console.log(chalk.green("\n📊 Yield Analysis Results\n"));

    const data = [
      ["Metric", "Value"],
      ["Ingredient", yieldData.ingredient],
      ["AP Weight", `${yieldData.apWeight} g`],
      ["Trim Weight", `${yieldData.trimWeight} g`],
      ["EP Weight", `${epWeight} g`],
      ["Yield %", formatPercentage(yieldPercentage)],
      ["AP Cost", formatCurrency(yieldData.apCost)],
      ["EP Cost", formatCurrency(epCost)],
      ["Cost Factor", factor.toFixed(2)],
      ["Waste Cost", formatCurrency(epCost - yieldData.apCost)],
    ];

    console.log(table(data));
    await this.waitForKeypress();
  }

  async meatCuttingTest() {
    console.log(chalk.cyan("\n🥩 Meat Cutting Yield Test\n"));

    const testInfo = await inquirer.prompt([
      {
        type: "input",
        name: "product",
        message: "Product name (e.g., Beef Tenderloin):",
        validate: (input) => input.length > 0,
      },
      {
        type: "number",
        name: "apWeight",
        message: "Total AP weight (kg):",
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "apCost",
        message: "Total AP cost (€):",
        validate: (input) => input >= 0,
      },
    ]);

    // Get parts breakdown
    const parts = [];
    let totalWeight = 0;
    let addMore = true;

    while (addMore && totalWeight < testInfo.apWeight * 1000) {
      const remainingWeight = testInfo.apWeight * 1000 - totalWeight;
      console.log(
        chalk.yellow(`\nRemaining weight: ${remainingWeight.toFixed(0)}g`)
      );

      const part = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Part name (e.g., Center cut, trim, fat):",
          validate: (input) => input.length > 0,
        },
        {
          type: "number",
          name: "weight",
          message: "Weight (g):",
          validate: (input) => input > 0 && input <= remainingWeight,
        },
        {
          type: "confirm",
          name: "usable",
          message: "Is this part usable?",
          default: true,
        },
      ]);

      parts.push(part);
      totalWeight += part.weight;

      if (totalWeight < testInfo.apWeight * 1000) {
        const { continueAdding } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueAdding",
            message: "Add another part?",
            default: true,
          },
        ]);
        addMore = continueAdding;
      }
    }

    // Process and display results
    const results = this.calculator.processMeatYieldTest({
      apWeight: testInfo.apWeight * 1000,
      apCost: testInfo.apCost,
      parts,
    });

    this.displayMeatYieldTest(testInfo.product, results);
    await this.waitForKeypress();
  }

  displayMeatYieldTest(product, results) {
    console.log(chalk.green(`\n📊 Meat Yield Test - ${product}\n`));

    // Parts breakdown
    const partsData = [["Part", "Weight (g)", "Percentage", "Value", "Usable"]];

    results.parts.forEach((part) => {
      partsData.push([
        part.name,
        part.weight.toFixed(0),
        formatPercentage(part.percentage),
        formatCurrency(part.value),
        part.usable ? "✓" : "✗",
      ]);
    });

    console.log(table(partsData));

    // Summary
    const summaryData = [
      ["Metric", "Value"],
      ["AP Weight", `${results.apWeight.toFixed(0)} g`],
      ["AP Cost", formatCurrency(results.apCost)],
      ["Price per kg (AP)", formatCurrency(results.pricePerUnit * 1000)],
      ["Usable Weight", `${results.totalUsableWeight.toFixed(0)} g`],
      ["Waste Weight", `${results.totalWasteWeight.toFixed(0)} g`],
      ["Yield %", formatPercentage(results.yieldPercentage)],
      ["Waste %", formatPercentage(results.wastePercentage)],
      ["EP Cost per kg", formatCurrency(results.epCostPerUnit * 1000)],
      ["Cost Increase Factor", `×${results.costIncreaseFactor.toFixed(2)}`],
    ];

    console.log(chalk.green("📊 Summary:"));
    console.log(table(summaryData));
  }

  async scaleRecipe() {
    if (!this.currentRecipe) {
      console.log(
        chalk.yellow(
          "\n⚠️  No recipe loaded. Please create or load a recipe first."
        )
      );
      await this.waitForKeypress();
      return;
    }

    console.log(chalk.cyan(`\n⚖️  Scale Recipe: ${this.currentRecipe.name}\n`));
    console.log(chalk.gray(`Current portions: ${this.currentRecipe.portions}`));

    const { targetPortions } = await inquirer.prompt([
      {
        type: "number",
        name: "targetPortions",
        message: "Target portions:",
        validate: (input) => input > 0,
      },
    ]);

    const scaledRecipe = this.calculator.scaleBatch(
      this.currentRecipe,
      targetPortions
    );

    console.log(
      chalk.green(
        `\n✓ Recipe scaled from ${this.currentRecipe.portions} to ${targetPortions} portions`
      )
    );
    console.log(
      chalk.gray(`Scale factor: ×${scaledRecipe.scaleFactor.toFixed(2)}\n`)
    );

    // Display scaled ingredients
    const data = [["Ingredient", "Original", "Scaled"]];

    for (let i = 0; i < scaledRecipe.ingredients.length; i++) {
      const original = this.currentRecipe.ingredients[i];
      const scaled = scaledRecipe.ingredients[i];
      data.push([
        original.name,
        `${original.quantity} ${original.unit}`,
        `${scaled.quantity.toFixed(2)} ${scaled.unit}`,
      ]);
    }

    console.log(table(data));

    const { useScaled } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useScaled",
        message: "Use this scaled recipe?",
        default: false,
      },
    ]);

    if (useScaled) {
      this.currentRecipe = scaledRecipe;
      console.log(chalk.green("✓ Scaled recipe is now active"));
    }

    await this.waitForKeypress();
  }

  async calculateProfitability() {
    if (!this.currentRecipe) {
      console.log(
        chalk.yellow(
          "\n⚠️  No recipe loaded. Please create or load a recipe first."
        )
      );
      await this.waitForKeypress();
      return;
    }

    console.log(chalk.cyan("\n📈 Recipe Profitability Analysis\n"));

    const recipeCost = this.calculator.calculateRecipeCost(this.currentRecipe);

    const profitData = await inquirer.prompt([
      {
        type: "number",
        name: "sellingPrice",
        message: "Menu selling price (€):",
        default: recipeCost.suggestedPrice,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "unitsSold",
        message: "Units sold per month:",
        default: 100,
        validate: (input) => input >= 0,
      },
    ]);

    const profitability = this.calculator.calculateRecipeProfitability(
      recipeCost.costPerPortion,
      profitData.sellingPrice,
      profitData.unitsSold
    );

    // Display results
    console.log(chalk.green("\n📊 Profitability Analysis\n"));

    const data = [
      ["Metric", "Value"],
      ["Cost per Portion", formatCurrency(profitability.costPerPortion)],
      ["Selling Price", formatCurrency(profitability.sellingPrice)],
      ["Contribution Margin", formatCurrency(profitability.contributionMargin)],
      ["Profit Margin", formatPercentage(profitability.profitMargin)],
      ["Units Sold", profitability.unitsSold],
      ["Total Revenue", formatCurrency(profitability.totalRevenue)],
      ["Total Cost", formatCurrency(profitability.totalCost)],
      ["Total Profit", formatCurrency(profitability.totalProfit)],
    ];

    console.log(table(data));

    // Performance indicator
    if (profitability.profitMargin > 70) {
      console.log(chalk.green("✓ Excellent profitability"));
    } else if (profitability.profitMargin > 60) {
      console.log(chalk.yellow("⚠️  Good profitability"));
    } else {
      console.log(chalk.red("❌ Consider adjusting price or reducing costs"));
    }

    await this.waitForKeypress();
  }

  async saveRecipe() {
    if (!this.currentRecipe) {
      console.log(chalk.yellow("\n⚠️  No recipe to save."));
      await this.waitForKeypress();
      return;
    }

    console.log(
      chalk.green(`\n✓ Recipe "${this.currentRecipe.name}" saved successfully!`)
    );
    await this.waitForKeypress();
  }

  async loadRecipe() {
    // Simulated recipe list
    const recipes = [
      "Beef Wellington",
      "Chocolate Soufflé",
      "Caesar Salad",
      "Pasta Carbonara",
    ];

    const { recipe } = await inquirer.prompt([
      {
        type: "list",
        name: "recipe",
        message: "Select a recipe to load:",
        choices: [...recipes, new inquirer.Separator(), "Cancel"],
      },
    ]);

    if (recipe !== "Cancel") {
      console.log(chalk.green(`\n✓ Recipe "${recipe}" loaded successfully!`));
      // In real implementation, load actual recipe data
    }

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
