'use client';

import React from 'react';
import { ExternalLink, Tag, ShieldCheck } from 'lucide-react';

interface AdCardProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  provider?: string;
  className?: string;
}

export function AdCard({
  title = 'Find Best Hotel & Flight Deals',
  description = 'Compare verified guest reviews, secure free cancellations, and get up to 30% member cashback.',
  ctaText = 'View Live Deals',
  ctaLink = 'https://www.booking.com',
  badge = 'Featured Partner',
  provider = 'Travel Partner',
  className = '',
}: AdCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 border border-teal-500/25 relative overflow-hidden shadow-xl ${className}`}
    >
      <div className="absolute top-0 right-0 px-3 py-1 bg-teal-500/15 border-b border-l border-teal-500/30 rounded-bl-xl text-[10px] font-bold text-teal-300 uppercase tracking-wider">
        {badge}
      </div>

      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <Tag className="w-3.5 h-3.5 text-teal-400" />
          <span>{provider}</span>
        </div>

        <h4 className="text-sm font-bold text-white leading-snug">{title}</h4>

        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>

        <a
          href={ctaLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-teal-500/20 transition-all"
        >
          <span>{ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
