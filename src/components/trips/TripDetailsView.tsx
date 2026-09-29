import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tripApi, Trip } from '../../services/tripApi';
import { useTripLocation } from '../../hooks/useTripLocation';
import { LiveTripMap } from '../maps/LiveTripMap';
import { ArrowLeft, Phone, MessageCircle, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TripDetailsViewProps {
  tripId: number;
  onBack: () => void;
}

export const TripDetailsView = ({ tripId, onBack }: TripDetailsViewProps) => {
  const { accessToken } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { latestLocation, isConnected } = useTripLocation(tripId);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    setLoading(true);
    const res = await tripApi.getTrip(tripId, () => accessToken);
    if (res.success && res.data) {
      setTrip(res.data);
    } else {
      setError(res.message || 'Failed to load trip details');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading trip details...</div>;
  }

  if (error || !trip) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={onBack} className="text-emerald-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Trip Details</h1>
      </div>

      {/* Trip Status Layer */}
      <div className="mb-6 flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${trip.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' : trip.status === 'COMPLETED' ? 'bg-slate-400' : 'bg-amber-400'}`} />
          <span className="font-bold text-slate-800 tracking-tight">TRIP {trip.status.replace('_', ' ')}</span>
        </div>
        <div className="text-xs font-mono text-slate-400">ID: {trip.id}</div>
      </div>

      {/* Map Layer */}
      <div className="mb-6 relative">
        <LiveTripMap location={latestLocation} vehicleType="CAR" />
        {isConnected && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            LIVE
          </div>
        )}
      </div>

      {/* Driver/Vehicle Info Layer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Driver</h3>
            <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {trip.host?.name || 'Unknown'}
              {trip.host?.rating && (
                <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  ⭐ {trip.host.rating}
                </span>
              )}
            </div>
            <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Profile
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Route</h3>
            <div className="font-semibold text-slate-900">{trip.ride.from}</div>
            <div className="text-slate-400 text-xs my-0.5">↓</div>
            <div className="font-semibold text-slate-900">{trip.ride.to}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-100 pt-5">
          <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-lg font-bold text-sm transition-colors">
            <Phone className="w-4 h-4" /> Call
          </button>
          <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-lg font-bold text-sm transition-colors">
            <MessageCircle className="w-4 h-4" /> Message
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-bold text-sm transition-colors">
            <Share2 className="w-4 h-4 text-slate-400" /> Share Trip
          </button>
          <button className="flex items-center justify-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-lg font-bold text-sm transition-colors">
            <AlertTriangle className="w-4 h-4" /> SOS
          </button>
        </div>

      </div>
    </div>
  );
};
