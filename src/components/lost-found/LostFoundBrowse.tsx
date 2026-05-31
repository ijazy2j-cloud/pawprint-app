import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { markReportReunited } from "@/app/lost-found/actions";
import { RevealContact } from "@/components/lost-found/RevealContact";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { browseLostFoundSchema, sriLankaDistricts } from "@/lib/lost-found/validation";
import { prisma } from "@/lib/prisma";

function relativeDate(date: Date) { const days = Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000)); if (days === 0) return "today"; if (days === 1) return "yesterday"; return `${days} days ago`; }
const statusTone: Record<string, string> = { REPORTED: "bg-orange-100 text-orange-800", MATCHED: "bg-blue-100 text-blue-800", REUNITED: "bg-emerald-100 text-emerald-800" };

export async function LostFoundBrowse({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getServerSession(authOptions);
  const filters = browseLostFoundSchema.parse({ district: typeof searchParams.district === "string" ? searchParams.district : undefined, type: typeof searchParams.type === "string" ? searchParams.type : "ALL", species: typeof searchParams.species === "string" ? searchParams.species : "all", days: typeof searchParams.days === "string" ? searchParams.days : 14, q: typeof searchParams.q === "string" ? searchParams.q : undefined });
  const since = new Date(Date.now() - filters.days * 86400000);
  const q = filters.q?.trim();
  const reports = await prisma.petReport.findMany({ where: { type: filters.type === "ALL" ? { in: ["LOST", "FOUND"] } : filters.type, createdAt: { gte: since }, district: filters.district && filters.district !== "all" ? filters.district : undefined, species: filters.species !== "all" ? { equals: filters.species, mode: "insensitive" } : undefined, OR: q ? [{ description: { contains: q, mode: "insensitive" } }, { breed: { contains: q, mode: "insensitive" } }, { color: { contains: q, mode: "insensitive" } }, { petName: { contains: q, mode: "insensitive" } }] : undefined }, orderBy: { createdAt: "desc" }, take: 60 });

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <form className="h-fit rounded-3xl border border-[#E4D9C6] bg-white p-5 shadow-sm lg:sticky lg:top-24" action="/lost-found">
        <input type="hidden" name="tab" value="browse" />
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Search className="size-5 text-[#B45309]" aria-hidden /> Find a match</h2>
        <label htmlFor="lf-q" className="text-sm font-bold">Search</label><input id="lf-q" name="q" defaultValue={filters.q ?? ""} className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-[#F4EEE2]/50 p-3" placeholder="breed, colour, description…" />
        <label htmlFor="lf-district" className="mt-4 block text-sm font-bold">District</label><select id="lf-district" name="district" defaultValue={filters.district ?? "all"} className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-[#F4EEE2]/50 p-3"><option value="all">All districts</option>{sriLankaDistricts.map((district) => <option key={district}>{district}</option>)}</select>
        <label htmlFor="lf-type" className="mt-4 block text-sm font-bold">Type</label><select id="lf-type" name="type" defaultValue={filters.type} className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-[#F4EEE2]/50 p-3"><option value="ALL">All</option><option value="LOST">Missing</option><option value="FOUND">Found</option></select>
        <label htmlFor="lf-species" className="mt-4 block text-sm font-bold">Species</label><select id="lf-species" name="species" defaultValue={filters.species} className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-[#F4EEE2]/50 p-3"><option value="all">All</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select>
        <label htmlFor="lf-days" className="mt-4 block text-sm font-bold">Date range</label><select id="lf-days" name="days" defaultValue={filters.days} className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-[#F4EEE2]/50 p-3"><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select>
        <Button className="mt-4 w-full">Apply filters</Button>
      </form>
      <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
        {reports.map((report) => { const canReunite = session?.user?.role === "ADMIN" || session?.user?.id === report.reporterId; const eventLabel = report.type === "LOST" ? "Last seen" : "Found"; return (
          <Card key={report.id} className="mb-4 break-inside-avoid overflow-hidden">
            <div className="relative h-56 bg-[#F4EEE2]">{report.photos[0] ? <Image src={report.photos[0]} alt={`${report.type === "LOST" ? "Missing" : "Found"} ${report.species ?? "pet"} in ${report.district}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="grid h-full place-items-center text-5xl" aria-hidden>🐾</div>}<span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${report.type === "LOST" ? "bg-[#BE123C]" : "bg-[#4D7C0F]"}`}>{report.type === "LOST" ? "Missing" : "Found"}</span></div>
            <CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-bold">{report.type === "LOST" ? report.petName || "Lost pet" : "Found pet"}</p><p className="text-sm text-[#6B5847]">{report.species ?? "Pet"} • {report.color ?? "colour unknown"} • {report.size ?? "size unknown"}</p></div><span className={`status-pill ${statusTone[report.status] ?? "bg-muted"}`}>{report.status}</span></div><p className="line-clamp-3 text-sm text-[#6B5847]">{report.description}</p><p className="flex items-center gap-1 text-xs text-[#6B5847]"><MapPin className="size-3" aria-hidden />{report.district}{report.landmark ? `, near ${report.landmark}` : ""}</p><p className="flex items-center gap-1 text-xs text-[#6B5847]"><CalendarDays className="size-3" aria-hidden />{eventLabel} {relativeDate(report.lastSeenDate ?? report.createdAt)}</p><RevealContact phone={report.reporterPhone} email={report.reporterEmail} /><div className="flex flex-col gap-2"><Button asChild variant="outline" size="sm"><Link href={`/report/${report.id}`}>Open report</Link></Button>{report.type === "LOST" ? <Button asChild variant="outline" size="sm"><Link href={`/api/poster/${report.id}`}>Poster PDF</Link></Button> : null}</div>{canReunite && report.status !== "REUNITED" ? <form action={markReportReunited}><input type="hidden" name="reportId" value={report.id} /><Button size="sm" variant="success" className="w-full">Mark as Reunited</Button></form> : null}</CardContent>
          </Card>); })}
      </div>
      {!reports.length ? <div className="lg:col-start-2"><EmptyState title={filters.type === "LOST" ? "No lost pets reported in your district — that's good news!" : "No lost or found pets yet"} description="Try another district or date range, or create the first helpful alert." actionHref="/lost-found?tab=lost" actionLabel="Report a missing pet" icon="🐶" /></div> : null}
    </div>
  );
}
