import { useState } from 'react';
import Reveal from './Reveal';
import { IconWhatsapp, IconPhone, IconMail, IconCheck, IconClose } from './Icons';
import { contact } from '../data/site';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../lib/CartContext';
import { formatPrice } from '../lib/pricing';

/**
 * ============================================================================
 *  CONTACT — form that submits straight to WhatsApp
 * ============================================================================
 *  The site is static (no backend), and rather than routing the form through
 *  a third-party email service (Web3Forms, Formspree — which needs an account,
 *  an API key, and a setup step before it actually delivers anything), the
 *  "submit" button builds one tidy WhatsApp message from the fields and opens
 *  it in a new tab. This was Michal's explicit call: she already treats
 *  WhatsApp as her main channel (every other CTA on the site points there
 *  too), and it means the form works the moment the site goes live — nothing
 *  to configure, no access key to lose, no risk of quietly landing in spam.
 *
 *  Trade-off worth knowing: WhatsApp's `wa.me` links only pre-fill the
 *  message text — there's no way to attach a file through the link, and no
 *  way to auto-send without the visitor's own tap. Both are called out in the
 *  UI: the photo field was dropped in favor of a note to attach it directly
 *  once the chat is open, and "success" means the WhatsApp chat opened with
 *  the message ready — not that it was sent automatically.
 *
 *  Anti-spam / validation is unchanged: real client-side checks, Hebrew error
 *  messages, first-invalid-field focus. There's no honeypot any more because
 *  there's no server-side inbox to spam — a bot filling this in just opens
 *  WhatsApp on whatever device ran it, which isn't a spam vector.
 * ============================================================================
 */
export default function Contact() {
  const [status, setStatus] = useState('idle'); // idle | success
  const [fieldErrors, setFieldErrors] = useState({});
  const cart = useCart();

  /** "תבליט פיסולי (‎50×70 ס״מ, ₪3,400), טריפטיך גלי (‎80×110 ס״מ, ₪6,700)" */
  const cartLine = () =>
    cart.items.map((i) => `${i.title} (${i.sizeLabel}, ${formatPrice(i.price)})`).join(', ');

  const validate = (data) => {
    const errors = {};
    const name = (data.get('name') || '').trim();
    const phone = (data.get('phone') || '').trim();
    const email = (data.get('email') || '').trim();

    if (name.length < 2) errors.name = 'נא למלא שם מלא';

    // Israeli mobile/landline, tolerant of spaces, dashes and +972
    if (!/^(\+?972[-\s]?|0)([23489]|5[0-9]|7[2-9])[-\s]?\d{7}$/.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'נא למלא מספר טלפון תקין';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = 'כתובת האימייל אינה תקינה';
    }

    return errors;
  };

  /** Turns the filled-in fields into one readable WhatsApp message. */
  const buildMessage = (data) => {
    const lines = ['פנייה חדשה מהאתר', '', `שם: ${data.get('name').trim()}`, `טלפון: ${data.get('phone').trim()}`];
    const email = data.get('email').trim();
    if (email) lines.push(`אימייל: ${email}`);
    if (cart.items.length) lines.push('', `אני מעוניין/ת ב: ${cartLine()}`);
    const message = data.get('message').trim();
    if (message) lines.push('', 'על הפרויקט:', message);
    return lines.join('\n');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const errors = validate(data);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      // Move focus to the first invalid field for keyboard/AT users.
      form.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus();
      return;
    }

    window.open(
      `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(buildMessage(data))}`,
      '_blank',
      'noopener,noreferrer'
    );
    setStatus('success');

    // Best-effort — logged for the admin's leads table, but never blocks or
    // delays the WhatsApp flow above, which is the part that actually
    // reaches Michal.
    const projectMessage = [cart.items.length ? `מעוניין/ת ב: ${cartLine()}` : '', data.get('message').trim()]
      .filter(Boolean)
      .join(' | ');
    supabase
      .from('leads')
      .insert({
        name: data.get('name').trim(),
        phone: data.get('phone').trim(),
        email: data.get('email').trim() || null,
        message: projectMessage || null,
      })
      .then(() => {}, () => {});

    cart.clear();
    form.reset();
  };

  /* --- Shared field styling -------------------------------------------- */
  const fieldClass = (hasError) =>
    `w-full border-b bg-transparent px-0 py-3 text-[0.95rem] text-ink
     placeholder:text-taupe/90 focus:outline-none focus-visible:outline-none
     transition-colors duration-300 ${
       hasError ? 'border-wood' : 'border-accent focus:border-ink'
     }`;

  const labelClass = 'mb-1 block text-[0.78rem] tracking-[0.14em] text-taupe';

  return (
    <section id="contact" className="bg-shell py-24 sm:py-28 lg:py-36">
      <div className="container-site">
        {/* --- Heading --- */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">בואו נדבר</span>
          <h2 className="text-3xl font-light leading-tight sm:text-4xl lg:text-[2.9rem]">
            נהפוך את הקיר שלכם למושלם
          </h2>
          <p className="mt-6 leading-[1.95] text-ink/70">
            מלאו פרטים קצרים, ונדבר בוואטסאפ.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)] lg:gap-16">
          {/* ================= FORM ================= */}
          <Reveal y={24}>
            {status === 'success' ? (
              /* --- In-page confirmation panel (never an alert) --- */
              <div
                role="status"
                aria-live="polite"
                className="flex h-full flex-col items-center justify-center border border-accent bg-cream px-8 py-16 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-wood/40">
                  <IconCheck className="h-8 w-8 text-wood" />
                </span>
                <h3 className="mt-7 text-2xl font-light">כמעט סיימנו!</h3>
                <p className="mt-4 max-w-sm leading-[1.9] text-ink/70">
                  השיחה נפתחה בוואטסאפ עם ההודעה מוכנה. לא נפתחה? אפשר ללחוץ
                  שוב.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-solid"
                  >
                    <IconWhatsapp className="h-4 w-4" />
                    לוואטסאפ
                  </a>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="btn-outline"
                  >
                    שליחת הודעה נוספת
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {cart.items.length > 0 && (
                  <div className="mb-8 border border-clay/50 bg-warmtaupe/10 p-5">
                    <p className="text-[0.78rem] tracking-[0.14em] text-taupe">
                      היצירות שבחרתם ({cart.items.length})
                    </p>
                    <ul className="mt-3 space-y-2">
                      {cart.items.map((i) => (
                        <li
                          key={i.key}
                          className="flex items-center justify-between gap-3 text-[0.9rem]"
                        >
                          <span className="min-w-0 truncate">
                            {i.title} <span className="text-ink/50">— {i.sizeLabel}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="text-ink/70">{formatPrice(i.price)}</span>
                            <button
                              type="button"
                              onClick={() => cart.remove(i.itemId, i.sizeLabel)}
                              aria-label={`הסרת ${i.title} מהעגלה`}
                              className="text-ink/40 hover:text-wood"
                            >
                              <IconClose className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-7 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      שם מלא <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="איך לקרוא לכם?"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'err-name' : undefined}
                      className={fieldClass(fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                      <p id="err-name" className="mt-2 text-[0.8rem] text-wood">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      טלפון <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="050-0000000"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
                      className={`${fieldClass(fieldErrors.phone)} text-right`}
                    />
                    {fieldErrors.phone && (
                      <p id="err-phone" className="mt-2 text-[0.8rem] text-wood">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      אימייל
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      placeholder="name@example.com"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                      className={`${fieldClass(fieldErrors.email)} text-right`}
                    />
                    {fieldErrors.email && (
                      <p id="err-email" className="mt-2 text-[0.8rem] text-wood">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className={labelClass}>
                      על הפרויקט
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="למהו החלל? מידת הקיר? באילו גוונים החלל?"
                      className={`${fieldClass(false)} resize-none`}
                    />
                    {/* wa.me can only pre-fill text, not attach a file — so a
                        photo has to be sent inside the chat itself. */}
                    <p className="mt-2 text-[0.78rem] leading-relaxed text-taupe">
                      תמונת הקיר? אפשר לשלוח בשיחת הוואטסאפ שתיפתח.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-9">
                  <button type="submit" className="btn-solid w-full sm:w-auto">
                    <IconWhatsapp className="h-4 w-4" />
                    שליחה בוואטסאפ
                  </button>
                </div>
              </form>
            )}
          </Reveal>

          {/* ================= DIRECT DETAILS ================= */}
          <Reveal delay={140} y={24}>
            <div className="border border-accent bg-cream p-8 lg:p-9">
              <h3 className="text-xl font-normal">ליצירת קשר ישירה</h3>
              <div className="mt-4 hairline" aria-hidden="true" />

              <ul className="mt-7 space-y-6">
                <li>
                  <a
                    href={contact.phoneHref}
                    className="group flex items-start gap-4 transition-colors duration-300 hover:text-wood"
                  >
                    <IconPhone className="mt-0.5 h-5 w-5 shrink-0 text-wood" />
                    <span>
                      <span className="block text-[0.74rem] tracking-[0.14em] text-taupe">טלפון</span>
                      <span className="mt-1 block text-[1.05rem]" dir="ltr">
                        {contact.phoneDisplay}
                      </span>
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="group flex items-start gap-4 transition-colors duration-300 hover:text-wood"
                  >
                    <IconMail className="mt-0.5 h-5 w-5 shrink-0 text-wood" />
                    <span>
                      <span className="block text-[0.74rem] tracking-[0.14em] text-taupe">אימייל</span>
                      <span className="mt-1 block break-all text-[1.05rem]" dir="ltr">
                        {contact.email}
                      </span>
                    </span>
                  </a>
                </li>

                <li>
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 transition-colors duration-300 hover:text-wood"
                  >
                    <IconWhatsapp className="mt-0.5 h-5 w-5 shrink-0 text-wood" />
                    <span>
                      <span className="block text-[0.74rem] tracking-[0.14em] text-taupe">וואטסאפ</span>
                      <span className="mt-1 block text-[1.05rem]">הדרך הכי מהירה להתחיל</span>
                    </span>
                  </a>
                </li>
              </ul>

              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid mt-9 w-full"
              >
                <IconWhatsapp className="h-4 w-4" />
                שליחת הודעה בוואטסאפ
              </a>

              <p className="mt-6 text-[0.8rem] leading-relaxed text-taupe">
                אשמח לשמוע על הפרויקט שלכם.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
