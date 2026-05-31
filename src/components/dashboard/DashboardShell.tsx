import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, PawPrint } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dashboardNavForRole, type Role } from "@/lib/dashboard/helpers";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const unread = await prisma.notification.count({ where: { userId: session.user.id, read: false } });
  const nav = dashboardNavForRole(session.user.role as Role);
  const isAdmin = session.user.role === "ADMIN";
  return (
    <div className={`min-h-screen ${isAdmin ? "bg-slate-950" : "bg-[#FFFBF5]"}`}>
      <div className="container grid gap-5 py-6 md:grid-cols-[260px_1fr]">
        <aside className={`${isAdmin ? "border-slate-800 bg-slate-900 text-slate-100" : "border-orange-100 bg-white"} rounded-3xl border p-4 shadow-sm md:sticky md:top-20 md:h-fit`}>
          <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid size-10 place-items-center rounded-full bg-[#B45309] text-white"><PawPrint className="size-5" aria-hidden /></span><div><p className="font-bold">{isAdmin ? "Admin" : "Dashboard"}</p><p className={`text-xs ${isAdmin ? "text-slate-300" : "text-[#6B5847]"}`}>{session.user.role}</p></div></div><Link href="/dashboard/notifications" aria-label={`Notifications, ${unread} unread`} className="inline-flex items-center gap-1 rounded-full bg-[#B45309] px-3 py-2 text-xs font-bold text-white"><Bell className="size-3" aria-hidden /> <span className="tabular-nums">{unread}</span></Link></div>
          <nav aria-label="Dashboard" className="grid gap-1 text-sm">{nav.map((item, idx) => <Link key={`${item.href}-${idx}`} href={item.href} className={`${isAdmin ? "text-slate-200 hover:bg-slate-800 hover:text-amber-200" : "text-[#4A3527] hover:bg-[#F4EEE2] hover:text-[#B45309]"} rounded-xl px-3 py-3 font-bold transition`}>{item.label}</Link>)}</nav>
        </aside>
        <section className={`min-w-0 ${isAdmin ? "rounded-3xl bg-[#FFFBF5] p-4 md:p-6" : ""}`}>{children}</section>
      </div>
    </div>
  );
}
