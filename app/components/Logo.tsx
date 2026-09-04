import { Sun } from "lucide-react";

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400">
        <Sun className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-black tracking-tight text-white">Green Engineering Tools</span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Solar Calculator</span>
      </span>
    </span>
  );
}
