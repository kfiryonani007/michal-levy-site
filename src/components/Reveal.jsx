import { useEffect, useRef, useState } from 'react';

/**
 * ============================================================================
 *  REVEAL — subtle scroll-triggered entrance
 * ============================================================================
 *  A tiny Intersection Observer wrapper used across every section for the
 *  gentle fade-in / slide-up. Deliberately no animation library: this is ~30
 *  lines, ships zero extra kilobytes, and keeps the motion restrained.
 *
 *  The element reveals once and then stops being observed, so scrolling back up
 *  doesn't re-trigger anything (which reads as fussy on a portfolio site).
 *
 *  Users with `prefers-reduced-motion: reduce` skip the animation entirely —
 *  content starts visible, handled both here and in index.css.
 *
 *  Props:
 *    as        — element/tag to render (default 'div')
 *    delay     — ms of stagger, for grids of cards
 *    y         — px of upward travel (default 24; use 0 for a pure fade)
 *    duration  — ms (default 900)
 * ============================================================================
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 24,
  duration = 900,
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Show immediately if the visitor prefers reduced motion, or if the
    // browser is too old for IntersectionObserver.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect(); // reveal once, then forget
        }
      },
      // Fire slightly before the element is fully in view so the motion feels
      // like part of the scroll rather than a delayed reaction to it.
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms,
                     transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
