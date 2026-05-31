import { strict as assert } from "node:assert";

import { dashboardNavForRole, canAccessDashboardSection, canViewPreciseGps, notificationHref, nextEmailPreference, summarizeCounts } from "../src/lib/dashboard/helpers";

assert(dashboardNavForRole("USER").some((item) => item.href === "/dashboard/notifications"));
assert(dashboardNavForRole("NGO").some((item) => item.href === "/dashboard/sos"));
assert(dashboardNavForRole("VOLUNTEER").some((item) => item.href === "/dashboard/nearby"));
assert(dashboardNavForRole("ADMIN").some((item) => item.href === "/admin/analytics"));

assert.equal(canAccessDashboardSection("USER", "/dashboard/sos"), false);
assert.equal(canAccessDashboardSection("NGO", "/dashboard/sos"), true);
assert.equal(canAccessDashboardSection("VOLUNTEER", "/dashboard/activity"), true);
assert.equal(canAccessDashboardSection("ADMIN", "/admin/users"), true);

assert.equal(canViewPreciseGps({ role: "ADMIN", userId: "a" }, { assignedNgoId: null, assignedVolunteerId: null }), true);
assert.equal(canViewPreciseGps({ role: "NGO", userId: "ngo1" }, { assignedNgoId: "ngo1", assignedVolunteerId: null }), true);
assert.equal(canViewPreciseGps({ role: "VOLUNTEER", userId: "v1" }, { assignedNgoId: null, assignedVolunteerId: "v1" }), true);
assert.equal(canViewPreciseGps({ role: "USER", userId: "u1" }, { assignedNgoId: "ngo1", assignedVolunteerId: "v1" }), false);

assert.equal(notificationHref({ relatedReportId: "r1", type: "SOS_ALERT" }), "/report/r1");
assert.equal(notificationHref({ relatedCommentId: "c1", type: "COMMENT_REPORT" }), "/admin/community");
assert.equal(notificationHref({ type: "SYSTEM" }), "/dashboard/notifications");

assert.equal(nextEmailPreference("daily"), "weekly");
assert.equal(nextEmailPreference("weekly"), "none");
assert.equal(nextEmailPreference("none"), "instant");

assert.deepEqual(summarizeCounts([{ status: "REPORTED" }, { status: "SAFE" }, { status: "REPORTED" }]), { REPORTED: 2, SAFE: 1 });

console.log("Dashboard verification checks passed");
