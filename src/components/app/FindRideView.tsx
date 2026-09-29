import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users, ShieldCheck, Filter, CheckCircle, Car, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Ride } from '../../types';
import { rideApi } from '../../services/rideApi';
import { bookingApi } from '../../services/bookingApi';
import { useAuth } from '../../context/AuthContext';

interface FindRideViewProps {
  onSwitchToOffer: () => void;
  initialFrom?: string;
  initialTo?: string;
}

export const FindRideView: React.FC<FindRideViewProps> = ({
  onSwitchToOffer,
  initialFrom = '',
  initialTo = ''
}) => {
  const { accessToken } = useAuth();
  const [originQuery, setOriginQuery] = useState(initialFrom);
  const [destQuery, setDestQuery] = useState(initialTo);
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [coWorkersOnlyFilter, setCoWorkersOnlyFilter] = useState(false);
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [seatsRequested, setSeatsRequested] = useState(1);
  
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
  }, [originQuery, destQuery]); // Automatically search on change, or could use a button

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    const res = await rideApi.searchRides({ 
        from: originQuery, 
        to: destQuery 
    }, () => accessToken);
    
    if (res.success && res.data) {
        setRides(res.data);
        if (res.data.length > 0) setSelectedRide(res.data[0]);
    } else {
        setError(res.message || 'Failed to search rides');
    }
    setLoading(false);
  };

  const handleConfirmBooking = async (ride: Ride) => {
    setBookingLoading(true);
    setBookingError(null);
    const res = await bookingApi.requestSeat(ride.id, seatsRequested, () => accessToken);
    
    setBookingLoading(false);
    if (res.success) {
        setShowBookingSuccess(true);
    } else {
        setBookingError(res.message || 'Failed to request seat');
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesWomenOnly = !womenOnlyFilter || ride.allowWomenOnly;
    const matchesCoWorkers = !coWorkersOnlyFilter || ride.coWorkersOnly;
    return matchesWomenOnly && matchesCoWorkers;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span>Bengaluru Live Corridor Matching</span>
            <span aria-hidden="true">·</span>
            <span>Zero Surge Pricing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl mt-1">
            Find an Office Carpool
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Share empty seats with verified tech professionals travelling your corridor
          </p>
        </div>

        <button
          onClick={onSwitchToOffer}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 whitespace-nowrap"
        >
          <Car className="h-4 w-4 text-emerald-600" />
          <span>Driving today? Offer your seats</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          <div className="lg:col-span-4 relative">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Pickup Area</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                value={originQuery}
                onChange={(e) => setOriginQuery(e.target.value)}
                placeholder="e.g. HSR, Koramangala, Silk Board"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="lg:col-span-4 relative">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Destination Tech Park / Hub</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-600" />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => setDestQuery(e.target.value)}
                placeholder="e.g. Whitefield, Ecoworld, Manyata"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-4 flex flex-wrap items-center gap-2 pt-4 sm:pt-0">
            <button
              onClick={() => setWomenOnlyFilter(!womenOnlyFilter)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                womenOnlyFilter
                  ? 'border-pink-300 bg-pink-50 text-pink-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Women Only</span>
            </button>

            <button
              onClick={() => setCoWorkersOnlyFilter(!coWorkersOnlyFilter)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                coWorkersOnlyFilter
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Verified Coworkers</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid: Ride List & Selected Ride Detail Panel */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Matched Rides Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-800">{filteredRides.length}</strong> available carpool journeys</span>
            <span>Sorted by corridor route overlap</span>
          </div>

          {loading ? (
             <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
               Finding rides...
             </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
               Something went wrong: {error}
               <br />
               <button onClick={handleSearch} className="mt-2 text-xs font-bold underline">Try Again</button>
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-2 text-sm font-bold text-slate-800">No matching carpools found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try broadening your pickup or drop search query.
              </p>
              <button
                onClick={() => { setOriginQuery(''); setDestQuery(''); setWomenOnlyFilter(false); setCoWorkersOnlyFilter(false); }}
                className="mt-4 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredRides.map((ride) => {
              const isSelected = selectedRide?.id === ride.id;
              return (
                <div
                  key={ride.id}
                  onClick={() => setSelectedRide(ride)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all shadow-xs ${
                    isSelected
                      ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Driver info */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                          {ride.host?.profile?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">{ride.host?.profile?.fullName || 'Anonymous'}</span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              ★ 4.9
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>Verified IT Professional</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-lg font-extrabold text-slate-900 tabular-nums">
                        ₹65
                      </div>
                      <div className="text-[10px] text-slate-400">per seat · no surge</div>
                    </div>
                  </div>

                  {/* Route Timeline Summary */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{ride.from}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mx-2" />
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="truncate">{ride.to}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Departs: <strong>{new Date(ride.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span><strong>{ride.availableSeats}</strong> seats left</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & tags */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Car className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ride.vehicle?.brand} {ride.vehicle?.model}</span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Ride Details & Booking Drawer */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          {selectedRide ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">
                    Ride Details & Booking
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {selectedRide.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedRide.from} → {selectedRide.to}
                </h3>
              </div>

              {/* Driver & Car Snapshot */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                  {selectedRide.host?.profile?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{selectedRide.host?.profile?.fullName || 'Anonymous'}</span>
                    <span className="text-xs text-emerald-700">★ 4.9</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedRide.vehicle?.color} {selectedRide.vehicle?.brand} {selectedRide.vehicle?.model}
                  </div>
                </div>
              </div>

              {/* Seat Selection & Cost Calculator */}
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Select Seats:</span>
                  <div className="flex items-center gap-2">
                    {[1, 2].map(num => (
                      <button
                        key={num}
                        disabled={num > selectedRide.availableSeats}
                        onClick={() => setSeatsRequested(num)}
                        className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                          seatsRequested === num
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } ${num > selectedRide.availableSeats ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                  <span className="text-slate-600">Total Share Amount:</span>
                  <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                    ₹{65 * seatsRequested}
                  </span>
                </div>

                {bookingError && <div className="text-xs text-red-600 font-bold">{bookingError}</div>}

                {/* Instant Seat Request Button */}
                <button
                  onClick={() => handleConfirmBooking(selectedRide)}
                  disabled={bookingLoading}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{bookingLoading ? 'Requesting...' : 'Request Seat'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
              Select any ride on the left to review details and request a seat.
            </div>
          )}
        </div>

      </div>

      {/* Booking Success Modal */}
      {showBookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>

            <h3 className="text-center text-lg font-bold text-slate-900">
              Seat Requested!
            </h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Your request has been sent to {selectedRide?.host?.profile?.fullName || 'the host'}. You will be notified when they accept.
            </p>

            <button
              onClick={() => { setShowBookingSuccess(false); onSwitchToOffer(); }}
              className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Done & View in My Rides
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
