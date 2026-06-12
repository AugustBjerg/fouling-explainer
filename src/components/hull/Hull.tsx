// The persistent ship hull. Composes the weathered steel surface (HullPlating), the
// underwater appendages (Appendages), the aft superstructure (Superstructure) and the
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
import { HULL, HULL_PATH, buildBarnaclePlacements } from './hullGeometry'
import HullDefs from './HullDefs'
import HullPlating from './HullPlating'
import Appendages from './Appendages'
import Superstructure from './Superstructure'
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
      aria-label="Side view of a bulk carrier: accommodation block and propeller at the stern, bulbous bow at the front; fouling builds up below the waterline as days since cleaning increase."
    >
      <HullDefs />

      {/* underwater appendages, behind the hull body */}
      <Appendages />

      {/* hull body + fouling, clipped to the silhouette */}
      <g clipPath="url(#hullClip)">
        <HullPlating />

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

      {/* aft superstructure, on top of the deck */}
      <Superstructure />
    </svg>
  )
}
