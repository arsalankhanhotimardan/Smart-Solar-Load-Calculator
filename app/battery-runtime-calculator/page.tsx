import type { Metadata } from "next";
import SolarStorageToolPage from "../components/SolarStorageToolPage";

const url = "https://solarcalculator.greenengineeringtools.com/battery-runtime-calculator";
export const metadata: Metadata = {
  title: "Battery Runtime Calculator | Ah, kWh & Appliance Backup",
  description: "Estimate how long your existing battery can power appliances. Enter Ah and voltage or kWh, battery reserve, inverter losses and equipment power limits. Free, no signup.",
  alternates: { canonical: url },
  openGraph: { title: "Battery Runtime Calculator", description: "Calculate appliance backup from the battery you own, with reserve and losses included.", url, type: "website" },
  twitter: { card: "summary", title: "Battery Runtime Calculator", description: "Estimate battery backup for your appliances with adjustable reserve, losses and power limits.", images: [] },
};

export default function BatteryRuntimePage() { return <SolarStorageToolPage mode="runtime" />; }
