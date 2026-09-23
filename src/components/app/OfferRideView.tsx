import React, { useState } from 'react';
import { Car, MapPin, Clock, Calendar, Users, ShieldCheck, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { Ride, User } from '../../types';

interface OfferRideViewProps {
  currentUser: User;
  onPublishRide: (ride: Ride) => void;
  onViewRides: () => void;
}

export const OfferRideView: React.FC<OfferRideViewProps> = ({
  currentUser,
  onPublishRide,
  onViewRides
}) => {
  const [origin, setOrigin] = useState('HSR Layout Sector 1');
  const [destination, setDestination] = useState('Electronic City Phase 1 (Infosys Gate 1)');
  const [corridor, setCorridor] = useState('Electronic City Express Corridor');
  const [departureTime, setDepartureTime] = useState('08:15 AM');
  const [returnTime, setReturnTime] = useState('06:00 PM');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(65);
  const [isRecurring, setIsRecurring] = useState(true);
  const [allowWomenOnly, setAllowWomenOnly] = useState(false);
  const [coWorkersOnly, setCoWorkersOnly] = useState(true);
  const [vehicleMake, setVehicleMake] = useState('Skoda Kushaq Style');
  const [vehiclePlate, setVehiclePlate] = useState('KA 51 ML 5504');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Karnataka MV Act Cost Recovery Estimation
  // Non-commercial guidelines allow reimbursing fuel & toll divided among participants
  const estimatedFuelCost = 240; // in INR
  const estimatedTollCost = 65; // Electronic City elevated highway toll
  const maxLegalCostShare = Math.round((estimatedFuelCost + estimatedTollCost) / 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      driverId: currentUser.id,
      driver: currentUser,
      vehicle: {
        id: `veh-${Date.now()}`,
        userId: currentUser.id,
        make: vehicleMake.split(' ')[0] || 'Skoda',
        model: vehicleMake.split(' ').slice(1).join(' ') || 'Kushaq',
        color: 'Carbon Steel',
        plateNumber: vehiclePlate,
        seats: 4,
        isEv: false,
      },
      origin,
      destination,
      corridor,
      stops: [
        { name: origin, timeEstimate: departureTime, lat: 12.9112, lng: 77.6421 },
        { name: 'Silk Board Junction', timeEstimate: '08:28 AM', lat: 12.9177, lng: 77.6238 },
        { name: 'Electronic City Toll', timeEstimate: '08:42 AM', lat: 12.8530, lng: 77.6660 },
        { name: destination, timeEstimate: '08:55 AM', lat: 12.8452, lng: 77.6601 }
      ],
      departureDate: 'Today',
      departureTime,
      returnTime,
      isRecurring,
      recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      totalSeats: 3,
      availableSeats,
      pricePerSeat,
      status: 'active',
      ridePin: Math.floor(1000 + Math.random() * 9000).toString(),
      allowWomenOnly,
      coWorkersOnly,
      notes: 'Takes elevated expressway to avoid traffic. AC on.'
    };

    onPublishRide(newRide);
    setPublishedSuccess(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="border-b border-slate-200 pb-5">
        <div className="text-xs font-semibold text-emerald-700">
          Driver Dashboard · Empty Seat Cost Recovery
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl mt-1">
          Offer Your Daily Corridor Ride
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Share your existing commute with verified colleagues and recover fuel and toll expenses
        </p>
      </div>

      {publishedSuccess ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Ride Published Successfully!
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Your daily commute from <strong>{origin}</strong> to <strong>{destination}</strong> is now live on the Bengaluru matching engine. Commuters matching your route will appear in your requests.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPublishedSuccess(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Offer Another Ride
            </button>
            <button
              onClick={onViewRides}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Go to My Rides →
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* Section 1: Route & Corridors */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Route & Corridor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Starting Point (Pickup)
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Destination (Office / Tech Park)
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Primary Commute Corridor
                </label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Outer Ring Road (ORR) Tech Spine</option>
                  <option>Electronic City Express Corridor</option>
                  <option>Whitefield - ITPL Corridor</option>
                  <option>Hebbal - Manyata Tech Park Corridor</option>
                  <option>Sarjapur Road - Haralur Hub</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Timing & Recurrence */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Schedule & Recurring Days</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Morning Departure Time
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Evening Return Departure (Optional)
                </label>
                <input
                  type="text"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="recurring" className="text-xs text-slate-700 font-medium">
                  Repeat this commute automatically every Monday to Friday (Office Commute)
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle & Cost Sharing Calculation */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-emerald-600" />
              <span>Vehicle & Legal Cost Sharing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Available Passenger Seats
                </label>
                <select
                  value={availableSeats}
                  onChange={(e) => setAvailableSeats(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Share Per Seat (₹)
                </label>
                <input
                  type="number"
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(Number(e.target.value))}
                  min={30}
                  max={120}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  Recommended non-commercial cap: ₹{maxLegalCostShare} / seat
                </div>
              </div>

              {/* Karnataka Motor Vehicles Act Compliance Box */}
              <div className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 border border-emerald-200/60 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Karnataka Non-Commercial Cost Recovery Guideline</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Under Indian Motor Vehicles law, private vehicles may share actual operational costs (fuel + toll) without a commercial taxi permit as long as the trip does not generate commercial profit. WayMate caps seat pricing to strictly keep you legally protected.
                </p>
              </div>

              {/* Preferences */}
              <div className="sm:col-span-2 space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="coWorkersOnly"
                    checked={coWorkersOnly}
                    onChange={(e) => setCoWorkersOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="coWorkersOnly" className="text-xs text-slate-700 font-medium">
                    Restrict exclusively to verified corporate colleagues ({currentUser.company?.split(' ')[0]})
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowWomenOnly"
                    checked={allowWomenOnly}
                    onChange={(e) => setAllowWomenOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="allowWomenOnly" className="text-xs text-slate-700 font-medium">
                    Women-only ride (Accept only verified female passengers)
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onViewRides}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Publish Corridor Ride
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
