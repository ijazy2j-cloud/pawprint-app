export const metadata = { title: "Adopt a Pet in Sri Lanka — PawPrint", description: "Browse free, ethical, non-commercial pet adoption listings in Sri Lanka." };

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

import { AdoptionGallery } from "@/components/adoption/AdoptionGallery";
import { Button } from "@/components/ui/button";

export default function AdoptPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const message = typeof searchParams?.message === "string" ? searchParams.message : undefined;
  return (
    <main className="warm-shell">
      <section className="container space-y-8 py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-lime-700 via-lime-600 to-amber-500 p-7 text-white shadow-xl shadow-lime-700/20">
          <div className="absolute -right-8 -top-8 text-9xl opacity-10">🐾</div>
          <p className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur">Adopt, Don&apos;t Shop</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">Give a street animal a forever home.</h1>
          <p className="mt-4 max-w-2xl text-lg text-lime-50">Zero fees, pure love. PawPrint is strictly non-commercial — no prices, deposits, reservation fees, or sales language.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild className="bg-white text-lime-700 hover:bg-lime-50"><Link href="/adopt/list-pet"><HeartHandshake className="size-5" /> List a pet</Link></Button><Button asChild variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/20"><Link href="/dashboard/adoptions">Manage adoptions</Link></Button></div>
        </section>
        {message ? <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{message}</p> : null}
        <AdoptionGallery searchParams={searchParams} />
      </section>
    </main>
  );
}
