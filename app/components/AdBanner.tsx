"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat: "auto" | "horizontal" | "rectangle";
}

export default function AdBanner({ dataAdSlot, dataAdFormat }: AdBannerProps) {
  useEffect(() => {
    try {
      // Initialize the Google AdSense script
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // 1. Force a strict Tailwind height. Horizontal = exactly 100px tall, no exceptions.
  const heightClass = dataAdFormat === "horizontal" ? "h-[100px]" : "min-h-[250px]";

  return (
    <div className={`w-full flex justify-center items-center relative overflow-hidden my-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-inner ${heightClass}`}>
      
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <span className="text-[10px] font-bold text-slate-700 tracking-[0.2em] uppercase">
          Advertisement
        </span>
      </div>

      <ins
        className="adsbygoogle w-full h-full"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        // 2. Shut off Google's aggressive mobile expansion for horizontal ads
        data-full-width-responsive={dataAdFormat === "horizontal" ? "false" : "true"}
      />
    </div>
  );
}