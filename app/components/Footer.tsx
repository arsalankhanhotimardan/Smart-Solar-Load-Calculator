import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Logo from "./Logo";

const col = "mt-4 space-y-3 text-sm font-semibold text-slate-400";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-slate-950">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Green Engineering Tools Solar Calculator home" className="inline-flex">
            <Logo />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
            Free solar planning tools with transparent assumptions. Results are estimates and should be checked against site conditions, equipment datasheets, electrical codes and local utility requirements before installation.
          </p>
          <a href="https://greenengineeringtools.com" className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-black text-slate-200 transition hover:border-emerald-400/50 hover:text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> More engineering tools <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Calculators</h2>
          <nav className={col} aria-label="Footer calculators">
            <Link href="/" className="block hover:text-sky-300">Load calculator</Link>
            <Link href="/units-to-solar-calculator" className="block hover:text-sky-300">Units to solar</Link>
            <Link href="/solar-calculator" className="block hover:text-sky-300">Solar by city</Link>
            <Link href="/battery-runtime-calculator" className="block hover:text-sky-300">Battery runtime</Link>
            <Link href="/solar-battery-charging-time-calculator" className="block hover:text-sky-300">Solar recharge</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Guides</h2>
          <nav className={col} aria-label="Footer guides">
            <Link href="/system-size/3kw" className="block hover:text-sky-300">3 kW system</Link>
            <Link href="/system-size/5kw" className="block hover:text-sky-300">5 kW system</Link>
            <Link href="/system-size/10kw" className="block hover:text-sky-300">10 kW system</Link>
            <Link href="/solar-system-for/500-units-per-month" className="block hover:text-sky-300">500 units a month</Link>
            <Link href="/methodology" className="block hover:text-sky-300">Methodology</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Company</h2>
          <nav className={col} aria-label="Footer company">
            <Link href="/about" className="block hover:text-sky-300">About</Link>
            <Link href="/contact" className="block hover:text-sky-300">Contact</Link>
            <Link href="/disclaimer" className="block hover:text-sky-300">Disclaimer</Link>
            <Link href="/privacy" className="block hover:text-sky-300">Privacy</Link>
            <Link href="/terms" className="block hover:text-sky-300">Terms</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-slate-800/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-600 sm:px-6 md:flex-row md:justify-between md:text-left">
          <span>© {year} Green Engineering Tools. All rights reserved.</span>
          <span>Calculator software maintained by Engr. Arsalan Khan.</span>
        </div>
      </div>
    </footer>
  );
}
