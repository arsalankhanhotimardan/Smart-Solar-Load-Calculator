import type { Metadata } from "next";
import Link from "next/link";
import SolarLoadBuilder from "./components/SolarLoadBuilder";
import {
  getCommercialAppliances,
  getDomesticAppliances,
  getSolarPanelCatalog,
} from "./actions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Solar Load Calculator | Panels, Inverter & Battery Size",
  description:
    "Free no-signup solar load calculator for homes and businesses. Estimate daily kWh, PV array size, panel count, inverter kW/kVA, starting surge, battery storage and roof area with adjustable engineering assumptions.",
  alternates: {
    canonical: "https://solarcalculator.greenengineeringtools.com",
  },
  openGraph: {
    title: "Solar Load Calculator | Green Engineering Tools",
    description:
      "Build your electrical load and estimate solar panels, inverter capacity, battery storage, starting surge and roof area with transparent assumptions.",
    url: "https://solarcalculator.greenengineeringtools.com",
    type: "website",
  },
};

const faqs = [
  {
    q: "How does this solar load calculator size a PV system?",
    a: "The calculator first totals the running watts and daily energy of the appliances you select. It then estimates the PV array from daily kWh, peak sun hours, system losses and inverter efficiency. In Balanced mode it also checks that the array is not undersized relative to the selected daytime running load. All major assumptions are editable.",
  },
  {
    q: "How many solar panels do I need for a 5 kW system?",
    a: "Panel count is the desired DC array wattage divided by the individual panel wattage, rounded up to a whole panel. A nominal 5 kW target therefore needs 10 × 550 W panels (5.5 kWp installed) or 9 × 600 W panels (5.4 kWp installed). Final string design must also satisfy the inverter MPPT voltage and current limits.",
  },
  {
    q: "Why does the calculator ask for peak sun hours?",
    a: "The same PV array produces different energy in different locations and seasons. Peak sun hours are a simple way to represent the available solar resource. Use a representative value for your location rather than treating the default as a guarantee.",
  },
  {
    q: "How is the inverter size estimated?",
    a: "The calculator uses the selected running load, a user-adjustable inverter headroom, the target DC/AC ratio and power factor. It also estimates a separate starting-surge requirement because motors, pumps, refrigerators, compressors and air conditioners can require substantially more power at startup than during normal operation.",
  },
  {
    q: "How is battery storage calculated for a hybrid solar system?",
    a: "Battery sizing starts from the percentage of the selected load you want to back up and the requested backup hours. It then accounts for battery depth of discharge, battery efficiency and inverter efficiency. The result is shown as both usable energy and nominal battery-bank capacity.",
  },
  {
    q: "Can I use this solar calculator outside Pakistan?",
    a: "Yes. The core formulas are location-neutral and the calculator lets you enter local peak sun hours, losses, panel specifications, electrical phase and custom appliances. Utility interconnection, export compensation, electrical codes and installation requirements must still be checked locally.",
  },
  {
    q: "Is this a final electrical design?",
    a: "No. It is an engineering planning estimate. A qualified professional should verify conductor sizing, circuit protection, earthing, short-circuit requirements, inverter surge capability, PV string voltage/current limits, battery BMS limits, structural loading and local utility rules before installation.",
  },
];

export default async function Home() {
  const [domesticCatalog, commercialCatalog, panelCatalog] = await Promise.all([
    getDomesticAppliances(),
    getCommercialAppliances(),
    getSolarPanelCatalog(),
  ]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Green Engineering Tools Solar Load Calculator",
    url: "https://solarcalculator.greenengineeringtools.com",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser",
    isAccessibleForFree: true,
    description:
      "Free solar load and system sizing calculator for PV panels, inverter capacity, surge demand, battery storage and roof area.",
    creator: {
      "@type": "Person",
      name: "Engr. Arsalan Khan",
      jobTitle: "Software and Web Developer",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Domestic and commercial load builder",
      "Daily kWh calculation",
      "Starting surge estimation",
      "PV array sizing",
      "Solar panel count",
      "Inverter kW and kVA planning",
      "Battery backup sizing",
      "Roof area estimation",
      "Custom appliances and custom panels",
      "No signup required",
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="border-b border-slate-800/70 bg-[radial-gradient(circle_at_top,rgba(14,165,233,.12),transparent_42%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="inline-flex rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-sky-300">
            Free • no signup • worldwide planning tool
          </div>
          <h1 className="mx-auto mt-6 max-w-5xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Solar Load Calculator for Panels, Inverter & Battery Sizing
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
            Build your home or commercial load, estimate daily energy, account for starting surge, and size a practical PV array, inverter, battery bank and roof area using transparent assumptions you can change.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-300">
            {[
              "Running load",
              "Daily kWh",
              "Starting surge",
              "PV kWp",
              "Panel count",
              "Inverter kW/kVA",
              "Battery kWh",
              "Roof area",
            ].map((item) => (
              <span key={item} className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
        <SolarLoadBuilder
          initialDomestic={domesticCatalog as any[]}
          initialCommercial={commercialCatalog as any[]}
          initialPanels={panelCatalog as any[]}
        />
      </section>

      <section className="border-t border-slate-800 bg-slate-900/35">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <article>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">How the estimate works</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Solar sizing with visible assumptions, not hidden shortcuts</h2>
              <p className="mt-5 text-base leading-7 text-slate-400">
                Solar calculators often produce one system size without explaining the assumptions behind it. This tool separates the problem into electrical load, daily energy, solar resource, losses, inverter loading, starting surge and storage. That makes the result easier to audit and adjust for a real project.
              </p>
              <div className="mt-7 space-y-5">
                {[
                  ["1. Running load", "Each appliance contributes its running watts multiplied by quantity. The calculator also reports apparent power using the selected overall power factor."],
                  ["2. Daily energy", "Running watts × quantity × operating hours gives daily watt-hours, converted to kWh/day."],
                  ["3. Solar array", "Daily kWh is divided by peak sun hours and the combined PV-to-AC efficiency. Balanced mode also checks the selected daytime running load."],
                  ["4. Starting surge", "Where manufacturer surge data is available it is used. Otherwise motor/compressor loads use a clearly visible planning multiplier that you can change."],
                  ["5. Inverter", "Continuous inverter capacity is checked against running load headroom and the selected DC/AC ratio. Starting surge is shown separately because inverter surge ratings vary by model."],
                  ["6. Battery", "Hybrid storage is based on backed-up load, backup hours, depth of discharge, battery efficiency and inverter efficiency."],
                ].map(([title, body]) => (
                  <div key={title}>
                    <h3 className="font-black text-slate-100">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/methodology" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white hover:bg-sky-500">Full methodology</Link>
                <Link href="/disclaimer" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300 hover:bg-slate-800">Engineering disclaimer</Link>
              </div>
            </article>

            <aside className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">Popular planning guides</p>
              <h2 className="mt-3 text-2xl font-black text-white">Compare common solar system sizes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Each guide includes panel-count tables, solar-yield scenarios and design considerations rather than repeating the same article with a different number.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {["3kw", "5kw", "7-5kw", "10kw", "15kw", "20kw"].map((size) => (
                  <Link key={size} href={`/system-size/${size}`} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-sm font-black uppercase text-sky-300 hover:border-sky-500/50 hover:bg-slate-800">
                    {size.replace("-", ".")} system
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">Practical solar sizing questions</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Solar load calculator FAQ</h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-400">Answers focus on the engineering decisions users actually need to make, not on promising one “exact” system size for every location and installation.</p>
          </div>
          <div className="mt-9 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-800 bg-slate-900/60">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 font-black text-slate-100 sm:p-6">
                  <span>{faq.q}</span>
                  <span className="text-xl text-sky-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-7 text-slate-400 sm:px-6 sm:pb-6">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Authorship & review context</p>
          <h2 className="mt-3 text-2xl font-black text-white">Built as an engineering planning tool</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Calculator software and content are maintained by Engr. Arsalan Khan. The methodology page documents the formulas, defaults, limitations and external references used by the tool so users can understand how the estimate was produced.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/about" className="text-sm font-black text-sky-400 hover:text-sky-300">About the project</Link>
            <span className="text-slate-700">•</span>
            <Link href="/methodology" className="text-sm font-black text-sky-400 hover:text-sky-300">Calculation methodology</Link>
            <span className="text-slate-700">•</span>
            <Link href="/contact" className="text-sm font-black text-sky-400 hover:text-sky-300">Contact</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
