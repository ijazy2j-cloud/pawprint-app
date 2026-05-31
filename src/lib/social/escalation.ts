import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { notifyNgos } from "@/lib/sos/notifications";

export async function escalateStaleSosReports(actorId: string | null = null) {
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const reports = await prisma.petReport.findMany({ where: { type: "SOS", status: "REPORTED", isEscalated: false, createdAt: { lt: cutoff }, deletedAt: null } });
  let escalated = 0;
  for (const report of reports) {
    await prisma.petReport.update({ where: { id: report.id }, data: { status: "ESCALATED", isEscalated: true, escalatedAt: new Date() } });
    await notifyNgos(report.id, report.district, { escalation: true });
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", deletedAt: null, suspendedAt: null }, select: { id: true } });
    if (admins.length) await prisma.notification.createMany({ data: admins.map((admin) => ({ userId: admin.id, type: "ESCALATION", message: `SOS report in ${report.district} escalated after 4 hours.`, relatedReportId: report.id })) });
    await prisma.auditLog.create({ data: { actorId, action: "ESCALATE_SOS", targetType: "PetReport", targetId: report.id, details: { district: report.district, system: actorId === null } as Prisma.InputJsonValue } });
    escalated += 1;
  }
  return { escalated };
}
