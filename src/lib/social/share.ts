export type ShareType = "SOS" | "LOST" | "FOUND" | "ADOPT" | "COMMUNITY";

type ShareData = {
  url: string;
  condition?: string | null;
  species?: string | null;
  district?: string | null;
  petName?: string | null;
  breed?: string | null;
  color?: string | null;
  size?: string | null;
  lastSeenDate?: string | Date | null;
};

function clean(value?: string | null, fallback = "pet") {
  return value?.toString().trim() || fallback;
}

function dateLabel(value?: string | Date | null) {
  if (!value) return "recently";
  return value instanceof Date ? value.toLocaleDateString() : value;
}

export function generateShareText(type: ShareType, data: ShareData) {
  const district = clean(data.district, "Sri Lanka");
  if (type === "SOS") return `🚨 SOS Alert: ${clean(data.condition, "Urgent")} ${clean(data.species, "pet")} spotted in ${district}. Can you help? ${data.url}`;
  if (type === "LOST") return `🐾 Missing pet in ${district}: ${clean(data.petName, "Unknown pet")}, ${clean(data.breed, "breed unknown")}, ${clean(data.color, "colour unknown")}. Last seen ${dateLabel(data.lastSeenDate)}. ${data.url}`;
  if (type === "FOUND") return `🐾 Found pet in ${district}: ${clean(data.species, "pet")}, ${clean(data.color, "colour unknown")}, ${clean(data.size, "size unknown")}. Is this yours? ${data.url}`;
  if (type === "ADOPT") return `🏡 Looking for a forever home: ${clean(data.petName, "This pet")} in ${district}. Adopt, don't shop! ${data.url}`;
  return `Check out this story from PawPrint Sri Lanka 🐾 ${data.url}`;
}

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function facebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
