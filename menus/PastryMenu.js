import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { PastryCalculator } from "../core/calculations/PastryCalculator.js";
import { clearScreen, displayTitle, displayDivider } from "../utils/display.js";
import {
  formatPercentage,
  formatWeight,
  formatTemperature,
} from "../utils/format.js";

export class PastryMenu {
  constructor() {
    this.calculator = new PastryCalculator();
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("PASTRY ARTS");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. 🥐 Lamination Calculator", value: "lamination" },
            { name: "2. 🍯 Sugar Syrup Stages", value: "syrup" },
            { name: "3. 🍫 Chocolate Tempering", value: "chocolate" },
            { name: "4. 🥛 Custard Scaling", value: "custard" },
            { name: "5. 🌸 Macaron Calculator", value: "macaron" },
            { name: "6. 🥨 Choux Pastry", value: "choux" },
            { name: "7. 🍰 Ganache Ratios", value: "ganache" },
            { name: "8. 🎂 Glaze Calculator", value: "glaze" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "lamination":
          await this.laminationCalculator();
          break;
        case "syrup":
          await this.sugarSyrupCalculator();
          break;
        case "chocolate":
          await this.chocolateTemplering();
          break;
        case "custard":
          await this.custardScaling();
          break;
        case "macaron":
          await this.macaronCalculator();
          break;
        case "choux":
          await this.chouxPastry();
          break;
        case "ganache":
          await this.ganacheRatios();
          break;
        case "glaze":
          await this.glazeCalculator();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async laminationCalculator() {
    console.log(chalk.cyan("\n🥐 Lamination Calculator\n"));

    const productInfo = await inquirer.prompt([
      {
        type: "list",
        name: "product",
        message: "Product type:",
        choices: [
          { name: "Croissant", value: "croissant" },
          { name: "Puff Pastry", value: "puff_pastry" },
          { name: "Danish", value: "danish" },
          { name: "Rough Puff", value: "rough_puff" },
          { name: "Custom", value: "custom" },
        ],
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
    if (productInfo.product === "custom") {
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
      butterRatio = this.calculator.BUTTER_RATIOS[productInfo.product] || 0.3;
    }

    // Get fold sequence
    const foldSequence = await this.getFoldSequence();

    // Calculate results
    const layers = this.calculator.calculateLaminationLayers(foldSequence);
    const butterBlock = this.calculator.calculateButterBlock(
      productInfo.doughWeight,
      butterRatio
    );
    const schedule = this.calculator.calculateLaminationSchedule(
      productInfo.product,
      foldSequence
    );

    // Display results
    this.displayLaminationResults(
      productInfo.product,
      layers,
      butterBlock,
      schedule
    );
    await this.waitForKeypress();
  }

  async getFoldSequence() {
    const folds = [];
    let addMore = true;

    while (addMore) {
      const fold = await inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: `Fold ${folds.length + 1}:`,
          choices: [
            { name: "Single fold (3 layers)", value: "single_fold" },
            { name: "Letter fold (3 layers)", value: "letter_fold" },
            { name: "Book fold (4 layers)", value: "book_fold" },
            { name: "Double fold (4 layers)", value: "double_fold" },
          ],
        },
      ]);

      folds.push({ type: fold.type });

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

  displayLaminationResults(product, layers, butterBlock, schedule) {
    console.log(chalk.green(`\n📊 Lamination Analysis - ${product}\n`));

    // Layers table
    const layerData = [
      ["Layer Type", "Count"],
      ["Butter Layers", layers.butterLayers],
      ["Dough Layers", layers.doughLayers],
      ["Total Layers", layers.totalLayers],
      ["Cross-section (if rolled)", layers.crossSectionLayers],
    ];

    console.log(chalk.yellow("🥐 Layer Count:"));
    console.log(table(layerData));

    // Butter block
    console.log(chalk.yellow("🧈 Butter Block:"));
    const butterData = [
      ["Property", "Value"],
      ["Weight", formatWeight(butterBlock.weight)],
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
    console.log(chalk.yellow("📅 Production Schedule:"));
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

  async sugarSyrupCalculator() {
    console.log(chalk.cyan("\n🍯 Sugar Syrup Calculator\n"));

    const syrupInfo = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Calculation method:",
        choices: [
          { name: "Calculate Brix from ingredients", value: "brix" },
          { name: "Find temperature for target Brix", value: "temp" },
          { name: "Determine stage from temperature", value: "stage" },
        ],
      },
    ]);

    let result;
    switch (syrupInfo.method) {
      case "brix":
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
        result = this.calculator.calculateBrix(
          ingredients.sugar,
          ingredients.water
        );
        this.displayBrixResults(result);
        break;

      case "temp":
        const target = await inquirer.prompt([
          {
            type: "number",
            name: "brix",
            message: "Target Brix:",
            validate: (input) => input > 0 && input <= 100,
          },
        ]);
        result = this.calculator.calculateSyrupTemperature(target.brix);
        this.displayTemperatureResults(result);
        break;

      case "stage":
        const temp = await inquirer.prompt([
          {
            type: "number",
            name: "temperature",
            message: "Current temperature (°C):",
            validate: (input) => input > 0,
          },
        ]);
        result = this.determineStageFromTemp(temp.temperature);
        this.displayStageResults(result);
        break;
    }

    await this.waitForKeypress();
  }

  displayBrixResults(result) {
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

  displayTemperatureResults(result) {
    console.log(chalk.green("\n📊 Temperature for Target Brix\n"));

    const data = [
      ["Property", "Value"],
      ["Stage", result.stage],
      ["Temperature", formatTemperature(result.temperature)],
      ["Range", result.range],
      ["Brix at stage", `${result.brix}°Bx`],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🍬 Applications:"));
    this.calculator.getSyrupApplications(result.stage).forEach((app) => {
      console.log(`  - ${app}`);
    });
  }

  displayStageResults(result) {
    console.log(chalk.green("\n📊 Sugar Stage Identification\n"));
    console.log(
      `Temperature ${result.temperature}°C indicates: ${chalk.bold(
        result.stage
      )}`
    );
    console.log(`Typical Brix: ${result.brix}°Bx`);
    console.log(`Applications: ${result.applications.join(", ")}`);
  }

  determineStageFromTemp(temperature) {
    for (const [stage, temps] of Object.entries(this.calculator.SUGAR_STAGES)) {
      if (temperature >= temps.min && temperature <= temps.max) {
        return {
          temperature,
          stage,
          brix: temps.brix,
          applications: this.calculator.getSyrupApplications(stage),
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

  async chocolateTemplering() {
    console.log(chalk.cyan("\n🍫 Chocolate Tempering Calculator\n"));

    const chocolateInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Chocolate type:",
        choices: ["dark", "milk", "white"],
      },
      {
        type: "number",
        name: "quantity",
        message: "Quantity (g):",
        default: 500,
        validate: (input) => input > 0,
      },
    ]);

    const curve = this.calculator.calculateTemperingCurve(
      chocolateInfo.type,
      chocolateInfo.quantity
    );

    this.displayTemperingCurve(curve);
    await this.waitForKeypress();
  }

  displayTemperingCurve(curve) {
    console.log(chalk.green("\n📊 Chocolate Tempering Curve\n"));

    console.log(chalk.yellow("🌡️  Temperature Steps:"));
    curve.steps.forEach((step, index) => {
      console.log(
        `  ${index + 1}. ${chalk.cyan(step.phase)}: ${formatTemperature(
          step.temperature
        )}`
      );
      console.log(`     ${step.method} (${step.duration} min)`);
    });

    console.log(chalk.yellow("\n🌰 Seed Method:"));
    console.log(
      `  Add ${curve.seedMethod.seedAmount.toFixed(0)}g seed chocolate at ${
        curve.seedMethod.addAt
      }°C`
    );
    console.log(
      `  Mix until temperature reaches ${curve.seedMethod.finalTemp}°C`
    );

    console.log(chalk.yellow("\n⏰ Working Window:"));
    console.log(
      `  Temperature: ${curve.workingWindow.min}-${curve.workingWindow.max}°C`
    );
    console.log(`  Duration: ${curve.workingWindow.duration} minutes`);
  }

  async custardScaling() {
    console.log(chalk.cyan("\n🥛 Custard Calculator\n"));

    const custardInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Custard type:",
        choices: [
          { name: "Crème Anglaise", value: "creme_anglaise" },
          { name: "Pastry Cream", value: "pastry_cream" },
          { name: "Crème Brûlée", value: "creme_brulee" },
          { name: "Flan", value: "flan" },
        ],
      },
      {
        type: "number",
        name: "volume",
        message: "Volume needed (ml):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateCustardScaling(
      custardInfo.type,
      custardInfo.volume
    );

    this.displayCustardRecipe(result);
    await this.waitForKeypress();
  }

  displayCustardRecipe(result) {
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

    console.log(chalk.yellow("📝 Notes:"));
    console.log(`  - Total volume: ${result.volume} ml`);
    console.log(
      `  - Consistency: ${this.calculator.getCustardConsistency(result.type)}`
    );
    console.log(`  - Stir constantly while cooking`);
    console.log(`  - Strain after cooking for smoothness`);
  }

  async macaronCalculator() {
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

    const result = this.calculator.calculateMacaronRatios(shellCount);
    this.displayMacaronRecipe(result);
    await this.waitForKeypress();
  }

  displayMacaronRecipe(result) {
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

    console.log(chalk.yellow("📋 Process:"));
    console.log(`  1. Mix almond flour, powdered sugar, and first egg whites`);
    console.log(
      `  2. Cook sugar and water to ${result.ingredients.syrupTemp}°C`
    );
    console.log(
      `  3. Whip second egg whites, add hot syrup to make Italian meringue`
    );
    console.log(`  4. Fold meringue into almond paste`);
    console.log(`  5. Macaronage to ${result.macaronageConsistency}`);
    console.log(`  6. Pipe and rest for ${result.restingTime}`);
    console.log(`  7. Bake at ${result.bakingTemp}°C for ${result.bakingTime}`);
  }

  async chouxPastry() {
    console.log(chalk.cyan("\n🥨 Choux Pastry Calculator\n"));

    const { flourWeight } = await inquirer.prompt([
      {
        type: "number",
        name: "flourWeight",
        message: "Flour weight (g):",
        default: 100,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateChouxHydration(flourWeight);

    console.log(chalk.green("\n📊 Choux Pastry Formula\n"));

    const ingredients = [
      ["Ingredient", "Amount"],
      ["Flour", `${result.flour}g`],
      ["Water", `${result.water}g`],
      ["Butter", `${result.butter}g`],
      ["Eggs", `${result.eggs}g (≈${result.eggCount} eggs)`],
      ["Salt", `${result.salt}g`],
      ["Sugar (optional)", `${result.sugar}g`],
      ["", ""],
      ["Total Hydration", formatPercentage(result.totalHydration)],
    ];

    console.log(table(ingredients));

    console.log(chalk.yellow("🥄 Technique:"));
    Object.values(result.technique).forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    await this.waitForKeypress();
  }

  async ganacheRatios() {
    console.log(chalk.cyan("\n🍫 Ganache Calculator\n"));

    const ganacheInfo = await inquirer.prompt([
      {
        type: "list",
        name: "chocolate",
        message: "Chocolate type:",
        choices: ["dark", "milk", "white"],
      },
      {
        type: "list",
        name: "application",
        message: "Application:",
        choices: [
          { name: "Glaze (pourable)", value: "glaze" },
          { name: "Filling (pipeable)", value: "filling" },
          { name: "Truffle (firm)", value: "truffle" },
        ],
      },
      {
        type: "number",
        name: "totalWeight",
        message: "Total weight needed (g):",
        default: 500,
        validate: (input) => input > 0,
      },
    ]);

    const ratios = this.calculator.calculateGanache(
      ganacheInfo.chocolate,
      ganacheInfo.application
    );
    const amounts = ratios.calculate(ganacheInfo.totalWeight);

    console.log(chalk.green("\n📊 Ganache Formula\n"));

    const data = [
      ["Component", "Amount"],
      ["Chocolate Type", ganacheInfo.chocolate],
      ["Application", ganacheInfo.application],
      ["Ratio (choc:cream)", ratios.ratio],
      ["", ""],
      ["Chocolate needed", `${amounts.chocolate.toFixed(0)}g`],
      ["Cream needed", `${amounts.cream.toFixed(0)}g`],
      ["Total weight", `${ganacheInfo.totalWeight}g`],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📝 Instructions:"));
    console.log("  1. Chop chocolate finely");
    console.log("  2. Heat cream to just below boiling");
    console.log("  3. Pour cream over chocolate");
    console.log("  4. Let sit 1 minute, then stir from center");
    console.log("  5. Cool to appropriate temperature for use");

    await this.waitForKeypress();
  }

  async glazeCalculator() {
    console.log(chalk.cyan("\n🎂 Glaze Calculator\n"));

    const glazeInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Glaze type:",
        choices: [
          { name: "Mirror Glaze", value: "mirror" },
          { name: "Royal Icing", value: "royal" },
          { name: "Fondant", value: "fondant" },
        ],
      },
      {
        type: "number",
        name: "volume",
        message: "Volume needed (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateGlaze(
      glazeInfo.type,
      glazeInfo.volume
    );

    console.log(chalk.green(`\n📊 ${glazeInfo.type} Glaze Recipe\n`));

    const data = [["Ingredient", "Amount"]];

    if (glazeInfo.type === "mirror") {
      data.push(
        ["Water", `${result.water.toFixed(0)}ml`],
        ["Sugar", `${result.sugar.toFixed(0)}g`],
        ["Glucose syrup", `${result.glucose.toFixed(0)}g`],
        ["Condensed milk", `${result.condensedMilk.toFixed(0)}ml`],
        ["Gelatin sheets", `${result.gelatin.toFixed(0)}g`],
        ["White chocolate", `${result.chocolate.toFixed(0)}g`],
        ["Use temperature", formatTemperature(result.useTemp)]
      );
    } else if (glazeInfo.type === "royal") {
      data.push(
        ["Powdered sugar", `${result.powderedSugar.toFixed(0)}g`],
        ["Egg whites", `${result.eggWhite.toFixed(0)}ml`],
        ["Lemon juice", `${result.lemonJuice.toFixed(0)}ml`],
        ["Consistency", result.consistency]
      );
    } else if (glazeInfo.type === "fondant") {
      data.push(
        ["Sugar", `${result.sugar.toFixed(0)}g`],
        ["Water", `${result.water.toFixed(0)}ml`],
        ["Glucose syrup", `${result.glucose.toFixed(0)}g`],
        ["Cook to", formatTemperature(result.cookTo)],
        ["Working temp", formatTemperature(result.workingTemp)]
      );
    }

    console.log(table(data));
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
