import React, { useState } from 'react';
import { Search, MapPin, Clock, Users, ShieldCheck, Filter, CheckCircle, Car, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Ride, User, Booking } from '../../types';

interface FindRideViewProps {
  rides: Ride[];
  currentUser: User;
  onBookRide: (ride: Ride, pickup: string, drop: string, seats: number) => void;
  onSwitchToOffer: () => void;
  initialFrom?: string;
  initialTo?: string;
}

export const FindRideView: React.FC<FindRideViewProps> = ({
  rides,
  currentUser,
  onBookRide,
  onSwitchToOffer,
  initialFrom = '',
  initialTo = ''
}) => {
  const [originQuery, setOriginQuery] = useState(initialFrom || 'HSR');
  const [destQuery, setDestQuery] = useState(initialTo || 'Whitefield');
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  const [coWorkersOnlyFilter, setCoWorkersOnlyFilter] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(rides[0] || null);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [lastBookedPin, setLastBookedPin] = useState('');

  // Filter rides based on search
  const filteredRides = rides.filter(ride => {
    const matchesOrigin = !originQuery || 
      ride.origin.toLowerCase().includes(originQuery.toLowerCase()) ||
      ride.stops.some(s => s.name.toLowerCase().includes(originQuery.toLowerCase()));
    
    const matchesDest = !destQuery || 
      ride.destination.toLowerCase().includes(destQuery.toLowerCase()) ||
      ride.stops.some(s => s.name.toLowerCase().includes(destQuery.toLowerCase()));

    const matchesWomenOnly = !womenOnlyFilter || ride.allowWomenOnly;
    const matchesCoWorkers = !coWorkersOnlyFilter || (ride.coWorkersOnly && ride.driver.company?.includes('Infosys'));

    return matchesOrigin && matchesDest && matchesWomenOnly && matchesCoWorkers;
  });

  const handleConfirmBooking = (ride: Ride) => {
    onBookRide(ride, ride.origin, ride.destination, seatsRequested);
    setLastBookedPin(ride.ridePin);
    setShowBookingSuccess(true);
  };

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

          {filteredRides.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-2 text-sm font-bold text-slate-800">No matching carpools found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try broadening your pickup or drop search query (e.g. "HSR" or "ORR").
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
                          {ride.driver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">{ride.driver.name}</span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              ★ {ride.driver.rating}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>{ride.driver.company || 'Verified IT Professional'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-lg font-extrabold text-slate-900 tabular-nums">
                        ₹{ride.pricePerSeat}
                      </div>
                      <div className="text-[10px] text-slate-400">per seat · no surge</div>
                    </div>
                  </div>

                  {/* Route Timeline Summary */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{ride.origin}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mx-2" />
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="truncate">{ride.destination}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Departs: <strong>{ride.departureTime}</strong></span>
                        {ride.isRecurring && (
                          <span className="text-emerald-700 font-medium bg-emerald-100/50 px-1.5 py-0.2 rounded text-[10px]">
                            Daily Mon-Fri
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span><strong>{ride.availableSeats}</strong> of {ride.totalSeats} seats left</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & tags */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Car className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.plateNumber})</span>
                      {ride.vehicle.isEv && (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                          EV
                        </span>
                      )}
                    </div>
                    {ride.allowWomenOnly && (
                      <span className="text-pink-600 font-medium text-[10px]">
                        Women Only Commute
                      </span>
                    )}
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
                  {selectedRide.corridor}
                </h3>
              </div>

              {/* Driver & Car Snapshot */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                  {selectedRide.driver.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{selectedRide.driver.name}</span>
                    <span className="text-xs text-emerald-700">★ {selectedRide.driver.rating}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedRide.driver.company}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {selectedRide.vehicle.color} {selectedRide.vehicle.make} {selectedRide.vehicle.model} · {selectedRide.vehicle.plateNumber}
                  </div>
                </div>
              </div>

              {/* Waypoint Stops */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  Corridor Waypoints & Timing:
                </div>
                <div className="space-y-2">
                  {selectedRide.stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${
                          idx === 0 ? 'bg-emerald-500' : idx === selectedRide.stops.length - 1 ? 'bg-sky-500' : 'bg-slate-300'
                        }`} />
                        <span className="font-medium text-slate-800 truncate">{stop.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0 ml-2">
                        {stop.timeEstimate}
                      </span>
                    </div>
                  ))}
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
                    ₹{selectedRide.pricePerSeat * seatsRequested}
                  </span>
                </div>

                <div className="rounded-md bg-emerald-50 p-2.5 text-[11px] text-emerald-800 border border-emerald-200/50">
                  <strong>Non-Commercial Fuel Cost Sharing:</strong> You are reimbursing fuel and toll expenses directly. No driver commercial markup.
                </div>

                {/* Instant Seat Request Button */}
                <button
                  onClick={() => handleConfirmBooking(selectedRide)}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Request Seat Now (Instant Ride PIN)</span>
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
              Seat Confirmed!
            </h3>
            <p className="text-center text-xs text-slate-500 mt-1">
              Your corridor ride has been reserved with {selectedRide?.driver.name}.
            </p>

            <div className="mt-5 rounded-xl bg-slate-900 p-4 text-center text-white">
              <div className="text-xs text-slate-400">Your 4-Digit Boarding Ride PIN</div>
              <div className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400 mt-1">
                {lastBookedPin}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Share this PIN with your driver when boarding to activate your trip.
              </div>
            </div>

            <div className="mt-5 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Vehicle:</span>
                <span className="font-semibold text-slate-800">{selectedRide?.vehicle.make} {selectedRide?.vehicle.model} ({selectedRide?.vehicle.plateNumber})</span>
              </div>
              <div className="flex justify-between">
                <span>Departure:</span>
                <span className="font-semibold text-slate-800">{selectedRide?.departureTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Fare Amount:</span>
                <span className="font-semibold text-slate-800">₹{(selectedRide?.pricePerSeat || 0) * seatsRequested}</span>
              </div>
            </div>

            <button
              onClick={() => setShowBookingSuccess(false)}
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
