import { useEffect } from 'react';
import PageHero from '../components/PageHero';
import { contact } from '../data/site';

/**
 * ============================================================================
 *  ACCESSIBILITY STATEMENT
 * ============================================================================
 *  Israeli regulations require a business site to publish one, and to name a
 *  person who can be reached about accessibility problems. The contact details
 *  come from site.js so they can never drift from the rest of the site.
 *
 *  Deliberately states what has and has NOT been done. A statement claiming
 *  full compliance that hasn't been formally audited is worse than an honest
 *  one — it is itself a misrepresentation, and it removes the visitor's reason
 *  to report the problem they just hit.
 * ============================================================================
 */
export default function AccessibilityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.title = 'הצהרת נגישות | מיכל לוי — אמנות, עיצוב ועוד';
  }, []);

  const Section = ({ title, children }) => (
    <section className="mt-10">
      <h2 className="text-xl font-light">{title}</h2>
      <div className="mt-4 space-y-3 leading-[1.95] text-ink/75">{children}</div>
    </section>
  );

  return (
    <>
      <PageHero
        eyebrow="נגישות"
        title="הצהרת נגישות"
        intro="אנחנו מאמינים שלכל אדם מגיעה גישה שווה לתוכן האתר, ופועלים כדי שהאתר יהיה נוח לשימוש עבור כמה שיותר אנשים."
      />

      <section className="bg-shell pb-20 pt-10 sm:pb-24">
        <div className="container-site">
          <div className="max-w-2xl">
            <Section title="מה עשינו">
              <p>האתר נבנה מתוך מחשבה על נגישות, וכולל:</p>
              <ul className="list-disc space-y-2 pr-5">
                <li>מבנה סמנטי תקין עם כותרות היררכיות, אזורי ניווט ותוכן מסומנים</li>
                <li>טקסט חלופי לכל התמונות באתר</li>
                <li>ניווט מלא באמצעות מקלדת, עם סימון ברור של מוקד ההקלדה</li>
                <li>קישור דילוג לתוכן הראשי בתחילת כל עמוד</li>
                <li>תמיכה בהעדפת המערכת להפחתת אנימציות</li>
                <li>תפריט נגישות לשינוי גודל טקסט, ניגודיות, ריווח, גופן קריא ועצירת אנימציות</li>
                <li>הגדרות הנגישות נשמרות ונשארות בתוקף בין העמודים ובביקורים חוזרים</li>
              </ul>
            </Section>

            <Section title="רמת הנגישות">
              <p>
                האתר נבנה בהתאם להנחיות <span dir="ltr">WCAG 2.0</span> ברמה{' '}
                <span dir="ltr">AA</span>, שהן הבסיס לתקן הישראלי 5568.
              </p>
              <p>
                חשוב לנו לציין: <strong>טרם בוצעה ביקורת נגישות פורמלית</strong> על ידי מורשה
                נגישות מוסמך. אנחנו פועלים לפי ההנחיות ובודקים את האתר, אך אין לראות בהצהרה זו
                אישור עמידה מלאה בתקן.
              </p>
            </Section>

            <Section title="מגבלות ידועות">
              <p>
                חלקים מסוימים באתר עשויים שלא להיות נגישים במלואם — בפרט תוכן שמתווסף לגלריה
                באופן שוטף. אנחנו מתקנים כל בעיה שמתגלה או שמדווחת לנו.
              </p>
            </Section>

            <Section title="נתקלתם בבעיה?">
              <p>
                אם נתקלתם בקושי כלשהו בגלישה באתר, נשמח מאוד שתספרו לנו — נטפל בזה ונחזור אליכם.
              </p>
              <ul className="space-y-2">
                <li>
                  טלפון:{' '}
                  <a href={contact.phoneHref} className="text-clay underline underline-offset-2" dir="ltr">
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li>
                  אימייל:{' '}
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-clay underline underline-offset-2"
                    dir="ltr"
                  >
                    {contact.email}
                  </a>
                </li>
              </ul>
              <p className="text-[0.9rem] text-ink/60">
                אחראית נגישות: מיכל לוי. נשתדל להשיב לכל פנייה בהקדם.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}
