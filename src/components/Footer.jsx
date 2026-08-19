import { Link } from 'react-router-dom';
import Logo from './Logo';
import {
  IconInstagram,
  IconFacebook,
  IconPhone,
  IconMail,
  IconWhatsapp,
} from './Icons';
import { contact, navLinks, whatsappLink } from '../data/site';
import { useSectionNav } from '../lib/navigation';

/**
 * ============================================================================
 *  FOOTER — stacked logo, contact details, social, copyright
 * ============================================================================
 *  Deliberately quiet and airy so the page ends softly rather than with a
 *  heavy dark slab. The social links are placeholders: fill in the real URLs
 *  in `contact.social` in src/data/site.js — while they're still '#' they are
 *  rendered as disabled so nothing dead-ends the visitor.
 * ============================================================================
 */
export default function Footer() {
  const year = new Date().getFullYear();
  const goToSection = useSectionNav();

  const socials = [
    { key: 'instagram', label: 'אינסטגרם', Icon: IconInstagram, href: contact.social.instagram },
    { key: 'facebook', label: 'פייסבוק', Icon: IconFacebook, href: contact.social.facebook },
  ];

  return (
    <footer className="border-t border-accent/50 bg-cream pt-16 sm:pt-20">
      <div className="container-site">
        <div className="grid gap-12 pb-14 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.8fr_1fr] lg:gap-10">
          {/* --- Logo lockup --- */}
          <div className="flex justify-center sm:col-span-2 sm:justify-start lg:col-span-1">
            <Logo variant="stacked" className="text-ink" />
          </div>

          {/* --- Section links --- */}
          <nav aria-label="ניווט בתחתית העמוד">
            <h2 className="text-[0.74rem] tracking-eyebrow text-taupe">ניווט</h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => {
                const classes =
                  'text-[0.95rem] text-ink/75 transition-colors duration-300 hover:text-wood';
                return (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className={classes}>
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToSection(link.section)}
                        className={classes}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* --- Contact + social --- */}
          <div>
            <h2 className="text-[0.74rem] tracking-eyebrow text-taupe">יצירת קשר</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={contact.phoneHref}
                  className="flex items-center gap-3 text-[0.95rem] text-ink/75 transition-colors duration-300 hover:text-wood"
                >
                  <IconPhone className="h-4 w-4 shrink-0 text-wood" />
                  <span dir="ltr">{contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-[0.95rem] text-ink/75 transition-colors duration-300 hover:text-wood"
                >
                  <IconMail className="h-4 w-4 shrink-0 text-wood" />
                  <span dir="ltr" className="break-all">
                    {contact.email}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[0.95rem] text-ink/75 transition-colors duration-300 hover:text-wood"
                >
                  <IconWhatsapp className="h-4 w-4 shrink-0 text-wood" />
                  וואטסאפ
                </a>
              </li>
            </ul>

            {/* Social icons — PLACEHOLDER links until the real profiles are added */}
            <ul className="mt-7 flex items-center gap-3">
              {socials.map(({ key, label, Icon, href }) => {
                const ready = href && href !== '#';
                return (
                  <li key={key}>
                    <a
                      href={ready ? href : undefined}
                      target={ready ? '_blank' : undefined}
                      rel={ready ? 'noopener noreferrer' : undefined}
                      aria-disabled={!ready}
                      title={ready ? label : `${label} — יתווסף בהמשך`}
                      aria-label={label}
                      onClick={(e) => !ready && e.preventDefault()}
                      className={`flex h-11 w-11 items-center justify-center border border-accent
                                  transition-all duration-500 ease-soft ${
                                    ready
                                      ? 'text-ink/70 hover:border-ink hover:bg-ink hover:text-shell'
                                      : 'cursor-default text-taupe/50'
                                  }`}
                    >
                      <Icon className="h-[1.15rem] w-[1.15rem]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* --- Copyright bar --- */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-accent/50 py-7 text-center sm:flex-row sm:text-right">
          <p className="text-[0.82rem] text-taupe">
            © {year} מיכל לוי — אמנות, עיצוב ועוד...
          </p>
          <p className="text-[0.82rem] text-taupe">כל הזכויות שמורות</p>
        </div>
      </div>

      {/* --- KFIR AI badge — fixed to the corner, floats with the page (not
          part of the footer's own scroll flow) --- */}
      <a
        href="https://kfir-ai.com"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 left-6 z-40 flex flex-col items-center gap-2.5
                   rounded-sm bg-shell/95 p-4 text-center no-underline shadow-lg backdrop-blur-sm
                   transition-transform duration-300 ease-soft hover:-translate-y-1"
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-sm border border-accent
                     bg-shell transition-colors duration-300 group-hover:border-[#9D7AEE]"
        >
          <img
            src="https://kfir-ai.com/assets/kfir-ai-icon-transparent.png"
            alt="KFIR AI"
            width="32"
            height="27"
            className="block"
          />
        </span>
        <span className="text-[11px] font-medium leading-tight text-[#8f8f9b]">
          האתר נבנה על ידי
          <br />
          <strong className="text-[0.8rem] font-extrabold text-[#9D7AEE]">KFIR AI</strong>
        </span>
      </a>
    </footer>
  );
}
