// The three-act model: shared metadata so navigation, the step indicator, and the hull
// framing all read from one place (docs/structure.md → Top-level model).
import { HULL } from './components/hull/hullGeometry'

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
 * Act 2's two knobs: ACT2_ZOOM (larger = closer) and ACT2_WATERLINE_TARGET (where the waterline
 * parks vertically). The dive amount is COMPUTED from the target by act2DiveTransform() so the
 * waterline lands in the same spot on any screen shape — see that function.
 */
const ACT2_ZOOM = 2.4
// Where to park the waterline, as a fraction of scene height from the top (negative = just OFF
// the top, so Act 2 sits wholly below the surface — only the red anti-fouling hull is in view).
const ACT2_WATERLINE_TARGET = -0.06

/**
 * Act 2 dive transform, COMPUTED from the viewport aspect (sceneWidth / sceneHeight).
 *
 * Why compute it: the hull <svg> is sized by WIDTH (width:300%), so its on-screen height — and
 * therefore where the waterline falls — depends on the viewport's aspect ratio. A fixed
 * translateY% would put the waterline in a different place on every screen (and on a tall phone
 * could push the whole hull off-screen). Instead we solve for the translateY that lands the
 * waterline at ACT2_WATERLINE_TARGET for the given aspect.
 *
 * Derivation (all in units of scene height; transform-origin is the scene centre = 0.5):
 *   svg height / scene height           = 3 · aspect · (viewBoxHeight / viewBoxWidth)
 *   waterline offset from scene centre  = svgHeight · (waterlineY / viewBoxHeight − 0.5)
 *   after scale Z then translate D:  y = 0.5 + Z · offset + D    →  solve y = target for D.
 */
export function act2DiveTransform(aspect: number): string {
  const svgHeightInScenes = 3 * aspect * (HULL.viewBoxHeight / HULL.viewBoxWidth)
  const waterlineFromCentre = svgHeightInScenes * (HULL.waterlineY / HULL.viewBoxHeight - 0.5)
  const dive = ACT2_WATERLINE_TARGET - 0.5 - ACT2_ZOOM * waterlineFromCentre
  return `translateY(${(dive * 100).toFixed(1)}%) scale(${ACT2_ZOOM})`
}

// Acts 1 & 3 share ONE surface framing — same zoom + same low camera drop — so Act 3 reads as the
// SAME shot as the intro, just travelled to the far (bow) end of the hull. Both pull WAY back so
// the ship sits small and low, leaving the top ~55-60% as an open "sky zone" for the scrolly copy.
// The scale is the leftmost (outermost) transform so it shrinks about the scene centre AFTER
// translateX has centred the stern/bow third — keeping that third centred while zooming out.
// scale ≈ the ship's share of the screen width: 0.25 → ~25% wide. Lower = smaller ship.
const ACT_SURFACE_ZOOM = 0.25

// Drops the camera so the ship sits LOW in the bottom ~40-45% of the frame, under the sky-zone
// copy. Positive translateY (% of scene height) pushes the view down; applied outermost (screen
// space, like the Act 2 dive) so the zoom doesn't scale it.
const ACT_SHIP_DROP = '18%'

// Acts 1 & 3 are framed statically. Act 2's value here is a sensible default (≈ a 16:9 desktop);
// App.tsx recomputes it per render with the live viewport aspect via act2DiveTransform().
// Act 1 frames the STERN third (translateX +100%); Act 3 the BOW third (-100%) — same shot,
// mirrored across the hull (artwork is laid out stern-left, bow-right).
export const HULL_FRAMING: Record<ActNumber, string> = {
  1: `translateY(${ACT_SHIP_DROP}) scale(${ACT_SURFACE_ZOOM}) translateX(100%)`, // stern third, surface
  2: act2DiveTransform(16 / 9), // midship, dived underwater + zoomed in (recomputed in App for the real aspect)
  3: `translateY(${ACT_SHIP_DROP}) scale(${ACT_SURFACE_ZOOM}) translateX(-100%)`, // bow third, surface — same framing as Act 1
}
