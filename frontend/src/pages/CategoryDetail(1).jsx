import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PublicLayout from '../components/layout/PublicLayout';
import CarCard from '../components/cars/CarCard';
import SEO from '../seo/SEO';
import { generateBreadcrumbSchema } from '../seo/structuredData';
import { Car, ChevronRight, Shield, Check, ArrowRight } from 'lucide-react';

export default function CategoryDetail() {
  const { slug } = useParams();
  const [cars, setCars] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  // Normalize slug to title case (e.g., suv-rental -> SUV Rental)
  const formattedCategory = (slug || '')
    .split('-')
    .map((word) => (word === 'suv' ? 'SUV' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');

  useEffect(() => {
    const fetchCategoryCars = async () => {
      setLoading(true);
      try {
        const res = await api.get('/cars');
        if (res.success) {
          const rawSlug = slug.toLowerCase().replace('-rental', '');
          const filtered = res.data.filter((car) => {
            const catName = (car.category?.name || '').toLowerCase();
            return catName.includes(rawSlug) || rawSlug.includes(catName);
          });
          setCars(filtered.length > 0 ? filtered : res.data);
          setCategoryName(filtered.length > 0 && filtered[0].category?.name ? filtered[0].category.name : formattedCategory);
        }
      } catch (e) {
        console.error('Failed to load category cars:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCars();
  }, [slug]);

  const seoTitle = `${categoryName || formattedCategory} Rentals in Pakistan | DriveElite`;
  const seoDescription = `Explore and rent top-rated ${categoryName || formattedCategory} vehicles in Pakistan. Compare daily rental rates, specs, availability, and book with verified digital contracts.`;
  const canonicalPath = `/categories/${slug}`;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Fleet', path: '/cars' },
    { name: categoryName || formattedCategory, path: canonicalPath },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <PublicLayout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalPath}
        structuredData={[breadcrumbSchema]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/cars" className="hover:text-sky-600 transition-colors">Fleet</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">{categoryName || formattedCategory}</span>
        </nav>

        {/* Category Header Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-sky-200 w-fit block">
            Vehicle Category Showcase
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {categoryName || formattedCategory} Vehicles for Rent
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Discover our curated fleet of premium {categoryName || formattedCategory} vehicles. Enjoy flexible daily rates, full insurance protection, transparent digital agreements, and instant pickup options across Pakistan.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600" /> Verified Clean & Maintained Fleet
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Check className="w-4 h-4 text-sky-600" /> 100% Transparent Rates & Deposit
            </span>
          </div>
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold text-sm">
            Loading {categoryName || formattedCategory} fleet...
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Vehicles Found in this Category</h3>
            <p className="text-xs text-slate-500">Explore our full vehicle catalog to view available cars.</p>
            <Link to="/cars" className="inline-block px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl">
              View Entire Fleet
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {cars.length} {categoryName || formattedCategory} Vehicles
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </div>
        )}

        {/* Category Internal Linking Block */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4">
          <h3 className="text-lg font-bold">Explore Other Vehicle Categories</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Economy Cars', slug: 'economy-cars' },
              { label: 'SUV Rentals', slug: 'suv-rental' },
              { label: 'Luxury Cars', slug: 'luxury-cars' },
              { label: 'Sedan Rentals', slug: 'sedan-rental' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                to={`/categories/${cat.slug}`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                {cat.label} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
