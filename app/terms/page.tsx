import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Smart Solar Load Calculator',
  description: 'Terms of Service and usage limits for the VoltPulse Green Energy calculator.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed">
        
        <h1 className="text-sky-400">Terms of Service</h1>
        <p className="text-sky-400 font-medium pb-4 border-b border-slate-800">Effective Date: August 26, 2026</p>
        
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using the Smart Solar Load Calculator provided by VoltPulse Green Energy, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
        
        <h3>2. Educational and Informational Use</h3>
        <p>The load profiling, inverter sizing, and battery recommendations provided by this tool are generated via engineering algorithms for preliminary planning purposes. While designed for accuracy, real-world solar performance is subject to external variables such as wiring resistance, shading, panel degradation, and regional weather conditions. You should always consult with a certified electrical engineer or solar installation professional before purchasing equipment.</p>
        
        <h3>3. Intellectual Property</h3>
        <p>The Smart Solar Load Calculator, including its original code, algorithms, interface, and content, is the exclusive property of VoltPulse Green Energy and its developer. It is protected by international copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works from this application without explicit permission.</p>
        
        <h3>4. Limitation of Liability</h3>
        <p>In no event shall VoltPulse Green Energy, nor its creators or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, or any financial loss arising out of your access to or use of the application for your solar purchasing decisions.</p>

        <h3>5. Modifications</h3>
        <p>We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>

      </div>
    </main>
  );
}