// The environment behind the ship: dusk air above the waterline, murky water below, and a
// lit sea-surface line where they meet (so the ship reads as floating, not submerged).
// Glides AND scales with the hull (so the waterline stays glued to the hull for the Act 2
// dive). Because Acts 1 & 3 zoom the hull WAY out (acts.ts → ACT_SURFACE_ZOOM), the sky/sea
// fields bleed far past the artwork in every direction so they always fill the screen with no
// visible SVG edge — the SVG is set to overflow:visible (Hull.tsx) so this bleed isn't clipped.
import { color } from '../../theme'
import { HULL, waterlineWave } from './hullGeometry'

const W = HULL.viewBoxWidth
const WL = HULL.waterlineY
const H = HULL.viewBoxHeight

// The waterline isn't a dead-straight rule: it gently undulates, and the whole wave then drifts
// sideways (see Drift) so the swells always roll the SAME way. AMP/WAVELEN/DRIFT_S are shared
// with WaterVeil so the open-water boundary and the meniscus that laps the hull stay in phase
// where they meet at the ship's ends, and roll together.
const AMP = 4
const WAVELEN = 150
const DRIFT_S = 9 // seconds to travel exactly one wavelength → seamless one-directional loop

// Slides its parent left by exactly one wavelength on a loop. Because the wave is periodic with
// period WAVELEN, the end state is visually identical to the start, so the roll never jumps or
// reverses. Renders nothing under prefers-reduced-motion (the wave then just sits still).
function Drift({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null
  return (
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="translate"
      from="0 0"
      to={`-${WAVELEN} 0`}
      dur={`${DRIFT_S}s`}
      repeatCount="indefinite"
    />
  )
}

// How far the air/water fields extend beyond the 1600×320 artwork box (viewBox units). Sized
// so that even at the most zoomed-out act the fields still cover the whole viewport.
const BLEED_X = 1800 // left and right of the artwork
const BLEED_UP = 800 // sky above the top edge
const BLEED_DOWN = 900 // water below the bottom edge
const FIELD_X = -BLEED_X
const FIELD_W = W + BLEED_X * 2
const SEA_X1 = FIELD_X + FIELD_W
const SEA_BOTTOM = H + BLEED_DOWN

// The undulating waterline as an open stroke (the surface line) and as a closed sea fill (wavy
// top edge + a skirt down to the deep), so the air/water boundary itself is wavy, not just a band.
const WAVE = waterlineWave(FIELD_X, SEA_X1, WL, AMP, WAVELEN)
const SEA_FILL = `${WAVE} L ${SEA_X1} ${SEA_BOTTOM} L ${FIELD_X} ${SEA_BOTTOM} Z`

// Faint god-rays slanting down from the surface into the deep.
const RAYS = [
  { x: 360, w: 70, skew: 26 },
  { x: 820, w: 90, skew: -22 },
  { x: 1240, w: 64, skew: 30 },
]

export default function SeaAndSky({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <g aria-hidden="true">
      {/* air + water fields — bleed far past the artwork so they fill the screen at any zoom.
          Sky runs a little past the waterline so the wave troughs never reveal a gap; the sea is
          a wavy-topped fill laid over it (drifting sideways), so the air/water boundary rolls. */}
      <rect x={FIELD_X} y={-BLEED_UP} width={FIELD_W} height={WL + BLEED_UP + AMP + 2} fill="url(#skyGradient)" />
      <path d={SEA_FILL} fill="url(#seaGradient)">
        <Drift reducedMotion={reducedMotion} />
      </path>

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

      {/* the sea-surface line follows the wavy waterline (soft lit band + a brighter highlight)
          and drifts sideways with the fill, so the lit crests visibly roll one way. */}
      <g>
        <Drift reducedMotion={reducedMotion} />
        <path d={WAVE} fill="none" stroke={color.seaSurface} strokeWidth={6} opacity={0.9} filter="url(#softGlow)" />
        <path d={WAVE} fill="none" stroke={color.hullSteelLight} strokeWidth={2.4} opacity={0.45} />
      </g>
      {/* a few short static wave glints just under the surface (sub-surface sparkle) */}
      {Array.from({ length: 26 }, (_, i) => (
        <rect
          key={i}
          x={40 + i * 60}
          y={WL + 4 + (i % 3) * 2}
          width={26}
          height={1.4}
          fill={color.hullSteelLight}
          opacity={0.12}
        />
      ))}
    </g>
  )
}
