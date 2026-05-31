import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const dogPhoto = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800";
const catPhoto = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800";
const rescuePhoto = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800";

async function main() {
  const districts = ["Colombo", "Kandy", "Galle"];
  await Promise.all(districts.map((name) => prisma.district.upsert({ where: { name }, update: {}, create: { name } })));

  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@pawprint.lk" }, update: { role: UserRole.ADMIN, verified: true }, create: { email: "admin@pawprint.lk", name: "PawPrint Admin", phone: "+947****0000", passwordHash: adminPasswordHash, role: UserRole.ADMIN, district: "Colombo", verified: true } });

  const ngoSeeds = [
    { email: "colombo-rescue@pawprint.lk", name: "Colombo Rescue Coordinator", phone: "+947****1111", district: "Colombo", orgName: "Colombo Pet Rescue Network", regNumber: "NGO-CMB-001", coverageDistricts: ["Colombo", "Gampaha", "Kalutara"], contactEmail: "help@colomborescue.lk", contactPhone: "+947****1111" },
    { email: "kandy-paws@pawprint.lk", name: "Kandy Paws Coordinator", phone: "+947****2222", district: "Kandy", orgName: "Kandy Paws Rescue", regNumber: "NGO-KDY-001", coverageDistricts: ["Kandy", "Matale", "Nuwara Eliya"], contactEmail: "rescue@kandypaws.lk", contactPhone: "+947****2222" },
  ];

  const ngos = [];
  for (const ngo of ngoSeeds) {
    const user = await prisma.user.upsert({ where: { email: ngo.email }, update: { role: UserRole.NGO, verified: true }, create: { email: ngo.email, name: ngo.name, phone: ngo.phone, role: UserRole.NGO, district: ngo.district, verified: true } });
    ngos.push(user);
    await prisma.ngoProfile.upsert({ where: { userId: user.id }, update: { orgName: ngo.orgName, regNumber: ngo.regNumber, coverageDistricts: ngo.coverageDistricts, contactEmail: ngo.contactEmail, contactPhone: ngo.contactPhone, verified: true }, create: { userId: user.id, orgName: ngo.orgName, regNumber: ngo.regNumber, coverageDistricts: ngo.coverageDistricts, contactEmail: ngo.contactEmail, contactPhone: ngo.contactPhone, verified: true } });
  }

  await prisma.petReport.upsert({ where: { id: "11111111-1111-4111-8111-111111111111" }, update: { photos: [rescuePhoto] }, create: { id: "11111111-1111-4111-8111-111111111111", type: "SOS", status: "REPORTED", condition: "INJURED", photos: [rescuePhoto], lat: 6.927079, lng: 79.861244, district: "Colombo", landmark: "Near Viharamahadevi Park", description: "Gentle street dog limping and staying close to the park entrance. Needs food, water, and a vet check.", reporterName: "Demo neighbour", reporterPhone: "+947****3333", reporterEmail: "demo@pawprint.lk", reporterId: admin.id, assignedNgoId: ngos[0]?.id } });
  await prisma.petReport.upsert({ where: { id: "22222222-2222-4222-8222-222222222222" }, update: { photos: [dogPhoto] }, create: { id: "22222222-2222-4222-8222-222222222222", type: "LOST", status: "REPORTED", photos: [dogPhoto], lat: 7.290572, lng: 80.633728, district: "Kandy", landmark: "Near lake round", description: "Friendly brown dog missing since yesterday evening. Responds to Milo.", petName: "Milo", species: "dog", color: "brown", size: "medium", lastSeenDate: new Date(), reporterName: "Demo family", reporterPhone: "+947****4444", reporterEmail: "family@pawprint.lk", reporterId: admin.id } });
  await prisma.adoptionListing.upsert({ where: { id: "33333333-3333-4333-8333-333333333333" }, update: { photos: [catPhoto] }, create: { id: "33333333-3333-4333-8333-333333333333", petName: "Luna", species: "cat", age: "8 months", estimatedAge: "8 months", gender: "female", size: "small", district: "Colombo", healthStatus: "Vaccinated and healthy", healthNotes: "Rescued kitten, now playful and ready for a calm home.", temperament: "Gentle, curious, affectionate", requirements: "Indoor home preferred. No adoption fee.", photos: [catPhoto], listedById: ngos[0]?.id ?? admin.id, status: "ACTIVE" } });
  await prisma.communityPost.upsert({ where: { id: "44444444-4444-4444-8444-444444444444" }, update: { photos: [rescuePhoto], isSpotlight: true, spotlightAt: new Date() }, create: { id: "44444444-4444-4444-8444-444444444444", authorId: admin.id, tag: "RESCUE", content: "Today a tired roadside pup got food, water, and a safe foster ride. Small acts become big second chances.", photos: [rescuePhoto], isSpotlight: true, spotlightAt: new Date() } });
}

main().then(async () => { await prisma.$disconnect(); }).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
