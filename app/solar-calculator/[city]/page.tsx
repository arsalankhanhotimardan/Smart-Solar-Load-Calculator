import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SolarPageShell from "../../components/SolarPageShell";
import UnitsToSolarWizard from "../../components/UnitsToSolarWizard";
import NetBillingNote from "../../components/NetBillingNote";
import { getPanelOptions, getPanelRatePkrPerWatt } from "../../lib/solar-data";
import { AVERAGE_PSH, CITIES, CITY_OPTIONS, SITE, UNIT_LEVELS, cityBySlug, unitsSlug } from "../../lib/solar-cities";
import { fmt, monthlyProduction, panelsFor, requiredKwForUnits } from "../../lib/solar-quick";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

type Props = { params: Promise<{ city: string }> };

const SIZES = [1, 2, 3, 5, 7.5, 10, 15, 20];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const c = cityBySlug(city);
  if (!c) return {};
  const url = `${SITE}/solar-calculator/${c.slug}`;
  return {
    title: `Solar Calculator ${c.name}: Panels, Inverter & Battery Size`,
    description: `Size a solar system in ${c.name} (${c.disco}) from your electricity units. About ${c.avgPeakSunHours} peak sun hours: see panels, inverter, battery and monthly production for 1 to 20 kW.`,
    alternates: { canonical: url },
    openGraph: { title: `Solar calculator for ${c.name}`, description: `Panels, inverter and battery for a solar system in ${c.name}.`, url, type: "website" },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const c = cityBySlug(city);
  if (!c) notFound();

  const [panels, rate] = await Promise.all([getPanelOptions(), getPanelRatePkrPerWatt()]);
  const diff = ((c.avgPeakSunHours - AVERAGE_PSH) / AVERAGE_PSH) * 100;
  const sameDisco = CITIES.filter((x) => x.disco === c.disco && x.slug !== c.slug).slice(0, 8);
  const sameProvince = CITIES.filter((x) => x.province === c.province && x.slug !== c.slug && x.disco !== c.disco).slice(0, 8);
  const nearby = [...sameDisco, ...sameProvince].slice(0, 8);

  const faqs = [
    {
      q: `How many solar panels do I need in ${c.name}?`,
      a: `It depends on your usage. At ${c.avgPeakSunHours} peak sun hours, 500 units a month needs about ${fmt(requiredKwForUnits(500, c.avgPeakSunHours), 1)} kW, which is ${panelsFor(requiredKwForUnits(500, c.avgPeakSunHours), 550)} panels of 550 W. 1,000 units needs about ${fmt(requiredKwForUnits(1000, c.avgPeakSunHours), 1)} kW (${panelsFor(requiredKwForUnits(1000, c.avgPeakSunHours), 550)} panels).`,
    },
    {
      q: `How many peak sun hours does ${c.name} get?`,
      a: `This calculator uses ${c.avgPeakSunHours} peak sun hours per day as a planning average for ${c.name}, which is ${Math.abs(diff) < 0.5 ? "close to" : `${fmt(Math.abs(diff), 0)}% ${diff > 0 ? "above" : "below"}`} the ${AVERAGE_PSH} average across the cities in the dataset. It is a planning value, not a measurement; you can change it in the wizard.`,
    },
    {
      q: `How many units does a 5 kW solar system produce in ${c.name}?`,
      a: `About ${fmt(monthlyProduction(5, c.avgPeakSunHours), 0)} units a month on average (${fmt(monthlyProduction(5, c.avgPeakSunHours) / 30, 1)} units a day), more in summer and less in winter.`,
    },
    {
      q: `Which electricity company serves ${c.name}?`,
      a: `${c.name} is in ${c.province} and is served by ${c.disco}. Your distribution company handles solar interconnection applications and sets the rules for exporting surplus power.`,
    },
    {
      q: "Is net metering still available?",
      a: "NEPRA moved new solar consumers from net metering to net billing in February 2026. Reports say earlier agreements are outside the new rules and that new buyback rates are lower, but sources differ. Confirm the current rules with NEPRA or your distribution company.",
    },
  ];

  return (
    <SolarPageShell
      title={`Solar Calculator for ${c.name}`}
      eyebrow={`${c.province} • ${c.disco} • ${c.avgPeakSunHours} peak sun hours`}
      intro={`Size a solar system for ${c.name} from your electricity units. The wizard is pre-set with ${c.avgPeakSunHours} peak sun hours for ${c.name}, and the tables show what each system size produces here.`}
      description={`Solar panel, inverter and battery sizing for ${c.name}, ${c.province} (${c.disco}), with monthly production for 1 to 20 kW systems.`}
      path={`/solar-calculator/${c.slug}`}
      crumbs={[{ label: "Cities", href: "/solar-calculator" }]}
      tool={<UnitsToSolarWizard initialUnits={500} initialCitySlug={c.slug} cities={CITY_OPTIONS} panels={panels} panelRatePkrPerWatt={rate} defaultPsh={AVERAGE_PSH} />}
      faqs={faqs}
      related={[
        { href: "/units-to-solar-calculator", title: "Units to solar calculator" },
        { href: "/", title: "Full solar load calculator" },
        { href: "/battery-runtime-calculator", title: "Battery runtime calculator" },
        { href: "/solar-system-for/500-units-per-month", title: "Solar system for 500 units" },
        { href: "/system-size/5kw", title: "5 kW solar system guide" },
        { href: "/solar-calculator", title: "All cities" },
      ]}
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">What each solar system produces in {c.name}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">Average production at {c.avgPeakSunHours} peak sun hours, 14% system losses and 96% inverter efficiency, with 550 W panels.</p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-950 text-slate-200">
              <tr>
                <th className="px-4 py-3">System</th>
                <th className="px-4 py-3">550 W panels</th>
                <th className="px-4 py-3">Units per day</th>
                <th className="px-4 py-3">Units per month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {SIZES.map((kw) => (
                <tr key={kw}>
                  <td className="px-4 py-3 font-black text-sky-300">{kw} kW</td>
                  <td className="px-4 py-3">{panelsFor(kw, 550)}</td>
                  <td className="px-4 py-3">{fmt(monthlyProduction(kw, c.avgPeakSunHours) / 30, 1)}</td>
                  <td className="px-4 py-3 text-white">{fmt(monthlyProduction(kw, c.avgPeakSunHours), 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
        <h2 className="text-2xl font-black text-white">Solar size needed in {c.name} for your monthly units</h2>
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
                const kw = requiredKwForUnits(u, c.avgPeakSunHours);
                return (
                  <tr key={u}>
                    <td className="px-4 py-3 font-black text-sky-300">{u.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-white">{fmt(kw, 1)} kW</td>
                    <td className="px-4 py-3">{panelsFor(kw, 550)}</td>
                    <td className="px-4 py-3"><Link href={`/solar-system-for/${unitsSlug(u)}`} className="font-bold text-sky-400 underline underline-offset-2">{u} units →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {nearby.length ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <h2 className="text-xl font-black text-white">Nearby and related cities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link key={n.slug} href={`/solar-calculator/${n.slug}`} className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 hover:border-sky-500 hover:text-sky-300">
                {n.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <NetBillingNote />
    </SolarPageShell>
  );
}
