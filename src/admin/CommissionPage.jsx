import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SOLD } from './leadStatus';
import MigrationNotice from './MigrationNotice';

/**
 * ============================================================================
 *  COMMISSION — the merchant's cut of every closed sale
 * ============================================================================
 *  There is no checkout on the site (the cart hands off to WhatsApp), so a
 *  "sale" is whatever Michal marks as closed on a lead, with the amount she
 *  actually got paid. This screen is the read side of that: it collects every
 *  lead with status `sold`, takes the configured percentage off each one, and
 *  totals it.
 *
 *  Deliberately NOT a second place to type sales into — one number entered
 *  twice is one number that will eventually disagree with itself. Recording a
 *  sale happens in the lead's own card (see LeadDrawer); this only reads.
 *
 *  The rate lives in `site_settings` under the key `commission`. That table is
 *  shared with the public site's content, but loadSiteContent skips any key
 *  with no matching export in src/data/site.js — so this row is admin-only
 *  config that never reaches a visitor's bundle.
 * ============================================================================
 */
/** Starting rate, used until a different one is saved on this screen. */
export const DEFAULT_RATE = 10;
const SETTINGS_KEY = 'commission';

const shekels = (n) => `₪${Number(n || 0).toLocaleString('he-IL', { maximumFractionDigits: 0 })}`;

function StatCard({ label, value, hint, strong = false }) {
  return (
    <div
      className={`rounded-sm border p-5 ${
        strong ? 'border-clay/40 bg-clay/10' : 'border-accent/70 bg-shell'
      }`}
    >
      <p className="text-[0.78rem] text-ink/60">{label}</p>
      <p className={`mt-2 text-3xl font-light ${strong ? 'text-clay' : ''}`}>{value}</p>
      {hint && <p className="mt-1 text-[0.75rem] text-ink/45">{hint}</p>}
    </div>
  );
}

export default function CommissionPage() {
  const [sales, setSales] = useState(null);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [rateDraft, setRateDraft] = useState(String(DEFAULT_RATE));
  const [savingRate, setSavingRate] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [leadsRes, settingRes] = await Promise.all([
        supabase
          .from('leads')
          .select('id, name, sale_amount, sold_at, created_at, message')
          .eq('status', SOLD)
          .order('sold_at', { ascending: false, nullsFirst: false }),
        supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle(),
      ]);

      if (cancelled) return;
      if (leadsRes.error) {
        setError(leadsRes.error.message);
        return;
      }
      setSales(leadsRes.data ?? []);

      const stored = Number(settingRes.data?.value?.rate);
      if (Number.isFinite(stored) && stored >= 0) {
        setRate(stored);
        setRateDraft(String(stored));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRate = async () => {
    const next = Number(rateDraft);
    if (!Number.isFinite(next) || next < 0 || next > 100) {
      setError('אחוז העמלה חייב להיות מספר בין 0 ל-100.');
      return;
    }
    setSavingRate(true);
    setError(null);
    const { error: err } = await supabase
      .from('site_settings')
      .upsert({ key: SETTINGS_KEY, value: { rate: next } });
    setSavingRate(false);
    if (err) setError(err.message);
    else setRate(next);
  };

  const totals = useMemo(() => {
    const rows = sales ?? [];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const dateOf = (s) => new Date(s.sold_at ?? s.created_at);
    const gross = rows.reduce((sum, s) => sum + Number(s.sale_amount || 0), 0);
    const grossMonth = rows
      .filter((s) => dateOf(s) >= startOfMonth)
      .reduce((sum, s) => sum + Number(s.sale_amount || 0), 0);

    return {
      count: rows.length,
      gross,
      grossMonth,
      commission: (gross * rate) / 100,
      commissionMonth: (grossMonth * rate) / 100,
      missing: rows.filter((s) => s.sale_amount == null).length,
    };
  }, [sales, rate]);

  if (error && !sales) return <MigrationNotice message={error} />;
  if (!sales) return <p className="text-ink/60">טוען…</p>;

  const rateDirty = rateDraft !== String(rate);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-normal">עמלת סוחר</h1>
        <p className="mt-1 text-[0.8rem] text-ink/60">
          {rate}% מכל מכירה שנסגרה. מכירה נרשמת בכרטיס הליד — מסמנים סטטוס "נסגר / נמכר" ומזינים
          את הסכום, והיא מופיעה כאן אוטומטית.
        </p>
      </div>

      {error && (
        <p className="rounded-sm border border-red-300 bg-red-50 px-4 py-2 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      {/* --- Totals --- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={`עמלה לתשלום (${rate}%)`}
          value={shekels(totals.commission)}
          hint="מצטבר, מכל הזמנים"
          strong
        />
        <StatCard label="עמלה החודש" value={shekels(totals.commissionMonth)} />
        <StatCard label="סך המכירות" value={shekels(totals.gross)} />
        <StatCard label="עסקאות שנסגרו" value={totals.count} />
      </div>

      {totals.missing > 0 && (
        <p className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-2.5 text-[0.85rem] text-amber-800">
          {totals.missing} עסקאות סומנו כנמכרות בלי סכום, ולכן לא נספרות בחישוב. אפשר להשלים את
          הסכום בכרטיס הליד.
        </p>
      )}

      {/* --- Rate --- */}
      <section className="rounded-sm border border-accent/70 bg-shell p-5">
        <p className="mb-3 text-[0.85rem] font-medium text-ink/70">אחוז העמלה</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[0.78rem] text-ink/60">אחוז מכל מכירה</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={rateDraft}
                onChange={(e) => setRateDraft(e.target.value)}
                className="w-28 rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                           focus:border-clay focus:outline-none"
              />
              <span className="text-ink/60">%</span>
            </div>
          </label>
          <button
            type="button"
            onClick={saveRate}
            disabled={!rateDirty || savingRate}
            className="rounded-sm bg-clay px-6 py-2.5 text-[0.88rem] text-shell transition-opacity
                       disabled:opacity-40"
          >
            {savingRate ? 'שומר…' : 'שמירה'}
          </button>
        </div>
      </section>

      {/* --- Ledger --- */}
      <section>
        <p className="mb-3 text-[0.85rem] font-medium text-ink/70">פירוט המכירות</p>
        <div className="overflow-x-auto rounded-sm border border-accent/70 bg-shell">
          <table className="w-full min-w-[560px] text-right text-[0.88rem]">
            <thead>
              <tr className="border-b border-accent/60 text-[0.78rem] text-ink/60">
                <th className="px-4 py-3 font-normal">תאריך סגירה</th>
                <th className="px-4 py-3 font-normal">לקוח</th>
                <th className="px-4 py-3 font-normal">סכום המכירה</th>
                <th className="px-4 py-3 font-normal">עמלה ({rate}%)</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                    עדיין לא נסגרו מכירות. סמנו ליד כ"נסגר / נמכר" והוא יופיע כאן.
                  </td>
                </tr>
              )}
              {sales.map((s) => (
                <tr key={s.id} className="border-b border-accent/30 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                    {new Date(s.sold_at ?? s.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {s.sale_amount == null ? (
                      <span className="text-amber-700">חסר סכום</span>
                    ) : (
                      shekels(s.sale_amount)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-clay">
                    {s.sale_amount == null ? '—' : shekels((Number(s.sale_amount) * rate) / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
            {sales.length > 0 && (
              <tfoot>
                <tr className="border-t border-accent bg-cream/60 font-medium">
                  <td className="px-4 py-3" colSpan={2}>
                    סה״כ
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{shekels(totals.gross)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-clay">
                    {shekels(totals.commission)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
