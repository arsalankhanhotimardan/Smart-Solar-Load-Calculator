import { getSolarPanelCatalog, getSolarRate } from "../actions";
import type { PanelOption } from "../components/UnitsToSolarWizard";

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Panel catalogue from the database mapped to wizard options. Empty when the database is unavailable. */
export async function getPanelOptions(): Promise<PanelOption[]> {
  const rows = (await getSolarPanelCatalog()) as Record<string, unknown>[];
  return rows
    .map((row): PanelOption | null => {
      const watts = toNum(row.wattage);
      if (!watts || watts <= 0) return null;
      const length = toNum(row.length_meters);
      const width = toNum(row.width_meters);
      return {
        id: String(row.id),
        label: `${String(row.model_name ?? "Panel")} — ${watts} W`,
        watts,
        areaM2: length && width ? length * width : null,
      };
    })
    .filter((p): p is PanelOption => p !== null);
}

export async function getPanelRatePkrPerWatt(): Promise<number | null> {
  const rate = await getSolarRate();
  return rate && rate.pricePkrPerWatt > 0 ? rate.pricePkrPerWatt : null;
}
