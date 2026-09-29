import { FormEvent, useState } from "react";
import { ArrowRight, CarFront, Clock3, MapPin, Search, Users } from "lucide-react";
import { rideApi } from "../services/rideApi";
import { bookingApi } from "../services/bookingApi";
import type { Ride } from "../types/domain";

export function FindRide() {
  const [origin,setOrigin]=useState(""); const [destination,setDestination]=useState(""); const [departureTime,setDepartureTime]=useState(""); const [rides,setRides]=useState<Ride[]>([]); const [loading,setLoading]=useState(false); const [message,setMessage]=useState("");
  async function search(e:FormEvent){e.preventDefault();setMessage("");setLoading(true);try{setRides(await rideApi.search({origin,destination,departureTime}));}catch(e){setMessage(e instanceof Error?e.message:"Unable to search rides.");}finally{setLoading(false);}}
  async function request(id:string){try{await bookingApi.request(id);setMessage("Seat requested. The host can now review your request.");}catch(e){setMessage(e instanceof Error?e.message:"Unable to request this ride.");}}
  return <div className="portal-page"><div className="page-heading"><div><div className="section-kicker">FIND A RIDE</div><h1>Where are you going?</h1><p>Search real rides published by WayMate users.</p></div></div>
    <form className="search-panel" onSubmit={search}><div className="field"><label>From</label><div className="field-input"><MapPin size={17}/><input required value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="HSR Layout"/></div></div><div className="field"><label>To</label><div className="field-input"><MapPin size={17}/><input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Whitefield"/></div></div><div className="field"><label>Departure</label><div className="field-input"><Clock3 size={17}/><input type="datetime-local" value={departureTime} onChange={e=>setDepartureTime(e.target.value)}/></div></div><button className="btn primary" disabled={loading}><Search size={17}/>{loading?"Searching...":"Find rides"}</button></form>
    {message && <div className="notice">{message}</div>}
    <div className="results-head"><b>{rides.length} rides found</b><span>Live results from WayMate</span></div>
    <div className="ride-results">{rides.map(r=><div className="ride-card" key={r.id}><div className="ride-time"><b>{new Date(r.departureTime).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</b><span>{new Date(r.departureTime).toLocaleDateString()}</span></div><div className="ride-route"><b>{r.origin}</b><div className="route-stem"><i/><span/><i/></div><b>{r.destination}</b></div><div className="ride-host"><div className="mini-avatar">{(r.host?.profile?.firstName||"W").charAt(0)}</div><div><b>{r.host?.profile?.firstName || "WayMate member"}</b><span>⭐ {r.host?.profile?.rating ?? "New"} · {r.vehicle?.type === "BIKE" ? "Bike" : "Car"}</span></div></div><div className="ride-seats"><Users size={15}/>{r.availableSeats} seat{r.availableSeats===1?"":"s"}<b>{r.price ? `₹${r.price}` : "Shared"}</b></div><button className="btn small primary" onClick={()=>request(r.id)}>Request seat <ArrowRight size={14}/></button></div>)}</div>
  </div>;
}
