import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function toCsv(rows) {
  const cols = ['created_at', 'name', 'phone', 'email', 'service', 'message'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = cols.join(',');
  const lines = rows.map((r) => cols.map((c) => escape(r[c])).join(','));
  return [header, ...lines].join('\n');
}

export default function LeadsPage() {
  const [leads, setLeads] = useState(null);
  const [query, setQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
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
      if (!q) return true;
      return [l.name, l.phone, l.email, l.message]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [leads, query, serviceFilter]);

  const remove = async (id) => {
    if (!window.confirm('למחוק את הליד הזה?')) return;
    const { error: err } = await supabase.from('leads').delete().eq('id', id);
    if (err) setError(err.message);
    else setLeads((list) => list.filter((l) => l.id !== id));
  };

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

  return (
    <div>
      <h1 className="text-xl font-normal">מערכת לידים</h1>
      <p className="mt-1 text-[0.8rem] text-ink/60">כל פנייה שנשלחה מהטופס באתר.</p>

      {error && (
        <p className="mt-4 rounded-sm border border-red-300 bg-red-50 px-4 py-2 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם, טלפון, אימייל או הודעה…"
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
        <table className="w-full min-w-[720px] text-right text-[0.88rem]">
          <thead>
            <tr className="border-b border-accent/60 text-[0.78rem] text-ink/60">
              <th className="px-4 py-3 font-normal">תאריך</th>
              <th className="px-4 py-3 font-normal">שם</th>
              <th className="px-4 py-3 font-normal">טלפון</th>
              <th className="px-4 py-3 font-normal">אימייל</th>
              <th className="px-4 py-3 font-normal">שירות</th>
              <th className="px-4 py-3 font-normal">הודעה</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/50">
                  לא נמצאו לידים.
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-accent/30 last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-ink/70">
                  {new Date(lead.created_at).toLocaleDateString('he-IL')}
                </td>
                <td className="px-4 py-3">{lead.name}</td>
                <td className="whitespace-nowrap px-4 py-3" dir="ltr">
                  {lead.phone}
                </td>
                <td className="px-4 py-3">{lead.email || '—'}</td>
                <td className="px-4 py-3">{lead.service || '—'}</td>
                <td className="max-w-xs truncate px-4 py-3 text-ink/70">{lead.message || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => remove(lead.id)}
                    className="text-red-700/70 hover:text-red-700"
                    aria-label="מחיקה"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
