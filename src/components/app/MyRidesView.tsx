import React, { useState } from 'react';
import { Booking, Ride, User } from '../../types';
import { Car, Clock, ShieldCheck, MapPin, AlertTriangle, CheckCircle2, Star, Phone, Navigation } from 'lucide-react';

interface MyRidesViewProps {
  bookings: Booking[];
  offeredRides: Ride[];
  currentUser: User;
  onCompleteBooking: (bookingId: string, rating: number, review: string) => void;
  onFindRideClick: () => void;
}

export const MyRidesView: React.FC<MyRidesViewProps> = ({
  bookings,
  offeredRides,
  currentUser,
  onCompleteBooking,
  onFindRideClick
}) => {
  const [activeTab, setActiveTab] = useState<'booked' | 'offered'>('booked');
  const [showSosModal, setShowSosModal] = useState(false);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [reviewText, setReviewText] = useState('Smooth and punctual commute along ORR. Highly recommended colleague!');

  const activeBooking = bookings.find(b => b.status === 'confirmed' || b.status === 'active') || bookings[0];

  const handleReviewSubmit = (bookingId: string) => {
    onCompleteBooking(bookingId, selectedStars, reviewText);
    setRatingBookingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-emerald-700">
            Commuter Dashboard · Ride History & Active Trips
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl mt-1">
            My Commute Journeys
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily carpool bookings, live boarding PIN, and driver coordination
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab('booked')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'booked' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            As Passenger ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('offered')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'offered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            As Driver ({offeredRides.length})
          </button>
        </div>
      </div>

      {/* Active Trip Banner if available */}
      {activeBooking && activeTab === 'booked' && (
        <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50/30 p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-emerald-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Active Commute Today
                </span>
                <div className="text-base font-bold text-slate-900">
                  {activeBooking.pickupPoint} → {activeBooking.dropPoint}
                </div>
              </div>
            </div>

            {/* Boarding PIN Lockup */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 px-4 py-2 text-center text-white">
                <div className="text-[10px] text-slate-400">Boarding Ride PIN</div>
                <div className="font-mono text-xl font-extrabold tracking-widest text-emerald-400">
                  {activeBooking.ridePin}
                </div>
              </div>

              <button
                onClick={() => setShowSosModal(true)}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency SOS</span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Driver & Vehicle:</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {activeBooking.ride.driver.name} · {activeBooking.ride.vehicle.make} {activeBooking.ride.vehicle.model}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {activeBooking.ride.vehicle.plateNumber}
              </div>
            </div>

            <div>
              <span className="text-slate-500">Departure & Route:</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {activeBooking.ride.departureTime} (Today)
              </div>
              <div className="text-[11px] text-slate-500">
                Via Silk Board & Bellandur Ecoworld
              </div>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <button
                onClick={() => setRatingBookingId(activeBooking.id)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Complete Ride & Rate Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content List */}
      <div className="mt-8 space-y-4">
        {activeTab === 'booked' ? (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">All Passenger Bookings</h3>
            {bookings.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                You haven't booked any rides yet.
                <button onClick={onFindRideClick} className="block mx-auto mt-3 text-emerald-700 font-bold hover:underline">
                  Find a Ride Now →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {booking.pickupPoint} → {booking.dropPoint}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Driver: {booking.ride.driver.name} ({booking.ride.driver.company || 'Verified'}) · {booking.ride.vehicle.make}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          booking.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {booking.status === 'completed' ? 'Trip Completed' : 'Confirmed'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          ₹{booking.fare}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        Booked: {booking.bookedAt} · PIN: <strong className="font-mono text-slate-800">{booking.ridePin}</strong>
                      </div>
                      {booking.ratedByPassenger ? (
                        <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Rated ★ {booking.rating}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRatingBookingId(booking.id)}
                          className="text-xs text-slate-900 font-semibold hover:underline"
                        >
                          Rate this commute
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Rides Offered by You</h3>
            {offeredRides.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                You have not offered any rides yet.
              </div>
            ) : (
              <div className="space-y-3">
                {offeredRides.map((ride) => (
                  <div key={ride.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {ride.origin} → {ride.destination}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {ride.corridor} · Departs {ride.departureTime}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-slate-900">
                          ₹{ride.pricePerSeat} / seat
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          {ride.availableSeats} of {ride.totalSeats} seats open
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        Vehicle: {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.plateNumber})
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">PIN: {ride.ridePin}</span>
                        <span className="text-emerald-700 font-semibold">Active Daily</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 mx-auto mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-center text-lg font-bold text-slate-900">
              WayMate Safety Response (SOS)
            </h3>
            <p className="text-center text-xs text-slate-600 mt-1">
              Your live GPS coordinates (12.9288° N, 77.6833° E) along the Outer Ring Road corridor will be dispatched instantly.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  alert('Bengaluru Police Commute Control Room (112) alerted with live vehicle coordinates KA 01 MR 7812.');
                  setShowSosModal(false);
                }}
                className="w-full rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call Emergency Police (112)</span>
              </button>

              <button
                onClick={() => {
                  alert('Live tracking link sent via SMS to your 2 registered emergency family contacts.');
                  setShowSosModal(false);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Alert Family Contacts with Live Tracking Link
              </button>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel / False Alarm
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 text-center">
              Rate Your Commute
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Feedback helps maintain the trust score of the Bengaluru commuter network.
            </p>

            {/* Stars */}
            <div className="my-5 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedStars(star)}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    star <= selectedStars ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              placeholder="How was the punctuality, cleanliness, and driving comfort?"
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setRatingBookingId(null)}
                className="w-1/2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSubmit(ratingBookingId)}
                className="w-1/2 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
