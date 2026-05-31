import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const has = (file: string, text: string) => assert.ok(read(file).includes(text), `${file} should include ${text}`);

has("src/components/home/CinematicHome.tsx", "Every Paw Matters");
has("src/app/page.tsx", "CinematicHome");
has("src/app/page.tsx", "prisma.petReport.count");
has("src/app/page.tsx", "prisma.communityPost.findMany");

has("src/components/home/CinematicHome.tsx", "min-h-screen");
has("src/components/home/CinematicHome.tsx", "CinematicHero");
has("src/components/home/CinematicHome.tsx", "LiveRescueTicker");
has("src/components/home/CinematicHome.tsx", "This Month&apos;s Impact");
has("src/components/home/CinematicHome.tsx", "Happy Tails");
has("src/components/home/CinematicHome.tsx", "UrgentSosStrip");
has("src/components/home/CinematicHome.tsx", "images.unsplash.com/photo-1548199973-03cce0bbc87b");
has("src/components/home/CinematicHome.tsx", "PhotoCard");
has("src/components/home/CinematicHome.tsx", "framer-motion");
has("src/components/home/CinematicHome.tsx", "priority");

has("src/app/globals.css", "--deep-earth: #2C1810");
has("src/app/globals.css", "--cream-parchment: #FDF6E3");
has("src/app/globals.css", "prefers-reduced-motion");
has("src/app/globals.css", "animate-rescue-ticker");
has("src/app/globals.css", "focus-visible");

has("src/app/layout.tsx", "Playfair_Display");
has("src/app/layout.tsx", "CinematicNav");
has("src/app/layout.tsx", "CinematicFooter");
has("src/app/layout.tsx", "MobileBottomNav");

has("src/components/layout/CinematicNav.tsx", "scrollY");
has("src/components/layout/CinematicNav.tsx", "bg-[#FDF6E3]/95");
has("src/components/layout/CinematicNav.tsx", "Rescue");
has("src/components/layout/CinematicNav.tsx", "Reunite");
has("src/components/layout/CinematicNav.tsx", "Adopt");
has("src/components/layout/CinematicNav.tsx", "Community");
has("src/components/layout/CinematicFooter.tsx", "Forever free, forever non-profit");

has("src/components/MobileBottomNav.tsx", "Siren");
has("src/components/MobileBottomNav.tsx", "Search");
has("src/components/MobileBottomNav.tsx", "HeartHandshake");
has("src/components/MobileBottomNav.tsx", "MessageCircle");

has("src/components/sos/SosReportForm.tsx", "Send Alert Now");
has("src/components/sos/SosReportForm.tsx", "Drop photos here");
has("src/components/lost-found/LostFoundBrowse.tsx", "No lost pets reported");
has("src/components/adoption/AdoptionGallery.tsx", "No pets available right now");
has("src/components/community/ReactionBar.tsx", "active:scale-125");

has("prisma/seed.ts", "images.unsplash.com/photo-1587300003388-59208cc962cb");
has("prisma/seed.ts", "images.unsplash.com/photo-1514888286974-6c03e2ca1dba");

console.log("Cinematic visual verification checks passed");
