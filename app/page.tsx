import SolarLoadBuilder from "./components/SolarLoadBuilder";
import { Metadata } from 'next';
// 1. Import your database actions
import { getDomesticAppliances, getCommercialAppliances, getSolarPanelCatalog } from "../actions"; // Adjust this path if actions.ts is in a different folder

// 2. Next.js Dynamic Metadata for perfect SEO
export const metadata: Metadata = {
  title: 'Smart Solar Load Calculator Pakistan | Find Exact System Size',
  description: 'Accurately calculate your home or commercial power load. Find out exactly how many solar panels, inverters, and batteries you need in Pakistan.',
  keywords: ['solar load calculator pakistan', 'how many solar panels for ac', 'commercial solar calculator', '5kw solar system load', 'hybrid solar calculator'],
  alternates: {
    canonical: 'https://www.voltpulse.com/solar-calculator',
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
    "@type": "SoftwareApplication",
    "name": "Smart Solar Load Calculator",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "An advanced engineering calculator for domestic and commercial solar load estimation in Pakistan.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PKR"
    },
    "creator": {
      "@type": "Organization",
      "name": "VoltPulse Green Energy"
    }
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
      
      {/* Hidden SEO Content block (Google bots read this, users scroll past it) */}
      <article className="max-w-4xl mx-auto mt-16 prose prose-invert prose-sm text-slate-500">
        <h2>How to calculate your solar load in Pakistan?</h2>
        <p>Whether you are in Mardan, Peshawar, or anywhere else, calculating your solar load is the most critical step before installing a system. Our tool covers both domestic homes and commercial facilities (schools, hospitals, industries).</p>
        <h3>Can a 5kW system run a 1.5 Ton AC?</h3>
        <p>Yes, a standard 1.5 Ton Inverter AC consumes around 1500W. A 5kW system can easily support 1-2 Inverter ACs along with standard home appliances during peak sunlight hours.</p>
      </article>
    </main>
  );
}