import React, { useEffect } from 'react';
import { defaultSeoConfig } from './seoConfig';
import { getCanonicalUrl } from './canonical';
import { ROBOTS_POLICIES } from './robots';

/**
 * Reusable SEO Manager Component
 * Dynamically updates document title, meta tags, canonical link, Open Graph, Twitter cards, and JSON-LD schemas.
 */
export default function SEO({
  title,
  description,
  canonical,
  image,
  ogType = 'website',
  noindex = false,
  keywords,
  structuredData,
}) {
  const pageTitle = title ? (title.includes(defaultSeoConfig.siteName) ? title : `${title} | ${defaultSeoConfig.siteName}`) : defaultSeoConfig.defaultTitle;
  const pageDescription = description || defaultSeoConfig.defaultDescription;
  const pageCanonical = getCanonicalUrl(canonical || window.location.pathname);
  const pageImage = image || defaultSeoConfig.defaultImage;
  const robotsPolicy = noindex ? ROBOTS_POLICIES.NOINDEX : ROBOTS_POLICIES.PUBLIC;

  useEffect(() => {
    // 1. Update Title
    document.title = pageTitle;

    // Helper function to create or update meta tag
    const setMetaTag = (selector, attrName, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function for link tags
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', pageDescription);
    setMetaTag('meta[name="robots"]', 'name', 'robots', robotsPolicy);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    }

    // Verification tags
    if (defaultSeoConfig.googleSiteVerification) {
      setMetaTag('meta[name="google-site-verification"]', 'name', 'google-site-verification', defaultSeoConfig.googleSiteVerification);
    }
    if (defaultSeoConfig.bingSiteVerification) {
      setMetaTag('meta[name="msvalidate.01"]', 'name', 'msvalidate.01', defaultSeoConfig.bingSiteVerification);
    }

    // 3. Canonical URL Link
    setLinkTag('canonical', pageCanonical);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', pageDescription);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', pageCanonical);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', pageImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', defaultSeoConfig.siteName);
    setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', defaultSeoConfig.defaultLocale);

    // 5. Twitter / X Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', pageDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', pageImage);
    setMetaTag('meta[name="twitter:site"]', 'name', 'twitter:site', defaultSeoConfig.twitterHandle);

    // 6. Inject JSON-LD Structured Data
    const existingJsonLd = document.querySelectorAll('script[data-seo-jsonld="true"]');
    existingJsonLd.forEach((el) => el.remove());

    if (structuredData) {
      const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
      schemas.filter(Boolean).forEach((schema, idx) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      // Clean up dynamic JSON-LD scripts on unmount
      const injectedScripts = document.querySelectorAll('script[data-seo-jsonld="true"]');
      injectedScripts.forEach((el) => el.remove());
    };
  }, [pageTitle, pageDescription, pageCanonical, pageImage, ogType, robotsPolicy, keywords, structuredData]);

  return null;
}
