import type { ReactNode } from "react";
import Link from "next/link";
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
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,rgba(14,165,233,.12),transparent_40%)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
            <Link href="/" className="hover:text-sky-400">Solar calculator</Link>
            {crumbs.map((c) => (
              <span key={c.href} className="contents">
                <span>/</span>
                <Link href={c.href} className="hover:text-sky-400">{c.label}</Link>
              </span>
            ))}
          </nav>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">{intro}</p>
          <p className="mt-3 text-xs font-bold text-slate-500">Free · No signup · Runs in your browser</p>
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
