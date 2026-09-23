import React from 'react';
import { Compass, ShieldCheck, Car, Building2, MapPin, Terminal, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeView: 'landing' | 'app-find' | 'app-offer' | 'app-rides' | 'admin' | 'blueprint';
  setActiveView: (view: 'landing' | 'app-find' | 'app-offer' | 'app-rides' | 'admin' | 'blueprint') => void;
  currentUser: User;
  onOpenBlueprint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  currentUser,
  onOpenBlueprint
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Single text wordmark in display face */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 font-bold shadow-xs">
              <span className="text-lg tracking-tighter">W</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              WayMate
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveView('landing')}
            className={`transition-colors hover:text-slate-900 ${activeView === 'landing' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveView('app-find')}
            className={`transition-colors hover:text-slate-900 ${activeView === 'app-find' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Find a Ride
          </button>

          <button
            onClick={() => setActiveView('app-offer')}
            className={`transition-colors hover:text-slate-900 ${activeView === 'app-offer' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            Offer a Ride
          </button>

          <button
            onClick={() => setActiveView('app-rides')}
            className={`transition-colors hover:text-slate-900 ${activeView === 'app-rides' ? 'text-emerald-700 font-semibold' : ''}`}
          >
            My Rides
          </button>

          <button
            onClick={onOpenBlueprint}
            className="transition-colors hover:text-slate-900 flex items-center gap-1.5 text-slate-700 font-semibold"
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-600" />
            <span>Solo Blueprint</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`transition-colors hover:text-slate-900 ${activeView === 'admin' ? 'text-slate-900 font-semibold' : ''}`}
          >
            Admin Ops
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {activeView === 'landing' ? (
            <button
              onClick={() => setActiveView('app-find')}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Launch Web App
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveView('app-offer')}
                className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                + Offer Ride
              </button>
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-slate-700 max-w-[110px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
