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
 * ship and the glide slides a full scene-width to a section not seen before.
 *
 * The artwork is laid out STERN (back) on the left, BOW (front) on the right, so reading
 * left→right runs back→front and advancing acts slides the hull leftward (forward motion):
 *   Act 1 = left third (STERN)  ·  Act 2 = middle third  ·  Act 3 = right third (BOW).
 * The transform is applied to .hull-stage (one scene-width wide), so a full third of the
 * 3×-wide hull is exactly translateX(±100%): +100% brings the left/stern third into view,
 * -100% the right/bow third.
 * ONLY translateX changes between acts — no translateY/scale — so the hull stays at the same
 * on-screen height throughout (no vertical level jump). CSS animates the glide (~600ms).
 */
export const HULL_FRAMING: Record<ActNumber, string> = {
  1: 'translateX(100%)', // stern (back) third — left of the artwork
  2: 'translateX(0%)', // midship third
  3: 'translateX(-100%)', // bow (front) third — right of the artwork
}
