import assert from "node:assert/strict";

import { sosReportFormSchema, sriLankaDistricts } from "../src/lib/sos/validation";
import { canTransitionSosStatus } from "../src/lib/sos/status";

const valid = sosReportFormSchema.parse({
  condition: "INJURED",
  lat: "6.9271",
  lng: "79.8612",
  district: "Colombo",
  description: "Small dog with injured back leg near the junction.",
  reporterName: "Priest",
  reporterPhone: "+94770000000",
  reporterEmail: "priest@example.com",
  photos: ["https://example.com/photo-1.jpg"],
});

assert.equal(valid.type, "SOS");
assert.equal(valid.status, "REPORTED");
assert.equal(valid.photos.length, 1);
assert.ok(sriLankaDistricts.includes("Kandy"));
assert.throws(() => sosReportFormSchema.parse({ ...valid, photos: [] }));
assert.throws(() => sosReportFormSchema.parse({ ...valid, photos: ["https://a.lk/1.jpg", "https://a.lk/2.jpg", "https://a.lk/3.jpg", "https://a.lk/4.jpg"] }));

assert.equal(canTransitionSosStatus("REPORTED", "NGO_NOTIFIED"), true);
assert.equal(canTransitionSosStatus("NGO_NOTIFIED", "VOLUNTEER_ASSIGNED"), true);
assert.equal(canTransitionSosStatus("VOLUNTEER_ASSIGNED", "RESCUED"), true);
assert.equal(canTransitionSosStatus("RESCUED", "SAFE"), true);
assert.equal(canTransitionSosStatus("REPORTED", "SAFE"), false);
assert.equal(canTransitionSosStatus("SAFE", "REPORTED"), false);

console.log("SOS verification checks passed");
