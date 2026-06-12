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
 * Where the camera sits on the persistent hull per act: bow (Act 1) → midship (Act 2) →
 * stern (Act 3). Applied as the hull-stage transform; CSS animates the glide (~600ms).
 */
export const HULL_FRAMING: Record<ActNumber, string> = {
  1: 'translate(16%, -2%) scale(1.06)', // near the bow, clean
  2: 'translate(0%, 4%) scale(1.0)', // midship, where fouling is shown
  3: 'translate(-16%, -2%) scale(1.06)', // toward the stern, clean again
}
