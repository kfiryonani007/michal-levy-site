import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * ============================================================================
 *  SESSION TIME-BOX — force sign-out after MAX_SESSION_MS regardless of activity
 * ============================================================================
 *  Supabase's built-in "Time-box user sessions" setting does exactly this,
 *  but it's a Pro-plan feature — this project is on the Free plan, so the
 *  same behavior is implemented here instead: the login moment is stamped in
 *  localStorage, and a periodic check signs the user out once it's more than
 *  two hours old. A page refresh isn't required — the check also runs on an
 *  interval while the admin tab stays open.
 *
 *  No "grace period" for a session with a missing timestamp — deliberately.
 *  An earlier version tried to be lenient there (so a session that predates
 *  this feature wouldn't be logged out immediately), but that same leniency
 *  raced with the sign-out this code performs: signOut() is async, and a
 *  second check running before it resolves would see the just-cleared
 *  timestamp, treat it as "no mark yet", and silently re-arm the clock —
 *  undoing the sign-out. Simpler and correct: no timestamp means expired.
 * ============================================================================
 */
const LOGIN_AT_KEY = 'michal-admin-login-at';
const MAX_SESSION_MS = 2 * 60 * 60 * 1000; // 2 hours
const CHECK_INTERVAL_MS = 60 * 1000;

function markLoginNow() {
  try {
    localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
  } catch {
    /* localStorage unavailable — the time-box just won't apply */
  }
}

function clearLoginMark() {
  try {
    localStorage.removeItem(LOGIN_AT_KEY);
  } catch {
    /* nothing to clear */
  }
}

function sessionExpired() {
  let loginAt;
  try {
    loginAt = Number(localStorage.getItem(LOGIN_AT_KEY));
  } catch {
    return false;
  }
  if (!loginAt) return true;
  return Date.now() - loginAt > MAX_SESSION_MS;
}

async function forceSignOut(setSession) {
  clearLoginMark();
  setSession(null);
  await supabase.auth.signOut();
}

/**
 * Tracks the current Supabase Auth session for the admin panel. There is a
 * single admin user (Michal) — no signup flow, no roles, just signed-in or
 * not. `loading` stays true only for the initial session check so
 * `RequireAuth` doesn't flash the login form before Supabase has had a
 * chance to say "actually, you're already signed in".
 */
export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session && sessionExpired()) {
        await forceSignOut(setSession);
      } else {
        // Not expired means a valid timestamp already exists (that's what
        // sessionExpired() just checked) — nothing to (re-)mark here, which
        // matters: re-marking on every mount would let navigating away from
        // /admin and back quietly reset the 2-hour cap on every visit.
        setSession(data.session);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (cancelled) return;
      if (event === 'SIGNED_IN') markLoginNow();
      if (event === 'SIGNED_OUT') clearLoginMark();
      setSession(next);
    });

    const interval = setInterval(() => {
      if (sessionExpired()) forceSignOut(setSession);
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { session, loading };
}

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => {
  clearLoginMark();
  return supabase.auth.signOut();
};
