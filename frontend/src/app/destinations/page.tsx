'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Heart,
  Sparkles,
  DollarSign,
  Star,
  ArrowRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Destination, Favorite } from '../../types';

export default function DestinationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [maxBudget, setMaxBudget] = useState(300);

  // Fetch Destinations
  const { data: destinationsData, isLoading } = useQuery<{ items: Destination[]; total: number }>({
    queryKey: ['destinations', query, category, maxBudget],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category !== 'all') params.append('category', category);
      if (maxBudget) params.append('maxBudget', maxBudget.toString());
      return api.get(`/api/v1/destinations?${params.toString()}`);
    },
  });

  // Fetch User Favorites to mark active hearts
  const { data: favorites } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: async () => api.get('/api/v1/favorites'),
    enabled: Boolean(user),
  });

  const favoriteIds = new Set(favorites?.map((f) => f.destinationId?._id || (f.destinationId as any)));

  // Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (destId: string) => {
      if (favoriteIds.has(destId)) {
        return api.delete(`/api/v1/favorites/${destId}`);
      } else {
        return api.post(`/api/v1/favorites/${destId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'beach', label: 'Beach & Island' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'nature', label: 'Nature' },
    { id: 'city', label: 'Urban & City' },
  ];

  const destinations = destinationsData?.items || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Curated Travel Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore World Destinations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Discover verified global destinations cached via high-speed Redis and enriched with domain intelligence.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kyoto, Greece, nature, hiking..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Budget Range */}
          <div className="flex items-center gap-3 w-full md:w-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <SlidersHorizontal className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span className="whitespace-nowrap">Max: ${maxBudget}/day</span>
            <input
              type="range"
              min={50}
              max={500}
              step={25}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-24 sm:w-32 accent-teal-400"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === c.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl glass-panel animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => {
            const isFav = favoriteIds.has(dest._id);

            return (
              <div
                key={dest._id || dest.slug}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 group glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-teal-300 border border-teal-500/20 capitalize">
                      {dest.category}
                    </div>

                    <button
                      onClick={() => toggleFavoriteMutation.mutate(dest._id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:text-rose-400 transition-colors border border-white/10"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'text-rose-400 fill-rose-400' : 'text-slate-300'}`}
                      />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                        {dest.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                      <span className="font-semibold text-teal-400">
                        ${dest.averageDailyCost} <span className="text-[10px] text-slate-500">/ day avg</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">{dest.country}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/60 mt-2">
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    View Details
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
          <MapPin className="w-10 h-10 text-teal-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Destinations Match Your Filter</h3>
          <p className="text-xs text-slate-400">Try broadening your search term or increasing the max budget.</p>
        </div>
      )}
    </div>
  );
}
