import React, { useState } from 'react';
import { Navigation2, CheckCircle2, Zap, ArrowRight, ShieldCheck, Fuel } from 'lucide-react';

interface CorridorNode {
  id: string;
  name: string;
  subtext: string;
  x: number; // percentage
  y: number; // percentage
  corridor: string;
}

const NODES: CorridorNode[] = [
  { id: 'manyata', name: 'Manyata Tech Park', subtext: 'Hebbal / Nagawara', x: 50, y: 15, corridor: 'North Tech' },
  { id: 'indiranagar', name: 'Indiranagar', subtext: '100ft Rd / Metro', x: 42, y: 35, corridor: 'Central-East' },
  { id: 'whitefield', name: 'ITPL Whitefield', subtext: 'Hope Farm / EPIP', x: 82, y: 40, corridor: 'East IT Spine' },
  { id: 'marathahalli', name: 'Marathahalli Bridge', subtext: 'ORR Cross', x: 68, y: 48, corridor: 'ORR Spine' },
  { id: 'bellandur', name: 'Bellandur (RMZ Ecoworld)', subtext: 'Cessna / Tech Corridor', x: 58, y: 60, corridor: 'ORR Spine' },
  { id: 'hsr', name: 'HSR Layout', subtext: 'Sector 1-6 BDA', x: 44, y: 68, corridor: 'ORR Spine' },
  { id: 'silkboard', name: 'Silk Board Junction', subtext: 'BTM / Flyover Node', x: 36, y: 74, corridor: 'Express Node' },
  { id: 'ecity', name: 'Electronic City Phase 1 & 2', subtext: 'Infosys / Wipro Gates', x: 48, y: 92, corridor: 'South Express' }
];

export const CorridorMapVisual: React.FC<{
  onSelectCorridor?: (from: string, to: string) => void;
}> = ({ onSelectCorridor }) => {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('hsr');
  const [selectedDest, setSelectedDest] = useState<string>('whitefield');

  const originNode = NODES.find(n => n.id === selectedOrigin) || NODES[5];
  const destNode = NODES.find(n => n.id === selectedDest) || NODES[2];

  // Calculate matching stats
  const isDirectOrrMatch = (selectedOrigin === 'hsr' || selectedOrigin === 'silkboard') && 
                           (selectedDest === 'bellandur' || selectedDest === 'whitefield' || selectedDest === 'marathahalli');

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="text-xs font-semibold text-emerald-600">
            Intelligent Matching Architecture
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Bengaluru Tech Corridors Route Engine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any two corridor nodes below to simulate real-time route overlap matching
          </p>
        </div>

        {/* Quick Corridor Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0">
          <button
            onClick={() => { setSelectedOrigin('hsr'); setSelectedDest('whitefield'); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedOrigin === 'hsr' && selectedDest === 'whitefield'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            HSR → Whitefield
          </button>
          <button
            onClick={() => { setSelectedOrigin('silkboard'); setSelectedDest('ecity'); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedOrigin === 'silkboard' && selectedDest === 'ecity'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Silk Board → E-City
          </button>
          <button
            onClick={() => { setSelectedOrigin('indiranagar'); setSelectedDest('manyata'); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedOrigin === 'indiranagar' && selectedDest === 'manyata'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Indiranagar → Manyata
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Schematic Interactive Map Canvas */}
        <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-900 p-4 lg:col-span-7 overflow-hidden border border-slate-800">
          {/* Subtle grid lines background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* SVG connecting routes */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Permanent Corridor Highway Lines */}
            {/* North to East */}
            <line x1="50%" y1="15%" x2="42%" y2="35%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="42%" y1="35%" x2="68%" y2="48%" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="68%" y1="48%" x2="82%" y2="40%" stroke="#334155" strokeWidth="2.5" />
            
            {/* ORR Main Spine: Silk Board -> HSR -> Bellandur -> Marathahalli */}
            <line x1="36%" y1="74%" x2="44%" y2="68%" stroke="#475569" strokeWidth="3" />
            <line x1="44%" y1="68%" x2="58%" y2="60%" stroke="#475569" strokeWidth="3" />
            <line x1="58%" y1="60%" x2="68%" y2="48%" stroke="#475569" strokeWidth="3" />
            <line x1="68%" y1="48%" x2="82%" y2="40%" stroke="#475569" strokeWidth="3" />

            {/* Elevated Expressway to Electronic City */}
            <line x1="36%" y1="74%" x2="48%" y2="92%" stroke="#475569" strokeWidth="3.5" />

            {/* Active matched route highlight line */}
            <line
              x1={`${originNode.x}%`}
              y1={`${originNode.y}%`}
              x2={`${destNode.x}%`}
              y2={`${destNode.y}%`}
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>

          {/* Interactive Nodes */}
          {NODES.map((node) => {
            const isOrigin = node.id === selectedOrigin;
            const isDest = node.id === selectedDest;
            const isSelected = isOrigin || isDest;

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                onClick={() => {
                  if (selectedOrigin !== node.id) {
                    setSelectedDest(node.id);
                  } else {
                    setSelectedOrigin(node.id);
                  }
                }}
              >
                {/* Node icon pill */}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shadow-md ${
                    isOrigin
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                      : isDest
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOrigin ? 'bg-white' : isDest ? 'bg-white' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{node.name.split(' ')[0]}</span>
                </div>

                {/* Hover detail tool-tip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 hidden whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[10px] text-slate-200 group-hover:block border border-slate-800 z-10">
                  {node.name} · {node.subtext}
                </div>
              </div>
            );
          })}

          {/* Legend Overlay */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Origin
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Destination
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active Carpools
            </span>
          </div>
        </div>

        {/* Route Engine Analysis Box */}
        <div className="flex flex-col justify-between lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              Selected Corridors Match
            </div>
            
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{originNode.name}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span>{destNode.name}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <div className="text-slate-500 text-[11px]">Match Score</div>
                <div className="font-bold text-emerald-600 font-mono text-sm">
                  {isDirectOrrMatch ? '96%' : '88%'}
                </div>
              </div>

              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <div className="text-slate-500 text-[11px]">Active Drivers</div>
                <div className="font-bold text-slate-800 font-mono text-sm">
                  {isDirectOrrMatch ? '142' : '68'}
                </div>
              </div>

              <div className="rounded-lg bg-white p-2 border border-slate-200/60">
                <div className="text-slate-500 text-[11px]">Avg Share Fare</div>
                <div className="font-bold text-slate-800 font-mono text-sm">
                  ₹{isDirectOrrMatch ? '75' : '65'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>0 Detour Polyline Overlap:</strong> The driver is already taking this route to work. Empty seats are shared strictly for cost recovery.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verified Corporate Peers:</strong> Travel alongside colleagues verified via work email (Infosys, Wipro, Flipkart, Amazon, TCS).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Fuel className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>₹4,500+ Avg Monthly Fuel Recovery:</strong> Drivers recoup rising fuel & toll costs; riders pay ~70% less than surge taxi rates.
              </span>
            </div>
          </div>

          {onSelectCorridor && (
            <button
              onClick={() => onSelectCorridor(originNode.name, destNode.name)}
              className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Search Rides for this Corridor →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
