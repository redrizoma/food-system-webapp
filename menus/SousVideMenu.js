import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { SousVideFermentationCalculator } from "../core/calculations/SousVideFermentationCalculator.js";
import { clearScreen, displayTitle, displayDivider } from "../utils/display.js";
import {
  formatTemperature,
  formatDuration,
  formatPercentage,
} from "../utils/format.js";

export class SousVideMenu {
  constructor() {
    this.calculator = new SousVideFermentationCalculator();
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("SOUS VIDE PRECISION COOKING");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. ⏱️  Time & Temperature Calculator", value: "time" },
            {
              name: "2. 🦠 Pasteurization Calculator",
              value: "pasteurization",
            },
            { name: "3. 📊 Cooking Chart Generator", value: "chart" },
            { name: "4. 🥩 Thickness-Based Timing", value: "thickness" },
            { name: "5. 🌡️  Multi-Stage Cooking", value: "multistage" },
            { name: "6. 🔬 Safety Validation", value: "safety" },
            { name: "7. 📖 Temperature Guide", value: "guide" },
            { name: "8. 🧮 Texture Calculator", value: "texture" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "time":
          await this.timeTemperatureCalculator();
          break;
        case "pasteurization":
          await this.pasteurizationCalculator();
          break;
        case "chart":
          await this.cookingChartGenerator();
          break;
        case "thickness":
          await this.thicknessCalculator();
          break;
        case "multistage":
          await this.multiStageCooking();
          break;
        case "safety":
          await this.safetyValidation();
          break;
        case "guide":
          await this.temperatureGuide();
          break;
        case "texture":
          await this.textureCalculator();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async timeTemperatureCalculator() {
    console.log(chalk.cyan("\n⏱️  Time & Temperature Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "protein",
        message: "Protein type:",
        choices: [
          { name: "Beef", value: "beef" },
          { name: "Pork", value: "pork" },
          { name: "Lamb", value: "lamb" },
          { name: "Chicken", value: "chicken" },
          { name: "Fish", value: "fish" },
          { name: "Vegetables", value: "vegetables" },
        ],
      },
      {
        type: "number",
        name: "thickness",
        message: "Thickness (mm):",
        default: 25,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "shape",
        message: "Shape:",
        choices: [
          { name: "Slab (steak, chop)", value: "slab" },
          { name: "Cylinder (roast)", value: "cylinder" },
          { name: "Sphere (meatball)", value: "sphere" },
        ],
      },
    ]);

    // Get doneness preference based on protein
    let targetTemp;
    if (params.protein === "beef" || params.protein === "lamb") {
      const { doneness } = await inquirer.prompt([
        {
          type: "list",
          name: "doneness",
          message: "Doneness:",
          choices: [
            { name: "Rare (49°C)", value: "rare" },
            { name: "Medium Rare (55°C)", value: "medium_rare" },
            { name: "Medium (60°C)", value: "medium" },
            { name: "Medium Well (65°C)", value: "medium_well" },
            { name: "Well Done (71°C)", value: "well" },
          ],
        },
      ]);
      targetTemp = this.calculator.DONENESS_TEMPS[params.protein][doneness];
    } else if (params.protein === "chicken") {
      const { doneness } = await inquirer.prompt([
        {
          type: "list",
          name: "doneness",
          message: "Texture preference:",
          choices: [
            { name: "Tender (60°C)", value: "tender" },
            { name: "Traditional (65°C)", value: "traditional" },
            { name: "Fall Apart (74°C)", value: "fall_apart" },
          ],
        },
      ]);
      targetTemp = this.calculator.DONENESS_TEMPS[params.protein][doneness];
    } else if (params.protein === "fish") {
      const { doneness } = await inquirer.prompt([
        {
          type: "list",
          name: "doneness",
          message: "Doneness:",
          choices: [
            { name: "Rare (46°C)", value: "rare" },
            { name: "Medium Rare (50°C)", value: "medium_rare" },
            { name: "Medium (55°C)", value: "medium" },
            { name: "Flaky (60°C)", value: "flaky" },
          ],
        },
      ]);
      targetTemp = this.calculator.DONENESS_TEMPS[params.protein][doneness];
    } else {
      targetTemp = params.protein === "pork" ? 60 : 85; // Default for pork and vegetables
    }

    const result = this.calculator.calculateHeatingTime(
      params.thickness,
      params.shape,
      params.protein,
      targetTemp
    );

    this.displayHeatingTimeResults(params, targetTemp, result);
    await this.waitForKeypress();
  }

  displayHeatingTimeResults(params, targetTemp, result) {
    console.log(chalk.green("\n📊 Heating Time Calculation\n"));

    const data = [
      ["Parameter", "Value"],
      ["Protein", params.protein],
      ["Thickness", `${params.thickness}mm`],
      ["Shape", params.shape],
      ["Target Temperature", formatTemperature(targetTemp)],
      ["", ""],
      ["Heating Time", formatDuration(result.heatingTime)],
      ["Core Reach Time", formatDuration(result.coreReachTime)],
      ["Safety Margin", formatDuration(result.safetyMargin)],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📝 Notes:"));
    result.notes.forEach((note) => {
      console.log(`  • ${note}`);
    });
  }

  async pasteurizationCalculator() {
    console.log(chalk.cyan("\n🦠 Pasteurization Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "temperature",
        message: "Cooking temperature (°C):",
        default: 60,
        validate: (input) => input >= 52 && input <= 95,
      },
      {
        type: "number",
        name: "thickness",
        message: "Thickness (mm):",
        default: 25,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "protein",
        message: "Protein type:",
        choices: ["beef", "pork", "lamb", "chicken", "fish"],
      },
      {
        type: "list",
        name: "pathogen",
        message: "Target pathogen:",
        choices: [
          { name: "Salmonella (most common)", value: "salmonella" },
          { name: "Listeria", value: "listeria" },
          { name: "E. coli", value: "e_coli" },
          { name: "C. perfringens", value: "c_perfringens" },
        ],
      },
    ]);

    const result = this.calculator.calculatePasteurizationTime(
      params.temperature,
      params.thickness,
      params.protein,
      params.pathogen
    );

    this.displayPasteurizationResults(result);
    await this.waitForKeypress();
  }

  displayPasteurizationResults(result) {
    console.log(chalk.green("\n📊 Pasteurization Analysis\n"));

    const data = [
      ["Parameter", "Value"],
      ["Target Pathogen", result.pathogen],
      ["Temperature", formatTemperature(result.temperature)],
      ["D-value at temp", `${result.dValue} minutes`],
      ["Log Reduction", result.logReduction],
      ["", ""],
      ["Pasteurization Time", formatDuration(result.pasteurizationTime)],
      ["Heating Time", formatDuration(result.heatingTime)],
      ["Total Time Required", formatDuration(result.totalTime)],
    ];

    console.log(table(data));

    const safetyColor = result.safety.includes("Safe")
      ? chalk.green
      : chalk.yellow;
    console.log(safetyColor(`\n🛡️  Safety: ${result.safety}`));
  }

  async cookingChartGenerator() {
    console.log(chalk.cyan("\n📊 Cooking Chart Generator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "protein",
        message: "Protein type:",
        choices: ["beef", "pork", "lamb", "chicken", "fish"],
      },
      {
        type: "number",
        name: "thickness",
        message: "Thickness (mm):",
        default: 25,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "doneness",
        message: "Doneness level:",
        choices: (answers) => {
          if (answers.protein === "beef" || answers.protein === "lamb") {
            return ["rare", "medium_rare", "medium", "medium_well", "well"];
          } else if (answers.protein === "chicken") {
            return ["tender", "traditional", "fall_apart"];
          } else if (answers.protein === "fish") {
            return ["rare", "medium_rare", "medium", "flaky"];
          } else {
            return ["medium"];
          }
        },
      },
    ]);

    const result = this.calculator.generateSousVideChart(
      params.protein,
      params.thickness,
      params.doneness
    );

    this.displayCookingChart(result);
    await this.waitForKeypress();
  }

  displayCookingChart(result) {
    console.log(chalk.green(`\n📊 Sous Vide Cooking Chart\n`));
    console.log(
      chalk.bold(
        `${result.protein} - ${result.thickness} - ${result.doneness}\n`
      )
    );

    const data = [
      ["Metric", "Value"],
      ["Temperature", result.temperature],
      ["", ""],
      ["Minimum Time", formatDuration(result.times.minimum)],
      ["Pasteurized", formatDuration(result.times.pasteurized)],
      ["Tender", formatDuration(result.times.tender)],
      ["Optimal", formatDuration(result.times.optimal)],
      ["Maximum", formatDuration(result.times.maximum)],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🥩 Texture Guide:"));
    Object.entries(result.texture).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log(chalk.yellow("\n💡 Recommendations:"));
    result.recommendations.forEach((rec) => {
      console.log(`  • ${rec}`);
    });
  }

  async thicknessCalculator() {
    console.log(chalk.cyan("\n📏 Thickness-Based Timing Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "calculation",
        message: "What would you like to calculate?",
        choices: [
          { name: "Time from thickness", value: "time" },
          { name: "Maximum thickness for time", value: "thickness" },
        ],
      },
    ]);

    if (params.calculation === "time") {
      const inputs = await inquirer.prompt([
        {
          type: "number",
          name: "thickness",
          message: "Thickness (mm):",
          validate: (input) => input > 0,
        },
        {
          type: "list",
          name: "shape",
          message: "Shape:",
          choices: ["slab", "cylinder", "sphere"],
        },
        {
          type: "list",
          name: "protein",
          message: "Protein:",
          choices: ["beef", "pork", "chicken", "fish"],
        },
        {
          type: "number",
          name: "targetTemp",
          message: "Target temperature (°C):",
          default: 55,
          validate: (input) => input >= 40 && input <= 95,
        },
      ]);

      const result = this.calculator.calculateHeatingTime(
        inputs.thickness,
        inputs.shape,
        inputs.protein,
        inputs.targetTemp
      );

      console.log(
        chalk.green(`\n✓ Heating time: ${formatDuration(result.heatingTime)}`)
      );
      console.log(
        `  Core reaches temp in: ${formatDuration(result.coreReachTime)}`
      );
    } else {
      const inputs = await inquirer.prompt([
        {
          type: "number",
          name: "maxTime",
          message: "Maximum cooking time (minutes):",
          default: 120,
          validate: (input) => input > 0,
        },
        {
          type: "list",
          name: "shape",
          message: "Shape:",
          choices: ["slab", "cylinder", "sphere"],
        },
        {
          type: "list",
          name: "protein",
          message: "Protein:",
          choices: ["beef", "pork", "chicken", "fish"],
        },
      ]);

      // Reverse calculation (simplified)
      const thermalDiff = this.calculator.THERMAL_DIFFUSIVITY[inputs.protein];
      const shapeFactor = { slab: 1.0, cylinder: 2.3, sphere: 3.0 }[
        inputs.shape
      ];
      const maxThickness = Math.sqrt(
        (inputs.maxTime * 4 * thermalDiff) / (shapeFactor * 1.1)
      );

      console.log(
        chalk.green(`\n✓ Maximum thickness: ${maxThickness.toFixed(0)}mm`)
      );
      console.log(`  For ${inputs.maxTime} minute cook time`);
    }

    await this.waitForKeypress();
  }

  async multiStageCooking() {
    console.log(chalk.cyan("\n🌡️  Multi-Stage Cooking Program\n"));

    const stages = [];
    let addMore = true;
    let stageNum = 1;

    while (addMore && stageNum <= 3) {
      console.log(chalk.yellow(`\nStage ${stageNum}:`));

      const stage = await inquirer.prompt([
        {
          type: "number",
          name: "temperature",
          message: "Temperature (°C):",
          validate: (input) => input >= 40 && input <= 95,
        },
        {
          type: "number",
          name: "duration",
          message: "Duration (minutes):",
          validate: (input) => input > 0,
        },
        {
          type: "input",
          name: "purpose",
          message: "Purpose:",
          default: stageNum === 1 ? "Initial heating" : "Texture development",
        },
      ]);

      stages.push(stage);
      stageNum++;

      if (stageNum <= 3) {
        const { continue: cont } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continue",
            message: "Add another stage?",
            default: false,
          },
        ]);
        addMore = cont;
      }
    }

    this.displayMultiStageProgram(stages);
    await this.waitForKeypress();
  }

  displayMultiStageProgram(stages) {
    console.log(chalk.green("\n📊 Multi-Stage Cooking Program\n"));

    const data = [["Stage", "Temperature", "Duration", "Purpose"]];
    let totalTime = 0;

    stages.forEach((stage, index) => {
      data.push([
        `Stage ${index + 1}`,
        formatTemperature(stage.temperature),
        formatDuration(stage.duration),
        stage.purpose,
      ]);
      totalTime += stage.duration;
    });

    console.log(table(data));
    console.log(
      chalk.yellow(`\nTotal cooking time: ${formatDuration(totalTime)}`)
    );

    console.log(chalk.yellow("\n💡 Multi-stage benefits:"));
    console.log("  • Better texture control");
    console.log("  • Enzyme activation at specific temperatures");
    console.log("  • Improved tenderness without overcooking");
  }

  async safetyValidation() {
    console.log(chalk.cyan("\n🔬 Safety Validation\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "temperature",
        message: "Cooking temperature (°C):",
        validate: (input) => input >= 40 && input <= 95,
      },
      {
        type: "number",
        name: "time",
        message: "Cooking time (minutes):",
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "protein",
        message: "Protein type:",
        choices: ["beef", "pork", "lamb", "chicken", "fish"],
      },
    ]);

    // Simplified safety check
    const isSafe = params.temperature >= 55 && params.time >= 30;
    const isPasteurized = params.temperature >= 60 && params.time >= 45;

    console.log(chalk.green("\n📊 Safety Validation Results\n"));

    const data = [
      ["Parameter", "Value", "Status"],
      [
        "Temperature",
        formatTemperature(params.temperature),
        params.temperature >= 55 ? "✓" : "⚠️",
      ],
      ["Time", formatDuration(params.time), params.time >= 30 ? "✓" : "⚠️"],
      ["Protein", params.protein, "—"],
    ];

    console.log(table(data));

    if (isPasteurized) {
      console.log(chalk.green("\n✓ FULLY PASTEURIZED"));
      console.log("  Safe for all consumers including immunocompromised");
    } else if (isSafe) {
      console.log(chalk.yellow("\n⚠️  PARTIALLY SAFE"));
      console.log("  Suitable for healthy adults only");
      console.log(
        "  Consider longer time or higher temperature for full safety"
      );
    } else {
      console.log(chalk.red("\n❌ NOT SAFE"));
      console.log("  Temperature or time too low for pathogen reduction");
      console.log("  Minimum: 55°C for 30 minutes");
    }

    await this.waitForKeypress();
  }

  async temperatureGuide() {
    console.log(chalk.cyan("\n📖 Sous Vide Temperature Guide\n"));

    const guides = {
      beef: [
        ["Doneness", "Temperature", "Description"],
        ["Blue/Very Rare", "46-49°C", "Cool red center, very soft"],
        ["Rare", "49-53°C", "Red center, soft"],
        ["Medium Rare", "54-57°C", "Pink throughout, firm but yielding"],
        ["Medium", "57-62°C", "Light pink center, moderately firm"],
        ["Medium Well", "62-68°C", "Slightly pink, firm"],
        ["Well Done", "68°C+", "No pink, very firm"],
      ],
      chicken: [
        ["Style", "Temperature", "Description"],
        ["Soft & Juicy", "60°C", "Very tender, slightly pink"],
        ["Traditional", "65°C", "White throughout, juicy"],
        ["Well Done", "74°C", "Traditional texture, drier"],
      ],
      fish: [
        ["Texture", "Temperature", "Description"],
        ["Sashimi-like", "40-45°C", "Translucent, very soft"],
        ["Medium Rare", "46-51°C", "Flaky, moist"],
        ["Medium", "52-57°C", "Firm, flakes easily"],
        ["Well Done", "58°C+", "Very firm, dry"],
      ],
      vegetables: [
        ["Type", "Temperature", "Description"],
        ["Tender Vegetables", "85°C", "Carrots, beets, potatoes"],
        ["Green Vegetables", "85°C", "Broccoli, asparagus, beans"],
        ["Root Vegetables", "85-90°C", "Turnips, parsnips"],
      ],
    };

    const { category } = await inquirer.prompt([
      {
        type: "list",
        name: "category",
        message: "Select category:",
        choices: [
          { name: "Beef", value: "beef" },
          { name: "Chicken", value: "chicken" },
          { name: "Fish", value: "fish" },
          { name: "Vegetables", value: "vegetables" },
        ],
      },
    ]);

    console.log(
      chalk.green(
        `\n📊 ${
          category.charAt(0).toUpperCase() + category.slice(1)
        } Temperature Guide\n`
      )
    );
    console.log(table(guides[category]));

    console.log(chalk.yellow("\n💡 Tips:"));
    console.log("  • Add 30-60 minutes for pasteurization");
    console.log("  • Thicker cuts need more time");
    console.log("  • Season before bagging for best flavor");
    console.log("  • Sear after cooking for color and texture");

    await this.waitForKeypress();
  }

  async textureCalculator() {
    console.log(chalk.cyan("\n🧮 Texture Optimization Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "protein",
        message: "Protein type:",
        choices: ["beef", "pork", "chicken"],
      },
      {
        type: "number",
        name: "temperature",
        message: "Cooking temperature (°C):",
        default: 55,
        validate: (input) => input >= 40 && input <= 95,
      },
    ]);

    const tenderization = this.calculator.calculateTenderizationTime(
      params.protein,
      params.temperature
    );

    console.log(chalk.green("\n📊 Texture Development Timeline\n"));

    const data = [
      ["Time", "Texture", "Notes"],
      [
        `${tenderization.minimum} hours`,
        "Just cooked",
        "Proteins denatured, minimal tenderization",
      ],
      [
        `${tenderization.optimal} hours`,
        "Optimal",
        "Best balance of texture and moisture",
      ],
      [
        `${tenderization.maximum} hours`,
        "Maximum",
        "Very tender, may become mushy",
      ],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🔬 What's happening:"));
    console.log("  • Collagen converts to gelatin over time");
    console.log("  • Higher temperatures speed conversion");
    console.log("  • Enzymes break down proteins");
    console.log("  • Too long can result in mushy texture");

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
