import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function DashboardSosPage({ searchParams }: { searchParams?: Record<string,string> }) {
 const session=await getServerSession(authOptions); if(session?.user?.role!=="NGO" && session?.user?.role!=="ADMIN") redirect("/dashboard?error=no-access");
 const profile=session.user.role==="NGO"? await prisma.ngoProfile.findUnique({where:{userId:session.user.id}}):null; const districts=profile?.coverageDistricts??[];
 const reports=await prisma.petReport.findMany({where:{type:"SOS",deletedAt:null,...(districts.length?{district:{in:districts}}:{}),...(searchParams?.status?{status:searchParams.status as any}:{}),...(searchParams?.district?{district:searchParams.district}:{})},orderBy:{createdAt:"desc"},take:100});
 return <div className="space-y-5"><h1 className="text-3xl font-bold">SOS Alerts</h1><p className="text-muted-foreground">Precise GPS and reporter contacts are visible only here to authorized responders.</p><ReportTable reports={reports} mode="sos" admin={session.user.role==="ADMIN"}/></div>;
}
