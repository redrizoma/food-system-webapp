import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { RecipeCostCalculator } from "../core/calculations/RecipeCostCalculator.js";
import { UnitConverter } from "../core/converters/UnitConverter.js";

const calculator = new RecipeCostCalculator();
const converter = new UnitConverter();

export const recipeCommand = new Command("recipe")
  .description("Recipe costing and escandallo calculations")
  .option("-m, --metric", "Use metric units", true)
  .option("-i, --interactive", "Interactive mode");

// Create new recipe
recipeCommand
  .command("create")
  .description("Create a new recipe with cost calculation")
  .action(async () => {
    console.log(chalk.cyan("\n📋 Create New Recipe - Escandallo\n"));

    // Get recipe basic info
    const recipeInfo = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Recipe name:",
        validate: (input) => input.length > 0,
      },
      {
        type: "number",
        name: "portions",
        message: "Number of portions:",
        default: 4,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "targetFoodCost",
        message: "Target food cost percentage:",
        default: 30,
        validate: (input) => input > 0 && input < 100,
      },
    ]);

    // Get ingredients
    const ingredients = [];
    let addMore = true;

    while (addMore) {
      console.log(chalk.yellow(`\nIngredient #${ingredients.length + 1}`));

      const ingredient = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Ingredient name:",
          validate: (input) => input.length > 0,
        },
        {
          type: "number",
          name: "quantity",
          message: "Quantity:",
          validate: (input) => input > 0,
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
          message: "Price per unit (€):",
          validate: (input) => input >= 0,
        },
        {
          type: "number",
          name: "yieldPercentage",
          message: "Yield percentage (100 if no waste):",
          default: 100,
          validate: (input) => input > 0 && input <= 100,
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

    // Get additional factors
    const factors = await inquirer.prompt([
      {
        type: "number",
        name: "spiceFactor",
        message: "Spice factor percentage (for seasonings):",
        default: 2,
        validate: (input) => input >= 0 && input <= 10,
      },
      {
        type: "number",
        name: "qFactor",
        message: "Q factor percentage (for accompaniments):",
        default: 3,
        validate: (input) => input >= 0 && input <= 10,
      },
    ]);

    // Create recipe object
    const recipe = {
      ...recipeInfo,
      ingredients,
      spiceFactor: factors.spiceFactor / 100,
      qFactor: factors.qFactor / 100,
    };

    // Calculate costs
    const recipeCost = calculator.calculateRecipeCost(recipe);

    // Display results
    displayRecipeCost(recipeCost);
  });

// Calculate yield
recipeCommand
  .command("yield")
  .description("Calculate ingredient yield and waste")
  .action(async () => {
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

    // Calculate yield
    const epWeight = yieldData.apWeight - yieldData.trimWeight;
    const yieldPercentage = calculator.calculateYieldPercentage(
      epWeight,
      yieldData.apWeight
    );
    const epCost = calculator.calculateEPCost(
      yieldData.apCost,
      yieldPercentage
    );
    const factor = calculator.calculateFactor(yieldPercentage);

    // Display results
    console.log(chalk.green("\n📊 Yield Analysis Results\n"));

    const data = [
      ["Metric", "Value"],
      ["Ingredient", yieldData.ingredient],
      ["AP Weight", `${yieldData.apWeight} g`],
      ["Trim Weight", `${yieldData.trimWeight} g`],
      ["EP Weight", `${epWeight} g`],
      ["Yield %", `${yieldPercentage.toFixed(2)}%`],
      ["AP Cost", calculator.formatCurrency(yieldData.apCost)],
      ["EP Cost", calculator.formatCurrency(epCost)],
      ["Cost Factor", factor.toFixed(2)],
      ["Waste Cost", calculator.formatCurrency(epCost - yieldData.apCost)],
    ];

    console.log(table(data));
  });

// Meat yield test
recipeCommand
  .command("meat-test")
  .description("Perform meat cutting yield test")
  .action(async () => {
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

      if (totalWeight >= testInfo.apWeight * 1000) {
        addMore = false;
      } else {
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

    // Process yield test
    const results = calculator.processMeatYieldTest({
      apWeight: testInfo.apWeight * 1000,
      apCost: testInfo.apCost,
      parts,
    });

    // Display results
    displayMeatYieldTest(testInfo.product, results);
  });

// Helper function to display recipe cost
function displayRecipeCost(recipeCost) {
  console.log(chalk.green("\n📊 Escandallo - Recipe Cost Analysis\n"));

  // Header
  console.log(chalk.bold(`Recipe: ${recipeCost.recipeName}`));
  console.log(chalk.bold(`Portions: ${recipeCost.portions}`));
  console.log();

  // Ingredients breakdown
  const ingredientData = [
    [
      "Ingredient",
      "Quantity",
      "AP Cost",
      "Yield %",
      "EP Cost",
      "Waste",
      "% of Total",
    ],
  ];

  recipeCost.breakdown.forEach((item) => {
    ingredientData.push([
      item.name,
      `${item.quantity} ${item.unit}`,
      calculator.formatCurrency(item.apCost),
      `${item.yieldPercentage}%`,
      calculator.formatCurrency(item.epCost),
      calculator.formatCurrency(item.wasteCost),
      `${item.percentageOfTotal.toFixed(1)}%`,
    ]);
  });

  console.log(table(ingredientData));

  // Adjustments
  console.log(chalk.yellow("Adjustments:"));
  console.log(
    `  Spice Factor (${(recipeCost.spiceFactor * 100).toFixed(
      1
    )}%): ${calculator.formatCurrency(recipeCost.spiceCost)}`
  );
  console.log(
    `  Q Factor (${(recipeCost.qFactor * 100).toFixed(
      1
    )}%): ${calculator.formatCurrency(recipeCost.qCost)}`
  );
  console.log();

  // Totals
  const totalsData = [
    ["Metric", "Value"],
    ["Total Recipe Cost", calculator.formatCurrency(recipeCost.totalCost)],
    ["Cost per Portion", calculator.formatCurrency(recipeCost.costPerPortion)],
    [
      "Suggested Menu Price",
      calculator.formatCurrency(recipeCost.suggestedPrice),
    ],
    [
      "Food Cost %",
      `${(
        (recipeCost.costPerPortion / recipeCost.suggestedPrice) *
        100
      ).toFixed(1)}%`,
    ],
  ];

  console.log(chalk.green("Summary:"));
  console.log(table(totalsData));
}

// Helper function to display meat yield test
function displayMeatYieldTest(product, results) {
  console.log(chalk.green(`\n📊 Meat Yield Test - ${product}\n`));

  // Parts breakdown
  const partsData = [["Part", "Weight (g)", "Percentage", "Value", "Usable"]];

  results.parts.forEach((part) => {
    partsData.push([
      part.name,
      part.weight.toFixed(0),
      `${part.percentage.toFixed(2)}%`,
      calculator.formatCurrency(part.value),
      part.usable ? "✓" : "✗",
    ]);
  });

  console.log(table(partsData));

  // Summary
  const summaryData = [
    ["Metric", "Value"],
    ["AP Weight", `${results.apWeight.toFixed(0)} g`],
    ["AP Cost", calculator.formatCurrency(results.apCost)],
    [
      "Price per kg (AP)",
      calculator.formatCurrency(results.pricePerUnit * 1000),
    ],
    ["Usable Weight", `${results.totalUsableWeight.toFixed(0)} g`],
    ["Waste Weight", `${results.totalWasteWeight.toFixed(0)} g`],
    ["Yield %", `${results.yieldPercentage.toFixed(2)}%`],
    ["Waste %", `${results.wastePercentage.toFixed(2)}%`],
    ["EP Cost per kg", calculator.formatCurrency(results.epCostPerUnit * 1000)],
    ["Cost Increase Factor", `×${results.costIncreaseFactor.toFixed(2)}`],
  ];

  console.log(chalk.green("Summary:"));
  console.log(table(summaryData));
}
