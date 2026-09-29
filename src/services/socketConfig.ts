import { auth } from "./firebase";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api").replace(/\/$/, "");
export { auth };
