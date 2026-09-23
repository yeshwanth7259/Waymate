import React from 'react';
import { ShieldCheck, UserCheck, Lock, HeartHandshake, PhoneCall, AlertTriangle } from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  return (
    <section className="border-t border-slate-200 bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Trust & Safety Architecture
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl leading-tight">
              Know exactly who you are travelling with.
            </h2>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              WayMate is not an anonymous hail app. Every single participant is a verified commuter with authenticated professional identity, corporate domain validation, and verified vehicle documentation.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Corporate Work Email Verification
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified badge for employees at Infosys, Wipro, TCS, Accenture, Flipkart, Amazon, and 450+ IT firms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Women-Only Commuter Clusters
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Women drivers can designate rides exclusively for verified women passengers for total peace of mind.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    4-Digit Boarding PIN & Emergency SOS
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trips only activate once the driver enters the rider's PIN. Direct 1-tap SOS and live GPS link sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Trust Card / Verification Preview */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Live Trust Badge Preview</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    Priya Narayanan · Tata Nexon EV
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Tier 1 Verified</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-400">Work Identity</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    priya.n@wipro.com (Verified)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sarjapur Innovation Campus
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-400">Government Identity</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Aadhaar / Digilocker Verified
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Masked ID ending in 8192
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-400">Vehicle & RC</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    KA 03 NC 4190 · Valid Insurance
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Registered to driver
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-slate-200/80">
                  <div className="text-[11px] text-slate-400">Carpool Reputation</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    118 Completed Trips (4.95 ★)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Zero cancellation in last 90 days
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 p-3.5 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <strong>Legal Compliance Note:</strong> WayMate adheres to Karnataka Motor Vehicles guidelines regarding private non-commercial carpooling (sharing operational cost without commercial passenger profit).
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
