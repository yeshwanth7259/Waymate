import React, { useState } from 'react';
import { X, Code2, Database, ShieldAlert, Calendar, CheckSquare, Layers, Sparkles, Terminal, FileText } from 'lucide-react';

interface SoloFounderRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoloFounderRoadmapModal: React.FC<SoloFounderRoadmapModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'matching' | 'legal' | 'sprint'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                WayMate Solo Founder Technical Blueprint & Execution Roadmap
              </h2>
              <p className="text-xs text-slate-400">
                End-to-end engineering architecture, database ERD, PostGIS matching algorithm, and Karnataka legal guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>1. Solo Tech Stack</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'database' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span>2. PostgreSQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('matching')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'matching' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>3. Matching Engine Logic</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'legal' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
            <span>4. Karnataka Legal Model</span>
          </button>

          <button
            onClick={() => setActiveTab('sprint')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'sprint' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <span>5. 8-Week Solo Plan</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700 space-y-6">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <div className="text-xs font-mono text-emerald-400">SOLO FOUNDER GOLDEN RULE</div>
                <h3 className="text-base font-bold mt-1">
                  Start with a Modular Monolith, NOT Microservices
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  As the sole developer, managing 12 Kubernetes microservices, Kafka pipelines, and multiple API gateways will derail your timeline. A single well-structured Spring Boot service with PostgreSQL and Redis lets you ship in weeks rather than months.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Backend (Your Strength: Java / Spring Boot)</span>
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• <strong>Java 17 / 21</strong> with <strong>Spring Boot 3.x</strong></li>
                    <li>• <strong>Spring Data JPA + Hibernate</strong> for domain persistence</li>
                    <li>• <strong>Spring Security + JWT</strong> for phone OTP token auth</li>
                    <li>• <strong>PostgreSQL + PostGIS extension</strong> for geographical queries</li>
                    <li>• <strong>Redis</strong> for ride request locks & active corridor caching</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Frontend & Mobile (Single Ecosystem)</span>
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• <strong>Web:</strong> React 19 + TypeScript + Tailwind CSS (Vite / Next.js)</li>
                    <li>• <strong>Mobile (Phase 2):</strong> React Native + Expo (uses same TypeScript models)</li>
                    <li>• <strong>Maps:</strong> Mapbox GL / Google Maps Directions API for polyline encoding</li>
                    <li>• <strong>Hosting:</strong> Single AWS EC2 / Lightsail instance or Cloud Run container ($20-$40/mo)</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Spring Boot Monolith Package Structure:
                </h4>
                <pre className="font-mono text-xs bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto">
{`com.waymate.app/
├── auth/           # OTP generation, JWT filter, UserPrincipal
├── user/           # Commuter profile, corporate email verification
├── vehicle/        # RC, plate number, seat capacity
├── corridor/       # Bengaluru tech corridor definitions & nodes
├── ride/           # Offer ride, recurring schedule, polyline route
├── matching/       # PostGIS geospatial overlap algorithm
├── booking/        # Seat request, accept/reject, 4-digit PIN verification
├── payment/        # Razorpay fuel cost recovery escrow
├── safety/         # 24/7 SOS dispatch, live location tracking
└── admin/          # Solo founder ops dashboard & KYC audit`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  PostgreSQL + PostGIS Relational Schema
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core entities designed for Bengaluru corridor querying and non-commercial cost tracking
                </p>
              </div>

              <pre className="font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto leading-relaxed">
{`-- 1. Users Table (Riders and Drivers in one entity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    work_email VARCHAR(120),
    company_name VARCHAR(120),
    is_work_verified BOOLEAN DEFAULT FALSE,
    is_govt_id_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_trips INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    available_seats SMALLINT NOT NULL CHECK (available_seats BETWEEN 1 AND 6),
    is_ev BOOLEAN DEFAULT FALSE
);

-- 3. Rides Table (Corridor journeys with PostGIS Linestring)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES users(id),
    vehicle_id UUID REFERENCES vehicles(id),
    origin_name VARCHAR(150) NOT NULL,
    dest_name VARCHAR(150) NOT NULL,
    origin_point GEOMETRY(Point, 4326) NOT NULL,
    dest_point GEOMETRY(Point, 4326) NOT NULL,
    route_polyline GEOMETRY(LineString, 4326) NOT NULL,
    departure_time TIME NOT NULL,
    price_per_seat NUMERIC(6,2) NOT NULL,
    available_seats SMALLINT NOT NULL,
    ride_pin VARCHAR(4) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 4. Spatial Index on Route Polyline for Sub-Second Matching
CREATE INDEX idx_rides_route_spatial ON rides USING GIST (route_polyline);`}
              </pre>
            </div>
          )}

          {/* TAB 3: MATCHING */}
          {activeTab === 'matching' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Corridor Polyline Overlap Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How WayMate achieves sub-second route matching without detour penalties
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="font-semibold text-slate-800 text-xs">
                  The Problem With Naive Distance Matching:
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Most novice developers only check: <code className="bg-slate-100 px-1 py-0.5 rounded">Origin == Origin</code>. But in Bengaluru, a driver travelling from HSR to Whitefield can easily pick up a passenger at Bellandur (RMZ Ecoworld) and drop them at Marathahalli with zero detours!
                </p>

                <div className="font-semibold text-slate-800 text-xs pt-2">
                  The PostGIS Spatial Overlap Algorithm:
                </div>
                <pre className="font-mono text-xs bg-slate-900 text-sky-300 p-4 rounded-lg overflow-x-auto">
{`-- Find rides where passenger pickup is within 1.5 km of driver's route
-- AND passenger drop-off is within 1.5 km of driver's route:
SELECT r.id, r.driver_id, r.price_per_seat,
       ST_Distance(r.route_polyline, ST_SetSRID(ST_MakePoint(:riderPickupLng, :riderPickupLat), 4326)) AS pickup_detour,
       ST_Distance(r.route_polyline, ST_SetSRID(ST_MakePoint(:riderDropLng, :riderDropLat), 4326)) AS drop_detour
FROM rides r
WHERE r.status = 'ACTIVE'
  AND r.available_seats >= :requestedSeats
  AND ST_DWithin(r.route_polyline::geography, ST_SetSRID(ST_MakePoint(:riderPickupLng, :riderPickupLat), 4326)::geography, 1500)
  AND ST_DWithin(r.route_polyline::geography, ST_SetSRID(ST_MakePoint(:riderDropLng, :riderDropLat), 4326)::geography, 1500)
ORDER BY (pickup_detour + drop_detour) ASC
LIMIT 10;`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: LEGAL */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <span>Crucial: Carpooling vs Commercial Taxi in Karnataka</span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Karnataka’s Transport Department previously scrutinized carpool aggregators because taxi unions complained that private white-board vehicles were behaving like commercial taxis without yellow boards or permits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-red-700 text-xs uppercase tracking-wider mb-2">
                    ❌ What NOT To Do (Illegal Taxi Operation)
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• Do not let drivers make 10+ random on-demand trips a day</li>
                    <li>• Do not charge dynamic surge pricing (e.g. ₹400 in rain)</li>
                    <li>• Do not let drivers pick up passengers outside their personal route</li>
                    <li>• Do not market as "book a cab / taxi alternative"</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-2">
                    ✅ How WayMate Stays 100% Compliant
                  </h4>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li>• <strong>Max 2 Trips/Day:</strong> Strictly 1 home-to-office and 1 return trip</li>
                    <li>• <strong>Cost-Recovery Formula:</strong> Max fare capped to actual petrol/diesel + toll divided by occupants</li>
                    <li>• <strong>Verified Coworkers:</strong> Commuters share credentials via corporate email</li>
                    <li>• <strong>No Driver Profit:</strong> Money received covers vehicle fuel depreciation only</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPRINT */}
          {activeTab === 'sprint' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                8-Week Solo Developer Action Plan
              </h3>
              <p className="text-xs text-slate-500">
                A realistic, non-overwhelming schedule for one solo engineer
              </p>

              <div className="space-y-2.5">
                {[
                  { week: 'Week 1', focus: 'Brand, DB Schema & Project Setup', tasks: 'Set up Spring Boot 3 + PostgreSQL/PostGIS. Implement user, vehicle, and ride tables.' },
                  { week: 'Week 2', focus: 'Auth & Profile Verification', tasks: 'OTP login via Twilio / Msg91, corporate email validation token flow, JWT security.' },
                  { week: 'Week 3', focus: 'Ride Creation & Corridor Engine', tasks: 'Driver Offer Ride API, polyline storage, recurring schedule cron, static corridor nodes.' },
                  { week: 'Week 4', focus: 'Spatial Overlap Matching', tasks: 'ST_DWithin PostGIS matching query, time window filtering, corridor search endpoint.' },
                  { week: 'Week 5', focus: 'Booking & 4-Digit PIN Flow', tasks: 'Seat request, driver push notifications, PIN boarding verification, active trip state.' },
                  { week: 'Week 6', focus: 'Safety & Trust Center', tasks: 'Govt ID audit console, Women-only filter, 1-tap SOS GPS dispatch endpoint.' },
                  { week: 'Week 7', focus: 'Razorpay Cost Recovery Escrow', tasks: 'Seat payment hold, automatic driver payout upon ride completion, cancellation refunds.' },
                  { week: 'Week 8', focus: 'Bengaluru Pilot Corridors Launch', tasks: 'Seed with 50 drivers on ORR (HSR → Ecoworld → Whitefield). Collect real commuter feedback.' }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-700 w-16 shrink-0">{item.week}</span>
                      <span className="font-semibold text-slate-900">{item.focus}</span>
                    </div>
                    <span className="text-slate-500">{item.tasks}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <div>
            Built directly for your solo development journey of WayMate.
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close Blueprint
          </button>
        </div>

      </div>
    </div>
  );
};
