"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

// CSP-safe pin (no external image → avoids Leaflet's broken default-marker 404)
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;background:#BE123C;border:3px solid #fff;box-shadow:0 2px 6px rgba(36,23,18,.45);transform:rotate(-45deg)"></span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function PinDropper({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function SosLocationMap({ lat, lng, onChange }: { lat?: number; lng?: number; onChange: (lat: number, lng: number) => void }) {
  const center: [number, number] = [lat ?? 7.8731, lng ?? 80.7718];

  return (
    <div className="overflow-hidden rounded-xl border border-[#E4D9C6]" role="application" aria-label="Map of Sri Lanka — tap to drop a pin on the animal's location">
      <MapContainer center={center} zoom={lat && lng ? 14 : 8} scrollWheelZoom className="h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinDropper onChange={onChange} />
        {lat && lng ? <Marker position={[lat, lng]} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
