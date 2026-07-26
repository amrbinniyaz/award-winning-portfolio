/**
 * PLACEHOLDER ASSET GENERATOR
 *
 * Produces the three images the landing page needs, procedurally, with zero
 * dependencies (Node's zlib gives us PNG for free).
 *
 *   portrait.png              — lit silhouette bust
 *   portrait-illustration.png — posterized duotone variant of the same bust
 *   fluid-bg.png              — warm textured plate the fluid mask reveals
 *   favicon.svg
 *
 * Drop your own images over these at the same paths and nothing else changes.
 *
 *   node tools/generate-assets.mjs
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images');
mkdirSync(OUT, { recursive: true });

/* ── PNG encoder ──────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array of w*h*4 */
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  ihdr[10] = 0;  // deflate
  ihdr[11] = 0;  // adaptive filtering
  ihdr[12] = 0;  // no interlace

  // Each scanline gets a leading filter byte (0 = None).
  const stride = w * 4;
  const raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride)
      .copy(raw, y * (stride + 1) + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── Maths helpers ────────────────────────────────────────── */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Cheap deterministic value noise — no RNG state, stable across runs. */
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(hash2(xi, yi),     hash2(xi + 1, yi),     u),
    lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u),
    v
  );
}

function fbm(x, y, octaves = 5) {
  let sum = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return sum;
}

/* ── Bust silhouette ──────────────────────────────────────────
   Defined as a WIDTH PROFILE: half-width of the figure at each height.
   Unioning ellipses via soft-min on *normalized* distances pinches visibly
   at the joins (the result reads as a stacked snowman), because a normalized
   ellipse distance is not a true signed distance. A profile is continuous by
   construction and gives direct control over the shoulder slope.

   Returns a signed distance in px: negative inside, 0 on the silhouette. */

const W = 1200, H = 936;
const CX = 600;

const HEAD_CY = 300, HEAD_RX = 172, HEAD_RY = 215;
const NECK_HW = 86;
const SHOULDER_Y = 640, SHOULDER_RUN = 300, SHOULDER_HW = 520;

function halfWidthAt(y) {
  let hw = 0;

  // Head — elliptical cross-section.
  const t = (y - HEAD_CY) / HEAD_RY;
  if (Math.abs(t) < 1) hw = Math.max(hw, HEAD_RX * Math.sqrt(1 - t * t));

  // Neck — a short straight column, overlapping the head so the join is
  // continuous rather than a pinch point.
  if (y >= 430 && y <= 700) hw = Math.max(hw, NECK_HW);

  // Shoulders — cosine ramp, slow at first then opening out to fill the
  // frame at the bottom edge.
  if (y >= SHOULDER_Y) {
    const s = clamp((y - SHOULDER_Y) / SHOULDER_RUN, 0, 1);
    hw = Math.max(hw, NECK_HW + (1 - Math.cos(s * Math.PI / 2)) * SHOULDER_HW);
  }

  return hw;
}

/** Signed distance to the silhouette, in pixels. Negative inside. */
function bustSDF(x, y) {
  return Math.abs(x - CX) - halfWidthAt(y);
}

/* ── portrait.png ─────────────────────────────────────────── */

function makePortrait() {
  const px = new Uint8Array(W * H * 4);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const sd = bustSDF(x, y);

      // Anti-aliased coverage across the boundary (sd is in px).
      const cov = 1 - smoothstep(-1.2, 1.2, sd);
      if (cov <= 0.001) { px[i + 3] = 0; continue; }

      // Key light upper-left, subtle falloff.
      const lx = (x - 380) / W, ly = (y - 150) / H;
      const light = clamp(1 - Math.sqrt(lx * lx + ly * ly) * 1.15, 0, 1);

      // Rim light in the last ~30px before the silhouette edge.
      const rim = smoothstep(-30, -2, sd) * 0.85;

      // Warm sepia base, sitting in the same family as --bg-boot. The ambient
      // floor is kept well off zero so the unlit shoulders read as form
      // rather than as a black hole against the pale page.
      const shade = 0.44 + 0.54 * light;
      const grain = (fbm(x * 0.012, y * 0.012) - 0.5) * 0.06;

      let r = (118 * shade + 176 * rim) * (1 + grain);
      let g = (104 * shade + 168 * rim) * (1 + grain);
      let b = (94  * shade + 158 * rim) * (1 + grain);

      px[i]     = clamp(r, 0, 255) | 0;
      px[i + 1] = clamp(g, 0, 255) | 0;
      px[i + 2] = clamp(b, 0, 255) | 0;
      px[i + 3] = (cov * 255) | 0;
    }
  }

  writeFileSync(join(OUT, 'portrait.png'), encodePNG(W, H, px));
  console.log('  portrait.png                 1200×936');
}

/* ── portrait-illustration.png ────────────────────────────────
   Must read as clearly different from the base — this is what the
   fluid and the gooey mask reveal, so the contrast is the effect. */

function makeIllustration() {
  const px = new Uint8Array(W * H * 4);

  // Duotone ramp: deep ink → warm amber highlight.
  const INK = [26, 22, 20];
  const MID = [122, 78, 44];
  const HOT = [236, 186, 108];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const sd = bustSDF(x, y);
      const cov = 1 - smoothstep(-1.2, 1.2, sd);
      if (cov <= 0.001) { px[i + 3] = 0; continue; }

      const lx = (x - 380) / W, ly = (y - 150) / H;
      let light = clamp(1 - Math.sqrt(lx * lx + ly * ly) * 1.15, 0, 1);
      light += (fbm(x * 0.02, y * 0.02) - 0.5) * 0.22;

      // Posterize into 4 hard bands — the print-like look.
      const bands = 4;
      const band = Math.floor(clamp(light, 0, 0.999) * bands) / (bands - 1);

      let col;
      if (band < 0.5) col = INK.map((c, k) => lerp(c, MID[k], band * 2));
      else            col = MID.map((c, k) => lerp(c, HOT[k], (band - 0.5) * 2));

      // Diagonal hatching in the mid tones, the way a screenprint would.
      const hatch = Math.sin((x + y) * 0.42);
      if (band > 0.28 && band < 0.78 && hatch > 0.55) {
        col = col.map((c) => c * 0.62);
      }

      // Hard contour line hugging the silhouette edge.
      const edge = smoothstep(-13, -4, sd) * (1 - smoothstep(-2.5, 0.5, sd));
      col = col.map((c, k) => lerp(c, HOT[k], edge * 0.95));

      px[i]     = clamp(col[0], 0, 255) | 0;
      px[i + 1] = clamp(col[1], 0, 255) | 0;
      px[i + 2] = clamp(col[2], 0, 255) | 0;
      px[i + 3] = (cov * 255) | 0;
    }
  }

  writeFileSync(join(OUT, 'portrait-illustration.png'), encodePNG(W, H, px));
  console.log('  portrait-illustration.png    1200×936');
}

/* ── fluid-bg.png ─────────────────────────────────────────── */

function makeFluidBg() {
  const S = 1024;
  const px = new Uint8Array(S * S * 4);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4;
      const nx = x / S, ny = y / S;

      // Layered fbm gives it depth without looking like flat noise.
      const base = fbm(nx * 3.2, ny * 3.2, 6);
      const warp = fbm(nx * 7.5 + base * 2, ny * 7.5, 4);
      const v = clamp(base * 0.65 + warp * 0.45, 0, 1);

      // Warm dark plate with an off-centre glow.
      const gx = nx - 0.42, gy = ny - 0.34;
      const glow = clamp(1 - Math.sqrt(gx * gx + gy * gy) * 1.5, 0, 1);

      const t = clamp(v * 0.8 + glow * 0.5, 0, 1);
      px[i]     = clamp(lerp(28, 214, t), 0, 255) | 0;
      px[i + 1] = clamp(lerp(24, 190, t), 0, 255) | 0;
      px[i + 2] = clamp(lerp(21, 156, t), 0, 255) | 0;
      px[i + 3] = 255;
    }
  }

  writeFileSync(join(OUT, 'fluid-bg.png'), encodePNG(S, S, px));
  console.log('  fluid-bg.png                 1024×1024');
}

/* ── favicon.svg ──────────────────────────────────────────── */

function makeFavicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#1a1614"/>
  <rect x="10" y="16" width="44" height="30" rx="6" fill="none" stroke="#eaba6c" stroke-width="3"/>
  <rect x="17" y="23" width="7" height="16" fill="#eaba6c"/>
  <rect x="26" y="23" width="7" height="16" fill="#7a4e2c"/>
  <rect x="35" y="23" width="7" height="16" fill="#eaba6c"/>
  <rect x="44" y="23" width="3" height="16" fill="#7a4e2c"/>
  <rect x="26" y="50" width="12" height="3" rx="1.5" fill="#eaba6c"/>
</svg>
`;
  writeFileSync(join(OUT, 'favicon.svg'), svg);
  console.log('  favicon.svg');
}

console.log('Generating placeholder assets →', OUT);
makePortrait();
makeIllustration();
makeFluidBg();
makeFavicon();
console.log('Done. Replace any of these with your own art at the same paths.');
