'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MapPin, Sparkles, Star, ArrowRight, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Favorite } from '../../types';

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: async () => api.get('/api/v1/favorites'),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (destId: string) => {
      return api.delete(`/api/v1/favorites/${destId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          <span>Saved Favorites</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your bookmarked world destinations for future trips and AI planning.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl glass-panel animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const dest = fav.destinationId;
            if (!dest) return null;

            return (
              <div
                key={fav._id}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 group glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => removeFavoriteMutation.mutate(dest._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-rose-400 hover:text-white transition-colors border border-white/10"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{dest.description}</p>
                    <span className="text-[11px] text-teal-400 font-semibold block pt-1">
                      ${dest.averageDailyCost}/day avg • {dest.country}
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/60 mt-2">
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Details
                  </Link>

                  <Link
                    href={`/plan-trip?destination=${encodeURIComponent(dest.name)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 text-xs font-bold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plan Trip</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <Heart className="w-10 h-10 text-rose-400/50 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Destinations Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our global destinations and bookmark your favorite spots to plan future travels.
          </p>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-teal-500/20"
          >
            <span>Explore Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
