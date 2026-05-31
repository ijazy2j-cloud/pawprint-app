"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { createCommunityPost, type CommunityActionState } from "@/app/community/actions";
import { Button } from "@/components/ui/button";

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((item) => resolve(item ?? file), "image/webp", 0.8));
  return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
}

export function CommunityPostForm() {
  const ref = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<CommunityActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  const [previews, setPreviews] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  async function handleFiles(files: FileList | null) {
    if (!files || !ref.current) return;
    const picked = Array.from(files).slice(0, 3);
    const compressed = await Promise.all(picked.map(compressImage));
    const dt = new DataTransfer();
    compressed.forEach((file) => dt.items.add(file));
    ref.current.files = dt.files;
    setPreviews(compressed.map((file) => URL.createObjectURL(file)));
  }

  function submit(formData: FormData) {
    setState({ ok: false });
    startTransition(async () => setState(await createCommunityPost({ ok: false }, formData)));
  }

  return (
    <form action={submit} className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm">
      <label className="block text-sm font-semibold">Photos, optional max 3<input ref={ref} name="photos" type="file" accept="image/*" multiple className="mt-2 w-full rounded-md border p-3" onChange={(e) => void handleFiles(e.target.files)} /></label>
      {previews.length ? <div className="grid grid-cols-3 gap-2">{previews.map((url, i) => <img key={url} src={url} alt={`Story preview ${i + 1}`} className="h-28 w-full rounded-xl object-cover" />)}</div> : null}
      <label className="block text-sm font-semibold">Story<textarea name="content" required maxLength={500} rows={7} className="mt-2 w-full rounded-md border p-3" onChange={(e) => setCount(e.target.value.length)} placeholder="Tell us the happy tail..." /></label>
      <p className="text-right text-xs text-muted-foreground">{count}/500</p>
      <label className="block text-sm font-semibold">Tag<select name="tag" className="mt-2 w-full rounded-md border p-3"><option value="">No tag</option><option value="RESCUE">Rescue</option><option value="ADOPTION">Adoption</option><option value="REUNION">Reunion</option><option value="DAILY_JOY">Daily Joy</option></select></label>
      <div aria-live="polite">
        {state.error ? <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-[#BE123C]">{state.error}</p> : null}
        {state.ok && state.postId ? <p className="rounded-xl border border-lime-300 bg-lime-50 p-3 text-sm font-semibold text-[#3F6212]">Story posted. <Link className="underline" href={`/community/post/${state.postId}`}>Open story</Link></p> : null}
      </div>
      <Button className="w-full" disabled={pending}>{pending ? "Posting…" : "Share story"}</Button>
    </form>
  );
}
