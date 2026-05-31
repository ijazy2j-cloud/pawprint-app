type Base = { appUrl: string };

function shell(title: string, body: string, appUrl: string) {
  return `<!doctype html><html><body style="margin:0;background:#fff7ed;font-family:Arial,sans-serif;color:#1f2937"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px"><table role="presentation" width="640" style="max-width:640px;background:#fffaf2;border:1px solid #fed7aa;border-radius:18px;padding:24px"><tr><td><h1 style="color:#9a3412;margin:0 0 16px">🐾 PawPrint Sri Lanka</h1><h2 style="margin:0 0 18px">${title}</h2>${body}<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this from PawPrint Sri Lanka. Manage or unsubscribe from emails at <a href="${appUrl}/dashboard/settings/notifications">notification settings</a>.</p></td></tr></table></td></tr></table></body></html>`;
}

function cta(label: string, href: string) {
  return `<p><a href="${href}" style="display:inline-block;background:#ea580c;color:white;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:bold">${label}</a></p>`;
}

function image(url?: string | null, alt = "PawPrint photo") {
  return url ? `<img src="${url}" alt="${alt}" width="560" style="width:100%;max-height:280px;object-fit:cover;border-radius:16px;margin:8px 0 18px" />` : `<div style="background:#ffedd5;border-radius:16px;padding:36px;text-align:center;font-size:56px;margin:8px 0 18px">🐾</div>`;
}

export function sosAlertToNgoEmail(data: Base & { district: string; condition: string; description: string; photoUrl?: string | null; reportUrl: string; escalation?: boolean }) {
  const title = data.escalation ? `⚠️ Escalated SOS in ${data.district}` : `🚨 SOS Alert in ${data.district}`;
  return shell(title, `${data.escalation ? `<div style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:12px;font-weight:bold">No NGO responded in 4 hours. Please respond urgently.</div>` : ""}${image(data.photoUrl)}<p><strong>Condition:</strong> ${data.condition}</p><p><strong>District:</strong> ${data.district}</p><p>${data.description.slice(0, 240)}</p>${cta("View Full Report", data.reportUrl)}<p style="color:#78716c;font-size:13px">You're receiving this because your NGO covers ${data.district} or this report was escalated island-wide.</p>`, data.appUrl);
}

export function weeklyDigestToNgoEmail(data: Base & { openAlerts: number; rescued: number; volunteerSignups: number; reports: Array<{ district: string; condition?: string | null; url: string; photo?: string | null }> }) {
  const cards = data.reports.slice(0, 5).map((r) => `<tr><td style="padding:8px;border-top:1px solid #fed7aa">${r.photo ? `<img src="${r.photo}" width="64" height="64" style="border-radius:10px;object-fit:cover"/>` : "🐾"}</td><td style="padding:8px;border-top:1px solid #fed7aa"><strong>${r.condition ?? "SOS"}</strong><br/>${r.district}</td><td style="padding:8px;border-top:1px solid #fed7aa"><a href="${r.url}">View</a></td></tr>`).join("");
  return shell(`PawPrint Weekly Digest: ${data.openAlerts} open alerts`, `<p><strong>${data.openAlerts}</strong> open alerts this week • <strong>${data.rescued}</strong> rescued • <strong>${data.volunteerSignups}</strong> new volunteers</p><table width="100%">${cards}</table>`, data.appUrl);
}

export function reunionNotificationEmail(data: Base & { petName: string; date: string; photoUrl?: string | null; communityUrl: string }) {
  return shell(`Great news! ${data.petName} has been reunited 🎉`, `${image(data.photoUrl)}<p>${data.petName} was reunited with their family on ${data.date}. Thanks to the PawPrint community!</p>${cta("Share this happy story", data.communityUrl)}`, data.appUrl);
}

export function adoptionApplicationReceivedEmail(data: Base & { petName: string; applicantName: string; livingSituation: string; experience: string; phone: string; email: string; dashboardUrl: string }) {
  return shell(`New adoption application for ${data.petName}`, `<p><strong>Applicant:</strong> ${data.applicantName}</p><p><strong>Living situation:</strong> ${data.livingSituation}</p><p><strong>Experience:</strong> ${data.experience}</p><p><strong>Contact:</strong> ${data.phone} / ${data.email}</p>${cta("Review Application", data.dashboardUrl)}`, data.appUrl);
}

export function escalationAlertEmail(data: Parameters<typeof sosAlertToNgoEmail>[0]) {
  return sosAlertToNgoEmail({ ...data, escalation: true });
}
