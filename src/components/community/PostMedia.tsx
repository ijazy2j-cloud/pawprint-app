"use client";

import { useState } from "react";

export function StoryText({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = content.length > 180;
  const shown = expanded || !shouldTruncate ? content : `${content.slice(0, 180)}…`;
  return <p className="whitespace-pre-wrap text-sm leading-6">{shown} {shouldTruncate ? <button type="button" className="font-medium text-primary" onClick={() => setExpanded(!expanded)}>{expanded ? "Show less" : "Read more"}</button> : null}</p>;
}

export function PhotoCarousel({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  return <div className="relative"><img src={photos[index]} alt={photos.length > 1 ? `${alt} — photo ${index + 1} of ${photos.length}` : alt} loading="lazy" className="h-64 w-full rounded-xl object-cover" />{photos.length > 1 ? <div className="absolute bottom-1 left-0 right-0 flex justify-center">{photos.map((_, i) => <button key={i} type="button" aria-label={`Show photo ${i + 1}`} aria-current={i === index} className="grid size-6 place-items-center" onClick={() => setIndex(i)}><span className={`block size-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} /></button>)}</div> : null}</div>;
}
