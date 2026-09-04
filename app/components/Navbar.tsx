"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  ["/", "Calculator"],
  ["/methodology", "Methodology"],
  ["/system-size/5kw", "5 kW Guide"],
  ["/system-size/10kw", "10 kW Guide"],
  ["/about", "About"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="min-w-0" onClick={() => setOpen(false)} aria-label="Green Engineering Tools Solar Calculator home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-bold text-slate-300 lg:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-sky-400">{label}</Link>
          ))}
          <Link href="/contact" className="rounded-xl bg-sky-600 px-4 py-2.5 text-white hover:bg-sky-500">Contact</Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 lg:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-sky-400">{label}</Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="min-h-11 rounded-xl bg-sky-600 px-4 py-3 text-center text-sm font-black text-white">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
