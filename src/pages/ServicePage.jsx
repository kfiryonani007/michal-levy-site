import { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import MediaGrid from '../components/MediaGrid';
import Reveal from '../components/Reveal';
import { serviceIcons, IconWhatsapp, IconArrowLeft } from '../components/Icons';
import { getService, services, whatsappLink, contact, servicesSection } from '../data/site';
import { mediaForService, galleryItems } from '../lib/media';
import { galleryFallback } from '../data/site';

/**
 * ============================================================================
 *  SERVICE PAGE — one offering in detail
 * ============================================================================
 *  Route: /#/service/<id> where <id> is a service id from src/data/site.js.
 *
 *  Layout: page header → intro copy beside the icon → numbered "how it works"
 *  steps → project photos → the other offerings → CTA.
 *
 *  Photos come from src/media/services/<id>/ when that folder has anything in
 *  it, otherwise from the shared gallery, otherwise from the placeholder tiles.
 *  That way the page never has an empty hole in the middle of it.
 * ============================================================================
 */
export default function ServicePage() {
  const { id } = useParams();
  const service = getService(id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (service) {
      document.title = `${service.title} | מיכל לוי — אמנות, עיצוב ועוד`;
    }
  }, [service, id]);

  // Unknown id → home, rather than a blank page
  if (!service) return <Navigate to="/" replace />;

  const Icon = serviceIcons[service.icon];
  const media = galleryItems.length ? mediaForService(service.id, 3) : galleryFallback.slice(0, 3);
  const others = services.filter((s) => s.id !== service.id);

  return (
    <>
      {/* The page header carries the concrete summary; the poetic tagline is
          used once, as the pull-quote in the intro below. Putting the same
          sentence in both places read as a copy-paste slip. */}
      <PageHero
        eyebrow={servicesSection.title}
        title={service.title}
        intro={service.text}
      />

      {/* --- Intro copy --- */}
      <section className="bg-shell py-20 sm:py-24 lg:py-28">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-20">
            <Reveal className="order-1">
              {Icon && <Icon className="h-12 w-12 text-wood" />}
              <p className="mt-6 font-serif text-xl font-light leading-snug text-ink/80">
                {service.tagline}
              </p>
            </Reveal>

            <div className="order-2 space-y-5">
              {service.intro.map((p, i) => (
                <Reveal key={i} as="p" delay={80 + i * 90} y={18} className="leading-[1.95] text-ink/80">
                  {p}
                </Reveal>
              ))}

              {service.note && (
                <Reveal delay={340} y={16}>
                  {/* warmtaupe wash (Pantone moodboard accent) — verified 5:1
                      with dark ink text, so it's used as a background only */}
                  <p className="mt-8 border-r-2 border-clay bg-warmtaupe/20 px-6 py-4 text-[0.95rem] leading-[1.9] text-ink/75">
                    {service.note}
                  </p>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- How it works --- */}
      {service.steps?.length > 0 && (
        <section className="bg-cream py-20 sm:py-24 lg:py-28">
          <div className="container-site">
            <Reveal className="max-w-2xl">
              <span className="eyebrow">איך זה עובד</span>
              <h2 className="text-2xl font-light leading-tight sm:text-3xl lg:text-[2.4rem]">
                השלבים בדרך
              </h2>
            </Reveal>

            {/* Individually bordered cells with a real gap, not `gap-px` over a
                tinted parent: at fractional column widths some of those 1px
                gaps round away and dividers silently go missing. */}
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
              {service.steps.map((step, i) => (
                <Reveal
                  as="li"
                  key={step.title}
                  delay={i * 110}
                  y={22}
                  className="flex flex-col border border-accent/60 bg-shell/60 p-7 lg:p-8"
                >
                  <span
                    className="font-serif text-2xl font-light text-accent"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 text-lg font-normal leading-snug">{step.title}</h3>
                  <div className="mt-3 h-px w-9 bg-accent" aria-hidden="true" />
                  <p className="mt-3 text-[0.93rem] leading-[1.9] text-ink/70">{step.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* --- Project photos --- */}
      {media.length > 0 && (
        <section className="bg-shell py-20 sm:py-24 lg:py-28">
          <div className="container-site">
            <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className="eyebrow">מתוך העבודה</span>
                <h2 className="text-2xl font-light leading-tight sm:text-3xl lg:text-[2.4rem]">
                  פרויקטים
                </h2>
              </div>
              <Link
                to="/gallery"
                className="group inline-flex shrink-0 items-center gap-2 border-b border-accent pb-1
                           text-[0.95rem] tracking-wide text-ink transition-colors duration-500
                           hover:border-ink hover:text-wood"
              >
                לגלריה המלאה
                <IconArrowLeft className="h-4 w-4 transition-transform duration-500 ease-soft group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            <div className="mt-12 lg:mt-14">
              <MediaGrid items={media} columns={3} />
            </div>
          </div>
        </section>
      )}

      {/* --- CTA --- */}
      <section className="bg-ink py-20 text-shell sm:py-24">
        <div className="container-site">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-light leading-tight sm:text-3xl">
              נתחיל מהקיר שלכם
            </h2>
            <p className="mt-5 leading-[1.9] text-shell/75">
              שלחו לי תמונה של החלל ומשפט על מה שאתם מדמיינים — ואחזור אליכם עם רעיון
              והצעת מחיר.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={whatsappLink(`היי מיכל, אשמח לשמוע עוד על ${service.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-shell px-8 py-3.5
                           text-sm font-medium tracking-wide text-ink transition-all duration-500
                           ease-soft hover:bg-sand"
              >
                <IconWhatsapp className="h-4 w-4" />
                בואו נדבר
              </a>
              <a
                href={contact.phoneHref}
                dir="ltr"
                className="inline-flex items-center justify-center gap-2 rounded-sm border
                           border-shell/40 px-8 py-3.5 text-sm font-medium tracking-wide
                           text-shell transition-all duration-500 ease-soft
                           hover:bg-shell hover:text-ink"
              >
                {contact.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- The other offerings --- */}
      <section className="bg-cream py-20 sm:py-24">
        <div className="container-site">
          <Reveal className="max-w-2xl">
            <span className="eyebrow">אפשר גם</span>
            <h2 className="text-2xl font-light leading-tight sm:text-3xl">
              מסלולים נוספים
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other, i) => {
              const OtherIcon = serviceIcons[other.icon];
              return (
                <Reveal key={other.id} delay={i * 90} y={20}>
                  <Link
                    to={`/service/${other.id}`}
                    className="group flex h-full flex-col border border-accent/60 bg-shell p-7
                               transition-colors duration-700 ease-soft hover:border-accent hover:bg-cream"
                  >
                    {OtherIcon && (
                      <OtherIcon className="h-7 w-7 text-wood transition-transform duration-700 ease-soft group-hover:-translate-y-0.5" />
                    )}
                    <h3 className="mt-5 text-lg font-normal leading-snug">{other.title}</h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.85rem] tracking-wide text-wood">
                      {servicesSection.cardCta}
                      <IconArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-soft group-hover:-translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
