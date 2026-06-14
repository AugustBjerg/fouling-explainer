// Renders the slime/biofilm film over the underwater hull: a soft, semi-transparent green
// sheen with turbulence-mottled, wispy edges. The whole layer's opacity = the slimeOpacity
// visual variable (0 = none, ~0.32 at full slime — a thin translucent film). It is strongest
// near the waterline (where light feeds the biofilm) and FADES toward the keel via slimeFade,
// so even at full strength it never clouds the whole view. Clipped to the hull by Hull.tsx.
import { color } from '../../theme'
import { UNDERWATER_PATH, HULL } from './hullGeometry'

interface SlimeLayerProps {
  /** slimeOpacity(days), already in 0..~0.32 range. */
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
        {/* depth fade: full near the waterline, gone by the keel */}
        <linearGradient id="slimeFade" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.waterlineY} x2="0" y2={HULL.keelY}>
          <stop offset="0%" stopColor={color.foulingSlime} stopOpacity={1} />
          <stop offset="55%" stopColor={color.foulingSlime} stopOpacity={0.55} />
          <stop offset="100%" stopColor={color.foulingSlime} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      {/* the film hugs the waterline and trails downward, thinning with depth */}
      <path d={UNDERWATER_PATH} fill="url(#slimeFade)" filter="url(#slimeTexture)" />
      {/* a slightly stronger band right at the waterline where slime first takes hold */}
      <rect
        x={HULL.sternX}
        y={HULL.waterlineY - 4}
        width={HULL.bowX - HULL.sternX}
        height={22}
        fill={color.foulingSlime}
        opacity={0.45}
        filter="url(#slimeTexture)"
      />
    </g>
  )
}
