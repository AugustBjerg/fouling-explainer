// Act 1 = The problem, as scrollytelling (docs/act1-design-spec.md). The ship is FIXED at the
// bottom (rendered by App, clean throughout, framed at the STERN); scrolling steps the intro copy
// in the top "sky zone" through the beats below. The first beat is the headline; the last is the
// "Try for yourself" hand-off to Act 2. The shared Scrolly shell owns the scroll motion + chrome;
// this file just supplies the beats. Numbers come from src/data/findings.ts; copy is from the spec.
import { type ReactNode } from 'react'
import Scrolly from './Scrolly'
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
  'Recent improvements in availability and quality of ship data have opened the door to new data-driven approaches. Therefore, I tested the ability of Explainable Artificial Intelligence to quantify the impact of biofouling on a vessel at sea, using only its operational data.'

const BEATS: Beat[] = [
  {
    kind: 'headline',
    text: 'Marine organisms are slowly eating fuel budgets in the shipping industry',
  },
  {
    kind: 'body',
    text: (
      <>
        Below the waterline, marine life grows on the outside of ships: first slime, then algae, then
        mussels and barnacles. This is <strong>biofouling</strong>. It makes a ship less hydrodynamic, forcing the engine to
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
        Fouling is difficult to detect while the ship is at sea, so it has to be inferred from data, typically using standardized methods such as ISO19030. While grounded in naval engineering, these methods are one-size-fits-all and often inaccurate.
      </>
    ),
  },
  { kind: 'cta' },
]

function BeatContent({ beat, onAdvance }: { beat: Beat; onAdvance: () => void }) {
  if (beat.kind === 'cta') {
    return (
      <>
        <p className="scrolly__transition">{TRANSITION}</p>
        <button type="button" className="cta-link scrolly__cta" onClick={onAdvance}>
          Try for yourself
        </button>
      </>
    )
  }
  return (
    <>
      {beat.eyebrow && <p className="scrolly__eyebrow">{beat.eyebrow}</p>}
      {beat.kind === 'headline' ? (
        <h1 className="scrolly__headline">{beat.text}</h1>
      ) : (
        <p className="scrolly__body">{beat.text}</p>
      )}
    </>
  )
}

export default function Act1Problem({ onAdvance, reducedMotion }: Act1ProblemProps) {
  return (
    <Scrolly
      count={BEATS.length}
      ariaLabel="The problem"
      cueLabel="Explore why"
      reducedMotion={reducedMotion}
      renderBeat={(i) => <BeatContent beat={BEATS[i]} onAdvance={onAdvance} />}
    />
  )
}
