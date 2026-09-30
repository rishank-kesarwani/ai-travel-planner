'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  MapPin,
  Sparkles,
  Calendar,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { CurrencySelector } from './CurrencySelector';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Compass, authRequired: true },
    { name: 'AI Planner', href: '/plan-trip', icon: Sparkles, highlight: true },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, authRequired: true },
    { name: 'My Trips', href: '/trips', icon: Calendar, authRequired: true },
    { name: 'Destinations', href: '/destinations', icon: MapPin },
    { name: 'Favorites', href: '/favorites', icon: Heart, authRequired: true },
  ];

  const filteredLinks = navLinks.filter((link) => !link.authRequired || Boolean(user));

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl 3xl:max-w-[1600px] 4k:max-w-[2000px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 flex-nowrap gap-2 min-w-0">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all flex-shrink-0">
              <img
                src="/logo.png"
                alt="TravelPlanner AI Logo"
                className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                TravelPlanner AI
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  v2.0
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide hidden xl:inline">
                Next-Gen Travel Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 flex-nowrap min-w-0">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                      : link.highlight
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0 ${link.highlight ? 'text-teal-400 animate-pulse' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth & Currency Controls */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 flex-shrink-0">
            <CurrencySelector />

            {user ? (
              <div className="flex items-center space-x-1.5 xl:space-x-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-1.5 xl:space-x-2 px-2.5 xl:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-200 hover:border-teal-500/40 hover:text-white transition-all text-xs xl:text-sm"
                >
                  <div className="w-5 h-5 xl:w-6 xl:h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] xl:max-w-[120px] truncate">{user.name || 'Account'}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Logout"
                  className="p-1.5 xl:p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900/80 transition-colors flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 xl:space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:opacity-95 shadow-md shadow-teal-500/20 transition-all whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Controls */}
          <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
            <CurrencySelector compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  <UserIcon className="w-5 h-5 text-teal-400" />
                  <span>Profile & Preferences</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-slate-800 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium text-slate-300 bg-slate-800 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-slate-950 bg-teal-400 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
