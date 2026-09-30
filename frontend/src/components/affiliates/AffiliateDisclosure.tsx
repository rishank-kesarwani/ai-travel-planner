'use client';

import React from 'react';
import { Info } from 'lucide-react';

export function AffiliateDisclosure({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 leading-normal ${className}`}
    >
      <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
      <p>
        <span className="font-semibold text-slate-300">Partner Disclosure:</span> When you book stays or activities through our affiliate partner links, we may earn an affiliate commission at no extra cost to you. This helps support our free AI planning tools.
      </p>
    </div>
  );
}
