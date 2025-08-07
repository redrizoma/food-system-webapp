{
  "name": "food-system-webapp",
  "version": "1.0.0",
  "description": "Professional Food Cost & Recipe Management System with Interactive CLI",
  "main": "src/index.js",
  "type": "module",
  "bin": {
    "foodsystem": "./src/index.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node --test",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "inquirer": "^9.2.12",
    "chalk": "^5.3.0",
    "figlet": "^1.7.0",
    "table": "^6.8.1",
    "decimal.js": "^10.4.3",
    "date-fns": "^3.0.6",
    "joi": "^17.11.0",
    "fs-extra": "^11.2.0",
    "csv-parse": "^5.5.3",
    "csv-stringify": "^6.4.5",
    "ora": "^8.0.1"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "nodemon": "^3.0.2"
  },
  "keywords": [
    "food-cost",
    "recipe-management",
    "escandallo",
    "bakery",
    "pastry",
    "molecular-gastronomy",
    "sous-vide",
    "fermentation",
    "restaurant",
    "culinary",
    "chef",
    "kitchen-management",
    "interactive-cli"
  ],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/food-system-webapp.git"
  }
}