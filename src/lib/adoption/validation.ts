import { z } from "zod";

import { sriLankaDistricts } from "../sos/districts";
import { detectSaleLanguage, nonCommercialMessage } from "./guards";

const noSale = (value: string) => !detectSaleLanguage(value);
const text = (min = 1, max = 500) => z.string().trim().min(min).max(max).refine(noSale, nonCommercialMessage);

export const adoptionSpecies = ["dog", "cat", "other"] as const;
export const adoptionSizes = ["small", "medium", "large", "unknown"] as const;
export const adoptionHealthStatuses = ["healthy", "vaccinated", "special_needs", "under_medical_care"] as const;
export const adoptionCurrentStatuses = ["ACTIVE", "UNDER_MEDICAL_CARE", "COMING_SOON"] as const;

export const adoptionListingSchema = z.object({
  petName: text(1, 80),
  species: z.enum(adoptionSpecies),
  estimatedAge: text(1, 40),
  gender: z.enum(["male", "female", "unknown"]),
  size: z.enum(adoptionSizes),
  healthStatus: text(2, 160),
  temperament: text(2, 240),
  specialNeeds: text(0, 300).optional().or(z.literal("")),
  adoptionRequirements: text(5, 800),
  photos: z.array(z.string().url()).min(1).max(5),
  district: z.enum(sriLankaDistricts),
  currentStatus: z.enum(adoptionCurrentStatuses),
});

export const adoptionApplicationSchema = z.object({
  applicantName: z.string().trim().min(2).max(100),
  livingSituation: z.enum(["house", "apartment", "land"]),
  hasGarden: z.preprocess((v) => v === true || v === "true" || v === "yes" || v === "on", z.boolean()),
  otherPets: z.string().trim().min(1).max(500),
  experience: z.string().trim().min(1).max(700),
  whyAdopt: z.string().trim().min(10).max(1000),
  consentHomeVisit: z.preprocess((v) => v === true || v === "true" || v === "on", z.literal(true, "Consent is required.")),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email(),
  pledge: z.preprocess((v) => v === true || v === "true" || v === "on", z.literal(true, "You must agree to the Adopt, Don't Shop pledge to proceed.")),
});

export const adoptionFilterSchema = z.object({
  species: z.enum([...adoptionSpecies, "all"] as const).default("all"),
  age: z.enum(["all", "baby", "young", "adult", "senior"]).default("all"),
  district: z.string().optional(),
  size: z.enum([...adoptionSizes, "all"] as const).default("all"),
  health: z.string().optional(),
  sort: z.enum(["newest", "urgent", "youngest"]).default("newest"),
});

export type AdoptionListingInput = z.infer<typeof adoptionListingSchema>;
export type AdoptionApplicationInput = z.infer<typeof adoptionApplicationSchema>;
export { sriLankaDistricts };
