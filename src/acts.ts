// The three-act model: shared metadata so navigation, the step indicator, and the hull
// framing all read from one place (docs/structure.md → Top-level model).

export type ActNumber = 1 | 2 | 3

export interface ActMeta {
  id: ActNumber
  /** Short label for the step indicator. */
  label: string
  /** Text on the "advance" button leaving this act (last act has none). */
  nextLabel?: string
}

export const ACTS: ActMeta[] = [
  { id: 1, label: 'Problem', nextLabel: 'Dive deeper' },
  { id: 2, label: 'Findings', nextLabel: 'What this means' },
  { id: 3, label: 'Implications' }, // final act — no next
]

/**
 * Where the camera sits on the persistent hull per act. The hull is rendered 3× the scene
 * width (see .hull-stage__svg), so each act frames a DISTINCT, non-overlapping third of the
 * ship and the glide slides a full scene-width to a section not seen before:
 *   Act 1 = forward third (bow)  ·  Act 2 = middle third (midship)  ·  Act 3 = aft third (stern).
 * translateX is a % of the element's own (3× wide) box, so ±33.333% = exactly one third.
 * CSS animates the glide (~600ms).
 */
export const HULL_FRAMING: Record<ActNumber, string> = {
  1: 'translateX(33.333%)', // bow third in view
  2: 'translateX(0%)', // midship third in view
  3: 'translateX(-33.333%)', // stern third in view
}
