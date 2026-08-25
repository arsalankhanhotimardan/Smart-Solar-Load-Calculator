"use server";

import { neon } from '@neondatabase/serverless';

export async function getSolarRate() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT price_pkr FROM market_rates WHERE item_name = 'solar_panel_per_watt' LIMIT 1`;
    if (rows.length > 0) {
      return Number(rows[0].price_pkr);
    }
  } catch (error) {
    console.error("Neon error:", error);
  }
  return 41; // Safe fallback market rate
}

export async function getDomesticAppliances() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM domestic_appliances ORDER BY id ASC`;
    return rows;
  } catch (error) {
    console.error("Failed to fetch domestic appliances:", error);
    return [];
  }
}


export async function getSolarPanelCatalog() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM solar_panel_catalog ORDER BY wattage ASC`;
    return rows;
  } catch (error) {
    console.error("Failed to fetch solar panels:", error);
    return [];
  }
}



export async function getCommercialAppliances() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM commercial_appliances ORDER BY id ASC`;
    return rows;
  } catch (error) {
    console.error("Failed to fetch commercial appliances:", error);
    return [];
  }
}