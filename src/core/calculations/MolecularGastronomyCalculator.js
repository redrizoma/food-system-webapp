/**
 * Molecular Gastronomy Calculator
 * Handles molecular techniques and hydrocolloid calculations
 */

export class MolecularGastronomyCalculator {
  constructor() {
    this.concentrations = {
      sodiumAlginate: { min: 0.5, max: 1.0 },
      calciumChloride: { min: 0.5, max: 1.5 },
      calciumLactate: { min: 1.0, max: 2.0 },
      agar: { min: 0.3, max: 3.0 },
      gellan: { min: 0.2, max: 1.0 },
      xanthan: { min: 0.1, max: 0.5 },
      lecithin: { min: 0.3, max: 0.5 },
      methylcellulose: { min: 1.0, max: 2.0 },
      transglutaminase: { min: 0.5, max: 1.0 }
    };
  }

  /**
   * Calculate basic spherification
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {number} bathVolume - Bath volume in ml
   * @returns {Object} Spherification calculations
   */
  calculateBasicSpherification(liquidVolume, bathVolume) {
    const sodiumAlginatePercent = 0.5; // 0.5%
    const calciumChloridePercent = 1.0; // 1.0%

    const sodiumAlginate = (liquidVolume * sodiumAlginatePercent) / 100;
    const calciumChloride = (bathVolume * calciumChloridePercent) / 100;

    return {
      technique: 'Basic Spherification',
      liquid: {
        volume: liquidVolume,
        sodiumAlginate: sodiumAlginate,
        concentration: `${sodiumAlginatePercent}%`,
        mixing: 'Blend thoroughly to disperse'
      },
      bath: {
        volume: bathVolume,
        calciumChloride: calciumChloride,
        concentration: `${calciumChloridePercent}%`,
        temperature: 'Room temperature'
      },
      process: {
        immersion_time: '1-3 minutes',
        rinse: 'Rinse in clean water',
        storage: 'Use immediately',
        texture: 'Liquid center with gel membrane'
      },
      tips: [
        'Liquid pH should be above 3.6',
        'Avoid high calcium content in liquid',
        'Spheres continue gelling over time'
      ]
    };
  }

  /**
   * Calculate reverse spherification
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {number} bathVolume - Bath volume in ml
   * @returns {Object} Reverse spherification calculations
   */
  calculateReverseSpherification(liquidVolume, bathVolume) {
    const calciumLactatePercent = 1.0; // 1.0%
    const sodiumAlginatePercent = 0.5; // 0.5%

    const calciumLactate = (liquidVolume * calciumLactatePercent) / 100;
    const sodiumAlginate = (bathVolume * sodiumAlginatePercent) / 100;

    return {
      technique: 'Reverse Spherification',
      liquid: {
        volume: liquidVolume,
        calciumLactate: calciumLactate,
        concentration: `${calciumLactatePercent}%`,
        mixing: 'Dissolve completely'
      },
      bath: {
        volume: bathVolume,
        sodiumAlginate: sodiumAlginate,
        concentration: `${sodiumAlginatePercent}%`,
        temperature: 'Room temperature'
      },
      process: {
        immersion_time: '2-5 minutes',
        rinse: 'No rinse needed',
        storage: 'Can be stored in calcium solution',
        texture: 'Liquid center that stays liquid'
      },
      advantages: [
        'No continued gelling',
        'Can be made in advance',
        'Works with acidic liquids',
        'Better texture control'
      ]
    };
  }

  /**
   * Calculate frozen reverse spherification
   * @param {number} liquidVolume - Total liquid volume in ml
   * @param {number} moldCount - Number of spheres
   * @returns {Object} Frozen spherification calculations
   */
  calculateFrozenReverseSpherification(liquidVolume, moldCount) {
    const calciumLactatePercent = 1.0;
    const volumePerSphere = liquidVolume / moldCount;
    const calciumLactate = (liquidVolume * calciumLactatePercent) / 100;

    return {
      technique: 'Frozen Reverse Spherification',
      preparation: {
        volumePerSphere,
        calciumLactate,
        freezingTime: '2-4 hours',
        moldType: 'Hemisphere molds ideal'
      },
      process: {
        1: 'Mix calcium lactate into liquid',
        2: 'Pour into hemisphere molds',
        3: 'Freeze completely',
        4: 'Prepare alginate bath (0.5%)',
        5: 'Drop frozen spheres into bath',
        6: 'Wait for thawing and gel formation',
        7: 'Serve when center is liquid'
      }
    };
  }

  /**
   * Calculate agar gel
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {string} gelType - Type of gel desired
   * @returns {Object} Agar gel calculations
   */
  calculateAgarGel(liquidVolume, gelType) {
    const concentrations = {
      fluid_gel: { min: 0.3, max: 0.5 },
      soft_gel: { min: 0.5, max: 1.0 },
      firm_gel: { min: 1.0, max: 1.5 },
      brittle_gel: { min: 1.5, max: 3.0 }
    };

    const concentration = concentrations[gelType] || concentrations.soft_gel;
    const avgConcentration = (concentration.min + concentration.max) / 2;

    return {
      technique: 'Agar Gelification',
      gelType: gelType.replace(/_/g, ' '),
      liquid: {
        volume: liquidVolume,
        agarRange: {
          min: (liquidVolume * concentration.min) / 100,
          max: (liquidVolume * concentration.max) / 100
        },
        concentration: `${concentration.min}-${concentration.max}%`
      },
      process: {
        temperature: 'Heat to 85°C to hydrate',
        setting: 'Sets at 35°C',
        texture: this.getAgarTexture(gelType),
        thermoreversible: 'Yes - melts at 85°C'
      },
      properties: {
        clarity: 'Very clear',
        flavor_release: 'Excellent',
        heat_stable: 'Yes',
        freeze_stable: 'No - becomes spongy'
      },
      applications: this.getAgarApplications(gelType)
    };
  }

  /**
   * Get agar texture description
   * @param {string} gelType - Type of gel
   * @returns {string} Texture description
   */
  getAgarTexture(gelType) {
    const textures = {
      fluid_gel: 'Pourable, sauce-like',
      soft_gel: 'Tender, delicate',
      firm_gel: 'Sliceable, elastic',
      brittle_gel: 'Crisp, breaks cleanly'
    };
    return textures[gelType] || 'Medium firmness';
  }

  /**
   * Get agar applications
   * @param {string} gelType - Type of gel
   * @returns {Array} Applications
   */
  getAgarApplications(gelType) {
    const applications = {
      fluid_gel: ['Sauces', 'Foams', 'Purees'],
      soft_gel: ['Jellies', 'Glazes', 'Custards'],
      firm_gel: ['Noodles', 'Sheets', 'Cubes'],
      brittle_gel: ['Crisps', 'Tuiles', 'Glass']
    };
    return applications[gelType] || [];
  }

  /**
   * Calculate gellan gel
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {string} firmness - Gel firmness
   * @returns {Object} Gellan calculations
   */
  calculateGellanGel(liquidVolume, firmness) {
    const concentrations = {
      fluid: 0.2,
      standard: 0.5,
      firm: 1.0
    };

    const concentration = concentrations[firmness] || 0.5;
    const gellan = (liquidVolume * concentration) / 100;

    return {
      technique: 'Gellan Gelification',
      liquid: {
        volume: liquidVolume,
        gellan: gellan,
        concentration: `${concentration}%`
      },
      properties: {
        clarity: 'Crystal clear',
        heat_stable: 'Very stable to 120°C',
        texture: 'Clean break, no elasticity',
        setting_temp: '70-80°C'
      },
      modifications: {
        'With calcium': 'Firmer, more brittle',
        'With sodium': 'Softer, more elastic',
        'With sugar': 'Softer texture',
        'With acid': 'Requires more gellan'
      }
    };
  }

  /**
   * Calculate lecithin foam
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {string} foamType - Type of foam
   * @returns {Object} Lecithin foam calculations
   */
  calculateLecithinFoam(liquidVolume, foamType) {
    const concentration = 0.5; // Standard 0.5%
    const lecithin = (liquidVolume * concentration) / 100;

    return {
      technique: `Lecithin ${foamType}`,
      liquid: {
        volume: liquidVolume,
        lecithin: lecithin,
        concentration: `${concentration}%`
      },
      process: {
        mixing: foamType === 'air' ? 'Whisk or aquarium pump' : 'Immersion blender',
        stability: foamType === 'air' ? '5-10 minutes' : '20-30 minutes',
        texture: foamType === 'air' ? 'Light, airy bubbles' : 'Dense, creamy foam'
      },
      tips: [
        'Works best with liquids containing some fat',
        'Can be stabilized with xanthan',
        'Collect foam with spoon or ladle',
        'Temperature stable to 60°C'
      ]
    };
  }

  /**
   * Calculate transglutaminase
   * @param {number} proteinWeight - Protein weight in grams
   * @param {string} method - Application method
   * @returns {Object} Transglutaminase calculations
   */
  calculateTransglutaminase(proteinWeight, method) {
    const concentration = method === 'direct' ? 1.0 : 0.75;
    const enzymeAmount = (proteinWeight * concentration) / 100;

    return {
      technique: 'Transglutaminase Bonding',
      protein: {
        weight: proteinWeight,
        enzymeAmount: enzymeAmount,
        concentration: `${concentration}%`
      },
      method: {
        application: method,
        mixing: method === 'direct' ? 'Sprinkle on surface' :
                method === 'slurry' ? 'Mix with 4x water' :
                'Mix into ground meat',
        time: '4-24 hours',
        temperature: '4-60°C (refrigerated preferred)'
      },
      safetyNotes: [
        'Wear mask when handling powder',
        'Can cause allergic reactions',
        'Creates permanent protein bonds'
      ],
      applications: [
        'Meat glue for binding',
        'Fish restructuring',
        'Cheese production',
        'Yogurt texture improvement'
      ]
    };
  }

  /**
   * Calculate methylcellulose hot gel
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {string} gelStrength - Gel strength
   * @returns {Object} Methylcellulose calculations
   */
  calculateMethylcellulose(liquidVolume, gelStrength) {
    const concentrations = {
      light: 1.0,
      medium: 1.5,
      firm: 2.0
    };

    const concentration = concentrations[gelStrength] || 1.5;
    const methylcellulose = (liquidVolume * concentration) / 100;

    return {
      technique: 'Methylcellulose Hot Gel',
      liquid: {
        volume: liquidVolume,
        methylcellulose: methylcellulose,
        concentration: `${concentration}%`
      },
      process: {
        hydration: 'Disperse in cold water',
        activation: 'Gels when heated above 50°C',
        melting: 'Melts when cooled below 15°C',
        texture: 'Firm, elastic gel when hot'
      },
      applications: [
        'Hot ice cream',
        'Fried mayonnaise',
        'Hot foams',
        'Vegetarian sausage casings'
      ],
      tips: [
        'Must hydrate in cold liquid',
        'Blending helps dispersion',
        'Can be frozen and reheated'
      ]
    };
  }

  /**
   * Calculate xanthan thickening
   * @param {number} liquidVolume - Liquid volume in ml
   * @param {string} viscosity - Desired viscosity
   * @returns {Object} Xanthan calculations
   */
  calculateXanthanThickening(liquidVolume, viscosity) {
    const concentrations = {
      light: 0.1,
      medium: 0.25,
      thick: 0.4,
      gel: 0.5
    };

    const concentration = concentrations[viscosity] || 0.25;
    const xanthan = (liquidVolume * concentration) / 100;

    return {
      technique: 'Xanthan Thickening',
      liquid: {
        volume: liquidVolume,
        xanthan: xanthan,
        concentration: `${concentration}%`,
        viscosity: viscosity
      },
      properties: {
        shear_thinning: 'Yes - thins when stirred',
        temperature_stable: 'Yes - 0-100°C',
        ph_stable: 'Yes - pH 2-12',
        freeze_thaw_stable: 'Yes',
        synergy: 'Works well with guar gum'
      },
      tips: [
        'Blend to prevent clumping',
        'Pre-mix with sugar or oil',
        'Let hydrate for 10 minutes',
        'Small amounts go far'
      ]
    };
  }

  /**
   * Calculate pH adjustment
   * @param {number} currentPH - Current pH
   * @param {number} targetPH - Target pH
   * @param {number} volume - Volume in ml
   * @param {string} ingredient - Main ingredient
   * @returns {Object} pH adjustment guide
   */
  calculatePHAdjustment(currentPH, targetPH, volume, ingredient) {
    const direction = targetPH > currentPH ? 'increase' : 'decrease';
    const difference = Math.abs(targetPH - currentPH);

    const additives = direction === 'increase' ? 
      [
        { name: 'Sodium citrate', amount: difference * 0.5, unit: 'g' },
        { name: 'Calcium carbonate', amount: difference * 0.3, unit: 'g' },
        { name: 'Baking soda', amount: difference * 0.2, unit: 'g' }
      ] : 
      [
        { name: 'Citric acid', amount: difference * 0.5, unit: 'g' },
        { name: 'Lactic acid', amount: difference * 2, unit: 'ml' },
        { name: 'Vinegar', amount: difference * 5, unit: 'ml' }
      ];

    return {
      current: currentPH,
      target: targetPH,
      volume: volume,
      direction: direction,
      additives: additives,
      notes: [
        'Add gradually and test frequently',
        'Temperature affects pH readings',
        'Some ingredients buffer pH changes',
        direction === 'increase' ? 
          'Increasing pH may affect gel strength' :
          'Decreasing pH may improve spherification'
      ]
    };
  }
}