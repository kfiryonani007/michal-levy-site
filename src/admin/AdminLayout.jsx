import { NavLink } from 'react-router-dom';
import { signOut } from '../lib/auth';

const NAV = [
  { to: '/admin', label: 'מסך בקרה', end: true },
  { to: '/admin/leads', label: 'מערכת לידים' },
  { to: '/admin/projects', label: 'מערכת פרויקטים' },
  { to: '/admin/settings', label: 'הגדרות אתר' },
];

/**
 * The chrome shared by every /admin/* page: a sidebar (nav + connection
 * status + logout) and a content area. Styled in the site's own clay/shell
 * palette rather than a generic admin theme, so it still reads as "Michal's
 * site" and not a bolted-on third-party tool.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-cream lg:flex" dir="rtl">
      {/* --- Sidebar --- */}
      <aside className="border-b border-accent bg-ink text-shell lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between px-5 py-5 lg:flex-col lg:items-start lg:gap-1">
          <div>
            <p className="text-[0.95rem] font-medium">מיכל לוי</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-shell/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              מחובר/ת
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[0.8rem] text-shell/70 underline underline-offset-2 hover:text-shell lg:mt-4"
          >
            יציאה
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-sm px-4 py-2.5 text-[0.9rem] transition-colors ${
                  isActive ? 'bg-clay text-shell' : 'text-shell/75 hover:bg-shell/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* --- Content --- */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
