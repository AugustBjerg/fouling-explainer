// On-deck features that make the ship read as a BULK CARRIER: a row of cargo-hold hatch
// covers (raised coaming, rubber gasket band, drain channels, securing cleats, rust streaks),
// pedestal deck cranes between them (DeckCrane), mooring gear in the gaps (bollards, fairleads),
// a painted safety walkway line, and a raised forecastle (windlass, bitts, chain stoppers,
// foremast) at the bow. Everything sits above the deck line with shading + contact shadows.
import { color } from '../../theme'
import { HULL, SUPERSTRUCTURE as S } from './hullGeometry'
import DeckCrane from './DeckCrane'

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
  const cleats = Math.floor(HATCH_W / 22)
  return (
    <g>
      {shadow(x + HATCH_W / 2, HATCH_W / 2 + 3)}
      {/* raised coaming the cover sits on (dark base + lit top lip) */}
      <rect x={x - 3} y={DECK - 5} width={HATCH_W + 6} height={6} fill={color.hullShadow} />
      <rect x={x - 3} y={DECK - 5} width={HATCH_W + 6} height={1} fill={color.hullSteelLight} opacity={0.3} />
      {/* drain channels notched along the coaming base */}
      {Array.from({ length: cleats * 2 }, (_, i) => {
        const dx = x + (i + 0.5) * (HATCH_W / (cleats * 2))
        return <line key={`drain${i}`} x1={dx} y1={DECK - 1} x2={dx} y2={DECK + 0.5} stroke={color.abyss} strokeWidth={0.6} opacity={0.6} />
      })}
      {/* hatch cover panel */}
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={14} fill="url(#hatchFace)" />
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={2} fill={color.hullSteelLight} opacity={0.35} />
      {/* rubber sealing gasket: dark inset band around the cover edge */}
      <rect x={x + 1} y={HATCH_TOP + 1} width={HATCH_W - 2} height={12} fill="none" stroke={color.abyss} strokeWidth={0.8} opacity={0.5} />
      {/* panel seams */}
      {Array.from({ length: ribs }, (_, i) => {
        const rx = x + (i + 1) * (HATCH_W / (ribs + 1))
        return <line key={`rib${i}`} x1={rx} y1={HATCH_TOP + 1} x2={rx} y2={DECK - 3} stroke={color.hullShadow} strokeWidth={0.8} opacity={0.45} />
      })}
      {/* securing cleats clamping the cover down onto the coaming */}
      {Array.from({ length: cleats }, (_, i) => {
        const cx = x + (i + 0.5) * (HATCH_W / cleats)
        return <rect key={`cleat${i}`} x={cx - 1} y={DECK - 6} width={2} height={3} fill={color.hullShadow} />
      })}
      {/* grain weathering + faint rust streaks bleeding down from the corners */}
      <rect x={x} y={HATCH_TOP} width={HATCH_W} height={14} fill="url(#grainPattern)" style={{ mixBlendMode: 'soft-light', opacity: 0.3 }} />
      {[x + 4, x + HATCH_W - 4].map((rx) => (
        <rect key={`rust${rx}`} x={rx} y={HATCH_TOP + 2} width={1.4} height={11} fill={color.signalRustDim} opacity={0.25} />
      ))}
    </g>
  )
}

// A double mooring bitt (bollard pair): two short capped posts rising from the deck.
function Bollard({ x }: { x: number }) {
  return (
    <g>
      {[0, 5].map((dx) => (
        <g key={dx}>
          <rect x={x + dx} y={DECK - 5} width={3} height={5} rx={1} fill="url(#craneSteel)" stroke={color.hullShadow} strokeWidth={0.4} />
          <ellipse cx={x + dx + 1.5} cy={DECK - 5} rx={1.8} ry={0.8} fill={color.hullSteelLight} opacity={0.5} />
        </g>
      ))}
    </g>
  )
}

// A fairlead / chock: a rounded opening in a low deck-edge casting that mooring lines run through.
function Fairlead({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y={DECK - 6} width={8} height={6} rx={2} fill={color.hullShadow} />
      <ellipse cx={x + 4} cy={DECK - 3} rx={2.2} ry={1.6} fill={color.abyss} />
    </g>
  )
}

// The near-side deck-edge railing: one thin top rail + evenly spaced vertical stanchions running
// the length of the open cargo deck. Drawn in front of the deck so it reads as the foreground
// rail catching the light — a big realism cue for almost no geometry.
function DeckRailing({ x1, x2 }: { x1: number; x2: number }) {
  const top = DECK - 7 // rail height above the deck line
  const n = Math.round((x2 - x1) / 26) // stanchion spacing
  return (
    <g stroke={color.hullSteelLight} strokeWidth={0.7} opacity={0.4}>
      <line x1={x1} y1={top} x2={x2} y2={top} />
      {Array.from({ length: n + 1 }, (_, i) => {
        const px = x1 + (i * (x2 - x1)) / n
        return <line key={i} x1={px} y1={top} x2={px} y2={DECK} />
      })}
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
      {/* chain stoppers between the windlass and the bow chock */}
      {[fx + 46, fx + 52].map((sx) => (
        <rect key={`stop${sx}`} x={sx} y={DECK - 19} width={3} height={4} rx={0.5} fill={color.hullShadow} stroke={color.hullSteelLight} strokeWidth={0.3} />
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

      {/* painted safety walkway line running fore-and-aft along the deck */}
      <line x1={X_START - 18} y1={DECK - 0.5} x2={X_END + 10} y2={DECK - 0.5} stroke={color.glowTeal} strokeWidth={0.8} strokeDasharray="6 5" opacity={0.25} />

      {hatchXs.map((x) => (
        <Hatch key={x} x={x} />
      ))}

      {/* mooring gear in the deck gaps fore and aft of the holds */}
      <Bollard x={X_START - 18} />
      <Fairlead x={X_START - 9} />
      <Bollard x={X_END + 1} />
      <Fairlead x={X_END - 9} />

      {craneXs.map((x) => (
        <DeckCrane key={x} x={x} />
      ))}
      <Forecastle />

      {/* near-side deck-edge railing along the open cargo deck (in front of the hatches/cranes) */}
      <DeckRailing x1={X_START - 18} x2={X_END + 10} />
    </g>
  )
}
