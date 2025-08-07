#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { recipeCommand } from "./commands/recipe.js";
import { inventoryCommand } from "./commands/inventory.js";
import { foodcostCommand } from "./commands/foodcost.js";
import { bakeryCommand } from "./commands/bakery.js";
import { reportsCommand } from "./commands/reports.js";

const program = new Command();

// Configure the main program
program
  .name("foodcost")
  .description(chalk.cyan("Professional Food Cost & Bakery Calculation System"))
  .version("1.0.0")
  .option("-m, --metric", "Use metric units (default)", true)
  .option("-b, --bakery-units", "Use baker's percentages")
  .option("-v, --verbose", "Verbose output");

// Add commands
program.addCommand(recipeCommand);
program.addCommand(inventoryCommand);
program.addCommand(foodcostCommand);
program.addCommand(bakeryCommand);
program.addCommand(reportsCommand);

// Interactive mode when no command is provided
program.action(async () => {
  console.log(chalk.green("\n╔════════════════════════════════════════╗"));
  console.log(chalk.green("║   Food System WebApp - CLI Interface   ║"));
  console.log(chalk.green("╚════════════════════════════════════════╝\n"));

  console.log(chalk.yellow("Available Commands:\n"));
  console.log(
    "  " +
      chalk.cyan("recipe") +
      "     - Recipe costing and escandallo calculations"
  );
  console.log(
    "  " + chalk.cyan("inventory") + "  - Inventory and yield management"
  );
  console.log(
    "  " + chalk.cyan("foodcost") + "   - Food cost percentage calculations"
  );
  console.log(
    "  " +
      chalk.cyan("bakery") +
      "     - Baker's percentage and formula calculations"
  );
  console.log(
    "  " + chalk.cyan("reports") + "    - Generate cost breakdown reports\n"
  );

  console.log(
    chalk.gray("Use: foodcost <command> --help for more information")
  );
  console.log(chalk.gray("Example: foodcost recipe create\n"));
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
