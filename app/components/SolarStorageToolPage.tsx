import Link from "next/link";
import SolarStoragePlanner, { type StorageMode } from "./SolarStoragePlanner";
import "./solar-storage.css";

const base = "https://solarcalculator.greenengineeringtools.com";

export default function SolarStorageToolPage({ mode }: { mode: StorageMode }) {
  const runtime = mode === "runtime";
  const title = runtime ? "Battery runtime calculator" : "Solar battery charging time calculator";
  const path = runtime ? "/battery-runtime-calculator" : "/solar-battery-charging-time-calculator";
  const description = runtime
    ? "Find how long your existing battery can run selected appliances. Enter Ah and voltage or kWh, adjust the reserve and losses, and check the power limits of your equipment."
    : "Estimate solar recharge while appliances keep running. See battery charge, daytime and overnight consumption, charging limits and energy shortfalls across a repeating daily schedule.";
  const schema = {
    "@context": "https://schema.org", "@type": "WebApplication", name: title,
    url: `${base}${path}`, description, applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web Browser", isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return <div className="storage-page-shell"><main className="storage-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="storage-page-header">
      <Link href="/" className="storage-breadcrumb">Solar load calculator / Battery tools</Link>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
    <SolarStoragePlanner mode={mode} />
    <article className="storage-seo">
      {runtime ? <RuntimeExplanation /> : <RechargeExplanation />}
      <h2>Method and sources</h2>
      <p>These tools use an energy-balance model with editable assumptions. The sources below explain battery monitoring, solar-and-storage behaviour and backup-system limitations; they do not certify this calculator or your installation.</p>
      <ul>
        <li><a href="https://www.victronenergy.com/media/pg/SmartShunt/en/operation.html" target="_blank" rel="noopener noreferrer">Victron SmartShunt manual: state of charge, efficiency and remaining-time estimates</a></li>
        <li><a href="https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/using-pvgis-5/pvgis-5-user-manual_en" target="_blank" rel="noopener noreferrer">European Commission PVGIS: solar production and off-grid energy balance</a>. This release does not request PVGIS data; enter your own local peak sun hours.</li>
        <li><a href="https://www.energy.gov.au/solar/get-know-solar-technology/batteries" target="_blank" rel="noopener noreferrer">Australian Government Solar Consumer Guide: batteries and backup capability</a></li>
      </ul>
      <p><Link href="/methodology">Existing solar sizing methodology</Link> · <Link href="/disclaimer">Engineering limitations</Link> · <Link href="/about">About the site</Link> · <Link href="/contact">Report a calculation issue</Link></p>
    </article>
  </main></div>;
}

function RuntimeExplanation() {
  return <>
    <h2>How battery runtime is calculated</h2>
    <p>Nominal energy is battery-bank voltage multiplied by bank amp-hours. A 48 V, 100 Ah bank therefore has 4,800 Wh, or 4.8 kWh, of nominal energy. If the battery has lost capacity, the present-capacity percentage reduces that starting value.</p>
    <p>The energy available above the reserve is adjusted capacity × (starting charge − reserve). The calculator then accounts separately for battery discharge losses, inverter losses on AC appliances, DC appliances and inverter standby.</p>
    <p><strong>Runtime = energy above reserve ÷ stored-energy draw.</strong> Stored-energy draw = (AC watts ÷ inverter efficiency + DC watts + standby watts) ÷ battery discharge efficiency. Percentages are used as decimal fractions.</p>
    <h2>Worked example: a 48 V, 100 Ah battery and a 300 W load</h2>
    <p>Assume a full battery at its original capacity, a 20% reserve, 90% inverter efficiency, 95% battery discharge efficiency and 10 W inverter standby. Energy above reserve is 4,800 × 0.8 = 3,840 Wh. Stored-energy draw is (300 ÷ 0.90 + 10) ÷ 0.95 = approximately 361.4 W.</p>
    <p>The resulting continuous runtime is approximately <strong>10.6 hours</strong>. This energy estimate is usable only within the equipment’s power limits. Adding solar belongs in the recharge planner, because the timing of generation and consumption matters.</p>
    <h2>Use your existing appliance list</h2>
    <ol><li>Add appliances in the <Link href="/">solar load calculator</Link>.</li><li>Choose “Use these loads for battery runtime” beneath that calculator.</li><li>Enter the capacity and ratings of the battery and inverter you actually own.</li><li>Turn off nonessential loads using the Include checkboxes and compare the result.</li></ol>
    <h2>Common battery-runtime questions</h2>
    <details><summary>Why is 100 Ah not enough information on its own?</summary><p>Amp-hours do not specify energy without voltage. A nominal 12 V, 100 Ah battery stores 1.2 kWh, while a nominal 48 V, 100 Ah bank stores 4.8 kWh. Use the total bank values after its series/parallel configuration.</p></details>
    <details><summary>Can I use this for LiFePO₄, lead-acid or AGM?</summary><p>Yes, as an energy estimate with suitable settings. Chemistry presets are starting assumptions. Lead-acid capacity depends particularly on discharge rate; the model does not calculate Peukert effects. Use tested capacity for the intended load where possible.</p></details>
    <details><summary>How do I estimate refrigerator runtime?</summary><p>Use measured average power over a representative operating period for an energy estimate. Starting power must be checked separately. A refrigerator’s rated compressor watts running continuously do not describe its normal cycling energy consumption.</p></details>
    <details><summary>Does enough battery energy mean an appliance will start?</summary><p>No. The inverter’s starting power and duration, battery/BMS current limits, wiring and voltage drop can prevent a start even when the battery stores enough energy. The calculator reports the entered AC starting-power comparison separately.</p></details>
    <details><summary>Do my inputs leave my browser?</summary><p>The battery and recharge calculations run in your browser. Scenario saving uses browser storage; no account or server submission is required for these calculations. See the site’s privacy policy for other site services.</p></details>
  </>;
}

function RechargeExplanation() {
  return <>
    <h2>Charging time while appliances are running</h2>
    <p>Panel power is shared between the active loads and battery charging. The planner first applies PV/controller conversion losses and the controller output limit. It supplies the active loads, then sends any surplus to the battery within its charging-power limit and target charge.</p>
    <p>When solar is insufficient, the battery supplies the deficit until its reserve or discharge-power limit is reached. Remaining appliance demand is reported as unserved energy. No grid or generator supply is assumed.</p>
    <h2>Worked example: why daytime consumption changes charging time</h2>
    <p>A 1,000 W array with 5 peak sun hours and 20% PV/controller conversion losses supplies 4,000 Wh/day at the DC bus before controller clipping. If 2,000 Wh of daytime AC appliances run while solar is available, a 90% efficient inverter requires approximately 2,222 Wh for those appliances.</p>
    <p>That leaves at most 1,778 Wh of solar input for charging before standby and other limits. At 95% charging efficiency, approximately <strong>1,689 Wh</strong> can be stored. This simplified energy example assumes suitable overlap; the planner’s schedule and power limits can reduce the amount further.</p>
    <h2>Why a bigger battery may still run down</h2>
    <p>If daily solar energy remains below daily consumption and conversion losses, increasing storage alone does not remove that continuing deficit. The comparison keeps the entered charge percentage constant, so a larger battery also begins with more stored energy. Look at the full simulated period and the ending charge, not just the first night.</p>
    <h2>How to enter a realistic scenario</h2>
    <ol><li>Enter nominal battery capacity, present capacity, starting charge, reserve and charging target.</li><li>Add appliances and set their daily operating windows. Imported appliance hours are preserved, but start times are assumptions that you must review.</li><li>Enter array watts, local seasonal peak sun hours and losses. Confirm whether solar is actually available to the backup system.</li><li>Enter controller, battery and inverter limits. A zero rating means “not checked”.</li><li>Compare reduced load, added panels or added battery capacity and inspect unserved energy and ending charge.</li></ol>
    <h2>What the solar recharge model includes</h2>
    <p>The model uses 15-minute energy steps and repeats the same daily appliance schedule and smooth daylight profile for one to seven days. Daily PV energy before controller clipping equals array watts × peak sun hours × (1 − PV loss fraction). The daylight shape distributes that energy across the entered solar window; it is an assumption, not measured irradiance.</p>
    <p>Losses are applied once along each relevant energy path. Direct solar-to-load energy does not incur battery charge/discharge losses. Battery charging uses a one-way charge efficiency, and discharge uses a separate one-way discharge efficiency. Controller limits apply before loads and storage; battery charging limits apply to surplus after loads.</p>
    <p>Charging stops at the entered target. “First time to target” is elapsed time from the selected start; if the battery starts at or above target, the result instead shows its first recovery to target after discharging below it.</p>
    <h2>Common solar-charging questions</h2>
    <details><summary>Are peak sun hours the same as daylight hours?</summary><p>No. Peak sun hours describe daily solar energy as equivalent hours at reference irradiance. Daylight duration describes the clock-time window in which the model distributes that energy. Enter a local seasonal resource value rather than treating the example as a forecast.</p></details>
    <details><summary>Will my grid-connected solar recharge a battery during a blackout?</summary><p>Only if the equipment and configuration support it. Some systems shut down solar production during an outage, even if the battery can supply backup loads. Choose “Not confirmed” to exclude solar until you have checked.</p></details>
    <details><summary>Why might actual full charging take longer?</summary><p>Near-full absorption, current taper, cell balancing, battery protection, temperature and changing sunlight are not fully described by an energy-only model. A calculated 100% target is particularly uncertain.</p></details>
    <details><summary>Does scheduled energy coverage certify my inverter or wiring?</summary><p>No. The continuous-energy model caps power but does not simulate an inverter tripping and restarting, short startup pulses, surge duration, wiring, protection or compatibility. Review the separate starting check and manufacturer requirements.</p></details>
    <details><summary>Can I use hourly weather data or a local solar forecast?</summary><p>This release uses manually entered solar resource and an illustrative daily shape. It does not retrieve weather or connect to your inverter. A later location-based model would be a separate feature.</p></details>
    <p><Link href="/battery-runtime-calculator">Check continuous battery runtime without solar</Link>.</p>
  </>;
}
