import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About the Solar Calculator",
  description:
    "About Green Engineering Tools Solar Calculator, its purpose, methodology and no-signup approach.",
  alternates: { canonical: "https://solarcalculator.greenengineeringtools.com/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">About this project</p>
        <h1 className="mt-4 text-4xl font-black text-white">Green Engineering Tools Solar Calculator</h1>
        <div className="mt-7 space-y-5 text-sm leading-7 text-slate-400">
          <p>
            This calculator is designed to help homeowners, students, technicians, consultants and businesses turn an appliance/load list into an understandable solar planning estimate. It is free to use and does not require an account.
          </p>
          <p>
            The tool separates running power, daily energy, starting surge, PV array sizing, inverter capacity, battery backup and roof area. Major assumptions are visible and editable so users can see why a result changes instead of receiving an unexplained “exact” system size.
          </p>
          <p>
            The software and content are maintained by Engr. Arsalan Khan, a software and web developer. The methodology page documents the formulas, defaults and limitations used by the calculator. Final electrical and structural design should be completed or checked by appropriately qualified local professionals.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white">Use the calculator</Link>
          <Link href="/methodology" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">Read methodology</Link>
          <Link href="/contact" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">Contact</Link>
        </div>
      </div>
    </main>
  );
}
