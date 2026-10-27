import { defaultSeoConfig } from './seoConfig';

/**
 * Returns a normalized, absolute HTTPS canonical URL stripping tracking parameters.
 * @param {string} path - Relative path or full URL
 * @returns {string} - Absolute canonical URL
 */
export function getCanonicalUrl(path = '/') {
  const baseUrl = defaultSeoConfig.siteUrl.replace(/\/+$/, '');
  
  if (!path) return baseUrl;

  // Handle absolute URLs
  let fullPath = path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      fullPath = parsed.pathname;
    } catch (e) {
      fullPath = '/';
    }
  }

  // Strip query parameters that cause duplicate content (tracking, session, etc.)
  const cleanPath = fullPath.split('?')[0].split('#')[0];
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  // Remove trailing slashes except for root '/'
  const finalPath = normalizedPath === '/' ? '/' : normalizedPath.replace(/\/+$/, '');

  return `${baseUrl}${finalPath}`;
}
