import type { Metadata } from "next";
import Link from "next/link";
import SolarLoadBuilder from "../../components/SolarLoadBuilder";
import {
  getCommercialAppliances,
  getDomesticAppliances,
  getSolarPanelCatalog,
} from "../../actions";

export const revalidate = 3600;

const SYSTEMS = {
  "3kw": {
    kw: 3,
    title: "3 kW",
    intent: "small homes, apartments and essential daytime loads",
    note: "A 3 kW array is typically considered for efficient homes with modest simultaneous demand. High-power heating, large pumps and multiple air conditioners can exceed the inverter/load envelope quickly.",
  },
  "5kw": {
    kw: 5,
    title: "5 kW",
    intent: "medium homes and mixed household loads",
    note: "A 5 kW class system is a common residential planning size, but whether it can support air conditioning, pumps and kitchen loads depends on simultaneous running watts, starting surge and daily energy rather than the 5 kW label alone.",
  },
  "7-5kw": {
    kw: 7.5,
    title: "7.5 kW",
    intent: "larger homes and higher daytime consumption",
    note: "A 7.5 kW class system provides more PV headroom than typical small residential systems and can suit larger homes where daytime cooling, pumping and appliance loads overlap.",
  },
  "10kw": {
    kw: 10,
    title: "10 kW",
    intent: "large homes, offices and light commercial loads",
    note: "A 10 kW system can serve substantial daily energy demand, but inverter phase, motor starting current, local export limits and roof/string design become increasingly important.",
  },
  "15kw": {
    kw: 15,
    title: "15 kW",
    intent: "large residences, offices, schools and small businesses",
    note: "At 15 kW, the project should be treated as a serious electrical design. Three-phase distribution, inverter topology, string current, protective devices and utility interconnection can be as important as panel count.",
  },
  "20kw": {
    kw: 20,
    title: "20 kW",
    intent: "commercial buildings and high-consumption properties",
    note: "A 20 kW installation usually sits firmly in commercial or large-property territory. Load diversity, three-phase balance, motor starting, roof structure, protection coordination and utility requirements should be reviewed professionally.",
  },
} as const;

type SizeKey = keyof typeof SYSTEMS;

type Props = { params: Promise<{ size: string }> };

export function generateStaticParams() {
  return Object.keys(SYSTEMS).map((size) => ({ size }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { size } = await params;
  const data = SYSTEMS[size as SizeKey];
  if (!data) return { title: "Solar System Size Guide" };
  return {
    title: `${data.title} Solar System Calculator, Panel Count & Load Guide`,
    description: `Plan a ${data.title} solar system: compare panel counts, estimated daily solar energy, roof area, inverter/loading considerations and battery sizing, then test your own appliances in the interactive calculator.`,
    alternates: {
      canonical: `https://solarcalculator.greenengineeringtools.com/system-size/${size}`,
    },
    openGraph: {
      title: `${data.title} Solar System Calculator & Engineering Guide`,
      description: `Interactive load calculator plus panel-count and solar-yield scenarios for a ${data.title} PV system.`,
      url: `https://solarcalculator.greenengineeringtools.com/system-size/${size}`,
      type: "article",
    },
  };
}

const panelOptions = [450, 500, 550, 585, 600, 700];
const pshScenarios = [3.5, 4.5, 5.5];
const combinedEfficiency = 0.86 * 0.96;

export default async function SystemSizePage({ params }: Props) {
  const { size } = await params;
  const data = SYSTEMS[size as SizeKey];

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
        <h1 className="text-3xl font-black">Solar system size not found</h1>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-sky-600 px-5 py-3 font-black">Open calculator</Link>
      </main>
    );
  }

  const [domestic, commercial, panels] = await Promise.all([
    getDomesticAppliances(),
    getCommercialAppliances(),
    getSolarPanelCatalog(),
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${data.title} Solar System Calculator, Panel Count & Load Guide`,
    description: data.note,
    author: { "@type": "Person", name: "Engr. Arsalan Khan" },
    publisher: { "@type": "Organization", name: "Green Engineering Tools" },
    mainEntityOfPage: `https://solarcalculator.greenengineeringtools.com/system-size/${size}`,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,rgba(14,165,233,.12),transparent_40%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">System-size engineering guide</p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            {data.title} Solar System Calculator & Load Guide
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400">
            Use the interactive calculator to test your actual appliances, then use the tables below to understand panel count, daily energy scenarios and practical design checks for a {data.title} class PV array.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
        <SolarLoadBuilder
          initialDomestic={domestic as any[]}
          initialCommercial={commercial as any[]}
          initialPanels={panels as any[]}
        />
      </section>

      <article className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
            <h2 className="text-2xl font-black text-white">What a {data.title} system rating really means</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              A “{data.title} solar system” usually describes the approximate DC nameplate capacity of the PV array, not a promise that {data.title} of AC power will be available at every moment. Output changes with solar irradiance, module temperature, shading, orientation, soiling, wiring and inverter conversion. {data.note}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              That is why the calculator above evaluates both <strong className="text-slate-200">daily energy</strong> and <strong className="text-slate-200">instantaneous load</strong>. A project can have enough annual solar energy but still need a larger inverter or battery to support short high-power events.
            </p>
          </section>
          <aside className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="font-black text-emerald-200">Good fit for</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-100/70">{data.intent}.</p>
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-slate-950/50 p-4 text-xs leading-5 text-slate-400">
              System labels are planning categories. Always size from measured/entered loads and local solar resource rather than choosing a capacity first.
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <h2 className="text-2xl font-black text-white">How many panels for a {data.title} solar array?</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
            Divide {data.kw * 1000} W by the panel wattage and round up to a whole module. The installed DC capacity will usually be slightly above the nominal target because panels cannot be installed fractionally.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-200">
                <tr>
                  <th className="px-4 py-3">Panel rating</th>
                  <th className="px-4 py-3">Panels required</th>
                  <th className="px-4 py-3">Installed DC capacity</th>
                  <th className="px-4 py-3">Difference vs {data.title}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {panelOptions.map((wattage) => {
                  const count = Math.ceil((data.kw * 1000) / wattage);
                  const installed = (count * wattage) / 1000;
                  const difference = installed - data.kw;
                  return (
                    <tr key={wattage}>
                      <td className="px-4 py-3 font-black text-sky-300">{wattage} W</td>
                      <td className="px-4 py-3 text-white">{count}</td>
                      <td className="px-4 py-3">{installed.toFixed(3)} kWp</td>
                      <td className="px-4 py-3">+{difference.toFixed(3)} kW</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Panel count alone is not a string design. Verify Voc/Vmp, temperature correction, MPPT voltage window, input current and maximum DC power against the selected inverter datasheet.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <h2 className="text-2xl font-black text-white">Estimated daily solar energy from a {data.title} array</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
            These scenarios use the same transparent planning basis as the calculator: 14% miscellaneous PV system losses and 96% inverter efficiency, giving a combined planning efficiency of {(combinedEfficiency * 100).toFixed(1)}%. They are examples, not a weather forecast.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {pshScenarios.map((psh) => {
              const kwh = data.kw * psh * combinedEfficiency;
              return (
                <div key={psh} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="text-xs font-black uppercase tracking-wide text-slate-500">{psh} peak sun hours</div>
                  <div className="mt-2 text-3xl font-black text-white">{kwh.toFixed(1)} <span className="text-sm font-bold text-slate-500">kWh/day</span></div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Planning output before site-specific weather, orientation and shading analysis.</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-black text-white">Inverter checks</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>• Size continuous AC output from the simultaneous running load, not from panel count alone.</li>
              <li>• Check starting surge separately for motors, pumps, refrigeration and compressors.</li>
              <li>• Confirm single-phase or three-phase requirements and phase balancing.</li>
              <li>• Check the manufacturer’s allowed DC/AC ratio and MPPT input limits.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-black text-white">Battery checks</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>• Define the actual load that needs backup rather than backing up every appliance by default.</li>
              <li>• Convert backup kWh into nominal capacity using depth of discharge and efficiency.</li>
              <li>• Verify BMS current, battery/inverter voltage compatibility and allowable charge/discharge power.</li>
              <li>• Allow for temperature, ageing and future load growth where appropriate.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-xl font-black text-amber-100">What this page does not promise</h2>
          <p className="mt-3 text-sm leading-7 text-amber-100/70">
            It does not promise that a {data.title} array will run a fixed list of appliances everywhere. Site solar resource, weather, shading, inverter limits, battery state of charge, load diversity and local electrical rules can materially change the outcome. Use the calculator with your own load and assumptions, then verify the final design locally.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/methodology" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white">Read calculation methodology</Link>
          <Link href="/" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">Open main solar calculator</Link>
        </div>
      </article>
    </main>
  );
}
