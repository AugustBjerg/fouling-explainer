// The detailed steel surface (clipped to the hull by the parent). Layers, bottom to top:
// base steel + paint gradients → length/deck ambient occlusion → plating strakes, butt
// seams and rivet rows → bundled grime/grain/streak texture overlays → curved-metal
// specular sheen → rust stains → boot-top → draft marks. Tuned for a weathered, lit look.
import type { CSSProperties } from 'react'
import { color } from '../../theme'
import { HULL, HULL_PATH, UNDERWATER_PATH } from './hullGeometry'

const X0 = HULL.sternX
const SPAN = HULL.bowX - HULL.sternX

// Horizontal plating strakes (longitudinal seams), topside + underwater.
const STRAKE_YS = [122, 150, 178, HULL.waterlineY, 228, 256]
// Vertical butt seams between plates.
const SEAM_XS = Array.from({ length: 11 }, (_, i) => 330 + i * 92)
// Rivet rows: along the sheer strake (near deck) and just above the waterline.
const RIVET_YS = [110, HULL.waterlineY - 6]
const RIVET_XS = Array.from({ length: 40 }, (_, i) => 332 + i * 23)

const blend = (mode: CSSProperties['mixBlendMode'], opacity: number): CSSProperties => ({
  mixBlendMode: mode,
  opacity,
})

export default function HullPlating() {
  return (
    <g>
      {/* base coats */}
      <path d={HULL_PATH} fill="url(#steelGradient)" />
      <path d={HULL_PATH} fill="url(#lengthFalloff)" />
      <path d={UNDERWATER_PATH} fill="url(#paintGradient)" />

      {/* ambient occlusion under the deck edge */}
      <rect x={X0} y={HULL.deckY} width={SPAN} height={30} fill="url(#deckShadow)" />

      {/* plating: horizontal strakes with a thin emboss highlight under each seam */}
      {STRAKE_YS.map((y) => (
        <g key={y}>
          <line x1={X0} y1={y} x2={HULL.bowX} y2={y} stroke={color.hullShadow} strokeWidth={1.4} opacity={0.5} />
          <line x1={X0} y1={y + 1.4} x2={HULL.bowX} y2={y + 1.4} stroke={color.hullSteelLight} strokeWidth={0.8} opacity={0.18} />
        </g>
      ))}
      {/* vertical butt seams */}
      {SEAM_XS.map((x) => (
        <line key={x} x1={x} y1={HULL.deckY} x2={x} y2={HULL.keelY} stroke={color.hullShadow} strokeWidth={1.1} opacity={0.32} />
      ))}
      {/* rivet rows */}
      {RIVET_YS.map((y) =>
        RIVET_XS.map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill={color.hullShadow} opacity={0.5} />
        )),
      )}

      {/* texture overlays (bundled PNGs via patterns) */}
      <rect x={0} y={0} width={HULL.viewBoxWidth} height={HULL.viewBoxHeight} fill="url(#grimePattern)" style={blend('multiply', 0.42)} />
      <rect x={X0} y={HULL.deckY} width={SPAN} height={HULL.waterlineY - HULL.deckY + 10} fill="url(#streaksPattern)" style={blend('multiply', 0.28)} />
      <rect x={0} y={0} width={HULL.viewBoxWidth} height={HULL.viewBoxHeight} fill="url(#grainPattern)" style={blend('soft-light', 0.35)} />

      {/* curved-metal specular sheen */}
      <rect x={0} y={0} width={HULL.viewBoxWidth} height={HULL.viewBoxHeight} filter="url(#metalSpecular)" style={blend('screen', 0.5)} />

      {/* boot-top: dark band + thin bright stripe at the waterline */}
      <rect x={X0} y={HULL.waterlineY - 3} width={SPAN} height={6} fill={color.hullShadow} opacity={0.8} />
      <rect x={X0} y={HULL.waterlineY - 4} width={SPAN} height={1.4} fill={color.hullSteelLight} opacity={0.35} />
    </g>
  )
}
