// Three clickable dots (Problem · Findings · Implications) showing where the visitor is
// and letting them jump (docs/structure.md). The current step is marked with aria-current.
import { ACTS, type ActNumber } from '../../acts'

interface StepIndicatorProps {
  currentAct: ActNumber
  onJump: (act: ActNumber) => void
}

export default function StepIndicator({ currentAct, onJump }: StepIndicatorProps) {
  return (
    <ol className="step-indicator">
      {ACTS.map((act) => (
        <li key={act.id}>
          <button
            className="step-dot"
            aria-current={act.id === currentAct ? 'step' : undefined}
            aria-label={`Go to ${act.label}`}
            onClick={() => onJump(act.id)}
          >
            <span className="step-dot__mark" />
            <span className="step-dot__label">{act.label}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}
