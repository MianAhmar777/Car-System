import { defaultSeoConfig } from './seoConfig';
import { getCanonicalUrl } from './canonical';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultSeoConfig.siteName,
    url: defaultSeoConfig.siteUrl,
    logo: `${defaultSeoConfig.siteUrl}/logo.png`,
    description: defaultSeoConfig.defaultDescription,
    telephone: defaultSeoConfig.businessInfo.phone,
    email: defaultSeoConfig.businessInfo.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: defaultSeoConfig.businessInfo.city,
      addressCountry: defaultSeoConfig.businessInfo.country,
    },
    sameAs: [
      'https://facebook.com/driveelite',
      'https://instagram.com/driveelite',
      'https://twitter.com/driveelite_pk',
    ],
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultSeoConfig.siteName,
    url: defaultSeoConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${defaultSeoConfig.siteUrl}/cars?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}

export function generateVehicleProductSchema(car) {
  if (!car) return null;

  const carUrl = getCanonicalUrl(`/cars/${car.slug || car.id}`);
  const imageUrl = car.images && car.images.length > 0 ? (car.images[0].url || car.images[0].filePath) : defaultSeoConfig.defaultImage;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.make} ${car.model} (${car.year || 2025})`,
    image: [imageUrl],
    description: `Rent a ${car.make} ${car.model} (${car.year || 2025}) in Pakistan with flexible daily rates and verified digital booking options.`,
    brand: {
      '@type': 'Brand',
      name: car.make,
    },
    model: car.model,
    category: car.category?.name || 'Car Rental',
    offers: {
      '@type': 'Offer',
      url: carUrl,
      priceCurrency: 'PKR',
      price: car.dailyRate || 0,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/UsedCondition',
      availability: car.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: defaultSeoConfig.siteName,
      },
    },
  };
}

export function generateLocalBusinessSchema(location) {
  if (!location) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: `${defaultSeoConfig.siteName} - ${location.name || location.city}`,
    url: getCanonicalUrl(`/locations/${(location.slug || location.city || '').toLowerCase()}`),
    telephone: defaultSeoConfig.businessInfo.phone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address || 'Main Office',
      addressLocality: location.city || 'Islamabad',
      addressCountry: 'PK',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
  };
}

export function generateFAQSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q || faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a || faq.answer,
      },
    })),
  };
}

export const buildProductSchema = (data) => generateVehicleProductSchema(data);
export const buildLocalBusinessSchema = (location) => generateLocalBusinessSchema(location);
export const buildFaqSchema = (faqs) => generateFAQSchema(faqs);
