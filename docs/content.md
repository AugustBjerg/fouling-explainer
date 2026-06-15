# content.md — the words and the numbers

**This is the single source of truth for every word and figure on the site.** Components
read numbers from `src/data/findings.ts`, which is populated from the "Key numbers" block
below. If you need to change a stat or a sentence, change it here first.

- **Audience:** recruiters / professional network **and** the general curious public.
  No domain knowledge assumed. Lead with the "so what." Minimal jargon — when a technical
  term is unavoidable, explain it in plain words on first use.
- **Voice:** bottom line first, plain language, confident but honest about limits. No
  consultant clichés, no AI tells.
- **Clearance:** all content here is public-safe (vessel anonymized, thesis submitted).
- **Length target:** the whole site should be readable in ~2 minutes. Keep copy tight.

---

## Act 1 — The problem

**Headline:** *The ocean is slowly eating your fuel budget.*

**Beats (in order):**

1. **Scale.** Ships carry about **80% of world trade** and produce roughly **3% of global
   CO₂** — comparable to a large industrial country.
2. **The hidden tax.** Below the waterline, marine life — slime, then algae, then barnacles —
   grows on the hull. This is **biofouling**. It adds drag, so the engine burns more fuel to
   hold the same speed.
3. **Why it's sneaky.** You can't see it from the bridge, and you can't measure it directly:
   the power a ship needs is tangled up with its speed, how heavily it's loaded, and the
   weather. The fouling "signal" hides inside all of that.
4. **The bill.** Industry-wide, biofouling is estimated to add about **USD 30 billion a year**
   in costs and around **10% of shipping's greenhouse-gas emissions**.

**Transition line into Act 2:** *So how bad does it actually get? We took one ship and one
year of data and measured it.*

---

## Act 2 — The findings

**Headline:** *Watch what a dirty hull actually costs.*

**Setup (one sentence):** Using a full year of operational data from a single **bulk carrier**
(an anonymized 225 m, 76,000-tonne ship) and machine learning, we estimated how much *extra*
engine power fouling demanded as the hull got dirtier.

**The centerpiece — interactive (see `docs/structure.md`):** a control that lets the visitor
drag time forward from a clean hull. As **days since cleaning** rise, the hull on screen
visibly fouls (slime → algae → barnacles) and the **added-power** and **fuel-cost-per-day**
readouts climb.

**What the visitor sees — the interaction, not a chart:** one control: a slider for **days
since the hull was cleaned**. Dragging it forward updates two live readouts —
**added energy consumption** (how much more power the hull demands than when clean) and the
**estimated added fuel cost per day** — while the hull on screen fouls in step. Both stay low
for the first couple of months, then climb steeply. The visitor *feels* that by dragging; we
don't spell out the curve or quote percentages at them.

**Under the hood (not shown as statistics):** the exact percentages, the two models behind
them, and the curve anchor points live in `src/data/findings.ts` and the Key numbers below.
They *drive* the readouts — they are not displayed as headline figures.

**The money, lightly:** left long enough, the added daily fuel cost dwarfs the
**~USD 15–20,000** cost of a single hull cleaning.

**The quiet surprise (for the more curious reader):** A **simple, explainable model** predicted
nearly as well as a complex "black-box" neural network — and you could actually understand
*why* it said what it said. The extra complexity wasn't worth the loss of trust.

**Honest caveat (keep it, don't bury it):** This is **one ship, one year**. The exact
percentages are sensitive to how the data is filtered, so treat the *shape and scale* as the
finding — not the decimal places.

---

## Act 3 — The implications

Scrollytelling that mirrors Act 1 (shared `Scrolly` shell), with the ship clean again at the
**bow**. Three beats step through the sky zone:

**Beats (in order):**

1. **Headline:** *Machine learning shows promise as a new way to quantify fouling.*
2. **The prize:** Get the implementation right, and it could save the shipping industry
   **billions of dollars** — and the world **millions of tonnes of greenhouse-gas emissions** —
   every year.
3. **Closing CTA:** *Dive deeper into the findings, or check out the code.* — then the two links.

**Call to action — two links (open in a new tab):**

- **Read the full thesis** → `/thesis.pdf` *(self-hosted — drop the PDF into `public/thesis.pdf`)*
- **View the code on GitHub** → `https://github.com/AugustBjerg/Master-s-thesis`

A quiet **Back** (top-left) returns to Act 2.

> Earlier draft (superseded 2026-06-15) framed Act 3 as three static "operator / method / broader
> lesson" takeaways with a *"Clean on condition, not on the calendar"* headline. Kept here as a
> note in case the longer takeaways are wanted later; the live act uses the three beats above.

---

## Key numbers (→ `src/data/findings.ts`)

> Source: `thesis_summary.md`. Round for display as shown; keep full precision in code if useful.

**Context**
- World trade carried by ships: **80%**
- Shipping share of global anthropogenic CO₂: **~3%**
- Estimated annual cost of biofouling industry-wide: **~USD 30 billion**
- Biofouling share of fleet GHG emissions: **~10%**

**The case-study vessel**
- Type: bulk carrier (Panamax), **76,000 DWT**, **225 m**, max engine power **9,500 kW**
- Data: **1 full year (2024)**, anonymized
- Two cleaning events; analysis runs from the first cleaning onward
- Final cleaned dataset: **15,061 observations** (from ~2 million raw readings)

**Added power vs. days since cleaning (DSC)** — the curve that drives the Act 2 animation:
- **Negligible (~0–2%) for the first ~75 days** (≈2.5 months) — biofilm/slime stage
- Then rises sharply. Anchor points (two models):
  - GAM (interpretable):  **+9.7% at 150 days**, **+36.3% at 180 days**
  - MLP (black-box):      **+16.0% at 150 days**, **+31.6% at 179 days**
- These values **drive the live `addedPowerPct` readout** as the slider moves — they are not
  shown to the visitor as a fixed headline statistic or a plotted curve.
- For a single animated counter, use a blended estimate rising from ~0% (day 0) to
  **~+13% at 150 days** and **~+34% at 180 days**, with the negligible plateau to ~day 75.
  Mark it clearly as an estimate with a model range, not an exact value.

**The money comparison**
- On screen, show **estimated added fuel cost per day** (`fuelCostPerDayUsd`), derived from
  `addedPowerPct` × the vessel's fuel burn × a documented fuel-price assumption (keep the
  assumption in `findings.ts`).
- For context (not necessarily shown): cumulative extra fuel over the ~6-month period was
  **~USD 91k (MLP) / ~USD 106k (GAM)**.
- Cost of one hull cleaning: **~USD 15,000–20,000** — the natural comparison point.

**Model accuracy (test set; lower error = better)** — for the "simple ≈ complex" point:
- Ridge (basic linear): RMSE **458 kW**, error **~13.5%**
- GAM (interpretable):  RMSE **287 kW**, error **7.3%**
- MLP (black-box):      RMSE **138 kW**, error **3.2%**
- Adding the fouling proxy (DSC) improved every model significantly.

**Biofouling stages (drives the hull visuals — see `docs/design.md`)**
- **Biofilm** — hours to days — invisible slick
- **Slime** — weeks — green/brown film spreading across the hull
- **Calcareous fouling (barnacles etc.)** — weeks-plus, accelerated in warm/saline/slow
  conditions — hard growths; this is when added power spikes

---

## Glossary (use only if a term must appear on screen)

- **Biofouling** — marine organisms (slime, algae, barnacles) growing on a ship's hull.
- **Drag** — water resistance; more fouling = more drag = more fuel.
- **Shaft power** — the engine power delivered to the propeller; what we're estimating.
- **Days since cleaning (DSC)** — how long since the hull was last cleaned; our stand-in for
  "how fouled is it."
