import { useCallback, useEffect, useRef, useState } from 'react';
import Lightbox from './Lightbox';
import { IconArrowLeft, IconPause, IconPlay } from './Icons';

/**
 * ============================================================================
 *  CAROUSEL — one large auto-advancing slide with the full set of photos
 * ============================================================================
 *  One slide fills the frame at a time (rather than several small tiles),
 *  because the source photos mix portrait wall pieces with landscape room
 *  shots — cropping them into uniform tiles would cut into the art. Each
 *  slide uses `object-contain` on a cream ground instead, so every photo is
 *  shown whole regardless of its shape.
 *
 *  ── AUTOPLAY (why it behaves the way it does) ────────────────────────────
 *  • Advances every 4.5s, pauses on hover/focus/touch so a visitor reading a
 *    caption doesn't have it yanked away mid-sentence, and resumes shortly
 *    after they leave.
 *  • Pauses via the Page Visibility API when the tab isn't in front (no point
 *    burning a rerender loop on a background tab) and via IntersectionObserver
 *    when the carousel has scrolled out of view.
 *  • `prefers-reduced-motion` disables autoplay entirely — it opens on the
 *    first slide and waits for the visitor to move it.
 *  • A visible pause/play button is included regardless of all of the above.
 *    This one is a WCAG 2.2.2 conformance requirement, not a nicety: any
 *    content that moves/updates automatically and lasts more than five
 *    seconds must have a way to stop it, and a looping slideshow qualifies.
 *
 *  Clicking (or pressing Enter/Space on) the slide opens the shared Lightbox
 *  at that item, reusing the same viewer as the full gallery page.
 * ============================================================================
 */
const AUTOPLAY_MS = 4500;
const RESUME_DELAY_MS = 3000;

export default function Carousel({ items }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inView, setInView] = useState(true);

  const rootRef = useRef(null);
  const resumeTimer = useRef(null);
  const userPaused = useRef(false); // explicit pause via the button, not hover

  const count = items.length;

  const goTo = useCallback((i) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* --- respect reduced motion: open static, no timers at all ------------- */
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  /* --- autoplay timer ------------------------------------------------------
     Only runs when: playing is on, the tab is visible, the carousel is in the
     viewport, motion isn't reduced, and there's more than one slide. */
  useEffect(() => {
    if (!playing || reduced || !inView || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, reduced, inView, count]);

  /* --- pause on hover/focus, resume a moment after the pointer leaves ---- */
  const pauseForInteraction = () => {
    clearTimeout(resumeTimer.current);
    setPlaying(false);
  };
  const resumeAfterInteraction = () => {
    if (userPaused.current) return; // explicit pause wins over hover-resume
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPlaying(true), RESUME_DELAY_MS);
  };
  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  /* --- pause when the tab is hidden --------------------------------------- */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPlaying(false);
      else if (!userPaused.current) setPlaying(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  /* --- pause when scrolled out of view ------------------------------------ */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlaying = () => {
    userPaused.current = playing; // about to flip; record the pre-click state
    setPlaying((p) => !p);
  };

  /* --- keyboard: left/right move slides while the carousel has focus ----- */
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      next(); // RTL: left arrow advances forward
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      prev();
    }
  };

  if (!count) return null;
  const current = items[index];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="גלריית עבודות"
      onMouseEnter={pauseForInteraction}
      onMouseLeave={resumeAfterInteraction}
      onFocus={pauseForInteraction}
      onBlur={resumeAfterInteraction}
      onKeyDown={onKeyDown}
    >
      {/* --- Frame --- */}
      <div className="relative overflow-hidden bg-cream">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`הגדלת התמונה: ${current.title}${current.place ? `, ${current.place}` : ''}. שקופית ${
            index + 1
          } מתוך ${count}`}
          className="group relative block h-[62vh] max-h-[640px] min-h-[340px] w-full"
        >
          {items.map((item, i) => (
            <img
              key={item.id}
              src={item.src}
              alt={item.alt || item.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain transition-opacity duration-[900ms] ease-soft"
              style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
            />
          ))}

          {/* Caption */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <span className="absolute inset-x-0 bottom-0 h-32 scrim" aria-hidden="true" />
            <span className="relative block text-right">
              {current.place && (
                <span className="block text-[0.68rem] tracking-eyebrow text-white/80">
                  {current.place}
                </span>
              )}
              <span className="mt-1.5 block font-serif text-2xl text-white">{current.title}</span>
            </span>
          </span>
        </button>

        {/* Prev / Next — in RTL the "previous" arrow points right */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="השקופית הקודמת"
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center
                         justify-center rounded-full border border-white/50 bg-ink/30 text-white
                         backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-ink
                         sm:right-5"
            >
              <IconArrowLeft className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="השקופית הבאה"
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center
                         justify-center rounded-full border border-white/50 bg-ink/30 text-white
                         backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:text-ink
                         sm:left-5"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Pause / play — WCAG 2.2.2 */}
        {count > 1 && !reduced && (
          <button
            type="button"
            onClick={togglePlaying}
            aria-label={playing ? 'עצירת הקרוסלה' : 'הפעלת הקרוסלה'}
            className="absolute bottom-5 left-5 z-10 flex h-10 w-10 items-center justify-center
                       rounded-full border border-white/50 bg-ink/30 text-white backdrop-blur-sm
                       transition-colors duration-300 hover:bg-white hover:text-ink sm:bottom-7 sm:left-7"
          >
            {playing ? <IconPause className="h-3.5 w-3.5" /> : <IconPlay className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* --- Dots --- */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="בחירת שקופית">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`שקופית ${i + 1}: ${item.title}`}
              onClick={() => goTo(i)}
              /* active dot in "clay" — the Pantone accent from the client's moodboard */
              className={`h-1.5 rounded-full transition-all duration-500 ease-soft ${
                i === index ? 'w-7 bg-clay' : 'w-1.5 bg-accent hover:bg-taupe'
              }`}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox items={items} index={index} onClose={() => setLightboxOpen(false)} onStep={goTo} />
      )}
    </div>
  );
}
