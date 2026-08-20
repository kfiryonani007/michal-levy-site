import { supabase } from './supabaseClient';

/**
 * ============================================================================
 *  ANALYTICS — a minimal, self-hosted page-view / click tracker
 * ============================================================================
 *  No third-party analytics service — every event is a row this project's own
 *  Supabase project (`page_views`, `click_events`), read back by the admin
 *  dashboard. All inserts are best-effort: a blocked/failed write never
 *  breaks the page for a visitor, it just means one missing data point.
 * ============================================================================
 */
const SESSION_KEY = 'michal-site-session-id';

export function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage blocked (private mode, etc.) — a per-call id still lets
    // the write succeed, it just won't count as the same visitor next time.
    return crypto.randomUUID();
  }
}

function deviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

let currentViewId = null;
let viewStartedAt = null;

function flushDuration() {
  if (!currentViewId || !viewStartedAt) return;
  const seconds = Math.round((Date.now() - viewStartedAt) / 1000);
  if (seconds < 1) return;
  // Fire-and-forget PATCH — sendBeacon can't carry auth headers to PostgREST,
  // so this is a normal fetch with keepalive instead, best-effort on unload.
  fetch(
    `${supabase.supabaseUrl}/rest/v1/page_views?id=eq.${currentViewId}`,
    {
      method: 'PATCH',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        apikey: supabase.supabaseKey,
        Authorization: `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({ duration_seconds: seconds }),
    }
  ).catch(() => {});
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushDuration();
  });
  window.addEventListener('pagehide', flushDuration);
}

/** Call on every route change. */
export async function trackPageView(path) {
  flushDuration();
  currentViewId = null;
  viewStartedAt = null;

  // Generated client-side rather than read back via `.select()` — anon can
  // insert but deliberately can't SELECT page_views (that data is for the
  // admin dashboard only), and insert+select in one call needs both.
  const id = crypto.randomUUID();
  try {
    const { error } = await supabase.from('page_views').insert({
      id,
      path,
      referrer: document.referrer || null,
      device: deviceType(),
      session_id: sessionId(),
    });
    if (!error) {
      currentViewId = id;
      viewStartedAt = Date.now();
    }
  } catch {
    // best-effort — see file header
  }
}

/** Call on a key CTA click (WhatsApp / phone / booking buttons). */
export function trackClick(label) {
  supabase
    .from('click_events')
    .insert({
      label,
      path: window.location.hash.replace(/^#/, '') || '/',
      // Same id the page views carry, so the admin can read a lead's clicks
      // and pages as one timeline (see LeadDrawer).
      session_id: sessionId(),
    })
    .then(() => {}, () => {});
}
