// Act 2 — the interactive centerpiece, laid over the dived-underwater hull. Two big readouts
// sit on the red anti-fouling hull (left = added fuel cost, right = added energy consumption);
// the fouling slider + nav sit at the bottom, in the water. Dragging the slider fouls the hull
// (owned by App) and drives both readouts.
//
// The numbers are the REAL per-day MLP figures (findings.ts → FOULING_TABLE, from the thesis
// CSV; the raw curve's mid-period negative dip is smoothed over on load). Shown with an explicit
// + sign (signDisplay handles the rare zero/negative cleanly).
import type { CSSProperties } from 'react'
import FoulingSlider from '../controls/FoulingSlider'
import { addedPowerPct, fuelCostPerDayUsd, foulingLevel } from '../../data/findings'
import { useTweenedNumber } from '../../hooks/useTweenedNumber'

interface Act2FindingsProps {
  days: number
  onDaysChange: (days: number) => void
  reducedMotion?: boolean
  /** Step back to Act 1 (no bottom control bar — each act carries its own nav). */
  onBack: () => void
  /** Advance to Act 3. */
  onNext: () => void
}

// Whole numbers with an explicit +/- sign (nothing for exact zero).
const signed = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, signDisplay: 'exceptZero' })

export default function Act2Findings({ days, onDaysChange, reducedMotion, onBack, onNext }: Act2FindingsProps) {
  const fuelCost = useTweenedNumber(fuelCostPerDayUsd(days), 400, reducedMotion)
  const energyPct = useTweenedNumber(addedPowerPct(days), 400, reducedMotion)
  // Both readouts "warm" from dim to rust as fouling rises (matches the design system).
  const warmStyle = { '--warmth': foulingLevel(days) } as CSSProperties

  return (
    <section className="act2" aria-label="What a fouled hull costs">
      {/* Big readouts over the red hull */}
      <div className="act2__readouts" aria-live="polite">
        <div className="act2__readout" style={warmStyle}>
          <div className="act2__value">
            {signed.format(Math.round(fuelCost))}
            <span className="act2__unit">USD/day</span>
          </div>
          <div className="act2__caption">additional fuel cost</div>
        </div>
        <div className="act2__readout" style={warmStyle}>
          <div className="act2__value">
            {signed.format(Math.round(energyPct))}
            <span className="act2__unit">%</span>
          </div>
          <div className="act2__caption">additional energy consumption</div>
        </div>
      </div>

      {/* Controls in the water, at the bottom */}
      <div className="act2__controls">
        <div className="act2__controls-inner">
          <FoulingSlider days={days} onChange={onDaysChange} />
          <div className="act__nav">
            <button type="button" className="cta-link cta-link--ghost" onClick={onBack}>
              ← Back
            </button>
            <button type="button" className="cta-link" onClick={onNext}>
              What this means →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
