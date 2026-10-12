import type { ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { SITE, jsonLd } from "../lib/solar-cities";

type Faq = { q: string; a: string };
type Crumb = { label: string; href: string };

type Props = {
  title: string;
  eyebrow: string;
  intro: string;
  path: string;
  crumbs: Crumb[];
  tool: ReactNode;
  faqs: Faq[];
  related: { href: string; title: string }[];
  description: string;
  children: ReactNode;
};

export default function SolarPageShell({ title, eyebrow, intro, path, crumbs, tool, faqs, related, description, children }: Props) {
  const url = `${SITE}${path}`;
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      url,
      description,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any modern web browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@type": "Person", name: "Engr. Arsalan Khan" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Solar Calculator", item: SITE },
        ...crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 2, name: c.label, item: `${SITE}${c.href}` })),
        { "@type": "ListItem", position: crumbs.length + 2, name: title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(s) }} />
      ))}
      <section className="hero-solar hero-grid border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-7 sm:px-6 sm:pb-14 sm:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-bold text-slate-500">
            <Link href="/" className="hover:text-sky-400">Solar calculator</Link>
            {crumbs.map((c) => (
              <span key={c.href} className="contents">
                <ChevronRight className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
                <Link href={c.href} className="hover:text-sky-400">{c.label}</Link>
              </span>
            ))}
          </nav>
          <p className="mt-6 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl sm:leading-[1.05]">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{intro}</p>
          <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
            {["Free", "No signup", "Runs in your browser", "Assumptions you can edit"].map((b) => (
              <li key={b} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-amber-300" strokeWidth={3} aria-hidden="true" /> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{tool}</section>

      <article className="mx-auto max-w-6xl space-y-8 px-4 pb-16 sm:px-6 sm:pb-20">
        {children}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
          <h2 className="text-2xl font-black text-white">Frequently asked questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <summary className="cursor-pointer font-black text-slate-100">{f.q}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">More solar tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.href} href={r.href} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm font-black text-slate-200 transition hover:border-sky-500/50 hover:text-sky-300">
                {r.title} →
              </Link>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-7 text-amber-100/80">
          <strong className="text-amber-100">Planning estimate, not an installation design.</strong> Results use average sun hours and standard loss assumptions. Real output varies by season, shading, tilt, temperature and equipment. Have a qualified installer verify sizing, protection, earthing and utility requirements before purchase.
        </div>
      </article>
    </main>
  );
}
