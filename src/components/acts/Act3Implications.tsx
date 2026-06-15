// Act 3 = The implications, as scrollytelling that mirrors Act 1 (same shared Scrolly shell). The
// ship is FIXED at the surface near the BOW (rendered by App, clean again — the "after a clean"
// payoff) while three beats step through the sky zone: ML shows promise → the prize if you nail it
// → the two ways out (thesis + code). A quiet, always-reachable Back (top-left) returns to Act 2.
// Copy from docs/content.md; the GitHub link is the real repo, the thesis PDF is self-hosted.
import { type ReactNode } from 'react'
import Scrolly from './Scrolly'

interface Act3ImplicationsProps {
  /** Step back to Act 2 (each act carries its own nav — there is no global control bar). */
  onBack: () => void
  reducedMotion?: boolean
}

// The thesis PDF is self-hosted: drop the file into public/ as thesis.pdf (served at /thesis.pdf).
const THESIS_PDF_URL = '/thesis.pdf'
const GITHUB_REPO_URL = 'https://github.com/AugustBjerg/Master-s-thesis'

interface Beat {
  /** 'headline' = the big takeaway line; 'body' = a paragraph beat; 'cta' = the closing links. */
  kind: 'headline' | 'body' | 'cta'
  text?: ReactNode
}

const BEATS: Beat[] = [
  {
    kind: 'headline',
    text: 'Machine learning shows promise as a new way to quantify fouling.',
  },
  {
    kind: 'body',
    text: (
      <>
        Get the implementation right, and it could save the shipping industry{' '}
        <strong>billions of dollars</strong> — and the world{' '}
        <strong>millions of tonnes of greenhouse-gas emissions</strong> — every year.
      </>
    ),
  },
  { kind: 'cta' },
]

function BeatContent({ beat }: { beat: Beat }) {
  if (beat.kind === 'cta') {
    return (
      <>
        <p className="scrolly__body">Dive deeper into the findings, or check out the code.</p>
        <div className="cta-links">
          <a className="cta-link" href={THESIS_PDF_URL} target="_blank" rel="noopener noreferrer">
            Read the full thesis →
          </a>
          <a className="cta-link" href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
            View the code on GitHub →
          </a>
        </div>
      </>
    )
  }
  return beat.kind === 'headline' ? (
    <h1 className="scrolly__headline">{beat.text}</h1>
  ) : (
    <p className="scrolly__body">{beat.text}</p>
  )
}

export default function Act3Implications({ onBack, reducedMotion }: Act3ImplicationsProps) {
  return (
    <>
      <Scrolly
        count={BEATS.length}
        ariaLabel="The implications"
        reducedMotion={reducedMotion}
        renderBeat={(i) => <BeatContent beat={BEATS[i]} />}
      />
      <button type="button" className="cta-link cta-link--ghost scrolly__back-link" onClick={onBack}>
        ← Back
      </button>
    </>
  )
}
