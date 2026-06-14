// Act 1 = The problem, as scrollytelling (docs/act1-design-spec.md). The ship is FIXED at the
// bottom (rendered by App, clean throughout); scrolling steps the intro copy in the top "sky
// zone" through six beats. State 0 is the headline; state 5 is the "Dive deeper" hand-off to
// Act 2. Numbers come from src/data/findings.ts; copy is verbatim from the design spec.
//
// Motion feel: NATIVE scrolling + CSS scroll-snap (`scroll-snap-type: y mandatory`). The user
// scrolls continuously and freely (a fast flick crosses several beats); when the scroll
// momentum ends, the browser glides smoothly to the nearest beat. No JS snap, no debounce, no
// focus lock. A sticky stage pins the copy + cue while empty per-beat snap panels supply the
// scroll length and the snap points. `progress` (a float 0..BEATS.length-1) is read from the
// scroll position and drives each beat's opacity + a small parallax drift (the cross-fade).
// Reduced-motion: skip the snap and render the beats as a plain stacked, scrollable list.
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

// The transition line that leads into the Dive-deeper button (docs/content.md).
const TRANSITION =
  'Recent improvements in availability and quality of ship data have opened the door to machine learning as an alternative. Therefore, I used Explainable Artifical Intelligence to quantify the impact of biofouling on a real vessel at sea.'

const BEATS: Beat[] = [
  {
    kind: 'headline',
    text: 'The ocean is slowly eating fuel budgets...',
  },
  {
    kind: 'body',
    text: (
      <>
        Below the waterline, marine life grows on the hull: first slime, then algae, then
        barnacles. This is <strong>biofouling</strong>. It makes a ship less hydrodynamic, forcing the engine to
        burn more fuel to hold the same speed.
      </>
    ),
  },
  {
    kind: 'body',
    text: (
      <>
        Industry-wide, biofouling adds an estimated{' '}
        <strong>USD {context.annualCostUsdBn} billion a year in operating costs</strong> and accounts for around{' '}
        <strong>{context.ghgSharePct}%</strong> of greenhouse-gas emissions in the shipping sector.
      </>
    ),
  },
  {
    kind: 'body',
    text: (
      <>
        Fouling is difficult to detect while the ship is at sea, so it has to be inferred from data. This is typically done using standardized methods such as ISO19030. While grounded in naval engineering, these methods are one-size-fits-all and often inaccurate.
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
          Try for yourself ↓
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
  // Continuous position: 0 at the first beat, BEATS.length-1 at the last. Drives the cross-fade.
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const el = containerRef.current
    if (!el) return
    const lastBeat = BEATS.length - 1
    let raf = 0
    let programmatic = false // true while our own snap-scroll is animating

    const readProgress = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (el.scrollTop / max) * lastBeat : 0)
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        readProgress()
      })
    }

    // Safety net for the soft landing: CSS scroll-snap handles most stops, but it is unreliable
    // across browsers/trackpads and sometimes leaves you mid-transition. When scrolling truly
    // ends, if we are not on a beat, glide smoothly to the nearest one. (scrollend fires the
    // moment scrolling stops, so there is no waiting/delay.)
    const snapToNearest = () => {
      if (programmatic) {
        programmatic = false
        return
      }
      const max = el.scrollHeight - el.clientHeight
      if (max <= 0) return
      const p = (el.scrollTop / max) * lastBeat
      const nearest = Math.round(p)
      if (Math.abs(p - nearest) < 0.03) return // already landed
      programmatic = true
      el.scrollTo({ top: (nearest / lastBeat) * max, behavior: 'smooth' })
    }

    el.addEventListener('scroll', onScroll, { passive: true })

    // Prefer the native scrollend event; fall back to a short idle timer where unsupported.
    let idle = 0
    const onIdle = () => {
      window.clearTimeout(idle)
      idle = window.setTimeout(snapToNearest, 90)
    }
    const supportsScrollEnd = 'onscrollend' in window
    if (supportsScrollEnd) {
      el.addEventListener('scrollend', snapToNearest)
    } else {
      el.addEventListener('scroll', onIdle, { passive: true })
    }

    readProgress()
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', snapToNearest)
      el.removeEventListener('scroll', onIdle)
      window.clearTimeout(idle)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  // Reduced-motion fallback: a plain stacked list, no snap, no fades, no scroll cue.
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
  // The scroll cue is the nudge off the headline; it retires once you scroll past beat 0.
  const cueHidden = progress > 0.5

  return (
    <section className="act1" ref={containerRef} tabIndex={0} aria-label="The problem">
      {/* Pinned stage: the copy (top-left, in the sky zone) + the scroll cue (below waterline). */}
      <div className="act1__stage">
        <div className="act1__copy" aria-live="polite">
          {BEATS.map((beat, i) => {
            // Cross-fade: full opacity at this beat, fading to 0 one beat away. A small parallax
            // drift (upward as you scroll past) adds life without distracting.
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

        <div className={`act1__cue${cueHidden ? ' is-hidden' : ''}`} aria-hidden="true">
          <span className="act1__cue-label">Scroll</span>
          <span className="act1__cue-chevron" />
        </div>
      </div>

      {/* Empty per-beat snap panels: they supply the scroll length and the snap points. */}
      {BEATS.map((_, i) => (
        <div key={i} className="act1__snap" aria-hidden="true" />
      ))}
    </section>
  )
}
