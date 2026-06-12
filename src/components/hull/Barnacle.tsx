// Renders ONE barnacle as an irregular volcano shape with an off-center aperture, a soft
// contact shadow, and a faint top highlight. Never a plain circle — that's the cartoon
// risk. Size = placement jitter × sizeMultiplier (0..1, the barnacleSize visual variable).
import { color } from '../../theme'
import type { BarnaclePlacement } from './hullGeometry'

interface BarnacleProps {
  placement: BarnaclePlacement
  /** barnacleSize(days): 0 = just-arrived & tiny, 1 = full-size hard growth. */
  sizeMultiplier: number
}

export default function Barnacle({ placement, sizeMultiplier }: BarnacleProps) {
  const { x, y, scale, rotation, shadeJitter } = placement
  // Even brand-new barnacles are visible but small; they grow toward full size.
  const effectiveScale = scale * (0.35 + 0.65 * sizeMultiplier)
  const highlightOpacity = 0.5 + 0.25 * (shadeJitter + 1) // subtle per-instance variation

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation}) scale(${effectiveScale})`}
    >
      {/* contact shadow grounds the barnacle on the hull */}
      <ellipse cx={0} cy={6} rx={15} ry={5} fill={color.barnacleShadow} opacity={0.45} />
      {/* body: an asymmetric cone, not a circle */}
      <path
        d="M -12 5 C -14 -4 -8 -12 0 -12 C 9 -12 14 -3 12 5 C 8 8 -8 8 -12 5 Z"
        fill={color.barnacleShell}
      />
      {/* shaded lower flank for volume */}
      <path
        d="M -12 5 C -8 8 8 8 12 5 C 9 7 -9 7 -12 5 Z"
        fill={color.barnacleShadow}
        opacity={0.35}
      />
      {/* off-center crater aperture */}
      <ellipse cx={1} cy={-6} rx={4} ry={2.4} fill={color.barnacleShadow} opacity={0.8} />
      {/* faint top highlight */}
      <ellipse
        cx={-3}
        cy={-7}
        rx={3}
        ry={1.4}
        fill={color.barnacleHighlight}
        opacity={highlightOpacity}
      />
    </g>
  )
}
