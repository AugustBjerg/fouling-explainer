// Act 1 — The problem. Copy from docs/content.md. In ~15 seconds: fouling is real, hidden,
// and expensive. Quiet context StatCards set the stakes; the clean hull sits above.
import StatCard from '../ui/StatCard'
import { context } from '../../data/findings'

export default function Act1Problem() {
  return (
    <section className="act" aria-labelledby="act1-title">
      <p className="act__eyebrow">The problem</p>
      <h1 id="act1-title" className="act__title">
        The ocean is slowly eating your fuel budget.
      </h1>

      <ul className="act__beats">
        <li className="act__beat">
          <strong>Ships move the world.</strong> About {context.tradeSharePct}% of world trade
          travels by sea, producing roughly {context.co2SharePct}% of global CO₂ — on par with a
          large industrial country.
        </li>
        <li className="act__beat">
          <strong>The hidden tax.</strong> Below the waterline, marine life — slime, then algae,
          then barnacles — grows on the hull. This <em>biofouling</em> adds drag, so the engine
          burns more fuel to hold the same speed.
        </li>
        <li className="act__beat">
          <strong>Why it's sneaky.</strong> You can't see it from the bridge, and you can't
          measure it directly — the fouling signal hides inside speed, loading, and weather.
        </li>
      </ul>

      <div className="stat-cards">
        <StatCard value={`${context.tradeSharePct}%`} label="of world trade carried by ships" />
        <StatCard value={`~${context.co2SharePct}%`} label="of global CO₂ emissions" />
        <StatCard
          value={`~$${context.annualCostUsdBn}bn`}
          label="estimated yearly cost of biofouling"
          note={`≈ ${context.ghgSharePct}% of shipping's greenhouse-gas emissions`}
        />
      </div>

      <p className="act__transition">
        So how bad does it actually get? We took one ship and one year of data and measured it.
      </p>
    </section>
  )
}
