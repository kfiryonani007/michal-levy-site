/**
 * ============================================================================
 *  GALLERY PRICING
 * ============================================================================
 *  Each piece carries its own `sizes` list — [{ label, price }, …] — set in
 *  src/data/mediaMeta.js (real photos) or the gallery fallback in
 *  src/data/site.js (placeholders), and editable per size from the admin
 *  panel at /#/admin. There is no shared formula: every size's price stands
 *  on its own, so editing one never silently moves another.
 * ============================================================================
 */

/** Default 3-size set used when a new gallery item doesn't have one yet. */
export const DEFAULT_SIZES = [
  { label: '‎50×70 ס״מ', price: 2400 },
  { label: '‎80×110 ס״מ', price: 3200 },
  { label: '‎110×150 ס״מ', price: 4400 },
];

export function formatPrice(n) {
  return `₪${Number(n).toLocaleString('he-IL')}`;
}

/** The "starting from" figure shown on a gallery tile. */
export function minPrice(sizes) {
  if (!sizes?.length) return null;
  return Math.min(...sizes.map((s) => s.price));
}
