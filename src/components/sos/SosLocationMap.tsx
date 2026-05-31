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

// Default map center when no valid pin exists yet: Colombo, Sri Lanka.
const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612];

// `??` only guards null/undefined — an empty numeric input yields NaN (and typeof NaN === "number"),
// which Leaflet rejects with "Invalid LatLng object: (NaN, NaN)". Require both to be finite numbers.
const validCenter = (lat?: number, lng?: number): [number, number] | null =>
  typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)
    ? [lat, lng]
    : null;

function PinDropper({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function SosLocationMap({ lat, lng, onChange }: { lat?: number; lng?: number; onChange: (lat: number, lng: number) => void }) {
  const pin = validCenter(lat, lng);
  const center: [number, number] = pin ?? DEFAULT_CENTER;
  const hasPin = pin !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-[#E4D9C6]" role="application" aria-label="Map of Sri Lanka — tap to drop a pin on the animal's location">
      <MapContainer center={center} zoom={hasPin ? 14 : 8} scrollWheelZoom className="h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinDropper onChange={onChange} />
        {hasPin ? <Marker position={center} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}
