import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LEAD_STATUSES, StatusPill } from './leadStatus';
import LeadDrawer from './LeadDrawer';

function toCsv(rows) {
  const cols = ['created_at', 'name', 'phone', 'email', 'service', 'status', 'sale_amount', 'notes', 'message'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = cols.join(',');
  const lines = rows.map((r) => cols.map((c) => escape(r[c])).join(','));
  return [header, ...lines].join('\n');
}

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [error, setError] = useState(null);

  const refresh = () =>
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setLeads(data);
      });

  useEffect(() => {
    refresh();
  }, []);

  const services = useMemo(
    () => [...new Set((leads ?? []).map((l) => l.service).filter(Boolean))],
    [leads]
  );

  const filtered = useMemo(() => {
    if (!leads) return [];
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (serviceFilter !== 'all' && l.service !== serviceFilter) return false;
      if (statusFilter !== 'all' && (l.status ?? 'new') !== statusFilter) return false;
      if (!q) return true;
      return [l.name, l.phone, l.email, l.message, l.notes]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [leads, query, serviceFilter, statusFilter]);

  // Counts per status for the filter chips — computed off the full list so the
  // numbers don't shift as you filter (which would make them useless).
  const counts = useMemo(() => {
    const c = { all: (leads ?? []).length };
    for (const s of LEAD_STATUSES) c[s.key] = 0;
    for (const l of leads ?? []) {
      const k = l.status ?? 'new';
      if (k in c) c[k] += 1;
    }
    return c;
  }, [leads]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!leads) return <p className="text-ink/60">טוען…</p>;

  const openLead = leads.find((l) => l.id === openId) ?? null;

  return (
    <div>
      <h1 className="text-xl font-normal">מערכת לידים</h1>
      <p className="mt-1 text-[0.8rem] text-ink/60">
        כל פנייה שנשלחה מהטופס באתר. לחיצה על שורה פותחת את הכרטיס המלא.
      </p>

      {error && (
        <p className="mt-4 rounded-sm border border-red-300 bg-red-50 px-4 py-2 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      {/* --- Status filter chips --- */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          aria-pressed={statusFilter === 'all'}
          className={`rounded-full border px-4 py-1.5 text-[0.82rem] transition-colors ${
            statusFilter === 'all'
              ? 'border-clay bg-clay text-shell'
              : 'border-accent bg-shell text-ink/65 hover:border-clay hover:text-clay'
          }`}
        >
          הכול ({counts.all})
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStatusFilter(s.key)}
            aria-pressed={statusFilter === s.key}
            className={`rounded-full border px-4 py-1.5 text-[0.82rem] transition-colors ${
              statusFilter === s.key
                ? `${s.tone} font-medium ring-1 ring-ink/20`
                : 'border-accent bg-shell text-ink/65 hover:border-clay hover:text-clay'
            }`}
          >
            {s.label} ({counts[s.key]})
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון, אימייל, הודעה או הערה…"
          className="min-w-[240px] flex-1 rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                     focus:border-clay focus:outline-none"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-sm border border-accent bg-white px-3 py-2 text-[0.9rem]"
        >
          <option value="all">כל השירותים</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-sm border border-accent px-4 py-2 text-[0.85rem] transition-colors
                     hover:border-clay hover:text-clay"
        >
          ייצוא CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-accent/70 bg-shell">
        <table className="w-full min-w-[760px] text-right text-[0.88rem]">
          <thead>
            <tr className="border-b border-accent/60 text-[0.78rem] text-ink/60">
              <th className="px-4 py-3 font-normal">תאריך</th>
              <th className="px-4 py-3 font-normal">שם</th>
              <th className="px-4 py-3 font-normal">טלפון</th>
              <th className="px-4 py-3 font-normal">סטטוס</th>
              <th className="px-4 py-3 font-normal">הודעה</th>
              <th className="px-4 py-3 font-normal">סכום</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  לא נמצאו לידים.
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setOpenId(lead.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpenId(lead.id);
                  }
                }}
                className="cursor-pointer border-b border-accent/30 transition-colors last:border-0
                           hover:bg-warmtaupe/20 focus:bg-warmtaupe/25 focus:outline-none"
              >
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {new Date(lead.created_at).toLocaleDateString('he-IL')}
                </td>
                <td className="px-4 py-3">{lead.name}</td>
                <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                  {lead.phone}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={lead.status} />
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-ink/70">{lead.message || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {lead.sale_amount != null
                    ? `₪${Number(lead.sale_amount).toLocaleString('he-IL')}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openLead && (
        <LeadDrawer
          key={openLead.id}
          lead={openLead}
          onClose={() => setOpenId(null)}
          onSaved={(updated) => {
            setLeads((list) => list.map((l) => (l.id === updated.id ? updated : l)));
            setOpenId(null);
          }}
          onDeleted={(id) => {
            setLeads((list) => list.filter((l) => l.id !== id));
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
