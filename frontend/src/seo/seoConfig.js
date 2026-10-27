// Global Default SEO Configuration
export const defaultSeoConfig = {
  siteName: 'DriveElite Car Rentals',
  siteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:5173',
  defaultTitle: 'Car Rental in Pakistan | Premium Fleet & Transparent Pricing | DriveElite',
  defaultDescription: 'Rent reliable luxury, SUV, and economy cars in Pakistan with flexible daily rates, transparent pricing, verified digital contracts, and instant pickup.',
  defaultImage: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
  defaultLocale: 'en_PK',
  twitterHandle: '@driveelite_pk',
  googleSiteVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '',
  bingSiteVerification: import.meta.env.VITE_BING_SITE_VERIFICATION || '',
  businessInfo: {
    name: 'DriveElite Car Rentals Pakistan',
    phone: '+92 300 1234567',
    email: 'info@carrental.com',
    city: 'Islamabad',
    country: 'Pakistan',
  },
};
