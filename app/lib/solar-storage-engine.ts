/**
 * Battery runtime and solar recovery planning, version 1.
 * Pure, deterministic energy model. No database, network or browser dependency.
 * All powers are watts; stored energy is Wh; all efficiencies are one-way.
 * See docs/SOLAR_STORAGE_METHOD.md for assumptions and calculation boundaries.
 */
export type StorageChemistry = "lifepo4" | "lead-acid" | "custom";
export type SolarAvailability = "available" | "unavailable" | "unknown";

export type StorageLoad = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  supply: "ac" | "dc";
  enabled: boolean;
  startHour: number;
  hoursPerDay: number;
  surgeMultiplier: number;
};

export type StorageInputs = {
  capacityUnit: "ah" | "kwh";
  capacityAh: number;
  capacityKwh: number;
  voltage: number;
  capacityPercent: number;
  chemistry: StorageChemistry;
  startSocPercent: number;
  reserveSocPercent: number;
  targetSocPercent: number;
  inverterEfficiencyPercent: number;
  dischargeEfficiencyPercent: number;
  chargeEfficiencyPercent: number;
  inverterIdleWatts: number;
  inverterContinuousWatts: number;
  inverterSurgeWatts: number;
  batteryDischargeWatts: number;
  batteryChargeWatts: number;
  controllerOutputWatts: number;
  simultaneousStarts: number;
  solarWatts: number;
  peakSunHours: number;
  solarLossPercent: number;
  sunriseHour: number;
  daylightHours: number;
  solarAvailability: SolarAvailability;
  simulationStartHour: number;
  simulationDays: number;
};

export type StorageScenario = { inputs: StorageInputs; loads: StorageLoad[] };
export type StorageIssue = { field: string; message: string };

export function defaultStorageScenario(): StorageScenario {
  return {
    inputs: {
      capacityUnit: "ah", capacityAh: 100, capacityKwh: 4.8, voltage: 48,
      capacityPercent: 100, chemistry: "lifepo4", startSocPercent: 100,
      reserveSocPercent: 20, targetSocPercent: 100,
      inverterEfficiencyPercent: 90, dischargeEfficiencyPercent: 95,
      chargeEfficiencyPercent: 95, inverterIdleWatts: 10,
      inverterContinuousWatts: 0, inverterSurgeWatts: 0,
      batteryDischargeWatts: 0, batteryChargeWatts: 0,
      controllerOutputWatts: 0, simultaneousStarts: 1,
      solarWatts: 1000, peakSunHours: 5, solarLossPercent: 20,
      sunriseHour: 6, daylightHours: 12, solarAvailability: "available",
      simulationStartHour: 18, simulationDays: 3,
    },
    loads: [{ id: "example-essential", name: "Essential appliances", watts: 300,
      quantity: 1, supply: "ac", enabled: true, startHour: 20,
      hoursPerDay: 10, surgeMultiplier: 1 }],
  };
}

const EPS = 1e-7;
const STEP_HOURS = 0.25;
const perDay = 24 / STEP_HOURS;
const fraction = (percent: number) => percent / 100;
const limit = (rating: number) => rating > 0 ? rating : Infinity;

export function validateStorageScenario(scenario: StorageScenario): StorageIssue[] {
  const errors: StorageIssue[] = [];
  const i = scenario.inputs;
  const check = (field: keyof StorageInputs, min: number, max: number, step?: number) => {
    const value = i[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max ||
      (step && Math.abs(value / step - Math.round(value / step)) > EPS)) {
      errors.push({ field, message: `${field}: enter ${min}–${max}${step ? ` in steps of ${step}` : ""}.` });
    }
  };
  if (!["ah", "kwh"].includes(i.capacityUnit)) errors.push({ field: "capacityUnit", message: "Choose Ah or kWh." });
  check("voltage", 1, 1000);
  if (i.capacityUnit === "ah") check("capacityAh", 0.1, 1_000_000);
  else check("capacityKwh", 0.001, 1_000_000);
  check("capacityPercent", 1, 100);
  check("startSocPercent", 0, 100);
  check("reserveSocPercent", 0, 99);
  check("targetSocPercent", 1, 100);
  if (i.targetSocPercent <= i.reserveSocPercent) errors.push({ field: "targetSocPercent", message: "Target charge must be above the reserve." });
  for (const field of ["inverterEfficiencyPercent", "dischargeEfficiencyPercent", "chargeEfficiencyPercent"] as const) check(field, 1, 100);
  for (const field of ["inverterIdleWatts", "inverterContinuousWatts", "inverterSurgeWatts", "batteryDischargeWatts", "batteryChargeWatts", "controllerOutputWatts", "solarWatts"] as const) check(field, 0, 10_000_000);
  check("simultaneousStarts", 1, 10, 1);
  check("peakSunHours", 0, 12);
  check("solarLossPercent", 0, 99);
  check("sunriseHour", 0, 23.75, STEP_HOURS);
  check("daylightHours", 0.25, 24, STEP_HOURS);
  check("simulationStartHour", 0, 23.75, STEP_HOURS);
  check("simulationDays", 1, 7, 1);
  if (i.peakSunHours > i.daylightHours) errors.push({ field: "peakSunHours", message: "Peak sun hours cannot exceed the daylight window in this model." });
  if (!["lifepo4", "lead-acid", "custom"].includes(i.chemistry)) errors.push({ field: "chemistry", message: "Choose a battery chemistry." });
  if (!["available", "unavailable", "unknown"].includes(i.solarAvailability)) errors.push({ field: "solarAvailability", message: "Choose whether solar is available to the backup system." });
  if (!Array.isArray(scenario.loads) || scenario.loads.length > 100) {
    errors.push({ field: "loads", message: "Use no more than 100 appliance rows." });
    return errors;
  }
  const ids = new Set<string>();
  for (const [index, load] of scenario.loads.entries()) {
    const field = `loads.${index}`;
    if (typeof load.id !== "string" || !load.id || ids.has(load.id)) errors.push({ field, message: "Each appliance must have a unique ID." });
    ids.add(load.id);
    if (typeof load.name !== "string" || !load.name.trim() || load.name.length > 120) errors.push({ field, message: `Appliance ${index + 1}: enter a name up to 120 characters.` });
    if (typeof load.enabled !== "boolean" || !["ac", "dc"].includes(load.supply)) errors.push({ field, message: `Appliance ${index + 1}: choose AC or DC and a valid selection.` });
    const values = [load.watts, load.quantity, load.startHour, load.hoursPerDay, load.surgeMultiplier];
    if (values.some((v) => typeof v !== "number" || !Number.isFinite(v)) ||
      load.watts <= 0 || load.watts > 1_000_000 || load.quantity < 1 || load.quantity > 1000 || !Number.isInteger(load.quantity) ||
      load.startHour < 0 || load.startHour >= 24 || load.hoursPerDay < 0 || load.hoursPerDay > 24 ||
      Math.abs(load.startHour * 4 - Math.round(load.startHour * 4)) > EPS ||
      load.surgeMultiplier < 1 || load.surgeMultiplier > 10) {
      errors.push({ field, message: `Appliance ${index + 1}: check watts, whole quantity, quarter-hour start, daily hours (0–24) and starting multiplier (1–10).` });
    }
  }
  if (!scenario.loads.some((load) => load.enabled)) errors.push({ field: "loads", message: "Select at least one appliance." });
  return errors;
}

export type RuntimeResult = {
  nominalWh: number;
  adjustedWh: number;
  storedAboveReserveWh: number;
  usableAtDcBusWh: number;
  acWatts: number;
  dcWatts: number;
  dcBusWatts: number;
  storedEnergyDrawWatts: number;
  estimatedSurgeAcWatts: number;
  capacityOnlyHours: number;
  runtimeHours: number | null;
  violations: string[];
  uncheckedRatings: string[];
};

function capacities(i: StorageInputs) {
  const nominalWh = i.capacityUnit === "ah" ? i.voltage * i.capacityAh : i.capacityKwh * 1000;
  return { nominalWh, adjustedWh: nominalWh * fraction(i.capacityPercent) };
}

export function calculateBatteryRuntime(scenario: StorageScenario): RuntimeResult {
  const errors = validateStorageScenario(scenario);
  if (errors.length) throw new Error(errors.map((e) => e.message).join(" "));
  const i = scenario.inputs;
  const { nominalWh, adjustedWh } = capacities(i);
  const enabled = scenario.loads.filter((load) => load.enabled);
  const acWatts = enabled.filter((load) => load.supply === "ac").reduce((sum, load) => sum + load.watts * load.quantity, 0);
  const dcWatts = enabled.filter((load) => load.supply === "dc").reduce((sum, load) => sum + load.watts * load.quantity, 0);
  const dcBusWatts = acWatts / fraction(i.inverterEfficiencyPercent) + dcWatts + i.inverterIdleWatts;
  const storedEnergyDrawWatts = dcBusWatts / fraction(i.dischargeEfficiencyPercent);
  const storedAboveReserveWh = adjustedWh * Math.max(0, fraction(i.startSocPercent - i.reserveSocPercent));
  const usableAtDcBusWh = storedAboveReserveWh * fraction(i.dischargeEfficiencyPercent);
  const surgeIncrements = enabled.filter((load) => load.supply === "ac")
    .flatMap((load) => Array.from({ length: Math.min(load.quantity, i.simultaneousStarts) }, () => load.watts * (load.surgeMultiplier - 1)))
    .sort((a, b) => b - a);
  const estimatedSurgeAcWatts = acWatts + surgeIncrements.slice(0, i.simultaneousStarts).reduce((sum, n) => sum + n, 0);
  const violations: string[] = [];
  if (acWatts > limit(i.inverterContinuousWatts) + EPS) violations.push("The selected AC running load exceeds the inverter continuous output entered.");
  if (estimatedSurgeAcWatts > limit(i.inverterSurgeWatts) + EPS) violations.push("The estimated AC starting demand exceeds the inverter surge output entered.");
  if (dcBusWatts > limit(i.batteryDischargeWatts) + EPS) violations.push("The required DC output exceeds the battery discharge limit entered.");
  const uncheckedRatings: string[] = [];
  if (acWatts && !i.inverterContinuousWatts) uncheckedRatings.push("Inverter continuous output");
  if (acWatts && !i.inverterSurgeWatts) uncheckedRatings.push("Inverter surge output");
  if (!i.batteryDischargeWatts) uncheckedRatings.push("Battery discharge output");
  const capacityOnlyHours = storedEnergyDrawWatts > 0 ? storedAboveReserveWh / storedEnergyDrawWatts : 0;
  return { nominalWh, adjustedWh, storedAboveReserveWh, usableAtDcBusWh, acWatts, dcWatts, dcBusWatts,
    storedEnergyDrawWatts, estimatedSurgeAcWatts, capacityOnlyHours,
    runtimeHours: violations.length ? null : capacityOnlyHours, violations, uncheckedRatings };
}

export type RecoveryPoint = {
  elapsedHours: number;
  clockHour: number;
  socPercent: number;
};

export type RecoveryDay = {
  day: number;
  solarWh: number;
  demandWh: number;
  servedWh: number;
  unservedWh: number;
  curtailedWh: number;
  controllerClippedWh: number;
  chargeStoredWh: number;
  dischargedStoredWh: number;
  endSocPercent: number;
};

export type RecoveryResult = {
  days: RecoveryDay[];
  points: RecoveryPoint[];
  timeToTargetHours: number | null;
  recoveryAfterUseHours: number | null;
  firstShortfallHours: number | null;
  totalSolarWh: number;
  totalDemandWh: number;
  totalServedWh: number;
  totalUnservedWh: number;
  totalCurtailedWh: number;
  totalLossWh: number;
  totalStandbyWh: number;
  controllerClippedWh: number;
  storedChangeWh: number;
  energyBalanceErrorWh: number;
  minimumSocPercent: number;
  finalSocPercent: number;
  warnings: string[];
};

export function simulateSolarRecovery(scenario: StorageScenario): RecoveryResult {
  const errors = validateStorageScenario(scenario);
  if (errors.length) throw new Error(errors.map((e) => e.message).join(" "));
  const i = scenario.inputs;
  const { adjustedWh } = capacities(i);
  const enabled = scenario.loads.filter((load) => load.enabled);
  const inverterEfficiency = fraction(i.inverterEfficiencyPercent);
  const dischargeEfficiency = fraction(i.dischargeEfficiencyPercent);
  const chargeEfficiency = fraction(i.chargeEfficiencyPercent);
  const reserveWh = adjustedWh * fraction(i.reserveSocPercent);
  const targetWh = adjustedWh * fraction(i.targetSocPercent);
  const initialWh = adjustedWh * fraction(i.startSocPercent);
  let storedWh = initialWh;
  let minimumWh = initialWh;
  let timeToTargetHours: number | null = initialWh >= targetWh - EPS ? 0 : null;
  let recoveryAfterUseHours: number | null = null;
  let hasDischargedBelowTarget = false;
  let firstShortfallHours: number | null = null;
  let totalLossWh = 0;
  let totalStandbyWh = 0;
  const warnings: string[] = [];
  if (i.solarAvailability !== "available") warnings.push(i.solarAvailability === "unknown"
    ? "Solar is excluded because its availability during the outage has not been confirmed."
    : "Solar is excluded for this scenario; the battery receives no solar recharge.");
  if (i.chemistry === "lead-acid") warnings.push("Lead-acid capacity changes with discharge rate. This model does not calculate Peukert effects; use measured capacity for the intended load.");
  if (i.targetSocPercent > 90) warnings.push("Charging near full can taper or enter absorption. The energy-only time to target can be optimistic.");
  if (!i.batteryChargeWatts || !i.controllerOutputWatts) warnings.push("A zero charge-power rating means that limit is not checked. Enter manufacturer limits to model charge clipping.");
  if (!enabled.some((load) => load.hoursPerDay > 0)) warnings.push("All scheduled appliance hours are zero; the recovery plan includes inverter standby only.");
  // A quarter-hour smooth daylight shape is normalized to exactly the entered
  // daily solar energy before controller clipping. It is not observed weather.
  const weights = Array.from({ length: perDay }, (_, index) => {
    const clock = index * STEP_HOURS + STEP_HOURS / 2;
    const fromSunrise = (clock - i.sunriseHour + 24) % 24;
    return fromSunrise < i.daylightHours ? Math.sin(Math.PI * fromSunrise / i.daylightHours) : 0;
  });
  const weightHours = weights.reduce((sum, n) => sum + n * STEP_HOURS, 0);
  const potentialDailyWh = i.solarAvailability === "available" ? i.solarWatts * i.peakSunHours * (1 - fraction(i.solarLossPercent)) : 0;
  const points: RecoveryPoint[] = [{ elapsedHours: 0, clockHour: i.simulationStartHour, socPercent: i.startSocPercent }];
  const days: RecoveryDay[] = [];
  for (let dayIndex = 0; dayIndex < i.simulationDays; dayIndex++) {
    const day: RecoveryDay = { day: dayIndex + 1, solarWh: 0, demandWh: 0, servedWh: 0,
      unservedWh: 0, curtailedWh: 0, controllerClippedWh: 0, chargeStoredWh: 0,
      dischargedStoredWh: 0, endSocPercent: 0 };
    for (let slot = 0; slot < perDay; slot++) {
      const elapsed = (dayIndex * perDay + slot) * STEP_HOURS;
      const clock = (i.simulationStartHour + elapsed) % 24;
      let acWatts = 0;
      let dcWatts = 0;
      for (const load of enabled) {
        // Integrate overlap rather than rounding imported fractional hours.
        const overlapHours = [-24, 0, 24].reduce((sum, shift) => sum + Math.max(0,
          Math.min(clock + STEP_HOURS, load.startHour + shift + load.hoursPerDay)
          - Math.max(clock, load.startHour + shift)), 0);
        const averageWatts = load.watts * load.quantity * overlapHours / STEP_HOURS;
        if (load.supply === "ac") acWatts += averageWatts;
        else dcWatts += averageWatts;
      }
      const allowedAcWatts = Math.min(acWatts, limit(i.inverterContinuousWatts));
      const demandBusWatts = allowedAcWatts / inverterEfficiency + dcWatts + i.inverterIdleWatts;
      const potentialSolarWatts = weightHours > 0 ? potentialDailyWh * weights[Math.round(clock / STEP_HOURS) % perDay] / weightHours : 0;
      const solarWatts = Math.min(potentialSolarWatts, limit(i.controllerOutputWatts));
      const directSolarWatts = Math.min(solarWatts, demandBusWatts);
      const deficitWatts = demandBusWatts - directSolarWatts;
      const storedBeforeWh = storedWh;
      const availableBusWh = Math.max(0, storedWh - reserveWh) * dischargeEfficiency;
      const batteryOutputWatts = Math.min(deficitWatts, limit(i.batteryDischargeWatts), availableBusWh / STEP_HOURS);
      const dischargeStoredWh = batteryOutputWatts * STEP_HOURS / dischargeEfficiency;
      storedWh -= dischargeStoredWh;
      if (dischargeStoredWh > EPS && storedWh < targetWh - EPS) hasDischargedBelowTarget = true;
      const servedRatio = demandBusWatts > 0 ? Math.min(1, (directSolarWatts + batteryOutputWatts) / demandBusWatts) : 1;
      const servedAcWatts = allowedAcWatts * servedRatio;
      const servedDcWatts = dcWatts * servedRatio;
      const standbyWh = i.inverterIdleWatts * servedRatio * STEP_HOURS;
      const demandWh = (acWatts + dcWatts) * STEP_HOURS;
      const servedWh = (servedAcWatts + servedDcWatts) * STEP_HOURS;
      const unservedWh = Math.max(0, demandWh - servedWh);
      if (firstShortfallHours === null && unservedWh > EPS) {
        const immediatelyLimited = acWatts > allowedAcWatts + EPS || deficitWatts > limit(i.batteryDischargeWatts) + EPS;
        firstShortfallHours = elapsed + (immediatelyLimited || deficitWatts <= EPS ? 0 : Math.min(STEP_HOURS, availableBusWh / deficitWatts));
      }
      const solarSurplusWatts = Math.max(0, solarWatts - directSolarWatts);
      const chargingInputWatts = Math.min(solarSurplusWatts, limit(i.batteryChargeWatts),
        Math.max(0, targetWh - storedWh) / chargeEfficiency / STEP_HOURS);
      const chargeStoredWh = chargingInputWatts * STEP_HOURS * chargeEfficiency;
      storedWh = Math.min(adjustedWh, storedWh + chargeStoredWh);
      if (timeToTargetHours === null && storedWh >= targetWh - EPS && chargingInputWatts > EPS) {
        timeToTargetHours = elapsed + Math.max(0, targetWh - storedBeforeWh) / (chargingInputWatts * chargeEfficiency);
      }
      if (hasDischargedBelowTarget && recoveryAfterUseHours === null && storedWh >= targetWh - EPS && chargingInputWatts > EPS) {
        recoveryAfterUseHours = elapsed + Math.max(0, targetWh - storedBeforeWh) / (chargingInputWatts * chargeEfficiency);
      }
      minimumWh = Math.min(minimumWh, storedWh);
      totalLossWh += servedAcWatts * (1 / inverterEfficiency - 1) * STEP_HOURS
        + dischargeStoredWh - batteryOutputWatts * STEP_HOURS
        + chargingInputWatts * STEP_HOURS - chargeStoredWh;
      totalStandbyWh += standbyWh;
      day.solarWh += solarWatts * STEP_HOURS;
      day.demandWh += demandWh;
      day.servedWh += servedWh;
      day.unservedWh += unservedWh;
      day.curtailedWh += (solarSurplusWatts - chargingInputWatts) * STEP_HOURS;
      day.controllerClippedWh += (potentialSolarWatts - solarWatts) * STEP_HOURS;
      day.chargeStoredWh += chargeStoredWh;
      day.dischargedStoredWh += dischargeStoredWh;
      points.push({ elapsedHours: elapsed + STEP_HOURS, clockHour: (clock + STEP_HOURS) % 24, socPercent: storedWh / adjustedWh * 100 });
    }
    day.endSocPercent = storedWh / adjustedWh * 100;
    days.push(day);
  }
  const sum = (key: keyof Pick<RecoveryDay, "solarWh" | "demandWh" | "servedWh" | "unservedWh" | "curtailedWh" | "controllerClippedWh">) => days.reduce((acc, day) => acc + day[key], 0);
  const storedChangeWh = storedWh - initialWh;
  return { days, points, timeToTargetHours, recoveryAfterUseHours, firstShortfallHours,
    totalSolarWh: sum("solarWh"), totalDemandWh: sum("demandWh"), totalServedWh: sum("servedWh"),
    totalUnservedWh: sum("unservedWh"), totalCurtailedWh: sum("curtailedWh"), totalLossWh,
    totalStandbyWh, controllerClippedWh: sum("controllerClippedWh"), storedChangeWh,
    energyBalanceErrorWh: sum("solarWh") - sum("servedWh") - totalStandbyWh - totalLossWh - sum("curtailedWh") - storedChangeWh,
    minimumSocPercent: minimumWh / adjustedWh * 100, finalSocPercent: storedWh / adjustedWh * 100, warnings };
}
