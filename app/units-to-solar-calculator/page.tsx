import type { Metadata } from "next";
import Link from "next/link";
import SolarPageShell from "../components/SolarPageShell";
import UnitsToSolarWizard from "../components/UnitsToSolarWizard";
import NetBillingNote from "../components/NetBillingNote";
import { getPanelOptions, getPanelRatePkrPerWatt } from "../lib/solar-data";
import { AVERAGE_PSH, CITY_OPTIONS, UNIT_LEVELS, unitsSlug } from "../lib/solar-cities";
import { COMBINED_EFFICIENCY, fmt, monthlyProduction, panelsFor, requiredKwForUnits } from "../lib/solar-quick";

export const revalidate = 3600;

const path = "/units-to-solar-calculator";

export const metadata: Metadata = {
  title: "Units to Solar Calculator | Monthly Bill to Solar System Size",
  description:
    "Turn your monthly electricity units into a solar system size. Get panels, inverter, battery and roof area for your city in Pakistan from your bill, free with no signup.",
  alternates: { canonical: `https://solarcalculator.greenengineeringtools.com${path}` },
  openGraph: {
    title: "Units to Solar Calculator",
    description: "Enter your monthly electricity units and city to get the solar panels, inverter and battery you need.",
    url: `https://solarcalculator.greenengineeringtools.com${path}`,
    type: "website",
  },
};

const SIZES = [1, 2, 3, 5, 7.5, 10, 15, 20];

export default async function UnitsToSolarPage() {
  const [panels, rate] = await Promise.all([getPanelOptions(), getPanelRatePkrPerWatt()]);

  const faqs = [
    {
      q: "How do I convert my electricity units to a solar system size?",
      a: `Divide your monthly units by 30 to get units per day, then divide by the peak sun hours and the system efficiency. At ${AVERAGE_PSH} peak sun hours and ${fmt(COMBINED_EFFICIENCY * 100, 1)}% efficiency, 500 units a month needs about ${fmt(requiredKwForUnits(500, AVERAGE_PSH), 1)} kW of panels.`,
    },
    {
      q: "How many units does a 5 kW solar system produce per month?",
      a: `At ${AVERAGE_PSH} peak sun hours a 5 kW array produces about ${fmt(monthlyProduction(5, AVERAGE_PSH), 0)} units a month on average, more in summer and less in winter.`,
    },
    {
      q: "How many solar panels do I need for 500 units?",
      a: `About ${panelsFor(requiredKwForUnits(500, AVERAGE_PSH), 550)} panels of 550 W at ${AVERAGE_PSH} peak sun hours. The wizard above recalculates for your city and panel size.`,
    },
    {
      q: "Do I need a battery?",
      a: "Only if you want backup during outages or to use solar at night. An on-grid system without a battery is the cheapest option but stops working when the grid is down, because standard grid-tie inverters shut off for safety.",
    },
    {
      q: "Why does the answer depend on the city?",
      a: "Cities receive different amounts of sunshine. More sun hours mean fewer panels for the same units. The calculator pre-fills a planning value for each city and lets you change it.",
    },
    {
      q: "Is the result a quotation?",
      a: "No. It is a planning estimate. Get a site survey and written quotation from a qualified installer, who will check roof space, shading, wiring and inverter compatibility.",
    },
  ];

  return (
    <SolarPageShell
      title="Units to Solar Calculator"
      eyebrow="Monthly bill → solar system size"
      intro="Enter the units on your electricity bill and your city. The calculator shows the solar array, number of panels, inverter size, battery and roof area you need to cover your usage."
      description="Free calculator that converts monthly electricity units (kWh) into solar panel count, array size, inverter, battery and roof area for Pakistani cities."
      path={path}
      crumbs={[]}
      tool={<UnitsToSolarWizard cities={CITY_OPTIONS} panels={panels} panelRatePkrPerWatt={rate} defaultPsh={AVERAGE_PSH} />}
      faqs={faqs}
      related={[
        { href: "/", title: "Full solar load calculator" },
        { href: "/battery-runtime-calculator", title: "Battery runtime calculator" },
        { href: "/solar-battery-charging-time-calculator", title: "Solar battery charging time" },
        { href: "/solar-calculator", title: "Solar calculator by city" },
        { href: "/system-size/5kw", title: "5 kW solar system guide" },
        { href: "/methodology", title: "Calculation methodology" },
      ]}
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">How units become kilowatts</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
          A &ldquo;unit&rdquo; on your bill is one kilowatt-hour. The calculator works backwards from the units you use each month to the panels that will produce the same energy:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-300">
          <li>Units per day = monthly units ÷ 30.</li>
          <li>Array kW = units per day ÷ (peak sun hours × system efficiency of {fmt(COMBINED_EFFICIENCY * 100, 1)}%).</li>
          <li>Panels = array watts ÷ panel watts, rounded up.</li>
          <li>Inverter kW = array kW ÷ 1.2 (typical DC/AC ratio), rounded up to the next 0.5 kW.</li>
        </ol>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">Monthly units and the solar system they need</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">At the national planning average of {AVERAGE_PSH} peak sun hours, with 550 W panels. Open a row for city-by-city numbers.</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-200">
              <tr>
                <th className="px-4 py-3">Monthly units</th>
                <th className="px-4 py-3">Array needed</th>
                <th className="px-4 py-3">550 W panels</th>
                <th className="px-4 py-3">Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {UNIT_LEVELS.map((u) => {
                const kw = requiredKwForUnits(u, AVERAGE_PSH);
                return (
                  <tr key={u}>
                    <td className="px-4 py-3 font-black text-sky-300">{u.toLocaleString("en-US")} units</td>
                    <td className="px-4 py-3 text-white">{fmt(kw, 1)} kW</td>
                    <td className="px-4 py-3">{panelsFor(kw, 550)}</td>
                    <td className="px-4 py-3"><Link href={`/solar-system-for/${unitsSlug(u)}`} className="font-bold text-sky-400 underline underline-offset-2">Solar for {u} units →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">How many units does a solar system produce?</h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-200">
              <tr>
                <th className="px-4 py-3">System size</th>
                <th className="px-4 py-3">Units per day</th>
                <th className="px-4 py-3">Units per month</th>
                <th className="px-4 py-3">Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {SIZES.map((kw) => (
                <tr key={kw}>
                  <td className="px-4 py-3 font-black text-sky-300">{kw} kW</td>
                  <td className="px-4 py-3">{fmt(monthlyProduction(kw, AVERAGE_PSH) / 30, 1)}</td>
                  <td className="px-4 py-3 text-white">{fmt(monthlyProduction(kw, AVERAGE_PSH), 0)}</td>
                  <td className="px-4 py-3">
                    {[3, 5, 10, 15, 20].includes(kw) ? <Link href={`/system-size/${String(kw).replace(".", "-")}kw`} className="font-bold text-sky-400 underline underline-offset-2">{kw} kW guide →</Link> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Planning averages at {AVERAGE_PSH} peak sun hours. Summer months produce more and winter months less.</p>
      </section>

      <NetBillingNote />
    </SolarPageShell>
  );
}
