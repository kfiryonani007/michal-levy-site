import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Field } from './Field';

const BUCKET = 'gallery-images';

const blankItem = () => ({
  id: null,
  slug: `piece-${Date.now()}`,
  title: 'יצירה חדשה',
  place: '',
  category: '',
  description: '',
  tall: false,
  visible: true,
  sizes: [{ label: '‎50×70 ס״מ', price: 2400 }],
  image_url: null,
  sort_order: 0,
});

async function uploadImage(slug, file) {
  const dataUrl = await fileToCompressedDataUrl(file);
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${slug}-${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Downscales/compresses a chosen photo before it ever reaches Storage. */
function fileToCompressedDataUrl(file, { maxDim = 1600, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('הקובץ שנבחר אינו תמונה.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('קריאת הקובץ נכשלה.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('לא הצלחתי לפתוח את התמונה.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ProjectsPage() {
  const [items, setItems] = useState(null);
  const [dirtyIds, setDirtyIds] = useState(new Set());
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');

  const refresh = () =>
    supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setItems(data);
      });

  useEffect(() => {
    refresh();
  }, []);

  const markDirty = (id) => setDirtyIds((s) => new Set(s).add(id));

  const updateField = (localId, path, val) => {
    setItems((list) =>
      list.map((it) => {
        if ((it._localId ?? it.id) !== localId) return it;
        const next = { ...it };
        let cursor = next;
        for (let i = 0; i < path.length - 1; i++) {
          cursor[path[i]] = Array.isArray(cursor[path[i]]) ? [...cursor[path[i]]] : { ...cursor[path[i]] };
          cursor = cursor[path[i]];
        }
        cursor[path[path.length - 1]] = val;
        return next;
      })
    );
    markDirty(localId);
  };

  const addItem = () => {
    const item = { ...blankItem(), _localId: crypto.randomUUID() };
    setItems((list) => [...list, item]);
    markDirty(item._localId);
  };

  const removeItem = async (item) => {
    if (!window.confirm(`למחוק לצמיתות את "${item.title}"?`)) return;
    if (item.id) {
      const { error: err } = await supabase.from('gallery_items').delete().eq('id', item.id);
      if (err) {
        setError(err.message);
        return;
      }
    }
    setItems((list) => list.filter((it) => (it._localId ?? it.id) !== (item._localId ?? item.id)));
    setDirtyIds((s) => {
      const next = new Set(s);
      next.delete(item._localId ?? item.id);
      return next;
    });
  };

  const move = (index, dir) => {
    setItems((list) => {
      const next = list.slice();
      const j = index + dir;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((it, i) => ({ ...it, sort_order: i }));
    });
    setDirtyIds((s) => {
      const next = new Set(s);
      const a = items[index];
      const b = items[index + dir];
      if (a) next.add(a._localId ?? a.id);
      if (b) next.add(b._localId ?? b.id);
      return next;
    });
  };

  const pickImage = async (item, file) => {
    if (!file) return;
    const localId = item._localId ?? item.id;
    setBusyId(localId);
    setError(null);
    try {
      const url = await uploadImage(item.slug, file);
      updateField(localId, ['image_url'], url);
    } catch (e) {
      setError(e?.message || 'שגיאה בהעלאת התמונה.');
    } finally {
      setBusyId(null);
    }
  };

  const saveAll = async () => {
    setStatus('saving');
    setError(null);
    const toSave = items.filter((it) => dirtyIds.has(it._localId ?? it.id));
    for (const it of toSave) {
      const { _localId, ...row } = it;
      if (!row.image_url) {
        setError(`ל"${row.title}" חסרה תמונה — צריך להעלות תמונה לפני שמירה.`);
        setStatus('idle');
        return;
      }
      const payload = row.id ? row : { ...row, id: undefined };
      const { error: err } = await supabase.from('gallery_items').upsert(payload).select();
      if (err) {
        setError(`${row.title}: ${err.message}`);
        setStatus('idle');
        return;
      }
    }
    setDirtyIds(new Set());
    setStatus('idle');
    await refresh();
  };

  if (!items) return <p className="text-ink/60">טוען…</p>;

  return (
    <div className="pb-24">
      <h1 className="text-xl font-normal">מערכת פרויקטים</h1>
      <p className="mt-1 text-[0.8rem] text-ink/60">
        כל יצירה בגלריה — תמונה, כיתוב, מידות ומחירים. שינויים כאן חיים מיד באתר.
      </p>

      {error && (
        <p className="mt-4 rounded-sm border border-red-300 bg-red-50 px-4 py-2 text-[0.85rem] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {items.map((item, index) => {
          const localId = item._localId ?? item.id;
          const inputId = `upload-${localId}`;
          return (
            <div key={localId} className="min-w-0 rounded-sm border border-accent/70 bg-shell p-3 sm:p-4">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <label
                  htmlFor={inputId}
                  className="group relative block h-24 w-24 shrink-0 cursor-pointer overflow-hidden
                             rounded-sm border border-accent bg-cream"
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[0.7rem] text-ink/40">
                      אין תמונה
                    </span>
                  )}
                  <span
                    className="absolute inset-0 flex items-center justify-center bg-ink/0 text-[0.7rem]
                               text-transparent transition-colors group-hover:bg-ink/55 group-hover:text-shell"
                  >
                    {busyId === localId ? 'טוען…' : 'העלאה'}
                  </span>
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    pickImage(item, e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="הזזה למעלה"
                    className="px-2 text-ink/50 disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label="הזזה למטה"
                    className="px-2 text-ink/50 disabled:opacity-25"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="text-[0.8rem] text-red-700/80 underline underline-offset-2 hover:text-red-700"
                  >
                    מחיקה
                  </button>
                  {dirtyIds.has(localId) && (
                    <span className="text-[0.75rem] text-clay">שינוי לא שמור</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] text-ink/70">כותרת</span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateField(localId, ['title'], e.target.value)}
                    className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                               focus:border-clay focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] text-ink/70">מיקום / כיתוב עליון</span>
                  <input
                    type="text"
                    value={item.place ?? ''}
                    onChange={(e) => updateField(localId, ['place'], e.target.value)}
                    className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                               focus:border-clay focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] text-ink/70">קטגוריה</span>
                  <input
                    type="text"
                    value={item.category ?? ''}
                    onChange={(e) => updateField(localId, ['category'], e.target.value)}
                    className="w-full rounded-sm border border-accent bg-white px-3 py-2 text-[0.95rem]
                               focus:border-clay focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[0.8rem] text-ink/70">תיאור קצר (לא חובה)</span>
                  <textarea
                    value={item.description ?? ''}
                    rows={2}
                    onChange={(e) => updateField(localId, ['description'], e.target.value)}
                    className="w-full resize-y rounded-sm border border-accent bg-white px-3 py-2
                               text-[0.95rem] leading-[1.8] focus:border-clay focus:outline-none"
                  />
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-[0.9rem]">
                    <input
                      type="checkbox"
                      checked={!!item.tall}
                      onChange={(e) => updateField(localId, ['tall'], e.target.checked)}
                      className="h-4 w-4 accent-clay"
                    />
                    אריח גבוה
                  </label>
                  <label className="flex items-center gap-2 text-[0.9rem]">
                    <input
                      type="checkbox"
                      checked={item.visible !== false}
                      onChange={(e) => updateField(localId, ['visible'], e.target.checked)}
                      className="h-4 w-4 accent-clay"
                    />
                    מוצג באתר
                  </label>
                </div>

                <Field
                  label="מידות ומחירים"
                  value={item.sizes ?? []}
                  path={['sizes']}
                  onChange={(path, val) => updateField(localId, path, val)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-6 rounded-sm border border-clay px-6 py-2.5 text-[0.9rem] text-clay
                   transition-colors hover:bg-clay hover:text-shell"
      >
        + יצירה חדשה
      </button>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-accent bg-shell/95 backdrop-blur lg:right-64">
        <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={saveAll}
            disabled={!dirtyIds.size || status === 'saving'}
            className="rounded-sm bg-clay px-7 py-2.5 text-[0.9rem] text-shell transition-opacity
                       disabled:opacity-40"
          >
            {status === 'saving' ? 'שומר…' : 'שמירה'}
          </button>
          <span className="text-[0.8rem] text-ink/60">
            {dirtyIds.size ? `${dirtyIds.size} יצירות עם שינויים שלא נשמרו` : 'הכול שמור'}
          </span>
        </div>
      </div>
    </div>
  );
}
