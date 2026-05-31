import Link from "next/link";

export default function NotFound() {
  return <main className="container grid min-h-[70vh] place-items-center py-16"><section className="max-w-lg rounded-3xl border bg-card p-8 text-center"><div className="text-6xl">🐾</div><h1 className="mt-4 text-3xl font-bold">Page not found</h1><p className="mt-3 text-muted-foreground">This PawPrint trail went cold.</p><Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-amber-500 px-5 font-semibold text-white">Back home</Link></section></main>;
}
