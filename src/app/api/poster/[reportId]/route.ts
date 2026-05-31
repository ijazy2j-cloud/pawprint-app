import React from "react";
import { NextResponse } from "next/server";
import { Document, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", backgroundColor: "#fff7ed" },
  brand: { fontSize: 18, fontWeight: 700, color: "#14532d", marginBottom: 8 },
  header: { fontSize: 54, fontWeight: 900, color: "#b91c1c", textAlign: "center", marginVertical: 10 },
  photo: { width: "100%", height: 330, objectFit: "cover", borderRadius: 14, marginVertical: 12 },
  petName: { fontSize: 34, fontWeight: 800, textAlign: "center", color: "#111827" },
  text: { fontSize: 16, color: "#1f2937", marginTop: 8, lineHeight: 1.35 },
  contact: { marginTop: 16, padding: 14, backgroundColor: "#fee2e2", borderRadius: 12, textAlign: "center", fontSize: 22, fontWeight: 800, color: "#7f1d1d" },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 12, color: "#6b7280", textAlign: "center" },
});

function PosterDocument({ report, url }: { report: Awaited<ReturnType<typeof prisma.petReport.findUnique>>; url: string }) {
  if (!report) return null;
  const location = `${report.district}${report.landmark ? `, near ${report.landmark}` : ""}`;
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.brand }, "🐾 PawPrint Sri Lanka"),
      React.createElement(Text, { style: styles.header }, "MISSING"),
      report.photos[0] ? React.createElement(Image, { src: report.photos[0], style: styles.photo }) : null,
      React.createElement(Text, { style: styles.petName }, report.petName || "Lost pet"),
      React.createElement(Text, { style: styles.text }, `Species: ${report.species || "Pet"}  •  Colour: ${report.color || "Unknown"}  •  Size: ${report.size || "Unknown"}`),
      React.createElement(Text, { style: styles.text }, `Last seen: ${location}`),
      React.createElement(Text, { style: styles.text }, report.description),
      React.createElement(Text, { style: styles.contact }, `Contact: ${report.reporterPhone || report.reporterEmail || "Open report online"}`),
      React.createElement(Text, { style: styles.text }, `Report page: ${url}`),
      React.createElement(Text, { style: styles.footer }, "Free non-commercial pet rescue coordination • Exact GPS remains private • pawprint.lk"),
    ),
  );
}

export async function GET(_request: Request, { params }: { params: { reportId: string } }) {
  const report = await prisma.petReport.findUnique({ where: { id: params.reportId } });
  if (!report || report.type !== "LOST") return NextResponse.json({ error: "Missing pet report not found." }, { status: 404 });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const publicUrl = `${baseUrl}/report/${report.id}`;
  const buffer = await pdf(React.createElement(PosterDocument, { report, url: publicUrl }) as any).toBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pawprint-missing-${report.id}.pdf"`,
    },
  });
}
