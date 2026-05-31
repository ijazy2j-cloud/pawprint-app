"use server";

import { prisma } from "@/lib/prisma";
import { enqueueEmail, shouldSendEmailForPreference } from "@/lib/social/email-queue";
import { sosAlertToNgoEmail } from "@/lib/social/email-templates";

export async function notifyNgos(reportId: string, district: string, options: { skipInApp?: boolean; escalation?: boolean } = {}) {
  const report = await prisma.petReport.findUnique({ where: { id: reportId } });
  if (!report) throw new Error("Report not found.");

  let ngoProfiles = await prisma.ngoProfile.findMany({
    where: {
      verified: true,
      ...(options.escalation ? {} : { coverageDistricts: { has: district } }),
      user: { verified: true, role: "NGO", deletedAt: null, suspendedAt: null },
    },
    include: { user: true },
  });

  if (ngoProfiles.length === 0 && !options.escalation) {
    ngoProfiles = await prisma.ngoProfile.findMany({
      where: { verified: true, user: { verified: true, role: "NGO", deletedAt: null, suspendedAt: null } },
      include: { user: true },
    });
  }

  if (ngoProfiles.length === 0) return { notified: 0, emailed: 0, escalated: true };

  if (!options.skipInApp) {
    await prisma.notification.createMany({
      data: ngoProfiles.map((ngo) => ({
        userId: ngo.userId,
        type: options.escalation ? "ESCALATION" : "SOS_REPORT",
        message: `${options.escalation ? "Escalated" : "SOS Paw"} report in ${district}: ${report.condition ?? "urgent rescue"}`,
        relatedReportId: report.id,
      })),
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const reportUrl = `${appUrl}/report/${report.id}`;
  let emailed = 0;

  for (const ngo of ngoProfiles) {
    if (!shouldSendEmailForPreference(ngo.user, options.escalation ? "ESCALATION" : "SOS_ALERT")) continue;
    emailed += 1;
    enqueueEmail({
      to: ngo.contactEmail,
      subject: options.escalation ? `⚠️ Escalated SOS: No NGO responded in 4 hours — ${district}` : `🚨 SOS Alert: ${report.condition ?? "Urgent"} pet spotted in ${district}`,
      template: options.escalation ? "ESCALATION_ALERT" : "SOS_ALERT_TO_NGO",
      html: sosAlertToNgoEmail({ appUrl, district, condition: report.condition ?? "SOS", description: report.description, photoUrl: report.photos[0], reportUrl, escalation: options.escalation }),
      audit: { targetType: "PetReport", targetId: report.id },
    });
  }

  return { notified: ngoProfiles.length, emailed, escalated: options.escalation || !ngoProfiles.some((ngo) => ngo.coverageDistricts.includes(district)) };
}
