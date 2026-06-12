// Gives the flat silhouette volume so it stops looking like a paper cut-out. Rendered LAST
// inside the hull clip group (so the strokes are clipped to the hull interior):
//  - a soft inner shadow hugging the whole outline → the edges read as curving away,
//  - a crisp rim highlight on the lit upper/forward edges (deck sheer + raked stem),
//  - a faint catch of light along the waterline.
import { color } from '../../theme'
import { HULL, HULL_PATH } from './hullGeometry'

// The above-water top edge that catches the light (stern sheer → deck → raked stem).
const LIT_EDGE = 'M 200 150 Q 202 108 205 96 L 1340 96 Q 1392 110 1388 168 L 1376 200'

export default function EdgeShading() {
  return (
    <g aria-hidden="true">
      {/* inner shadow: wide soft dark stroke on the outline, clipped to the inside by parent */}
      <path d={HULL_PATH} fill="none" stroke={color.hullShadow} strokeWidth={24} opacity={0.5} filter="url(#edgeBlur)" />
      <path d={HULL_PATH} fill="none" stroke={color.abyss} strokeWidth={9} opacity={0.4} filter="url(#edgeBlur)" />

      {/* rim highlight on the lit upper/forward edges */}
      <path d={LIT_EDGE} fill="none" stroke={color.hullSteelLight} strokeWidth={1.4} opacity={0.5} strokeLinecap="round" />
      {/* faint light catch just under the waterline */}
      <line x1={HULL.sternX} y1={HULL.waterlineY - 1} x2={HULL.bowX} y2={HULL.waterlineY - 1} stroke={color.hullSteelLight} strokeWidth={0.8} opacity={0.22} />
    </g>
  )
}
