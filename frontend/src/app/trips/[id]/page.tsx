'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowLeft,
  CloudSun,
  Trash2,
  Edit,
  Tag,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Trip, WeatherData } from '../../../types';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tripId = params?.id as string;
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Fetch Trip Details
  const { data: trip, isLoading, error } = useQuery<Trip>({
    queryKey: ['trip', tripId],
    queryFn: async () => api.get(`/api/v1/trips/${tripId}`),
    enabled: Boolean(tripId),
  });

  // Fetch Weather for Destination
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ['weather', trip?.destination],
    queryFn: async () => api.get(`/api/v1/weather?location=${encodeURIComponent(trip?.destination || '')}`),
    enabled: Boolean(trip?.destination),
  });

  // Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return api.patch(`/api/v1/trips/${tripId}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/api/v1/trips/${tripId}`);
    },
    onSuccess: () => {
      router.push('/trips');
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading your travel itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-rose-400 font-bold">Trip not found or unauthorized access.</p>
        <Link href="/trips" className="text-xs text-teal-400 underline">
          Return to My Trips
        </Link>
      </div>
    );
  }

  const activeDay = trip.itinerary?.[activeDayIndex] || trip.itinerary?.[0];

  return (
    <div className="space-y-8 py-4">
      {/* Back Button */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Trips</span>
      </Link>

      {/* Main Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={trip.status}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-teal-300 text-xs font-bold capitalize focus:outline-none focus:border-teal-400 cursor-pointer"
              >
                <option value="planning">Status: Planning</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="in_progress">Status: In Progress</option>
                <option value="completed">Status: Completed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>

              {trip.aiGenerated && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  LangGraph Orchestrated
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {trip.destination}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" />
                {trip.startDate} → {trip.endDate} ({trip.numberOfDays} Days)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-400" />
                {trip.travelers} Traveler(s)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-400" />
                Total Budget: ${trip.budget}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/ai-assistant?prompt=${encodeURIComponent(`Review my trip to ${trip.destination} and suggest dining spots`)}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI About Trip</span>
            </Link>

            <button
              onClick={() => {
                if (confirm('Delete this trip?')) deleteMutation.mutate();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weather & Budget Stat Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          {weather && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5 text-xs">
              <CloudSun className="w-7 h-7 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-200">{weather.condition}</span>
                <p className="text-slate-400">
                  {weather.temperatureC}°C ({weather.temperatureF}°F) • Humidity: {weather.humidity}%
                </p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs">
            <span className="font-bold text-slate-200">Interests & Tags</span>
            <div className="flex flex-wrap gap-1">
              {(trip.interests || ['culture', 'sightseeing']).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]"
                >
                  #{interest}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs">
            <span className="font-bold text-slate-200">Estimated Cost Allocation</span>
            <p className="text-teal-400 font-extrabold text-sm">
              ${trip.totalEstimatedCostUsd || trip.budget} <span className="text-[10px] text-slate-400 font-normal">/ ${trip.budget} budget</span>
            </p>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {trip.itinerary?.map((day, idx) => (
            <button
              key={day.day}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeDayIndex === idx
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>Day {day.day}</span>
              <span className={`text-[10px] font-normal ${activeDayIndex === idx ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                {day.activities?.length || 0} stops
              </span>
            </button>
          ))}
        </div>

        {/* Selected Day Timeline */}
        {activeDay && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Day {activeDay.day} Theme
                </span>
                <h2 className="text-xl font-bold text-white">{activeDay.theme}</h2>
              </div>
              {activeDay.estimatedDailyCostUsd && (
                <span className="text-xs font-semibold text-slate-400 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 self-start sm:self-auto">
                  Est. Daily Cost: ${activeDay.estimatedDailyCostUsd}
                </span>
              )}
            </div>

            {/* Activities Timeline */}
            <div className="space-y-6">
              {activeDay.activities?.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 glass-panel-hover"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    {idx < (activeDay.activities.length - 1) && (
                      <div className="w-0.5 flex-1 bg-slate-800 my-2" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-white">{activity.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          {activity.time}
                        </span>
                        {activity.estimatedCostUsd !== undefined && (
                          <span className="text-teal-300 font-semibold">
                            ${activity.estimatedCostUsd}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activity.description}
                    </p>

                    {activity.tips && (
                      <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300/90">
                        <span className="font-bold">Insider Tip: </span>
                        <span>{activity.tips}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Meals Section */}
            {activeDay.meals && (
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {activeDay.meals.breakfast && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-slate-300">🍳 Breakfast</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{activeDay.meals.breakfast}</p>
                  </div>
                )}
                {activeDay.meals.lunch && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-slate-300">🍱 Lunch</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{activeDay.meals.lunch}</p>
                  </div>
                )}
                {activeDay.meals.dinner && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-slate-300">🍷 Dinner</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{activeDay.meals.dinner}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Citations Footer */}
      {trip.citations && trip.citations.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Knowledge Base Citations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {trip.citations.map((citation, cIdx) => (
              <div key={cIdx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="font-bold text-slate-200">{citation.title}</span>
                <p className="text-teal-400 text-[11px]">{citation.source}</p>
                {citation.snippet && (
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{citation.snippet}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
