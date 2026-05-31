import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Noto_Sans_Sinhala } from "next/font/google";

import { CinematicFooter } from "@/components/layout/CinematicFooter";
import { CinematicNav } from "@/components/layout/CinematicNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Providers } from "@/components/Providers";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import "./globals.css";

// Body / UI — friendly humanist sans (replaces Inter)
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Display / headings — warm soft serif (replaces Playfair)
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
// First-class Sinhala support for the `si` locale
const sinhala = Noto_Sans_Sinhala({ subsets: ["sinhala"], variable: "--font-sinhala", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "PawPrint Sri Lanka — Rescue, Reunite, Adopt",
  description: "A free, non-commercial community platform for reporting abandoned pets, finding lost animals, and adopting pets in Sri Lanka. No sales, just compassion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${sinhala.variable}`}>
      <body className="min-h-screen bg-[#FBF6EC] pb-20 font-sans text-[#241712] md:pb-0">
        <Providers>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <CinematicNav />
          <div id="main-content">{children}</div>
          <CinematicFooter />
          <PwaInstallPrompt />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
