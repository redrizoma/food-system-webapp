#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import { MainMenu } from "./menus/MainMenu.js";
import { displayWelcome, displayGoodbye } from "./utils/display.js";

/**
 * Main Application Entry Point
 * Interactive CLI for Food System WebApp
 */
class FoodSystemApp {
  constructor() {
    this.mainMenu = new MainMenu();
    this.isRunning = true;
  }

  async start() {
    displayWelcome();

    while (this.isRunning) {
      try {
        await this.mainMenu.show();

        // Check if user wants to exit
        if (this.mainMenu.shouldExit) {
          this.isRunning = false;
        }
      } catch (error) {
        console.error(chalk.red("\n❌ An error occurred:"), error.message);

        const { continueApp } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueApp",
            message: "Do you want to continue?",
            default: true,
          },
        ]);

        if (!continueApp) {
          this.isRunning = false;
        }
      }
    }

    displayGoodbye();
    process.exit(0);
  }
}

// Start the application
const app = new FoodSystemApp();
app.start().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
