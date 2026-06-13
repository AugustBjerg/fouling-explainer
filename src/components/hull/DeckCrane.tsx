// One pedestal deck crane, beefed up so it doesn't read as a skeleton: a tapered pedestal, a
// slewing house with a heavy aft counterweight, an A-frame gantry, a lattice boom luffed
// toward the bow, luffing (topping) wires to the boom tip, a tip sheave, and a hoist wire
// running in two falls down to a weighted hook block. Shaded with the shared craneSteel
// gradient (defined in DeckFeatures). `x` is the pedestal centre on the deck.
import { color } from '../../theme'
import { HULL } from './hullGeometry'

const DECK = HULL.deckY // 96

export default function DeckCrane({ x }: { x: number }) {
  const pivotX = x + 4 // boom pivot at the top of the kingpost
  const pivotY = DECK - 58
  const tipX = x + 42 // boom tip, raised toward the bow
  const tipY = DECK - 70
  const houseTop = DECK - 47 // top of the slewing house
  const apexX = x + 1 // A-frame gantry apex
  const apexY = DECK - 60
  const blockY = DECK - 20 // hanging hook block

  return (
    <g>
      {/* contact shadow */}
      <ellipse cx={x} cy={DECK + 1} rx={12} ry={2.5} fill={color.hullShadow} opacity={0.4} filter="url(#softGlow)" />

      {/* tapered pedestal */}
      <polygon points={`${x - 5},${DECK} ${x + 5},${DECK} ${x + 3.5},${DECK - 33} ${x - 3.5},${DECK - 33}`} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.6} />

      {/* heavy aft counterweight + slewing house + cab window */}
      <rect x={x - 18} y={houseTop + 1} width={8} height={13} rx={1} fill={color.hullShadow} />
      <circle cx={x - 14} cy={houseTop + 5} r={0.8} fill={color.hullSteelLight} opacity={0.5} />
      <circle cx={x - 14} cy={houseTop + 10} r={0.8} fill={color.hullSteelLight} opacity={0.5} />
      <rect x={x - 11} y={houseTop} width={26} height={15} rx={1.5} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.7} />
      <rect x={x + 8} y={houseTop + 3} width={5} height={4} fill="url(#glassGlazing)" />
      <rect x={x - 11} y={houseTop} width={26} height={15} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.3 }} />

      {/* A-frame gantry above the house — anchors the luffing wires */}
      <line x1={apexX} y1={apexY} x2={x - 6} y2={houseTop} stroke={color.hullSteel} strokeWidth={1.4} />
      <line x1={apexX} y1={apexY} x2={x + 10} y2={houseTop} stroke={color.hullSteel} strokeWidth={1.4} />

      {/* kingpost + lattice boom luffed toward the bow */}
      <rect x={pivotX - 2} y={pivotY} width={4} height={houseTop - pivotY} fill="url(#craneSteel)" />
      <polygon points={`${pivotX},${pivotY + 3} ${pivotX},${pivotY - 3} ${tipX},${tipY + 1.5} ${tipX},${tipY - 1.5}`} fill="url(#craneSteel)" />
      <line x1={pivotX} y1={pivotY - 3} x2={tipX} y2={tipY - 1.5} stroke={color.hullSteelLight} strokeWidth={0.6} opacity={0.4} />
      {Array.from({ length: 4 }, (_, i) => {
        const t1 = i / 4
        const t2 = (i + 1) / 4
        return <line key={i} x1={pivotX + (tipX - pivotX) * t1} y1={pivotY + 3 - 6 * t1} x2={pivotX + (tipX - pivotX) * t2} y2={pivotY - 3 - 6 * t2} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.5} />
      })}

      {/* luffing (topping) wires from the gantry apex to the boom tip */}
      <line x1={apexX} y1={apexY} x2={tipX - 1} y2={tipY} stroke={color.textMuted} strokeWidth={0.5} opacity={0.7} />
      <line x1={apexX} y1={apexY} x2={tipX + 1} y2={tipY} stroke={color.textMuted} strokeWidth={0.5} opacity={0.7} />

      {/* tip sheave + hoist wire (two falls) down to a weighted hook block */}
      <circle cx={tipX} cy={tipY} r={1.6} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={0.5} />
      <line x1={tipX - 1} y1={tipY} x2={tipX - 1} y2={blockY} stroke={color.textMuted} strokeWidth={0.5} opacity={0.7} />
      <line x1={tipX + 1} y1={tipY} x2={tipX + 1} y2={blockY} stroke={color.textMuted} strokeWidth={0.5} opacity={0.7} />
      <rect x={tipX - 3} y={blockY} width={6} height={7} rx={1} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.5} />
      <rect x={tipX - 3} y={blockY} width={6} height={2} fill={color.hullSteelLight} opacity={0.3} />
      <path d={`M ${tipX} ${blockY + 7} q 0 5 3.5 5 q 2.5 0 2.5 -2.8`} fill="none" stroke={color.hullShadow} strokeWidth={1.4} />
    </g>
  )
}
