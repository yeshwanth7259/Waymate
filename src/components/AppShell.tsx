import { NavLink, Outlet } from "react-router-dom";
import { Bike, CarFront, CircleUserRound, Compass, Home, LogOut, MapPinned, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/app", label: "Dashboard", icon: Home, end: true },
  { to: "/app/find", label: "Find a Ride", icon: Compass },
  { to: "/app/offer", label: "Offer a Ride", icon: Plus },
  { to: "/app/rides", label: "My Rides", icon: MapPinned },
  { to: "/app/vehicles", label: "Vehicles", icon: CarFront },
  { to: "/app/profile", label: "Profile", icon: CircleUserRound },
];

export function AppShell() {
  const { firebaseUser, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/app" className="brand"><span className="brand-mark">W</span><span>WayMate</span></NavLink>
        <div className="side-label">COMMUTE</div>
        <nav>{nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <Icon size={18} /> <span>{label}</span>
          </NavLink>
        ))}</nav>
        <div className="sidebar-bottom">
          <div className="safety-mini"><ShieldCheck size={17}/><div><b>Safety first</b><span>Verified community</span></div></div>
          <button className="side-link logout" onClick={() => void logout()}><LogOut size={18}/> <span>Sign out</span></button>
        </div>
      </aside>
      <main className="main-area">
        <header className="app-topbar">
          <div className="mobile-brand-wrap"><span className="mobile-brand">WayMate</span><span className="mobile-beta">BETA</span></div>
          <div className="top-user"><div className="avatar">{(firebaseUser?.phoneNumber || "W").slice(-1).toUpperCase()}</div><span>{firebaseUser?.phoneNumber || "WayMate user"}</span></div>
        </header>
        <div className="content"><Outlet /></div>
        <nav className="mobile-nav">
          {nav.slice(0, 5).map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({isActive}) => isActive ? "active" : ""}><Icon size={19}/><span>{label === "Find a Ride" ? "Find" : label === "Offer a Ride" ? "Offer" : label.replace("Dashboard", "Home").replace("My Rides", "Rides")}</span></NavLink>)}
        </nav>
      </main>
    </div>
  );
}
