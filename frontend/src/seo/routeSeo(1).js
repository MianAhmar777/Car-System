// Route SEO registry for static pages and fallback defaults
export const routeSeoMap = {
  '/': {
    title: 'Car Rental in Pakistan | Premium Fleet & Transparent Rates | DriveElite',
    description: 'Rent luxury sedans, SUVs, and economy cars in Pakistan with transparent daily rates, zero hidden fees, verified digital contracts, and instant pickup.',
    canonical: '/',
  },
  '/cars': {
    title: 'Fleet Vehicles for Rent in Pakistan | DriveElite Car Rentals',
    description: 'Browse our complete fleet of verified rental cars in Pakistan. Compare daily rates, seating capacity, transmission types, and book online.',
    canonical: '/cars',
  },
  '/about': {
    title: 'About Us | DriveElite Car Rentals Pakistan',
    description: 'Learn about DriveElite Car Rentals, Pakistan’s leading car rental platform providing premium vehicles, digital contracts, and transparent service.',
    canonical: '/about',
  },
  '/contact': {
    title: 'Contact Us | DriveElite Car Rentals Support',
    description: 'Get in touch with DriveElite customer support. Reach us via phone, email, or visit our pickup branches in Islamabad, Lahore, and Karachi.',
    canonical: '/contact',
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) | DriveElite Car Rentals',
    description: 'Find answers to common questions regarding car rental bookings, driving license requirements, security deposits, fuel policies, and insurance.',
    canonical: '/faq',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | DriveElite Car Rentals',
    description: 'Read our privacy policy detailing how DriveElite collects, protects, and handles customer data and identity documentation securely.',
    canonical: '/privacy-policy',
  },
  '/terms-and-conditions': {
    title: 'Terms and Conditions | DriveElite Car Rentals',
    description: 'Review the legal terms and conditions governing vehicle rentals, digital contracts, driver obligations, and payment terms at DriveElite.',
    canonical: '/terms-and-conditions',
  },
  '/rental-policy': {
    title: 'Rental & Fuel Policy | DriveElite Car Rentals',
    description: 'Understand DriveElite’s vehicle rental rules, mileage allowances, fuel policies (Same-to-Same), deposit refunds, and handover checklist.',
    canonical: '/rental-policy',
  },
  '/404': {
    title: 'Page Not Found (404) | DriveElite Car Rentals',
    description: 'The requested page could not be found. Return to our homepage or browse our fleet of rental cars.',
    canonical: '/404',
    noindex: true,
  },
};
