import React, { useState } from 'react';
import { ShieldCheck, Users, Car, MapPin, Check, X, AlertTriangle, ArrowUpRight, BarChart2 } from 'lucide-react';
import { KARNATAKA_CITIES, TECH_CORRIDORS } from '../../data/mockData';
import { KarnatakaCity } from '../../types';

interface PendingVerification {
  id: string;
  name: string;
  company: string;
  workEmail: string;
  vehicle: string;
  plate: string;
  documentType: 'DL & RC' | 'Work Email' | 'Govt ID';
  submittedAt: string;
}

const INITIAL_PENDING: PendingVerification[] = [
  {
    id: 'ver-01',
    name: 'Vikram Venkatesh',
    company: 'TCS (Think Campus E-City)',
    workEmail: 'vikram.v@tcs.com',
    vehicle: 'Maruti Suzuki Baleno Alpha',
    plate: 'KA 05 MM 8819',
    documentType: 'DL & RC',
    submittedAt: '12 mins ago'
  },
  {
    id: 'ver-02',
    name: 'Ananya Sharma',
    company: 'Goldman Sachs (Helios Business Park, ORR)',
    workEmail: 'ananya.sharma@gs.com',
    vehicle: 'MG ZS EV',
    plate: 'KA 03 NJ 1042',
    documentType: 'DL & RC',
    submittedAt: '34 mins ago'
  },
  {
    id: 'ver-03',
    name: 'Suhas Kulkarni',
    company: 'Robert Bosch (Adugodi Campus)',
    workEmail: 'suhas.k@bosch.com',
    vehicle: 'Hyundai i20 Asta',
    plate: 'KA 01 MR 3491',
    documentType: 'Work Email',
    submittedAt: '1 hour ago'
  }
];

export const AdminDashboardView: React.FC = () => {
  const [cities, setCities] = useState<KarnatakaCity[]>(KARNATAKA_CITIES);
  const [pendingQueue, setPendingQueue] = useState<PendingVerification[]>(INITIAL_PENDING);
  const [successMessage, setSuccessMessage] = useState('');

  const handleApprove = (id: string, name: string) => {
    setPendingQueue(prev => prev.filter(item => item.id !== id));
    setSuccessMessage(`Approved verification for ${name}. Digital Trust Badge issued.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleReject = (id: string, name: string) => {
    setPendingQueue(prev => prev.filter(item => item.id !== id));
    setSuccessMessage(`Rejected submission for ${name}. Notification sent with re-upload guidelines.`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const toggleCityStatus = (cityId: string) => {
    setCities(prev => prev.map(c => {
      if (c.id === cityId) {
        const nextStatus = c.status === 'active' ? 'beta' : c.status === 'beta' ? 'planned' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Solo Founder Control Cockpit</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Mobility Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl mt-1">
            WayMate Operations & Karnataka Rollout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor corridor liquidity, approve driver KYC documents, and control statewide city activations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bengaluru Core Engine Live</span>
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Daily Carpools</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            4,650
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">
            +18% corridor growth MoM
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Verified IT Commuters</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            28,410
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            450+ verified corporate domains
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Driver Fuel Recovery Total</div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-600 tabular-nums">
            ₹34.8 Lakhs
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            This month · 0 commercial taxi fee
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Safety Incidents Logged</div>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            0
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">
            100% 4-digit PIN verified trips
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: KYC Approval Queue */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Pending Driver & Work KYC Queue ({pendingQueue.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Audit manual check</span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
              All pending driver and employee verification requests have been audited!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.company}</div>
                      <div className="text-[11px] font-mono text-emerald-700 mt-0.5">{item.workEmail}</div>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {item.documentType}
                    </span>
                  </div>

                  <div className="mt-3 rounded-md bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Vehicle:</span> {item.vehicle}
                    </div>
                    <span className="font-mono text-slate-800">{item.plate}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleReject(item.id, item.name)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.name)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                    >
                      <Check className="h-3 w-3" />
                      <span>Approve Trust Badge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Karnataka Statewide Rollout Switchboard */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Karnataka Statewide Activation Switchboard</span>
            </h3>
            <span className="text-xs text-slate-500">Click to cycle status</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs overflow-hidden">
            {cities.map((city) => (
              <div key={city.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{city.name}</span>
                    <span className="text-[10px] text-slate-400">({city.region})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {city.commutersDaily}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                    city.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : city.status === 'beta'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {city.status}
                  </span>

                  <button
                    onClick={() => toggleCityStatus(city.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Change Status
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
            <strong>Solo Ops Tip:</strong> Keep Mysuru and Mangaluru in <em>beta</em> or <em>planned</em> until Bengaluru corridors achieve self-sustaining driver/rider liquidity (approx 5,000 completed rides/week).
          </div>
        </div>

      </div>

    </div>
  );
};
