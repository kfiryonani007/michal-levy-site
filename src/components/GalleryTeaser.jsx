import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import Carousel from './Carousel';
import MediaGrid from './MediaGrid';
import { IconArrowLeft } from './Icons';
import { gallerySection, galleryFallback } from '../data/site';
import { galleryItems } from '../lib/media';

/**
 * ============================================================================
 *  GALLERY TEASER — the gallery section on the home page
 * ============================================================================
 *  An auto-advancing carousel showing every photo in src/media/gallery/, one
 *  large slide at a time — chosen over a grid of tiles because the source
 *  photos mix portrait wall pieces with landscape room shots, and forcing them
 *  into uniform crops would cut into the art (see the reasoning in
 *  Carousel.jsx). It runs on its own; a visible pause button is a WCAG 2.2.2
 *  requirement for auto-advancing content, not a nicety.
 *
 *  While src/media/gallery/ is still empty, this falls back to the small
 *  placeholder grid instead — a slideshow of six identical SVG tiles would be
 *  a strange thing to watch advance on its own.
 * ============================================================================
 */
export default function GalleryTeaser() {
  const hasRealMedia = galleryItems.length > 0;
  const items = hasRealMedia ? galleryItems : galleryFallback.slice(0, 6);

  return (
    <section id="gallery" className="bg-cream py-24 sm:py-28 lg:py-36">
      <div className="container-site">
        {/* --- Heading --- */}
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">{gallerySection.eyebrow}</span>
            <h2 className="text-3xl font-light leading-tight sm:text-4xl lg:text-[2.9rem]">
              {gallerySection.title}
            </h2>
            <p className="mt-6 leading-[1.95] text-ink/70">{gallerySection.intro}</p>
          </div>

          <Link
            to="/gallery"
            className="group inline-flex shrink-0 items-center gap-2 border-b border-accent pb-1
                       text-[0.95rem] tracking-wide text-ink transition-colors duration-500
                       hover:border-ink hover:text-wood"
          >
            {gallerySection.cta}
            <IconArrowLeft className="h-4 w-4 transition-transform duration-500 ease-soft group-hover:-translate-x-1" />
          </Link>
        </Reveal>

        {/* --- Carousel (real photos) or placeholder grid (none added yet) --- */}
        <Reveal delay={100} y={22} className="mt-14 lg:mt-16">
          {hasRealMedia ? <Carousel items={items} /> : <MediaGrid items={items} columns={3} />}
        </Reveal>

        {hasRealMedia && (
          <Reveal delay={180} y={14} className="mt-12 text-center">
            <Link to="/gallery" className="btn-outline">
              {gallerySection.cta}
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
