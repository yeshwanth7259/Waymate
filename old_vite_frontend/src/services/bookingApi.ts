import { api } from "./api";
import type { Booking } from "../types/domain";

export const bookingApi = {
  my: () => api<Booking[]>("/bookings/my"),
  request: (rideId: string, seats = 1) =>
    api<Booking>(`/rides/${rideId}/request`, { method: "POST", body: JSON.stringify({ seats }) }),
  cancel: (id: string) => api<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  accept: (requestId: string) =>
    api<Booking>(`/requests/${requestId}/accept`, { method: "POST" }),
  reject: (requestId: string) =>
    api<Booking>(`/requests/${requestId}/reject`, { method: "POST" }),
};
