import type { ReportStatus, UserRole } from "@prisma/client";

export const sosStatusFlow = [
  "REPORTED",
  "NGO_NOTIFIED",
  "VOLUNTEER_ASSIGNED",
  "ESCALATED",
  "RESCUED",
  "SAFE",
] as const satisfies ReportStatus[];

export type SosStatus = (typeof sosStatusFlow)[number];

const validTransitions: Partial<Record<ReportStatus, ReportStatus[]>> = {
  REPORTED: ["NGO_NOTIFIED", "ESCALATED"],
  NGO_NOTIFIED: ["VOLUNTEER_ASSIGNED", "ESCALATED", "RESCUED"],
  VOLUNTEER_ASSIGNED: ["RESCUED", "SAFE"],
  ESCALATED: ["NGO_NOTIFIED", "VOLUNTEER_ASSIGNED", "RESCUED"],
  RESCUED: ["SAFE"],
};

export function canTransitionSosStatus(from: ReportStatus, to: ReportStatus) {
  return validTransitions[from]?.includes(to) ?? false;
}

export function canUpdateReportStatus(role?: UserRole | null) {
  return role === "NGO" || role === "VOLUNTEER" || role === "ADMIN";
}
