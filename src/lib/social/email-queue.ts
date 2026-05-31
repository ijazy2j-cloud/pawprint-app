import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

export type EmailTemplateName = "SOS_ALERT_TO_NGO" | "WEEKLY_DIGEST_TO_NGO" | "REUNION_NOTIFICATION" | "ADOPTION_APPLICATION_RECEIVED" | "ESCALATION_ALERT";
export type PreferenceInput = {
  emailDigestFrequency?: "INSTANT" | "DAILY" | "WEEKLY" | "NONE" | string | null;
  notifyOnSos?: boolean | null;
  notifyOnAdoptionApplication?: boolean | null;
  notifyOnReunion?: boolean | null;
};

type EmailJob = { to: string; subject: string; html: string; template: EmailTemplateName; audit?: { targetType: string; targetId: string; details?: Record<string, unknown> } };

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const queue: EmailJob[] = [];
let processing = false;

export const emailRateLimiter = {
  windowStartedAt: Date.now(),
  count: 0,
  max: 50,
  tryTake() {
    const now = Date.now();
    if (now - this.windowStartedAt >= 60_000) {
      this.windowStartedAt = now;
      this.count = 0;
    }
    if (this.count >= this.max) return false;
    this.count += 1;
    return true;
  },
  reset() {
    this.windowStartedAt = Date.now();
    this.count = 0;
  },
};

export function unsubscribeFooter(appUrl: string) {
  return `<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this from PawPrint Sri Lanka. Manage or unsubscribe from emails at <a href="${appUrl}/dashboard/settings/notifications">notification settings</a>.</p>`;
}

export function shouldSendEmailForPreference(user: PreferenceInput, type: "SOS_ALERT" | "ADOPTION_APPLICATION" | "REUNION" | "ESCALATION" | "DIGEST") {
  if (user.emailDigestFrequency === "NONE") return false;
  if ((type === "SOS_ALERT" || type === "ESCALATION" || type === "DIGEST") && user.notifyOnSos === false) return false;
  if (type === "ADOPTION_APPLICATION" && user.notifyOnAdoptionApplication === false) return false;
  if (type === "REUNION" && user.notifyOnReunion === false) return false;
  return true;
}

async function processQueue() {
  if (processing) return;
  processing = true;
  try {
    while (queue.length) {
      if (!emailRateLimiter.tryTake()) {
        await prisma.auditLog.create({ data: { actorId: null, action: "EMAIL_RATE_LIMITED", targetType: "EmailQueue", targetId: "global", details: { queued: queue.length } } }).catch(() => undefined);
        setTimeout(() => void processQueue(), 60_000);
        break;
      }
      const job = queue.shift();
      if (!job) continue;
      if (!resend) continue;
      resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? "PawPrint Sri Lanka <alerts@pawprint.lk>", to: job.to, subject: job.subject, html: job.html }).catch((error) => {
        void prisma.auditLog.create({ data: { actorId: null, action: "EMAIL_SEND_FAILED", targetType: job.audit?.targetType ?? "Email", targetId: job.audit?.targetId ?? job.to, details: { template: job.template, error: String(error) } } });
      });
    }
  } finally {
    processing = false;
  }
}

export function enqueueEmail(job: EmailJob) {
  queue.push(job);
  setTimeout(() => void processQueue(), 0);
  return { queued: true, size: queue.length };
}

export function sendEmail(job: EmailJob) {
  return enqueueEmail(job);
}
