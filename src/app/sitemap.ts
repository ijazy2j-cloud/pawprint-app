import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const now = new Date();
  const staticRoutes = ["/", "/sos-report", "/lost-found", "/adopt", "/community", "/dashboard", "/admin"].map((route) => ({ url: `${base}${route}`, lastModified: now }));

  try {
    const [reports, listings, posts] = await Promise.all([
      prisma.petReport.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, createdAt: true } }),
      prisma.adoptionListing.findMany({ where: { status: { in: ["ACTIVE", "PENDING"] } }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, createdAt: true } }),
      prisma.communityPost.findMany({ where: { isSpotlight: true, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, createdAt: true } }),
    ]);

    return [
      ...staticRoutes,
      ...reports.map((r) => ({ url: `${base}/report/${r.id}`, lastModified: r.createdAt })),
      ...listings.map((l) => ({ url: `${base}/adopt/${l.id}`, lastModified: l.createdAt })),
      ...posts.map((p) => ({ url: `${base}/community/post/${p.id}`, lastModified: p.createdAt })),
    ];
  } catch (error) {
    console.warn("Sitemap dynamic entries unavailable; serving static sitemap only", error);
    return staticRoutes;
  }
}
