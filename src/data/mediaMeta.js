/**
 * ============================================================================
 *  OPTIONAL CAPTIONS FOR MEDIA FILES
 * ============================================================================
 *  Nothing here is required. Any photo or video dropped into src/media/ shows
 *  up on the site whether or not it is listed below — this file only exists so
 *  a specific item can be given a proper caption instead of a label guessed
 *  from its filename.
 *
 *  The key is the FILENAME WITHOUT THE EXTENSION. A leading number used for
 *  ordering may be included or left out; both work:
 *
 *      '01-salon-drape'  →  matches 01-salon-drape.jpg
 *      'salon-drape'     →  matches 01-salon-drape.jpg too
 *
 *  Fields, all optional:
 *      title     the caption shown on the tile
 *      place     the small line above it (room, city, client type)
 *      alt       description for screen readers (defaults to `title`)
 *      category  groups the item under a filter button on the gallery page
 *      tall      true → the tile spans two rows, good for portrait shots
 *      sizes     [{ label, price }] — every size this piece is sold in, each
 *                with its own price in ILS. Each step up in size adds a flat
 *                SIZE_STEP (₪300) to the one before it, so only the starting
 *                price differs from piece to piece (see src/lib/pricing.js).
 *
 *  ⚠️ These captions are my best guess from looking at the photos — I don't
 *  actually know the room, the client, or the materials used. Please correct
 *  anything that's wrong; it's a five-minute edit here, nothing to rebuild.
 *
 *  ⚠️ Prices below are placeholders (kept above ₪2,000 per Michal's request)
 *  so the gallery never shows an unpriced piece. Replace them with real
 *  numbers whenever you're ready — same five-minute edit, or from the admin
 *  panel at /#/admin.
 * ============================================================================
 */
export const mediaMeta = {
  'drape-relief-front': {
    title: 'תבליט פיסולי תלת-ממדי',
    place: 'עבודה בסטודיו',
    category: 'תבליטי קיר',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 3400 },
      { label: '‎80×110 ס״מ', price: 3700 },
      { label: '‎110×150 ס״מ', price: 4000 },
    ],
  },
  'drape-relief-light': {
    title: 'תבליט פיסולי תלת-ממדי',
    place: 'אור טבעי, זווית נוספת',
    category: 'תבליטי קיר',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 3400 },
      { label: '‎80×110 ס״מ', price: 3700 },
      { label: '‎110×150 ס״מ', price: 4000 },
    ],
  },
  'living-room-drape': {
    title: 'יצירת בד מעל הספה',
    place: 'סלון פרטי',
    category: 'בתי לקוחות',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2600 },
      { label: '‎80×110 ס״מ', price: 2900 },
      { label: '‎110×150 ס״מ', price: 3200 },
    ],
  },
  'plaster-fragments': {
    title: 'קטעי תבליט טיח',
    place: 'עבודה בסטודיו',
    category: 'תבליטי קיר',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2200 },
      { label: '‎80×110 ס״מ', price: 2500 },
      { label: '‎110×150 ס״מ', price: 2800 },
    ],
  },
  'portrait-painting': {
    title: 'ציור דיוקן בגוונים לבנים וזהב',
    place: 'ציור שמן',
    category: 'ציור',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 4200 },
      { label: '‎80×110 ס״מ', price: 4500 },
      { label: '‎110×150 ס״מ', price: 4800 },
    ],
  },
  'mixed-media-figure': {
    title: 'פסל טקסטיל מעורב טכניקה',
    place: 'עבודה בסטודיו',
    category: 'פיסול',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 3800 },
      { label: '‎80×110 ס״מ', price: 4100 },
      { label: '‎110×150 ס״מ', price: 4400 },
    ],
  },
  'textured-relief-easel': {
    title: 'תבליט טקסטורות',
    place: 'עבודה בסטודיו',
    category: 'תבליטי קיר',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 3000 },
      { label: '‎80×110 ס״מ', price: 3300 },
      { label: '‎110×150 ס״מ', price: 3600 },
    ],
  },
  'textured-relief-wall': {
    title: 'תבליט טקסטורות על הקיר',
    place: 'עבודה מוגמרת',
    category: 'תבליטי קיר',
    sizes: [
      { label: '‎50×70 ס״מ', price: 3600 },
      { label: '‎80×110 ס״מ', price: 3900 },
      { label: '‎110×150 ס״מ', price: 4200 },
    ],
  },
  'hallway-triptych': {
    title: 'טריפטיך גלי בגווני חול',
    place: 'מבואת כניסה',
    category: 'בתי לקוחות',
    sizes: [
      { label: '‎50×70 ס״מ', price: 4800 },
      { label: '‎80×110 ס״מ', price: 5100 },
      { label: '‎110×150 ס״מ', price: 5400 },
    ],
  },
  'triptych-angle': {
    title: 'טריפטיך גלי, זווית קרובה',
    place: 'מבואת כניסה',
    category: 'תבליטי קיר',
    sizes: [
      { label: '‎50×70 ס״מ', price: 4800 },
      { label: '‎80×110 ס״מ', price: 5100 },
      { label: '‎110×150 ס״מ', price: 5400 },
    ],
  },
  'abstract-painting': {
    title: 'ציור מופשט בגווני חום וקרם',
    place: 'ציור אקריליק',
    category: 'ציור',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2800 },
      { label: '‎80×110 ס״מ', price: 3100 },
      { label: '‎110×150 ס״מ', price: 3400 },
    ],
  },
};
