import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/PageHero';
import MediaGrid from '../components/MediaGrid';
import Reveal from '../components/Reveal';
import { IconWhatsapp } from '../components/Icons';
import { gallerySection, galleryFallback, whatsappLink, contact } from '../data/site';
import { galleryItems } from '../lib/media';

/**
 * ============================================================================
 *  GALLERY PAGE — every project, photos and video together
 * ============================================================================
 *  Fed entirely by src/media/gallery/ (see src/lib/media.js). Filter buttons
 *  appear only for categories that actually exist in the media metadata, so the
 *  row is never a set of empty promises.
 *
 *  While that folder is still empty the page shows the placeholder tiles plus
 *  an honest note that the real photos are on the way, rather than an
 *  unexplained blank grid.
 * ============================================================================
 */
export default function GalleryPage() {
  const [filter, setFilter] = useState('all');

  const hasRealMedia = galleryItems.length > 0;
  const source = hasRealMedia ? galleryItems : galleryFallback;

  /* Scroll to top on entry — a route change is a new page, not a continuation */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.title = `${gallerySection.page.title} | מיכל לוי — אמנות, עיצוב ועוד`;
  }, []);

  const items = useMemo(
    () => (filter === 'all' ? source : source.filter((i) => i.category === filter)),
    [filter, source]
  );

  const galleryCategories = useMemo(
    () => [...new Set(source.map((i) => i.category).filter(Boolean))],
    [source]
  );

  /* Hebrew needs the singular spelled out — "1 סרטונים" reads as a bug. */
  const countLine = useMemo(() => {
    const photos = source.filter((i) => i.type === 'image').length;
    const videos = source.filter((i) => i.type === 'video').length;

    const parts = [];
    if (photos === 1) parts.push('תמונה אחת');
    else if (photos > 1) parts.push(`${photos} תמונות`);
    if (videos === 1) parts.push('סרטון אחד');
    else if (videos > 1) parts.push(`${videos} סרטונים`);

    return parts.join(' · ');
  }, [source]);

  return (
    <>
      <PageHero
        eyebrow={gallerySection.page.eyebrow}
        title={gallerySection.page.title}
        intro={gallerySection.page.intro}
      />

      <section className="bg-shell pb-16 pt-12 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <div className="container-site">
          {/* --- Filters + count --- */}
          {galleryCategories.length > 0 && (
            <Reveal className="mb-12 flex flex-wrap items-center gap-x-3 gap-y-3">
              {[
                { key: 'all', label: gallerySection.page.allLabel },
                ...galleryCategories.map((c) => ({ key: c, label: c })),
              ].map((cat) => {
                const active = filter === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setFilter(cat.key)}
                    aria-pressed={active}
                    /* active state uses the "clay" accent (from the client's
                       Pantone moodboard) rather than plain ink — pottery clay
                       reads naturally against categories like "פיסול" */
                    className={`rounded-sm border px-5 py-2 text-[0.85rem] tracking-wide
                                transition-all duration-500 ease-soft ${
                                  active
                                    ? 'border-clay bg-clay text-shell'
                                    : 'border-accent text-ink/75 hover:border-clay hover:text-clay'
                                }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </Reveal>
          )}

          {/* --- The grid --- */}
          <MediaGrid items={items} columns={3} />

          {/* --- Notes --- */}
          {!hasRealMedia && (
            <Reveal delay={120} y={16} className="mx-auto mt-16 max-w-xl text-center">
              <h2 className="font-serif text-2xl font-light">
                {gallerySection.page.emptyTitle}
              </h2>
              <p className="mt-4 leading-[1.9] text-ink/70">{gallerySection.page.emptyText}</p>
            </Reveal>
          )}

          {hasRealMedia && countLine && (
            <Reveal delay={120} y={14} className="mt-14 text-center">
              <p className="text-[0.85rem] text-taupe">{countLine}</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* --- Closing CTA --- */}
      <section className="border-t border-accent/50 bg-cream py-20 sm:py-24">
        <div className="container-site">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-light leading-tight sm:text-3xl">
              ראיתם משהו שמדבר אליכם?
            </h2>
            <p className="mt-5 leading-[1.9] text-ink/70">
              כל עבודה כאן נוצרה עבור קיר מסוים אחד. ספרו לי על שלכם, ונתאים לו יצירה
              משלו.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={whatsappLink('היי מיכל, ראיתי את הגלריה באתר ואשמח לשמוע עוד')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid"
              >
                <IconWhatsapp className="h-4 w-4" />
                לוואטסאפ
              </a>
              <a href={contact.phoneHref} className="btn-outline">
                {contact.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
