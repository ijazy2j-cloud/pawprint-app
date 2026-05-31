import { getServerSession } from "next-auth";
import { updateEmailPreferences } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export default async function SettingsPage(){const session=await getServerSession(authOptions); const user=session?.user?.id? await prisma.user.findUnique({where:{id:session.user.id}}):null; return <div className="space-y-5"><h1 className="text-3xl font-bold">Settings</h1><form action={updateEmailPreferences} className="grid max-w-xl gap-4 rounded-2xl border bg-card p-4"><label>SOS digest emails<select name="sosEmailPreference" defaultValue={user?.sosEmailPreference??"daily"} className="mt-1 w-full rounded border p-2"><option>daily</option><option>weekly</option><option>none</option></select></label><label>Adoption application emails<select name="adoptionEmailPreference" defaultValue={user?.adoptionEmailPreference??"instant"} className="mt-1 w-full rounded border p-2"><option>instant</option><option>daily</option><option>none</option></select></label><Button>Save settings</Button></form></div>}
