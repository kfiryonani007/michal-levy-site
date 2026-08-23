/**
 * ============================================================================
 *  WALL SCENE — the backdrop a piece is previewed against, and the export
 * ============================================================================
 *  Two things live here, and they deliberately share one source of truth.
 *
 *  The default backdrop is drawn rather than photographed. The obvious
 *  alternative was to reuse public/images/hero-living-room.jpeg, but that room
 *  already has one of Michal's pieces hanging on it — previewing a second
 *  piece over the first reads as a mistake, and cropping the photo to dodge it
 *  leaves a corner of wall with no sense of scale. A drawn wall has neither
 *  problem: it is empty by construction, it carries a floor line so the eye
 *  can judge height, and it costs nothing to ship. Once Michal supplies a
 *  photo of a bare styled wall it can be added as a second backdrop option
 *  without touching anything else here.
 *
 *  It is emitted as an SVG data URI rather than as CSS gradients so that the
 *  on-screen preview and the downloaded image are the SAME picture: the
 *  browser paints this string in an <img>, and the canvas export draws that
 *  same <img>. Two hand-matched gradient definitions would drift apart the
 *  first time either was touched.
 * ============================================================================
 */

const FLOOR_NEAR = '#C7B49A';
const FLOOR_FAR = '#B5A188';

/** Where the wall meets the floor, as a fraction of the scene height. */
export const FLOOR_LINE = 0.84;

export const SCENE_W = 1600;
export const SCENE_H = 1100;

/**
 * How wide the drawn wall is taken to be. Everything scaled in centimetres —
 * the piece, the sofa — divides by this, so it is exported rather than kept
 * private: two files each holding their own idea of the scale is how a
 * preview quietly starts lying about size.
 *
 * 420cm is an ordinary living-room wall, and at this scene's proportions it
 * leaves ~240cm of wall above the floor line — enough that even the 150cm
 * pieces hang at a believable height instead of running off the top.
 */
export const SCENE_WALL_CM = 420;

/** Scale anchor. A sofa is the one object everyone can size by eye. */
export const SOFA_W_CM = 210;
export const SOFA_BACK_CM = 80;
const SOFA_SEAT_CM = 45;
const SOFA_ARM_CM = 58;
const SOFA_LEG_CM = 14;

/** Standard gallery hang: centre of the piece this far above the floor. */
const HANG_CENTRE_CM = 150;
/** Breathing room left between the sofa back and the bottom of the frame. */
const SOFA_CLEARANCE_CM = 15;

/**
 * Wall colours offered under the drawn backdrop. Each is a top/bottom pair so
 * the wall keeps its soft top-down light instead of going flat, plus the
 * skirting board tone that reads correctly against it.
 */
export const WALL_COLORS = [
  { key: 'cream', label: 'לבן שמנת', top: '#F7F2EB', bottom: '#E4DBCF', skirting: '#EFE9E0' },
  { key: 'sand', label: 'חול חם', top: '#EFE3D2', bottom: '#DDCDB5', skirting: '#F6EEE2' },
  { key: 'grey', label: 'אפור רך', top: '#E6E4E0', bottom: '#D0CDC8', skirting: '#F0EEEB' },
  { key: 'sage', label: 'ירקרק עדין', top: '#DDE3D8', bottom: '#C3CCBD', skirting: '#EAEEE6' },
  { key: 'clay', label: 'חמרה', top: '#DFC9AC', bottom: '#C6AC8A', skirting: '#ECDCC6' },
  { key: 'charcoal', label: 'פחם', top: '#4A433E', bottom: '#332D2A', skirting: '#5A524C' },
];

/** A muted sofa, drawn from the same centimetre scale as the artwork. */
function sofaSvg(floorY) {
  const px = SCENE_W / SCENE_WALL_CM;
  const w = SOFA_W_CM * px;
  const x = (SCENE_W - w) / 2;
  const backTop = floorY - SOFA_BACK_CM * px;
  const seatTop = floorY - SOFA_SEAT_CM * px;
  const armTop = floorY - SOFA_ARM_CM * px;
  const legTop = floorY - SOFA_LEG_CM * px;
  const armW = 20 * px;
  const r = 10 * px;

  return `
  <ellipse cx="${SCENE_W / 2}" cy="${floorY + 6}" rx="${w * 0.56}" ry="${14 * px}"
           fill="#2B2420" opacity="0.16"/>
  <rect x="${x + 14 * px}" y="${legTop}" width="${5 * px}" height="${SOFA_LEG_CM * px}" fill="#6E5942"/>
  <rect x="${x + w - 19 * px}" y="${legTop}" width="${5 * px}" height="${SOFA_LEG_CM * px}" fill="#6E5942"/>
  <rect x="${x}" y="${backTop}" width="${w}" height="${seatTop - backTop + 18 * px}" rx="${r}" fill="#B9AEA2"/>
  <rect x="${x + armW}" y="${seatTop}" width="${(w - armW * 2) / 2 - 3}" height="${legTop - seatTop}" rx="${8 * px}" fill="#C6BCB1"/>
  <rect x="${x + armW + (w - armW * 2) / 2 + 3}" y="${seatTop}" width="${(w - armW * 2) / 2 - 3}" height="${legTop - seatTop}" rx="${8 * px}" fill="#C6BCB1"/>
  <rect x="${x - 3 * px}" y="${armTop}" width="${armW + 3 * px}" height="${legTop - armTop}" rx="${9 * px}" fill="#AEA398"/>
  <rect x="${x + w - armW}" y="${armTop}" width="${armW + 3 * px}" height="${legTop - armTop}" rx="${9 * px}" fill="#AEA398"/>`;
}

/**
 * Where to hang a piece of this height, as a percentage of the scene — gallery
 * height by default, lifted when a tall piece would otherwise sit on the sofa
 * back, and capped so it never runs past the top of the wall.
 */
export function hangingYPct(pieceHeightCm, withSofa = true) {
  const px = SCENE_W / SCENE_WALL_CM;
  const floorY = SCENE_H * FLOOR_LINE;
  const wallCm = floorY / px;

  let centreCm = HANG_CENTRE_CM;
  if (withSofa) {
    centreCm = Math.max(centreCm, SOFA_BACK_CM + SOFA_CLEARANCE_CM + pieceHeightCm / 2);
  }
  centreCm = Math.min(centreCm, wallCm - 8 - pieceHeightCm / 2);
  centreCm = Math.max(centreCm, pieceHeightCm / 2 + 4);

  return ((floorY - centreCm * px) / SCENE_H) * 100;
}

/**
 * A bare, softly-lit wall with a floor beneath it, as an SVG data URI.
 * Light falls from the upper start-edge, which is where the light comes from
 * in every one of Michal's own photographs.
 */
export function wallSceneUrl({ wall = WALL_COLORS[0], withSofa = true } = {}) {
  const floorY = SCENE_H * FLOOR_LINE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W}" height="${SCENE_H}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${wall.top}"/>
      <stop offset="1" stop-color="${wall.bottom}"/>
    </linearGradient>
    <radialGradient id="l" cx="0.24" cy="0.14" r="0.85">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${FLOOR_FAR}"/>
      <stop offset="1" stop-color="${FLOOR_NEAR}"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.45" r="0.78">
      <stop offset="0.55" stop-color="#2B2420" stop-opacity="0"/>
      <stop offset="1" stop-color="#2B2420" stop-opacity="0.13"/>
    </radialGradient>
  </defs>
  <rect width="${SCENE_W}" height="${floorY}" fill="url(#w)"/>
  <rect width="${SCENE_W}" height="${floorY}" fill="url(#l)"/>
  <rect y="${floorY - 18}" width="${SCENE_W}" height="18" fill="${wall.skirting}"/>
  <rect y="${floorY}" width="${SCENE_W}" height="${SCENE_H - floorY}" fill="url(#f)"/>
  ${withSofa ? sofaSvg(floorY) : ''}
  <rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#v)"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Load an image in a state the canvas will actually let us export.
 *
 * Gallery photos are served from Supabase storage, a different origin. Drawing
 * a plain cross-origin <img> onto a canvas taints it and toBlob() then throws
 * a SecurityError — after the user has already waited for the render. Fetching
 * the bytes ourselves turns a CORS-allowed response into a same-origin blob,
 * which never taints. The crossOrigin <img> path stays as a fallback for hosts
 * that allow the image request but not the fetch.
 */
export function loadImage(src) {
  const attempt = (url, cors) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if (cors) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`image failed: ${url}`));
      img.src = url;
    });

  const isRemote = /^https?:/i.test(src) && !src.startsWith(window.location.origin);
  if (!isRemote) return attempt(src, false);

  return fetch(src, { mode: 'cors' })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.blob();
    })
    .then((blob) => attempt(URL.createObjectURL(blob), false))
    .catch(() => attempt(src, true));
}

/**
 * Composite the piece onto the backdrop at the placement the user arranged,
 * and hand back a PNG blob.
 *
 * `placement` is in percentages of the scene, not pixels, so the export is
 * independent of how large the preview happened to be rendered on screen.
 */
export async function renderScene({ backdropSrc, artSrc, placement }) {
  const [bg, art] = await Promise.all([loadImage(backdropSrc), loadImage(artSrc)]);

  const canvas = document.createElement('canvas');
  canvas.width = bg.naturalWidth || SCENE_W;
  canvas.height = bg.naturalHeight || SCENE_H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  const w = (canvas.width * placement.widthPct) / 100;
  const h = w * (art.naturalHeight / art.naturalWidth);
  const x = (canvas.width * placement.xPct) / 100 - w / 2;
  const y = (canvas.height * placement.yPct) / 100 - h / 2;

  // The shadow is what sells it as an object on a wall rather than a sticker.
  ctx.save();
  ctx.shadowColor = 'rgba(43, 36, 32, 0.34)';
  ctx.shadowBlur = canvas.width * 0.018;
  ctx.shadowOffsetY = canvas.width * 0.007;
  ctx.drawImage(art, x, y, w, h);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))), 'image/png');
  });
}

/**
 * Pull the piece's real width in centimetres out of its size label
 * ('‎50×70 ס״מ' → 50). Labels are typed by hand in the admin panel, so this
 * accepts ×, x and * as the separator and tolerates the bidi marks that a
 * Hebrew keyboard leaves in front of a leading digit.
 */
export function widthFromSizeLabel(label, fallback = 70) {
  const match = String(label ?? '').match(/(\d+(?:\.\d+)?)\s*[×xX*]\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : fallback;
}

/** The other half of the same label ('‎50×70 ס״מ' → 70), for hanging height. */
export function heightFromSizeLabel(label, fallback = 90) {
  const match = String(label ?? '').match(/(\d+(?:\.\d+)?)\s*[×xX*]\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[2]) : fallback;
}
