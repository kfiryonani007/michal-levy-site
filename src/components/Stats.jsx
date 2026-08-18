import Reveal from './Reveal';
import { stats } from '../data/site';

/**
 * ============================================================================
 *  STATS — a single dark band that breaks the cream rhythm
 * ============================================================================
 *  The one dark surface on the page. It gives the eye somewhere to rest
 *  between the gallery and the contact form, and lets the numbers carry real
 *  weight without needing any colour. Hairline dividers between cells;
 *  no boxes, no icons.
 * ============================================================================
 */
export default function Stats() {
  return (
    <section aria-label="ניסיון ומספרים" className="bg-ink py-16 text-shell sm:py-20">
      <div className="container-site">
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 120}
              y={18}
              className={`relative flex flex-col px-4 text-center lg:px-8 ${
                // hairline divider on the start (right) edge of every cell
                // except the first in each row
                i % 2 !== 0 ? 'border-r border-shell/15' : ''
              } ${i !== 0 ? 'lg:border-r lg:border-shell/15' : 'lg:border-r-0'}`}
            >
              <dt className="order-2 mt-3 text-[0.78rem] tracking-[0.18em] text-shell/60">
                {stat.label}
              </dt>
              {/* dir="ltr" keeps "30+" from being flipped to "+30" by the
                  RTL bidi algorithm; pure-Hebrew values are unaffected */}
              <dd
                dir="ltr"
                className="order-1 font-serif text-4xl font-light leading-none sm:text-5xl lg:text-[3.4rem]"
              >
                {stat.value}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
