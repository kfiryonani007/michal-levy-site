/**
 * ============================================================================
 *  GALLERY PRICING
 * ============================================================================
 *  Each piece carries its own `sizes` list — [{ label, price }, …] — set in
 *  src/data/mediaMeta.js (real photos) or the gallery fallback in
 *  src/data/site.js (placeholders), and editable per size from the admin
 *  panel at /#/admin. Every size's price is still stored on its own, so
 *  editing one never silently moves another — but they are no longer set
 *  independently: Michal's rule is that stepping up one size costs a flat
 *  SIZE_STEP more, whatever the piece's own starting price is. The prices in
 *  those two files, and the live ones in Supabase, all follow it.
 * ============================================================================
 */

/** What one step up in size adds to the price, in ILS. */
export const SIZE_STEP = 200;

/** Default 3-size set used when a new gallery item doesn't have one yet. */
export const DEFAULT_SIZES = [
  { label: '‎50×70 ס״מ', price: 2400 },
  { label: '‎80×110 ס״מ', price: 2600 },
  { label: '‎110×150 ס״מ', price: 2800 },
];

export function formatPrice(n) {
  return `₪${Number(n).toLocaleString('he-IL')}`;
}

/** The "starting from" figure shown on a gallery tile. */
export function minPrice(sizes) {
  if (!sizes?.length) return null;
  return Math.min(...sizes.map((s) => s.price));
}
