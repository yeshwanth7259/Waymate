import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { CORRIDOR_POPULAR_PAIRS } from '../data/mockData';

interface HeroSectionProps {
  onSearch: (from: string, to: string) => void;
  onOfferRide: () => void;
  onOpenBlueprint: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOfferRide,
  onOpenBlueprint
}) => {
  const [fromLocation, setFromLocation] = useState('HSR Layout Sector 2');
  const [toLocation, setToLocation] = useState('Whitefield (ITPL)');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(fromLocation, toLocation);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Subheader Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-3">
          <span>Bengaluru & Karnataka Daily Commute Network</span>
          <span aria-hidden="true">·</span>
          <span>Zero Surge Pricing</span>
          <span aria-hidden="true">·</span>
          <span>Verified Workplaces</span>
        </div>

        {/* Hero Headline */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Your route. Someone's already going your way.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            A route-sharing marketplace built specifically for Bengaluru office commuters. Share your daily drive to ORR, Whitefield, Manyata, or Electronic City with verified tech colleagues and recover your travel costs.
          </p>
        </div>

        {/* Quick Corridor Search Card */}
        <div className="mt-8 max-w-4xl rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
            
            {/* Origin Input */}
            <div className="lg:col-span-4 relative">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                From (Origin)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="e.g. HSR Layout, Koramangala, Indiranagar"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Destination Input */}
            <div className="lg:col-span-4 relative">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                To (Destination / Tech Park)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="e.g. Bellandur Ecoworld, ITPL Whitefield, E-City"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Time / Date */}
            <div className="lg:col-span-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Depart Window
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none">
                  <option>08:00 - 09:00 AM</option>
                  <option>09:00 - 10:00 AM</option>
                  <option>05:30 - 06:30 PM</option>
                  <option>06:30 - 07:30 PM</option>
                </select>
              </div>
            </div>

            {/* CTA Button */}
            <div className="lg:col-span-2 pt-2 sm:pt-0">
              <label className="hidden lg:block text-[11px] font-semibold text-transparent uppercase tracking-wider mb-1">
                Action
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-2.5 px-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <Search className="h-4 w-4" />
                <span>Find Rides</span>
              </button>
            </div>

          </form>

          {/* Quick Popular Corridors Chips */}
          <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Popular Corridors:</span>
            {CORRIDOR_POPULAR_PAIRS.slice(0, 3).map((pair, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFromLocation(pair.from);
                  setToLocation(pair.to);
                  onSearch(pair.from, pair.to);
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
              >
                {pair.from} → {pair.to} <span className="font-mono text-slate-400 ml-1">({pair.avgFare})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantified Rigor Proof Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-4">
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              3.8M+
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Daily Corridor Commuters
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-bold text-emerald-600 tabular-nums">
              ₹75
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Avg Cost (vs ₹380 taxi surge)
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              100%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Govt ID & Work Email Verified
            </div>
          </div>

          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              0% detours
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Non-Commercial Route Sharing
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
