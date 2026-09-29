'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Users,
  Compass,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Bookmark,
  CloudSun,
  AlertCircle,
  DollarSign,
  Layers,
  X,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useCurrency } from '../../lib/currency-context';
import { detectCurrencyFromDestination } from '../../lib/currencies';

function PlanTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDest = searchParams?.get('destination') || '';
  const { user } = useAuth();
  const { currency, currencyInfo, setCurrency, supportedCurrencies } = useCurrency();

  const [destination, setDestination] = useState(initialDest);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-20');
  const [budget, setBudget] = useState(currencyInfo.defaultBudget);
  const [travelers, setTravelers] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'culture',
    'nature',
    'food',
  ]);
  const [walkingTolerance, setWalkingTolerance] = useState('moderate');

  // Dynamic automatic day calculation based on user start and end date selection
  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart && endDate) {
      const start = new Date(newStart);
      const end = new Date(endDate);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 0) {
        // Auto-advance end date forward to maintain at least 1 day
        const nextEnd = new Date(start);
        nextEnd.setDate(nextEnd.getDate() + 5);
        setEndDate(nextEnd.toISOString().split('T')[0]);
      }
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    if (startDate && newEnd) {
      const start = new Date(startDate);
      const end = new Date(newEnd);
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 0) {
        const prevStart = new Date(end);
        prevStart.setDate(prevStart.getDate() - 1);
        setStartDate(prevStart.toISOString().split('T')[0]);
      }
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGraphStep, setCurrentGraphStep] = useState<number>(0);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedDestCurrency, setDetectedDestCurrency] = useState<string | null>(null);

  // Sync budget defaults when currency changes if user hasn't generated a plan yet
  useEffect(() => {
    if (!generatedPlan) {
      setBudget(currencyInfo.defaultBudget);
    }
  }, [currencyInfo.code, currencyInfo.defaultBudget, generatedPlan]);

  // Check destination currency heuristic
  const handleDestinationChange = (val: string) => {
    setDestination(val);
    const detected = detectCurrencyFromDestination(val);
    if (detected && detected !== currency) {
      setDetectedDestCurrency(detected);
    } else {
      setDetectedDestCurrency(null);
    }
  };

  const applyDetectedCurrency = () => {
    if (detectedDestCurrency && supportedCurrencies[detectedDestCurrency]) {
      setCurrency(detectedDestCurrency);
      setBudget(supportedCurrencies[detectedDestCurrency].defaultBudget);
      setDetectedDestCurrency(null);
    }
  };

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
    'Analyzing Travel Request & Detecting Regional Currency...',
    'Loading User Profile Preferences & Travel Memory...',
    'Retrieving Travel Knowledge from Vector RAG Index...',
    'Executing Domain Tools (Weather, Hotel, Attractions)...',
    'Generating Multi-Day Personalized Schedule in Target Currency...',
    'Calculating Localized Budget Allocation & Expenses...',
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
        numberOfDays: calculatedDays,
        budget: Number(budget),
        currency: currencyInfo.code,
        travelers: Number(travelers),
        interests: selectedInterests,
        preferences: {
          walkingTolerance,
          foodPreferences: user.preferences?.foodPreferences || ['local_delicacies'],
          preferredCurrency: currencyInfo.code,
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
        numberOfDays: generatedPlan.numberOfDays || calculatedDays,
        budget: generatedPlan.budget,
        currency: generatedPlan.currency || currencyInfo.code,
        travelers: generatedPlan.travelers,
        interests: generatedPlan.interests,
        preferences: generatedPlan.preferences,
        itinerary: generatedPlan.itinerary,
        totalEstimatedCost: generatedPlan.totalEstimatedCost,
        totalEstimatedCostUsd: generatedPlan.totalEstimatedCostUsd,
        budgetBreakdown: generatedPlan.budgetBreakdown,
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

  const planCurrencySymbol = generatedPlan?.currencySymbol || currencyInfo.symbol;
  const planCurrencyCode = generatedPlan?.currency || currencyInfo.code;

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Multi-Currency Autonomous Trip Planner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Craft Your Perfect Itinerary
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enter your destination and budget parameters. All costs are synthesized dynamically in your preferred currency ({currencyInfo.code} {currencyInfo.symbol}).
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
          {/* Destination with inside clear button & Quick Currency Switch Hint */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>Target Destination</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                placeholder="e.g. Mussoorie, Goa, Phuket, Kyoto..."
                required
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-teal-400 font-medium placeholder:text-slate-500"
              />
              {destination && (
                <button
                  type="button"
                  onClick={() => handleDestinationChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                  title="Clear destination"
                  aria-label="Clear destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {detectedDestCurrency && detectedDestCurrency !== currency && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300">
                <span>
                  Destination currency detected: <strong>{detectedDestCurrency} ({supportedCurrencies[detectedDestCurrency]?.symbol})</strong>
                </span>
                <button
                  type="button"
                  onClick={applyDetectedCurrency}
                  className="px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold text-[11px] hover:bg-teal-400 transition-colors"
                >
                  Switch to {detectedDestCurrency}
                </button>
              </div>
            )}
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

          {/* Dates & Dynamic Duration (Days input removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Start Date</label>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400 font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">End Date</label>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'} Duration
                </span>
              </div>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-teal-400 font-medium"
              />
            </div>
          </div>

          {/* Currency Selector & Dynamic Budget Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Budget & Currency</span>
              </label>

              {/* Currency Dropdown in Form */}
              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => {
                    const newCurr = e.target.value;
                    setCurrency(newCurr);
                    setBudget(supportedCurrencies[newCurr]?.defaultBudget || 50000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-teal-300 text-xs font-bold focus:outline-none focus:border-teal-400"
                >
                  {Object.values(supportedCurrencies).map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code} ({item.symbol})
                    </option>
                  ))}
                </select>

                <span className="text-sm font-extrabold text-teal-300 font-mono">
                  {currencyInfo.symbol}{budget.toLocaleString()}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={currencyInfo.minBudget}
              max={currencyInfo.maxBudget}
              step={currencyInfo.step}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{currencyInfo.symbol}{currencyInfo.minBudget.toLocaleString()}</span>
              <span className="text-slate-400">Target Range ({currencyInfo.code})</span>
              <span>{currencyInfo.symbol}{currencyInfo.maxBudget.toLocaleString()}</span>
            </div>
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
              <span>Running LangGraph Workflow in {currencyInfo.code}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate AI Itinerary ({currencyInfo.code})</span>
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
                ai-platform::travel-itinerary-generator [{currencyInfo.code}]
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Graph Execution Succeeded • {planCurrencyCode}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {generatedPlan.destination} ({generatedPlan.numberOfDays} Days)
              </h2>
              <p className="text-xs text-slate-400">
                {generatedPlan.startDate} → {generatedPlan.endDate} • {generatedPlan.travelers} Traveler(s) • Est. Total: <span className="text-teal-300 font-bold">{planCurrencySymbol}{(generatedPlan.totalEstimatedCost || generatedPlan.totalEstimatedCostUsd)?.toLocaleString()}</span>
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

          {/* Weather & Budget Breakdown Badges */}
          <div className="space-y-4">
            {generatedPlan.budgetBreakdown && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Complete Expense Allocation Breakdown ({planCurrencyCode})</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-300 font-bold text-xs">
                    {generatedPlan.isWithinBudget ? '✓ Optimal Budget Plan' : 'Custom Tailored'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400">🏨 Hotel & Stays (45%)</span>
                    <p className="text-teal-300 font-bold font-mono text-sm">
                      {planCurrencySymbol}{(generatedPlan.budgetBreakdown.accommodationTotal || Math.round((generatedPlan.totalEstimatedCost || 50000) * 0.45)).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400">🚗 Cab & Transit (15%)</span>
                    <p className="text-teal-300 font-bold font-mono text-sm">
                      {planCurrencySymbol}{(generatedPlan.budgetBreakdown.localTransportTotal || generatedPlan.budgetBreakdown.transportationTotal || Math.round((generatedPlan.totalEstimatedCost || 50000) * 0.15)).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400">🍱 Food & Dining (25%)</span>
                    <p className="text-teal-300 font-bold font-mono text-sm">
                      {planCurrencySymbol}{(generatedPlan.budgetBreakdown.foodTotal || Math.round((generatedPlan.totalEstimatedCost || 50000) * 0.25)).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400">🎟️ Sights & Entry (15%)</span>
                    <p className="text-teal-300 font-bold font-mono text-sm">
                      {planCurrencySymbol}{(generatedPlan.budgetBreakdown.activitiesTotal || Math.round((generatedPlan.totalEstimatedCost || 50000) * 0.15)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {generatedPlan.weatherPreview && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <CloudSun className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-200">Regional Weather Forecast</span>
                  <p className="text-slate-400">
                    {generatedPlan.weatherPreview.condition} • {generatedPlan.weatherPreview.temperatureC}°C ({generatedPlan.weatherPreview.temperatureF}°F) • Humidity {generatedPlan.weatherPreview.humidity}%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Day-by-Day Itinerary Plan */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Daily Comprehensive Schedule & Timeline</h3>
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
                    <span className="text-xs text-slate-300 font-mono font-medium">
                      Est. Day Total: {planCurrencySymbol}{(day.estimatedDailyCost || day.estimatedDailyCostUsd)?.toLocaleString()} (Hotel, Cab & Meals incl.)
                    </span>
                  </div>

                  {/* Day Stay & Transport Pill */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-cyan-300 font-bold">🏨 Stay: {day.hotel?.name || `${generatedPlan.destination} Boutique Resort`}</span>
                      <p className="text-[11px] text-slate-400">~{planCurrencySymbol}{(day.hotel?.estimatedCost || 3500)?.toLocaleString()}/night • {day.hotel?.notes || 'Boutique stay with breakfast included'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-bold">🚗 Transit: {day.transport?.mode || 'Private Cab / Scooter Rental'}</span>
                      <p className="text-[11px] text-slate-400">~{planCurrencySymbol}{(day.transport?.estimatedCost || 1200)?.toLocaleString()}/day • {day.transport?.details || 'Dedicated hill transfers'}</p>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sightseeing & Exploration</h4>
                    {day.activities?.map((act: any, aIdx: number) => (
                      <div key={aIdx} className="space-y-1 pl-3 border-l-2 border-teal-500/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200">{act.title}</span>
                          <div className="flex items-center gap-2">
                            {act.estimatedCost !== undefined && act.estimatedCost > 0 ? (
                              <span className="text-teal-300 font-mono font-bold text-[11px]">
                                Entry: {planCurrencySymbol}{act.estimatedCost.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[11px] font-semibold">Free Entry</span>
                            )}
                            <span className="text-slate-400 text-[11px] font-mono">{act.time}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{act.description}</p>
                        {act.tips && (
                          <p className="text-[11px] text-teal-400/90 italic">Tip: {act.tips}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {day.meals && (
                    <div className="pt-2 text-[11px] text-slate-300 border-t border-slate-800/60 flex flex-wrap gap-4">
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
                <span>Verified RAG Citations & Local Currency Grounding</span>
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
          <p className="text-xs text-slate-400">Loading Multi-Currency AI Trip Planner Wizard...</p>
        </div>
      }
    >
      <PlanTripContent />
    </Suspense>
  );
}
