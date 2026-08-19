import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Field, clone, setIn } from './Field';
import * as siteDefaults from '../data/site';

const SECTIONS = [
  { key: 'contact', label: 'פרטי קשר' },
  { key: 'hero', label: 'מסך פתיחה' },
  { key: 'about', label: 'קצת עליי' },
  { key: 'servicesSection', label: 'שירותים — כותרות' },
  { key: 'services', label: 'שירותים — התוכן' },
  { key: 'gallerySection', label: 'גלריה — כותרות' },
  { key: 'stats', label: 'רצועת מספרים' },
  { key: 'navLinks', label: 'תפריט עליון' },
  { key: 'seo', label: 'SEO ופיקסלים' },
];

/**
 * Every value here is one row in `site_settings` (key/value jsonb) — see
 * supabase/schema.sql. Saving writes straight back to Supabase, so it's live
 * for every visitor the moment it lands (unlike the old localStorage panel
 * this replaced, which only ever applied to the browser that saved it).
 */
export default function SettingsPage() {
  const [draft, setDraft] = useState(null);
  const [dirtyKeys, setDirtyKeys] = useState(new Set());
  const [active, setActive] = useState(SECTIONS[0].key);
  const [status, setStatus] = useState('loading'); // loading | idle | saving | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          setError(err.message);
          setStatus('error');
          return;
        }
        const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        // Any section missing a row yet (shouldn't normally happen — seed.sql
        // covers all of them) falls back to the built-in default so the form
        // still renders instead of crashing on undefined.
        const merged = Object.fromEntries(
          SECTIONS.map((s) => [s.key, byKey[s.key] ?? clone(siteDefaults[s.key])])
        );
        setDraft(merged);
        setStatus('idle');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (path, val) => {
    setDraft((d) => setIn(d, path, val));
    setDirtyKeys((s) => new Set(s).add(path[0]));
    setStatus('idle');
  };

  const save = async () => {
    if (!dirtyKeys.size) return;
    setStatus('saving');
    const rows = [...dirtyKeys].map((key) => ({ key, value: draft[key] }));
    const { error: err } = await supabase.from('site_settings').upsert(rows);
    if (err) {
      setError(err.message);
      setStatus('error');
      return;
    }
    setDirtyKeys(new Set());
    setStatus('idle');
  };

  const section = useMemo(() => SECTIONS.find((s) => s.key === active), [active]);

  if (status === 'loading') {
    return <p className="text-ink/60">טוען תוכן…</p>;
  }

  return (
    <div className="pb-24">
      <h1 className="text-xl font-normal">הגדרות אתר</h1>
      <p className="mt-1 text-[0.8rem] text-ink/60">
        כל שינוי כאן חי מיד לכל מי שנכנס לאתר, ברגע שלוחצים "שמירה".
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex min-w-0 flex-wrap gap-2 lg:flex-col lg:gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              aria-current={active === s.key}
              className={`relative rounded-sm px-4 py-2.5 text-right text-[0.9rem] transition-colors ${
                active === s.key ? 'bg-clay text-shell' : 'bg-shell text-ink/75 hover:bg-warmtaupe/25'
              }`}
            >
              {s.label}
              {dirtyKeys.has(s.key) && (
                <span
                  className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-600"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {draft && (
            <Field label={section.label} value={draft[active]} path={[active]} onChange={update} />
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-accent bg-shell/95 backdrop-blur lg:right-64">
        <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={save}
            disabled={!dirtyKeys.size || status === 'saving'}
            className="rounded-sm bg-clay px-7 py-2.5 text-[0.9rem] text-shell transition-opacity
                       disabled:opacity-40"
          >
            {status === 'saving' ? 'שומר…' : 'שמירה'}
          </button>
          <span className="text-[0.8rem] text-ink/60">
            {status === 'error' ? (
              <span className="text-red-700">שגיאה: {error}</span>
            ) : dirtyKeys.size ? (
              `${dirtyKeys.size} מקטעים עם שינויים שלא נשמרו`
            ) : (
              'הכול שמור'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
