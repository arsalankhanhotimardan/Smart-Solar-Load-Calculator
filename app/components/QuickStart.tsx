import Link from "next/link";
import { BatteryCharging, MapPin, Plug, Receipt, type LucideIcon } from "lucide-react";

const items: { href: string; title: string; text: string; icon: LucideIcon; tint: string }[] = [
  { href: "/units-to-solar-calculator", title: "Units to solar", text: "Turn your electricity bill into a system size.", icon: Receipt, tint: "bg-amber-400/10 text-amber-300" },
  { href: "#calculator", title: "Appliance load builder", text: "Add appliances for running load and surge.", icon: Plug, tint: "bg-sky-400/10 text-sky-300" },
  { href: "/solar-calculator", title: "Solar by city", text: "Local sun hours for more than 40 cities.", icon: MapPin, tint: "bg-emerald-400/10 text-emerald-300" },
  { href: "/battery-runtime-calculator", title: "Battery runtime", text: "How long your battery runs your loads.", icon: BatteryCharging, tint: "bg-violet-400/10 text-violet-300" },
];

export default function QuickStart() {
  return (
    <section aria-label="Quick start" className="border-b border-slate-800/70 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Where do you want to start?</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="card-lift group flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-600">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.tint}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-black text-white">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-400">{item.text}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
