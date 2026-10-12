export default function NetBillingNote() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
      <h2 className="text-xl font-black text-white">Net metering vs net billing in Pakistan</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">
        In February 2026 NEPRA replaced net metering with a net-billing model for new solar consumers. Under net billing, units you export are credited at a lower buyback rate than the price you pay for imported units, so using more of your own solar output directly (daytime loads, or a battery) is worth more than exporting it. Reports put agreements signed before 9 February 2026 outside the new rules, and sources differ on the exact new rate.{" "}
        <a
          href="https://profit.pakistantoday.com.pk/2026/02/10/pakistans-power-regulator-ends-net-metering-for-solar-consumers-shifts-to-net-billing-model/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-sky-400 underline underline-offset-4"
        >
          Read the report
        </a>
        .
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-400">Rules and rates have been revised more than once, so confirm the current buyback rate and eligibility with NEPRA or your distribution company before you decide on system size or a battery.</p>
    </section>
  );
}
