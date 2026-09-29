import { api } from "./api";
import type { RideRequest } from "../types/domain";

export const requestApi = {
  my: () => api<RideRequest[]>("/requests/my"),
  accept: (id: string) => api<RideRequest>(`/requests/${id}/accept`, { method: "POST" }),
  reject: (id: string) => api<RideRequest>(`/requests/${id}/reject`, { method: "POST" }),
};
