import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const featuredDestinations = [
    {
      name: 'Kyoto, Japan',
      slug: 'kyoto',
      country: 'Japan',
      category: 'Cultural & Historic',
      cost: '$140/day',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Fushimi Inari Torii', 'Bamboo Groves', 'Gion Machiya'],
    },
    {
      name: 'Santorini, Greece',
      slug: 'santorini',
      country: 'Greece',
      category: 'Coastal Romantic',
      cost: '$210/day',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      highlights: ['Caldera Sunsets', 'Red Beach', 'Akrotiri Ruins'],
    },
    {
      name: 'Reykjavik, Iceland',
      slug: 'reykjavik',
      country: 'Iceland',
      category: 'Extreme Nature',
      cost: '$240/day',
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
      highlights: ['Northern Lights', 'Gullfoss Falls', 'Geothermal Spas'],
    },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider glow-brand">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Powered by LangGraph & Distributed AI Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent Travel Planning, <br />
          <span className="gradient-text">Engineered for Perfection.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Autonomous multi-step travel itineraries generated through specialized LangGraph workflows, grounded by vector RAG citations and personalized user memory.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/plan-trip"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-base hover:opacity-95 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate AI Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/ai-assistant"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-semibold text-base hover:border-teal-500/50 hover:bg-slate-850 transition-all"
          >
            <Zap className="w-4 h-4 text-teal-400" />
            <span>Chat Assistant (Streaming)</span>
          </Link>
        </div>

        {/* Architecture Badges */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>LangGraph Planning</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>RAG Citations</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>BullMQ Async Tasks</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Redis Smart Cache</span>
          </div>
        </div>
      </section>

      {/* Interactive Feature Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Next-Generation Architecture
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Zero direct client-to-LLM exposure. Every action passes through strict enterprise microservice contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">LangGraph State Workflows</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analyzes requests, injects user dietary/walking constraints, retrieves destination facts, drafts schedules, validates daily budgets, and re-plans automatically.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified RAG Citations</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Eliminates hallucinations with strict vector retrieval from curated travel guides, historical trips, and real-time safety indices. Sources are explicitly cited.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80 glass-panel-hover">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Non-Blocking Queues & Caching</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trip changes queue embedding tasks to BullMQ asynchronously. Weather and destination catalogs are cached in Redis with strict TTL policies.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Curated Explorer</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Global Destinations
            </h2>
          </div>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.slug}
              className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 group glass-panel-hover flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-semibold text-teal-300 border border-teal-500/20">
                  {dest.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                  {dest.cost}
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      {dest.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.highlights.map((h) => (
                      <span
                        key={h}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/plan-trip?destination=${encodeURIComponent(dest.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conceptual Workflow Diagram */}
      <section className="glass-panel rounded-3xl p-8 border border-teal-500/20 bg-gradient-to-b from-slate-900/60 to-slate-950/80 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Agentic Orchestration</span>
          <h2 className="text-2xl font-bold text-white">LangGraph Travel Planning Engine</h2>
          <p className="text-xs text-slate-400">
            Conceptually executed by portfolio-ai-platform with real-time feedback loops.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold inline-flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-semibold text-white">Analyze & Personalize</h4>
            <p className="text-xs text-slate-400">Loads user dietary, pace & walking profile memory</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold inline-flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-semibold text-white">Vector RAG Query</h4>
            <p className="text-xs text-slate-400">Fetches verified attractions & safety guidelines</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold inline-flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-semibold text-white">Tool Invocation</h4>
            <p className="text-xs text-slate-400">Queries weather, hotel options, and daily budget</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold inline-flex items-center justify-center">
              4
            </span>
            <h4 className="text-sm font-semibold text-white">Validate & Finalize</h4>
            <p className="text-xs text-slate-400">Self-corrects itinerary & returns verified citations</p>
          </div>
        </div>
      </section>
    </div>
  );
}
