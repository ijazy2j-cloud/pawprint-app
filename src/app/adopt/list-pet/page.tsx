import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AdoptionListingForm } from "@/components/adoption/AdoptionListingForm";
import { authOptions } from "@/lib/auth";
import { canListAdoptionPet } from "@/lib/adoption/guards";

export default async function ListPetPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!canListAdoptionPet(session.user.role)) redirect("/adopt?message=Only%20verified%20NGOs%20and%20fosterers%20can%20list%20pets.%20Apply%20to%20become%20a%20fosterer.");
  return (
    <main className="container max-w-3xl space-y-6 py-8">
      <div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Verified listings only</p><h1 className="text-3xl font-bold">List a pet for adoption</h1><p className="mt-2 text-muted-foreground">Fosterer listings enter admin review. NGO and admin listings go live immediately.</p></div>
      <AdoptionListingForm />
    </main>
  );
}
