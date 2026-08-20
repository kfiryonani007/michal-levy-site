/**
 * ============================================================================
 *  LEAD STATUS — the one definition of a lead's lifecycle
 * ============================================================================
 *  Shared by LeadsPage (table + filter), LeadDrawer (the picker) and
 *  CommissionPage (which only counts `sold`). Kept in one place so a status
 *  added here shows up everywhere at once instead of drifting between three
 *  hand-maintained lists.
 *
 *  The stored value is the English key — Hebrew is display only, so renaming
 *  a label never rewrites rows in the database.
 * ============================================================================
 */
export const LEAD_STATUSES = [
  { key: 'new', label: 'חדש', tone: 'bg-sky-100 text-sky-800 border-sky-200' },
  { key: 'in_progress', label: 'בטיפול', tone: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'interested', label: 'מעוניין', tone: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { key: 'not_interested', label: 'לא מעוניין', tone: 'bg-stone-200 text-stone-600 border-stone-300' },
  { key: 'sold', label: 'נסגר / נמכר', tone: 'bg-clay/15 text-clay border-clay/30' },
];

/** The only status that feeds the commission screen. */
export const SOLD = 'sold';

const BY_KEY = Object.fromEntries(LEAD_STATUSES.map((s) => [s.key, s]));

export const statusOf = (key) => BY_KEY[key] ?? BY_KEY.new;

/** Small coloured pill used in the table and the drawer header. */
export function StatusPill({ status, className = '' }) {
  const s = statusOf(status);
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5
                  text-[0.72rem] ${s.tone} ${className}`}
    >
      {s.label}
    </span>
  );
}
