import { LRUCache } from "lru-cache";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REPORTS = 3;

const reportRateLimit = new LRUCache<string, number[]>({
  max: 5000,
  ttl: WINDOW_MS,
});

export function checkSosRateLimit(ip: string) {
  const now = Date.now();
  const recent = (reportRateLimit.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= MAX_REPORTS) {
    const resetAt = new Date(recent[0] + WINDOW_MS);
    return { allowed: false, remaining: 0, resetAt };
  }

  recent.push(now);
  reportRateLimit.set(ip, recent);
  return { allowed: true, remaining: MAX_REPORTS - recent.length, resetAt: new Date(now + WINDOW_MS) };
}
