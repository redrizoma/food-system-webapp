/**
 * Sous Vide and Fermentation Calculator
 * Handles sous vide cooking calculations and fermentation processes
 */

export class SousVideFermentationCalculator {
  constructor() {
    // Thermal diffusivity constants (mm²/s)
    this.THERMAL_DIFFUSIVITY = {
      beef: 0.14,
      pork: 0.13,
      lamb: 0.14,
      chicken: 0.12,
      fish: 0.15,
      vegetables: 0.16
    };

    // Doneness temperatures (°C)
    this.DONENESS_TEMPS = {
      beef: {
        rare: 49,
        medium_rare: 55,
        medium: 60,
        medium_well: 65,
        well: 71
      },
      chicken: {
        tender: 60,
        traditional: 65,
        fall_apart: 74
      },
      fish: {
        rare: 46,
        medium_rare: 50,
        medium: 55,
        flaky: 60
      }
    };

    // Fermentation parameters
    this.FERMENTATION = {
      wine: {
        temp: { min: 18, max: 24 },
        ph: { min: 3.2, max: 3.8 },
        duration: '14-30 days'
      },
      beer: {
        ale: {
          temp: { min: 18, max: 22 },
          ph: { min: 4.2, max: 4.6 },
          duration: '7-14 days'
        },
        lager: {
          temp: { min: 7, max: 13 },
          ph: { min: 4.2, max: 4.6 },
          duration: '14-28 days'
        }
      },
      bread: {
        temp: { min: 24, max: 29 },
        ph: { min: 4.0, max: 5.5 },
        duration: '2-24 hours'
      },
      cheese: {
        mesophilic: {
          temp: { min: 20, max: 32 },
          ph: { min: 4.5, max: 6.5 }
        },
        thermophilic: {
          temp: { min: 35, max: 45 },
          ph: { min: 5.0, max: 6.5 }
        }
      }
    };
  }

  /**
   * Calculate heating time for sous vide
   * @param {number} thickness - Thickness in mm
   * @param {string} shape - Shape (slab, cylinder, sphere)
   * @param {string} protein - Protein type
   * @param {number} targetTemp - Target temperature in °C
   * @returns {Object} Heating time calculations
   */
  calculateHeatingTime(thickness, shape, protein, targetTemp) {
    const thermalDiff = this.THERMAL_DIFFUSIVITY[protein] || 0.14;
    
    // Shape factors
    const shapeFactors = {
      slab: 1.0,
      cylinder: 2.3,
      sphere: 3.0
    };
    
    const shapeFactor = shapeFactors[shape] || 1.0;
    
    // Calculate time to reach core temperature (in minutes)
    const coreReachTime = (Math.pow(thickness, 2) / (4 * thermalDiff * shapeFactor)) / 60;
    
    // Add safety margin for pasteurization
    const safetyMargin = coreReachTime * 0.5;
    const heatingTime = coreReachTime + safetyMargin;

    return {
      heatingTime: Math.round(heatingTime),
      coreReachTime: Math.round(coreReachTime),
      safetyMargin: Math.round(safetyMargin),
      notes: [
        `Core reaches ${targetTemp}°C in ${Math.round(coreReachTime)} minutes`,
        'Additional time ensures pasteurization',
        thickness > 50 ? 'Consider using probe thermometer for thick cuts' : '',
        targetTemp < 55 ? 'Low temperature - ensure food safety' : ''
      ].filter(Boolean)
    };
  }

  /**
   * Calculate pasteurization time
   * @param {number} temperature - Cooking temperature in °C
   * @param {number} thickness - Thickness in mm
   * @param {string} protein - Protein type
   * @param {string} pathogen - Target pathogen
   * @returns {Object} Pasteurization calculations
   */
  calculatePasteurizationTime(temperature, thickness, protein, pathogen) {
    // D-values at 60°C (minutes for 1 log reduction)
    const dValues60 = {
      salmonella: 0.5,
      listeria: 2.0,
      e_coli: 0.3,
      c_perfringens: 10.0
    };

    const d60 = dValues60[pathogen] || 0.5;
    const z = 5; // Temperature change for 10x change in D-value
    
    // Calculate D-value at target temperature
    const dValue = d60 * Math.pow(10, (60 - temperature) / z);
    
    // Target 6.5 log reduction for safety
    const logReduction = 6.5;
    const pasteurizationTime = dValue * logReduction;
    
    // Calculate heating time
    const heatingResult = this.calculateHeatingTime(thickness, 'slab', protein, temperature);
    
    return {
      pathogen: pathogen,
      temperature: temperature,
      dValue: dValue.toFixed(2),
      logReduction: logReduction,
      pasteurizationTime: Math.round(pasteurizationTime),
      heatingTime: heatingResult.heatingTime,
      totalTime: Math.round(pasteurizationTime + heatingResult.heatingTime),
      safety: temperature >= 55 ? 'Safe for general population' : 'Only for healthy adults'
    };
  }

  /**
   * Generate sous vide cooking chart
   * @param {string} protein - Protein type
   * @param {number} thickness - Thickness in mm
   * @param {string} doneness - Doneness level
   * @returns {Object} Cooking chart
   */
  generateSousVideChart(protein, thickness, doneness) {
    const temp = this.DONENESS_TEMPS[protein]?.[doneness] || 60;
    const heatingTime = this.calculateHeatingTime(thickness, 'slab', protein, temp);
    
    const times = {
      minimum: heatingTime.heatingTime,
      pasteurized: heatingTime.heatingTime + 30,
      tender: heatingTime.heatingTime + 120,
      optimal: heatingTime.heatingTime + 180,
      maximum: heatingTime.heatingTime + 480
    };

    const texture = {
      'At minimum': 'Just cooked through',
      'Pasteurized': 'Safe, traditional texture',
      'Tender': 'Noticeably more tender',
      'Optimal': 'Very tender, juicy',
      'Maximum': 'Risk of mushy texture'
    };

    return {
      protein: protein,
      thickness: `${thickness}mm`,
      doneness: doneness,
      temperature: `${temp}°C`,
      times: times,
      texture: texture,
      recommendations: [
        thickness > 50 ? 'Use probe for thick cuts' : '',
        protein === 'fish' ? 'Add oil to bag for better heat transfer' : '',
        temp < 55 ? 'Extended time needed for safety' : '',
        'Season before bagging for best flavor'
      ].filter(Boolean)
    };
  }

  /**
   * Calculate tenderization time
   * @param {string} protein - Protein type
   * @param {number} temperature - Cooking temperature
   * @returns {Object} Tenderization timeline
   */
  calculateTenderizationTime(protein, temperature) {
    // Base times at 55°C
    const baseTimes = {
      beef: { minimum: 1, optimal: 24, maximum: 48 },
      pork: { minimum: 1, optimal: 12, maximum: 24 },
      chicken: { minimum: 0.5, optimal: 4, maximum: 8 }
    };

    const times = baseTimes[protein] || baseTimes.beef;
    
    // Adjust for temperature (higher temp = faster tenderization)
    const tempFactor = Math.pow(2, (temperature - 55) / 10);
    
    return {
      minimum: times.minimum / tempFactor,
      optimal: times.optimal / tempFactor,
      maximum: times.maximum / tempFactor
    };
  }

  /**
   * Calculate wine fermentation parameters
   * @param {number} volume - Volume in liters
   * @param {number} sugarContent - Sugar content in g/L
   * @param {number} targetAlcohol - Target alcohol % ABV
   * @returns {Object} Wine fermentation calculations
   */
  calculateWineFermentation(volume, sugarContent, targetAlcohol) {
    // 17g sugar per liter produces ~1% alcohol
    const sugarPerAlcohol = 17;
    const potentialAlcohol = sugarContent / sugarPerAlcohol;
    
    const sugarNeeded = targetAlcohol * sugarPerAlcohol;
    const sugarAdjustment = sugarNeeded - sugarContent;

    return {
      volume: volume,
      currentSugar: sugarContent,
      potentialAlcohol: potentialAlcohol,
      targetAlcohol: targetAlcohol,
      sugarAdjustment: {
        needed: sugarAdjustment * volume,
        perLiter: sugarAdjustment
      },
      yeastNutrition: {
        yan: 200, // mg/L nitrogen
        dap: 0.5, // g/L
        fermaidK: 0.25 // g/L
      },
      so2Management: {
        molecular: 0.8, // mg/L
        free: 30, // mg/L
        total: 80 // mg/L
      },
      fermentationSchedule: [
        { day: 0, action: 'Pitch yeast', temp: 20, brix: sugarContent / 10 },
        { day: 1, action: 'First nutrient addition' },
        { day: 3, action: 'Second nutrient addition' },
        { day: 7, action: 'Check fermentation progress' },
        { day: 14, action: 'Rack to secondary' },
        { day: 30, action: 'Rack and clarify' }
      ]
    };
  }

  /**
   * Calculate bread fermentation schedule
   * @param {number} flourWeight - Flour weight in grams
   * @param {number} hydration - Hydration percentage
   * @param {number} yeastPercentage - Yeast percentage
   * @param {number} temperature - Fermentation temperature
   * @returns {Object} Bread fermentation calculations
   */
  calculateBreadFermentation(flourWeight, hydration, yeastPercentage, temperature) {
    const waterWeight = flourWeight * (hydration / 100);
    const yeastWeight = flourWeight * (yeastPercentage / 100);
    const totalWeight = flourWeight + waterWeight + yeastWeight;

    // Temperature factor (base at 25°C)
    const tempFactor = Math.pow(2, (temperature - 25) / 10);
    
    // Base times in minutes
    const bulkTime = 180 / tempFactor;
    const proofTime = 90 / tempFactor;
    const totalTime = bulkTime + proofTime + 60; // +60 for shaping/rest

    return {
      dough: {
        flour: flourWeight,
        water: waterWeight,
        yeast: yeastWeight,
        totalWeight: totalWeight,
        hydration: hydration
      },
      fermentation: {
        temperature: temperature,
        bulkFermentation: {
          time: Math.round(bulkTime),
          folds: Math.floor(bulkTime / 45),
          checkpoints: [
            { time: bulkTime * 0.5, action: 'First fold', lookFor: '30% size increase' },
            { time: bulkTime * 0.75, action: 'Final fold', lookFor: '50% size increase' },
            { time: bulkTime, action: 'Ready to divide', lookFor: 'Doubled in size' }
          ]
        },
        finalProof: {
          time: Math.round(proofTime),
          readiness: 'Poke test - slow spring back'
        },
        totalTime: Math.round(totalTime)
      },
      schedule: [
        { time: 0, action: 'Mix dough', duration: 10 },
        { time: 30, action: 'Autolyse', duration: 30 },
        { time: 60, action: 'Add salt, knead', duration: 10 },
        { time: 70, action: 'Bulk fermentation', duration: bulkTime },
        { time: 70 + bulkTime, action: 'Pre-shape', duration: 20 },
        { time: 90 + bulkTime, action: 'Final shape', duration: 10 },
        { time: 100 + bulkTime, action: 'Final proof', duration: proofTime },
        { time: 100 + bulkTime + proofTime, action: 'Bake', duration: 35 }
      ]
    };
  }

  /**
   * Calculate vegetable fermentation
   * @param {number} vegetableWeight - Vegetable weight in grams
   * @param {number} saltPercentage - Salt percentage
   * @returns {Object} Vegetable fermentation calculations
   */
  calculateVegetableFermentation(vegetableWeight, saltPercentage) {
    const saltWeight = vegetableWeight * (saltPercentage / 100);
    
    // Brine calculation (if needed)
    const brineVolume = vegetableWeight * 0.5; // Approximate
    const brineSalt = brineVolume * (saltPercentage / 100);

    return {
      method: saltPercentage < 2.5 ? 'Brine fermentation' : 'Dry salt fermentation',
      vegetables: {
        weight: vegetableWeight,
        salt: saltWeight,
        percentage: saltPercentage
      },
      brine: {
        needed: saltPercentage < 2.5,
        volume: brineVolume,
        salt: brineSalt,
        concentration: `${saltPercentage}% brine`
      },
      fermentation: {
        temperature: '18-22°C',
        time: {
          initial: '3-5 days',
          secondary: '1-4 weeks',
          total: '2-6 weeks'
        }
      },
      stages: [
        { day: 1, pH: 6.0, activity: 'Salt draws water, LAB growth begins' },
        { day: 3, pH: 4.5, activity: 'Active fermentation, CO2 production' },
        { day: 7, pH: 3.8, activity: 'Slowing fermentation' },
        { day: 14, pH: 3.5, activity: 'Maturation phase' },
        { day: 21, pH: 3.4, activity: 'Ready for cold storage' }
      ],
      storage: {
        temperature: '0-4°C',
        duration: 'Up to 6 months',
        container: 'Glass or food-grade plastic'
      }
    };
  }

  /**
   * Calculate acidity adjustments
   * @param {number} currentPH - Current pH
   * @param {number} currentTA - Current titratable acidity (g/L)
   * @param {number} volume - Volume in liters
   * @param {Object} adjustment - Adjustment details
   * @returns {Object} Acidity calculations
   */
  calculateAcidity(currentPH, currentTA, volume, adjustment) {
    let adjustedPH = currentPH;
    let adjustedTA = currentTA;

    if (adjustment) {
      if (adjustment.type === 'tartaric') {
        // Adding tartaric acid
        adjustedTA += adjustment.amount;
        adjustedPH -= adjustment.amount * 0.1; // Approximate
      } else if (adjustment.type === 'malolactic') {
        // MLF converts malic to lactic
        adjustedTA *= 0.67; // Approximate reduction
        adjustedPH += 0.1; // Slight increase
      }
    }

    const stability = adjustedPH < 3.6 ? 'Stable' : 
                     adjustedPH < 3.8 ? 'Moderately stable' : 
                     'Requires SO2 management';

    return {
      initial: {
        pH: currentPH,
        ta: currentTA,
        stability: currentPH < 3.6 ? 'Stable' : 'Check stability'
      },
      adjusted: {
        pH: adjustedPH,
        ta: adjustedTA,
        stability: stability
      },
      recommendations: [
        adjustedPH > 3.8 ? 'Consider acidification' : '',
        adjustedPH < 3.0 ? 'Very high acidity - consider deacidification' : '',
        adjustedTA > 9 ? 'High TA - may taste tart' : '',
        adjustedTA < 5 ? 'Low TA - may taste flat' : ''
      ].filter(Boolean)
    };
  }
}