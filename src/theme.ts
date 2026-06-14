// Design tokens — the single home for every color, type, spacing, and motion value.
// Values come straight from docs/design.md. Components import named tokens from here
// (e.g. color.abyss) for inline SVG/JS; CSS reads the matching custom properties that
// applyThemeVars() writes onto :root, so there is still ONE source of truth (this file).

/** Low-saturation deep-sea palette (docs/design.md → Color tokens). Never use raw hex. */
export const color = {
  abyss: '#050C0E', // page background, darkest (vignette edges)
  deepWater: '#0A1A1C', // main background field (desaturated teal)
  deepWaterBlue: '#0B1822', // cooler blue pocket, depth variation
  deepWaterRaised: '#102528', // cards, panels, raised surfaces
  glowTeal: '#5E8C82', // dialed-down accent + ambient light (never neon)
  glowTealSoft: 'rgba(94,140,130,0.12)', // ambient caustics, rim light, hover washes
  glowTealBright: '#3FA890', // higher-contrast accent for emphasized words/figures in copy
  signalRust: '#B07A4E', // the single warm signal — readouts only
  signalRustDim: '#7E5C42', // readout at low values, before it warms up
  textPrimary: '#DDE6E2', // body + headlines (cool off-white)
  textMuted: '#7C918B', // captions, secondary text, labels
  hullSteel: '#46545B', // hull plating, mid-tone
  hullSteelLight: '#6B7A82', // specular highlight near the waterline
  hullShadow: '#1A2528', // deep shadow on the hull (volume / far side)
  hullPaintBelow: '#5E2E2C', // anti-fouling band below waterline (muted oxblood)
  scumLine: '#241A11', // grimy dark-brown band right at the waterline + rust streak tails
  hullWhite: '#C4CECB', // superstructure / deckhouse light paint (desaturated off-white)
  // Daytime sea & sky (cold, overcast, photographic — muted, not tropical-bright)
  skyTop: '#8FA1A6', // upper sky (cool overcast grey-blue)
  skyHorizon: '#BAC6C5', // pale hazy band at the horizon
  seaSurface: '#6E8B84', // the lit sea-surface line where air meets water
  seaLit: '#3F5E58', // water just under the surface (daylit teal-green)
  seaDeep: '#16292A', // deep water, darkening with depth
  propBronzeLit: '#867A57', // propeller bronze, lit edge (muted)
  propBronzeDark: '#322F20', // propeller bronze, shaded
  foulingSlime: '#35463E', // biofilm/slime film (used at low opacity)
  foulingAlgae: '#4E5C36', // algae patches (muted olive)
  foulingAlgaeBright: '#67793F', // lit tips of algae fronds (slightly fresher green)
  foulingAlgaeDark: '#2E3A22', // shaded base of algae tufts
  barnacleShell: '#A7AC9E', // barnacle bodies (pale sage-grey)
  barnacleShellWorn: '#8A9082', // older/algae-stained shells (darker, olive-grey)
  barnacleHighlight: '#C8CABD', // subtle top highlight / lit rim on a barnacle
  barnacleShadow: '#6E7468', // barnacle shading / contact shadow
  barnacleSeam: '#4C5249', // dark grooves between a barnacle's wall plates + the open mouth
} as const

/** Typography (docs/design.md → Typography). One family; fluid display sizes via clamp(). */
export const font = {
  family:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  size: {
    display: 'clamp(2.2rem, 6vw, 3rem)', // big act titles / hero numbers
    h1: 'clamp(1.6rem, 4.5vw, 2rem)',
    h2: 'clamp(1.3rem, 3.5vw, 1.5rem)',
    body: '1rem',
    caption: '0.85rem',
  },
  lineHeight: {
    tight: '1.1', // display / big numbers
    body: '1.6',
  },
  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
} as const

/** 8px spacing scale (docs/design.md → Spacing). */
export const space = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '40px',
  xxl: '64px',
} as const

/** Motion tokens (docs/design.md → Motion). The "glide" is the signature move. */
export const motion = {
  glideMs: 600, // act transition: hull translateX + slight scale
  glideSlowMs: 1600, // the slower, cinematic dive into Act 2 (below the waterline)
  foulingMs: 400, // fouling layers ease in when daysSinceCleaning changes
  ambientMs: 12000, // slow drifting particles / caustic light
  ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // default easing
} as const

/** Layout constants (docs/design.md → Spacing & layout). */
export const layout = {
  textMaxWidth: '720px',
  mobileMinWidth: '360px',
} as const

export const theme = { color, font, space, motion, layout } as const
export type Theme = typeof theme

/**
 * Writes the palette/space/motion tokens onto :root as CSS custom properties so CSS can
 * use var(--color-abyss) etc. while this file stays the single source of truth.
 * Called once from main.tsx. Naming: --color-<key>, --space-<key>, --font-size-<key>,
 * --motion-<key>, --ease.
 */
export function applyThemeVars(root: HTMLElement = document.documentElement): void {
  for (const [key, value] of Object.entries(color)) {
    root.style.setProperty(`--color-${kebab(key)}`, value)
  }
  for (const [key, value] of Object.entries(space)) {
    root.style.setProperty(`--space-${key}`, value)
  }
  for (const [key, value] of Object.entries(font.size)) {
    root.style.setProperty(`--font-size-${key}`, value)
  }
  root.style.setProperty('--font-family', font.family)
  root.style.setProperty('--line-height-body', font.lineHeight.body)
  root.style.setProperty('--line-height-tight', font.lineHeight.tight)
  root.style.setProperty('--motion-glide', `${motion.glideMs}ms`)
  root.style.setProperty('--motion-fouling', `${motion.foulingMs}ms`)
  root.style.setProperty('--ease', motion.ease)
  root.style.setProperty('--text-max-width', layout.textMaxWidth)
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}
