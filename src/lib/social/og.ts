export type OgType = "sos" | "lost" | "found" | "adopt" | "community";

export function sanitizeOgQuery(value?: string | null) {
  return (value ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
}

export function ogBadgeTone(type: OgType) {
  if (type === "sos") return "red";
  if (type === "lost" || type === "found") return "amber";
  if (type === "adopt") return "green";
  return "blue";
}

export function ogBadgeColors(type: OgType) {
  const tone = ogBadgeTone(type);
  if (tone === "red") return { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5" };
  if (tone === "amber") return { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d" };
  if (tone === "green") return { bg: "#dcfce7", fg: "#166534", border: "#86efac" };
  return { bg: "#dbeafe", fg: "#1e40af", border: "#93c5fd" };
}

export function buildOgImageUrl(input: { title: string; type: OgType; photo?: string | null; district?: string | null; status?: string | null }) {
  const params = new URLSearchParams();
  params.set("type", input.type);
  params.set("title", sanitizeOgQuery(input.title));
  if (input.photo) params.set("photo", input.photo);
  if (input.district) params.set("district", sanitizeOgQuery(input.district));
  if (input.status) params.set("status", sanitizeOgQuery(input.status));
  return `/api/og?${params.toString()}`;
}

export function absoluteOgImageUrl(baseUrl: string, input: Parameters<typeof buildOgImageUrl>[0]) {
  return new URL(buildOgImageUrl(input), baseUrl).toString();
}
