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

/** Full hull outline (stern transom at left → flat bottom → raked bow at right). */
export const HULL_PATH = [
  'M 205 96', // stern deck corner
  'L 1340 96', // deck run to the bow base
  'Q 1392 110 1388 168', // raked stem (down-and-forward to the right)
  'L 1376 200', // stem down to the waterline
  'Q 1386 280 1270 280', // bow bilge turn to the flat bottom
  'L 300 280', // flat bottom toward the stern
  'Q 195 280 195 200', // stern bilge up to the waterline
  'L 200 150', // transom rising
  'Q 202 108 205 96 Z', // stern sheer back to the deck
].join(' ')

/** Just the underwater portion (waterline → keel), for the anti-fouling paint band. */
export const UNDERWATER_PATH = [
  'M 195 200',
  'L 1376 200',
  'Q 1386 280 1270 280',
  'L 300 280',
  'Q 195 280 195 200 Z',
].join(' ')

// --- Recognizable bow & stern features (so each end reads as front / back) ----------------

/** Bulbous bow: rounded bulge at the forefoot, protruding forward/right (the front cue). */
export const BULBOUS_BOW = { cx: 1372, cy: 238, rx: 32, ry: 16 } as const

/** Propeller hub centre at the stern; sits low so the disc peeks below the keel (back cue). */
export const PROPELLER = { cx: 205, cy: 270, r: 16 } as const

/** Rudder: a fin aft of (left of) the propeller at the very stern. */
export const RUDDER_PATH = 'M 188 208 L 172 212 L 176 284 L 188 284 Z'

/** Aft accommodation block + bridge + funnel sitting on the deck near the stern (left). */
export const SUPERSTRUCTURE = {
  baseX: 212,
  baseY: 46,
  baseW: 120,
  baseH: 50, // base sits on the deck (baseY+baseH = deckY = 96)
  bridgeX: 234,
  bridgeY: 24,
  bridgeW: 76,
  bridgeH: 22,
  funnelX: 252,
  funnelY: 6,
  funnelW: 28,
  funnelH: 18,
} as const

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
