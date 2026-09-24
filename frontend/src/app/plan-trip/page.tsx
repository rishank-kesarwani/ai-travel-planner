'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  CloudSun,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

function PlanTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDest = searchParams?.get('destination') || 'Kyoto, Japan';
  const { user } = useAuth();

  const [destination, setDestination] = useState(initialDest);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [numberOfDays, setNumberOfDays] = useState(5);
  const [budget, setBudget] = useState(1500);
  const [travelers, setTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'culture',
    'historical_sites',
    'food',
  ]);
  const [walkingTolerance, setWalkingTolerance] = useState('moderate');

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGraphStep, setCurrentGraphStep] = useState<number>(0);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableInterests = [
    { id: 'culture', label: 'Cultural Temples & Heritage' },
    { id: 'food', label: 'Culinary & Local Delicacies' },
    { id: 'nature', label: 'Scenic Nature & Landscapes' },
    { id: 'historical_sites', label: 'Ancient Historical Sites' },
    { id: 'hiking', label: 'Mountain Trails & Hiking' },
    { id: 'relaxation', label: 'Thermal Spas & Wellness' },
    { id: 'beaches', label: 'Beaches & Coastal Walks' },
    { id: 'nightlife', label: 'Nightlife & Evening Bars' },
  ];

  const graphSteps = [
    'Analyzing Travel Request & Routing Workflow...',
    'Loading User Profile Preferences & Travel Memory...',
    'Retrieving Travel Knowledge from Vector RAG Index...',
    'Executing Domain Tools (Weather, Hotel, Attractions)...',
    'Generating Multi-Day Personalized Schedule...',
    'Calculating Budget Allocation & Itemized Expenses...',
    'Validating Pacing & Verifying Source Citations...',
    'Synthesizing Verified Final Itinerary!',
  ];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setCurrentGraphStep(0);
    setGeneratedPlan(null);

    const stepInterval = setInterval(() => {
      setCurrentGraphStep((prev) => {
        if (prev < graphSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const result: any = await api.post('/api/v1/ai/trips/generate', {
        destination,
        startDate,
        endDate,
        numberOfDays: Number(numberOfDays),
        budget: Number(budget),
        travelers: Number(travelers),
        interests: selectedInterests,
        preferences: {
          walkingTolerance,
          foodPreferences: user.preferences?.foodPreferences || ['local_delicacies'],
        },
      });

      clearInterval(stepInterval);
      setCurrentGraphStep(graphSteps.length - 1);
      setGeneratedPlan(result);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const saved: any = await api.post('/api/v1/trips', {
        destination: generatedPlan.destination,
        destinationSlug: generatedPlan.destinationSlug,
        startDate: generatedPlan.startDate,
        endDate: generatedPlan.endDate,
        numberOfDays: generatedPlan.numberOfDays,
        budget: generatedPlan.budget,
        travelers: generatedPlan.travelers,
        interests: generatedPlan.interests,
        preferences: generatedPlan.preferences,
        itinerary: generatedPlan.itinerary,
        citations: generatedPlan.citations,
        status: 'planning',
        aiGenerated: true,
      });

      router.push(`/trips/${saved._id || (saved as any)?.data?._id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save trip to your account.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>LangGraph Autonomous Trip Planner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Craft Your Perfect Itinerary
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your trip parameters. The AI Platform executes a stateful planning graph grounded in RAG knowledge and user preferences.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Configuration Form */}
      <form
        onSubmit={handleGenerate}
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Target Destination</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kyoto, Japan or Rome, Italy"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-teal-400 font-medium"
            />
          </div>

          {/* Travelers & Walking Tolerance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Travelers</span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>Pace / Walking</span>
              </label>
              <select
                value={walkingTolerance}
                onChange={(e) => setWalkingTolerance(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
              >
                <option value="low">Relaxed / Minimal Walk</option>
                <option value="moderate">Moderate Active</option>
                <option value="high">High / Hiking Pace</option>
              </select>
            </div>
          </div>

          {/* Dates & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-slate-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-slate-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase text-slate-300">Days</label>
              <input
                type="number"
                min={1}
                max={30}
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Target Total Budget (USD)</span>
              </label>
              <span className="text-sm font-extrabold text-teal-300">${budget}</span>
            </div>
            <input
              type="range"
              min={300}
              max={10000}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>
        </div>

        {/* Interests Pills */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Select Your Interests & Activities
          </label>
          <div className="flex flex-wrap gap-2.5">
            {availableInterests.map((item) => {
              const active = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/10'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-base hover:opacity-95 shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running LangGraph Workflow...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Itinerary</span>
            </>
          )}
        </button>
      </form>

      {/* LangGraph Live Execution Visualizer */}
      {isGenerating && (
        <div className="glass-panel rounded-3xl p-8 border border-teal-500/30 bg-slate-950/90 space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-teal-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                LangGraph Planning Pipeline Active
              </h3>
              <p className="text-xs text-teal-400 font-mono">
                portfolio-ai-platform::travel-itinerary-generator
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {graphSteps.map((step, idx) => {
              const isPassed = idx < currentGraphStep;
              const isCurrent = idx === currentGraphStep;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-teal-500/15 border-teal-500/40 text-teal-200'
                      : isPassed
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span className="font-mono">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generated Itinerary Display */}
      {generatedPlan && !isGenerating && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/40 space-y-8 animate-fade-in shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Graph Execution Succeeded</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {generatedPlan.destination} ({generatedPlan.numberOfDays} Days)
              </h2>
              <p className="text-xs text-slate-400">
                {generatedPlan.startDate} → {generatedPlan.endDate} • {generatedPlan.travelers} Traveler(s) • Est. Cost: ${generatedPlan.totalEstimatedCostUsd}
              </p>
            </div>

            <button
              onClick={handleSaveTrip}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:opacity-95 shadow-lg shadow-teal-500/20 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save to My Trips</span>
                </>
              )}
            </button>
          </div>

          {/* Weather & Budget Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlan.weatherPreview && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <CloudSun className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-200">Weather Forecast</span>
                  <p className="text-slate-400">
                    {generatedPlan.weatherPreview.condition} • {generatedPlan.weatherPreview.temperatureC}°C ({generatedPlan.weatherPreview.temperatureF}°F)
                  </p>
                </div>
              </div>
            )}

            {generatedPlan.budgetBreakdown && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-200">Budget Breakdown</span>
                  <p className="text-slate-400">
                    Hotels: ${generatedPlan.budgetBreakdown.accommodationTotalUsd} • Food: ${generatedPlan.budgetBreakdown.foodTotalUsd}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 font-bold">
                  {generatedPlan.isWithinBudget ? '✓ Within Budget' : 'Adjusted'}
                </span>
              </div>
            )}
          </div>

          {/* Day-by-Day Itinerary Plan */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Daily Schedule & Activities</h3>
            <div className="space-y-4">
              {generatedPlan.itinerary?.map((day: any) => (
                <div
                  key={day.day}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-800/80">
                    <span className="text-sm font-bold text-teal-400">
                      Day {day.day}: {day.theme}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Est. Daily: ${day.estimatedDailyCostUsd}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {day.activities?.map((act: any, aIdx: number) => (
                      <div key={aIdx} className="space-y-1 pl-3 border-l-2 border-teal-500/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{act.title}</span>
                          <span className="text-slate-400 text-[11px] font-mono">{act.time}</span>
                        </div>
                        <p className="text-xs text-slate-400">{act.description}</p>
                        {act.tips && (
                          <p className="text-[11px] text-teal-400/90 italic">Tip: {act.tips}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {day.meals && (
                    <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 flex flex-wrap gap-4">
                      <span>🍳 {day.meals.breakfast}</span>
                      <span>🍱 {day.meals.lunch}</span>
                      <span>🍷 {day.meals.dinner}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Citations Footer */}
          {generatedPlan.citations && generatedPlan.citations.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified RAG Citations (No Hallucinations)</span>
              </div>
              <div className="space-y-1.5">
                {generatedPlan.citations.map((c: any, cIdx: number) => (
                  <div key={cIdx} className="text-xs">
                    <span className="font-semibold text-slate-300">• {c.title}</span>
                    {c.source && <span className="text-slate-500"> ({c.source})</span>}
                    {c.snippet && <p className="text-[11px] text-slate-400 pl-3">{c.snippet}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlanTripPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading AI Trip Planner Wizard...</p>
        </div>
      }
    >
      <PlanTripContent />
    </Suspense>
  );
}
