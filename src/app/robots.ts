import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/sos-report", "/lost-found", "/adopt", "/community", "/report/"], disallow: ["/dashboard/", "/admin/", "/api/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
