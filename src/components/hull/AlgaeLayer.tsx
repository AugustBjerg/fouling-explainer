// Renders algae on the underwater hull, seen on the flat SIDE elevation facing the camera:
// small soft-edged olive PATCHES of film lying on the surface, plus fine filament TUFTS that
// trail aft along the hull. Everything is STATIC (no animation). The algaeCoverage visual
// variable (0..1) controls how many patches/tufts have emerged and how large/opaque they are.
//
// PERFORMANCE: each patch's frayed edge uses an feTurbulence filter, which is costly to
// recompute. So the filtered geometry is drawn at FIXED full size and the growth/fade is done
// only with an OUTER <g> opacity + transform (a cheap composite the browser caches the filter
// through) — never by changing the filtered geometry itself, which would re-run the turbulence
// every slider tick. Clipped to the hull by the parent <g> in Hull.tsx.
import { memo } from 'react'
import { color } from '../../theme'

interface AlgaeLayerProps {
  /** algaeCoverage(days), 0..1. */
  coverage: number
}

// Deterministic patch anchors across the underwater band (waterline ~200 → keel ~280). Each
// `threshold` is the coverage at which the patch starts to show, so growth is gradual.
const PATCHES = [
  { cx: 380, cy: 226, r: 22, threshold: 0.0 },
  { cx: 520, cy: 244, r: 28, threshold: 0.1 },
  { cx: 690, cy: 222, r: 20, threshold: 0.25 },
  { cx: 840, cy: 252, r: 30, threshold: 0.15 },
  { cx: 1010, cy: 232, r: 24, threshold: 0.35 },
  { cx: 1180, cy: 248, r: 26, threshold: 0.45 },
  { cx: 1210, cy: 224, r: 20, threshold: 0.55 },
  { cx: 430, cy: 266, r: 18, threshold: 0.6 },
  { cx: 760, cy: 268, r: 20, threshold: 0.7 },
  { cx: 1110, cy: 266, r: 18, threshold: 0.75 },
] as const

// Filament tufts grow near the upper hull (more light) and trail aft (leftward). `threshold`
// gates when each emerges; `lean` tilts the whole tuft a touch so they aren't identical.
const TUFTS = [
  { x: 470, y: 214, len: 46, lean: -4, threshold: 0.08 },
  { x: 650, y: 222, len: 38, lean: 3, threshold: 0.22 },
  { x: 820, y: 216, len: 50, lean: -6, threshold: 0.15 },
  { x: 980, y: 226, len: 40, lean: 2, threshold: 0.32 },
  { x: 1130, y: 218, len: 44, lean: -3, threshold: 0.45 },
  { x: 560, y: 250, len: 34, lean: 5, threshold: 0.68 },
  { x: 900, y: 248, len: 36, lean: -2, threshold: 0.55 },
] as const

// How far along its 0.3-wide growth window a feature is, for a given coverage (0 = not yet,
// 1 = fully grown).
function growthOf(coverage: number, threshold: number): number {
  return Math.min(1, Math.max(0, (coverage - threshold) / 0.3))
}

// One static tuft of fine blades drawn at FULL size, anchored at the local origin. Blades
// trail aft (−x) and droop, fanned by per-blade vertical offsets, fresher at the tips.
// Memoized (len is stable) so its blade paths are built once, not every slider tick.
const Tuft = memo(function Tuft({ len }: { len: number }) {
  const blades = [-0.3, -0.16, -0.04, 0.08, 0.2, 0.34] // vertical droop fractions across the fan
  return (
    <g opacity={0.6}>
      {blades.map((d, i) => {
        const droop = d * len
        const reach = len * (0.82 + (i % 2) * 0.18) // alternate blade lengths for a frayed edge
        const blade = `M 0 0 Q ${-reach * 0.45} ${droop - reach * 0.05} ${-reach * 0.72} ${droop + reach * 0.07} T ${-reach} ${droop + reach * 0.16}`
        return (
          <g key={i}>
            <path d={blade} fill="none" stroke={color.foulingAlgaeDark} strokeWidth={1.7} strokeLinecap="round" opacity={0.85} />
            <path d={blade} fill="none" stroke={color.foulingAlgae} strokeWidth={1} strokeLinecap="round" />
            {/* fresher, lit tip on the trailing third */}
            <path
              d={`M ${-reach * 0.66} ${droop + reach * 0.05} Q ${-reach * 0.84} ${droop + reach * 0.1} ${-reach} ${droop + reach * 0.16}`}
              fill="none"
              stroke={color.foulingAlgaeBright}
              strokeWidth={0.7}
              strokeLinecap="round"
              opacity={0.85}
            />
          </g>
        )
      })}
    </g>
  )
})

export default function AlgaeLayer({ coverage }: AlgaeLayerProps) {
  if (coverage <= 0.001) return null
  return (
    <g aria-hidden="true">
      <defs>
        {/* soft, frayed edges rather than hard blobs */}
        <filter id="algaeTexture" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={11} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16} />
          <feGaussianBlur stdDeviation={3} />
        </filter>
      </defs>

      {/* film patches lying on the surface. Geometry is fixed (full size); the outer <g> only
          fades (opacity) and grows (transform scale), so the filter is computed once. */}
      {PATCHES.map((p, i) => {
        const grown = growthOf(coverage, p.threshold)
        if (grown <= 0) return null
        const s = 0.6 + 0.4 * grown
        const rx = p.r
        const ry = p.r * 0.55
        return (
          <g key={i} opacity={grown} transform={`translate(${p.cx} ${p.cy}) scale(${s}) translate(${-p.cx} ${-p.cy})`}>
            <g filter="url(#algaeTexture)">
              <ellipse cx={p.cx} cy={p.cy} rx={rx} ry={ry} fill={color.foulingAlgae} opacity={0.5} />
              {/* darker, denser core so the patch has depth rather than reading flat */}
              <ellipse cx={p.cx} cy={p.cy + ry * 0.15} rx={rx * 0.6} ry={ry * 0.55} fill={color.foulingAlgaeDark} opacity={0.45} />
              {/* a small fresher fleck for detail */}
              <ellipse cx={p.cx - rx * 0.35} cy={p.cy - ry * 0.3} rx={rx * 0.22} ry={ry * 0.22} fill={color.foulingAlgaeBright} opacity={0.4} />
            </g>
          </g>
        )
      })}

      {/* fine trailing filament tufts (no filter; fade + grow via the outer <g>) */}
      {TUFTS.map((t, i) => {
        const grown = growthOf(coverage, t.threshold)
        if (grown <= 0) return null
        const s = 0.7 + 0.3 * grown
        return (
          <g key={`t${i}`} opacity={grown} transform={`translate(${t.x} ${t.y}) rotate(${t.lean}) scale(${s})`}>
            <Tuft len={t.len} />
          </g>
        )
      })}
    </g>
  )
}
