import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserCheck, Siren, HeartHandshake, MessageSquareWarning, CheckCircle2, XCircle } from "lucide-react";

import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");
  const week = new Date(Date.now() - 7 * 86400000);
  const today = new Date(); today.setHours(0,0,0,0);
  const [users, ngos, pending, sosWeek, adopted, totalApps, postsToday, flaggedPosts] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "NGO", verified: true } }),
    prisma.user.count({ where: { role: { in: ["NGO", "FOSTERER"] }, verified: false } }),
    prisma.petReport.count({ where: { type: "SOS", createdAt: { gte: week }, deletedAt: null } }),
    prisma.adoptionListing.count({ where: { status: "ADOPTED" } }),
    prisma.adoptionApplication.count(),
    prisma.communityPost.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
    prisma.communityPost.findMany({ where: { deletedAt: null }, include: { author: true }, take: 3, orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl"><p className="inline-flex rounded-full bg-amber-500/20 px-4 py-2 text-sm font-bold text-amber-200"><ShieldCheck className="mr-2 size-4" aria-hidden /> Admin overview</p><h1 className="mt-4 font-display text-4xl font-bold">Protect the platform. Help the helpers.</h1><p className="mt-2 max-w-2xl text-slate-200">Moderation queues and rescue signals, built for calm decision-making.</p></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard title="Total Users" value={users} tone="blue"/><StatCard title="Active NGOs" value={ngos} tone="green"/><StatCard title="Pending Verifications" value={pending} tone="amber"/><StatCard title="SOS This Week" value={sosWeek} tone="rose"/><StatCard title="Adoption Success Rate" value={totalApps ? `${Math.round(adopted / totalApps * 100)}%` : "0%"} tone="green"/><StatCard title="Community Posts Today" value={postsToday} tone="blue"/></div>
      <section className="grid gap-5 lg:grid-cols-2"><div className="paw-card p-5"><h2 className="flex items-center gap-2 text-2xl font-bold"><UserCheck className="size-6 text-[#B45309]" aria-hidden /> Moderation queues</h2><p className="mt-2 text-[#6B5847]">Review NGOs, fosterers, community reports and rescue signals with large friendly actions.</p><div className="mt-5 grid gap-3"><Link href="/admin/users" className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-900 hover:bg-amber-100">{pending} pending verification profiles →</Link><Link href="/admin/sos" className="rounded-2xl bg-rose-50 p-4 font-bold text-rose-900 hover:bg-rose-100">{sosWeek} SOS reports this week →</Link><Link href="/admin/community" className="rounded-2xl bg-lime-50 p-4 font-bold text-lime-900 hover:bg-lime-100">Community moderation →</Link></div></div><div className="paw-card p-5"><h2 className="flex items-center gap-2 text-2xl font-bold"><MessageSquareWarning className="size-6 text-[#BE123C]" aria-hidden /> Reported stories</h2><div className="mt-4 space-y-3">{flaggedPosts.map((post: any) => <div key={post.id} className="rounded-2xl border border-[#E4D9C6] bg-white p-4"><p className="line-clamp-2 text-sm text-[#6B5847]">{post.content}</p><p className="mt-1 text-xs text-[#6B5847]">By {post.author?.name ?? "PawPrint friend"}</p><div className="mt-3 flex gap-2"><Button asChild size="sm" variant="outline"><Link href={`/community/post/${post.id}`}>Review</Link></Button><Button size="sm" variant="success"><CheckCircle2 className="size-4" aria-hidden /> Approve</Button><Button size="sm" variant="destructive"><XCircle className="size-4" aria-hidden /> Reject</Button></div></div>)}{!flaggedPosts.length ? <p className="rounded-2xl bg-lime-50 p-5 text-[#3F6212]">No reported stories waiting. That is good news.</p> : null}</div></div></section>
    </div>
  );
}
