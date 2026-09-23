import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CorridorMapVisual } from './components/CorridorMapVisual';
import { HowItWorks } from './components/HowItWorks';
import { TrustSafetySection } from './components/TrustSafetySection';
import { CorporateSection } from './components/CorporateSection';
import { KarnatakaRoadmapSection } from './components/KarnatakaRoadmapSection';
import { Footer } from './components/Footer';
import { FindRideView } from './components/app/FindRideView';
import { OfferRideView } from './components/app/OfferRideView';
import { MyRidesView } from './components/app/MyRidesView';
import { AdminDashboardView } from './components/app/AdminDashboardView';
import { SoloFounderRoadmapModal } from './components/app/SoloFounderRoadmapModal';
import { INITIAL_RIDES, INITIAL_BOOKINGS, CURRENT_USER } from './data/mockData';
import { Ride, Booking, User } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'app-find' | 'app-offer' | 'app-rides' | 'admin' | 'blueprint'>('landing');
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Handle Search from Landing Page Hero or Corridor Map
  const handleSearchFromLanding = (from: string, to: string) => {
    setSearchFrom(from);
    setSearchTo(to);
    setActiveView('app-find');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Seat Booking
  const handleBookRide = (ride: Ride, pickup: string, drop: string, seats: number) => {
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      rideId: ride.id,
      ride,
      passengerId: currentUser.id,
      passenger: currentUser,
      seatsBooked: seats,
      pickupPoint: pickup,
      dropPoint: drop,
      fare: ride.pricePerSeat * seats,
      status: 'confirmed',
      bookedAt: 'Just now',
      ridePin: ride.ridePin,
      ratedByPassenger: false,
    };

    setBookings(prev => [newBooking, ...prev]);

    // Decrement available seats on the ride
    setRides(prev => prev.map(r => {
      if (r.id === ride.id) {
        return {
          ...r,
          availableSeats: Math.max(0, r.availableSeats - seats)
        };
      }
      return r;
    }));
  };

  // Handle New Ride Offered by Driver
  const handlePublishRide = (newRide: Ride) => {
    setRides(prev => [newRide, ...prev]);
  };

  // Handle Complete Booking and Rating
  const handleCompleteBooking = (bookingId: string, rating: number, review: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'completed',
          ratedByPassenger: true,
          rating,
          review
        };
      }
      return b;
    }));
  };

  const offeredRidesByUser = rides.filter(r => r.driverId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Strict 3-Zone Top Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        currentUser={currentUser}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <>
            <HeroSection
              onSearch={handleSearchFromLanding}
              onOfferRide={() => setActiveView('app-offer')}
              onOpenBlueprint={() => setIsBlueprintOpen(true)}
            />

            {/* Interactive Corridor Route Matching Engine Visual */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
              <CorridorMapVisual onSelectCorridor={handleSearchFromLanding} />
            </section>

            <HowItWorks />
            <TrustSafetySection />
            <CorporateSection />
            <KarnatakaRoadmapSection />
          </>
        )}

        {activeView === 'app-find' && (
          <FindRideView
            rides={rides}
            currentUser={currentUser}
            onBookRide={handleBookRide}
            onSwitchToOffer={() => setActiveView('app-offer')}
            initialFrom={searchFrom}
            initialTo={searchTo}
          />
        )}

        {activeView === 'app-offer' && (
          <OfferRideView
            currentUser={currentUser}
            onPublishRide={handlePublishRide}
            onViewRides={() => setActiveView('app-rides')}
          />
        )}

        {activeView === 'app-rides' && (
          <MyRidesView
            bookings={bookings}
            offeredRides={offeredRidesByUser}
            currentUser={currentUser}
            onCompleteBooking={handleCompleteBooking}
            onFindRideClick={() => setActiveView('app-find')}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      {/* Quiet Footer */}
      <Footer
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        onNavigate={setActiveView}
      />

      {/* Interactive Solo Founder Roadmap & Architecture Modal */}
      <SoloFounderRoadmapModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

    </div>
  );
}
