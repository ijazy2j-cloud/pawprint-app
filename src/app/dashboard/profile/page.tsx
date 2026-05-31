import { getServerSession } from "next-auth";
import { updateNgoProfile, updateProfile } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { sriLankaDistricts } from "@/lib/sos/districts";
import { prisma } from "@/lib/prisma";

const field = "rounded-xl border border-[#E4D9C6] bg-white p-2.5";
const labelCls = "grid gap-1 text-sm font-bold text-[#4A3527]";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, include: { ngoProfile: true } }) : null;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <form action={updateProfile} className="grid gap-3 rounded-2xl border bg-card p-4">
        <label htmlFor="pf-name" className={labelCls}>Display name<input id="pf-name" name="name" defaultValue={user?.name ?? ""} placeholder="Display name" autoComplete="name" className={field} /></label>
        <label htmlFor="pf-phone" className={labelCls}>Phone<input id="pf-phone" name="phone" type="tel" defaultValue={user?.phone ?? ""} placeholder="Phone" autoComplete="tel" className={field} /></label>
        <label htmlFor="pf-district" className={labelCls}>District<select id="pf-district" name="district" defaultValue={user?.district ?? ""} className={field}><option value="">Select a district</option>{sriLankaDistricts.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label htmlFor="pf-availability" className={labelCls}>Availability<select id="pf-availability" name="availability" defaultValue={user?.availability ?? "Available"} className={field}><option>Available</option><option>Busy</option><option>Temporarily Unavailable</option></select></label>
        <label htmlFor="pf-bio" className={labelCls}>Bio<textarea id="pf-bio" name="bio" defaultValue={user?.bio ?? ""} placeholder="A short bio" className={field} /></label>
        <fieldset className="grid gap-1 sm:grid-cols-3"><legend className="mb-1 text-sm font-bold text-[#4A3527]">Preferred districts</legend>{sriLankaDistricts.slice(0, 12).map((d) => <label key={d} className="flex items-center gap-2 text-sm"><input type="checkbox" name="preferredDistricts" value={d} defaultChecked={user?.preferredDistricts.includes(d)} /> {d}</label>)}</fieldset>
        <Button>Save profile</Button>
      </form>
      {user?.role === "NGO" || user?.role === "ADMIN" ? (
        <form action={updateNgoProfile} className="grid gap-3 rounded-2xl border bg-card p-4">
          <h2 className="text-xl font-semibold">NGO Profile</h2>
          <label htmlFor="ngo-org" className={labelCls}>Organisation name<input id="ngo-org" name="orgName" defaultValue={user.ngoProfile?.orgName ?? ""} placeholder="Org name" className={field} /></label>
          <label htmlFor="ngo-reg" className={labelCls}>Registration number<input id="ngo-reg" name="regNumber" defaultValue={user.ngoProfile?.regNumber ?? ""} placeholder="Registration number" className={field} /></label>
          <label htmlFor="ngo-email" className={labelCls}>Contact email<input id="ngo-email" name="contactEmail" type="email" defaultValue={user.ngoProfile?.contactEmail ?? user.email} placeholder="Contact email" autoComplete="email" className={field} /></label>
          <label htmlFor="ngo-phone" className={labelCls}>Contact phone<input id="ngo-phone" name="contactPhone" type="tel" defaultValue={user.ngoProfile?.contactPhone ?? ""} placeholder="Contact phone" autoComplete="tel" className={field} /></label>
          <fieldset className="grid gap-1 sm:grid-cols-3"><legend className="mb-1 text-sm font-bold text-[#4A3527]">Coverage districts</legend>{sriLankaDistricts.map((d) => <label key={d} className="flex items-center gap-2 text-sm"><input type="checkbox" name="coverageDistricts" value={d} defaultChecked={user.ngoProfile?.coverageDistricts.includes(d)} /> {d}</label>)}</fieldset>
          <Button>Save NGO profile</Button>
          <div className="rounded-xl bg-muted p-4"><p className="font-semibold">Public preview</p><p>{user.ngoProfile?.orgName ?? "Your NGO"} helps animals across {(user.ngoProfile?.coverageDistricts ?? []).join(", ") || "selected districts"}.</p></div>
        </form>
      ) : null}
    </div>
  );
}
