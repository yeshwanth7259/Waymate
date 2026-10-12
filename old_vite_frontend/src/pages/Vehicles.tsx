import { useEffect, useState } from "react";
import { Bike, CarFront, Plus, Trash2 } from "lucide-react";
import { vehicleApi } from "../services/vehicleApi";
import type { Vehicle } from "../types/domain";

export function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ type: "CAR", make: "", model: "", registrationNumber: "", color: "", seats: "4" });

  async function load() {
    try { setVehicles(await vehicleApi.list()); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load vehicles."); }
  }
  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await vehicleApi.create({ ...form, seats: Number(form.seats) });
      setOpen(false);
      setForm({ ...form, make: "", model: "", registrationNumber: "", color: "" });
      await load();
      setMessage("Vehicle added.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to add vehicle."); }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this vehicle from WayMate?")) return;
    try { await vehicleApi.remove(id); await load(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to remove vehicle."); }
  }

  return <div className="portal-page">
    <div className="page-heading"><div><div className="section-kicker">VEHICLES</div><h1>Your vehicles.</h1><p>Add the cars or bikes you use when offering rides.</p></div><button className="btn primary" onClick={() => setOpen(!open)}><Plus size={17}/> Add vehicle</button></div>
    {message && <div className="notice">{message}</div>}
    {open && <form className="form-card compact" onSubmit={add}>
      <div className="form-grid"><label className="field"><span>Type</span><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="CAR">CAR</option><option value="BIKE">BIKE</option></select></label><label className="field"><span>Seats</span><input type="number" min="1" max="8" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })}/></label><label className="field"><span>Make</span><input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })}/></label><label className="field"><span>Model</span><input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}/></label><label className="field"><span>Registration</span><input required value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}/></label><label className="field"><span>Color</span><input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}/></label></div>
      <button className="btn primary">Save vehicle</button>
    </form>}
    {vehicles.length ? <div className="vehicle-grid">{vehicles.map(v => <div className="vehicle-card" key={v.id}><div className="vehicle-icon">{v.type === "BIKE" ? <Bike/> : <CarFront/>}</div><div className="row-main"><b>{v.make || "Vehicle"} {v.model || ""}</b><span>{v.registrationNumber}</span><small>{v.type} · {v.seats || 1} seats · {v.color || "Color not set"}</small></div><button className="icon-btn reject" title="Remove vehicle" onClick={() => void remove(v.id)}><Trash2 size={16}/></button></div>)}</div> : <div className="empty-card"><b>No vehicles added</b><span>Add a vehicle before publishing your first ride.</span></div>}
  </div>;
}
