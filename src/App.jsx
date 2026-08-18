import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import GalleryPage from './pages/GalleryPage';
import ServicePage from './pages/ServicePage';
import AdminApp from './admin/AdminApp';
import { trackPageView } from './lib/analytics';
import { CartProvider } from './lib/CartContext';

/**
 * ============================================================================
 *  APP — routes and the shared chrome
 * ============================================================================
 *    /                     the one-page home
 *    /#/gallery            the full project gallery
 *    /#/service/<id>       one offering in detail
 *
 *  ── WHY HashRouter ───────────────────────────────────────────────────────
 *  This is a static site that will be uploaded to ordinary hosting. With
 *  clean URLs, loading /service/custom directly (or pressing refresh on it)
 *  asks the server for a file that does not exist, so it 404s unless the host
 *  is configured to rewrite every path to index.html. Hosting that supports
 *  that varies, and a broken refresh is a bad failure to ship blind.
 *
 *  HashRouter keeps the route after a `#`, which the server never sees, so
 *  every URL works on any host with no configuration at all — including a
 *  plain folder upload.
 *
 *  The cost is that the hash belongs to the router, so in-page section links
 *  can't be `href="#about"` any more. They scroll programmatically instead —
 *  see src/lib/navigation.js, which also handles the cross-page case.
 *
 *  If the site ends up somewhere with SPA rewrites (Netlify, Vercel, Cloudflare
 *  Pages), swap HashRouter for BrowserRouter here and the URLs lose the `#`.
 * ============================================================================
 */
export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}

/**
 * The site chrome, minus the admin panel. /#/admin is a tool rather than a
 * page of the site, so it renders on its own — the public header and footer
 * around a content editor would just be confusing (and the header's own
 * section links do not apply there).
 */
function Shell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Page-view tracking for the admin dashboard — skipped for /admin itself,
  // so Michal browsing her own panel doesn't inflate her own visitor stats.
  useEffect(() => {
    if (!isAdmin) trackPageView(location.pathname);
  }, [location.pathname, isAdmin]);

  if (isAdmin) {
    return <AdminApp />;
  }

  return (
    <CartProvider>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/service/:id" element={<ServicePage />} />
          {/* anything unrecognised goes home rather than showing a blank page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  );
}
