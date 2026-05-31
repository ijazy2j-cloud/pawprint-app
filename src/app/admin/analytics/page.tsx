import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { SimpleAreaChart, SimpleBarChart, SimpleLineChart } from "@/components/dashboard/AnalyticsCharts";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");
  const since = new Date(Date.now() - 30 * 86400000);
  // independent queries run in parallel (was a 5-step sequential waterfall)
  const [districtGroups, community, users, adopted, activeAdoptions] = await Promise.all([
    prisma.petReport.groupBy({ by: ["district"], where: { type: "SOS", createdAt: { gte: since }, deletedAt: null }, _count: { _all: true }, orderBy: { _count: { district: "desc" } }, take: 12 }),
    prisma.communityPost.findMany({ where: { createdAt: { gte: since }, deletedAt: null }, select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1000 }),
    prisma.user.findMany({ where: { createdAt: { gte: since }, deletedAt: null }, select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1000 }),
    prisma.adoptionListing.count({ where: { status: "ADOPTED" } }),
    prisma.adoptionListing.count({ where: { status: "ACTIVE" } }),
  ]);
  const districtData = districtGroups.map((g) => ({ district: g.district, count: g._count._all }));
  const communityData = Object.values(community.reduce<Record<string, { day: string; posts: number }>>((acc, item) => { const day = item.createdAt.toLocaleDateString(); acc[day] = acc[day] ?? { day, posts: 0 }; acc[day].posts += 1; return acc; }, {}));
  const userData = Object.values(users.reduce<Record<string, { day: string; users: number }>>((acc, item) => { const day = item.createdAt.toLocaleDateString(); acc[day] = acc[day] ?? { day, users: 0 }; acc[day].users += 1; return acc; }, {})).map((item, idx, arr) => ({ ...item, users: arr.slice(0, idx + 1).reduce((sum, row) => sum + row.users, 0) }));
  const adoptionData = [{ label: "Active", value: activeAdoptions }, { label: "Adopted", value: adopted }];
  return <div className="space-y-6"><h1 className="text-3xl font-bold">Analytics</h1><p className="text-muted-foreground">Last 30 days. Lightweight Recharts over Prisma aggregation queries.</p><section className="space-y-2"><h2 className="font-semibold">SOS Reports per District</h2><SimpleBarChart data={districtData} xKey="district" yKey="count" /></section><section className="space-y-2"><h2 className="font-semibold">Community Engagement</h2><SimpleBarChart data={communityData} xKey="day" yKey="posts" /></section><section className="space-y-2"><h2 className="font-semibold">User Growth</h2><SimpleLineChart data={userData} xKey="day" yKey="users" /></section><section className="space-y-2"><h2 className="font-semibold">Adoption Trends</h2><SimpleAreaChart data={adoptionData} xKey="label" yKey="value" /></section></div>;
}
