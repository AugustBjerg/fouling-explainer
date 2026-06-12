// The environment behind the ship: dusk air above the waterline, murky water below, and a
// lit sea-surface line where they meet (so the ship reads as floating, not submerged).
// Spans the full artwork width and glides with the hull (a horizontal line stays put).
import { color } from '../../theme'
import { HULL } from './hullGeometry'

const W = HULL.viewBoxWidth
const WL = HULL.waterlineY
const H = HULL.viewBoxHeight

// Faint god-rays slanting down from the surface into the deep.
const RAYS = [
  { x: 360, w: 70, skew: 26 },
  { x: 820, w: 90, skew: -22 },
  { x: 1240, w: 64, skew: 30 },
]

export default function SeaAndSky() {
  return (
    <g aria-hidden="true">
      {/* air + water fields */}
      <rect x={0} y={0} width={W} height={WL} fill="url(#skyGradient)" />
      <rect x={0} y={WL} width={W} height={H - WL} fill="url(#seaGradient)" />

      {/* light rays in the water */}
      <g filter="url(#softGlow)" opacity={0.5}>
        {RAYS.map((r) => (
          <polygon
            key={r.x}
            points={`${r.x},${WL} ${r.x + r.w},${WL} ${r.x + r.w + r.skew},${H} ${r.x + r.skew},${H}`}
            fill={color.glowTealSoft}
          />
        ))}
      </g>

      {/* the sea-surface line: a soft lit band + a crisp highlight */}
      <g filter="url(#softGlow)">
        <rect x={0} y={WL - 3} width={W} height={6} fill={color.seaSurface} opacity={0.9} />
      </g>
      <rect x={0} y={WL - 1} width={W} height={1.5} fill={color.hullSteelLight} opacity={0.45} />
      {/* a few short wave glints just under the surface */}
      {Array.from({ length: 26 }, (_, i) => (
        <rect
          key={i}
          x={40 + i * 60}
          y={WL + 3 + (i % 3) * 2}
          width={26}
          height={1.2}
          fill={color.hullSteelLight}
          opacity={0.12}
        />
      ))}
    </g>
  )
}
