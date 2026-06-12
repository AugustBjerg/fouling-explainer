# Thesis Summary

**Title:** Estimating the Impact of Marine Biofouling on Ship Energy Efficiency Using Machine Learning — A Case Study of a Bulk Carrier
**Author:** August Bjerg-Heise (S152153) · **Supervisor:** Søren Wengel Mogensen
**Submitted:** 15 May 2026 · 79 pages (excl. bibliography/appendices), 181,036 characters
**Data partner:** Mærsk-McKinney Møller Center for Zero Carbon Shipping (MMMCZCS), "Real Vessel Data Challenge"

> Structured around the course learning objectives so it doubles as defence prep. Each section maps to what examiners will probe: RQ–theory–method–analysis–conclusion coherence, method justification, data/analysis validity, generalizability/limitations, and situating findings in the literature.

---

## 1. Research Question & Sub-Questions

**Main RQ:** Can machine learning serve as a viable methodology for estimating the effect of marine biofouling on ship energy efficiency from operational data?

- **RQ1:** How does the energy inefficiency attributable to biofouling develop in the first 6 months after a cleaning event?
- **RQ2:** Can ML be applied to reliably quantify the impact of biofouling on a vessel's energy efficiency?
- **RQ3:** Do black-box models outperform white-box models to an extent that justifies their complexity and relative lack of interpretability?

The RQ structure is deliberately layered: RQ1 is empirical (what does fouling do on this vessel), RQ2 is methodological (is ML reliable enough), RQ3 is the interpretability trade-off (white-box GAM vs. black-box MLP).

## 2. Context & Motivation

Shipping carries 80% of world trade and produces ~3% of anthropogenic CO₂. Biofouling — marine organisms accumulating on the hull and propeller — is estimated to add ~USD 30bn/yr in operating costs and ~10% of fleet GHG emissions. The "fouling effect" (added shaft power needed to hold a given speed) cannot be measured directly: required power is shaped simultaneously by speed, cargo weight (draft), and weather. Traditional quantification uses CFD models or reference-model comparisons under standardized naval frameworks (e.g. ISO 19030), which depend on strict filtering and reference conditions that are often hard to apply. Improved data availability makes ML a plausible alternative — the gap the thesis targets.

## 3. Theoretical Framework

- **Ship energy efficiency** expressed via the **speed–power curve**: power rises ≈ with the cube of speed (P ∝ v³); fouling shifts the curve up (more power for same speed). Target = propeller **shaft power**; speed = **Speed Through Water (STW)**.
- **Determinants of shaft power** (naval architecture): frictional resistance (speed, water temp, fouling), wave-making resistance (speed, draft, trim, water depth), and added environmental resistance (wind, waves, swell, current — decomposed into longitudinal/transverse components). Engine/propeller signals (RPM, fuel flow) are treated as **mediators**, not drivers.
- **Biofouling dynamics:** cumulative process — biofilm (hours–days) → slime → calcareous fouling (barnacles etc., weeks), accelerated in warm, saline, slow/idle conditions. Mitigated by coatings and cleaning events.
- **Explainable AI (XAI):** black-box vs. white-box models; interpretability needed when there is "incompleteness in formalizing the problem" (Doshi-Velez & Kim). Model-agnostic tools: SHAP, LIME, PD, ICE, **ALE**. For structured tabular data with meaningful features (Rudin 2019), black-box advantages may be smaller — directly motivates RQ3.

## 4. Philosophy of Science & Research Design

- **Post-positivist:** fouling is a real phenomenon accessed only indirectly through sensors, proxies, and modeling assumptions → estimates are approximations, not exact truth.
- **Deductive:** starts from propulsion physics and known fouling behaviour, which guide framing, feature selection, and modeling.
- **Bounded quantitative single-case case study** — one vessel, one year. Generalization is **analytical, not statistical**: the goal is not a universal model but to assess ML's usefulness when traditional methods don't apply.
- **Physics-informed:** domain knowledge guides feature selection, model formulation (e.g. monotonicity constraints), and evaluation.
- **Scope limits:** open-water, steady-speed operation only; fouling treated as the isolated source of performance change; no hull-vs-propeller distinction; no maintenance-schedule optimization.

## 5. Data & Methodology

**Dataset:** 76,000 DWT Panamax bulk carrier (225 m, 9,500 kW MCR), anonymized; 1 Jan–31 Dec 2024. Three streams: 17 onboard sensor variables (15-sec), 15 hourly metocean **forecast** variables, 14 daily noon-report variables. Two cleaning events (late Jan, late July); sea-trial curves provided (pre-propeller-upgrade, image only).

**Preprocessing pipeline (5 steps):**
1. **Preliminary feature removal** — drop unreliable/empty signals; pick metocean provider MB (strongest wave-height↔power correlation).
2. **Synchronization** — Dalheim & Steen method; split into continuous time segments (≥2h), linear interpolation onto regular grids → 519 segments, 2,013,093 obs.
3. **Cleaning** — torquemeter consistency check, dropout/spike removal (rolling MAD), rolling-std filters for maneuvering, rule-based speed/RPM/power thresholds. ~50.5% of raw data removed → 1,017,126 obs.
4. **Validation** — speed–power cubic check (R²=0.53); **torquemeter recalibration discovered** (~1 Jul) producing two fuel-load↔power clouds, corrected via shared-slope offset of −1900.78 kW (post-correction corr = 0.945); wind-signal cross-check.
5. **Aggregation** — 15-min windows (circular means for directions, sums for counters); metocean matched with 4h tolerance, draft with 24h. Cleaning dates inferred from idle SOG (24 Jan, 30 Jul); pre-first-cleaning rows dropped → **final dataset: 15,061 obs**.

**Feature selection (13 features):** STW, avg draft, draft trim, **Days Since Cleaning (DSC, the fouling proxy)**, longitudinal/transverse wind, wave, and swell components, wave period, sea water temp, longitudinal current (SOG−STW). High VIFs accepted (STW 82.5; several metocean >30) because the goal is inference of the fouling effect, not isolating each coefficient. **DSC VIF = 5.7**, mainly via correlation with draft (−0.65) — flagged as a key interpretive caveat (vessel sails heavier just after cleaning).

**Models (predict shaft power):**
- **Ridge regression** — linear benchmark (λ=1).
- **GAM (white-box)** — Gaussian/identity link, 10 cubic B-splines per term, single global smoothing penalty; **monotonicity shape constraints** imposed from domain knowledge (e.g. DSC, STW increasing; water temp decreasing). Interpreted via **Partial Effect (PE) curves**. No tensor products (keeps PE curve global/interpretable — also a key limitation).
- **MLP (black-box)** — 2 hidden layers (128, 64), ReLU, Adam, early stopping, L2 (α=0.01). Interpreted post-hoc via **Accumulated Local Effects (ALE)**.

**Training & evaluation:** 80/20 random split (justified by inference focus; temporal-leakage risk low since DSC is the only time-dependent feature). Each model fitted **with and without DSC**; improvement tested with the **Wilcoxon signed-rank test**. Metrics: RMSE (primary), MAPE, MAE. Plus residual diagnostics, a controlled-variable experiment for speed–power curves, and robustness checks.

## 6. Key Findings

**Predictive performance (test RMSE, with DSC):** Ridge 458 kW → GAM 287 kW → **MLP 138 kW**. MAPE: Ridge ~13.5%, GAM 7.3%, MLP 3.2%. Including DSC improves all three models significantly (Wilcoxon p<0.0001) → the fouling proxy carries real signal.

**Fouling development (RQ1):** Both models agree on the *shape* — negligible fouling for ~2.5 months, then a sharp rise. Added power vs. unfouled baseline:
- GAM: +9.7% at 150 days, **+36.3% at 180 days**.
- MLP: +16.0% at 150 days, **+31.6% at 179 days**.
Most plausible physical reading: light slime/biofilm in the first 2.5 months, transitioning to light **calcareous fouling** by late July. Magnitudes sit inside the literature range (Schultz; Farkas; Song). Illustrative cost: ~USD 91k (MLP) / 106k (GAM) added fuel over the period vs. ~USD 15–20k for a hull clean.

**Speed–power curves & speed splits:** Only **partially credible** — design-draft curves rest almost entirely on **extrapolation** (data-support heatmaps). MLP produces physically inconsistent behaviour in sparse regions (curves crossing, non-monotonic ballast curve, shrinking fouling effect at higher speed contrary to expectation). GAM baselines closer to sea-trial magnitudes than MLP.

**Robustness checks:**
- Removing the DSC monotonicity constraint *improves* GAM accuracy (RMSE 286→275) but yields a physically incoherent (non-monotonic) PE curve → predictive quality ≠ interpretive validity (Shmueli).
- Tightening the speed rolling-std filter to the stricter DNV threshold improves all models but **cuts estimated fouling penalty substantially** (GAM −35%, MLP −64%; MLP DSC benefit becomes non-significant). → some of the original fouling estimate is likely absorbed unmodeled variance.

## 7. Conclusions (answers to the RQs)

- **RQ1:** On this vessel, fouling accumulates little for ~2.5 months then rises sharply, reaching ~31.6–36.3% added power by ~6 months — consistent with a biofilm → light calcareous progression.
- **RQ2:** Qualified yes. ML recovers a sensible, literature-consistent fouling signal and DSC adds significant predictive value, making ML a promising alternative when ISO-19030-style methods can't be applied. **But** estimates are too sensitive to preprocessing and too dependent on data coverage to support precise magnitude claims. ML is better suited to **retrospective average** fouling analysis than real-time fouling state.
- **RQ3:** No. The MLP predicts far better and captures interactions, but the accuracy gain does **not** justify the lost interpretability and its local overfitting in sparse regions. Neither model produces fully credible speed-specific estimates; the ideal likely sits between them (e.g. GAM with tensor products, or a hybrid model).

## 8. Limitations

- **Identification problem (central):** DSC is a coarse fouling proxy; engine deterioration, voyage heterogeneity, omitted variables, or noise could be partly absorbed by DSC. Confounded with draft (corr −0.65).
- **Generalizability:** single vessel, one year → conclusions are vessel- and period-specific; analytical not statistical generalization.
- **Measurement quality:** unknown noon-report time zone, hourly metocean *forecasts* (not nowcasts/hindcasts), torquemeter recalibration with undisclosed method, interpolation/tolerance-matching assumptions.
- **Data coverage:** uneven draft/loading distribution; speed-specific and design-draft curves rely on extrapolation; collinearity diagnostics (VIF) capture only linear dependence, understating concurvity.
- **Modeling setup:** 80/20 random split assumes independence despite temporal structure → possibly optimistic test performance; no trustworthy uncertainty quantification (GAM CIs invalid under dependence; MLP gives none).
- **Narrow comparison:** only 3 model classes; conclusions don't generalize to white-/black-box methods at large (a random forest tested early performed worse than the MLP).

## 9. Contribution

- **Research:** Evidence that fouling is non-linear/stage-like rather than linear in DSC; supports physics-informed ML and dual evaluation (predictive metrics **and** physical plausibility); reinforces that interpretable/semi-interpretable models stay relevant for structured physical systems; points to tensor-product GAMs and hybrid models.
- **Industry:** Cleaning schedules should be condition-based, not fixed (watch late-cycle and post-idle warm-water periods). ML is a viable fallback when reference-condition methods fail, but is data-hungry and currently better for retrospective analysis. A marginally more accurate black-box model is not worth it if its estimates are harder to trust.

---

## Anticipated Examiner Pressure Points (quick reference)

- **DSC↔draft confounding** — the single biggest threat to attribution; have a crisp defence ready.
- **Robustness sensitivity** — why trust the headline 31.6–36.3% when stricter filtering cuts it 35–64%?
- **Random split on temporal data** — defend the inference-vs-forecasting framing.
- **Extrapolation in speed–power curves** — be upfront that these are sanity checks, not estimates.
- **Inferred cleaning dates** — the whole DSC feature hinges on two visually inferred dates.
- **Why GAM additivity / no tensor products** — interpretability trade-off; flagged as the GAM's structural weakness.
