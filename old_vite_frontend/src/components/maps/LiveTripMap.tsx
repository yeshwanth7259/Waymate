import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LocationUpdate, VehicleType } from "../../types/domain";
import "leaflet/dist/leaflet.css";
import "../../styles/map.css";

function Recenter({ location }: { location: LocationUpdate }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 14), { duration: 0.7 });
  }, [location.latitude, location.longitude, map]);
  return null;
}

function vehicleIcon(type: VehicleType = "CAR") {
  const emoji = type === "BIKE" ? "🏍️" : "🚗";
  return L.divIcon({
    className: "waymate-vehicle-marker",
    html: `<div class="waymate-marker">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function LiveTripMap({
  location,
  vehicleType = "CAR",
}: {
  location: LocationUpdate | null;
  vehicleType?: VehicleType;
}) {
  if (!location) {
    return (
      <div className="live-map-empty">
        <div className="live-map-empty-icon">📍</div>
        <strong>Waiting for driver's location</strong>
        <span>The map will update automatically when the trip starts sharing GPS.</span>
      </div>
    );
  }

  return (
    <div className="live-map">
      <MapContainer center={[location.latitude, location.longitude]} zoom={14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter location={location} />
        <Marker position={[location.latitude, location.longitude]} icon={vehicleIcon(vehicleType)}>
          <Popup>WayMate driver</Popup>
        </Marker>
      </MapContainer>
      <div className="live-map-badge"><span /> LIVE</div>
    </div>
  );
}
