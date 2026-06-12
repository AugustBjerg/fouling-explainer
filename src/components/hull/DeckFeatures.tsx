// On-deck features that make the ship read as a BULK CARRIER: a row of cargo-hold hatch
// covers, pedestal deck cranes (with kingpost + lattice boom) between them, and a raised
// forecastle (windlass, bitts, foremast) at the bow. Drawn above the deck line, with shaded
// gradients, weathering and contact shadows so the structures sit on the deck.
import { color } from '../../theme'
import { HULL, SUPERSTRUCTURE as S } from './hullGeometry'

const DECK = HULL.deckY // 96
const X_START = S.x + S.w + 24
const X_END = 1262
const HOLDS = 5
const SLOT = (X_END - X_START) / HOLDS
const HATCH_W = SLOT - 30
const HATCH_TOP = DECK - 16

const hatchXs = Array.from({ length: HOLDS }, (_, i) => X_START + i * SLOT)
const craneXs = Array.from({ length: HOLDS - 1 }, (_, i) => X_START + (i + 1) * SLOT - 15)

function shadow(cx: number, rx: number) {
  return <ellipse cx={cx} cy={DECK + 1} rx={rx} ry={2.5} fill={color.hullShadow} opacity={0.4} filter="url(#softGlow)" />
}

function Hatch({ x }: { x: number }) {
  const ribs = Math.floor(HATCH_W / 15)
  return (
    <g>
      {shadow(x + HATCH_W / 2, HATCH_W / 2 + 3)}
      <rect x={x - 2} y={DECK - 5} width={HATCH_W + 4} height={6} fill={color.hullShadow} />
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={14} fill="url(#hatchFace)" />
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={2} fill={color.hullSteelLight} opacity={0.35} />
      {Array.from({ length: ribs }, (_, i) => (
        <line key={i} x1={x + (i + 1) * (HATCH_W / (ribs + 1))} y1={HATCH_TOP + 1} x2={x + (i + 1) * (HATCH_W / (ribs + 1))} y2={DECK - 3} stroke={color.hullShadow} strokeWidth={0.8} opacity={0.45} />
      ))}
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={14} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.3 }} />
    </g>
  )
}

function Crane({ x }: { x: number }) {
  const pivotX = x + 4
  const pivotY = DECK - 58
  const tipX = x + 42
  const tipY = DECK - 70
  return (
    <g>
      {shadow(x, 12)}
      {/* tapered pedestal */}
      <polygon points={`${x - 5},${DECK} ${x + 5},${DECK} ${x + 3.5},${DECK - 33} ${x - 3.5},${DECK - 33}`} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.6} />
      {/* slewing house + aft counterweight + window */}
      <rect x={x - 11} y={DECK - 47} width={26} height={15} rx={1.5} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.7} />
      <rect x={x - 14} y={DECK - 44} width={4} height={9} fill={color.hullShadow} />
      <rect x={x + 8} y={DECK - 44} width={5} height={4} fill="url(#glassGlazing)" />
      <rect x={x - 11} y={DECK - 47} width={26} height={15} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.3 }} />
      {/* kingpost + lattice boom raised toward the bow + hook block */}
      <rect x={pivotX - 2} y={pivotY} width={4} height={DECK - 47 - pivotY} fill="url(#craneSteel)" />
      <polygon points={`${pivotX},${pivotY + 3} ${pivotX},${pivotY - 3} ${tipX},${tipY + 1.5} ${tipX},${tipY - 1.5}`} fill="url(#craneSteel)" />
      <line x1={pivotX} y1={pivotY - 3} x2={tipX} y2={tipY - 1.5} stroke={color.hullSteelLight} strokeWidth={0.6} opacity={0.4} />
      {Array.from({ length: 4 }, (_, i) => {
        const t1 = i / 4
        const t2 = (i + 1) / 4
        return <line key={i} x1={pivotX + (tipX - pivotX) * t1} y1={pivotY + 3 - 6 * t1} x2={pivotX + (tipX - pivotX) * t2} y2={pivotY - 3 - 6 * t2} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      })}
      <line x1={tipX} y1={tipY} x2={tipX} y2={tipY + 18} stroke={color.textMuted} strokeWidth={0.7} />
      <rect x={tipX - 2} y={tipY + 18} width={4} height={4} fill={color.hullShadow} />
    </g>
  )
}

function Forecastle() {
  const fx = X_END + 14
  const wx = fx + 22
  return (
    <g>
      {shadow(fx + 30, 34)}
      {/* raised forecastle deck + bulwark lip */}
      <rect x={fx} y={DECK - 15} width={60} height={15} fill="url(#hatchFace)" stroke={color.hullShadow} strokeWidth={0.7} />
      <rect x={fx} y={DECK - 15} width={60} height={2} fill={color.hullSteelLight} opacity={0.3} />
      <rect x={fx + 52} y={DECK - 20} width={8} height={6} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={0.5} />
      {/* mooring bitts */}
      {[fx + 8, fx + 40].map((bx) => (
        <rect key={bx} x={bx} y={DECK - 21} width={4} height={6} fill={color.hullShadow} />
      ))}
      {/* windlass: a horizontal winch (drum + end discs) */}
      <rect x={wx} y={DECK - 23} width={16} height={7} rx={1} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.5} />
      <circle cx={wx} cy={DECK - 19.5} r={4} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={0.6} />
      <circle cx={wx + 16} cy={DECK - 19.5} r={4} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={0.6} />
      {/* foremast + crosstree + forestay to the bow */}
      <line x1={wx + 8} y1={DECK - 22} x2={wx + 8} y2={DECK - 52} stroke={color.hullSteel} strokeWidth={1.6} />
      <line x1={wx + 1} y1={DECK - 44} x2={wx + 15} y2={DECK - 44} stroke={color.hullSteel} strokeWidth={1} />
      <line x1={wx + 8} y1={DECK - 50} x2={fx + 60} y2={DECK - 4} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
    </g>
  )
}

export default function DeckFeatures() {
  return (
    <g>
      <defs>
        <linearGradient id="hatchFace" gradientUnits="userSpaceOnUse" x1="0" y1={HATCH_TOP} x2="0" y2={DECK}>
          <stop offset="0%" stopColor={color.hullSteelLight} />
          <stop offset="35%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
        <linearGradient id="craneSteel" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color.hullSteelLight} />
          <stop offset="55%" stopColor={color.hullSteel} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
      </defs>

      {hatchXs.map((x) => (
        <Hatch key={x} x={x} />
      ))}
      {craneXs.map((x) => (
        <Crane key={x} x={x} />
      ))}
      <Forecastle />
    </g>
  )
}
