"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { assertNoSaleLanguage, canListAdoptionPet, nextListingStatusForRole, nonCommercialMessage, canManageAdoptions } from "@/lib/adoption/guards";
import { adoptionApplicationSchema, adoptionListingSchema } from "@/lib/adoption/validation";
import { prisma } from "@/lib/prisma";
import { uploadSosImage } from "@/lib/sos/images";

export type AdoptionActionState = { ok: boolean; error?: string; listingId?: string; applicationId?: string };

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Sign in required.");
  return session;
}

async function notifyAdminsForReview(listingId: string, petName: string) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (!admins.length) return;
  await prisma.notification.createMany({
    data: admins.map((admin) => ({ userId: admin.id, type: "ADOPTION_REVIEW", message: `Adoption listing needs review: ${petName}.`, relatedReportId: null })),
  });
}

export async function createAdoptionListing(_previous: AdoptionActionState, formData: FormData): Promise<AdoptionActionState> {
  try {
    const session = await requireSession();
    if (!canListAdoptionPet(session.user.role)) return { ok: false, error: "Only verified NGOs and fosterers can list pets. Apply to become a fosterer." };

    const imageFiles = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0).slice(0, 5);
    if (!imageFiles.length) return { ok: false, error: "Add at least one photo." };
    const photoUrls = await Promise.all(imageFiles.map(uploadSosImage));

    const parsed = adoptionListingSchema.parse({
      petName: formData.get("petName"),
      species: formData.get("species"),
      estimatedAge: formData.get("estimatedAge"),
      gender: formData.get("gender"),
      size: formData.get("size"),
      healthStatus: formData.get("healthStatus"),
      temperament: formData.get("temperament"),
      specialNeeds: formData.get("specialNeeds"),
      adoptionRequirements: formData.get("adoptionRequirements"),
      photos: photoUrls,
      district: formData.get("district"),
      currentStatus: formData.get("currentStatus"),
    });
    assertNoSaleLanguage([parsed.petName, parsed.healthStatus, parsed.temperament, parsed.specialNeeds, parsed.adoptionRequirements]);

    const status = nextListingStatusForRole(session.user.role);
    const listing = await prisma.adoptionListing.create({
      data: {
        petName: parsed.petName,
        species: parsed.species,
        age: parsed.estimatedAge,
        estimatedAge: parsed.estimatedAge,
        gender: parsed.gender,
        size: parsed.size,
        district: parsed.district,
        healthStatus: parsed.healthStatus,
        healthNotes: null,
        temperament: parsed.temperament,
        specialNeeds: parsed.specialNeeds || null,
        requirements: null,
        adoptionRequirements: parsed.adoptionRequirements,
        photos: parsed.photos,
        listedById: session.user.id,
        status,
      },
    });

    if (status === "PENDING") await notifyAdminsForReview(listing.id, listing.petName);
    revalidatePath("/adopt");
    revalidatePath("/dashboard/adoptions");
    return { ok: true, listingId: listing.id };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : nonCommercialMessage };
  }
}

export async function submitAdoptionApplication(listingId: string, _previous: AdoptionActionState, formData: FormData): Promise<AdoptionActionState> {
  try {
    const session = await requireSession();
    const [existing, user] = await Promise.all([
      prisma.adoptionApplication.findFirst({ where: { applicantId: session.user.id, listingId }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: session.user.id }, select: { adopterPledgeAt: true } }),
    ]);
    if (existing) return { ok: false, error: "You have already applied for this pet." };
    const alreadyPledged = Boolean(user?.adopterPledgeAt);
    const parsed = adoptionApplicationSchema.parse({
      applicantName: formData.get("applicantName"),
      livingSituation: formData.get("livingSituation"),
      hasGarden: formData.get("hasGarden"),
      otherPets: formData.get("otherPets"),
      experience: formData.get("experience"),
      whyAdopt: formData.get("whyAdopt"),
      consentHomeVisit: formData.get("consentHomeVisit"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      pledge: alreadyPledged ? "on" : formData.get("pledge"),
    });

    const listing = await prisma.adoptionListing.findUnique({ where: { id: listingId }, select: { id: true, petName: true, listedById: true, status: true } });
    if (!listing || listing.status !== "ACTIVE") return { ok: false, error: "This pet is not currently open for applications." };

    const application = await prisma.$transaction(async (tx) => {
      if (!existing) await tx.user.update({ where: { id: session.user.id }, data: { adopterPledgeAt: new Date() } });
      const created = await tx.adoptionApplication.create({
        data: {
          listingId,
          applicantId: session.user.id,
          applicantName: parsed.applicantName,
          livingSituation: parsed.livingSituation,
          hasGarden: parsed.hasGarden,
          otherPets: parsed.otherPets,
          experience: parsed.experience,
          whyAdopt: parsed.whyAdopt,
          consentHomeVisit: parsed.consentHomeVisit,
          phone: parsed.phone,
          email: parsed.email,
        },
      });
      await tx.notification.create({ data: { userId: listing.listedById, type: "ADOPTION_INTEREST", message: `${parsed.applicantName} applied to adopt ${listing.petName}.` } });
      return created;
    });

    revalidatePath("/dashboard/adoptions");
    return { ok: true, applicationId: application.id };
  } catch (error) {
    console.error(error);
    return { ok: false, error: error instanceof Error ? error.message : "Could not submit application." };
  }
}

export async function updateAdoptionListingStatus(formData: FormData) {
  const session = await requireSession();
  if (!canManageAdoptions(session.user.role)) throw new Error("Not allowed.");
  const listingId = String(formData.get("listingId") ?? "");
  const status = String(formData.get("status") ?? "") as "ADOPTED" | "WITHDRAWN";
  const listing = await prisma.adoptionListing.findUnique({ where: { id: listingId }, select: { listedById: true, photos: true, petName: true } });
  if (!listing || (session.user.role !== "ADMIN" && listing.listedById !== session.user.id)) throw new Error("Not allowed.");
  await prisma.adoptionListing.update({ where: { id: listingId }, data: { status } });
  if (status === "ADOPTED") {
    await prisma.communityPost.create({ data: { authorId: session.user.id, photos: listing.photos.slice(0, 1), content: `Forever Home story draft: ${listing.petName} has been adopted! Share the happy update.` } });
    redirect("/community?draft=adoption");
  }
  revalidatePath("/dashboard/adoptions");
}

export async function decideAdoptionApplication(formData: FormData) {
  const session = await requireSession();
  if (!canManageAdoptions(session.user.role)) throw new Error("Not allowed.");
  const applicationId = String(formData.get("applicationId") ?? "");
  const decision = String(formData.get("decision") ?? "") as "APPROVED" | "REJECTED";
  const application = await prisma.adoptionApplication.findUnique({ where: { id: applicationId }, include: { listing: true } });
  if (!application || (session.user.role !== "ADMIN" && application.listing.listedById !== session.user.id)) throw new Error("Not allowed.");
  await prisma.$transaction([
    prisma.adoptionApplication.update({ where: { id: applicationId }, data: { status: decision } }),
    ...(decision === "APPROVED" ? [prisma.adoptionListing.update({ where: { id: application.listingId }, data: { status: "ADOPTED" } })] : []),
    prisma.notification.create({ data: { userId: application.applicantId, type: "ADOPTION_INTEREST", message: `Your adoption application for ${application.listing.petName} was ${decision.toLowerCase()}.` } }),
  ]);
  revalidatePath("/dashboard/adoptions");
}

export async function moderateAdoptionListing(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") throw new Error("Admin only.");
  const listingId = String(formData.get("listingId") ?? "");
  const decision = String(formData.get("decision") ?? "") as "ACTIVE" | "REJECTED";
  const reason = String(formData.get("reason") ?? "");
  const listing = await prisma.adoptionListing.update({ where: { id: listingId }, data: { status: decision }, select: { listedById: true, petName: true } });
  await prisma.notification.create({ data: { userId: listing.listedById, type: "ADOPTION_REVIEW", message: decision === "ACTIVE" ? `${listing.petName} is approved and live.` : `${listing.petName} was rejected.${reason ? ` Reason: ${reason}` : ""}` } });
  revalidatePath("/admin/adoptions");
  revalidatePath("/adopt");
}
