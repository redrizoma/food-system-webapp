# Food System WebApp - Complete Culinary Calculation Suite

## Overview

A comprehensive CLI application covering ALL aspects of professional culinary calculations, from traditional food costing to advanced molecular gastronomy. This system integrates food service management, bakery sciences, pastry arts, molecular techniques, sous vide precision cooking, and fermentation processes using industry-standard methodologies and scientific principles.

## Features

### 1. Food Cost Management

- **Cost of Goods Sold (CoGS)** calculation
- **Food cost percentage** analysis (total and per-dish)
- **Ideal menu pricing** based on target margins
- **Contribution margin** analysis
- **Menu engineering** with item classification (Stars, Puzzles, Plow Horses, Dogs)

### 2. Recipe Costing (Escandallo)

- **Complete ingredient breakdown** with individual costs
- **AP (As Purchased) vs EP (Edible Portion)** costing
- **Yield percentage** calculations with waste tracking
- **Spice factor** for minor ingredients (default 2%)
- **Q-factor** for accompaniments and garnishes (default 3%)
- **Automatic price suggestions** based on target food cost

### 3. Bakery Module

- **Baker's percentage** calculations
- **Formula scaling** for different batch sizes
- **Hydration calculations** for dough consistency
- **Preferment management** (poolish, biga, sourdough)
- **Formula validation** with warnings for unusual ratios

### 4. Pastry Arts

- **Lamination calculations** with layer counting (croissant, puff pastry, danish)
- **Sugar syrup stages** with Brix and temperature management
- **Chocolate tempering** curves for dark, milk, and white chocolate
- **Custard scaling** for various applications
- **Ganache ratios** by chocolate type and use
- **Macaron formulations** with Italian meringue method
- **Choux pastry** hydration calculations

### 5. Molecular Gastronomy

- **Spherification** (basic, reverse, frozen) with precise concentrations
- **Gelification** using agar, gellan, carrageenan
- **Emulsification** with lecithin for foams and airs
- **Transglutaminase** calculations for protein bonding
- **Methylcellulose** hot gel formulations
- **pH adjustment** for technique optimization
- **Hydrocolloid concentration** guides

### 6. Sous Vide Precision

- **Time-temperature tables** for pasteurization
- **Thickness-based** heating calculations
- **D-value and Z-value** pathogen reduction
- **Texture optimization** timelines
- **Multi-stage cooking** programs
- **Safety validation** with log reduction calculations

### 7. Fermentation Science

- **Wine fermentation** with pH, TA, and SO2 management
- **Beer fermentation** profiles (ale, lager, sour)
- **Bread fermentation** timing and temperature
- **Vegetable lacto-fermentation** salt calculations
- **Cheese culture** management
- **Sourdough starter** feeding ratios and schedules

### 8. Measurement Systems

- **Primary: Metric System** (grams, kilograms, liters)
- **Bakery Units**: Baker's percentages, hydration levels
- **Molecular Units**: Percentages, pH, Brix
- **Automatic unit conversions** between all systems
- **Ingredient density database** for volume-to-weight conversions

### 9. Yield & Waste Management

- **Trim loss calculations** for proteins and vegetables
- **Cooking loss factors** with moisture tracking
- **Meat cutting yield tests** with part-by-part breakdown
- **By-product utilization** tracking
- **Lamination waste** calculations

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd food-system-webapp

# Install dependencies
npm install

# Make CLI globally available
npm link
```

## Usage

### Basic Commands

```bash
# Display help
foodcost --help

# Recipe costing
foodcost recipe create       # Create new recipe with cost calculation
foodcost recipe yield        # Calculate ingredient yield
foodcost recipe meat-test    # Perform meat cutting yield test

# Food cost calculations
foodcost foodcost calculate  # Calculate food cost percentages
foodcost foodcost analyze    # Analyze menu performance

# Bakery calculations
foodcost bakery formula      # Create baker's formula
foodcost bakery scale        # Scale recipe using baker's math
foodcost bakery hydration    # Calculate dough hydration

# Pastry calculations
foodcost pastry lamination   # Calculate lamination layers
foodcost pastry syrup        # Sugar syrup calculations
foodcost pastry tempering    # Chocolate tempering curves
foodcost pastry custard      # Custard scaling

# Molecular gastronomy
foodcost molecular sphere    # Spherification calculations
foodcost molecular gel       # Gelification parameters
foodcost molecular foam      # Foam and air calculations

# Sous vide
foodcost sousvide time       # Calculate cooking times
foodcost sousvide pasteur    # Pasteurization calculations
foodcost sousvide chart      # Generate cooking charts

# Fermentation
foodcost ferment wine        # Wine fermentation management
foodcost ferment beer        # Beer fermentation profiles
foodcost ferment bread       # Bread timing calculations
foodcost ferment vegetable   # Lacto-fermentation guide

# Inventory management
foodcost inventory add       # Add inventory items
foodcost inventory yield     # Manage yield percentages

# Reports
foodcost reports escandallo  # Generate escandallo report
foodcost reports menu        # Generate menu analysis
foodcost reports pastry      # Pastry production report
foodcost reports molecular   # Molecular recipe cards
```

### Interactive Mode

Run without arguments for interactive menu:

```bash
foodcost
```

## Calculation Formulas

### Traditional Culinary

```
Food Cost % = (Cost of Goods Sold / Total Revenue) × 100
EP Cost = (AP Cost × 100) / Yield Percentage
Baker's % = (Ingredient Weight / Total Flour Weight) × 100
Menu Price = Cost per Serving / Target Food Cost %
```

### Pastry & Lamination

```
Butter Layers = Initial × Folds - Merged Layers
Total Layers = Butter Layers + (Butter Layers + 1)
Brix = (Sugar Weight / Total Weight) × 100
Specific Gravity = f(Brix) using polynomial approximation
```

### Molecular Gastronomy

```
Sodium Alginate: 0.5% of liquid volume
Calcium Bath: 1.0% calcium chloride solution
Agar Gel: 0.5-1.5% depending on firmness
Lecithin Foam: 0.3-0.5% of liquid volume
```

### Sous Vide

```
Heating Time = (Thickness²) / (4 × Thermal Diffusivity) × Shape Factor
D-value at T = D₆₀ × 10^((60-T)/z)
Pasteurization Time = D-value × Log Reduction Factor
```

### Fermentation

```
Potential Alcohol = Sugar (g/L) / 16.83
Titratable Acidity = (Titrant × Normality × 75) / Sample Volume
Free SO₂ = Molecular SO₂ × 10^(pH - 1.8)
Fermentation Time = Base Time × Temperature Factor × Yeast Factor
```

## Industry Standards

### Food Cost Targets

- **Fine Dining**: 30-40%
- **Casual Dining**: 28-35%
- **Quick Service**: 20-30%
- **Bakery**: 25-35%

### Common Yield Percentages

- **Beef Tenderloin**: 70-75%
- **Whole Chicken**: 65-70%
- **Broccoli (florets only)**: 47%
- **Carrot (peeled)**: 77-82%

### Baker's Percentages

- **Salt**: 1.8-2.2%
- **Yeast**: 0.5-2.0%
- **Hydration (bread)**: 58-65%
- **Hydration (ciabatta)**: 70-80%

### Lamination Standards

- **Croissant**: 27-81 layers
- **Puff Pastry**: 729-2187 layers
- **Danish**: 27-243 layers
- **Butter ratio**: 30-50% of dough weight

### Sugar Syrup Stages

- **Thread**: 106-112°C (80°Brix)
- **Soft Ball**: 112-116°C (85°Brix)
- **Hard Ball**: 121-130°C (90°Brix)
- **Hard Crack**: 146-154°C (99°Brix)

### Molecular Concentrations

- **Sodium Alginate**: 0.5-1.0%
- **Agar**: 0.5-1.5%
- **Lecithin**: 0.3-0.5%
- **Xanthan**: 0.1-0.5%

### Sous Vide Temperatures

- **Beef Medium Rare**: 55°C
- **Chicken Breast**: 60°C
- **Fish Medium**: 50°C
- **Eggs (63°C egg)**: 63°C

### Fermentation Parameters

- **Wine pH**: 3.2-3.8
- **Beer pH**: 4.2-4.6
- **Bread proof**: 24-29°C
- **Lacto-fermentation salt**: 2-3%

## Data Storage

Recipes and calculations are stored in JSON format:

```
food-system-webapp/
├── src/data/
│   ├── recipes/       # Recipe definitions
│   ├── ingredients/   # Ingredient database
│   └── costs/        # Cost history
```

## Configuration

Edit `src/config/constants.js` to customize:

- Default spice factor
- Default Q-factor
- Currency settings
- Decimal precision

## Professional Features

### Escandallo (Spanish Recipe Costing)

Complete cost breakdown including:

- Direct costs (ingredients)
- Indirect costs (spices, accompaniments)
- Waste factors
- Labor considerations (optional)

### Menu Engineering Matrix

Classify menu items based on:

- **Profitability** (contribution margin)
- **Popularity** (sales volume)
- Strategic recommendations for each category

### Validation & Warnings

- Automatic detection of unusual ratios
- Warnings for out-of-range values
- Suggestions for optimization

## Examples

### Create a Recipe with Escandallo

```bash
foodcost recipe create

# Interactive prompts:
# Recipe name: Beef Wellington
# Portions: 8
# Target food cost: 35%
#
# Add ingredients with yields:
# - Beef tenderloin: 2kg @ €45/kg, 75% yield
# - Puff pastry: 500g @ €8/kg, 100% yield
# - Mushrooms: 750g @ €12/kg, 85% yield
```

### Calculate Baker's Percentage

```bash
foodcost bakery formula

# Enter ingredients:
# - Bread flour: 1000g
# - Water: 650g (65% hydration)
# - Salt: 20g (2%)
# - Yeast: 10g (1%)
```

### Lamination Analysis

```bash
foodcost pastry lamination

# Croissant production:
# Dough weight: 1000g
# Butter ratio: 30%
# Folds: 3-fold, 4-fold, 3-fold
# Result: 27 butter layers
```

### Spherification Recipe

```bash
foodcost molecular sphere

# Mango caviar:
# Liquid volume: 500ml
# Technique: Basic spherification
# Sodium alginate: 2.5g (0.5%)
# Calcium bath: 1L water + 10g calcium chloride
```

### Sous Vide Timing

```bash
foodcost sousvide time

# Beef steak:
# Thickness: 50mm
# Target: 55°C (medium-rare)
# Heating time: 2.5 hours
# Pasteurization: 3.5 hours total
```

### Wine Fermentation

```bash
foodcost ferment wine

# Must analysis:
# Volume: 100L
# Sugar: 220 g/L
# Target alcohol: 13%
# YAN requirement: 200 mg/L
# SO2 addition: 30 mg/L free
```

## Technical Details

- **Node.js 18+** required
- **Decimal.js** for precise calculations
- **Commander.js** for CLI interface
- **Inquirer.js** for interactive prompts
- **ESM modules** for modern JavaScript

## Contributing

Please ensure all calculations follow industry standards and include appropriate validation. Test with real-world scenarios before submitting pull requests.

## License

MIT License

## Support

For questions or issues, please open a GitHub issue or contact the development team.

---

_Built for professional kitchens and bakeries requiring accurate cost management and recipe scaling._
