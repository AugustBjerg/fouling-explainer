// ALL thesis numbers live here, plus the pure functions that turn `daysSinceCleaning`
// (0-180) into everything the visuals and readouts show. Components import from here and
// stay dumb — they never hard-code a figure. Values are from docs/content.md.
//
// NOTE: the fouling *curve* and the fuel-cost assumptions below are FIRST-DRAFT estimates
// built from the anchor points in docs/content.md. Every such spot is marked `TODO(curve)`
// or `TODO(assumption)` — refine them when August provides finer data / confirms the
// fuel-price basis. The hull visuals and readouts already read from these, so updating a
// number here updates the whole site.

// The real per-day figures (Act 2 readouts) come from the bundled MLP results CSV, imported as
// a string and parsed once below (see FOULING_TABLE).
import tableCsv from './mlp_fouling_fuel_table.csv?raw'

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
  avgSpeedKnots: 11, // the speed the added-power estimate is anchored to (it varies with speed)
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
  fuelPriceUsdPerTonne: 626, // VLSFO, Global 4 ports 2024 average (confirmed by August)
} as const

// ---------------------------------------------------------------------------------------
// Master input range (docs/design.md → semantic visual-variable system).
// ---------------------------------------------------------------------------------------
export const DAYS = { min: 0, max: 180 } as const

// ---------------------------------------------------------------------------------------
// Real per-day figures (the Act 2 readouts). These are the ACTUAL MLP-model results from the
// thesis, loaded from src/data/mlp_fouling_fuel_table.csv — not estimates. The raw curve dips
// slightly NEGATIVE through the middle of the period (the model briefly predicts below the clean
// baseline). Those negative values are smoothed over ON LOAD — replaced by a straight line
// between the nearest non-negative days (fillNegatives) — so the readouts never show a negative.
// The CSV itself is left untouched as the true record.
// ---------------------------------------------------------------------------------------
export interface FoulingDatum {
  day: number
  addedFuelCostUsdPerDay: number
  addedPowerKw: number
  addedPowerPct: number
}

/** One row per day, day 0..180 (so index === day). Parsed once from the bundled CSV. */
export const FOULING_TABLE: readonly FoulingDatum[] = parseFoulingTable(tableCsv)

function parseFoulingTable(csv: string): FoulingDatum[] {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .slice(1) // skip the header row
    .map((line) => line.split(',').map(Number))

  // Sanitize each value column independently: any negative reading is replaced by interpolating
  // between the nearest non-negative days around it.
  const cost = fillNegatives(rows.map((r) => r[1]))
  const kw = fillNegatives(rows.map((r) => r[2]))
  const pct = fillNegatives(rows.map((r) => r[3]))

  return rows.map((r, i) => ({
    day: r[0],
    addedFuelCostUsdPerDay: cost[i],
    addedPowerKw: kw[i],
    addedPowerPct: pct[i],
  }))
}

/** Replaces each run of negative values with a straight line between the nearest non-negative
 *  values on either side (held flat if a run reaches an end of the series). */
function fillNegatives(values: number[]): number[] {
  const out = values.slice()
  let i = 0
  while (i < out.length) {
    if (out[i] >= 0) {
      i++
      continue
    }
    let end = i // first index after the negative run
    while (end < out.length && out[end] < 0) end++
    const before = i - 1 // nearest non-negative before the run (-1 if none)
    const after = end // nearest non-negative after the run (length if none)
    for (let k = i; k < end; k++) {
      if (before >= 0 && after < out.length) {
        const t = (k - before) / (after - before)
        out[k] = values[before] + (values[after] - values[before]) * t
      } else if (before >= 0) {
        out[k] = values[before]
      } else if (after < out.length) {
        out[k] = values[after]
      } else {
        out[k] = 0
      }
    }
    i = end
  }
  return out
}

/** Reads a column at `days`, linearly interpolating between rows (so a tween through fractional
 *  days stays smooth) and clamping to the 0..180 range. */
function lookup(days: number, key: keyof Omit<FoulingDatum, 'day'>): number {
  const d = clampDays(days)
  const lo = FOULING_TABLE[Math.floor(d)]
  const hi = FOULING_TABLE[Math.min(FOULING_TABLE.length - 1, Math.ceil(d))]
  return lo[key] + (hi[key] - lo[key]) * (d - Math.floor(d))
}

/** Extra engine power vs. a clean hull, as a percentage (from the table; negatives smoothed). */
export function addedPowerPct(days: number): number {
  return lookup(days, 'addedPowerPct')
}

/** Extra engine power vs. a clean hull, in kW (REAL). */
export function addedPowerKw(days: number): number {
  return lookup(days, 'addedPowerKw')
}

/** Added fuel cost per day, in USD (REAL). */
export function fuelCostPerDayUsd(days: number): number {
  return lookup(days, 'addedFuelCostUsdPerDay')
}

// ---------------------------------------------------------------------------------------
// Readout footnotes — the bullet text shown in the hover "info" boxes next to each Act 2
// readout (the assumptions + method behind each figure). Numbers reference the constants
// above so each one still has a single home.
// ---------------------------------------------------------------------------------------
export const readoutNotes = {
  fuelCost: [
    `For a ${vessel.deadweightTonnes.toLocaleString('en-US')} deadweight tonnage Panamax bulk carrier`,
    `Assuming a fuel price of ${money.fuelPriceUsdPerTonne} USD/ton (VLSFO, Global 4 ports 2024 average)`,
    'Assuming 24h operation',
  ],
  energyConsumption: [
    'Measured as power in the propeller shaft',
    'Estimated using a neural network and accumulated local effects',
    `Varies with speed. Estimate based on average speed of ~${vessel.avgSpeedKnots} knots`,
  ],
} as const

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

// Smooth, monotonic fouling INTENSITY (0..1), for visuals only — it drives the readout "warmth"
// colour. Deliberately decoupled from the real table above: a colour ramp should rise steadily
// with neglect, not flicker with model noise or dip negative mid-period. Shape mirrors the
// headline story (flat to ~day 75, then steep).
const FOULING_INTENSITY_ANCHORS: ReadonlyArray<readonly [days: number, level: number]> = [
  [0, 0],
  [75, 0.06],
  [150, 0.4],
  [180, 1],
]

/** 0.0 (pristine) -> 1.0 (heavily fouled ~180d). Overall fouling, slow then steep. */
export function foulingLevel(days: number): number {
  return interpolate(clampDays(days), FOULING_INTENSITY_ANCHORS)
}

/** Opacity of the slime/biofilm film. Ramps ~5->60 days, maxes ~0.32 (a thin translucent
 *  sheen — the SlimeLayer also fades it toward the keel so it never clouds the whole view). */
export function slimeOpacity(days: number): number {
  return ramp(days, 5, 60) * 0.32
}

/** Fraction of hull covered by algae patches. Ramps ~30->120 days. */
export function algaeCoverage(days: number): number {
  return ramp(days, 30, 120)
}

/** How many barnacles to draw (0 -> ~75). Ramps ~75->180 days. */
export function barnacleDensity(days: number): number {
  const MAX_BARNACLES = 75 // must match Hull.tsx ALL_BARNACLES ceiling
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
