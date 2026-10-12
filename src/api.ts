import type { User } from '@firebase/auth';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? '/api' : 'https://waymate-backend-g17d.onrender.com/api')).replace(/\/+$/, '');

export type Ride = {
  id: string | number;
  from?: string;
  to?: string;
  origin?: string;
  destination?: string;
  departureTime: string;
  availableSeats: number;
  price?: number;
  purpose?: string;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  womenOnly?: boolean;
  status: string;
  host?: {
    id?: number;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    rating?: number;
    ratingCount?: number;
    verified?: boolean;
    profile?: { fullName?: string | null; gender?: string | null };
  };
  vehicle?: {
    id?: number;
    type: 'CAR' | 'BIKE';
    brand?: string | null;
    make?: string | null;
    model?: string | null;
    registrationNumber?: string | null;
    color?: string | null;
    seatCapacity?: number;
    seats?: number;
    verified?: boolean;
  };
  trip?: { id: string; status: string } | null;
  requests?: {
    id: number | string;
    status: string;
    seats: number;
    riderId?: number;
    rider?: { firstName?: string | null; phone?: string | null; profile?: { fullName?: string | null; gender?: string | null } };
  }[];
  bookings?: {
    id: number | string;
    status: string;
    seats?: number;
    amount?: number;
    cashPaymentStatus?: string;
    rider?: { firstName?: string | null; phone?: string | null; profile?: { fullName?: string | null } };
    ride?: Ride;
  }[];
};

export type Vehicle = {
  id: string | number;
  type: 'CAR' | 'BIKE';
  brand?: string;
  make?: string;
  model: string;
  registrationNumber: string;
  color?: string | null;
  seatCapacity?: number;
  seats?: number;
  verified?: boolean;
  verificationStatus?: string;
  documents?: { type: string; status: string; rejectionReason?: string | null }[];
};

export type Profile = {
  id?: string | number;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  kycStatus?: string;
  role?: 'RIDER' | 'DRIVER' | null;
};

export type FareEstimate = { minimum: number; maximum: number; suggested: number };
export type PopularRoute = {
  origin: string;
  destination: string;
  route: string;
  activeRides: number;
  avgPrice: number;
};

export async function publicApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const raw = await response.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data
      ? String((data as { message: unknown }).message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function api<T>(user: User, path: string, init: RequestInit = {}): Promise<T> {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const raw = await response.text();
  let data: unknown;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data
      ? String((data as { message: unknown }).message)
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function queryString(query: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params.toString();
}
