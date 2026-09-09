"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  calculateBatteryRuntime, defaultStorageScenario, simulateSolarRecovery,
  validateStorageScenario, type RecoveryResult, type StorageInputs,
  type StorageLoad, type StorageScenario,
} from "../lib/solar-storage-engine";
import {
  decodeStorageWorkspace, encodeStorageWorkspace, scenarioFromHandoff,
  LOAD_HANDOFF_KEY, STORAGE_WORKSPACE_KEY,
} from "../lib/solar-storage-workspace";

export type StorageMode = "runtime" | "recharge";
const number = (n: number, digits = 2) => n.toLocaleString("en-US", { maximumFractionDigits: digits });
const hours = (n: number | null) => n === null ? "Not reached" : n === 0 ? "0 hours" : n < 0.1 ? "Less than 0.1 hour" : `${number(n, 1)} hours`;
const clock = (hour: number) => `${String(Math.floor(hour) % 24).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}`;
const labelClass = "storage-field";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className={labelClass}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Numeric({ label, value, onChange, min = 0, max = 10_000_000, step = "any", hint }: {
  label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number | "any"; hint?: string;
}) {
  return <Field label={label} hint={hint}><input type="number" inputMode="decimal" min={min} max={max} step={step}
    value={Number.isFinite(value) ? value : ""} onChange={(event) => onChange(event.target.value === "" ? NaN : event.target.valueAsNumber)} /></Field>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="storage-metric"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export default function SolarStoragePlanner({ mode }: { mode: StorageMode }) {
  const [scenario, setScenario] = useState<StorageScenario>(defaultStorageScenario);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Example settings. Enter your equipment values or carry an appliance list from the solar load calculator.");
  const [saveStatus, setSaveStatus] = useState("");
  const [hasImport, setHasImport] = useState(false);
  const [compareKind, setCompareKind] = useState<"load" | "solar" | "battery">("load");
  const [comparePercent, setComparePercent] = useState(20);
  const i = scenario.inputs;
  const errors = useMemo(() => validateStorageScenario(scenario), [scenario]);

  useEffect(() => {
    try {
      const handoff = window.sessionStorage.getItem(LOAD_HANDOFF_KEY);
      setHasImport(!!handoff && !!scenarioFromHandoff(handoff));
      const fromBuilder = new URLSearchParams(window.location.search).get("from") === "solar-load";
      const imported = fromBuilder && handoff ? scenarioFromHandoff(handoff) : null;
      const saved = window.localStorage.getItem(STORAGE_WORKSPACE_KEY);
      const restored = saved ? decodeStorageWorkspace(saved) : null;
      if (imported) {
        setScenario(imported);
        setNotice("Appliances imported. Review the assumed start times, confirm AC/DC supply, and enter the battery and panels you own. Equipment sizes have not been inferred from sizing recommendations.");
      } else if (restored) {
        setScenario(restored);
        setNotice(fromBuilder ? "The appliance transfer was unavailable. Your previous battery scenario has been restored." : "Your saved battery scenario has been restored. Changes here do not edit your solar sizing workspace.");
      } else if (saved || fromBuilder) {
        setNotice("Saved values could not be restored. Example settings are shown; check every input before using the result.");
      }
      if (fromBuilder) {
        const url = new URL(window.location.href);
        url.searchParams.delete("from");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      }
    } catch {
      setNotice("Browser saving is unavailable. The calculators still work; use Print / Save PDF to keep a result.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (errors.length) { setSaveStatus("Complete valid inputs to save this scenario."); return; }
    try {
      window.localStorage.setItem(STORAGE_WORKSPACE_KEY, encodeStorageWorkspace(scenario));
      setSaveStatus("Saved on this browser only");
    } catch { setSaveStatus("Browser saving unavailable — keep this page open or print the result."); }
  }, [ready, scenario, errors.length]);

  const runtime = useMemo(() => errors.length ? null : calculateBatteryRuntime(scenario), [scenario, errors]);
  const recovery = useMemo(() => errors.length ? null : simulateSolarRecovery(scenario), [scenario, errors]);
  const comparison = useMemo(() => {
    if (errors.length || !Number.isFinite(comparePercent) || comparePercent <= 0 || comparePercent > 90) return null;
    const changed: StorageScenario = { inputs: { ...i }, loads: scenario.loads.map((load) => ({ ...load })) };
    if (compareKind === "load") changed.loads = changed.loads.map((load) => ({ ...load, watts: load.watts * (1 - comparePercent / 100) }));
    if (compareKind === "solar") changed.inputs.solarWatts *= 1 + comparePercent / 100;
    if (compareKind === "battery") { changed.inputs.capacityAh *= 1 + comparePercent / 100; changed.inputs.capacityKwh *= 1 + comparePercent / 100; }
    if (validateStorageScenario(changed).length) return null;
    return { runtime: calculateBatteryRuntime(changed), recovery: simulateSolarRecovery(changed) };
  }, [scenario, i, compareKind, comparePercent, errors]);

  function updateInput<K extends keyof StorageInputs>(key: K, value: StorageInputs[K]) {
    setScenario((old) => ({ ...old, inputs: { ...old.inputs, [key]: value } }));
  }
  function updateLoad(id: string, patch: Partial<StorageLoad>) {
    setScenario((old) => ({ ...old, loads: old.loads.map((load) => load.id === id ? { ...load, ...patch } : load) }));
  }
  function saveNow() {
    if (!errors.length) try { window.localStorage.setItem(STORAGE_WORKSPACE_KEY, encodeStorageWorkspace(scenario)); } catch { /* The destination can still be used independently. */ }
  }
  function importLoads() {
    try {
      const raw = window.sessionStorage.getItem(LOAD_HANDOFF_KEY);
      const imported = raw ? scenarioFromHandoff(raw) : null;
      if (!imported) { setNotice("No valid shared appliance list was found. Use a battery-tool button beneath the solar load calculator first."); return; }
      setScenario((old) => ({ ...old, loads: imported.loads }));
      setNotice("Appliance list replaced with the shared list. Battery and solar settings were kept. Imported start times and AC supply are assumptions; review them.");
    } catch { setNotice("This browser could not read the shared appliance list. You can add appliances below."); }
  }

  const percentField = (key: keyof StorageInputs, label: string, min = 1, max = 100, hint?: string) =>
    <Numeric label={label} value={i[key] as number} min={min} max={max} onChange={(value) => updateInput(key, value)} hint={hint} />;
  const ratingField = (key: keyof StorageInputs, label: string) =>
    <Numeric label={label} value={i[key] as number} onChange={(value) => updateInput(key, value)} hint="0 = rating not entered; this limit is not checked." />;

  return (
    <div className="storage-planner">
      <div className="storage-toolbar storage-edit">
        <div className="storage-switch" aria-label="Battery tools">
          <Link href="/battery-runtime-calculator" onClick={saveNow} aria-current={mode === "runtime" ? "page" : undefined}>Battery runtime</Link>
          <Link href="/solar-battery-charging-time-calculator" onClick={saveNow} aria-current={mode === "recharge" ? "page" : undefined}>Solar recharge</Link>
        </div>
        <button type="button" className="storage-button secondary" disabled={!runtime || !ready} onClick={() => window.print()}>Print / Save PDF</button>
      </div>
      <p className="storage-notice storage-edit" role="status">{notice}</p>
      {runtime && recovery && <div className="storage-mobile-summary storage-edit">
        <span>{mode === "runtime" ? (runtime.runtimeHours === null ? "Review the entered power limits" : `${hours(runtime.runtimeHours)} estimated runtime`) : (recovery.totalUnservedWh > .01 ? `${number(recovery.totalUnservedWh / 1000)} kWh unserved in this plan` : "Scheduled energy covered in the model")}</span>
        <a href="#storage-results">View results ↓</a>
      </div>}
      <div className="storage-layout">
        <div className="storage-editor storage-edit">
          <section className="storage-panel">
            <h2>Your battery</h2>
            <div className="storage-fields">
              <Field label="Capacity unit"><select value={i.capacityUnit} onChange={(e) => {
                const unit = e.target.value as "ah" | "kwh";
                setScenario((old) => {
                  const values = old.inputs;
                  const kwh = values.capacityUnit === "ah" ? values.capacityAh * values.voltage / 1000 : values.capacityKwh;
                  return { ...old, inputs: { ...values, capacityUnit: unit, capacityKwh: kwh, capacityAh: kwh * 1000 / values.voltage } };
                });
              }}><option value="ah">Amp-hours (Ah) and volts</option><option value="kwh">Kilowatt-hours (kWh)</option></select></Field>
              {i.capacityUnit === "ah" ? <Numeric label="Nominal capacity (Ah)" value={i.capacityAh} min={0.1} max={1_000_000} onChange={(n) => updateInput("capacityAh", n)} />
                : <Numeric label="Nominal capacity (kWh)" value={i.capacityKwh} min={0.001} max={1_000_000} onChange={(n) => updateInput("capacityKwh", n)} hint="Enter nominal capacity. Reserve is deducted separately." />}
              <Numeric label="Nominal battery voltage (V)" value={i.voltage} min={1} max={1000} onChange={(n) => updateInput("voltage", n)} hint="Use total bank voltage, not charging voltage." />
              <Field label="Battery chemistry"><select value={i.chemistry} onChange={(e) => {
                const chemistry = e.target.value as StorageInputs["chemistry"];
                setScenario((old) => ({ ...old, inputs: { ...old.inputs, chemistry,
                  ...(chemistry === "lead-acid" ? { reserveSocPercent: 50, chargeEfficiencyPercent: 85, dischargeEfficiencyPercent: 90 }
                    : chemistry === "lifepo4" ? { reserveSocPercent: 20, chargeEfficiencyPercent: 95, dischargeEfficiencyPercent: 95 } : {}),
                  targetSocPercent: Math.max(old.inputs.targetSocPercent, chemistry === "lead-acid" ? 51 : 21) } }));
              }}><option value="lifepo4">LiFePO₄</option><option value="lead-acid">Lead-acid / AGM / gel</option><option value="custom">Other / custom</option></select></Field>
              {percentField("startSocPercent", "Charge at start (%)", 0)}
              {percentField("reserveSocPercent", "Minimum reserve (%)", 0, 99)}
              {percentField("capacityPercent", "Present capacity (% of rating)", 1, 100, "Use measured capacity if age or temperature reduces the original rating.")}
              {mode === "recharge" && percentField("targetSocPercent", "Solar charging target (%)", 1, 100, "Charging stops at this target in the model.")}
            </div>
            <p className="storage-help">Chemistry presets are editable planning assumptions. Manufacturer data takes priority. {i.chemistry === "lead-acid" && "Lead-acid runtime may be overestimated at high discharge rates; Peukert effects are not modelled."}</p>
          </section>

          <section className="storage-panel">
            <div className="storage-section-title"><h2>Appliances to power</h2>{hasImport && <button type="button" className="storage-text-button" onClick={importLoads}>Use shared list</button>}</div>
            <p className="storage-help">{mode === "runtime" ? "Runtime assumes every selected appliance runs continuously at its entered watts. Daily operating hours are used only by the recharge planner." : "Set each appliance’s daily start time and operating hours. Schedules repeat every day and can cross midnight. Use measured average watts for cycling loads."}</p>
            <div className="storage-loads">
              {scenario.loads.map((load, index) => <fieldset key={load.id} className={`storage-load ${!load.enabled ? "is-disabled" : ""}`}>
                <legend>Appliance {index + 1}</legend>
                <div className="storage-load-top">
                  <label className="storage-check"><input type="checkbox" checked={load.enabled} onChange={(e) => updateLoad(load.id, { enabled: e.target.checked })} />Include</label>
                  <button type="button" className="storage-text-button" aria-label={`Remove ${load.name || `appliance ${index + 1}`}`} onClick={() => setScenario((old) => ({ ...old, loads: old.loads.filter((row) => row.id !== load.id) }))}>Remove</button>
                </div>
                <div className="storage-fields">
                  <Field label="Appliance name"><input type="text" maxLength={120} value={load.name} onChange={(e) => updateLoad(load.id, { name: e.target.value })} /></Field>
                  <Field label="Supply"><select value={load.supply} onChange={(e) => updateLoad(load.id, { supply: e.target.value as "ac" | "dc" })}><option value="ac">AC through inverter</option><option value="dc">DC at battery bus</option></select></Field>
                  <Numeric label="Watts per appliance" value={load.watts} min={0.01} max={1_000_000} onChange={(n) => updateLoad(load.id, { watts: n })} />
                  <Numeric label="Quantity" value={load.quantity} min={1} max={1000} step={1} onChange={(n) => updateLoad(load.id, { quantity: n })} />
                  {load.supply === "ac" && <Numeric label="Starting multiplier" value={load.surgeMultiplier} min={1} max={10} onChange={(n) => updateLoad(load.id, { surgeMultiplier: n })} hint="Starting watts ÷ running watts; 1 means no extra surge modelled." />}
                  {mode === "recharge" && <>
                    <Field label="Daily start time"><select value={load.startHour} onChange={(e) => updateLoad(load.id, { startHour: Number(e.target.value) })}>{Array.from({ length: 96 }, (_, k) => <option key={k} value={k / 4}>{clock(k / 4)}</option>)}</select></Field>
                    <Numeric label="Operating hours per day" value={load.hoursPerDay} min={0} max={24} onChange={(n) => updateLoad(load.id, { hoursPerDay: n })} />
                  </>}
                </div>
              </fieldset>)}
            </div>
            <button type="button" className="storage-button secondary" disabled={scenario.loads.length >= 100} onClick={() => setScenario((old) => ({ ...old, loads: [...old.loads, {
              id: crypto.randomUUID(), name: "Custom appliance", watts: 100, quantity: 1,
              supply: "ac", enabled: true, startHour: 18, hoursPerDay: 4, surgeMultiplier: 1,
            }] }))}>Add appliance</button>
          </section>

          {mode === "recharge" && <section className="storage-panel">
            <h2>Solar and timing</h2>
            <div className="storage-fields">
              <Field label="Can solar power loads and charge this battery?" hint="Confirm your equipment supports this during the scenario, especially during a grid outage."><select value={i.solarAvailability} onChange={(e) => updateInput("solarAvailability", e.target.value as StorageInputs["solarAvailability"])}><option value="available">Yes — off-grid or suitable backup setup</option><option value="unavailable">No — battery-only backup</option><option value="unknown">Not confirmed — exclude solar</option></select></Field>
              <Numeric label="Total panel rating (W)" value={i.solarWatts} onChange={(n) => updateInput("solarWatts", n)} />
              <Numeric label="Peak sun hours per day" value={i.peakSunHours} max={12} onChange={(n) => updateInput("peakSunHours", n)} hint="Daily energy equivalent, not daylight duration. Use a local, seasonal value." />
              {percentField("solarLossPercent", "PV and controller conversion losses (%)", 0, 99, "Before the DC bus. Do not include the inverter or battery losses entered separately.")}
              <Numeric label="Daylight begins (24-hour clock)" value={i.sunriseHour} max={23.75} step={0.25} onChange={(n) => updateInput("sunriseHour", n)} hint="6 = 06:00; 6.5 = 06:30. A smooth daylight profile is assumed." />
              <Numeric label="Daylight duration (hours)" value={i.daylightHours} min={0.25} max={24} step={0.25} onChange={(n) => updateInput("daylightHours", n)} />
              <Numeric label="Plan starts (24-hour clock)" value={i.simulationStartHour} max={23.75} step={0.25} onChange={(n) => updateInput("simulationStartHour", n)} />
              <Numeric label="Days to simulate" value={i.simulationDays} min={1} max={7} step={1} onChange={(n) => updateInput("simulationDays", n)} />
            </div>
          </section>}

          <details className="storage-panel storage-details">
            <summary>Losses and equipment limits</summary>
            <p className="storage-help">Enter the ratings of your equipment. Missing ratings are not interpreted as proof that the equipment is suitable.</p>
            <div className="storage-fields">
              {percentField("inverterEfficiencyPercent", "Inverter efficiency (%)")}
              {percentField("dischargeEfficiencyPercent", "Battery discharge efficiency (%)", 1, 100, "One-way stored energy to DC output. Do not enter round-trip efficiency here.")}
              {mode === "recharge" && percentField("chargeEfficiencyPercent", "Battery charge efficiency (%)", 1, 100, "One-way DC input to stored energy.")}
              <Numeric label="Inverter standby draw (DC watts)" value={i.inverterIdleWatts} onChange={(n) => updateInput("inverterIdleWatts", n)} hint="Assumed on throughout the plan. Enter 0 if the inverter is off or idle draw is already included." />
              {ratingField("inverterContinuousWatts", "Inverter continuous AC output (W)")}
              {ratingField("inverterSurgeWatts", "Inverter starting surge AC output (W)")}
              {ratingField("batteryDischargeWatts", "Battery continuous DC output limit (W)")}
              <Numeric label="Simultaneous appliance starts" value={i.simultaneousStarts} min={1} max={10} step={1} onChange={(n) => updateInput("simultaneousStarts", n)} />
              {mode === "recharge" && <>{ratingField("batteryChargeWatts", "Battery charging DC input limit (W)")}{ratingField("controllerOutputWatts", "Controller total DC output limit (W)")}</>}
            </div>
          </details>
          <div className="storage-reset"><span>{saveStatus}</span><button type="button" className="storage-text-button" onClick={() => { setScenario(defaultStorageScenario()); setNotice("Example restored for these two battery tools. Your main solar sizing workspace was not changed."); }}>Restore example</button></div>
        </div>

        <div className="storage-results" id="storage-results">
          {errors.length > 0 ? <section className="storage-panel storage-warning" role="alert"><h2>Check these inputs</h2><ul>{errors.slice(0, 8).map((error, index) => <li key={index}>{error.message}</li>)}</ul>{errors.length > 8 && <p>Also check the remaining appliance rows.</p>}<p>Results are withheld until the inputs are valid.</p></section> : runtime && recovery && <>
            <section className="storage-panel storage-main-result" aria-live="polite">
              <p className="storage-eyebrow">{mode === "runtime" ? "Continuous battery-only estimate" : `${i.simulationDays}-day solar and battery plan`}</p>
              {mode === "runtime" ? <>
                <h2>{runtime.runtimeHours === null ? "Load exceeds an entered rating" : hours(runtime.runtimeHours)}</h2>
                <p>To the {number(i.reserveSocPercent)}% reserve with every selected load running continuously.</p>
                <div className="storage-metrics">
                  <Metric label="Selected appliances" value={`${number(runtime.acWatts + runtime.dcWatts)} W`} detail={`${number(runtime.acWatts)} W AC + ${number(runtime.dcWatts)} W DC`} />
                  <Metric label="Available DC energy" value={`${number(runtime.usableAtDcBusWh / 1000)} kWh`} detail="After reserve and battery discharge loss" />
                  <Metric label="Nominal battery" value={`${number(runtime.nominalWh / 1000)} kWh`} detail={`${number(runtime.adjustedWh / 1000)} kWh after capacity adjustment`} />
                  <Metric label="Stored-energy draw" value={`${number(runtime.storedEnergyDrawWatts)} W`} detail="Includes inverter and battery losses, and standby" />
                </div>
              </> : <>
                <h2>{recovery.totalUnservedWh > 0.01 ? "Energy shortfall in this plan" : "Scheduled energy covered"}</h2>
                <p>{recovery.totalUnservedWh > 0.01 ? `${number(recovery.totalUnservedWh / 1000)} kWh of appliance demand could not be supplied over ${i.simulationDays} days.` : "The model supplies the entered schedule within its continuous-power and energy assumptions. Review starting and equipment limits below."}</p>
                <div className="storage-metrics">
                  <Metric label={i.startSocPercent >= i.targetSocPercent ? "Recovery after first use" : "First time to target"} value={hours(i.startSocPercent >= i.targetSocPercent ? recovery.recoveryAfterUseHours : recovery.timeToTargetHours)} detail={`From plan start to ${number(i.targetSocPercent)}% charge; “not reached” means within these ${i.simulationDays} days.`} />
                  <Metric label="First energy shortfall" value={recovery.firstShortfallHours === null ? "None in this plan" : hours(recovery.firstShortfallHours)} detail="Elapsed time from the start, based on 15-minute steps" />
                  <Metric label="Lowest battery charge" value={`${number(recovery.minimumSocPercent, 1)}%`} detail={`Ends at ${number(recovery.finalSocPercent, 1)}%`} />
                  <Metric label="Solar at the DC bus" value={`${number(recovery.totalSolarWh / 1000)} kWh`} detail={`Total for ${i.simulationDays} days, after entered PV losses and controller clipping`} />
                </div>
              </>}
            </section>

            <section className="storage-panel">
              <h2>Power and starting checks</h2>
              <p className="storage-help">Assumes all selected loads are on together and the largest {i.simultaneousStarts} start{ i.simultaneousStarts === 1 ? "" : "s"} coincide. Daily energy coverage does not certify a start or an installation.</p>
              {runtime.violations.length > 0 && <div className="storage-warning"><ul>{runtime.violations.map((message) => <li key={message}>{message}</li>)}</ul>{mode === "runtime" && <p>The energy-only calculation would be {hours(runtime.capacityOnlyHours)}, but the entered equipment cannot support the full selected load under these checks.</p>}</div>}
              <dl className="storage-breakdown"><div><dt>Estimated AC start demand</dt><dd>{number(runtime.estimatedSurgeAcWatts)} W</dd></div><div><dt>DC bus demand with all loads on</dt><dd>{number(runtime.dcBusWatts)} W</dd></div><div><dt>Stored energy above reserve</dt><dd>{number(runtime.storedAboveReserveWh / 1000)} kWh</dd></div></dl>
              {runtime.uncheckedRatings.length > 0 ? <p className="storage-help">Not checked: {runtime.uncheckedRatings.join(", ").toLowerCase()}. Enter these in “Losses and equipment limits”.</p> : !runtime.violations.length && <p className="storage-help">The three entered power ratings cover this arithmetic check. Surge duration, DC startup current, wiring and equipment compatibility require separate verification.</p>}
            </section>

            {mode === "recharge" && <RecoveryDisplay recovery={recovery} inputs={i} />}

            <section className="storage-panel">
              <h2>Compare one change</h2>
              <div className="storage-fields storage-edit">
                <Field label="Change to compare"><select value={compareKind} onChange={(e) => setCompareKind(e.target.value as typeof compareKind)}><option value="load">Reduce selected load watts</option><option value="battery">Increase nominal battery capacity</option>{mode === "recharge" && <option value="solar">Increase solar panel watts</option>}</select></Field>
                <Numeric label="Change (%)" value={comparePercent} min={1} max={90} onChange={setComparePercent} />
              </div>
              {comparison ? <>
                <p className="storage-help">{number(comparePercent)}% {compareKind === "load" ? "lower appliance watts" : compareKind === "solar" ? "more solar watts" : "more nominal battery capacity"}; all other inputs and power ratings stay the same.</p>
                <div className="storage-table-wrap"><table><caption>Original scenario compared with one change</caption><thead><tr><th>Measure</th><th>Original</th><th>Changed</th></tr></thead><tbody>
                  <tr><th>Continuous battery runtime</th><td>{runtime.runtimeHours === null ? "Rating exceeded" : hours(runtime.runtimeHours)}</td><td>{comparison.runtime.runtimeHours === null ? "Rating exceeded" : hours(comparison.runtime.runtimeHours)}</td></tr>
                  {mode === "recharge" && <><tr><th>Unserved appliance energy</th><td>{number(recovery.totalUnservedWh / 1000)} kWh</td><td>{number(comparison.recovery.totalUnservedWh / 1000)} kWh</td></tr><tr><th>Battery charge at plan end</th><td>{number(recovery.finalSocPercent, 1)}%</td><td>{number(comparison.recovery.finalSocPercent, 1)}%</td></tr></>}
                </tbody></table></div>
                <p className="storage-help">A larger battery starts with more stored energy at the same charge percentage. It can delay a shortfall without fixing a continuing daily energy deficit. This comparison does not verify an equipment upgrade.</p>
              </> : <p className="storage-help" role="status">Enter a comparison from 1% to 90% within the calculator’s input limits.</p>}
            </section>

            <section className="storage-panel storage-report-inputs">
              <h2>Inputs for this estimate</h2>
              <p className="storage-help">Energy model v1. Values below are included when you print.</p>
              <dl className="storage-breakdown">
                <div><dt>Battery and present capacity</dt><dd>{number(runtime.nominalWh / 1000)} kWh nominal · {number(i.voltage)} V · {number(i.capacityPercent)}% · {i.chemistry}</dd></div>
                <div><dt>Start / reserve / solar target</dt><dd>{number(i.startSocPercent)}% / {number(i.reserveSocPercent)}% / {number(i.targetSocPercent)}%</dd></div>
                <div><dt>Inverter / discharge / charge efficiency</dt><dd>{number(i.inverterEfficiencyPercent)}% / {number(i.dischargeEfficiencyPercent)}% / {number(i.chargeEfficiencyPercent)}%</dd></div>
                <div><dt>Inverter standby (always on)</dt><dd>{number(i.inverterIdleWatts)} W DC</dd></div>
                <div><dt>Inverter continuous / surge rating</dt><dd>{i.inverterContinuousWatts ? `${number(i.inverterContinuousWatts)} W` : "Not entered"} / {i.inverterSurgeWatts ? `${number(i.inverterSurgeWatts)} W` : "Not entered"}</dd></div>
                <div><dt>Battery DC discharge / charge limit</dt><dd>{i.batteryDischargeWatts ? `${number(i.batteryDischargeWatts)} W` : "Not entered"} / {i.batteryChargeWatts ? `${number(i.batteryChargeWatts)} W` : "Not entered"}</dd></div>
                {mode === "recharge" && <><div><dt>Panels / peak sun hours / PV losses</dt><dd>{number(i.solarWatts)} W / {number(i.peakSunHours)} h / {number(i.solarLossPercent)}%</dd></div><div><dt>Controller output limit</dt><dd>{i.controllerOutputWatts ? `${number(i.controllerOutputWatts)} W` : "Not entered"}</dd></div><div><dt>Daylight / plan starts / duration</dt><dd>{clock(i.sunriseHour)} for {number(i.daylightHours)} h / {clock(i.simulationStartHour)} / {i.simulationDays} days</dd></div><div><dt>Solar availability</dt><dd>{i.solarAvailability}</dd></div></>}
              </dl>
              <div className="storage-table-wrap"><table><caption>Appliances included in this result</caption><thead><tr><th>Appliance</th><th>Load</th><th>{mode === "recharge" ? "Daily schedule" : "Operation"}</th></tr></thead><tbody>{scenario.loads.filter((load) => load.enabled).map((load) => <tr key={load.id}><th>{load.name}</th><td>{number(load.watts)} W × {load.quantity} {load.supply.toUpperCase()}<br />{number(load.surgeMultiplier)}× start</td><td>{mode === "recharge" ? `${clock(load.startHour)} · ${number(load.hoursPerDay)} h` : "Continuous"}</td></tr>)}</tbody></table></div>
            </section>

            <aside className="storage-panel storage-limitations">
              <h2>How to use this estimate</h2>
              <p>{mode === "recharge" ? "This is a planning scenario with the same smooth solar profile and load schedule repeated daily. It is not live monitoring or a weather forecast. The 15-minute energy model does not reproduce brief startup events or inverter trip/restart behaviour." : "This is a battery-only energy estimate. Changing load, temperature, ageing, voltage sag, battery protection and surge duration can change actual runtime."}</p>
              <p>Lead-acid discharge-rate effects, low-temperature charging rules and near-full charge taper are not simulated. Confirm equipment limits, battery settings and installation requirements with the manufacturer or a qualified local professional.</p>
              <Link href={mode === "runtime" ? "/solar-battery-charging-time-calculator" : "/battery-runtime-calculator"} onClick={saveNow} className="storage-text-button storage-edit">{mode === "runtime" ? "Continue to the solar recharge plan →" : "Review continuous battery runtime →"}</Link>
            </aside>
          </>}
        </div>
      </div>
    </div>
  );
}

function RecoveryDisplay({ recovery, inputs }: { recovery: RecoveryResult; inputs: StorageInputs }) {
  const w = 620, h = 180, left = 42, top = 12, bottom = 28;
  const totalHours = inputs.simulationDays * 24;
  const x = (elapsed: number) => left + elapsed / totalHours * (w - left - 12);
  const y = (soc: number) => top + (100 - soc) / 100 * (h - top - bottom);
  const path = recovery.points.map((p, index) => `${index ? "L" : "M"}${x(p.elapsedHours).toFixed(2)},${y(p.socPercent).toFixed(2)}`).join(" ");
  return <section className="storage-panel">
    <h2>Battery charge through the plan</h2>
    <p className="storage-help">Starts at {clock(inputs.simulationStartHour)}. Each day below is the next 24 hours from that start, not a calendar day.</p>
    <svg className="storage-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Battery charge across ${inputs.simulationDays} days. Lowest ${number(recovery.minimumSocPercent, 1)} percent, ending at ${number(recovery.finalSocPercent, 1)} percent.`}>
      {[0, 50, 100].map((soc) => <g key={soc}><line x1={left} y1={y(soc)} x2={w - 12} y2={y(soc)} stroke="currentColor" opacity="0.15" /><text x={left - 7} y={y(soc) + 5} textAnchor="end" fill="currentColor" fontSize="14">{soc}%</text></g>)}
      <line x1={left} y1={y(inputs.reserveSocPercent)} x2={w - 12} y2={y(inputs.reserveSocPercent)} stroke="#fbbf24" strokeDasharray="5 4" />
      <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {[0, inputs.simulationDays].map((day) => <text key={day} x={x(day * 24)} y={h - 5} textAnchor={day === 0 ? "start" : "end"} fill="currentColor" fontSize="14">{day * 24} h</text>)}
    </svg>
    <p className="storage-help">Blue: modelled charge. Dashed amber: selected reserve.</p>
    <div className="storage-table-wrap"><table><caption>Daily energy balance (kWh) and battery charge</caption><thead><tr><th>Day</th><th>Solar</th><th>Load</th><th>Unserved</th><th>End charge</th></tr></thead><tbody>{recovery.days.map((day) => <tr key={day.day}><th>{day.day}</th><td>{number(day.solarWh / 1000)}</td><td>{number(day.demandWh / 1000)}</td><td>{number(day.unservedWh / 1000)}</td><td>{number(day.endSocPercent, 1)}%</td></tr>)}</tbody></table></div>
    <dl className="storage-breakdown"><div><dt>Appliance energy delivered</dt><dd>{number(recovery.totalServedWh / 1000)} kWh</dd></div><div><dt>Conversion losses / inverter standby</dt><dd>{number(recovery.totalLossWh / 1000)} / {number(recovery.totalStandbyWh / 1000)} kWh</dd></div><div><dt>Unused solar after controller</dt><dd>{number(recovery.totalCurtailedWh / 1000)} kWh</dd></div><div><dt>Solar clipped at controller limit</dt><dd>{number(recovery.controllerClippedWh / 1000)} kWh</dd></div></dl>
    {recovery.warnings.length > 0 && <ul className="storage-help storage-list">{recovery.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
  </section>;
}
