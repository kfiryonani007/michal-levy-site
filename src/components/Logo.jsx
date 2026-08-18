/**
 * ============================================================================
 *  LOGO — the L+M "house" monogram, rebuilt as a vector
 * ============================================================================
 *  Michal's original logo arrived as a raster image, so it has been redrawn
 *  here as clean SVG geometry: an interlocking L and M with a gabled roof over
 *  them. Being inline SVG it inherits `currentColor`, which gives us the
 *  single-colour version the brief asked for (dark on the light header, muted
 *  in the footer) with no extra network request and no blur on retina screens.
 *
 *  ── SWAPPING IN THE ORIGINAL ARTWORK ──────────────────────────────────────
 *  Save the original as `public/images/logo.png` (transparent PNG or SVG is
 *  best) and replace the <svg> in LogoMark with:
 *      <img src="/images/logo.png" alt="" className={className} />
 *  Sizes, spacing and the wordmark all keep working unchanged.
 * ============================================================================
 */

/** The monogram mark on its own, no text. Scales with the given height. */
export function LogoMark({ className = 'h-10 w-auto' }) {
  return (
    <svg
      viewBox="0 0 305 390"
      className={className}
      fill="currentColor"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {/* Roof / gable, sitting above the letterforms with the small tick on
          the right leg. Butt caps + a mitred apex keep it crisp. */}
      <path
        d="M 151 52 L 198 5 L 244 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
      />
      <rect x="234" y="9" width="10" height="40" />

      {/* L — thick stem with a rounded lower terminal, plus the thin baseline
          that runs right underneath the M */}
      <path d="M 12 102 h 35 v 262 q 0 15 -15 15 h -20 z" />
      <rect x="12" y="374" width="173" height="5" />

      {/* M — high-contrast Didone construction: a hairline left stem dropping
          to the baseline, a thick descending diagonal, a thin returning
          diagonal, and a thick right stem */}
      <rect x="102" y="57" width="3" height="322" />
      <polygon points="102,57 140,57 200,322 170,322" />
      <polygon points="190,322 196,322 256,57 250,57" />
      <rect x="260" y="57" width="35" height="265" />
    </svg>
  );
}

/**
 * Full lockup: monogram + calligraphic name + slogan.
 *  variant="inline"  — compact, sits beside the nav (header)
 *  variant="stacked" — centred, larger (footer)
 */
export default function Logo({
  variant = 'inline',
  className = '',
  showSlogan = true,
}) {
  if (variant === 'stacked') {
    return (
      <div dir="ltr" className={`flex flex-col items-center text-center ${className}`}>
        <LogoMark className="h-16 w-auto" />
        <span className="mt-4 font-script text-3xl leading-none">Michal Levy</span>
        {showSlogan && (
          <span className="mt-2.5 font-script text-lg leading-none opacity-70">
            Art, design and more...
          </span>
        )}
      </div>
    );
  }

  /* dir="rtl" on the wrapper keeps the mark on the start (right) edge beside
     the nav, while the Latin wordmark inside stays left-to-right. */
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-auto shrink-0 sm:h-11" />
      <span dir="ltr" className="flex flex-col items-start leading-none">
        <span className="font-script text-xl sm:text-[1.65rem]">Michal Levy</span>
        {showSlogan && (
          <span className="mt-1 hidden text-[0.58rem] tracking-[0.22em] opacity-55 sm:block">
            ART, DESIGN AND MORE
          </span>
        )}
      </span>
    </div>
  );
}
