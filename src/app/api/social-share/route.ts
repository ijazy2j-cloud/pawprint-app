import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { absoluteOgImageUrl } from "@/lib/social/og";
import { generateShareText } from "@/lib/social/share";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const secret = process.env.CRON_SECRET;
  if (session?.user?.role !== "ADMIN" && (!secret || request.headers.get("x-cron-secret") !== secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportId } = await request.json().catch(() => ({ reportId: null }));
  if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });
  const report = await prisma.petReport.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${appUrl}/report/${report.id}`;
  const text = generateShareText(report.type === "LOST" ? "LOST" : report.type === "FOUND" ? "FOUND" : "SOS", { url, condition: report.condition, species: report.species, district: report.district, petName: report.petName, breed: report.breed, color: report.color, size: report.size, lastSeenDate: report.lastSeenDate });
  const ogImage = absoluteOgImageUrl(appUrl, { type: report.type === "LOST" ? "lost" : report.type === "FOUND" ? "found" : "sos", title: text.slice(0, 80), photo: report.photos[0], district: report.district, status: report.status });

  if (!process.env.FACEBOOK_PAGE_ACCESS_TOKEN && !process.env.TWITTER_API_KEY) return NextResponse.json({ skipped: true, reason: "No social credentials configured", text, ogImage });

  await prisma.petReport.update({ where: { id: report.id }, data: { socialSharedAt: new Date() } });
  await prisma.auditLog.create({ data: { actorId: session?.user?.id ?? null, action: "SOCIAL_SHARE", targetType: "PetReport", targetId: report.id, details: { facebookConfigured: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN), twitterConfigured: Boolean(process.env.TWITTER_API_KEY) } } });
  return NextResponse.json({ shared: true, text, ogImage });
}
