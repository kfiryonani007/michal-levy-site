import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconClose, IconUpload, IconDownload, IconShare, IconWhatsapp } from './Icons';
import { whatsappLink } from '../data/site';
import { formatPrice } from '../lib/pricing';
import { trackClick } from '../lib/analytics';
import { wallSceneUrl, renderScene, widthFromSizeLabel } from '../lib/wallScene';

/**
 * ============================================================================
 *  WALL PREVIEW — "how would this look on my wall?"
 * ============================================================================
 *  Opened from the lightbox for one piece at one size. The visitor either
 *  keeps the drawn backdrop or uploads a photo of their own wall, drags the
 *  piece where they want it, and takes the result away.
 *
 *  ── WHY THE SIZE SLIDER IS IN CENTIMETRES ────────────────────────────────
 *  A photo carries no scale. The honest way to place a 50cm piece correctly
 *  is to know how wide the photographed wall is, so that is exactly what the
 *  slider asks for — one number, in units the visitor can estimate by eye
 *  ("my wall is about three metres"). The piece's own width then follows from
 *  the size they already chose, and switching 50×70 → 110×150 visibly grows
 *  it without them touching anything. A bare "make it bigger/smaller" slider
 *  would have been less work and would have quietly let someone convince
 *  themselves a 50cm piece fills a lounge wall.
 *
 *  The aspect ratio drawn is the PHOTOGRAPH's, not the size label's. Forcing
 *  the label's ratio would stretch the artwork, and a distorted preview of a
 *  handmade piece is worse than a slightly-off outline.
 *
 *  ── EVERYTHING RUNS IN THE BROWSER ───────────────────────────────────────
 *  No upload leaves the device: the visitor's wall photo becomes an object
 *  URL, the composite is a canvas, and the export is a local blob. That keeps
 *  it free, instant and offline-safe, and means a photo of someone's home
 *  never touches Michal's storage.
 * ============================================================================
 */

/** Assumed width of the wall in the drawn backdrop. Chosen so a 50cm piece
    reads as small and a 150cm piece reads as commanding, matching how the
    scene's floor line sets expectations for a room of ordinary height. */
const SCENE_WALL_CM = 340;
const UPLOAD_WALL_CM = 300;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export default function WallPreview({ item, size, onClose }) {
  const backdropDrawn = useMemo(() => wallSceneUrl(), []);
  const [upload, setUpload] = useState(null); // { url, name }
  const [wallCm, setWallCm] = useState(SCENE_WALL_CM);
  const [pos, setPos] = useState({ xPct: 50, yPct: 42 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(null);

  const backdrop = upload?.url ?? backdropDrawn;
  const pieceCm = widthFromSizeLabel(size?.label);
  const widthPct = clamp((pieceCm / wallCm) * 100, 3, 96);

  /* --- dialog behaviour: focus, Escape, scroll lock ---------------------- */
  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // the lightbox underneath also listens for Escape
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      if (returnFocusRef.current instanceof HTMLElement) returnFocusRef.current.focus();
    };
  }, [onClose]);

  /* --- an object URL is a live handle; letting it leak holds the file ---- */
  useEffect(() => () => { if (upload?.url) URL.revokeObjectURL(upload.url); }, [upload]);

  /* --- dragging the piece ----------------------------------------------- */
  const moveTo = useCallback((clientX, clientY) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const grab = dragRef.current ?? { dx: 0, dy: 0 };
    setPos({
      xPct: clamp(((clientX - rect.left) / rect.width) * 100 - grab.dx, 4, 96),
      yPct: clamp(((clientY - rect.top) / rect.height) * 100 - grab.dy, 4, 96),
    });
  }, []);

  const onPointerDown = (e) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Remember where inside the piece it was grabbed, so it doesn't jump.
    dragRef.current = {
      dx: ((e.clientX - rect.left) / rect.width) * 100 - pos.xPct,
      dy: ((e.clientY - rect.top) / rect.height) * 100 - pos.yPct,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    moveTo(e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
  };

  /* Keyboard nudging — dragging is a mouse gesture and cannot be the only way
     to place the piece. */
  const onArrowKeys = (e) => {
    const stepPct = e.shiftKey ? 5 : 1;
    const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setPos((p) => ({
      xPct: clamp(p.xPct + move[0] * stepPct, 4, 96),
      yPct: clamp(p.yPct + move[1] * stepPct, 4, 96),
    }));
  };

  /* --- upload ------------------------------------------------------------ */
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('אפשר להעלות תמונה בלבד (JPG או PNG).');
      return;
    }
    setError('');
    if (upload?.url) URL.revokeObjectURL(upload.url);
    setUpload({ url: URL.createObjectURL(file), name: file.name });
    setWallCm(UPLOAD_WALL_CM);
    setPos({ xPct: 50, yPct: 42 });
    trackClick('wall-preview-upload');
  };

  const useDrawnWall = () => {
    if (upload?.url) URL.revokeObjectURL(upload.url);
    setUpload(null);
    setWallCm(SCENE_WALL_CM);
    setPos({ xPct: 50, yPct: 42 });
  };

  /* --- export ------------------------------------------------------------ */
  const build = async () => {
    setError('');
    setBusy(true);
    try {
      return await renderScene({
        backdropSrc: backdrop,
        artSrc: item.src,
        placement: { xPct: pos.xPct, yPct: pos.yPct, widthPct },
      });
    } finally {
      setBusy(false);
    }
  };

  const fileName = `${(item.title || 'יצירה').replace(/[\\/:*?"<>|]/g, '')} — ${size?.label ?? ''}.png`;

  const onDownload = async () => {
    try {
      const blob = await build();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoking immediately can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      trackClick('wall-preview-download');
    } catch (err) {
      console.error('wall preview export failed:', err);
      setError('לא הצלחנו להכין את הקובץ. אפשר לצלם מסך — ההדמיה עצמה תקינה.');
    }
  };

  /* On a phone this hands the picture straight to WhatsApp, which is the
     whole point — wa.me links cannot carry an attachment. */
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function';

  const onShare = async () => {
    try {
      const blob = await build();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (!navigator.canShare({ files: [file] })) {
        await onDownload();
        return;
      }
      await navigator.share({ files: [file], title: item.title });
      trackClick('wall-preview-share');
    } catch (err) {
      if (err?.name === 'AbortError') return; // visitor dismissed the sheet
      console.error('wall preview share failed:', err);
      setError('השיתוף לא נתמך במכשיר הזה. אפשר להוריד את התמונה במקום.');
    }
  };

  const waMessage = `היי מיכל, עשיתי הדמיה של "${item.title}" במידה ${size?.label ?? ''}${
    size?.price ? ` (${formatPrice(size.price)})` : ''
  } על הקיר שלי ואשמח לשמוע מה את חושבת. מצרפת/ף את התמונה כאן בשיחה.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`הדמיה על הקיר — ${item.title}`}
      className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur-sm"
      /* This renders inside the lightbox's own dialog, whose backdrop click
         closes the lightbox. Without stopping here, dismissing the preview
         would close the piece behind it too. */
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 text-white sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="text-[0.68rem] tracking-eyebrow text-white/60">הדמיה על הקיר</p>
          <p className="mt-1 truncate font-serif text-xl">{item.title}</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="סגירת ההדמיה"
          className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
        >
          <IconClose className="h-6 w-6" />
        </button>
      </div>

      {/* Scene */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-4 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={frameRef}
          className="relative max-h-full w-full max-w-4xl select-none overflow-hidden rounded-sm shadow-2xl"
        >
          <img
            src={backdrop}
            alt={upload ? 'הקיר שהעליתם' : 'קיר להדמיה'}
            className="block h-auto w-full"
            draggable={false}
          />
          <img
            src={item.src}
            alt={`${item.title} על הקיר`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onArrowKeys}
            tabIndex={0}
            role="button"
            aria-label="גררו כדי למקם את היצירה, או הזיזו עם מקשי החיצים"
            draggable={false}
            style={{
              left: `${pos.xPct}%`,
              top: `${pos.yPct}%`,
              width: `${widthPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute cursor-grab touch-none shadow-[0_10px_28px_rgba(43,36,32,0.34)]
                       outline-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-clay
                       active:cursor-grabbing"
          />
        </div>
      </div>

      {/* Controls */}
      <div
        className="border-t border-white/15 bg-ink/60 px-5 py-5 text-white sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Scale */}
            <div className="w-full sm:max-w-sm">
              <label htmlFor="wall-cm" className="text-[0.68rem] tracking-eyebrow text-white/60">
                רוחב הקיר בתמונה
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="wall-cm"
                  type="range"
                  min={120}
                  max={600}
                  step={10}
                  value={wallCm}
                  onChange={(e) => setWallCm(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-clay"
                />
                <span dir="ltr" className="w-20 shrink-0 text-left text-sm tabular-nums text-white/85">
                  {wallCm} ס״מ
                </span>
              </div>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-white/55">
                כוונו לרוחב הקיר שרואים בתמונה, והיצירה תוצג בגודלה האמיתי ביחס אליו.
              </p>
            </div>

            {/* Backdrop choice */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={useDrawnWall}
                aria-pressed={!upload}
                className={`rounded-sm border px-4 py-2.5 text-[0.85rem] tracking-wide transition-colors duration-300 ${
                  !upload ? 'border-clay bg-clay text-shell' : 'border-white/30 text-white/85 hover:border-white'
                }`}
              >
                קיר נקי
              </button>
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5
                            text-[0.85rem] tracking-wide transition-colors duration-300 ${
                              upload ? 'border-clay bg-clay text-shell' : 'border-white/30 text-white/85 hover:border-white'
                            }`}
              >
                <IconUpload className="h-4 w-4" />
                {upload ? 'תמונה אחרת' : 'הקיר שלי'}
                <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
              </label>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[0.85rem] text-sand">
              {error}
            </p>
          )}

          {/* Take it away */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.78rem] text-white/50">
              הדמיה להמחשה בלבד — הגוון והמרקם האמיתיים נראים אחרת בתאורה של החדר.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {canShareFiles && (
                <button
                  type="button"
                  onClick={onShare}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40
                             px-5 py-3 text-sm font-medium tracking-wide text-white transition-all
                             duration-300 hover:border-white disabled:opacity-50"
                >
                  <IconShare className="h-4 w-4" />
                  שיתוף
                </button>
              )}
              <button
                type="button"
                onClick={onDownload}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40
                           px-5 py-3 text-sm font-medium tracking-wide text-white transition-all
                           duration-300 hover:border-white disabled:opacity-50"
              >
                <IconDownload className="h-4 w-4" />
                {busy ? 'מכין…' : 'הורדת ההדמיה'}
              </button>
              <a
                href={whatsappLink(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick('wall-preview-whatsapp')}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-shell px-6 py-3
                           text-sm font-medium tracking-wide text-ink transition-all duration-500
                           ease-soft hover:bg-sand"
              >
                <IconWhatsapp className="h-4 w-4" />
                שליחה למיכל
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
