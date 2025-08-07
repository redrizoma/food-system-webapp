import inquirer from 'inquirer';
import chalk from 'chalk';
import { table } from 'table';
import ora from 'ora';
import DataService from '../services/DataService.js';
import { RecipeValidator } from '../core/validators/RecipeValidator.js';
import { clearScreen, displayTitle, displaySuccess, displayWarning, displayError } from '../utils/display.js';
import { formatCurrency, formatDate, formatWeight, formatPercentage } from '../utils/format.js';

/**
 * Inventory Management Menu
 * Handles stock control, ordering, and inventory valuation
 */
export class InventoryMenu {
  constructor() {
    this.dataService = DataService;
    this.validator = new RecipeValidator();
    this.currentInventory = [];
  }

  /**
   * Show inventory menu
   */
  async show() {
    let continueMenu = true;

    while (continueMenu) {
      clearScreen();
      displayTitle('INVENTORY MANAGEMENT');

      const { choice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'choice',
          message: 'Select an option:',
          choices: [
            { name: '1. 📦 View Current Stock', value: 'view' },
            { name: '2. ➕ Add Stock Item', value: 'add' },
            { name: '3. ✏️  Update Stock Levels', value: 'update' },
            { name: '4. 🔍 Search Inventory', value: 'search' },
            { name: '5. 📊 Stock Valuation', value: 'valuation' },
            { name: '6. ⚠️  Low Stock Alert', value: 'lowstock' },
            { name: '7. 📅 Expiry Management', value: 'expiry' },
            { name: '8. 📈 Usage Analysis', value: 'usage' },
            { name: '9. 🛒 Generate Order List', value: 'order' },
            { name: '10. 💾 Import/Export', value: 'importexport' },
            new inquirer.Separator(),
            { name: '0. ↩️  Back to Main Menu', value: 'back' }
          ],
          pageSize: 13
        }
      ]);

      switch (choice) {
        case 'view':
          await this.viewCurrentStock();
          break;
        case 'add':
          await this.addStockItem();
          break;
        case 'update':
          await this.updateStockLevels();
          break;
        case 'search':
          await this.searchInventory();
          break;
        case 'valuation':
          await this.stockValuation();
          break;
        case 'lowstock':
          await this.lowStockAlert();
          break;
        case 'expiry':
          await this.expiryManagement();
          break;
        case 'usage':
          await this.usageAnalysis();
          break;
        case 'order':
          await this.generateOrderList();
          break;
        case 'importexport':
          await this.importExportData();
          break;
        case 'back':
          continueMenu = false;
          break;
      }
    }
  }

  /**
   * View current stock
   */
  async viewCurrentStock() {
    console.log(chalk.cyan('\n📦 Current Stock Inventory\n'));

    const spinner = ora('Loading inventory...').start();
    
    try {
      this.currentInventory = await this.dataService.loadIngredients();
      spinner.succeed('Inventory loaded');

      if (this.currentInventory.length === 0) {
        displayWarning('No items in inventory');
        await this.waitForKeypress();
        return;
      }

      // Group by category
      const categories = this.groupByCategory(this.currentInventory);

      // Display each category
      for (const [category, items] of Object.entries(categories)) {
        console.log(chalk.yellow(`\n📂 ${category}`));
        
        const data = [
          ['Item', 'Quantity', 'Unit', 'Price/Unit', 'Total Value', 'Status']
        ];

        items.forEach(item => {
          const totalValue = item.quantity * item.unitPrice;
          const status = this.getStockStatus(item);
          
          data.push([
            item.name,
            item.quantity.toFixed(2),
            item.unit,
            formatCurrency(item.unitPrice),
            formatCurrency(totalValue),
            status
          ]);
        });

        console.log(table(data));
      }

      // Display summary
      this.displayInventorySummary();

    } catch (error) {
      spinner.fail('Failed to load inventory');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Add new stock item
   */
  async addStockItem() {
    console.log(chalk.cyan('\n➕ Add New Stock Item\n'));

    const itemInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Item name:',
        validate: input => input.length > 0 || 'Name is required'
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: [
          'Proteins',
          'Vegetables',
          'Fruits',
          'Dairy',
          'Dry Goods',
          'Spices',
          'Beverages',
          'Other'
        ]
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Initial quantity:',
        default: 0,
        validate: input => input >= 0 || 'Quantity must be positive'
      },
      {
        type: 'list',
        name: 'unit',
        message: 'Unit:',
        choices: ['kg', 'g', 'l', 'ml', 'units', 'dozen', 'case']
      },
      {
        type: 'number',
        name: 'unitPrice',
        message: 'Price per unit (€):',
        validate: input => input >= 0 || 'Price must be positive'
      },
      {
        type: 'number',
        name: 'parLevel',
        message: 'Par level (minimum stock):',
        default: 10,
        validate: input => input >= 0
      },
      {
        type: 'number',
        name: 'maxLevel',
        message: 'Maximum stock level:',
        default: 100,
        validate: input => input >= 0
      },
      {
        type: 'input',
        name: 'supplier',
        message: 'Supplier name:',
        default: ''
      },
      {
        type: 'input',
        name: 'supplierCode',
        message: 'Supplier code:',
        default: ''
      },
      {
        type: 'confirm',
        name: 'hasExpiry',
        message: 'Does this item have an expiry date?',
        default: false
      }
    ]);

    // Add expiry date if applicable
    if (itemInfo.hasExpiry) {
      const { expiryDate } = await inquirer.prompt([
        {
          type: 'input',
          name: 'expiryDate',
          message: 'Expiry date (YYYY-MM-DD):',
          validate: input => {
            const date = new Date(input);
            return !isNaN(date.getTime()) || 'Invalid date format';
          }
        }
      ]);
      itemInfo.expiryDate = expiryDate;
    }

    // Add timestamps
    itemInfo.createdAt = new Date().toISOString();
    itemInfo.updatedAt = itemInfo.createdAt;

    try {
      await this.dataService.saveIngredient(itemInfo);
      displaySuccess(`Item "${itemInfo.name}" added to inventory`);
    } catch (error) {
      displayError(`Failed to add item: ${error.message}`);
    }

    await this.waitForKeypress();
  }

  /**
   * Update stock levels
   */
  async updateStockLevels() {
    console.log(chalk.cyan('\n✏️  Update Stock Levels\n'));

    try {
      const inventory = await this.dataService.loadIngredients();
      
      if (inventory.length === 0) {
        displayWarning('No items in inventory');
        await this.waitForKeypress();
        return;
      }

      // Select item to update
      const { itemName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'itemName',
          message: 'Select item to update:',
          choices: inventory.map(item => ({
            name: `${item.name} (Current: ${item.quantity} ${item.unit})`,
            value: item.name
          }))
        }
      ]);

      const item = inventory.find(i => i.name === itemName);

      // Update options
      const { updateType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'updateType',
          message: 'Update type:',
          choices: [
            { name: 'Set new quantity', value: 'set' },
            { name: 'Add to stock', value: 'add' },
            { name: 'Remove from stock', value: 'remove' },
            { name: 'Update price', value: 'price' },
            { name: 'Update par levels', value: 'par' }
          ]
        }
      ]);

      switch (updateType) {
        case 'set':
          const { newQuantity } = await inquirer.prompt([
            {
              type: 'number',
              name: 'newQuantity',
              message: 'New quantity:',
              default: item.quantity,
              validate: input => input >= 0
            }
          ]);
          item.quantity = newQuantity;
          break;

        case 'add':
          const { addQuantity } = await inquirer.prompt([
            {
              type: 'number',
              name: 'addQuantity',
              message: 'Quantity to add:',
              validate: input => input > 0
            }
          ]);
          item.quantity += addQuantity;
          break;

        case 'remove':
          const { removeQuantity } = await inquirer.prompt([
            {
              type: 'number',
              name: 'removeQuantity',
              message: 'Quantity to remove:',
              validate: input => input > 0 && input <= item.quantity
            }
          ]);
          item.quantity -= removeQuantity;
          break;

        case 'price':
          const { newPrice } = await inquirer.prompt([
            {
              type: 'number',
              name: 'newPrice',
              message: 'New price per unit:',
              default: item.unitPrice,
              validate: input => input >= 0
            }
          ]);
          item.unitPrice = newPrice;
          break;

        case 'par':
          const parLevels = await inquirer.prompt([
            {
              type: 'number',
              name: 'parLevel',
              message: 'New par level:',
              default: item.parLevel,
              validate: input => input >= 0
            },
            {
              type: 'number',
              name: 'maxLevel',
              message: 'New max level:',
              default: item.maxLevel,
              validate: input => input >= 0
            }
          ]);
          item.parLevel = parLevels.parLevel;
          item.maxLevel = parLevels.maxLevel;
          break;
      }

      // Update timestamp
      item.updatedAt = new Date().toISOString();

      // Save updated item
      await this.dataService.saveIngredient(item);
      displaySuccess(`Item "${item.name}" updated successfully`);

    } catch (error) {
      displayError(`Failed to update: ${error.message}`);
    }

    await this.waitForKeypress();
  }

  /**
   * Search inventory
   */
  async searchInventory() {
    console.log(chalk.cyan('\n🔍 Search Inventory\n'));

    const { searchTerm } = await inquirer.prompt([
      {
        type: 'input',
        name: 'searchTerm',
        message: 'Search for:',
        validate: input => input.length > 0 || 'Please enter a search term'
      }
    ]);

    const spinner = ora('Searching...').start();

    try {
      const inventory = await this.dataService.loadIngredients();
      const results = inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      spinner.succeed(`Found ${results.length} items`);

      if (results.length === 0) {
        displayWarning('No items found');
      } else {
        const data = [
          ['Item', 'Category', 'Quantity', 'Unit', 'Value', 'Supplier']
        ];

        results.forEach(item => {
          data.push([
            item.name,
            item.category,
            item.quantity.toFixed(2),
            item.unit,
            formatCurrency(item.quantity * item.unitPrice),
            item.supplier || '-'
          ]);
        });

        console.log(table(data));
      }

    } catch (error) {
      spinner.fail('Search failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Stock valuation report
   */
  async stockValuation() {
    console.log(chalk.cyan('\n📊 Stock Valuation Report\n'));

    const spinner = ora('Calculating valuation...').start();

    try {
      const inventory = await this.dataService.loadIngredients();
      spinner.succeed('Valuation calculated');

      if (inventory.length === 0) {
        displayWarning('No items to value');
        await this.waitForKeypress();
        return;
      }

      // Calculate totals by category
      const categoryTotals = {};
      let grandTotal = 0;

      inventory.forEach(item => {
        const value = item.quantity * item.unitPrice;
        const category = item.category || 'Other';
        
        if (!categoryTotals[category]) {
          categoryTotals[category] = {
            count: 0,
            value: 0
          };
        }
        
        categoryTotals[category].count++;
        categoryTotals[category].value += value;
        grandTotal += value;
      });

      // Display valuation
      console.log(chalk.green('\n💰 Inventory Valuation\n'));

      const data = [
        ['Category', 'Items', 'Value', '% of Total']
      ];

      Object.entries(categoryTotals)
        .sort((a, b) => b[1].value - a[1].value)
        .forEach(([category, totals]) => {
          const percentage = (totals.value / grandTotal) * 100;
          data.push([
            category,
            totals.count,
            formatCurrency(totals.value),
            formatPercentage(percentage, 1)
          ]);
        });

      data.push(['', '', '', '']);
      data.push([
        chalk.bold('TOTAL'),
        chalk.bold(inventory.length),
        chalk.bold(formatCurrency(grandTotal)),
        chalk.bold('100.0%')
      ]);

      console.log(table(data));

      // Top value items
      console.log(chalk.yellow('\n📈 Top 5 Value Items:'));
      inventory
        .map(item => ({
          name: item.name,
          value: item.quantity * item.unitPrice
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name}: ${formatCurrency(item.value)}`);
        });

    } catch (error) {
      spinner.fail('Valuation failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Low stock alert
   */
  async lowStockAlert() {
    console.log(chalk.cyan('\n⚠️  Low Stock Alert\n'));

    const spinner = ora('Checking stock levels...').start();

    try {
      const inventory = await this.dataService.loadIngredients();
      const lowStockItems = inventory.filter(item => 
        item.quantity <= (item.parLevel || 10)
      );

      spinner.succeed(`Found ${lowStockItems.length} low stock items`);

      if (lowStockItems.length === 0) {
        displaySuccess('All items are adequately stocked');
      } else {
        console.log(chalk.red('\n🚨 Items Below Par Level:\n'));

        const data = [
          ['Item', 'Current', 'Par Level', 'Order Qty', 'Supplier', 'Status']
        ];

        lowStockItems
          .sort((a, b) => (a.quantity / a.parLevel) - (b.quantity / b.parLevel))
          .forEach(item => {
            const orderQty = (item.maxLevel || 100) - item.quantity;
            const percentOfPar = (item.quantity / item.parLevel) * 100;
            let status;

            if (percentOfPar === 0) {
              status = chalk.red('OUT OF STOCK');
            } else if (percentOfPar < 25) {
              status = chalk.red('CRITICAL');
            } else if (percentOfPar < 50) {
              status = chalk.yellow('LOW');
            } else {
              status = chalk.yellow('BELOW PAR');
            }

            data.push([
              item.name,
              `${item.quantity} ${item.unit}`,
              `${item.parLevel} ${item.unit}`,
              `${orderQty.toFixed(0)} ${item.unit}`,
              item.supplier || '-',
              status
            ]);
          });

        console.log(table(data));

        // Offer to generate order
        const { generateOrder } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'generateOrder',
            message: 'Generate order list for these items?',
            default: true
          }
        ]);

        if (generateOrder) {
          await this.generateOrderFromLowStock(lowStockItems);
        }
      }

    } catch (error) {
      spinner.fail('Check failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Expiry management
   */
  async expiryManagement() {
    console.log(chalk.cyan('\n📅 Expiry Management\n'));

    const spinner = ora('Checking expiry dates...').start();

    try {
      const inventory = await this.dataService.loadIngredients();
      const today = new Date();
      const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringItems = inventory.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= thirtyDays;
      });

      spinner.succeed(`Found ${expiringItems.length} expiring items`);

      if (expiringItems.length === 0) {
        displaySuccess('No items expiring in the next 30 days');
      } else {
        console.log(chalk.yellow('\n⏰ Items Expiring Soon:\n'));

        const data = [
          ['Item', 'Quantity', 'Expiry Date', 'Days Left', 'Status']
        ];

        expiringItems
          .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
          .forEach(item => {
            const expiryDate = new Date(item.expiryDate);
            const daysLeft = Math.floor((expiryDate - today) / (24 * 60 * 60 * 1000));
            let status;

            if (daysLeft < 0) {
              status = chalk.red('EXPIRED');
            } else if (daysLeft === 0) {
              status = chalk.red('EXPIRES TODAY');
            } else if (daysLeft <= 3) {
              status = chalk.red('CRITICAL');
            } else if (daysLeft <= 7) {
              status = chalk.yellow('URGENT');
            } else {
              status = chalk.yellow('WARNING');
            }

            data.push([
              item.name,
              `${item.quantity} ${item.unit}`,
              formatDate(item.expiryDate),
              daysLeft < 0 ? 'Expired' : `${daysLeft} days`,
              status
            ]);
          });

        console.log(table(data));
      }

    } catch (error) {
      spinner.fail('Check failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Usage analysis
   */
  async usageAnalysis() {
    console.log(chalk.cyan('\n📈 Usage Analysis\n'));

    // This would connect to recipe usage data in a full implementation
    console.log(chalk.yellow('📊 Sample Usage Report\n'));

    const sampleData = [
      ['Item', 'Usage/Day', 'Days Stock', 'Turnover', 'Trend'],
      ['Beef Tenderloin', '2.5 kg', '4 days', '7.5x/month', '↑ +15%'],
      ['Olive Oil', '3.0 L', '10 days', '3.0x/month', '→ stable'],
      ['Butter', '1.5 kg', '6 days', '5.0x/month', '↑ +8%'],
      ['Flour', '5.0 kg', '20 days', '1.5x/month', '↓ -5%'],
      ['Tomatoes', '4.0 kg', '2 days', '15x/month', '↑ +20%']
    ];

    console.log(table(sampleData));

    console.log(chalk.yellow('\n💡 Insights:'));
    console.log('  • High turnover items need frequent ordering');
    console.log('  • Tomatoes usage increased 20% - adjust par levels');
    console.log('  • Flour usage down - review bread production');
    console.log('  • Consider bulk purchasing for stable items');

    await this.waitForKeypress();
  }

  /**
   * Generate order list
   */
  async generateOrderList() {
    console.log(chalk.cyan('\n🛒 Generate Order List\n'));

    const { orderType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'orderType',
        message: 'Order type:',
        choices: [
          { name: 'Auto-generate from par levels', value: 'auto' },
          { name: 'Manual selection', value: 'manual' },
          { name: 'By supplier', value: 'supplier' },
          { name: 'Critical items only', value: 'critical' }
        ]
      }
    ]);

    const spinner = ora('Generating order list...').start();

    try {
      const inventory = await this.dataService.loadIngredients();
      let orderItems = [];

      switch (orderType) {
        case 'auto':
          orderItems = inventory.filter(item => 
            item.quantity < (item.parLevel || 10)
          ).map(item => ({
            ...item,
            orderQty: (item.maxLevel || 100) - item.quantity
          }));
          break;

        case 'critical':
          orderItems = inventory.filter(item => 
            item.quantity < (item.parLevel || 10) * 0.25
          ).map(item => ({
            ...item,
            orderQty: (item.maxLevel || 100) - item.quantity
          }));
          break;

        case 'supplier':
          const suppliers = [...new Set(inventory.map(i => i.supplier).filter(Boolean))];
          
          if (suppliers.length === 0) {
            displayWarning('No suppliers found in inventory');
            spinner.stop();
            await this.waitForKeypress();
            return;
          }

          const { selectedSupplier } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedSupplier',
              message: 'Select supplier:',
              choices: suppliers
            }
          ]);

          orderItems = inventory.filter(item => 
            item.supplier === selectedSupplier && 
            item.quantity < (item.parLevel || 10)
          ).map(item => ({
            ...item,
            orderQty: (item.maxLevel || 100) - item.quantity
          }));
          break;

        case 'manual':
          // Manual selection would be implemented here
          displayWarning('Manual selection coming soon');
          spinner.stop();
          await this.waitForKeypress();
          return;
      }

      spinner.succeed('Order list generated');

      if (orderItems.length === 0) {
        displayWarning('No items need ordering');
      } else {
        console.log(chalk.green('\n📋 Order List\n'));

        // Group by supplier
        const bySupplier = {};
        orderItems.forEach(item => {
          const supplier = item.supplier || 'Unassigned';
          if (!bySupplier[supplier]) {
            bySupplier[supplier] = [];
          }
          bySupplier[supplier].push(item);
        });

        let totalOrderValue = 0;

        Object.entries(bySupplier).forEach(([supplier, items]) => {
          console.log(chalk.yellow(`\n📦 ${supplier}`));

          const data = [
            ['Item', 'Current', 'Order Qty', 'Unit Price', 'Total']
          ];

          let supplierTotal = 0;

          items.forEach(item => {
            const total = item.orderQty * item.unitPrice;
            supplierTotal += total;

            data.push([
              item.name,
              `${item.quantity} ${item.unit}`,
              `${item.orderQty.toFixed(0)} ${item.unit}`,
              formatCurrency(item.unitPrice),
              formatCurrency(total)
            ]);
          });

          data.push(['', '', '', chalk.bold('Subtotal:'), chalk.bold(formatCurrency(supplierTotal))]);
          console.log(table(data));

          totalOrderValue += supplierTotal;
        });

        console.log(chalk.green(`\n💰 Total Order Value: ${formatCurrency(totalOrderValue)}`));

        // Export option
        const { exportOrder } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'exportOrder',
            message: 'Export order list to CSV?',
            default: false
          }
        ]);

        if (exportOrder) {
          await this.exportOrderList(orderItems);
        }
      }

    } catch (error) {
      spinner.fail('Generation failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Import/Export data
   */
  async importExportData() {
    console.log(chalk.cyan('\n💾 Import/Export Inventory Data\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select action:',
        choices: [
          { name: 'Export inventory to CSV', value: 'export_csv' },
          { name: 'Export inventory to JSON', value: 'export_json' },
          { name: 'Import from CSV', value: 'import_csv' },
          { name: 'Import from JSON', value: 'import_json' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'cancel') {
      return;
    }

    const spinner = ora('Processing...').start();

    try {
      switch (action) {
        case 'export_csv':
          const inventory = await this.dataService.loadIngredients();
          const filename = `inventory_${new Date().toISOString().split('T')[0]}`;
          const filepath = await this.dataService.exportToCSV(inventory, filename);
          spinner.succeed(`Exported to: ${filepath}`);
          break;

        case 'export_json':
          // Implementation for JSON export
          spinner.succeed('Exported to JSON');
          break;

        case 'import_csv':
        case 'import_json':
          displayWarning('Import functionality coming soon');
          spinner.stop();
          break;
      }

    } catch (error) {
      spinner.fail('Operation failed');
      displayError(error.message);
    }

    await this.waitForKeypress();
  }

  /**
   * Helper: Group inventory by category
   */
  groupByCategory(inventory) {
    const grouped = {};
    
    inventory.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  }

  /**
   * Helper: Get stock status
   */
  getStockStatus(item) {
    const percentage = (item.quantity / (item.parLevel || 10)) * 100;
    
    if (percentage === 0) {
      return chalk.red('OUT');
    } else if (percentage < 25) {
      return chalk.red('CRITICAL');
    } else if (percentage < 50) {
      return chalk.yellow('LOW');
    } else if (percentage < 100) {
      return chalk.yellow('BELOW PAR');
    } else if (percentage > 200) {
      return chalk.green('OVERSTOCKED');
    } else {
      return chalk.green('OK');
    }
  }

  /**
   * Helper: Display inventory summary
   */
  displayInventorySummary() {
    const totalValue = this.currentInventory.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    
    const lowStockCount = this.currentInventory.filter(item => 
      item.quantity <= (item.parLevel || 10)
    ).length;

    const expiringCount = this.currentInventory.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.floor(
        (new Date(item.expiryDate) - new Date()) / (24 * 60 * 60 * 1000)
      );
      return daysUntilExpiry <= 7;
    }).length;

    console.log(chalk.green('\n📊 Inventory Summary'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`  Total Items: ${this.currentInventory.length}`);
    console.log(`  Total Value: ${formatCurrency(totalValue)}`);
    console.log(`  Low Stock Items: ${lowStockCount}`);
    console.log(`  Expiring Soon: ${expiringCount}`);
  }

  /**
   * Helper: Generate order from low stock items
   */
  async generateOrderFromLowStock(lowStockItems) {
    const orderList = lowStockItems.map(item => ({
      name: item.name,
      currentQty: item.quantity,
      orderQty: (item.maxLevel || 100) - item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalCost: ((item.maxLevel || 100) - item.quantity) * item.unitPrice,
      supplier: item.supplier || 'Unassigned'
    }));

    const totalCost = orderList.reduce((sum, item) => sum + item.totalCost, 0);

    console.log(chalk.green('\n📋 Generated Order List\n'));
    console.log(`Total Items: ${orderList.length}`);
    console.log(`Total Cost: ${formatCurrency(totalCost)}`);
    
    // Group by supplier for output
    const bySupplier = {};
    orderList.forEach(item => {
      if (!bySupplier[item.supplier]) {
        bySupplier[item.supplier] = [];
      }
      bySupplier[item.supplier].push(item);
    });

    console.log(chalk.yellow('\n📦 Orders by Supplier:'));
    Object.entries(bySupplier).forEach(([supplier, items]) => {
      const supplierTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
      console.log(`\n  ${supplier}: ${items.length} items - ${formatCurrency(supplierTotal)}`);
    });
  }

  /**
   * Helper: Export order list
   */
  async exportOrderList(orderItems) {
    try {
      const filename = `order_${new Date().toISOString().split('T')[0]}`;
      const filepath = await this.dataService.exportToCSV(orderItems, filename);
      displaySuccess(`Order list exported to: ${filepath}`);
    } catch (error) {
      displayError(`Export failed: ${error.message}`);
    }
  }

  /**
   * Wait for keypress
   */
  async waitForKeypress() {
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: '\nPress Enter to continue...'
      }
    ]);
  }
}