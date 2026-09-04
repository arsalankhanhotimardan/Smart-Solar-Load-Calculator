import "server-only";
import { neon } from "@neondatabase/serverless";
import { unstable_cache } from "next/cache";

const databaseUrl = process.env.DATABASE_URL;

const getSql = () => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return neon(databaseUrl);
};

const cachedDomestic = unstable_cache(
  async () => {
    const sql = getSql();
    return sql`SELECT * FROM domestic_appliances ORDER BY id ASC`;
  },
  ["solar-domestic-appliances-v2"],
  { revalidate: 3600, tags: ["solar-catalog"] }
);

const cachedCommercial = unstable_cache(
  async () => {
    const sql = getSql();
    return sql`SELECT * FROM commercial_appliances ORDER BY id ASC`;
  },
  ["solar-commercial-appliances-v2"],
  { revalidate: 3600, tags: ["solar-catalog"] }
);

const cachedPanels = unstable_cache(
  async () => {
    const sql = getSql();
    return sql`SELECT * FROM solar_panel_catalog ORDER BY wattage ASC`;
  },
  ["solar-panel-catalog-v2"],
  { revalidate: 3600, tags: ["solar-catalog"] }
);

const cachedSolarRate = unstable_cache(
  async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT price_pkr
      FROM market_rates
      WHERE item_name = 'solar_panel_per_watt'
      LIMIT 1
    `;
    if (!rows.length) return null;
    const price = Number(rows[0].price_pkr);
    if (!Number.isFinite(price) || price < 0) return null;
    return {
      pricePkrPerWatt: price,
      updatedAt: null,
    };
  },
  ["solar-market-rate-v2"],
  { revalidate: 21600, tags: ["solar-market-rate"] }
);

export async function getDomesticAppliances() {
  try {
    return await cachedDomestic();
  } catch (error) {
    console.error("Failed to fetch domestic appliances:", error);
    return [];
  }
}

export async function getCommercialAppliances() {
  try {
    return await cachedCommercial();
  } catch (error) {
    console.error("Failed to fetch commercial appliances:", error);
    return [];
  }
}

export async function getSolarPanelCatalog() {
  try {
    return await cachedPanels();
  } catch (error) {
    console.error("Failed to fetch solar panel catalog:", error);
    return [];
  }
}

export async function getSolarRate() {
  try {
    return await cachedSolarRate();
  } catch (error) {
    console.error("Failed to fetch solar market rate:", error);
    return null;
  }
}
