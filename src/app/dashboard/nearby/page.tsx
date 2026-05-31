import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { HelpButton } from "@/components/dashboard/ReportTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/dashboard/helpers";
export default async function NearbyPage(){const session=await getServerSession(authOptions); if(session?.user?.role!=="VOLUNTEER") redirect("/dashboard?error=no-access"); const districts=session.user.district?[session.user.district]:[]; const reports=await prisma.petReport.findMany({where:{type:"SOS",status:{in:["REPORTED","NGO_NOTIFIED"]},deletedAt:null,...(districts.length?{district:{in:districts}}:{})},orderBy:{createdAt:"desc"},take:50}); return <div className="space-y-5"><h1 className="text-3xl font-bold">Nearby Alerts</h1><div className="rounded-2xl border bg-muted p-6 text-center">Map view placeholder — exact pins are available after assignment.</div><div className="grid gap-4 md:grid-cols-2">{reports.map(r=><div key={r.id} className="rounded-2xl border bg-card p-4"><p className="font-semibold">{r.condition} in {r.district}</p><p className="text-sm text-muted-foreground">{timeAgo(r.createdAt)}</p><p className="my-3 line-clamp-2 text-sm">{r.description}</p><HelpButton id={r.id}/></div>)}</div></div>}
