"use server";

import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadSosImage } from "@/lib/sos/images";
import { notifyNgos } from "@/lib/sos/notifications";
import { checkSosRateLimit } from "@/lib/sos/rate-limit";
import { sosReportFormSchema } from "@/lib/sos/validation";

export type CreateSosReportState = {
  ok: boolean;
  reportId?: string;
  error?: string;
};

function getClientIp() {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local-dev";
}

async function resolveReporter(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) return session.user.id;

  const reporterEmail = String(formData.get("reporterEmail") ?? "").trim().toLowerCase();
  if (reporterEmail) {
    const user = await prisma.user.upsert({
      where: { email: reporterEmail },
      update: {
        name: String(formData.get("reporterName") ?? "") || undefined,
        phone: String(formData.get("reporterPhone") ?? "") || undefined,
      },
      create: {
        email: reporterEmail,
        name: String(formData.get("reporterName") ?? "") || undefined,
        phone: String(formData.get("reporterPhone") ?? "") || undefined,
        role: "USER",
        district: String(formData.get("district") ?? "") || undefined,
      },
    });
    return user.id;
  }

  const anonymous = await prisma.user.create({
    data: {
      email: `anonymous-${crypto.randomUUID()}@sos.pawprint.local`,
      name: String(formData.get("reporterName") ?? "Anonymous reporter") || "Anonymous reporter",
      phone: String(formData.get("reporterPhone") ?? "") || undefined,
      role: "USER",
      district: String(formData.get("district") ?? "") || undefined,
    },
  });

  return anonymous.id;
}

export async function createSosReport(_previousState: CreateSosReportState, formData: FormData): Promise<CreateSosReportState> {
  try {
    const limit = checkSosRateLimit(getClientIp());
    if (!limit.allowed) {
      return { ok: false, error: `Too many SOS reports. Try again after ${limit.resetAt.toLocaleTimeString()}.` };
    }

    const imageFiles = formData
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0)
      .slice(0, 3);

    if (imageFiles.length < 1) {
      return { ok: false, error: "Add at least one photo." };
    }

    const photoUrls = await Promise.all(imageFiles.map(uploadSosImage));
    const parsed = sosReportFormSchema.parse({
      condition: formData.get("condition"),
      photos: photoUrls,
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      district: formData.get("district"),
      landmark: formData.get("landmark"),
      description: formData.get("description"),
      reporterName: formData.get("reporterName"),
      reporterPhone: formData.get("reporterPhone"),
      reporterEmail: formData.get("reporterEmail"),
    });

    const reporterId = await resolveReporter(formData);

    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.petReport.create({
        data: {
          type: "SOS",
          status: "REPORTED",
          condition: parsed.condition,
          photos: parsed.photos,
          lat: parsed.lat,
          lng: parsed.lng,
          district: parsed.district,
          landmark: parsed.landmark || null,
          description: parsed.description || `${parsed.condition} animal needs help.`,
          reporterName: parsed.reporterName,
          reporterPhone: parsed.reporterPhone,
          reporterEmail: parsed.reporterEmail,
          reporterId,
        },
      });

      const districtNgos = await tx.ngoProfile.findMany({
        where: { verified: true, coverageDistricts: { has: parsed.district }, user: { verified: true, role: "NGO" } },
        select: { userId: true },
      });
      const islandWideNgos = districtNgos.length
        ? []
        : await tx.ngoProfile.findMany({
            where: { verified: true, user: { verified: true, role: "NGO" } },
            select: { userId: true },
          });
      const targets = districtNgos.length ? districtNgos : islandWideNgos;

      if (targets.length) {
        await tx.notification.createMany({
          data: targets.map((ngo) => ({
            userId: ngo.userId,
            type: "SOS_REPORT",
            message: `New SOS Paw report in ${parsed.district}.`,
            relatedReportId: created.id,
          })),
        });
      }

      return created;
    });

    await notifyNgos(report.id, parsed.district, { skipInApp: true });
    revalidatePath(`/report/${report.id}`);
    return { ok: true, reportId: report.id };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not create SOS report." };
  }
}
