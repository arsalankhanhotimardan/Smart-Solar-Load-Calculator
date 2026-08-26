export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto text-slate-300 space-y-5 [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-sky-400 [&>h1]:mb-8 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>p]:leading-relaxed">
        <h1 className="text-sky-400">About Us</h1>
        <p>Welcome to the Smart Solar Load Calculator, developed under the VoltPulse Green Energy initiative. Our mission is to provide accurate, engineering-grade solar system sizing tools for domestic and commercial users.</p>
        <p>Navigating solar requirements can be highly technical. We built this platform to simplify the transition to renewable energy by calculating precise panel quantities, inverter capacities, and battery backup requirements based on real-world appliance data.</p>
        <p>Engineered and maintained in Mardan, Khyber Pakhtunkhwa, we are committed to advancing sustainable energy solutions through accessible technology.</p>
      </div>
    </main>
  );
}