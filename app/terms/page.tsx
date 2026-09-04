import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Green Engineering Tools Solar Calculator.",
  alternates: { canonical: "https://solarcalculator.greenengineeringtools.com/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">Last updated: September 4, 2026</p>
        <h1 className="mt-4 text-4xl font-black text-white">Terms of Use</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-400">
          <p>By using this website, you agree to use the calculator as an informational and planning tool. Results are estimates based on the inputs and assumptions shown in the calculator.</p>
          <p>The site does not provide a guarantee of solar production, equipment performance, energy savings, grid-export eligibility, utility approval, electrical-code compliance, structural adequacy or battery autonomy.</p>
          <p>You are responsible for checking final equipment selection, electrical design, structural requirements, permits, utility rules, tariffs and installation practices with appropriately qualified local professionals and authorities.</p>
          <p>Catalog wattages, panel specifications, market data and other reference information can change. Where accuracy matters, verify the current manufacturer datasheet or authoritative source before relying on a value.</p>
          <p>The site may contain links to external websites. External websites are responsible for their own content, availability and privacy practices.</p>
          <p>These terms may be updated as the calculator, advertising model or legal requirements change.</p>
        </div>
        <Link href="/disclaimer" className="mt-8 inline-block rounded-xl border border-slate-700 px-5 py-3 text-sm font-black text-slate-300">Read engineering disclaimer</Link>
      </div>
    </main>
  );
}
