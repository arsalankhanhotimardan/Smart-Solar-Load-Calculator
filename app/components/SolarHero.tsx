import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AVERAGE_PSH } from "../lib/solar-cities";
import { fmt, unitsToSolar } from "../lib/solar-quick";

/** Landing hero. The example is computed with the same maths as the calculator, never hard-coded. */
export default function SolarHero() {
  const example = unitsToSolar({ monthlyUnits: 500, peakSunHours: AVERAGE_PSH, panelWatts: 550, systemType: "on-grid" })!;
  const stats = [
    { label: "Solar array", value: fmt(example.requiredKw, 2), unit: "kW" },
    { label: "550 W panels", value: String(example.panels), unit: "panels" },
    { label: "Inverter", value: fmt(example.inverterKw, 1), unit: "kW" },
    { label: "Monthly output", value: fmt(example.monthlyProductionKwh, 0), unit: "kWh" },
  ];

  return (
    <section className="hero-solar hero-grid overflow-x-clip border-b border-slate-800/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-14 lg:py-24">
        <div>
          <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">
            Free • no signup • worldwide planning tool
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.3rem] lg:leading-[1.05]">
            Solar Load Calculator for{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">Panels, Inverter & Battery</span> Sizing
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Build your home or commercial load, estimate daily energy, account for starting surge, and size a practical PV array, inverter, battery bank and roof area using transparent assumptions you can change.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/units-to-solar-calculator" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300">
              Start with your electricity bill <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#calculator" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">
              Build your appliance load
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-300">
            {["No signup, free to use", "Assumptions you can edit", "Built for phones"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-300" strokeWidth={3} aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-amber-400/10 blur-3xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Example result</p>
              <p className="text-xs font-bold text-amber-200">500 units / month · {AVERAGE_PSH} sun hours</p>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{s.label}</div>
                    <div className="mt-1 text-3xl font-black text-white">{s.value}</div>
                    <div className="text-xs font-bold text-slate-400">{s.unit}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-3">
                <span className="text-xs leading-5 text-slate-300">Roof area about {fmt(example.roofAreaM2, 0)} m². Change the units, city, panel and battery to see your own.</span>
                <Link href="/units-to-solar-calculator" className="shrink-0 text-xs font-black text-sky-300 underline underline-offset-4">Try it</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
