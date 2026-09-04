export type SolarSystemType = "hybrid" | "on-grid";
export type SolarCoverageMode = "balanced" | "energy-offset";
export type BatteryChemistry = "lifepo4" | "lead-acid" | "custom";
export type ElectricalPhase = "single" | "three";

export type SolarAppliance = {
  id: string | number;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  category?: string | null;
  surgeWatts?: number | null;
  surgeMultiplier?: number | null;
  powerFactor?: number | null;
};

export type SolarPanelSpec = {
  id?: string | number;
  name: string;
  wattage: number;
  lengthMeters?: number | null;
  widthMeters?: number | null;
};

export type SolarDesignAssumptions = {
  systemType: SolarSystemType;
  coverageMode: SolarCoverageMode;
  peakSunHours: number;
  systemLossPercent: number;
  inverterEfficiencyPercent: number;
  inverterHeadroomPercent: number;
  targetDcAcRatio: number;
  overallPowerFactor: number;
  unknownMotorSurgeMultiplier: number;
  simultaneousMotorStarts: number;
  backupHours: number;
  backupLoadPercent: number;
  batteryChemistry: BatteryChemistry;
  customBatteryDodPercent?: number;
  customBatteryEfficiencyPercent?: number;
  batteryVoltage: number;
  roofSpacingPercent: number;
  electricalPhase: ElectricalPhase;
};

export type SolarCalculationResult = {
  peakRunningKw: number;
  peakApparentKva: number;
  estimatedStartingSurgeKw: number;
  dailyEnergyKwh: number;
  requiredPvDcKwEnergy: number;
  requiredPvDcKwPeak: number;
  requiredPvDcKw: number;
  panelCount: number | null;
  installedPvDcKw: number | null;
  estimatedDailySolarProductionKwh: number | null;
  estimatedCoveragePercent: number | null;
  inverterContinuousKw: number;
  inverterApparentKva: number;
  recommendedSurgeRatingKw: number;
  targetDcAcRatio: number;
  actualDcAcRatio: number | null;
  batteryUsableKwh: number;
  batteryNominalKwh: number;
  batteryApproxAh: number;
  roofAreaM2: number | null;
  roofAreaFt2: number | null;
  assumptions: {
    combinedEnergyEfficiency: number;
    batteryDod: number;
    batteryEfficiency: number;
    inferredSurgeRows: string[];
  };
  warnings: string[];
};

const finite = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundUp = (value: number, step = 0.5): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / step) * step;
};

const isMotorOrCompressorLoad = (item: SolarAppliance) => {
  const text = `${item.name} ${item.category || ""}`.toLowerCase();
  return /\b(ac|air ?condition|compressor|pump|motor|refrigerator|fridge|freezer|chiller|elevator|lift|washing|washer|hvac|blower)\b/.test(
    text
  );
};

const batteryDefaults = (chemistry: BatteryChemistry) => {
  if (chemistry === "lead-acid") {
    return { dod: 0.5, efficiency: 0.85 };
  }
  if (chemistry === "lifepo4") {
    return { dod: 0.9, efficiency: 0.95 };
  }
  return { dod: 0.8, efficiency: 0.9 };
};

export function calculateSolarSystem(
  appliances: SolarAppliance[],
  panel: SolarPanelSpec | null,
  raw: SolarDesignAssumptions
): SolarCalculationResult {
  const warnings: string[] = [];

  const assumptions = {
    ...raw,
    peakSunHours: clamp(finite(raw.peakSunHours, 5), 1, 8),
    systemLossPercent: clamp(finite(raw.systemLossPercent, 14), 0, 60),
    inverterEfficiencyPercent: clamp(
      finite(raw.inverterEfficiencyPercent, 96),
      50,
      100
    ),
    inverterHeadroomPercent: clamp(
      finite(raw.inverterHeadroomPercent, 25),
      0,
      100
    ),
    targetDcAcRatio: clamp(finite(raw.targetDcAcRatio, 1.2), 0.8, 2),
    overallPowerFactor: clamp(finite(raw.overallPowerFactor, 0.9), 0.5, 1),
    unknownMotorSurgeMultiplier: clamp(
      finite(raw.unknownMotorSurgeMultiplier, 2.5),
      1,
      6
    ),
    simultaneousMotorStarts: Math.max(
      1,
      Math.min(5, Math.round(finite(raw.simultaneousMotorStarts, 1)))
    ),
    backupHours: clamp(finite(raw.backupHours, 4), 0.5, 48),
    backupLoadPercent: clamp(finite(raw.backupLoadPercent, 100), 1, 100),
    batteryVoltage: clamp(finite(raw.batteryVoltage, 48), 12, 1000),
    roofSpacingPercent: clamp(finite(raw.roofSpacingPercent, 15), 0, 100),
  };

  const validRows = appliances.filter(
    (item) =>
      finite(item.watts) > 0 &&
      finite(item.quantity) > 0 &&
      finite(item.hoursPerDay) > 0
  );

  if (!validRows.length) {
    return {
      peakRunningKw: 0,
      peakApparentKva: 0,
      estimatedStartingSurgeKw: 0,
      dailyEnergyKwh: 0,
      requiredPvDcKwEnergy: 0,
      requiredPvDcKwPeak: 0,
      requiredPvDcKw: 0,
      panelCount: null,
      installedPvDcKw: null,
      estimatedDailySolarProductionKwh: null,
      estimatedCoveragePercent: null,
      inverterContinuousKw: 0,
      inverterApparentKva: 0,
      recommendedSurgeRatingKw: 0,
      targetDcAcRatio: assumptions.targetDcAcRatio,
      actualDcAcRatio: null,
      batteryUsableKwh: 0,
      batteryNominalKwh: 0,
      batteryApproxAh: 0,
      roofAreaM2: null,
      roofAreaFt2: null,
      assumptions: {
        combinedEnergyEfficiency: 0,
        batteryDod: 0,
        batteryEfficiency: 0,
        inferredSurgeRows: [],
      },
      warnings: ["Add at least one appliance or custom load before sizing a system."],
    };
  }

  let runningWatts = 0;
  let dailyWh = 0;
  const surgeIncrements: number[] = [];
  const inferredSurgeRows: string[] = [];

  for (const item of validRows) {
    const watts = Math.max(0, finite(item.watts));
    const qty = Math.max(0, finite(item.quantity));
    const hours = clamp(finite(item.hoursPerDay), 0, 24);
    const rowRunning = watts * qty;

    runningWatts += rowRunning;
    dailyWh += rowRunning * hours;

    let perUnitSurge = finite(item.surgeWatts, 0);
    if (!(perUnitSurge > watts)) {
      const suppliedMultiplier = finite(item.surgeMultiplier, 0);
      if (suppliedMultiplier > 1) {
        perUnitSurge = watts * suppliedMultiplier;
      } else if (isMotorOrCompressorLoad(item)) {
        perUnitSurge = watts * assumptions.unknownMotorSurgeMultiplier;
        inferredSurgeRows.push(item.name);
      } else {
        perUnitSurge = watts;
      }
    }

    const incrementalSurge = Math.max(0, perUnitSurge - watts);
    for (let i = 0; i < Math.min(qty, assumptions.simultaneousMotorStarts); i += 1) {
      surgeIncrements.push(incrementalSurge);
    }
  }

  surgeIncrements.sort((a, b) => b - a);
  const selectedSurgeIncrement = surgeIncrements
    .slice(0, assumptions.simultaneousMotorStarts)
    .reduce((sum, value) => sum + value, 0);

  const peakRunningKw = runningWatts / 1000;
  const peakApparentKva = peakRunningKw / assumptions.overallPowerFactor;
  const estimatedStartingSurgeKw =
    (runningWatts + selectedSurgeIncrement) / 1000;
  const dailyEnergyKwh = dailyWh / 1000;

  const dcLossFactor = 1 - assumptions.systemLossPercent / 100;
  const inverterEfficiency = assumptions.inverterEfficiencyPercent / 100;
  const combinedEnergyEfficiency = dcLossFactor * inverterEfficiency;

  if (combinedEnergyEfficiency <= 0) {
    warnings.push("System-loss and inverter-efficiency assumptions produce no usable output.");
  }

  const requiredPvDcKwEnergy =
    combinedEnergyEfficiency > 0
      ? dailyEnergyKwh /
        (assumptions.peakSunHours * combinedEnergyEfficiency)
      : 0;

  // For users who want the array to support the selected daytime load, the
  // peak path accounts for inverter conversion efficiency but does not pretend
  // that nameplate PV guarantees full output at every moment.
  const requiredPvDcKwPeak =
    inverterEfficiency > 0 ? peakRunningKw / inverterEfficiency : peakRunningKw;

  const requiredPvDcKw =
    assumptions.coverageMode === "energy-offset"
      ? requiredPvDcKwEnergy
      : Math.max(requiredPvDcKwEnergy, requiredPvDcKwPeak);

  const headroomFactor = 1 + assumptions.inverterHeadroomPercent / 100;
  const loadDrivenInverterKw = peakRunningKw * headroomFactor;
  const pvDrivenInverterKw = requiredPvDcKw / assumptions.targetDcAcRatio;
  const inverterContinuousKw = roundUp(
    Math.max(loadDrivenInverterKw, pvDrivenInverterKw),
    0.5
  );
  const inverterApparentKva = roundUp(
    inverterContinuousKw / assumptions.overallPowerFactor,
    0.5
  );
  const recommendedSurgeRatingKw = roundUp(estimatedStartingSurgeKw * 1.1, 0.5);

  let panelCount: number | null = null;
  let installedPvDcKw: number | null = null;
  let estimatedDailySolarProductionKwh: number | null = null;
  let estimatedCoveragePercent: number | null = null;
  let roofAreaM2: number | null = null;
  let roofAreaFt2: number | null = null;
  let actualDcAcRatio: number | null = null;

  if (panel && finite(panel.wattage) > 0) {
    panelCount = Math.max(
      1,
      Math.ceil((requiredPvDcKw * 1000) / finite(panel.wattage))
    );
    installedPvDcKw = (panelCount * finite(panel.wattage)) / 1000;
    estimatedDailySolarProductionKwh =
      installedPvDcKw * assumptions.peakSunHours * combinedEnergyEfficiency;
    estimatedCoveragePercent =
      dailyEnergyKwh > 0
        ? (estimatedDailySolarProductionKwh / dailyEnergyKwh) * 100
        : null;
    actualDcAcRatio =
      inverterContinuousKw > 0 ? installedPvDcKw / inverterContinuousKw : null;

    const length = finite(panel.lengthMeters, 0);
    const width = finite(panel.widthMeters, 0);
    if (length > 0 && width > 0) {
      roofAreaM2 =
        length *
        width *
        panelCount *
        (1 + assumptions.roofSpacingPercent / 100);
      roofAreaFt2 = roofAreaM2 * 10.7639104167;
    } else {
      warnings.push(
        "Panel dimensions are unavailable, so roof-area estimation is withheld."
      );
    }
  } else {
    warnings.push(
      "No valid panel wattage is selected. PV capacity can be estimated, but panel count and roof area are withheld."
    );
  }

  const chemistryDefaults = batteryDefaults(assumptions.batteryChemistry);
  const batteryDod =
    assumptions.batteryChemistry === "custom"
      ? clamp(finite(raw.customBatteryDodPercent, 80), 10, 100) / 100
      : chemistryDefaults.dod;
  const batteryEfficiency =
    assumptions.batteryChemistry === "custom"
      ? clamp(finite(raw.customBatteryEfficiencyPercent, 90), 50, 100) / 100
      : chemistryDefaults.efficiency;

  let batteryUsableKwh = 0;
  let batteryNominalKwh = 0;
  let batteryApproxAh = 0;

  if (assumptions.systemType === "hybrid") {
    const backupLoadKw =
      peakRunningKw * (assumptions.backupLoadPercent / 100);
    batteryUsableKwh = backupLoadKw * assumptions.backupHours;
    const dischargePathEfficiency =
      batteryDod * batteryEfficiency * inverterEfficiency;
    batteryNominalKwh =
      dischargePathEfficiency > 0
        ? batteryUsableKwh / dischargePathEfficiency
        : 0;
    batteryApproxAh =
      assumptions.batteryVoltage > 0
        ? (batteryNominalKwh * 1000) / assumptions.batteryVoltage
        : 0;
  }

  if (inferredSurgeRows.length) {
    warnings.push(
      `Starting surge was estimated for ${inferredSurgeRows.length} motor/compressor load${
        inferredSurgeRows.length === 1 ? "" : "s"
      } because catalog surge data was missing. Review the surge multiplier or add manufacturer surge data before procurement.`
    );
  }

  if (assumptions.coverageMode === "balanced") {
    warnings.push(
      "Balanced mode sizes the PV array against both daily energy and the selected daytime running load. Real-time solar output still varies with irradiance, temperature, shading and orientation."
    );
  } else {
    warnings.push(
      "Energy-offset mode sizes the PV array from daily energy only; the grid or battery may still be required to support high instantaneous loads."
    );
  }

  if (assumptions.systemType === "hybrid") {
    warnings.push(
      "Battery sizing assumes the selected backup-load percentage remains constant for the requested backup duration. Actual autonomy depends on load diversity, BMS limits, temperature, ageing and inverter settings."
    );
  }

  warnings.push(
    "This is a planning estimate, not an electrical design or installation approval. Confirm conductor sizing, protection, earthing, inverter/MPPT voltage windows, utility rules and equipment compatibility with a qualified local professional."
  );

  return {
    peakRunningKw,
    peakApparentKva,
    estimatedStartingSurgeKw,
    dailyEnergyKwh,
    requiredPvDcKwEnergy,
    requiredPvDcKwPeak,
    requiredPvDcKw,
    panelCount,
    installedPvDcKw,
    estimatedDailySolarProductionKwh,
    estimatedCoveragePercent,
    inverterContinuousKw,
    inverterApparentKva,
    recommendedSurgeRatingKw,
    targetDcAcRatio: assumptions.targetDcAcRatio,
    actualDcAcRatio,
    batteryUsableKwh,
    batteryNominalKwh,
    batteryApproxAh,
    roofAreaM2,
    roofAreaFt2,
    assumptions: {
      combinedEnergyEfficiency,
      batteryDod,
      batteryEfficiency,
      inferredSurgeRows,
    },
    warnings,
  };
}
