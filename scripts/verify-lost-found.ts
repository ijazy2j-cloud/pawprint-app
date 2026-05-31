import assert from "node:assert/strict";

import { lostFoundReportSchema } from "../src/lib/lost-found/validation";
import { findPossibleMatches, maskContact, canMarkReunited } from "../src/lib/lost-found/matching";

const baseLost = {
  mode: "LOST",
  petName: "Milo",
  species: "dog",
  breed: "Labrador",
  color: "black and white",
  size: "medium",
  description: "Blue collar, friendly, missing near the temple",
  eventDate: new Date().toISOString().slice(0, 10),
  lat: 6.9271,
  lng: 79.8612,
  district: "Colombo",
  landmark: "Town Hall",
  reporterName: "Priest",
  reporterPhone: "+94771234567",
  reporterEmail: "priest@example.com",
  photos: ["https://example.com/milo.jpg"],
};

const parsed = lostFoundReportSchema.parse(baseLost);
assert.equal(parsed.mode, "LOST");
assert.equal(parsed.photos.length, 1);
assert.throws(() => lostFoundReportSchema.parse({ ...baseLost, photos: [] }));
assert.throws(() => lostFoundReportSchema.parse({ ...baseLost, photos: ["a", "b", "c", "d"] }));

const foundCandidate = {
  id: "found-1",
  type: "FOUND" as const,
  status: "REPORTED" as const,
  district: "Colombo",
  species: "dog",
  color: "black",
  size: "medium",
  breed: "unknown",
  description: "Friendly black dog with white chest found near Town Hall",
  createdAt: new Date(),
  photos: ["https://example.com/found.jpg"],
};
const oldCandidate = { ...foundCandidate, id: "old", createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) };
const matches = findPossibleMatches(parsed, [oldCandidate, foundCandidate], "FOUND");
assert.equal(matches.length, 1);
assert.equal(matches[0].id, "found-1");
assert.ok(matches[0].score >= 50);

assert.equal(maskContact("+94771234567"), "+94••••••67");
assert.equal(maskContact("priest@example.com"), "pr••••@example.com");
assert.equal(canMarkReunited({ reporterId: "u1" }, { id: "u1", role: "USER" }), true);
assert.equal(canMarkReunited({ reporterId: "u1" }, { id: "u2", role: "USER" }), false);
assert.equal(canMarkReunited({ reporterId: "u1" }, { id: "admin", role: "ADMIN" }), true);

console.log("Lost & Found verification checks passed");
