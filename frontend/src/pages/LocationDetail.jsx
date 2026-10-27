import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PublicLayout from '../components/layout/PublicLayout';
import CarCard from '../components/cars/CarCard';
import SEO from '../seo/SEO';
import { generateBreadcrumbSchema, generateLocalBusinessSchema } from '../seo/structuredData';
import { MapPin, ChevronRight, Phone, Mail, Clock, ShieldCheck, Car } from 'lucide-react';

export default function LocationDetail() {
  const { slug } = useParams();
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const cityName = (slug || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        const [carRes, locRes] = await Promise.all([api.get('/cars'), api.get('/locations')]);
        if (carRes.success) setCars(carRes.data);
        if (locRes.success) setLocations(locRes.data);
      } catch (e) {
        console.error('Failed to load location data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [slug]);

  const matchedLocation = locations.find(
    (l) => l.city?.toLowerCase() === slug.toLowerCase() || l.name?.toLowerCase().includes(slug.toLowerCase()),
  ) || {
    name: `DriveElite ${cityName} Branch`,
    city: cityName,
    address: `Main Boulevard, Sector G-9, ${cityName}`,
  };

  const seoTitle = `Car Rental in ${cityName} | DriveElite Car Rentals`;
  const seoDescription = `Rent luxury, SUV, and economy cars in ${cityName} with transparent rates, doorstep delivery, verified digital contracts, and 24/7 customer support.`;
  const canonicalPath = `/locations/${slug}`;

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/contact' },
    { name: cityName, path: canonicalPath },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const localBusinessSchema = generateLocalBusinessSchema(matchedLocation);

  return (
    <PublicLayout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalPath}
        structuredData={[breadcrumbSchema, localBusinessSchema]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/contact" className="hover:text-sky-600 transition-colors">Locations</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">{cityName} Branch</span>
        </nav>

        {/* Location Header Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <span className="px-3 py-1 bg-sky-50 text-sky-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider border border-sky-200 w-fit block">
              Official Rental Hub &bull; {cityName}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Car Rental Service in {cityName}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              DriveElite offers premier car rental services in {cityName}. Choose from our verified fleet of luxury sedans, family SUVs, and economy cars with instant online booking, transparent security deposit terms, and doorstep vehicle delivery.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <MapPin className="w-4 h-4 text-sky-600" /> {matchedLocation.address}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4 text-emerald-600" /> Open Mon - Sun: 8:00 AM - 8:00 PM
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" /> Branch Direct Contact
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div>Phone: <strong className="text-slate-900">+92 300 1234567</strong></div>
              <div>Email: <strong className="text-slate-900">support@carrental.com</strong></div>
              <div>Location: <strong className="text-slate-900">{cityName}, Pakistan</strong></div>
            </div>
            <Link
              to="/cars"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl text-center shadow-md transition-all block"
            >
              Reserve Car at {cityName}
            </Link>
          </div>
        </div>

        {/* Available Fleet at Location */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Available Vehicles in {cityName}</h2>
            <span className="text-xs font-bold text-slate-500 uppercase">Showing {cars.length} Fleet Vehicles</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 font-semibold text-sm">Loading available fleet...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
