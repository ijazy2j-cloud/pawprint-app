import Fuse from "fuse.js";

import type { LostFoundReportInput } from "./validation";

export type MatchableReport = {
  id: string;
  type: "LOST" | "FOUND";
  status: string;
  district: string;
  species?: string | null;
  color?: string | null;
  size?: string | null;
  breed?: string | null;
  description?: string | null;
  createdAt: Date;
  photos: string[];
};

export type PossibleMatch = MatchableReport & { score: number; reasons: string[] };

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function clean(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

export function maskContact(value?: string | null) {
  const contact = (value ?? "").trim();
  if (!contact) return "Not provided";
  if (contact.includes("@")) {
    const [name, domain] = contact.split("@");
    return `${name.slice(0, 2)}••••@${domain}`;
  }
  if (contact.length <= 5) return "••••";
  return `${contact.slice(0, 3)}••••••${contact.slice(-2)}`;
}

export function findPossibleMatches(input: LostFoundReportInput, candidates: MatchableReport[], targetType: "LOST" | "FOUND"): PossibleMatch[] {
  const now = Date.now();
  const recent = candidates.filter((candidate) => {
    if (candidate.type !== targetType) return false;
    if (candidate.status !== "REPORTED") return false;
    if (candidate.district !== input.district) return false;
    return now - candidate.createdAt.getTime() <= TWO_WEEKS_MS;
  });

  const fuse = new Fuse(recent, {
    keys: ["species", "color", "size", "breed", "description"],
    includeScore: true,
    threshold: 0.45,
    ignoreLocation: true,
  });

  const query = [input.species, input.color, input.size, "breed" in input ? input.breed : "", input.description].filter(Boolean).join(" ");
  const fuzzyIds = new Map(fuse.search(query).map((item) => [item.item.id, item.score ?? 1]));

  return recent
    .map((candidate) => {
      const reasons: string[] = [];
      let score = 0;
      if (clean(candidate.species) === clean(input.species)) {
        score += 35;
        reasons.push("same species");
      }
      if (clean(candidate.size) === clean(input.size)) {
        score += 20;
        reasons.push("same size");
      }
      if (clean(candidate.color).includes(clean(input.color)) || clean(input.color).includes(clean(candidate.color))) {
        score += 25;
        reasons.push("similar colour");
      }
      const fuzzyScore = fuzzyIds.get(candidate.id);
      if (typeof fuzzyScore === "number") {
        score += Math.max(0, Math.round((1 - fuzzyScore) * 20));
        reasons.push("similar description");
      }
      return { ...candidate, score, reasons };
    })
    .filter((candidate) => candidate.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export function canMarkReunited(report: { reporterId: string }, actor?: { id?: string | null; role?: string | null } | null) {
  if (!actor?.id) return false;
  return actor.role === "ADMIN" || report.reporterId === actor.id;
}
