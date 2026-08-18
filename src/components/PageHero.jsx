import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { IconArrowLeft } from './Icons';

/**
 * ============================================================================
 *  PAGE HERO — the opening band on an inner page
 * ============================================================================
 *  Inner pages sit under a solid header rather than a full-bleed photograph, so
 *  they open with this instead: generous top padding to clear the fixed bar, a
 *  back link, and the same eyebrow / heading / intro rhythm as the home page
 *  sections so the pages feel like part of the same site.
 * ============================================================================
 */
export default function PageHero({ eyebrow, title, intro, backTo = '/', backLabel = 'חזרה לעמוד הבית' }) {
  return (
    <header className="bg-cream pb-12 pt-28 sm:pb-14 sm:pt-32 lg:pb-16 lg:pt-40">
      <div className="container-site">
        <Reveal>
          <Link
            to={backTo}
            className="group inline-flex items-center gap-2 text-[0.85rem] tracking-wide text-taupe
                       transition-colors duration-300 hover:text-wood"
          >
            {/* In RTL "back" points right */}
            <IconArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-500 ease-soft group-hover:translate-x-1" />
            {backLabel}
          </Link>
        </Reveal>

        <Reveal delay={80} className="mt-8 max-w-3xl">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="text-3xl font-light leading-tight sm:text-4xl lg:text-[3.1rem]">
            {title}
          </h1>
          <div className="mt-7 hairline" aria-hidden="true" />
          {intro && <p className="mt-7 leading-[1.95] text-ink/70">{intro}</p>}
        </Reveal>
      </div>
    </header>
  );
}
