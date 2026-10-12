/**
 * Quick sizing maths for the "units to solar" wizard and the city / usage pages.
 *
 * The assumptions deliberately match solar-engine.ts so that every page on the
 * site gives the same answer for the same inputs:
 *   - 14% PV system losses
 *   - 96% inverter efficiency
 *   - target DC/AC ratio 1.2, inverter rounded up to 0.5 kW
 *   - 15% roof access/spacing allowance
 *   - LiFePO4 profile: 90% depth of discharge, 95% battery efficiency
 */

export const SYSTEM_LOSS = 0.14;
export const INVERTER_EFFICIENCY = 0.96;
export const COMBINED_EFFICIENCY = (1 - SYSTEM_LOSS) * INVERTER_EFFICIENCY; // 0.8256
export const TARGET_DC_AC = 1.2;
export const ROOF_SPACING = 0.15;
export const DAYS_PER_MONTH = 30;

export const BATTERY_PROFILES = {
  lifepo4: { label: "LiFePO₄", dod: 0.9, efficiency: 0.95 },
  "lead-acid": { label: "Lead-acid / AGM", dod: 0.5, efficiency: 0.85 },
} as const;
export type BatteryChemistry = keyof typeof BATTERY_PROFILES;

/** Typical module footprint per watt, used when the catalogue has no dimensions (2.28 m × 1.13 m at 550 W). */
export const AREA_PER_WATT = (2.28 * 1.13) / 550;

const roundUp = (value: number, step: number) => (value > 0 ? Math.ceil(value / step - 1e-9) * step : 0);

export type UnitsToSolarInput = {
  monthlyUnits: number;
  peakSunHours: number;
  panelWatts: number;
  panelAreaM2?: number | null;
  systemType: "on-grid" | "hybrid";
  backupLoadKw?: number;
  backupHours?: number;
  chemistry?: BatteryChemistry;
  batteryVoltage?: number;
};

export type UnitsToSolarResult = {
  dailyKwh: number;
  requiredKw: number;
  panels: number;
  installedKw: number;
  monthlyProductionKwh: number;
  coveragePercent: number;
  inverterKw: number;
  roofAreaM2: number;
  batteryUsableKwh: number;
  batteryNominalKwh: number;
  batteryAh: number;
};

export function unitsToSolar(input: UnitsToSolarInput): UnitsToSolarResult | null {
  const { monthlyUnits, peakSunHours, panelWatts } = input;
  if (![monthlyUnits, peakSunHours, panelWatts].every(Number.isFinite)) return null;
  if (monthlyUnits <= 0 || peakSunHours < 1 || peakSunHours > 8 || panelWatts <= 0) return null;

  const dailyKwh = monthlyUnits / DAYS_PER_MONTH;
  const requiredKw = dailyKwh / (peakSunHours * COMBINED_EFFICIENCY);
  const panels = Math.max(1, Math.ceil((requiredKw * 1000) / panelWatts - 1e-9));
  const installedKw = (panels * panelWatts) / 1000;
  const monthlyProductionKwh = installedKw * peakSunHours * COMBINED_EFFICIENCY * DAYS_PER_MONTH;
  const area = input.panelAreaM2 && input.panelAreaM2 > 0 ? input.panelAreaM2 : panelWatts * AREA_PER_WATT;
  const inverterKw = roundUp(requiredKw / TARGET_DC_AC, 0.5);

  let batteryUsableKwh = 0;
  let batteryNominalKwh = 0;
  let batteryAh = 0;
  if (input.systemType === "hybrid") {
    const profile = BATTERY_PROFILES[input.chemistry ?? "lifepo4"];
    batteryUsableKwh = Math.max(0, (input.backupLoadKw ?? 0) * (input.backupHours ?? 0));
    batteryNominalKwh = batteryUsableKwh / (profile.dod * profile.efficiency * INVERTER_EFFICIENCY);
    const volts = input.batteryVoltage && input.batteryVoltage > 0 ? input.batteryVoltage : 48;
    batteryAh = (batteryNominalKwh * 1000) / volts;
  }

  return {
    dailyKwh,
    requiredKw,
    panels,
    installedKw,
    monthlyProductionKwh,
    coveragePercent: (monthlyProductionKwh / monthlyUnits) * 100,
    inverterKw,
    roofAreaM2: panels * area * (1 + ROOF_SPACING),
    batteryUsableKwh,
    batteryNominalKwh,
    batteryAh,
  };
}

/** kWh per month from an installed DC array at a given peak-sun-hour value. */
export const monthlyProduction = (kw: number, peakSunHours: number) => kw * peakSunHours * COMBINED_EFFICIENCY * DAYS_PER_MONTH;

/** DC array (kW) needed for a monthly consumption. */
export const requiredKwForUnits = (monthlyUnits: number, peakSunHours: number) => monthlyUnits / DAYS_PER_MONTH / (peakSunHours * COMBINED_EFFICIENCY);

export const panelsFor = (kw: number, panelWatts: number) => Math.max(1, Math.ceil((kw * 1000) / panelWatts - 1e-9));

/** Simple payback: system cost ÷ yearly bill savings. Null unless both are positive. */
export function paybackYears(systemCost: number, annualSavings: number): number | null {
  if (!(systemCost > 0) || !(annualSavings > 0)) return null;
  return systemCost / annualSavings;
}

export const fmt = (value: number, digits = 1) => value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
