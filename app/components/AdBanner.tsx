"use client";

import React, { useEffect, useRef } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  className = "",
}: AdBannerProps) {
  const adInsRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-pushing ads on re-renders / strict mode
    if (isLoadedRef.current) return;

    try {
      if (window && (window as any).adsbygoogle && adInsRef.current) {
        // Check if the ins element is already filled
        if (adInsRef.current.getAttribute("data-adsbygoogle-status") === "done") {
          return;
        }
        
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoadedRef.current = true;
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div 
      className={`w-full overflow-hidden bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-3 my-6 min-h-[100px] ${className}`}
    >
      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
        Advertisement
      </span>
      
      {/* Google AdSense Ins Tag */}
      <div className="w-full flex justify-center">
        <ins
          ref={adInsRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX"}
          data-ad-slot={dataAdSlot}
          data-ad-format={dataAdFormat}
          data-full-width-responsive={dataFullWidthResponsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}