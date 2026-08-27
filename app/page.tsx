import SolarLoadBuilder from "./components/SolarLoadBuilder";
import { Metadata } from 'next';
// 1. Import your database actions
import { getDomesticAppliances, getCommercialAppliances, getSolarPanelCatalog } from "./actions"; // Adjust this path if actions.ts is in a different folder

// 2. Next.js Dynamic Metadata for perfect SEO
export const metadata: Metadata = {
  title: 'Smart Solar Load Calculator Pakistan | Find Exact System Size',
  description: 'Accurately calculate your home or commercial power load. Find out exactly how many solar panels, inverters, and batteries you need in Pakistan.',
  keywords: ['solar load calculator pakistan', 'how many solar panels for ac', 'commercial solar calculator', '5kw solar system load', 'hybrid solar calculator'],
  alternates: {
    // FIXED: Changed from voltpulse.com to your actual pages.dev domain
    canonical: 'https://smart-solar-load-calculator.pages.dev',
  }
};

// 3. Add "async" to the Home component so it can fetch data securely during the build
export default async function Home() {
  
  // 4. Fetch the data directly from Neon database
  const domesticCatalog = await getDomesticAppliances().catch(() => []);
  const commercialCatalog = await getCommercialAppliances().catch(() => []);
  const panelCatalog = await getSolarPanelCatalog().catch(() => []);

  // JSON-LD Schema: Tells Google this is an official Software Application
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Smart Solar Load Calculator",
    // FIXED: Changed from voltpulse.com to your actual pages.dev domain
    "url": "https://smart-solar-load-calculator.pages.dev",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript",
    "description": "An advanced engineering calculator for domestic and commercial solar load estimation.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "PKR"
    },
    "creator": {
      "@type": "Person",
      "name": "Engr. Arsalan Khan",
      "jobTitle": "Software and Web Developer",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mardan",
        "addressRegion": "Khyber Pakhtunkhwa",
        "addressCountry": "PK"
      }
    },
    "featureList": [
      "Dynamic load profile generation",
      "Hybrid and On-Grid system sizing",
      "Commercial and domestic facility mapping",
      "Voice command NLP integration"
    ]
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-8">
      {/* Inject Schema into the Head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      <div className="max-w-6xl mx-auto mb-8 text-center mt-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Smart Solar Load Calculator</h1>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          Accurately calculate your power load and engineer the exact solar system size required for your home, factory, or commercial plaza.
        </p>
      </div>
      
      {/* 5. Pass the fetched data directly into your calculator */}
      <SolarLoadBuilder 
        initialDomestic={domesticCatalog}
        initialCommercial={commercialCatalog}
        initialPanels={panelCatalog}
      />
      
      {/* --- SEO FAQ SECTION FOR ADSENSE COMPLIANCE & RANKING --- */}
      <section className="max-w-4xl mx-auto mt-20 mb-16 px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm md:text-base">
            Expert engineering answers for sizing your solar panels, inverters, and battery banks.
          </p>
        </div>

        <div className="space-y-6 text-left">
          {/* FAQ 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors">
            <h3 className="text-lg md:text-xl font-semibold text-sky-400 mb-3">
              What size solar system do I need to run a 1.5 Ton AC?
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              A modern 1.5 Ton DC Inverter AC consumes approximately 1,500 running watts. However, because air conditioners have high starting surge loads, a minimum of a <strong>3kW to 5kW solar system</strong> is required to run the AC alongside standard household appliances (like fans, lights, and a refrigerator) without overloading the inverter.
            </p>
          </div>

          {/* FAQ 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors">
            <h3 className="text-lg md:text-xl font-semibold text-sky-400 mb-3">
              How do I calculate the correct inverter and battery size?
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              To calculate your inverter size, sum up the total wattage of all appliances you want to run simultaneously, then add a 25% safety margin. For your battery bank, calculate your total daily watt-hours, decide how many hours of nighttime backup you need, and factor in the Depth of Discharge (DoD) to ensure you do not drain the batteries completely. Our smart calculator above automates this exact engineering formula.
            </p>
          </div>

          {/* FAQ 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors">
            <h3 className="text-lg md:text-xl font-semibold text-sky-400 mb-3">
              What is the difference between Running Watts and Starting Surge Watts?
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              <strong>Running watts</strong> refers to the continuous power an appliance needs to stay on. <strong>Surge watts</strong> is the massive, temporary spike in power required to start a motor or compressor (found in water pumps, deep freezers, and older ACs). Your solar inverter must be sized to handle the peak surge watts, not just the running watts, to prevent system shutdowns.
            </p>
          </div>

          {/* FAQ 4 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors">
            <h3 className="text-lg md:text-xl font-semibold text-sky-400 mb-3">
              How many solar panels are required for a 5kW or 10kW system?
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              The number of panels depends entirely on the wattage rating of the individual panels you purchase. For example, a 5kW (5,000 watts) system requires about <strong>9 panels</strong> if you use modern 550W high-efficiency modules. A 10kW system would require roughly <strong>18 to 19 panels</strong> of the same wattage. Always factor in a 20% system efficiency loss.
            </p>
          </div>
          
          {/* FAQ 5 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors">
            <h3 className="text-lg md:text-xl font-semibold text-sky-400 mb-3">
              Can I use a smaller battery bank than calculated?
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              It is not recommended. Using an undersized battery bank forces the batteries to discharge too deeply (exceeding their safe Depth of Discharge) and strain the inverter. This significantly reduces the lifespan of the batteries, whether they are Lead-Acid, Tubular, or Lithium Iron Phosphate (LiFePO4). Always size your battery bank slightly larger than your minimum requirement to accommodate future appliance additions.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}