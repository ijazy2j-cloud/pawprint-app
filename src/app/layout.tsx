import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://pawprint-app.netlify.app";
const SITE_DESCRIPTION =
  "PawPrint Sri Lanka is a free, non-commercial network to report, rescue, reunite, and rehome dogs and cats across Sri Lanka.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PawPrint Sri Lanka",
  description: SITE_DESCRIPTION,
  applicationName: "PawPrint Sri Lanka",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "PawPrint Sri Lanka",
    title: "PawPrint Sri Lanka",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PawPrint Sri Lanka — free pet rescue network" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawPrint Sri Lanka",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = { themeColor: "#B45309" };

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
