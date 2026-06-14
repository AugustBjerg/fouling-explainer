// Renders ONE marker in the barnacle colony. The hull is a flat SIDE elevation facing the
// camera, so a barnacle on it is seen roughly HEAD-ON (down its growth axis): a small, low
// dome of concentric calcareous plates around a central beak-like operculum — NOT a cone
// standing on a floor. Volume comes from directional shading (light upper-left) plus a small
// cast shadow offset down-right, so it reads as stuck to the wall facing us. Three shapes keep
// the colony varied (placement.variant):
//   0 = adult shell   1 = smaller worn shell   2 = a knot of juveniles
// Final size = placement jitter (scale) × sizeMultiplier (0..1, the barnacleSize variable).
import { memo } from 'react'
import { color } from '../../theme'
import type { BarnaclePlacement } from './hullGeometry'

interface BarnacleProps {
  placement: BarnaclePlacement
  /** barnacleSize(days): 0 = just-settled & tiny, 1 = full-size hard growth. */
  sizeMultiplier: number
}

// A single head-on shell centred at (0,0). `r` = outer radius; ever-so-slightly squashed
// vertically so it sits on the wall rather than reading as a perfect sticker.
// Memoized: a shell's geometry never depends on the per-tick barnacle size (only the parent
// <g> transform scales it), so React reuses each shell across slider ticks instead of
// rebuilding its ~14 elements every frame.
const Shell = memo(function Shell({ r, shell, rimLight }: { r: number; shell: string; rimLight: number }) {
  const ry = r * 0.92
  const mouthR = r * 0.46 // recessed central opening
  const opH = r * 0.42 // operculum half-height (the beak)
  const seamCount = 7

  return (
    <g>
      {/* small cast shadow, offset down-right (light from upper-left) — lifts it off the hull */}
      <ellipse cx={r * 0.22} cy={r * 0.28} rx={r * 1.02} ry={ry} fill={color.barnacleShadow} opacity={0.3} />

      {/* the plated wall (lit calcite) */}
      <ellipse cx={0} cy={0} rx={r} ry={ry} fill={shell} />
      {/* lower-right shade arc giving the dome volume */}
      <path
        d={`M ${r * 0.45} ${ry * 0.72} A ${r} ${ry} 0 0 1 ${r * 0.86} ${-ry * 0.42}`}
        fill="none"
        stroke={color.barnacleShadow}
        strokeWidth={r * 0.22}
        opacity={0.35}
        strokeLinecap="round"
      />

      {/* grooves between the wall plates, radiating from the mouth to the rim */}
      {Array.from({ length: seamCount }, (_, i) => {
        const a = (i / seamCount) * Math.PI * 2 + 0.3
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        return (
          <line
            key={i}
            x1={cos * mouthR}
            y1={sin * mouthR * 0.92}
            x2={cos * r * 0.96}
            y2={sin * ry * 0.96}
            stroke={color.barnacleSeam}
            strokeWidth={Math.max(0.3, r * 0.06)}
            opacity={0.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* recessed dark opening */}
      <ellipse cx={0} cy={0} rx={mouthR} ry={mouthR * 0.92} fill={color.barnacleSeam} />
      {/* operculum: two plates meeting at a central slit, closing the mouth */}
      <path d={`M 0 ${-opH} L ${-r * 0.3} 0 L 0 ${opH} Z`} fill={shell} opacity={0.92} />
      <path d={`M 0 ${-opH} L ${r * 0.3} 0 L 0 ${opH} Z`} fill={shell} opacity={0.72} />
      <line x1={0} y1={-opH * 0.85} x2={0} y2={opH * 0.85} stroke={color.barnacleSeam} strokeWidth={Math.max(0.3, r * 0.07)} />

      {/* lit rim arc along the upper-left edge */}
      <path
        d={`M ${-r * 0.72} ${ry * 0.45} A ${r} ${ry} 0 0 1 ${r * 0.5} ${-ry * 0.78}`}
        fill="none"
        stroke={color.barnacleHighlight}
        strokeWidth={r * 0.12}
        opacity={rimLight}
        strokeLinecap="round"
      />
    </g>
  )
})

export default function Barnacle({ placement, sizeMultiplier }: BarnacleProps) {
  const { x, y, scale, rotation, shadeJitter, variant } = placement
  // Even just-settled barnacles are visible but small; they grow toward full size with days.
  const effectiveScale = scale * (0.4 + 0.6 * sizeMultiplier)
  // Older shells tend to stain olive; split the colony by jitter so it isn't one uniform colour.
  const shell = shadeJitter < -0.15 ? color.barnacleShellWorn : color.barnacleShell
  const rimLight = 0.4 + 0.3 * ((shadeJitter + 1) / 2)

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${effectiveScale})`}>
      {variant === 0 && <Shell r={6} shell={shell} rimLight={rimLight} />}
      {variant === 1 && <Shell r={4.5} shell={shell} rimLight={rimLight} />}
      {variant === 2 && (
        <>
          {/* a crowded knot of juveniles at slightly different sizes and footings */}
          <g transform="translate(-4.5 1.5)">
            <Shell r={3.2} shell={color.barnacleShellWorn} rimLight={rimLight * 0.8} />
          </g>
          <g transform="translate(4 2)">
            <Shell r={2.8} shell={shell} rimLight={rimLight * 0.8} />
          </g>
          <g transform="translate(0 -1)">
            <Shell r={4} shell={shell} rimLight={rimLight} />
          </g>
        </>
      )}
    </g>
  )
}
