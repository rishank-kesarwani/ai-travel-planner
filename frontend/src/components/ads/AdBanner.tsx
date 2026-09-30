'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string;
  testMode?: boolean;
}

export function AdBanner({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'Sponsored Advertisement',
  testMode,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isDev = process.env.NODE_ENV === 'development' || !clientId || testMode;

  useEffect(() => {
    if (isDev) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (err) {
      console.warn('AdSense render notice:', err);
      setAdError(true);
    }
  }, [isDev, slot]);

  // If in dev mode or pending real AdSense approval, render a sleek placeholder preview banner
  if (isDev || adError) {
    return (
      <div
        className={`w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-teal-500/20 p-4 sm:p-5 relative text-center shadow-lg ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  {label}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Exclusive Travel Deals & Stay Rewards
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Save up to 40% on top-rated hotels, boutique resorts, and curated city experiences worldwide.
              </p>
            </div>
          </div>

          <a
            href="https://www.booking.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold transition-colors whitespace-nowrap"
          >
            <span>Explore Partner Deals</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden my-4 text-center ${className}`}>
      <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
        {label}
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
