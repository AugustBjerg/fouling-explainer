// Root component. Holds the tiny app state (docs/structure.md) and renders the persistent
// gliding hull plus the active act. Everything visual is DERIVED from these few values.
//   currentAct        — which act is showing (1 | 2 | 3)
//   daysSinceCleaning — 0..180, the Act 2 control; persists across acts
//   prefersReducedMotion — from the OS
//
// There is no bottom control bar: each act hands off via its own in-act CTA (Act 1's "Dive
// deeper", Act 2's "What this means"). Arrow keys still step between acts for keyboard users.
import { useEffect, useState } from 'react'
import { ACTS, HULL_FRAMING, type ActNumber } from './acts'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import Hull from './components/hull/Hull'
import Act1Problem from './components/acts/Act1Problem'
import Act2Findings from './components/acts/Act2Findings'
import ActPlaceholder from './components/acts/ActPlaceholder'

// A handful of slow ambient particles (positions/timing fixed so they don't reshuffle).
const PARTICLES = [
  { left: '12%', delay: '0s', duration: '15s' },
  { left: '28%', delay: '4s', duration: '18s' },
  { left: '44%', delay: '8s', duration: '13s' },
  { left: '60%', delay: '2s', duration: '20s' },
  { left: '73%', delay: '6s', duration: '16s' },
  { left: '88%', delay: '10s', duration: '19s' },
]

export default function App() {
  const [currentAct, setCurrentAct] = useState<ActNumber>(1)
  const [daysSinceCleaning, setDaysSinceCleaning] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const goNext = () =>
    setCurrentAct((a) => Math.min(ACTS.length, a + 1) as ActNumber)
  const goBack = () => setCurrentAct((a) => Math.max(1, a - 1) as ActNumber)

  // Keyboard wayfinding (the visible nav is each act's own CTA). → / ← step between acts.
  // Skip Act 1 for →: there, scrolling drives the beats and "Dive deeper" advances. Ignore
  // keys while a form control (the Act 2 slider) is focused so arrows still scrub it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight' && currentAct > 1 && currentAct < ACTS.length) {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' && currentAct > 1) {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentAct])

  // The hull only shows the visitor's fouling in Act 2; Act 1 and Act 3 read as clean
  // (the "before" and the "after a clean" payoff). The set value still persists in state,
  // so returning to Act 2 restores where they left the slider.
  const hullDays = currentAct === 2 ? daysSinceCleaning : 0

  return (
    <div className={`app${prefersReducedMotion ? ' reduced-motion' : ''}`}>
      <div className="scene">
        <div className="ambient" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="ambient__particle"
              style={{ left: p.left, top: '70%', animationDelay: p.delay, animationDuration: p.duration }}
            />
          ))}
        </div>

        <div className="hull-stage" style={{ transform: HULL_FRAMING[currentAct] }}>
          <Hull days={hullDays} reducedMotion={prefersReducedMotion} />
        </div>

        <div className="vignette" aria-hidden="true" />

        {currentAct === 1 && (
          <Act1Problem onAdvance={goNext} reducedMotion={prefersReducedMotion} />
        )}
        {currentAct === 2 && (
          <Act2Findings
            days={daysSinceCleaning}
            onDaysChange={setDaysSinceCleaning}
            reducedMotion={prefersReducedMotion}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {currentAct === 3 && (
          <ActPlaceholder label="Act 3 · Implications" onBack={goBack} />
        )}
      </div>
    </div>
  )
}
