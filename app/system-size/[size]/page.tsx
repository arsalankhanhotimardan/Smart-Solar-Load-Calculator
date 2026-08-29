import { Metadata } from 'next';
import AdBanner from '@/app/components/AdBanner';
import SolarLoadBuilder from '@/app/components/SolarLoadBuilder'; 

// IMPORT YOUR DATABASE ACTIONS
// Using relative path to go up two directories to reach the app folder
import { getDomesticAppliances, getCommercialAppliances, getSolarPanelCatalog } from '../../actions';

export const dynamic = "force-static";

// 1. GENERATE URLS
export function generateStaticParams() {
  return [
    { size: '3kw' },
    { size: '5kw' },
    { size: '7-5kw' },
    { size: '10kw' },
    { size: '15kw' },
    { size: '20kw' },
  ];
}

type Props = {
  params: Promise<{ size: string }>;
};

// 2. DYNAMIC SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const formattedSize = resolvedParams.size.replace('-', '.').toUpperCase();
  
  return {
    title: `${formattedSize} Solar System Load Calculator & Appliance Guide`,
    description: `Calculate exactly what appliances a ${formattedSize} solar system can run. Get accurate load calculations, inverter sizing, and battery backup requirements.`,
    alternates: {
      canonical: `https://solarcalculator.greenengineeringtools.com/system-size/${resolvedParams.size}`,
    }
  };
}

// 3. PAGE CONTENT
export default async function SystemSizePage({ params }: Props) {
  const resolvedParams = await params;
  const formattedSize = resolvedParams.size.replace('-', '.').toUpperCase();
  
  // FETCH DATA FROM YOUR NEON DATABASE
  const domesticCatalog = await getDomesticAppliances().catch(() => []);
  const commercialCatalog = await getCommercialAppliances().catch(() => []);
  const panelCatalog = await getSolarPanelCatalog().catch(() => []);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      
      {/* Dynamic Header */}
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          What Can a <span className="text-sky-400">{formattedSize} Solar System</span> Run?
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Use our interactive engineering tool below to design your custom {formattedSize} setup. Scroll down to read our comprehensive technical guide on {formattedSize} installations, battery requirements, and typical load limits.
        </p>
      </div>

      {/* RENDER THE LIVE CALCULATOR */}
      <div className="mb-16">
         <SolarLoadBuilder 
           initialDomestic={domesticCatalog}
           initialCommercial={commercialCatalog}
           initialPanels={panelCatalog}
         />
      </div>

      {/* AD CONTAINER */}
      <AdBanner dataAdSlot="3333333333" dataAdFormat="horizontal" />

      {/* ADSENSE-COMPLIANT LONG-FORM ARTICLE */}
      <article className="mt-12 bg-slate-900/80 border border-slate-800 p-8 md:p-12 rounded-3xl text-slate-300">
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Comprehensive Engineering Guide to {formattedSize} Solar Systems</h2>
        
        <p className="mb-6 leading-relaxed">
          A <strong>{formattedSize} solar system</strong> is one of the most highly sought-after capacities for balancing energy independence with cost efficiency. Whether you are dealing with frequent load shedding or looking to eliminate your grid dependency globally, a properly sized {formattedSize} setup provides robust, reliable performance for high-draw appliances.
        </p>

        <h3 className="text-xl font-bold text-sky-400 mt-10 mb-4">Typical Appliance Load Capacity</h3>
        <p className="mb-4 leading-relaxed">
          When engineering a {formattedSize} array, it is crucial to understand peak running watts versus starting surge watts. While specific capacities vary based on the exact MPPT inverter efficiency, a {formattedSize} system can comfortably support:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-8 text-slate-400">
          <li>Multiple DC inverter air conditioners (typically 1 to 1.5 tons depending on simultaneous usage)</li>
          <li>Standard household refrigeration and deep freezer units</li>
          <li>Water pumps (ensure the inverter can handle the high inductive starting torque)</li>
          <li>Essential lighting, ceiling fans, and IT equipment</li>
        </ul>

        <h3 className="text-xl font-bold text-emerald-400 mt-10 mb-4">Battery Bank and Hybrid Configurations</h3>
        <p className="mb-8 leading-relaxed">
          For a true hybrid setup, coupling your {formattedSize} panels with a compatible hybrid inverter and lithium iron phosphate (LiFePO4) or deep-cycle tubular batteries is strictly recommended. This ensures that the energy harvested during peak sun hours is efficiently stored for nighttime usage or grid outages.
        </p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner">
          <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pro Engineering Tip
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Always account for a 20-25% derating factor. A {formattedSize} designation refers to the theoretical DC output under Standard Test Conditions (STC) in a laboratory. Real-world AC output delivered to your appliances will be slightly lower due to inverter efficiency losses, ambient temperature, wiring resistance, and panel degradation over time.
          </p>
        </div>
      </article>

    </div>
  );
}