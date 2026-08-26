export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed">
        <h1 className="text-sky-400">Terms of Service</h1>
        <p>By accessing and using the Smart Solar Load Calculator, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>Estimation Disclaimer</h3>
        <p>The calculations provided by this application are estimates based on standard wattage and ideal environmental conditions. Real-world solar generation and appliance consumption may vary. This tool is designed for preliminary engineering estimates and should not replace a professional on-site physical survey.</p>
        
        <h3>Liability</h3>
        <p>VoltPulse and its developers shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the calculations provided by this application for purchasing hardware or deploying electrical systems.</p>
      </div>
    </main>
  );
}