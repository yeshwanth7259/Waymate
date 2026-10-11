import type { User } from '@firebase/auth';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://waymate-backend-g17d.onrender.com/api').replace(/\/+$/, '');

export type Ride = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price: number;
  distanceKm?: number | null;
  estimatedDurationMinutes?: number | null;
  womenOnly?: boolean;
  status: string;
  host?: { firstName?: string | null; lastName?: string | null; rating?: number; ratingCount?: number; verified?: boolean };
  vehicle?: { type: 'CAR' | 'BIKE'; make?: string | null; model?: string | null; color?: string | null; seats: number; verified?: boolean };
  trip?: { id: string; status: string } | null;
  requests?: { id: string; status: string; seats: number; rider?: { firstName?: string | null; phone?: string | null } }[];
  bookings?: { id: string; status: string; amount: number; cashPaymentStatus: string; rider?: { firstName?: string | null } }[];
};

export type Vehicle = {
  id: string;
  type: 'CAR' | 'BIKE';
  make: string;
  model: string;
  registrationNumber: string;
  seats: number;
  verified: boolean;
  documents?: { type: string; status: string; rejectionReason?: string | null }[];
};

export type Profile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone?: string | null;
  kycStatus?: string;
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
