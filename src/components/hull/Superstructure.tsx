// The aft accommodation block, bridge and funnel that sit on the deck near the stern — the
// "this is the back" cue. Drawn on top of the hull (above the deck line). Shaded with its
// own top-lit gradient, framed windows with a quiet teal glow, and a funnel band.
import { color } from '../../theme'
import { SUPERSTRUCTURE as S } from './hullGeometry'

const WINDOW_COLS = [0, 1, 2, 3]
const WINDOW_ROWS = [0, 1]

export default function Superstructure() {
  return (
    <g>
      <defs>
        {/* top-lit block: lighter at the top, shaded toward the deck */}
        <linearGradient id="superSteel" gradientUnits="userSpaceOnUse" x1="0" y1={S.bridgeY} x2="0" y2={S.baseY + S.baseH}>
          <stop offset="0%" stopColor={color.hullSteelLight} />
          <stop offset="55%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
      </defs>

      {/* funnel with a dark cap band */}
      <rect x={S.funnelX} y={S.funnelY} width={S.funnelW} height={S.funnelH} rx={2} fill="url(#superSteel)" />
      <rect x={S.funnelX} y={S.funnelY + 3} width={S.funnelW} height={4} fill={color.hullShadow} opacity={0.7} />

      {/* bridge tier */}
      <rect x={S.bridgeX} y={S.bridgeY} width={S.bridgeW} height={S.bridgeH} fill="url(#superSteel)" stroke={color.hullShadow} strokeWidth={1} />
      {/* accommodation base */}
      <rect x={S.baseX} y={S.baseY} width={S.baseW} height={S.baseH} fill="url(#superSteel)" stroke={color.hullShadow} strokeWidth={1} />
      {/* shaded right (aft) face for a hint of volume */}
      <rect x={S.baseX + S.baseW - 8} y={S.baseY} width={8} height={S.baseH} fill={color.hullShadow} opacity={0.4} />

      {/* lit windows with thin frames */}
      {WINDOW_ROWS.map((row) =>
        WINDOW_COLS.map((col) => {
          const x = S.baseX + 14 + col * 24
          const y = S.baseY + 12 + row * 22
          return (
            <g key={`${row}-${col}`}>
              <rect x={x - 1} y={y - 1} width={14} height={11} fill={color.hullShadow} />
              <rect x={x} y={y} width={12} height={9} fill={color.glowTeal} opacity={0.6} />
            </g>
          )
        }),
      )}
      {/* bridge windows (one strip) */}
      {WINDOW_COLS.map((col) => (
        <rect key={col} x={S.bridgeX + 10 + col * 16} y={S.bridgeY + 6} width={10} height={8} fill={color.glowTeal} opacity={0.5} />
      ))}

      {/* deck rail line in front of the block */}
      <line x1={S.baseX - 6} y1={S.baseY + S.baseH} x2={S.baseX + S.baseW + 6} y2={S.baseY + S.baseH} stroke={color.hullSteelLight} strokeWidth={1} opacity={0.3} />
    </g>
  )
}
