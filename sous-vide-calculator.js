import Decimal from "decimal.js";

/**
 * Sous Vide & Fermentation Calculator
 * Implements time/temperature calculations for sous vide and fermentation processes
 */
export class SousVideFermentationCalculator {
  constructor() {
    // Sous vide pasteurization D-values at 60°C (minutes for 90% reduction)
    this.D_VALUES = {
      listeria: 0.47,
      salmonella: 0.15,
      e_coli: 0.08,
      c_perfringens: 2.8,
    };

    // Z-values (temperature change for 10x change in D-value)
    this.Z_VALUES = {
      listeria: 7.5,
      salmonella: 5.5,
      e_coli: 5.0,
      c_perfringens: 9.0,
    };

    // Thermal diffusivity for different proteins (mm²/min)
    this.THERMAL_DIFFUSIVITY = {
      beef: 0.13,
      pork: 0.13,
      lamb: 0.13,
      chicken: 0.14,
      fish: 0.15,
      vegetables: 0.16,
    };

    // Target temperatures for doneness (°C)
    this.DONENESS_TEMPS = {
      beef: {
        rare: 49,
        medium_rare: 55,
        medium: 60,
        medium_well: 65,
        well: 71,
      },
      chicken: {
        tender: 60,
        traditional: 65,
        fall_apart: 74,
      },
      fish: {
        rare: 46,
        medium_rare: 50,
        medium: 55,
        flaky: 60,
      },
      eggs: {
        runny_yolk: 63,
        soft_poached: 64,
        poached: 71,
        hard: 75,
      },
    };

    // Fermentation parameters
    this.FERMENTATION = {
      wine: {
        optimal_temp: { min: 18, max: 24 },
        optimal_ph: { min: 3.2, max: 3.8 },
        so2_levels: { free: 30, total: 100 },
      },
      beer: {
        ale: { temp: { min: 18, max: 22 }, ph: { min: 4.2, max: 4.6 } },
        lager: { temp: { min: 7, max: 13 }, ph: { min: 4.2, max: 4.6 } },
        sour: { temp: { min: 20, max: 25 }, ph: { min: 3.2, max: 3.8 } },
      },
      cheese: {
        mesophilic: { temp: { min: 20, max: 32 }, ph: { min: 4.6, max: 5.2 } },
        thermophilic: {
          temp: { min: 35, max: 45 },
          ph: { min: 5.2, max: 5.4 },
        },
      },
      bread: {
        commercial_yeast: {
          temp: { min: 24, max: 29 },
          time: { min: 1, max: 3 },
        },
        sourdough: { temp: { min: 20, max: 26 }, time: { min: 4, max: 12 } },
      },
      vegetables: {
        lacto_fermentation: {
          salt: 2,
          temp: { min: 18, max: 22 },
          days: { min: 3, max: 21 },
        },
      },
    };
  }

  /**
   * Calculate heating time for sous vide (from 5°C to target temp)
   */
  calculateHeatingTime(thickness, shape, protein, targetTemp) {
    const thermalDiff = this.THERMAL_DIFFUSIVITY[protein];
    const startTemp = 5; // Refrigerator temperature
    const deltaT = targetTemp - startTemp;

    // Shape factors
    const shapeFactor = {
      slab: 1.0, // Steak, chop
      cylinder: 2.3, // Roast, tenderloin
      sphere: 3.0, // Meatball
    };

    const factor = shapeFactor[shape] || 1.0;

    // Simplified heat transfer equation
    // Time = (thickness²) / (4 * thermal diffusivity) * shape factor
    const thicknessInMM = thickness;
    const time = (Math.pow(thicknessInMM, 2) / (4 * thermalDiff)) * factor;

    // Add safety factor
    const safetyFactor = 1.1;
    const totalTime = Math.ceil(time * safetyFactor);

    return {
      heatingTime: totalTime,
      coreReachTime: Math.ceil(totalTime * 0.9),
      safetyMargin: Math.ceil(totalTime * 0.1),
      notes: [
        `Based on ${thickness}mm ${shape} of ${protein}`,
        `From 5°C to ${targetTemp}°C`,
        "Includes 10% safety margin",
      ],
    };
  }

  /**
   * Calculate pasteurization time
   */
  calculatePasteurizationTime(
    temperature,
    thickness,
    protein,
    pathogen = "salmonella"
  ) {
    // Get D-value at reference temperature (60°C)
    const D60 = this.D_VALUES[pathogen];
    const z = this.Z_VALUES[pathogen];

    // Calculate D-value at target temperature
    const DTemp = D60 * Math.pow(10, (60 - temperature) / z);

    // Calculate time for 6.5 log reduction (standard for meat)
    const reductionTime = DTemp * 6.5;

    // Add heating time
    const heatingTime = this.calculateHeatingTime(
      thickness,
      "slab",
      protein,
      temperature
    );

    return {
      pathogen,
      temperature,
      dValue: DTemp.toFixed(2),
      pasteurizationTime: Math.ceil(reductionTime),
      heatingTime: heatingTime.heatingTime,
      totalTime: Math.ceil(reductionTime + heatingTime.heatingTime),
      logReduction: 6.5,
      safety: this.assessSafety(temperature, pathogen),
    };
  }

  /**
   * Assess safety based on temperature
   */
  assessSafety(temperature, pathogen) {
    if (temperature < 52) {
      return "Not recommended - below safe pasteurization temperature";
    } else if (temperature < 55) {
      return "Extended time required - monitor carefully";
    } else if (temperature < 60) {
      return "Safe with proper time - standard sous vide range";
    } else {
      return "Safe - traditional cooking temperature";
    }
  }

  /**
   * Generate comprehensive sous vide cooking chart
   */
  generateSousVideChart(protein, thickness, doneness) {
    const temps = this.DONENESS_TEMPS[protein];
    if (!temps || !temps[doneness]) {
      throw new Error(`Invalid protein (${protein}) or doneness (${doneness})`);
    }

    const targetTemp = temps[doneness];
    const heating = this.calculateHeatingTime(
      thickness,
      "slab",
      protein,
      targetTemp
    );
    const pasteurization = this.calculatePasteurizationTime(
      targetTemp,
      thickness,
      protein
    );

    // Tenderization times based on protein and temperature
    const tenderization = this.calculateTenderizationTime(protein, targetTemp);

    return {
      protein,
      thickness: `${thickness}mm`,
      doneness,
      temperature: `${targetTemp}°C`,
      times: {
        minimum: heating.heatingTime,
        pasteurized: pasteurization.totalTime,
        tender: tenderization.minimum,
        optimal: tenderization.optimal,
        maximum: tenderization.maximum,
      },
      texture: {
        minimum: "Just cooked through",
        pasteurized: "Safe to eat",
        tender: "Noticeably tender",
        optimal: "Perfect texture",
        maximum: "Very tender, may be mushy",
      },
      recommendations: this.getRecommendations(protein, targetTemp),
    };
  }

  /**
   * Calculate tenderization time
   */
  calculateTenderizationTime(protein, temperature) {
    // Collagen conversion rates increase with temperature
    const baseTime = {
      beef: { tough: 24, tender: 2 },
      pork: { tough: 12, tender: 2 },
      chicken: { tough: 8, tender: 1.5 },
      fish: { tough: 0.5, tender: 0.5 },
    };

    const times = baseTime[protein] || baseTime.beef;

    // Adjust for temperature (higher temp = faster conversion)
    const tempFactor = Math.pow(2, (temperature - 55) / 10);

    return {
      minimum: Math.ceil(times.tender),
      optimal: Math.ceil(times.tender * 2),
      maximum: Math.ceil(times.tough / tempFactor),
    };
  }

  /**
   * Get cooking recommendations
   */
  getRecommendations(protein, temperature) {
    const recommendations = [];

    if (protein === "beef") {
      if (temperature < 55) {
        recommendations.push("Very red, juicy texture");
        recommendations.push("Not recommended for ground beef");
      } else if (temperature < 60) {
        recommendations.push("Pink, traditional medium-rare to medium");
        recommendations.push("Most popular temperature range");
      }
    } else if (protein === "chicken") {
      if (temperature < 63) {
        recommendations.push("Very soft texture, may be off-putting");
        recommendations.push("Ensure proper pasteurization time");
      } else {
        recommendations.push("Traditional texture");
        recommendations.push("Safe for all consumers");
      }
    }

    recommendations.push("Season before bagging for best flavor");
    recommendations.push("Sear after cooking for color and crust");

    return recommendations;
  }

  /**
   * Calculate wine fermentation parameters
   */
  calculateWineFermentation(volume, sugarContent, targetAlcohol) {
    const sugar = new Decimal(sugarContent); // g/L
    const target = new Decimal(targetAlcohol); // % ABV

    // 16.83 g/L sugar produces ~1% alcohol
    const sugarPerAlcohol = 16.83;
    const potentialAlcohol = sugar.dividedBy(sugarPerAlcohol);

    // Calculate required sugar adjustment
    const requiredSugar = target.times(sugarPerAlcohol);
    const sugarAdjustment = requiredSugar.minus(sugar);

    // Yeast nutrient requirements (mg/L)
    const yan = this.calculateYAN(sugar.toNumber());

    // SO2 additions (mg/L)
    const so2 = this.calculateSO2(3.4); // Assuming pH 3.4

    return {
      volume,
      currentSugar: sugar.toNumber(),
      potentialAlcohol: potentialAlcohol.toNumber(),
      targetAlcohol: target.toNumber(),
      sugarAdjustment: {
        needed: sugarAdjustment.toNumber(),
        perLiter: sugarAdjustment.dividedBy(volume).toNumber(),
      },
      yeastNutrition: {
        yan: yan,
        dap: yan * 0.5, // DAP provides ~50% of YAN
        fermaidK: volume * 0.25, // 0.25 g/L
      },
      so2Management: so2,
      fermentationSchedule: this.generateFermentationSchedule(
        "wine",
        sugar.toNumber()
      ),
    };
  }

  /**
   * Calculate YAN (Yeast Assimilable Nitrogen) requirements
   */
  calculateYAN(brix) {
    // Based on UC Davis recommendations
    if (brix < 21) return 150;
    if (brix < 23) return 200;
    if (brix < 25) return 250;
    if (brix < 27) return 300;
    return 350;
  }

  /**
   * Calculate SO2 requirements based on pH
   */
  calculateSO2(pH) {
    // Molecular SO2 target: 0.8 mg/L
    const molecularTarget = 0.8;

    // Calculate free SO2 needed based on pH
    const pHFactor = Math.pow(10, pH - 1.8);
    const freeSO2 = molecularTarget * pHFactor;

    return {
      molecular: molecularTarget,
      free: Math.ceil(freeSO2),
      total: Math.ceil(freeSO2 * 2), // Rough estimate
      additions: {
        crush: Math.ceil(freeSO2 * 0.5),
        postFermentation: Math.ceil(freeSO2 * 0.3),
        bottling: Math.ceil(freeSO2 * 0.2),
      },
    };
  }

  /**
   * Calculate pH and TA (Titratable Acidity)
   */
  calculateAcidity(pH, ta, volume, adjustment = null) {
    const currentTA = new Decimal(ta); // g/L as tartaric

    let newTA = currentTA;
    let newPH = pH;

    if (adjustment) {
      if (adjustment.type === "tartaric") {
        // Adding tartaric acid
        const addition = new Decimal(adjustment.amount);
        newTA = currentTA.plus(addition);

        // Rough pH change: -0.1 per 1 g/L tartaric
        newPH = pH - addition.toNumber() * 0.1;
      } else if (adjustment.type === "malolactic") {
        // MLF converts malic to lactic
        // Reduces TA by ~1-3 g/L, increases pH by 0.1-0.3
        newTA = currentTA.minus(2);
        newPH = pH + 0.2;
      }
    }

    return {
      initial: {
        pH: pH,
        ta: currentTA.toNumber(),
        stability: this.assessWineStability(pH, currentTA.toNumber()),
      },
      adjusted: {
        pH: newPH,
        ta: newTA.toNumber(),
        stability: this.assessWineStability(newPH, newTA.toNumber()),
      },
      recommendations: this.getAcidityRecommendations(newPH, newTA.toNumber()),
    };
  }

  /**
   * Assess wine stability based on pH and TA
   */
  assessWineStability(pH, ta) {
    if (pH < 3.0) return "Very stable but possibly too tart";
    if (pH < 3.4) return "Excellent stability";
    if (pH < 3.6) return "Good stability";
    if (pH < 3.8) return "Moderate stability - monitor closely";
    return "Poor stability - risk of spoilage";
  }

  /**
   * Get acidity recommendations
   */
  getAcidityRecommendations(pH, ta) {
    const recommendations = [];

    if (pH < 3.2) {
      recommendations.push(
        "Consider malolactic fermentation to reduce acidity"
      );
    } else if (pH > 3.6) {
      recommendations.push("Add tartaric acid to improve stability");
      recommendations.push("Increase SO2 levels for protection");
    }

    if (ta < 5) {
      recommendations.push("Wine may taste flat - consider acid addition");
    } else if (ta > 9) {
      recommendations.push("Wine may be too tart - consider deacidification");
    }

    return recommendations;
  }

  /**
   * Calculate bread fermentation (bulk and proof)
   */
  calculateBreadFermentation(
    flourWeight,
    hydration,
    yeastPercentage,
    temperature
  ) {
    const flour = new Decimal(flourWeight);
    const water = flour.times(hydration / 100);
    const yeast = flour.times(yeastPercentage / 100);

    // Calculate fermentation time based on yeast and temperature
    // Base time at 25°C with 1% yeast
    const baseTime = 60; // minutes

    // Temperature factor (doubles every 10°C)
    const tempFactor = Math.pow(2, (25 - temperature) / 10);

    // Yeast factor (inversely proportional)
    const yeastFactor = 1 / yeastPercentage;

    const bulkTime = baseTime * tempFactor * yeastFactor;
    const proofTime = bulkTime * 0.75; // Proof is typically 75% of bulk

    return {
      dough: {
        flour: flour.toNumber(),
        water: water.toNumber(),
        totalWeight: flour.plus(water).plus(yeast).toNumber(),
        hydration: hydration,
        yeast: yeast.toNumber(),
      },
      fermentation: {
        temperature,
        bulkFermentation: {
          time: Math.round(bulkTime),
          folds: Math.floor(bulkTime / 30),
          checkpoints: this.generateCheckpoints(bulkTime),
        },
        finalProof: {
          time: Math.round(proofTime),
          readiness: "Poke test: slow spring back",
        },
        totalTime: Math.round(bulkTime + proofTime),
      },
      schedule: this.generateBreadSchedule(bulkTime, proofTime),
    };
  }

  /**
   * Generate fermentation checkpoints
   */
  generateCheckpoints(totalTime) {
    const checkpoints = [];
    const intervals = Math.floor(totalTime / 30);

    for (let i = 1; i <= intervals; i++) {
      checkpoints.push({
        time: i * 30,
        action: "Fold dough",
        lookFor: "Increased strength and elasticity",
      });
    }

    checkpoints.push({
      time: totalTime,
      action: "End bulk fermentation",
      lookFor: "Jiggly, 50% size increase",
    });

    return checkpoints;
  }

  /**
   * Generate bread schedule
   */
  generateBreadSchedule(bulkTime, proofTime) {
    const schedule = [];
    let currentTime = 0;

    schedule.push({
      time: currentTime,
      action: "Mix dough",
      duration: 10,
    });

    currentTime += 30;
    schedule.push({
      time: currentTime,
      action: "Autolyse",
      duration: 30,
    });

    currentTime += 30;
    schedule.push({
      time: currentTime,
      action: "Add salt and yeast, mix",
      duration: 5,
    });

    currentTime += 5;
    schedule.push({
      time: currentTime,
      action: "Bulk fermentation",
      duration: bulkTime,
    });

    currentTime += bulkTime;
    schedule.push({
      time: currentTime,
      action: "Pre-shape",
      duration: 20,
    });

    currentTime += 20;
    schedule.push({
      time: currentTime,
      action: "Final shape",
      duration: 5,
    });

    currentTime += 5;
    schedule.push({
      time: currentTime,
      action: "Final proof",
      duration: proofTime,
    });

    currentTime += proofTime;
    schedule.push({
      time: currentTime,
      action: "Bake",
      duration: 35,
    });

    return schedule;
  }

  /**
   * Calculate vegetable fermentation (lacto-fermentation)
   */
  calculateVegetableFermentation(vegetableWeight, saltPercentage = 2) {
    const weight = new Decimal(vegetableWeight);
    const salt = weight.times(saltPercentage / 100);

    // Calculate brine if needed (for vegetables that don't release enough liquid)
    const brineVolume = weight.times(0.5); // 50% of vegetable weight
    const brineSalt = brineVolume.times(saltPercentage / 100);

    return {
      method:
        saltPercentage < 3 ? "Brine fermentation" : "Dry salt fermentation",
      vegetables: {
        weight: weight.toNumber(),
        salt: salt.toNumber(),
        percentage: saltPercentage,
      },
      brine: {
        needed: saltPercentage < 3,
        volume: brineVolume.toNumber(),
        salt: brineSalt.toNumber(),
        concentration: `${saltPercentage}% by weight`,
      },
      fermentation: {
        temperature: "18-22°C",
        time: {
          initial: "3-5 days (active bubbling)",
          secondary: "1-3 weeks (flavor development)",
          total: "2-4 weeks",
        },
        pH: {
          start: 6.0,
          day3: 4.5,
          final: 3.5,
        },
      },
      stages: [
        { day: 1, pH: 6.0, activity: "Salt draws water, LAB multiply" },
        { day: 3, pH: 4.5, activity: "Active fermentation, CO2 production" },
        {
          day: 7,
          pH: 4.0,
          activity: "Slowing fermentation, flavor development",
        },
        { day: 14, pH: 3.7, activity: "Maturation, complex flavors" },
        { day: 21, pH: 3.5, activity: "Stable, ready for cold storage" },
      ],
      storage: {
        temperature: "0-4°C",
        duration: "6-12 months",
        container: "Glass or food-grade plastic",
      },
    };
  }

  /**
   * Generate fermentation schedule
   */
  generateFermentationSchedule(type, sugarContent) {
    const schedules = {
      wine: [
        { day: 0, action: "Pitch yeast", temp: 20, brix: sugarContent },
        { day: 1, action: "Lag phase ends", temp: 22, brix: sugarContent - 1 },
        {
          day: 3,
          action: "Active fermentation",
          temp: 24,
          brix: sugarContent * 0.7,
        },
        {
          day: 7,
          action: "Mid-fermentation",
          temp: 24,
          brix: sugarContent * 0.4,
        },
        { day: 14, action: "Slowing down", temp: 22, brix: sugarContent * 0.1 },
        { day: 21, action: "Complete", temp: 20, brix: 0 },
      ],
      beer: [
        { day: 0, action: "Pitch yeast", temp: 20 },
        { day: 1, action: "Krausen forms", temp: 20 },
        { day: 3, action: "High krausen", temp: 20 },
        { day: 7, action: "Fermentation slowing", temp: 20 },
        { day: 14, action: "Diacetyl rest", temp: 22 },
        { day: 21, action: "Cold crash", temp: 2 },
      ],
    };

    return schedules[type] || schedules.wine;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(type, data) {
    const reports = {
      sousVide: this.generateSousVideReport(data),
      fermentation: this.generateFermentationReport(data),
    };

    return reports[type] || "Unknown calculation type";
  }

  generateSousVideReport(data) {
    return {
      title: "Sous Vide Cooking Analysis",
      parameters: data,
      safety: {
        pasteurized: data.times.pasteurized > data.times.minimum,
        logReduction: 6.5,
        pathogens: "Listeria, Salmonella, E. coli controlled",
      },
      quality: {
        texture: data.texture,
        moisture: "Maximum retention",
        flavor: "Enhanced through vacuum",
      },
    };
  }

  generateFermentationReport(data) {
    return {
      title: "Fermentation Analysis",
      parameters: data,
      monitoring: {
        temperature: "Critical - affects rate and flavor",
        pH: "Track daily for safety",
        gravity: "Monitor sugar consumption",
      },
    };
  }
}
