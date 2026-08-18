import { useCallback, useEffect, useRef, useState } from 'react';
import { IconClose, IconArrowLeft, IconWhatsapp } from './Icons';
import { whatsappLink } from '../data/site';
import { formatPrice } from '../lib/pricing';

/**
 * ============================================================================
 *  LIGHTBOX — full-screen viewer for stills and video
 * ============================================================================
 *  Shared by the gallery teaser on the home page and the full gallery page.
 *
 *  • `role="dialog"` + `aria-modal`, Escape to close, arrow keys to move
 *    (in RTL, ArrowLeft advances forward through the list)
 *  • body scroll is locked while open and restored on close
 *  • focus moves into the dialog on open and returns to the trigger on close,
 *    so keyboard users are not dropped back at the top of the document
 *  • video items get real controls; the previous clip is paused when you move
 *    on, otherwise its audio keeps playing behind the next slide
 * ============================================================================
 */
export default function Lightbox({ items, index, onClose, onStep }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const videoRef = useRef(null);
  const returnFocusRef = useRef(null);

  const item = items[index];
  const sizes = item?.sizes ?? [];
  const [sizeIndex, setSizeIndex] = useState(0);

  // A fresh piece means a fresh size choice, not whatever was picked before.
  useEffect(() => {
    setSizeIndex(0);
  }, [index]);

  const step = useCallback((dir) => onStep((index + dir + items.length) % items.length), [
    index,
    items.length,
    onStep,
  ]);

  /* --- keyboard + scroll lock + focus management ------------------------- */
  useEffect(() => {
    returnFocusRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      // RTL: left arrow moves forward
      else if (e.key === 'ArrowLeft') step(1);
      else if (e.key === 'ArrowRight') step(-1);
      else if (e.key === 'Tab') {
        // simple focus trap across the dialog's controls
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], video[controls]'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // hand focus back to whatever opened the lightbox
      if (returnFocusRef.current instanceof HTMLElement) returnFocusRef.current.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- stop the outgoing clip when the slide changes -------------------- */
  useEffect(() => {
    const v = videoRef.current;
    return () => v?.pause();
  }, [index]);

  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title || 'תצוגת יצירה'}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 text-white/85 sm:px-8">
        {/* dir="ltr" so "2 / 6" isn't reordered to "6 / 2" */}
        <span dir="ltr" className="text-sm tracking-wide">
          {index + 1} / {items.length}
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="סגירה"
          className="flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
        >
          <IconClose className="h-6 w-6" />
        </button>
      </div>

      {/* Media */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-4 pb-2 sm:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video
            key={item.src}
            ref={videoRef}
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            aria-label={item.alt || item.title}
            className="max-h-full max-w-full"
          />
        ) : (
          <img
            src={item.src}
            alt={item.alt || item.title}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Pricing + size + booking — only for sellable stills, not process clips */}
      {item.type === 'image' && sizes.length > 0 && (
        <div
          className="border-t border-white/15 bg-ink/60 px-5 py-5 text-white sm:px-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] tracking-eyebrow text-white/60">בחרו מידה</p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="בחירת מידת היצירה">
                {sizes.map((opt, i) => {
                  const active = i === sizeIndex;
                  return (
                    <button
                      key={opt.label + i}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSizeIndex(i)}
                      className={`rounded-sm border px-4 py-2 text-[0.85rem] tracking-wide transition-colors duration-300 ${
                        active
                          ? 'border-clay bg-clay text-shell'
                          : 'border-white/30 text-white/85 hover:border-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="font-serif text-2xl">{formatPrice(sizes[sizeIndex].price)}</p>
              <a
                href={whatsappLink(
                  `היי מיכל, אני מתעניין/ת ב"${item.title}" במידה ${sizes[sizeIndex].label} (${formatPrice(
                    sizes[sizeIndex].price
                  )}) — אשמח לתאם פגישה.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-shell px-6 py-3
                           text-sm font-medium tracking-wide text-ink transition-all duration-500
                           ease-soft hover:bg-sand"
              >
                <IconWhatsapp className="h-4 w-4" />
                קביעת פגישה
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar: caption + prev/next */}
      <div
        className="flex items-center justify-between gap-6 px-5 py-5 text-white sm:px-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          {item.place && (
            <p className="text-[0.68rem] tracking-eyebrow text-white/70">{item.place}</p>
          )}
          <p className="mt-1 truncate font-serif text-xl">{item.title}</p>
        </div>

        {items.length > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            {/* In RTL the "previous" arrow points right */}
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="הפריט הקודם"
              className="flex h-11 w-11 items-center justify-center border border-white/30 transition-colors hover:bg-white hover:text-ink"
            >
              <IconArrowLeft className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="הפריט הבא"
              className="flex h-11 w-11 items-center justify-center border border-white/30 transition-colors hover:bg-white hover:text-ink"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
