/*
 *  סיכום לקריאה בלבד, לעוזר הקולי.
 *
 *  כתובת אחת שמחזירה כמה נכנסו לאתר, כמה פניות חדשות יש, וכמה עמלה
 *  הצטברה החודש. ותו לא: אי אפשר דרכה לשנות ליד, למחוק, או להיכנס לניהול.
 *
 *  למה פונקציה בצד השרת ולא קריאה ישירה ל-Supabase מהעוזר: ה-RLS על
 *  הטבלאות מרשה קריאת לידים רק למשתמש מחובר, ומפתח ה-service נשאר כאן
 *  ולא יוצא מהשרת אף פעם. שם המשתנה בכוונה בלי הקידומת VITE_, שאחרת
 *  Vite היה מכניס אותו לקוד שנשלח לדפדפן.
 *
 *  פרטי הקשר של הפניות לא מוחזרים - רק שם וזמן. מספיק כדי לדעת שיש
 *  פנייה ולפתוח את הממשק, וכך גם אם הטוקן ידלוף אין שם מה לגנוב.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const TOKEN = process.env.ASSISTANT_TOKEN || '';

const DEFAULT_RATE = 10;   /* אותה ברירת מחדל כמו במסך העמלות */

function authorised(req) {
  if (!TOKEN) return false;              /* לא מוגדר = הכתובת סגורה */
  const header = req.headers.authorization || '';
  const given = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!given || given.length !== TOKEN.length) return false;
  /* השוואה בזמן קבוע, כדי לא לדלוף את הטוקן דרך זמני תגובה */
  let diff = 0;
  for (let i = 0; i < TOKEN.length; i++) diff |= given.charCodeAt(i) ^ TOKEN.charCodeAt(i);
  return diff === 0;
}

async function sb(pathAndQuery) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + pathAndQuery, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: 'Bearer ' + SERVICE_KEY,
      Accept: 'application/json'
    }
  });
  if (!res.ok) throw new Error('supabase ' + res.status + ' on ' + pathAndQuery.split('?')[0]);
  return res.json();
}

const iso = (msAgo) => new Date(Date.now() - msAgo).toISOString();
const DAY = 24 * 60 * 60 * 1000;

function visitors(rows, sinceMs) {
  const seen = new Set();
  let views = 0;
  for (const r of rows) {
    if (Date.parse(r.created_at) < sinceMs) continue;
    views++;
    if (r.session_id) seen.add(r.session_id);
  }
  return { views, visitors: seen.size };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method' });
  if (!authorised(req)) return res.status(401).json({ ok: false, error: 'טוקן לא תקין' });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ ok: false, error: 'השרת לא מוגדר' });
  }

  try {
    const monthAgo = iso(30 * DAY);
    const [views, leads, settings] = await Promise.all([
      sb('page_views?select=session_id,created_at&created_at=gte.' + monthAgo + '&limit=20000'),
      sb('leads?select=id,name,status,sale_amount,created_at&order=created_at.desc&limit=500'),
      sb('site_settings?select=value&key=eq.commission')
    ]);

    const now = Date.now();
    /* פנייה שלא טופלה עדיין: הסטטוס ההתחלתי שהטבלה נותנת הוא new */
    const fresh = leads.filter((l) => (l.status || 'new') === 'new');
    const sold = leads.filter((l) => l.status === 'sold' && Date.parse(l.created_at) >= now - 30 * DAY);
    const salesTotal = sold.reduce((sum, l) => sum + (Number(l.sale_amount) || 0), 0);
    const rate = Number(settings?.[0]?.value?.rate);

    return res.status(200).json({
      ok: true,
      now: new Date(now).toISOString(),
      traffic: {
        today: visitors(views, now - DAY),
        week: visitors(views, now - 7 * DAY),
        month: visitors(views, now - 30 * DAY)
      },
      leads: {
        total: leads.length,
        unseen: fresh.length,
        recent: fresh.slice(0, 10).map((l) => ({ name: l.name || '', when: l.created_at }))
      },
      commission: {
        ratePercent: Number.isFinite(rate) ? rate : DEFAULT_RATE,
        salesThisMonth: salesTotal,
        soldCount: sold.length,
        yoursThisMonth: Math.round(salesTotal * ((Number.isFinite(rate) ? rate : DEFAULT_RATE) / 100))
      }
    });
  } catch (err) {
    /* לא מחזירים מספרים חלקיים: עדיף לומר שנכשל מאשר לדווח מספר שגוי */
    return res.status(502).json({ ok: false, error: String(err.message || err).slice(0, 200) });
  }
}
