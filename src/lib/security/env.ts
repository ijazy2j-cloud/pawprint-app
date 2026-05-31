import { z } from "zod";

export const requiredEnvVars = [
  "DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "RESEND_API_KEY", "RESEND_FROM_EMAIL",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "CLOUDINARY_UPLOAD_FOLDER",
] as const;

export const optionalEnvVars = ["FACEBOOK_PAGE_ACCESS_TOKEN", "TWITTER_API_KEY", "CRON_SECRET"] as const;

export function checkRequiredEnv(env: Record<string, string | undefined> = process.env) {
  const missing = requiredEnvVars.filter((key) => !env[key]);
  return { ok: missing.length === 0, missing, message: missing[0] ? `Missing required environment variable: ${missing[0]}. Check .env.example` : "ok" };
}

export function validateEnv(env: Record<string, string | undefined> = process.env) {
  const check = checkRequiredEnv(env);
  if (!check.ok) throw new Error(check.message);
  return z.object(Object.fromEntries(requiredEnvVars.map((key) => [key, z.string().min(1)])) as Record<(typeof requiredEnvVars)[number], z.ZodString>).parse(env);
}

export const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com data: blob:; connect-src 'self' https://api.cloudinary.com https://api.resend.com; font-src 'self'; frame-ancestors 'none'" },
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(self), microphone=()" },
];
