import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import * as net from "node:net";
import * as path from "node:path";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HealthState = "connected" | "disconnected";

async function databaseHealth(): Promise<HealthState> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "connected";
  } catch {
    return "disconnected";
  }
}

async function redisHealth(): Promise<HealthState> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return "disconnected";
  try {
    const parsed = new URL(redisUrl);
    await new Promise<void>((resolve, reject) => {
      const socket = net.createConnection({ host: parsed.hostname, port: Number(parsed.port || 6379) });
      const timer = setTimeout(() => { socket.destroy(); reject(new Error("timeout")); }, 1200);
      socket.once("connect", () => socket.write("*1\r\n$4\r\nPING\r\n"));
      socket.once("data", () => { clearTimeout(timer); socket.end(); resolve(); });
      socket.once("error", reject);
    });
    return "connected";
  } catch {
    return "disconnected";
  }
}

async function appVersion() {
  try {
    const pkg = JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8"));
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export async function GET() {
  const [database, redis, version] = await Promise.all([databaseHealth(), redisHealth(), appVersion()]);
  const status = database === "connected" ? "ok" : "degraded";
  return NextResponse.json({ status, timestamp: new Date().toISOString(), version, database, redis });
}
