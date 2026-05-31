import { z } from "zod";

import { sriLankaDistricts } from "@/lib/sos/districts";
import { sanitizePlainText } from "@/lib/security/sanitize";

export { sriLankaDistricts };

export const sosConditions = ["ABANDONED", "INJURED", "LOST", "STRAY"] as const;
export const sosStatuses = ["REPORTED", "NGO_NOTIFIED", "VOLUNTEER_ASSIGNED", "ESCALATED", "RESCUED", "SAFE"] as const;

const cleanText = (max: number) => z.preprocess((v) => sanitizePlainText(v), z.string().trim().max(max));
const optionalContact = z.preprocess((value) => (value === "" ? undefined : sanitizePlainText(value)), z.string().trim().optional());

export const sosReportFormSchema = z.object({
  type: z.literal("SOS").default("SOS"),
  status: z.literal("REPORTED").default("REPORTED"),
  condition: z.enum(sosConditions),
  photos: z.array(z.string().url()).min(1, "Add at least one photo.").max(3, "SOS reports allow up to 3 photos."),
  lat: z.coerce.number().min(5.7).max(10.2),
  lng: z.coerce.number().min(79.4).max(82.2),
  district: z.enum(sriLankaDistricts),
  landmark: cleanText(120).optional().default(""),
  description: cleanText(1000).optional().default(""),
  reporterName: optionalContact,
  reporterPhone: optionalContact,
  reporterEmail: z.preprocess((value) => (value === "" ? undefined : value), z.string().email().optional()),
});

export const sosStatusUpdateSchema = z.object({
  status: z.enum(sosStatuses),
});

export type SosReportInput = z.infer<typeof sosReportFormSchema>;
export type SosReportFormValues = z.input<typeof sosReportFormSchema>;
