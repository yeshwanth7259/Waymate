import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC<{
  onOpenBlueprint: () => void;
  onNavigate: (view: 'landing' | 'app-find' | 'app-offer' | 'app-rides' | 'admin' | 'blueprint') => void;
}> = ({ onOpenBlueprint, onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-bold">
                W
              </div>
              <span className="text-lg font-bold text-slate-900">WayMate</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Karnataka’s daily commute and route-sharing network. Built to solve tech corridor traffic through community-driven seat sharing without commercial surge or predatory markups.
            </p>
            <div className="text-[11px] text-slate-400">
              Designed for Bengaluru, Mysuru, Mangaluru, and Karnataka tech hubs.
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Commuters
            </div>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li><button onClick={() => onNavigate('app-find')} className="hover:text-slate-900">Find a Ride</button></li>
              <li><button onClick={() => onNavigate('app-offer')} className="hover:text-slate-900">Offer Empty Seats</button></li>
              <li><button onClick={() => onNavigate('app-rides')} className="hover:text-slate-900">My Daily Rides</button></li>
              <li><button onClick={() => onNavigate('landing')} className="hover:text-slate-900">Women-Only Rides</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Corridors
            </div>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>Outer Ring Road (Silk Board to ITPL)</li>
              <li>Electronic City Elevated Expressway</li>
              <li>Manyata Embassy Tech Park (Hebbal)</li>
              <li>Sarjapur & Haralur Tech Hub</li>
              <li>Bengaluru - Mysuru Expressway Corridor</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Solo Founder Tools
            </div>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <button onClick={onOpenBlueprint} className="text-emerald-700 font-semibold hover:underline">
                  Solo Founder Architecture Blueprint
                </button>
              </li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-slate-900">Admin Operations Cockpit</button></li>
              <li>Karnataka Non-Commercial MV Act Guidelines</li>
              <li>Spring Boot + PostgreSQL ERD Spec</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} WayMate Mobility Networks. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Operating strictly under Section 66/67 of Motor Vehicles Act (private cost sharing).</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
