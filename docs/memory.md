# memory.md — decision log

Decisions already made, so no agent (or future August) relitigates them. Append as things
change; date every entry. Newest at top.

---

## 2026-06-15 — Act 3 built as scrollytelling mirroring Act 1

- **Act 3 is now real** (replaces the placeholder) and is **scroll-driven like Act 1**, not
  static takeaways. The scrollytelling shell was **extracted from `Act1Problem.tsx` into a shared
  `Scrolly.tsx`** (owns the native-scroll + CSS-snap motion, the sticky stage, cross-fade, cue,
  snap panels, and reduced-motion fallback); Act 1 and Act 3 now both just supply beats via a
  `renderBeat` prop. CSS for the shell was renamed `.act1*` → `.scrolly*`.
- **Act 3 framing now MATCHES Act 1** (August's request: "same perspective as Act 1, other end").
  Both use one shared `ACT_SURFACE_ZOOM = 0.25` + `ACT_SHIP_DROP = 18%`; Act 1 frames the **stern**
  third (`translateX(100%)`), Act 3 the **bow** third (`translateX(-100%)`). This **supersedes**
  the 2026-06-13 note that Act 3 had its own `ACT_SURFACE_ZOOM = 0.42` (that constant is gone).
- **Three beats** (copy in `content.md`): (1) ML shows promise as a new way to quantify fouling;
  (2) get it right → saves the industry billions + the world millions of tonnes of GHG/yr;
  (3) closing CTA with the two links. A quiet **persistent Back** (top-left) returns to Act 2.
- **Links resolved.** GitHub repo = `https://github.com/AugustBjerg/Master-s-thesis`. Thesis PDF
  is **self-hosted**: button points to `/thesis.pdf`; **August must drop the PDF into `public/`
  as `thesis.pdf`** (not yet committed).
- **`ActPlaceholder.tsx` deleted** (its only use was Act 3) along with its `.act-placeholder*` CSS.

---

## 2026-06-13 — Act 1 is scrollytelling; no global control bar

- **Act 1 is now scroll-driven** (per `docs/act1-design-spec.md`), not click-stepped. The ship
  stays fixed + clean in the bottom zone; scrolling steps the centred intro copy through five
  beats in the top "sky zone", ending on a **"Dive deeper ↓"** CTA into Act 2. Built in
  `Act1Problem.tsx` with **native scroll + CSS `scroll-snap-type: y mandatory`** (a sticky stage
  pins the copy; empty per-beat snap panels supply the scroll length + snap points; a scroll
  listener reads `progress` for the cross-fade). We tried JS-debounced snap and a custom eased
  input-capture engine first; both felt wrong (snap delay / could not multi-step / needed a
  click to re-arm). Native scroll-snap gives free continuous scroll, multi-beat fast flicks, and
  a smooth native landing. Reduced motion falls back to a plain stacked list (snap off). **This
  partially supersedes** the kickoff "Click/Next stepped, not scroll-driven" rule — that rule
  still holds for Acts 2↔3.
- **The bottom control bar is removed everywhere** (it read as a black bar). Wayfinding is now
  each act's own in-act CTA: Act 1 "Dive deeper", Act 2 a `.act__nav` row (Back / "What this
  means"), Act 3 placeholder a "Back" link. Arrow keys still step between Acts 2↔3 (and back to
  1). `StepNav.tsx` / `StepIndicator.tsx` are now unused but left in the tree in case nav
  returns.
- **Act 1 ship pulled back to ~25% of screen width** (`ACT1_SURFACE_ZOOM = 0.25` in `acts.ts`,
  separate from Act 3's `ACT_SURFACE_ZOOM = 0.42`) and dropped low (`ACT1_SHIP_DROP = 18%`) to
  clear the sky-zone copy. Both are tunable knobs.

---

## 2026-06-12 — Act 2 dives underwater

- The Act 1→2 transition now **drops below the surface and zooms in** (not a flat sideways
  slide): Act 2 is framed **completely underwater** on the **midship** hull (length-wise centre)
  where the fouling is examined. Act 1 and Act 3 stay at the surface (same height as each other).
- Implemented in `acts.ts` HULL_FRAMING: Act 2 = `translateY(ACT2_DIVE) scale(ACT2_ZOOM)` on
  `.hull-stage`. Two named knobs (`ACT2_DIVE`, `ACT2_ZOOM`) tune depth/closeness. This
  intentionally breaks the earlier "all acts same height" rule **for Act 2 only**.

---

## 2026-06-12 — Scene = daytime; ship must read as a bulk carrier

- **Daytime, not night.** The dark dusk scene is out — the sea/sky are now a **cold,
  overcast daylight** (muted/photographic, not tropical-bright). Tokens: `skyTop`,
  `skyHorizon`, `seaSurface`, `seaLit`, `seaDeep` in `theme.ts`; the scene CSS backdrop and
  vignette were lightened to match. (Softens the original "dark deep-sea" mood, intentionally.)
- **The hull must look like a bulk carrier**, not a bare hull: cargo-hold **hatch covers**
  along the deck, **deck cranes** between holds, and a raised **forecastle** at the bow —
  in `DeckFeatures.tsx`. The aft accommodation block stays the stern cue.
- A **visible waterline** is required (the ship floats): air above, murky water below, lit
  sea-surface line at the hull's painted waterline (`SeaAndSky` + `WaterVeil`). The fouling
  story lives below that line.

---

## 2026-06-12 — Hull realism direction (hybrid SVG + bundled textures)

- August wants the hull to look **much more realistic** — the first stylized pass read as
  "MS-Paint flat." We are now pushing toward a **photographic, weathered** hull, while
  keeping the **strict side-on profile** (no 3D/perspective).
- **Approach = hybrid:** still mostly hand-built SVG, but we may now use **a few bundled
  raster textures** (grunge/grain/normal-ish maps) as overlays/bump sources. Constraint
  relaxed *only* this far — textures are generated procedurally and **bundled at build, no
  external calls** (security guardrails hold). This partially supersedes the earlier
  "pure hand-built SVG, no images" learning-goal note below — images are allowed **as
  bundled textures**, not as the primary rendering method.
- **Detail priority (this round):** (1) **metal shading & lighting** — curved, lit, wet
  steel via SVG light filters + gradients; (2) **surface detail** — plating seams, weld
  lines, rivets, rust streaks, draft marks, weathering. Fouling organisms and
  water/atmosphere are **out of scope for this round** (kept as-is).
- Textures live in `public/textures/` and are regenerable via `scripts/gen-textures.mjs`
  (plain Node + built-in zlib, no new dependencies).

---

## 2026-06-12 — Design review (palette + hull realism)

- August reviewed the first design pass and wanted it **less "in your face."** Palette is now
  **muted/desaturated** — deep teal-green + moody blue, near-black edges, weathered photographic
  surfaces — matching reference images he supplied. **Neon teal, bright amber, and coral are out.**
- **Accent:** keep a **soft glow, dialed down** — a low-saturation sage-teal (`glowTeal`) for
  ambient light and the active accent; one dim rust (`signalRust`) reserved for the readouts,
  warming only toward the high end of the slider.
- **Ambient light:** liked, but **used sparingly** — a quiet sense of depth, not a light show.
- **Hull rendering:** **stylized SVG, pushed hard** — stays pure hand-built SVG/CSS (no images;
  the learning goal holds), but uses gradients, `feTurbulence` noise, soft shadows, irregular
  *clustered* barnacles, and a vignette to avoid a cartoonish flat-vector look. Not photoreal,
  but weathered and believable. Full guidance in `docs/design.md`.

---

## 2026-06-12 — Project kickoff decisions

**Scope & purpose**
- A short, interactive, "executive" web page that distills August's master's thesis on
  **marine biofouling & ship energy efficiency** for people who won't read the thesis.
- Told in **three acts**: (1) the problem, (2) the findings, (3) implications. These are a
  structural device, not on-screen headlines.

**Stack**
- **Vite + React 19 + TypeScript.** Mirrors the reference project (rindig/Feelings).
- **No animation libraries, no UI libraries** — all visuals hand-built with CSS + inline SVG.
  This is a deliberate skill-building goal for August. Do not introduce libraries to "save time."
- **Remotion is NOT used** — it renders React to *video files*, irrelevant to a live site.
  (Only revisit if August later wants a shareable video teaser.)

**Audience & tone**
- Primary audience: **recruiters / professional network + the general curious public.**
- Therefore: lead with the "so what," minimal jargon, visuals carry the load, method stays
  light but honest. Voice = bottom line first, plain, no consultant clichés / AI tells.

**Content**
- **All content is public-safe** (vessel anonymized, thesis submitted). Confirmed by August.
- No traditional charts/graphs. Instead, **number-driven animations** — the centerpiece is a
  **fouling slider**: dragging `daysSinceCleaning` fouls the hull on screen and ticks up an
  added-power (and fuel-cost) counter.

**Visual direction**
- Deep-sea, dark, cinematic; calm in Act 1 → heavier in Act 2 → decisive in Act 3.
  *(Original "bright bioluminescent" treatment was **superseded** — see the Design review entry
  above for the muted palette and hull-realism rules that now govern.)*

**Navigation**
- **Click/Next stepped** through the three acts (not scroll-driven). Persistent hull that
  "glides" along the ship between acts.

**Closing CTA**
- Two links only, open in a new tab: **full thesis** and **GitHub repo**. No personal/contact
  info beyond these.

**Git & files**
- Git repo at the **root** of `fouling-explainer/`. `CLAUDE.md`, `docs/`, and `src/` are all
  committed together. `node_modules` and `dist/` gitignored.

**Security**
- Treat the repo as potentially public. **No secrets/keys/backend/auth/trackers — ever.**
  Static site only. External links use `rel="noopener noreferrer"`.

---

## Open items (need August's input or a later decision)

- [ ] **Hosting undecided.** August wants a conversation comparing options (GitHub Pages =
  free but public repo; Vercel = private repo + public site, auto-deploy; etc.) before launch.
  Files are written host-agnostic until then.
- [x] **`<THESIS_PDF_URL>`** — decided 2026-06-15: **self-hosted at `/thesis.pdf`**. Still need
  August to drop the actual PDF into `public/thesis.pdf`.
- [x] **`<GITHUB_REPO_URL>`** — set 2026-06-15: `https://github.com/AugustBjerg/Master-s-thesis`.
- [ ] **Build the Vite app** — `src/` scaffold does not exist yet; these docs are the spec
  for the build agent.
- [ ] **UI UX Pro Max skill** — recommended but not yet installed; optional accelerator for
  the design system (must be steered by `docs/design.md`).
- [ ] Exact fouling-curve data beyond the summary anchor points — current spec uses the
  anchors in `content.md`; swap in finer data during the build if August provides it.
