"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="grid min-h-screen place-items-center bg-orange-50 p-6 font-sans">
        <main className="max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">🐾</div>
          <h1 className="mt-4 text-3xl font-bold">Something went wrong.</h1>
          <p className="mt-3 text-neutral-600">PawPrint hit a small snag. Please retry or head back home.</p>
          <div className="mt-6 flex justify-center gap-3"><button className="min-h-11 rounded-full bg-amber-500 px-5 font-semibold text-white" onClick={reset}>Retry</button><Link className="inline-flex min-h-11 items-center rounded-full border px-5 font-semibold" href="/">Home</Link></div>
        </main>
      </body>
    </html>
  );
}
