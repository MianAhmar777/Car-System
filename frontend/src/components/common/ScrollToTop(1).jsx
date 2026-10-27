import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever the user navigates to a new page,
 * the viewport strictly opens at the very top (Header to Footer)
 * rather than retaining the previous scroll position at the bottom/footer.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Prevent browser from automatically restoring previous scroll positions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // When clicking a link that points to the current active page, scroll to top smoothly
  useEffect(() => {
    const handleSamePageLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href) {
        try {
          const url = new URL(anchor.href);
          if (
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            !url.hash
          ) {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }
        } catch (_) {}
      }
    };

    document.addEventListener('click', handleSamePageLinkClick);
    return () => document.removeEventListener('click', handleSamePageLinkClick);
  }, []);

  // Synchronously reset scroll before the browser paints the new route
  useLayoutEffect(() => {
    // If an anchor hash exists (e.g., /about#services), scroll to that section
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Immediately reset window and document scroll to top (Header)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Redundant animation frame safety check to handle dynamic async component renders
    const frameId = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(frameId);
  }, [pathname, search, hash]);

  return null;
}
