import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, Calendar, Users, ShieldCheck, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { rideApi } from '../../services/rideApi';
import { vehicleApi } from '../../services/vehicleApi';
import { useAuth } from '../../context/AuthContext';
import { Vehicle } from '../../types';

interface OfferRideViewProps {
  onViewRides: () => void;
}

export const OfferRideView: React.FC<OfferRideViewProps> = ({
  onViewRides
}) => {
  const { accessToken } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [origin, setOrigin] = useState('HSR Layout Sector 1');
  const [destination, setDestination] = useState('Electronic City Phase 1');
  const [departureTime, setDepartureTime] = useState('2026-10-01T08:30:00.000Z');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [purpose, setPurpose] = useState('Office Commute');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const res = await vehicleApi.getVehicles(() => accessToken);
    if (res.success && res.data) {
        setVehicles(res.data);
        if (res.data.length > 0) setSelectedVehicleId(res.data[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
        setError('Please select or add a vehicle first');
        return;
    }

    setLoading(true);
    setError(null);
    const res = await rideApi.offerRide({
        vehicleId: selectedVehicleId,
        from: origin,
        to: destination,
        departureTime,
        availableSeats,
        purpose
    }, () => accessToken);

    setLoading(false);
    if (res.success) {
        setPublishedSuccess(true);
    } else {
        setError(res.message || 'Failed to publish ride');
    }
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
            Your daily commute from <strong>{origin}</strong> to <strong>{destination}</strong> is now live on the Bengaluru matching engine. 
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
          
          {error && <div className="rounded-lg bg-red-50 text-red-600 p-4 text-sm font-semibold">{error}</div>}

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
            </div>
          </div>

          {/* Section 2: Timing */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Departure Time (ISO String for now)
                </label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-emerald-600" />
              <span>Vehicle & Legal Cost Sharing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Vehicle
                </label>
                <select
                  value={selectedVehicleId || ''}
                  onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="" disabled>Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.registrationNumber})</option>
                  ))}
                </select>
                {vehicles.length === 0 && <span className="text-xs text-red-500">Please add a vehicle in Profile first.</span>}
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
              disabled={loading || !selectedVehicleId}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Corridor Ride'}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
