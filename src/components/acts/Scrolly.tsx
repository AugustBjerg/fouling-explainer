// Shared scrollytelling shell for the two surface acts (Act 1 + Act 3). The ship is FIXED behind
// (rendered by App); scrolling steps `count` copy "beats" through the top sky zone. Each act just
// supplies its beats via renderBeat — this owns the motion + chrome so both acts behave identically.
//
// Motion feel: NATIVE scrolling + CSS scroll-snap (`scroll-snap-type: y mandatory`). The user
// scrolls continuously and freely (a fast flick crosses several beats); when momentum ends, the
// browser glides to the nearest beat. No JS snap loop, no debounce, no focus lock. A sticky stage
// pins the copy + cue while empty per-beat snap panels supply the scroll length and the snap
// points. `progress` (a float 0..count-1) is read from the scroll position and drives each beat's
// opacity + a small parallax drift (the cross-fade). Reduced-motion: skip the snap and render the
// beats as a plain stacked, scrollable list.
import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollyProps {
  /** Number of beats (= number of snap stops). */
  count: number
  /** Renders one beat's content. `isActive` = it's the nearest beat, so it gets pointer events. */
  renderBeat: (index: number, isActive: boolean) => ReactNode
  /** Accessible label for the scroll region. */
  ariaLabel: string
  /** Show the "Scroll" nudge below the waterline (retires after the first step). Default true. */
  showCue?: boolean
  reducedMotion?: boolean
}

export default function Scrolly({ count, renderBeat, ariaLabel, showCue = true, reducedMotion }: ScrollyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Continuous position: 0 at the first beat, count-1 at the last. Drives the cross-fade.
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const el = containerRef.current
    if (!el) return
    const last = count - 1
    let raf = 0
    let programmatic = false // true while our own snap-scroll is animating

    const readProgress = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (el.scrollTop / max) * last : 0)
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
      const p = (el.scrollTop / max) * last
      const nearest = Math.round(p)
      if (Math.abs(p - nearest) < 0.03) return // already landed
      programmatic = true
      el.scrollTo({ top: (nearest / last) * max, behavior: 'smooth' })
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
  }, [reducedMotion, count])

  // Reduced-motion fallback: a plain stacked list, no snap, no fades, no scroll cue.
  if (reducedMotion) {
    return (
      <section className="scrolly scrolly--static" aria-label={ariaLabel}>
        <div className="scrolly__static-copy">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="scrolly__beat is-active">
              {renderBeat(i, true)}
            </div>
          ))}
        </div>
      </section>
    )
  }

  const activeBeat = Math.round(progress)
  // The scroll cue is the nudge off the first beat; it retires once you scroll past beat 0.
  const cueHidden = progress > 0.5

  return (
    <section className="scrolly" ref={containerRef} tabIndex={0} aria-label={ariaLabel}>
      {/* Pinned stage: the copy (top, in the sky zone) + the scroll cue (below waterline). */}
      <div className="scrolly__stage">
        <div className="scrolly__copy" aria-live="polite">
          {Array.from({ length: count }, (_, i) => {
            // Cross-fade: full opacity at this beat, fading to 0 one beat away. A small parallax
            // drift (upward as you scroll past) adds life without distracting.
            const opacity = Math.max(0, 1 - Math.abs(progress - i))
            const drift = (i - progress) * 14
            const isActive = i === activeBeat
            return (
              <div
                key={i}
                className={`scrolly__beat${isActive ? ' is-active' : ''}`}
                style={{ opacity, transform: `translateY(${drift}px)` }}
                aria-hidden={!isActive}
              >
                {renderBeat(i, isActive)}
              </div>
            )
          })}
        </div>

        {showCue && (
          <div className={`scrolly__cue${cueHidden ? ' is-hidden' : ''}`} aria-hidden="true">
            <span className="scrolly__cue-label">Scroll</span>
            <span className="scrolly__cue-chevron" />
          </div>
        )}
      </div>

      {/* Empty per-beat snap panels: they supply the scroll length and the snap points. */}
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="scrolly__snap" aria-hidden="true" />
      ))}
    </section>
  )
}
