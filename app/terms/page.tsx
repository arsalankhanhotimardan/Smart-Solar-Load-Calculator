export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
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