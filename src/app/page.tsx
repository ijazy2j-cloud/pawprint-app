import Script from "next/script";

import { CinematicHome } from "@/components/home/CinematicHome";
import { prisma } from "@/lib/prisma";

// framer-motion, PhotoCard, priority image handling live inside CinematicHome.
const dogImage = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80";
const catImage = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80";
const rescueImage = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80";

function firstPhoto(photos?: string[] | null, fallback = dogImage) {
  return photos?.[0] || fallback;
}

function relativeTime(value: Date) {
  const diff = Date.now() - value.getTime();
  const hours = Math.max(1, Math.round(diff / 36e5));
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function petName(report: { petName?: string | null; species?: string | null; condition?: string | null }) {
  return report.petName || report.species || report.condition || "A rescued friend";
}

export default async function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [rescuedMonth, reunitedMonth, activeAlerts, volunteers, recentReports, activeAdoptions, stories] = await Promise.all([
    prisma.petReport.count({ where: { type: "SOS", status: { in: ["RESCUED", "SAFE"] }, updatedAt: { gte: monthStart }, deletedAt: null } }).catch(() => 0),
    prisma.petReport.count({ where: { type: { in: ["LOST", "FOUND"] }, status: "REUNITED", updatedAt: { gte: monthStart }, deletedAt: null } }).catch(() => 0),
    prisma.petReport.count({ where: { type: "SOS", status: { in: ["REPORTED", "NGO_NOTIFIED", "VOLUNTEER_ASSIGNED", "ESCALATED"] }, deletedAt: null } }).catch(() => 0),
    prisma.user.count({ where: { role: { in: ["VOLUNTEER", "NGO"] }, deletedAt: null } }).catch(() => 0),
    prisma.petReport.findMany({ where: { deletedAt: null, OR: [{ status: { in: ["RESCUED", "SAFE", "REUNITED"] } }, { type: "SOS" }] }, orderBy: { createdAt: "desc" }, take: 8 }).catch(() => []),
    prisma.adoptionListing.count({ where: { status: "ACTIVE", createdAt: { gte: monthStart } } }).catch(() => 0),
    prisma.communityPost.findMany({ where: { deletedAt: null }, include: { reactions: true, author: true }, orderBy: [{ isSpotlight: "desc" }, { createdAt: "desc" }], take: 3 }).catch(() => []),
  ]);

  const recentRescues = recentReports.map((report) => ({
    id: report.id,
    photo: firstPhoto(report.photos, report.type === "FOUND" ? catImage : rescueImage),
    name: petName(report),
    district: report.district,
    status: report.status,
    description: report.description,
    href: `/report/${report.id}`,
    time: relativeTime(report.createdAt),
  }));

  const storyCards = stories.map((story) => ({
    id: story.id,
    photo: firstPhoto(story.photos, rescueImage),
    quote: story.content.length > 120 ? `${story.content.slice(0, 117)}...` : story.content,
    author: story.author?.name ? `${story.author.name}, Sri Lanka` : "PawPrint community",
    href: `/community/post/${story.id}`,
    hearts: story.reactions.length,
  }));

  const ticker = [
    ...recentRescues.slice(0, 4).map((r) => `${r.name} helped in ${r.district} ${r.time}`),
    `${activeAdoptions} pets waiting for homes this month`,
    `${volunteers} verified helpers in the network`,
  ];

  const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "PawPrint Sri Lanka", url: siteUrl, description: "Free, non-commercial animal rescue and adoption platform in Sri Lanka." };

  return (
    <>
      <Script id="organization-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <CinematicHome data={{ rescuedMonth, reunitedMonth, activeAlerts, volunteers, recentRescues, stories: storyCards, ticker }} />
    </>
  );
}
