'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import {
  User,
  Brain,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Save,
  Loader2,
  Compass,
  Utensils,
  Footprints,
  Hotel,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updatePreferences } = useAuth();

  const [travelStyle, setTravelStyle] = useState('cultural');
  const [budgetRange, setBudgetRange] = useState('moderate');
  const [walkingTolerance, setWalkingTolerance] = useState('moderate');
  const [accommodationPreference, setAccommodationPreference] = useState('boutique_hotel');
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setTravelStyle(user.preferences.travelStyle || 'cultural');
      setBudgetRange(user.preferences.budgetRange || 'moderate');
      setWalkingTolerance(user.preferences.walkingTolerance || 'moderate');
      setAccommodationPreference(user.preferences.accommodationPreference || 'boutique_hotel');
      setFoodPreferences(user.preferences.foodPreferences || []);
      setPreferredActivities(user.preferences.preferredActivities || []);
    }
  }, [user]);

  const foodOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'halal', label: 'Halal' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'seafood', label: 'Seafood Specialist' },
    { id: 'street_food', label: 'Local Street Food' },
    { id: 'fine_dining', label: 'Fine Dining' },
  ];

  const activityOptions = [
    { id: 'historical_sites', label: 'Historical & Heritage Sites' },
    { id: 'museums', label: 'Art & Museums' },
    { id: 'hiking', label: 'Hiking & Trekking' },
    { id: 'nature', label: 'Scenic Nature & Wildlife' },
    { id: 'beaches', label: 'Coastal & Beaches' },
    { id: 'nightlife', label: 'Nightlife & Bars' },
    { id: 'shopping', label: 'Artisan Markets & Shopping' },
  ];

  const toggleItem = (list: string[], setList: (items: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await updatePreferences({
        travelStyle,
        budgetRange,
        walkingTolerance,
        accommodationPreference,
        foodPreferences,
        preferredActivities,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      // handled
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-teal-400" />
            <span>Profile & AI Travel Memory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your personalized travel constraints. All choices are automatically synced to the AI platform memory store.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI Memory Synchronized!</span>
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 flex-shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-teal-300 text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-white">{user?.name || 'Explorer'}</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono uppercase">
              {user?.role || 'USER'}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user?.email || 'traveler@example.com'}</p>
          <p className="text-[11px] text-teal-400 font-medium">
            Active Memory Profile • RAG User ID Scoped
          </p>
        </div>
      </div>

      {/* Preferences Form */}
      <form
        onSubmit={handleSave}
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Travel Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Preferred Travel Style</span>
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
            >
              <option value="cultural">Cultural & Historic</option>
              <option value="adventure">Adventure & Outdoor</option>
              <option value="relaxation">Relaxation & Spa</option>
              <option value="family">Family Friendly</option>
              <option value="solo">Solo Backpacking</option>
              <option value="couple">Romantic Couple</option>
            </select>
          </div>

          {/* Budget Tier */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Target Budget Tier</span>
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
            >
              <option value="budget">Budget-Friendly (&lt; $90/day)</option>
              <option value="moderate">Moderate Comfort ($90 - $200/day)</option>
              <option value="luxury">Luxury & Premium (&gt; $200/day)</option>
            </select>
          </div>

          {/* Walking Pace / Tolerance */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-teal-400" />
              <span>Walking Tolerance & Daily Pace</span>
            </label>
            <select
              value={walkingTolerance}
              onChange={(e) => setWalkingTolerance(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
            >
              <option value="low">Relaxed / Shorter Walks (&lt; 5,000 steps)</option>
              <option value="moderate">Moderate Active (5,000 - 12,000 steps)</option>
              <option value="high">High / Hiking Enthusiast (&gt; 12,000 steps)</option>
            </select>
          </div>

          {/* Accommodation Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Hotel className="w-4 h-4 text-teal-400" />
              <span>Accommodation Preference</span>
            </label>
            <select
              value={accommodationPreference}
              onChange={(e) => setAccommodationPreference(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
            >
              <option value="boutique_hotel">Boutique Local Hotels</option>
              <option value="hostel">Social Hostels</option>
              <option value="apartment">Private Apartments / Airbnbs</option>
              <option value="resort">All-Inclusive Resorts</option>
              <option value="luxury_hotel">5-Star Luxury Hotels</option>
            </select>
          </div>
        </div>

        {/* Dietary / Food Preferences */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-teal-400" />
            <span>Dietary Requirements & Food Preferences</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((opt) => {
              const active = foodPreferences.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleItem(foodPreferences, setFoodPreferences, opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Preferences */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Preferred Activities & Attractions</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((opt) => {
              const active = preferredActivities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleItem(preferredActivities, setPreferredActivities, opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Preferences & Updating AI Memory...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Sync AI Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
