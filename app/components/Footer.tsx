import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-slate-800/70 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_.8fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xl text-xs leading-6 text-slate-500">
            Free engineering planning tools with transparent assumptions. Solar results are estimates and should be checked against site conditions, equipment datasheets, electrical codes and local utility requirements before installation.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-bold text-slate-400 sm:grid-cols-3 md:justify-self-end">
          <Link href="/methodology" className="hover:text-sky-400">Methodology</Link>
          <Link href="/disclaimer" className="hover:text-sky-400">Disclaimer</Link>
          <Link href="/about" className="hover:text-sky-400">About</Link>
          <Link href="/contact" className="hover:text-sky-400">Contact</Link>
          <Link href="/privacy" className="hover:text-sky-400">Privacy</Link>
          <Link href="/terms" className="hover:text-sky-400">Terms</Link>
        </div>
      </div>
      <div className="border-t border-slate-800/50">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-600 sm:px-6 md:flex-row md:justify-between md:text-left">
          <span>© {year} Green Engineering Tools. All rights reserved.</span>
          <span>Calculator software maintained by Engr. Arsalan Khan.</span>
        </div>
      </div>
    </footer>
  );
}
