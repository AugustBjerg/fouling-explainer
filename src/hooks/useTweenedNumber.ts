// Smoothly animates a number toward `target` whenever it changes, so the Act 2 readouts
// tween instead of jumping (docs/structure.md). Honours reduced motion by snapping.
import { useEffect, useRef, useState } from 'react'

export function useTweenedNumber(
  target: number,
  durationMs = 400,
  reducedMotion = false,
): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Reduced motion → snap by tweening over zero time (still inside rAF, no sync setState).
    const dur = reducedMotion ? 0 : durationMs
    const from = fromRef.current
    const start = performance.now()

    function tick(now: number) {
      const t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const current = from + (target - from) * eased
      setValue(current)
      fromRef.current = current
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs, reducedMotion])

  return value
}
