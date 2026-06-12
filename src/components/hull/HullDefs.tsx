// All shared SVG <defs> for the hull: layered gradients (curved lit steel + anti-fouling
// paint + ambient-occlusion bands), a curved-metal micro-specular lighting filter, the
// bundled grime/grain/streak texture patterns, and the hull clip path. Kept here so the
// composition in Hull.tsx / HullPlating.tsx stays readable.
import { color } from '../../theme'
import { HULL, HULL_PATH } from './hullGeometry'

export default function HullDefs() {
  return (
    <defs>
      {/* topside steel: dark under the deck edge → mid steel → bright specular band just
          above the waterline → settling back to steel (sells a curved, lit plate) */}
      <linearGradient id="steelGradient" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.deckY} x2="0" y2={HULL.keelY}>
        <stop offset="0%" stopColor={color.hullShadow} />
        <stop offset="10%" stopColor={color.hullSteel} />
        <stop offset="42%" stopColor={color.hullSteelLight} />
        <stop offset="55%" stopColor={color.hullSteelLight} />
        <stop offset="62%" stopColor={color.hullSteel} />
        <stop offset="100%" stopColor={color.hullShadow} />
      </linearGradient>

      {/* anti-fouling paint: brighter oxblood near the waterline, darkening toward the keel */}
      <linearGradient id="paintGradient" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.waterlineY} x2="0" y2={HULL.keelY}>
        <stop offset="0%" stopColor={color.hullPaintBelow} />
        <stop offset="20%" stopColor={color.hullPaintBelow} />
        <stop offset="100%" stopColor={color.hullShadow} />
      </linearGradient>

      {/* ambient-occlusion shadow cast by the deck overhang along the top of the hull */}
      <linearGradient id="deckShadow" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.deckY} x2="0" y2={HULL.deckY + 30}>
        <stop offset="0%" stopColor="#000" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </linearGradient>

      {/* soft length-wise light falloff: brightest amidships, darker toward bow & stern */}
      <linearGradient id="lengthFalloff" gradientUnits="userSpaceOnUse" x1={HULL.sternX} y1="0" x2={HULL.bowX} y2="0">
        <stop offset="0%" stopColor="#000" stopOpacity={0.32} />
        <stop offset="30%" stopColor="#000" stopOpacity={0} />
        <stop offset="70%" stopColor="#000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000" stopOpacity={0.32} />
      </linearGradient>

      {/* air above the waterline: cold overcast daylight, hazier toward the horizon */}
      <linearGradient id="skyGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={HULL.waterlineY}>
        <stop offset="0%" stopColor={color.skyTop} />
        <stop offset="100%" stopColor={color.skyHorizon} />
      </linearGradient>

      {/* water below the waterline: lit just under the surface, darkening into the deep */}
      <linearGradient id="seaGradient" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.waterlineY} x2="0" y2={HULL.viewBoxHeight}>
        <stop offset="0%" stopColor={color.seaLit} />
        <stop offset="60%" stopColor={color.seaDeep} />
        <stop offset="100%" stopColor={color.seaDeep} />
      </linearGradient>

      {/* murk veil drawn over the submerged hull — the underwater part is seen THROUGH the
          water (green-tinted, lower-contrast), not sitting in front of it. Tinted right from
          the surface and deepening with depth. */}
      <linearGradient id="waterVeil" gradientUnits="userSpaceOnUse" x1="0" y1={HULL.waterlineY} x2="0" y2={HULL.keelY + 24}>
        <stop offset="0%" stopColor={color.seaLit} stopOpacity={0.32} />
        <stop offset="55%" stopColor={color.seaDeep} stopOpacity={0.62} />
        <stop offset="100%" stopColor={color.seaDeep} stopOpacity={0.82} />
      </linearGradient>

      {/* soft glow for the sea-surface line and light rays */}
      <filter id="softGlow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation={3} />
      </filter>

      {/* blur for the hull edge shading (inner shadow + grounding shadow) so the silhouette
          reads as a rounded, lit volume rather than a flat cut-out */}
      <filter id="edgeBlur" x="-15%" y="-15%" width="130%" height="130%">
        <feGaussianBlur stdDeviation={4} />
      </filter>

      {/* dark window glass reflecting the pale daytime sky at the top (shared by the
          superstructure, deck cranes and bridge) */}
      <linearGradient id="glassGlazing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color.skyHorizon} stopOpacity={0.7} />
        <stop offset="45%" stopColor={color.deepWaterBlue} />
        <stop offset="100%" stopColor={color.abyss} />
      </linearGradient>

      {/* curved-metal micro-specular: turbulence relief lit by a high, raking light →
          dappled glints/relief that read as brushed, slightly wet steel */}
      <filter id="metalSpecular" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.16" numOctaves={3} seed={8} result="noise" />
        <feSpecularLighting
          in="noise"
          surfaceScale={1.6}
          specularConstant={0.7}
          specularExponent={16}
          lightingColor={color.hullSteelLight}
          result="spec"
        >
          <feDistantLight azimuth={245} elevation={58} />
        </feSpecularLighting>
        <feComponentTransfer in="spec" result="specSoft">
          <feFuncA type="linear" slope={0.5} />
        </feComponentTransfer>
        <feComposite in="specSoft" in2="SourceGraphic" operator="in" />
      </filter>

      {/* bundled texture patterns (generated by scripts/gen-textures.mjs) */}
      <pattern id="grimePattern" patternUnits="userSpaceOnUse" width={620} height={300} patternTransform="rotate(2)">
        <image href="/textures/grime.png" width={620} height={300} preserveAspectRatio="none" />
      </pattern>
      <pattern id="grainPattern" patternUnits="userSpaceOnUse" width={260} height={150}>
        <image href="/textures/grain.png" width={260} height={150} preserveAspectRatio="none" />
      </pattern>
      <pattern id="streaksPattern" patternUnits="userSpaceOnUse" width={520} height={220}>
        <image href="/textures/streaks.png" width={520} height={220} preserveAspectRatio="none" />
      </pattern>

      <clipPath id="hullClip">
        <path d={HULL_PATH} />
      </clipPath>
    </defs>
  )
}
