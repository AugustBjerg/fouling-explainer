// Live readout of how much MORE engine power the fouled hull demands vs. a clean one
// (addedPowerPct). Tweens as the slider moves and "warms" from signalRustDim toward
// signalRust at high fouling (via the --warmth CSS var). Shown as an estimate, not a fact.
import type { CSSProperties } from 'react'
import { addedPowerPct, foulingLevel } from '../../data/findings'
import { useTweenedNumber } from '../../hooks/useTweenedNumber'

interface AddedPowerCounterProps {
  days: number
  reducedMotion?: boolean
}

export default function AddedPowerCounter({ days, reducedMotion }: AddedPowerCounterProps) {
  const display = useTweenedNumber(addedPowerPct(days), 400, reducedMotion)
  const warmth = foulingLevel(days) // 0..1 → how warm the readout glows
  const style = { '--warmth': warmth } as CSSProperties

  return (
    <div className="counter counter--power" style={style}>
      <div className="counter__value">+{Math.round(display)}%</div>
      <div className="counter__label">Added energy consumption (est.)</div>
    </div>
  )
}
