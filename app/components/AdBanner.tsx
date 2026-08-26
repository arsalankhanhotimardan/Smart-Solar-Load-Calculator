"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat: "auto" | "horizontal" | "rectangle";
}

export default function AdBanner({ dataAdSlot, dataAdFormat }: AdBannerProps) {
  useEffect(() => {
    try {
      // Initialize the Google AdSense script only once the component mounts
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center relative overflow-hidden my-6 rounded-2xl bg-slate-900/30 border border-slate-800/50 shadow-inner">
      
      {/* Professional subtle placeholder text behind the ad */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <span className="text-[10px] font-bold text-slate-700 tracking-[0.2em] uppercase">
          Advertisement
        </span>
      </div>

      {/* The AdSense Unit */}
      <div className="w-full overflow-hidden flex justify-center items-center">
        <ins
          className="adsbygoogle w-full"
          style={{ 
            display: "block",
            // Strictly constrain the height on mobile so it doesn't take over the screen
            maxHeight: dataAdFormat === "horizontal" ? "100px" : "280px" 
          }}
          // NOTE: Remember to replace this with your actual client ID when approved!
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
          data-ad-slot={dataAdSlot}
          data-ad-format={dataAdFormat === "auto" ? "horizontal" : dataAdFormat} 
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}