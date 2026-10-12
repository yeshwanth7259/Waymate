export type VehicleType = "CAR" | "BIKE";
export type TripStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  rating?: number;
  verified?: boolean;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  profile?: UserProfile;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  make?: string;
  model?: string;
  registrationNumber?: string;
  color?: string;
  seats?: number;
}

export interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price?: number;
  vehicle?: Vehicle;
  host?: User;
  status?: string;
  trip?: Trip;
}

export interface Booking {
  id: string;
  status: string;
  seats?: number;
  ride?: Ride;
  rider?: User;
  createdAt?: string;
}

export interface RideRequest {
  id: string;
  status: string;
  seats?: number;
  ride?: Ride;
  rider?: User;
  createdAt?: string;
}

export interface Trip {
  id: string;
  rideId: string;
  status: TripStatus;
  ride?: Ride;
  latestLocation?: LocationUpdate | null;
}

export interface ApiError {
  message: string;
  status?: number;
}
