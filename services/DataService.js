import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Data Service for persisting recipes and calculations
 */
export class DataService {
  constructor() {
    this.basePath = path.join(__dirname, "..", "data");
    this.paths = {
      recipes: path.join(this.basePath, "recipes"),
      ingredients: path.join(this.basePath, "ingredients"),
      costs: path.join(this.basePath, "costs"),
      templates: path.join(this.basePath, "templates"),
    };

    // Ensure directories exist
    this.initializeDirectories();
  }

  /**
   * Initialize data directories
   */
  async initializeDirectories() {
    for (const dir of Object.values(this.paths)) {
      await fs.ensureDir(dir);
    }
  }

  /**
   * Save recipe to file
   * @param {Object} recipe - Recipe object to save
   * @returns {Promise<string>} - Saved file path
   */
  async saveRecipe(recipe) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${recipe.name
        .toLowerCase()
        .replace(/\s+/g, "-")}_${timestamp}.json`;
      const filepath = path.join(this.paths.recipes, filename);

      await fs.writeJson(filepath, recipe, { spaces: 2 });
      return filepath;
    } catch (error) {
      throw new Error(`Failed to save recipe: ${error.message}`);
    }
  }

  /**
   * Load recipe from file
   * @param {string} filename - Recipe filename
   * @returns {Promise<Object>} - Recipe object
   */
  async loadRecipe(filename) {
    try {
      const filepath = path.join(this.paths.recipes, filename);
      const recipe = await fs.readJson(filepath);
      return recipe;
    } catch (error) {
      throw new Error(`Failed to load recipe: ${error.message}`);
    }
  }

  /**
   * List all recipes
   * @returns {Promise<Array>} - Array of recipe info
   */
  async listRecipes() {
    try {
      const files = await fs.readdir(this.paths.recipes);
      const recipes = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.paths.recipes, file);
          const recipe = await fs.readJson(filepath);
          recipes.push({
            filename: file,
            name: recipe.name,
            category: recipe.category,
            portions: recipe.portions,
            createdAt: recipe.createdAt,
          });
        }
      }

      return recipes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      throw new Error(`Failed to list recipes: ${error.message}`);
    }
  }

  /**
   * Delete recipe
   * @param {string} filename - Recipe filename to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteRecipe(filename) {
    try {
      const filepath = path.join(this.paths.recipes, filename);
      await fs.remove(filepath);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  /**
   * Save ingredient to database
   * @param {Object} ingredient - Ingredient object
   * @returns {Promise<string>} - Saved file path
   */
  async saveIngredient(ingredient) {
    try {
      const filename = `${ingredient.name
        .toLowerCase()
        .replace(/\s+/g, "-")}.json`;
      const filepath = path.join(this.paths.ingredients, filename);

      await fs.writeJson(filepath, ingredient, { spaces: 2 });
      return filepath;
    } catch (error) {
      throw new Error(`Failed to save ingredient: ${error.message}`);
    }
  }

  /**
   * Load ingredient database
   * @returns {Promise<Array>} - Array of ingredients
   */
  async loadIngredients() {
    try {
      const files = await fs.readdir(this.paths.ingredients);
      const ingredients = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.paths.ingredients, file);
          const data = await fs.readJson(filepath);

          // Handle both single ingredients and ingredient collections
          if (Array.isArray(data.ingredients)) {
            ingredients.push(...data.ingredients);
          } else {
            ingredients.push(data);
          }
        }
      }

      return ingredients;
    } catch (error) {
      throw new Error(`Failed to load ingredients: ${error.message}`);
    }
  }

  /**
   * Save cost history
   * @param {Object} costData - Cost calculation data
   * @returns {Promise<string>} - Saved file path
   */
  async saveCostHistory(costData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `cost_${timestamp}.json`;
      const filepath = path.join(this.paths.costs, filename);

      await fs.writeJson(filepath, costData, { spaces: 2 });
      return filepath;
    } catch (error) {
      throw new Error(`Failed to save cost history: ${error.message}`);
    }
  }

  /**
   * Load cost history
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} - Array of cost records
   */
  async loadCostHistory(limit = 10) {
    try {
      const files = await fs.readdir(this.paths.costs);
      const costs = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.paths.costs, file);
          const cost = await fs.readJson(filepath);
          costs.push(cost);
        }
      }

      return costs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to load cost history: ${error.message}`);
    }
  }

  /**
   * Export data to CSV
   * @param {Array} data - Data to export
   * @param {string} filename - Output filename
   * @returns {Promise<string>} - Exported file path
   */
  async exportToCSV(data, filename) {
    try {
      const exportPath = path.join(__dirname, "..", "..", "exports");
      await fs.ensureDir(exportPath);

      const filepath = path.join(exportPath, `${filename}.csv`);

      // Convert data to CSV format
      if (data.length === 0) {
        throw new Error("No data to export");
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape commas and quotes in values
              if (
                typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      await fs.writeFile(filepath, csvContent, "utf8");
      return filepath;
    } catch (error) {
      throw new Error(`Failed to export to CSV: ${error.message}`);
    }
  }

  /**
   * Import data from CSV
   * @param {string} filepath - CSV file path
   * @returns {Promise<Array>} - Parsed data
   */
  async importFromCSV(filepath) {
    try {
      const content = await fs.readFile(filepath, "utf8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error(
          "CSV file must contain headers and at least one data row"
        );
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        data.push(row);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to import from CSV: ${error.message}`);
    }
  }

  /**
   * Parse CSV line handling quoted values
   * @param {string} line - CSV line to parse
   * @returns {Array} - Parsed values
   */
  parseCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Backup all data
   * @returns {Promise<string>} - Backup file path
   */
  async backupData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = path.join(__dirname, "..", "..", "backups");
      await fs.ensureDir(backupDir);

      const backupPath = path.join(backupDir, `backup_${timestamp}`);
      await fs.copy(this.basePath, backupPath);

      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup data: ${error.message}`);
    }
  }

  /**
   * Restore data from backup
   * @param {string} backupPath - Backup directory path
   * @returns {Promise<boolean>} - Success status
   */
  async restoreData(backupPath) {
    try {
      // Create a safety backup first
      const safetyBackup = await this.backupData();

      try {
        // Clear current data
        await fs.emptyDir(this.basePath);

        // Restore from backup
        await fs.copy(backupPath, this.basePath);

        return true;
      } catch (restoreError) {
        // If restore fails, recover from safety backup
        await fs.copy(safetyBackup, this.basePath);
        throw restoreError;
      }
    } catch (error) {
      throw new Error(`Failed to restore data: ${error.message}`);
    }
  }

  /**
   * Search recipes
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Matching recipes
   */
  async searchRecipes(query) {
    try {
      const allRecipes = await this.listRecipes();
      const searchTerm = query.toLowerCase();

      return allRecipes.filter((recipe) => {
        return (
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.category.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  /**
   * Get statistics
   * @returns {Promise<Object>} - Data statistics
   */
  async getStatistics() {
    try {
      const recipes = await this.listRecipes();
      const ingredients = await this.loadIngredients();
      const costs = await fs.readdir(this.paths.costs);

      return {
        totalRecipes: recipes.length,
        totalIngredients: ingredients.length,
        totalCostCalculations: costs.filter((f) => f.endsWith(".json")).length,
        recipesByCategory: this.groupByCategory(recipes),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Group recipes by category
   * @param {Array} recipes - Recipes to group
   * @returns {Object} - Grouped recipes
   */
  groupByCategory(recipes) {
    return recipes.reduce((groups, recipe) => {
      const category = recipe.category || "Other";
      groups[category] = (groups[category] || 0) + 1;
      return groups;
    }, {});
  }
}

// Export singleton instance
export default new DataService();
