import { api } from "./api";
import type { Trip, LocationUpdate } from "../types/domain";

export const tripApi = {
  my: () => api<Trip[]>("/trips/my"),
  get: (id: string) => api<Trip>(`/trips/${id}`),
  start: (id: string) => api<Trip>(`/trips/${id}/start`, { method: "POST" }),
  complete: (id: string) => api<Trip>(`/trips/${id}/complete`, { method: "POST" }),
  cancel: (id: string) => api<Trip>(`/trips/${id}/cancel`, { method: "POST" }),
  updateLocation: (id: string, location: LocationUpdate) =>
    api<void>(`/trips/${id}/location`, { method: "POST", body: JSON.stringify(location) }),
};
