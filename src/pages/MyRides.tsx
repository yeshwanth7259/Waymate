import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bike, CarFront, Check, MapPinned, X } from "lucide-react";
import { Link } from "react-router-dom";
import { bookingApi } from "../services/bookingApi";
import { requestApi } from "../services/requestApi";
import { rideApi } from "../services/rideApi";
import type { Booking, Ride, RideRequest } from "../types/domain";

export function MyRides() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [tab, setTab] = useState<"booked" | "hosted" | "requests">("booked");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [b, r, q] = await Promise.all([bookingApi.my(), rideApi.my(), requestApi.my()]);
      setBookings(b);
      setRides(r);
      setRequests(q);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load your rides.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function respond(id: string, action: "accept" | "reject") {
    setMessage("");
    try {
      if (action === "accept") await requestApi.accept(id);
      else await requestApi.reject(id);
      await load();
      setMessage(action === "accept" ? "Booking confirmed." : "Request rejected.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update the request.");
    }
  }

  const pending = useMemo(() => requests.filter(r => r.status === "PENDING"), [requests]);

  return (
    <div className="portal-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">MY RIDES</div>
          <h1>Your journeys.</h1>
          <p>Book a seat, host a ride, and manage requests from one place.</p>
        </div>
      </div>

      {message && <div className="notice">{message}</div>}

      <div className="tabs">
        <button className={tab === "booked" ? "tab-button active" : "tab-button"} onClick={() => setTab("booked")}>Booked ({bookings.length})</button>
        <button className={tab === "hosted" ? "tab-button active" : "tab-button"} onClick={() => setTab("hosted")}>Hosted ({rides.length})</button>
        <button className={tab === "requests" ? "tab-button active" : "tab-button"} onClick={() => setTab("requests")}>Requests {pending.length ? `(${pending.length})` : ""}</button>
      </div>

      {tab === "booked" && <section className="ride-list-section">
        <h2>Booked rides</h2>
        {bookings.length ? bookings.map(b => (
          <div className="my-ride-card" key={b.id}>
            <div className="row-icon">{b.ride?.vehicle?.type === "BIKE" ? <Bike size={18} /> : <CarFront size={18} />}</div>
            <div className="row-main"><b>{b.ride?.origin || "Origin"} → {b.ride?.destination || "Destination"}</b><span>{b.ride ? new Date(b.ride.departureTime).toLocaleString() : "Ride"} · {b.seats || 1} seat</span></div>
            <span className={`status status-${b.status.toLowerCase()}`}>{b.status}</span>
            {b.ride?.trip && <Link className="btn small secondary" to={`/app/trips/${b.ride.trip.id}`}>Open trip <ArrowRight size={14} /></Link>}
          </div>
        )) : <Empty title="No booked rides" text="Find a commute that fits your route." link="/app/find" label="Find a ride" />}
      </section>}

      {tab === "hosted" && <section className="ride-list-section">
        <h2>Hosted rides</h2>
        {rides.length ? rides.map(r => (
          <div className="my-ride-card" key={r.id}>
            <div className="row-icon"><MapPinned size={18} /></div>
            <div className="row-main"><b>{r.origin} → {r.destination}</b><span>{new Date(r.departureTime).toLocaleString()} · {r.availableSeats} seats remaining</span></div>
            <span className="status">{r.trip?.status || "SCHEDULED"}</span>
            {r.trip && <Link className="btn small secondary" to={`/app/trips/${r.trip.id}`}>Manage trip <ArrowRight size={14} /></Link>}
          </div>
        )) : <Empty title="No hosted rides" text="Have an empty seat? Publish your route." link="/app/offer" label="Offer a ride" />}
      </section>}

      {tab === "requests" && <section className="ride-list-section">
        <h2>Passenger requests</h2>
        {requests.length ? requests.map(r => (
          <div className="request-card" key={r.id}>
            <div className="mini-avatar">{(r.rider?.profile?.firstName || "W").charAt(0).toUpperCase()}</div>
            <div className="row-main"><b>{r.rider?.profile?.firstName || "WayMate member"}</b><span>{r.ride?.origin} → {r.ride?.destination} · {r.seats || 1} seat · {r.status}</span></div>
            {r.status === "PENDING" && <div className="request-actions"><button className="icon-btn accept" title="Accept" onClick={() => void respond(r.id, "accept")}><Check size={17} /></button><button className="icon-btn reject" title="Reject" onClick={() => void respond(r.id, "reject")}><X size={17} /></button></div>}
          </div>
        )) : <Empty title="No requests" text="Passenger requests for your hosted rides will appear here." link="/app/offer" label="Offer a ride" />}
      </section>}
    </div>
  );
}

function Empty({ title, text, link, label }: { title: string; text: string; link: string; label: string }) {
  return <div className="empty-card"><b>{title}</b><span>{text}</span><Link to={link}>{label} <ArrowRight size={14} /></Link></div>;
}
