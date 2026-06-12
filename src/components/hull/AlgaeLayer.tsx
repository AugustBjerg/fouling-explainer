// Renders algae as soft-edged olive patches scattered along the underwater hull. The
// algaeCoverage visual variable (0..1) controls how many patches have emerged and how
// large/opaque they are — patches appear progressively as coverage rises. Clipped to the
// hull by the parent <g> in Hull.tsx.
import { color } from '../../theme'

interface AlgaeLayerProps {
  /** algaeCoverage(days), 0..1. */
  coverage: number
}

// Deterministic patch anchors across the underwater band (waterline ~200 → keel ~280).
// Each `threshold` is the coverage at which the patch starts to show, so growth is gradual.
const PATCHES = [
  { cx: 380, cy: 222, r: 36, threshold: 0.0 },
  { cx: 520, cy: 240, r: 46, threshold: 0.1 },
  { cx: 690, cy: 218, r: 32, threshold: 0.25 },
  { cx: 840, cy: 250, r: 48, threshold: 0.15 },
  { cx: 1010, cy: 228, r: 38, threshold: 0.35 },
  { cx: 1180, cy: 246, r: 44, threshold: 0.45 },
  { cx: 1210, cy: 220, r: 34, threshold: 0.55 },
  { cx: 430, cy: 262, r: 30, threshold: 0.6 },
  { cx: 760, cy: 266, r: 32, threshold: 0.7 },
  { cx: 1110, cy: 264, r: 30, threshold: 0.75 },
] as const

export default function AlgaeLayer({ coverage }: AlgaeLayerProps) {
  if (coverage <= 0.001) return null
  return (
    <g aria-hidden="true">
      <defs>
        {/* soft, frayed edges rather than hard blobs */}
        <filter id="algaeTexture" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={22} />
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>
      {PATCHES.map((p, i) => {
        const local = (coverage - p.threshold) / 0.3 // how grown this patch is
        const grown = Math.min(1, Math.max(0, local))
        if (grown <= 0) return null
        return (
          <ellipse
            key={i}
            cx={p.cx}
            cy={p.cy}
            rx={p.r * (0.5 + 0.5 * grown)}
            ry={p.r * 0.55 * (0.5 + 0.5 * grown)}
            fill={color.foulingAlgae}
            opacity={0.5 * grown}
            filter="url(#algaeTexture)"
          />
        )
      })}
    </g>
  )
}
