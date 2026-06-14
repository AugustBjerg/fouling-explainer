# Act 1 — Design Spec
> Status: draft / in progress. Iterate here before handing to implementation agent.

---

## Concept

Scrollytelling. The ship illustration is **fixed on screen** — it does not move or scroll.
Scrolling triggers state changes: text swaps in/out in the sky zone. The hull does **not
change appearance** across any scroll state in Act 1 — it stays clean throughout. Hull
fouling is reserved for the Act 2 interactive.

---

## Layout

- **Sky zone (top ~55–60%):** text lives here. Enlarged sky gives generous text room.
  Light background, high contrast. White or light grey type. No background box or card —
  placement alone handles contrast. Text anchored **top-left**.
- **Hull/water zone (bottom ~40–45%):** the ship illustration. Static throughout Act 1.
- **Scroll indicator:** sits just below the waterline, subtle. Not in the sky zone.
  Suggest a thin animated line or a faint "scroll" label with a downward chevron.
  Low opacity — present but not demanding.

---

## Scroll states

### State 0 — Initial
- Clean ship, static.
- Headline fades in: *"The ocean is slowly eating your fuel budget."*
- Scroll indicator visible below the waterline.

### State 1 — Beat 1 (Biofouling)
- **Text:** "Below the waterline, marine life — slime, then algae, then barnacles — grows
  on the hull. This is biofouling. It increases drag, forcing the engine to burn more fuel
  to hold the same speed."
- **Hull:** unchanged, clean.

### State 2 — Beat 2 (The bill)
- **Text:** "The cost is not trivial. Industry-wide, biofouling adds an estimated
  USD 30 billion a year and accounts for around 10% of shipping's total greenhouse-gas
  emissions."
- **Hull:** unchanged, clean.

### State 3 — Beat 3 (The measurement problem)
- **Text:** "The problem: you can't see fouling from the bridge, and traditional methods
  for measuring it are imprecise or impractical at scale. The fouling signal hides inside
  speed, load, and weather — all tangled together."
- **Hull:** unchanged, clean.
- **Note:** the ship illustration IS the bridge-view framing. The point lands through the
  framing itself — no extra visual needed.

### State 4 — Beat 4 (The opportunity)
- **Text:** "But recent improvements in the quality and availability of operational data
  have opened the door to machine learning. I used ML to quantify biofouling on a real
  vessel and tested whether the results were reliable enough to be useful in practice."
- **Hull:** unchanged, clean.

### State 5 — Transition / CTA
- Scroll indicator disappears.
- A **"Dive deeper"** prompt appears — styled as a button or prominent text link.
- Clicking/tapping advances to Act 2.
- **Hull:** resets to clean for Act 2 (should already be clean, but confirm on
  implementation). The Act 2 slider starts from Day 0 — the visitor drags into the
  fouling themselves.

---

## Hull

Static and clean throughout all of Act 1. No fouling overlays, no state changes.
Hull fouling is the centrepiece of Act 2 — do not pre-empt it here.

---

## Water

- Animated `feTurbulence` + `feDisplacementMap` on the water reflection.
- Low amplitude — movement sells realism, not distortion amount.
- Runs continuously, independent of scroll state.

---

## Scroll indicator

- Position: just below the waterline, horizontally centred or left-aligned.
- Style: subtle — low opacity, small. A thin vertical line with a downward chevron,
  or a faint "scroll" label. Should not compete with the headline.
- Behaviour: visible on State 0, fades out after the first scroll step.

---

## Technical approach

- Ship SVG fixed-position background.
- Scroll triggers via **Intersection Observer** or **GSAP ScrollTrigger**.
- Text fade in/out between states (opacity transition, ~300ms).
- No hull state management needed in Act 1.

---

## Open questions / to decide

- [x] Exact easing/duration for text transitions between beats. → opacity cross-fade, 320ms,
  default `--ease`. Tune in `.act1__beat` (global.css).
- [x] Mobile behaviour — scrollytelling stays scroll-driven (works at 360px). The *reduced-motion*
  fallback degrades to a plain stacked, scrollable list of all beats.
- [x] "Dive deeper" button — pill button (`.cta-link`), matching existing UI, with a `→`.
- [x] Does Act 2 open as a new section or a page transition? → Same page; "Dive deeper" advances
  `currentAct` and the persistent hull glides/dives into Act 2 (no page change).
- [x] Sky zone text: single column, **left-aligned**, capped at `--text-max-width` (720px).
- [ ] Light sky vs. light type: spec asked for white/light type; implemented as cool off-white
  with a strong dark text-shadow for contrast (no card). Revisit if it reads low-contrast.

---

## Source content

All copy sourced from `content.md`. Do not hardcode numbers — pull from `src/data/findings.ts`.
