# Food System WebApp - Professional Culinary Management System

## 🍽️ Overview

Food System WebApp is a comprehensive command-line interface (CLI) application designed for professional kitchens, restaurants, bakeries, and food service operations. It provides advanced calculations and management tools covering all aspects of culinary operations, from traditional food costing to molecular gastronomy techniques.

## ✨ Features

### Core Modules

#### 1. 📋 Recipe Costing & Escandallo

- Complete recipe cost breakdown with yield management
- AP (As Purchased) vs EP (Edible Portion) costing
- Spice factor and Q-factor calculations
- Automatic menu price suggestions
- Meat cutting yield tests
- Recipe scaling and batch calculations

#### 2. 🥖 Bakery Calculations

- Baker's percentage formulas
- Recipe scaling by flour/dough/pieces
- Hydration calculations
- Preferment management (poolish, biga, sourdough)
- Formula validation
- Production scheduling

#### 3. 🥐 Pastry Arts

- Lamination layer calculations
- Sugar syrup stages (thread to caramel)
- Chocolate tempering curves
- Custard scaling
- Macaron formulations (Italian method)
- Choux pastry ratios
- Ganache calculations
- Glaze formulations

#### 4. 🧪 Molecular Gastronomy

- Spherification (basic, reverse, frozen)
- Gelification with various hydrocolloids
- Foam and air calculations
- Transglutaminase bonding
- Methylcellulose hot gels
- pH adjustment
- Concentration guides

#### 5. 🌡️ Sous Vide Precision

- Time-temperature calculations
- Thickness-based heating times
- Pasteurization validation
- Multi-stage cooking programs
- Safety assessments
- Texture optimization

#### 6. 🧫 Fermentation Science

- Wine fermentation with SO₂ management
- Beer fermentation profiles
- Bread fermentation timing
- Vegetable lacto-fermentation
- Cheese culture calculations
- Yogurt and kefir production

#### 7. 📦 Inventory Management

- Real-time stock tracking
- Par level management
- Expiry date monitoring
- Yield percentage tracking
- Price updates and history
- Low stock alerts
- Inventory valuation

#### 8. 📊 Reports & Analysis

- Escandallo reports
- Food cost analysis
- Menu engineering matrix
- Profitability reports
- Production schedules
- Dashboard summaries
- Export capabilities (CSV, JSON)

## 🚀 Installation

### Prerequisites

- Node.js v18.0.0 or higher
- npm (comes with Node.js)
- 500MB free disk space

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/food-system-webapp.git
cd food-system-webapp

# Run the setup script
chmod +x setup.sh
./setup.sh
```

### Manual Installation

```bash
# Install dependencies
npm install

# Create data directories
mkdir -p src/data/{recipes,ingredients,costs,templates}
mkdir -p exports backups

# Start the application
npm start
```

### Global Installation

```bash
# Install globally for system-wide access
sudo npm link

# Run from anywhere
foodsystem
```

## 📱 Usage

### Interactive Number-Based Menu

The application uses an intuitive number-based menu system:

1. Launch the application: `foodsystem` or `npm start`
2. Navigate using arrow keys or number selection
3. Press Enter to confirm selections
4. Press 0 to go back at any menu level
5. Press Ctrl+C to exit

### Main Menu Structure

```
╔════════════════════════════════════════════╗
║     FOOD SYSTEM WEBAPP - MAIN MENU        ║
╚════════════════════════════════════════════╝

1. 📋 Recipe Costing & Escandallo
2. 🥖 Bakery Calculations
3. 🥐 Pastry Arts
4. 🧪 Molecular Gastronomy
5. 🌡️ Sous Vide Precision
6. 🧫 Fermentation Science
7. 📦 Inventory Management
8. 📊 Reports & Analysis
9. ⚙️ Settings
0. 🚪 Exit
```

## 📚 Examples

### Recipe Costing Example

```javascript
// Create a new recipe with escandallo
1. Select "Recipe Costing & Escandallo"
2. Choose "Create New Recipe"
3. Enter recipe details:
   - Name: Beef Wellington
   - Portions: 8
   - Target food cost: 30%
4. Add ingredients with yields:
   - Beef tenderloin: 2kg @ €45/kg, 75% yield
   - Puff pastry: 500g @ €8/kg, 100% yield
5. View automatic cost analysis and pricing
```

### Baker's Formula Example

```javascript
// Create and scale a bread formula
1. Select "Bakery Calculations"
2. Choose "Create Baker's Formula"
3. Enter ingredients:
   - Bread flour: 1000g (100%)
   - Water: 650g (65%)
   - Salt: 20g (2%)
   - Yeast: 10g (1%)
4. Scale to desired batch size
5. View hydration and validation
```

### Molecular Spherification Example

```javascript
// Calculate spherification ingredients
1. Select "Molecular Gastronomy"
2. Choose "Spherification"
3. Select technique: Basic Spherification
4. Enter volumes:
   - Liquid: 500ml
   - Bath: 1000ml
5. View precise calculations:
   - Sodium alginate: 2.5g (0.5%)
   - Calcium chloride: 10g (1.0%)
```

## 📊 Calculation Formulas

### Food Costing

```
Food Cost % = (Cost of Goods Sold / Total Revenue) × 100
EP Cost = (AP Cost × 100) / Yield Percentage
Menu Price = Cost per Serving / Target Food Cost %
```

### Baker's Percentages

```
Baker's % = (Ingredient Weight / Total Flour Weight) × 100
Hydration % = (Water Weight / Flour Weight) × 100
```

### Molecular Concentrations

```
Sodium Alginate: 0.5-1.0% of liquid volume
Calcium Bath: 1.0% calcium chloride solution
Agar Gel: 0.5-1.5% depending on firmness
```

### Sous Vide Timing

```
Heating Time = (Thickness²) / (4 × Thermal Diffusivity) × Shape Factor
D-value at T = D₆₀ × 10^((60-T)/z)
```

## 🎯 Industry Standards

### Food Cost Targets

- Fine Dining: 30-40%
- Casual Dining: 28-35%
- Quick Service: 20-30%
- Bakery: 25-35%

### Common Yields

- Beef Tenderloin: 70-75%
- Whole Chicken: 65-70%
- Vegetables: 45-90% (varies)

### Temperature Guidelines

- Sous Vide Beef: 49-71°C
- Chocolate Tempering: 28-31°C
- Sugar Stages: 106-177°C
- Fermentation: 18-45°C

## 📁 Project Structure

```
food-system-webapp/
├── src/
│   ├── index.js                    # Main entry point
│   ├── config/
│   │   ├── constants.js           # System constants
│   │   └── database.js            # Data configuration
│   ├── core/
│   │   ├── calculations/          # All calculators
│   │   ├── converters/            # Unit converters
│   │   └── validators/            # Input validators
│   ├── menus/                     # Interactive menus
│   ├── services/                  # Data and report services
│   ├── utils/                     # Utility functions
│   └── data/                      # Data storage
├── exports/                       # Export directory
├── backups/                       # Backup directory
├── package.json
├── setup.sh
└── README.md
```

## 💾 Data Management

### Storage Format

- All data stored in JSON format
- Automatic backups available
- Export to CSV/JSON supported
- Import functionality for bulk data

### File Locations

- Recipes: `src/data/recipes/`
- Ingredients: `src/data/ingredients/`
- Cost History: `src/data/costs/`
- Exports: `exports/`
- Backups: `backups/`

## ⚙️ Configuration

### Settings Menu

- Unit system (Metric/Imperial/Baker's)
- Currency selection
- Default factors (spice, Q-factor)
- Data management (backup/restore)

### Environment Variables

```bash
# Optional configuration
export FOOD_SYSTEM_CURRENCY="EUR"
export FOOD_SYSTEM_UNITS="metric"
export FOOD_SYSTEM_LANGUAGE="en"
```

## 🔧 Troubleshooting

### Common Issues

#### Application won't start

```bash
# Check Node.js version
node --version  # Must be v18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Permission errors

```bash
# Fix permissions
chmod +x src/index.js
chmod +x setup.sh

# Global install with sudo
sudo npm link
```

#### Data not saving

```bash
# Check directory permissions
chmod -R 755 src/data
chmod -R 755 exports
```

## 📈 Performance

- Instant calculations using Decimal.js for precision
- Efficient data storage with JSON
- Minimal memory footprint (~50MB)
- Fast startup time (<1 second)
- Handles thousands of recipes/ingredients

## 🔒 Security

- No external API dependencies
- All data stored locally
- No telemetry or tracking
- Secure calculation algorithms
- Input validation on all fields

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with real-world scenarios
4. Ensure all calculations follow industry standards
5. Submit a pull request with detailed description

## 📜 License

MIT License - See LICENSE file for details

## 👥 Credits

Developed for professional chefs, bakers, and food service managers who require accurate, reliable culinary calculations.

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/yourusername/food-system-webapp/issues)
- Documentation: [Full documentation](https://github.com/yourusername/food-system-webapp/wiki)
- Email: support@foodsystemwebapp.com

## 🎉 Acknowledgments

Special thanks to:

- Professional chefs and bakers who provided industry insights
- The culinary science community for validation methods
- Open source contributors

---

**Built with ❤️ for the culinary industry**

_Version 1.0.0 - Professional Edition_
