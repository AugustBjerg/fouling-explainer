# structure.md — page flow and interaction

How the page is laid out, how the visitor moves through it, and how the interactive parts
behave. Copy and numbers come from `content.md`; looks and variable names come from
`design.md`. This file is about **flow and behavior**.

---

## Top-level model

One page, **three acts**, advanced by **explicit clicks** (decided — not scroll-driven):

- A **Next** button (and **Back**) move between acts.
- A **step indicator** (three dots / labels: Problem · Findings · Implications) shows
  where you are and is clickable to jump.
- Keyboard: **→ / Space = Next, ← = Back.** Focus stays managed and visible.
- No scroll-jacking. If an act is taller than the viewport on mobile, it scrolls normally
  within the act; advancing acts is always a deliberate click.

**The ship (bulk carrier) is persistent.** It does not unmount between acts — it's one continuous element
that **glides** (translateX + slight scale) as the camera appears to travel along the ship.
Suggested framing so it reads as "moving down the hull":

- **Act 1 →** camera near the **bow**, hull clean. Button to next part says "dive deeper"
- **Act 2 →** camera at **midship**, where fouling is shown and controlled.
- **Act 3 →** camera toward the **stern**, appears clean again

Transition = ~600ms ease-in-out (see `design.md → motion`).

---

## App state (`src/App.tsx`)

Keep it tiny and explicit:

```ts
currentAct: 1 | 2 | 3            // which act is showing
daysSinceCleaning: number        // 0–180, Act 2 control; persists if user goes back
prefersReducedMotion: boolean    // from matchMedia
```

Everything visual is **derived** from these (see `design.md` variable table). No hidden
state inside child components beyond local UI (e.g. hover).

---

## Act 1 — The problem

**Goal:** in ~15 seconds, make the visitor feel that fouling is real, hidden, and expensive.

- Hull shown **clean**, near the bow, calm dark water, faint glow.
- Copy: the Act 1 beats from `content.md` (scale → hidden tax → why it's sneaky → the bill).
- Two or three **context stats** as quiet `StatCard`s: `80% of trade`, `~3% of CO₂`,
  `~$30bn/yr`. Understated — these set the stakes, they're not the punchline.
- **Next** → Act 2. Button says "dive deeper", and the move should be slightly downward

## Act 2 — The findings (the interactive centerpiece)

**Goal:** let the visitor *feel* how fast the cost climbs by dragging time forward themselves.
The slider is the whole story — no plotted chart, no quoted percentages.

**Primary control — `FoulingSlider`:**

- Maps to `daysSinceCleaning` (0 → 180). Label: "Days since the hull was cleaned."
- As it moves, in sync (all derived — see `design.md`):
  - the **hull fouls** (`slimeOpacity`, `algaeCoverage`, `barnacleDensity`, `barnacleSize`,
    `hullGrime`),
  - **`AddedPowerCounter`** climbs (warning-amber), showing `addedPowerPct`,
  - **`FuelCostCounter`** shows the **estimated added fuel cost per day** (`fuelCostPerDayUsd`),
  - a **`foulingStageLabel`** updates (Clean → Biofilm/Slime → Barnacles).
- Counters **tween**, they don't jump. The visual spike and the number spike happen
  **together** at ~day 75 — that synchronization *is* the insight.
- Nice touch (optional): mark ~day 75 ("barnacles start") and ~day 180 on the track.

**Supporting elements (kept secondary so they don't crowd the hull):**

- **Money comparison:** the per-day cost makes its own point — left long enough, the added
  fuel far outweighs the `~$15–20k` cost of a clean. Let this land at the high end of the slider.
- **"Simple beat complex" card:** a small, skippable `StatCard` with the model-accuracy point
  (GAM 7.3% vs MLP 3.2%, "you could understand the simple one"). For the curious; don't force it.

**Layout:** hull centered/dominant; slider directly tied to it (below); counters near the hull so cause↔effect is obvious. **Back** → Act 1, **Next** → Act 3.

## Act 3 — The implications

**Goal:** land three takeaways and offer the two links.

- Hull glides to the stern, shown **clean again** (the "after cleaning" payoff).
- Three takeaways from `content.md` (condition-based cleaning; ML as a look-back tool;
  trust beats complexity) — short, confident, one line each.
- Closing line.
- **Two CTA links**, each `target="_blank" rel="noopener noreferrer"`:
  - **Read the full thesis** → `<THESIS_PDF_URL>`
  - **View the code on GitHub** → `<GITHUB_REPO_URL>`
- **Back** → Act 2. (Optional: a "start over" → Act 1.)

---

## Component breakdown (→ `src/components/`)

```
acts/
  Act1Problem.tsx        // problem copy + context StatCards
  Act2Findings.tsx       // hosts FoulingSlider + counters + supporting cards
  Act3Implications.tsx   // takeaways + the two CTA links
hull/
  Hull.tsx               // SVG ship profile; receives foulingLevel + derived vars
  SlimeLayer.tsx         // opacity = slimeOpacity
  AlgaeLayer.tsx         // coverage = algaeCoverage
  Barnacle.tsx           // one barnacle; scaled by barnacleSize
controls/
  FoulingSlider.tsx      // daysSinceCleaning 0–180, accessible
  StepNav.tsx            // Next / Back buttons + keyboard handling
  StepIndicator.tsx      // 3 dots/labels, clickable
ui/
  AddedPowerCounter.tsx  // tweened % readout, warning-amber
  FuelCostCounter.tsx    // tweened $ readout
  StatCard.tsx           // small labelled stat block
```

Data/derivation lives in `src/data/findings.ts` (pure functions: `foulingLevel(days)`,
`addedPowerPct(days)`, `fuelCostPerDayUsd(days)`, `foulingStage(days)`, plus the derived visual
vars). Components stay dumb: they take numbers in and render.

---

## Responsive behavior

- **Mobile-first**, must work at **360px**. On narrow screens: hull on top, slider + counters
  stacked below; step nav fixed at the bottom for thumb reach.
- On desktop: hull dominant, slider/counters alongside.
- The act transition (glide) is more restrained on mobile (smaller translate) and disabled
  under `prefers-reduced-motion`.

## Behavioral guardrails

- Advancing acts is always a deliberate action — never auto-advance.
- Slider state persists when moving between acts (don't reset the hull the visitor set).
- Keep the whole experience ~2 minutes. If a section feels wordy, cut it — the visual carries
  the load.
