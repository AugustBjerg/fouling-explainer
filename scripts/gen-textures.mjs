// Generates the bundled hull textures in public/textures/ from procedural noise — no
// dependencies (built-in zlib only), no external assets. Re-run with:  node scripts/gen-textures.mjs
//
// Outputs (8-bit grayscale PNG, tileable-ish):
//   grime.png   — mottled dirt/grime, used as a multiply/soft-light overlay on the steel
//   grain.png   — fine metal micro-grain, low-opacity overlay to break up flatness
//   streaks.png — vertical rust/dirt drips running down from the deck
import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = path.resolve(fileURLToPath(import.meta.url), '../../public/textures')

// --- deterministic PRNG -----------------------------------------------------------------
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// One octave of value noise on a cellsX×cellsY random grid, smoothstep-interpolated.
function makeOctave(cellsX, cellsY, rand) {
  const gx = cellsX + 1
  const gy = cellsY + 1
  const g = new Float32Array(gx * gy)
  for (let i = 0; i < g.length; i++) g[i] = rand()
  return (u, v) => {
    const fx = u * cellsX
    const fy = v * cellsY
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const x1 = Math.min(x0 + 1, gx - 1)
    const y1 = Math.min(y0 + 1, gy - 1)
    const tx = fx - x0
    const ty = fy - y0
    const sx = tx * tx * (3 - 2 * tx)
    const sy = ty * ty * (3 - 2 * ty)
    const a = g[y0 * gx + x0]
    const b = g[y0 * gx + x1]
    const c = g[y1 * gx + x0]
    const d = g[y1 * gx + x1]
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy
  }
}

// Fractal sum of octaves; `octaves` is a list of [cellsX, cellsY, amplitude].
function fractal(width, height, octaves, seed, map) {
  const rand = mulberry32(seed)
  const layers = octaves.map(([cx, cy]) => makeOctave(cx, cy, rand))
  const amps = octaves.map(([, , a]) => a)
  const ampSum = amps.reduce((s, a) => s + a, 0)
  const pix = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width
      const v = y / height
      let n = 0
      for (let i = 0; i < layers.length; i++) n += layers[i](u, v) * amps[i]
      n /= ampSum // 0..1
      pix[y * width + x] = Math.max(0, Math.min(255, Math.round(map(n, u, v))))
    }
  }
  return pix
}

// --- PNG encoding (grayscale, 8-bit) ----------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function writeGrayPNG(file, width, height, pix) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 0 // colour type 0 = grayscale
  const raw = Buffer.alloc((width + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0 // filter type 0 (none)
    Buffer.from(pix.subarray(y * width, (y + 1) * width)).copy(raw, y * (width + 1) + 1)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  fs.writeFileSync(
    file,
    Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]),
  )
}

// --- generate ---------------------------------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true })

// grime: broad mottled dirt, mostly light (so multiply darkens gently and unevenly)
writeGrayPNG(
  path.join(OUT_DIR, 'grime.png'),
  512,
  512,
  fractal(512, 512, [[4, 4, 0.5], [8, 8, 0.3], [16, 16, 0.2], [40, 40, 0.12]], 1337, (n) => 150 + n * 95),
)

// grain: fine high-frequency micro-texture centred on mid-gray for overlay blending
writeGrayPNG(
  path.join(OUT_DIR, 'grain.png'),
  256,
  256,
  fractal(256, 256, [[64, 64, 0.6], [128, 128, 0.4]], 24, (n) => 108 + n * 40),
)

// streaks: many thin vertical drips (high X frequency, low Y frequency), biased to fade down
writeGrayPNG(
  path.join(OUT_DIR, 'streaks.png'),
  512,
  512,
  fractal(512, 512, [[120, 3, 0.6], [240, 6, 0.3], [60, 2, 0.3]], 99, (n, _u, v) => {
    // darker (more streak) where noise is low; streaks intensify toward the top, fade down
    const streak = Math.pow(n, 1.6)
    const fade = 1 - v * 0.5
    return 235 - (1 - streak) * 120 * fade
  }),
)

console.log('Wrote grime.png, grain.png, streaks.png to', OUT_DIR)
