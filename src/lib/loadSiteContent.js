import { supabase } from './supabaseClient';
import * as site from '../data/site';
import { setGalleryItems } from './media';

/**
 * ============================================================================
 *  LOAD SITE CONTENT — the one bridge between Supabase and the rest of the app
 * ============================================================================
 *  Every component already imports plain values from src/data/site.js and
 *  src/lib/media.js (`hero`, `about`, `galleryItems`, …) — that was true
 *  before Supabase existed, and stays true now. Rather than rewire a dozen
 *  files onto a context/hook, this function fetches once at boot (see
 *  src/main.jsx, which awaits it before the first render) and MUTATES those
 *  same exported objects/arrays in place. Because ES module bindings are live
 *  references, every file that already did `import { hero } from '../data/site'`
 *  sees the real content the moment it renders — no new API to learn, no
 *  wide refactor, and the seed values in site.js still work as a fallback if
 *  Supabase is unreachable.
 *
 *  `services`, `navLinks`, `stats`, `galleryFallback` are arrays — mutated via
 *  length=0+push so the array reference (and therefore every import binding)
 *  stays the same object.
 * ============================================================================
 */
const ARRAY_KEYS = new Set(['navLinks', 'services', 'stats', 'galleryFallback']);

function applySetting(key, value) {
  const target = site[key];
  if (target == null || value == null) return;
  if (ARRAY_KEYS.has(key)) {
    if (!Array.isArray(value)) return;
    target.length = 0;
    target.push(...value);
  } else if (typeof target === 'object') {
    Object.keys(target).forEach((k) => delete target[k]);
    Object.assign(target, value);
  }
}

/** [{ label, place, ... }] Supabase row → the shape MediaGrid/Lightbox expect. */
function toGalleryItem(row) {
  return {
    id: row.slug,
    src: row.image_url,
    type: 'image',
    title: row.title,
    place: row.place ?? '',
    alt: row.description || row.title,
    category: row.category ?? null,
    tall: !!row.tall,
    sizes: row.sizes ?? [],
  };
}

export async function loadSiteContent() {
  try {
    const [settingsRes, galleryRes] = await Promise.all([
      supabase.from('site_settings').select('key, value'),
      supabase
        .from('gallery_items')
        .select('*')
        .eq('visible', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    for (const row of settingsRes.data ?? []) {
      applySetting(row.key, row.value);
    }

    if (galleryRes.error) throw galleryRes.error;
    if (galleryRes.data?.length) {
      setGalleryItems(galleryRes.data.map(toGalleryItem));
    }
    // else: leave the local src/media/gallery seed (gallerySeed) in place.
  } catch (err) {
    // Supabase down/unreachable — the site still renders with the seed
    // values already in site.js / media.js, just not editable live.
    console.error('loadSiteContent failed, using seed content:', err);
  }
}
