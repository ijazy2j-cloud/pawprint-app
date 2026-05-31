"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CheckCircle2, HeartPulse, LocateFixed, Siren, UploadCloud, WifiOff } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createSosReport, type CreateSosReportState } from "@/app/sos-report/actions";
import { Button } from "@/components/ui/button";
import { inferDistrictFromCoordinates, sriLankaDistricts } from "@/lib/sos/districts";
import { sosReportFormSchema, type SosReportFormValues } from "@/lib/sos/validation";

const SosLocationMap = dynamic(() => import("@/components/sos/SosLocationMap").then((mod) => mod.SosLocationMap), {
  ssr: false,
  loading: () => <div className="flex h-80 items-center justify-center rounded-xl border border-[#E4D9C6] bg-[#F4EEE2] text-sm font-bold text-[#92400E] shimmer">Loading rescue map…</div>,
});

const conditionOptions = [
  { value: "INJURED", label: "Injured", icon: "🩹", help: "Needs urgent care" },
  { value: "ABANDONED", label: "Abandoned", icon: "💔", help: "Left without help" },
  { value: "LOST", label: "Lost", icon: "🔎", help: "May belong to family" },
  { value: "STRAY", label: "Stray", icon: "🐾", help: "Needs support" },
] as const;

type Props = { defaultContact: { name?: string | null; email?: string | null; phone?: string | null; district?: string | null } };

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

// One decision per block — fixed priority order
function StepHeader({ n, title, hint, done }: { n: number; title: string; hint?: string; done?: boolean }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "bg-[#4D7C0F] text-white" : "bg-[#F4EEE2] text-[#92400E]"}`} aria-hidden>
        {done ? <CheckCircle2 className="size-5" /> : n}
      </span>
      <div>
        <h2 className="text-lg font-bold leading-tight text-[#241712]">{title}</h2>
        {hint ? <p className="text-sm text-[#6B5847]">{hint}</p> : null}
      </div>
    </div>
  );
}

export function SosReportForm({ defaultContact }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<CreateSosReportState>({ ok: false });
  const [pending, startTransition] = useTransition();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const form = useForm<SosReportFormValues>({ resolver: zodResolver(sosReportFormSchema), defaultValues: { condition: "INJURED", district: (defaultContact.district as SosReportFormValues["district"]) ?? "Colombo", description: "", landmark: "", reporterName: defaultContact.name ?? "", reporterEmail: defaultContact.email ?? "", reporterPhone: defaultContact.phone ?? "", photos: ["https://example.com/client-placeholder.jpg"] } });
  const watchedLat = form.watch("lat");
  const watchedLng = form.watch("lng");
  const lat = typeof watchedLat === "number" ? watchedLat : Number(watchedLat) || undefined;
  const lng = typeof watchedLng === "number" ? watchedLng : Number(watchedLng) || undefined;

  const photosDone = previewUrls.length > 0;
  const locationDone = Boolean(lat && lng);

  function setLocation(nextLat: number, nextLng: number) { form.setValue("lat", Number(nextLat.toFixed(7)), { shouldValidate: true }); form.setValue("lng", Number(nextLng.toFixed(7)), { shouldValidate: true }); form.setValue("district", inferDistrictFromCoordinates(nextLat, nextLng), { shouldValidate: true }); }
  async function handleFiles(files: FileList | null) { if (!files || !fileInputRef.current) return; const selected = Array.from(files).slice(0, 3); const compressed = await Promise.all(selected.map(compressImage)); const dataTransfer = new DataTransfer(); compressed.forEach((file) => dataTransfer.items.add(file)); fileInputRef.current.files = dataTransfer.files; form.setValue("photos", compressed.map((_, index) => `https://local-upload.invalid/${index}.jpg`), { shouldValidate: true }); setPreviewUrls(compressed.map((file) => URL.createObjectURL(file))); }
  function captureGps() { navigator.geolocation.getCurrentPosition((position) => setLocation(position.coords.latitude, position.coords.longitude), () => setState({ ok: false, error: "Could not access GPS. Drop a pin on the map instead." }), { enableHighAccuracy: true, timeout: 10000 }); }
  function submit(formData: FormData) { setState({ ok: false }); startTransition(async () => { const result = await createSosReport({ ok: false }, formData); setState(result); if (result.ok && result.reportId) router.push(`/report/${result.reportId}`); }); }

  return (
    <form action={submit} className="space-y-5">
      {/* Always-visible status: offline awareness + progress */}
      {!online ? (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-[#92400E]">
          <WifiOff className="mt-0.5 size-5 shrink-0" aria-hidden />
          <span>You&apos;re offline. Fill everything in now — your SOS report will send automatically the moment your connection returns.</span>
        </div>
      ) : null}
      <div aria-hidden className="flex items-center gap-2 text-xs font-bold text-[#6B5847]">
        <span className={photosDone ? "text-[#4D7C0F]" : ""}>1 Photos</span><span>·</span>
        <span>2 Condition</span><span>·</span>
        <span className={locationDone ? "text-[#4D7C0F]" : ""}>3 Location</span><span>·</span>
        <span>4 Details</span>
      </div>

      {/* 1 — Photos */}
      <section className="paw-card p-5 sm:p-6">
        <StepHeader n={1} title="Add photos" hint="1–3 photos help responders act fast." done={photosDone} />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-6 text-center transition hover:scale-[1.01] hover:bg-amber-50">
          <UploadCloud className="size-10 text-[#92400E]" aria-hidden /><span className="mt-3 text-lg font-bold">Tap to add photos</span><span className="mt-1 text-sm text-[#6B5847]">or choose from your phone</span>
        </button>
        <input ref={fileInputRef} name="photos" type="file" accept="image/*" multiple required className="sr-only" aria-label="Upload 1 to 3 photos of the animal" onChange={(event) => void handleFiles(event.target.files)} />
        <p className="mt-2 text-xs text-[#6B5847]">Photos are compressed on your phone before sending.</p>
        {previewUrls.length ? <div className="mt-4 grid grid-cols-3 gap-3">{previewUrls.map((url, i) => <img key={url} src={url} alt={`Selected photo ${i + 1}`} className="h-28 w-full rounded-2xl object-cover shadow-sm" />)}</div> : null}
      </section>

      {/* 2 — Condition */}
      <section className="paw-card p-5 sm:p-6">
        <StepHeader n={2} title="What's the situation?" />
        <fieldset>
          <legend className="sr-only">Animal condition</legend>
          <div className="grid grid-cols-2 gap-3">{conditionOptions.map((option) => <label key={option.value} className="flex min-h-[96px] cursor-pointer flex-col justify-center rounded-2xl border-2 border-[#E4D9C6] bg-[#F4EEE2]/50 p-4 transition hover:-translate-y-0.5 hover:shadow-md has-[:checked]:border-[#B45309] has-[:checked]:bg-amber-100"><input {...form.register("condition")} type="radio" value={option.value} className="sr-only" /><span className="text-3xl" aria-hidden>{option.icon}</span><span className="mt-2 block text-base font-bold">{option.label}</span><span className="text-xs text-[#6B5847]">{option.help}</span></label>)}</div>
        </fieldset>
      </section>

      {/* 3 — Location */}
      <section className="paw-card p-5 sm:p-6">
        <StepHeader n={3} title="Where is the animal?" hint="Use your location, or tap the map. Exact GPS stays private." done={locationDone} />
        <Button type="button" variant="outline" onClick={captureGps} className="w-full sm:w-auto"><LocateFixed className="size-4" aria-hidden /> Use my location</Button>
        <input type="hidden" {...form.register("lat", { valueAsNumber: true })} /><input type="hidden" {...form.register("lng", { valueAsNumber: true })} />
        <div className="mt-4 overflow-hidden rounded-2xl"><SosLocationMap lat={lat} lng={lng} onChange={setLocation} /></div>
        <label htmlFor="sos-district" className="mt-4 block text-sm font-bold">District</label>
        <select id="sos-district" {...form.register("district")} name="district" className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-white p-3">{sriLankaDistricts.map((district) => <option key={district}>{district}</option>)}</select>
        <label htmlFor="sos-landmark" className="mt-4 block text-sm font-bold">Nearest landmark <span className="font-normal text-[#6B5847]">(optional)</span></label>
        <input id="sos-landmark" {...form.register("landmark")} name="landmark" className="mt-2 w-full rounded-2xl border border-[#E4D9C6] bg-white p-3" placeholder="Near temple, school, junction…" />
      </section>

      {/* 4 — Details */}
      <section className="paw-card p-5 sm:p-6">
        <StepHeader n={4} title="What happened?" hint="Optional — a sentence helps responders prepare." />
        <label htmlFor="sos-desc" className="sr-only">Describe the situation</label>
        <textarea id="sos-desc" {...form.register("description")} name="description" rows={4} className="w-full rounded-2xl border border-[#E4D9C6] bg-white p-3" placeholder="Is the animal injured? Is it safe to approach?" />
      </section>

      {/* 5 — Contact (last, optional) */}
      <section className="paw-card p-5 sm:p-6">
        <StepHeader n={5} title="Your contact" hint="Optional — lets responders reach you. You can stay anonymous." />
        <div className="space-y-3">
          <div><label htmlFor="sos-name" className="block text-sm font-bold">Name</label><input id="sos-name" {...form.register("reporterName")} name="reporterName" autoComplete="name" className="mt-1 w-full rounded-2xl border border-[#E4D9C6] bg-white p-3" placeholder="Your name" /></div>
          <div><label htmlFor="sos-phone" className="block text-sm font-bold">Phone / WhatsApp</label><input id="sos-phone" {...form.register("reporterPhone")} name="reporterPhone" type="tel" autoComplete="tel" inputMode="tel" className="mt-1 w-full rounded-2xl border border-[#E4D9C6] bg-white p-3" placeholder="07X XXX XXXX" /></div>
          <div><label htmlFor="sos-email" className="block text-sm font-bold">Email</label><input id="sos-email" {...form.register("reporterEmail")} name="reporterEmail" type="email" autoComplete="email" inputMode="email" className="mt-1 w-full rounded-2xl border border-[#E4D9C6] bg-white p-3" placeholder="you@example.com" /></div>
        </div>
      </section>

      {/* Live status region */}
      <div aria-live="polite">
        {state.ok ? <div className="paw-card border-lime-300 bg-lime-50 p-5 text-[#3F6212]"><CheckCircle2 className="mb-2 size-8" aria-hidden /><p className="font-bold">Alert sent. Taking you to your public report…</p></div> : null}
        {state.error ? <p role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-[#BE123C]">{state.error}</p> : null}
      </div>

      {/* Sticky emergency submit — always reachable on mobile */}
      <div className="sticky bottom-20 z-30 -mx-4 border-t border-[#E4D9C6] bg-[#FBF6EC]/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button type="submit" variant="emergency" className="min-h-14 w-full animate-paw-pulse text-lg" disabled={pending}>{pending ? <><HeartPulse className="size-5 animate-pulse" aria-hidden /> Sending alert…</> : <><Siren className="size-5" aria-hidden /> Send Alert Now</>}</Button>
      </div>
    </form>
  );
}
