import { prisma } from "@/lib/prisma";

export async function notifyLostFoundMatch(reportId: string, matchedReportId: string) {
  const [report, matchedReport] = await Promise.all([
    prisma.petReport.findUnique({ where: { id: reportId }, select: { id: true, type: true, reporterId: true, petName: true, species: true } }),
    prisma.petReport.findUnique({ where: { id: matchedReportId }, select: { id: true, type: true, reporterId: true, petName: true, species: true } }),
  ]);

  if (!report || !matchedReport) return { notified: 0 };

  const rows = [
    {
      userId: report.reporterId,
      type: "REPORT_UPDATED" as const,
      message: `Possible ${matchedReport.type.toLowerCase()} pet match linked to your ${report.type.toLowerCase()} report.`,
      relatedReportId: report.id,
    },
    {
      userId: matchedReport.reporterId,
      type: "REPORT_UPDATED" as const,
      message: `Possible ${report.type.toLowerCase()} pet match linked to your ${matchedReport.type.toLowerCase()} report.`,
      relatedReportId: matchedReport.id,
    },
  ].filter((row, index, all) => index === 0 || row.userId !== all[0].userId);

  if (!rows.length) return { notified: 0 };
  await prisma.notification.createMany({ data: rows });
  return { notified: rows.length };
}
