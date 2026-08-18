/**
 * ============================================================================
 *  MEDIA AUTO-DISCOVERY
 * ============================================================================
 *  Everything under src/media/ is picked up automatically at build time. Drop
 *  a photo or a video into the right folder and it appears on the site — no
 *  code to edit, no list to keep in sync.
 *
 *      src/media/hero/         the big opening photograph (first file wins)
 *      src/media/gallery/      every project photo and video
 *      src/media/services/<id>/  photos for one service's page
 *
 *  `<id>` must match a service id from src/data/site.js:
 *      custom · interior · homevisit · workshops · consult
 *
 *  ── ORDERING ─────────────────────────────────────────────────────────────
 *  Files are sorted by filename, so prefix them to control the order:
 *      01-salon.jpg, 02-triptych.jpg, 03-workshop.mp4 …
 *
 *  ── TITLES ───────────────────────────────────────────────────────────────
 *  A file needs no configuration at all. If you want a caption on a specific
 *  item, add an entry to src/data/mediaMeta.js keyed by its filename.
 *  Otherwise the filename itself is tidied up into a readable label.
 *
 *  ── WHY src/media AND NOT public/ ────────────────────────────────────────
 *  Files in public/ are copied verbatim and cannot be enumerated by the build,
 *  which would mean editing a list by hand for every new photo. Importing from
 *  src/ lets Vite glob the folder, fingerprint each file for cache-busting,
 *  and fail the build loudly if something is broken rather than 404ing live.
 * ============================================================================
 */
import { mediaMeta } from '../data/mediaMeta';

/* Eager glob: resolved at build time into a { path: url } map.
   The patterns MUST be literal strings — Vite parses them statically and
   rejects template interpolation, so the extension lists are spelled out.
   Upper-case variants are included because phones and cameras often produce
   .JPG / .MP4 and the glob is case-sensitive. */
const heroFiles = import.meta.glob(
  '../media/hero/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP,avif,AVIF}',
  { eager: true, import: 'default' }
);

const galleryFiles = import.meta.glob(
  '../media/gallery/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP,avif,AVIF,mp4,MP4,webm,WEBM}',
  { eager: true, import: 'default' }
);

const serviceFiles = import.meta.glob(
  '../media/services/*/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP,avif,AVIF,mp4,MP4,webm,WEBM}',
  { eager: true, import: 'default' }
);

/* Posters for videos: a still named the same as the clip but with an image
   extension (e.g. workshop.mp4 + workshop.jpg) is used as its poster frame. */
const VIDEO_RE = /\.(mp4|webm)$/i;

/* --------------------------------------------------------------- helpers -- */

/** "03-salon-tel-aviv.jpg" → "salon-tel-aviv" */
const baseName = (path) =>
  path
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_.\s]*/, '');

/** "salon-tel-aviv" → "Salon tel aviv" — a last-resort readable label. */
const prettify = (slug) =>
  slug.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

const isVideo = (path) => VIDEO_RE.test(path);

/**
 * Turns a glob entry into the shape the components expect.
 * Metadata lookup accepts either the numbered filename or the cleaned slug,
 * so both "03-salon" and "salon" work as keys in mediaMeta.
 */
function toItem(path, url) {
  const slug = baseName(path);
  const rawName = path.split('/').pop().replace(/\.[^.]+$/, '');
  const meta = mediaMeta[rawName] || mediaMeta[slug] || {};
  const video = isVideo(path);

  // A same-named image next to a video becomes its poster frame.
  const posterEntry = video
    ? Object.entries({ ...galleryFiles, ...serviceFiles }).find(
        ([p]) => !isVideo(p) && baseName(p) === slug
      )
    : null;

  return {
    id: slug,
    src: url,
    type: video ? 'video' : 'image',
    poster: posterEntry?.[1],
    title: meta.title ?? prettify(slug),
    place: meta.place ?? '',
    /** Screen-reader description. Falls back to the title. */
    alt: meta.alt ?? meta.title ?? prettify(slug),
    category: meta.category ?? null,
    /** Tall items span two rows in the grid. */
    tall: meta.tall ?? false,
    /** [{ label, price }] per available size. null hides pricing for this item. */
    sizes: meta.sizes ?? null,
  };
}

/** Sorted list of items from a glob map, skipping video poster stills. */
function buildList(files) {
  const paths = Object.keys(files).sort();
  const videoSlugs = new Set(paths.filter(isVideo).map(baseName));

  return paths
    // an image that exists only to be a video's poster is not its own item
    .filter((p) => isVideo(p) || !videoSlugs.has(baseName(p)))
    .map((p) => toItem(p, files[p]));
}

/* ----------------------------------------------------------------- hero --- */

/**
 * The hero photograph. Returns null when src/media/hero/ is empty, so the
 * component can fall back to the placeholder render.
 */
export const heroImage = (() => {
  const paths = Object.keys(heroFiles).sort();
  if (!paths.length) return null;
  const path = paths[0];
  const meta = mediaMeta[baseName(path)] || {};
  return {
    src: heroFiles[path],
    alt: meta.alt ?? meta.title ?? 'יצירת קיר בעבודת יד של מיכל לוי בתוך חלל מעוצב',
  };
})();

/* -------------------------------------------------------------- gallery --- */

/**
 * Seed value from src/media/gallery/ (used only until Supabase responds — see
 * src/lib/loadSiteContent.js, which mutates this SAME array in place once the
 * real `gallery_items` table loads, so every existing import of `galleryItems`
 * picks up the live data automatically).
 */
export const galleryItems = buildList(galleryFiles);

/** Replaces the contents of `galleryItems` in place, keeping the array reference. */
export function setGalleryItems(items) {
  galleryItems.length = 0;
  galleryItems.push(...items);
}

/* ------------------------------------------------------------- services --- */

/** { custom: [item, …], interior: [item, …], … } */
export const serviceMedia = (() => {
  const grouped = {};
  for (const path of Object.keys(serviceFiles).sort()) {
    // ../media/services/<id>/<file>
    const id = path.split('/').at(-2);
    (grouped[id] ||= []).push(toItem(path, serviceFiles[path]));
  }
  return grouped;
})();

/** Media for one service, falling back to the shared gallery when empty. */
export function mediaForService(id, fallbackCount = 3) {
  const own = serviceMedia[id];
  if (own?.length) return own;
  return galleryItems.slice(0, fallbackCount);
}
