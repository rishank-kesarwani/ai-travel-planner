'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Sparkles,
  DollarSign,
  Star,
  Calendar,
  CloudSun,
  Heart,
  ArrowLeft,
  Clock,
  Compass,
  MessageCircle,
  Plus,
  Send,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { Destination, WeatherData, Review, Favorite } from '../../../types';

export default function DestinationDetailPage() {
  const params = useParams();
  const identifier = params?.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch Destination
  const { data: destination, isLoading } = useQuery<Destination>({
    queryKey: ['destination', identifier],
    queryFn: async () => api.get(`/api/v1/destinations/${identifier}`),
    enabled: Boolean(identifier),
  });

  // Fetch Weather
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ['weather', destination?.name],
    queryFn: async () => api.get(`/api/v1/weather?location=${encodeURIComponent(destination?.name || '')}`),
    enabled: Boolean(destination?.name),
  });

  // Fetch Reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['reviews', destination?._id],
    queryFn: async () => api.get(`/api/v1/reviews/destination/${destination?._id}`),
    enabled: Boolean(destination?._id),
  });

  // Fetch Favorites
  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: ['favorite-check', destination?._id],
    queryFn: async () => api.get(`/api/v1/favorites/check/${destination?._id}`),
    enabled: Boolean(user && destination?._id),
  });

  // Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favoriteStatus?.isFavorite) {
        return api.delete(`/api/v1/favorites/${destination?._id}`);
      } else {
        return api.post(`/api/v1/favorites/${destination?._id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-check', destination?._id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  // Submit Review
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/api/v1/reviews/destination/${destination?._id}`, {
        rating: Number(rating),
        comment,
      });
    },
    onSuccess: () => {
      setComment('');
      setShowReviewModal(false);
      queryClient.invalidateQueries({ queryKey: ['reviews', destination?._id] });
      queryClient.invalidateQueries({ queryKey: ['destination', identifier] });
    },
  });

  if (isLoading || !destination) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading destination intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/destinations"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Destinations Catalog</span>
      </Link>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
        <div className="h-72 sm:h-96 relative">
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Quick CTAs on Hero */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {user && (
              <button
                onClick={() => toggleFavoriteMutation.mutate()}
                className="p-3 rounded-full bg-slate-950/80 backdrop-blur-md text-white hover:text-rose-400 transition-colors border border-white/10"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favoriteStatus?.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-slate-300'
                  }`}
                />
              </button>
            )}
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold capitalize border border-teal-500/30">
                  {destination.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-amber-400 text-xs font-bold flex items-center gap-1 border border-white/10">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {destination.rating} ({destination.reviewCount} reviews)
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {destination.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{destination.country} • {destination.region}</span>
              </p>
            </div>

            <Link
              href={`/plan-trip?destination=${encodeURIComponent(destination.name)}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Itinerary</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Info Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400">Average Daily Cost</span>
          <p className="text-lg font-bold text-teal-300">${destination.averageDailyCost} <span className="text-xs font-normal text-slate-400">/ day</span></p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400">Popular Season</span>
          <p className="text-sm font-bold text-white">{destination.popularSeason}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400">Currency</span>
          <p className="text-sm font-bold text-white">{destination.currency || 'USD'}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400">Coordinates</span>
          <p className="text-xs font-mono text-slate-300">{destination.coordinates?.lat}, {destination.coordinates?.lng}</p>
        </div>
      </div>

      {/* Description & Weather Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">About {destination.name}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{destination.description}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {destination.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Top Attractions List */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-400" />
              <span>Signature Attractions & Highlights</span>
            </h2>

            <div className="space-y-4">
              {destination.topAttractions?.map((attraction, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel-hover"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{attraction.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 pl-7">{attraction.description}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-300 pl-7 sm:pl-0">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      {attraction.estimatedTimeHours} hrs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono">
                      {attraction.costUsd > 0 ? `$${attraction.costUsd}` : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Weather Widget & Quick Action */}
        <div className="space-y-6">
          {weather && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>Current Weather</span>
                </h3>
                <span className="text-xs text-slate-400">{weather.condition}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-white">
                  {weather.temperatureC}°C
                </span>
                <div className="text-xs text-slate-400">
                  <p>{weather.temperatureF}°F</p>
                  <p>Humidity: {weather.humidity}%</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">5-Day Outlook</span>
                <div className="space-y-1.5">
                  {weather.forecast?.map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                      <span className="text-slate-400">{day.day}</span>
                      <span className="text-[11px]">{day.condition}</span>
                      <span className="font-mono text-teal-300">{day.tempHighC}° / {day.tempLowC}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Travel Assistant Prompt Card */}
          <div className="glass-panel rounded-3xl p-6 border border-teal-500/30 bg-gradient-to-br from-slate-900 to-teal-950/40 space-y-3">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Customize with NomadAI</h3>
            <p className="text-xs text-slate-300">
              Ask questions about local customs, hidden viewpoints, or vegetarian food in {destination.name}.
            </p>
            <Link
              href={`/ai-assistant?prompt=${encodeURIComponent(`Tell me about hidden gems and local food in ${destination.name}`)}`}
              className="block text-center py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:opacity-95 shadow-md shadow-teal-500/20"
            >
              Ask AI Travel Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Community Traveler Reviews */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Traveler Reviews & Tips</h2>
            <p className="text-xs text-slate-400">Real feedback from community travelers</p>
          </div>

          {user && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-teal-300 hover:border-teal-400 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          )}
        </div>

        {/* Review Form Modal / Inline */}
        {showReviewModal && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-3 animate-fade-in">
            <h3 className="text-sm font-bold text-white">Share Your Experience</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300">Rating:</span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-2 py-1 rounded bg-slate-800 text-white text-xs border border-slate-700"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love? Any tips on pacing or food?"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-teal-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => submitReviewMutation.mutate()}
                disabled={!comment.trim() || submitReviewMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews && reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{rev.userName || 'Traveler'}</span>
                  <div className="flex items-center text-amber-400 font-bold">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-500 block">Visited: {rev.visitedDate || 'Recent'}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">
              No reviews yet. Be the first traveler to write a review!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
