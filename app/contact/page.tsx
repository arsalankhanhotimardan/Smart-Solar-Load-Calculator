export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
        <h1 className="text-sky-400">Contact Us</h1>
        <p>If you have any questions, suggestions, or require technical assistance regarding the Smart Solar Load Calculator, please reach out to us directly.</p>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl not-prose mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Official Contact Details</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li><strong className="text-white">Developer:</strong> Engr. Arsalan Khan</li>
            <li><strong className="text-white">Phone / WhatsApp:</strong> 03339359980</li>
            <li><strong className="text-white">Location:</strong> Mardan, Khyber Pakhtunkhwa, Pakistan</li>
          </ul>
        </div>
      </div>
    </main>
  );
}