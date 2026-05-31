"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setEvent(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!event) return null;
  return <button className="fixed bottom-20 right-4 z-50 hidden rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg md:block" onClick={async () => { await event.prompt(); setEvent(null); }}>Install PawPrint</button>;
}
