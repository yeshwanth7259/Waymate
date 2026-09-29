import { auth } from "./firebase";
import type { ApiError } from "../types/domain";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api").replace(/\/$/, "");

async function token() {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const idToken = await token();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (idToken) headers.set("Authorization", `Bearer ${idToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const raw = await response.text();
  let data: unknown = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${response.status})`;
    const error: ApiError = { message, status: response.status };
    throw error;
  }

  return data as T;
}

export { API_BASE_URL };
