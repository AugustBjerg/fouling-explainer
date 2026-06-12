// Back / Next buttons that move between acts, plus keyboard handling for the whole page:
// → or Space = Next, ← = Back (docs/structure.md). Advancing is always a deliberate action.
import { useEffect } from 'react'
import { ACTS, type ActNumber } from '../../acts'

interface StepNavProps {
  currentAct: ActNumber
  onBack: () => void
  onNext: () => void
}

export default function StepNav({ currentAct, onBack, onNext }: StepNavProps) {
  const meta = ACTS.find((a) => a.id === currentAct)!
  const isFirst = currentAct === 1
  const isLast = currentAct === ACTS.length

  // Page-level keyboard navigation. Ignore when focus is in the slider so arrows still
  // scrub it; otherwise → / Space advance, ← goes back.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (!isLast) {
          e.preventDefault()
          onNext()
        }
      } else if (e.key === 'ArrowLeft') {
        if (!isFirst) {
          e.preventDefault()
          onBack()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFirst, isLast, onNext, onBack])

  return (
    <div className="step-nav">
      <button className="btn" onClick={onBack} disabled={isFirst} aria-label="Previous section">
        Back
      </button>
      {!isLast && (
        <button className="btn btn--primary" onClick={onNext}>
          {meta.nextLabel ?? 'Next'}
        </button>
      )}
    </div>
  )
}
