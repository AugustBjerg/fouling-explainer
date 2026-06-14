// Act 1 = The problem, as scrollytelling (docs/act1-design-spec.md). The ship is FIXED at the
// bottom (rendered by App, clean throughout); scrolling swaps the intro copy in the top "sky
// zone" through six beats. State 0 is the headline; state 5 is the "Dive deeper" hand-off to
// Act 2. Numbers come from src/data/findings.ts; copy is verbatim from the design spec.
//
// Fluidity: we read a CONTINUOUS scroll progress (0 at the first beat .. BEATS.length-1 at the
// last) on every scroll frame and drive each beat's opacity + a small parallax drift from it.
// So any amount of scroll moves the copy immediately, and adjacent beats cross-fade. When the
// user's scrolling stops, we snap (smoothly) the rest of the way to a beat, so it never rests
// mid-fade. A sticky stage pins the copy in the sky zone while a tall inner supplies the scroll
// length.
// Reduced-motion: skip all of that and render the beats as a plain stacked, scrollable list.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { context } from '../../data/findings'

interface Act1ProblemProps {
  /** Advance to Act 2 (the "Dive deeper" hand-off). */
  onAdvance: () => void
  reducedMotion?: boolean
}

interface Beat {
  /** 'headline' = the big intro line; 'body' = a paragraph beat; 'cta' = the Dive-deeper end. */
  kind: 'headline' | 'body' | 'cta'
  eyebrow?: string
  text?: ReactNode
}

// Scroll length per beat, in svh. Larger = more wheeling to advance; smaller = more sensitive.
const SEGMENT_SVH = 72

// The transition line that leads into the Dive-deeper button (docs/content.md).
const TRANSITION =
  'Recent gains in operational data have opened the door to machine learning, so I put it to the test on a real vessel.'

const BEATS: Beat[] = [
  {
    kind: 'headline',
    eyebrow: 'The problem',
    text: 'The ocean is slowly eating your fuel budget.',
  },
  {
    kind: 'body',
    text: (
      <>
        Below the waterline, marine life grows on the hull: first slime, then algae, then
        barnacles. This is <em>biofouling</em>. It increases drag, forcing the engine to burn more
        fuel to hold the same speed.
      </>
    ),
  },
  {
    kind: 'body',
    text: (
      <>
        The cost is not trivial. Industry-wide, biofouling adds an estimated{' '}
        <strong>USD {context.annualCostUsdBn} billion a year</strong> and accounts for around{' '}
        <strong>{context.ghgSharePct}%</strong> of shipping's total greenhouse-gas emissions.
      </>
    ),
  },
  {
    kind: 'body',
    text: (
      <>
        The catch: you can't see fouling from the bridge, and traditional ways to measure it are
        imprecise or impractical at scale. The fouling signal hides inside speed, load, and
        weather, all tangled together.
      </>
    ),
  },
  {
    kind: 'body',
    text: (
      <>
        But better operational data has opened the door to machine learning. I used ML to quantify
        biofouling on a real vessel, then tested whether the results were reliable enough to be
        useful in practice.
      </>
    ),
  },
  { kind: 'cta' },
]

function BeatContent({ beat, onAdvance }: { beat: Beat; onAdvance: () => void }) {
  if (beat.kind === 'cta') {
    return (
      <>
        <p className="act1__transition">{TRANSITION}</p>
        <button type="button" className="cta-link act1__cta" onClick={onAdvance}>
          Dive deeper →
        </button>
      </>
    )
  }
  return (
    <>
      {beat.eyebrow && <p className="act1__eyebrow">{beat.eyebrow}</p>}
      {beat.kind === 'headline' ? (
        <h1 className="act1__headline">{beat.text}</h1>
      ) : (
        <p className="act1__body">{beat.text}</p>
      )}
    </>
  )
}

export default function Act1Problem({ onAdvance, reducedMotion }: Act1ProblemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Continuous scroll position: 0 at the first beat, BEATS.length-1 at the last.
  const [progress, setProgress] = useState(0)
  // The last beat we settled on, so a scroll-end snap can move ONE beat in the travel direction.
  const settledBeat = useRef(0)

  useEffect(() => {
    if (reducedMotion) return
    const el = containerRef.current
    if (!el) return
    const lastBeat = BEATS.length - 1
    const beatScrollTop = (beat: number) => {
      const max = el.scrollHeight - el.clientHeight
      return max > 0 ? (beat / lastBeat) * max : 0
    }
    const beatProgress = () => {
      const max = el.scrollHeight - el.clientHeight
      return max > 0 ? (el.scrollTop / max) * lastBeat : 0
    }

    let raf = 0
    let endTimer = 0
    let snapping = false
    let snapTarget = 0

    const update = () => {
      const p = beatProgress()
      setProgress(p)
      // Once a programmatic snap lands on its target, hand control back to the user.
      if (snapping && Math.abs(p - snapTarget) < 0.02) snapping = false
    }

    // When the user's scrolling stops, glide all the way to a beat. Direction-aware: any move
    // past a small deadzone carries to the NEXT beat that way; a big flick can cross more.
    const snapToBeat = () => {
      const p = beatProgress()
      const from = settledBeat.current
      const delta = p - from
      let target = from
      if (Math.abs(delta) > 0.06) {
        target = delta > 0 ? Math.max(from + 1, Math.round(p)) : Math.min(from - 1, Math.round(p))
      }
      target = Math.max(0, Math.min(lastBeat, target))
      settledBeat.current = target
      snapTarget = target
      if (Math.abs(beatScrollTop(target) - el.scrollTop) < 1) return
      snapping = true
      el.scrollTo({ top: beatScrollTop(target), behavior: 'smooth' })
      // Safety net in case the smooth scroll never lands exactly on target.
      window.setTimeout(() => { snapping = false }, 700)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update() })
      if (snapping) return // ignore our own programmatic scrolling
      window.clearTimeout(endTimer)
      endTimer = window.setTimeout(snapToBeat, 130) // fires once the user pauses
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(endTimer)
    }
  }, [reducedMotion])

  // Reduced-motion fallback: a plain stacked list, no pinning, no fades, no scroll cue.
  if (reducedMotion) {
    return (
      <section className="act1 act1--static" aria-label="The problem">
        <div className="act1__static-copy">
          {BEATS.map((beat, i) => (
            <div key={i} className="act1__beat is-active">
              <BeatContent beat={beat} onAdvance={onAdvance} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const activeBeat = Math.round(progress)

  return (
    <section className="act1" ref={containerRef} aria-label="The problem">
      <div className="act1__inner" style={{ height: `${BEATS.length * SEGMENT_SVH}svh` }}>
        {/* Pinned stage: the copy (top-left, in the sky zone) + the scroll cue (below waterline). */}
        <div className="act1__stage">
          <div className="act1__copy" aria-live="polite">
            {BEATS.map((beat, i) => {
              // Cross-fade: full opacity at this beat, fading to 0 one beat away. A small
              // parallax drift (upward as you scroll past) adds life without distracting.
              const opacity = Math.max(0, 1 - Math.abs(progress - i))
              const drift = (i - progress) * 14
              const isActive = i === activeBeat
              return (
                <div
                  key={i}
                  className={`act1__beat${isActive ? ' is-active' : ''}`}
                  style={{ opacity, transform: `translateY(${drift}px)` }}
                  aria-hidden={!isActive}
                >
                  <BeatContent beat={beat} onAdvance={onAdvance} />
                </div>
              )
            })}
          </div>

          <div
            className={`act1__cue${progress > 0.05 ? ' is-hidden' : ''}`}
            aria-hidden="true"
          >
            <span className="act1__cue-label">Scroll</span>
            <span className="act1__cue-chevron" />
          </div>
        </div>
      </div>
    </section>
  )
}
