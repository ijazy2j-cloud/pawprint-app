"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Loader2, MapPin, Search, X } from "lucide-react";

import { searchPlaces, type GeoSuggestion } from "@/lib/geo/nominatim";

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

// Recenters/zooms the live map whenever a valid pin is set (suggestion pick, GPS, or tap).
function Recenter({ center, active }: { center: [number, number]; active: boolean }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    if (!active) return;
    map.setView([lat, lng], Math.max(map.getZoom() ?? 0, 14), { animate: true });
  }, [lat, lng, active, map]);
  return null;
}

// Google-style address search: free Nominatim geocoder, debounced, keyboard-navigable combobox.
function AddressSearch({ district, onSelect }: { district?: string; onSelect: (lat: number, lng: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const hintId = `${baseId}-hint`;
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  // Debounce input ~350ms and abort any in-flight request — keeps us within Nominatim's usage policy.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setOpen(true); // reveal the dropdown immediately so the loading state is visible
    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(q, { district, signal: controller.signal });
        setResults(found);
        setActive(found.length ? 0 : -1);
        setSearched(true);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(true);
        setResults([]);
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, district]);

  function choose(suggestion: GeoSuggestion) {
    onSelect(suggestion.lat, suggestion.lng);
    setQuery(suggestion.label);
    setResults([]);
    setActive(-1);
    setOpen(false);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open && results.length) setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      // Never let the address search submit the surrounding SOS form.
      event.preventDefault();
      if (open && active >= 0 && results[active]) choose(results[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const showDropdown = open && (loading || error || results.length > 0 || searched);

  return (
    <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <label htmlFor={inputId} className="block text-sm font-bold text-[#241712]">Search for a place</label>
      <p id={hintId} className="mt-0.5 text-xs text-[#6B5847]">Find a town, road or landmark — or tap the map below to drop a pin.</p>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[#92400E]" aria-hidden />
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={hintId}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => { if (query.trim().length >= 3 && (results.length || error)) setOpen(true); }}
          placeholder="e.g. Galle Face, Colombo"
          className="min-h-12 w-full rounded-2xl border border-[#E4D9C6] bg-white py-3 pl-11 pr-11 text-base shadow-sm placeholder:text-[#7A6A58]"
        />
        {loading ? (
          <Loader2 className="absolute right-3.5 top-1/2 size-5 -translate-y-1/2 animate-spin text-[#92400E]" aria-hidden />
        ) : query ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#6B5847] hover:bg-[#F4EEE2]"
          >
            <X className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>

      {showDropdown ? (
        <div className="absolute z-[1000] mt-2 w-full overflow-hidden rounded-2xl border border-[#E4D9C6] bg-white shadow-[0_12px_32px_rgba(36,23,18,.16)]">
          {error ? (
            <p className="px-3.5 py-3 text-sm text-[#6B5847]">Search is unavailable right now. Tap the map or use “My location” instead.</p>
          ) : loading && results.length === 0 ? (
            <p className="flex items-center gap-2 px-3.5 py-3 text-sm text-[#6B5847]"><Loader2 className="size-4 animate-spin" aria-hidden /> Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3.5 py-3 text-sm text-[#6B5847]">No matching places. Try a nearby town, or tap the map.</p>
          ) : (
            // A listbox must contain only options — status messages above live outside it.
            <ul role="listbox" id={listId} aria-label="Location suggestions" className="max-h-72 overflow-auto p-1.5">
              {results.map((suggestion, i) => (
                <li
                  key={suggestion.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(suggestion)}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 ${i === active ? "bg-amber-100" : "hover:bg-[#F4EEE2]"}`}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-[#92400E]" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[#241712]">{suggestion.label}</span>
                    {suggestion.detail ? <span className="block truncate text-xs text-[#6B5847]">{suggestion.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <span role="status" aria-live="polite" className="sr-only">
        {loading
          ? "Searching for places"
          : error
            ? "Location search is unavailable"
            : open && results.length
              ? `${results.length} location suggestion${results.length === 1 ? "" : "s"} available`
              : open && searched && !results.length
                ? "No matching places found"
                : ""}
      </span>
    </div>
  );
}

export function SosLocationMap({ lat, lng, district, onChange }: { lat?: number; lng?: number; district?: string; onChange: (lat: number, lng: number) => void }) {
  const pin = validCenter(lat, lng);
  const center: [number, number] = pin ?? DEFAULT_CENTER;
  const hasPin = pin !== null;

  return (
    <div className="space-y-3">
      <AddressSearch district={district} onSelect={onChange} />
      <div className="overflow-hidden rounded-xl border border-[#E4D9C6]" role="application" aria-label="Map of Sri Lanka — tap to drop a pin on the animal's location">
        <MapContainer center={center} zoom={hasPin ? 14 : 8} scrollWheelZoom className="h-80 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} active={hasPin} />
          <PinDropper onChange={onChange} />
          {hasPin ? <Marker position={center} icon={pinIcon} /> : null}
        </MapContainer>
      </div>
    </div>
  );
}
