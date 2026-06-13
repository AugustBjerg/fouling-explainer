// Shared hull coordinate system. Every hull layer (steel body, slime, algae, barnacles)
// and the recognizable features (bulbous bow, stern superstructure, propeller, rudder)
// read these constants so they line up against ONE silhouette.
//
// Layout (viewBox is 1600 wide, split into three equal thirds the camera frames per act):
//   left third  (centre x≈266)  = STERN (transom + aft accommodation + propeller/rudder)
//   middle third (centre x≈800) = midship plating
//   right third (centre x≈1333) = BOW (raked stem + bulbous bow)
// The ship is INSET inside the artwork (open water beyond each end) and each end is centred
// in its third, so Act 1 frames a recognizable stern and Act 3 a recognizable bow — with sea
// visible past the end rather than the end being jammed against the screen edge.
//
// Vertical margins are kept tight so the ship and its features stay in view when the hull is
// zoomed to one-third-per-act.

export const HULL = {
  viewBoxWidth: 1600,
  viewBoxHeight: 320,
  deckY: 96, // top of the hull (deck line); superstructure rises above this
  waterlineY: 200, // where topside meets the anti-fouling paint
  keelY: 280, // bottom of the hull
  sternX: 195, // aft-most point (transom), near the centre of the left third
  bowX: 1392, // forward-most point (stem), near the centre of the right third
  /** Underwater band where fouling lives, with a little margin from the hull ends. */
  foulingMinX: 320,
  foulingMaxX: 1240,
} as const

// Bow underwater profile with the bulbous bow built straight INTO the hull outline (it is
// part of the hull shape, not a separate blob), shared by HULL_PATH and UNDERWATER_PATH.
const BOW_BELOW_WATERLINE = [
  'C 1406 206 1418 220 1415 235', // forefoot bulges forward into the bulb nose
  'C 1412 252 1390 262 1358 267', // bulb underside curving back and down
  'Q 1305 277 1270 280', // into the flat bottom
].join(' ')

/** Full hull outline (stern transom at left → flat bottom → bulbous bow at right). */
export const HULL_PATH = [
  'M 205 96', // stern deck corner
  'L 1340 96', // deck run to the bow base
  'Q 1392 110 1388 168', // raked stem (down-and-forward to the right)
  'L 1376 200', // stem down to the waterline
  BOW_BELOW_WATERLINE, // bulbous bow, integrated
  'L 300 280', // flat bottom toward the stern
  'Q 195 280 195 200', // stern bilge up to the waterline
  'L 200 150', // transom rising
  'Q 202 108 205 96 Z', // stern sheer back to the deck
].join(' ')

/** Just the underwater portion (waterline → keel), for the anti-fouling paint band. */
export const UNDERWATER_PATH = [
  'M 195 200',
  'L 1376 200',
  BOW_BELOW_WATERLINE,
  'L 300 280',
  'Q 195 280 195 200 Z',
].join(' ')

// --- Recognizable stern features (so the back reads as the back) ---------------------------

/** Propeller hub centre, tucked under the stern counter at the end of the shaft boss. */
export const PROPELLER = { cx: 252, cy: 270, r: 13 } as const

/** Stern boss / skeg: connects the hull counter to the propeller hub so the prop reads as
 *  attached. Its top edge sits inside the hull silhouette (hidden behind the hull body). */
export const STERN_BOSS_PATH = 'M 306 270 L 248 238 L 240 270 L 258 290 L 300 284 Z'

/** Rudder: a fin hung aft of (left of) the propeller; its top tucks behind the hull. */
export const RUDDER_PATH = 'M 240 226 L 222 230 L 226 300 L 240 298 Z'

/** Aft accommodation block footprint; Superstructure.tsx builds the decks/bridge/funnel. */
export const SUPERSTRUCTURE = {
  x: 208,
  w: 128,
  bottomY: 96, // sits on the deck line
  topY: 32, // top of the accommodation block (bridge/funnel/mast rise a little above)
} as const

/**
 * Builds a gently undulating waterline across [x0..x1] at base height `baseY`, instead of a
 * dead-straight rule, so the sea reads as water rather than a drawn line. Alternating quadratic
 * bumps (crest up, trough down) of ~`amplitude` px every `wavelength` px. Returns an OPEN path
 * `d` (left→right) — stroke it for the surface line, or append a closing skirt for a sea fill.
 * SeaAndSky (behind the hull) and WaterVeil (in front) call this with identical args so the
 * boundary and the meniscus line up exactly where they meet at the hull's ends.
 */
export function waterlineWave(x0: number, x1: number, baseY: number, amplitude = 4, wavelength = 150): string {
  const segs = [`M ${x0} ${baseY}`]
  const half = wavelength / 2
  let x = x0
  let dir = -1 // start with a crest (up is -y)
  while (x < x1) {
    const nx = Math.min(x + half, x1)
    segs.push(`Q ${(x + nx) / 2} ${baseY + dir * amplitude} ${nx} ${baseY}`)
    x = nx
    dir *= -1
  }
  return segs.join(' ')
}

export interface BarnaclePlacement {
  id: number
  x: number
  y: number
  scale: number // per-instance size jitter (multiplied by barnacleSize later)
  rotation: number // degrees
  shadeJitter: number // -1..1, nudges the shell colour so the colony isn't uniform
}

/**
 * Deterministically lays out up to `max` barnacles, clustered like a colony (dense
 * patches, sparse gaps) rather than an even grid. Seeded so they never reshuffle between
 * renders; the Barnacle layer shows the first `barnacleDensity` of them.
 */
export function buildBarnaclePlacements(max: number): BarnaclePlacement[] {
  const rand = mulberry32(0xb0a7) // fixed seed → stable colony
  const { foulingMinX, foulingMaxX, waterlineY, keelY } = HULL

  // A few cluster centres along the underwater band.
  const clusterCount = 6
  const clusters = Array.from({ length: clusterCount }, () => ({
    cx: foulingMinX + rand() * (foulingMaxX - foulingMinX),
    cy: waterlineY + 16 + rand() * (keelY - waterlineY - 28),
  }))

  const placements: BarnaclePlacement[] = []
  for (let i = 0; i < max; i++) {
    const c = clusters[Math.floor(rand() * clusterCount)]
    const spreadX = (rand() - 0.5) * 220
    const spreadY = (rand() - 0.5) * 50
    placements.push({
      id: i,
      x: clamp(c.cx + spreadX, foulingMinX, foulingMaxX),
      y: clamp(c.cy + spreadY, waterlineY + 10, keelY - 10),
      scale: 0.6 + rand() * 0.8,
      rotation: (rand() - 0.5) * 30,
      shadeJitter: rand() * 2 - 1,
    })
  }
  return placements
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/** Small, fast seeded PRNG (mulberry32) — deterministic colony layout. */
function mulberry32(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
