import Link from "next/link";
import { Camera, MessageCircle, PawPrint, Share2 } from "lucide-react";

const columns = [
  ["Rescue", [["Report Emergency", "/sos-report"], ["View SOS Alerts", "/sos-report"]]],
  ["Reunite", [["Lost & Found", "/lost-found"], ["Browse Reports", "/lost-found/browse"]]],
  ["Adopt", [["Adopt a Pet", "/adopt"], ["List a Pet", "/adopt/list-pet"]]],
  ["Community", [["Happy Tails", "/community"], ["Dashboard", "/dashboard"]]],
] as const;

export function CinematicFooter() {
  return (
    <footer className="bg-[#241712] px-4 py-16 text-[#FBF6EC]">
      <div className="container space-y-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-bold"><span className="grid size-12 place-items-center rounded-full bg-[#D97706]"><PawPrint className="size-6" aria-hidden /></span><span className="font-display">PawPrint Sri Lanka</span></Link>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#FBF6EC]/80">A non-commercial rescue network built for the dogs and cats Sri Lanka forgot. We connect neighbours, NGOs, volunteers, and families so suffering animals can be reported, rescued, reunited, and rehomed without fees or gatekeeping.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map(([title, links]) => <div key={title}><h3 className="font-display font-semibold text-[#F6B864]">{title}</h3><div className="mt-3 grid gap-2 text-sm">{links.map(([label, href]) => <Link key={href} href={href} className="text-[#FBF6EC]/80 transition hover:text-white">{label}</Link>)}</div></div>)}
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-white/15 pt-8 text-sm text-[#FBF6EC]/75 md:flex-row md:items-center md:justify-between">
          <p>Made with heart for every stray in Sri Lanka. © 2026 PawPrint Sri Lanka. Forever free, forever non-profit.</p>
          <div className="flex gap-3"><Link href="https://facebook.com" aria-label="PawPrint on Facebook" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-[#B45309]"><Share2 className="size-5" aria-hidden /></Link><Link href="https://instagram.com" aria-label="PawPrint on Instagram" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-[#B45309]"><Camera className="size-5" aria-hidden /></Link><Link href="https://wa.me/?text=Help%20animals%20with%20PawPrint%20Sri%20Lanka" aria-label="Share PawPrint on WhatsApp" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-[#4D7C0F]"><MessageCircle className="size-5" aria-hidden /></Link></div>
        </div>
      </div>
    </footer>
  );
}
