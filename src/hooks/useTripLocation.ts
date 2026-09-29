import { useEffect, useState } from "react";
import type { LocationUpdate } from "../types/domain";
import { wayMateSocket } from "../services/socket";

export function useTripLocation(tripId: string | null) {
  const [latestLocation, setLatestLocation] = useState<LocationUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    let mounted = true;

    const current = (location: LocationUpdate) => {
      if (mounted) setLatestLocation(location);
    };
    const update = (location: LocationUpdate) => {
      if (mounted) setLatestLocation(location);
    };
    const socketError = (message: string) => {
      if (mounted) setError(message || "Live trip access was rejected.");
    };

    (async () => {
      try {
        await wayMateSocket.connect();
        if (!mounted) return;
        setIsConnected(true);
        wayMateSocket.onLocationCurrent(current);
        wayMateSocket.onLocationUpdate(update);
        wayMateSocket.onError(socketError);
        await wayMateSocket.joinTrip(tripId);
      } catch (e) {
        if (mounted) {
          setIsConnected(false);
          setError(e instanceof Error ? e.message : "Unable to connect to live tracking.");
        }
      }
    })();

    return () => {
      mounted = false;
      wayMateSocket.offLocationCurrent(current);
      wayMateSocket.offLocationUpdate(update);
      wayMateSocket.offError(socketError);
      wayMateSocket.leaveTrip(tripId);
      wayMateSocket.disconnect();
    };
  }, [tripId]);

  return { latestLocation, isConnected, error };
}
