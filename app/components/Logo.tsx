import { Zap } from "lucide-react";

/** Same brand lockup as the main Green Engineering Tools site, with the product name underneath. */
export default function Logo() {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-white/25 sm:h-10 sm:w-10">
        <Zap className="h-5 w-5" strokeWidth={2.6} aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[15px] font-black tracking-tight text-white min-[360px]:text-base">
          GreenEngineering <span className="text-emerald-400">Tools</span>
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/90">Solar Calculator</span>
      </span>
    </span>
  );
}
