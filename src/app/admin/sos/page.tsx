import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function AdminSosPage({searchParams}:{searchParams?:Record<string,string>}){const session=await getServerSession(authOptions); if(session?.user?.role!=="ADMIN") redirect("/"); const reports=await prisma.petReport.findMany({where:{type:"SOS",deletedAt:null,...(searchParams?.status?{status:searchParams.status as any}:{}),...(searchParams?.district?{district:searchParams.district}:{})},orderBy:{createdAt:"desc"},take:200}); return <div className="space-y-5"><h1 className="text-3xl font-bold">SOS Oversight</h1><ReportTable reports={reports} mode="sos" admin/></div>}
