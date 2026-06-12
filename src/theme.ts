// Design tokens — the single home for every color, type, spacing, and motion value.
// Components import named tokens from here (e.g. color.abyss), never raw hex.
//
// TODO: fill these in from docs/design.md. The keys below are placeholders so the
// shape is real; the real low-saturation deep-sea values are NOT set yet — do not
// invent colors here, copy them from docs/design.md when building the visuals.

export const color = {
  // TODO: abyss, deepWater, glowTeal, signalRust, hullSteel, foulingSlime, … (docs/design.md)
} as const

export const font = {
  // TODO: family + the rem scale (display/h1/h2/body/caption) from docs/design.md
} as const

export const space = {
  // TODO: 8px scale — xs/sm/md/lg/xl/xxl (docs/design.md)
} as const

export const motion = {
  // TODO: glide duration, fouling tween, easing token (docs/design.md)
} as const

export const theme = { color, font, space, motion } as const
export type Theme = typeof theme
