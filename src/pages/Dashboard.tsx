import { Link } from "react-router-dom";
import { ArrowRight, Bike, CarFront, MapPinned, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { bookingApi } from "../services/bookingApi";
import { rideApi } from "../services/rideApi";
import type { Booking, Ride } from "../types/domain";

export function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  useEffect(() => { Promise.all([bookingApi.my(), rideApi.my()]).then(([b,r]) => { setBookings(b); setRides(r); }).catch(console.error); }, []);
  const active = bookings.find(b => b.ride?.trip?.status === "IN_PROGRESS")?.ride?.trip;
  return <div className="portal-page">
    <div className="page-heading"><div><div className="section-kicker">WAYMATE DASHBOARD</div><h1>Your commute, in one place.</h1><p>Find a ride, offer a seat, or continue an active trip.</p></div><div className="heading-actions"><Link className="btn secondary" to="/app/offer"><Plus size={17}/> Offer ride</Link><Link className="btn primary" to="/app/find"><Search size={17}/> Find ride</Link></div></div>
    {active && <Link to={`/app/trips/${active.id}`} className="active-trip-banner"><div><span className="live-pill"><i/> LIVE TRIP</span><b>Your trip is in progress</b><small>Open the live map to track the journey.</small></div><ArrowRight/></Link>}
    <div className="dashboard-grid">
      <Link to="/app/find" className="portal-card action-card"><div className="action-icon"><Search/></div><b>Find a ride</b><span>Search available commutes by route and time.</span><ArrowRight/></Link>
      <Link to="/app/offer" className="portal-card action-card"><div className="action-icon"><Plus/></div><b>Offer a ride</b><span>Publish your route and let others request seats.</span><ArrowRight/></Link>
      <Link to="/app/rides" className="portal-card action-card"><div className="action-icon"><MapPinned/></div><b>My rides</b><span>Manage bookings, hosted rides and trips.</span><ArrowRight/></Link>
    </div>
    <div className="content-two-col"><section><div className="subheading"><h2>Recent bookings</h2><Link to="/app/rides">View all</Link></div><div className="list-card">{bookings.length ? bookings.slice(0,4).map(b => <BookingRow key={b.id} booking={b}/>) : <Empty title="No bookings yet" text="Search for your first ride." link="/app/find"/>}</div></section><section><div className="subheading"><h2>Your hosted rides</h2><Link to="/app/rides">View all</Link></div><div className="list-card">{rides.length ? rides.slice(0,4).map(r => <RideRow key={r.id} ride={r}/>) : <Empty title="No hosted rides" text="Have an empty seat? Offer a ride." link="/app/offer"/>}</div></section></div>
    <div className="safety-banner"><ShieldCheck/><div><b>WayMate safety</b><span>Your live location is shared only with authorized members of the active trip.</span></div></div>
  </div>;
}
function BookingRow({ booking }: { booking: Booking }) { const r=booking.ride; return <div className="list-row"><div className="row-icon"><CarFront size={17}/></div><div className="row-main"><b>{r?.origin || "Origin"} → {r?.destination || "Destination"}</b><span>{r ? new Date(r.departureTime).toLocaleString() : "Ride"}</span></div><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span></div>; }
function RideRow({ ride }: { ride: Ride }) { return <div className="list-row"><div className="row-icon"><CarFront size={17}/></div><div className="row-main"><b>{ride.origin} → {ride.destination}</b><span>{new Date(ride.departureTime).toLocaleString()} · {ride.availableSeats} seats</span></div><span className="status status-confirmed">{ride.trip?.status || "SCHEDULED"}</span></div>; }
function Empty({ title, text, link }: { title:string; text:string; link:string }) { return <div className="empty-card"><b>{title}</b><span>{text}</span><Link to={link}>Continue <ArrowRight size={14}/></Link></div>; }
