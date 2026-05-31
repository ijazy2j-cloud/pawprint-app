import { getServerSession } from "next-auth";

import { updateEmailPreferences } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;
  return (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-bold">Notification preferences</h1><p className="text-muted-foreground">Choose which external emails you receive. In-app notifications still appear in PawPrint.</p></div>
      <form action={updateEmailPreferences} className="grid max-w-2xl gap-4 rounded-2xl border bg-card p-5">
        <label className="grid gap-1">Digest frequency<select name="emailDigestFrequency" defaultValue={user?.emailDigestFrequency ?? "INSTANT"} className="rounded border p-2"><option>INSTANT</option><option>DAILY</option><option>WEEKLY</option><option>NONE</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notifyOnSos" defaultChecked={user?.notifyOnSos ?? true} /> SOS and escalation emails</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notifyOnAdoptionApplication" defaultChecked={user?.notifyOnAdoptionApplication ?? true} /> Adoption application emails</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="notifyOnReunion" defaultChecked={user?.notifyOnReunion ?? true} /> Reunion celebration emails</label>
        <input type="hidden" name="sosEmailPreference" value={user?.sosEmailPreference ?? "daily"} />
        <input type="hidden" name="adoptionEmailPreference" value={user?.adoptionEmailPreference ?? "instant"} />
        <Button>Save notification preferences</Button>
      </form>
    </div>
  );
}
