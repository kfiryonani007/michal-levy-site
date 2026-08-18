import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { serviceIcons, IconArrowLeft } from './Icons';
import { services, servicesSection, whatsappLink } from '../data/site';

/**
 * ============================================================================
 *  WHAT MICHAL OFFERS — five cards, each opening its own page
 * ============================================================================
 *  Kept flat and hairline-bordered to match the restrained palette; the hover
 *  state is a warm border and a slight icon lift, nothing more. Each card is a
 *  whole-card <Link> to /#/service/<id>, so the click target is the card rather
 *  than a small "read more" — easier to hit on a phone and it gives keyboard
 *  users one stop per card instead of two.
 *
 *  Three columns rather than four: with five offerings a four-column grid
 *  leaves a single orphan on the second row, and the cards were cramped.
 * ============================================================================
 */
export default function Services() {
  return (
    <section id="services" className="bg-shell py-24 sm:py-28 lg:py-36">
      <div className="container-site">
        {/* --- Section heading --- */}
        <Reveal className="max-w-2xl">
          <span className="eyebrow">{servicesSection.eyebrow}</span>
          <h2 className="text-3xl font-light leading-tight sm:text-4xl lg:text-[2.9rem]">
            {servicesSection.title}
          </h2>
          <p className="mt-6 leading-[1.95] text-ink/70">{servicesSection.intro}</p>
        </Reveal>

        {/* --- Cards --- */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Reveal key={service.id} delay={(i % 3) * 110} y={22}>
                <Link
                  to={`/service/${service.id}`}
                  className="group flex h-full flex-col border border-accent/60 bg-shell p-8
                             transition-colors duration-700 ease-soft hover:border-accent
                             hover:bg-cream lg:p-9"
                >
                  {/* icon + index row */}
                  <div className="flex items-start justify-between">
                    {Icon && (
                      <Icon className="h-8 w-8 text-wood transition-transform duration-700 ease-soft group-hover:-translate-y-0.5" />
                    )}
                    <span
                      className="font-serif text-2xl font-light text-accent"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-normal leading-snug">{service.title}</h3>
                  <div className="mt-4 h-px w-9 bg-accent" aria-hidden="true" />
                  <p className="mt-4 text-[0.95rem] leading-[1.9] text-ink/70">
                    {service.text}
                  </p>

                  {/* pushed to the bottom so the cue lines up across cards */}
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.85rem] tracking-wide text-wood">
                    {servicesSection.cardCta}
                    <IconArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 ease-soft group-hover:-translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* --- Section CTA --- */}
        <Reveal delay={200} y={16} className="mt-14 text-center">
          <p className="text-ink/70">{servicesSection.outroQuestion}</p>
          <a
            href={whatsappLink('היי מיכל, אשמח להתייעץ איתך לגבי הקיר שלי')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-5"
          >
            {servicesSection.outroCta}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
