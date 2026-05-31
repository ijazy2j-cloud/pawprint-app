import { z } from "zod";

const photoUrlsSchema = z
  .array(z.string().url())
  .max(5, "You can upload a maximum of 5 photos.")
  .default([]);

const districtSchema = z.string().min(2).max(80);
const latitudeSchema = z.coerce.number().min(-90).max(90);
const longitudeSchema = z.coerce.number().min(-180).max(180);

export const petReportSchema = z.object({
  type: z.enum(["SOS", "LOST", "FOUND", "ADOPTION"]),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).default("OPEN"),
  photos: photoUrlsSchema,
  lat: latitudeSchema,
  lng: longitudeSchema,
  district: districtSchema,
  description: z.string().min(10).max(2000),
  assignedNgoId: z.string().uuid().optional().nullable(),
});

export const ngoProfileSchema = z.object({
  orgName: z.string().min(2).max(160),
  regNumber: z.string().max(80).optional().nullable(),
  coverageDistricts: z.array(districtSchema).min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7).max(20).optional().nullable(),
});

export const adoptionListingSchema = z.object({
  petName: z.string().min(1).max(100),
  species: z.string().min(1).max(60),
  age: z.string().max(60).optional().nullable(),
  healthNotes: z.string().max(1000).optional().nullable(),
  requirements: z.string().max(1000).optional().nullable(),
  status: z.enum(["AVAILABLE", "PENDING", "ADOPTED", "CLOSED"]).default("AVAILABLE"),
});

export const communityPostSchema = z.object({
  content: z.string().min(1).max(2000),
  photos: photoUrlsSchema,
});

export const userRegistrationSchema = z.object({
  email: z.string().email().transform((email) => email.toLowerCase()),
  name: z.string().min(1).max(100),
  phone: z.string().min(7).max(20).optional().nullable(),
  password: z.string().min(8),
  district: districtSchema.optional().nullable(),
});

export { photoUrlsSchema };
