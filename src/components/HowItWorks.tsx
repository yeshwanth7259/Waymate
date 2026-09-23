import React from 'react';
import { Route, Users, Shield, Wallet } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Publish or Search Your Corridor Route',
      desc: 'Drivers post their existing office journey with origin, key flyover stops, departure time, and vacant seats. Commuters search for people travelling the exact same corridor.',
      icon: Route
    },
    {
      step: '02',
      title: 'Smart Polyline Overlap Matching',
      desc: 'Our engine matches passengers along the driver’s natural travel path (e.g. Silk Board → Bellandur → Whitefield). Zero inconvenient detours for the driver.',
      icon: Users
    },
    {
      step: '03',
      title: 'Verified Profiles & 4-Digit Ride PIN',
      desc: 'Both parties see corporate badges, work emails, and car details. When boarding, the passenger provides a secure 4-digit Ride PIN to initiate the verified trip.',
      icon: Shield
    },
    {
      step: '04',
      title: 'Legally Compliant Travel Cost Sharing',
      desc: 'Fares are capped to actual fuel and toll costs under Karnataka non-commercial motor rules. No dynamic surge, no meter rigging, and no commercial taxi overhead.',
      icon: Wallet
    }
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
            Engineered For Bengaluru's Commute
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            How WayMate Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Unlike commercial taxis where drivers roam searching for passengers, WayMate connects people who are already commuting in the same direction.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-bold text-slate-400">
                      {item.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] font-medium text-emerald-700">
                  Built for office carpools →
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
