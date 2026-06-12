# CLAUDE.md — Fouling Explainer

> **Read this first.** This is the operating manual for any agent working in this repo.
> If you only read one file, read this one — it tells you where everything else lives.

## What this project is

A single-page, interactive web app that showcases the findings of August Bjerg-Heise's
master's thesis on **marine biofouling and ship energy efficiency** — built for people who
will *never* read the 79-page thesis. It must feel **short, visual, and "executive."**

The story is told in **three acts** the visitor clicks through:

1. **The problem** — fouling is invisible, expensive, and dirty.
2. **The findings** — what the data showed (the headline: fouling does almost nothing for
   ~2.5 months, then power demand spikes to +32–36%).
3. **The implications** — clean on condition, not on a calendar; simple models beat black boxes.

The signature visual: a **ship hull** that the camera moves along as the visitor steps
through the acts, with fouling (slime → algae → barnacles) visibly accumulating.

## The golden rule: agents *read*, they don't *see*

You usually cannot visually inspect the rendered page while iterating. So **the code must be
legible enough that you never need to.** This is the single most important convention here:

- **Name every variable after the thing it visually controls.** `barnacleSize`,
  `algaeCoverage`, `slimeOpacity`, `hullGrime`, `addedPowerPct`, `daysSinceCleaning`,
  `foulingLevel`. Never `x`, `val`, `c1`.
- **One labelled home for every number.** All thesis figures live as typed constants in
  `src/data/findings.ts` (see `docs/content.md` for the values). Components import from there —
  never hard-code a number inside a component.
- **Every component starts with a one-line comment describing what it renders**, e.g.
  `// Renders N barnacles whose size and count scale with foulingLevel (0–1).`
- **Design tokens are named semantically** in `src/theme.ts` (see `docs/design.md`), e.g.
  `color.abyss`, `color.glowTeal`, `color.signalRust` — not raw hex in components.

If a name or comment makes the visual obvious from reading alone, you're doing it right.

## Where to look

| File | What's in it | When you need it |
|------|--------------|------------------|
| `CLAUDE.md` (this file) | Stack, structure, rules, build/deploy | Always start here |
| `docs/content.md` | **All copy + every number** (single source of truth) | Writing any text or stat |
| `docs/design.md` | The vibe, palette/type/motion tokens, the semantic visual-variable system | Anything visual |
| `docs/structure.md` | The 3-act flow, navigation, the interactive fouling control, component map | Building layout/interaction |
| `docs/memory.md` | Decisions already made — don't relitigate them | Before changing direction |
| `thesis_summary.md` | The full source material the content is distilled from | Deep fact-checking |

## Stack (decided — don't swap without updating `docs/memory.md`)

- **Vite + React 19 + TypeScript.** Mirrors the reference project this is modelled on.
- **No animation libraries. No UI/component libraries.** All motion and visuals are
  hand-built with **CSS transitions/transforms and inline SVG**. This is a deliberate
  learning goal for the author — keep it that way.
- **Node 22**, npm.
- **No backend.** The site is 100% static (HTML/CSS/JS only). See "Security" below.

## Target folder structure

The repo root is this folder (`fouling-explainer/`). The git repo lives here — `CLAUDE.md`,
the `docs/`, and `src/` are all committed together. Right now only the docs exist; the
build agent creates `src/` and the Vite scaffold. **Target layout:**

```
fouling-explainer/
├── CLAUDE.md              # this file
├── README.md             # short human-facing readme
├── docs/                 # the spec — read these, don't duplicate them in code comments
│   ├── content.md
│   ├── design.md
│   ├── structure.md
│   └── memory.md
├── public/               # static assets (e.g. thesis.pdf if self-hosted)
├── src/
│   ├── main.tsx
│   ├── App.tsx           # holds step state, renders the active act + persistent hull
│   ├── theme.ts          # design tokens from docs/design.md
│   ├── data/
│   │   └── findings.ts   # ALL numbers as typed constants (from docs/content.md)
│   ├── components/
│   │   ├── acts/         # Act1Problem.tsx, Act2Findings.tsx, Act3Implications.tsx
│   │   ├── hull/         # Hull.tsx, Barnacle.tsx, AlgaeLayer.tsx, SlimeLayer.tsx
│   │   ├── controls/     # FoulingSlider.tsx, StepNav.tsx, StepIndicator.tsx
│   │   └── ui/           # AddedPowerCounter.tsx, FuelCostCounter.tsx, StatCard.tsx
│   └── styles/
│       └── global.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

Keep files small and single-purpose. If a component exceeds ~150 lines, split it.

## Commands

```bash
npm install        # first-time setup
npm run dev        # local dev server (Vite)
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## Design guardrails (the short version — full detail in docs/design.md)

- **Vibe: muted deep-sea, dark and photographic.** Desaturated teal-green/blue, near-black at
  the edges, a *sparing* ambient glow. Surfaces are weathered, not neon — nothing shouts.
  (Full palette + the hull-realism rules live in `docs/design.md`.)
- **Respect `prefers-reduced-motion`** — provide a static fallback for every animation.
- **Mobile matters** (recruiters/curious readers will open this on a phone). Build
  mobile-first; the hull and controls must work at ~360px wide.
- **Restraint over flash.** One strong idea (the fouling hull) done well beats ten effects.
- *Optional accelerator:* the **UI UX Pro Max** Claude Code skill can generate a coherent
  design system. If used, steer it with `docs/design.md` so it doesn't drift to generic SaaS.

## Security guardrails (non-negotiable — the link will be public)

A static site only ever ships HTML/CSS/JS to visitors. It has **no connection to the
author's Google account, email, or anything else**, so a public link cannot reach them.
The only ways to break that are the things this list forbids:

- **No secrets, API keys, tokens, or `.env` values in the repo — ever.** Treat the repo as
  if it were public (the host is undecided and may be a public GitHub repo).
- **No backend, no auth, no databases, no forms that POST anywhere.**
- **No third-party scripts that "phone home"** (trackers, analytics that exfiltrate, random
  CDNs). If a dependency is needed, it gets bundled at build time, not loaded live.
- **All external links** (thesis, GitHub) use `target="_blank"` **and**
  `rel="noopener noreferrer"`.
- The committed content is cleared as public-safe (vessel is anonymized, thesis submitted),
  but **do not add any new personal/contact data** beyond what `docs/content.md` specifies.

## Working conventions

- **Numbers come from `docs/content.md` → `src/data/findings.ts`.** Never invent a figure.
- **Copy comes from `docs/content.md`.** Don't write marketing prose ad-hoc.
- **Record any decision that future-you might second-guess** in `docs/memory.md`.
- Match the author's writing style: bottom line first, plain language, no consultant
  clichés, no AI tells ("delve", "robust", "seamless", "it's not just X, it's Y").
