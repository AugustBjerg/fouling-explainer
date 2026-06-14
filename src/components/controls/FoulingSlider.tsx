// The Act 2 centerpiece control. Maps a range input to daysSinceCleaning (0..180). As the
// visitor drags, the parent re-derives the hull + readouts — this component just owns the
// input and its accessible labelling.
//
// PERFORMANCE: the thumb is mirrored in local state so it tracks the pointer instantly, while
// the parent (which re-fouls the whole hull) is notified at most once per animation frame. That
// way a heavy hull render can never make the slider itself feel laggy.
import { useEffect, useRef, useState } from 'react'
import { DAYS, addedPowerPct } from '../../data/findings'

interface FoulingSliderProps {
  days: number
  onChange: (days: number) => void
}

export default function FoulingSlider({ days, onChange }: FoulingSliderProps) {
  const [value, setValue] = useState(days)
  const frame = useRef<number | null>(null)
  const latest = useRef(days)

  // Sync if the value changes from OUTSIDE a drag (e.g. reset between acts). Ignore the parent's
  // echo of a value we just sent (days === latest) so the thumb never snaps backward mid-drag.
  useEffect(() => {
    if (days !== latest.current) {
      latest.current = days
      setValue(days)
    }
  }, [days])

  // Drop any pending frame on unmount.
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  function handleInput(next: number) {
    setValue(next) // instant thumb
    latest.current = next
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        onChange(latest.current) // throttled hull update
      })
    }
  }

  return (
    <div className="fouling-control">
      <label className="fouling-control__label" htmlFor="fouling-slider">
        Days since the hull was cleaned:{' '}
        <span className="fouling-control__value">{Math.round(value)}</span>
      </label>
      <input
        id="fouling-slider"
        className="fouling-slider"
        type="range"
        min={DAYS.min}
        max={DAYS.max}
        step={1}
        value={value}
        onChange={(e) => handleInput(Number(e.target.value))}
        aria-valuetext={`${Math.round(value)} days since cleaning, about ${Math.round(
          addedPowerPct(value),
        )} percent added power`}
      />
    </div>
  )
}
