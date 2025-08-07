import Decimal from "decimal.js";

/**
 * Comprehensive Pastry Calculator
 * Includes lamination, sugar syrup, chocolate tempering, and more
 */
export class PastryCalculator {
  constructor() {
    // Lamination layer calculations
    this.LAMINATION_FORMULAS = {
      single_fold: 3, // 3 layers per fold
      letter_fold: 3, // 3 layers per fold
      book_fold: 4, // 4 layers per fold
      double_fold: 4, // 4 layers per fold
    };

    // Standard butter ratios for laminated doughs
    this.BUTTER_RATIOS = {
      croissant: 0.3, // 30% butter to dough weight
      danish: 0.5, // 50% butter to dough weight
      puff_pastry: 0.5, // 50% butter to dough weight
      rough_puff: 0.4, // 40% butter to dough weight
    };

    // Sugar syrup stages with temperature ranges (°C)
    this.SUGAR_STAGES = {
      thread: { min: 106, max: 112, brix: 80 },
      soft_ball: { min: 112, max: 116, brix: 85 },
      firm_ball: { min: 118, max: 120, brix: 87 },
      hard_ball: { min: 121, max: 130, brix: 90 },
      soft_crack: { min: 132, max: 143, brix: 95 },
      hard_crack: { min: 146, max: 154, brix: 99 },
      caramel: { min: 160, max: 177, brix: 100 },
    };

    // Chocolate tempering curves (°C)
    this.CHOCOLATE_TEMPS = {
      dark: { melt: 50, cool: 28, working: 31 },
      milk: { melt: 45, cool: 27, working: 29 },
      white: { melt: 40, cool: 26, working: 28 },
    };

    // Custard ratios (eggs per liter)
    this.CUSTARD_RATIOS = {
      creme_anglaise: { eggs: 8, yolks: 0, temp: 82 },
      pastry_cream: { eggs: 2, yolks: 6, temp: 85 },
      creme_brulee: { eggs: 0, yolks: 12, temp: 80 },
      flan: { eggs: 6, yolks: 4, temp: 75 },
    };
  }

  /**
   * Calculate lamination layers
   * Based on research showing proper layer calculation methods
   */
  calculateLaminationLayers(folds) {
    let butterLayers = 1; // Start with butter block
    let doughLayers = 2; // Initial envelope

    for (const fold of folds) {
      const multiplier = this.LAMINATION_FORMULAS[fold.type];
      butterLayers = butterLayers * multiplier;

      // Account for layer merging at fold points
      if (fold.type === "single_fold" || fold.type === "letter_fold") {
        butterLayers -= 2; // Two layers merge
      } else if (fold.type === "book_fold" || fold.type === "double_fold") {
        butterLayers -= 3; // Three layers merge
      }
    }

    // Total layers = butter layers + dough layers (always one more than butter)
    const totalLayers = butterLayers + (butterLayers + 1);

    return {
      butterLayers,
      doughLayers: butterLayers + 1,
      totalLayers,
      crossSectionLayers: this.calculateCrossSection(butterLayers, folds),
    };
  }

  /**
   * Calculate cross-section layers (e.g., in a rolled croissant)
   */
  calculateCrossSection(baseLayers, folds) {
    // If rolled (like croissant), multiply by roll factor
    const rollFactor = folds.some((f) => f.rolled) ? 2 : 1;
    return baseLayers * Math.pow(2, rollFactor);
  }

  /**
   * Calculate butter block dimensions
   */
  calculateButterBlock(doughWeight, butterRatio, thickness = 10) {
    const butterWeight = new Decimal(doughWeight).times(butterRatio);

    // Assuming butter density ~0.91 g/cm³
    const butterVolume = butterWeight.dividedBy(0.91);

    // Calculate dimensions for square block
    const area = butterVolume.dividedBy(thickness);
    const side = area.sqrt();

    return {
      weight: butterWeight.toNumber(),
      thickness: thickness,
      dimensions: {
        length: side.toNumber(),
        width: side.toNumber(),
      },
      doughDimensions: {
        length: side.times(2).toNumber(),
        width: side.times(2).toNumber(),
      },
    };
  }

  /**
   * Calculate lamination schedule with rest times
   */
  calculateLaminationSchedule(doughType, folds) {
    const schedule = [];
    let totalTime = 0;

    // Initial butter incorporation
    schedule.push({
      step: "Lock-in butter",
      time: 15,
      temperature: 14,
      rest: 30,
    });
    totalTime += 45;

    // Calculate rest times based on dough type
    const baseRestTime = doughType === "croissant" ? 60 : 30;

    folds.forEach((fold, index) => {
      const restTime = index === 0 ? baseRestTime : baseRestTime * 1.5;

      schedule.push({
        step: `Fold ${index + 1}: ${fold.type}`,
        time: 10,
        temperature: 14,
        rest: restTime,
        thickness: this.calculateThickness(index + 1),
      });

      totalTime += 10 + restTime;
    });

    // Final rest
    schedule.push({
      step: "Final rest",
      time: 0,
      temperature: 4,
      rest: 240, // 4 hours or overnight
    });
    totalTime += 240;

    return {
      schedule,
      totalTime,
      totalDays: Math.ceil(totalTime / 1440),
    };
  }

  /**
   * Calculate dough thickness after folds
   */
  calculateThickness(foldNumber) {
    // Starting at 20mm, reduce by factor with each fold
    const startThickness = 20;
    return startThickness / Math.pow(2, foldNumber);
  }

  /**
   * Calculate Brix and sugar syrup density
   */
  calculateBrix(sugarWeight, waterWeight) {
    const sugar = new Decimal(sugarWeight);
    const water = new Decimal(waterWeight);
    const total = sugar.plus(water);

    const brix = sugar.dividedBy(total).times(100);

    // Calculate specific gravity using polynomial approximation
    const sg = this.calculateSpecificGravity(brix.toNumber());

    // Calculate density (g/ml)
    const density = sg; // Since water density = 1 g/ml

    return {
      brix: brix.toNumber(),
      specificGravity: sg,
      density: density,
      volume: total.dividedBy(density).toNumber(),
    };
  }

  /**
   * Calculate specific gravity from Brix
   */
  calculateSpecificGravity(brix) {
    // Polynomial approximation for Brix to SG conversion
    const b = new Decimal(brix);
    const b2 = b.pow(2);
    const b3 = b.pow(3);

    const sg = new Decimal(0.00000005785037196)
      .times(b3)
      .plus(new Decimal(0.00001261831344).times(b2))
      .plus(new Decimal(0.003873042366).times(b))
      .plus(0.9999994636);

    return sg.toNumber();
  }

  /**
   * Calculate sugar syrup temperature for desired concentration
   */
  calculateSyrupTemperature(targetBrix) {
    // Find the appropriate sugar stage
    for (const [stage, temps] of Object.entries(this.SUGAR_STAGES)) {
      if (targetBrix <= temps.brix) {
        return {
          stage,
          temperature: temps.min,
          range: `${temps.min}°C - ${temps.max}°C`,
          brix: temps.brix,
        };
      }
    }

    return {
      stage: "caramel",
      temperature: 160,
      range: "160°C+",
      brix: 100,
    };
  }

  /**
   * Calculate chocolate tempering curve
   */
  calculateTemperingCurve(chocolateType, quantity) {
    const temps = this.CHOCOLATE_TEMPS[chocolateType];
    const seedAmount = quantity * 0.25; // 25% seed chocolate

    return {
      steps: [
        {
          phase: "Melt",
          temperature: temps.melt,
          method: "Heat to melt all crystals",
          duration: this.calculateMeltTime(quantity),
        },
        {
          phase: "Cool",
          temperature: temps.cool,
          method: "Cool while stirring",
          duration: this.calculateCoolTime(quantity),
        },
        {
          phase: "Reheat",
          temperature: temps.working,
          method: "Gently reheat to working temp",
          duration: 5,
        },
      ],
      seedMethod: {
        seedAmount,
        addAt: temps.cool + 2,
        finalTemp: temps.working,
      },
      workingWindow: {
        min: temps.working - 1,
        max: temps.working + 1,
        duration: 20, // minutes
      },
    };
  }

  /**
   * Calculate melting time based on quantity
   */
  calculateMeltTime(quantity) {
    // Approximately 1 minute per 100g
    return Math.ceil(quantity / 100) * 1;
  }

  /**
   * Calculate cooling time based on quantity
   */
  calculateCoolTime(quantity) {
    // Approximately 2 minutes per 100g
    return Math.ceil(quantity / 100) * 2;
  }

  /**
   * Calculate custard scaling
   */
  calculateCustardScaling(type, volume) {
    const ratio = this.CUSTARD_RATIOS[type];
    const liters = volume / 1000;

    return {
      type,
      volume,
      wholeEggs: Math.ceil(ratio.eggs * liters),
      eggYolks: Math.ceil(ratio.yolks * liters),
      cookingTemp: ratio.temp,
      sugarPerLiter: 150, // Standard 150g sugar per liter
      totalSugar: 150 * liters,
      milkVolume: volume * 0.8,
      creamVolume: volume * 0.2,
    };
  }

  /**
   * Calculate ganache ratios
   */
  calculateGanache(chocolateType, application) {
    const ratios = {
      dark: {
        glaze: { chocolate: 1, cream: 1 },
        filling: { chocolate: 2, cream: 1 },
        truffle: { chocolate: 3, cream: 2 },
      },
      milk: {
        glaze: { chocolate: 1, cream: 1.5 },
        filling: { chocolate: 2.5, cream: 1 },
        truffle: { chocolate: 3, cream: 1 },
      },
      white: {
        glaze: { chocolate: 1, cream: 2 },
        filling: { chocolate: 3, cream: 1 },
        truffle: { chocolate: 4, cream: 1 },
      },
    };

    const ratio = ratios[chocolateType][application];

    return {
      chocolateType,
      application,
      ratio: `${ratio.chocolate}:${ratio.cream}`,
      calculate: (totalWeight) => ({
        chocolate:
          totalWeight * (ratio.chocolate / (ratio.chocolate + ratio.cream)),
        cream: totalWeight * (ratio.cream / (ratio.chocolate + ratio.cream)),
      }),
    };
  }

  /**
   * Calculate macaron shell ratios (Italian method)
   */
  calculateMacaronRatios(shellCount) {
    // Based on 40 shells (20 macarons)
    const baseRatio = {
      almondFlour: 125,
      powderedSugar: 125,
      eggWhites1: 50, // For almond paste
      eggWhites2: 50, // For meringue
      granulatedSugar: 125,
      water: 35,
    };

    const multiplier = shellCount / 40;

    const scaled = {};
    for (const [ingredient, amount] of Object.entries(baseRatio)) {
      scaled[ingredient] = Math.round(amount * multiplier);
    }

    // Calculate syrup temperature
    scaled.syrupTemp = 118; // Soft ball stage

    return {
      ingredients: scaled,
      method: "Italian Meringue",
      macaronageConsistency: "Lava-like flow",
      restingTime: "30-60 minutes",
      bakingTemp: 150,
      bakingTime: "12-15 minutes",
    };
  }

  /**
   * Calculate choux pastry hydration
   */
  calculateChouxHydration(flourWeight) {
    const flour = new Decimal(flourWeight);

    // Standard choux ratios
    const water = flour.times(1); // 100% hydration
    const butter = flour.times(0.8); // 80% butter
    const eggs = flour.times(1.6); // 160% eggs (about 4 eggs per 100g flour)
    const salt = flour.times(0.02); // 2% salt
    const sugar = flour.times(0.02); // 2% sugar (optional)

    return {
      flour: flour.toNumber(),
      water: water.toNumber(),
      milk: 0, // Can substitute half water with milk
      butter: butter.toNumber(),
      eggs: eggs.toNumber(),
      eggCount: Math.round(eggs.dividedBy(50).toNumber()), // ~50g per egg
      salt: salt.toNumber(),
      sugar: sugar.toNumber(),
      totalHydration: water.dividedBy(flour).times(100).toNumber(),
      technique: {
        step1: "Boil water and butter",
        step2: "Add flour, cook until forms ball",
        step3: "Cool to 60°C",
        step4: "Beat in eggs gradually",
        consistency: "V-shape ribbon when lifted",
      },
    };
  }

  /**
   * Calculate sourdough starter feeding ratios
   */
  calculateStarterFeeding(starterWeight, ratio = "1:1:1") {
    const parts = ratio.split(":").map(Number);
    const [starterPart, flourPart, waterPart] = parts;

    const flourNeeded = (starterWeight / starterPart) * flourPart;
    const waterNeeded = (starterWeight / starterPart) * waterPart;

    return {
      keepStarter: starterWeight,
      addFlour: flourNeeded,
      addWater: waterNeeded,
      totalStarter: starterWeight + flourNeeded + waterNeeded,
      hydration: (waterNeeded / flourNeeded) * 100,
      peakTime: this.estimatePeakTime(ratio),
      schedule: this.generateFeedingSchedule(ratio),
    };
  }

  /**
   * Estimate peak time based on feeding ratio
   */
  estimatePeakTime(ratio) {
    const ratioMap = {
      "1:1:1": "4-6 hours at 24°C",
      "1:2:2": "6-8 hours at 24°C",
      "1:3:3": "8-10 hours at 24°C",
      "1:5:5": "10-12 hours at 24°C",
      "1:10:10": "12-16 hours at 24°C",
    };

    return ratioMap[ratio] || "6-8 hours at 24°C";
  }

  /**
   * Generate feeding schedule
   */
  generateFeedingSchedule(ratio) {
    return {
      daily: {
        morning: `Feed ${ratio} at 8 AM`,
        evening: `Feed ${ratio} at 8 PM`,
      },
      weekly: {
        refrigerate: "After feeding, let rise 2 hours, then refrigerate",
        refresh: "Feed weekly if refrigerated, discard 75% before feeding",
      },
    };
  }

  /**
   * Calculate glaze consistency
   */
  calculateGlaze(type, volume) {
    const recipes = {
      mirror: {
        water: volume * 0.15,
        sugar: volume * 0.3,
        glucose: volume * 0.3,
        condensedMilk: volume * 0.2,
        gelatin: volume * 0.015,
        chocolate: volume * 0.15,
        useTemp: 35,
      },
      royal: {
        powderedSugar: volume * 4, // grams per ml
        eggWhite: volume * 0.15,
        lemonJuice: volume * 0.01,
        consistency: "Thick ribbon",
      },
      fondant: {
        sugar: volume * 4,
        water: volume * 0.3,
        glucose: volume * 0.1,
        cookTo: 115, // °C
        workingTemp: 35,
      },
    };

    return recipes[type] || recipes.royal;
  }

  /**
   * Generate comprehensive pastry report
   */
  generatePastryReport(type, data) {
    const reports = {
      lamination: this.generateLaminationReport(data),
      syrup: this.generateSyrupReport(data),
      chocolate: this.generateChocolateReport(data),
      custard: this.generateCustardReport(data),
    };

    return reports[type] || "Unknown pastry type";
  }

  generateLaminationReport(data) {
    return {
      title: `Lamination Analysis - ${data.product}`,
      layers: data.layers,
      schedule: data.schedule,
      butterBlock: data.butterBlock,
      finalThickness: data.finalThickness,
      quality: {
        honeycomb: data.layers.butterLayers > 20 ? "Excellent" : "Good",
        flakiness:
          data.layers.totalLayers > 50 ? "Very flaky" : "Moderately flaky",
        rise: `Expected ${Math.floor(
          data.layers.butterLayers / 10
        )}x height increase`,
      },
    };
  }

  generateSyrupReport(data) {
    return {
      title: "Sugar Syrup Calculation",
      brix: `${data.brix.toFixed(1)}°Bx`,
      density: `${data.density.toFixed(3)} g/ml`,
      temperature: data.temperature,
      stage: data.stage,
      applications: this.getSyrupApplications(data.stage),
    };
  }

  getSyrupApplications(stage) {
    const applications = {
      thread: ["Simple syrup", "Fruit preserves"],
      soft_ball: ["Fudge", "Fondant", "Italian meringue"],
      firm_ball: ["Caramels", "Nougat"],
      hard_ball: ["Marshmallows", "Gummies"],
      soft_crack: ["Taffy", "Butterscotch"],
      hard_crack: ["Lollipops", "Brittles"],
      caramel: ["Caramel sauce", "Pralines"],
    };

    return applications[stage] || [];
  }

  generateChocolateReport(data) {
    return {
      title: `Chocolate Tempering - ${data.type}`,
      curve: data.curve,
      crystalForm: "Beta V (optimal)",
      characteristics: {
        snap: "Crisp break",
        shine: "High gloss",
        meltingPoint: "34°C (mouth temperature)",
        shelfLife: "Months at room temperature",
      },
    };
  }

  generateCustardReport(data) {
    return {
      title: `Custard Formula - ${data.type}`,
      ingredients: data.ingredients,
      technique: data.technique,
      cookingTemp: `${data.cookingTemp}°C (do not exceed)`,
      consistency: this.getCustardConsistency(data.type),
    };
  }

  getCustardConsistency(type) {
    const consistencies = {
      creme_anglaise: "Coats back of spoon",
      pastry_cream: "Thick, pipeable",
      creme_brulee: "Just set, jiggles",
      flan: "Firm, sliceable",
    };

    return consistencies[type] || "Medium thickness";
  }
}
