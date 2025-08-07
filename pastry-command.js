import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { PastryCalculator } from "../core/calculations/PastryCalculator.js";

const calculator = new PastryCalculator();

export const pastryCommand = new Command("pastry").description(
  "Pastry and advanced baking calculations"
);

// Lamination calculator
pastryCommand
  .command("lamination")
  .description("Calculate lamination layers and schedule")
  .action(async () => {
    console.log(chalk.cyan("\n🥐 Lamination Calculator\n"));

    const productInfo = await inquirer.prompt([
      {
        type: "list",
        name: "product",
        message: "Product type:",
        choices: ["Croissant", "Puff Pastry", "Danish", "Rough Puff", "Custom"],
      },
      {
        type: "number",
        name: "doughWeight",
        message: "Dough weight (g):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    // Get butter ratio
    let butterRatio;
    if (productInfo.product === "Custom") {
      const custom = await inquirer.prompt([
        {
          type: "number",
          name: "butterRatio",
          message: "Butter to dough ratio (%):",
          default: 30,
          validate: (input) => input > 0 && input <= 100,
        },
      ]);
      butterRatio = custom.butterRatio / 100;
    } else {
      butterRatio =
        calculator.BUTTER_RATIOS[
          productInfo.product.toLowerCase().replace(" ", "_")
        ];
    }

    // Get fold sequence
    const foldSequence = await getFoldSequence();

    // Calculate results
    const layers = calculator.calculateLaminationLayers(foldSequence);
    const butterBlock = calculator.calculateButterBlock(
      productInfo.doughWeight,
      butterRatio
    );
    const schedule = calculator.calculateLaminationSchedule(
      productInfo.product.toLowerCase(),
      foldSequence
    );

    // Display results
    displayLaminationResults(
      productInfo.product,
      layers,
      butterBlock,
      schedule
    );
  });

// Sugar syrup calculator
pastryCommand
  .command("syrup")
  .description("Calculate sugar syrup concentrations and stages")
  .action(async () => {
    console.log(chalk.cyan("\n🍯 Sugar Syrup Calculator\n"));

    const syrupInfo = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Calculation method:",
        choices: [
          "Calculate Brix from ingredients",
          "Find temperature for target Brix",
          "Determine stage from temperature",
        ],
      },
    ]);

    let result;
    switch (syrupInfo.method) {
      case "Calculate Brix from ingredients":
        const ingredients = await inquirer.prompt([
          {
            type: "number",
            name: "sugar",
            message: "Sugar weight (g):",
            validate: (input) => input >= 0,
          },
          {
            type: "number",
            name: "water",
            message: "Water weight (g):",
            validate: (input) => input >= 0,
          },
        ]);
        result = calculator.calculateBrix(ingredients.sugar, ingredients.water);
        displayBrixResults(result);
        break;

      case "Find temperature for target Brix":
        const target = await inquirer.prompt([
          {
            type: "number",
            name: "brix",
            message: "Target Brix:",
            validate: (input) => input > 0 && input <= 100,
          },
        ]);
        result = calculator.calculateSyrupTemperature(target.brix);
        displayTemperatureResults(result);
        break;

      case "Determine stage from temperature":
        const temp = await inquirer.prompt([
          {
            type: "number",
            name: "temperature",
            message: "Current temperature (°C):",
            validate: (input) => input > 0,
          },
        ]);
        result = determineStageFromTemp(temp.temperature);
        displayStageResults(result);
        break;
    }
  });

// Chocolate tempering
pastryCommand
  .command("tempering")
  .description("Calculate chocolate tempering curves")
  .action(async () => {
    console.log(chalk.cyan("\n🍫 Chocolate Tempering Calculator\n"));

    const chocolateInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Chocolate type:",
        choices: ["Dark", "Milk", "White"],
      },
      {
        type: "number",
        name: "quantity",
        message: "Quantity (g):",
        default: 500,
        validate: (input) => input > 0,
      },
    ]);

    const curve = calculator.calculateTemperingCurve(
      chocolateInfo.type.toLowerCase(),
      chocolateInfo.quantity
    );

    displayTemperingCurve(curve);
  });

// Custard calculator
pastryCommand
  .command("custard")
  .description("Calculate custard scaling and ratios")
  .action(async () => {
    console.log(chalk.cyan("\n🥛 Custard Calculator\n"));

    const custardInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Custard type:",
        choices: ["Crème Anglaise", "Pastry Cream", "Crème Brûlée", "Flan"],
      },
      {
        type: "number",
        name: "volume",
        message: "Volume needed (ml):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    const type = custardInfo.type.toLowerCase().replace(/[^a-z]/g, "_");
    const result = calculator.calculateCustardScaling(type, custardInfo.volume);

    displayCustardRecipe(result);
  });

// Macaron calculator
pastryCommand
  .command("macaron")
  .description("Calculate macaron shell ratios")
  .action(async () => {
    console.log(chalk.cyan("\n🌸 Macaron Calculator (Italian Method)\n"));

    const { shellCount } = await inquirer.prompt([
      {
        type: "number",
        name: "shellCount",
        message: "Number of shells needed:",
        default: 40,
        validate: (input) => input > 0,
      },
    ]);

    const result = calculator.calculateMacaronRatios(shellCount);
    displayMacaronRecipe(result);
  });

// Helper functions
async function getFoldSequence() {
  const folds = [];
  let addMore = true;

  while (addMore) {
    const fold = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: `Fold ${folds.length + 1}:`,
        choices: [
          "Single fold (3 layers)",
          "Letter fold (3 layers)",
          "Book fold (4 layers)",
          "Double fold (4 layers)",
        ],
      },
    ]);

    const foldType =
      fold.type.includes("Single") || fold.type.includes("Letter")
        ? "single_fold"
        : "book_fold";

    folds.push({ type: foldType });

    if (folds.length >= 3) {
      const { continue: cont } = await inquirer.prompt([
        {
          type: "confirm",
          name: "continue",
          message: "Add another fold?",
          default: false,
        },
      ]);
      addMore = cont;
    }
  }

  // Ask if rolling (for croissants)
  const { rolled } = await inquirer.prompt([
    {
      type: "confirm",
      name: "rolled",
      message: "Will the dough be rolled (e.g., croissant)?",
      default: false,
    },
  ]);

  if (rolled) {
    folds[folds.length - 1].rolled = true;
  }

  return folds;
}

function displayLaminationResults(product, layers, butterBlock, schedule) {
  console.log(chalk.green(`\n📊 Lamination Analysis - ${product}\n`));

  // Layers table
  const layerData = [
    ["Layer Type", "Count"],
    ["Butter Layers", layers.butterLayers],
    ["Dough Layers", layers.doughLayers],
    ["Total Layers", layers.totalLayers],
    ["Cross-section (if rolled)", layers.crossSectionLayers],
  ];

  console.log(chalk.yellow("Layer Count:"));
  console.log(table(layerData));

  // Butter block
  console.log(chalk.yellow("Butter Block:"));
  const butterData = [
    ["Property", "Value"],
    ["Weight", `${butterBlock.weight.toFixed(0)}g`],
    ["Thickness", `${butterBlock.thickness}mm`],
    [
      "Dimensions",
      `${butterBlock.dimensions.length.toFixed(
        0
      )} × ${butterBlock.dimensions.width.toFixed(0)}mm`,
    ],
    [
      "Dough size",
      `${butterBlock.doughDimensions.length.toFixed(
        0
      )} × ${butterBlock.doughDimensions.width.toFixed(0)}mm`,
    ],
  ];
  console.log(table(butterData));

  // Schedule
  console.log(chalk.yellow("Production Schedule:"));
  schedule.schedule.forEach((step) => {
    console.log(`  ${chalk.cyan(step.step)}`);
    console.log(
      `    Time: ${step.time} min | Temp: ${step.temperature}°C | Rest: ${step.rest} min`
    );
  });
  console.log(
    `\n  Total time: ${schedule.totalTime} minutes (${schedule.totalDays} day(s))`
  );
}

function displayBrixResults(result) {
  console.log(chalk.green("\n📊 Brix Calculation Results\n"));

  const data = [
    ["Property", "Value"],
    ["Brix", `${result.brix.toFixed(1)}°Bx`],
    ["Specific Gravity", result.specificGravity.toFixed(3)],
    ["Density", `${result.density.toFixed(3)} g/ml`],
    ["Volume", `${result.volume.toFixed(0)} ml`],
  ];

  console.log(table(data));
}

function displayTemperatureResults(result) {
  console.log(chalk.green("\n📊 Temperature for Target Brix\n"));

  const data = [
    ["Property", "Value"],
    ["Stage", result.stage],
    ["Temperature", `${result.temperature}°C`],
    ["Range", result.range],
    ["Brix at stage", `${result.brix}°Bx`],
  ];

  console.log(table(data));

  console.log(chalk.yellow("\nApplications:"));
  calculator.getSyrupApplications(result.stage).forEach((app) => {
    console.log(`  - ${app}`);
  });
}

function displayStageResults(result) {
  console.log(chalk.green("\n📊 Sugar Stage Identification\n"));
  console.log(
    `Temperature ${result.temperature}°C indicates: ${chalk.bold(result.stage)}`
  );
  console.log(`Typical Brix: ${result.brix}°Bx`);
  console.log(`Applications: ${result.applications.join(", ")}`);
}

function determineStageFromTemp(temperature) {
  for (const [stage, temps] of Object.entries(calculator.SUGAR_STAGES)) {
    if (temperature >= temps.min && temperature <= temps.max) {
      return {
        temperature,
        stage,
        brix: temps.brix,
        applications: calculator.getSyrupApplications(stage),
      };
    }
  }
  return {
    temperature,
    stage: "caramel",
    brix: 100,
    applications: ["Caramel sauce", "Pralines"],
  };
}

function displayTemperingCurve(curve) {
  console.log(chalk.green("\n📊 Chocolate Tempering Curve\n"));

  console.log(chalk.yellow("Temperature Steps:"));
  curve.steps.forEach((step, index) => {
    console.log(
      `  ${index + 1}. ${chalk.cyan(step.phase)}: ${step.temperature}°C`
    );
    console.log(`     ${step.method} (${step.duration} min)`);
  });

  console.log(chalk.yellow("\nSeed Method:"));
  console.log(
    `  Add ${curve.seedMethod.seedAmount.toFixed(0)}g seed chocolate at ${
      curve.seedMethod.addAt
    }°C`
  );
  console.log(
    `  Mix until temperature reaches ${curve.seedMethod.finalTemp}°C`
  );

  console.log(chalk.yellow("\nWorking Window:"));
  console.log(
    `  Temperature: ${curve.workingWindow.min}-${curve.workingWindow.max}°C`
  );
  console.log(`  Duration: ${curve.workingWindow.duration} minutes`);
}

function displayCustardRecipe(result) {
  console.log(chalk.green(`\n📊 ${result.type} Recipe\n`));

  const ingredients = [
    ["Ingredient", "Amount"],
    ["Milk", `${result.milkVolume.toFixed(0)} ml`],
    ["Cream", `${result.creamVolume.toFixed(0)} ml`],
    ["Sugar", `${result.totalSugar.toFixed(0)} g`],
    ["Whole eggs", result.wholeEggs],
    ["Egg yolks", result.eggYolks],
    ["Cooking temp", `${result.cookingTemp}°C (do not exceed)`],
  ];

  console.log(table(ingredients));

  console.log(chalk.yellow("Notes:"));
  console.log(`  - Total volume: ${result.volume} ml`);
  console.log(
    `  - Consistency: ${calculator.getCustardConsistency(result.type)}`
  );
  console.log(`  - Stir constantly while cooking`);
  console.log(`  - Strain after cooking for smoothness`);
}

function displayMacaronRecipe(result) {
  console.log(chalk.green("\n📊 Macaron Recipe (Italian Method)\n"));

  const ingredients = [
    ["Ingredient", "Amount"],
    ["Almond flour", `${result.ingredients.almondFlour}g`],
    ["Powdered sugar", `${result.ingredients.powderedSugar}g`],
    ["Egg whites (paste)", `${result.ingredients.eggWhites1}g`],
    ["Egg whites (meringue)", `${result.ingredients.eggWhites2}g`],
    ["Granulated sugar", `${result.ingredients.granulatedSugar}g`],
    ["Water", `${result.ingredients.water}g`],
    ["Syrup temperature", `${result.ingredients.syrupTemp}°C`],
  ];

  console.log(table(ingredients));

  console.log(chalk.yellow("Process:"));
  console.log(`  1. Mix almond flour, powdered sugar, and first egg whites`);
  console.log(`  2. Cook sugar and water to ${result.ingredients.syrupTemp}°C`);
  console.log(
    `  3. Whip second egg whites, add hot syrup to make Italian meringue`
  );
  console.log(`  4. Fold meringue into almond paste`);
  console.log(`  5. Macaronage to ${result.macaronageConsistency}`);
  console.log(`  6. Pipe and rest for ${result.restingTime}`);
  console.log(`  7. Bake at ${result.bakingTemp}°C for ${result.bakingTime}`);
}
