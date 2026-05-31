"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { findPossibleMatches, type MatchableReport, canMarkReunited } from "@/lib/lost-found/matching";
import { notifyLostFoundMatch } from "@/lib/lost-found/notifications";
import { lostFoundReportSchema, matchReportsSchema, type LostFoundReportInput } from "@/lib/lost-found/validation";
import { prisma } from "@/lib/prisma";
import { uploadSosImage } from "@/lib/sos/images";

export type LostFoundActionState = {
  ok: boolean;
  error?: string;
  reportId?: string;
  posterUrl?: string;
  matches?: Array<MatchableReport & { score: number; reasons: string[] }>;
};

async function resolveReporter(input: LostFoundReportInput) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, fakeReportCount: true } });
    if (user && user.fakeReportCount >= 2) throw new Error("Your account is temporarily restricted from new reports. Contact admin@pawprint.lk");
    return session.user.id;
  }

  const email = (input.reporterEmail || `${crypto.randomUUID()}@lostfound.pawprint.local`).toLowerCase();
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: input.reporterName, phone: input.reporterPhone, district: input.district },
    create: { email, name: input.reporterName, phone: input.reporterPhone, district: input.district, role: "USER" },
    select: { id: true, fakeReportCount: true },
  });

  if (user.fakeReportCount >= 2) throw new Error("Your account is temporarily restricted from new reports. Contact admin@pawprint.lk");
  return user.id;
}

async function createReport(mode: "LOST" | "FOUND", formData: FormData): Promise<LostFoundActionState> {
  try {
    const imageFiles = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0)
      .slice(0, 3);
    if (imageFiles.length < 1) return { ok: false, error: "Add at least one photo." };

    const photoUrls = await Promise.all(imageFiles.map(uploadSosImage));
    const parsed = lostFoundReportSchema.parse({
      mode,
      petName: formData.get("petName"),
      species: formData.get("species"),
      breed: formData.get("breed"),
      color: formData.get("color"),
      size: formData.get("size"),
      collarDescription: formData.get("collarDescription"),
      foundStatus: formData.get("foundStatus"),
      description: formData.get("description"),
      eventDate: formData.get("eventDate"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      district: formData.get("district"),
      landmark: formData.get("landmark"),
      reporterName: formData.get("reporterName"),
      reporterPhone: formData.get("reporterPhone"),
      reporterEmail: formData.get("reporterEmail"),
      photos: photoUrls,
    });

    const reporterId = await resolveReporter(parsed);
    const description = parsed.mode === "LOST" && parsed.collarDescription ? `${parsed.description}\nCollar/details: ${parsed.collarDescription}` : parsed.description;

    const report = await prisma.petReport.create({
      data: {
        type: mode,
        status: "REPORTED",
        photos: parsed.photos,
        lat: parsed.lat,
        lng: parsed.lng,
        district: parsed.district,
        landmark: parsed.landmark || null,
        description,
        petName: parsed.mode === "LOST" ? parsed.petName : null,
        species: parsed.species,
        breed: parsed.breed || null,
        color: parsed.color,
        size: parsed.size,
        lastSeenDate: parsed.eventDate,
        foundStatus: parsed.mode === "FOUND" ? parsed.foundStatus : null,
        reporterName: parsed.reporterName,
        reporterPhone: parsed.reporterPhone,
        reporterEmail: parsed.reporterEmail || null,
        reporterId,
      },
    });

    const targetType = mode === "LOST" ? "FOUND" : "LOST";
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const candidates = await prisma.petReport.findMany({
      where: {
        type: targetType,
        status: "REPORTED",
        district: parsed.district,
        createdAt: { gte: since },
        OR: [
          { species: { equals: parsed.species, mode: "insensitive" } },
          { color: { contains: parsed.color, mode: "insensitive" } },
          { size: { equals: parsed.size, mode: "insensitive" } },
        ],
      },
      select: { id: true, type: true, status: true, district: true, species: true, color: true, size: true, breed: true, description: true, createdAt: true, photos: true },
      take: 12,
    });

    const matches = findPossibleMatches(parsed, candidates as MatchableReport[], targetType);
    revalidatePath("/lost-found");
    revalidatePath("/lost-found/browse");
    return { ok: true, reportId: report.id, posterUrl: mode === "LOST" ? `/api/poster/${report.id}` : undefined, matches };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not create report." };
  }
}

export async function createLostReport(_previousState: LostFoundActionState, formData: FormData) {
  return createReport("LOST", formData);
}

export async function createFoundReport(_previousState: LostFoundActionState, formData: FormData) {
  return createReport("FOUND", formData);
}

export async function linkLostFoundReports(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Sign in to link reports.");
  const parsed = matchReportsSchema.parse({ reportId: formData.get("reportId"), matchedReportId: formData.get("matchedReportId") });

  await prisma.$transaction([
    prisma.petReport.update({ where: { id: parsed.reportId }, data: { status: "MATCHED", matchedReportId: parsed.matchedReportId, matchedById: session.user.id, matchedAt: new Date() } }),
    prisma.petReport.update({ where: { id: parsed.matchedReportId }, data: { status: "MATCHED", matchedReportId: parsed.reportId, matchedById: session.user.id, matchedAt: new Date() } }),
  ]);
  await notifyLostFoundMatch(parsed.reportId, parsed.matchedReportId);
  revalidatePath("/lost-found");
  revalidatePath("/lost-found/browse");
}

export async function markReportReunited(formData: FormData) {
  const session = await getServerSession(authOptions);
  const reportId = String(formData.get("reportId") ?? "");
  const report = await prisma.petReport.findUnique({ where: { id: reportId }, select: { id: true, reporterId: true, photos: true, petName: true, species: true } });
  if (!report || !canMarkReunited(report, session?.user)) throw new Error("Only the original reporter or admin can mark this report reunited.");

  await prisma.$transaction([
    prisma.petReport.update({ where: { id: report.id }, data: { status: "REUNITED" } }),
    prisma.communityPost.create({
      data: {
        authorId: session!.user.id,
        photos: report.photos.slice(0, 1),
        content: `Happy reunion story draft: ${(report.petName || report.species || "This pet")} is reunited! Share what happened, thank helpers, and add an update photo.`,
      },
    }),
  ]);
  revalidatePath("/lost-found");
  redirect("/community?draft=reunion");
}
