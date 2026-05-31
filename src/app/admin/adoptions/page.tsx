import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { moderateAdoptionListing } from "@/app/adopt/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminAdoptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const pending = await prisma.adoptionListing.findMany({ where: { status: "PENDING" }, include: { listedBy: true }, orderBy: { createdAt: "asc" } });
  return (
    <main className="container space-y-6 py-8">
      <div><h1 className="text-3xl font-bold">Adoption moderation queue</h1><p className="text-muted-foreground">Review fosterer listings before they go public.</p></div>
      <div className="space-y-3">{pending.map((listing) => <Card key={listing.id}><CardHeader><CardTitle>{listing.petName}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-[160px_1fr]"><img src={listing.photos[0]} alt={listing.petName} className="h-36 w-full rounded-xl object-cover" /><div className="space-y-2 text-sm"><p>Submitted by: {listing.listedBy.name ?? listing.listedBy.email}</p><p>District: {listing.district}</p><p>Date: {listing.createdAt.toLocaleDateString()}</p><p>{listing.adoptionRequirements}</p><div className="flex flex-wrap gap-2"><form action={moderateAdoptionListing}><input type="hidden" name="listingId" value={listing.id} /><input type="hidden" name="decision" value="ACTIVE" /><Button>Approve</Button></form><form action={moderateAdoptionListing} className="flex gap-2"><input type="hidden" name="listingId" value={listing.id} /><input type="hidden" name="decision" value="REJECTED" /><input name="reason" placeholder="Optional reason" className="rounded-md border p-2" /><Button variant="destructive">Reject</Button></form><form action={moderateAdoptionListing} className="flex gap-2"><input type="hidden" name="listingId" value={listing.id} /><input type="hidden" name="decision" value="REJECTED" /><input type="hidden" name="reason" value="Please add more information." /><Button variant="outline">Request More Info</Button></form></div></div></CardContent></Card>)}{!pending.length ? <p className="rounded-2xl border bg-card p-6 text-muted-foreground">No pending adoption listings.</p> : null}</div>
    </main>
  );
}
