# Fouling Explainer

A short, visual, single-page web app that distills August Bjerg-Heise's master's thesis on
**marine biofouling and ship energy efficiency** into a ~2-minute, "executive" story — built
for people who will never read the 79-page thesis.

The piece runs in three acts (the problem → the findings → the implications), centred on an
interactive ship hull that visibly fouls as you drag time forward.

> The full spec lives in [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/). Read those before
> changing anything.

## Stack

- **Vite + React 19 + TypeScript** (npm, Node 22+).
- **No animation or UI libraries** — all motion and visuals are hand-built with CSS
  transitions/transforms and inline SVG. This is a deliberate constraint; keep it that way.
- **Static only** — no backend, no secrets. The site ships HTML/CSS/JS and nothing else.

## Commands

```bash
npm install      # first-time setup
npm run dev      # local dev server (Vite)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```
