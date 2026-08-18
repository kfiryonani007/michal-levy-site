import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { supabase } from '../lib/supabaseClient';

const PIE_COLORS = ['#A65D35', '#A6907E', '#2B2420', '#C9B294'];

function StatCard({ label, value }) {
  return (
    <div className="rounded-sm border border-accent/70 bg-shell p-5">
      <p className="text-[0.78rem] text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-light">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="min-w-0 rounded-sm border border-accent/70 bg-shell p-5">
      <p className="mb-4 text-[0.85rem] font-medium text-ink/70">{title}</p>
      {children}
    </div>
  );
}

function countBy(rows, key) {
  const counts = {};
  for (const row of rows) {
    const k = row[key] || '(לא ידוע)';
    counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since14 = daysAgo(14).toISOString();
      const startOfDay = daysAgo(0).toISOString();
      const startOfWeek = daysAgo(7).toISOString();
      const startOfMonth = daysAgo(30).toISOString();

      const [leadsAll, viewsAll, clicksAll] = await Promise.all([
        supabase.from('leads').select('created_at, service'),
        supabase.from('page_views').select('created_at, path, referrer, device, session_id'),
        supabase.from('click_events').select('created_at, label'),
      ]);

      if (cancelled) return;
      if (leadsAll.error || viewsAll.error || clicksAll.error) {
        setError(
          leadsAll.error?.message || viewsAll.error?.message || clicksAll.error?.message
        );
        return;
      }

      const leads = leadsAll.data ?? [];
      const views = viewsAll.data ?? [];
      const clicks = clicksAll.data ?? [];

      const since = (rows, iso) => rows.filter((r) => r.created_at >= iso);

      const last14 = since(views, since14);
      const byDay = {};
      for (let i = 13; i >= 0; i--) {
        const key = daysAgo(i).toISOString().slice(0, 10);
        byDay[key] = 0;
      }
      for (const v of last14) {
        const key = v.created_at.slice(0, 10);
        if (key in byDay) byDay[key] += 1;
      }
      const chart14 = Object.entries(byDay).map(([date, count]) => ({
        date: date.slice(5).replace('-', '/'),
        count,
      }));

      const uniqueSessions = new Set(views.map((v) => v.session_id)).size;
      const deviceCounts = countBy(views, 'device');
      const topPages = countBy(views, 'path').slice(0, 6);
      const referrerHost = (referrer) => {
        if (!referrer) return 'ישיר';
        try {
          return new URL(referrer).hostname;
        } catch {
          return referrer;
        }
      };
      const topReferrers = countBy(
        views.map((v) => ({ referrer: referrerHost(v.referrer) })),
        'referrer'
      ).slice(0, 6);
      const leadsByService = countBy(leads, 'service').slice(0, 6);
      const topClicks = countBy(clicks, 'label').slice(0, 6);

      setData({
        leadsToday: since(leads, startOfDay).length,
        leadsWeek: since(leads, startOfWeek).length,
        leadsMonth: since(leads, startOfMonth).length,
        leadsTotal: leads.length,
        totalClicks: clicks.length,
        uniqueSessions,
        totalViews: views.length,
        deviceCounts,
        chart14,
        topPages,
        topReferrers,
        leadsByService,
        topClicks,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-red-700">שגיאה בטעינת הנתונים: {error}</p>;
  }
  if (!data) return <p className="text-ink/60">טוען…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-normal">מסך בקרה</h1>
      </div>

      {/* --- Leads --- */}
      <section>
        <p className="mb-3 text-[0.85rem] font-medium text-ink/70">לידים</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="החודש" value={data.leadsMonth} />
          <StatCard label="השבוע" value={data.leadsWeek} />
          <StatCard label="היום" value={data.leadsToday} />
          <StatCard label="סה״כ לידים" value={data.leadsTotal} />
        </div>
      </section>

      {/* --- Analytics --- */}
      <section>
        <p className="mb-3 text-[0.85rem] font-medium text-ink/70">אנליטיקה</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="לחיצות" value={data.totalClicks} />
          <StatCard label="מבקרים ייחודיים" value={data.uniqueSessions} />
          <StatCard label="צפיות בעמודים" value={data.totalViews} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="מכשירים">
          {data.deviceCounts.length ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.deviceCounts}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={85}
                  >
                    {data.deviceCounts.map((entry, i) => (
                      <Cell key={entry.label} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[0.85rem] text-ink/40">אין עדיין נתונים.</p>
          )}
        </Panel>

        <Panel title="צפיות ב-14 הימים האחרונים">
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={data.chart14}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Bar dataKey="count" fill="#A65D35" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="עמודים מובילים">
          <SimpleBars items={data.topPages} empty="אין עדיין נתונים." />
        </Panel>

        <Panel title="מקורות תנועה">
          <SimpleBars items={data.topReferrers} empty="אין עדיין נתונים." />
        </Panel>

        <Panel title="לידים לפי שירות">
          <SimpleBars items={data.leadsByService} empty="אין עדיין לידים עם שירות משויך." />
        </Panel>

        <Panel title="לחיצות מובילות">
          <SimpleBars items={data.topClicks} empty="אין עדיין נתונים." />
        </Panel>
      </div>
    </div>
  );
}

function SimpleBars({ items, empty }) {
  if (!items.length) return <p className="text-[0.85rem] text-ink/40">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <ul className="space-y-2.5">
      {items.map(({ label, count }) => (
        <li key={label} className="flex items-center gap-3 text-[0.85rem]">
          <span className="w-8 shrink-0 text-ink/60">{count}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-accent/30">
            <span
              className="block h-full rounded-full bg-clay"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className="max-w-[9rem] shrink-0 truncate" title={label}>
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
