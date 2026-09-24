'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Calendar,
  Sparkles,
  MapPin,
  Heart,
  TrendingUp,
  ArrowRight,
  Clock,
  DollarSign,
  Plus,
  Luggage,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { Trip, Destination, Favorite } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch Trips
  const { data: tripsData, isLoading: tripsLoading } = useQuery<{ items: Trip[]; total: number }>({
    queryKey: ['trips', 'dashboard'],
    queryFn: async () => api.get('/api/v1/trips?limit=5'),
  });

  // Fetch Favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: async () => api.get('/api/v1/favorites'),
  });

  // Fetch Featured Destinations for Recommendations
  const { data: featuredDestinations } = useQuery<Destination[]>({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => api.get('/api/v1/destinations/featured'),
  });

  const trips = tripsData?.items || [];
  const upcomingTrip = trips.find((t) => t.status === 'confirmed' || t.status === 'planning') || trips[0];
  const pastTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-10 py-4">
      {/* Header with personalization greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'Explorer'}! 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase">
              {user?.preferences?.travelStyle || 'Cultural'} Traveler
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized memory active: {user?.preferences?.walkingTolerance || 'Moderate'} walking pace • {user?.preferences?.budgetRange || 'Moderate'} budget tier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plan-trip"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>

          <Link
            href="/ai-assistant"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-semibold text-sm hover:border-teal-500/40 transition-all"
          >
            <Compass className="w-4 h-4 text-teal-400" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Trips</span>
            <Luggage className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{tripsData?.total ?? 0}</p>
          <span className="text-[11px] text-teal-400 font-medium">Synchronized with RAG</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">In Planning</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {trips.filter((t) => t.status === 'planning').length}
          </p>
          <span className="text-[11px] text-cyan-400 font-medium">LangGraph draft ready</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Saved Favorites</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">{favorites?.length ?? 0}</p>
          <span className="text-[11px] text-rose-400 font-medium">Bookmarked spots</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Past Journeys</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{pastTrips.length}</p>
          <span className="text-[11px] text-indigo-400 font-medium">Indexed in memory</span>
        </div>
      </div>

      {/* Main Grid: Spotlight upcoming trip + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spotlight Upcoming / Latest Trip */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              <span>Current & Upcoming Journey</span>
            </h2>
            <Link href="/trips" className="text-xs text-teal-400 hover:underline">
              View All Trips
            </Link>
          </div>

          {upcomingTrip ? (
            <div className="glass-panel rounded-2xl p-6 border border-teal-500/20 bg-gradient-to-br from-slate-900/90 to-slate-950 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold capitalize border border-teal-500/30">
                      {upcomingTrip.status}
                    </span>
                    {upcomingTrip.aiGenerated && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/30">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">{upcomingTrip.destination}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {upcomingTrip.startDate} → {upcomingTrip.endDate} ({upcomingTrip.numberOfDays} Days)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${upcomingTrip.budget} Budget
                    </span>
                  </p>
                </div>

                <Link
                  href={`/trips/${upcomingTrip._id}`}
                  className="px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 text-xs font-bold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Full Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Day-by-Day Summary Preview */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Itinerary Snapshot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingTrip.itinerary?.slice(0, 2).map((day) => (
                    <div
                      key={day.day}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-400">Day {day.day}</span>
                        <span className="text-[10px] text-slate-400">{day.activities?.length || 0} Sights</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{day.theme}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {day.activities?.[0]?.title || 'Sightseeing & exploration'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations Preview */}
              {upcomingTrip.citations && upcomingTrip.citations.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-teal-400">RAG Citations Used:</span>
                  <p className="text-slate-400 text-[11px]">
                    {upcomingTrip.citations.map((c) => c.title).join(' • ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-10 text-center space-y-4 border border-slate-800/80">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 mx-auto flex items-center justify-center">
                <Compass className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Upcoming Trips Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Generate your first intelligent personalized travel itinerary with our LangGraph workflow engine.
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

        {/* AI Recommendations & Favorites Column */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>AI Recommended For You</span>
              </h2>
            </div>

            <div className="space-y-3">
              {(featuredDestinations || []).slice(0, 3).map((dest) => (
                <Link
                  key={dest._id || dest.slug}
                  href={`/destinations/${dest.slug}`}
                  className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3.5 glass-panel-hover group block"
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-300 transition-colors">
                      {dest.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{dest.country} • ${dest.averageDailyCost}/day</p>
                    <div className="flex items-center gap-2 text-[10px] text-teal-400 font-medium">
                      <span>★ {dest.rating}</span>
                      <span>•</span>
                      <span className="capitalize">{dest.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Assistant Access */}
          <div className="glass-panel p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-950/40 to-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Ask NomadAI Assistant</h3>
            </div>
            <p className="text-xs text-slate-300">
              Need to adjust day 3, budget a trip to Rome, or find vegetarian food spots in Kyoto?
            </p>
            <Link
              href="/ai-assistant"
              className="block text-center py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-teal-500/20"
            >
              Start Streaming Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
