# memory.md — decision log

Decisions already made, so no agent (or future August) relitigates them. Append as things
change; date every entry. Newest at top.

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
- [ ] **`<THESIS_PDF_URL>`** — August to provide the link to the full thesis.
- [ ] **`<GITHUB_REPO_URL>`** — set once the repo is created/pushed.
- [ ] **Build the Vite app** — `src/` scaffold does not exist yet; these docs are the spec
  for the build agent.
- [ ] **UI UX Pro Max skill** — recommended but not yet installed; optional accelerator for
  the design system (must be steered by `docs/design.md`).
- [ ] Exact fouling-curve data beyond the summary anchor points — current spec uses the
  anchors in `content.md`; swap in finer data during the build if August provides it.
