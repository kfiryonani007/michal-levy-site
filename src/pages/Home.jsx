import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import GalleryTeaser from '../components/GalleryTeaser';
import Stats from '../components/Stats';
import Contact from '../components/Contact';
import { scrollToSection } from '../lib/navigation';

/**
 * ============================================================================
 *  HOME — the one-page composition
 * ============================================================================
 *  Section order and the surface rhythm behind it:
 *    Hero      full-bleed photograph
 *    About     cream
 *    Services  shell (broken white)
 *    Gallery   cream  — a teaser; the full set lives at /#/gallery
 *    Stats     ink    ← the single dark band, a deliberate pause
 *    Contact   shell
 * ============================================================================
 */
export default function Home() {
  const location = useLocation();

  /* Arriving from another page via a nav section link: the target section is
     handed over in location state (see src/lib/navigation.js). Scroll once the
     sections have mounted. */
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    // rAF so layout is settled before measuring the offset
    const raf = requestAnimationFrame(() => scrollToSection(target, 'auto'));
    return () => cancelAnimationFrame(raf);
  }, [location.state]);

  return (
    <>
      <Hero />
      <About />
      <Services />
      <GalleryTeaser />
      <Stats />
      <Contact />
    </>
  );
}
