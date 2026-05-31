import { strict as assert } from "node:assert";

import { buildOgImageUrl, ogBadgeTone, sanitizeOgQuery } from "../src/lib/social/og";
import { generateShareText, facebookShareUrl, whatsappShareUrl } from "../src/lib/social/share";
import { emailRateLimiter, shouldSendEmailForPreference, unsubscribeFooter } from "../src/lib/social/email-queue";

const sosText = generateShareText("SOS", {
  condition: "Injured",
  species: "Dog",
  district: "Colombo",
  url: "https://pawprint.lk/report/abc",
});
assert.equal(sosText, "🚨 SOS Alert: Injured Dog spotted in Colombo. Can you help? https://pawprint.lk/report/abc");

const lostText = generateShareText("LOST", {
  petName: "Milo",
  breed: "Tabby",
  color: "ginger",
  district: "Kandy",
  lastSeenDate: "2026-05-01",
  url: "https://pawprint.lk/report/lost1",
});
assert.match(lostText, /Missing pet in Kandy: Milo, Tabby, ginger/);

assert.ok(whatsappShareUrl(sosText).startsWith("https://wa.me/?text="));
assert.equal(facebookShareUrl("https://pawprint.lk/report/abc"), "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpawprint.lk%2Freport%2Fabc");

const og = buildOgImageUrl({ type: "sos", title: "URGENT: Injured Dog", district: "Colombo", status: "REPORTED", photo: "https://res.cloudinary.com/demo/image/upload/dog.jpg" });
assert.match(og, /^\/api\/og\?/);
assert.match(og, /type=sos/);
assert.equal(sanitizeOgQuery("  hello\nworld  "), "hello world");
assert.equal(ogBadgeTone("adopt"), "green");
assert.equal(ogBadgeTone("community"), "blue");

assert.equal(shouldSendEmailForPreference({ emailDigestFrequency: "NONE", notifyOnSos: true }, "SOS_ALERT"), false);
assert.equal(shouldSendEmailForPreference({ emailDigestFrequency: "INSTANT", notifyOnSos: true }, "SOS_ALERT"), true);
assert.equal(shouldSendEmailForPreference({ emailDigestFrequency: "INSTANT", notifyOnAdoptionApplication: false }, "ADOPTION_APPLICATION"), false);
assert.match(unsubscribeFooter("https://pawprint.lk"), /dashboard\/settings\/notifications/);

emailRateLimiter.reset();
for (let i = 0; i < 50; i++) assert.equal(emailRateLimiter.tryTake(), true);
assert.equal(emailRateLimiter.tryTake(), false);

console.log("Social alerts verification checks passed");
