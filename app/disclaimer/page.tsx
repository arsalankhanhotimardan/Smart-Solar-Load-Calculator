import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solar Calculator Engineering Disclaimer",
  description:
    "Important limitations and professional-use disclaimer for the Green Engineering Tools solar load and system sizing calculator.",
  alternates: {
    canonical: "https://solarcalculator.greenengineeringtools.com/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">Important planning limitation</p>
        <h1 className="mt-4 text-4xl font-black text-white">Solar calculator engineering disclaimer</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-400">
          <p>
            Green Engineering Tools provides planning calculations for education, early-stage design and comparison. Results are estimates based on user-entered loads, operating hours, peak sun hours, efficiency assumptions, equipment data and planning defaults.
          </p>
          <p>
            The calculator is not a substitute for a site survey, licensed electrical design, structural assessment, utility interconnection study, manufacturer selection process, protection study or installation approval. Solar generation varies with weather, irradiance, shading, orientation, temperature, soiling, module mismatch, equipment efficiency and system availability.
          </p>
          <p>
            Before purchasing or installing equipment, verify PV module and inverter voltage/current compatibility, MPPT operating windows, short-circuit current, conductor ampacity, protection devices, earthing, surge protection, battery BMS limits, charge/discharge current, structural loading, fire access, local electrical codes and utility requirements with qualified professionals.
          </p>
          <p>
            Grid export, tariffs, compensation mechanisms and interconnection rules vary by country, utility and time. The calculator does not guarantee eligibility for export, net metering, net billing, tax incentives, rebates or any particular tariff.
          </p>
          <p>
            Appliance wattage and starting surge can differ materially between models. Where catalog surge data is missing, the calculator identifies that it used a visible planning assumption. Replace those assumptions with manufacturer or measured values when accuracy matters.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white">Back to calculator</Link>
          <Link href="/methodology" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">View methodology</Link>
        </div>
      </div>
    </main>
  );
}
