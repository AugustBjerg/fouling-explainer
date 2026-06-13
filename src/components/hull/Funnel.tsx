// The funnel + signal mast that rise above the accommodation block. The funnel carries a
// soot-stained casing (darkest at the rim, washing down), a side access ladder (handholds),
// a muted company band and a slanted smoke/rain deflector cap on short posts above the
// exhaust mouth. The mast has a crosstree, stays and a tiny nav light. Shaded so the casing
// reads as a lit steel cylinder, not a flat slab. Coordinates derive from SUPERSTRUCTURE.
import { color } from '../../theme'
import { SUPERSTRUCTURE as S } from './hullGeometry'

const TOP = 44 // top of the accommodation block (must match Superstructure)
const FUNNEL = { x: S.x + 20, y: 14, w: 26, h: 32 }
const MAST_X = S.x + S.w * 0.66
const RUNGS = 5

export default function Funnel() {
  const { x, y, w, h } = FUNNEL
  return (
    <g>
      <defs>
        <linearGradient id="funnelFace" gradientUnits="userSpaceOnUse" x1={x} y1="0" x2={x + w} y2="0">
          <stop offset="0%" stopColor={color.hullSteelLight} />
          <stop offset="55%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
        {/* exhaust soot: darkest at the rim, washing down and fading out over the casing */}
        <linearGradient id="funnelSoot" gradientUnits="userSpaceOnUse" x1="0" y1={y} x2="0" y2={y + h}>
          <stop offset="0%" stopColor={color.abyss} stopOpacity={0.85} />
          <stop offset="45%" stopColor={color.abyss} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color.abyss} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* mast with crosstree, stays + tiny nav light (behind the funnel cap) */}
      <line x1={MAST_X} y1={TOP - 6} x2={MAST_X} y2={6} stroke={color.hullSteel} strokeWidth={1.6} />
      <line x1={MAST_X - 7} y1={16} x2={MAST_X + 7} y2={16} stroke={color.hullSteel} strokeWidth={1.2} />
      <line x1={MAST_X} y1={9} x2={MAST_X - 16} y2={TOP - 8} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      <line x1={MAST_X} y1={9} x2={MAST_X + 16} y2={TOP - 8} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      <circle cx={MAST_X} cy={6} r={1.4} fill={color.signalRust} opacity={0.7} />

      {/* casing + muted company band + lit leading edge */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill="url(#funnelFace)" />
      <rect x={x} y={y + 11} width={w} height={6} fill={color.signalRustDim} opacity={0.5} />
      <rect x={x + 1.5} y={y + 4} width={1.6} height={h - 6} fill={color.hullSteelLight} opacity={0.3} />

      {/* side access ladder (two stiles + rungs = handholds) */}
      <g stroke={color.hullShadow} strokeWidth={0.6} opacity={0.6}>
        <line x1={x + w - 5} y1={y + 6} x2={x + w - 5} y2={y + h - 2} />
        <line x1={x + w - 2.5} y1={y + 6} x2={x + w - 2.5} y2={y + h - 2} />
        {Array.from({ length: RUNGS }, (_, i) => {
          const ry = y + 8 + i * ((h - 12) / (RUNGS - 1))
          return <line key={i} x1={x + w - 5} y1={ry} x2={x + w - 2.5} y2={ry} />
        })}
      </g>

      {/* soot wash drawn over the casing */}
      <rect x={x} y={y} width={w} height={h} rx={2} fill="url(#funnelSoot)" />

      {/* dark exhaust mouth + slanted smoke/rain deflector cap on short posts */}
      <ellipse cx={x + w / 2} cy={y + 2} rx={w / 2} ry={2.6} fill={color.abyss} />
      <line x1={x + 4} y1={y + 1} x2={x + 4} y2={y - 3} stroke={color.hullShadow} strokeWidth={1} />
      <line x1={x + w - 4} y1={y + 1} x2={x + w - 4} y2={y - 4} stroke={color.hullShadow} strokeWidth={1} />
      <polygon points={`${x - 2},${y - 2} ${x + w + 1},${y - 5} ${x + w + 1},${y - 3} ${x - 2},${y}`} fill="url(#funnelFace)" stroke={color.hullShadow} strokeWidth={0.5} />
    </g>
  )
}
