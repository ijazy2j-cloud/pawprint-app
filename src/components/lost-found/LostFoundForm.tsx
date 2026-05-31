"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createFoundReport, createLostReport, linkLostFoundReports, type LostFoundActionState } from "@/app/lost-found/actions";
import { Button } from "@/components/ui/button";
import { inferDistrictFromCoordinates } from "@/lib/sos/districts";
import { lostFoundReportSchema, sriLankaDistricts, type LostFoundReportFormValues } from "@/lib/lost-found/validation";

const SosLocationMap = dynamic(() => import("@/components/sos/SosLocationMap").then((mod) => mod.SosLocationMap), {
  ssr: false,
  loading: () => <div className="flex h-72 items-center justify-center rounded-xl border border-[#E4D9C6] bg-[#F4EEE2] text-sm font-bold text-[#92400E] shimmer">Loading map…</div>,
});

type Props = {
  mode: "LOST" | "FOUND";
  defaultContact: { name?: string | null; email?: string | null; phone?: string | null; district?: string | null };
};

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

export function LostFoundForm({ mode, defaultContact }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<LostFoundActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const isLost = mode === "LOST";

  const form = useForm<LostFoundReportFormValues>({
    resolver: zodResolver(lostFoundReportSchema),
    defaultValues: {
      mode,
      species: "dog",
      size: "medium",
      district: (defaultContact.district as LostFoundReportFormValues["district"]) ?? "Colombo",
      reporterName: defaultContact.name ?? "",
      reporterEmail: defaultContact.email ?? "",
      reporterPhone: defaultContact.phone ?? "",
      description: "",
      photos: ["https://example.com/client-placeholder.jpg"],
    },
  });

  const watchedLat = form.watch("lat");
  const watchedLng = form.watch("lng");
  const lat = typeof watchedLat === "number" ? watchedLat : Number(watchedLat) || undefined;
  const lng = typeof watchedLng === "number" ? watchedLng : Number(watchedLng) || undefined;

  function setLocation(nextLat: number, nextLng: number) {
    form.setValue("lat", Number(nextLat.toFixed(7)), { shouldValidate: true });
    form.setValue("lng", Number(nextLng.toFixed(7)), { shouldValidate: true });
    form.setValue("district", inferDistrictFromCoordinates(nextLat, nextLng), { shouldValidate: true });
  }

  function captureGps() {
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation(position.coords.latitude, position.coords.longitude),
      () => setState({ ok: false, error: "Could not access GPS. Drop a pin on the map instead." }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !fileInputRef.current) return;
    const selected = Array.from(files).slice(0, 3);
    const compressed = await Promise.all(selected.map(compressImage));
    const dataTransfer = new DataTransfer();
    compressed.forEach((file) => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
    form.setValue("photos", compressed.map((_, index) => `https://local-upload.invalid/${index}.jpg`), { shouldValidate: true });
    setPreviewUrls(compressed.map((file) => URL.createObjectURL(file)));
  }

  function submit(formData: FormData) {
    setState({ ok: false });
    startTransition(async () => {
      const action = isLost ? createLostReport : createFoundReport;
      const result = await action({ ok: false }, formData);
      setState(result);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form action={submit} className="space-y-6">
        <input type="hidden" name="mode" value={mode} />
        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <label htmlFor="lf-photos" className="text-sm font-semibold">Photos (1-3)</label>
          <input id="lf-photos" ref={fileInputRef} name="photos" type="file" accept="image/*" multiple required className="mt-2 block w-full rounded-md border p-3 text-sm" onChange={(event) => void handleFiles(event.target.files)} />
          {previewUrls.length ? <div className="mt-3 grid grid-cols-3 gap-2">{previewUrls.map((url, i) => <img key={url} src={url} alt={`Selected pet photo ${i + 1}`} className="h-24 w-full rounded-lg object-cover" />)}</div> : null}
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          {isLost ? <><label htmlFor="lf-petname" className="text-sm font-semibold">Pet name</label><input id="lf-petname" {...form.register("petName")} name="petName" className="mt-2 w-full rounded-md border bg-background p-3" placeholder="Milo" /></> : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold">Species<select {...form.register("species")} name="species" className="mt-2 w-full rounded-md border bg-background p-3"><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></label>
            <label className="text-sm font-semibold">Size<select {...form.register("size")} name="size" className="mt-2 w-full rounded-md border bg-background p-3"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="unknown">Unknown</option></select></label>
            <label className="text-sm font-semibold">Colour<input {...form.register("color")} name="color" className="mt-2 w-full rounded-md border bg-background p-3" placeholder="Black and white" /></label>
          </div>
          <label className="mt-4 block text-sm font-semibold">Breed<input {...form.register("breed")} name="breed" className="mt-2 w-full rounded-md border bg-background p-3" placeholder="Unknown is okay" /></label>
          {isLost ? <label className="mt-4 block text-sm font-semibold">Collar / identifying details<textarea {...form.register("collarDescription")} name="collarDescription" rows={2} className="mt-2 w-full rounded-md border bg-background p-3" /></label> : <label className="mt-4 block text-sm font-semibold">Current status<select {...form.register("foundStatus")} name="foundStatus" className="mt-2 w-full rounded-md border bg-background p-3"><option value="WITH_ME">With me</option><option value="AT_VET">At vet</option><option value="ROAMING">Roaming</option></select></label>}
          <label className="mt-4 block text-sm font-semibold">Description<textarea {...form.register("description")} name="description" rows={4} className="mt-2 w-full rounded-md border bg-background p-3" placeholder="What should people know?" /></label>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3"><label className="text-sm font-semibold">{isLost ? "Last seen location" : "Found location"}</label><Button type="button" variant="outline" size="sm" onClick={captureGps}>Auto-capture GPS</Button></div>
          <input type="hidden" {...form.register("lat", { valueAsNumber: true })} /><input type="hidden" {...form.register("lng", { valueAsNumber: true })} />
          <div className="mt-3"><SosLocationMap lat={lat} lng={lng} onChange={setLocation} /></div>
          <label className="mt-4 block text-sm font-semibold">District<select {...form.register("district")} name="district" className="mt-2 w-full rounded-md border bg-background p-3">{sriLankaDistricts.map((district) => <option key={district}>{district}</option>)}</select></label>
          <label className="mt-4 block text-sm font-semibold">Approximate area / landmark<input {...form.register("landmark")} name="landmark" className="mt-2 w-full rounded-md border bg-background p-3" placeholder="Near junction, temple, school…" /></label>
          <label className="mt-4 block text-sm font-semibold">{isLost ? "Last seen date" : "Found date"}<input {...form.register("eventDate")} name="eventDate" type="date" className="mt-2 w-full rounded-md border bg-background p-3" /></label>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <label className="text-sm font-semibold">Contact</label>
          <input {...form.register("reporterName")} name="reporterName" className="mt-3 w-full rounded-md border bg-background p-3" placeholder="Name" />
          <input {...form.register("reporterPhone")} name="reporterPhone" className="mt-3 w-full rounded-md border bg-background p-3" placeholder="Phone / WhatsApp" />
          <input {...form.register("reporterEmail")} name="reporterEmail" type="email" className="mt-3 w-full rounded-md border bg-background p-3" placeholder="Email" />
          <p className="mt-2 text-xs text-muted-foreground">Public cards mask contact details until someone clicks Reveal Contact.</p>
        </section>
        {state.error ? <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-[#BE123C]">{state.error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Submitting…" : isLost ? "Create lost pet report" : "Create found pet report"}</Button>
      </form>

      <aside className="space-y-4">
        {state.ok && state.reportId ? <section className="rounded-2xl border bg-card p-4 shadow-sm"><h3 className="font-semibold">Report created</h3><p className="mt-1 text-sm text-muted-foreground">ID: {state.reportId}</p><div className="mt-3 flex flex-col gap-2"><Button asChild variant="outline"><Link href={`/report/${state.reportId}`}>Open public report</Link></Button>{state.posterUrl ? <Button asChild><Link href={state.posterUrl}>Download missing poster</Link></Button> : null}</div></section> : null}
        {state.matches?.length ? <section className="rounded-2xl border bg-card p-4 shadow-sm"><h3 className="font-semibold">Possible matches</h3><div className="mt-3 space-y-3">{state.matches.map((match) => <div key={match.id} className="rounded-xl border p-3"><p className="text-sm font-medium">{match.type} report • {match.score}% match</p><p className="text-xs text-muted-foreground">{match.district} • {match.reasons.join(", ")}</p><form action={linkLostFoundReports} className="mt-2"><input type="hidden" name="reportId" value={state.reportId} /><input type="hidden" name="matchedReportId" value={match.id} /><Button size="sm" variant="outline">This matches report {match.id.slice(0, 8)}</Button></form></div>)}</div></section> : null}
      </aside>
    </div>
  );
}
