import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { BakersPercentageCalculator } from "../core/calculations/BakersPercentageCalculator.js";
import { clearScreen, displayTitle } from "../utils/display.js";
import { formatPercentage, formatWeight } from "../utils/format.js";

export class BakeryMenu {
  constructor() {
    this.calculator = new BakersPercentageCalculator();
    this.currentFormula = null;
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("BAKERY CALCULATIONS");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. 🥖 Create Baker's Formula", value: "formula" },
            { name: "2. ⚖️  Scale Recipe", value: "scale" },
            { name: "3. 💧 Calculate Hydration", value: "hydration" },
            { name: "4. 🧫 Preferment Calculator", value: "preferment" },
            { name: "5. 🥐 Sourdough Starter", value: "sourdough" },
            { name: "6. 📊 Validate Formula", value: "validate" },
            { name: "7. 🍞 Bread Schedule", value: "schedule" },
            { name: "8. 📈 Batch Calculator", value: "batch" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "formula":
          await this.createFormula();
          break;
        case "scale":
          await this.scaleRecipe();
          break;
        case "hydration":
          await this.calculateHydration();
          break;
        case "preferment":
          await this.calculatePreferment();
          break;
        case "sourdough":
          await this.sourdoughCalculator();
          break;
        case "validate":
          await this.validateFormula();
          break;
        case "schedule":
          await this.breadSchedule();
          break;
        case "batch":
          await this.batchCalculator();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async createFormula() {
    console.log(chalk.cyan("\n🥖 Create Baker's Formula\n"));

    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Formula name:",
        validate: (input) => input.length > 0 || "Name is required",
      },
    ]);

    const ingredients = [];
    let totalFlour = 0;

    // Get flour components
    console.log(chalk.yellow("\n📦 Flour Components:"));
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

    console.log(chalk.gray(`\nTotal flour: ${totalFlour}g (100%)`));

    // Get other ingredients
    console.log(chalk.yellow("\n🧂 Other Ingredients:"));

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
          const defaults = {
            "Fresh yeast": Math.round(totalFlour * 0.02),
            "Active dry yeast": Math.round(totalFlour * 0.015),
            "Instant yeast": Math.round(totalFlour * 0.01),
            "Sourdough starter": Math.round(totalFlour * 0.2),
          };
          return defaults[answers.type] || Math.round(totalFlour * 0.01);
        },
      },
    ]);

    if (yeast.type !== "None" && yeast.weight > 0) {
      ingredients.push({
        name: yeast.type,
        type: "yeast",
        weight: yeast.weight,
      });
    }

    // Create recipe and calculate formula
    const recipe = { name, ingredients };
    this.currentFormula = this.calculator.convertToBakersPercentages(recipe);

    // Validate formula
    const validation = this.calculator.validateFormula(this.currentFormula);

    // Display results
    this.displayFormula(this.currentFormula, validation);
    await this.waitForKeypress();
  }

  displayFormula(formula, validation) {
    console.log(chalk.green.bold(`\n📊 Baker's Formula - ${formula.name}\n`));

    const formulaData = [["Ingredient", "Weight (g)", "Baker's %"]];

    formula.formula.forEach((item) => {
      const marker = item.isFlour ? " 🌾" : "";
      formulaData.push([
        item.name + marker,
        item.weight.toFixed(0),
        formatPercentage(item.percentage, 1),
      ]);
    });

    console.log(table(formulaData));

    console.log(chalk.yellow("📈 Formula Metrics:"));
    console.log(`  Total Flour: ${formatWeight(formula.totalFlourWeight)}`);
    console.log(`  Total Formula: ${formatPercentage(formula.totalPercentage, 1)}`);
    console.log(`  Hydration: ${formatPercentage(formula.hydration, 1)}`);

    // Validation feedback
    if (validation.errors.length > 0) {
      console.log(chalk.red("\n⚠️  Errors:"));
      validation.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow("\n⚠️  Warnings:"));
      validation.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (validation.isValid && validation.warnings.length === 0) {
      console.log(chalk.green("\n✓ Formula is valid and well-balanced"));
    }
  }

  async scaleRecipe() {
    if (!this.currentFormula) {
      console.log(chalk.yellow("\n⚠️  No formula loaded. Please create a formula first."));
      await this.waitForKeypress();
      return;
    }

    console.log(chalk.cyan("\n⚖️  Scale Recipe\n"));

    const { method } = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Scaling method:",
        choices: [
          { name: "1. Target flour weight", value: "flour" },
          { name: "2. Target dough weight", value: "dough" },
          { name: "3. Number of pieces", value: "pieces" },
          { name: "4. Scaling factor", value: "factor" },
        ],
      },
    ]);

    let targetFlourWeight;

    switch (method) {
      case "flour":
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

      case "dough":
        const dough = await inquirer.prompt([
          {
            type: "number",
            name: "weight",
            message: "Target dough weight (g):",
            validate: (input) => input > 0,
          },
        ]);
        targetFlourWeight = this.calculator.calculateFlourWeight(
          dough.weight,
          this.currentFormula.totalPercentage
        );
        break;

      case "pieces":
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
        const totalDoughWeight = this.calculator.calculateDoughWeight(
          pieces.weight,
          pieces.count
        );
        targetFlourWeight = this.calculator.calculateFlourWeight(
          totalDoughWeight,
          this.currentFormula.totalPercentage
        );
        break;

      case "factor":
        const factor = await inquirer.prompt([
          {
            type: "number",
            name: "value",
            message: "Scaling factor (e.g., 2 for double):",
            validate: (input) => input > 0,
          },
        ]);
        targetFlourWeight = this.currentFormula.totalFlourWeight * factor.value;
        break;
    }

    const scaled = this.calculator.scaleRecipe(this.currentFormula, targetFlourWeight);
    this.displayScaledRecipe(scaled);
    await this.waitForKeypress();
  }

  displayScaledRecipe(scaled) {
    console.log(chalk.green(`\n📊 Scaled Recipe - ${scaled.name}\n`));

    const data = [["Ingredient", "Baker's %", "Weight (g)"]];

    scaled.ingredients.forEach((item) => {
      data.push([
        item.name,
        formatPercentage(item.percentage, 1),
        item.weight.toFixed(0),
      ]);
    });

    console.log(table(data));

    console.log(chalk.yellow("📈 Summary:"));
    console.log(`  Target Flour: ${formatWeight(scaled.targetFlourWeight)}`);
    console.log(`  Total Dough: ${formatWeight(scaled.totalDoughWeight)}`);
    console.log(`  Scale Factor: ×${scaled.scaleFactor.toFixed(2)}`);
    console.log(`  Hydration: ${formatPercentage(scaled.hydration, 1)}`);
  }

  async calculateHydration() {
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

      const starterFlour = amounts.starter / (1 + amounts.starterHydration / 100);
      const starterWater = amounts.starter - starterFlour;

      flourWeight = amounts.finalFlour + starterFlour;
      waterWeight = amounts.finalWater + starterWater;

      console.log(
        chalk.gray(
          `\nStarter contains: ${starterFlour.toFixed(1)}g flour, ${starterWater.toFixed(1)}g water`
        )
      );
    } else {
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

    const hydration = this.calculator.calculateHydration(waterWeight, flourWeight);

    // Display results
    console.log(chalk.green("\n💧 Hydration Analysis\n"));

    const data = [
      ["Component", "Weight"],
      ["Total Flour", formatWeight(flourWeight)],
      ["Total Water", formatWeight(waterWeight)],
      ["", ""],
      ["Hydration", formatPercentage(hydration, 1)],
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

    console.log(chalk.yellow(`\n🍞 Dough type: ${breadType}`));
    await this.waitForKeypress();
  }

  async calculatePreferment() {
    console.log(chalk.cyan("\n🧫 Preferment Calculator\n"));

    const prefermentInfo = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Preferment type:",
        choices: [
          { name: "Poolish (100% hydration)", value: "poolish" },
          { name: "Biga (50-60% hydration)", value: "biga" },
          { name: "Sourdough starter (100% hydration)", value: "sourdough" },
          { name: "Pâte fermentée (old dough)", value: "pate_fermentee" },
          { name: "Custom", value: "custom" },
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
    const hydrationMap = {
      poolish: 100,
      biga: 55,
      sourdough: 100,
      pate_fermentee: 65,
    };

    let prefermentHydration = hydrationMap[prefermentInfo.type];

    if (prefermentInfo.type === "custom") {
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
    const prefermentFlour = prefermentInfo.totalFlour * (prefermentInfo.prefermentPercentage / 100);
    const prefermentWater = prefermentFlour * (prefermentHydration / 100);

    const preferment = this.calculator.processPreferment(
      {
        type: prefermentInfo.type,
        flourWeight: prefermentFlour,
        waterWeight: prefermentWater,
        fermentationTime: "12-16 hours",
        temperature: "21-24°C",
      },
      prefermentInfo.totalFlour
    );

    this.displayPreferment(preferment, prefermentInfo.totalFlour);
    await this.waitForKeypress();
  }

  displayPreferment(preferment, totalFlour) {
    console.log(chalk.green("\n📊 Preferment Calculation\n"));

    const data = [
      ["Component", "Amount"],
      ["Type", preferment.type],
      ["Flour", formatWeight(preferment.flourWeight)],
      ["Water", formatWeight(preferment.waterWeight)],
      ["Total Weight", formatWeight(preferment.totalWeight)],
      ["", ""],
      ["Hydration", formatPercentage(preferment.hydration, 1)],
      ["% of Total Flour", formatPercentage(preferment.flourPercentage, 1)],
      ["Fermentation Time", preferment.fermentationTime],
      ["Temperature", preferment.temperature],
    ];

    console.log(table(data));

    const remainingFlour = totalFlour - preferment.flourWeight;
    console.log(chalk.yellow("\n📝 Final Dough Adjustments:"));
    console.log(`  Remaining flour to add: ${formatWeight(remainingFlour)}`);
    console.log(`  Water in preferment: ${formatWeight(preferment.waterWeight)}`);
    console.log(chalk.gray("  (Adjust final dough water accordingly)"));
  }

  async sourdoughCalculator() {
    console.log(chalk.cyan("\n🥖 Sourdough Starter Calculator\n"));

    const starterInfo = await inquirer.prompt([
      {
        type: "number",
        name: "currentStarter",
        message: "Current starter amount (g):",
        default: 50,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "ratio",
        message: "Feeding ratio (starter:flour:water):",
        choices: [
          { name: "1:1:1 (Daily maintenance)", value: "1:1:1" },
          { name: "1:2:2 (Mild feed)", value: "1:2:2" },
          { name: "1:3:3 (Moderate feed)", value: "1:3:3" },
          { name: "1:5:5 (Strong feed)", value: "1:5:5" },
          { name: "1:10:10 (Very strong feed)", value: "1:10:10" },
        ],
      },
    ]);

    const result = this.calculator.calculateStarterFeeding(
      starterInfo.currentStarter,
      starterInfo.ratio
    );

    console.log(chalk.green("\n📊 Feeding Calculation\n"));

    const data = [
      ["Component", "Amount"],
      ["Keep Starter", `${result.keepStarter}g`],
      ["Add Flour", `${result.addFlour}g`],
      ["Add Water", `${result.addWater}g`],
      ["", ""],
      ["Total Starter", `${result.totalStarter}g`],
      ["Hydration", formatPercentage(result.hydration, 0)],
      ["Peak Time", result.peakTime],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📅 Feeding Schedule:"));
    console.log("  Daily:");
    console.log(`    - ${result.schedule.daily.morning}`);
    console.log(`    - ${result.schedule.daily.evening}`);
    console.log("  Weekly (if refrigerated):");
    console.log(`    - ${result.schedule.weekly.refresh}`);

    await this.waitForKeypress();
  }

  async validateFormula() {
    if (!this.currentFormula) {
      console.log(chalk.yellow("\n⚠️  No formula loaded. Please create a formula first."));
      await this.waitForKeypress();
      return;
    }

    const validation = this.calculator.validateFormula(this.currentFormula);

    console.log(chalk.cyan(`\n✅ Formula Validation - ${this.currentFormula.name}\n`));

    if (validation.isValid) {
      console.log(chalk.green("✓ Formula is valid!\n"));
    } else {
      console.log(chalk.red("✗ Formula has issues:\n"));
    }

    if (validation.errors.length > 0) {
      console.log(chalk.red("Errors (must fix):"));
      validation.errors.forEach((error) => console.log(`  ❌ ${error}`));
      console.log();
    }

    if (validation.warnings.length > 0) {
      console.log(chalk.yellow("Warnings (consider adjusting):"));
      validation.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`));
    }

    if (validation.isValid && validation.warnings.length === 0) {
      console.log("Your formula is perfectly balanced! 🎉");
    }

    await this.waitForKeypress();
  }

  async breadSchedule() {
    console.log(chalk.cyan("\n📅 Bread Production Schedule\n"));

    const { method } = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Schedule type:",
        choices: [
          { name: "Same day bake", value: "same_day" },
          { name: "Overnight bulk", value: "overnight_bulk" },
          { name: "Overnight proof", value: "overnight_proof" },
          { name: "Two-day process", value: "two_day" },
        ],
      },
    ]);

    const schedules = {
      same_day: [
        { time: "8:00 AM", action: "Mix dough", duration: "10 min" },
        { time: "8:30 AM", action: "Autolyse", duration: "30 min" },
        { time: "9:00 AM", action: "Add salt, knead", duration: "10 min" },
        { time: "9:10 AM", action: "Bulk fermentation", duration: "3 hours" },
        { time: "12:10 PM", action: "Pre-shape", duration: "20 min" },
        { time: "12:30 PM", action: "Final shape", duration: "5 min" },
        { time: "12:35 PM", action: "Final proof", duration: "90 min" },
        { time: "2:05 PM", action: "Score and bake", duration: "35 min" },
        { time: "2:40 PM", action: "Cool", duration: "60 min" },
        { time: "3:40 PM", action: "Ready to serve", duration: "-" },
      ],
      overnight_bulk: [
        { time: "6:00 PM", action: "Mix dough", duration: "10 min" },
        { time: "6:30 PM", action: "Autolyse", duration: "30 min" },
        { time: "7:00 PM", action: "Add salt, knead", duration: "10 min" },
        { time: "7:10 PM", action: "Bulk fermentation", duration: "Overnight" },
        { time: "7:00 AM", action: "Pre-shape", duration: "20 min" },
        { time: "7:20 AM", action: "Final shape", duration: "5 min" },
        { time: "7:25 AM", action: "Final proof", duration: "90 min" },
        { time: "8:55 AM", action: "Score and bake", duration: "35 min" },
        { time: "9:30 AM", action: "Cool", duration: "60 min" },
        { time: "10:30 AM", action: "Ready to serve", duration: "-" },
      ],
    };

    const schedule = schedules[method] || schedules.same_day;

    console.log(chalk.green("\n📋 Production Schedule\n"));

    const data = [["Time", "Action", "Duration"]];
    schedule.forEach((step) => {
      data.push([step.time, step.action, step.duration]);
    });

    console.log(table(data));
    await this.waitForKeypress();
  }

  async batchCalculator() {
    console.log(chalk.cyan("\n📊 Batch Size Calculator\n"));

    const batchInfo = await inquirer.prompt([
      {
        type: "list",
        name: "product",
        message: "Product type:",
        choices: [
          { name: "Baguette (250g)", value: { name: "Baguette", weight: 250 } },
          { name: "Boule (750g)", value: { name: "Boule", weight: 750 } },
          { name: "Batard (500g)", value: { name: "Batard", weight: 500 } },
          { name: "Dinner rolls (80g)", value: { name: "Dinner rolls", weight: 80 } },
          { name: "Croissant (90g)", value: { name: "Croissant", weight: 90 } },
          { name: "Custom", value: { name: "Custom", weight: 0 } },
        ],
      },
      {
        type: "number",
        name: "customWeight",
        message: "Product weight (g):",
        when: (answers) => answers.product.name === "Custom",
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "quantity",
        message: "Number of pieces:",
        validate: (input) => input > 0,
      },
    ]);

    const pieceWeight = batchInfo.customWeight || batchInfo.product.weight;
    const totalDoughNeeded = this.calculator.calculateDoughWeight(
      pieceWeight,
      batchInfo.quantity,
      2 // 2% loss factor
    );

    // Assuming standard bread formula (168% total)
    const flourNeeded = this.calculator.calculateFlourWeight(totalDoughNeeded, 168);

    console.log(chalk.green("\n📊 Batch Calculation Results\n"));

    const data = [
      ["Metric", "Value"],
      ["Product", batchInfo.product.name],
      ["Piece weight", `${pieceWeight}g`],
      ["Quantity", batchInfo.quantity],
      ["", ""],
      ["Raw dough needed", `${(pieceWeight * batchInfo.quantity).toFixed(0)}g`],
      ["With 2% loss factor", `${totalDoughNeeded.toFixed(0)}g`],
      ["", ""],
      ["Flour required", `${flourNeeded.toFixed(0)}g`],
      ["Water (65% hydration)", `${(flourNeeded * 0.65).toFixed(0)}g`],
      ["Salt (2%)", `${(flourNeeded * 0.02).toFixed(0)}g`],
      ["Yeast (1%)", `${(flourNeeded * 0.01).toFixed(0)}g`],
    ];

    console.log(table(data));

    // Mixer capacity check
    if (totalDoughNeeded > 5000) {
      console.log(chalk.yellow("\n⚠️  Large batch - may need multiple mixes"));
      const mixes = Math.ceil(totalDoughNeeded / 5000);
      console.log(`  Suggested: ${mixes} separate mixes`);
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