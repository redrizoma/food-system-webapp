import chalk from "chalk";
import figlet from "figlet";

/**
 * Clear the console screen
 */
export function clearScreen() {
  console.clear();
}

/**
 * Display welcome message
 */
export function displayWelcome() {
  clearScreen();

  const title = figlet.textSync("Food System", {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  console.log(chalk.cyan(title));
  console.log(chalk.green("═".repeat(60)));
  console.log(
    chalk.white.bold("Professional Food Cost & Recipe Management System")
  );
  console.log(chalk.gray("Version 1.0.0"));
  console.log(chalk.green("═".repeat(60)));
  console.log();
}

/**
 * Display goodbye message
 */
export function displayGoodbye() {
  clearScreen();
  console.log(chalk.cyan("\n" + "═".repeat(60)));
  console.log(chalk.cyan.bold("Thank you for using Food System WebApp!"));
  console.log(chalk.gray("Your culinary calculations made simple."));
  console.log(chalk.cyan("═".repeat(60) + "\n"));
}

/**
 * Display a formatted title
 * @param {string} title - The title to display
 */
export function displayTitle(title) {
  console.log(chalk.cyan.bold(`\n${"═".repeat(50)}`));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan.bold(`${"═".repeat(50)}\n`));
}

/**
 * Display a success message
 * @param {string} message - The success message
 */
export function displaySuccess(message) {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Display a warning message
 * @param {string} message - The warning message
 */
export function displayWarning(message) {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

/**
 * Display an error message
 * @param {string} message - The error message
 */
export function displayError(message) {
  console.log(chalk.red(`❌ ${message}`));
}

/**
 * Display a loading spinner
 * @param {string} message - The loading message
 */
export function displayLoading(message) {
  const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(spinner[i])} ${message}`);
    i = (i + 1) % spinner.length;
  }, 100);

  return {
    stop: () => {
      clearInterval(interval);
      process.stdout.write("\r" + " ".repeat(message.length + 3) + "\r");
    },
  };
}

/**
 * Display a progress bar
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {string} label - Progress label
 */
export function displayProgress(current, total, label = "Progress") {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

  process.stdout.write(`\r${label}: ${chalk.cyan(bar)} ${percentage}%`);

  if (current === total) {
    console.log(); // New line when complete
  }
}

/**
 * Display a formatted table header
 * @param {string[]} headers - Array of header strings
 */
export function displayTableHeader(headers) {
  const separator = "─".repeat(headers.join(" │ ").length);
  console.log(chalk.gray(separator));
  console.log(chalk.bold(headers.join(" │ ")));
  console.log(chalk.gray(separator));
}

/**
 * Display a section divider
 * @param {string} text - Optional text to display in the divider
 */
export function displayDivider(text = "") {
  if (text) {
    const padding = Math.floor((50 - text.length) / 2);
    const line = "─".repeat(padding);
    console.log(chalk.gray(`\n${line} ${text} ${line}\n`));
  } else {
    console.log(chalk.gray("\n" + "─".repeat(50) + "\n"));
  }
}

/**
 * Display a box with content
 * @param {string} content - Content to display in the box
 * @param {string} color - Color for the box (default: cyan)
 */
export function displayBox(content, color = "cyan") {
  const lines = content.split("\n");
  const maxLength = Math.max(...lines.map((line) => line.length));
  const boxColor = chalk[color];

  console.log(boxColor("┌" + "─".repeat(maxLength + 2) + "┐"));
  lines.forEach((line) => {
    const padding = " ".repeat(maxLength - line.length);
    console.log(boxColor("│ ") + line + padding + boxColor(" │"));
  });
  console.log(boxColor("└" + "─".repeat(maxLength + 2) + "┘"));
}

/**
 * Display a list with bullets
 * @param {string[]} items - Array of items to display
 * @param {string} bullet - Bullet character (default: •)
 */
export function displayList(items, bullet = "•") {
  items.forEach((item) => {
    console.log(chalk.gray(`  ${bullet} `) + item);
  });
}

/**
 * Display key-value pairs
 * @param {Object} data - Object with key-value pairs
 * @param {number} indent - Indentation level (default: 2)
 */
export function displayKeyValue(data, indent = 2) {
  const padding = " ".repeat(indent);
  Object.entries(data).forEach(([key, value]) => {
    console.log(padding + chalk.gray(`${key}:`) + ` ${value}`);
  });
}
