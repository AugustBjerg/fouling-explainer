// Stern gear drawn BEHIND the hull body so it reads as tucked under the counter: the shaft
// boss + propeller + rudder. Shaded with gradients (no flat fills) for a believable, slightly
// murky underwater look. (The bulbous bow is part of the hull silhouette itself — see
// hullGeometry's HULL_PATH — not drawn here.)
import { color } from '../../theme'
import { PROPELLER as P, STERN_BOSS_PATH, RUDDER_PATH } from './hullGeometry'

// Propeller blades (one blade pointing up from the hub), spread at uneven angles so the disc
// looks like a real screw rather than a symmetrical asterisk.
const BLADE = 'M 0 -2 C -5 -6 -6 -13 -2 -16 C 0 -17.5 0 -17.5 2 -16 C 6 -13 5 -6 0 -2 Z'
const BLADE_ANGLES = [22, 104, 178, 256, 320]

export default function Appendages() {
  return (
    <g>
      <defs>
        {/* propeller bronze, lit near the hub and darkening to the blade tips */}
        <radialGradient id="propMetal" gradientUnits="userSpaceOnUse" cx={P.cx} cy={P.cy} r={20}>
          <stop offset="0%" stopColor={color.propBronzeLit} />
          <stop offset="100%" stopColor={color.propBronzeDark} />
        </radialGradient>
        <linearGradient id="metalDark" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
      </defs>

      {/* ---- stern gear (back) ---- */}
      {/* rudder, hung aft of the propeller (top tucks behind the hull) */}
      <path d={RUDDER_PATH} fill="url(#metalDark)" stroke={color.hullShadow} strokeWidth={1} />
      {/* shaft boss / skeg connecting the hull counter to the propeller */}
      <path d={STERN_BOSS_PATH} fill={color.hullShadow} />
      <path d={STERN_BOSS_PATH} fill="url(#metalDark)" opacity={0.6} />

      {/* propeller: shaded curved blades around a highlighted hub */}
      <g transform={`translate(${P.cx} ${P.cy})`}>
        {BLADE_ANGLES.map((deg) => (
          <path key={deg} d={BLADE} fill="url(#propMetal)" transform={`rotate(${deg})`} />
        ))}
        <circle cx={0} cy={0} r={4} fill="url(#propMetal)" stroke={color.propBronzeDark} strokeWidth={0.6} />
        <circle cx={-1.2} cy={-1.2} r={1.6} fill={color.propBronzeLit} opacity={0.8} />
      </g>
    </g>
  )
}
