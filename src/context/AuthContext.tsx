import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../services/firebase";
import { api } from "../services/api";

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  currentUser: any;
  loading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  logout: () => Promise<void>;
  loginWithPhone: (phone: string, recaptchaVerifier: any) => Promise<any>;
  setupRecaptcha: (containerId: string) => any;
  sendOtp: (phone: string, appVerifier: any) => Promise<any>;
  verifyOtp: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    setFirebaseUser(user);
    if (user) {
      try {
        await api("/auth/sync", {
          method: "POST",
          body: JSON.stringify({
            firebaseUid: user.uid,
            phone: user.phoneNumber ?? undefined,
          }),
        });
      } catch (e) {
        console.error("Auth sync failed", e);
      }
    }
    setLoading(false);
  }), []);

  const value = useMemo(() => ({
    firebaseUser,
    currentUser: firebaseUser,
    loading,
    isAuthenticated: !!firebaseUser,
    accessToken: "dummy_token",
    logout: () => signOut(auth),
    loginWithPhone: async () => {},
    setupRecaptcha: () => {},
    sendOtp: async () => {},
    verifyOtp: async () => {},
  }), [firebaseUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
