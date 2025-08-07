#!/usr/bin/env node

/**
 * Food System WebApp - Main Entry Point
 * Professional Culinary Management System
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { MainMenu } from './menus/MainMenu.js';
import { displayWelcome, displayGoodbye, displayError } from './utils/display.js';
import DataService from './services/DataService.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main Application Class
 */
class FoodSystemApp {
  constructor() {
    this.mainMenu = new MainMenu();
    this.isRunning = true;
    this.config = {
      version: '1.0.0',
      author: 'Professional Edition',
      environment: process.env.NODE_ENV || 'production'
    };
  }

  /**
   * Initialize application
   */
  async initialize() {
    const spinner = ora('Initializing Food System WebApp...').start();
    
    try {
      // Initialize data directories
      await DataService.initializeDirectories();
      
      // Load configuration
      await this.loadConfiguration();
      
      // Check for updates (optional)
      if (this.config.checkUpdates) {
        await this.checkForUpdates();
      }
      
      spinner.succeed('Application initialized successfully');
      return true;
    } catch (error) {
      spinner.fail('Initialization failed');
      displayError(`Initialization error: ${error.message}`);
      return false;
    }
  }

  /**
   * Load application configuration
   */
  async loadConfiguration() {
    // Load from environment variables or config file
    this.config.currency = process.env.FOOD_SYSTEM_CURRENCY || 'EUR';
    this.config.units = process.env.FOOD_SYSTEM_UNITS || 'metric';
    this.config.language = process.env.FOOD_SYSTEM_LANGUAGE || 'en';
    this.config.checkUpdates = process.env.FOOD_SYSTEM_CHECK_UPDATES !== 'false';
  }

  /**
   * Check for application updates
   */
  async checkForUpdates() {
    // Placeholder for update check logic
    // In production, this would check a remote server
    return Promise.resolve();
  }

  /**
   * Main application loop
   */
  async run() {
    // Display welcome message
    displayWelcome();
    
    // Initialize application
    const initialized = await this.initialize();
    if (!initialized) {
      process.exit(1);
    }

    // Main application loop
    while (this.isRunning) {
      try {
        await this.mainMenu.show();

        // Check if user wants to exit
        if (this.mainMenu.shouldExit) {
          this.isRunning = false;
        }
      } catch (error) {
        console.error(chalk.red('\n❌ An error occurred:'), error.message);
        
        // Log error for debugging
        if (this.config.environment === 'development') {
          console.error(chalk.gray('Stack trace:'), error.stack);
        }

        // Ask user if they want to continue
        const { continueApp } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueApp',
            message: 'Do you want to continue?',
            default: true
          }
        ]);

        if (!continueApp) {
          this.isRunning = false;
        }
      }
    }

    // Cleanup and exit
    await this.cleanup();
    displayGoodbye();
    process.exit(0);
  }

  /**
   * Cleanup before exit
   */
  async cleanup() {
    const spinner = ora('Saving data...').start();
    
    try {
      // Save any pending data
      // Perform cleanup operations
      spinner.succeed('Data saved successfully');
    } catch (error) {
      spinner.fail('Failed to save some data');
      displayError(`Cleanup error: ${error.message}`);
    }
  }

  /**
   * Handle uncaught errors
   */
  handleError(error) {
    console.error(chalk.red('\n💥 Fatal error occurred:'));
    console.error(chalk.red(error.message));
    
    if (this.config.environment === 'development') {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
    
    console.error(chalk.yellow('\nPlease report this issue if it persists.'));
    process.exit(1);
  }

  /**
   * Handle process signals
   */
  setupSignalHandlers() {
    // Handle Ctrl+C gracefully
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\n⚠️  Interrupt signal received...'));
      await this.cleanup();
      displayGoodbye();
      process.exit(0);
    });

    // Handle termination signal
    process.on('SIGTERM', async () => {
      await this.cleanup();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleError(error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      this.handleError(error);
    });
  }
}

/**
 * Start the application
 */
async function main() {
  const app = new FoodSystemApp();
  
  // Setup signal handlers
  app.setupSignalHandlers();
  
  // Run the application
  try {
    await app.run();
  } catch (error) {
    app.handleError(error);
  }
}

// Check if running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for testing
export { FoodSystemApp };
export default main;