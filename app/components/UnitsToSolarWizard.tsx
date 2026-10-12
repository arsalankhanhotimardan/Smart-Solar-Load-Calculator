"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BATTERY_PROFILES,
  COMBINED_EFFICIENCY,
  fmt,
  paybackYears,
  unitsToSolar,
  type BatteryChemistry,
} from "../lib/solar-quick";

export type PanelOption = { id: string; label: string; watts: number; areaM2: number | null };
export type CityOption = { slug: string; name: string; province: string; disco: string; psh: number };

type Props = {
  initialUnits?: number;
  initialCitySlug?: string;
  cities: CityOption[];
  panels: PanelOption[];
  /** Market price of panels in PKR per watt from the catalogue database, if available. */
  panelRatePkrPerWatt?: number | null;
  defaultPsh: number;
};

export const DEFAULT_PANELS: PanelOption[] = [450, 500, 550, 585, 620, 700].map((w) => ({ id: `w${w}`, label: `${w} W panel`, watts: w, areaM2: null }));

const inputCls =
  "w-full min-h-[44px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base font-semibold text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30";
const labelCls = "mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-400";

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function UnitsToSolarWizard({ initialUnits = 500, initialCitySlug, cities, panels, panelRatePkrPerWatt, defaultPsh }: Props) {
  const panelList = panels.length ? panels : DEFAULT_PANELS;
  const defaultPanel = panelList.find((p) => p.watts >= 540 && p.watts <= 600) ?? panelList[0];

  const startCity = cities.find((c) => c.slug === initialCitySlug);
  const [units, setUnits] = useState(String(initialUnits));
  const [citySlug, setCitySlug] = useState(startCity?.slug ?? "custom");
  const [psh, setPsh] = useState(String(startCity?.psh ?? defaultPsh));
  const [systemType, setSystemType] = useState<"on-grid" | "hybrid">("on-grid");
  const [panelId, setPanelId] = useState(defaultPanel.id);
  const [backupKw, setBackupKw] = useState("1.5");
  const [backupHours, setBackupHours] = useState("4");
  const [chemistry, setChemistry] = useState<BatteryChemistry>("lifepo4");
  const [batteryVoltage, setBatteryVoltage] = useState("48");
  const [systemCost, setSystemCost] = useState("");
  const [tariff, setTariff] = useState("");

  const panel = panelList.find((p) => p.id === panelId) ?? defaultPanel;

  const result = useMemo(
    () =>
      unitsToSolar({
        monthlyUnits: num(units),
        peakSunHours: num(psh),
        panelWatts: panel.watts,
        panelAreaM2: panel.areaM2,
        systemType,
        backupLoadKw: num(backupKw) || 0,
        backupHours: num(backupHours) || 0,
        chemistry,
        batteryVoltage: num(batteryVoltage) || 48,
      }),
    [units, psh, panel, systemType, backupKw, backupHours, chemistry, batteryVoltage]
  );

  const annualSavings = result && num(tariff) > 0 ? Math.min(result.monthlyProductionKwh, num(units)) * 12 * num(tariff) : NaN;
  const payback = result ? paybackYears(num(systemCost), annualSavings) : null;
  const panelOnlyCost = result && panelRatePkrPerWatt ? result.installedKw * 1000 * panelRatePkrPerWatt : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6" aria-label="Inputs">
        <div className="space-y-5">
          <div>
            <label className={labelCls} htmlFor="units">Monthly electricity use (units / kWh)</label>
            <input id="units" type="number" inputMode="decimal" min={1} value={units} onChange={(e) => setUnits(e.target.value)} className={inputCls} />
            <div className="mt-2 flex flex-wrap gap-2">
              {[200, 300, 500, 700, 1000, 1500].map((u) => (
                <button key={u} type="button" onClick={() => setUnits(String(u))} className={`rounded-full border px-3 py-1 text-xs font-bold ${num(units) === u ? "border-sky-500 bg-sky-500/20 text-sky-200" : "border-slate-700 text-slate-300 hover:border-sky-500"}`}>
                  {u}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Find it on your electricity bill as &ldquo;units consumed&rdquo;. Use an average of several months.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <label className={labelCls} htmlFor="city">Location</label>
              <select
                id="city"
                value={citySlug}
                onChange={(e) => {
                  setCitySlug(e.target.value);
                  const c = cities.find((x) => x.slug === e.target.value);
                  if (c) setPsh(String(c.psh));
                }}
                className={inputCls}
              >
                <option value="custom">Other / enter my own sun hours</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name} ({c.disco})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="psh">Peak sun hours / day</label>
              <input
                id="psh"
                type="number"
                inputMode="decimal"
                min={1}
                max={8}
                step="0.1"
                value={psh}
                onChange={(e) => {
                  setPsh(e.target.value);
                  setCitySlug("custom");
                }}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={labelCls}>System type</span>
              <div className="grid grid-cols-2 gap-2">
                {(["on-grid", "hybrid"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setSystemType(t)} className={`min-h-[44px] rounded-xl border px-3 text-sm font-black ${systemType === t ? "border-sky-500 bg-sky-500/20 text-sky-100" : "border-slate-700 text-slate-300 hover:border-sky-500"}`}>
                    {t === "on-grid" ? "On-grid" : "Hybrid + battery"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="panel">Panel size</label>
              <select id="panel" value={panelId} onChange={(e) => setPanelId(e.target.value)} className={inputCls}>
                {panelList.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}{p.label.includes(`${p.watts}`) ? "" : ` — ${p.watts} W`}</option>
                ))}
              </select>
            </div>
          </div>

          {systemType === "hybrid" ? (
            <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="bkw">Load to back up (kW)</label>
                <input id="bkw" type="number" inputMode="decimal" min={0} step="0.1" value={backupKw} onChange={(e) => setBackupKw(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="bh">Backup hours</label>
                <input id="bh" type="number" inputMode="decimal" min={0} step="0.5" value={backupHours} onChange={(e) => setBackupHours(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="chem">Battery type</label>
                <select id="chem" value={chemistry} onChange={(e) => setChemistry(e.target.value as BatteryChemistry)} className={inputCls}>
                  {(Object.keys(BATTERY_PROFILES) as BatteryChemistry[]).map((k) => (
                    <option key={k} value={k}>{BATTERY_PROFILES[k].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="bv">Battery voltage</label>
                <select id="bv" value={batteryVoltage} onChange={(e) => setBatteryVoltage(e.target.value)} className={inputCls}>
                  {[12, 24, 48].map((v) => (
                    <option key={v} value={v}>{v} V</option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <details className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <summary className="cursor-pointer text-sm font-black text-slate-200">Optional: estimate payback</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="cost">Quoted system price (PKR)</label>
                <input id="cost" type="number" inputMode="decimal" min={0} placeholder="from your quotation" value={systemCost} onChange={(e) => setSystemCost(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="tariff">Your average bill rate (PKR / unit)</label>
                <input id="tariff" type="number" inputMode="decimal" min={0} placeholder="bill total ÷ units" value={tariff} onChange={(e) => setTariff(e.target.value)} className={inputCls} />
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">Divide the total of a recent bill by its units to get your average rate. The estimate assumes the solar units replace grid units at that rate. Under net billing, exported units are credited at a lower buyback rate, so savings can be smaller.</p>
          </details>
        </div>
      </section>

      <section className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-5 sm:p-6" aria-label="Result" role="status" aria-live="polite">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">Your solar estimate</p>
        {result ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Card label="Solar array needed" value={fmt(result.requiredKw, 2)} unit="kW" />
              <Card label={`${panel.watts} W panels`} value={String(result.panels)} unit="panels" />
              <Card label="Installed array" value={fmt(result.installedKw, 2)} unit="kWp" />
              <Card label="Inverter size" value={fmt(result.inverterKw, 1)} unit="kW" />
              <Card label="Monthly production" value={fmt(result.monthlyProductionKwh, 0)} unit="kWh" />
              <Card label="Roof area" value={fmt(result.roofAreaM2, 0)} unit={`m² (${fmt(result.roofAreaM2 * 10.7639, 0)} ft²)`} />
            </div>
            {systemType === "hybrid" ? (
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Battery for backup</p>
                <p className="mt-1 text-2xl font-black text-white">{fmt(result.batteryNominalKwh, 1)} <span className="text-sm font-bold text-slate-400">kWh nominal · ≈ {fmt(result.batteryAh, 0)} Ah at {batteryVoltage} V</span></p>
                <p className="mt-1 text-xs text-slate-400">Usable {fmt(result.batteryUsableKwh, 1)} kWh for {backupKw} kW over {backupHours} h.</p>
              </div>
            ) : null}
            {payback !== null ? (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-300">Simple payback</p>
                <p className="mt-1 text-2xl font-black text-white">{fmt(payback, 1)} <span className="text-sm font-bold text-emerald-200">years</span></p>
                <p className="mt-1 text-xs text-emerald-100/70">Yearly bill saving ≈ PKR {fmt(annualSavings, 0)}.</p>
              </div>
            ) : null}
            {panelOnlyCost ? (
              <p className="mt-3 text-xs leading-5 text-slate-400">Panels alone at the current market rate (PKR {fmt(panelRatePkrPerWatt ?? 0, 0)}/W): about PKR {fmt(panelOnlyCost, 0)}. This excludes inverter, battery, mounting, cables, installation and approvals.</p>
            ) : null}
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Uses {psh} peak sun hours, 14% system losses and 96% inverter efficiency ({fmt(COMBINED_EFFICIENCY * 100, 1)}% combined), sized to offset {fmt(num(units), 0)} units a month on average. Summer output is higher and winter lower than this average.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-black">
              <Link href="/" className="rounded-xl bg-sky-600 px-4 py-2.5 text-white hover:bg-sky-500">Add appliances for a detailed load sizing</Link>
              <Link href="/methodology" className="rounded-xl border border-slate-700 px-4 py-2.5 text-slate-200 hover:border-sky-500">How it works</Link>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-400">Enter your monthly units and peak sun hours (between 1 and 8).</p>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-words text-2xl font-black text-white">{value}</div>
      <div className="text-xs font-bold text-slate-400">{unit}</div>
    </div>
  );
}
