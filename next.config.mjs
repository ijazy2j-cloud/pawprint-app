import withPWAInit from "next-pwa";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: { document: "/offline" },
  runtimeCaching: [
    { urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i, handler: "CacheFirst", options: { cacheName: "cloudinary-images", expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } } },
    { urlPattern: /\.(?:js|css|woff2)$/i, handler: "StaleWhileRevalidate", options: { cacheName: "static-assets" } },
  ],
});

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org data: blob:",
  "connect-src 'self' https://api.cloudinary.com https://api.resend.com https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
  "font-src 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }, { protocol: "https", hostname: "images.unsplash.com" }] },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Content-Security-Policy", value: csp },
      { key: "Permissions-Policy", value: "geolocation=(self), camera=(self), microphone=()" },
    ] }];
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
