import type { UserRole } from "@prisma/client";

export const saleLanguagePattern = /\b(Rs|LKR|\$|price|cost|sell|buy|selling|buying|negotiable|fixed|amount|deposit|advance|cash|transfer)\b|\d{4,}/gi;

export const nonCommercialMessage = "PawPrint is strictly non-commercial. Adoption is free. Remove any price or sale language.";

export function detectSaleLanguage(value?: string | null) {
  saleLanguagePattern.lastIndex = 0;
  return saleLanguagePattern.test(value ?? "");
}

export function assertNoSaleLanguage(values: Array<string | null | undefined>) {
  if (values.some(detectSaleLanguage)) throw new Error(nonCommercialMessage);
}

export function canListAdoptionPet(role?: UserRole | string | null) {
  return role === "NGO" || role === "ADMIN" || role === "FOSTERER";
}

export function nextListingStatusForRole(role?: UserRole | string | null) {
  return role === "FOSTERER" ? "PENDING" : "ACTIVE";
}

export function canManageAdoptions(role?: UserRole | string | null) {
  return role === "NGO" || role === "ADMIN" || role === "FOSTERER";
}
