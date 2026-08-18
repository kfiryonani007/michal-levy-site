import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { hero, whatsappLink } from '../data/site';
import { heroImage } from '../lib/media';
import { scrollToSection } from '../lib/navigation';
import { IconPause, IconPlay } from './Icons';

/**
 * ============================================================================
 *  HERO — full-bleed looping video with the key line over it
 * ============================================================================
 *  If a photo is ever dropped into src/media/hero/, it takes over from the
 *  video automatically — see the `heroImage` check below. Otherwise this opens
 *  on the video in public/video/hero.{mp4,webm} (see
 *  scripts/encode-hero-video.md for where that clip came from).
 *
 *  Two things sit on top: a soft scrim (needed because the footage is bright —
 *  without it neither the white headline nor the transparent header would be
 *  readable), and, only in the video case, a small monochrome badge inviting
 *  people to buy Michal's art (see the note on `hero.buyBadge` in site.js for
 *  why that isn't just the video's own burned-in caption).
 * ============================================================================
 */
export default function Hero() {
  // A photo dropped into src/media/hero/ overrides the video outright.
  const usePhoto = !!heroImage;

  return (
    <section id="hero" className="relative h-[100svh] min-h-[560px] w-full overflow-hidden">
      {usePhoto ? <PhotoBackdrop /> : <VideoBackdrop />}

      {/* --- Scrim ---
          Two gradients rather than one heavy overlay, so the footage keeps its
          bright, airy quality: a vertical one for the header and headline, and
          a horizontal pool of shade from the start (right) edge behind the
          copy. Both ease off on wide screens — see .hero-scrim-* in index.css */}
      <div className="hero-scrim-v absolute inset-0" aria-hidden="true" />
      <div className="hero-scrim-h absolute inset-0" aria-hidden="true" />

      {/* --- Copy --- */}
      <div className="container-site relative flex h-full flex-col justify-end pb-24 sm:pb-28 lg:pb-32">
        <div className="max-w-3xl animate-fade-in text-shadow-soft">
          {/* dir="ltr" — without it the trailing "..." of a Latin string is
              pushed to the wrong end of the line inside an RTL document */}
          <span dir="ltr" className="mb-4 block font-script text-xl text-white/80 sm:text-2xl">
            {hero.eyebrow}
          </span>

          <h1 className="text-white">
            <span className="block text-[2rem] font-light leading-[1.22] sm:text-5xl lg:text-[3.9rem] lg:leading-[1.15]">
              {hero.titleTop}
            </span>
            <span className="mt-1 block text-[2rem] font-light italic leading-[1.22] text-cream sm:text-5xl lg:text-[3.9rem] lg:leading-[1.15]">
              {hero.titleEm}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/90 sm:text-xl lg:text-[1.4rem]">
            {hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link to="/gallery" className="btn-on-image">
              {hero.primaryCta}
            </Link>
            {/* the contact form is a section of this same page, so it scrolls */}
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="btn-on-image"
            >
              {hero.secondaryCta}
            </button>
          </div>
        </div>
      </div>

      {/* --- Scroll hint --- */}
      <div
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <span className="block h-10 w-px animate-scroll-hint bg-white/70" />
      </div>
    </section>
  );
}

/* ==========================================================================
 *  PHOTO VARIANT (fallback if src/media/hero/ has a file in it)
 * ==========================================================================
 *  Not lazy-loaded — it would be the LCP element in this case.
 * ======================================================================== */
function PhotoBackdrop() {
  return (
    <img
      src={heroImage.src}
      alt={heroImage.alt}
      fetchpriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
    />
  );
}

/* ==========================================================================
 *  VIDEO VARIANT (the default)
 * ==========================================================================
 *  ── AUTOPLAY ─────────────────────────────────────────────────────────────
 *  `muted` + `playsInline` are both required: browsers block autoplay with
 *  sound, and without playsInline iOS Safari takes the video fullscreen.
 *
 *  ── PAUSE CONTROL (not optional) ─────────────────────────────────────────
 *  WCAG 2.2.2 requires a way to stop any automatically-playing content that
 *  runs longer than five seconds. This clip loops every ~8s forever, so the
 *  control below is a conformance requirement, not a nicety. Visitors who ask
 *  for reduced motion get it paused on the poster frame from the start, with
 *  the same button offered to press play.
 * ======================================================================== */
function VideoBackdrop() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.pause();
      setPlaying(false);
      return;
    }

    // Autoplay can still be refused (battery saver, iOS Low Power Mode).
    // If it is, fall back to the poster and let the button offer play.
    el.play()?.then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()?.then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        poster={hero.video.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={hero.video.description}
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={hero.video.webm} type="video/webm" />
        <source src={hero.video.mp4} type="video/mp4" />
      </video>

      {/* Text alternative for the footage, for screen readers and for anyone
          whose browser refuses to play it at all. */}
      <p className="sr-only">{hero.video.description}</p>

      {/* "Buy my art" badge — see the note on hero.buyBadge in site.js */}
      <a
        href={whatsappLink(hero.buyBadge.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-6 top-24 z-10 inline-flex items-center gap-2 rounded-full
                   border border-white/60 bg-ink/35 px-5 py-2.5 text-sm text-white
                   backdrop-blur-sm transition-all duration-500 ease-soft
                   hover:bg-white hover:text-ink sm:right-8 sm:top-28"
      >
        {hero.buyBadge.text}
      </a>

      {/* Pause / play — WCAG 2.2.2 */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'עצירת הסרטון' : 'הפעלת הסרטון'}
        className="absolute bottom-6 left-6 z-10 flex h-11 w-11 items-center justify-center
                   rounded-full border border-white/50 bg-ink/35 text-white backdrop-blur-sm
                   transition-colors duration-300 hover:bg-white hover:text-ink
                   sm:bottom-8 sm:left-8"
      >
        {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
      </button>
    </>
  );
}
