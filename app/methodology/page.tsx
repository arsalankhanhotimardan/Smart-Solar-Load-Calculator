import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solar Calculator Methodology & Formulas",
  description:
    "See the formulas, assumptions and limitations used by the Green Engineering Tools solar load calculator for daily energy, PV size, inverter capacity, surge demand, battery storage and roof area.",
  alternates: {
    canonical: "https://solarcalculator.greenengineeringtools.com/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">Transparent engineering model</p>
        <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Solar calculator methodology and formulas</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
          This page explains how the calculator converts appliance loads into a planning estimate for PV array size, inverter capacity, starting surge, battery storage and roof area. The purpose is to make assumptions visible and auditable rather than hiding them behind a single “exact system size.”
        </p>

        <section className="mt-10 space-y-6">
          <Method title="1. Running load" formula="Peak running power (W) = Σ appliance watts × quantity">
            Running load represents the selected appliances operating at the same time. It is used for inverter continuous-power sizing and the balanced PV-sizing check.
          </Method>
          <Method title="2. Daily energy" formula="Daily energy (kWh/day) = Σ watts × quantity × operating hours ÷ 1000">
            Operating hours are user inputs. If an appliance cycles on and off, use an equivalent average run-time or improve the appliance record with measured energy data.
          </Method>
          <Method title="3. Starting surge" formula="Estimated start event = running load + largest simultaneous incremental starting loads">
            If an appliance has manufacturer surge watts or a surge multiplier in the catalog, the calculator uses it. If a motor/compressor load lacks surge data, the calculator applies the visible user-adjustable “unknown motor start multiplier.” The default is a planning assumption, not a product specification.
          </Method>
          <Method title="4. PV array from energy" formula="PV kWp = daily kWh ÷ [peak sun hours × (1 − system losses) × inverter efficiency]">
            Peak sun hours represent the solar resource for the chosen location and period. The default 14% miscellaneous system-loss input follows the general PVWatts V5 loss allowance for losses such as soiling, mismatch, wiring, connections, degradation and availability, while this calculator models inverter efficiency separately.
          </Method>
          <Method title="5. Balanced PV sizing" formula="Required PV = max(energy-based PV, running-load-support PV)">
            Balanced mode checks both daily energy and the selected daytime running load. Energy-offset mode uses daily energy only. Neither mode guarantees full real-time PV output because irradiance, temperature, shading and orientation vary continuously.
          </Method>
          <Method title="6. Panel count" formula="Panel count = ceil(required PV watts ÷ selected panel watts)">
            The calculator rounds up to a whole panel and reports the resulting installed DC capacity. String voltage/current design is intentionally not invented; it must be checked against the selected panel and inverter electrical datasheets.
          </Method>
          <Method title="7. Inverter continuous power" formula="Inverter kW = round up(max(load × headroom, PV kWp ÷ target DC/AC ratio))">
            The calculator reports continuous kW, estimated kVA using the selected overall power factor, and a separate recommended starting-surge rating. Inverter manufacturers specify different surge durations and overload curves, so the final model must be checked against its datasheet.
          </Method>
          <Method title="8. Battery usable energy" formula="Usable battery kWh = backed-up load kW × backup hours">
            The backed-up load percentage is adjustable. It lets a user model essential loads instead of assuming every selected appliance must remain on during an outage.
          </Method>
          <Method title="9. Battery nominal capacity" formula="Nominal battery kWh = usable kWh ÷ (DoD × battery efficiency × inverter efficiency)">
            The calculator provides planning profiles for LiFePO₄ and lead-acid batteries. Actual battery BMS limits, maximum current, temperature, ageing, warranty conditions and inverter compatibility must be checked before procurement.
          </Method>
          <Method title="10. Roof area" formula="Roof area = panel length × panel width × panel count × access/spacing allowance">
            Roof area is withheld if panel dimensions are unavailable. This estimate does not replace structural assessment, setbacks, fire access, row spacing, tilt/shading studies or local code requirements.
          </Method>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-white">External reference used for the default loss assumption</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            NREL PVWatts documents a 14% default system-loss value for losses not otherwise explicitly modeled in PVWatts V5. The calculator uses 14% as an editable planning default and keeps inverter efficiency as a separate editable input.
          </p>
          <a href="https://pvwatts.nrel.gov/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-black text-sky-400 hover:text-sky-300">NREL PVWatts</a>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-xl font-black text-amber-100">Limitations</h2>
          <p className="mt-3 text-sm leading-7 text-amber-100/70">
            The calculator does not perform hourly irradiance simulation, detailed shading analysis, PV string-voltage calculations, conductor sizing, protection coordination, short-circuit studies, structural checks, utility approval, tariff analysis or code compliance. Use it for planning and comparison, then verify the final system with site-specific engineering.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white">Open calculator</Link>
          <Link href="/disclaimer" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">Read disclaimer</Link>
        </div>
      </div>
    </main>
  );
}

function Method({ title, formula, children }: { title: string; formula: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm font-black text-emerald-300">{formula}</div>
      <p className="mt-4 text-sm leading-7 text-slate-400">{children}</p>
    </section>
  );
}
