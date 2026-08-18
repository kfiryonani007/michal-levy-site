import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * ============================================================================
 *  SECTION NAVIGATION
 * ============================================================================
 *  The nav mixes two kinds of destination: sections of the home page (מי אני,
 *  מה אני מציעה, צור קשר) and routes of their own (גלריה, service pages).
 *
 *  Sections are reached by scrolling rather than by an `#anchor` href, because
 *  the router owns the hash — see the note in src/App.jsx. That also solves the
 *  cross-page case for free: pressing "מי אני" from a service page navigates
 *  home first, then scrolls, instead of doing nothing.
 * ============================================================================
 */

/** Height of the sticky header to leave clear above a section heading. */
const HEADER_OFFSET = 88;

export function scrollToSection(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior });
  return true;
}

/**
 * Returns `goToSection(id)`, safe to call from any page.
 * When away from the home page it routes home and hands the target over in
 * location state; Home picks it up on mount (see useScrollToStateSection).
 */
export function useSectionNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (id) => {
      if (location.pathname === '/') {
        scrollToSection(id);
      } else {
        navigate('/', { state: { scrollTo: id } });
      }
    },
    [navigate, location.pathname]
  );
}
