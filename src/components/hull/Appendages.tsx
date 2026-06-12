// Underwater appendages drawn BEHIND the hull body so they read as parts tucked under it:
// the bulbous bow (front cue) and the rudder + propeller (back cue). Each is shaded with a
// gradient rather than a flat fill so it doesn't look like a pasted blob.
import { color } from '../../theme'
import { BULBOUS_BOW as B, PROPELLER as P, RUDDER_PATH } from './hullGeometry'

export default function Appendages() {
  return (
    <g>
      <defs>
        {/* underwater anti-fouling form: lit oxblood on top, dark beneath */}
        <radialGradient id="bulbPaint" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={color.hullPaintBelow} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </radialGradient>
        <linearGradient id="metalDark" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
      </defs>

      {/* bulbous bow: overlaps the stem (hull is drawn over its aft side) so it stays attached */}
      <ellipse cx={B.cx} cy={B.cy} rx={B.rx} ry={B.ry} fill="url(#bulbPaint)" />
      <ellipse cx={B.cx + 4} cy={B.cy - 4} rx={B.rx * 0.5} ry={B.ry * 0.45} fill={color.hullPaintBelow} opacity={0.5} />

      {/* rudder */}
      <path d={RUDDER_PATH} fill="url(#metalDark)" stroke={color.hullShadow} strokeWidth={1} />

      {/* propeller: shaded blades around a highlighted hub */}
      <g transform={`translate(${P.cx} ${P.cy})`}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx={0} cy={0} rx={4.5} ry={P.r} fill="url(#metalDark)" transform={`rotate(${deg})`} />
        ))}
        <circle cx={0} cy={0} r={5.5} fill={color.hullSteel} />
        <circle cx={-1.5} cy={-1.5} r={2} fill={color.hullSteelLight} opacity={0.7} />
      </g>
    </g>
  )
}
