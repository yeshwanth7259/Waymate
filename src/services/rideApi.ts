import { api } from "./api";
import type { Ride } from "../types/domain";

export const rideApi = {
  search: (params: { origin: string; destination: string; departureTime?: string }) => {
    const query = new URLSearchParams(params);
    return api<Ride[]>(`/rides/search?${query.toString()}`);
  },
  my: () => api<Ride[]>("/rides/my"),
  get: (id: string) => api<Ride>(`/rides/${id}`),
  create: (payload: unknown) => api<Ride>("/rides", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => api<Ride>(`/rides/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => api<void>(`/rides/${id}`, { method: "DELETE" }),
};
