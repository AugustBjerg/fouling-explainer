// ALL thesis numbers live here as typed constants, and the derivation functions that
// turn `daysSinceCleaning` (0–180) into everything the visuals and readouts show.
// Components import from here — never hard-code a figure in a component.
//
// TODO: populate every value and function body from docs/content.md ("Key numbers")
// and docs/design.md (the visual-variable table). Nothing real is filled in yet — the
// stubs below define the shape only. Do NOT invent figures; copy them from docs/content.md.

/** Master input the visitor controls in Act 2. */
export const DAYS_RANGE = { min: 0, max: 180 } as const

/** Context stats for Act 1 (TODO: fill from docs/content.md "Context"). */
export const context = {
  // tradeSharePct, co2SharePct, annualCostUsdBn, ghgSharePct …
} as const

/** The anonymized case-study vessel (TODO: fill from docs/content.md). */
export const vessel = {
  // type, dwt, lengthM, maxPowerKw, dataYear, observations …
} as const

/** Fouling stage labels shown next to the hull (TODO: from docs/design.md stage table). */
export type FoulingStageLabel = 'Clean' | 'Biofilm' | 'Slime' | 'Barnacles'

// --- Derivation functions (pure; visuals + readouts both call these so they stay in sync) ---

/** 0.0 (pristine) → 1.0 (heavily fouled ~180d). TODO: implement the content.md curve. */
export function foulingLevel(_days: number): number {
  return 0 // TODO
}

/** Extra engine power vs. a clean hull, e.g. ~0% → ~+34% @180d. TODO: implement. */
export function addedPowerPct(_days: number): number {
  return 0 // TODO
}

/** Estimated added fuel cost per day (USD). TODO: addedPowerPct × burn × price assumption. */
export function fuelCostPerDayUsd(_days: number): number {
  return 0 // TODO
}

/** Which stage label to show. TODO: map from the docs/design.md stage table. */
export function foulingStage(_days: number): FoulingStageLabel {
  return 'Clean' // TODO
}
