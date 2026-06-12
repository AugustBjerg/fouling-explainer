// The persistent ship hull. Draws a weathered bulk-carrier profile (layered gradients +
// turbulence noise + seams + rust + draft marks), the recognizable bow (raked stem +
// bulbous bow) and stern (transom + aft accommodation block + propeller/rudder), and the
// fouling layers — all driven by `days`. Every fouling amount is derived from findings.ts
// so the hull and the Act 2 readouts always agree. Stays mounted across acts; App glides it.
import { useMemo } from 'react'
import { color } from '../../theme'
import {
  slimeOpacity,
  algaeCoverage,
  barnacleDensity,
  barnacleSize,
  hullGrime,
} from '../../data/findings'
import {
  HULL,
  HULL_PATH,
  UNDERWATER_PATH,
  BULBOUS_BOW,
  PROPELLER,
  RUDDER_PATH,
  SUPERSTRUCTURE,
  buildBarnaclePlacements,
} from './hullGeometry'
import SlimeLayer from './SlimeLayer'
import AlgaeLayer from './AlgaeLayer'
import Barnacle from './Barnacle'

interface HullProps {
  /** daysSinceCleaning (0..180). The single driver of every fouling visual. */
  days: number
  reducedMotion?: boolean
}

const MAX_BARNACLES = 40 // matches findings.ts barnacleDensity ceiling
const ALL_BARNACLES = buildBarnaclePlacements(MAX_BARNACLES) // deterministic, built once

// Vertical seam lines along the topside, evenly spaced between stern and bow.
const SEAM_XS = Array.from({ length: 9 }, (_, i) => 360 + i * 108)

// Lit accommodation windows (rows on the aft superstructure block).
const WINDOW_COLS = [0, 1, 2, 3]
const WINDOW_ROWS = [0, 1]

export default function Hull({ days, reducedMotion = false }: HullProps) {
  const slime = slimeOpacity(days)
  const algae = algaeCoverage(days)
  const density = barnacleDensity(days)
  const bSize = barnacleSize(days)
  const grime = hullGrime(days)

  const visibleBarnacles = useMemo(() => ALL_BARNACLES.slice(0, density), [density])
  const tween = reducedMotion ? 'none' : 'opacity 400ms cubic-bezier(0.4,0,0.2,1)'

  return (
    <svg
      className="hull-stage__svg"
      viewBox={`0 0 ${HULL.viewBoxWidth} ${HULL.viewBoxHeight}`}
      role="img"
      aria-label="Side view of a bulk carrier: bow at the front, accommodation block and propeller at the stern; fouling builds up below the waterline as days since cleaning increase."
    >
      <defs>
        {/* curved, lit steel: shadow (deep) → steel (mid) → specular band near waterline */}
        <linearGradient id="steelGradient" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.deckY} x2="0" y2={HULL.keelY}>
          <stop offset="0%" stopColor={color.hullShadow} />
          <stop offset="35%" stopColor={color.hullSteel} />
          <stop offset="52%" stopColor={color.hullSteelLight} />
          <stop offset="62%" stopColor={color.hullSteel} />
        </linearGradient>
        {/* anti-fouling paint band: oxblood near waterline, darkening toward the keel */}
        <linearGradient id="paintGradient" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.waterlineY} x2="0" y2={HULL.keelY}>
          <stop offset="0%" stopColor={color.hullPaintBelow} />
          <stop offset="100%" stopColor={color.hullShadow} />
        </linearGradient>
        {/* fine grime mottle (desaturated turbulence) to kill the flat-vector look */}
        <filter id="hullNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves={2} seed={3} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <clipPath id="hullClip">
          <path d={HULL_PATH} />
        </clipPath>
      </defs>

      {/* ---- underwater appendages, drawn BEHIND the hull so they peek out at the ends -- */}
      {/* bulbous bow (front cue) */}
      <ellipse cx={BULBOUS_BOW.cx} cy={BULBOUS_BOW.cy} rx={BULBOUS_BOW.rx} ry={BULBOUS_BOW.ry} fill={color.hullPaintBelow} />
      {/* rudder + propeller (back cue) */}
      <path d={RUDDER_PATH} fill={color.hullShadow} />
      <g transform={`translate(${PROPELLER.cx} ${PROPELLER.cy})`}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse key={deg} cx={0} cy={0} rx={4} ry={PROPELLER.r} fill={color.hullSteelLight} opacity={0.85} transform={`rotate(${deg})`} />
        ))}
        <circle cx={0} cy={0} r={5} fill={color.hullShadow} />
      </g>

      {/* ---------------------------------------------------------------- hull body -- */}
      <g clipPath="url(#hullClip)">
        <path d={HULL_PATH} fill="url(#steelGradient)" />
        <path d={UNDERWATER_PATH} fill="url(#paintGradient)" />

        {/* boot-top stripe: a slightly irregular soft band at the waterline */}
        <rect x={HULL.sternX} y={HULL.waterlineY - 3} width={HULL.bowX - HULL.sternX} height={6} fill={color.hullShadow} opacity={0.7} />

        {/* wet specular sheen just above the waterline, following the hull */}
        <rect x={HULL.sternX} y={HULL.waterlineY - 18} width={HULL.bowX - HULL.sternX} height={12} fill={color.hullSteelLight} opacity={0.18} />

        {/* weld/seam lines */}
        {SEAM_XS.map((x) => (
          <line key={x} x1={x} y1={HULL.deckY} x2={x} y2={HULL.keelY} stroke={color.hullShadow} strokeWidth={1.4} opacity={0.4} />
        ))}

        {/* a couple of rust streaks running down from deck fittings */}
        {[520, 820, 1120].map((x) => (
          <rect key={x} x={x} y={HULL.deckY} width={3} height={68} fill={color.signalRustDim} opacity={0.3} />
        ))}

        {/* dashed draft marks near the bow (right) */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={1300} y1={HULL.waterlineY - 4 - i * 12} x2={1320} y2={HULL.waterlineY - 4 - i * 12} stroke={color.textMuted} strokeWidth={2} opacity={0.5} />
        ))}

        {/* grime mottle overlay */}
        <rect x={0} y={0} width={HULL.viewBoxWidth} height={HULL.viewBoxHeight} filter="url(#hullNoise)" opacity={0.08} />

        {/* ------------------------------------------------------------ fouling -- */}
        <g style={{ transition: tween }}>
          <SlimeLayer opacity={slime} />
        </g>
        <g style={{ transition: tween }}>
          <AlgaeLayer coverage={algae} />
        </g>
        {visibleBarnacles.map((p) => (
          <Barnacle key={p.id} placement={p} sizeMultiplier={bSize} />
        ))}

        {/* overall darkening/desaturation as the hull fouls (hullGrime) */}
        <path d={HULL_PATH} fill={color.hullShadow} opacity={grime * 0.4} style={{ transition: tween }} />
      </g>

      {/* ---- aft superstructure, drawn ON TOP (above the deck line, outside the clip) -- */}
      <g>
        {/* funnel */}
        <rect x={SUPERSTRUCTURE.funnelX} y={SUPERSTRUCTURE.funnelY} width={SUPERSTRUCTURE.funnelW} height={SUPERSTRUCTURE.funnelH} fill={color.hullShadow} />
        {/* bridge tier */}
        <rect x={SUPERSTRUCTURE.bridgeX} y={SUPERSTRUCTURE.bridgeY} width={SUPERSTRUCTURE.bridgeW} height={SUPERSTRUCTURE.bridgeH} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={1} />
        {/* accommodation base */}
        <rect x={SUPERSTRUCTURE.baseX} y={SUPERSTRUCTURE.baseY} width={SUPERSTRUCTURE.baseW} height={SUPERSTRUCTURE.baseH} fill={color.hullSteel} stroke={color.hullShadow} strokeWidth={1} />
        {/* lit windows — a quiet teal glow reads as the crew block at the back */}
        {WINDOW_ROWS.map((row) =>
          WINDOW_COLS.map((col) => (
            <rect
              key={`${row}-${col}`}
              x={SUPERSTRUCTURE.baseX + 14 + col * 24}
              y={SUPERSTRUCTURE.baseY + 12 + row * 22}
              width={12}
              height={9}
              fill={color.glowTeal}
              opacity={0.5}
            />
          )),
        )}
      </g>
    </svg>
  )
}
