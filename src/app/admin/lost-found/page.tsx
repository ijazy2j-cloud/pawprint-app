import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReportTable } from "@/components/dashboard/ReportTable";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function AdminLostFoundPage(){const session=await getServerSession(authOptions); if(session?.user?.role!=="ADMIN") redirect("/"); const reports=await prisma.petReport.findMany({where:{type:{in:["LOST","FOUND"]},deletedAt:null},orderBy:{createdAt:"desc"},take:200}); return <div className="space-y-5"><h1 className="text-3xl font-bold">Lost & Found Moderation</h1><ReportTable reports={reports} mode="lost-found" admin/></div>}
