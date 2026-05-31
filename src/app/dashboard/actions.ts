"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/dashboard/audit";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Sign in required.");
  return session;
}

async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") throw new Error("Admin only.");
  return session;
}

export async function markNotificationRead(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { read: true } });
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const session = await requireUser();
  await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
  revalidatePath("/dashboard/notifications");
}

export async function updateEmailPreferences(formData: FormData) {
  const session = await requireUser();
  await prisma.user.update({ where: { id: session.user.id }, data: { sosEmailPreference: String(formData.get("sosEmailPreference") ?? "daily"), adoptionEmailPreference: String(formData.get("adoptionEmailPreference") ?? "instant"), emailDigestFrequency: String(formData.get("emailDigestFrequency") ?? "INSTANT") as any, notifyOnSos: formData.get("notifyOnSos") === "on", notifyOnAdoptionApplication: formData.get("notifyOnAdoptionApplication") === "on", notifyOnReunion: formData.get("notifyOnReunion") === "on" } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/notifications");
}

export async function updateProfile(formData: FormData) {
  const session = await requireUser();
  const preferredDistricts = formData.getAll("preferredDistricts").map(String);
  await prisma.user.update({ where: { id: session.user.id }, data: { name: String(formData.get("name") ?? ""), phone: String(formData.get("phone") ?? ""), district: String(formData.get("district") ?? ""), preferredDistricts, availability: String(formData.get("availability") ?? "Available"), bio: String(formData.get("bio") ?? "") } });
  revalidatePath("/dashboard/profile");
}

export async function updateNgoProfile(formData: FormData) {
  const session = await requireUser();
  if (session.user.role !== "NGO" && session.user.role !== "ADMIN") throw new Error("NGO only.");
  await prisma.ngoProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, orgName: String(formData.get("orgName") ?? ""), regNumber: String(formData.get("regNumber") ?? ""), coverageDistricts: formData.getAll("coverageDistricts").map(String), contactEmail: String(formData.get("contactEmail") ?? session.user.email), contactPhone: String(formData.get("contactPhone") ?? "") },
    update: { orgName: String(formData.get("orgName") ?? ""), regNumber: String(formData.get("regNumber") ?? ""), coverageDistricts: formData.getAll("coverageDistricts").map(String), contactEmail: String(formData.get("contactEmail") ?? session.user.email), contactPhone: String(formData.get("contactPhone") ?? "") },
  });
  revalidatePath("/dashboard/profile");
}

export async function updateSosReport(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "NGO_NOTIFIED") as any;
  const volunteerId = String(formData.get("assignedVolunteerId") ?? "") || undefined;
  const report = await prisma.petReport.update({ where: { id }, data: { status, assignedNgoId: session.user.role === "NGO" ? session.user.id : undefined, assignedVolunteerId: volunteerId, internalNotes: String(formData.get("internalNotes") ?? "") || undefined } });
  if (volunteerId) await prisma.notification.create({ data: { userId: volunteerId, type: "SOS_ALERT", message: `You were assigned to an SOS report in ${report.district}.`, relatedReportId: report.id } });
  if (session.user.role === "ADMIN") await logAudit(session.user.id, "SOS_STATUS_UPDATE", "PetReport", id, { status, volunteerId });
  revalidatePath("/dashboard/sos");
  revalidatePath("/admin/sos");
}

export async function volunteerForReport(formData: FormData) {
  const session = await requireUser();
  if (session.user.role !== "VOLUNTEER") throw new Error("Volunteer only.");
  const id = String(formData.get("id") ?? "");
  const report = await prisma.petReport.update({ where: { id }, data: { assignedVolunteerId: session.user.id, status: "VOLUNTEER_ASSIGNED" } });
  await prisma.notification.create({ data: { userId: report.reporterId, type: "REPORT_ASSIGNED", message: "A volunteer offered to help your SOS report.", relatedReportId: report.id } });
  if (report.assignedNgoId) await prisma.notification.create({ data: { userId: report.assignedNgoId, type: "SOS_ALERT", message: "A volunteer joined one of your SOS reports.", relatedReportId: report.id } });
  revalidatePath("/dashboard/nearby");
}

export async function adminUpdateUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "USER") as any;
  const verified = formData.get("verified") === "on";
  await prisma.user.update({ where: { id }, data: { role, verified } });
  await logAudit(session.user.id, "USER_UPDATE", "User", id, { role, verified });
  revalidatePath("/admin/users");
}

export async function adminSuspendUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.user.update({ where: { id }, data: { suspendedAt: new Date() } });
  await logAudit(session.user.id, "USER_SUSPEND", "User", id, {});
  revalidatePath("/admin/users");
}

export async function adminSoftDeleteReport(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.petReport.update({ where: { id }, data: { deletedAt: new Date(), status: "CLOSED" } });
  await logAudit(session.user.id, "REPORT_SOFT_DELETE", "PetReport", id, {});
  revalidatePath("/admin/sos");
  revalidatePath("/admin/lost-found");
}

export async function adminMarkLostFoundSpam(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const report = await prisma.petReport.update({ where: { id }, data: { deletedAt: new Date(), status: "CLOSED" } });
  await prisma.user.update({ where: { id: report.reporterId }, data: { fakeReportCount: { increment: 1 } } });
  await logAudit(session.user.id, "LOST_FOUND_SPAM", "PetReport", id, { reporterId: report.reporterId });
  revalidatePath("/admin/lost-found");
}

export async function adminEscalateSos(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const report = await prisma.petReport.findUniqueOrThrow({ where: { id } });
  const ngos = await prisma.user.findMany({ where: { role: "NGO", verified: true }, select: { id: true } });
  if (ngos.length) await prisma.notification.createMany({ data: ngos.map((ngo) => ({ userId: ngo.id, type: "ESCALATION", message: `Escalated SOS report in ${report.district}.`, relatedReportId: report.id })) });
  await logAudit(session.user.id, "SOS_ESCALATE", "PetReport", id, { notified: ngos.length });
  revalidatePath("/admin/sos");
}
