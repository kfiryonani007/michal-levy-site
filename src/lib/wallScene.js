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

/** Palette lifted from tailwind.config.js — kept literal, this file has no build step. */
const WALL_TOP = '#F7F2EB';
const WALL_BOTTOM = '#E4DBCF';
const SKIRTING = '#EFE9E0';
const FLOOR_NEAR = '#C7B49A';
const FLOOR_FAR = '#B5A188';

/** Where the wall meets the floor, as a fraction of the scene height. */
export const FLOOR_LINE = 0.84;

export const SCENE_W = 1600;
export const SCENE_H = 1100;

/**
 * A bare, softly-lit wall with a floor beneath it, as an SVG data URI.
 * Light falls from the upper start-edge, which is where the light comes from
 * in every one of Michal's own photographs.
 */
export function wallSceneUrl() {
  const floorY = SCENE_H * FLOOR_LINE;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W}" height="${SCENE_H}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">
  <defs>
    <linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${WALL_TOP}"/>
      <stop offset="1" stop-color="${WALL_BOTTOM}"/>
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
  <rect y="${floorY - 18}" width="${SCENE_W}" height="18" fill="${SKIRTING}"/>
  <rect y="${floorY}" width="${SCENE_W}" height="${SCENE_H - floorY}" fill="url(#f)"/>
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
