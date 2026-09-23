import React from 'react';
import { Building2, Leaf, BarChart3, Users2, Check } from 'lucide-react';

export const CorporateSection: React.FC = () => {
  const companies = [
    { name: 'Infosys Limited', location: 'Electronic City & Hebbal', riders: '1,420+ carpools' },
    { name: 'Wipro Technologies', location: 'Sarjapur Campus', riders: '980+ carpools' },
    { name: 'Flipkart Internet', location: 'Cessna Business Park', riders: '740+ carpools' },
    { name: 'Amazon India', location: 'Brigade Gateway & WTC', riders: '890+ carpools' }
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              For Enterprises & Tech Parks
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Turn your company workforce into private carpool clusters.
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Enable your employees to commute together safely. Companies restrict matching to their corporate domain, ease campus parking congestion, and generate verifiable Scope 3 ESG carbon offset reports.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Single Sign-On (SSO / SAML)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Private Intra-Company Matching</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Campus Parking Reduction</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Monthly ESG Carbon Audits</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-slate-700" />
                  <span className="text-sm font-bold text-slate-900">
                    Enterprise Commuter Corridors
                  </span>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  B2B Pilot Program
                </span>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {companies.map((co, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{co.name}</div>
                      <div className="text-[11px] text-slate-500">{co.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-emerald-600">{co.riders}</div>
                      <div className="text-[10px] text-slate-400">active this week</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-slate-900 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-300">Corporate Carbon Savings</div>
                    <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">
                      42.6 Metric Tons CO₂ / Mo
                    </div>
                  </div>
                  <Leaf className="h-6 w-6 text-emerald-400" />
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
