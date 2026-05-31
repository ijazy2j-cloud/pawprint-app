# PawPrint Sri Lanka — Master Design System

> Global Source of Truth. Page-specific deviations live in `design-system/pages/<page>.md` and **override** this file.
> Product: Free, non-commercial emergency animal rescue + adoption platform for Sri Lanka.
> Personality: **Warm · Trustworthy · Calm · Clear.** Not corporate, not childish. People arrive in stressful moments — clarity and speed beat decoration.

---

## 1. Design Principles (the spine of every decision)

1. **Calm under stress.** The SOS path must be readable, large, and forgiving. No clever layouts on critical flows.
2. **Earthen warmth, not candy.** Colour comes from soil, sun, and leaf — shelter tones, not neon. Saturation is held back so red can always mean *emergency*.
3. **One clear action per screen.** Every page has a single obvious primary action; everything else recedes.
4. **Trust through transparency.** Show status plainly (who's helping, what stage, GPS-protected). Never hide state.
5. **Legible first.** 16px+ body, generous line-height, real labels, AA contrast everywhere. Accessibility is a public-service requirement, not a polish step.

---

## 2. Colour System

Earth-and-sun palette tuned so every text/background pair meets **WCAG AA (4.5:1)** and red is reserved for genuine emergencies.

### Brand ramps
| Token | Hex | Use |
|---|---|---|
| `earth-900` | `#241712` | Primary ink / darkest surfaces |
| `earth-800` | `#2C1B14` | Dark sections, footer, hero overlay |
| `earth-700` | `#4A3527` | Secondary ink on cream |
| `amber-600` | `#D97706` | **Brand accent** — decorative, icons, glows (NOT for text-on-white) |
| `amber-700` | `#B45309` | **Primary action** (white text = 4.8:1 ✓) |
| `amber-800` | `#92400E` | Pressed / hover-deepen, amber text on cream |
| `sage-700` | `#4D7C0F` | **Success / Safe / Rescued** action (white text = 4.7:1 ✓) |
| `sage-600` | `#65A30D` | Sage accent, decorative |
| `rose-700` | `#BE123C` | **Emergency / SOS** action (white text = 6.0:1 ✓) |
| `rose-600` | `#E11D48` | Live/urgent pulse accent (large/graphical only) |
| `cyan-700` | `#0E7490` | Info / Matched / Reunited status text |

### Neutrals (warm stone, not cold gray)
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FBF6EC` | App background (warm cream) |
| `surface` | `#FFFFFF` | Cards on cream |
| `sand` | `#F4EEE2` | Secondary surface / muted panels |
| `line` | `#E4D9C6` | Borders & dividers (visible on cream AND white) |
| `muted-ink` | `#6B5847` | Helper / secondary text on cream (4.6:1 ✓) |

### Semantic tokens (use these in code, never raw hex in components)
```
--ds-bg            #FBF6EC   /* canvas */
--ds-surface       #FFFFFF
--ds-surface-2     #F4EEE2
--ds-ink           #241712   /* body text, 14:1 on canvas */
--ds-ink-muted     #6B5847   /* secondary text */
--ds-line          #E4D9C6
--ds-primary       #B45309   /* amber action  */
--ds-primary-press #92400E
--ds-accent        #D97706   /* decorative amber */
--ds-emergency     #BE123C   /* SOS action */
--ds-emergency-hi  #E11D48   /* pulse only */
--ds-success       #4D7C0F   /* safe/rescued */
--ds-info          #0E7490   /* matched/reunited */
--ds-focus         #B45309   /* focus ring */
```

### Status → colour map (used on report/adoption badges)
| Status | Token | Text colour |
|---|---|---|
| REPORTED | amber tint | `#92400E` |
| NGO_NOTIFIED / VOLUNTEER_ASSIGNED | cyan tint | `#0E7490` |
| ESCALATED | rose tint | `#BE123C` |
| RESCUED / SAFE / REUNITED / MATCHED | sage tint | `#3F6212` |

**Anti-patterns:** ❌ white text on `amber-600`/`rose-600`/`sage-600` for body-size text (fails AA). ❌ red used decoratively (dilutes emergency meaning). ❌ cold gray neutrals (breaks warmth).

---

## 3. Typography

**Avoids Inter / Roboto and the purple-on-white look.** Humanist + soft-serif pairing that reads as warm and credible. Sinhala script is first-class (the product ships an `si` locale).

| Role | Family | Notes |
|---|---|---|
| Display / Headings | **Fraunces** (variable, opsz) | Soft, warm "old-style" serif. Trust + character without luxury-fashion coldness. Weights 500–700, slight optical softness. |
| Body / UI | **Hanken Grotesk** (variable) | Friendly humanist sans, excellent legibility at small sizes. Replaces Inter. |
| Sinhala | **Noto Sans Sinhala** | Auto-applies to Sinhala runs via font stack; keeps `si` locale legible. |
| Numerals in data | Hanken Grotesk `font-variant-numeric: tabular-nums` | Prevents shift in counts, GPS, timers. |

Font stacks:
```
--font-display: "Fraunces", Georgia, "Noto Serif", serif;
--font-sans: "Hanken Grotesk", "Noto Sans Sinhala", system-ui, sans-serif;
```

### Type scale (1.25 major-third-ish, clamped for fluid)
| Step | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| Display | `clamp(2.5rem, 6vw, 4.5rem)` | 1.05 | 600 | Hero |
| H1 | `clamp(2rem, 4vw, 3rem)` | 1.1 | 600 | Page titles |
| H2 | `1.75rem` | 1.15 | 600 | Section |
| H3 | `1.25rem` | 1.25 | 600 | Card titles |
| Body-lg | `1.125rem` | 1.6 | 400 | Lead paragraphs |
| Body | `1rem` (16px) | 1.6 | 400 | Default |
| Small | `0.875rem` | 1.5 | 500 | Labels, meta |
| Micro | `0.75rem` | 1.4 | 600 | Pills, captions (never body) |

Rules: body ≥16px (no iOS zoom); line-length 60–75ch desktop / 35–60 mobile; headings 600 (avoid 800 "shouty" weights except the emergency CTA); `font-display: swap`.

---

## 4. Spacing, Radius, Elevation

**Spacing** — 4px base, 8px rhythm: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Section vertical rhythm tiers: 16 / 24 / 32 / 48.

**Radius scale** (friendly, not bubbly):
```
--r-sm: 0.5rem    /* inputs, small chips */
--r-md: 0.875rem  /* buttons */
--r-lg: 1.25rem   /* cards */
--r-xl: 1.75rem   /* hero panels, feature cards */
--r-pill: 9999px  /* status pills, nav pills */
```

**Elevation** (warm-tinted shadows, consistent scale — no random values):
```
--e-1: 0 1px 2px rgba(36,23,18,.06), 0 1px 3px rgba(36,23,18,.10)
--e-2: 0 4px 12px rgba(36,23,18,.08)
--e-3: 0 12px 32px rgba(36,23,18,.12)
--e-cta: 0 8px 24px rgba(180,83,9,.28)   /* amber primary lift */
--e-sos: 0 8px 24px rgba(190,18,60,.30)  /* emergency lift */
```

---

## 5. Components

### Buttons (44px+ touch target, 150–250ms ease-out)
| Variant | Fill | Text | Use |
|---|---|---|---|
| **Primary** | `--ds-primary` (#B45309) | white | Default action |
| **Emergency** | `--ds-emergency` (#BE123C) | white | Send SOS, report animal |
| **Success** | `--ds-success` (#4D7C0F) | white | Mark safe / I can help |
| **Outline** | transparent + `--ds-line` border | ink | Secondary |
| **Ghost** | transparent | ink | Tertiary / nav |

States: hover = deepen + `--e-cta`/scale 1.01; active = scale .98; disabled = opacity .5 + `not-allowed`; focus-visible = 2px ring `--ds-focus` + 2px offset. Loading = spinner + disabled + keep label width.

### Cards (`paw-card`)
Surface white on cream, `--r-lg`, `--ds-line` border, `--e-1`, hover lifts to `--e-3` + `-translate-y-1`. Faint paw watermark at low opacity (≤5%). 24px padding.

### Inputs
≥44px height, `--r-sm`, `--ds-line` border, white surface, **visible label above** (never placeholder-only), helper text below, error below in `--ds-emergency` with icon + `role="alert"`. Focus = `--ds-focus` ring. Use semantic `type=` (email/tel) for correct mobile keyboards.

### Status pills
`--r-pill`, micro weight 600, tinted bg + AA-passing text per §2 status map. Always pair colour with a text label (never colour alone).

### Navigation
- Desktop: translucent top bar → solid `canvas` on scroll; pill links; current route highlighted (amber underline/weight).
- Mobile: bottom nav ≤5 items, icon **+ label**, active in `--ds-primary`, safe-area padding.

---

## 6. Motion

Durations 150–300ms; enter ease-out, exit ease-in (~70% of enter). Animate `transform`/`opacity` only. Stagger lists 30–50ms. One–two animated elements per view. **Always** respect `prefers-reduced-motion` (already globally handled in `globals.css`). The emergency pulse on the SOS button is the one sanctioned "attention" animation.

---

## 7. Accessibility Baseline (non-negotiable)

- Contrast: 4.5:1 text / 3:1 large & UI glyphs — verified for every token pair in §2.
- Visible focus on **every** interactive element (2px ring, never removed).
- Real `<label for>`; errors `role="alert"` + focus first invalid field; error summary for multi-error forms.
- Alt text on meaningful images; `aria-label` on icon-only buttons; decorative images `alt=""`.
- Sequential headings h1→h6, no skips. One h1 per page.
- Colour never the sole signal (status = colour + text/icon).
- Keyboard: tab order = visual order; modals trap + ESC + restore focus; skip-to-content link.
- Honour Dynamic Type / zoom; no `maximum-scale`.

---

## 8. Page Hooks (where overrides will live)

`home · login · sos-report · lost-found · adopt · community · dashboard · admin`.
The **SOS report** page is the highest-stakes flow — see `design-system/pages/sos-report.md` for its stricter rules (bigger targets, fewer choices, persistent progress, offline-aware).
The **admin** surface intentionally uses a darker, denser variant — see `design-system/pages/admin.md`.
