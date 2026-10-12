import { api } from "./api";
import type { Vehicle } from "../types/domain";

export const vehicleApi = {
  list: () => api<Vehicle[]>("/vehicles"),
  create: (payload: unknown) => api<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => api<Vehicle>(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string) => api<void>(`/vehicles/${id}`, { method: "DELETE" }),
};
