// The persistent ship hull. Draws a weathered bulk-carrier profile (layered gradients +
// turbulence noise + seams + rust + draft marks) and overlays the fouling layers, all
// driven by `days`. Every fouling amount is derived from findings.ts so the hull and the
// Act 2 readouts always agree. Stays mounted across acts; App glides it via transform.
import { useMemo } from 'react'
import { color } from '../../theme'
import {
  slimeOpacity,
  algaeCoverage,
  barnacleDensity,
  barnacleSize,
  hullGrime,
} from '../../data/findings'
import { HULL, HULL_PATH, UNDERWATER_PATH, buildBarnaclePlacements } from './hullGeometry'
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

// Vertical seam lines along the topside, evenly spaced.
const SEAM_XS = Array.from({ length: 9 }, (_, i) => 250 + i * 145)

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
      aria-label="Side view of a bulk carrier hull; fouling builds up below the waterline as days since cleaning increase."
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

      {/* ---------------------------------------------------------------- hull body -- */}
      <g clipPath="url(#hullClip)">
        <path d={HULL_PATH} fill="url(#steelGradient)" />
        <path d={UNDERWATER_PATH} fill="url(#paintGradient)" />

        {/* boot-top stripe: a slightly irregular soft band at the waterline */}
        <rect x={HULL.bowTipX} y={HULL.waterlineY - 3} width={HULL.sternX - HULL.bowTipX} height={6} fill={color.hullShadow} opacity={0.7} />

        {/* wet specular sheen just above the waterline, following the hull */}
        <rect x={HULL.bowTipX} y={HULL.waterlineY - 26} width={HULL.sternX - HULL.bowTipX} height={16} fill={color.hullSteelLight} opacity={0.18} />

        {/* weld/seam lines */}
        {SEAM_XS.map((x) => (
          <line key={x} x1={x} y1={HULL.deckY} x2={x} y2={HULL.keelY} stroke={color.hullShadow} strokeWidth={1.4} opacity={0.4} />
        ))}

        {/* a couple of rust streaks running down from deck fittings */}
        {[360, 780, 1180].map((x) => (
          <rect key={x} x={x} y={HULL.deckY} width={3} height={90} fill={color.signalRustDim} opacity={0.3} />
        ))}

        {/* dashed draft marks near the bow */}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={205} y1={HULL.waterlineY - 4 - i * 14} x2={225} y2={HULL.waterlineY - 4 - i * 14} stroke={color.textMuted} strokeWidth={2} opacity={0.5} />
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
    </svg>
  )
}
