import { useState } from 'react';
import Reveal from './Reveal';
import { about } from '../data/site';

/**
 * ============================================================================
 *  ABOUT — portrait beside the text, on a cream ground
 * ============================================================================
 *  Two columns on desktop (image on the right in RTL, text on the left),
 *  stacking to image-then-text on mobile. The photo sits flush in its own
 *  frame — no offset decorative border behind it (there used to be one; it
 *  read as a misaligned photo rather than a deliberate flourish, so it's
 *  gone).
 * ============================================================================
 */
export default function About() {
  // If the portrait file hasn't been added yet, swap to the generated
  // placeholder instead of rendering a broken image.
  const [portraitFailed, setPortraitFailed] = useState(false);
  const src = portraitFailed ? about.imageFallback : about.image;
  const alt = portraitFailed ? about.imageFallbackAlt : about.imageAlt;

  return (
    <section id="about" className="bg-cream py-24 sm:py-28 lg:py-36">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          {/* --- Portrait --- */}
          <Reveal className="relative order-1" y={30}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <img
                src={src}
                alt={alt}
                width="800"
                height="1000"
                loading="lazy"
                decoding="async"
                onError={() => setPortraitFailed(true)}
                /* object-top: the portrait is a close crop, so anchoring to the
                   top keeps her face in frame at the 4:5 ratio */
                className="aspect-[4/5] w-full border border-accent object-cover object-top"
              />
            </div>
          </Reveal>

          {/* --- Text --- */}
          <div className="order-2">
            <Reveal>
              <span className="eyebrow">{about.eyebrow}</span>
              <h2 className="text-3xl font-light leading-tight sm:text-4xl lg:text-[2.9rem]">
                {about.title}
              </h2>
              <div className="mt-7 hairline" aria-hidden="true" />
            </Reveal>

            <div className="mt-8 space-y-5">
              {about.paragraphs.map((p, i) => (
                <Reveal key={i} as="p" delay={90 + i * 90} y={18} className="leading-[1.95] text-ink/80">
                  {p}
                </Reveal>
              ))}
            </div>

            {/* Credentials as a quiet inline list */}
            <Reveal delay={380} y={16}>
              <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.82rem] tracking-wide text-taupe">
                {about.credentials.map((c, i) => (
                  <li key={c} className="flex items-center gap-3">
                    {i > 0 && <span className="h-3 w-px bg-accent" aria-hidden="true" />}
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={460} y={16}>
              <p className="mt-8 font-script text-3xl text-wood">{about.signature}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
