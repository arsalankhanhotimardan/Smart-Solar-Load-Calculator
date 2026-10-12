"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const links = [
  ["/", "Load calculator"],
  ["/units-to-solar-calculator", "Units to solar"],
  ["/solar-calculator", "Solar by city"],
  ["/battery-runtime-calculator", "Battery runtime"],
  ["/solar-battery-charging-time-calculator", "Solar recharge"],
  ["/methodology", "Methodology"],
] as const;

/** The desktop bar has less room than the mobile menu, so secondary pages live in the menu and footer. */
const SECONDARY = new Set<string>(["/methodology", "/solar-battery-charging-time-calculator"]);
const desktopLinks = links.filter(([href]) => !SECONDARY.has(href));

const MAIN_SITE = "https://greenengineeringtools.com";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="min-w-0" aria-label="Green Engineering Tools Solar Calculator home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-0.5 xl:flex">
          {desktopLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-bold transition-colors ${isActive(href) ? "bg-sky-500/15 text-sky-300" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"}`}
            >
              {label}
            </Link>
          ))}
          <a href={MAIN_SITE} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-bold text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-white">
            All tools <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link href="/units-to-solar-calculator" className="ml-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300">
            Start with your bill <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 xl:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-800 bg-slate-950 px-4 pb-6 pt-4 xl:hidden">
          <div className="mx-auto grid max-w-6xl gap-1.5">
            <Link href="/units-to-solar-calculator" className="mb-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950">
              Start with your electricity bill <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`min-h-11 rounded-xl px-4 py-3 text-sm font-bold ${isActive(href) ? "bg-sky-500/15 text-sky-300" : "text-slate-200 hover:bg-slate-900 hover:text-sky-300"}`}
              >
                {label}
              </Link>
            ))}
            <Link href="/system-size/5kw" className="min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-sky-300">System size guides</Link>
            <Link href="/about" className="min-h-11 rounded-xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-sky-300">About</Link>
            <a href={MAIN_SITE} className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-300">
              More engineering tools <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
