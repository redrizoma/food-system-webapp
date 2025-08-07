import Decimal from "decimal.js";

/**
 * Molecular Gastronomy Calculator
 * Implements calculations for spherification, gelification, emulsification, etc.
 */
export class MolecularGastronomyCalculator {
  constructor() {
    // Hydrocolloid concentrations (% by weight)
    this.CONCENTRATIONS = {
      // Spherification
      sodium_alginate: { min: 0.5, max: 1.0, typical: 0.5 },
      calcium_chloride: { min: 0.5, max: 1.5, typical: 1.0 },
      calcium_lactate: { min: 1.0, max: 2.0, typical: 1.5 },

      // Gelification
      agar: {
        fluid_gel: { min: 0.3, max: 0.5 },
        soft_gel: { min: 0.5, max: 0.9 },
        firm_gel: { min: 0.9, max: 1.5 },
        brittle_gel: { min: 1.5, max: 3.0 },
      },
      gellan: { min: 0.2, max: 1.0, typical: 0.5 },
      carrageenan: {
        kappa: { min: 0.5, max: 1.5 },
        iota: { min: 1.0, max: 2.0 },
        lambda: { min: 0.5, max: 1.0 },
      },

      // Emulsification
      lecithin: { foam: 0.5, air: 0.3, emulsion: 1.0 },

      // Thickening
      xanthan: { min: 0.1, max: 0.5, typical: 0.2 },
      guar: { min: 0.2, max: 1.0, typical: 0.5 },
      methylcellulose: { min: 1.0, max: 2.0, typical: 1.5 },

      // Transglutaminase
      activa: { min: 0.5, max: 1.0, typical: 0.75 },
    };

    // pH requirements for different techniques
    this.PH_REQUIREMENTS = {
      sodium_alginate: { min: 3.5, max: 10, optimal: 5.5 },
      agar: { min: 3, max: 11, optimal: 7 },
      gellan: { min: 3.5, max: 10, optimal: 7 },
      carrageenan: { min: 7, max: 10, optimal: 8 },
      pectin: { min: 2.8, max: 3.5, optimal: 3.2 },
    };

    // Setting times at room temperature (minutes)
    this.SETTING_TIMES = {
      spherification_basic: 3,
      spherification_reverse: 5,
      agar_gel: 30,
      gellan_gel: 20,
      carrageenan_gel: 45,
      methylcellulose_gel: 10, // when heated
    };
  }

  /**
   * Calculate basic spherification
   */
  calculateBasicSpherification(liquidVolume, calciumBathVolume) {
    const liquid = new Decimal(liquidVolume);
    const bath = new Decimal(calciumBathVolume);

    // Sodium alginate for liquid
    const alginate = liquid.times(
      this.CONCENTRATIONS.sodium_alginate.typical / 100
    );

    // Calcium chloride for bath
    const calcium = bath.times(
      this.CONCENTRATIONS.calcium_chloride.typical / 100
    );

    return {
      technique: "Basic Spherification",
      liquid: {
        volume: liquid.toNumber(),
        sodiumAlginate: alginate.toNumber(),
        concentration: `${this.CONCENTRATIONS.sodium_alginate.typical}%`,
        mixing: "Blend thoroughly, let rest to remove air bubbles",
      },
      bath: {
        volume: bath.toNumber(),
        calciumChloride: calcium.toNumber(),
        concentration: `${this.CONCENTRATIONS.calcium_chloride.typical}%`,
        temperature: "Room temperature",
      },
      process: {
        immersionTime: "2-3 minutes",
        rinse: "Clean water bath required",
        serving: "Serve immediately (continues to gel)",
        shelfLife: "10-15 minutes maximum",
      },
      tips: [
        "Ensure pH > 3.5 for alginate to work",
        "Add citric acid to calcium bath to prevent pH rise",
        "Use hemisphere spoon for perfect spheres",
      ],
    };
  }

  /**
   * Calculate reverse spherification
   */
  calculateReverseSpherification(liquidVolume, alginateBathVolume) {
    const liquid = new Decimal(liquidVolume);
    const bath = new Decimal(alginateBathVolume);

    // Calcium lactate for liquid
    const calcium = liquid.times(
      this.CONCENTRATIONS.calcium_lactate.typical / 100
    );

    // Sodium alginate for bath
    const alginate = bath.times(
      this.CONCENTRATIONS.sodium_alginate.typical / 100
    );

    // Optional xanthan for thickening
    const xanthan = liquid.times(this.CONCENTRATIONS.xanthan.typical / 100);

    return {
      technique: "Reverse Spherification",
      liquid: {
        volume: liquid.toNumber(),
        calciumLactate: calcium.toNumber(),
        xanthanGum: xanthan.toNumber(),
        concentration: `${this.CONCENTRATIONS.calcium_lactate.typical}% calcium`,
        mixing: "Dissolve calcium, thicken if needed",
      },
      bath: {
        volume: bath.toNumber(),
        sodiumAlginate: alginate.toNumber(),
        concentration: `${this.CONCENTRATIONS.sodium_alginate.typical}%`,
        preparation: "Prepare 24h in advance for best results",
      },
      process: {
        immersionTime: "3-5 minutes",
        rinse: "Not required",
        serving: "Can hold for hours",
        shelfLife: "Several hours (gelling stops when removed)",
      },
      advantages: [
        "Better texture control",
        "Longer holding time",
        "Works with calcium-rich ingredients",
        "Can be prepared in advance",
      ],
    };
  }

  /**
   * Calculate frozen reverse spherification
   */
  calculateFrozenReverseSpherification(liquidVolume, moldCount) {
    const perSphere = new Decimal(liquidVolume).dividedBy(moldCount);
    const calcium = perSphere.times(
      this.CONCENTRATIONS.calcium_lactate.typical / 100
    );

    return {
      technique: "Frozen Reverse Spherification",
      preparation: {
        volumePerSphere: perSphere.toNumber(),
        calciumLactate: calcium.times(moldCount).toNumber(),
        totalVolume: liquidVolume,
        freezingTime: "2-4 hours",
        moldType: "Hemisphere silicone molds",
      },
      process: {
        step1: "Mix liquid with calcium lactate",
        step2: "Pour into hemisphere molds and freeze",
        step3: "Prepare alginate bath (0.5%)",
        step4: "Drop frozen spheres into bath",
        step5: "Thaw in bath (5-10 minutes)",
        step6: "Serve when center is liquid",
      },
      advantages: [
        "Perfect sphere shape",
        "Consistent size",
        "Can prepare many at once",
        "Extended prep timeline",
      ],
    };
  }

  /**
   * Calculate agar gel concentrations
   */
  calculateAgarGel(liquidVolume, gelType) {
    const volume = new Decimal(liquidVolume);
    const concentration = this.CONCENTRATIONS.agar[gelType];

    if (!concentration) {
      throw new Error(
        "Invalid gel type. Use: fluid_gel, soft_gel, firm_gel, or brittle_gel"
      );
    }

    const agarAmount = volume.times(concentration.min / 100);
    const agarAmountMax = volume.times(concentration.max / 100);

    return {
      technique: "Agar Gelification",
      gelType,
      liquid: {
        volume: volume.toNumber(),
        agarRange: {
          min: agarAmount.toNumber(),
          max: agarAmountMax.toNumber(),
        },
        concentration: `${concentration.min}-${concentration.max}%`,
      },
      process: {
        dispersion: "Disperse in cold liquid",
        heating: "Heat to 85°C while stirring",
        setting: "Sets at 35°C",
        settingTime: `${this.SETTING_TIMES.agar_gel} minutes`,
        texture: this.getAgarTexture(gelType),
      },
      properties: {
        thermoreversible: true,
        meltingPoint: "85°C",
        settingPoint: "35°C",
        clarity: "Very clear",
        syneresis: "Low",
      },
      applications: this.getAgarApplications(gelType),
    };
  }

  /**
   * Get agar texture description
   */
  getAgarTexture(gelType) {
    const textures = {
      fluid_gel: "Pourable, sauce-like",
      soft_gel: "Tender, delicate, melts in mouth",
      firm_gel: "Sliceable, holds shape",
      brittle_gel: "Crisp, breaks cleanly",
    };
    return textures[gelType];
  }

  /**
   * Get agar applications
   */
  getAgarApplications(gelType) {
    const applications = {
      fluid_gel: ["Sauces", "Purees", "Foam bases"],
      soft_gel: ["Jellies", "Aspics", "Soft noodles"],
      firm_gel: ["Noodles", "Sheets", "Cubes"],
      brittle_gel: ["Crisps", "Tuiles", "Crystals"],
    };
    return applications[gelType];
  }

  /**
   * Calculate lecithin foam
   */
  calculateLecithinFoam(liquidVolume, foamType = "foam") {
    const volume = new Decimal(liquidVolume);
    const concentration = this.CONCENTRATIONS.lecithin[foamType];
    const lecithin = volume.times(concentration / 100);

    return {
      technique: `Lecithin ${
        foamType.charAt(0).toUpperCase() + foamType.slice(1)
      }`,
      liquid: {
        volume: volume.toNumber(),
        lecithin: lecithin.toNumber(),
        concentration: `${concentration}%`,
      },
      process: {
        mixing: foamType === "air" ? "Surface blending" : "Immersion blending",
        technique:
          foamType === "air"
            ? "Blend at surface to incorporate air"
            : "Blend deeply for dense foam",
        stability: foamType === "air" ? "5-10 minutes" : "30-60 minutes",
        serving: "Spoon foam only, leave liquid",
      },
      tips: [
        "Liquid must contain some fat for stability",
        "Works best with acidic liquids",
        "Temperature: room temp to 60°C",
        "Can add xanthan (0.1%) for stability",
      ],
    };
  }

  /**
   * Calculate transglutaminase (meat glue)
   */
  calculateTransglutaminase(proteinWeight, bondingType) {
    const weight = new Decimal(proteinWeight);
    const enzyme = weight.times(this.CONCENTRATIONS.activa.typical / 100);

    const methods = {
      direct: {
        enzyme: enzyme.toNumber(),
        application: "Sprinkle directly on surfaces",
        bonding: "Press together immediately",
        time: "6-24 hours at 4°C",
      },
      slurry: {
        enzyme: enzyme.toNumber(),
        water: weight.times(0.2).toNumber(),
        application: "Mix slurry, brush on surfaces",
        bonding: "Press together, vacuum seal if possible",
        time: "4-24 hours at 4°C",
      },
      incorporation: {
        enzyme: enzyme.times(2).toNumber(), // Higher concentration
        mixing: "Mix directly into ground meat",
        forming: "Shape as desired",
        time: "2-4 hours at 4°C",
      },
    };

    return {
      technique: "Transglutaminase Bonding",
      protein: {
        weight: weight.toNumber(),
        enzymeAmount: methods[bondingType].enzyme,
        concentration: `${this.CONCENTRATIONS.activa.typical}%`,
      },
      method: methods[bondingType],
      safetyNotes: [
        "Wear gloves and mask when handling powder",
        "Enzyme deactivates at 70°C",
        "Final product is safe to eat raw or cooked",
      ],
      applications: [
        "Fish restructuring",
        "Meat gluing",
        "Vegetable-protein binding",
        "Texture modification",
      ],
    };
  }

  /**
   * Calculate methylcellulose hot gel
   */
  calculateMethylcellulose(liquidVolume, gelStrength = "medium") {
    const volume = new Decimal(liquidVolume);
    const concentrations = {
      light: 1.0,
      medium: 1.5,
      firm: 2.0,
    };

    const concentration = concentrations[gelStrength];
    const methylcellulose = volume.times(concentration / 100);

    return {
      technique: "Methylcellulose Hot Gel",
      uniqueProperty: "Gels when heated, melts when cooled",
      liquid: {
        volume: volume.toNumber(),
        methylcellulose: methylcellulose.toNumber(),
        concentration: `${concentration}%`,
      },
      process: {
        dispersion: "Disperse in ice-cold liquid",
        hydration: "Refrigerate 2-4 hours to hydrate",
        gelation: "Heats to gel at 50-55°C",
        melting: "Melts below 40°C",
      },
      applications: [
        "Hot ice cream",
        "Deep-frying liquids",
        "Hot foams",
        "Vegetarian sausage casings",
        "Heat-stable fillings",
      ],
      tips: [
        "Must hydrate in cold for proper functionality",
        "Can be frozen after hydration",
        "Combine with other gums for texture variety",
      ],
    };
  }

  /**
   * Calculate xanthan gum thickening
   */
  calculateXanthanThickening(liquidVolume, viscosity = "medium") {
    const volume = new Decimal(liquidVolume);
    const concentrations = {
      light: 0.1, // Light thickening
      medium: 0.2, // Sauce consistency
      thick: 0.3, // Thick sauce
      gel: 0.5, // Gel-like
    };

    const concentration = concentrations[viscosity];
    const xanthan = volume.times(concentration / 100);

    return {
      technique: "Xanthan Thickening",
      liquid: {
        volume: volume.toNumber(),
        xanthan: xanthan.toNumber(),
        concentration: `${concentration}%`,
        viscosity: viscosity,
      },
      process: {
        dispersion: "Blend vigorously to avoid clumps",
        hydration: "Immediate",
        shearThinning: true,
        stability: "Stable to heat, acid, salt",
      },
      properties: {
        pseudoplastic: "Thins when stirred",
        suspension: "Excellent particle suspension",
        synergy: "Combines well with guar gum",
        clarity: "Clear to slightly cloudy",
      },
      tips: [
        "Pre-mix with sugar or oil for easier dispersion",
        "Use immersion blender for best results",
        "Less is more - easy to over-thicken",
        "Combine with guar (1:1) for better mouthfeel",
      ],
    };
  }

  /**
   * Calculate gellan gum gel
   */
  calculateGellanGel(liquidVolume, gelType = "standard") {
    const volume = new Decimal(liquidVolume);
    const types = {
      fluid: 0.2,
      standard: 0.5,
      firm: 1.0,
    };

    const concentration = types[gelType];
    const gellan = volume.times(concentration / 100);

    return {
      technique: "Gellan Gum Gel",
      liquid: {
        volume: volume.toNumber(),
        gellan: gellan.toNumber(),
        concentration: `${concentration}%`,
      },
      process: {
        dispersion: "Disperse in cold liquid",
        heating: "Heat to 85°C to hydrate",
        setting: "Sets on cooling",
        ionSensitive: true,
      },
      properties: {
        clarity: "Crystal clear",
        heatStable: "To 120°C",
        texture: gelType === "fluid" ? "Pourable" : "Firm, brittle",
        syneresis: "Low",
      },
      modifications: {
        elastic: "Add calcium for elasticity",
        soft: "Add sodium for softer gel",
        combined: "Mix with agar for texture variety",
      },
    };
  }

  /**
   * Calculate sous vide gel preparation
   */
  calculateSousVideGel(ingredients, temperature, time) {
    return {
      technique: "Sous Vide Gel Preparation",
      advantages: [
        "Precise temperature control",
        "No evaporation",
        "Uniform heating",
        "Preserves volatiles",
      ],
      process: {
        preparation: "Mix all ingredients, vacuum seal",
        temperature: temperature,
        time: time,
        cooling: "Shock in ice bath if needed",
      },
      applications: {
        agar: { temp: 85, time: 30 },
        gellan: { temp: 85, time: 30 },
        carrageenan: { temp: 80, time: 45 },
        pectin: { temp: 95, time: 20 },
      },
    };
  }

  /**
   * pH adjustment calculator
   */
  calculatePHAdjustment(currentPH, targetPH, volume, ingredient) {
    const adjustment = {
      technique: "pH Adjustment for Molecular Gastronomy",
      current: currentPH,
      target: targetPH,
      volume: volume,
      direction: targetPH > currentPH ? "increase" : "decrease",
    };

    if (targetPH > currentPH) {
      // Need to increase pH (make more basic)
      adjustment.additives = [
        { name: "Sodium citrate", amount: volume * 0.002, unit: "g" },
        { name: "Calcium carbonate", amount: volume * 0.001, unit: "g" },
        { name: "Sodium bicarbonate", amount: volume * 0.001, unit: "g" },
      ];
    } else {
      // Need to decrease pH (make more acidic)
      adjustment.additives = [
        { name: "Citric acid", amount: volume * 0.002, unit: "g" },
        { name: "Tartaric acid", amount: volume * 0.002, unit: "g" },
        { name: "Malic acid", amount: volume * 0.001, unit: "g" },
      ];
    }

    adjustment.notes = [
      "Add gradually and test pH frequently",
      "Allow time for equilibration",
      "Consider flavor impact of additives",
    ];

    return adjustment;
  }

  /**
   * Generate molecular gastronomy report
   */
  generateMolecularReport(technique, data) {
    return {
      title: `Molecular Gastronomy - ${technique}`,
      date: new Date().toISOString().split("T")[0],
      technique: technique,
      calculations: data,
      equipment: this.getRequiredEquipment(technique),
      timeline: this.getProductionTimeline(technique),
      troubleshooting: this.getTroubleshooting(technique),
      scaling: {
        note: "All calculations scale linearly",
        minimum: "Test with 100ml batches first",
        maximum: "Industrial scale requires equipment validation",
      },
    };
  }

  getRequiredEquipment(technique) {
    const equipment = {
      spherification: [
        "Immersion blender",
        "Calcium bath container",
        "Hemisphere spoon",
        "Slotted spoon",
        "Timer",
        "Scale (0.01g precision)",
      ],
      gelification: [
        "Thermometer",
        "Whisk",
        "Scale (0.01g precision)",
        "Molds (optional)",
        "Refrigeration",
      ],
      emulsification: [
        "Immersion blender",
        "Wide container",
        "Scale (0.01g precision)",
      ],
      transglutaminase: [
        "Gloves and mask",
        "Vacuum chamber (optional)",
        "Refrigeration",
        "Scale (0.01g precision)",
      ],
    };

    return (
      equipment[technique.toLowerCase()] || ["Scale", "Thermometer", "Whisk"]
    );
  }

  getProductionTimeline(technique) {
    const timelines = {
      spherification: {
        prep: "30 minutes",
        execution: "5 minutes per batch",
        service: "Immediate to 2 hours",
      },
      gelification: {
        prep: "15 minutes",
        setting: "30-60 minutes",
        service: "Up to 3 days refrigerated",
      },
      emulsification: {
        prep: "5 minutes",
        execution: "2 minutes",
        service: "Immediate to 30 minutes",
      },
    };

    return (
      timelines[technique.toLowerCase()] || {
        prep: "30 minutes",
        service: "As needed",
      }
    );
  }

  getTroubleshooting(technique) {
    const issues = {
      spherification: [
        {
          problem: "Spheres break easily",
          solution: "Increase alginate concentration or immersion time",
        },
        {
          problem: "No gel formation",
          solution: "Check pH (needs > 3.5), ensure calcium presence",
        },
        {
          problem: "Caviar tails",
          solution: "Hold syringe closer to bath surface",
        },
      ],
      gelification: [
        {
          problem: "Gel too soft",
          solution: "Increase hydrocolloid concentration",
        },
        { problem: "Lumps in gel", solution: "Better dispersion, use blender" },
        {
          problem: "Syneresis (weeping)",
          solution: "Add locust bean gum or reduce concentration",
        },
      ],
      emulsification: [
        {
          problem: "Foam disappears quickly",
          solution: "Add xanthan gum for stability",
        },
        {
          problem: "No foam formation",
          solution: "Ensure fat content, check lecithin quality",
        },
      ],
    };

    return issues[technique.toLowerCase()] || [];
  }
}
