import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { IconWhatsapp, IconClose, IconCart } from './Icons';
import { navLinks, whatsappLink } from '../data/site';
import { useSectionNav, scrollToSection } from '../lib/navigation';
import { trackClick } from '../lib/analytics';
import { useCart } from '../lib/CartContext';

/**
 * ============================================================================
 *  HEADER — sticky nav: transparent over the hero, solid white once scrolled
 * ============================================================================
 *  • On the home page the transparent state sits on the hero photograph in
 *    white text; past ~80px it fades to an opaque shell-white bar.
 *  • On the inner pages (gallery, a service) there is no hero behind it, so it
 *    starts solid — otherwise white-on-white would be invisible.
 *  • Section links scroll (the router owns the hash — see src/App.jsx) and work
 *    from any page. Route links use <Link>.
 *  • Mobile: a full-height overlay panel; scroll is locked, Escape closes, and
 *    closed links are not focusable because the panel is `hidden`.
 * ============================================================================
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // `menuOpen` controls mounting (the `hidden` attribute, so closed links are
  // never focusable); `menuShown` lags it by one frame so the fade/stagger has
  // something to transition from — going display:none → block and opacity
  // 0 → 1 in the same frame skips the transition entirely.
  const [menuShown, setMenuShown] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const location = useLocation();
  const goToSection = useSectionNav();
  const isHome = location.pathname === '/';
  const cart = useCart();

  /* --- swap to the solid state after a short scroll ---------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- scroll-spy: highlight the nav link for the section in view -------- */
  useEffect(() => {
    if (!isHome) {
      setActiveSection('');
      return;
    }
    const ids = navLinks.filter((l) => l.section).map((l) => l.section);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that's visible.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, location.key]);

  /* --- drive the one-frame-later reveal flag ---------------------------- */
  useEffect(() => {
    if (!menuOpen) {
      setMenuShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setMenuShown(true));
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  /* --- lock body scroll + close on Escape while the mobile menu is open -- */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  /* --- close the menu whenever the route changes ------------------------ */
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Inner pages have no hero behind the bar, so it must always be readable.
  const solid = scrolled || menuOpen || !isHome;

  const isActive = (link) =>
    link.section ? activeSection === link.section : location.pathname === link.to;

  const handleSection = (section) => {
    setMenuOpen(false);
    goToSection(section);
  };

  return (
    <>
      {/* Skip link — first stop for keyboard and screen-reader users */}
      <button
        type="button"
        onClick={() => {
          const main = document.getElementById('main');
          if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
            scrollToSection('main', 'auto');
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[80]
                   focus:rounded-sm focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-shell"
      >
        דילוג לתוכן הראשי
      </button>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-soft ${
          solid
            ? 'border-b border-accent/40 bg-shell/95 py-3 text-ink backdrop-blur-md'
            : 'border-b border-transparent bg-transparent py-6 text-white'
        }`}
      >
        <div className="container-site flex items-center justify-between gap-6">
          {/* Logo — the start (right) edge in RTL */}
          <Link
            to="/"
            className="shrink-0 transition-opacity duration-300 hover:opacity-70"
            aria-label="מיכל לוי — לעמוד הבית"
          >
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="ניווט ראשי" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navLinks.map((link) => {
                const underline = (
                  <span
                    className={`absolute -bottom-0.5 right-0 h-px bg-current transition-all duration-500
                                ease-soft group-hover:w-full ${isActive(link) ? 'w-full' : 'w-0'}`}
                  />
                );
                const classes =
                  'group relative py-2 text-[0.95rem] font-light tracking-wide transition-opacity duration-300';

                return (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className={classes}>
                        {link.label}
                        {underline}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSection(link.section)}
                        className={classes}
                      >
                        {link.label}
                        {underline}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* WhatsApp CTA — the end (left) edge in RTL */}
          <div className="flex items-center gap-3">
            {/* Cart — only worth showing once something's actually in it */}
            {cart.count > 0 && (
              <button
                type="button"
                onClick={() => handleSection('contact')}
                aria-label={`עגלה, ${cart.count} פריטים — מעבר ליצירת קשר`}
                className="relative flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
              >
                <IconCart className="h-5 w-5" />
                <span
                  className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center
                             rounded-full bg-clay px-1 text-[0.65rem] font-medium text-shell"
                  aria-hidden="true"
                >
                  {cart.count}
                </span>
              </button>
            )}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick('header-whatsapp')}
              className={`hidden items-center gap-2 rounded-sm border px-6 py-2.5 text-sm font-medium
                          tracking-wide transition-all duration-500 ease-soft sm:inline-flex ${
                            solid
                              ? 'border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-shell'
                              : 'border-white/60 text-white hover:bg-white hover:text-ink'
                          }`}
            >
              <IconWhatsapp className="h-4 w-4" />
              בואו נדבר
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'סגירת התפריט' : 'פתיחת התפריט'}
              className="-mr-1 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              {menuOpen ? (
                <IconClose className="h-6 w-6" />
              ) : (
                <span className="flex w-6 flex-col gap-[5px]" aria-hidden="true">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-4/6 bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- Mobile overlay menu --------------------------------------- */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={`fixed inset-0 z-40 bg-shell transition-opacity duration-500 lg:hidden ${
          menuShown ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <nav
          aria-label="ניווט במובייל"
          className="container-site flex h-full flex-col justify-center gap-2 pb-16"
        >
          {navLinks.map((link, i) => {
            const style = {
              opacity: menuShown ? 1 : 0,
              transform: menuShown ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 500ms ease ${i * 70}ms, transform 500ms ease ${i * 70}ms`,
            };
            const classes =
              'block border-b border-accent/30 py-5 text-right font-serif text-3xl text-ink transition-all duration-500 ease-soft hover:pr-2 hover:text-wood';

            return link.to ? (
              <Link key={link.label} to={link.to} className={classes} style={style}>
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                type="button"
                onClick={() => handleSection(link.section)}
                className={`${classes} w-full`}
                style={style}
              >
                {link.label}
              </button>
            );
          })}

          {cart.count > 0 && (
            <button
              type="button"
              onClick={() => handleSection('contact')}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-sm border
                         border-clay px-6 py-3.5 text-sm font-medium tracking-wide text-clay"
            >
              <IconCart className="h-4 w-4" />
              העגלה שלי ({cart.count})
            </button>
          )}

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setMenuOpen(false);
              trackClick('header-menu-whatsapp');
            }}
            className={cart.count > 0 ? 'btn-solid mt-3 w-full' : 'btn-solid mt-10 w-full'}
          >
            <IconWhatsapp className="h-4 w-4" />
            בואו נדבר בוואטסאפ
          </a>
        </nav>
      </div>
    </>
  );
}
