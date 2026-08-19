import { useEffect } from 'react';
import { seo } from '../data/site';

/**
 * ============================================================================
 *  SEO HEAD — applies the admin-editable title/description/pixel code
 * ============================================================================
 *  index.html already ships with a real <title> and meta description (good
 *  defaults, and what search engines see before any JS runs). This overwrites
 *  them at runtime once the real content loads from Supabase — see
 *  loadSiteContent.js, which mutates `seo` in place before this ever renders.
 *
 *  Pixel code is injected as real <script> elements (not just innerHTML,
 *  which would not execute them) — see runScripts() below. It only ever runs
 *  what an admin pasted in at /#/admin, the same trust level as any other
 *  content edit there.
 * ============================================================================
 */
function runScripts(container) {
  container.querySelectorAll('script').forEach((old) => {
    const fresh = document.createElement('script');
    for (const { name, value } of old.attributes) fresh.setAttribute(name, value);
    fresh.text = old.textContent;
    document.head.appendChild(fresh);
  });
}

export default function SeoHead() {
  useEffect(() => {
    if (seo.metaTitle) document.title = seo.metaTitle;

    if (seo.metaDescription) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', seo.metaDescription);
    }
  }, []);

  // Pixel code is injected once, separately from title/description, since
  // it should never re-run just because the admin edits the meta text.
  useEffect(() => {
    if (!seo.pixelCode?.trim()) return;
    const holder = document.createElement('div');
    holder.innerHTML = seo.pixelCode;
    // Non-script children of the pasted snippet (a <noscript><img> pixel
    // fallback, for instance) are real, valid markup — keep them too.
    Array.from(holder.children).forEach((el) => {
      if (el.tagName !== 'SCRIPT') document.head.appendChild(el);
    });
    runScripts(holder);
  }, []);

  return null;
}
