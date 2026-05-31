"use client";

import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const router = useRouter();
  return <div className="flex items-center gap-2 text-xs"><button className="min-h-11 rounded-full border px-3" onClick={() => { document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000"; router.refresh(); }}>EN</button><button className="min-h-11 rounded-full border px-3" onClick={() => { document.cookie = "NEXT_LOCALE=si; path=/; max-age=31536000"; router.refresh(); }}>සිංහල</button></div>;
}
