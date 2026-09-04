"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: "auto" | "horizontal" | "rectangle";
}

/**
 * Optional manual-ad component for future use.
 * The current V2 calculator does not place manual ads around interactive controls.
 * If Auto ads are enabled later, this component can remain unused.
 */
export default function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
}: AdBannerProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  const enabled = /^ca-pub-\d+$/.test(client) && /^\d+$/.test(dataAdSlot);

  useEffect(() => {
    if (!enabled) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.warn("AdSense unit could not initialize.", error);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside aria-label="Advertisement" className="my-8 min-h-[120px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/35 p-2">
      <div className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
