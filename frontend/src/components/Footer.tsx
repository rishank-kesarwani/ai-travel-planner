import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Cpu, Database, Sparkles, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                <Compass className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NomadAI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flagship AI travel orchestration platform powered by LangGraph workflows, vector RAG citations, and autonomous tool calling.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>All Microservices Operational</span>
            </div>
          </div>

          {/* Architecture & AI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              AI Platform Architecture
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                <span>portfolio-ai-platform</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>LangGraph State Workflows</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Qdrant RAG Vector Ingestion</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Short-Lived JWT & Rate Limiting</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Explore Applications
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plan-trip" className="hover:text-teal-400 transition-colors">
                  AI Trip Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-teal-400 transition-colors">
                  Streaming Assistant & Citations
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-teal-400 transition-colors">
                  Curated Destinations
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-teal-400 transition-colors">
                  Personalization & Memory
                </Link>
              </li>
            </ul>
          </div>

          {/* Portfolio Context */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Enterprise Portfolio
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flagship Project 1 of 9 in the AI Systems Portfolio. Decoupled microservices architecture communicating via verified service contracts.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300 text-xs font-mono">
                <Github className="w-3.5 h-3.5 text-teal-400" />
                ai-travel-planner
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 NomadAI Travel Technologies. Production AI Engineering Portfolio.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Next.js App Router</span>
            <span>•</span>
            <span>NestJS Backend</span>
            <span>•</span>
            <span>BullMQ & Redis</span>
            <span>•</span>
            <span>MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
