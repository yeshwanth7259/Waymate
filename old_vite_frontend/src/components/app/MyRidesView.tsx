import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, ShieldCheck, CheckCircle, Navigation, Users, Info } from 'lucide-react';
import { Booking, Ride } from '../../types';
import { bookingApi } from '../../services/bookingApi';
import { rideApi } from '../../services/rideApi';
import { tripApi, Trip } from '../../services/tripApi';
import { useAuth } from '../../context/AuthContext';

interface MyRidesViewProps {
  onFindRideClick: () => void;
  onViewTrip: (tripId: number) => void;
}

export const MyRidesView: React.FC<MyRidesViewProps> = ({
  onFindRideClick,
  onViewTrip
}) => {
  const { accessToken, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'offered' | 'booked'>('booked');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await tripApi.getMyTrips(() => accessToken);
    if (res.success && res.data) {
      setTrips(res.data);
    } else {
      setError(res.message || 'Failed to load trips');
    }
    setLoading(false);
  };

  // Filter based on host vs rider
  const userId = currentUser ? Number(currentUser.uid) : 0; // Not exact, but we don't have user.id in context easily
  // Wait, backend response already gives us trips.
  // We can just rely on the fact that if they are the host, host.name == profile.fullName (if we had it)
  // Let's just group by checking if the current user's uid matches something?
  // Actually, we can just fetch rideApi and bookingApi for UI compatibility, but booking doesn't have tripId.
  // Instead of completely refactoring MyRidesView, let's just use `trips` for both.
  
  // Since we don't have user.id in frontend easily to split booked/offered,
  // Let's just fetch all trips, and we will show the "View Live Trip" button for all of them.
  // For V1, let's just show them in one list or try to guess.
  // Actually, if we just fetch `bookingApi.getMyBookings` and `rideApi.getMyRides`, we still need the trip.id.
  // Let's fetch trips and use them to find the tripId for a ride.

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
          My Rides
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your upcoming daily commutes and past journeys
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('booked')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'booked'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Rides I Booked (Rider)
        </button>
        <button
          onClick={() => setActiveTab('offered')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'offered'
              ? 'border-emerald-500 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Rides I Offered (Host)
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
            <div className="p-8 text-center text-slate-500">Loading your rides...</div>
        ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">{error}</div>
        ) : activeTab === 'booked' ? (
            /* Booked Rides */
            bookedRides.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Car className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Upcoming Bookings</h3>
                <p className="mt-1 text-xs text-slate-500 mb-6">
                    You haven't requested any seats on corridor commutes yet.
                </p>
                <button
                    onClick={onFindRideClick}
                    className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                    Search Corridor Rides
                </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookedRides.map(booking => (
                    <div key={booking.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ${
                        booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                        booking.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {booking.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {booking.id}</span>
                    </div>

                    <div className="mt-3 mb-4">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{booking.ride?.from}</span>
                        </div>
                        <div className="pl-3 py-1 border-l-2 border-slate-100 ml-1 h-3"></div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 truncate">
                        <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="truncate">{booking.ride?.to}</span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400"/> Departs</span>
                        <span className="font-semibold text-slate-900">{booking.ride?.departureTime ? new Date(booking.ride.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400"/> Seats Booked</span>
                        <span className="font-semibold text-slate-900">{booking.seats}</span>
                        </div>
                    </div>
                    {/* Add View Trip Button */}
                    {trips.find(t => t.ride.id === booking.ride?.id) && (
                      <button 
                        onClick={() => onViewTrip(trips.find(t => t.ride.id === booking.ride?.id)!.id)}
                        className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        View Live Trip
                      </button>
                    )}
                    </div>
                ))}
                </div>
            )
        ) : (
            /* Offered Rides */
            offeredRides.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <Car className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <h3 className="text-sm font-bold text-slate-800">No Rides Offered</h3>
                    <p className="mt-1 text-xs text-slate-500 mb-6">
                        You haven't offered any corridor commutes yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offeredRides.map(ride => (
                    <div key={ride.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
                            HOSTING
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {ride.id}</span>
                        </div>
                        <div className="mt-3 font-bold text-sm">{ride.from} → {ride.to}</div>
                        <div className="mt-2 text-xs text-slate-500">Available Seats: {ride.availableSeats}</div>
                        {trips.find(t => t.ride.id === ride.id) && (
                          <button 
                            onClick={() => onViewTrip(trips.find(t => t.ride.id === ride.id)!.id)}
                            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                          >
                            Manage Live Trip
                          </button>
                        )}
                    </div>
                ))}
                </div>
            )
        )}
      </div>

    </div>
  );
};
