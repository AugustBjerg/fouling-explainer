// Renders the slime/biofilm film over the underwater hull: a soft, semi-transparent
// green sheen with turbulence-mottled, wispy edges. The whole layer's opacity = the
// slimeOpacity visual variable (0 = none, ~0.6 = thin sheen at full slime). Clipped to
// the hull by the parent <g> in Hull.tsx.
import { color } from '../../theme'
import { UNDERWATER_PATH, HULL } from './hullGeometry'

interface SlimeLayerProps {
  /** slimeOpacity(days), already in 0..~0.6 range. */
  opacity: number
}

export default function SlimeLayer({ opacity }: SlimeLayerProps) {
  if (opacity <= 0.001) return null
  return (
    <g opacity={opacity} aria-hidden="true">
      <defs>
        {/* fine turbulence + blur breaks up the flat fill into an organic film */}
        <filter id="slimeTexture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.04"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={18} />
          <feGaussianBlur stdDeviation={2.5} />
        </filter>
      </defs>
      {/* the film hugs the waterline and trails downward */}
      <path d={UNDERWATER_PATH} fill={color.foulingSlime} filter="url(#slimeTexture)" />
      {/* a slightly stronger band right at the waterline where slime first takes hold */}
      <rect
        x={HULL.sternX}
        y={HULL.waterlineY - 4}
        width={HULL.bowX - HULL.sternX}
        height={24}
        fill={color.foulingSlime}
        opacity={0.5}
        filter="url(#slimeTexture)"
      />
    </g>
  )
}
