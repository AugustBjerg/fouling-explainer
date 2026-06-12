// Shared hull coordinate system. Every hull layer (steel body, slime, algae, barnacles)
// reads these constants so they line up against ONE silhouette. Side-on bulk-carrier
// profile: bow at the left, stern (transom) at the right, drawn long so the camera can
// glide along it between acts (see App.tsx hull framing).

export const HULL = {
  viewBoxWidth: 1600,
  viewBoxHeight: 440,
  deckY: 120, // top of the hull (deck line)
  waterlineY: 250, // where topside meets the anti-fouling paint
  keelY: 360, // bottom of the hull
  bowTipX: 110, // forward-most point of the raked stem
  sternX: 1545, // aft transom
  /** Underwater band where fouling lives, with a little margin from the edges. */
  foulingMinX: 210,
  foulingMaxX: 1460,
} as const

/** Full hull outline (deck → raked bow → flat bottom → transom). */
export const HULL_PATH = [
  'M 160 120',
  'L 1470 120',
  'Q 1545 120 1545 185', // stern sheer into transom
  'L 1545 330',
  'L 1460 360', // transom bevel to bottom
  'L 250 360', // flat bottom
  'Q 150 360 120 250', // bow bilge turn up to the waterline
  'L 110 210',
  'Q 110 150 160 120 Z', // raked stem back to the deck
].join(' ')

/** Just the underwater portion (waterline → keel), for the anti-fouling paint band. */
export const UNDERWATER_PATH = [
  'M 122 250',
  'L 1545 250',
  'L 1545 330',
  'L 1460 360',
  'L 250 360',
  'Q 150 360 120 250 Z',
].join(' ')

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
    cy: waterlineY + 20 + rand() * (keelY - waterlineY - 35),
  }))

  const placements: BarnaclePlacement[] = []
  for (let i = 0; i < max; i++) {
    const c = clusters[Math.floor(rand() * clusterCount)]
    const spreadX = (rand() - 0.5) * 220
    const spreadY = (rand() - 0.5) * 70
    placements.push({
      id: i,
      x: clamp(c.cx + spreadX, foulingMinX, foulingMaxX),
      y: clamp(c.cy + spreadY, waterlineY + 12, keelY - 12),
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
