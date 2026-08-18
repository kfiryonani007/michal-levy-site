import { useState } from 'react';
import Reveal from './Reveal';
import Lightbox from './Lightbox';
import { IconPlay } from './Icons';
import { formatPrice, minPrice } from '../lib/pricing';

/**
 * ============================================================================
 *  MEDIA GRID — the project tiles, shared by the home teaser and gallery page
 * ============================================================================
 *  Every tile is a <button> so it is reachable by keyboard and announces what
 *  it opens. Hover/focus scales the image slightly and slides a caption up
 *  over a scrim; on touch screens there is no hover, so the caption sits below
 *  the image instead of being unreachable.
 *
 *  Video tiles show their poster frame (or their first frame via `preload
 *  ="metadata"` when no poster was supplied) plus a play badge, and only start
 *  playing once opened in the lightbox — a grid of autoplaying clips is both
 *  heavy and visually noisy.
 * ============================================================================
 */
export default function MediaGrid({ items, columns = 3, stagger = true }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items.length) return null;

  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <div className={`grid grid-cols-1 gap-4 ${colClass} lg:gap-5`}>
        {items.map((item, i) => (
          <Reveal
            key={item.id + i}
            delay={stagger ? (i % columns) * 110 : 0}
            y={26}
            className={item.tall ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`הגדלת ${item.type === 'video' ? 'הסרטון' : 'התמונה'}: ${item.title}${
                item.place ? `, ${item.place}` : ''
              }`}
              className="group relative block h-full w-full overflow-hidden bg-shell text-right"
            >
              <span className="relative block">
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    muted
                    playsInline
                    preload="metadata"
                    tabIndex={-1}
                    aria-hidden="true"
                    className={`w-full object-cover transition-transform duration-[1200ms] ease-soft
                                group-hover:scale-[1.04] group-focus-visible:scale-[1.04] ${
                                  item.tall
                                    ? 'aspect-[4/3] lg:aspect-auto lg:h-full'
                                    : 'aspect-[4/3]'
                                }`}
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt || item.title}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover transition-transform duration-[1200ms] ease-soft
                                group-hover:scale-[1.04] group-focus-visible:scale-[1.04] ${
                                  item.tall
                                    ? 'aspect-[4/3] lg:aspect-auto lg:h-full'
                                    : 'aspect-[4/3]'
                                }`}
                  />
                )}

                {/* Play badge — marks a tile as a clip */}
                {item.type === 'video' && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-4 flex h-11 w-11 items-center
                               justify-center rounded-full border border-white/60 bg-ink/35 text-white
                               backdrop-blur-sm transition-transform duration-500 ease-soft
                               group-hover:scale-110"
                  >
                    <IconPlay className="h-4 w-4" />
                  </span>
                )}

                {/* Caption — revealed on hover/focus (pointer devices) */}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-3 p-6 opacity-0
                             transition-all duration-700 ease-soft group-hover:translate-y-0
                             group-hover:opacity-100 group-focus-visible:translate-y-0
                             group-focus-visible:opacity-100 sm:block"
                >
                  <span className="absolute inset-0 scrim" aria-hidden="true" />
                  <span className="relative block">
                    {item.place && (
                      <span className="block text-[0.68rem] tracking-eyebrow text-white/75">
                        {item.place}
                      </span>
                    )}
                    <span className="mt-1.5 block font-serif text-xl text-white">
                      {item.title}
                    </span>
                    {minPrice(item.sizes) != null && (
                      <span className="mt-1 block text-sm tracking-wide text-white/85">
                        החל מ-{formatPrice(minPrice(item.sizes))}
                      </span>
                    )}
                  </span>
                </span>
              </span>

              {/* Caption — always visible on touch/small screens */}
              <span className="block bg-shell px-4 py-4 sm:hidden">
                {item.place && (
                  <span className="block text-[0.66rem] tracking-eyebrow text-taupe">
                    {item.place}
                  </span>
                )}
                <span className="mt-1 block font-serif text-lg">{item.title}</span>
                {minPrice(item.sizes) != null && (
                  <span className="mt-0.5 block text-[0.85rem] text-clay">
                    החל מ-{formatPrice(minPrice(item.sizes))}
                  </span>
                )}
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onStep={setOpenIndex}
        />
      )}
    </>
  );
}
