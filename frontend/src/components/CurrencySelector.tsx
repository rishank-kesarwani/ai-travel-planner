'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useCurrency } from '../lib/currency-context';

export function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, currencyInfo, setCurrency, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/70 hover:border-teal-500/50 text-slate-200 hover:text-white transition-all text-xs font-semibold shadow-sm ${
          compact ? 'px-2 py-1' : ''
        }`}
        title={`Active Currency: ${currencyInfo.name} (${currencyInfo.symbol})`}
      >
        <span className="text-sm">{currencyInfo.flag}</span>
        <span className="font-mono text-teal-300 font-bold">{currencyInfo.code}</span>
        <span className="text-slate-400 font-normal">({currencyInfo.symbol})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl py-2 z-50 animate-fade-in divide-y divide-slate-800/60">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-teal-400" />
            <span>Select Currency</span>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
            {Object.values(supportedCurrencies).map((item) => {
              const isSelected = item.code === currency;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCurrency(item.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-teal-500/15 text-teal-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{item.code}</span>
                      <span className="text-[10px] text-slate-400">{item.name}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-teal-400 text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {item.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
