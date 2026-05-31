import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { decideAdoptionApplication, updateAdoptionListingStatus } from "@/app/adopt/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authOptions } from "@/lib/auth";
import { canManageAdoptions } from "@/lib/adoption/guards";
import { prisma } from "@/lib/prisma";

export default async function DashboardAdoptionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!canManageAdoptions(session.user.role)) redirect("/dashboard");

  const where = session.user.role === "ADMIN" ? {} : { listedById: session.user.id };
  const listings = await prisma.adoptionListing.findMany({ where, include: { applications: true }, orderBy: { createdAt: "desc" } });
  const applications = await prisma.adoptionApplication.findMany({ where: { listing: where }, include: { listing: true }, orderBy: { createdAt: "desc" } });
  const history = listings.filter((listing) => ["ADOPTED", "WITHDRAWN", "REJECTED"].includes(listing.status));

  return (
    <main className="container space-y-6 py-8">
      <div><h1 className="text-3xl font-bold">Adoption dashboard</h1><p className="text-muted-foreground">Manage free, non-commercial adoptions.</p></div>
      <Tabs defaultValue="listings"><TabsList><TabsTrigger value="listings">My Listings</TabsTrigger><TabsTrigger value="applications">Applications Received</TabsTrigger><TabsTrigger value="history">Adoption History</TabsTrigger></TabsList>
        <TabsContent value="listings" className="space-y-3">{listings.map((listing) => <Card key={listing.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><Link href={`/adopt/${listing.id}`} className="font-semibold hover:underline">{listing.petName}</Link><p className="text-sm text-muted-foreground">{listing.status} • {listing.applications.length} applications</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href={`/adopt/list-pet?edit=${listing.id}`}>Edit</Link></Button><form action={updateAdoptionListingStatus}><input type="hidden" name="listingId" value={listing.id} /><input type="hidden" name="status" value="ADOPTED" /><Button variant="outline">Mark Adopted</Button></form><form action={updateAdoptionListingStatus}><input type="hidden" name="listingId" value={listing.id} /><input type="hidden" name="status" value="WITHDRAWN" /><Button variant="destructive">Withdraw</Button></form></div></CardContent></Card>)}</TabsContent>
        <TabsContent value="applications" className="space-y-3">{applications.map((app) => <Card key={app.id}><CardHeader><CardTitle>{app.applicantName} for {app.listing.petName}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{app.email} • {app.phone}</p><p>Living situation: {app.livingSituation}</p><p>Date: {app.createdAt.toLocaleDateString()}</p><p className="text-muted-foreground">{app.whyAdopt}</p><div className="flex gap-2"><form action={decideAdoptionApplication}><input type="hidden" name="applicationId" value={app.id} /><input type="hidden" name="decision" value="APPROVED" /><Button>Approve</Button></form><form action={decideAdoptionApplication}><input type="hidden" name="applicationId" value={app.id} /><input type="hidden" name="decision" value="REJECTED" /><Button variant="destructive">Reject</Button></form><Button asChild variant="outline"><a href={`mailto:${app.email}`}>Contact</a></Button></div></CardContent></Card>)}</TabsContent>
        <TabsContent value="history" className="space-y-3">{history.map((listing) => <Card key={listing.id}><CardContent className="p-4"><p className="font-semibold">{listing.petName}</p><p className="text-sm text-muted-foreground">{listing.status} • {listing.updatedAt.toLocaleDateString()}</p></CardContent></Card>)}</TabsContent>
      </Tabs>
    </main>
  );
}
