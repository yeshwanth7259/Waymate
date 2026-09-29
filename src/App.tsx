import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { FindRide } from "./pages/FindRide";
import { OfferRide } from "./pages/OfferRide";
import { MyRides } from "./pages/MyRides";
import { Vehicles } from "./pages/Vehicles";
import { Profile } from "./pages/Profile";
import { LiveTrip } from "./pages/LiveTrip";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/app" element={<AppShell/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="find" element={<FindRide/>}/>
        <Route path="offer" element={<OfferRide/>}/>
        <Route path="rides" element={<MyRides/>}/>
        <Route path="vehicles" element={<Vehicles/>}/>
        <Route path="profile" element={<Profile/>}/>
        <Route path="trips/:id" element={<LiveTrip/>}/>
      </Route>
    </Route>
    <Route path="/dashboard" element={<Navigate to="/app" replace/>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></AuthProvider></BrowserRouter>;
}
