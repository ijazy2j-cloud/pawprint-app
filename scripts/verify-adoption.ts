import assert from "node:assert/strict";

import { adoptionApplicationSchema, adoptionListingSchema } from "../src/lib/adoption/validation";
import { canListAdoptionPet, detectSaleLanguage, nextListingStatusForRole } from "../src/lib/adoption/guards";

const cleanListing = {
  petName: "Nila",
  species: "dog",
  estimatedAge: "2 years",
  gender: "female",
  healthStatus: "Vaccinated and healthy",
  temperament: "Gentle with children",
  specialNeeds: "None",
  adoptionRequirements: "Indoor home, follow-up visit, and kind family",
  photos: ["https://example.com/nila.jpg"],
  district: "Colombo",
  size: "medium",
  currentStatus: "ACTIVE",
};

const parsed = adoptionListingSchema.parse(cleanListing);
assert.equal(parsed.petName, "Nila");
assert.equal(parsed.photos.length, 1);
assert.throws(() => adoptionListingSchema.parse({ ...cleanListing, photos: [] }));
assert.throws(() => adoptionListingSchema.parse({ ...cleanListing, photos: ["https://a.lk/1.jpg", "https://a.lk/2.jpg", "https://a.lk/3.jpg", "https://a.lk/4.jpg", "https://a.lk/5.jpg", "https://a.lk/6.jpg"] }));

assert.equal(detectSaleLanguage("Adoption is free"), false);
assert.equal(detectSaleLanguage("Rs 5000 deposit needed"), true);
assert.equal(detectSaleLanguage("fixed price"), true);
assert.equal(detectSaleLanguage("Call 0771234567"), true);
assert.throws(() => adoptionListingSchema.parse({ ...cleanListing, adoptionRequirements: "Pay LKR 2000 deposit" }), /strictly non-commercial/);

assert.equal(canListAdoptionPet("NGO"), true);
assert.equal(canListAdoptionPet("ADMIN"), true);
assert.equal(canListAdoptionPet("FOSTERER"), true);
assert.equal(canListAdoptionPet("USER"), false);
assert.equal(nextListingStatusForRole("FOSTERER"), "PENDING");
assert.equal(nextListingStatusForRole("NGO"), "ACTIVE");

const application = adoptionApplicationSchema.parse({
  applicantName: "Priest",
  livingSituation: "house",
  hasGarden: "yes",
  otherPets: "One calm dog",
  experience: "Grew up with dogs",
  whyAdopt: "Can provide a safe forever home",
  consentHomeVisit: "on",
  phone: "+94771234567",
  email: "priest@example.com",
  pledge: "on",
});
assert.equal(application.consentHomeVisit, true);
assert.equal(application.pledge, true);
assert.throws(() => adoptionApplicationSchema.parse({ ...application, pledge: false }), /Adopt, Don't Shop pledge/);

console.log("Adoption verification checks passed");
