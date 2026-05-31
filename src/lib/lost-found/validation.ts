import { z } from "zod";

import { sriLankaDistricts } from "../sos/districts";

const districtEnum = z.enum(sriLankaDistricts);

export const lostFoundSpecies = ["dog", "cat", "other"] as const;
export const lostFoundSizes = ["small", "medium", "large", "unknown"] as const;
export const foundPetStatuses = ["WITH_ME", "AT_VET", "ROAMING"] as const;

const contactFields = {
  reporterName: z.string().trim().min(2, "Add a contact name.").max(80),
  reporterPhone: z.string().trim().min(7, "Add a phone or WhatsApp number.").max(30),
  reporterEmail: z.string().trim().email().optional().or(z.literal("")),
};

const common = {
  species: z.enum(lostFoundSpecies),
  color: z.string().trim().min(2, "Add the main colour.").max(80),
  size: z.enum(lostFoundSizes),
  description: z.string().trim().min(8, "Add a short description.").max(700),
  eventDate: z.coerce.date(),
  lat: z.coerce.number().min(5).max(10),
  lng: z.coerce.number().min(79).max(83),
  district: districtEnum,
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  photos: z.array(z.string().url()).min(1).max(3),
  ...contactFields,
};

export const lostFoundReportSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("LOST"),
    petName: z.string().trim().min(1, "Add the pet name.").max(80),
    breed: z.string().trim().max(80).optional().or(z.literal("")),
    collarDescription: z.string().trim().max(240).optional().or(z.literal("")),
    ...common,
  }),
  z.object({
    mode: z.literal("FOUND"),
    breed: z.string().trim().max(80).optional().or(z.literal("")),
    foundStatus: z.enum(foundPetStatuses),
    ...common,
  }),
]);

export const browseLostFoundSchema = z.object({
  district: z.string().optional(),
  type: z.enum(["LOST", "FOUND", "ALL"]).default("ALL"),
  species: z.enum([...lostFoundSpecies, "all"] as const).default("all"),
  days: z.coerce.number().int().refine((value) => [7, 14, 30].includes(value)).default(14),
  q: z.string().trim().max(100).optional(),
});

export const matchReportsSchema = z.object({
  reportId: z.string().uuid(),
  matchedReportId: z.string().uuid(),
});

export type LostFoundReportInput = z.infer<typeof lostFoundReportSchema>;
export type LostFoundReportFormValues = z.input<typeof lostFoundReportSchema>;
export type BrowseLostFoundInput = z.infer<typeof browseLostFoundSchema>;

export { sriLankaDistricts };
