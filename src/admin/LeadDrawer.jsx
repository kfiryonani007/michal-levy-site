import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LEAD_STATUSES, SOLD } from './leadStatus';
import { formatPrice } from '../lib/pricing';
import { isMissingColumn } from './MigrationNotice';

/**
 * ============================================================================
 *  LEAD DRAWER — the full picture of one lead, and where it gets worked
 * ============================================================================
 *  Opens over the leads table (from the left, since the admin nav owns the
 *  right edge in RTL) rather than navigating away, so Michal keeps her place
 *  in the list while going through pending leads one by one.
 *
 *  Three jobs:
 *    1. Show everything the visitor told us — including the pieces they had
 *       in the cart, which is the actual "what did they want".
 *    2. Show what they did on the site before writing (pages + clicks),
 *       looked up by session_id. Only leads created after migration 001 carry
 *       one; older ones simply don't render that block.
 *    3. Let her set a status, jot notes, and — when the deal closes — record
 *       what it sold for. That sale amount is the single source the
 *       commission screen adds up.
 * ============================================================================
 */

/** Older leads predate the `items` column — recover the list from the text. */
function itemsFromMessage(message) {
  if (!message) return [];
  const match = message.match(/מעוניין\/ת ב:\s*([^|]+)/);
  if (!match) return [];
  return match[1]
    .split(/,\s*(?=[^)]*(?:\(|$))/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => ({ raw }));
}

/** The free-text part, with the cart prefix stripped back off. */
function noteFromMessage(message) {
  if (!message) return '';
  const parts = message.split('|');
  const tail = parts.filter((p) => !/מעוניין\/ת ב:/.test(p)).join('|').trim();
  return tail;
}

function Row({ label, children }) {
  return (
    <div className="flex gap-3 py-2 text-[0.9rem]">
      <span className="w-24 shrink-0 text-ink/50">{label}</span>
      <span className="min-w-0 flex-1 break-words">{children}</span>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <section className="border-t border-accent/50 px-6 py-5">
      <p className="mb-3 text-[0.78rem] tracking-wide text-wood">{title}</p>
      {children}
    </section>
  );
}

export default function LeadDrawer({ lead, onClose, onSaved, onDeleted }) {
  const [status, setStatus] = useState(lead.status ?? 'new');
  const [notes, setNotes] = useState(lead.notes ?? '');
  const [saleAmount, setSaleAmount] = useState(
    lead.sale_amount == null ? '' : String(lead.sale_amount)
  );
  const [activity, setActivity] = useState(null); // null = loading / not applicable
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape — a drawer that traps you is worse than no drawer.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // What this visitor did before writing in. Needs session_id, so it stays
  // empty for leads captured before migration 001.
  useEffect(() => {
    if (!lead.session_id) {
      setActivity({ views: [], clicks: [] });
      return;
    }
    let cancelled = false;
    (async () => {
      const [views, clicks] = await Promise.all([
        supabase
          .from('page_views')
          .select('path, created_at, duration_seconds, referrer, device')
          .eq('session_id', lead.session_id)
          .order('created_at', { ascending: true }),
        supabase
          .from('click_events')
          .select('label, path, created_at')
          .eq('session_id', lead.session_id)
          .order('created_at', { ascending: true }),
      ]);
      if (cancelled) return;
      setActivity({ views: views.data ?? [], clicks: clicks.data ?? [] });
    })();
    return () => {
      cancelled = true;
    };
  }, [lead.session_id]);

  const items = useMemo(() => {
    if (Array.isArray(lead.items) && lead.items.length) return lead.items;
    return itemsFromMessage(lead.message);
  }, [lead.items, lead.message]);

  const freeText = useMemo(() => noteFromMessage(lead.message), [lead.message]);

  const dirty =
    status !== (lead.status ?? 'new') ||
    notes !== (lead.notes ?? '') ||
    saleAmount !== (lead.sale_amount == null ? '' : String(lead.sale_amount));

  const save = async () => {
    setSaving(true);
    setError(null);

    const amount = saleAmount.trim() === '' ? null : Number(saleAmount);
    if (amount != null && (Number.isNaN(amount) || amount < 0)) {
      setError('סכום המכירה חייב להיות מספר חיובי.');
      setSaving(false);
      return;
    }

    const patch = {
      status,
      notes: notes.trim() || null,
      sale_amount: status === SOLD ? amount : null,
      // Stamped only on the transition into "sold", so re-saving notes later
      // doesn't keep pushing the sale date forward.
      sold_at: status === SOLD ? lead.sold_at ?? new Date().toISOString() : null,
    };

    const { error: err } = await supabase.from('leads').update(patch).eq('id', lead.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved({ ...lead, ...patch });
  };

  const remove = async () => {
    if (!window.confirm(`למחוק את הליד של ${lead.name}? הפעולה בלתי הפיכה.`)) return;
    const { error: err } = await supabase.from('leads').delete().eq('id', lead.id);
    if (err) setError(err.message);
    else onDeleted(lead.id);
  };

  const waHref = `https://wa.me/972${String(lead.phone).replace(/\D/g, '').replace(/^0/, '')}`;

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="סגירה"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      {/* Panel — anchored to the left edge, opposite the RTL sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`פרטי הליד של ${lead.name}`}
        className="relative mr-auto flex h-full w-full max-w-xl flex-col bg-cream shadow-2xl"
      >
        {/* --- Header --- */}
        <header className="flex items-start gap-3 border-b border-accent px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-normal">{lead.name}</h2>
            <p className="mt-1 text-[0.8rem] text-ink/55">
              {new Date(lead.created_at).toLocaleString('he-IL', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="shrink-0 rounded-sm px-2 py-1 text-xl leading-none text-ink/50 hover:bg-accent/40 hover:text-ink"
          >
            ✕
          </button>
        </header>

        {/* --- Scrollable body --- */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Contact + quick actions */}
          <section className="px-6 py-5">
            <Row label="טלפון">
              <a href={`tel:${lead.phone}`} dir="ltr" className="text-clay hover:underline">
                {lead.phone}
              </a>
            </Row>
            <Row label="אימייל">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} dir="ltr" className="text-clay hover:underline">
                  {lead.email}
                </a>
              ) : (
                <span className="text-ink/40">—</span>
              )}
            </Row>
            {lead.service && <Row label="שירות">{lead.service}</Row>}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-emerald-600 px-4 py-2 text-[0.85rem] text-white
                           transition-opacity hover:opacity-90"
              >
                וואטסאפ
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="rounded-sm border border-accent px-4 py-2 text-[0.85rem]
                           transition-colors hover:border-clay hover:text-clay"
              >
                חיוג
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="rounded-sm border border-accent px-4 py-2 text-[0.85rem]
                             transition-colors hover:border-clay hover:text-clay"
                >
                  אימייל
                </a>
              )}
            </div>
          </section>

          {/* What they wanted */}
          <Block title="מה הוא רצה">
            {items.length ? (
              <ul className="space-y-2">
                {items.map((it, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-2 rounded-sm border border-accent/60
                               bg-shell px-3 py-2 text-[0.88rem]"
                  >
                    {it.raw ? (
                      <span>{it.raw}</span>
                    ) : (
                      <>
                        <span className="font-medium">{it.title}</span>
                        {it.sizeLabel && <span className="text-ink/60">{it.sizeLabel}</span>}
                        {it.price != null && (
                          <span className="mr-auto text-clay">{formatPrice(it.price)}</span>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.85rem] text-ink/40">לא נבחרו פריטים בעגלה.</p>
            )}

            {freeText && (
              <div className="mt-3 rounded-sm border border-accent/60 bg-shell px-3 py-2.5">
                <p className="mb-1 text-[0.72rem] text-ink/45">ההודעה שכתב/ה</p>
                <p className="whitespace-pre-wrap text-[0.88rem] leading-[1.7]">{freeText}</p>
              </div>
            )}
          </Block>

          {/* Site activity */}
          <Block title="מה עשה באתר">
            {!lead.session_id ? (
              <p className="text-[0.85rem] text-ink/40">
                לליד הזה אין מעקב פעילות — הוא נשמר לפני שהחיבור הזה נוסף. לידים חדשים יציגו כאן
                את מסלול הגלישה המלא.
              </p>
            ) : !activity ? (
              <p className="text-[0.85rem] text-ink/40">טוען…</p>
            ) : activity.views.length === 0 && activity.clicks.length === 0 ? (
              <p className="text-[0.85rem] text-ink/40">לא נמצאה פעילות מתועדת.</p>
            ) : (
              <>
                {activity.clicks.length > 0 && (
                  <>
                    <p className="mb-2 text-[0.78rem] text-ink/45">על מה לחץ</p>
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {activity.clicks.map((c, i) => (
                        <li
                          key={i}
                          className="rounded-full border border-clay/30 bg-clay/10 px-3 py-1 text-[0.8rem] text-clay"
                        >
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="mb-2 text-[0.78rem] text-ink/45">מסלול הגלישה</p>
                <ol className="space-y-1.5">
                  {activity.views.map((v, i) => (
                    <li key={i} className="flex items-baseline gap-3 text-[0.85rem]">
                      <span className="w-12 shrink-0 text-ink/45">
                        {new Date(v.created_at).toLocaleTimeString('he-IL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span dir="ltr" className="min-w-0 flex-1 truncate">
                        {v.path}
                      </span>
                      {v.duration_seconds != null && (
                        <span className="shrink-0 text-ink/45">{v.duration_seconds} שנ׳</span>
                      )}
                    </li>
                  ))}
                </ol>
                {activity.views[0]?.referrer && (
                  <p className="mt-3 text-[0.8rem] text-ink/50">
                    הגיע מ־<span dir="ltr">{activity.views[0].referrer}</span>
                  </p>
                )}
                {activity.views[0]?.device && (
                  <p className="mt-1 text-[0.8rem] text-ink/50">מכשיר: {activity.views[0].device}</p>
                )}
              </>
            )}
          </Block>

          {/* Status */}
          <Block title="סטטוס">
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  aria-pressed={status === s.key}
                  className={`rounded-full border px-4 py-1.5 text-[0.82rem] transition-all ${
                    status === s.key
                      ? `${s.tone} font-medium ring-1 ring-ink/20`
                      : 'border-accent bg-shell text-ink/60 hover:border-clay hover:text-clay'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {status === SOLD && (
              <label className="mt-4 block">
                <span className="mb-1 block text-[0.8rem] text-ink/70">
                  סכום המכירה (₪) — ממנו מחושבת עמלת הסוחר
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="לדוגמה: 3400"
                  className="w-48 rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                             focus:border-clay focus:outline-none"
                />
              </label>
            )}
          </Block>

          {/* Notes */}
          <Block title="הערות">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="מה סוכם, מתי לחזור אליו, כל דבר שחשוב לזכור…"
              className="w-full resize-y rounded-sm border border-accent bg-white px-3 py-2
                         text-[0.92rem] leading-[1.8] focus:border-clay focus:outline-none"
            />
          </Block>

          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={remove}
              className="text-[0.82rem] text-red-700/70 underline underline-offset-2 hover:text-red-700"
            >
              מחיקת הליד
            </button>
          </div>
        </div>

        {/* --- Footer actions --- */}
        <footer className="border-t border-accent bg-shell px-6 py-4">
          {error && (
            <p className="mb-3 text-[0.82rem] text-red-700">
              {isMissingColumn(error)
                ? 'לא ניתן לשמור — צריך להריץ פעם אחת את קובץ העדכון 001_leads_crm.sql ב-Supabase.'
                : `שגיאה: ${error}`}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="rounded-sm bg-clay px-7 py-2.5 text-[0.9rem] text-shell
                         transition-opacity disabled:opacity-40"
            >
              {saving ? 'שומר…' : 'שמירה'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[0.85rem] text-ink/60 hover:text-ink"
            >
              ביטול
            </button>
            {dirty && <span className="text-[0.78rem] text-ink/50">יש שינויים שלא נשמרו</span>}
          </div>
        </footer>
      </aside>
    </div>
  );
}
