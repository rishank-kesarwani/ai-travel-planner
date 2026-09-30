'use client';

import React from 'react';
import { Ticket, Star, Clock, ExternalLink, Compass, ShieldCheck, Zap } from 'lucide-react';
import { useCurrency } from '../../lib/currency-context';
import { getGetYourGuideLink, getViatorLink } from '../../lib/affiliates';

export interface RecommendedActivityItem {
  title: string;
  description?: string;
  category?: string;
  durationHours?: number;
  durationText?: string;
  rating?: number;
  reviewCount?: number;
  priceUsd?: number;
  price?: number;
  badge?: string;
  instantConfirmation?: boolean;
  freeCancellation?: boolean;
}

interface ActivityRecommendationsProps {
  destination: string;
  activities?: RecommendedActivityItem[];
  className?: string;
}

export function ActivityRecommendations({
  destination,
  activities,
  className = '',
}: ActivityRecommendationsProps) {
  const { currencyInfo } = useCurrency();

  const defaultActivities: RecommendedActivityItem[] = [
    {
      title: `Skip-the-Line Historic & Cultural Heritage Tour`,
      description: `Guided walk through iconic ancient landmarks with an expert local historian. Includes skip-the-line entry tickets.`,
      category: 'Guided Tour & History',
      durationText: '3 Hours',
      durationHours: 3,
      rating: 4.9,
      reviewCount: 940,
      priceUsd: 28,
      badge: '🔥 Bestseller',
      instantConfirmation: true,
      freeCancellation: true,
    },
    {
      title: `Panoramic Sunset Sightseeing & Photography Excursion`,
      description: `Exclusive viewpoint exploration during golden hour with roundtrip scenic transit and local refreshments.`,
      category: 'Nature & Photography',
      durationText: '2.5 Hours',
      durationHours: 2.5,
      rating: 4.8,
      reviewCount: 620,
      priceUsd: 22,
      badge: '✨ High Demand',
      instantConfirmation: true,
      freeCancellation: true,
    },
    {
      title: `Authentic Street Food Tasting & Culinary Walk`,
      description: `Sample 6+ signature local dishes, tea brews, and regional desserts with a licensed culinary storyteller.`,
      category: 'Food & Culinary',
      durationText: '3.5 Hours',
      durationHours: 3.5,
      rating: 4.9,
      reviewCount: 1100,
      priceUsd: 32,
      badge: '🍲 Foodie Favorite',
      instantConfirmation: true,
      freeCancellation: true,
    },
  ];

  const activityList = activities && activities.length > 0 ? activities : defaultActivities;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Must-Do Tours & Activity Tickets in {destination}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Direct Booking
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Skip lines with mobile e-tickets, verified guides, and free 24-hour cancellation.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-purple-400 font-mono font-semibold self-start sm:self-auto">
          Instant Confirmation Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activityList.map((act, idx) => {
          const actPrice =
            act.price ||
            (act.priceUsd ? Math.round(act.priceUsd * currencyInfo.rateFromUsd) : Math.round(25 * currencyInfo.rateFromUsd));

          const gygLink = getGetYourGuideLink(act.title, destination);
          const viatorLink = getViatorLink(act.title, destination);

          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-purple-500/20 flex flex-col justify-between space-y-4 hover:border-purple-400/50 transition-all shadow-lg group relative overflow-hidden"
            >
              {act.badge && (
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider py-0.5 px-2.5 rounded-full bg-purple-500/15 border border-purple-500/30 self-start">
                  {act.badge}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    {act.title}
                  </h4>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{act.rating || 4.8}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    {act.durationText || `${act.durationHours || 2} Hours`}
                  </span>
                  {act.reviewCount && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({act.reviewCount} verified ratings)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {act.instantConfirmation && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <Zap className="w-2.5 h-2.5" />
                      <span>Instant Voucher</span>
                    </span>
                  )}
                  {act.freeCancellation && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
                      <span>Free Cancel</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Tickets from</span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-purple-300 font-mono">
                      {currencyInfo.symbol}{actPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400"> / person</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={gygLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 shadow-md shadow-purple-500/20 transition-all text-center"
                  >
                    <span>GetYourGuide</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={viatorLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 font-bold text-xs hover:bg-purple-500/10 transition-all text-center"
                  >
                    <span>Viator / Trip</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
