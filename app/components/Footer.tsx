import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 pt-12 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-3">
           <Logo />
           <p className="text-slate-500 text-xs text-center md:text-left max-w-sm mt-2 leading-relaxed">
             Engineered for precision. Calculate your exact solar requirements and transition to renewable energy with absolute confidence.
           </p>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-3 text-sm font-medium text-slate-400">
          <Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-sky-400 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link>
        </div>
        
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-10 pt-6 border-t border-slate-800/40 text-center flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-xs text-slate-600">
          © {currentYear} VoltPulse Green Energy. All rights reserved.
        </span>
        <span className="text-xs text-slate-600">
          Developed by Engr. Arsalan Khan
        </span>
      </div>
    </footer>
  );
}