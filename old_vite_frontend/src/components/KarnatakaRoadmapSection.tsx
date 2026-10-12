import React from 'react';
import { KARNATAKA_CITIES } from '../data/mockData';
import { MapPin, ArrowRight } from 'lucide-react';

export const KarnatakaRoadmapSection: React.FC = () => {
  return (
    <section className="border-t border-slate-200 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              Karnataka Regional Scalability
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              From Bengaluru's Tech Corridors to Karnataka's Major Hubs
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Start with Bengaluru's high-density traffic nodes, then activate regional industrial and intercity highway corridors without rearchitecting the platform.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {KARNATAKA_CITIES.map((city) => (
            <div 
              key={city.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                city.status === 'active' 
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' 
                  : city.status === 'beta'
                  ? 'border-sky-200 bg-white'
                  : 'border-slate-200 bg-white opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    city.status === 'active'
                      ? 'bg-emerald-600 text-white'
                      : city.status === 'beta'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {city.status === 'active' ? 'Active Pilot Hub' : city.status === 'beta' ? 'Beta Corridor' : 'Planned Rollout'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {city.targetLaunch}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className={`h-4 w-4 shrink-0 ${city.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <h3 className="text-base font-bold text-slate-900">
                    {city.name}
                  </h3>
                </div>

                <div className="mt-1 text-xs text-slate-500 font-medium">
                  {city.commutersDaily}
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="text-[11px] font-semibold text-slate-400">Primary Commute Corridors:</div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {city.primaryCorridors.slice(0, 2).map((corr, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                        <span className="truncate">{corr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>{city.region}</span>
                {city.status === 'active' ? (
                  <span className="text-emerald-700">1,420+ daily rides live</span>
                ) : (
                  <span className="text-slate-400">Pre-registration open</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
