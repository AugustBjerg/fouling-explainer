// The Act 2 centerpiece control. Maps a range input to daysSinceCleaning (0..180). As the
// visitor drags, the parent re-derives the hull + readouts — this component just owns the
// input and its accessible labelling. Marks the ~day-75 "barnacles start" point and day 180.
import { DAYS, addedPowerPct } from '../../data/findings'

interface FoulingSliderProps {
  days: number
  onChange: (days: number) => void
}

const BARNACLE_DAY = 75 // when added power starts to spike (docs/content.md)

export default function FoulingSlider({ days, onChange }: FoulingSliderProps) {
  const pct = (d: number) => ((d - DAYS.min) / (DAYS.max - DAYS.min)) * 100

  return (
    <div className="fouling-control">
      <label className="fouling-control__label" htmlFor="fouling-slider">
        Days since the hull was cleaned:{' '}
        <span className="fouling-control__value">{Math.round(days)}</span>
      </label>
      <input
        id="fouling-slider"
        className="fouling-slider"
        type="range"
        min={DAYS.min}
        max={DAYS.max}
        step={1}
        value={days}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${Math.round(days)} days since cleaning, about +${Math.round(
          addedPowerPct(days),
        )} percent added power`}
      />
      {/* track markers for the two storytelling moments */}
      <div className="fouling-control__ticks" aria-hidden="true">
        <span className="fouling-control__tick" style={{ left: `${pct(BARNACLE_DAY)}%` }}>
          ~day {BARNACLE_DAY}: barnacles start
        </span>
        <span className="fouling-control__tick" style={{ left: `${pct(DAYS.max)}%` }}>
          day {DAYS.max}
        </span>
      </div>
    </div>
  )
}
