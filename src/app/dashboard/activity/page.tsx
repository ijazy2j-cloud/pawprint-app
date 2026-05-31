import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function ActivityPage(){const session=await getServerSession(authOptions); if(session?.user?.role!=="VOLUNTEER") redirect("/dashboard?error=no-access"); const reports=await prisma.petReport.findMany({where:{assignedVolunteerId:session.user.id,deletedAt:null},orderBy:{updatedAt:"desc"},take:100}); return <div className="space-y-5"><h1 className="text-3xl font-bold">My Activity</h1><ReportTable reports={reports} mode="activity" /></div>}
