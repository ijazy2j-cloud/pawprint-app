import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RevealContact } from "@/components/lost-found/RevealContact";
import { ShareButtons } from "@/components/sos/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { absoluteOgImageUrl } from "@/lib/social/og";
import { generateShareText } from "@/lib/social/share";

const statusTone: Record<string, string> = {
  REPORTED: "bg-orange-100 text-orange-800",
  NGO_NOTIFIED: "bg-blue-100 text-blue-800",
  VOLUNTEER_ASSIGNED: "bg-purple-100 text-purple-800",
  RESCUED: "bg-emerald-100 text-emerald-800",
  SAFE: "bg-green-100 text-green-800",
  MATCHED: "bg-blue-100 text-blue-800",
  REUNITED: "bg-emerald-100 text-emerald-800",
};

// cache() dedupes the query shared by generateMetadata + the page (one DB round-trip per request)
const getReport = cache(async (id: string) => {
  return prisma.petReport.findUnique({ where: { id } });
});

function titleFor(report: NonNullable<Awaited<ReturnType<typeof getReport>>>) {
  if (report.type === "LOST") return `Missing: ${report.petName || report.species || "pet"} in ${report.district}`;
  if (report.type === "FOUND") return `Found ${report.species || "pet"} in ${report.district}`;
  return `SOS Paw in ${report.district}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const report = await getReport(params.id);
  if (!report) return { title: "Report not found" };

  const title = titleFor(report);
  const description = `${report.type} report${report.landmark ? ` near ${report.landmark}` : ""}. Exact GPS is private.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const ogType = report.type === "LOST" ? "lost" : report.type === "FOUND" ? "found" : "sos";
  const ogImage = absoluteOgImageUrl(baseUrl, { type: ogType, title, photo: report.photos[0], district: report.district, status: report.status });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, alt: title }],
    },
  };
}

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id);
  if (!report) notFound();

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const publicUrl = `${appUrl}/report/${report.id}`;
  const location = `${report.district}${report.landmark ? `, near ${report.landmark}` : ""}`;
  const isLostFound = report.type === "LOST" || report.type === "FOUND";

  return (
    <main className="container max-w-4xl py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Public {report.type.toLowerCase()} report</p>
          <h1 className="mt-1 text-3xl font-bold">{titleFor(report)}</h1>
          <p className="mt-2 text-muted-foreground">Approximate location: {location}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${statusTone[report.status] ?? "bg-muted"}`}>{report.status.replaceAll("_", " ")}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {report.photos.map((photo, index) => (
          <div key={photo} className="relative h-64 overflow-hidden rounded-2xl border bg-muted sm:h-56">
            <Image src={photo} alt={`${report.type} report photo ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Report summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLostFound ? (
            <div className="grid gap-2 rounded-xl bg-secondary p-4 text-sm text-secondary-foreground sm:grid-cols-2">
              <p>Species: {report.species || "Unknown"}</p>
              <p>Colour: {report.color || "Unknown"}</p>
              <p>Size: {report.size || "Unknown"}</p>
              <p>Breed: {report.breed || "Unknown"}</p>
            </div>
          ) : null}
          <p className="text-muted-foreground whitespace-pre-line">{report.description}</p>
          <div className="rounded-xl bg-secondary p-4 text-sm text-secondary-foreground">
            Exact GPS is hidden publicly. Assigned NGO/volunteer responders can access precise coordinates through protected tools.
          </div>
          {isLostFound ? <RevealContact phone={report.reporterPhone} email={report.reporterEmail} /> : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <ShareButtons url={publicUrl} text={generateShareText(report.type === "LOST" ? "LOST" : report.type === "FOUND" ? "FOUND" : "SOS", { url: publicUrl, condition: report.condition, species: report.species, district: report.district, petName: report.petName, breed: report.breed, color: report.color, size: report.size, lastSeenDate: report.lastSeenDate })} />
            {report.type === "LOST" ? <Button asChild variant="outline"><Link href={`/api/poster/${report.id}`}>Download poster PDF</Link></Button> : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
