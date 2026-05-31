import { districtCenter } from "@/lib/sos/districts";

// Free OpenStreetMap geocoder — no API key, no billing.
// Nominatim usage policy: callers must throttle (we debounce + abort in the UI,
// staying well under 1 req/s) and identify themselves. Browsers send a Referer
// automatically (User-Agent is a forbidden header in fetch), which satisfies the
// identification requirement for a client-side app.
const ENDPOINT = "https://nominatim.openstreetmap.org/search";

export type GeoSuggestion = {
  id: string;
  label: string; // primary line, e.g. "Galle Face Green"
  detail: string; // secondary line, e.g. "Colombo, Western Province"
  lat: number;
  lng: number;
};

export async function searchPlaces(
  query: string,
  opts: { district?: string; signal?: AbortSignal } = {},
): Promise<GeoSuggestion[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", "lk"); // bias hard to Sri Lanka
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");
  url.searchParams.set("limit", "8");

  // Soft-bias toward the selected district: viewbox is a *preference* (bounded=0),
  // so nearby results rank first but other districts are still returned.
  const center = opts.district ? districtCenter(opts.district) : undefined;
  if (center) {
    const d = 0.55; // ~60 km box around the district centre
    url.searchParams.set("viewbox", `${center.lng - d},${center.lat + d},${center.lng + d},${center.lat - d}`);
    url.searchParams.set("bounded", "0");
  }

  const res = await fetch(url, { signal: opts.signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder responded ${res.status}`);
  const raw = (await res.json()) as Array<{ place_id: number | string; display_name: string; lat: string; lon: string }>;

  const items = raw
    .map((r): GeoSuggestion | null => {
      const lat = Number(r.lat);
      const lng = Number(r.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      const [first, ...rest] = (r.display_name ?? "").split(", ");
      return { id: String(r.place_id), label: first || r.display_name, detail: rest.join(", "), lat, lng };
    })
    .filter((x): x is GeoSuggestion => x !== null);

  return rankByDistrict(items, opts.district);
}

// Stable partition: matching-district results move to the front, others stay included.
function rankByDistrict(items: GeoSuggestion[], district?: string): GeoSuggestion[] {
  if (!district) return items;
  const needle = district.toLowerCase();
  const matches = items.filter((i) => `${i.label} ${i.detail}`.toLowerCase().includes(needle));
  const rest = items.filter((i) => !matches.includes(i));
  return [...matches, ...rest];
}
