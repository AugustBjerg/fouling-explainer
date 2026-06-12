// Drawn in FRONT of the submerged hull so the ship reads as sitting IN the water, not in
// front of it: a murk veil tinting the underwater hull, a bright scattering band right under
// the surface, and a thin surface meniscus that crosses the hull at the waterline.
import { color } from '../../theme'
import { HULL } from './hullGeometry'

const W = HULL.viewBoxWidth
const WL = HULL.waterlineY
const H = HULL.viewBoxHeight

export default function WaterVeil() {
  return (
    <g aria-hidden="true">
      {/* the underwater hull, seen through green-tinted water */}
      <rect x={0} y={WL} width={W} height={H - WL} fill="url(#waterVeil)" />

      {/* bright light scattering just under the surface (the water plane in front) */}
      <rect x={0} y={WL} width={W} height={9} fill={color.seaLit} opacity={0.2} filter="url(#softGlow)" />
      {/* thin surface meniscus crossing the whole scene (including the hull) */}
      <rect x={0} y={WL - 1.5} width={W} height={2} fill={color.seaSurface} opacity={0.7} filter="url(#softGlow)" />
      <rect x={0} y={WL - 0.5} width={W} height={1} fill={color.hullSteelLight} opacity={0.35} />

      {/* soft caustic light patches dappling the submerged hull */}
      <g filter="url(#softGlow)" opacity={0.16}>
        <ellipse cx={520} cy={WL + 26} rx={70} ry={9} fill={color.glowTeal} />
        <ellipse cx={1020} cy={WL + 20} rx={90} ry={8} fill={color.glowTeal} />
      </g>
    </g>
  )
}
