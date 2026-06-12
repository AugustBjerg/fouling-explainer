// The aft accommodation block — the "this is the back of a ship" cue. A multi-deck house
// with rows of glazed cabin windows, a navigation bridge with overhanging wings + railings,
// a shaded funnel with a soot cap, and a mast with stays. Daylight treatment: dark reflective
// glass, per-deck shadow lines, weathering overlays, contact shadow, directional shading.
import { color } from '../../theme'
import { SUPERSTRUCTURE as S } from './hullGeometry'

const TOP = 44 // top of the accommodation block (bridge/funnel/mast rise above)
const DECKS = 4
const DH = (S.bottomY - TOP) / DECKS
const WINS = 7
const WIN_W = 8
const WIN_H = 5
const WING = 12
const FUNNEL = { x: S.x + 22, y: 14, w: 26, h: 32 }
const MAST_X = S.x + S.w * 0.66

const deckYs = Array.from({ length: DECKS }, (_, i) => TOP + i * DH)
const winXs = Array.from({ length: WINS }, (_, i) => S.x + 10 + i * ((S.w - 20) / (WINS - 1)))

// A thin steel railing: top rail + evenly spaced stanchions.
function Rail({ x1, x2, y, h = 4 }: { x1: number; x2: number; y: number; h?: number }) {
  const n = Math.max(2, Math.round((x2 - x1) / 9))
  return (
    <g stroke={color.hullShadow} strokeWidth={0.7} opacity={0.55}>
      <line x1={x1} y1={y - h} x2={x2} y2={y - h} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const px = x1 + (i * (x2 - x1)) / n
        return <line key={i} x1={px} y1={y - h} x2={px} y2={y} />
      })}
    </g>
  )
}

export default function Superstructure() {
  return (
    <g>
      <defs>
        <linearGradient id="houseFace" gradientUnits="userSpaceOnUse" x1={S.x} y1="0" x2={S.x + S.w} y2="0">
          <stop offset="0%" stopColor={color.hullWhite} />
          <stop offset="68%" stopColor={color.hullWhite} />
          <stop offset="100%" stopColor={color.hullSteel} />
        </linearGradient>
        <linearGradient id="funnelFace" gradientUnits="userSpaceOnUse" x1={FUNNEL.x} y1="0" x2={FUNNEL.x + FUNNEL.w} y2="0">
          <stop offset="0%" stopColor={color.hullSteelLight} />
          <stop offset="60%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
      </defs>

      {/* contact shadow on the deck under the house */}
      <ellipse cx={S.x + S.w / 2} cy={S.bottomY} rx={S.w / 2 + 4} ry={4} fill={color.hullShadow} opacity={0.45} filter="url(#softGlow)" />

      {/* funnel (behind the house): shaded, dark soot cap + muted band */}
      <rect x={FUNNEL.x} y={FUNNEL.y} width={FUNNEL.w} height={FUNNEL.h} rx={2} fill="url(#funnelFace)" />
      <ellipse cx={FUNNEL.x + FUNNEL.w / 2} cy={FUNNEL.y + 1} rx={FUNNEL.w / 2} ry={2.5} fill={color.abyss} />
      <rect x={FUNNEL.x} y={FUNNEL.y + 2} width={FUNNEL.w} height={4} fill={color.hullShadow} />
      <rect x={FUNNEL.x} y={FUNNEL.y + 10} width={FUNNEL.w} height={6} fill={color.signalRustDim} opacity={0.55} />
      <rect x={FUNNEL.x + 1.5} y={FUNNEL.y + 6} width={2} height={FUNNEL.h - 8} fill={color.hullSteelLight} opacity={0.35} />

      {/* mast with crosstree, stays + tiny nav light */}
      <line x1={MAST_X} y1={TOP - 6} x2={MAST_X} y2={6} stroke={color.hullSteel} strokeWidth={1.6} />
      <line x1={MAST_X - 7} y1={16} x2={MAST_X + 7} y2={16} stroke={color.hullSteel} strokeWidth={1.2} />
      <line x1={MAST_X} y1={9} x2={MAST_X - 16} y2={TOP - 8} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      <line x1={MAST_X} y1={9} x2={MAST_X + 16} y2={TOP - 8} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      <circle cx={MAST_X} cy={6} r={1.4} fill={color.signalRust} opacity={0.7} />

      {/* accommodation house */}
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#houseFace)" stroke={color.hullShadow} strokeWidth={1} />
      <rect x={S.x} y={TOP} width={2} height={S.bottomY - TOP} fill={color.hullSteelLight} opacity={0.4} />
      <rect x={S.x + S.w - 14} y={TOP} width={14} height={S.bottomY - TOP} fill={color.hullShadow} opacity={0.28} />

      {/* decks: overhang shadow line + a row of glazed windows (dark glass, thin frames) */}
      {deckYs.map((y) => (
        <g key={y}>
          <line x1={S.x} y1={y} x2={S.x + S.w} y2={y} stroke={color.hullShadow} strokeWidth={0.8} opacity={0.45} />
          {winXs.map((x) => (
            <rect key={x} x={x} y={y + (DH - WIN_H) / 2} width={WIN_W} height={WIN_H} fill="url(#glassGlazing)" stroke={color.hullShadow} strokeWidth={0.5} />
          ))}
        </g>
      ))}
      {/* doors on the lowest deck */}
      {[S.x + 24, S.x + S.w - 32].map((x) => (
        <rect key={x} x={x} y={S.bottomY - 12} width={6} height={11} fill={color.deepWaterBlue} stroke={color.hullShadow} strokeWidth={0.5} />
      ))}

      {/* weathering: faint vertical streaks + grain over the house */}
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#streaksPattern)" style={{ mixBlendMode: 'multiply', opacity: 0.2 }} />
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.28 }} />

      {/* navigation bridge with overhanging wings, slanted window strip + railings */}
      <rect x={S.x - WING} y={TOP - 13} width={S.w + 2 * WING} height={13} fill="url(#houseFace)" stroke={color.hullShadow} strokeWidth={1} />
      <rect x={S.x - WING + 6} y={TOP - 10} width={S.w + 2 * WING - 12} height={6} fill="url(#glassGlazing)" />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={S.x - WING + 11 + i * ((S.w + 2 * WING - 22) / 9)} y1={TOP - 10} x2={S.x - WING + 11 + i * ((S.w + 2 * WING - 22) / 9)} y2={TOP - 4} stroke={color.hullShadow} strokeWidth={0.6} opacity={0.5} />
      ))}
      <Rail x1={S.x - WING} x2={S.x + S.w + WING} y={TOP - 13} h={4} />
      <Rail x1={S.x - WING} x2={S.x + S.w + WING} y={TOP} h={3.5} />
    </g>
  )
}
