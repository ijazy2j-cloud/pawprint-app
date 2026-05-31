"use client";

import { useState, useTransition } from "react";

import { submitAdoptionApplication, type AdoptionActionState } from "@/app/adopt/actions";
import { Button } from "@/components/ui/button";

export function AdoptionApplicationForm({ listingId, defaultName, defaultEmail, defaultPhone, requiresPledge }: { listingId: string; defaultName?: string | null; defaultEmail?: string | null; defaultPhone?: string | null; requiresPledge: boolean }) {
  const [state, setState] = useState<AdoptionActionState>({ ok: false });
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setState({ ok: false });
    startTransition(async () => setState(await submitAdoptionApplication(listingId, { ok: false }, formData)));
  }

  return (
    <form action={submit} className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">Adoption is free. There are no deposits, reservation fees, or payments on PawPrint.</div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Applicant name<input name="applicantName" defaultValue={defaultName ?? ""} required className="mt-2 w-full rounded-md border p-3" /></label><label className="text-sm font-semibold">Email<input name="email" type="email" defaultValue={defaultEmail ?? ""} required className="mt-2 w-full rounded-md border p-3" /></label></div>
      <label className="block text-sm font-semibold">Phone<input name="phone" defaultValue={defaultPhone ?? ""} required className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Living situation<select name="livingSituation" className="mt-2 w-full rounded-md border p-3"><option value="house">House</option><option value="apartment">Apartment</option><option value="land">Land</option></select></label>
      <label className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" name="hasGarden" /> Has garden / yard</label>
      <label className="block text-sm font-semibold">Other pets at home<textarea name="otherPets" required rows={3} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Experience with pets<textarea name="experience" required rows={3} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Why adopt this pet?<textarea name="whyAdopt" required rows={4} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="flex items-start gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" name="consentHomeVisit" required className="mt-1" /> I consent to a home visit or follow-up.</label>
      {requiresPledge ? <label className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"><input type="checkbox" name="pledge" required className="mt-1" /> I understand PawPrint is a free, non-commercial platform. I will never sell, trade, or commercially exploit this animal.</label> : <input type="hidden" name="pledge" value="on" />}
      <div aria-live="polite">
        {state.error ? <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-[#BE123C]">{state.error}</p> : null}
        {state.ok ? <p className="rounded-xl border border-lime-300 bg-lime-50 p-3 text-sm font-semibold text-[#3F6212]">Application submitted. The fosterer/NGO has been notified.</p> : null}
      </div>
      <Button className="w-full" disabled={pending}>{pending ? "Submitting…" : "Submit adoption application"}</Button>
    </form>
  );
}
