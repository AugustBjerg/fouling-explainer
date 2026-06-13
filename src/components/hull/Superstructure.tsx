// The aft accommodation block — the "this is the back of a ship" cue. A multi-deck house with
// FRAMED cabin windows of mixed sizes (asymmetric rows + a blank stairwell column), a raked
// wheelhouse with wipers and a sun-visor ledge, bridge-wing + monkey-island railings, and
// facade clutter (protruding deck ledges, wall-mounted AC condensers, vertical conduit runs,
// a fire-station box, a painted darker lower course). The soot-stained funnel + mast live in
// Funnel.tsx. Daylight treatment: dark reflective glass, per-deck shadow, weathering overlays.
import { color } from '../../theme'
import { SUPERSTRUCTURE as S } from './hullGeometry'
import Funnel from './Funnel'

const TOP = 44 // top of the accommodation block (bridge rises above this)
const DECKS = 4
const DH = (S.bottomY - TOP) / DECKS // 13 — one accommodation deck's height
const WING = 12 // how far each bridge wing overhangs the house side

const deckYs = Array.from({ length: DECKS }, (_, i) => TOP + i * DH) // [44,57,70,83]

// Per-deck cabin windows. Mixed widths + a blank "stairwell/utility" column (0) so the rows
// read as a real house, not a perfect grid; the blank shifts deck to deck for asymmetry.
// Top decks get wider day-room windows, lower decks smaller portlights.
const CABIN_ROWS = [
  { h: 6, widths: [9, 9, 0, 9, 9, 9] },
  { h: 5, widths: [6, 6, 6, 0, 6, 0, 0] }, // slots 5–6 left blank for AC condensers
  { h: 5, widths: [6, 6, 6, 6, 0, 6, 6] },
  { h: 4.5, widths: [0, 0, 5, 5, 0, 5, 5] }, // slots 0,1,4 blank for fire box + two doors
]

// The lower decks share a 7-slot grid; fixtures (AC units, doors) sit in slots the window
// pattern leaves blank, so nothing overlaps. Returns the centre x of slot `i`.
const LOWER_COLS = 7
function slotCenter(i: number) {
  const x0 = S.x + 9
  const slot = (S.w - 18) / LOWER_COLS
  return x0 + i * slot + slot / 2
}

// Lay a row out in even slots, each window centred in its slot (a 0 leaves a wall gap).
function rowWindows(y: number, h: number, widths: number[]) {
  const x0 = S.x + 9
  const slot = (S.w - 18) / widths.length
  const cy = y + (DH - h) / 2
  return widths
    .map((w, i) => ({ i, w, h, cy, x: x0 + i * slot + (slot - w) / 2 }))
    .filter((d) => d.w > 0)
}

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
      </defs>

      {/* contact shadow on the deck under the house */}
      <ellipse cx={S.x + S.w / 2} cy={S.bottomY} rx={S.w / 2 + 4} ry={4} fill={color.hullShadow} opacity={0.45} filter="url(#softGlow)" />

      {/* funnel + mast rise behind the house */}
      <Funnel />

      {/* accommodation house body + lit/shadow side strakes */}
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#houseFace)" stroke={color.hullShadow} strokeWidth={1} />
      <rect x={S.x} y={TOP} width={2} height={S.bottomY - TOP} fill={color.hullSteelLight} opacity={0.4} />
      <rect x={S.x + S.w - 14} y={TOP} width={14} height={S.bottomY - TOP} fill={color.hullShadow} opacity={0.28} />

      {/* directional shadow cast by the bridge overhang onto the top of the house face (the
          light is overhead, so the wall just under the wing is in shade) */}
      <rect x={S.x} y={TOP} width={S.w} height={14} fill="url(#bridgeUndershadow)" />

      {/* painted darker lower course (the house's base band) */}
      <rect x={S.x} y={deckYs[3]} width={S.w} height={S.bottomY - deckYs[3]} fill={color.hullSteel} opacity={0.5} />

      {/* protruding deck ledges (shadow under + lit lip) + framed cabin windows with visors */}
      {deckYs.map((y, di) => (
        <g key={y}>
          <line x1={S.x} y1={y} x2={S.x + S.w} y2={y} stroke={color.hullShadow} strokeWidth={1} opacity={0.5} />
          <line x1={S.x} y1={y + 1} x2={S.x + S.w} y2={y + 1} stroke={color.hullSteelLight} strokeWidth={0.6} opacity={0.3} />
          {rowWindows(y, CABIN_ROWS[di].h, CABIN_ROWS[di].widths).map((d) => (
            <g key={d.i}>
              <rect x={d.x - 0.8} y={d.cy - 0.8} width={d.w + 1.6} height={d.h + 1.6} fill={color.hullSteelLight} opacity={0.45} />
              <rect x={d.x} y={d.cy} width={d.w} height={d.h} fill="url(#glassGlazing)" stroke={color.hullShadow} strokeWidth={0.4} />
              <line x1={d.x - 0.8} y1={d.cy - 1.4} x2={d.x + d.w + 0.8} y2={d.cy - 1.4} stroke={color.hullShadow} strokeWidth={0.8} opacity={0.5} />
            </g>
          ))}
        </g>
      ))}

      {/* facade clutter: wall-mounted AC condensers (louvred) in the second deck's blank slots */}
      {[slotCenter(5), slotCenter(6)].map((cx) => (
        <g key={cx}>
          <rect x={cx - 4.5} y={deckYs[1] + 4} width={9} height={6} fill={color.hullShadow} stroke={color.hullShadow} strokeWidth={0.4} />
          {[0, 1, 2].map((j) => (
            <line key={j} x1={cx - 3.5} y1={deckYs[1] + 5.5 + j * 1.5} x2={cx + 3.5} y2={deckYs[1] + 5.5 + j * 1.5} stroke={color.hullSteelLight} strokeWidth={0.4} opacity={0.4} />
          ))}
        </g>
      ))}
      {/* vertical conduit runs on the shadow-side strake (outboard of the windows) */}
      {[S.x + S.w - 6, S.x + S.w - 9].map((px) => (
        <line key={px} x1={px} y1={TOP + 2} x2={px} y2={S.bottomY - 2} stroke={color.hullShadow} strokeWidth={0.8} opacity={0.5} />
      ))}

      {/* two doors + a fire-station box in the lowest deck's blank slots */}
      {[slotCenter(1), slotCenter(4)].map((cx) => (
        <rect key={cx} x={cx - 3} y={S.bottomY - 12} width={6} height={11} fill={color.deepWaterBlue} stroke={color.hullShadow} strokeWidth={0.5} />
      ))}
      <rect x={slotCenter(0) - 2.5} y={S.bottomY - 11} width={5} height={6} fill={color.signalRustDim} stroke={color.hullShadow} strokeWidth={0.4} />

      {/* weathering: faint vertical streaks + grain over the house */}
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#streaksPattern)" style={{ mixBlendMode: 'multiply', opacity: 0.2 }} />
      <rect x={S.x} y={TOP} width={S.w} height={S.bottomY - TOP} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.28 }} />

      {/* navigation bridge: overhanging wings, sun-visor ledge, raked wheelhouse glass + mullions */}
      <rect x={S.x - WING} y={TOP - 13} width={S.w + 2 * WING} height={13} fill="url(#houseFace)" stroke={color.hullShadow} strokeWidth={1} />
      <rect x={S.x - WING + 4} y={TOP - 11} width={S.w + 2 * WING - 8} height={1.5} fill={color.hullShadow} opacity={0.6} />
      <rect x={S.x - WING + 6} y={TOP - 9} width={S.w + 2 * WING - 12} height={6} fill="url(#glassGlazing)" />
      {Array.from({ length: 10 }, (_, i) => {
        const mx = S.x - WING + 11 + i * ((S.w + 2 * WING - 22) / 9)
        return <line key={i} x1={mx} y1={TOP - 9} x2={mx} y2={TOP - 3} stroke={color.hullShadow} strokeWidth={0.6} opacity={0.5} />
      })}
      {/* wheelhouse window wipers */}
      {[0.28, 0.5, 0.72].map((t) => {
        const wx = S.x - WING + 8 + t * (S.w + 2 * WING - 16)
        return <line key={t} x1={wx} y1={TOP - 3.5} x2={wx + 3} y2={TOP - 7} stroke={color.hullShadow} strokeWidth={0.5} opacity={0.6} />
      })}
      {/* monkey-island rail (above the bridge) + boat-deck rail (at its foot) */}
      <Rail x1={S.x - WING} x2={S.x + S.w + WING} y={TOP - 13} h={4} />
      <Rail x1={S.x - WING} x2={S.x + S.w + WING} y={TOP} h={3.5} />
    </g>
  )
}
