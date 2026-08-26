import Link from 'next/link';
import Logo from './Logo';

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link>
          <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-sky-400 transition-colors">Terms</Link>
        </div>

        <div className="flex items-center gap-4">
           <Link href="/contact" className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-sky-900/20">
             Contact Us
           </Link>
        </div>
      </div>
    </nav>
  );
}