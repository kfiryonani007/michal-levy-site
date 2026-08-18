/**
 * ============================================================================
 *  ICONS — thin-line, 1.2px stroke, all on a 24×24 grid
 * ============================================================================
 *  Hand-drawn set rather than an icon package: keeps the bundle tiny and lets
 *  every icon share the same delicate stroke weight as the typography.
 *  All inherit `currentColor`; all are decorative (aria-hidden) since every
 *  icon here sits next to a real text label.
 * ============================================================================
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

/* --- Service icons ------------------------------------------------------- */

/** Framed artwork on a wall — custom wall pieces */
export const IconFrame = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="0.5" />
    <path d="M7 15.5c1.8-2.2 2.6.6 4-1.2s2.2 1 3-.8" />
    <circle cx="9" cy="8" r="1.4" />
  </svg>
);

/** Floor plan — full interior design */
export const IconPlan = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="0.5" />
    <path d="M3 10h7V3M10 10v11M14 21v-6h7" />
  </svg>
);

/** House with a heart — the personal home visit */
export const IconHome = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.5 12v8.5h13V12" />
    <path d="M12 18.2c-1.6-1.3-2.6-2.1-2.6-3.2a1.5 1.5 0 0 1 2.6-1 1.5 1.5 0 0 1 2.6 1c0 1.1-1 1.9-2.6 3.2Z" />
  </svg>
);

/** Speech bubbles — consultation */
export const IconChat = (p) => (
  <svg {...base} {...p}>
    <path d="M20 13.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3H6" />
    <path d="M4 12.5V6a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6v4" />
  </svg>
);

/** Hands around a small piece — creative workshops for groups */
export const IconWorkshop = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5a3 3 0 0 1 3 3v4.5H9V6.5a3 3 0 0 1 3-3Z" />
    <path d="M6 12.5c0-.7.6-1.3 1.3-1.3h9.4c.7 0 1.3.6 1.3 1.3v1.2a6 6 0 0 1-12 0v-1.2Z" />
    <path d="M9.5 20.5h5" />
    <path d="M12 19.7v.8" />
  </svg>
);

/** Lookup table so data can reference icons by name. */
export const serviceIcons = {
  frame: IconFrame,
  plan: IconPlan,
  home: IconHome,
  chat: IconChat,
  workshop: IconWorkshop,
};

/* --- UI icons ----------------------------------------------------------- */

export const IconWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.39c0-4.54 3.7-8.23 8.23-8.23 2.2 0 4.26.86 5.81 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.69 8.23-8.23 8.23Zm4.51-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.96-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-1.97-1.22 7.44 7.44 0 0 1-1.37-1.7c-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.77-1.83-.2-.48-.41-.42-.56-.42-.14 0-.31-.02-.47-.02a.9.9 0 0 0-.66.31c-.23.25-.86.85-.86 2.06 0 1.22.88 2.39 1 2.56.13.16 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.51.58.19 1.11.16 1.53.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

export const IconInstagram = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const IconFacebook = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.24-1.46 1.49-1.46H17V4.44c-.28-.04-1.25-.12-2.38-.12-2.35 0-3.96 1.44-3.96 4.08v2.1H8v3h2.66V21h2.84Z" />
  </svg>
);

export const IconPhone = (p) => (
  <svg {...base} {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a10.5 10.5 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

export const IconMail = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1.5" />
    <path d="m3.8 6.5 8.2 6 8.2-6" />
  </svg>
);

export const IconArrowLeft = (p) => (
  <svg {...base} {...p}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
);

export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

/* Filled, because at 16px a 1.2px-stroke pause/play reads as noise */
export const IconPause = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <rect x="6.5" y="4.5" width="4" height="15" rx="0.5" />
    <rect x="13.5" y="4.5" width="4" height="15" rx="0.5" />
  </svg>
);

export const IconPlay = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M7.5 4.8v14.4a.6.6 0 0 0 .93.5l10.4-7.2a.6.6 0 0 0 0-1L8.43 4.3a.6.6 0 0 0-.93.5Z" />
  </svg>
);

export const IconUpload = (p) => (
  <svg {...base} {...p}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
);

export const IconCart = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l1.6 10.2A2 2 0 0 0 8.57 16H18a2 2 0 0 0 1.95-1.57L21.5 8H6.2" />
    <circle cx="9.5" cy="20" r="1.4" />
    <circle cx="17.5" cy="20" r="1.4" />
  </svg>
);
