import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Smart Solar Load Calculator',
  description: 'Learn about VoltPulse Green Energy and the engineering team behind the Smart Solar Load Calculator.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed">
        
        <h1 className="text-sky-400">About Us</h1>
        <p className="text-sky-400 font-medium pb-4 border-b border-slate-800">Engineering the Future of Renewable Energy</p>
        
        <p>VoltPulse Green Energy is dedicated to empowering homeowners, hospitals, and commercial businesses with precise, engineering-grade solar solutions. Founded and developed by <strong>Engr. Arsalan Khan</strong>, our mission is to simplify the complex transition to renewable energy through highly accurate digital tools.</p>
        
        <h3>Why We Built This Tool</h3>
        <p>The Smart Solar Load Calculator was born out of a specific need: bridging the gap between estimated solar guesses and actual electrical engineering formulas. Whether you are dealing with load shedding or looking to eliminate your grid dependency entirely, our tool provides exact load profiling, MPPT inverter sizing, and deep-cycle/lithium battery backup requirements.</p>
        
        <p>We combine technical expertise with accessible, modern interfaces to help you build a reliable, safe, and cost-effective solar infrastructure.</p>

        <h3>Contact & Development</h3>
        <ul>
          <li><strong>Lead Developer:</strong> Engr. Arsalan Khan</li>
          <li><strong>Location:</strong> Mardan, Khyber Pakhtunkhwa, Pakistan</li>
          <li><strong>Official Contact:</strong> 03339359980</li>
        </ul>

      </div>
    </main>
  );
}