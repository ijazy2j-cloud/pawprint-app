"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Home, MessageCircle, Search, Siren } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/sos-report", label: "Rescue", icon: Siren },
  { href: "/lost-found", label: "Reunite", icon: Search },
  { href: "/adopt", label: "Adopt", icon: HeartHandshake },
  { href: "/community", label: "Stories", icon: MessageCircle },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#E4D9C6] bg-[#FBF6EC]/95 shadow-2xl shadow-stone-950/10 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${active ? "text-[#B45309]" : "text-[#241712]/70"}`}>
            <Icon className="size-5" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
