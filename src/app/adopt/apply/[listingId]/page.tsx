import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { AdoptionApplicationForm } from "@/components/adoption/AdoptionApplicationForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdoptApplyPage({ params }: { params: { listingId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const [listing, user, existing] = await Promise.all([
    prisma.adoptionListing.findUnique({ where: { id: params.listingId }, select: { id: true, petName: true, status: true, photos: true } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, phone: true, adopterPledgeAt: true } }),
    prisma.adoptionApplication.findFirst({ where: { applicantId: session.user.id }, select: { id: true } }),
  ]);
  if (!listing) notFound();
  return (
    <main className="container max-w-3xl space-y-6 py-8">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-orange-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Adoption application</p>
        <h1 className="mt-2 text-3xl font-bold">Apply to adopt {listing.petName}</h1>
        <p className="mt-2 text-muted-foreground">Every application is reviewed by the listing NGO or fosterer. PawPrint stays free and non-commercial.</p>
      </div>
      {listing.status !== "ACTIVE" ? <p className="rounded-xl border bg-muted p-4">This listing is not currently open for applications.</p> : <AdoptionApplicationForm listingId={listing.id} defaultName={user?.name} defaultEmail={user?.email} defaultPhone={user?.phone} requiresPledge={!existing && !user?.adopterPledgeAt} />}
    </main>
  );
}
