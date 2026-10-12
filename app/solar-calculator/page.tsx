import type { Metadata } from "next";
import Link from "next/link";
import SolarPageShell from "../components/SolarPageShell";
import UnitsToSolarWizard from "../components/UnitsToSolarWizard";
import { getPanelOptions, getPanelRatePkrPerWatt } from "../lib/solar-data";
import { AVERAGE_PSH, CITIES, CITY_OPTIONS, SITE } from "../lib/solar-cities";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Solar Calculator by City | Pakistan Solar Panel & Inverter Sizing",
  description: "Choose your city to size a solar system: panels, inverter and battery from your electricity units, with local peak sun hours for more than 40 Pakistani cities.",
  alternates: { canonical: `${SITE}/solar-calculator` },
};

export default async function CityIndexPage() {
  const [panels, rate] = await Promise.all([getPanelOptions(), getPanelRatePkrPerWatt()]);
  const provinces = [...new Set(CITIES.map((c) => c.province))].sort();

  return (
    <SolarPageShell
      title="Solar Calculator by City"
      eyebrow="Pakistan • local sun hours • all DISCOs"
      intro="Pick your city for solar sizing with local peak sun hours and the matching distribution company, or use the wizard directly."
      description="Solar sizing calculators for more than 40 Pakistani cities."
      path="/solar-calculator"
      crumbs={[]}
      tool={<UnitsToSolarWizard cities={CITY_OPTIONS} panels={panels} panelRatePkrPerWatt={rate} defaultPsh={AVERAGE_PSH} />}
      faqs={[
        { q: "Why choose a city?", a: "Each city gets a different amount of sunshine, so the same monthly units need a different number of panels. City pages pre-fill a planning value for peak sun hours." },
        { q: "Can I use this outside Pakistan?", a: "Yes. Choose 'Other' and enter your own peak sun hours. The formulas do not depend on location." },
      ]}
      related={[
        { href: "/units-to-solar-calculator", title: "Units to solar calculator" },
        { href: "/", title: "Full solar load calculator" },
        { href: "/battery-runtime-calculator", title: "Battery runtime calculator" },
      ]}
    >
      {provinces.map((province) => (
        <section key={province} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <h2 className="text-xl font-black text-white">{province}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.filter((c) => c.province === province).map((c) => (
              <Link key={c.slug} href={`/solar-calculator/${c.slug}`} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-sky-500/50 hover:text-sky-300">
                <span>{c.name}</span>
                <span className="text-xs text-slate-500">{c.avgPeakSunHours} h · {c.disco}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </SolarPageShell>
  );
}
