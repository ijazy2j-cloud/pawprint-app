"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LogOut, Menu, PawPrint, X } from "lucide-react";

const nav = [
  ["Rescue", "/sos-report"],
  ["Reunite", "/lost-found"],
  ["Adopt", "/adopt"],
  ["Community", "/community"],
] as const;

function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] ?? "Account";
}

export function CinematicNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const text = solid ? "text-[#241712]" : "text-white";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const authed = status === "authenticated";
  const loading = status === "loading";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solid ? "bg-[#FBF6EC]/95 shadow-sm backdrop-blur-md" : "bg-transparent"}`}>
      <nav aria-label="Primary" className="container flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className={`group flex min-h-12 items-center gap-3 rounded-full font-bold ${text}`}>
          <span className={`grid size-11 place-items-center rounded-full transition ${solid ? "bg-[#241712] text-[#FBF6EC]" : "bg-white/15 text-white backdrop-blur"}`}><PawPrint className="size-5" aria-hidden /></span>
          <span className="font-display text-xl tracking-tight">PawPrint</span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          {nav.map(([label, href]) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`soft-pill ${text} ${active ? "font-bold underline decoration-2 underline-offset-8 decoration-[#D97706]" : "font-medium"} ${solid ? "hover:bg-[#F4EEE2]" : "hover:bg-white/15"}`}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/dashboard" aria-current={isActive("/dashboard") ? "page" : undefined} className={`soft-pill ${text} ${isActive("/dashboard") ? "font-bold" : "font-medium"} ${solid ? "hover:bg-[#F4EEE2]" : "hover:bg-white/15"}`}>Dashboard</Link>
          {loading ? (
            <span aria-hidden className="soft-pill h-9 w-24 animate-pulse bg-white/20" />
          ) : authed ? (
            <>
              <Link href="/dashboard/profile" className={`soft-pill ${text} font-medium ${solid ? "hover:bg-[#F4EEE2]" : "hover:bg-white/15"}`}>Hi, {firstName(session?.user?.name)}</Link>
              <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="soft-pill amber-cta"><LogOut className="size-4" aria-hidden /> Sign out</button>
            </>
          ) : (
            <Link href="/login" className="soft-pill amber-cta">Sign in</Link>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`grid min-h-12 min-w-12 place-items-center rounded-full border transition md:hidden ${solid ? "border-stone-200 bg-[#F4EEE2] text-[#241712]" : "border-white/30 bg-white/10 text-white backdrop-blur"}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {open ? (
        <div id="mobile-menu" className="mx-4 mb-4 rounded-[1.5rem] border border-[#E4D9C6] bg-[#FBF6EC] p-4 shadow-2xl md:hidden">
          <nav aria-label="Mobile" className="grid gap-1">
            {[...nav, ["Dashboard", "/dashboard"] as const].map(([label, href]) => (
              <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={`min-h-12 rounded-2xl px-4 py-3 font-bold text-[#241712] hover:bg-[#F4EEE2] ${isActive(href) ? "bg-[#F4EEE2]" : ""}`}>{label}</Link>
            ))}
            {authed ? (
              <>
                <Link href="/dashboard/profile" className="min-h-12 rounded-2xl px-4 py-3 font-bold text-[#241712] hover:bg-[#F4EEE2]">Hi, {firstName(session?.user?.name)}</Link>
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex min-h-12 items-center gap-2 rounded-2xl px-4 py-3 text-left font-bold text-[#B45309] hover:bg-[#F4EEE2]"><LogOut className="size-4" aria-hidden /> Sign out</button>
              </>
            ) : (
              <Link href="/login" className="min-h-12 rounded-2xl px-4 py-3 font-bold text-[#241712] hover:bg-[#F4EEE2]">Sign in</Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
