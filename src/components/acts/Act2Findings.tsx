// Act 2 — The findings (the interactive centerpiece). The visitor drags the slider; the
// persistent hull (owned by App) fouls in sync while these readouts climb. No plotted
// chart, no quoted percentages thrown at them — they FEEL the curve by dragging. Copy and
// numbers from docs/content.md.
import FoulingSlider from '../controls/FoulingSlider'
import AddedPowerCounter from '../ui/AddedPowerCounter'
import FuelCostCounter from '../ui/FuelCostCounter'
import StatCard from '../ui/StatCard'
import { foulingStage, vessel, modelAccuracy, money } from '../../data/findings'

interface Act2FindingsProps {
  days: number
  onDaysChange: (days: number) => void
  reducedMotion?: boolean
  /** Step back to Act 1 (no bottom control bar — each act carries its own nav). */
  onBack: () => void
  /** Advance to Act 3. */
  onNext: () => void
}

export default function Act2Findings({ days, onDaysChange, reducedMotion, onBack, onNext }: Act2FindingsProps) {
  return (
    <section className="act" aria-labelledby="act2-title">
      <p className="act__eyebrow">The findings</p>
      <h1 id="act2-title" className="act__title">
        Watch what a dirty hull actually costs.
      </h1>
      <p className="act__lead">
        One {vessel.lengthMetres} m, {vessel.deadweightTonnes.toLocaleString()}-tonne{' '}
        {vessel.type}. A full year of data. Drag time forward from a freshly cleaned hull.
      </p>

      <div className="readouts">
        <AddedPowerCounter days={days} reducedMotion={reducedMotion} />
        <FuelCostCounter days={days} reducedMotion={reducedMotion} />
        <div className="counter">
          <div className="stage-label">{foulingStage(days)}</div>
          <div className="counter__label">Hull condition</div>
        </div>
      </div>

      <FoulingSlider days={days} onChange={onDaysChange} />

      <div className="stat-cards">
        <StatCard
          value={`$${money.hullCleaningUsd.min / 1000}–${money.hullCleaningUsd.max / 1000}k`}
          label="cost of one hull cleaning"
          note="Left fouled long enough, the added fuel per day dwarfs this one-off cost."
        />
        <StatCard
          value={`${modelAccuracy.gam.errorPct}% vs ${modelAccuracy.mlp.errorPct}%`}
          label="simple model vs. black-box error"
          note="The simple, explainable model nearly matched the neural net — and you could see why it said what it did."
        />
      </div>

      <p className="act__transition">
        One ship, one year. Treat the shape and scale as the finding — not the decimal places.
      </p>

      <div className="act__nav">
        <button type="button" className="cta-link cta-link--ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="cta-link" onClick={onNext}>
          What this means →
        </button>
      </div>
    </section>
  )
}
