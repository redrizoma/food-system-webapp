import inquirer from "inquirer";
import chalk from "chalk";
import { table } from "table";
import { MolecularGastronomyCalculator } from "../core/calculations/MolecularGastronomyCalculator.js";
import { clearScreen, displayTitle } from "../utils/display.js";
import { formatWeight, formatPercentage } from "../utils/format.js";

export class MolecularMenu {
  constructor() {
    this.calculator = new MolecularGastronomyCalculator();
  }

  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle("MOLECULAR GASTRONOMY");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Select an option:",
          choices: [
            { name: "1. 🫧 Spherification", value: "spherification" },
            { name: "2. 🧊 Gelification", value: "gelification" },
            { name: "3. 💨 Foams & Airs", value: "foams" },
            { name: "4. 🔗 Transglutaminase", value: "transglutaminase" },
            { name: "5. 🌡️  Methylcellulose", value: "methylcellulose" },
            { name: "6. 🥄 Xanthan Thickening", value: "xanthan" },
            { name: "7. ⚗️  pH Adjustment", value: "ph" },
            { name: "8. 📊 Concentration Guide", value: "guide" },
            new inquirer.Separator(),
            { name: "0. ↩️  Back to Main Menu", value: "back" },
          ],
          pageSize: 11,
        },
      ]);

      switch (choice) {
        case "spherification":
          await this.spherificationCalculator();
          break;
        case "gelification":
          await this.gelificationCalculator();
          break;
        case "foams":
          await this.foamsCalculator();
          break;
        case "transglutaminase":
          await this.transglutaminaseCalculator();
          break;
        case "methylcellulose":
          await this.methylcelluloseCalculator();
          break;
        case "xanthan":
          await this.xanthanCalculator();
          break;
        case "ph":
          await this.phAdjustment();
          break;
        case "guide":
          await this.concentrationGuide();
          break;
        case "back":
          continueMenu = false;
          break;
      }
    }
  }

  async spherificationCalculator() {
    console.log(chalk.cyan("\n🫧 Spherification Calculator\n"));

    const { technique } = await inquirer.prompt([
      {
        type: "list",
        name: "technique",
        message: "Spherification technique:",
        choices: [
          { name: "Basic Spherification", value: "basic" },
          { name: "Reverse Spherification", value: "reverse" },
          { name: "Frozen Reverse Spherification", value: "frozen" },
        ],
      },
    ]);

    switch (technique) {
      case "basic":
        await this.basicSpherification();
        break;
      case "reverse":
        await this.reverseSpherification();
        break;
      case "frozen":
        await this.frozenSpherification();
        break;
    }

    await this.waitForKeypress();
  }

  async basicSpherification() {
    const params = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "bathVolume",
        message: "Calcium bath volume (ml):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateBasicSpherification(
      params.liquidVolume,
      params.bathVolume
    );

    this.displaySpherificationResults(result);
  }

  async reverseSpherification() {
    const params = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "bathVolume",
        message: "Alginate bath volume (ml):",
        default: 1000,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateReverseSpherification(
      params.liquidVolume,
      params.bathVolume
    );

    this.displaySpherificationResults(result);
  }

  async frozenSpherification() {
    const params = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Total liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "number",
        name: "moldCount",
        message: "Number of spheres:",
        default: 20,
        validate: (input) => input > 0,
      },
    ]);

    const result = this.calculator.calculateFrozenReverseSpherification(
      params.liquidVolume,
      params.moldCount
    );

    console.log(chalk.green("\n📊 Frozen Reverse Spherification\n"));

    const data = [
      ["Property", "Value"],
      [
        "Volume per sphere",
        `${result.preparation.volumePerSphere.toFixed(1)}ml`,
      ],
      [
        "Calcium lactate total",
        `${result.preparation.calciumLactate.toFixed(2)}g`,
      ],
      ["Freezing time", result.preparation.freezingTime],
      ["Mold type", result.preparation.moldType],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📋 Process:"));
    Object.values(result.process).forEach((step) => {
      console.log(`  ${step}`);
    });
  }

  displaySpherificationResults(result) {
    console.log(chalk.green(`\n📊 ${result.technique}\n`));

    // Liquid preparation
    console.log(chalk.yellow("🧪 Liquid Preparation:"));
    const liquidData = [
      ["Property", "Value"],
      ["Volume", `${result.liquid.volume}ml`],
      [
        "Additive",
        result.liquid.sodiumAlginate
          ? `${result.liquid.sodiumAlginate.toFixed(2)}g sodium alginate`
          : `${result.liquid.calciumLactate.toFixed(2)}g calcium lactate`,
      ],
      ["Concentration", result.liquid.concentration],
      ["Mixing", result.liquid.mixing],
    ];
    console.log(table(liquidData));

    // Bath preparation
    console.log(chalk.yellow("\n🧊 Bath Preparation:"));
    const bathData = [
      ["Property", "Value"],
      ["Volume", `${result.bath.volume}ml`],
      [
        "Additive",
        result.bath.calciumChloride
          ? `${result.bath.calciumChloride.toFixed(2)}g calcium chloride`
          : `${result.bath.sodiumAlginate.toFixed(2)}g sodium alginate`,
      ],
      ["Concentration", result.bath.concentration],
      ["Temperature", result.bath.temperature || "Room temperature"],
    ];
    console.log(table(bathData));

    // Process
    console.log(chalk.yellow("\n⏱️  Process:"));
    Object.entries(result.process).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    // Tips
    if (result.tips || result.advantages) {
      console.log(chalk.yellow("\n💡 Tips:"));
      (result.tips || result.advantages).forEach((tip) => {
        console.log(`  • ${tip}`);
      });
    }
  }

  async gelificationCalculator() {
    console.log(chalk.cyan("\n🧊 Gelification Calculator\n"));

    const gelInfo = await inquirer.prompt([
      {
        type: "list",
        name: "agent",
        message: "Gelling agent:",
        choices: [
          { name: "Agar", value: "agar" },
          { name: "Gellan", value: "gellan" },
          { name: "Carrageenan", value: "carrageenan" },
        ],
      },
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
    ]);

    if (gelInfo.agent === "agar") {
      const { gelType } = await inquirer.prompt([
        {
          type: "list",
          name: "gelType",
          message: "Gel type:",
          choices: [
            { name: "Fluid gel (pourable)", value: "fluid_gel" },
            { name: "Soft gel (tender)", value: "soft_gel" },
            { name: "Firm gel (sliceable)", value: "firm_gel" },
            { name: "Brittle gel (crisp)", value: "brittle_gel" },
          ],
        },
      ]);

      const result = this.calculator.calculateAgarGel(
        gelInfo.liquidVolume,
        gelType
      );
      this.displayGelificationResults(result);
    } else if (gelInfo.agent === "gellan") {
      const { gelType } = await inquirer.prompt([
        {
          type: "list",
          name: "gelType",
          message: "Gel firmness:",
          choices: [
            { name: "Fluid", value: "fluid" },
            { name: "Standard", value: "standard" },
            { name: "Firm", value: "firm" },
          ],
        },
      ]);

      const result = this.calculator.calculateGellanGel(
        gelInfo.liquidVolume,
        gelType
      );
      this.displayGellanResults(result);
    }

    await this.waitForKeypress();
  }

  displayGelificationResults(result) {
    console.log(chalk.green(`\n📊 ${result.technique}\n`));

    const data = [
      ["Property", "Value"],
      ["Gel type", result.gelType],
      ["Liquid volume", `${result.liquid.volume}ml`],
      [
        "Agar range",
        `${result.liquid.agarRange.min.toFixed(
          1
        )}-${result.liquid.agarRange.max.toFixed(1)}g`,
      ],
      ["Concentration", result.liquid.concentration],
      ["Texture", result.process.texture],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🔥 Process:"));
    Object.entries(result.process).forEach(([key, value]) => {
      if (key !== "texture") {
        console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
      }
    });

    console.log(chalk.yellow("\n🔬 Properties:"));
    Object.entries(result.properties).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    console.log(chalk.yellow("\n🍽️  Applications:"));
    result.applications.forEach((app) => {
      console.log(`  • ${app}`);
    });
  }

  displayGellanResults(result) {
    console.log(chalk.green(`\n📊 ${result.technique}\n`));

    const data = [
      ["Property", "Value"],
      ["Liquid volume", `${result.liquid.volume}ml`],
      ["Gellan amount", `${result.liquid.gellan.toFixed(2)}g`],
      ["Concentration", result.liquid.concentration],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🔬 Properties:"));
    Object.entries(result.properties).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    console.log(chalk.yellow("\n⚗️  Modifications:"));
    Object.entries(result.modifications).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  async foamsCalculator() {
    console.log(chalk.cyan("\n💨 Lecithin Foam Calculator\n"));

    const foamInfo = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "foamType",
        message: "Foam type:",
        choices: [
          { name: "Air (light bubbles)", value: "air" },
          { name: "Foam (dense foam)", value: "foam" },
          { name: "Emulsion (stable)", value: "emulsion" },
        ],
      },
    ]);

    const result = this.calculator.calculateLecithinFoam(
      foamInfo.liquidVolume,
      foamInfo.foamType
    );

    console.log(
      chalk.green(`\n📊 Lecithin ${foamInfo.foamType} Calculation\n`)
    );

    const data = [
      ["Property", "Value"],
      ["Liquid volume", `${result.liquid.volume}ml`],
      ["Lecithin amount", `${result.liquid.lecithin.toFixed(2)}g`],
      ["Concentration", result.liquid.concentration],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🥄 Process:"));
    Object.entries(result.process).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    console.log(chalk.yellow("\n💡 Tips:"));
    result.tips.forEach((tip) => {
      console.log(`  • ${tip}`);
    });

    await this.waitForKeypress();
  }

  async transglutaminaseCalculator() {
    console.log(chalk.cyan("\n🔗 Transglutaminase Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "proteinWeight",
        message: "Protein weight (g):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "bondingType",
        message: "Application method:",
        choices: [
          { name: "Direct sprinkle", value: "direct" },
          { name: "Slurry method", value: "slurry" },
          { name: "Incorporation (ground meat)", value: "incorporation" },
        ],
      },
    ]);

    const result = this.calculator.calculateTransglutaminase(
      params.proteinWeight,
      params.bondingType
    );

    console.log(chalk.green("\n📊 Transglutaminase Bonding\n"));

    const data = [
      ["Property", "Value"],
      ["Protein weight", `${result.protein.weight}g`],
      ["Enzyme amount", `${result.protein.enzymeAmount.toFixed(2)}g`],
      ["Concentration", result.protein.concentration],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n📋 Method:"));
    Object.entries(result.method).forEach(([key, value]) => {
      if (key !== "enzyme") {
        console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
      }
    });

    console.log(chalk.red("\n⚠️  Safety Notes:"));
    result.safetyNotes.forEach((note) => {
      console.log(`  • ${note}`);
    });

    console.log(chalk.yellow("\n🍽️  Applications:"));
    result.applications.forEach((app) => {
      console.log(`  • ${app}`);
    });

    await this.waitForKeypress();
  }

  async methylcelluloseCalculator() {
    console.log(chalk.cyan("\n🌡️  Methylcellulose Hot Gel Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "gelStrength",
        message: "Gel strength:",
        choices: [
          { name: "Light", value: "light" },
          { name: "Medium", value: "medium" },
          { name: "Firm", value: "firm" },
        ],
      },
    ]);

    const result = this.calculator.calculateMethylcellulose(
      params.liquidVolume,
      params.gelStrength
    );

    console.log(chalk.green("\n📊 Methylcellulose Hot Gel\n"));
    console.log(chalk.bold("Unique: Gels when heated, melts when cooled!\n"));

    const data = [
      ["Property", "Value"],
      ["Liquid volume", `${result.liquid.volume}ml`],
      ["Methylcellulose", `${result.liquid.methylcellulose.toFixed(2)}g`],
      ["Concentration", result.liquid.concentration],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🧊 Process:"));
    Object.entries(result.process).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    console.log(chalk.yellow("\n🍳 Applications:"));
    result.applications.forEach((app) => {
      console.log(`  • ${app}`);
    });

    console.log(chalk.yellow("\n💡 Tips:"));
    result.tips.forEach((tip) => {
      console.log(`  • ${tip}`);
    });

    await this.waitForKeypress();
  }

  async xanthanCalculator() {
    console.log(chalk.cyan("\n🥄 Xanthan Gum Thickening Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "liquidVolume",
        message: "Liquid volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "list",
        name: "viscosity",
        message: "Desired viscosity:",
        choices: [
          { name: "Light thickening", value: "light" },
          { name: "Medium (sauce)", value: "medium" },
          { name: "Thick sauce", value: "thick" },
          { name: "Gel-like", value: "gel" },
        ],
      },
    ]);

    const result = this.calculator.calculateXanthanThickening(
      params.liquidVolume,
      params.viscosity
    );

    console.log(chalk.green("\n📊 Xanthan Thickening\n"));

    const data = [
      ["Property", "Value"],
      ["Liquid volume", `${result.liquid.volume}ml`],
      ["Xanthan amount", `${result.liquid.xanthan.toFixed(2)}g`],
      ["Concentration", result.liquid.concentration],
      ["Viscosity", result.liquid.viscosity],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🔬 Properties:"));
    Object.entries(result.properties).forEach(([key, value]) => {
      console.log(`  ${key.replace(/_/g, " ")}: ${value}`);
    });

    console.log(chalk.yellow("\n💡 Tips:"));
    result.tips.forEach((tip) => {
      console.log(`  • ${tip}`);
    });

    await this.waitForKeypress();
  }

  async phAdjustment() {
    console.log(chalk.cyan("\n⚗️  pH Adjustment Calculator\n"));

    const params = await inquirer.prompt([
      {
        type: "number",
        name: "currentPH",
        message: "Current pH:",
        default: 7,
        validate: (input) => input >= 0 && input <= 14,
      },
      {
        type: "number",
        name: "targetPH",
        message: "Target pH:",
        default: 5,
        validate: (input) => input >= 0 && input <= 14,
      },
      {
        type: "number",
        name: "volume",
        message: "Volume (ml):",
        default: 500,
        validate: (input) => input > 0,
      },
      {
        type: "input",
        name: "ingredient",
        message: "Main ingredient:",
        default: "general",
      },
    ]);

    const result = this.calculator.calculatePHAdjustment(
      params.currentPH,
      params.targetPH,
      params.volume,
      params.ingredient
    );

    console.log(chalk.green("\n📊 pH Adjustment Guide\n"));

    const data = [
      ["Property", "Value"],
      ["Current pH", result.current],
      ["Target pH", result.target],
      ["Volume", `${result.volume}ml`],
      [
        "Direction",
        result.direction === "increase"
          ? "↑ Increase (more basic)"
          : "↓ Decrease (more acidic)",
      ],
    ];

    console.log(table(data));

    console.log(chalk.yellow("\n🧪 Recommended Additives:"));
    result.additives.forEach((additive) => {
      console.log(
        `  • ${additive.name}: ${additive.amount.toFixed(2)}${additive.unit}`
      );
    });

    console.log(chalk.yellow("\n📝 Notes:"));
    result.notes.forEach((note) => {
      console.log(`  • ${note}`);
    });

    await this.waitForKeypress();
  }

  async concentrationGuide() {
    console.log(chalk.cyan("\n📊 Hydrocolloid Concentration Guide\n"));

    const concentrations = [
      ["Hydrocolloid", "Typical %", "Application"],
      new inquirer.Separator("─".repeat(50)),
      ["Sodium Alginate", "0.5-1.0%", "Spherification"],
      ["Calcium Chloride", "0.5-1.5%", "Calcium bath"],
      ["Calcium Lactate", "1.0-2.0%", "Reverse spherification"],
      new inquirer.Separator("─".repeat(50)),
      ["Agar", "0.3-3.0%", "Gels (fluid to brittle)"],
      ["Gellan", "0.2-1.0%", "Clear, heat-stable gels"],
      ["Carrageenan", "0.5-2.0%", "Dairy gels"],
      new inquirer.Separator("─".repeat(50)),
      ["Lecithin", "0.3-0.5%", "Foams and airs"],
      ["Xanthan", "0.1-0.5%", "Thickening"],
      ["Guar", "0.2-1.0%", "Thickening"],
      ["Methylcellulose", "1.0-2.0%", "Hot gels"],
      new inquirer.Separator("─".repeat(50)),
      ["Transglutaminase", "0.5-1.0%", "Protein bonding"],
    ];

    console.log(table(concentrations));

    console.log(chalk.yellow("\n💡 General Tips:"));
    console.log("  • Start with lower concentrations and adjust");
    console.log("  • Temperature affects hydration and gelation");
    console.log("  • pH can impact functionality");
    console.log("  • Some hydrocolloids work synergistically");
    console.log("  • Always disperse properly to avoid clumps");

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
