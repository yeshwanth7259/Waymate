import { useEffect, useRef, useState } from "react";
import type { LocationUpdate } from "../types/domain";
import { tripApi } from "../services/tripApi";

export function useHostLocationPublisher(tripId: string | null, enabled: boolean) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastSentAt = useRef(0);

  useEffect(() => {
    if (!tripId || !enabled || !navigator.geolocation) return;

    setError(null);
    setSharing(true);
    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        if (now - lastSentAt.current < 3000) return;
        lastSentAt.current = now;
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed != null ? Math.max(0, position.coords.speed * 3.6) : undefined,
          timestamp: new Date(position.timestamp).toISOString(),
        };
        try {
          await tripApi.updateLocation(tripId, location);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to publish GPS location.");
        }
      },
      (positionError) => setError(positionError.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setSharing(false);
    };
  }, [tripId, enabled]);

  return { sharing, error };
}
