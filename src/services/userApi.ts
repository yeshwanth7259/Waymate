import { api } from "./api";
import type { User } from "../types/domain";

export const userApi = {
  me: () => api<User>("/users/me"),
  update: (payload: unknown) => api<User>("/users/me", { method: "PUT", body: JSON.stringify(payload) }),
};
