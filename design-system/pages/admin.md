# Page Override — Admin & Dense Dashboards (`/admin/*`)

> Overrides `MASTER.md` for moderation/ops surfaces used by staff for long sessions. Density and scannability over warmth.

## Deviations from Master
- **Darker shell.** Sidebar/chrome use `earth-900`/slate-dark; content panels stay on `canvas` for readability. Already partially implemented in `DashboardShell` (admin branch).
- **Denser spacing.** Drop section rhythm to 12 / 16 / 24; table rows compact.
- **Tabular numerals everywhere** for counts, GPS, timestamps.
- **Data tables**: sortable headers with `aria-sort`, zebra rows in warm sand tint, sticky header, horizontal scroll contained (not page-level).
- **Destructive actions** (spam, suspend, delete) use `--ds-emergency`, visually separated from neutral actions, with confirm + undo where feasible.
- **Status pills** reuse the Master status→colour map so a report looks identical in admin and public views.

## Keep from Master
Contrast ratios (verify text on dark sidebar ≥4.5:1), focus rings, type families, accessible status semantics.
