import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CircleStop, LoaderCircle, Navigation, Play, ShieldAlert } from "lucide-react";
import { useTripLocation } from "../hooks/useTripLocation";
import { useHostLocationPublisher } from "../hooks/useHostLocationPublisher";
import { tripApi } from "../services/tripApi";
import { userApi } from "../services/userApi";
import type { Trip, User } from "../types/domain";
import { LiveTripMap } from "../components/maps/LiveTripMap";

export function LiveTrip() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { latestLocation, isConnected, error: socketError } = useTripLocation(id || null);
  const isHost = !!me?.id && !!trip?.ride?.host?.id && me.id === trip.ride.host.id;
  const { sharing, error: gpsError } = useHostLocationPublisher(
    id || null,
    isHost && trip?.status === "IN_PROGRESS"
  );

  useEffect(() => {
    if (!id) return;
    Promise.all([tripApi.get(id), userApi.me()])
      .then(([nextTrip, currentUser]) => {
        setTrip(nextTrip);
        setMe(currentUser);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load this trip."));
  }, [id]);

  async function changeStatus(action: "start" | "complete" | "cancel") {
    if (!id) return;
    setActionLoading(true);
    setError("");
    try {
      const next = action === "start"
        ? await tripApi.start(id)
        : action === "complete"
          ? await tripApi.complete(id)
          : await tripApi.cancel(id);
      setTrip(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update trip status.");
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return <div className="portal-page"><div className="notice error">{error}</div></div>;
  }

  const status = trip?.status;

  return (
    <div className="portal-page">
      <Link to="/app/rides" className="back-link"><ArrowLeft size={16} /> My rides</Link>

      <div className="live-heading">
        <div>
          <div className="section-kicker">TRIP TRACKING</div>
          <h1>{trip?.ride?.origin || "Origin"} → {trip?.ride?.destination || "Destination"}</h1>
          <p>{status === "IN_PROGRESS" ? "The trip is live. Location updates appear automatically." : `Trip status: ${status || "Loading..."}`}</p>
        </div>
        <div className={`connection-pill ${isConnected ? "on" : "off"}`}>
          {isConnected ? <><span /> Live connection</> : <><LoaderCircle size={15} /> Connecting</>}
        </div>
      </div>

      {(socketError || gpsError) && <div className="notice error">{socketError || gpsError}</div>}

      {isHost && (
        <div className="host-controls">
          <div>
            <span className="section-kicker">HOST CONTROLS</span>
            <b>{status === "IN_PROGRESS" ? "GPS sharing is active" : "Control the trip lifecycle"}</b>
            <small>{sharing ? "This browser is publishing device GPS to the trip." : "Location publishing starts only after the trip is IN_PROGRESS."}</small>
          </div>
          <div className="heading-actions">
            {status === "SCHEDULED" && <button className="btn primary" disabled={actionLoading} onClick={() => void changeStatus("start")}><Play size={16} /> Start trip</button>}
            {status === "IN_PROGRESS" && <button className="btn primary" disabled={actionLoading} onClick={() => void changeStatus("complete")}><CircleStop size={16} /> Complete trip</button>}
            {(status === "SCHEDULED" || status === "IN_PROGRESS") && <button className="btn secondary" disabled={actionLoading} onClick={() => void changeStatus("cancel")}>Cancel</button>}
          </div>
        </div>
      )}

      <div className="live-layout">
        <div>
          <LiveTripMap location={latestLocation} vehicleType={trip?.ride?.vehicle?.type} />
          <div className="location-meta">
            {latestLocation ? (
              <>
                <span><CheckCircle2 size={15} /> Updated {new Date(latestLocation.timestamp).toLocaleTimeString()}</span>
                {latestLocation.speed != null && <span><Navigation size={14} /> {Math.round(latestLocation.speed)} km/h</span>}
              </>
            ) : (
              <span>Waiting for the driver's first GPS update.</span>
            )}
          </div>
        </div>

        <aside className="trip-side">
          <div className="trip-status">
            <span className="live-pill"><i /> {status || "LOADING"}</span>
            <h3>{isHost ? "You're the host" : "Trip access protected"}</h3>
            <p>{isHost ? "Only you can publish the trip's GPS location. Confirmed riders can view it." : "Only the host and confirmed riders can receive this trip's live location."}</p>
          </div>
          <div className="trip-side-card">
            <b>Vehicle</b>
            <div>{trip?.ride?.vehicle?.type || "Vehicle"} · {trip?.ride?.vehicle?.make || ""} {trip?.ride?.vehicle?.model || ""}</div>
            <div>{trip?.ride?.vehicle?.registrationNumber || "Registration unavailable"}</div>
          </div>
          <div className="trip-side-card">
            <b>Live tracking</b>
            <div>GPS is accepted only while the trip is in progress.</div>
            <div>The latest location is delivered to authorized trip members.</div>
            <div>Location storage is cleared when the trip ends or is cancelled.</div>
          </div>
          <div className="safety-banner"><ShieldAlert /><div><b>Safety layer</b><span>Trip sharing and SOS will be connected in the dedicated safety phase.</span></div></div>
        </aside>
      </div>
    </div>
  );
}
