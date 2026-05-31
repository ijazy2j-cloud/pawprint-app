export type Role = "USER" | "NGO" | "ADMIN" | "VOLUNTEER" | "FOSTERER";
export type EmailPreference = "instant" | "daily" | "weekly" | "none";

export type NavItem = { label: string; href: string; roles?: Role[] };

export const allDashboardNav: NavItem[] = [
  { label: "Dashboard Home", href: "/dashboard" },
  { label: "My Notifications", href: "/dashboard/notifications" },
  { label: "My Profile", href: "/dashboard/profile" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "SOS Alerts", href: "/dashboard/sos", roles: ["NGO"] },
  { label: "My Assignments", href: "/dashboard/assignments", roles: ["NGO"] },
  { label: "Adoption Listings", href: "/dashboard/adoptions", roles: ["NGO", "FOSTERER", "ADMIN"] },
  { label: "NGO Profile", href: "/dashboard/profile", roles: ["NGO"] },
  { label: "Nearby Alerts", href: "/dashboard/nearby", roles: ["VOLUNTEER"] },
  { label: "My Activity", href: "/dashboard/activity", roles: ["VOLUNTEER"] },
  { label: "Volunteer Profile", href: "/dashboard/profile", roles: ["VOLUNTEER"] },
  { label: "All SOS Reports", href: "/admin/sos", roles: ["ADMIN"] },
  { label: "Lost & Found Moderation", href: "/admin/lost-found", roles: ["ADMIN"] },
  { label: "Adoption Moderation", href: "/admin/adoptions", roles: ["ADMIN"] },
  { label: "Community Moderation", href: "/admin/community", roles: ["ADMIN"] },
  { label: "User Management", href: "/admin/users", roles: ["ADMIN"] },
  { label: "Analytics", href: "/admin/analytics", roles: ["ADMIN"] },
  { label: "Audit Logs", href: "/admin/audit", roles: ["ADMIN"] },
];

export function dashboardNavForRole(role: Role) {
  return allDashboardNav.filter((item) => !item.roles || item.roles.includes(role));
}

export function canAccessDashboardSection(role: Role, href: string) {
  const item = allDashboardNav.find((nav) => nav.href === href);
  if (!item) return href.startsWith("/dashboard") || (role === "ADMIN" && href.startsWith("/admin"));
  return !item.roles || item.roles.includes(role);
}

export function canViewPreciseGps(user: { role: Role; userId: string }, report: { assignedNgoId?: string | null; assignedVolunteerId?: string | null }) {
  return user.role === "ADMIN" || (user.role === "NGO" && report.assignedNgoId === user.userId) || (user.role === "VOLUNTEER" && report.assignedVolunteerId === user.userId);
}

export function notificationHref(notification: { type: string; relatedReportId?: string | null; relatedCommentId?: string | null }) {
  if (notification.relatedReportId) return `/report/${notification.relatedReportId}`;
  if (notification.type === "COMMENT_REPORT" || notification.relatedCommentId) return "/admin/community";
  if (notification.type === "ADOPTION_APPLICATION" || notification.type === "ADOPTION_REVIEW") return "/dashboard/adoptions";
  return "/dashboard/notifications";
}

export function nextEmailPreference(current: EmailPreference): EmailPreference {
  if (current === "instant") return "daily";
  if (current === "daily") return "weekly";
  if (current === "weekly") return "none";
  return "instant";
}

export function summarizeCounts<T extends { status: string }>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
}

export function maskContact(value?: string | null) {
  if (!value) return "Not provided";
  if (value.includes("@")) { const [local, domain] = value.split("@"); return `${(local ?? "").slice(0, 2)}***@${domain}`; }
  return value.length > 4 ? `***${value.slice(-4)}` : "****";
}

export function timeAgo(date: Date) {
  const diff = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
