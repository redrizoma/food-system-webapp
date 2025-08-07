import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { SousVideFermentationCalculator } from "../core/calculations/SousVideFermentationCalculator.js";
import { clearScreen, displayTitle } from "../utils/display.js";
import {
  formatPercentage,
  formatTemperature,
  formatDuration,
} from "../utils/format.js";

export class FermentationMenu {
  constructor() {
    this.calculator = new SousVideFermentationCalculator();
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("FERMENTATION SCIENCE");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. 🍷 Wine Fermentation", value: "wine" },
            { name: "2. 🍺 Beer Fermentation", value: "beer" },
            { name: "3. 🍞 Bread Fermentation", value: "bread" },
            { name: "4. 🥬 Vegetable Fermentation", value: "vegetables" },
            { name: "5. 🧀 Cheese Culture", value: "cheese" },
            { name: "6. 🥛 Yogurt & Kefir", value: "dairy" },
            { name: "7. 📊 Fermentation Schedule", value: "schedule" },
            { name: "8. 🧪 pH & Acidity", value: "acidity" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "wine":
          await this.wineFermentation();
          break;
        case "beer":
          await this.beerFermentation();
          break;
        case "bread":
          await this.breadFermentation();
          break;
        case "vegetables":
          await this.vegetableFermentation();
          break;
        case "cheese":
          await this.cheeseCulture();
          break;
        case "dairy":
          await this.dairyFermentation();
          break;
        case "schedule":
          await this.fermentationSchedule();
          break;
        case "acidity":
          await this.acidityCalculator();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async wineFermentation() {
    console.log(chalk.cyan("\n🍷 Wine Fermentation Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "volume",
        message: "Volume (liters):",
        default: 100,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "sugarContent",
        message: "Sugar content (g/L):",
        default: 220,
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "targetAlcohol",
        message: "Target alcohol (% ABV):",
        default: 13,
        validate: (input) => input >= 0 && input <= 20,
      },
    ]);

    const result = this.calculator.calculateWineFermentation(
      params.volume,
      params.sugarContent,
      params.targetAlcohol
    );

    this.displayWineFermentationResults(result);
    await this.waitForKeypress();
  }

  displayWineFermentationResults(result) {
    console.log(chalk.green("\n📊 Wine Fermentation Analysis\n"));

    const data = [
      ["Parameter", "Value"],
      ["Volume", `${result.volume} L`],
      ["Current Sugar", `${result.currentSugar} g/L`],
      ["Potential Alcohol", `${result.potentialAlcohol.toFixed(1)}% ABV`],
      ["Target Alcohol", `${result.targetAlcohol}% ABV`],
      ["", ""],
      [
        "Sugar Adjustment",
        result.sugarAdjustment.needed > 0 ? "Add sugar" : "Sufficient sugar",
      ],
      [
        "Amount Needed",
        `${Math.abs(result.sugarAdjustment.needed).toFixed(0)} g total`,
      ],
      [
        "Per Liter",
        `${Math.abs(result.sugarAdjustment.perLiter).toFixed(1)} g/L`,
      ],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🧪 Yeast Nutrition:"));
    console.log(`  YAN required: ${result.yeastNutrition.yan} mg/L`);
    console.log(`  DAP: ${result.yeastNutrition.dap.toFixed(1)} mg/L`);
    console.log(
      `  Fermaid K: ${result.yeastNutrition.fermaidK.toFixed(2)} g/L`
    );

    console.log(chalk.yellow("\n🛡️  SO₂ Management:"));
    console.log(`  Molecular SO₂: ${result.so2Management.molecular} mg/L`);
    console.log(`  Free SO₂: ${result.so2Management.free} mg/L`);
    console.log(`  Total SO₂: ${result.so2Management.total} mg/L`);

    console.log(chalk.yellow("\n📅 Fermentation Schedule:"));
    result.fermentationSchedule.forEach((stage) => {
      console.log(`  Day ${stage.day}: ${stage.action}`);
      if (stage.temp) console.log(`    Temperature: ${stage.temp}°C`);
      if (stage.brix !== undefined)
        console.log(`    Expected Brix: ${stage.brix}`);
    });
  }

  async beerFermentation() {
    console.log(chalk.cyan("\n🍺 Beer Fermentation Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "style",
        message: "Beer style:",
        choices: [
          { name: "Ale", value: "ale" },
          { name: "Lager", value: "lager" },
          { name: "Sour/Wild", value: "sour" },
        ],
      },
      {
        type: "number",
        name: "volume",
        message: "Batch volume (liters):",
        default: 20,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "og",
        message: "Original Gravity (e.g., 1.050):",
        default: 1.05,
        validate: (input) => input >= 1 && input <= 1.2,
      },
      {
        type: "number",
        name: "fg",
        message: "Expected Final Gravity:",
        default: 1.01,
        validate: (input) => input >= 0.99 && input <= 1.05,
      },
    ]);

    // Calculate ABV
    const abv = ((params.og - params.fg) * 131.25).toFixed(1);
    const attenuation = (
      ((params.og - params.fg) / (params.og - 1)) *
      100
    ).toFixed(1);

    console.log(chalk.green("\n📊 Beer Fermentation Analysis\n"));

    const fermentationParams = this.calculator.FERMENTATION.beer[params.style];

    const data = [
      ["Parameter", "Value"],
      ["Style", params.style.charAt(0).toUpperCase() + params.style.slice(1)],
      ["Volume", `${params.volume} L`],
      ["Original Gravity", params.og.toFixed(3)],
      ["Final Gravity", params.fg.toFixed(3)],
      ["", ""],
      ["Calculated ABV", `${abv}%`],
      ["Apparent Attenuation", `${attenuation}%`],
      ["", ""],
      [
        "Temperature Range",
        `${fermentationParams.temp.min}-${fermentationParams.temp.max}°C`,
      ],
      ["pH Range", `${fermentationParams.ph.min}-${fermentationParams.ph.max}`],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📅 Fermentation Timeline:"));
    const schedule = {
      ale: [
        "Day 0: Pitch yeast at 18-20°C",
        "Day 1-3: Active fermentation (krausen forms)",
        "Day 4-7: Primary fermentation",
        "Day 7-10: Diacetyl rest (raise temp 2°C)",
        "Day 14: Check gravity",
        "Day 14-21: Conditioning",
      ],
      lager: [
        "Day 0: Pitch yeast at 10-12°C",
        "Day 1-3: Lag phase",
        "Day 4-14: Primary fermentation",
        "Day 14-21: Diacetyl rest (raise to 16°C)",
        "Day 21+: Lagering at 0-4°C",
        "Week 4-8: Cold conditioning",
      ],
      sour: [
        "Day 0: Pitch mixed culture",
        "Day 1-7: Primary fermentation",
        "Week 2-4: Secondary fermentation",
        "Month 1-6: Souring development",
        "Monitor pH regularly",
      ],
    };

    schedule[params.style].forEach((step) => {
      console.log(`  • ${step}`);
    });

    await this.waitForKeypress();
  }

  async breadFermentation() {
    console.log(chalk.cyan("\n🍞 Bread Fermentation Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "flourWeight",
        message: "Flour weight (g):",
        default: 1000,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "hydration",
        message: "Hydration percentage:",
        default: 65,
        validate: (input) => input > 0 && input <= 100,
      },
      {
        type: "number",
        name: "yeastPercentage",
        message: "Yeast percentage:",
        default: 1,
        validate: (input) => input >= 0 && input <= 5,
      },
      {
        type: "number",
        name: "temperature",
        message: "Fermentation temperature (°C):",
        default: 25,
        validate: (input) => input >= 15 && input <= 35,
      },
    ]);

    const result = this.calculator.calculateBreadFermentation(
      params.flourWeight,
      params.hydration,
      params.yeastPercentage,
      params.temperature
    );

    this.displayBreadFermentationResults(result);
    await this.waitForKeypress();
  }

  displayBreadFermentationResults(result) {
    console.log(chalk.green("\n📊 Bread Fermentation Schedule\n"));

    const doughData = [
      ["Component", "Amount"],
      ["Flour", `${result.dough.flour} g`],
      ["Water", `${result.dough.water.toFixed(0)} g`],
      ["Yeast", `${result.dough.yeast.toFixed(1)} g`],
      ["Total Dough", `${result.dough.totalWeight.toFixed(0)} g`],
      ["Hydration", `${result.dough.hydration}%`],
    ];

    console.log(table(doughData));

    console.log(chalk.yellow("\n⏱️  Fermentation Timeline:"));
    console.log(`  Temperature: ${result.fermentation.temperature}°C`);
    console.log(
      `  Bulk Fermentation: ${formatDuration(
        result.fermentation.bulkFermentation.time
      )}`
    );
    console.log(
      `  Folds: ${result.fermentation.bulkFermentation.folds} (every 30 min)`
    );
    console.log(
      `  Final Proof: ${formatDuration(result.fermentation.finalProof.time)}`
    );
    console.log(
      `  Total Time: ${formatDuration(result.fermentation.totalTime)}`
    );

    console.log(chalk.yellow("\n📋 Checkpoints:"));
    result.fermentation.bulkFermentation.checkpoints.forEach((checkpoint) => {
      console.log(`  ${formatDuration(checkpoint.time)}: ${checkpoint.action}`);
      console.log(`    Look for: ${checkpoint.lookFor}`);
    });

    console.log(chalk.yellow("\n🍞 Production Schedule:"));
    result.schedule.forEach((step) => {
      const time = Math.floor(step.time / 60);
      const mins = step.time % 60;
      const timeStr = time > 0 ? `${time}h ${mins}min` : `${mins}min`;
      console.log(`  ${timeStr}: ${step.action} (${step.duration} min)`);
    });
  }

  async vegetableFermentation() {
    console.log(chalk.cyan("\n🥬 Vegetable Fermentation Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "vegetableWeight",
        message: "Vegetable weight (g):",
        default: 1000,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "saltPercentage",
        message: "Salt percentage:",
        default: 2,
        validate: (input) => input >= 1 && input <= 10,
      },
      {
        type: "list",
        name: "method",
        message: "Fermentation method:",
        choices: [
          { name: "Dry salt (sauerkraut style)", value: "dry" },
          { name: "Brine (pickle style)", value: "brine" },
        ],
      },
    ]);

    const result = this.calculator.calculateVegetableFermentation(
      params.vegetableWeight,
      params.saltPercentage
    );

    this.displayVegetableFermentationResults(result, params.method);
    await this.waitForKeypress();
  }

  displayVegetableFermentationResults(result, method) {
    console.log(chalk.green("\n📊 Vegetable Fermentation Guide\n"));

    const data = [
      ["Parameter", "Value"],
      ["Method", result.method],
      ["Vegetable Weight", `${result.vegetables.weight} g`],
      ["Salt Needed", `${result.vegetables.salt.toFixed(0)} g`],
      ["Salt Percentage", `${result.vegetables.percentage}%`],
    ];

    if (result.brine.needed) {
      data.push(
        ["", ""],
        ["Brine Volume", `${result.brine.volume.toFixed(0)} ml`],
        ["Brine Salt", `${result.brine.salt.toFixed(0)} g`],
        ["Concentration", result.brine.concentration]
      );
    }

    console.log(table(data));

    console.log(chalk.yellow("\n🧫 Fermentation Process:"));
    console.log(`  Temperature: ${result.fermentation.temperature}`);
    console.log(`  Initial phase: ${result.fermentation.time.initial}`);
    console.log(`  Secondary phase: ${result.fermentation.time.secondary}`);
    console.log(`  Total time: ${result.fermentation.time.total}`);

    console.log(chalk.yellow("\n📈 pH Progression:"));
    result.stages.forEach((stage) => {
      console.log(`  Day ${stage.day}: pH ${stage.pH} - ${stage.activity}`);
    });

    console.log(chalk.yellow("\n🥫 Storage:"));
    console.log(`  Temperature: ${result.storage.temperature}`);
    console.log(`  Duration: ${result.storage.duration}`);
    console.log(`  Container: ${result.storage.container}`);
  }

  async cheeseCulture() {
    console.log(chalk.cyan("\n🧀 Cheese Culture Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "culture",
        message: "Culture type:",
        choices: [
          { name: "Mesophilic (20-32°C)", value: "mesophilic" },
          { name: "Thermophilic (35-45°C)", value: "thermophilic" },
        ],
      },
      {
        type: "number",
        name: "milkVolume",
        message: "Milk volume (liters):",
        default: 10,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "cheeseType",
        message: "Cheese type:",
        choices: (answers) => {
          if (answers.culture === "mesophilic") {
            return ["Cheddar", "Gouda", "Feta", "Camembert"];
          } else {
            return ["Mozzarella", "Parmesan", "Swiss", "Provolone"];
          }
        },
      },
    ]);

    const cultureParams = this.calculator.FERMENTATION.cheese[params.culture];

    console.log(
      chalk.green(`\n📊 Cheese Making Guide - ${params.cheeseType}\n`)
    );

    const data = [
      ["Parameter", "Value"],
      ["Milk Volume", `${params.milkVolume} L`],
      ["Culture Type", params.culture],
      [
        "Temperature Range",
        `${cultureParams.temp.min}-${cultureParams.temp.max}°C`,
      ],
      ["pH Range", `${cultureParams.ph.min}-${cultureParams.ph.max}`],
      ["", ""],
      ["Culture Amount", `${(params.milkVolume * 0.01).toFixed(2)} units`],
      ["Calcium Chloride", `${(params.milkVolume * 0.2).toFixed(1)} ml`],
      ["Rennet", `${(params.milkVolume * 0.25).toFixed(2)} ml`],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📋 Process Steps:"));
    const steps = [
      `Heat milk to ${params.culture === "mesophilic" ? "32" : "38"}°C`,
      "Add culture, ripen 30-45 minutes",
      "Add calcium chloride if using pasteurized milk",
      "Add rennet, stir gently",
      "Let set until clean break (30-45 min)",
      "Cut curds to appropriate size",
      "Heat slowly while stirring",
      "Drain whey at target pH",
      "Press/salt according to cheese type",
    ];

    steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    await this.waitForKeypress();
  }

  async dairyFermentation() {
    console.log(chalk.cyan("\n🥛 Yogurt & Kefir Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "product",
        message: "Product type:",
        choices: ["Yogurt", "Kefir", "Buttermilk", "Sour Cream"],
      },
      {
        type: "number",
        name: "volume",
        message: "Milk/cream volume (ml):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    const fermentationData = {
      Yogurt: {
        culture: "Thermophilic yogurt culture",
        amount: params.volume * 0.02,
        temperature: "42-45°C",
        time: "4-8 hours",
        finalPH: "4.0-4.5",
      },
      Kefir: {
        culture: "Kefir grains",
        amount: params.volume * 0.05,
        temperature: "20-25°C",
        time: "12-24 hours",
        finalPH: "4.2-4.5",
      },
      Buttermilk: {
        culture: "Mesophilic culture",
        amount: params.volume * 0.01,
        temperature: "22-25°C",
        time: "12-18 hours",
        finalPH: "4.5",
      },
      "Sour Cream": {
        culture: "Mesophilic culture",
        amount: params.volume * 0.01,
        temperature: "22-25°C",
        time: "12-16 hours",
        finalPH: "4.5",
      },
    };

    const data = fermentationData[params.product];

    console.log(chalk.green(`\n📊 ${params.product} Production\n`));

    const tableData = [
      ["Parameter", "Value"],
      ["Volume", `${params.volume} ml`],
      ["Culture Type", data.culture],
      [
        "Culture Amount",
        `${data.amount.toFixed(0)} ${params.product === "Kefir" ? "g" : "ml"}`,
      ],
      ["Temperature", data.temperature],
      ["Time", data.time],
      ["Target pH", data.finalPH],
    ];

    console.log(table(tableData));

    console.log(chalk.yellow("\n📋 Instructions:"));
    const instructions = {
      Yogurt: [
        "Heat milk to 82°C to denature proteins",
        "Cool to 42-45°C",
        "Add culture and mix well",
        "Maintain temperature for 4-8 hours",
        "Refrigerate when pH reaches 4.5",
      ],
      Kefir: [
        "Add grains to room temperature milk",
        "Cover with cloth, not airtight",
        "Ferment at room temperature",
        "Strain grains when thick",
        "Store grains in fresh milk",
      ],
      Buttermilk: [
        "Warm cream to 22-25°C",
        "Add culture and mix",
        "Let sit at room temperature",
        "Refrigerate when thickened",
      ],
      "Sour Cream": [
        "Warm cream to 22-25°C",
        "Add culture and mix",
        "Let sit at room temperature",
        "Refrigerate when thick",
      ],
    };

    instructions[params.product].forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    await this.waitForKeypress();
  }

  async fermentationSchedule() {
    console.log(chalk.cyan("\n📅 Fermentation Schedule Generator\n"));

    const params = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "Fermentation type:",
        choices: ["Wine", "Beer", "Bread", "Vegetables"],
      },
      {
        type: "date",
        name: "startDate",
        message: "Start date:",
        default: new Date().toISOString().split("T")[0],
      },
    ]);

    const schedules = {
      Wine: [
        { day: 0, task: "Pitch yeast", critical: true },
        { day: 1, task: "Check for fermentation start" },
        { day: 3, task: "Nutrient addition #1" },
        { day: 5, task: "Nutrient addition #2" },
        { day: 7, task: "Check SG, temp" },
        { day: 14, task: "Rack to secondary" },
        { day: 30, task: "Rack again, clarify" },
        { day: 60, task: "Bottle or bulk age" },
      ],
      Beer: [
        { day: 0, task: "Pitch yeast", critical: true },
        { day: 1, task: "Check krausen formation" },
        { day: 3, task: "High krausen - monitor temp" },
        { day: 7, task: "Check gravity" },
        { day: 10, task: "Diacetyl rest (if lager)" },
        { day: 14, task: "Transfer to secondary" },
        { day: 21, task: "Cold crash" },
        { day: 23, task: "Bottle/keg" },
      ],
      Bread: [
        { hour: 0, task: "Mix dough", critical: true },
        { hour: 0.5, task: "Autolyse" },
        { hour: 1, task: "First fold" },
        { hour: 1.5, task: "Second fold" },
        { hour: 2, task: "Third fold" },
        { hour: 3, task: "Pre-shape" },
        { hour: 3.5, task: "Final shape" },
        { hour: 5, task: "Score and bake", critical: true },
      ],
      Vegetables: [
        { day: 0, task: "Prepare and salt vegetables", critical: true },
        { day: 1, task: "Check brine formation" },
        { day: 3, task: "Active fermentation begins" },
        { day: 5, task: "Taste test #1" },
        { day: 7, task: "Check pH (should be <4.5)" },
        { day: 14, task: "Taste test #2" },
        { day: 21, task: "Move to cold storage" },
      ],
    };

    const schedule = schedules[params.type];
    const startDate = new Date(params.startDate);

    console.log(chalk.green(`\n📅 ${params.type} Fermentation Schedule\n`));
    console.log(chalk.gray(`Starting: ${startDate.toDateString()}\n`));

    const tableData = [["Date", "Day/Hour", "Task", "Status"]];

    schedule.forEach((item) => {
      let date;
      let timeLabel;

      if (item.day !== undefined) {
        date = new Date(startDate);
        date.setDate(date.getDate() + item.day);
        timeLabel = `Day ${item.day}`;
      } else {
        date = new Date(startDate);
        date.setHours(date.getHours() + item.hour);
        timeLabel = `Hour ${item.hour}`;
      }

      tableData.push([
        date.toLocaleDateString(),
        timeLabel,
        item.task,
        item.critical ? "⚠️  Critical" : "—",
      ]);
    });

    console.log(table(tableData));

    await this.waitForKeypress();
  }

  async acidityCalculator() {
    console.log(chalk.cyan("\n🧪 pH & Acidity Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "currentPH",
        message: "Current pH:",
        default: 4.0,
        validate: (input) => input >= 0 && input <= 14,
      },
      {
        type: "number",
        name: "currentTA",
        message: "Current TA (g/L as tartaric):",
        default: 6,
        validate: (input) => input >= 0,
      },
      {
        type: "number",
        name: "volume",
        message: "Volume (liters):",
        default: 100,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "adjustment",
        message: "Adjustment needed:",
        choices: [
          { name: "None - just analyze", value: "none" },
          { name: "Add tartaric acid", value: "tartaric" },
          { name: "Malolactic fermentation", value: "mlf" },
        ],
      },
    ]);

    let adjustmentData = null;
    if (params.adjustment === "tartaric") {
      const { amount } = await inquirer.prompt([
        {
          type: "number",
          name: "amount",
          message: "Tartaric acid to add (g/L):",
          default: 1,
          validate: (input) => input > 0,
        },
      ]);
      adjustmentData = { type: "tartaric", amount };
    } else if (params.adjustment === "mlf") {
      adjustmentData = { type: "malolactic" };
    }

    const result = this.calculator.calculateAcidity(
      params.currentPH,
      params.currentTA,
      params.volume,
      adjustmentData
    );

    console.log(chalk.green("\n📊 Acidity Analysis\n"));

    const data = [
      ["Parameter", "Initial", "Adjusted"],
      ["pH", result.initial.pH.toFixed(2), result.adjusted.pH.toFixed(2)],
      ["TA (g/L)", result.initial.ta.toFixed(1), result.adjusted.ta.toFixed(1)],
      ["Stability", result.initial.stability, result.adjusted.stability],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n💡 Recommendations:"));
    result.recommendations.forEach((rec) => {
      console.log(`  • ${rec}`);
    });

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
