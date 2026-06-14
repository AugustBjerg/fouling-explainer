// A small "info" affordance: an ⓘ button that reveals a bullet-list note. Driven by hover,
// but also opens on keyboard focus and tap (the CSS keys off :hover AND :focus-within) so it
// works on touch and for screen readers. Purely presentational — the bullets come from the caller.
import { useId } from 'react'

interface InfoTipProps {
  /** Accessible label for the button, e.g. "About the added fuel cost". */
  label: string
  /** The lines shown in the popover, one bullet each. */
  bullets: readonly string[]
}

export default function InfoTip({ label, bullets }: InfoTipProps) {
  const tipId = useId()
  return (
    <span className="infotip">
      <button
        type="button"
        className="infotip__button"
        aria-label={label}
        aria-describedby={tipId}
      >
        i
      </button>
      <span role="tooltip" id={tipId} className="infotip__box">
        <ul className="infotip__list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </span>
    </span>
  )
}
