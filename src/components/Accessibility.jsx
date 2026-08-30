import { useEffect, useRef, useState } from 'react';

/**
 * ============================================================================
 *  ACCESSIBILITY — the adjustments panel required of Israeli business sites
 * ============================================================================
 *  Built in rather than pulled from one of the hosted widget services. Those
 *  load a third-party script on every page view, which costs money once the
 *  site has traffic, sends visitor data to someone else, and would be a
 *  render-blocking dependency on a site whose whole point is showing pictures
 *  quickly. All of this is a few hundred lines and no network calls.
 *
 *  Every toggle is a class on <html>; the CSS that reacts to those classes
 *  lives in src/index.css. Choices persist in localStorage, because a visitor
 *  who needs larger text needs it on every page, not just the one where they
 *  found the button.
 *
 *  ── What the law actually asks for ────────────────────────────────────────
 *  Israeli standard 5568 adopts WCAG 2.0 level AA. A panel like this is not
 *  itself compliance — it is an aid on top of a site that already has to be
 *  accessible on its own (semantic markup, alt text, keyboard operation,
 *  contrast). The audit of those is separate; this only lets a visitor tune
 *  what they were given. The statement page it links to is also required.
 * ============================================================================
 */

const STORAGE_KEY = 'michal-a11y';

/** class on <html>, label in the panel, and whether it's a toggle or a level */
const TOGGLES = [
  { key: 'a11y-contrast', label: 'ניגודיות כהה' },
  { key: 'a11y-light', label: 'ניגודיות בהירה' },
  { key: 'a11y-grayscale', label: 'גווני אפור' },
  { key: 'a11y-links', label: 'הדגשת קישורים' },
  { key: 'a11y-readable', label: 'גופן קריא' },
  { key: 'a11y-spacing', label: 'ריווח טקסט' },
  { key: 'a11y-no-motion', label: 'עצירת אנימציות' },
  { key: 'a11y-cursor', label: 'סמן גדול' },
];

/* The three colour modes contradict each other — turning one on turns the
   others off, rather than stacking into something unreadable. */
const EXCLUSIVE = ['a11y-contrast', 'a11y-light', 'a11y-grayscale'];

const DEFAULTS = { font: 0, classes: [] };

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const v = JSON.parse(raw);
    return { font: Number(v.font) || 0, classes: Array.isArray(v.classes) ? v.classes : [] };
  } catch {
    return DEFAULTS;
  }
}

function apply({ font, classes }) {
  const root = document.documentElement;
  TOGGLES.forEach((t) => root.classList.toggle(t.key, classes.includes(t.key)));
  // Font scale drives a custom property; index.css multiplies text by it.
  root.style.setProperty('--a11y-font-scale', String(1 + font * 0.1));
  root.classList.toggle('a11y-scaled', font !== 0);
}

export default function Accessibility() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(readStored);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Apply on mount too, so a returning visitor's settings are already in place.
  useEffect(() => {
    apply(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private mode — the settings just won't outlive this visit.
    }
  }, [state]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const toggle = (key) =>
    setState((s) => {
      const on = s.classes.includes(key);
      let classes = on ? s.classes.filter((c) => c !== key) : [...s.classes, key];
      if (!on && EXCLUSIVE.includes(key)) {
        classes = classes.filter((c) => c === key || !EXCLUSIVE.includes(c));
      }
      return { ...s, classes };
    });

  const setFont = (dir) =>
    setState((s) => ({ ...s, font: Math.max(-2, Math.min(4, s.font + dir)) }));

  const reset = () => setState(DEFAULTS);

  const isOn = (key) => state.classes.includes(key);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="תפריט נגישות"
        title="תפריט נגישות"
        className="a11y-launcher fixed bottom-5 left-5 z-[95] flex h-14 w-14 items-center
                   justify-center rounded-full bg-ink text-shell shadow-lg transition-transform
                   duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-clay"
      >
        {/* Universal access mark — a figure inside a circle */}
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="12" cy="6.4" r="1.5" />
          <path
            d="M6.5 9.2h11M12 9.6v4.2m0 0 2.6 5.2M12 13.8l-2.6 5.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="הגדרות נגישות"
          className="a11y-panel fixed bottom-24 left-5 z-[95] max-h-[70vh] w-[19rem] overflow-y-auto
                     rounded-md border border-accent bg-shell p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[0.95rem] font-medium">הגדרות נגישות</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="סגירת תפריט הנגישות"
              className="rounded px-2 py-1 text-lg leading-none text-ink/50 hover:bg-accent/40 hover:text-ink"
            >
              ✕
            </button>
          </div>

          {/* Text size */}
          <div className="mb-3 rounded-sm border border-accent/70 p-3">
            <p className="mb-2 text-[0.8rem] text-ink/70">גודל טקסט</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFont(-1)}
                aria-label="הקטנת טקסט"
                className="h-9 flex-1 rounded-sm border border-accent text-lg hover:border-clay hover:text-clay"
              >
                −
              </button>
              <span className="w-14 text-center text-[0.85rem] tabular-nums" aria-live="polite">
                {Math.round((1 + state.font * 0.1) * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setFont(1)}
                aria-label="הגדלת טקסט"
                className="h-9 flex-1 rounded-sm border border-accent text-lg hover:border-clay hover:text-clay"
              >
                +
              </button>
            </div>
          </div>

          {/* Toggles */}
          <ul className="space-y-1.5">
            {TOGGLES.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => toggle(t.key)}
                  aria-pressed={isOn(t.key)}
                  className={`flex w-full items-center justify-between rounded-sm border px-3 py-2
                              text-right text-[0.85rem] transition-colors ${
                                isOn(t.key)
                                  ? 'border-clay bg-clay text-shell'
                                  : 'border-accent hover:border-clay hover:text-clay'
                              }`}
                >
                  {t.label}
                  <span aria-hidden="true">{isOn(t.key) ? '✓' : ''}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-sm border border-accent px-3 py-2 text-[0.85rem]
                       hover:border-clay hover:text-clay"
          >
            איפוס הגדרות
          </button>

          <a
            href="#/accessibility"
            onClick={() => setOpen(false)}
            className="mt-3 block text-center text-[0.8rem] text-clay underline underline-offset-2"
          >
            הצהרת נגישות
          </a>
        </div>
      )}
    </>
  );
}
