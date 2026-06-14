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
 * Artwork laid out STERN (back) on the left, BOW (front) on the right, so advancing acts
 * slides the hull leftward (back→front). The transform is on .hull-stage (one scene-width
 * wide), so a full third is exactly translateX(±100%).
 *
 *   Act 1 = STERN third, at the surface (you see the waterline + the ship above it).
 *   Act 2 = MIDSHIP, but DOVE UNDERWATER and zoomed in: the transition from Act 1 slides to
 *           the middle, drops below the surface and zooms onto the fouling band. Stays midship
 *           length-wise (translateX 0); the dive is translateY + scale.
 *   Act 3 = BOW third, back at the surface.
 *
 * Act 2's two knobs — tweak to taste (more negative ACT2_DIVE = deeper/more underwater;
 * larger ACT2_ZOOM = closer). Both are applied to .hull-stage: scale zooms about the centre,
 * then translateY (a % of scene height) lifts the submerged hull up into view.
 */
const ACT2_ZOOM = 2.4
const ACT2_DIVE = '-80%' // negative = move the view down, into the water (past the waterline)

// Acts 1 & 3 sit at the surface, pulled WAY back so the ship reads small in a wide seascape.
// The scale is the leftmost (outermost) transform so it shrinks about the scene centre AFTER
// translateX has centred the stern/bow third — keeping that third centred while zooming out.
// Lower = more zoomed out. Act 3 keeps the original framing.
const ACT_SURFACE_ZOOM = 0.42

// Act 1 (the scrollytelling intro, docs/act1-design-spec.md) pulls back FURTHER than Act 3 so
// the ship occupies at most ~a quarter of the screen width, leaving the top ~55-60% as an open
// sky zone for the intro copy. The visible stern third spans one scene-width at scale 1, so
// this scale ≈ its share of the screen width: 0.25 → ~25% wide. Lower = smaller ship.
const ACT1_SURFACE_ZOOM = 0.25

// Act 1 also drops the camera so the ship sits LOW in the bottom ~40-45% of the frame, under
// the sky-zone copy. Positive translateY (% of scene height) pushes the view down; applied
// outermost (screen space, like ACT2_DIVE) so the zoom doesn't scale it.
const ACT1_SHIP_DROP = '18%'

export const HULL_FRAMING: Record<ActNumber, string> = {
  1: `translateY(${ACT1_SHIP_DROP}) scale(${ACT1_SURFACE_ZOOM}) translateX(100%)`, // stern third, surface, small + low: sky room for the intro copy
  2: `translateY(${ACT2_DIVE}) scale(${ACT2_ZOOM})`, // midship, dived underwater + zoomed in
  3: `scale(${ACT_SURFACE_ZOOM}) translateX(-100%)`, // bow (front) third, zoomed out at the surface
}
