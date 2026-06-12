// Act 3 — The implications. Three takeaways + the two CTA links. Hull glides to the stern,
// clean again (the "after cleaning" payoff). Copy from docs/content.md.
import { modelAccuracy } from '../../data/findings'

// TODO(links): August to provide. Until then these point nowhere — keep target/rel intact.
const THESIS_PDF_URL = '#' // <THESIS_PDF_URL>
const GITHUB_REPO_URL = '#' // <GITHUB_REPO_URL>

export default function Act3Implications() {
  return (
    <section className="act" aria-labelledby="act3-title">
      <p className="act__eyebrow">The implications</p>
      <h1 id="act3-title" className="act__title">
        Clean on condition, not on the calendar.
      </h1>

      <ul className="act__beats">
        <li className="act__beat">
          <strong>For operators:</strong> don't clean on a fixed schedule. Fouling barely moves
          for months, then takes off — clean on the ship's actual condition, watching the danger
          zones: warm water and time spent slow or idle.
        </li>
        <li className="act__beat">
          <strong>For the method:</strong> when the standard physics-based tools can't be
          applied, machine learning is a viable fallback — best as a look-back tool (what did
          fouling cost us last voyage), not a live gauge.
        </li>
        <li className="act__beat">
          <strong>The broader lesson:</strong> a model you can understand and trust beat the
          fancier one here ({modelAccuracy.gam.errorPct}% vs {modelAccuracy.mlp.errorPct}% error).
          For physical systems with meaningful measurements, interpretable models stay relevant.
        </li>
      </ul>

      <p className="act__lead">
        The cost of a dirty hull is invisible — until you measure it. Then it's obvious what to do.
      </p>

      <div className="cta-links">
        <a className="cta-link" href={THESIS_PDF_URL} target="_blank" rel="noopener noreferrer">
          Read the full thesis →
        </a>
        <a className="cta-link" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          View the code on GitHub →
        </a>
      </div>
    </section>
  )
}
