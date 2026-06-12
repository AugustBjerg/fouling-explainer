# design.md — the vibe and the visual system

This file defines *how the site looks and moves*, and — most importantly — the **named
visual variables** that let an agent build and tweak the visuals by reading, not seeing.
Tokens here map to `src/theme.ts`; the visual variables map to props/state in the hull and
control components.

---

## The vibe: muted, deep-sea, photographic

Picture descending alongside a ship's hull in cold, murky water. The palette is **desaturated
deep teal-green and moody blue**, fading to near-black at the edges (a soft vignette).
Surfaces are **photographic and weathered**, not flat or neon — think the reference images:
matte steel, oxblood anti-fouling paint, pale sage-grey growth. A **faint ambient glow** of
light filters down from the surface, used **sparingly** — a quiet mood, not an effect.

It's **calm and cold in Act 1**, turns **quietly heavier in Act 2** as the hull fouls and the
readouts warm slightly, and resolves to **clear and decisive in Act 3**. Nothing shouts.

Mood words: *murky, cinematic, desaturated, weathered, restrained.*
One strong idea — the fouling hull in dark water — done well. Resist piling on effects, and
keep colors low-saturation throughout.

---

## Color tokens (`src/theme.ts → color`)

Use the **names**, never raw hex, inside components.

All tones are **low-saturation**. If a color looks vivid on its own swatch, it's wrong for
this design — pull the saturation down.

| Token | Hex | Use |
|-------|-----|-----|
| `abyss` | `#050C0E` | Page background (darkest, at the edges / vignette) |
| `deepWater` | `#0A1A1C` | Main background field (desaturated teal) |
| `deepWaterBlue` | `#0B1822` | Cooler blue pocket, for depth variation |
| `deepWaterRaised` | `#102528` | Cards, panels, raised surfaces |
| `glowTeal` | `#5E8C82` | The dialed-down accent + ambient light. Muted sage-teal — **never neon** |
| `glowTealSoft` | `rgba(94,140,130,0.12)` | Ambient caustics, faint rim light, hover washes (low opacity) |
| `signalRust` | `#B07A4E` | The single warm signal — added-power / fuel-cost readouts only. Dim, desaturated |
| `signalRustDim` | `#7E5C42` | The readout at low values, before it "warms up" |
| `textPrimary` | `#DDE6E2` | Body and headlines (cool off-white, faint green cast) |
| `textMuted` | `#7C918B` | Captions, secondary text, labels |
| `hullSteel` | `#46545B` | Hull plating, mid-tone (cool dark steel) |
| `hullSteelLight` | `#6B7A82` | Specular highlight near the waterline (curvature) |
| `hullShadow` | `#1A2528` | Deep shadow on the hull (volume, far side) |
| `hullPaintBelow` | `#5E2E2C` | Anti-fouling paint band below the waterline (muted oxblood) |
| `foulingSlime` | `#35463E` | Biofilm/slime film (dark desaturated green, used at low opacity) |
| `foulingAlgae` | `#4E5C36` | Algae patches (muted olive) |
| `barnacleShell` | `#A7AC9E` | Barnacle bodies (pale sage-grey — matches the growth in reference image 1) |
| `barnacleHighlight` | `#C2C4B6` | Subtle top highlight on a barnacle |
| `barnacleShadow` | `#6E7468` | Barnacle shading / contact shadow |

**Glow recipe (use sparingly):** ambient light and the faint hull rim use `glowTealSoft` via
soft `feGaussianBlur` — **low opacity, large blur, no hard edges, never a neon outline.** The
warm `signalRust` is a *fill* color on the readouts, not a glow; it only warms toward the high
end of the slider (`signalRustDim` → `signalRust`) and stays muted even at maximum.

---

## Typography (`src/theme.ts → font`)

- **Body:** a clean modern sans. System stack first (`-apple-system, "Segoe UI", Roboto, ...`)
  or a single self-hosted Google font (Inter / Söhne-like). One family only — stay light.
- **Act titles / big numbers:** same family, heavy weight, large and confident. Big stats
  (e.g. **+36%**) are a visual element, not body text — size them to land.
- Generous line-height for body (~1.6); tight for display.
- Scale (rem): `display 3.0`, `h1 2.0`, `h2 1.5`, `body 1.0`, `caption 0.85`. Fluid via
  `clamp()` so it reads on mobile.

## Spacing & layout (`src/theme.ts → space`)

- 8px base scale: `xs 4, sm 8, md 16, lg 24, xl 40, xxl 64`.
- Generous whitespace — let the dark field breathe.
- Content max-width ~720px for text; the hull may extend full-bleed.
- **Mobile-first.** Everything must work at **360px wide**. The hull scales down; the
  fouling control stacks above/below the hull on narrow screens.

## Motion principles (`src/theme.ts → motion`)

- **Act transitions = "the glide":** the hull translates horizontally and the camera appears
  to pan along it. ~**600ms, ease-in-out**. This is the signature move — make it smooth.
- **Fouling changes animate:** when `foulingLevel` changes, barnacles/algae/slime ease in
  over ~**400ms**; counters tween, not jump.
- **Ambient (subtle, sparing):** slow drifting particles and faint caustic light filtering
  down from the surface, in `glowTeal`/`glowTealSoft` at very low opacity. August explicitly
  wants this used *conservatively* — a quiet sense of depth, never a light show. A handful of
  slow particles, one soft light gradient. Must never compete with the hull or the readouts.
- **`prefers-reduced-motion`:** disable ambient motion and act-transition panning (cut
  instantly instead); keep the *state* mapping (slider still fouls the hull, just without the
  tween). Every animation needs a sensible static fallback.
- Default easing token: `ease = cubic-bezier(0.4, 0.0, 0.2, 1)`.

---

## The semantic visual-variable system (the important part)

One master driver, everything derived from it. **An agent should be able to predict the
screen from these numbers alone.**

**Master input:** `daysSinceCleaning` — integer **0–180**. Controlled by the visitor in Act 2.

**Master derived value:** `foulingLevel` — float **0.0–1.0**. Computed from
`daysSinceCleaning` via the curve in `docs/content.md` (negligible until ~day 75, then steep).
`0` = pristine hull, `1` = heavily fouled at ~180 days.

**Derived visual variables** (all `0.0–1.0` unless noted) — each maps to one visible thing:

| Variable | Controls | Ramps in over (days) | At max |
|----------|----------|----------------------|--------|
| `slimeOpacity` | Opacity of the slime/biofilm film over the hull | ~5 → 60 | thin sheen, ~0.6 opacity |
| `algaeCoverage` | Fraction of hull area covered by algae patches | ~30 → 120 | green-brown patches across hull |
| `barnacleDensity` | Number of barnacles drawn on the hull | ~75 → 180 | dense cluster (e.g. up to ~40) |
| `barnacleSize` | Scale multiplier of each barnacle | ~75 → 180 | full-size hard growths |
| `hullGrime` | Overall darkening/desaturation of the clean plating | ~10 → 180 | grimy, dull hull |

**Readouts (Act 2), driven by the same input:**

| Variable | Meaning | Source |
|----------|---------|--------|
| `addedPowerPct` | Extra engine power needed vs. a clean hull | curve in `content.md` (~0% → ~+34% @180d) |
| `fuelCostPerDayUsd` | Estimated added fuel cost **per day** (shown live) | `addedPowerPct` × fuel burn × fuel-price assumption |
| `foulingStageLabel` | "Clean" / "Biofilm" / "Slime" / "Barnacles" | from the stage table below |

> Keep these in `src/data/findings.ts` as pure functions, e.g.
> `addedPowerPct(days) => …`, `foulingLevel(days) => …`, so visuals and readouts stay in sync.

---

## Fouling stages → what's on screen

This is the bridge between the science (`content.md`) and the visuals. As
`daysSinceCleaning` increases:

| Days | Stage (`foulingStageLabel`) | What the hull looks like | Active variables | Added power |
|------|------------------------------|--------------------------|------------------|-------------|
| 0–~5 | **Clean** | Crisp steel plating, red paint below waterline, faint rim glow | none | ~0% |
| ~5–~75 | **Biofilm / Slime** | A growing slick green-brown film; hull dulls | `slimeOpacity↑`, `hullGrime↑`, then `algaeCoverage↑` | ~0–2% (plateau) |
| ~75–~120 | **Early barnacles** | First barnacles appear and start to grow among the algae | `barnacleDensity↑`, `barnacleSize↑`, `algaeCoverage` high | rising fast |
| ~120–180 | **Heavy calcareous** | Dense barnacle clusters, fully grimed hull | all near max; readout warms to `signalRust` (still muted) | ~+32–36% |

The key dramatic moment: **barnacles only really arrive after ~2.5 months**, which is exactly
when `addedPowerPct` spikes. The visual and the number must spike *together*.

---

## How the hull is drawn — and how to keep it from looking cartoonish

**Decision (updated 2026-06-12 — see `docs/memory.md`):** the hull is **hand-built inline
SVG/CSS**, now pushed toward a **photographic, weathered** look (the first stylized pass read
as flat). We use a **hybrid** approach: mostly hand-built SVG (lighting filters, layered
gradients, geometry) plus **a few bundled raster textures** (grunge/grain) as overlays/bump
sources — generated procedurally and bundled at build, never loaded externally. **No
animation/UI libraries** still holds. Aim: believable, weathered, **strict side-on profile**. The enemy here is the flat-vector
"cartoon" look. The rule of thumb: **flat fills + perfect geometry = cartoon; gradients +
noise + asymmetry + soft shadows = believable.** Realism comes from these techniques, not from
detail count.

**Composition**
- `Hull.tsx` draws the ship profile (side view: bow, topside, waterline, anti-fouling band).
  `SlimeLayer`, `AlgaeLayer`, and `Barnacle` are SVG overlays positioned along the hull.

**Make the steel read as a curved, lit surface (not a flat shape)**
- Fill the hull with **layered gradients**, never a single flat color: a vertical/curved
  gradient from `hullShadow` (deep/far) → `hullSteel` (mid) → `hullSteelLight` (a soft
  specular band near the waterline where surface light hits). This is what sells curvature.
- Add a subtle **wet sheen**: a faint, soft highlight streak that follows the hull's curve.
- A gentle top-down **light gradient** over the whole scene (bright-ish near the surface,
  black at depth), matching the caustic rays in the references.

**Texture, not smoothness**
- Overlay a **`feTurbulence` noise filter** (low opacity, fine frequency) on the plating to
  break up the flatness — grime, mottling, micro-variation. Optionally `feDisplacementMap`
  for slight surface irregularity. This single move does the most to kill the vector look.
- Add **weld/seam lines** as thin, low-opacity strokes, and a few **rust streaks** running
  downward from fittings (see reference image 4). Keep the **dashed draft marks** near the bow.
- The **waterline** between topside paint and `hullPaintBelow` should be a slightly
  **irregular**, soft boundary with a thin boot-top stripe — not a ruler-straight line.

**Barnacles — the biggest cartoon risk, so be deliberate**
- **Never identical circles.** Each `Barnacle` is an **irregular conical/volcano shape** with
  a small **off-center aperture**, its own slight rotation, size jitter (driven by
  `barnacleSize` ± a per-instance random factor), and a soft **contact shadow** for relief
  (`barnacleShadow`) plus a faint top `barnacleHighlight`.
- **Cluster them like colonies**, not an even grid: dense patches in some areas, sparse
  elsewhere, some overlapping for depth (see reference image 5). Seed positions deterministically
  so they don't reshuffle every render; `barnacleDensity` controls how many are shown.
- Slight **per-instance color variation** around `barnacleShell` so the colony isn't uniform.

**Slime & algae — soft and organic**
- Semi-transparent, **soft-edged** shapes (Gaussian-blurred or turbulence-masked), with
  **wispy, stringy edges** rather than hard blobs — the growth in image 5 trails and frays.
  Opacity/coverage are driven by `slimeOpacity` / `algaeCoverage`.

**Depth & framing**
- A **vignette** to near-black at the frame edges (reference image 1), plus the sparing ambient
  particles/light from the Motion section. This framing is half of why the references feel
  cinematic.

**Performance**
- `feTurbulence`/blur filters are expensive — **bake them where possible** (e.g. generate the
  noise once, reuse it; don't re-run filters every animation frame). Animate only
  `transform`/`opacity`. Cap particle and barnacle counts. **Test on a mid-range phone.**

---

## Accessibility

- Body text contrast ≥ 4.5:1 against `deepWater` (the off-white passes; check `textMuted` on
  small text).
- Don't encode meaning in color alone — the added-power readout has a **number and label**,
  not just amber.
- All controls keyboard-operable; visible focus ring in `bioluminescent`.
- The fouling slider has an accessible label and announces `daysSinceCleaning` +
  `addedPowerPct`.
- Honor `prefers-reduced-motion` as described above.

---

## Optional: UI UX Pro Max skill

The **UI UX Pro Max** Claude Code skill can generate a coherent design system from a prompt.
If used, **constrain it to this file** — prompt it with the deep-sea immersive vibe and the
palette above so it refines rather than replaces these choices. Without steering it tends
toward generic light SaaS dashboards, which is the opposite of this vibe.
