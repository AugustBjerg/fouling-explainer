// ALL thesis numbers live here, plus the pure functions that turn `daysSinceCleaning`
// (0-180) into everything the visuals and readouts show. Components import from here and
// stay dumb — they never hard-code a figure. Values are from docs/content.md.
//
// NOTE: the fouling *curve* and the fuel-cost assumptions below are FIRST-DRAFT estimates
// built from the anchor points in docs/content.md. Every such spot is marked `TODO(curve)`
// or `TODO(assumption)` — refine them when August provides finer data / confirms the
// fuel-price basis. The hull visuals and readouts already read from these, so updating a
// number here updates the whole site.

// ---------------------------------------------------------------------------------------
// Context stats (docs/content.md → Key numbers → Context) — used by Act 1 StatCards.
// ---------------------------------------------------------------------------------------
export const context = {
  tradeSharePct: 80, // share of world trade carried by ships
  co2SharePct: 3, // shipping's share of global anthropogenic CO2
  annualCostUsdBn: 30, // estimated industry-wide annual cost of biofouling
  ghgSharePct: 10, // biofouling's share of fleet GHG emissions
} as const

// ---------------------------------------------------------------------------------------
// The anonymized case-study vessel (docs/content.md → The case-study vessel).
// ---------------------------------------------------------------------------------------
export const vessel = {
  type: 'Panamax bulk carrier',
  deadweightTonnes: 76_000,
  lengthMetres: 225,
  maxEnginePowerKw: 9_500,
  dataYear: 2024,
  cleanedObservations: 15_061,
} as const

// ---------------------------------------------------------------------------------------
// Model accuracy (docs/content.md → Model accuracy) — the "simple ≈ complex" point.
// ---------------------------------------------------------------------------------------
export const modelAccuracy = {
  ridge: { label: 'Ridge (basic linear)', rmseKw: 458, errorPct: 13.5 },
  gam: { label: 'GAM (interpretable)', rmseKw: 287, errorPct: 7.3 },
  mlp: { label: 'MLP (black-box)', rmseKw: 138, errorPct: 3.2 },
} as const

// ---------------------------------------------------------------------------------------
// The money (docs/content.md → The money comparison).
// ---------------------------------------------------------------------------------------
export const money = {
  hullCleaningUsd: { min: 15_000, max: 20_000 }, // cost of one hull cleaning
  cumulativeExtraFuelUsd: { mlp: 91_000, gam: 106_000 }, // over the ~6-month period
  // TODO(assumption): these drive fuelCostPerDayUsd(); confirm the basis with August.
  cleanFuelBurnTonnesPerDay: 22, // a Panamax bulk carrier's clean main-engine burn (est.)
  fuelPriceUsdPerTonne: 600, // VLSFO price assumption (est.)
} as const

// ---------------------------------------------------------------------------------------
// Master input range (docs/design.md → semantic visual-variable system).
// ---------------------------------------------------------------------------------------
export const DAYS = { min: 0, max: 180 } as const

// ---------------------------------------------------------------------------------------
// Added-power curve. Anchor points are the blended estimate from docs/content.md:
// negligible (~0-2%) plateau to ~day 75, then steep — ~+13% @150d, ~+34% @180d. The real
// GAM/MLP curves (docs/content.md) bracket this; treat shape & scale as the finding.
// TODO(curve): replace linear interpolation with the real per-model curve if provided.
// ---------------------------------------------------------------------------------------
const ADDED_POWER_ANCHORS: ReadonlyArray<readonly [days: number, pct: number]> = [
  [0, 0],
  [75, 2], // end of the slime plateau
  [150, 13],
  [180, 34],
]

/** Extra engine power needed vs. a clean hull, as a percentage (e.g. 34 = +34%). */
export function addedPowerPct(days: number): number {
  return interpolate(clampDays(days), ADDED_POWER_ANCHORS)
}

/** Estimated *added* fuel cost per day, in USD, from addedPowerPct and the fuel assumptions. */
export function fuelCostPerDayUsd(days: number): number {
  const extraFraction = addedPowerPct(days) / 100
  return (
    extraFraction * money.cleanFuelBurnTonnesPerDay * money.fuelPriceUsdPerTonne
  )
}

// ---------------------------------------------------------------------------------------
// Fouling stage label (docs/design.md → Fouling stages → what's on screen).
// ---------------------------------------------------------------------------------------
export type FoulingStageLabel = 'Clean' | 'Biofilm' | 'Slime' | 'Barnacles'

export function foulingStage(days: number): FoulingStageLabel {
  const d = clampDays(days)
  if (d < 5) return 'Clean'
  if (d < 30) return 'Biofilm'
  if (d < 75) return 'Slime'
  return 'Barnacles'
}

// ---------------------------------------------------------------------------------------
// Master derived value + the per-variable visual ramps (docs/design.md → variable table).
// Each visual variable maps to exactly one visible thing. ramp() is clamped linear 0..1.
// ---------------------------------------------------------------------------------------

/** 0.0 (pristine) -> 1.0 (heavily fouled ~180d). Overall fouling, slow then steep. */
export function foulingLevel(days: number): number {
  // TODO(curve): tie this to the real curve; for now reuse the added-power shape, normalized.
  return addedPowerPct(days) / addedPowerPct(DAYS.max)
}

/** Opacity of the slime/biofilm film. Ramps ~5->60 days, maxes ~0.6 (a thin sheen). */
export function slimeOpacity(days: number): number {
  return ramp(days, 5, 60) * 0.6
}

/** Fraction of hull covered by algae patches. Ramps ~30->120 days. */
export function algaeCoverage(days: number): number {
  return ramp(days, 30, 120)
}

/** How many barnacles to draw (0 -> ~40). Ramps ~75->180 days. */
export function barnacleDensity(days: number): number {
  const MAX_BARNACLES = 40
  return Math.round(ramp(days, 75, 180) * MAX_BARNACLES)
}

/** Scale multiplier of each barnacle (0 -> 1, full-size). Ramps ~75->180 days. */
export function barnacleSize(days: number): number {
  return ramp(days, 75, 180)
}

/** Overall darkening/desaturation of the clean plating. Ramps ~10->180 days. */
export function hullGrime(days: number): number {
  return ramp(days, 10, 180)
}

// ---------------------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------------------
function clampDays(days: number): number {
  return Math.min(DAYS.max, Math.max(DAYS.min, days))
}

/** Clamped linear ramp: 0 at/below `start`, 1 at/above `end`. */
function ramp(days: number, start: number, end: number): number {
  const d = clampDays(days)
  if (d <= start) return 0
  if (d >= end) return 1
  return (d - start) / (end - start)
}

/** Piecewise-linear interpolation across sorted [x, y] anchor points. */
function interpolate(
  x: number,
  anchors: ReadonlyArray<readonly [number, number]>,
): number {
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1]
    const [x1, y1] = anchors[i]
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return y0 + t * (y1 - y0)
    }
  }
  return anchors[anchors.length - 1][1]
}
