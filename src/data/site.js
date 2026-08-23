/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH FOR ALL SITE CONTENT
 * ============================================================================
 *  Everything the client is likely to want changed — phone, email, texts,
 *  services, gallery items — lives here so no one has to dig through JSX.
 *
 *  These are SEED VALUES, not the live source of truth: src/lib/loadSiteContent.js
 *  fetches the real content from Supabase (`site_settings` table) once at app
 *  boot and mutates these exported objects/arrays in place, before any
 *  component ever reads them. Editing happens at /admin, which writes to
 *  Supabase. The values below only matter as the very first paint and as a
 *  fallback if that fetch fails.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 *  SEO + tracking pixels
 * ---------------------------------------------------------------------------
 *  metaTitle/metaDescription override the tags baked into index.html at
 *  build time — see src/components/SeoHead.jsx, which writes them into
 *  <head> at runtime once this loads. pixelCode is pasted verbatim (a
 *  Facebook Pixel / Google Ads / TikTok Pixel <script> snippet, exactly as
 *  the ad platform gives it to you) and gets injected into <head> the same
 *  way — admin-only input, so this is trusted the same as any other content
 *  edit here.
 * ------------------------------------------------------------------------- */
export const seo = {
  metaTitle: 'מיכל לוי | אמנות, עיצוב ועוד — יצירות קיר בהתאמה אישית',
  metaDescription:
    'מיכל לוי — אמנית ומעצבת פנים. יצירות קיר דו-ממדיות ותלת-ממדיות בהתאמה אישית, בעבודת יד מחומרים יוקרתיים. מעל 30 שנות ניסיון.',
  pixelCode: '',
};

/* ---------------------------------------------------------------------------
 *  Contact details
 * ------------------------------------------------------------------------- */
export const contact = {
  name: 'מיכל לוי',
  tagline: 'Art, design and more...',
  phoneDisplay: '050-5939002',
  phoneHref: 'tel:+972505939002',
  whatsapp: '972505939002',
  email: 'artdarom@gmail.com',

  /** Instagram / Facebook — replace "#" with the real profile URLs. */
  social: {
    instagram: '#',
    facebook: '#',
  },
};

/** Opens WhatsApp with a pre-written Hebrew message. */
export const whatsappLink = (
  message = 'היי מיכל, הגעתי מהאתר ואשמח לשמוע עוד על יצירות קיר בהתאמה אישית :)'
) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;

/* ---------------------------------------------------------------------------
 *  CONTACT FORM DELIVERY
 * ---------------------------------------------------------------------------
 *  The site is static (no backend), so rather than routing the form through a
 *  third-party email service — which needs an account, an API key, and a
 *  setup step before it delivers anything — submitting it builds a WhatsApp
 *  message from the fields and opens wa.me with it pre-filled (see
 *  src/components/Contact.jsx). Michal's own call: WhatsApp is already her
 *  main channel, every other CTA on the site points there too, and this way
 *  the form works the moment the site goes live with nothing to configure.
 * ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 *  Navigation
 * ------------------------------------------------------------------------- */
/**
 * `section` items scroll to a section of the home page (from any page).
 * `to` items navigate to a route of their own.
 */
export const navLinks = [
  { label: 'מי אני', section: 'about' },
  { label: 'מה אני מציעה', section: 'services' },
  { label: 'גלריה', to: '/gallery' },
  { label: 'צור קשר', section: 'contact' },
];

/* ---------------------------------------------------------------------------
 *  Hero
 * ---------------------------------------------------------------------------
 *  The hero opens on a looping video (public/video/hero.mp4 / .webm) rather
 *  than a photograph. See scripts/encode-hero-video.md for where that clip
 *  came from and how to replace it.
 * ------------------------------------------------------------------------- */
export const hero = {
  eyebrow: 'Art, design and more...',
  titleTop: 'אם גם לכם יש קיר',
  /* Straight double quotes with a space before them. Typing them as two
     apostrophes ('') — the usual Hebrew keyboard habit for gershayim —
     renders as two separate slanted ticks in this italic serif, which is
     what made the line look broken. */
  titleEm: 'שהוא "כמעט"',
  subtitle: 'אני כאן כדי להפוך אותו למושלם.',
  primaryCta: 'לצפייה ביצירות',
  secondaryCta: 'לתיאום פגישה',

  /** Fallback still used if src/media/hero/ ever has a photo dropped into it
      instead — see Hero.jsx. */
  image: 'images/hero-living-room.jpeg',
  imageAlt:
    'סלון מעוצב בגווני לבן ובז׳ עם ספה קרם, שולחן עץ נמוך ויצירת קיר תלת-ממדית לבנה מעל הספה',

  video: {
    webm: 'video/hero2.webm',
    mp4: 'video/hero2.mp4',
    poster: 'images/hero2-poster.jpg',
    description: 'סרטון הירו',
  },

  /** The small monochrome badge over the video — a purchase-intent CTA,
      styled in the site's own black/white palette rather than the caption
      that was burned into the source clip (which read "הצטרפו לקהילת
      האומנות שלי" and could not be edited in place, only cropped out). */
  buyBadge: {
    text: 'לרכישה',
    whatsappMessage: 'היי מיכל, ראיתי את היצירות שלך ואשמח לשמוע איך אפשר לרכוש',
  },
};

/* ---------------------------------------------------------------------------
 *  About
 * ------------------------------------------------------------------------- */
export const about = {
  eyebrow: 'נעים מאוד',
  title: 'קצת עליי',
  paragraphs: [
    'אמנית ומעצבת פנים, בעלת תואר שני (M.A.) בחינוך לאמנות. את הדרך שלי אני עושה מתוך אהבה גדולה לחומר, למרחב ולאנשים שחיים בו — ומתוך האמונה שקיר אחד נכון יכול לשנות את כל תחושת הבית.',
    'אני יוצרת יצירות קיר בהתאמה אישית, דו-ממדיות ותלת-ממדיות — "תכשיטים לקיר". כל יצירה נולדת מהמרחב שלה: מהאור שנכנס לחדר, מגווני הרהיטים ומהאופי של האנשים הגרים בו.',
    'כל עבודה נעשית בעבודת יד מקצועית, מחומרים יוקרתיים ואיכותיים, עם תשומת לב לכל פרט ולכל מרקם. למעלה משלושים שנות ניסיון בתחום לימדו אותי שהיצירה הנכונה היא זו שנראית כאילו היא הייתה שם מהיום הראשון.',
  ],
  signature: ' ',
  /* Latin abbreviations are written without a trailing period on purpose —
     "M.A." at the end of a Hebrew run gets its final dot flipped to the wrong
     side of the line by the bidi algorithm. */
  credentials: [
    'תואר שני (M.A.) בחינוך לאמנות',
    'מעצבת פנים',
    'למעלה מ-30 שנות ניסיון',
  ],
  /* Michal's portrait. If the file is missing the component falls back to
     `imageFallback` (the generated wall-piece placeholder) rather than showing
     a broken image — see the onError handler in src/components/About.jsx. */
  image: 'images/michal-portrait.jpg',
  imageAlt: 'מיכל לוי מחייכת — פורטרט',
  imageFallback: 'images/about-portrait.svg',
  imageFallbackAlt: 'יצירת קיר תלת-ממדית בגווני שמנת וחול, בעבודת יד',
};

/* ---------------------------------------------------------------------------
 *  What Michal offers
 * ---------------------------------------------------------------------------
 *  The section heading deliberately avoids the word "שירותים": in Hebrew it
 *  also means "toilets", which is a poor first impression on an art site.
 *
 *  Each entry drives TWO things — the card on the home page (`title`, `text`)
 *  and its own detail page at /#/service/<id> (everything else). Photos for a
 *  detail page come from src/media/services/<id>/ automatically.
 *
 *  The long copy below sticks to process and approach. It deliberately states
 *  no prices, durations, group sizes or travel areas — those are Michal's to
 *  set, and inventing them here would put wrong promises in front of clients.
 *  Add them when she confirms the numbers.
 * ------------------------------------------------------------------------- */
export const servicesSection = {
  eyebrow: 'איך אפשר לעבוד יחד',
  title: 'מה אני מציעה',
  intro:
    'מיצירה בודדת שנולדת סביב קיר אחד, דרך ליווי עיצובי לחלל שלם ועד סדנאות יצירה לקבוצות ולאירועים — כל מסלול מתחיל באותו מקום: הקשבה למרחב ולאנשים שבו.',
  outroQuestion: 'לא בטוחים איזה מסלול מתאים לכם?',
  outroCta: 'נדבר ונמצא יחד',
  cardCta: 'לפרטים',
};

export const services = [
  {
    id: 'custom',
    icon: 'frame',
    title: 'יצירת קיר בהתאמה אישית',
    text: 'שולחים לי תמונה של החלל או של הקיר, ואני מתאימה את הגודל, הצורה והחומר בדיוק למרחב שלכם — כולל הצעת מחיר מסודרת לפני שמתחילים.',
    tagline: 'יצירה אחת, שנולדת בדיוק עבור הקיר שלכם',
    intro: [
      'זה הלב של מה שאני עושה. יצירת קיר בהתאמה אישית היא לא תמונה שקונים ותולים, היא אומנות שנוצרת מהמרחב שלה, ולכן היא מתיישבת בו כאילו היא הייתה שם מהיום הראשון.',
      'היצירה יכולה להיות דו-ממדית או תלת-ממדית — תכשיט לקיר: תבליטים, קפלים, מרקמים וקווים שנבנים בשכבות, כולם בעבודת יד ומחומרים יוקרתיים ואיכותיים.',
      'הכול מתחיל בתמונה אחת שאתם שולחים לי. משם אני מתאימה את הגודל, את הצורה, את החומר ואת הגוונים לאור שנכנס לחדר, לרהיטים שכבר יש ולאופי שלכם.',
    ],
    steps: [
      {
        title: 'שולחים תמונה',
        text: 'תמונה של הקיר או של החלל, בוואטסאפ או דרך הטופס באתר. כמה שיותר אור טבעי בתמונה, כך אני רואה טוב יותר את הגוונים האמיתיים.',
      },
      {
        title: 'מתאימים יחד',
        text: 'נדבר על הגודל, על הצורה ועל החומר, ועל התחושה שאתם רוצים שהקיר ייתן ביחס לחלל.',
      },
      {
        title: 'הצעת מחיר',
        text: 'אתם מקבלים הצעה מסודרת לפני שמתחילים לעבוד, כדי שהכול יהיה ברור משני הצדדים.',
      },
      {
        title: 'עבודת היד',
        text: 'היצירה נבנית בסטודיו שלי, שכבה אחר שכבה, בעבודת יד. אני מעדכנת אתכם בדרך.',
      },
    ],
  },
  {
    id: 'interior',
    icon: 'plan',
    title: 'עיצוב פנים מלא',
    text: 'שירותי עיצוב פנים מקצועיים לחלל כולו, מתוך ראייה שלמה של המרחב הביתי — ובתוכה גם התאמת היצירה כך שתשתלב בו באופן טבעי.',
    tagline: 'לא רק הקיר — כל החלל, מתוך ראייה אחת',
    intro: [
      'אמנות ועיצוב פנים הם שני עולמות שמלווים אותי, וביצירה שלי הם נפגשים ופועלים בסנכרון מושלם.',
      'בעיצוב פנים מלא אני מסתכלת על החלל כשלם: פריסה, פרופורציות, גוונים, חומרים, אור. ומכיוון שאני גם זו שיוצרת את עבודות הקיר, ההתאמה ביניהן לבין החלל היא לא ניחוש — היא חלק מאותה תוכנית.',
    ],
    steps: [
      {
        title: 'הבנת החלל',
        text: 'פגישה והיכרות ועם המרחב.',
      },
      {
        title: 'כיוון עיצובי',
        text: 'בונים יחד שפה — גוונים, חומרים ואווירה.',
      },
      {
        title: 'תכנון',
        text: 'פריסה, תוכניות, פרופורציות, תאורה ובחירת חומרים, בהתאם להיקף שנסכם עליו.',
      },
      {
        title: 'היצירה שמשלימה',
        text: 'ולבסוף יצירת האמנות לקיר שמותאמת לחלל הזה בדיוק.',
      },
    ],
  },
  {
    id: 'homevisit',
    icon: 'home',
    title: 'ביקור בית אישי',
    text: 'מגיעה עד אליכם הביתה (בתשלום), בוחנת את המרחב, ומעצבת ומכינה את היצירה המושלמת במיוחד עבורכם.',
    tagline: 'יש דברים שצריך לראות בעיניים',
    intro: [
      'תמונה מספרת הרבה, אבל לא הכול. איך האור נופל על הקיר בשעות שונות של היום, כמה גבוהה התקרה, מהו גוון הרצפה, מהי האווירה בחדר ואיזו אווירה אתם רוצים שתהיה — את זה אני קולטת רק כשאני עומדת שם.',
      'בביקור בית אני מגיעה עד אליכם, רואה את המרחב במו עיניי, ומשם מעצבת ומכינה את היצירה המושלמת במיוחד עבורכם. זה המסלול המדויק ביותר, והוא מתאים במיוחד לקירות גדולים, לחללים מורכבים או כשמתלבטים בין כמה אפשרויות.',
    ],
    note: 'ביקור הבית הוא שירות בתשלום. אשמח לתת לכם את כל הפרטים בשיחה.',
    steps: [
      {
        title: 'מתאמים ביקור',
        text: 'קובעים מועד שנוח לכם, ואני מגיעה אליכם הביתה.',
      },
      {
        title: 'רואים את החלל',
        text: 'אני מסתכלת על הקיר, על האור, על הגוונים ועל היחס לרהיטים ולחדר כולו.',
      },
      {
        title: 'מעצבים על המקום',
        text: 'עוד בבית שלכם אנחנו מדברים על כיוונים, גדלים וחומרים — מול הקיר עצמו.',
      },
      {
        title: 'מכינה במיוחד עבורכם',
        text: 'משם היצירה נבנית בסטודיו, מותאמת בדיוק למה שראיתי.',
      },
    ],
  },
  {
    id: 'workshops',
    icon: 'workshop',
    title: 'סדנאות יצירה',
    text: 'סדנאות בהנחייתי לימי הולדת, מסיבות רווקות, ערבי גיבוש ואירועים פרטיים. כל משתתף יוצר בידיו יצירת קיר קטנה ולוקח אותה הביתה.',
    tagline: 'חוויה שכל אחד לוקח איתו הביתה',
    intro: [
      'אחד הדברים האהובים עליי הוא לראות אנשים שלא חשבו על עצמם כיוצרים מגלים מה הם מסוגלים לעשות. בסדנאות שלי כל משתתף עובד עם החומר בעצמו ומכין יצירת קיר קטנה — ולוקח אותה הביתה בסוף.',
      'הסדנאות מתאימות לימי הולדת, למסיבות רווקות, לערבי גיבוש ולאירועים פרטיים. אין צורך בשום ניסיון קודם, ואין "נכון או לא נכון" — אני מלווה כל אחד לפי הקצב שלו.',
      'זו מתנה נפלאה לקבוצה שכבר עשתה הכול: במקום עוד בילוי שנשכח, כולם חוזרים עם משהו שהם יצרו בידיים שלהם.',
    ],
    note: 'מספר המשתתפים, מיקום הסדנה והמחיר נקבעים לפי האירוע — דברו איתי ונתאים.',
    steps: [
      {
        title: 'מספרים לי על האירוע',
        text: 'מה האירוע, בערך כמה אנשים ומה האווירה שאתם מדמיינים.',
      },
      {
        title: 'מתאימים סדנה',
        text: 'נסכם יחד את סוג הסדנה , המיקום והמועד שמתאימים לקבוצה שלכם.',
      },
      {
        title: 'אני מביאה הכול',
        text: 'החומרים והכלים מגיעים איתי. אתם רק צריכים שולחן וקבוצה במצב רוח טוב.',
      },
      {
        title: 'כולם יוצרים',
        text: 'הסדנה כוללת חומרים שאני מביאה. אתם צריכים לבוא רק עם מצב רוח טוב..',
      },
    ],
  },
  {
    id: 'consult',
    icon: 'chat',
    title: 'ייעוץ ותכנון',
    text: 'שיחת ייעוץ ראשונית להבנת הצרכים, האופי של החלל והכיוון העיצובי — כדי שנצא לדרך עם תמונה ברורה ומדויקת.',
    tagline: 'להתחיל מהמקום הנכון',
    intro: [
      'לפעמים יודעים שמשהו בקיר לא עובד, אבל לא יודעים מה בדיוק חסר. הייעוץ הוא בשביל השלב הזה — לפני שמזמינים, לפני שמחליטים על גודל, ולפני שקונים חומרים.',
      'בשיחה נבין יחד מה החלל צריך, מה מתאים לאופי שלכם ולאיזה כיוון עיצובי שווה ללכת. גם אם בסוף תחליטו לא להזמין ממני — תצאו עם תמונה ברורה יותר.',
    ],
    steps: [
      {
        title: 'שיחה',
        text: 'מספרים לי מה מטריד ומה אתם מדמיינים, ואני שואלת את השאלות שיחדדו את זה.',
      },
      {
        title: 'מסתכלים על החלל',
        text: 'תמונות של הקיר והחדר עוזרות לי לראות את הפרופורציות והגוונים.',
      },
      {
        title: 'כיוון ברור',
        text: 'יוצאים עם המלצה לכיוון עיצובי, לגודל ולסוג העבודה שמתאימים לכם.',
      },
    ],
  },
];

/** Look up one service by its id (used by the detail page route). */
export const getService = (id) => services.find((s) => s.id === id);

/* ---------------------------------------------------------------------------
 *  Gallery
 * ---------------------------------------------------------------------------
 *  The real gallery comes from src/media/gallery/ and is discovered
 *  automatically — see src/lib/media.js and src/media/README.md. Everything
 *  below is copy for the two places it appears (the home page teaser and the
 *  full gallery page), plus the placeholder tiles used only while that folder
 *  is still empty.
 * ------------------------------------------------------------------------- */
export const gallerySection = {
  eyebrow: 'עבודת יד',
  title: 'היצירות שלי',
  intro:
    'כל יצירה נולדה עבור קיר מסוים אחד, בחומרים יוקרתיים ובעבודת יד מלאה. הציצו ותדמיינו את שלכם.',
  cta: 'לגלריה המלאה',
  /** Copy for the standalone /#/gallery page. */
  page: {
    eyebrow: 'פרויקטים',
    title: 'הגלריה',
    intro:
      'פיסול, ציור, תבליטים, ועוד — יצירות שנעשו עבור בתים, מבואות וחללים פרטיים. כל אחת מהן נבנתה בעבודת יד, במיוחד עבור הקיר שלה.',
    allLabel: 'הכול',
    emptyTitle: 'הגלריה מתמלאת בימים אלה',
    emptyText:
      'התמונות והסרטונים מהפרויקטים האחרונים נמצאים בדרך. בינתיים אשמח לספר לכם על העבודות בשיחה — ולשלוח לכם תמונות ישירות.',
  },
};

/** Placeholder tiles, used only when src/media/gallery/ is empty. */
export const galleryFallback = [
  {
    id: 'g1',
    src: 'images/hero-living-room.jpeg',
    type: 'image',
    title: 'יצירת בד תלת-ממדית',
    place: 'סלון פרטי',
    alt: 'יצירת קיר תלת-ממדית בגוון שמנת בסלון מעוצב בגווני לבן ועץ',
    tall: true,
    sizes: [
      { label: '‎50×70 ס״מ', price: 3600 },
      { label: '‎80×110 ס״מ', price: 3900 },
      { label: '‎110×150 ס״מ', price: 4200 },
    ],
  },
  {
    id: 'g2',
    src: 'images/gallery/piece-01.svg',
    type: 'image',
    title: 'קפלים בגוון חול',
    place: 'פינת אוכל',
    alt: 'יצירת קיר בגוון חול עם קפלים רכים',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2400 },
      { label: '‎80×110 ס״מ', price: 2700 },
      { label: '‎110×150 ס״מ', price: 3000 },
    ],
  },
  {
    id: 'g3',
    src: 'images/gallery/piece-02.svg',
    type: 'image',
    title: 'טקסטורת טיח לבנה',
    place: 'חדר שינה',
    alt: 'יצירת קיר לבנה בטקסטורת טיח עדינה',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2800 },
      { label: '‎80×110 ס״מ', price: 3100 },
      { label: '‎110×150 ס״מ', price: 3400 },
    ],
  },
  {
    id: 'g4',
    src: 'images/gallery/piece-03.svg',
    type: 'image',
    title: 'קווים אורגניים',
    place: 'מבואת כניסה',
    alt: 'יצירת קיר עם קווים אורגניים בגווני בז׳ וחום עץ',
    sizes: [
      { label: '‎50×70 ס״מ', price: 3200 },
      { label: '‎80×110 ס״מ', price: 3500 },
      { label: '‎110×150 ס״מ', price: 3800 },
    ],
  },
  {
    id: 'g5',
    src: 'images/gallery/piece-04.svg',
    type: 'image',
    title: 'תבליט עגול',
    place: 'סלון',
    alt: 'תבליט קיר עגול בגוון שמנת',
    sizes: [
      { label: '‎50×70 ס״מ', price: 2600 },
      { label: '‎80×110 ס״מ', price: 2900 },
      { label: '‎110×150 ס״מ', price: 3200 },
    ],
  },
  {
    id: 'g6',
    src: 'images/gallery/piece-05.svg',
    type: 'image',
    title: 'טריפטיך מדברי',
    place: 'משרד פרטי',
    alt: 'שלוש יצירות קיר בגווני מדבר היוצרות טריפטיך',
    sizes: [
      { label: '‎50×70 ס״מ', price: 4400 },
      { label: '‎80×110 ס״מ', price: 4700 },
      { label: '‎110×150 ס״מ', price: 5000 },
    ],
  },
];

/* ---------------------------------------------------------------------------
 *  Stats band
 * ------------------------------------------------------------------------- */
export const stats = [
  { value: '30+', label: 'שנות ניסיון' },
  { value: 'עשרות', label: 'פרויקטים בהתאמה אישית' },
  { value: '100%', label: 'עבודת יד' },
  { value: 'אישי', label: 'שירות עד הבית' },
];
