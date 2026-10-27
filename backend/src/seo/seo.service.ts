import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  async getRobotsTxt(): Promise<string> {
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://driveelite.com';
    return `# AutoRent / DriveElite Production Robots Directive
User-agent: *
Allow: /
Allow: /cars
Allow: /cars/
Allow: /categories/
Allow: /locations/
Allow: /about
Allow: /contact
Allow: /faq
Allow: /terms-and-conditions
Allow: /privacy-policy
Allow: /rental-policy

# Shield Private & Internal Application Routes
Disallow: /login
Disallow: /register
Disallow: /verify-otp
Disallow: /booking
Disallow: /customer/
Disallow: /staff/
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/api/v1/seo/sitemap.xml
Sitemap: ${siteUrl}/sitemap.xml
`;
  }

  async getSitemapXml(): Promise<string> {
    const siteUrl = process.env.PUBLIC_SITE_URL || 'https://driveelite.com';
    const now = new Date().toISOString();

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/cars', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.6', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/faq', priority: '0.7', changefreq: 'weekly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms-and-conditions', priority: '0.3', changefreq: 'yearly' },
      { path: '/rental-policy', priority: '0.5', changefreq: 'monthly' },
    ];

    // Fetch dynamic fleet cars from database
    const cars = await this.prisma.car.findMany({
      where: { status: { in: ['AVAILABLE', 'RENTED'] } },
      select: { id: true, updatedAt: true },
    });

    // Fetch categories
    const categories = await this.prisma.carCategory.findMany({
      select: { id: true, name: true, updatedAt: true },
    });

    // Fetch locations
    const locations = await this.prisma.location.findMany({
      select: { id: true, city: true, name: true, updatedAt: true },
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${route.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic Fleet Car Pages
    for (const car of cars) {
      const carLastMod = car.updatedAt ? new Date(car.updatedAt).toISOString() : now;
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/cars/${car.id}</loc>\n`;
      xml += `    <lastmod>${carLastMod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Category Pages
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catLastMod = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : now;
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/categories/${slug}</loc>\n`;
      xml += `    <lastmod>${catLastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    // Location Pages
    for (const loc of locations) {
      const slug = (loc.city || loc.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const locLastMod = loc.updatedAt ? new Date(loc.updatedAt).toISOString() : now;
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/locations/${slug}</loc>\n`;
      xml += `    <lastmod>${locLastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  async getSeoOverview() {
    const carsCount = await this.prisma.car.count({ where: { status: { in: ['AVAILABLE', 'RENTED'] } } });
    const categoriesCount = await this.prisma.carCategory.count();
    const locationsCount = await this.prisma.location.count();
    const staticCount = 8;
    const totalUrls = staticCount + carsCount + categoriesCount + locationsCount;

    return {
      siteUrl: process.env.PUBLIC_SITE_URL || 'https://driveelite.com',
      indexationStatus: 'ACTIVE',
      robotsTxtEndpoint: '/api/v1/seo/robots.txt',
      sitemapXmlEndpoint: '/api/v1/seo/sitemap.xml',
      totalIndexedUrls: totalUrls,
      breakdown: {
        staticPages: staticCount,
        carDetailPages: carsCount,
        categoryLandingPages: categoriesCount,
        locationLandingPages: locationsCount,
      },
      privateShieldedRoutes: [
        '/login', '/register', '/verify-otp', '/booking',
        '/customer/dashboard', '/customer/bookings', '/customer/bookings/:id',
        '/customer/contracts/:id', '/customer/documents',
        '/staff', '/admin'
      ],
      lastGenerated: new Date().toISOString(),
    };
  }
}
