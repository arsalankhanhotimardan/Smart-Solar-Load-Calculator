import type { Metadata } from "next";
import SolarStorageToolPage from "../components/SolarStorageToolPage";

const url = "https://solarcalculator.greenengineeringtools.com/solar-battery-charging-time-calculator";
export const metadata: Metadata = {
  title: "Solar Battery Charging Time Calculator | Loads & Recharge",
  description: "Plan solar battery recharge while appliances run. Compare day and night loads, charging limits, battery reserve and energy shortfalls over a daily schedule. Free, no signup.",
  alternates: { canonical: url },
  openGraph: { title: "Solar Battery Charging Time Calculator", description: "See whether your panels can recharge your battery while powering daytime and overnight loads.", url, type: "website" },
  twitter: { card: "summary", title: "Solar Battery Charging Time Calculator", description: "Estimate solar recharge with appliance schedules, charging limits and daily energy balance.", images: [] },
};

export default function SolarRechargePage() { return <SolarStorageToolPage mode="recharge" />; }
