import { useState } from 'react';

/**
 * ============================================================================
 *  FIELD — one generic editor for any shape of content
 * ============================================================================
 *  Walks a value by its JS shape (text / number / boolean / list / group)
 *  instead of having a hand-written form per section, so a field added to
 *  site.js later shows up here automatically — the promise of "edit
 *  everything" would quietly stop being true the first time content changed
 *  otherwise.
 * ============================================================================
 */

const LABELS = {
  name: 'שם', tagline: 'משפט לוואי', phoneDisplay: 'טלפון (כפי שמוצג)',
  phoneHref: 'טלפון (קישור חיוג)', whatsapp: 'מספר וואטסאפ', email: 'אימייל',
  social: 'רשתות חברתיות', instagram: 'אינסטגרם', facebook: 'פייסבוק',
  label: 'תווית', section: 'מקטע בדף הבית', to: 'כתובת', eyebrow: 'כותרת קטנה',
  title: 'כותרת', titleTop: 'כותרת — שורה ראשונה', titleEm: 'כותרת — שורה שנייה (נטוי)',
  subtitle: 'תת-כותרת', primaryCta: 'כפתור ראשי', secondaryCta: 'כפתור משני',
  image: 'תמונה (נתיב)', imageAlt: 'תיאור התמונה', imageFallback: 'תמונת גיבוי (נתיב)',
  imageFallbackAlt: 'תיאור תמונת הגיבוי', video: 'סרטון הירו', poster: 'תמונת פתיחה לסרטון',
  description: 'תיאור', buyBadge: 'תג רכישה', text: 'טקסט',
  whatsappMessage: 'הודעת וואטסאפ', paragraphs: 'פסקאות', signature: 'חתימה',
  credentials: 'הסמכות', intro: 'פסקת פתיחה', outroQuestion: 'שאלת סיום',
  outroCta: 'כפתור סיום', cardCta: 'טקסט קישור בכרטיס', id: 'מזהה (לא לשנות)',
  icon: 'אייקון', steps: 'שלבים', note: 'הערה בתיבה', page: 'עמוד הגלריה',
  allLabel: 'תווית "הכול"', emptyTitle: 'כותרת כשאין תמונות', emptyText: 'טקסט כשאין תמונות',
  cta: 'כפתור', value: 'ערך', webm: 'קובץ WebM', mp4: 'קובץ MP4',
};

export const clone = (v) => JSON.parse(JSON.stringify(v));

/** Immutable deep set. `path` is a list of object keys / array indexes. */
export function setIn(obj, path, val) {
  if (!path.length) return val;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[head] = setIn(obj[head], rest, val);
    return copy;
  }
  return { ...obj, [head]: setIn(obj?.[head], rest, val) };
}

/** An empty item shaped like an existing one, for "add to list". */
function blankLike(sample) {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === 'object') {
    return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankLike(v)]));
  }
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  return '';
}

function itemLabel(item, i) {
  if (item && typeof item === 'object') {
    const named = item.title || item.label || item.value || item.name;
    if (named) return String(named);
  }
  if (typeof item === 'string' && item.trim()) {
    return item.length > 45 ? `${item.slice(0, 45)}…` : item;
  }
  return `פריט ${i + 1}`;
}

const isImagePath = (key, val) =>
  typeof val === 'string' && /^(image|poster|imageFallback)$/.test(key) && val.trim() !== '';

export function Field({ label, value, path, onChange, depth = 0 }) {
  if (Array.isArray(value)) {
    const sample = value[0] ?? '';
    return (
      <fieldset className="min-w-0 rounded-sm border border-accent/70 bg-shell p-2.5 sm:p-4">
        <legend className="px-2 text-[0.8rem] font-medium tracking-wide text-wood">
          {label} ({value.length})
        </legend>

        <div className="space-y-3">
          {value.map((item, i) => (
            <ListRow
              key={i}
              index={i}
              total={value.length}
              label={itemLabel(item, i)}
              onMove={(dir) => {
                const next = value.slice();
                const j = i + dir;
                [next[i], next[j]] = [next[j], next[i]];
                onChange(path, next);
              }}
              onRemove={() => {
                if (!window.confirm(`למחוק את "${itemLabel(item, i)}"?`)) return;
                onChange(path, value.filter((_, k) => k !== i));
              }}
            >
              <Field
                label={itemLabel(item, i)}
                value={item}
                path={[...path, i]}
                onChange={onChange}
                depth={depth + 1}
              />
            </ListRow>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onChange(path, [...value, blankLike(sample)])}
          className="mt-3 rounded-sm border border-clay px-4 py-2 text-[0.8rem] text-clay
                     transition-colors hover:bg-clay hover:text-shell"
        >
          + הוספה
        </button>
      </fieldset>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <fieldset className="min-w-0 rounded-sm border border-accent/70 bg-shell p-2.5 sm:p-4">
        <legend className="px-2 text-[0.8rem] font-medium tracking-wide text-wood">{label}</legend>
        <div className="space-y-4">
          {Object.entries(value).map(([k, v]) => (
            <Field
              key={k}
              label={LABELS[k] ?? k}
              value={v}
              path={[...path, k]}
              onChange={onChange}
              depth={depth + 1}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-3 text-[0.9rem]">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="h-4 w-4 accent-clay"
        />
        {label}
      </label>
    );
  }

  if (typeof value === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-[0.8rem] text-ink/70">{label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(path, e.target.value === '' ? 0 : Number(e.target.value))}
          className="w-40 rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                     focus:border-clay focus:outline-none"
        />
      </label>
    );
  }

  const key = path[path.length - 1];
  const long = typeof value === 'string' && (value.length > 70 || value.includes('\n'));
  return (
    <label className="block">
      <span className="mb-1 block text-[0.8rem] text-ink/70">{label}</span>
      {long ? (
        <textarea
          value={value}
          rows={Math.min(8, Math.ceil(value.length / 70) + 1)}
          onChange={(e) => onChange(path, e.target.value)}
          className="w-full resize-y rounded-sm border border-accent bg-white px-3 py-2
                     text-[0.95rem] leading-[1.8] focus:border-clay focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
          className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                     focus:border-clay focus:outline-none"
        />
      )}
      {isImagePath(key, value) && (
        <img
          src={value}
          alt=""
          className="mt-2 h-20 w-20 rounded-sm border border-accent/60 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
    </label>
  );
}

/** One collapsible row of a list, with its move/remove controls. */
export function ListRow({ index, total, label, onMove, onRemove, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-w-0 rounded-sm border border-accent/60 bg-cream/40">
      <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-w-0 flex-1 truncate text-right text-[0.9rem] font-medium"
        >
          {open ? '▾' : '◂'} {label}
        </button>
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="הזזה למעלה"
          className="px-2 text-ink/50 disabled:opacity-25"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="הזזה למטה"
          className="px-2 text-ink/50 disabled:opacity-25"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="מחיקה"
          className="px-2 text-red-700/70 hover:text-red-700"
        >
          ✕
        </button>
      </div>
      {open && <div className="min-w-0 border-t border-accent/50 p-2 sm:p-4">{children}</div>}
    </div>
  );
}
