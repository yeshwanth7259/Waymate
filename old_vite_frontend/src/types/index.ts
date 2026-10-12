export interface User {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  workEmail?: string;
  company?: string;
  rating: number;
  totalRides: number;
  isPhoneVerified: boolean;
  isWorkVerified: boolean;
  isGovtIdVerified: boolean;
  isDrivingLicenseVerified?: boolean;
  gender: 'female' | 'male' | 'other';
  bio?: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  seats: number;
  isEv?: boolean;
}

export interface CorridorStop {
  name: string;
  timeEstimate: string;
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  driverId: string;
  driver: User;
  vehicle: Vehicle;
  origin: string;
  destination: string;
  corridor: string;
  stops: CorridorStop[];
  departureDate: string;
  departureTime: string;
  returnTime?: string;
  isRecurring: boolean;
  recurringDays?: string[];
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number; // in INR
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  ridePin: string;
  allowWomenOnly: boolean;
  coWorkersOnly: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  rideId: string;
  ride: Ride;
  passengerId: string;
  passenger: User;
  seatsBooked: number;
  pickupPoint: string;
  dropPoint: string;
  fare: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  bookedAt: string;
  ridePin: string;
  ratedByPassenger?: boolean;
  rating?: number;
  review?: string;
}

export interface TechCorridor {
  id: string;
  name: string;
  subCorridors: string[];
  distanceKm: number;
  avgTravelTimeMin: number;
  activeCarpools: number;
  avgCostPerSeat: number;
  co2SavedKgMonth: number;
  keyStops: string[];
}

export interface KarnatakaCity {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'beta' | 'planned';
  targetLaunch: string;
  commutersDaily: string;
  primaryCorridors: string[];
}
