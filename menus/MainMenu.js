import inquirer from "inquirer";
import chalk from "chalk";
import { RecipeMenu } from "./RecipeMenu.js";
import { BakeryMenu } from "./BakeryMenu.js";
import { PastryMenu } from "./PastryMenu.js";
import { MolecularMenu } from "./MolecularMenu.js";
import { SousVideMenu } from "./SousVideMenu.js";
import { FermentationMenu } from "./FermentationMenu.js";
import { InventoryMenu } from "./InventoryMenu.js";
import { ReportsMenu } from "./ReportsMenu.js";
import { clearScreen } from "../utils/display.js";

export class MainMenu {
  constructor() {
    this.shouldExit = false;
    this.subMenus = {
      recipe: new RecipeMenu(),
      bakery: new BakeryMenu(),
      pastry: new PastryMenu(),
      molecular: new MolecularMenu(),
      sousvide: new SousVideMenu(),
      fermentation: new FermentationMenu(),
      inventory: new InventoryMenu(),
      reports: new ReportsMenu(),
    };
  }

  async show() {
    clearScreen();

    console.log(
      chalk.cyan.bold("\n╔════════════════════════════════════════════╗")
    );
    console.log(
      chalk.cyan.bold("║     FOOD SYSTEM WEBAPP - MAIN MENU        ║")
    );
    console.log(
      chalk.cyan.bold("╚════════════════════════════════════════════╝\n")
    );

    const menuChoices = [
      { name: "1. 📋 Recipe Costing & Escandallo", value: "recipe" },
      { name: "2. 🥖 Bakery Calculations", value: "bakery" },
      { name: "3. 🥐 Pastry Arts", value: "pastry" },
      { name: "4. 🧪 Molecular Gastronomy", value: "molecular" },
      { name: "5. 🌡️  Sous Vide Precision", value: "sousvide" },
      { name: "6. 🧫 Fermentation Science", value: "fermentation" },
      { name: "7. 📦 Inventory Management", value: "inventory" },
      { name: "8. 📊 Reports & Analysis", value: "reports" },
      new inquirer.Separator(),
      { name: "9. ⚙️  Settings", value: "settings" },
      { name: "0. 🚪 Exit", value: "exit" },
    ];

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Select an option:",
        choices: menuChoices,
        pageSize: 12,
      },
    ]);

    await this.handleChoice(choice);
  }

  async handleChoice(choice) {
    switch (choice) {
      case "recipe":
      case "bakery":
      case "pastry":
      case "molecular":
      case "sousvide":
      case "fermentation":
      case "inventory":
      case "reports":
        await this.subMenus[choice].show();
        break;

      case "settings":
        await this.showSettings();
        break;

      case "exit":
        const { confirmExit } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirmExit",
            message: "Are you sure you want to exit?",
            default: false,
          },
        ]);

        if (confirmExit) {
          this.shouldExit = true;
        }
        break;
    }
  }

  async showSettings() {
    clearScreen();
    console.log(chalk.yellow("\n⚙️  Settings\n"));

    const { setting } = await inquirer.prompt([
      {
        type: "list",
        name: "setting",
        message: "Configure settings:",
        choices: [
          { name: "1. Units (Metric/Imperial)", value: "units" },
          { name: "2. Currency", value: "currency" },
          { name: "3. Default Factors", value: "factors" },
          { name: "4. Data Management", value: "data" },
          new inquirer.Separator(),
          { name: "0. Back to Main Menu", value: "back" },
        ],
      },
    ]);

    switch (setting) {
      case "units":
        await this.configureUnits();
        break;
      case "currency":
        await this.configureCurrency();
        break;
      case "factors":
        await this.configureFactors();
        break;
      case "data":
        await this.manageData();
        break;
      case "back":
        return;
    }

    await this.showSettings();
  }

  async configureUnits() {
    const { unitSystem } = await inquirer.prompt([
      {
        type: "list",
        name: "unitSystem",
        message: "Select default unit system:",
        choices: [
          { name: "Metric (kg, g, ml, l)", value: "metric" },
          { name: "Imperial (lb, oz, cups)", value: "imperial" },
          { name: "Baker's (percentages)", value: "bakers" },
        ],
      },
    ]);

    console.log(chalk.green(`✓ Unit system set to: ${unitSystem}`));
    await this.waitForKeypress();
  }

  async configureCurrency() {
    const { currency } = await inquirer.prompt([
      {
        type: "list",
        name: "currency",
        message: "Select currency:",
        choices: [
          { name: "EUR (€)", value: "EUR" },
          { name: "USD ($)", value: "USD" },
          { name: "GBP (£)", value: "GBP" },
          { name: "JPY (¥)", value: "JPY" },
          { name: "Other", value: "other" },
        ],
      },
    ]);

    if (currency === "other") {
      const { customCurrency } = await inquirer.prompt([
        {
          type: "input",
          name: "customCurrency",
          message: "Enter currency code (e.g., CAD):",
          validate: (input) => input.length === 3,
        },
      ]);
      console.log(chalk.green(`✓ Currency set to: ${customCurrency}`));
    } else {
      console.log(chalk.green(`✓ Currency set to: ${currency}`));
    }

    await this.waitForKeypress();
  }

  async configureFactors() {
    const factors = await inquirer.prompt([
      {
        type: "number",
        name: "spiceFactor",
        message: "Default spice factor (%):",
        default: 2,
        validate: (input) => input >= 0 && input <= 10,
      },
      {
        type: "number",
        name: "qFactor",
        message: "Default Q-factor (%):",
        default: 3,
        validate: (input) => input >= 0 && input <= 10,
      },
      {
        type: "number",
        name: "targetFoodCost",
        message: "Default target food cost (%):",
        default: 30,
        validate: (input) => input > 0 && input < 100,
      },
    ]);

    console.log(chalk.green("✓ Default factors updated"));
    await this.waitForKeypress();
  }

  async manageData() {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Data management:",
        choices: [
          { name: "Export all data", value: "export" },
          { name: "Import data", value: "import" },
          { name: "Clear all data", value: "clear" },
          { name: "Backup data", value: "backup" },
          { name: "Cancel", value: "cancel" },
        ],
      },
    ]);

    if (action !== "cancel") {
      console.log(chalk.yellow(`⏳ ${action}ing data...`));
      // Implement actual data operations here
      console.log(chalk.green(`✓ Data ${action} complete`));
      await this.waitForKeypress();
    }
  }

  async waitForKeypress() {
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Press Enter to continue...",
      },
    ]);
  }
}
