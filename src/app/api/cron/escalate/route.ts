import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { escalateStaleSosReports } from "@/lib/social/escalation";

async function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("x-cron-secret") === secret) return { actorId: null };
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") return { actorId: session.user.id };
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await authorized(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await escalateStaleSosReports(auth.actorId);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
