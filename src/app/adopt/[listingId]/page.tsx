import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShareButtons } from "@/components/sos/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { absoluteOgImageUrl } from "@/lib/social/og";
import { generateShareText } from "@/lib/social/share";

// cache() dedupes the query shared by generateMetadata + the page (one DB round-trip per request)
const getListing = cache(async (id: string) => {
  return prisma.adoptionListing.findUnique({ where: { id }, include: { listedBy: { include: { ngoProfile: true } } } });
});

export async function generateMetadata({ params }: { params: { listingId: string } }): Promise<Metadata> {
  const listing = await getListing(params.listingId);
  if (!listing) return { title: "Adoption listing not found" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const title = `Adopt: ${listing.petName} is looking for a home`;
  const description = `${listing.petName} is a ${listing.species} in ${listing.district ?? "Sri Lanka"}. Adopt, don't shop.`;
  const ogImage = absoluteOgImageUrl(baseUrl, { type: "adopt", title, photo: listing.photos[0], district: listing.district, status: listing.status });
  return { title, description, openGraph: { title, description, type: "article", images: [{ url: ogImage, alt: title }] } };
}

export default async function AdoptDetailPage({ params }: { params: { listingId: string } }) {
  const listing = await getListing(params.listingId);
  if (!listing) notFound();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/adopt/${listing.id}`;
  const listedBy = listing.listedBy.ngoProfile?.orgName ?? (listing.listedBy.role === "FOSTERER" && listing.listedBy.verified ? "Verified Fosterer" : listing.listedBy.name ?? "PawPrint member");

  return (
    <main className="container max-w-5xl space-y-6 py-8">
      <Link href="/adopt" className="text-sm text-muted-foreground hover:text-foreground">← Back to adoptions</Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">{listing.photos.length ? <div className="grid gap-3">{listing.photos.map((photo, i) => <img key={photo} src={photo} alt={`${listing.petName} — photo ${i + 1} of ${listing.photos.length}`} className="max-h-[520px] w-full rounded-2xl object-cover" />)}</div> : <div className="flex h-80 items-center justify-center rounded-2xl bg-muted text-6xl" aria-hidden>🐾</div>}</section>
        <Card><CardHeader><p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{listing.status}</p><CardTitle className="text-3xl">{listing.petName}</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
          <p className="capitalize text-muted-foreground">{listing.species} • {listing.estimatedAge ?? listing.age ?? "Age unknown"} • {listing.size ?? "size unknown"}</p>
          <p><strong>District:</strong> {listing.district ?? "Sri Lanka"}</p>
          <p><strong>Listed by:</strong> {listedBy}</p>
          <p><strong>Health:</strong> {listing.healthStatus ?? listing.healthNotes ?? "Shared by fosterer"}</p>
          <p><strong>Temperament:</strong> {listing.temperament ?? "Ask fosterer/NGO"}</p>
          {listing.specialNeeds ? <p className="rounded-xl bg-amber-50 p-3 text-amber-900"><strong>Special needs:</strong> {listing.specialNeeds}</p> : null}
          <div><strong>Adoption requirements:</strong><p className="mt-1 whitespace-pre-wrap">{listing.adoptionRequirements ?? listing.requirements}</p></div>
          {listing.status === "ACTIVE" ? <Button asChild className="w-full"><Link href={`/adopt/apply/${listing.id}`}>Apply to Adopt</Link></Button> : <p className="rounded-xl border bg-muted p-3 text-muted-foreground">Applications are hidden because this listing is not active.</p>}
          <ShareButtons text={generateShareText("ADOPT", { url: publicUrl, petName: listing.petName, district: listing.district })} url={publicUrl} />
        </CardContent></Card>
      </div>
    </main>
  );
}
