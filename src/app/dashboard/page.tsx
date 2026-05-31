export const metadata = { title: "Dashboard — PawPrint Sri Lanka" };

import { getServerSession } from "next-auth";
import Link from "next/link";
import { HeartHandshake, MessageCircle, Siren, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const district = session?.user?.district ?? undefined;
  const monthStart = new Date(); monthStart.setDate(1);
  const [activeSos, rescuedMonth, adoptions, communityPosts, recent] = await Promise.all([
    prisma.petReport.count({ where: { type: "SOS", status: { in: ["REPORTED", "NGO_NOTIFIED", "VOLUNTEER_ASSIGNED"] }, deletedAt: null, ...(role === "VOLUNTEER" && district ? { district } : {}) } }),
    prisma.petReport.count({ where: { type: "SOS", status: { in: ["RESCUED", "SAFE"] }, updatedAt: { gte: monthStart } } }),
    prisma.adoptionListing.count({ where: { status: "ACTIVE", ...(role === "NGO" ? { listedById: session?.user.id } : {}) } }),
    prisma.communityPost.count({ where: { authorId: session?.user.id, deletedAt: null } }),
    prisma.petReport.findMany({ where: { type: "SOS", deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-[#B45309] to-amber-600 p-6 text-white shadow-lg shadow-amber-900/20">
        <p className="w-fit rounded-full bg-white/20 px-4 py-2 text-sm font-bold uppercase tracking-wide">{role} command centre</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Welcome back, {session?.user?.name ?? "friend"} 🐾</h1>
        <p className="mt-2 max-w-2xl text-amber-50">Here are the animals, alerts, and neighbours who need your attention today.</p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title={role === "VOLUNTEER" ? "Active Help Requests" : "Active SOS Alerts"} value={activeSos} tone="rose"/><StatCard title="Total Helped This Month" value={rescuedMonth} tone="green"/><StatCard title="Active Adoptions" value={adoptions} tone="amber"/><StatCard title="Community Posts" value={communityPosts} tone="blue"/></div>
      <section className="grid gap-4 md:grid-cols-3"><Button asChild variant="emergency"><Link href="/dashboard/sos"><Siren className="size-5" aria-hidden /> View All SOS</Link></Button><Button asChild variant="success"><Link href="/adopt/list-pet"><HeartHandshake className="size-5" aria-hidden /> List Pet for Adoption</Link></Button><Button asChild variant="outline"><Link href="/community"><MessageCircle className="size-5" aria-hidden /> Visit Community</Link></Button></section>
      <section className="rounded-3xl bg-white p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><TrendingUp className="size-6 text-[#B45309]" aria-hidden /> Recent SOS Alerts</h2><ReportTable reports={recent} mode="sos" /></section>
    </div>
  );
}
