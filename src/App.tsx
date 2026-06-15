// Root component. Holds the tiny app state (docs/structure.md) and renders the persistent
// gliding hull plus the active act. Everything visual is DERIVED from these few values.
//   currentAct        — which act is showing (1 | 2 | 3)
//   daysSinceCleaning — 0..180, the Act 2 control; persists across acts
//   prefersReducedMotion — from the OS
//
// There is no bottom control bar: each act carries its own in-act nav (Act 1's hand-off CTA,
// Act 2's Back/forward, Act 3's Back + closing links). Arrow keys still step between acts.
import { useEffect, useState } from 'react'
import { ACTS, HULL_FRAMING, act2DiveTransform, type ActNumber } from './acts'
import { motion } from './theme'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import Hull from './components/hull/Hull'
import Act1Problem from './components/acts/Act1Problem'
import Act2Findings from './components/acts/Act2Findings'
import Act3Implications from './components/acts/Act3Implications'

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

  // Viewport aspect drives the Act 2 dive (so the waterline parks just off the top on any screen
  // shape — see act2DiveTransform). Tracked live so it stays correct on resize / rotate.
  const [aspect, setAspect] = useState(() =>
    typeof window === 'undefined' ? 16 / 9 : window.innerWidth / window.innerHeight,
  )
  useEffect(() => {
    const onResize = () => setAspect(window.innerWidth / window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goNext = () =>
    setCurrentAct((a) => Math.min(ACTS.length, a + 1) as ActNumber)
  const goBack = () => setCurrentAct((a) => Math.max(1, a - 1) as ActNumber)

  // Keyboard wayfinding (the visible nav is each act's own CTA). → / ← step between acts.
  // Skip Act 1 for →: there (and in Act 3) scrolling drives the beats and the in-act CTA advances.
  // Ignore keys while a form control (the Act 2 slider) is focused so arrows still scrub it.
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

  // Act 2 is the slow, cinematic dive below the waterline; the surface acts glide quickly.
  const glideMs = currentAct === 2 ? motion.glideSlowMs : motion.glideMs

  // Act 2's framing is computed from the live aspect; Acts 1 & 3 are static.
  const hullTransform = currentAct === 2 ? act2DiveTransform(aspect) : HULL_FRAMING[currentAct]

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

        <div
          className="hull-stage"
          style={{ transform: hullTransform, transitionDuration: `${glideMs}ms` }}
        >
          <Hull days={hullDays} reducedMotion={prefersReducedMotion} clearWater={currentAct === 2} />
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
          <Act3Implications onBack={goBack} reducedMotion={prefersReducedMotion} />
        )}
      </div>
    </div>
  )
}
