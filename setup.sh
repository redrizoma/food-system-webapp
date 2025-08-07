#!/bin/bash

# Food System WebApp - Installation Script
# Professional Culinary Management System Setup

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Logo
display_logo() {
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════╗
    ║     FOOD SYSTEM WEBAPP INSTALLER         ║
    ║     Professional Edition v1.0.0          ║
    ╚═══════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Progress indicator
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Check command availability
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

# Check Node.js version
check_node_version() {
    local required_version="18.0.0"
    local node_version=$(node -v | cut -d 'v' -f 2)
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then 
        echo -e "${GREEN}✓ Node.js version $node_version (>= $required_version)${NC}"
        return 0
    else
        echo -e "${RED}✗ Node.js version $node_version is below required $required_version${NC}"
        return 1
    fi
}

# Main installation function
main() {
    clear
    display_logo
    
    echo -e "${YELLOW}Starting Food System WebApp Installation...${NC}\n"
    
    # Step 1: Check prerequisites
    echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
    
    local prerequisites_met=true
    
    if ! check_command node; then
        prerequisites_met=false
        echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
    else
        if ! check_node_version; then
            prerequisites_met=false
            echo -e "${YELLOW}Please update Node.js to version 18 or higher${NC}"
        fi
    fi
    
    if ! check_command npm; then
        prerequisites_met=false
        echo -e "${YELLOW}npm is not installed. It should come with Node.js${NC}"
    fi
    
    if [ "$prerequisites_met" = false ]; then
        echo -e "\n${RED}Prerequisites not met. Please install missing components and run again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All prerequisites met!${NC}\n"
    
    # Step 2: Install dependencies
    echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
    
    if [ -f "package.json" ]; then
        echo "Installing npm packages..."
        npm install --production &
        spinner $!
        echo -e "${GREEN}✓ Dependencies installed${NC}"
    else
        echo -e "${RED}✗ package.json not found${NC}"
        exit 1
    fi
    
    # Step 3: Create directory structure
    echo -e "\n${BLUE}Step 3: Creating directory structure...${NC}"
    
    directories=(
        "src/data/recipes"
        "src/data/ingredients"
        "src/data/costs"
        "src/data/templates"
        "exports"
        "backups"
        "logs"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            echo -e "${GREEN}✓ Created $dir${NC}"
        else
            echo -e "${YELLOW}⚠ $dir already exists${NC}"
        fi
    done
    
    # Step 4: Initialize sample data
    echo -e "\n${BLUE}Step 4: Initializing sample data...${NC}"
    
    # Create sample recipe
    if [ ! -f "src/data/recipes/sample.json" ]; then
        cat > src/data/recipes/sample.json << 'EORECIPE'
{
  "name": "Caesar Salad",
  "category": "Appetizer",
  "portions": 4,
  "ingredients": [
    {
      "name": "Romaine Lettuce",
      "quantity": 200,
      "unit": "g",
      "unitPrice": 0.005,
      "yieldPercentage": 85
    },
    {
      "name": "Parmesan Cheese",
      "quantity": 50,
      "unit": "g",
      "unitPrice": 0.025,
      "yieldPercentage": 100
    },
    {
      "name": "Croutons",
      "quantity": 40,
      "unit": "g",
      "unitPrice": 0.008,
      "yieldPercentage": 100
    },
    {
      "name": "Caesar Dressing",
      "quantity": 80,
      "unit": "ml",
      "unitPrice": 0.015,
      "yieldPercentage": 100
    }
  ],
  "spiceFactor": 0.02,
  "qFactor": 0.03,
  "targetFoodCost": 30,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
EORECIPE
        echo -e "${GREEN}✓ Created sample recipe${NC}"
    fi
    
    # Create common ingredients
    if [ ! -f "src/data/ingredients/common.json" ]; then
        cat > src/data/ingredients/common.json << 'EOINGREDIENTS'
{
  "ingredients": [
    {
      "name": "Olive Oil",
      "category": "Oils & Fats",
      "quantity": 5,
      "unit": "l",
      "unitPrice": 8.50,
      "parLevel": 2,
      "maxLevel": 10,
      "supplier": "Premium Foods Co"
    },
    {
      "name": "Butter",
      "category": "Dairy",
      "quantity": 3,
      "unit": "kg",
      "unitPrice": 12.00,
      "parLevel": 2,
      "maxLevel": 5,
      "supplier": "Dairy Direct"
    },
    {
      "name": "All-Purpose Flour",
      "category": "Dry Goods",
      "quantity": 10,
      "unit": "kg",
      "unitPrice": 1.20,
      "parLevel": 5,
      "maxLevel": 20,
      "supplier": "Grain Masters"
    },
    {
      "name": "Granulated Sugar",
      "category": "Dry Goods",
      "quantity": 5,
      "unit": "kg",
      "unitPrice": 1.50,
      "parLevel": 3,
      "maxLevel": 10,
      "supplier": "Sweet Supply"
    },
    {
      "name": "Sea Salt",
      "category": "Spices",
      "quantity": 2,
      "unit": "kg",
      "unitPrice": 2.00,
      "parLevel": 1,
      "maxLevel": 3,
      "supplier": "Spice World"
    }
  ]
}
EOINGREDIENTS
        echo -e "${GREEN}✓ Created common ingredients${NC}"
    fi
    
    # Step 5: Set permissions
    echo -e "\n${BLUE}Step 5: Setting permissions...${NC}"
    
    if [ -f "src/index.js" ]; then
        chmod +x src/index.js
        echo -e "${GREEN}✓ Set executable permissions${NC}"
    fi
    
    # Step 6: Optional global installation
    echo -e "\n${BLUE}Step 6: Global installation (optional)${NC}"
    echo -e "${YELLOW}Would you like to install Food System globally?${NC}"
    echo -e "This will allow you to run 'foodsystem' from anywhere."
    read -p "Install globally? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing globally..."
        npm link &
        spinner $!
        echo -e "${GREEN}✓ Installed globally as 'foodsystem'${NC}"
    else
        echo -e "${YELLOW}Skipped global installation${NC}"
    fi
    
    # Step 7: Environment setup
    echo -e "\n${BLUE}Step 7: Environment configuration${NC}"
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOENV'
# Food System WebApp Configuration
NODE_ENV=production
FOOD_SYSTEM_CURRENCY=EUR
FOOD_SYSTEM_UNITS=metric
FOOD_SYSTEM_LANGUAGE=en
FOOD_SYSTEM_CHECK_UPDATES=true
EOENV
        echo -e "${GREEN}✓ Created .env configuration${NC}"
    else
        echo -e "${YELLOW}⚠ .env already exists${NC}"
    fi
    
    # Step 8: Verification
    echo -e "\n${BLUE}Step 8: Verifying installation...${NC}"
    
    # Test if the application can start
    node src/index.js --version 2>/dev/null && {
        echo -e "${GREEN}✓ Application verified${NC}"
    } || {
        echo -e "${YELLOW}⚠ Manual verification needed${NC}"
    }
    
    # Final summary
    echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}     Installation Complete!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}\n"
    
    echo -e "${BLUE}📋 Installation Summary:${NC}"
    echo -e "  • Dependencies installed"
    echo -e "  • Directory structure created"
    echo -e "  • Sample data initialized"
    echo -e "  • Permissions configured"
    
    echo -e "\n${BLUE}🚀 Getting Started:${NC}"
    
    if npm list -g --depth=0 2>/dev/null | grep -q food-system-webapp; then
        echo -e "  Run anywhere:    ${GREEN}foodsystem${NC}"
    else
        echo -e "  Run locally:     ${GREEN}npm start${NC}"
        echo -e "  Or:              ${GREEN}node src/index.js${NC}"
    fi
    
    echo -e "\n${BLUE}📚 Documentation:${NC}"
    echo -e "  README.md        - Full documentation"
    echo -e "  GitHub Wiki      - Extended guides"
    
    echo -e "\n${BLUE}💡 Tips:${NC}"
    echo -e "  • Use arrow keys or numbers to navigate"
    echo -e "  • Press 0 to go back in any menu"
    echo -e "  • Press Ctrl+C to exit anytime"
    
    echo -e "\n${GREEN}Thank you for installing Food System WebApp!${NC}"
    echo -e "${YELLOW}Happy cooking! 👨‍🍳${NC}\n"
}

# Run main function
main "$@"