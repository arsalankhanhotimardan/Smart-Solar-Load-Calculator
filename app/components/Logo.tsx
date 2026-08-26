export default function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Sun Rays */}
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 6.34l1.41-1.41" className="text-sky-500/50"/>
        {/* Core Frame */}
        <circle cx="12" cy="12" r="6" className="fill-slate-900 stroke-sky-400" />
        {/* Electrical Pulse */}
        <path d="M13 8L9 13h4l-1 4" className="stroke-emerald-400" strokeWidth="2" />
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-black text-white leading-none tracking-tight">Volt<span className="text-sky-400">Pulse</span></span>
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Calculator</span>
      </div>
    </div>
  );
}