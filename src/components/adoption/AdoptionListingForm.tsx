"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { createAdoptionListing, type AdoptionActionState } from "@/app/adopt/actions";
import { Button } from "@/components/ui/button";
import { sriLankaDistricts } from "@/lib/adoption/validation";

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((item) => resolve(item ?? file), "image/jpeg", 0.8));
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

export function AdoptionListingForm() {
  const ref = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<AdoptionActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  const [previews, setPreviews] = useState<string[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || !ref.current) return;
    const compressed = await Promise.all(Array.from(files).slice(0, 5).map(compressImage));
    const dt = new DataTransfer();
    compressed.forEach((file) => dt.items.add(file));
    ref.current.files = dt.files;
    setPreviews(compressed.map((file) => URL.createObjectURL(file)));
  }

  function submit(formData: FormData) {
    setState({ ok: false });
    startTransition(async () => setState(await createAdoptionListing({ ok: false }, formData)));
  }

  return (
    <form action={submit} className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">PawPrint adoption listings are always free. Price, deposit, sale, or payment language is blocked.</div>
      <label className="block text-sm font-semibold">Photos (1-5)<input ref={ref} name="photos" type="file" accept="image/*" multiple required className="mt-2 w-full rounded-md border p-3" onChange={(e) => void handleFiles(e.target.files)} /></label>
      {previews.length ? <div className="grid grid-cols-3 gap-2">{previews.map((url, i) => <img key={url} src={url} alt={`Pet preview ${i + 1}`} className="h-24 w-full rounded-lg object-cover" />)}</div> : null}
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Pet name<input name="petName" required className="mt-2 w-full rounded-md border p-3" /></label><label className="text-sm font-semibold">Estimated age<input name="estimatedAge" required className="mt-2 w-full rounded-md border p-3" placeholder="2 years" /></label></div>
      <div className="grid gap-3 sm:grid-cols-4"><label className="text-sm font-semibold">Species<select name="species" className="mt-2 w-full rounded-md border p-3"><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></label><label className="text-sm font-semibold">Gender<select name="gender" className="mt-2 w-full rounded-md border p-3"><option value="female">Female</option><option value="male">Male</option><option value="unknown">Unknown</option></select></label><label className="text-sm font-semibold">Size<select name="size" className="mt-2 w-full rounded-md border p-3"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="unknown">Unknown</option></select></label><label className="text-sm font-semibold">District<select name="district" className="mt-2 w-full rounded-md border p-3">{sriLankaDistricts.map((d) => <option key={d}>{d}</option>)}</select></label></div>
      <label className="block text-sm font-semibold">Health status<input name="healthStatus" required className="mt-2 w-full rounded-md border p-3" placeholder="Vaccinated, healthy, under care…" /></label>
      <label className="block text-sm font-semibold">Temperament<textarea name="temperament" required rows={3} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Special needs<textarea name="specialNeeds" rows={3} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Adoption requirements<textarea name="adoptionRequirements" required rows={4} className="mt-2 w-full rounded-md border p-3" /></label>
      <label className="block text-sm font-semibold">Current status<select name="currentStatus" className="mt-2 w-full rounded-md border p-3"><option value="ACTIVE">Available</option><option value="UNDER_MEDICAL_CARE">Under Medical Care</option><option value="COMING_SOON">Coming Soon</option></select></label>
      <div aria-live="polite">
        {state.error ? <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-[#BE123C]">{state.error}</p> : null}
        {state.ok && state.listingId ? <p className="rounded-xl border border-lime-300 bg-lime-50 p-3 text-sm font-semibold text-[#3F6212]">Listing saved. <Link className="underline" href={`/adopt/${state.listingId}`}>Open listing</Link></p> : null}
      </div>
      <Button className="w-full" disabled={pending}>{pending ? "Submitting…" : "Submit adoption listing"}</Button>
    </form>
  );
}
