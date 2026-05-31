import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

import { ogBadgeColors, type OgType } from "@/lib/social/og";

export const runtime = "edge";

const validTypes = new Set(["sos", "lost", "found", "adopt", "community"]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "community") as OgType;
  const safeType = validTypes.has(type) ? type : "community";
  const title = (searchParams.get("title") || "PawPrint Sri Lanka").slice(0, 120);
  const district = (searchParams.get("district") || "Sri Lanka").slice(0, 80);
  const status = (searchParams.get("status") || safeType.toUpperCase()).replaceAll("_", " ").slice(0, 40);
  const photo = searchParams.get("photo");
  const colors = ogBadgeColors(safeType);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fff7ed", color: "#1f2937", fontFamily: "Inter, Arial, sans-serif", padding: 54, position: "relative" }}>
        <div style={{ position: "absolute", right: 40, bottom: 18, fontSize: 170, opacity: 0.08 }}>🐾</div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", border: "4px solid #fed7aa", borderRadius: 36, background: "#fffaf2", padding: 38 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 32, fontWeight: 800, color: "#9a3412" }}><span>🐾</span><span>PawPrint Sri Lanka</span></div>
            <div style={{ padding: "12px 22px", borderRadius: 999, background: colors.bg, color: colors.fg, border: `2px solid ${colors.border}`, fontSize: 24, fontWeight: 800 }}>{status}</div>
          </div>
          <div style={{ display: "flex", gap: 42, flex: 1, alignItems: "center" }}>
            <div style={{ width: 400, height: 400, borderRadius: 32, background: "#ffedd5", border: "4px solid #fdba74", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 112 }}>
              {photo ? <img src={photo} alt="PawPrint pet photo" width={400} height={400} style={{ objectFit: "cover", width: 400, height: 400 }} /> : <span>🐶</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
              <div style={{ fontSize: 64, lineHeight: 1.04, fontWeight: 900, letterSpacing: -2 }}>{title}</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#78716c", fontSize: 32 }}><span>📍</span><span>{district}</span></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#9a3412", fontWeight: 700 }}><span>Click to Help</span><span>pawprint.lk</span></div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
