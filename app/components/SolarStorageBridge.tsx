"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { LOAD_HANDOFF_KEY, type LoadHandoff } from "../lib/solar-storage-workspace";

export default function SolarStorageBridge({ handoff }: { handoff: LoadHandoff }) {
  const [message, setMessage] = useState("");
  function transfer(event: MouseEvent<HTMLAnchorElement>) {
    try {
      window.sessionStorage.setItem(LOAD_HANDOFF_KEY, JSON.stringify(handoff));
      setMessage("");
    } catch {
      event.preventDefault();
      setMessage("Your browser could not carry the appliance list. Open either battery tool from the navigation and enter the loads there.");
    }
  }
  const hasLoads = handoff.loads.length > 0;
  return (
    <section aria-label="Plan runtime and solar recharge" className="rounded-2xl border border-sky-800/60 bg-sky-950/20 p-5 sm:p-6">
      <h2 className="text-xl font-bold text-white">Already have a battery?</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">Check how long it can power your appliances, then see whether your solar array can recharge it while loads are running.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link onClick={hasLoads ? transfer : undefined} href={`/battery-runtime-calculator${hasLoads ? "?from=solar-load" : ""}`} className="min-h-11 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-500">{hasLoads ? "Use these loads for battery runtime" : "Battery runtime calculator"}</Link>
        <Link onClick={hasLoads ? transfer : undefined} href={`/solar-battery-charging-time-calculator${hasLoads ? "?from=solar-load" : ""}`} className="min-h-11 rounded-xl border border-slate-600 px-4 py-3 text-sm font-bold text-slate-100 hover:bg-slate-800">{hasLoads ? "Use these loads for solar recharge" : "Solar recharge planner"}</Link>
      </div>
      {message && <p role="alert" className="mt-3 text-sm text-amber-200">{message}</p>}
    </section>
  );
}
