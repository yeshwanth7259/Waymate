import React, { useState } from 'react';
import { Menu, X, Car, ShieldCheck, Map, Smartphone, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: 'landing' | 'app-find' | 'app-offer' | 'app-rides' | 'admin' | 'blueprint') => void;
  onOpenBlueprint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, onOpenBlueprint }) => {
  const { currentUser, loginWithPhone, logout, setupRecaptcha, sendOtp, verifyOtp } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAppView = activeView.startsWith('app-');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setupRecaptcha('recaptcha-container');
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await sendOtp(formattedPhone);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOtp(confirmationResult, otp);
      setShowLogin(false);
      setConfirmationResult(null);
      // Wait a moment for the token to be available, then sync with backend
      setTimeout(async () => {
        try {
          await authApi.syncUser(() => accessToken);
        } catch (e) {
            console.error("Sync error", e);
        }
      }, 1000);
    } catch (err: any) {
      setError('Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            
            {/* Logo */}
            <div className="flex shrink-0 items-center cursor-pointer" onClick={() => setActiveView('landing')}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <Car className="h-5 w-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  WayMate
                </span>
              </div>
            </div>

            {/* Desktop Center Nav */}
            <div className="hidden md:flex items-center justify-center space-x-1">
              <button
                onClick={() => setActiveView('app-find')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeView === 'app-find' ? 'bg-slate-100 text-emerald-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Find Ride
              </button>
              <button
                onClick={() => setActiveView('app-offer')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeView === 'app-offer' ? 'bg-slate-100 text-emerald-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Offer Seats
              </button>
              {currentUser && (
                <button
                  onClick={() => setActiveView('app-rides')}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    activeView === 'app-rides' ? 'bg-slate-100 text-emerald-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  My Rides
                </button>
              )}
            </div>

            {/* Right Side Tools */}
            <div className="hidden md:flex items-center justify-end gap-4">
              <button
                onClick={onOpenBlueprint}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 transition-colors"
              >
                <Map className="h-3.5 w-3.5" />
                <span>Solo Founder Roadmap</span>
              </button>
              
              {currentUser ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900">{currentUser.phoneNumber}</span>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 shadow-sm cursor-pointer" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  <LogIn className="h-4 w-4" />
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Login to WayMate</h3>
              <button onClick={() => setShowLogin(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            
            {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            {!confirmationResult ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (India)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div id="recaptcha-container"></div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-center tracking-widest text-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
