'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  Luggage,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Trip } from '../../types';

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tripsData, isLoading } = useQuery<{ items: Trip[]; total: number }>({
    queryKey: ['trips', selectedStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchQuery) params.append('destination', searchQuery);
      return api.get(`/api/v1/trips?${params.toString()}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/v1/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const trips = tripsData?.items || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Travel Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your past, current, and upcoming AI-generated travel plans.
          </p>
        </div>

        <Link
          href="/plan-trip"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Plan</span>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto overflow-x-auto">
          {['all', 'planning', 'confirmed', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                selectedStatus === tab
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl glass-panel animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="glass-panel rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-6 glass-panel-hover group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                      trip.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : trip.status === 'completed'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {trip.status}
                  </span>
                  {trip.aiGenerated && (
                    <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    {trip.destination}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {trip.startDate} → {trip.endDate} ({trip.numberOfDays} Days)
                    </span>
                  </p>
                </div>

                <div className="text-xs text-slate-300 font-medium flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                    Budget: ${trip.budget}
                  </span>
                  <span>{trip.travelers} Traveler(s)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this trip itinerary?')) {
                      deleteMutation.mutate(trip._id);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  href={`/trips/${trip._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300"
                >
                  <span>View Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 mx-auto flex items-center justify-center">
            <Luggage className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-base font-bold text-white">No Trips Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don&apos;t have any trips matching the selected filter. Plan a new itinerary with our AI engine!
          </p>
          <Link
            href="/plan-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Trip</span>
          </Link>
        </div>
      )}
    </div>
  );
}
