import {
  defaultStorageScenario,
  validateStorageScenario,
  type StorageScenario,
  type StorageLoad,
} from "./solar-storage-engine";
import type { SolarAppliance } from "./solar-engine";

export const STORAGE_WORKSPACE_KEY = "greenengineering-storage-planner-v1";
export const LOAD_HANDOFF_KEY = "greenengineering-solar-load-handoff-v1";

export type LoadHandoff = {
  version: 1;
  loads: SolarAppliance[];
  inverterEfficiencyPercent: number;
  batteryVoltage: number;
  simultaneousStarts: number;
  unknownMotorSurgeMultiplier: number;
};

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/** Reject stale/corrupt storage. Never coerce null, blank or non-finite numbers. */
export function decodeStorageWorkspace(raw: string): StorageScenario | null {
  if (raw.length > 150_000) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!object(parsed) || parsed.version !== 1 || !object(parsed.scenario)) return null;
    const candidate = parsed.scenario;
    if (!object(candidate.inputs) || !Array.isArray(candidate.loads) || candidate.loads.some((load) => !object(load))) return null;
    const scenario = candidate as unknown as StorageScenario;
    return validateStorageScenario(scenario).length ? null : scenario;
  } catch { return null; }
}

export function encodeStorageWorkspace(scenario: StorageScenario): string {
  return JSON.stringify({ version: 1, scenario });
}

export function scenarioFromHandoff(raw: string): StorageScenario | null {
  if (raw.length > 150_000) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!object(parsed) || parsed.version !== 1 || !Array.isArray(parsed.loads) || !parsed.loads.length || parsed.loads.length > 100) return null;
    const scenario = defaultStorageScenario();
    const numeric = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
    scenario.loads = parsed.loads.map((row, index): StorageLoad => {
      if (!object(row) || typeof row.name !== "string" || !numeric(row.watts) || !numeric(row.quantity) || !numeric(row.hoursPerDay)) throw new Error("Invalid appliance");
      const inferredMotor = /\b(ac|air ?condition|compressor|pump|motor|refrigerator|fridge|freezer|chiller|elevator|lift|washing|washer|hvac|blower)\b/i.test(`${row.name} ${row.category || ""}`);
      const surgeMultiplier = numeric(row.surgeWatts) && row.surgeWatts > row.watts ? row.surgeWatts / row.watts
        : numeric(row.surgeMultiplier) && row.surgeMultiplier > 1 ? row.surgeMultiplier
        : inferredMotor && numeric(parsed.unknownMotorSurgeMultiplier) ? parsed.unknownMotorSurgeMultiplier : 1;
      return { id: `imported-${index}`, name: row.name, watts: row.watts, quantity: row.quantity,
        supply: "ac", enabled: true, startHour: row.hoursPerDay <= 12 ? 18 : 0,
        hoursPerDay: row.hoursPerDay, surgeMultiplier };
    });
    if (numeric(parsed.inverterEfficiencyPercent)) scenario.inputs.inverterEfficiencyPercent = parsed.inverterEfficiencyPercent;
    if (numeric(parsed.batteryVoltage)) scenario.inputs.voltage = parsed.batteryVoltage;
    if (numeric(parsed.simultaneousStarts)) scenario.inputs.simultaneousStarts = parsed.simultaneousStarts;
    // Sizing recommendations are not equipment the user owns. Do not import
    // recommended battery/PV sizes or ratings as if they were installed facts.
    scenario.inputs.solarAvailability = "unknown";
    return validateStorageScenario(scenario).length ? null : scenario;
  } catch { return null; }
}
