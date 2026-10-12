import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SolarPageShell from "../../components/SolarPageShell";
import UnitsToSolarWizard from "../../components/UnitsToSolarWizard";
import NetBillingNote from "../../components/NetBillingNote";
import { getPanelOptions, getPanelRatePkrPerWatt } from "../../lib/solar-data";
import { AVERAGE_PSH, CITIES, CITY_OPTIONS, SITE, UNIT_LEVELS, unitsFromSlug, unitsSlug } from "../../lib/solar-cities";
import { BATTERY_PROFILES, COMBINED_EFFICIENCY, INVERTER_EFFICIENCY, fmt, panelsFor, requiredKwForUnits, unitsToSolar } from "../../lib/solar-quick";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return UNIT_LEVELS.map((u) => ({ slug: unitsSlug(u) }));
}

type Props = { params: Promise<{ slug: string }> };

const PANEL_SIZES = [450, 550, 585, 620, 700];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const units = unitsFromSlug(slug);
  if (!units) return {};
  const kw = requiredKwForUnits(units, AVERAGE_PSH);
  const url = `${SITE}/solar-system-for/${slug}`;
  return {
    title: `Solar System for ${units.toLocaleString("en-US")} Units per Month: Size, Panels & Battery`,
    description: `A home using ${units.toLocaleString("en-US")} units a month needs about ${fmt(kw, 1)} kW of solar, or ${panelsFor(kw, 550)} panels of 550 W. See city-by-city sizing, inverter, roof area and battery backup.`,
    alternates: { canonical: url },
    openGraph: { title: `Solar system for ${units} units per month`, description: `Panels, inverter and battery for ${units} units a month.`, url, type: "article" },
  };
}

export default async function SolarForUnitsPage({ params }: Props) {
  const { slug } = await params;
  const units = unitsFromSlug(slug);
  if (!units) notFound();

  const [panels, rate] = await Promise.all([getPanelOptions(), getPanelRatePkrPerWatt()]);
  const base = unitsToSolar({ monthlyUnits: units, peakSunHours: AVERAGE_PSH, panelWatts: 550, systemType: "on-grid" })!;
  const avgKw = units / 720; // average continuous load over a 30-day month
  const batteryNominal = (avgKw * 4) / (BATTERY_PROFILES.lifepo4.dod * BATTERY_PROFILES.lifepo4.efficiency * INVERTER_EFFICIENCY);
  const kwRange = CITIES.map((c) => requiredKwForUnits(units, c.avgPeakSunHours));
  const kwMin = Math.min(...kwRange);
  const kwMax = Math.max(...kwRange);
  const idx = UNIT_LEVELS.indexOf(units as (typeof UNIT_LEVELS)[number]);
  const neighbours = [UNIT_LEVELS[idx - 1], UNIT_LEVELS[idx + 1]].filter((u): u is (typeof UNIT_LEVELS)[number] => u !== undefined);

  const faqs = [
    {
      q: `What size solar system do I need for ${units} units per month?`,
      a: `About ${fmt(base.requiredKw, 1)} kW of panels at ${AVERAGE_PSH} peak sun hours. Depending on the city (${Math.min(...CITIES.map((c) => c.avgPeakSunHours))} to ${Math.max(...CITIES.map((c) => c.avgPeakSunHours))} sun hours in the dataset) it ranges from ${fmt(kwMin, 1)} kW to ${fmt(kwMax, 1)} kW. Installers usually round up to the next standard size.`,
    },
    {
      q: `How many solar panels are needed for ${units} units?`,
      a: `${base.panels} panels of 550 W (${fmt(base.installedKw, 2)} kWp installed) at the national average. With 620 W panels it is ${panelsFor(base.requiredKw, 620)} panels; with 450 W panels it is ${panelsFor(base.requiredKw, 450)}.`,
    },
    {
      q: `What inverter size suits a ${units}-unit solar system?`,
      a: `Around ${fmt(base.inverterKw, 1)} kW, from the array size divided by a typical DC/AC ratio of 1.2. The inverter must also cover your peak simultaneous load and motor starting surge, so check your appliances with the load calculator.`,
    },
    {
      q: `How much roof space does it need?`,
      a: `About ${fmt(base.roofAreaM2, 0)} m² (${fmt(base.roofAreaM2 * 10.7639, 0)} sq ft) for ${base.panels} panels of 550 W, including a 15% allowance for access and spacing.`,
    },
    {
      q: `How big a battery do I need for ${units} units a month?`,
      a: `${units} units a month is an average load of about ${fmt(avgKw, 2)} kW. Running that average load for 4 hours takes roughly ${fmt(batteryNominal, 1)} kWh of LiFePO₄ battery. Most homes back up only essential loads, which needs far less. Use the wizard to size your own backup.`,
    },
    {
      q: `Will the system cover all ${units} units every month?`,
      a: `On average yes, because it is sized to offset ${units} units. Summer months produce more than the average and winter months less, so you may export surplus in summer and import some units in winter.`,
    },
  ];

  return (
    <SolarPageShell
      title={`Solar System for ${units.toLocaleString("en-US")} Units per Month`}
      eyebrow={`${units.toLocaleString("en-US")} units • panels • inverter • battery`}
      intro={`A home or shop using ${units.toLocaleString("en-US")} units a month needs about ${fmt(base.requiredKw, 1)} kW of solar at the national average of ${AVERAGE_PSH} peak sun hours. Check your city below, then adjust the wizard for your panel size and backup needs.`}
      description={`Solar system size, panel count, inverter, roof area and battery for ${units} units of electricity per month in Pakistan.`}
      path={`/solar-system-for/${slug}`}
      crumbs={[{ label: "Units to solar", href: "/units-to-solar-calculator" }]}
      tool={<UnitsToSolarWizard initialUnits={units} cities={CITY_OPTIONS} panels={panels} panelRatePkrPerWatt={rate} defaultPsh={AVERAGE_PSH} />}
      faqs={faqs}
      related={[
        { href: "/units-to-solar-calculator", title: "Units to solar calculator" },
        ...neighbours.map((u) => ({ href: `/solar-system-for/${unitsSlug(u)}`, title: `Solar system for ${u} units` })),
        { href: "/", title: "Full solar load calculator" },
        { href: "/battery-runtime-calculator", title: "Battery runtime calculator" },
        { href: "/solar-calculator", title: "Solar calculator by city" },
      ]}
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">Quick answer for {units.toLocaleString("en-US")} units</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Array", `${fmt(base.requiredKw, 1)} kW`],
            ["Panels (550 W)", String(base.panels)],
            ["Inverter", `${fmt(base.inverterKw, 1)} kW`],
            ["Roof area", `${fmt(base.roofAreaM2, 0)} m²`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Calculation: {units} ÷ 30 = {fmt(base.dailyKwh, 1)} units per day; {fmt(base.dailyKwh, 1)} ÷ ({AVERAGE_PSH} × {COMBINED_EFFICIENCY.toFixed(4)}) = {fmt(base.requiredKw, 2)} kW. The {COMBINED_EFFICIENCY.toFixed(4)} factor combines 14% system losses with 96% inverter efficiency.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">Panels needed for {units.toLocaleString("en-US")} units by panel size</h2>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-200">
              <tr>
                <th className="px-4 py-3">Panel</th>
                <th className="px-4 py-3">Panels</th>
                <th className="px-4 py-3">Installed array</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {PANEL_SIZES.map((w) => {
                const n = panelsFor(base.requiredKw, w);
                return (
                  <tr key={w}>
                    <td className="px-4 py-3 font-black text-sky-300">{w} W</td>
                    <td className="px-4 py-3 text-white">{n}</td>
                    <td className="px-4 py-3">{fmt((n * w) / 1000, 2)} kWp</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">{units.toLocaleString("en-US")} units: solar size by city</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">Sunnier cities need a smaller array for the same units. Peak sun hours are planning averages from the site&apos;s city dataset, not measured values.</p>
        <div className="mt-5 max-h-[34rem] overflow-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-950 text-slate-200">
              <tr>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Sun hours</th>
                <th className="px-4 py-3">Array</th>
                <th className="px-4 py-3">550 W panels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {CITIES.map((c) => {
                const kw = requiredKwForUnits(units, c.avgPeakSunHours);
                return (
                  <tr key={c.slug}>
                    <td className="px-4 py-3"><Link href={`/solar-calculator/${c.slug}`} className="font-bold text-sky-400 underline underline-offset-2">{c.name}</Link></td>
                    <td className="px-4 py-3">{c.avgPeakSunHours}</td>
                    <td className="px-4 py-3 text-white">{fmt(kw, 1)} kW</td>
                    <td className="px-4 py-3">{panelsFor(kw, 550)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <NetBillingNote />
    </SolarPageShell>
  );
}
