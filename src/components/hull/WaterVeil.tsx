// Drawn in FRONT of the submerged hull so the ship reads as sitting IN the water, not in
// front of it: a murk veil tinting the underwater hull, a bright scattering band right under
// the surface, and a thin surface meniscus that crosses the hull at the waterline.
import { color } from '../../theme'
import { HULL, waterlineWave } from './hullGeometry'

const W = HULL.viewBoxWidth
const WL = HULL.waterlineY
const H = HULL.viewBoxHeight

// Match SeaAndSky's bleed so the murk veil + surface bands cross the whole zoomed-out frame
// (no vertical seam where the water tint would otherwise stop at the artwork edge).
const BLEED_X = 1800
const BLEED_DOWN = 900
const FIELD_X = -BLEED_X
const FIELD_W = W + BLEED_X * 2
const FIELD_X1 = FIELD_X + FIELD_W
const FIELD_BOTTOM = H + BLEED_DOWN

// Same wavy waterline as SeaAndSky (identical AMP/WAVELEN/DRIFT_S/phase) so the meniscus that laps
// the hull lines up with the open-water boundary behind it AND rolls in step with it. The veil
// fill gets a wavy top edge.
const AMP = 4
const WAVELEN = 150
const DRIFT_S = 9
const WAVE = waterlineWave(FIELD_X, FIELD_X1, WL, AMP, WAVELEN)
const VEIL_FILL = `${WAVE} L ${FIELD_X1} ${FIELD_BOTTOM} L ${FIELD_X} ${FIELD_BOTTOM} Z`

// Slides its parent left by one wavelength on a loop (seamless because the wave is periodic), so
// the waterline always rolls the same way. Nothing under prefers-reduced-motion.
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

export default function WaterVeil({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <g aria-hidden="true">
      {/* the underwater hull, seen through green-tinted water — wavy top edge laps the hull and
          rolls sideways with the surface */}
      <path d={VEIL_FILL} fill="url(#waterVeil)">
        <Drift reducedMotion={reducedMotion} />
      </path>

      {/* the scattering band + meniscus follow the wavy waterline and drift sideways in step with
          the open water behind, so the line lapping the hull rolls the same way. */}
      <g>
        <Drift reducedMotion={reducedMotion} />
        {/* bright light scattering just under the surface (the water plane in front) */}
        <path d={WAVE} fill="none" stroke={color.seaLit} strokeWidth={10} opacity={0.2} filter="url(#softGlow)" />
        {/* thin surface meniscus crossing the whole scene (including the hull) */}
        <path d={WAVE} fill="none" stroke={color.seaSurface} strokeWidth={2.6} opacity={0.7} filter="url(#softGlow)" />
        <path d={WAVE} fill="none" stroke={color.hullSteelLight} strokeWidth={1.8} opacity={0.35} />
      </g>

      {/* soft caustic light patches dappling the submerged hull (static, organic warp via
          waterRipple) */}
      <g filter="url(#waterRipple)" opacity={0.16}>
        <g filter="url(#softGlow)">
          <ellipse cx={520} cy={WL + 26} rx={70} ry={9} fill={color.glowTeal} />
          <ellipse cx={1020} cy={WL + 20} rx={90} ry={8} fill={color.glowTeal} />
        </g>
      </g>
    </g>
  )
}
