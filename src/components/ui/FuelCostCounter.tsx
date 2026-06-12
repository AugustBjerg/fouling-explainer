// Live readout of the estimated EXTRA fuel cost per day from fouling (fuelCostPerDayUsd).
// Tweens with the slider and warms like the power counter. Left high long enough, this
// per-day number dwarfs the one-off cost of a hull cleaning — that's the point.
import type { CSSProperties } from 'react'
import { fuelCostPerDayUsd, foulingLevel } from '../../data/findings'
import { useTweenedNumber } from '../../hooks/useTweenedNumber'

interface FuelCostCounterProps {
  days: number
  reducedMotion?: boolean
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export default function FuelCostCounter({ days, reducedMotion }: FuelCostCounterProps) {
  const display = useTweenedNumber(fuelCostPerDayUsd(days), 400, reducedMotion)
  const warmth = foulingLevel(days)
  const style = { '--warmth': warmth } as CSSProperties

  return (
    <div className="counter counter--cost" style={style}>
      <div className="counter__value">{usd.format(Math.round(display))}</div>
      <div className="counter__label">Added fuel cost per day (est.)</div>
    </div>
  )
}
