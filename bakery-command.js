import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { BakersPercentageCalculator } from "../core/calculations/BakersPercentageCalculator.js";
import { UnitConverter } from "../core/converters/UnitConverter.js";

const calculator = new BakersPercentageCalculator();
const converter = new UnitConverter();

export const bakeryCommand = new Command("bakery").description(
  "Baker's percentage and formula calculations"
);

// Create baker's formula
bakeryCommand
  .command("formula")
  .description("Create and analyze a baker's formula")
  .action(async () => {
    console.log(chalk.cyan("\n🥖 Baker's Formula Creator\n"));

    // Get formula name
    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Formula name:",
        validate: (input) => input.length > 0,
      },
    ]);

    // Get ingredients
    const ingredients = [];
    let totalFlour = 0;

    // First, get all flour types
    console.log(chalk.yellow("\nFlour Components:"));
    let addMoreFlour = true;

    while (addMoreFlour) {
      const flour = await inquirer.prompt([
        {
          type: "list",
          name: "name",
          message: "Flour type:",
          choices: [
            "Bread flour",
            "All-purpose flour",
            "Whole wheat flour",
            "Rye flour",
            "Spelt flour",
            "Other",
          ],
        },
        {
          type: "input",
          name: "customName",
          message: "Specify flour name:",
          when: (answers) => answers.name === "Other",
        },
        {
          type: "number",
          name: "weight",
          message: "Weight (g):",
          validate: (input) => input > 0,
        },
      ]);

      const flourName = flour.customName || flour.name;
      ingredients.push({
        name: flourName,
        type: "flour",
        weight: flour.weight,
      });
      totalFlour += flour.weight;

      const { continueAdding } = await inquirer.prompt([
        {
          type: "confirm",
          name: "continueAdding",
          message: "Add another flour type?",
          default: false,
        },
      ]);
      addMoreFlour = continueAdding;
    }

    console.log(chalk.gray(`Total flour: ${totalFlour}g (100%)`));

    // Get other ingredients
    console.log(chalk.yellow("\nOther Ingredients:"));

    // Water
    const water = await inquirer.prompt([
      {
        type: "number",
        name: "weight",
        message: "Water (g):",
        default: Math.round(totalFlour * 0.65),
        validate: (input) => input >= 0,
      },
    ]);
    if (water.weight > 0) {
      ingredients.push({
        name: "Water",
        type: "liquid",
        weight: water.weight,
      });
    }

    // Salt
    const salt = await inquirer.prompt([
      {
        type: "number",
        name: "weight",
        message: "Salt (g):",
        default: Math.round(totalFlour * 0.02),
        validate: (input) => input >= 0,
      },
    ]);
    if (salt.weight > 0) {
      ingredients.push({
        name: "Salt",
        type: "salt",
        weight: salt.weight,
      });
    }

    // Yeast
    const yeast = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Yeast type:",
        choices: [
          "Fresh yeast",
          "Active dry yeast",
          "Instant yeast",
          "Sourdough starter",
          "None",
        ],
      },
      {
        type: "number",
        name: "weight",
        message: (answers) => `${answers.type} (g):`,
        when: (answers) => answers.type !== "None",
        default: (answers) => {
          if (answers.type === "Fresh yeast")
            return Math.round(totalFlour * 0.02);
          if (answers.type === "Instant yeast")
            return Math.round(totalFlour * 0.01);
          if (answers.type === "Sourdough starter")
            return Math.round(totalFlour * 0.2);
          return Math.round(totalFlour * 0.015);
        },
        validate: (input) => input >= 0,
      },
    ]);

    if (yeast.type !== "None" && yeast.weight > 0) {
      ingredients.push({
        name: yeast.type,
        type: "yeast",
        weight: yeast.weight,
      });
    }

    // Optional ingredients
    const { addOptional } = await inquirer.prompt([
      {
        type: "confirm",
        name: "addOptional",
        message: "Add optional ingredients (sugar, fat, eggs, etc.)?",
        default: false,
      },
    ]);

    if (addOptional) {
      let addMore = true;
      while (addMore) {
        const optional = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: "Ingredient name:",
            validate: (input) => input.length > 0,
          },
          {
            type: "list",
            name: "type",
            message: "Type:",
            choices: ["sugar", "fat", "egg", "milk", "other"],
          },
          {
            type: "number",
            name: "weight",
            message: "Weight (g):",
            validate: (input) => input > 0,
          },
        ]);

        ingredients.push(optional);

        const { continueAdding } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueAdding",
            message: "Add another optional ingredient?",
            default: false,
          },
        ]);
        addMore = continueAdding;
      }
    }

    // Create recipe and calculate formula
    const recipe = { name, ingredients };
    const formula = calculator.convertToBakersPercentages(recipe);

    // Validate formula
    const validation = calculator.validateFormula(formula);

    // Display results
    displayBakersFormula(formula, validation);

    // Ask if user wants to scale
    const { doScale } = await inquirer.prompt([
      {
        type: "confirm",
        name: "doScale",
        message: "Would you like to scale this formula?",
        default: false,
      },
    ]);

    if (doScale) {
      await scaleFormula(formula);
    }
  });

// Scale recipe
bakeryCommand
  .command("scale")
  .description("Scale a recipe using baker's math")
  .action(async () => {
    console.log(chalk.cyan("\n⚖️ Recipe Scaling Calculator\n"));

    // Get scaling method
    const { method } = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Scaling method:",
        choices: [
          "Target flour weight",
          "Target dough weight",
          "Number of pieces",
          "Scaling factor",
        ],
      },
    ]);

    // Quick example formula
    const exampleFormula = {
      name: "Basic Bread",
      formula: [
        { name: "Bread flour", percentage: 100, type: "flour" },
        { name: "Water", percentage: 65, type: "liquid" },
        { name: "Salt", percentage: 2, type: "salt" },
        { name: "Instant yeast", percentage: 1, type: "yeast" },
      ],
      totalFlourWeight: 1000,
      totalPercentage: 168,
      hydration: 65,
    };

    let targetFlourWeight;

    switch (method) {
      case "Target flour weight":
        const flour = await inquirer.prompt([
          {
            type: "number",
            name: "weight",
            message: "Target flour weight (g):",
            validate: (input) => input > 0,
          },
        ]);
        targetFlourWeight = flour.weight;
        break;

      case "Target dough weight":
        const dough = await inquirer.prompt([
          {
            type: "number",
            name: "weight",
            message: "Target dough weight (g):",
            validate: (input) => input > 0,
          },
        ]);
        targetFlourWeight = calculator.calculateFlourWeight(
          dough.weight,
          exampleFormula.totalPercentage
        );
        break;

      case "Number of pieces":
        const pieces = await inquirer.prompt([
          {
            type: "number",
            name: "count",
            message: "Number of pieces:",
            validate: (input) => input > 0,
          },
          {
            type: "number",
            name: "weight",
            message: "Weight per piece (g):",
            validate: (input) => input > 0,
          },
        ]);
        const totalDoughWeight = calculator.calculateDoughWeight(
          pieces.weight,
          pieces.count
        );
        targetFlourWeight = calculator.calculateFlourWeight(
          totalDoughWeight,
          exampleFormula.totalPercentage
        );
        break;

      case "Scaling factor":
        const factor = await inquirer.prompt([
          {
            type: "number",
            name: "value",
            message: "Scaling factor (e.g., 2 for double):",
            validate: (input) => input > 0,
          },
        ]);
        targetFlourWeight = exampleFormula.totalFlourWeight * factor.value;
        break;
    }

    // Scale the recipe
    const scaled = calculator.scaleRecipe(exampleFormula, targetFlourWeight);
    displayScaledRecipe(scaled);
  });

// Calculate hydration
bakeryCommand
  .command("hydration")
  .description("Calculate dough hydration percentage")
  .action(async () => {
    console.log(chalk.cyan("\n💧 Hydration Calculator\n"));

    const { includeStarter } = await inquirer.prompt([
      {
        type: "confirm",
        name: "includeStarter",
        message: "Does recipe include sourdough starter or preferment?",
        default: false,
      },
    ]);

    let flourWeight, waterWeight;

    if (includeStarter) {
      // With starter/preferment
      const amounts = await inquirer.prompt([
        {
          type: "number",
          name: "finalFlour",
          message: "Final dough flour (g):",
          validate: (input) => input >= 0,
        },
        {
          type: "number",
          name: "finalWater",
          message: "Final dough water (g):",
          validate: (input) => input >= 0,
        },
        {
          type: "number",
          name: "starter",
          message: "Starter/preferment weight (g):",
          validate: (input) => input >= 0,
        },
        {
          type: "number",
          name: "starterHydration",
          message: "Starter hydration % (typically 100):",
          default: 100,
          validate: (input) => input > 0,
        },
      ]);

      // Calculate flour and water in starter
      const starterFlour =
        amounts.starter / (1 + amounts.starterHydration / 100);
      const starterWater = amounts.starter - starterFlour;

      flourWeight = amounts.finalFlour + starterFlour;
      waterWeight = amounts.finalWater + starterWater;

      console.log(
        chalk.gray(
          `\nStarter contains: ${starterFlour.toFixed(
            1
          )}g flour, ${starterWater.toFixed(1)}g water`
        )
      );
    } else {
      // Simple calculation
      const amounts = await inquirer.prompt([
        {
          type: "number",
          name: "flour",
          message: "Total flour weight (g):",
          validate: (input) => input > 0,
        },
        {
          type: "number",
          name: "water",
          message: "Total water weight (g):",
          validate: (input) => input >= 0,
        },
      ]);

      flourWeight = amounts.flour;
      waterWeight = amounts.water;
    }

    const hydration = calculator.calculateHydration(waterWeight, flourWeight);

    // Display results
    console.log(chalk.green("\n💧 Hydration Analysis\n"));

    const data = [
      ["Component", "Weight (g)"],
      ["Total Flour", flourWeight.toFixed(1)],
      ["Total Water", waterWeight.toFixed(1)],
      ["", ""],
      ["Hydration", `${hydration.toFixed(1)}%`],
    ];

    console.log(table(data));

    // Provide context
    let breadType = "";
    if (hydration < 50) breadType = "Very stiff (pasta, crackers)";
    else if (hydration <= 57) breadType = "Stiff (bagels, pretzels)";
    else if (hydration <= 65) breadType = "Standard (bread, rolls)";
    else if (hydration <= 75) breadType = "High hydration (artisan bread)";
    else if (hydration <= 85) breadType = "Very high (ciabatta, focaccia)";
    else breadType = "Extremely high (requires advanced technique)";

    console.log(chalk.yellow(`\nDough type: ${breadType}`));
  });

// Preferment calculator
bakeryCommand
  .command("preferment")
  .description("Calculate preferment requirements")
  .action(async () => {
    console.log(chalk.cyan("\n🧫 Preferment Calculator\n"));

    const prefermentInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Preferment type:",
        choices: [
          "Poolish (100% hydration)",
          "Biga (50-60% hydration)",
          "Sourdough starter (100% hydration)",
          "Pâte fermentée (old dough)",
          "Custom",
        ],
      },
      {
        type: "number",
        name: "totalFlour",
        message: "Total flour in final recipe (g):",
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "prefermentPercentage",
        message: "Percentage of flour to preferment (%):",
        default: 20,
        validate: (input) => input > 0 && input <= 50,
      },
    ]);

    // Set hydration based on type
    let prefermentHydration;
    switch (prefermentInfo.type) {
      case "Poolish (100% hydration)":
        prefermentHydration = 100;
        break;
      case "Biga (50-60% hydration)":
        prefermentHydration = 55;
        break;
      case "Sourdough starter (100% hydration)":
        prefermentHydration = 100;
        break;
      case "Pâte fermentée (old dough)":
        prefermentHydration = 65;
        break;
      default:
        const custom = await inquirer.prompt([
          {
            type: "number",
            name: "hydration",
            message: "Preferment hydration (%):",
            validate: (input) => input > 0,
          },
        ]);
        prefermentHydration = custom.hydration;
    }

    // Calculate preferment
    const prefermentFlour =
      prefermentInfo.totalFlour * (prefermentInfo.prefermentPercentage / 100);
    const prefermentWater = prefermentFlour * (prefermentHydration / 100);

    const preferment = calculator.processPreferment(
      {
        type: prefermentInfo.type,
        flourWeight: prefermentFlour,
        waterWeight: prefermentWater,
        fermentationTime: "12-16 hours",
        temperature: "21-24°C",
      },
      prefermentInfo.totalFlour
    );

    // Display results
    displayPreferment(preferment, prefermentInfo.totalFlour);
  });

// Helper functions
function displayBakersFormula(formula, validation) {
  console.log(chalk.green(`\n📊 Baker's Formula - ${formula.name}\n`));

  // Formula table
  const formulaData = [["Ingredient", "Weight (g)", "Baker's %"]];

  formula.formula.forEach((item) => {
    const marker = item.isFlour ? " (flour)" : "";
    formulaData.push([
      item.name + marker,
      item.weight.toFixed(0),
      `${item.percentage.toFixed(1)}%`,
    ]);
  });

  console.log(table(formulaData));

  // Metrics
  console.log(chalk.yellow("Formula Metrics:"));
  console.log(`  Total Flour: ${formula.totalFlourWeight}g`);
  console.log(`  Total Formula: ${formula.totalPercentage.toFixed(1)}%`);
  console.log(`  Hydration: ${formula.hydration.toFixed(1)}%`);

  if (formula.flourBreakdown.length > 1) {
    console.log(chalk.gray("\nFlour Breakdown:"));
    formula.flourBreakdown.forEach((flour) => {
      console.log(
        `  ${flour.name}: ${flour.weight}g (${flour.percentage.toFixed(1)}%)`
      );
    });
  }

  // Validation
  if (validation.errors.length > 0) {
    console.log(chalk.red("\n⚠️ Errors:"));
    validation.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log(chalk.yellow("\n⚠️ Warnings:"));
    validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (validation.isValid && validation.warnings.length === 0) {
    console.log(chalk.green("\n✓ Formula is valid and well-balanced"));
  }
}

function displayScaledRecipe(scaled) {
  console.log(chalk.green(`\n📊 Scaled Recipe - ${scaled.name}\n`));

  const data = [["Ingredient", "Baker's %", "Weight (g)"]];

  scaled.ingredients.forEach((item) => {
    data.push([
      item.name,
      `${item.percentage.toFixed(1)}%`,
      item.weight.toFixed(0),
    ]);
  });

  console.log(table(data));

  console.log(chalk.yellow("Summary:"));
  console.log(`  Target Flour: ${scaled.targetFlourWeight}g`);
  console.log(`  Total Dough: ${scaled.totalDoughWeight.toFixed(0)}g`);
  console.log(`  Scale Factor: ×${scaled.scaleFactor.toFixed(2)}`);
  console.log(`  Hydration: ${scaled.hydration.toFixed(1)}%`);
}

function displayPreferment(preferment, totalFlour) {
  console.log(chalk.green("\n📊 Preferment Calculation\n"));

  const data = [
    ["Component", "Amount"],
    ["Type", preferment.type],
    ["Flour", `${preferment.flourWeight.toFixed(0)}g`],
    ["Water", `${preferment.waterWeight.toFixed(0)}g`],
    ["Total Weight", `${preferment.totalWeight.toFixed(0)}g`],
    ["", ""],
    ["Hydration", `${preferment.hydration.toFixed(1)}%`],
    ["% of Total Flour", `${preferment.flourPercentage.toFixed(1)}%`],
    ["Fermentation Time", preferment.fermentationTime],
    ["Temperature", preferment.temperature],
  ];

  console.log(table(data));

  // Final dough adjustments
  const remainingFlour = totalFlour - preferment.flourWeight;
  console.log(chalk.yellow("\nFinal Dough Adjustments:"));
  console.log(`  Remaining flour to add: ${remainingFlour.toFixed(0)}g`);
  console.log(`  Water in preferment: ${preferment.waterWeight.toFixed(0)}g`);
  console.log(chalk.gray("  (Adjust final dough water accordingly)"));
}

async function scaleFormula(formula) {
  const { targetFlour } = await inquirer.prompt([
    {
      type: "number",
      name: "targetFlour",
      message: "Target flour weight (g):",
      validate: (input) => input > 0,
    },
  ]);

  const scaled = calculator.scaleRecipe(formula, targetFlour);
  displayScaledRecipe(scaled);
}
