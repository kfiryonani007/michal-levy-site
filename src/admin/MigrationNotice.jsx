/**
 * ============================================================================
 *  MIGRATION NOTICE — a readable stand-in for a raw Postgres error
 * ============================================================================
 *  The CRM/commission screens query columns added by
 *  supabase/migrations/001_leads_crm.sql. Until that file has been run against
 *  the project, PostgREST answers with things like
 *  "column leads.status does not exist" — accurate, but meaningless to the
 *  person looking at the screen, and it gives them nothing to do about it.
 *
 *  This detects that specific class of failure and says what actually needs
 *  to happen instead. Any other error still surfaces verbatim, because a
 *  friendly message that swallows a real bug is worse than an ugly one.
 * ============================================================================
 */

/** True when an error is "the database hasn't been migrated yet". */
export function isMissingColumn(message) {
  if (!message) return false;
  return (
    /does not exist/i.test(message) ||
    /schema cache/i.test(message) ||
    /PGRST204/.test(message)
  );
}

export default function MigrationNotice({ message }) {
  if (!isMissingColumn(message)) {
    return <p className="text-red-700">שגיאה בטעינת הנתונים: {message}</p>;
  }

  return (
    <div className="rounded-sm border border-amber-300 bg-amber-50 p-5">
      <p className="text-[0.95rem] font-medium text-amber-900">המסך הזה עדיין לא מחובר למסד הנתונים</p>
      <p className="mt-2 text-[0.88rem] leading-[1.8] text-amber-900/85">
        חסרות עמודות בטבלה. צריך להריץ פעם אחת את קובץ העדכון{' '}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.82rem]" dir="ltr">
          supabase/migrations/001_leads_crm.sql
        </code>{' '}
        ב-Supabase, תחת <span className="font-medium">SQL Editor</span>. אחרי זה יש לרענן את
        העמוד והכול יעבוד.
      </p>
      <p className="mt-3 text-[0.78rem] text-amber-900/60" dir="ltr">
        {message}
      </p>
    </div>
  );
}
